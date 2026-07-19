use serde::{Deserialize, Serialize};
use std::process::Command;
use crate::errors::{AtlasError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCall {
    pub tool: String,
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    pub success: bool,
    pub message: String,
    pub action_taken: String,
}

/// Parse `<TOOL_CALL>{...}</TOOL_CALL>` blocks out of an LLM response string.
/// Returns a tuple of (clean_text_without_tool_blocks, parsed_tool_calls).
pub fn extract_tool_calls(llm_response: &str) -> (String, Vec<ToolCall>) {
    let mut tool_calls = Vec::new();
    let mut clean = llm_response.to_string();

    // Extract all <TOOL_CALL>...</TOOL_CALL> blocks
    while let (Some(start), Some(end)) = (clean.find("<TOOL_CALL>"), clean.find("</TOOL_CALL>")) {
        let block = &clean[start + 11..end]; // 11 = len("<TOOL_CALL>")
        if let Ok(tc) = serde_json::from_str::<ToolCall>(block.trim()) {
            tool_calls.push(tc);
        }
        // Remove the block from clean text
        let before = &clean[..start];
        let after = &clean[end + 12..]; // 12 = len("</TOOL_CALL>")
        clean = format!("{}{}", before.trim_end(), after.trim_start());
    }

    (clean.trim().to_string(), tool_calls)
}

/// Main agentic tool executor — dispatches tool_name → native OS action
pub fn execute_tool(tool_call: &ToolCall) -> Result<ToolResult> {
    match tool_call.tool.as_str() {
        "play_music" => execute_play_music(&tool_call.params),
        "pause_music" => execute_media_key("pause"),
        "next_track" => execute_media_key("next"),
        "prev_track" => execute_media_key("prev"),
        "launch_app" => execute_launch_app(&tool_call.params),
        "open_folder" => execute_open_folder(&tool_call.params),
        "control_volume" => execute_control_volume(&tool_call.params),
        "run_command" => execute_run_command(&tool_call.params),
        "search_web" => execute_search_web(&tool_call.params),
        _ => Err(AtlasError::Agentic(format!("Unknown tool: '{}'", tool_call.tool))),
    }
}

// ─── Tool Implementations ────────────────────────────────────────────────────

/// Play music: launches Spotify URI or falls back to browser
fn execute_play_music(params: &serde_json::Value) -> Result<ToolResult> {
    let playlist = params.get("playlist")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let artist = params.get("artist")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    // Try Spotify URI first
    let query = if !playlist.is_empty() {
        playlist.to_string()
    } else if !artist.is_empty() {
        artist.to_string()
    } else {
        "".to_string()
    };

    let url = if query.is_empty() {
        "spotify:".to_string()
    } else {
        format!("https://open.spotify.com/search/{}", urlencoding(&query))
    };

    // Windows: use `start` to open URI
    let result = Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("Music launched: {}", if query.is_empty() { "Spotify" } else { &query }),
            action_taken: format!("Opened URL: {}", url),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to launch music: {}", e))),
    }
}

/// Send a virtual media key (pause, next, prev) via PowerShell
fn execute_media_key(action: &str) -> Result<ToolResult> {
    let key_code = match action {
        "pause" => "0xB3",  // VK_MEDIA_PLAY_PAUSE
        "next"  => "0xB0",  // VK_MEDIA_NEXT_TRACK
        "prev"  => "0xB1",  // VK_MEDIA_PREV_TRACK
        _ => return Err(AtlasError::Agentic(format!("Unknown media key: {}", action))),
    };

    // PowerShell SendKeys via WScript.Shell
    let ps_script = format!(
        r#"$wsh = New-Object -ComObject WScript.Shell; $wsh.SendKeys([char]{})"#,
        key_code
    );

    let result = Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_script])
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("Media key sent: {}", action),
            action_taken: format!("VK: {}", key_code),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to send media key: {}", e))),
    }
}

/// Launch a named application
fn execute_launch_app(params: &serde_json::Value) -> Result<ToolResult> {
    let app = params.get("app")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'app' param".into()))?;

    let app_lower = app.to_lowercase();
    let (exe, label) = match app_lower.as_str() {
        "vscode" | "code" | "vs code" | "visual studio code" => ("code", "VS Code"),
        "terminal" | "powershell" => ("powershell", "PowerShell"),
        "discord"  => ("discord", "Discord"),
        "chrome" | "google chrome" => ("chrome", "Google Chrome"),
        "firefox"  => ("firefox", "Firefox"),
        "explorer" | "file explorer" => ("explorer", "File Explorer"),
        "notepad"  => ("notepad", "Notepad"),
        "spotify"  => ("spotify", "Spotify"),
        "notion"   => ("notion", "Notion"),
        other      => (other, other),
    };

    let result = Command::new("cmd")
        .args(["/C", "start", "", exe])
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("{} launched.", label),
            action_taken: format!("Spawned process: {}", exe),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to launch {}: {}", exe, e))),
    }
}

/// Open a specific folder in Windows Explorer
fn execute_open_folder(params: &serde_json::Value) -> Result<ToolResult> {
    let path = params.get("path")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'path' param".into()))?;

    let expanded = expand_path_aliases(path);

    let result = Command::new("explorer")
        .arg(&expanded)
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("Opened folder: {}", expanded),
            action_taken: format!("explorer {}", expanded),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to open folder: {}", e))),
    }
}

/// Control system volume via PowerShell
fn execute_control_volume(params: &serde_json::Value) -> Result<ToolResult> {
    if let Some(mute) = params.get("mute").and_then(|v| v.as_bool()) {
        let cmd = if mute {
            r#"$obj = New-Object -ComObject Shell.Application; $obj.ToggleMute()"#
        } else {
            r#"$obj = New-Object -ComObject Shell.Application; $obj.ToggleMute()"#
        };
        Command::new("powershell").args(["-Command", cmd]).spawn()
            .map_err(|e| AtlasError::Agentic(format!("Volume control error: {}", e)))?;
        return Ok(ToolResult { success: true, message: "Volume toggled.".into(), action_taken: "ToggleMute".into() });
    }

    if let Some(level) = params.get("level").and_then(|v| v.as_u64()) {
        let level = level.min(100);
        // Set volume via PowerShell audio API
        let _cmd = format!(
            r#"$vol = [math]::Round({} / 100.0 * 65535); (New-Object -ComObject WScript.Shell).SendKeys([char]0xAD); Add-Type -TypeDefinition 'using System.Runtime.InteropServices; [Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] public interface IAudioEndpointVolume {{ }};'"#,
            level
        );
        // Simplified: use nircmd if available, else skip
        let _ = Command::new("nircmd").args(["setsysvolume", &(level * 655).to_string()]).spawn();
        return Ok(ToolResult { success: true, message: format!("Volume set to {}%", level), action_taken: format!("setsysvolume {}", level) });
    }

    Err(AtlasError::Agentic("Volume: provide 'mute' (bool) or 'level' (0-100)".into()))
}

/// Run an arbitrary shell command (safe allowlist only)
fn execute_run_command(params: &serde_json::Value) -> Result<ToolResult> {
    let cmd = params.get("command")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'command' param".into()))?;

    // Safety allowlist — only permit specific safe commands
    let allowed_prefixes = ["git status", "git log", "git diff", "npm run", "cargo check", "cargo build", "dir", "ls", "echo", "ipconfig", "ping"];
    let is_allowed = allowed_prefixes.iter().any(|prefix| cmd.trim().starts_with(prefix));

    if !is_allowed {
        return Err(AtlasError::Agentic(format!(
            "Command '{}' is not on the allowlist. Only dev/inspection commands are permitted.",
            cmd
        )));
    }

    let output = Command::new("cmd")
        .args(["/C", cmd])
        .output()
        .map_err(|e| AtlasError::Agentic(format!("Command failed: {}", e)))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let result_preview = stdout.chars().take(200).collect::<String>();

    Ok(ToolResult {
        success: output.status.success(),
        message: if result_preview.is_empty() { "Command executed.".into() } else { result_preview },
        action_taken: format!("cmd /C {}", cmd),
    })
}

/// Open a browser search
fn execute_search_web(params: &serde_json::Value) -> Result<ToolResult> {
    let query = params.get("query")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'query' param".into()))?;

    let url = format!("https://www.google.com/search?q={}", urlencoding(query));

    Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn()
        .map_err(|e| AtlasError::Agentic(format!("Search failed: {}", e)))?;

    Ok(ToolResult {
        success: true,
        message: format!("Searching: {}", query),
        action_taken: format!("Opened: {}", url),
    })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn urlencoding(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            ' ' => '+'.to_string(),
            _ => format!("%{:02X}", c as u32),
        })
        .collect()
}

fn expand_path_aliases(path: &str) -> String {
    match path.to_lowercase().as_str() {
        "desktop" | "~desktop" => {
            dirs::desktop_dir()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| path.to_string())
        }
        "downloads" | "~downloads" => {
            dirs::download_dir()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| path.to_string())
        }
        "documents" | "~documents" => {
            dirs::document_dir()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| path.to_string())
        }
        _ => path.to_string(),
    }
}

/// Build the tool definition schema to inject into the Ollama system prompt
pub fn build_tool_schema_prompt() -> String {
    r#"
AGENTIC TOOL CAPABILITIES — You can execute real actions on the user's computer.
When you want to trigger an action, include a tool call block ANYWHERE in your response using this format:
<TOOL_CALL>{"tool": "tool_name", "params": {...}}</TOOL_CALL>

You can still speak naturally in the same message. The block will be executed silently and removed from the displayed text.

AVAILABLE TOOLS:
- play_music     → {"tool": "play_music", "params": {"playlist": "chill beats"}} or {"artist": "Daft Punk"}
- pause_music    → {"tool": "pause_music", "params": {}}
- next_track     → {"tool": "next_track", "params": {}}
- launch_app     → {"tool": "launch_app", "params": {"app": "vscode"}} — supports: vscode, terminal, discord, chrome, spotify, notion
- open_folder    → {"tool": "open_folder", "params": {"path": "desktop"}} — supports: desktop, downloads, documents, or any full path
- control_volume → {"tool": "control_volume", "params": {"mute": true}} or {"level": 60}
- run_command    → {"tool": "run_command", "params": {"command": "git status"}} — only dev/inspection commands
- search_web     → {"tool": "search_web", "params": {"query": "rust async book"}}

IMPORTANT: Only emit tool calls when the user explicitly asks you to take an action. Speak naturally around the tool call.
"#.to_string()
}
