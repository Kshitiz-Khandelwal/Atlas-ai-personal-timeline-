use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use argon2::{
    Argon2, ParamsBuilder, Algorithm, Version,
};
use secrecy::{ExposeSecret, Secret};
use rusqlite::Connection;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use bip39::Mnemonic;
use zeroize::Zeroize;

use crate::errors::{AtlasError, Result};
use crate::graph;

pub type DbPool = Pool<SqliteConnectionManager>;

pub struct VaultManager {
    db_path: PathBuf,
    pool: Arc<Mutex<Option<DbPool>>>,
}

impl VaultManager {
    pub fn new(app_data_dir: PathBuf) -> Self {
        let db_path = app_data_dir.join("atlas.db");
        Self {
            db_path,
            pool: Arc::new(Mutex::new(None)),
        }
    }

    pub fn db_exists(&self) -> bool {
        self.db_path.exists()
    }

    /// Derive 32-byte key using Argon2id (m=65536, t=3, p=1)
    fn derive_key(passphrase: &Secret<String>, salt: &[u8]) -> Result<Secret<Vec<u8>>> {
        let params = ParamsBuilder::new()
            .m_cost(65536) // 64 MB
            .t_cost(3)     // 3 iterations
            .p_cost(1)     // 1 lane
            .output_len(32)
            .build()
            .map_err(|e| AtlasError::KeyDerivation(e.to_string()))?;

        let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
        let mut key = vec![0u8; 32];
        
        argon2
            .hash_password_into(passphrase.expose_secret().as_bytes(), salt, &mut key)
            .map_err(|e| AtlasError::KeyDerivation(e.to_string()))?;

        let secret_key = Secret::new(key);
        Ok(secret_key)
    }

    /// Initialize a new vault with passphrase, returning the 24-word BIP39 recovery phrase
    pub async fn init_vault(&self, passphrase: Secret<String>) -> Result<String> {
        if self.db_exists() {
            return Err(AtlasError::VaultAlreadyExists);
        }

        // Ensure parent directory exists
        if let Some(parent) = self.db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Fixed app salt for Argon2id derivation (or stored alongside in a metadata file if dynamic salt required)
        let salt = b"atlas_local_os_fixed_salt_v1_0_0";
        let derived_key = Self::derive_key(&passphrase, salt)?;
        let key_hex = hex::encode(derived_key.expose_secret());

        // Generate BIP39 24-word recovery phrase
        let mut entropy = [0u8; 32];
        rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut entropy);
        let mnemonic = Mnemonic::from_entropy(&entropy)
            .map_err(|e| AtlasError::Internal(format!("BIP39 error: {:?}", e)))?;
        let recovery_phrase = mnemonic.to_string();
        entropy.zeroize();

        // Derive secondary recovery verification tag
        let rec_secret = Secret::new(recovery_phrase.clone());
        let rec_tag = Self::derive_key(&rec_secret, b"atlas_recovery_verifier_salt_v1")?;

        // Create connection and set PRAGMA key
        let conn = Connection::open(&self.db_path)?;
        conn.execute_batch(&format!("PRAGMA key = '{}';", key_hex))?;

        // Initialize schema
        graph::init(&conn)?;

        // Store recovery tag
        conn.execute(
            "INSERT INTO recovery_key_verifier (id, auth_tag) VALUES (1, ?)",
            [rec_tag.expose_secret()],
        )?;

        // Close connection cleanly before pooling
        let _ = conn.close();

        // Unlock pool
        self.unlock_vault(passphrase).await?;

        Ok(recovery_phrase)
    }

    /// Unlock existing vault with passphrase
    pub async fn unlock_vault(&self, passphrase: Secret<String>) -> Result<()> {
        if !self.db_exists() {
            return Err(AtlasError::VaultNotInitialized);
        }

        let salt = b"atlas_local_os_fixed_salt_v1_0_0";
        let derived_key = Self::derive_key(&passphrase, salt)?;
        let key_hex = hex::encode(derived_key.expose_secret());

        // Test connection
        let test_conn = Connection::open(&self.db_path)?;
        test_conn.execute_batch(&format!("PRAGMA key = '{}';", key_hex))?;
        
        // Check if we can query schema (validates key)
        let count: u32 = test_conn
            .query_row("SELECT count(*) FROM sqlite_master", [], |row| row.get(0))
            .map_err(|_| AtlasError::Unauthorized)?;

        let _ = count;
        let _ = test_conn.close();

        // Setup r2d2 pool
        let manager = SqliteConnectionManager::file(&self.db_path)
            .with_init(move |c| {
                c.execute_batch(&format!("PRAGMA key = '{}';", key_hex))?;
                // Enable foreign keys and write-ahead logging for concurrency
                c.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")?;
                Ok(())
            });

        let pool = Pool::builder()
            .max_size(10)
            .build(manager)?;

        let mut guard = self.pool.lock().await;
        *guard = Some(pool);

        Ok(())
    }

    /// Lock vault by dropping all active pooled connections
    pub async fn lock_vault(&self) -> Result<()> {
        let mut guard = self.pool.lock().await;
        *guard = None;
        Ok(())
    }

    /// Check if vault is currently unlocked
    pub async fn is_unlocked(&self) -> bool {
        let guard = self.pool.lock().await;
        guard.is_some()
    }

    /// Recover vault using BIP39 recovery phrase and set a new passphrase
    pub async fn recover_vault(&self, recovery_phrase: Secret<String>, new_passphrase: Secret<String>) -> Result<()> {
        if !self.db_exists() {
            return Err(AtlasError::VaultNotInitialized);
        }

        let rec_tag = Self::derive_key(&recovery_phrase, b"atlas_recovery_verifier_salt_v1")?;
        
        // Note: Because SQLCipher requires the main key to open pages, in a full zero-knowledge setup,
        // either the recovery tag opens a key-wrapping envelope, or we verify the recovery tag against
        // an external envelope file that holds the wrapped Argon2 salt/key.
        // For Phase 1 foundation, if recovery phrase matches our verification tag envelope, we re-derive main key.
        let _ = rec_tag;
        let _ = new_passphrase;

        Err(AtlasError::Internal("Full BIP39 envelope unwrapping will be completed in Phase 2".to_string()))
    }
}
