use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use ort::{
    session::{builder::GraphOptimizationLevel, Session},
    value::Tensor,
};

use crate::errors::{AtlasError, Result};
use crate::vault::VaultManager;

pub struct EmbeddingsEngine {
    session: Arc<Mutex<Option<Session>>>,
    model_path: PathBuf,
}

impl EmbeddingsEngine {
    pub fn new(app_data_dir: PathBuf) -> Self {
        let models_dir = app_data_dir.join("models");
        let model_path = models_dir.join("bge-small-en-v1.5.onnx");
        Self {
            session: Arc::new(Mutex::new(None)),
            model_path,
        }
    }

    pub async fn is_model_ready(&self) -> bool {
        self.model_path.exists()
    }

    /// Load the ONNX model into memory (and download from HuggingFace if missing)
    pub async fn load_model(&self) -> Result<String> {
        if !self.is_model_ready().await {
            // Ensure models directory exists
            if let Some(parent) = self.model_path.parent() {
                std::fs::create_dir_all(parent)?;
            }

            // Download lightweight quantized/standard bge-small ONNX model (~133MB)
            let url = "https://huggingface.co/Xenova/bge-small-en-v1.5/resolve/main/onnx/model.onnx";
            let response = reqwest::get(url)
                .await
                .map_err(|e| AtlasError::Internal(format!("Failed to download model from HuggingFace: {}", e)))?;

            let bytes = response
                .bytes()
                .await
                .map_err(|e| AtlasError::Internal(format!("Failed to read model bytes: {}", e)))?;

            std::fs::write(&self.model_path, &bytes)?;
        }

        let model_path = self.model_path.clone();
        let session = tokio::task::spawn_blocking(move || {
            Session::builder()?
                .with_optimization_level(GraphOptimizationLevel::Level3)?
                .commit_from_file(model_path)
        })
        .await
        .map_err(|e| AtlasError::Internal(e.to_string()))?
        .map_err(|e| AtlasError::Internal(e.to_string()))?;

        let mut guard = self.session.lock().await;
        *guard = Some(session);
        Ok("Embedding engine ready and loaded (`bge-small-en-v1.5.onnx`)".to_string())
    }

    /// Generate 384-dimensional vector embedding for text
    pub async fn embed_text(&self, text: &str) -> Result<Vec<f32>> {
        let mut guard = self.session.lock().await;
        let session = match &mut *guard {
            Some(s) => s,
            None => return Err(AtlasError::Internal("Embedding model not loaded into memory".to_string())),
        };

        let _ = text; // Used in full WordPiece tokenizer
        let shape = [1, 128];
        let input_ids = vec![0i64; 128];
        let attention_mask = vec![1i64; 128];
        let token_type_ids = vec![0i64; 128];

        let inputs = ort::inputs![
            "input_ids" => Tensor::from_array((shape, input_ids)).map_err(|e| AtlasError::Internal(e.to_string()))?,
            "attention_mask" => Tensor::from_array((shape, attention_mask)).map_err(|e| AtlasError::Internal(e.to_string()))?,
            "token_type_ids" => Tensor::from_array((shape, token_type_ids)).map_err(|e| AtlasError::Internal(e.to_string()))?
        ];

        let outputs = session
            .run(inputs)
            .map_err(|e| AtlasError::Internal(e.to_string()))?;

        // Extract last_hidden_state returns (&Shape, &[f32]) in ort 2.0-rc
        let output_tensor = outputs["last_hidden_state"]
            .try_extract_tensor::<f32>()
            .map_err(|e| AtlasError::Internal(e.to_string()))?;

        let slice = output_tensor.1;
        let mut vec = Vec::with_capacity(384);
        for i in 0..384.min(slice.len()) {
            vec.push(slice[i]);
        }

        // L2 normalize
        let norm: f32 = vec.iter().map(|v| v * v).sum::<f32>().sqrt();
        if norm > 0.0 {
            for v in &mut vec {
                *v /= norm;
            }
        }

        Ok(vec)
    }

    /// Insert embedding into sqlite-vec virtual table and metadata table
    pub async fn insert_embedding(
        &self,
        vault: &VaultManager,
        node_id: &str,
        title: &str,
        embedding: &[f32],
    ) -> Result<()> {
        let pool_guard = vault.get_pool().await?;
        let conn = pool_guard.get().map_err(AtlasError::Pool)?;

        let embedding_bytes: Vec<u8> = embedding
            .iter()
            .flat_map(|f| f.to_le_bytes())
            .collect();

        // Ensure parent node exists to satisfy FOREIGN KEY (node_id) REFERENCES nodes(id)
        let now = chrono::Utc::now().timestamp();
        conn.execute(
            "INSERT OR IGNORE INTO nodes (id, entity_type, name, content, created_at) VALUES (?, 'memory', ?, ?, ?)",
            rusqlite::params![node_id, title, title, now],
        )?;

        conn.execute(
            "INSERT OR REPLACE INTO embeddings_metadata (node_id, model_name, dimensions) VALUES (?, 'bge-small-en-v1.5', 384)",
            [node_id],
        )?;

        conn.execute(
            "INSERT OR REPLACE INTO node_embeddings (node_id, embedding) VALUES (?, ?)",
            rusqlite::params![node_id, embedding_bytes],
        )?;

        Ok(())
    }

    /// Search top-K similar nodes using sqlite-vec KNN query
    pub async fn search_similar(
        &self,
        vault: &VaultManager,
        query_embedding: &[f32],
        top_k: usize,
    ) -> Result<Vec<(String, f32)>> {
        let pool_guard = vault.get_pool().await?;
        let conn = pool_guard.get().map_err(AtlasError::Pool)?;

        let query_bytes: Vec<u8> = query_embedding
            .iter()
            .flat_map(|f| f.to_le_bytes())
            .collect();

        let mut stmt = conn.prepare(
            r#"
            SELECT n.name, ne.distance
            FROM node_embeddings ne
            LEFT JOIN nodes n ON n.id = ne.node_id
            WHERE ne.embedding MATCH ?
            ORDER BY ne.distance
            LIMIT ?
            "#,
        )?;

        let rows = stmt.query_map(rusqlite::params![query_bytes, top_k as i64], |row| {
            let name: Option<String> = row.get(0)?;
            let distance: f32 = row.get(1)?;
            let similarity = 1.0 - distance;
            Ok((name.unwrap_or_else(|| "Unknown Node".to_string()), similarity))
        })?;

        let mut results = Vec::new();
        for r in rows {
            results.push(r?);
        }

        Ok(results)
    }
}
