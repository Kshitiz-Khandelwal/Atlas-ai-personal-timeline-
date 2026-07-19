use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AtlasError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Connection pool error: {0}")]
    Pool(#[from] r2d2::Error),

    #[error("Encryption key derivation failed: {0}")]
    KeyDerivation(String),

    #[error("Invalid passphrase or recovery phrase")]
    Unauthorized,

    #[error("Vault already initialized")]
    VaultAlreadyExists,

    #[error("Vault not initialized yet")]
    VaultNotInitialized,

    #[error("Vault is locked")]
    VaultLocked,

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Agentic tool error: {0}")]
    Agentic(String),
}

// Implement Serialize cleanly specifying std::result::Result to avoid alias conflict
impl Serialize for AtlasError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AtlasError>;
