use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::Mutex;
use notify::{
    event::CreateKind, Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher,
};
use tauri::{AppHandle, Emitter};

use crate::errors::{AtlasError, Result};

pub struct FilesystemWatcher {
    watcher: Arc<Mutex<Option<RecommendedWatcher>>>,
    watch_dir: PathBuf,
}

impl FilesystemWatcher {
    pub fn new() -> Self {
        let watch_dir = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("Atlas-Observed");
        let _ = std::fs::create_dir_all(&watch_dir);
        Self {
            watcher: Arc::new(Mutex::new(None)),
            watch_dir,
        }
    }

    pub fn get_watch_dir(&self) -> PathBuf {
        self.watch_dir.clone()
    }

    pub async fn start_watching(&self, app_handle: AppHandle) -> Result<()> {
        let mut guard = self.watcher.lock().await;
        if guard.is_some() {
            return Ok(());
        }

        let watch_path = self.watch_dir.clone();
        let app_handle_clone = app_handle.clone();

        let mut watcher = RecommendedWatcher::new(
            move |res: std::result::Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    if let EventKind::Create(CreateKind::File) | EventKind::Modify(_) = event.kind {
                        for path in event.paths {
                            // Filter for readable note/doc extensions
                            if let Some(ext) = path.extension() {
                                let ext_str = ext.to_string_lossy().to_lowercase();
                                if ["md", "txt", "json", "pdf"].contains(&ext_str.as_str()) {
                                    let _ = app_handle_clone.emit("file-observed", path.to_string_lossy().to_string());
                                }
                            }
                        }
                    }
                }
            },
            Config::default(),
        )
        .map_err(|e| AtlasError::Internal(e.to_string()))?;

        watcher
            .watch(Path::new(&watch_path), RecursiveMode::Recursive)
            .map_err(|e| AtlasError::Internal(e.to_string()))?;

        *guard = Some(watcher);
        Ok(())
    }

    pub async fn stop_watching(&self) -> Result<()> {
        let mut guard = self.watcher.lock().await;
        *guard = None;
        Ok(())
    }
}
