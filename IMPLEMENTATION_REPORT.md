# Atlas Identity OS — Implementation Reference Report

> **Purpose:** This is the internal technical reference document for Atlas Identity OS. It explains every architectural decision, every file, every algorithm, and how the system works end-to-end. Use this when explaining the project to anyone — professors, peers, interviewers, or collaborators.

---

## 1. Project Summary

**Atlas Identity OS** is a fully local, privacy-first AI personal assistant and identity management system built as a native Windows desktop application. It works like a cross between Alexa (voice-controlled OS automation), J.A.R.V.I.S. (agentic PC control through natural language), and a personal AI therapist that has read your entire digital life.

The core thesis: **your data should never leave your machine, your AI should know who you actually are (not just who you claim to be), and your digital life should talk back to you meaningfully.**

### What it is NOT
- Not a cloud service — no accounts, no telemetry, no external API calls (except Ollama on localhost)
- Not a note-taking app — it reads notes and learns from them, but is not a notes interface
- Not a chatbot — the AI is persona-driven and behaviorally grounded in your actual patterns

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   TAURI v2 DESKTOP SHELL                       │
│                                                                │
│  ┌───────────────────────┐   ┌────────────────────────────┐    │
│  │  REACT FRONTEND (TSX) │   │  RUST BACKEND (src-tauri)  │    │
│  │                       │   │                            │    │
│  │  • App.tsx (router)   │   │  • lib.rs (IPC commands)   │    │
│  │  • PersonalityCloner  │◄──►  • vault.rs (SQLCipher)    │    │
│  │  • ChatPanel          │   │  • agentic.rs (OS tools)   │    │
│  │  • AvatarFace         │   │  • embed.rs (ONNX vectors) │    │
│  │  • TimelineView       │   │  • audio.rs (cpal Whisper) │    │
│  │  • NetworkGraph       │   │  • watcher.rs (notify)     │    │
│  │  • VoiceBar           │   │  • telegram.rs (push)      │    │
│  │  • FirstRunShowcase   │   │  • graph/ (queries)        │    │
│  └───────────────────────┘   └────────────────────────────┘    │
│                                         │                      │
│                        ┌────────────────┘                      │
│                        ▼                                       │
│           ┌─────────────────────────┐                          │
│           │    atlas.db             │                          │
│           │  (SQLCipher AES-256)    │                          │
│           │  25+ tables + vec0      │                          │
│           │  (sqlite-vec KNN)       │                          │
│           └─────────────────────────┘                          │
│                                                                │
│  External (localhost only):  Ollama :11434  (LLM + Whisper)    │
└────────────────────────────────────────────────────────────────┘
```

**The key architectural boundary:** The Rust backend is the security perimeter. The React frontend can ONLY interact with the system through **strongly-typed Tauri IPC commands**. It cannot directly access the filesystem, SQLite, or any OS resource. Every action routes through Rust.

---

## 3. Technology Stack — Why Each Was Chosen

| Layer | Choice | Why |
|:------|:-------|:----|
| Desktop Framework | **Tauri v2** | 10MB binary vs Electron's 150MB. Rust backend = memory-safe IPC perimeter. Native OS webview, no bundled Chromium |
| Backend Language | **Rust** | Memory safety without GC, zero-cost abstractions, native OS control APIs, `cpal` audio, `ort` ONNX bindings |
| Frontend | **React 18 + TypeScript** | Composable UI components, strongly-typed props prevent runtime errors, no heavy framework overhead |
| Database | **SQLite + SQLCipher** | Single portable file, AES-256 page-level encryption, no server process, trivially backupable |
| Encryption | **Argon2id** key derivation | Password Hashing Competition winner, memory-hard (GPU-resistant), 64MB memory cost makes offline brute-force infeasible |
| Vector Search | **sqlite-vec** | KNN cosine similarity inside SQLite itself — no separate Qdrant/Chroma/FAISS process required |
| Embeddings | **bge-small-en-v1.5 ONNX** | 384-dim embeddings, ~5ms CPU inference, zero Python dependency (runs via `ort` Rust crate), 133MB model file |
| LLM | **Ollama (localhost:11434)** | Abstracts model download, GGUF quantization, and GPU routing behind a simple REST API. Hot-swappable models |
| Voice Transcription | **Whisper via Ollama** | 100% local speech-to-text, no cloud API key, no audio leaving the machine |
| Audio Capture | **cpal** (Rust) | Cross-platform audio I/O with zero external dependencies |
| UI Styling | **Vanilla CSS + CSS Variables** | Precise design token control, no Tailwind verbosity, smaller bundle |

---

## 4. Security Model — How Encryption Works

### 4.1 Vault Initialization (First Run)
When a user sets their master passphrase for the first time:

```
User passphrase (string)
    │
    ▼
rand::thread_rng().fill_bytes(salt, 32)  → 32-byte random salt
    │
    ▼
Argon2id(m=65536, t=3, p=1)
    │  · 64MB memory required per hash attempt
    │  · 3 iterations
    │  · On a 3GHz CPU, takes ~0.5 seconds intentionally
    ▼
32-byte derived key (never stored — exists only in Rust memory)
    │
    ▼
PRAGMA key = "x'<hex key>'";  → Opens SQLCipher connection
    │
    ▼
Schema initialization (25+ tables created inside encrypted DB)
    │
    ▼
BIP39::generate(12 words) → Recovery phrase shown ONCE, never stored
```

### 4.2 Unlock (Returning User)
```
User passphrase
    │
    ▼
Read stored salt from atlas.db header
    │
    ▼
Argon2id → same 32-byte key (deterministic, no stored key)
    │
    ▼
Open SQLCipher connection → if wrong passphrase = SQLITE_NOTADB error
```

### 4.3 Memory Safety
The passphrase is wrapped in `Secret<String>` from the `secrecy` crate. When the `Secret` is dropped, `zeroize` automatically overwrites the passphrase bytes in memory with zeros — preventing recovery from a memory dump.

---

## 5. Database Schema — Identity Graph Design

The schema uses a **Generalization-Specialization pattern**:

```sql
-- Base table: shared by ALL 16 entity types
CREATE TABLE nodes (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,  -- 'Memory', 'Project', 'Skill', etc.
    name TEXT NOT NULL,
    content TEXT,
    confidence REAL DEFAULT 0.5,  -- 0.0 to 1.0
    source_path TEXT,
    created_at INTEGER NOT NULL,
    version INTEGER DEFAULT 1,
    is_current INTEGER DEFAULT 1,  -- 0 = historical version
    parent_version_id TEXT,        -- links to previous version
    FOREIGN KEY (parent_version_id) REFERENCES nodes(id)
);

-- Directed typed relationships between nodes
CREATE TABLE edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT REFERENCES nodes(id),
    target_node_id TEXT REFERENCES nodes(id),
    relationship_type TEXT NOT NULL,  -- 'REQUIRES', 'LED_TO', 'INFLUENCED_BY'
    weight REAL DEFAULT 1.0,
    created_at INTEGER NOT NULL
);

-- Vector embeddings (sqlite-vec virtual table)
CREATE VIRTUAL TABLE node_embeddings USING vec0 (
    node_id TEXT PRIMARY KEY,
    embedding FLOAT[384]   -- 384-dim bge-small-en-v1.5 vectors
);
```

**Why this design?** A single `SELECT * FROM nodes` can retrieve all entity types simultaneously (used by Timeline and Graph views). Each type can also have extension tables with type-specific columns (`projects`, `skills`, `habits`, etc.) joined on demand.

### Temporal Versioning
Atlas **never deletes data**. When a node is updated:
```
Old node: is_current = 0, parent_version_id = NULL
New node: is_current = 1, parent_version_id = old.id, version = old.version + 1
```
This enables **point-in-time reconstruction** — querying with `WHERE created_at <= :cutoff` makes the AI blind to any events after that date. This is the "Past Persona Mode" feature.

---

## 6. Behavioral Evidence Engine (Persona Clone)

This is the most distinctive feature of Atlas. Rather than a self-report scale ("Rate your openness 1-10"), Atlas uses a **26-question situational MCQ battery** grounded in 2022-2025 personality psychology research.

### 6.1 The Core Insight
Research shows people are bad at describing themselves — they describe:
- How they **wish** they behaved
- How they **think** they behave
- How **society expects** them to behave

Instead of asking "are you honest?", Atlas asks: *"When a close friend asks for honest feedback on a bad idea — what do you actually do?"* — and gives 4 concrete behaviorally distinct choices.

### 6.2 The 8 Evidence Formats Used

| Format | How It Works |
|:-------|:-------------|
| **Forced-Choice MCQ** | 4 options, each maps to clear personality direction. No neutral option |
| **Situational Judgment Test (SJT)** | Realistic dilemma (conflict, deadline, betrayal) — choose what you actually do |
| **Ranking** | Order 5 competing values (Freedom, Salary, Impact...) — extracts utility weights |
| **Pairwise Choice** | Head-to-head A vs B — eliminates "I'd do both" hedging |
| **Memory Recall** | "Describe the last time you..." — tests real pattern, not self-image |
| **Prediction** | "How would your closest friend rate you on X?" — measures self-awareness gap |
| **Contradiction Detection** | Same construct asked 2 ways, 10 questions apart — catches inconsistency |
| **Confidence-Weighted** | Each answer multiplied by stated confidence — high certainty = higher trait update |

### 6.3 Scoring Model
Each MCQ answer updates a **latent vector** across 8 behavioral dimensions:

```typescript
interface PersonaProfile {
  // Behavioral dimensions
  conflict_style: number;        // -5 (avoidant) to +5 (direct)
  emotional_depth: number;       // depth of emotional processing
  autonomy_drive: number;        // independence vs. collaboration preference
  commitment_style: number;      // consistency vs. opportunism
  risk_tolerance: number;        // comfort with uncertainty
  communication_directness: number;
  planning_style: number;        // spontaneous vs. structured

  // Standard psychological frameworks
  ocean_o: number;  // Openness
  ocean_c: number;  // Conscientiousness
  ocean_e: number;  // Extraversion
  ocean_a: number;  // Agreeableness
  ocean_n: number;  // Neuroticism
  mbti_e_i: number; // Extraversion/Introversion axis
  mbti_s_n: number; // Sensing/Intuition axis
  mbti_t_f: number; // Thinking/Feeling axis
  mbti_j_p: number; // Judging/Perceiving axis
}
```

Example scoring for Q01 (feedback honesty):
```
Option A ("I soften the truth"): { conflict_avoidance: +2, agreeableness: +1, brutal_honesty: -2 }
Option B ("I tell them directly"): { brutal_honesty: +3, conflict_style: +2, agreeableness: -1 }
Option C ("I ask questions to redirect"): { diplomatic_reframing: +2, mbti_n: +1 }
Option D ("I lie to avoid conflict"): { conflict_avoidance: +3, self_protection: +2 }
```

### 6.4 System Prompt Injection
After the 26 questions are completed, the profile is stored in SQLCipher and used in `get_mirror_system_prompt()` to build a prompt like:

```
You are Atlas, the mirror persona of Kshitiz Khandelwal.
Behavioral fingerprint:
- Conflict style: DIRECT (score +3.2/5.0)
- Communication: blunt, uses "ok bhai" with close friends
- Risk tolerance: HIGH (score +4.1/5.0)
- OCEAN: O=72%, C=58%, E=45%, A=38%, N=61%
- MBTI direction: INTJ
- Addressing style: calls user "bhai", uses casual Hindi-English mix
- Humor: dry, sarcastic (level 7/10)
...
Speak in first person as this person would speak. Use their patterns, slang, and directness level.
```

---

## 7. The Agentic OS Control Engine (`agentic.rs`)

This is what makes Atlas an Alexa/J.A.R.V.I.S. rather than a simple chatbot.

### 7.1 How It Works End-to-End

```
User: "Atlas, play some lofi on YouTube and check how my PC is running"
    │
    ▼
ChatPanel.tsx → sends to Ollama with tool schema injected into system prompt
    │
    ▼
Ollama streams: "Sure bhai, putting on lofi now!
<TOOL_CALL>{"tool": "play_music", "params": {"query": "lofi hip hop radio", "platform": "youtube"}}</TOOL_CALL>
And here's your PC status:
<TOOL_CALL>{"tool": "check_system_status", "params": {}}</TOOL_CALL>"
    │
    ▼
ChatPanel.tsx regex: /(<TOOL_CALL>)(.*?)(<\/TOOL_CALL>)/gs
    │  → strips tool blocks from displayed text
    │  → parses JSON
    ▼
invoke('execute_agentic_tool', { toolCall: { tool: "play_music", params: {...} } })
    │
    ▼
agentic.rs :: execute_tool()
    │
    ├── play_music → cmd /C start "" "https://www.youtube.com/results?search_query=lofi+hip+hop+radio"
    └── check_system_status → PowerShell WMI query → "CPU: 23% | RAM: 6.2GB / 16.0GB | Uptime: 4.2h"
    │
    ▼
ToolResult { success: true, message: "CPU: 23% | RAM: 6.2GB / 16.0GB | Uptime: 4.2h" }
    │
    ▼
ChatPanel.tsx displays tool result, Ollama streams that back into response
    │
    ▼
AvatarFace transitions: NEUTRAL → THINKING → SPEAKING
```

### 7.2 Full Tool Catalogue

| Tool Name | Trigger Aliases | Implementation |
|:----------|:----------------|:---------------|
| `play_music` | `play_video`, `play_youtube` | `cmd /C start "" "https://youtube.com/results?search_query=..."` (default). Also supports `platform: "spotify"`, `"youtube_music"`, `"soundcloud"` |
| `launch_app` | — | `cmd /C start "" <exe>` — mapped list: vscode→`code`, chrome, firefox, discord, notion, notepad, powershell |
| `open_url` | `browse_website` | `cmd /C start "" "https://..."` — auto-prepends https if missing |
| `open_folder` | — | `explorer.exe <path>` — aliases: `desktop`, `downloads`, `documents` via `dirs` crate |
| `control_volume` | — | WScript.Shell `ToggleMute()` for mute, `nircmd setsysvolume <n*655>` for level |
| `system_control` | `lock_pc`, `sleep_pc` | `rundll32 user32.dll,LockWorkStation` (lock), `rundll32 powrprof.dll,SetSuspendState 0,1,0` (sleep), `ms-settings:` (settings), `taskmgr` |
| `check_system_status` | `system_status` | PowerShell `Get-CimInstance Win32_OperatingSystem` + `Win32_Processor` → live CPU %, RAM used/free, uptime hours |
| `set_timer` | `set_alarm` | `cmd /C start "" ms-clock:timer` or `ms-clock:alarm` |
| `take_screenshot` | `screenshot` | `cmd /C start "" ms-screenclip:` (Windows Snipping Tool) |
| `search_web` | — | `cmd /C start "" "https://www.google.com/search?q=..."` |
| `run_command` | — | `cmd /C <command>` — safety allowlist: git status/log/diff, npm run, cargo check/build, dir, echo, ipconfig, ping |
| `pause_media` | `pause_music` | PowerShell WScript.Shell `SendKeys([char]0xB3)` (VK_MEDIA_PLAY_PAUSE) |
| `next_track` | — | `SendKeys([char]0xB0)` (VK_MEDIA_NEXT_TRACK) |

### 7.3 Security Design
The tool schema injected into Ollama explicitly limits scope: only safe read-only commands on the `run_command` allowlist. Destructive operations (file deletion, registry modification, shutdown) are deliberately excluded from the tool catalogue.

---

## 8. Vector Embedding Pipeline (`embed.rs`)

### 8.1 The Model
`bge-small-en-v1.5` is a sentence embedding model from BAAI (Beijing Academy of AI):
- **384 dimensions** — balances quality vs. storage/compute cost
- **~5ms per embedding** on modern CPU (no GPU required)
- **133MB** model file (downloaded once from HuggingFace on first use)
- **ONNX format** — runs via `ort` crate (ONNX Runtime Rust bindings), zero Python dependency

### 8.2 How Embeddings Are Generated
```
Input text (e.g., a chat message or file content)
    │
    ▼
WordPiece tokenization → [101, 2009, 2003, ...] (max 128 tokens)
    │
    ▼
ONNX Runtime session.run()
    │  Inputs: input_ids, attention_mask, token_type_ids
    │  (all shape [1, 128])
    ▼
Model output: token embeddings [1, 128, 384]
    │
    ▼
Mean pooling across token dimension → [1, 384]
    │
    ▼
L2 normalization → unit vector (required for cosine similarity)
    │
    ▼
Stored in sqlite-vec: INSERT INTO node_embeddings VALUES (?, ?)
```

### 8.3 KNN Retrieval for Chat Context
When the user sends a message, Atlas:
1. Embeds the query text → 384-dim query vector
2. Runs KNN: `SELECT node_id, distance FROM node_embeddings WHERE embedding MATCH ? AND k = 5`
3. Retrieves top-5 nearest memory nodes from `nodes` table
4. Injects their content into the Ollama system prompt as context

This is how Atlas "remembers" — the AI doesn't have a chat history limit because relevant memories are retrieved by **semantic similarity**, not chronological position.

### 8.4 Hybrid Retrieval Score
```
Score = w1 × VectorScore + w2 × GraphScore − w3 × Δt

Where:
  VectorScore = cosine similarity (0.0 to 1.0)
  GraphScore = node degree centrality in identity graph
  Δt = age penalty (older nodes rank lower unless query is historical)
  Retrieval threshold: Score ≥ 0.65 (below this → not included in context)
```

---

## 9. Voice Pipeline (`audio.rs` + `VoiceBar.tsx`)

### 9.1 Recording Flow
```
User presses Ctrl+Shift+Space (global hotkey via tauri-plugin-global-shortcut)
    │
    ▼
VoiceBar.tsx → AvatarFace state: LISTENING (emerald glow)
    │
    ▼
invoke('start_voice_recording') → audio.rs
    │  cpal::host → default input device
    │  Spawn recording thread: PCM f32 samples → buffer
    ▼
User releases hotkey → invoke('stop_and_transcribe')
    │
    ▼
audio.rs: PCM buffer → 16kHz mono WAV file (diary_<timestamp>.wav)
    │
    ▼
reqwest POST to http://localhost:11434/api/transcribe
    │  Body: { model: "whisper", file: <wav bytes> }
    ▼
Ollama Whisper model → transcribed text (100% local, sub-1 second)
    │
    ▼
Return text → ChatPanel.tsx :: handleVoiceTranscribed(text)
    │
    ▼
Inject as user message → send to Ollama for AI response
    │
    ▼
AvatarFace: LISTENING → THINKING → SPEAKING
```

---

## 10. Animated SVG Avatar (`AvatarFace.tsx`)

The avatar is implemented as a **pure SVG React component** with no external 3D library — deliberately lightweight (vs Live2D or Three.js which add 5MB+ to bundle).

### 10.1 Design Approach
A single "character identity" — a glossy lavender blob head that never changes shape. Only the **aura color**, **eye shape**, **brow position**, and **mouth path** change per state. This makes it feel like one character having different moods rather than 5 different faces.

### 10.2 State Definitions

| State | Trigger | Glow Color | Eyes | Mouth | Behavior |
|:------|:--------|:-----------|:-----|:------|:---------|
| `NEUTRAL` | Idle, default | `#7DD3FC` (sky blue) | Open, relaxed | Slight upturn | Random blink every 2.6–5.2s |
| `LISTENING` | `start_voice_recording` called | `#34D399` (emerald) | Wide open | Small O-shape | Heightened alertness animation |
| `THINKING` | Ollama request in-flight | `#A78BFA` (violet) | Half-squint | Flat neutral | Side-to-side subtle sway |
| `SPEAKING` | Ollama streaming response | `#22D3EE` (cyan) | Normal | Animated open/close | Lip-sync animation loop |
| `SASSY` | Persona loaded / sarcastic response | `#FBBF24` (amber) | Right eyebrow raised | Side smirk | Micro head tilt |

### 10.3 Blink Implementation
```typescript
// Independent of state — runs continuously for lifelike feel
useEffect(() => {
  const cycle = () => {
    const delay = 2600 + Math.random() * 2600;  // 2.6–5.2 seconds random
    setTimeout(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);   // 140ms blink duration
      cycle();
    }, delay);
  };
  cycle();
}, []);
```

### 10.4 Sentiment → State Mapping (`inferAvatarState.ts`)
```typescript
export function inferAvatarState(text: string): AvatarState {
  const lower = text.toLowerCase();
  if (/\b(thinking|hmm|let me|processing|analyzing)\b/.test(lower)) return 'THINKING';
  if (/\b(lol|haha|😄|😂|funny|bhai|yaar|bruh|😏)\b/.test(lower)) return 'SASSY';
  if (text.length > 100) return 'SPEAKING';
  return 'NEUTRAL';
}
```

---

## 11. Frontend Component Architecture

### 11.1 State Flow Diagram
```
App.tsx (root state manager)
    │
    ├── vaultExists (bool) → SetupPage or UnlockPage
    ├── isUnlocked (bool) → main app shell
    └── activeTab ('SHOWCASE' | 'CLONE' | 'CHAT' | 'TIMELINE' | 'GRAPH' | 'ENGINES' | 'SETTINGS')
            │
            ├── 'SHOWCASE' → FirstRunShowcase (interactive demo walkthrough)
            ├── 'CLONE'    → PersonalityCloner (26-Q MCQ onboarding)
            ├── 'CHAT'     → ChatPanel + AvatarFace + VoiceBar
            ├── 'TIMELINE' → TimelineView (scrollable identity feed)
            ├── 'GRAPH'    → NetworkGraph (SVG canvas node graph)
            ├── 'ENGINES'  → Core Engines tab (voice recording, vector search, file watcher)
            └── 'SETTINGS' → SettingsPage (dirs, Telegram, persona mode, vault lock)
```

### 11.2 IPC Command Catalogue

Every frontend action routes through a Tauri IPC command defined in `lib.rs`:

| Command | Frontend Call | What It Does |
|:--------|:-------------|:-------------|
| `check_vault_state` | App.tsx mount | Returns `(db_exists: bool, is_unlocked: bool)` |
| `init_vault` | SetupPage | Creates atlas.db, runs Argon2id, initializes schema, returns BIP39 phrase |
| `unlock_vault` | UnlockPage | Derives key, opens SQLCipher connection, starts filesystem watcher |
| `lock_vault` | Lock button | Drops database pool, clears key from memory |
| `save_onboarding_profile` | PersonalityCloner | Writes persona_dna, interview_responses tables in SQLCipher |
| `get_mirror_system_prompt` | ChatPanel mount | Reads persona_dna, builds system prompt string for Ollama |
| `get_tool_schema` | ChatPanel mount | Returns `build_tool_schema_prompt()` from agentic.rs |
| `execute_agentic_tool` | ChatPanel (TOOL_CALL parser) | Routes to agentic.rs::execute_tool() |
| `embed_and_store` | Core Engines tab | Runs ONNX embedding, stores in sqlite-vec, inserts into nodes |
| `search_graph_vector` | Core Engines tab | KNN query against sqlite-vec node_embeddings |
| `get_timeline_feed` | TimelineView | `SELECT * FROM nodes WHERE is_current=1 ORDER BY created_at DESC LIMIT ?` |
| `get_node_neighbors` | TimelineView click | Breadth-first graph traversal from node_id |
| `get_graph_network` | NetworkGraph | Returns all nodes + edges for canvas rendering |
| `start_voice_recording` | VoiceBar | Starts cpal microphone capture |
| `stop_voice_recording` | VoiceBar | Stops capture, saves WAV, returns path |
| `stop_and_transcribe` | VoiceBar | Stop + WAV → Ollama Whisper → transcribed text |
| `load_embedding_model` | Core Engines tab | Downloads bge-small-en-v1.5.onnx from HuggingFace, loads into ONNX session |
| `save_telegram_config` | SettingsPage | Encrypts bot token + chat_id into settings_secure table |
| `test_telegram_connection` | SettingsPage | Sends test message to your phone via Bot API |

---

## 12. System Tray & Global Shortcuts

Atlas is designed as a **tray-primary application** — it doesn't live in your taskbar as a regular window:

| Shortcut | Action |
|:---------|:-------|
| `Alt + Space` | Toggle Atlas window visible/hidden (like OS Spotlight) |
| `Ctrl + Shift + Space` | Activate push-to-talk voice recording globally |
| `Esc` | Hide Atlas window to tray |
| Click outside window | Auto-hide to tray (configurable in Settings) |

The global shortcut is registered via `tauri-plugin-global-shortcut` in Rust. The tray icon is built with `TrayIconBuilder` and has menu items: Show, Lock Vault, Quit.

---

## 13. Filesystem Watcher & Auto-Import (`watcher.rs`)

```
User drops any .md / .txt / .pdf / .json into ~/Atlas-Observed/
    │
    ▼
notify crate detects filesystem event (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows)
    │
    ▼
watcher.rs emits 'fs-change' Tauri event with file path
    │
    ▼
App.tsx listener → adds to observedFiles[] → shown in Core Engines tab
    │
    ▼
(Full pipeline, when enabled): file → parser → entity extraction → embed → store in graph
```

The watched directory is configurable from the Settings page — you can add multiple source directories.

---

## 14. Telegram Push Notifications (`telegram.rs`)

Atlas can push real-time notifications to your phone:

```
ChatPanel generates an AI response
    │
    ▼
(if Telegram configured) invoke('send_telegram_push', { message })
    │
    ▼
telegram.rs:
    reqwest::Client::post("https://api.telegram.org/bot<token>/sendMessage")
    .json({ chat_id: "<id>", text: "<message>" })
    │
    ▼
Your phone receives notification instantly
```

Bot token and chat_id are stored in `settings_secure` table inside SQLCipher — never stored in plaintext files.

---

## 15. Data Flow — Complete End-to-End

### Scenario: Voice command → YouTube playback

```
1. User holds Ctrl+Shift+Space
2. AvatarFace → LISTENING (emerald glow)
3. audio.rs: cpal mic capture starts → PCM buffer
4. User releases hotkey
5. audio.rs: PCM → 16kHz mono WAV file (diary_1721234567.wav)
6. reqwest POST to localhost:11434/api/transcribe
7. Ollama Whisper → "Play some lofi on YouTube"
8. handleVoiceTranscribed("Play some lofi on YouTube")
9. AvatarFace → THINKING (violet glow)
10. embed.rs: ONNX embedding → 384-dim vector for query
11. sqlite-vec KNN: top-5 semantically similar memory nodes retrieved
12. vault.rs: decrypt persona_dna → build mirror system prompt
13. Final system prompt = tool_schema + persona_prompt + retrieved_memories
14. reqwest POST to localhost:11434/api/chat (streaming)
15. Ollama streams: "Got you bhai, putting on lofi now!
    <TOOL_CALL>{"tool":"play_music","params":{"query":"lofi hip hop radio","platform":"youtube"}}</TOOL_CALL>"
16. ChatPanel regex strips TOOL_CALL block, invokes execute_agentic_tool IPC
17. agentic.rs: cmd /C start "" "https://youtube.com/results?search_query=lofi+hip+hop+radio"
18. YouTube opens in default browser with search results
19. AvatarFace → SPEAKING (cyan glow, lip-sync animation)
20. ToolResult stored as Memory node in SQLCipher identity graph
21. Conversation bubble shows clean text without TOOL_CALL block
```

---

## 16. Commit History — Development Phases

| Phase | Commit | Feature |
|:------|:-------|:--------|
| Phase 1: Adaptive Onboarding | `9bf7ac8` | 26-Q MCQ PersonalityCloner, OCEAN/MBTI live bars, SQLCipher persistence |
| Phase 2: Mirror Persona Chat | `114f0ba` | Mirror system prompt injection, Ollama streaming, hybrid memory reranking, animated avatar |
| Phase 3: Agentic OS Control | `63031df` | Initial 8 OS tools: play_music (Spotify), launch_app, open_folder, volume, run_command, search_web |
| Phase 4: Local Voice + Whisper | `2977484` | Global hotkey push-to-talk, cpal recording, local Whisper transcription pipeline |
| Phase 5: Glassmorphic UI Polish | `5921c4e` | Premium dark glassmorphism, FirstRunShowcase interactive 5-step walkthrough |
| Phase 6: YouTube + Full OS Control | `a6e50ca` | 13 OS tools: YouTube/SoundCloud/YT Music, open_url, system_control, WMI diagnostics, timer, screenshot |
| Phase 7: UI Fixes + README | `ed3b60b` | Fixed blue stuck tab state, scroll containers, improved CSS design system, comprehensive README |

---

## 17. Key Design Decisions Summary

| Decision | Choice | Rejected | Why |
|:---------|:-------|:---------|:----|
| Desktop framework | Tauri v2 | Electron | 10MB vs 150MB, Rust memory safety |
| Database | SQLCipher | Neo4j, Postgres | Single file, AES-256, no server |
| Key derivation | Argon2id | PBKDF2, bcrypt | Memory-hard, GPU-resistant |
| Embeddings | bge-small-en-v1.5 ONNX | OpenAI API | 100% local, zero cost |
| Vector search | sqlite-vec | Qdrant, Chroma | Lives inside SQLite, no extra process |
| LLM inference | Ollama | llama.cpp direct, OpenAI | Simple REST API, hot-swappable models |
| Voice transcription | Whisper via Ollama | Google Speech API | 100% local, no API key |
| Avatar rendering | SVG path morphing | Live2D, Three.js | Lightweight, zero dependencies |
| CSS approach | Vanilla CSS variables | Tailwind | Precise token control, glassmorphism |
| Schema pattern | Generalization-Specialization | Flat table, one-per-type | Cross-type queries + type-specific columns |
| Persona method | Behavioral Evidence MCQ | Self-report scales | Evidence > Opinion paradigm |

---

*Last updated: July 2026 — Atlas Identity OS v0.5 Glassmorphic*
*Commit: `ed3b60b` — GitHub: Kshitiz-Khandelwal/Atlas-ai-personal-timeline-*
