<div align="center">

# 🌌 Atlas Identity OS

### Your private, local-first AI personal assistant — a J.A.R.V.I.S. for your everyday life.

[![Tauri](https://img.shields.io/badge/Tauri_v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-8B5CF6?style=for-the-badge)](https://ollama.ai)
[![SQLCipher](https://img.shields.io/badge/SQLCipher-AES--256-10B981?style=for-the-badge)](https://www.zetetic.net/sqlcipher/)

**100% local. Zero cloud. Zero subscriptions. Runs on your own machine.**

*Chat with your own cloned persona, control your PC with voice commands, play YouTube, lock your computer, check your RAM usage — all through a conversation.*

</div>

---

## ✨ What is Atlas?

Atlas is a **personal AI OS layer** — a desktop app that runs a private, locally-encrypted identity graph of *you*. It learns your communication style, behavioral patterns, and personality through a structured MCQ questionnaire, then builds an AI persona that speaks exactly like you.

Unlike Alexa or Siri, **Atlas sends zero data to any cloud**. Every byte lives in your encrypted SQLCipher vault on your local machine.

---

## 🚀 Feature Overview

### 🧬 1. Behavioral Mirror Persona (Persona Clone)
- A **26-question MCQ onboarding** (Behavioral Evidence Engine) based on OCEAN + MBTI research. No self-report sliders, no open text — only high-signal situational choices.
- Atlas scores your answers across 8 latent behavioral dimensions (Conflict Style, Emotional Depth, Autonomy, Commitment, Risk Tolerance, etc.) plus standard Big Five OCEAN traits.
- The resulting **persona fingerprint** is stored encrypted in your local vault and auto-injected as a system prompt into every AI conversation — so Atlas speaks *your* language, not generic chatbot language.
- Live OCEAN/MBTI progress bars animate as you complete questions, showing your personality profile building in real-time.

### 💬 2. Mirror Chat (AI that speaks like you)
- A **local Ollama-powered chat panel** wired to your cloned persona system prompt.
- The AI avatar (see below) shifts emotional states based on conversation sentiment.
- Full **tool execution pipeline**: Atlas can parse `<TOOL_CALL>` blocks from AI responses and silently run native OS actions without interrupting the conversation flow.
- Powered by any Ollama model — defaults to `llama3.1:8b` but supports any local model.

### 🤖 3. Agentic OS Control (Alexa/J.A.R.V.I.S. Mode)
You can say *"Atlas, play lofi beats on YouTube"* or *"Open VS Code and check my git status"* and Atlas will actually execute these actions on your Windows PC:

| Command | What It Does |
|:--------|:-------------|
| `play_music` / `play_youtube` | Searches and launches YouTube (default), YouTube Music, Spotify, or SoundCloud in browser |
| `launch_app` | Spawns VS Code, PowerShell, Chrome, Firefox, Discord, Notepad, Notion, or any exe |
| `open_url` / `browse_website` | Opens any URL or website directly in your default browser |
| `open_folder` | Opens Desktop, Downloads, Documents, or any full Windows path in Explorer |
| `control_volume` | Mutes/unmutes or sets system volume level (0–100) |
| `system_control` | Locks your PC, puts it to sleep, opens Settings, Task Manager, or Calculator |
| `check_system_status` | Queries live WMI data: exact CPU %, used/free RAM, and system uptime |
| `set_timer` / `set_alarm` | Launches Windows Clock timer or alarm app |
| `take_screenshot` | Opens Windows Snipping Tool for interactive screen capture |
| `search_web` | Launches Google search in your browser |
| `run_command` | Executes safe dev commands: `git status`, `cargo check`, `npm run`, etc. |

### 🧠 4. Local Voice Control (Push-to-Talk)
- Global hotkey `Ctrl + Shift + Space` activates push-to-talk without switching windows.
- Records microphone audio via `cpal` (cross-platform audio library, Rust).
- Transcribes via **local Whisper model** running through Ollama (zero cloud transcription).
- Transcription auto-injects into the chat pipeline → triggers persona-aware AI response → executes any agentic tool call found in the reply.

### 🎭 5. Animated SVG Avatar (AvatarFace)
An animated Memoji/Bitmoji-style face that reacts to conversation state:

| State | Trigger | Visual |
|:------|:--------|:-------|
| `NEUTRAL` | Idle | Sky-blue glow, slow blink |
| `LISTENING` | Voice capture active | Emerald glow, open eyes |
| `THINKING` | Waiting for Ollama | Violet glow, squint |
| `SPEAKING` | AI streaming response | Cyan glow, lip-sync animation |
| `SASSY` | Loaded persona / sarcastic reply | Orange glow, smirk |

### ⏳ 6. Chronological Identity Timeline
- Every chat message, voice note, observed file, and git commit is stored as a versioned **graph node** in your encrypted SQLCipher identity graph.
- Filter by entity type: `ALL`, `chat`, `voice_note`, `observed_file`, `git_commit`.
- Click any node to see its **Memory Neighborhood** — connected related entities in your identity graph.

### 🕸️ 7. Interactive Network Graph Canvas
- Visual circular node map rendering your entire identity graph.
- Color-coded by entity type, directed relationship edges between nodes.
- Click nodes to inspect full content and raw metadata.

### 🔐 8. Zero-Trust Encrypted Vault
- **SQLCipher AES-256** database — all data encrypted at rest. Even if someone steals your hard drive, they see only random bytes.
- Master passphrase is derived via **Argon2id** key derivation (memory-hard, resistant to GPU brute-force).
- First-run generates a **BIP39 12-word recovery phrase** (shown once, never stored again).
- Lock/Unlock via `Alt + Space` global hotkey or app tray icon.
- Auto-hide on window blur (click anywhere outside Atlas = it hides to tray).

### 📁 9. Filesystem Watcher (Auto-Import)
- Watch any directory (default: `~/Atlas-Observed/`) for new `.md`, `.txt`, `.pdf`, `.json` files.
- Automatically parses, extracts entities, embeds content as vectors, and stores in your identity graph — without you doing anything.

### 🧮 10. Local Vector Search (`sqlite-vec` + ONNX)
- Uses `bge-small-en-v1.5.onnx` (133MB local model) for neural text embedding.
- `sqlite-vec` virtual table enables sub-100ms KNN similarity search across your entire memory corpus.
- Every AI chat retrieves semantically relevant memories from your graph before generating a response.

### 📱 11. Outbound Telegram Push Notifications
- Configure a Telegram bot token + chat ID in Settings.
- Atlas can push real-time mobile notifications from chat replies directly to your phone.

---

## 🗂️ File Architecture — Every File Explained

### Frontend — `atlas-app/src/`

| File | Role |
|:-----|:-----|
| `App.tsx` | Root application shell. Manages vault unlock state, tab navigation, and global keyboard shortcuts (`Esc` to hide, blur auto-hide). Renders all page components based on `activeTab`. |
| `App.css` | Global design system: glassmorphism tokens, fixed focus/highlight state, custom scrollbars, animation keyframes, nav tab styles. |
| `main.tsx` | Vite React entry point. Mounts `<App />` into `#root`. |
| `vite-env.d.ts` | TypeScript ambient declarations for Vite environment variables. |

### Frontend Components — `atlas-app/src/components/`

| File | Role |
|:-----|:-----|
| `SetupPage.tsx` | First-run vault creation screen. Collects master passphrase, shows strength meter, generates BIP39 recovery phrase, calls `init_vault` IPC. |
| `UnlockPage.tsx` | Returning-user passphrase entry screen. Calls `unlock_vault` IPC. |
| `PersonalityCloner.tsx` | 26-question MCQ Behavioral Evidence Engine. Scores answers across OCEAN/MBTI dimensions, animates live trait bars, saves encrypted persona profile via `save_onboarding_profile` IPC. |
| `ChatPanel.tsx` | Main AI chat interface. Loads mirror persona system prompt, sends messages to Ollama, streams responses, parses `<TOOL_CALL>` blocks for agentic execution, integrates `VoiceBar` for push-to-talk, manages Telegram push config. |
| `AvatarFace.tsx` | Animated SVG avatar engine. Renders 5 emotional states (NEUTRAL, LISTENING, THINKING, SPEAKING, SASSY) with smooth SVG path morphing, blinking, lip-sync, and color-coded aura glows. |
| `VoiceBar.tsx` | Push-to-talk recording bar. Listens for `Ctrl+Shift+Space` global shortcut, calls `start_voice_recording`/`stop_and_transcribe` IPC, shows live waveform animation while recording. |
| `FirstRunShowcase.tsx` | Interactive 5-step guided demo walkthrough tab showing all Atlas capabilities with live clickable test buttons (YouTube playback, PC diagnostics, app launch, volume, timer). |
| `TimelineView.tsx` | Chronological identity event feed with type filters. Renders identity graph nodes with timestamps, entity type badges, and a Memory Neighborhood drill-down panel. |
| `NetworkGraph.tsx` | SVG canvas network graph visualizer. Renders all identity nodes as glowing circles with directed relationship edges between them. |
| `SettingsPage.tsx` | Settings panel. Manages watched source directories, Telegram bot configuration, Mirror Persona Mode toggle, vault lock/unlock, and system tray behaviour. |

### Backend — `atlas-app/src-tauri/src/`

| File | Role |
|:-----|:-----|
| `lib.rs` | Core Tauri IPC command registry. Wires all frontend IPC commands (`init_vault`, `unlock_vault`, `send_chat_message`, `execute_agentic_tool`, `embed_and_store`, `get_timeline_feed`, etc.) to Rust implementations. Manages system tray, global shortcut registration, and app state initialization. |
| `main.rs` | Tauri app entry point. Calls `lib::run()`. |
| `vault.rs` | `VaultManager` struct. Handles SQLCipher AES-256 database lifecycle: Argon2id key derivation, `PRAGMA key`, schema initialization across 25+ tables, encrypted settings storage, and vault lock/unlock state management. |
| `agentic.rs` | **The OS automation engine**. 13 native action tools: YouTube/Spotify/SoundCloud playback, direct URL opening, app launching, folder navigation, volume control, PC lock/sleep, live WMI system diagnostics (CPU/RAM/uptime), Windows timer/alarm, screenshot capture, safe shell command execution. Parses `<TOOL_CALL>{...}</TOOL_CALL>` blocks from LLM responses. |
| `audio.rs` | `AudioRecorder` struct. Records microphone input via `cpal` to 16kHz WAV files. Transcribes via local Ollama Whisper endpoint (`/api/transcribe`). Exposes `start_voice_recording`, `stop_voice_recording`, `stop_and_transcribe` IPC commands. |
| `embed.rs` | `EmbeddingsEngine` struct. Loads `bge-small-en-v1.5.onnx` (133MB) via `ort` ONNX Runtime. Mean-pools token embeddings to 384-dim vectors. Stores and queries via `sqlite-vec` virtual KNN table (`vec0`). |
| `watcher.rs` | `FilesystemWatcher` struct using `notify` crate. Watches configured directories for file changes, emits `fs-change` events to the Tauri frontend on new `.md`/`.txt`/`.pdf` drops. |
| `telegram.rs` | `TelegramEngine` struct. Sends push notifications to your Telegram phone via Bot API (`/sendMessage`). Stores encrypted bot token and chat_id in SQLCipher `settings_secure` table. |
| `errors.rs` | `AtlasError` enum. Unified error type across all Rust modules using `thiserror`. Maps to Tauri IPC serializable errors. |
| `graph/` | Directory containing `schema.rs` (25+ table SQL schema), `queries.rs` (`get_node_neighbors`, `get_timeline_nodes`, `get_graph_network` query logic). |

---

## 🔄 Complete Data Flow

```
User speaks → [Ctrl+Shift+Space]
    ↓
audio.rs (cpal microphone capture → 16kHz WAV)
    ↓
Ollama Whisper (/api/transcribe) → text
    ↓
ChatPanel.tsx (inject transcription as user message)
    ↓
embed.rs (bge-small-en-v1.5 ONNX → 384-dim vector)
    ↓
sqlite-vec KNN search → retrieve top 5 semantically similar memories
    ↓
persona_engine (vault.rs → decrypt persona fingerprint → build system prompt)
    ↓
Ollama LLM (/api/chat streaming) → AI response with optional <TOOL_CALL> blocks
    ↓
agentic.rs parser → execute native Windows OS actions
    ↓
AvatarFace.tsx → animate state (LISTENING → THINKING → SPEAKING)
    ↓
ChatPanel.tsx → display response bubble
    ↓
vault.rs → persist conversation node to identity graph (SQLCipher)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| Desktop Shell | Tauri v2 (Rust backend + WebView frontend) |
| Frontend | React 18 + TypeScript, Vite, Vanilla CSS glassmorphism |
| Backend | Rust 2021 edition |
| Database | SQLCipher (AES-256 encrypted SQLite) + sqlite-vec (ONNX vector search) |
| AI/LLM | Ollama (local — llama3.1, mistral, qwen2, etc.) |
| Transcription | Whisper (local via Ollama) |
| Embeddings | `bge-small-en-v1.5.onnx` via ONNX Runtime (`ort` crate) |
| Audio | `cpal` (cross-platform audio) |
| Key Derivation | Argon2id (m=65536, t=3, p=1) |
| Recovery | BIP39 12-word mnemonic phrase |
| Filesystem | `notify` crate (auto-import watcher) |
| Telegram | Bot API via `reqwest` HTTP client |

---

## ⚡ Quickstart

### Prerequisites
- [Rust + Cargo](https://rustup.rs) (1.75+)
- [Node.js](https://nodejs.org) (18+)
- [Ollama](https://ollama.ai) running locally with at least one model pulled (`ollama pull llama3.1`)

### Run
```bash
git clone https://github.com/Kshitiz-Khandelwal/Atlas-ai-personal-timeline-.git
cd Atlas-ai-personal-timeline-/atlas-app
npm install
npm run tauri dev
```

### First Run
1. **Create your vault** — enter a strong master passphrase (save your BIP39 recovery phrase!)
2. **Complete Persona Clone** — answer 26 behavioral MCQ questions to build your mirror persona
3. **Go to Mirror Chat** — start talking to your AI alter ego
4. Try **"Play lofi beats on YouTube"**, **"Check my PC status"**, or **"Lock my computer"**

---

## 📸 Screenshots

> *(App running — Timeline View)*

---

## 🔒 Privacy Guarantee

- ✅ All data stored encrypted in `atlas.db` (SQLCipher AES-256)
- ✅ No telemetry, no analytics, no cloud sync
- ✅ Passphrase never stored — only the Argon2id-derived key is held in memory
- ✅ AI runs 100% locally via Ollama
- ✅ Voice transcription runs 100% locally via Whisper (Ollama)

---

## 📋 Roadmap — All 5 Phases Complete

| Phase | Status | Commit | Description |
|:------|:-------|:-------|:------------|
| Phase 1: Adaptive Onboarding | ✅ Complete | `9bf7ac8` | 26-question MCQ PersonalityCloner, OCEAN/MBTI bars, SQLCipher persistence |
| Phase 2: Mirror Persona Chat | ✅ Complete | `114f0ba` | Mirror system prompt injection, Ollama streaming, hybrid memory reranking, animated avatar |
| Phase 3: Agentic OS Control | ✅ Complete | `63031df` | 13 OS tools: YouTube, apps, URLs, volume, lock, diagnostics, screenshots |
| Phase 4: Local Voice + Whisper | ✅ Complete | `2977484` | Global hotkey push-to-talk, cpal recording, local Whisper transcription |
| Phase 5: Glassmorphic UI Polish | ✅ Complete | `5921c4e` | Premium dark glassmorphism, FirstRunShowcase interactive walkthrough |

---

<div align="center">
Built with ❤️ by Kshitiz Khandelwal — runs 100% on your local machine.
</div>
