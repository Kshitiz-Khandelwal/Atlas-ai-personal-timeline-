use rusqlite::Connection;
use crate::errors::Result;

pub fn initialize_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        -- 1. Base Nodes Table (shared across all 16 entity types)
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 1.0,
            created_at INTEGER NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            is_current INTEGER NOT NULL DEFAULT 1,
            parent_version_id TEXT,
            FOREIGN KEY (parent_version_id) REFERENCES nodes(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_nodes_type_current ON nodes(entity_type, is_current);
        CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON nodes(created_at);
        CREATE INDEX IF NOT EXISTS idx_nodes_parent_version ON nodes(parent_version_id);

        -- Settings / Secure Keys Table (encrypted inside SQLCipher)
        CREATE TABLE IF NOT EXISTS settings_secure (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- 2. Edges Table (directed relationships between nodes)
        CREATE TABLE IF NOT EXISTS edges (
            id TEXT PRIMARY KEY,
            source_node_id TEXT NOT NULL,
            target_node_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
            FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node_id);
        CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node_id);

        -- 3. Embeddings Metadata Table & Virtual Vector Table (384-dim for bge-small)
        CREATE TABLE IF NOT EXISTS embeddings_metadata (
            node_id TEXT PRIMARY KEY,
            model_name TEXT NOT NULL,
            dimensions INTEGER NOT NULL,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS node_embeddings USING vec0(
            node_id TEXT PRIMARY KEY,
            embedding FLOAT[384]
        );

        -- 4. Timeline Events Table (temporal indexing)
        CREATE TABLE IF NOT EXISTS timeline_events (
            id TEXT PRIMARY KEY,
            node_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            start_ts INTEGER NOT NULL,
            end_ts INTEGER,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_timeline_start ON timeline_events(start_ts);

        -- 5. Source References Table (file provenance tracking)
        CREATE TABLE IF NOT EXISTS source_references (
            id TEXT PRIMARY KEY,
            node_id TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            line_start INTEGER,
            line_end INTEGER,
            import_session_id TEXT NOT NULL,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_source_file_path ON source_references(file_path);

        -- 6. Passphrase Recovery Table (for BIP39 verification)
        CREATE TABLE IF NOT EXISTS recovery_key_verifier (
            id INTEGER PRIMARY KEY DEFAULT 1,
            auth_tag BLOB NOT NULL
        );

        -- ==========================================
        -- Extension Tables (One per Entity Type)
        -- ==========================================

        CREATE TABLE IF NOT EXISTS memories (
            node_id TEXT PRIMARY KEY,
            emotional_tone TEXT,
            location_context TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS projects (
            node_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            repository_path TEXT,
            tech_stack TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS goals (
            node_id TEXT PRIMARY KEY,
            target_date INTEGER,
            progress_pct INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS habits (
            node_id TEXT PRIMARY KEY,
            frequency_rule TEXT NOT NULL,
            current_streak INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS skills (
            node_id TEXT PRIMARY KEY,
            proficiency_level TEXT NOT NULL,
            last_practiced INTEGER,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS beliefs (
            node_id TEXT PRIMARY KEY,
            domain TEXT NOT NULL,
            strength REAL DEFAULT 0.8,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS decisions (
            node_id TEXT PRIMARY KEY,
            outcome_assessment TEXT,
            alternatives_considered TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS people (
            node_id TEXT PRIMARY KEY,
            relationship_role TEXT,
            contact_hash TEXT, -- SHA-256 hashed PII only
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS organizations (
            node_id TEXT PRIMARY KEY,
            industry TEXT,
            role_held TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS places (
            node_id TEXT PRIMARY KEY,
            coordinates TEXT,
            significance TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS documents (
            node_id TEXT PRIMARY KEY,
            doc_format TEXT NOT NULL,
            word_count INTEGER,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notes (
            node_id TEXT PRIMARY KEY,
            note_type TEXT NOT NULL,
            tags TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS media_assets (
            node_id TEXT PRIMARY KEY,
            mime_type TEXT NOT NULL,
            file_size_bytes INTEGER,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chats (
            node_id TEXT PRIMARY KEY,
            platform TEXT NOT NULL,
            participant_count INTEGER,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS calendar_events (
            node_id TEXT PRIMARY KEY,
            calendar_provider TEXT NOT NULL,
            recurrence_rule TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS knowledge_nodes (
            node_id TEXT PRIMARY KEY,
            concept_category TEXT NOT NULL,
            source_url TEXT,
            FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
        );
        "#
    )?;

    Ok(())
}
