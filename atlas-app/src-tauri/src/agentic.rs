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
        "play_music" | "play_media" | "play_video" | "play_youtube" => execute_play_media(&tool_call.params),
        "pause_music" | "pause_media" => execute_media_key("pause"),
        "next_track" => execute_media_key("next"),
        "prev_track" => execute_media_key("prev"),
        "launch_app" => execute_launch_app(&tool_call.params),
        "open_folder" => execute_open_folder(&tool_call.params),
        "open_url" | "browse_website" | "open_website" => execute_open_url(&tool_call.params),
        "control_volume" => execute_control_volume(&tool_call.params),
        "system_control" | "lock_pc" | "sleep_pc" => execute_system_control(&tool_call.params, &tool_call.tool),
        "check_system_status" | "system_status" | "get_sysinfo" => execute_check_system_status(),
        "set_timer" | "set_alarm" => execute_set_timer(&tool_call.params),
        "take_screenshot" | "screenshot" => execute_take_screenshot(),
        "run_command" => execute_run_command(&tool_call.params),
        "search_web" => execute_search_web(&tool_call.params),
        _ => Err(AtlasError::Agentic(format!("Unknown tool: '{}'", tool_call.tool))),
    }
}

// ─── Tool Implementations ────────────────────────────────────────────────────

/// Play media: supports YouTube (default/fallback when Spotify not requested), YouTube Music, Spotify, SoundCloud, or direct video/song searches
fn execute_play_media(params: &serde_json::Value) -> Result<ToolResult> {
    let query = params.get("query")
        .or_else(|| params.get("video"))
        .or_else(|| params.get("song"))
        .or_else(|| params.get("playlist"))
        .or_else(|| params.get("artist"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let platform = params.get("platform")
        .and_then(|v| v.as_str())
        .unwrap_or("youtube") // Default to YouTube so users aren't locked to Spotify
        .to_lowercase();

    let (url, label) = match platform.as_str() {
        "spotify" => {
            if query.is_empty() {
                ("spotify:".to_string(), "Spotify App".to_string())
            } else {
                (format!("https://open.spotify.com/search/{}", urlencoding(query)), format!("Spotify: {}", query))
            }
        }
        "youtube_music" | "yt_music" | "ytmusic" => {
            if query.is_empty() {
                ("https://music.youtube.com".to_string(), "YouTube Music".to_string())
            } else {
                (format!("https://music.youtube.com/search?q={}", urlencoding(query)), format!("YouTube Music: {}", query))
            }
        }
        "soundcloud" => {
            if query.is_empty() {
                ("https://soundcloud.com".to_string(), "SoundCloud".to_string())
            } else {
                (format!("https://soundcloud.com/search?q={}", urlencoding(query)), format!("SoundCloud: {}", query))
            }
        }
        _ => {
            // Default: YouTube ("youtube", "yt", "video", or any unspecified general query)
            if query.is_empty() {
                ("https://www.youtube.com".to_string(), "YouTube Home".to_string())
            } else {
                (format!("https://www.youtube.com/results?search_query={}", urlencoding(query)), format!("YouTube: {}", query))
            }
        }
    };

    let result = Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("Media launched on {}.", label),
            action_taken: format!("Opened URL: {}", url),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to launch media: {}", e))),
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

/// Open any website or direct URL
fn execute_open_url(params: &serde_json::Value) -> Result<ToolResult> {
    let raw_url = params.get("url")
        .or_else(|| params.get("website"))
        .or_else(|| params.get("site"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'url' parameter".into()))?;

    let url = if raw_url.starts_with("http://") || raw_url.starts_with("https://") {
        raw_url.to_string()
    } else {
        format!("https://{}", raw_url)
    };

    let result = Command::new("cmd")
        .args(["/C", "start", "", &url])
        .spawn();

    match result {
        Ok(_) => Ok(ToolResult {
            success: true,
            message: format!("Opened website: {}", raw_url),
            action_taken: format!("Opened URL: {}", url),
        }),
        Err(e) => Err(AtlasError::Agentic(format!("Failed to open website: {}", e))),
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
        let _ = Command::new("nircmd").args(["setsysvolume", &(level * 655).to_string()]).spawn();
        return Ok(ToolResult { success: true, message: format!("Volume set to {}%", level), action_taken: format!("setsysvolume {}", level) });
    }

    Err(AtlasError::Agentic("Volume: provide 'mute' (bool) or 'level' (0-100)".into()))
}

/// Control system power, lock, settings, or utilities
fn execute_system_control(params: &serde_json::Value, tool_name: &str) -> Result<ToolResult> {
    let action = if tool_name == "lock_pc" {
        "lock"
    } else if tool_name == "sleep_pc" {
        "sleep"
    } else {
        params.get("action")
            .and_then(|v| v.as_str())
            .unwrap_or("lock")
    };

    match action.to_lowercase().as_str() {
        "lock" | "lock_pc" => {
            Command::new("rundll32.exe").args(["user32.dll,LockWorkStation"]).spawn()
                .map_err(|e| AtlasError::Agentic(format!("Lock Workstation error: {}", e)))?;
            Ok(ToolResult { success: true, message: "PC Locked.".into(), action_taken: "LockWorkStation".into() })
        }
        "sleep" | "suspend" => {
            Command::new("rundll32.exe").args(["powrprof.dll,SetSuspendState", "0,1,0"]).spawn()
                .map_err(|e| AtlasError::Agentic(format!("Sleep error: {}", e)))?;
            Ok(ToolResult { success: true, message: "Putting PC to sleep...".into(), action_taken: "SetSuspendState".into() })
        }
        "settings" => {
            Command::new("cmd").args(["/C", "start", "", "ms-settings:"]).spawn()
                .map_err(|e| AtlasError::Agentic(format!("Settings error: {}", e)))?;
            Ok(ToolResult { success: true, message: "Windows Settings opened.".into(), action_taken: "ms-settings:".into() })
        }
        "calc" | "calculator" => {
            Command::new("cmd").args(["/C", "start", "", "calc"]).spawn()
                .map_err(|e| AtlasError::Agentic(format!("Calculator error: {}", e)))?;
            Ok(ToolResult { success: true, message: "Calculator launched.".into(), action_taken: "calc".into() })
        }
        "taskmgr" | "task_manager" => {
            Command::new("cmd").args(["/C", "start", "", "taskmgr"]).spawn()
                .map_err(|e| AtlasError::Agentic(format!("Task Manager error: {}", e)))?;
            Ok(ToolResult { success: true, message: "Task Manager opened.".into(), action_taken: "taskmgr".into() })
        }
        other => Err(AtlasError::Agentic(format!("Unknown system control action: '{}'", other))),
    }
}

/// Check live OS diagnostics (CPU usage, Memory load, and Uptime)
fn execute_check_system_status() -> Result<ToolResult> {
    let ps_script = r#"
        $os = Get-CimInstance Win32_OperatingSystem;
        $cpu = Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average;
        $totalRam = [math]::Round($os.TotalVisibleMemorySize / 1024, 1);
        $freeRam = [math]::Round($os.FreePhysicalMemory / 1024, 1);
        $usedRam = [math]::Round($totalRam - $freeRam, 1);
        $uptime = [math]::Round((Get-Date).Subtract($os.LastBootUpTime).TotalHours, 1);
        "CPU: ${cpu}% | RAM: ${usedRam}MB / ${totalRam}MB (${freeRam}MB free) | Uptime: ${uptime}h"
    "#;

    let output = Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_script])
        .output()
        .map_err(|e| AtlasError::Agentic(format!("System diagnostics failed: {}", e)))?;

    let stats = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let message = if stats.is_empty() {
        "System status active and responding normally.".to_string()
    } else {
        stats
    };

    Ok(ToolResult {
        success: true,
        message: message.clone(),
        action_taken: format!("Diagnosed PC specs: {}", message),
    })
}

/// Open Windows Clock/Alarm app or set a timer
fn execute_set_timer(params: &serde_json::Value) -> Result<ToolResult> {
    let mode = params.get("mode").and_then(|v| v.as_str()).unwrap_or("timer");
    let target = if mode == "alarm" { "ms-clock:alarm" } else { "ms-clock:timer" };

    Command::new("cmd").args(["/C", "start", "", target]).spawn()
        .map_err(|e| AtlasError::Agentic(format!("Timer launch failed: {}", e)))?;

    Ok(ToolResult {
        success: true,
        message: format!("Windows {} app launched.", if mode == "alarm" { "Alarm" } else { "Timer" }),
        action_taken: format!("start {}", target),
    })
}

/// Take screenshot using Windows Snipping Tool
fn execute_take_screenshot() -> Result<ToolResult> {
    Command::new("cmd").args(["/C", "start", "", "ms-screenclip:"]).spawn()
        .map_err(|e| AtlasError::Agentic(format!("Screenshot launch failed: {}", e)))?;

    Ok(ToolResult {
        success: true,
        message: "Windows Snipping Tool (Screen Clip) launched. Select area to capture.".into(),
        action_taken: "ms-screenclip:".into(),
    })
}

/// Run an arbitrary shell command (safe allowlist only)
fn execute_run_command(params: &serde_json::Value) -> Result<ToolResult> {
    let cmd = params.get("command")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AtlasError::Agentic("Missing 'command' param".into()))?;

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
AGENTIC TOOL CAPABILITIES — You are an advanced local Alexa / J.A.R.V.I.S. with real OS control over the user's computer.
When you want to trigger an action, include a tool call block ANYWHERE in your response using this format:
<TOOL_CALL>{"tool": "tool_name", "params": {...}}</TOOL_CALL>

You can still speak naturally in your mirror persona voice in the same message. The block will be executed silently and removed from the displayed text.

AVAILABLE TOOLS:
- play_music / play_video / play_youtube → {"tool": "play_music", "params": {"query": "daft punk", "platform": "youtube"}} — platforms: "youtube" (default), "youtube_music", "spotify", "soundcloud"
- pause_music / next_track / prev_track  → {"tool": "pause_music", "params": {}}
- launch_app          → {"tool": "launch_app", "params": {"app": "vscode"}} — supports: vscode, terminal, discord, chrome, firefox, explorer, notepad, spotify, notion
- open_url / browse   → {"tool": "open_url", "params": {"url": "youtube.com"}} or {"url": "https://reddit.com"}
- open_folder         → {"tool": "open_folder", "params": {"path": "desktop"}} — supports: desktop, downloads, documents, or any full path
- control_volume      → {"tool": "control_volume", "params": {"mute": true}} or {"level": 60}
- system_control / lock_pc / sleep_pc → {"tool": "system_control", "params": {"action": "lock"}} — supports: lock, sleep, settings, calc, taskmgr
- check_system_status → {"tool": "check_system_status", "params": {}} — returns exact live CPU usage, used/free RAM, and uptime so you can tell the user how their PC is performing!
- set_timer / alarm   → {"tool": "set_timer", "params": {"mode": "timer"}} — supports: timer, alarm
- take_screenshot     → {"tool": "take_screenshot", "params": {}} — launches interactive screen capture
- run_command         → {"tool": "run_command", "params": {"command": "git status"}} — only safe dev allowlist commands
- search_web          → {"tool": "search_web", "params": {"query": "rust async book"}}

IMPORTANT: Only emit tool calls when the user asks for an action. Speak naturally around the tool call.
"#.to_string()
}

