use reqwest::Client;
use serde_json::json;

use crate::errors::{AtlasError, Result};
use crate::vault::VaultManager;

pub struct TelegramEngine {
    client: Client,
}

impl TelegramEngine {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    /// Save Telegram credentials securely inside SQLCipher settings_secure table
    pub async fn save_credentials(&self, vault: &VaultManager, bot_token: &str, chat_id: &str) -> Result<()> {
        let pool = vault.get_pool().await?;
        let conn = pool.get().map_err(AtlasError::Pool)?;

        conn.execute(
            "INSERT OR REPLACE INTO settings_secure (key, value) VALUES ('telegram_bot_token', ?)",
            [bot_token],
        )?;
        conn.execute(
            "INSERT OR REPLACE INTO settings_secure (key, value) VALUES ('telegram_chat_id', ?)",
            [chat_id],
        )?;

        Ok(())
    }

    /// Retrieve saved Telegram credentials from SQLCipher settings_secure table
    pub async fn get_credentials(&self, vault: &VaultManager) -> Result<(Option<String>, Option<String>)> {
        let pool = vault.get_pool().await?;
        let conn = pool.get().map_err(AtlasError::Pool)?;

        let token: Option<String> = conn
            .query_row("SELECT value FROM settings_secure WHERE key = 'telegram_bot_token'", [], |row| row.get(0))
            .ok();

        let chat_id: Option<String> = conn
            .query_row("SELECT value FROM settings_secure WHERE key = 'telegram_chat_id'", [], |row| row.get(0))
            .ok();

        Ok((token, chat_id))
    }

    /// Send a message via Telegram Bot API to the configured chat_id
    pub async fn send_message(&self, vault: &VaultManager, message: &str) -> Result<String> {
        let (token, chat_id) = self.get_credentials(vault).await?;

        let token = token.ok_or_else(|| AtlasError::Internal("Telegram Bot Token not configured in settings".to_string()))?;
        let chat_id = chat_id.ok_or_else(|| AtlasError::Internal("Telegram Chat ID not configured in settings".to_string()))?;

        let url = format!("https://api.telegram.org/bot{}/sendMessage", token);
        let payload = json!({
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        });

        let res = self.client.post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| AtlasError::Internal(format!("HTTP request failed: {}", e)))?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_else(|_| "Unknown API error".to_string());
            return Err(AtlasError::Internal(format!("Telegram API error: {}", err_text)));
        }

        Ok("Message sent to Telegram successfully!".to_string())
    }
}
