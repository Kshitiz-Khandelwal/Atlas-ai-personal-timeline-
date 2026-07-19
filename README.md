<div align="center">

<h1>Atlas Identity OS</h1>
<p><strong>A local-first AI that learns who you are, thinks like you do, and acts on your behalf.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Tauri-2.0-24C8D8?style=flat-square&logo=tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-stable-F74C00?style=flat-square&logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-local%20LLM-222?style=flat-square" />
  <img src="https://img.shields.io/badge/SQLCipher-encrypted-3A3A3A?style=flat-square" />
  <img src="https://img.shields.io/badge/sqlite--vec-vector%20search-A78BFA?style=flat-square" />
  <img src="https://img.shields.io/badge/privacy-100%25%20local-34D399?style=flat-square" />
</p>

<br/>

> Atlas is not a productivity tool or a generic AI assistant.  
> It is a **digital twin** — a local system that extracts your behavioral fingerprint, replicates your inner monologue, and responds exactly as *you* would.  
> Everything runs on your machine. Nothing leaves your device.

</div>

---

## What Atlas Is

Most AI assistants know facts about the world. **Atlas knows facts about you.**

It builds a live **behavioral fingerprint** from a 21-question adaptive onboarding (no long personality tests), your chat patterns, voice diary entries, and continuous observation — then uses that fingerprint to drive a local LLM (`llama3.1:8b`, `qwen3:8b`) so that every response sounds like your own sharpest, most unfiltered inner monologue.

The result is something between a mirror, a second brain, and a personal J.A.R.V.I.S.

---

## Core Features

### 🧬 Behavioral Fingerprinting (Persona Clone)
A 21-question adaptive MCQ onboarding designed to extract **behavioral evidence**, not self-reported opinions. Each answer updates live OCEAN trait bars, MBTI axis leans, and a real-time extraction log — all stored in an encrypted `SQLCipher` vault.

Powered by the research behind `PersonaChat / ConvAI2`, `BIG5-CHAT`, `TwinVoice (2025)`, and `PersonalityEdit (2023)`.

### 💬 Mirror Persona Chat
Every chat message is powered by your behavioral fingerprint. Atlas calls `compile_mirror_persona_prompt()` — a terse 6-8 line distilled system prompt using only your highest-confidence traits — and injects it into Ollama before every request.

Result: Atlas addresses you as `ok bhai` (or whatever you configured), uses your signature phrases, matches your humor register, and gives you the unfiltered, direct answers your inner monologue would produce.

### 🤖 Agentic PC Control
Atlas can control your computer. Tell it to play music, open VS Code, search the web, or run a git command — it parses `<TOOL_CALL>` blocks from Ollama responses and executes real native OS actions through a Rust tool engine:

| Voice / Text Command | What Happens |
|---|---|
| "bhai put on some chill beats" | Launches Spotify with your playlist |
| "open VS Code and pull up the project" | `code .` spawned in your workspace |
| "what's the git status on this?" | `git status` executed, result shown in chat |
| "search for best Rust async patterns" | Browser opens Google search |

### 🎙️ Voice Diary
Record raw PCM audio via `cpal` directly into your encrypted timeline. All audio stays local — no cloud transcription, no API keys.

### 🧠 Vector Memory Graph
Every thought you log is embedded via local ONNX (`bge-small-en-v1.5`) and stored as a 384-dimensional vector in `sqlite-vec`. When you chat, Atlas retrieves the top nearest memories using hybrid reranking:

```
Final Score = (Semantic Similarity × 0.55) + (Recency Decay × 0.30) + (Persona Affinity × 0.15)
```

### 🔐 Zero-Trust Local Architecture
- **SQLCipher** — AES-256 encrypted local database. Nothing readable without your passphrase.
- **Argon2id** key derivation — passphrase never stored, derived on every unlock.
- **BIP-39 recovery phrase** — 24-word mnemonic for disaster recovery.
- No telemetry. No cloud sync. No accounts. No API keys required.

### 📲 Telegram Push Notifications
Receive real-time memory summaries and Atlas updates directly on your phone via Telegram Bot API — credentials stored encrypted in SQLCipher.

### 🌐 Network Graph & Timeline
A directed knowledge graph of your memories (`nodes` + `edges`) visualized as an interactive network. Navigate your personal timeline chronologically or by semantic cluster.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ATLAS IDENTITY OS                       │
│                   (Tauri Desktop — Windows)                  │
├─────────────────────────────┬───────────────────────────────┤
│        FRONTEND (React)     │        BACKEND (Rust)          │
│                             │                                │
│  🧬 PersonalityCloner       │  graph/schema.rs               │
│     21 adaptive MCQs        │    persona_dna                 │
│     Live OCEAN bars         │    relationship_addressing     │
│     Live MBTI leans         │    interview_responses         │
│     Real-time extract log   │    behavioral_evidence_log     │
│                             │                                │
│  💬 ChatPanel               │  graph/persona_engine.rs       │
│     Mirror persona chat     │    compile_mirror_persona_prompt│
│     inferAvatarState()      │    persona_rerank()            │
│     Ollama integration      │    resolve_addressing_context()│
│     Tool call parsing       │    save_onboarding_profile()   │
│                             │                                │
│  🎭 AvatarFace              │  agentic.rs                    │
│     NEUTRAL / LISTENING     │    play_music                  │
│     THINKING / SPEAKING     │    launch_app                  │
│     SASSY (sarcasm detect)  │    open_folder                 │
│                             │    control_volume              │
│  ⏳ TimelineView            │    run_command                 │
│  🕸️  NetworkGraph           │    search_web                  │
│  ⚙️  SettingsPage           │                                │
│                             │  embed.rs (ONNX + sqlite-vec)  │
│                             │  audio.rs (cpal voice diary)   │
│                             │  vault.rs (SQLCipher + Argon2) │
│                             │  telegram.rs (push notify)     │
└─────────────────────────────┴───────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              │      LOCAL OLLAMA (ollama.ai)   │
              │   llama3.1:8b / qwen3:8b /      │
              │   mistral:7b / phi3:mini         │
              └─────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop Shell | **Tauri 2.0** | Native window, IPC bridge, system tray |
| Backend | **Rust (stable)** | All core logic, OS operations, DB |
| Frontend | **React 18 + TypeScript** | UI, chat, avatar, onboarding |
| Database | **SQLCipher (rusqlite)** | Encrypted local storage |
| Vector Search | **sqlite-vec (vec0)** | KNN 384-dim embedding search |
| Embeddings | **ONNX Runtime (bge-small-en-v1.5)** | Local 384-dim text embeddings |
| LLM | **Ollama** (`llama3.1:8b`, `qwen3:8b`) | Local language model |
| Audio | **cpal** | Cross-platform audio capture |
| Key Derivation | **Argon2id** | Passphrase-derived encryption keys |
| Recovery | **BIP-39** | 24-word mnemonic recovery phrase |

---

## Getting Started

### Prerequisites
- [Rust (stable)](https://rustup.rs/) 
- [Node.js 18+](https://nodejs.org/)
- [Tauri prerequisites for Windows](https://tauri.app/start/prerequisites/)
- [Ollama](https://ollama.ai/) — for live LLM responses (`ollama pull llama3.1:8b`)

### Clone & Run

```bash
git clone https://github.com/Kshitiz-Khandelwal/Atlas-ai-personal-timeline-.git
cd Atlas-ai-personal-timeline-/atlas-app

# Install frontend deps
npm install

# Run in dev mode (compiles Rust + starts Vite dev server)
npm run tauri dev
```

### First Launch Flow

1. **Create Vault** — Set a passphrase and save your BIP-39 recovery phrase.
2. **Complete Persona Clone** — Answer the 21-question adaptive MCQ onboarding. Takes ~5 minutes. Watch your OCEAN bars shift in real time.
3. **Save Profile** — Hit "Save to SQLCipher Vault". Your behavioral fingerprint is encrypted and stored locally.
4. **Start Ollama** — `ollama serve` in a terminal, then `ollama pull llama3.1:8b`
5. **Chat with Atlas** — Go to the `✨ Avatar & Chat` tab. Your mirror persona loads automatically. Atlas now talks like you.

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1: Behavioral Onboarding | ✅ Complete | 21-question MCQ, live OCEAN/MBTI, SQLCipher persistence |
| Phase 2: Mirror Persona Chat | ✅ Complete | Persona-injected Ollama, hybrid memory reranking, `inferAvatarState` |
| Phase 3: Agentic OS Control | 🚀 In Progress | `agentic.rs` tool engine — play music, launch apps, run commands |
| Phase 4: Voice & Local Whisper | ⏳ Planned | Push-to-talk + local Whisper transcription → chat pipeline |
| Phase 5: Glassmorphism Polish | ⏳ Planned | Premium UI, first-run demo flow, micro-animations |

---

## Key Research References

This project is grounded in real LLM personality research:

- **PersonaChat / ConvAI2** — Terse persona descriptions outperform verbose dossiers for 8B models
- **PersonalityEdit (2023)** — Limits of trait-steering; why evidence beats self-report
- **BIG5-CHAT** — Dialogue-based behavioral data produces more realistic persona replication
- **TwinVoice (2025)** — Benchmark splitting persona fidelity into Social, Interpersonal & Narrative dimensions
- **LIWC** — Linguistic fingerprinting via function words, punctuation, and sentence structure

---

## Project Structure

```
Atlas/
├── atlas-app/
│   ├── src/                          # React frontend
│   │   ├── components/
│   │   │   ├── AvatarFace.tsx        # Animated Memoji-style avatar (5 states)
│   │   │   ├── ChatPanel.tsx         # Mirror persona chat + Ollama + agentic parsing
│   │   │   ├── PersonalityCloner.tsx # 21-question MCQ onboarding UI
│   │   │   ├── TimelineView.tsx      # Chronological memory timeline
│   │   │   ├── NetworkGraph.tsx      # Interactive knowledge graph
│   │   │   └── SettingsPage.tsx
│   │   └── utils/
│   │       └── inferAvatarState.ts   # LLM sentiment → avatar state mapping
│   └── src-tauri/src/                # Rust backend
│       ├── agentic.rs                # OS tool execution engine
│       ├── audio.rs                  # cpal voice recording
│       ├── embed.rs                  # ONNX embeddings + sqlite-vec search
│       ├── vault.rs                  # SQLCipher vault + Argon2 key derivation
│       ├── telegram.rs               # Outbound push notifications
│       ├── watcher.rs                # Filesystem observer
│       └── graph/
│           ├── schema.rs             # Full DB schema (persona_dna, nodes, etc.)
│           ├── queries.rs            # Typed query helpers
│           └── persona_engine.rs     # Mirror prompt distillation + reranking
├── docs/
│   └── BEHAVIORAL_EVIDENCE_ENGINE.md # Full 90-item instrument + scoring guide
├── ATLAS_MASTER_ROADMAP_AND_PROMPT.md
└── ATLAS_RESEARCH_PROMPTS.md
```

---

## Philosophy

> Most AI tools make you more dependent on them.  
> Atlas makes you more aware of yourself.

The goal is not to replace your thinking. It's to give you a mirror that reflects how you actually think — decisions, biases, humor, slang, heuristics — and then hands that back to you as a tool you control entirely.

No cloud. No subscription. No data mining. Just a very sharp version of you, running locally on your own hardware.

---

<div align="center">
<p>Built by <strong>Kshitiz Khandelwal</strong></p>
<p><em>Privacy-first. Personality-driven. Fully local.</em></p>
</div>
