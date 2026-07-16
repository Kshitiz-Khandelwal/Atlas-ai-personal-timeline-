pub mod errors;
pub mod graph;
pub mod vault;

use std::sync::Arc;
use secrecy::Secret;
use tauri::{
    menu::Menu,
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use vault::VaultManager;

// IPC Command: Check if db exists and if unlocked
#[tauri::command]
async fn check_vault_state(
    vault: State<'_, Arc<VaultManager>>,
) -> Result<(bool, bool), errors::AtlasError> {
    let exists = vault.db_exists();
    let unlocked = vault.is_unlocked().await;
    Ok((exists, unlocked))
}

// IPC Command: Initialize vault on first run
#[tauri::command]
async fn init_vault(
    passphrase: String,
    vault: State<'_, Arc<VaultManager>>,
) -> Result<String, errors::AtlasError> {
    let secret = Secret::new(passphrase);
    let recovery_phrase = vault.init_vault(secret).await?;
    Ok(recovery_phrase)
}

// IPC Command: Unlock existing vault
#[tauri::command]
async fn unlock_vault(
    passphrase: String,
    vault: State<'_, Arc<VaultManager>>,
) -> Result<(), errors::AtlasError> {
    let secret = Secret::new(passphrase);
    vault.unlock_vault(secret).await?;
    Ok(())
}

// IPC Command: Lock vault
#[tauri::command]
async fn lock_vault(
    vault: State<'_, Arc<VaultManager>>,
    app: AppHandle,
) -> Result<(), errors::AtlasError> {
    vault.lock_vault().await?;
    let _ = app.emit("vault-locked", ());
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Get app data dir for storing atlas.db
            let app_data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data directory");
            
            let vault_manager = Arc::new(VaultManager::new(app_data_dir));
            app.manage(vault_manager.clone());

            // Setup System Tray
            let show_i = tauri::menu::MenuItem::with_id(app, "toggle", "Toggle Atlas", true, None::<&str>).unwrap();
            let lock_i = tauri::menu::MenuItem::with_id(app, "lock", "Lock Vault", true, None::<&str>).unwrap();
            let quit_i = tauri::menu::MenuItem::with_id(app, "quit", "Quit Atlas", true, None::<&str>).unwrap();
            let menu = Menu::with_items(app, &[&show_i, &lock_i, &quit_i]).unwrap();

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                    "lock" => {
                        let v = app.state::<Arc<VaultManager>>();
                        tauri::async_runtime::block_on(v.lock_vault()).ok();
                        let _ = app.emit("vault-locked", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Setup Global Shortcut: Alt + Space
            let alt_space = Shortcut::new(Some(Modifiers::ALT), Code::Space);
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, shortcut, event| {
                        if shortcut == &alt_space {
                            if let ShortcutState::Pressed = event.state() {
                                if let Some(win) = app.get_webview_window("main") {
                                    if win.is_visible().unwrap_or(false) {
                                        let _ = win.hide();
                                    } else {
                                        let _ = win.show();
                                        let _ = win.set_focus();
                                    }
                                }
                            }
                        }
                    })
                    .build(),
            )?;

            // Register global shortcut
            use tauri_plugin_global_shortcut::GlobalShortcutExt;
            let _ = app.global_shortcut().register(alt_space);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_vault_state,
            init_vault,
            unlock_vault,
            lock_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
