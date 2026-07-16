# ATLAS — Final Model & Technology Decisions
**Status:** FINALIZED · July 2026  
**Purpose:** Definitive record of every model, library, and service choice. Read before coding any module.

> **IMPORTANT:** These are final decisions. Do not switch any tool without updating this document and DECISIONS.md first.

---

## 1. SPEECH TRANSCRIPTION (Voice Diary)

### Options Evaluated

| Model | Provider | Local? | Size | Speed (30s audio) | Accuracy | Verdict |
|:------|:---------|:-------|:-----|:-----------------|:---------|:--------|
| **Whisper Large v3** | OpenAI cloud API | No | Cloud only | Fast (API) | Best | REJECTED — cloud, privacy violation |
| **Whisper Medium GGML** | OpenAI (local) | Yes | ~1.5 GB | ~8s on CPU | Very Good | Too large for casual use |
| **Whisper Small GGML** | OpenAI (local) | Yes | ~480 MB | ~3s on CPU | Good | Acceptable |
| **Whisper Base ONNX** | HuggingFace | Yes | ~145 MB | ~1.5s on CPU | OK | **CHOSEN — best size/speed balance** |
| **whisper.cpp (Base)** | ggerganov/whisper.cpp | Yes | ~145 MB | ~1s on CPU | OK | Alternative if ONNX binding fails |
| **Vosk** | Alphacephei | Yes | ~50 MB | <1s | Mediocre | REJECTED — accuracy too low |

### FINAL DECISION: `whisper-base` (ONNX format via `ort` Rust crate)

**Why:**
- Runs entirely offline. No OpenAI API key needed, no cloud calls.
- 145 MB model size is small enough to bundle with the app installer.
- 1.5 second transcription for a 30-second voice memo is imperceptible to users.
- The `ort` crate already loads the ONNX embedding model — reusing the same runtime means zero extra dependencies.
- If `ort` ONNX binding proves difficult, fall back to `whisper-rs` (Rust bindings to `whisper.cpp`).

**Model file:** `whisper-base.onnx` stored at `assets/models/whisper-base.onnx`

---

## 2. TEXT EMBEDDING MODEL

### Options Evaluated

| Model | Dims | Size | Speed | Quality | Local? | Verdict |
|:------|:-----|:-----|:------|:--------|:-------|:--------|
| **text-embedding-ada-002** | 1536 | Cloud | Fast | Excellent | No | REJECTED — cloud, costs money |
| **text-embedding-3-small** | 1536 | Cloud | Fast | Excellent | No | REJECTED — same |
| **bge-large-en-v1.5** | 1024 | 1.3 GB | Slow on CPU | Best local | Yes | Too heavy |
| **bge-small-en-v1.5** | 384 | 130 MB | ~5ms/embed | Very Good | Yes | **CHOSEN** |
| **all-MiniLM-L6-v2** | 384 | 90 MB | ~4ms/embed | Good | Yes | Fallback |
| **nomic-embed-text** | 768 | 550 MB | ~15ms/embed | Excellent | Yes | Good but heavier |

### FINAL DECISION: `bge-small-en-v1.5` (ONNX, 384-dim)

**Why:**
- 384 dimensions: strong enough for personal knowledge retrieval, small enough to store efficiently for 100k+ nodes.
- 130 MB model size. Bundled with installer.
- ~5ms per embedding on CPU = can process 200 entities per second during bulk ingestion.
- Best-in-class for English text retrieval tasks (consistently top performer on MTEB benchmark at this size).
- Runs via `ort` crate — no Python runtime, no separate process.

**Fallback:** `all-MiniLM-L6-v2` — same 384 dimensions, slightly lower quality but marginally faster.

**Model file:** `assets/models/bge-small-en-v1.5.onnx`

---

## 3. LOCAL LLM (Main AI Brain)

### Options Evaluated

| Model | Params | VRAM (Q4) | Speed on CPU | Reasoning | Instruction Following | Verdict |
|:------|:-------|:---------|:-------------|:---------|:----------------------|:--------|
| **GPT-4o** | Unknown | Cloud | Fast | Best | Best | REJECTED — cloud, privacy |
| **Claude Sonnet** | Unknown | Cloud | Fast | Excellent | Excellent | REJECTED — cloud, privacy |
| **Llama 3.1 70B Q4** | 70B | ~40 GB | Very slow | Excellent | Excellent | Too big for consumer hardware |
| **Llama 3.1 8B Instruct Q4_K_M** | 8B | ~5.5 GB | ~15 tok/s CPU | Good | Very Good | **PRIMARY CHOICE** |
| **Qwen 2.5 7B Instruct Q4_K_M** | 7B | ~4.4 GB | ~18 tok/s CPU | Very Good | Good | **ALTERNATIVE** |
| **Qwen 2.5 14B Q4_K_M** | 14B | ~8.5 GB | ~8 tok/s CPU | Excellent | Very Good | Good for GPU machines |
| **Phi-3.5 Mini Q4** | 3.8B | ~2.5 GB | ~30 tok/s CPU | OK | Good | Fastest but weak reasoning |
| **Mistral 7B Instruct Q4** | 7B | ~4 GB | ~20 tok/s CPU | OK | Decent | Outperformed by Llama/Qwen |

### FINAL DECISION: Llama 3.1 8B Instruct Q4_K_M (via Ollama)

**Why:**
- Best instruction-following quality at 8B scale — critical for Mirror Persona and citation-linked response formats.
- Q4_K_M quantization: strong quality/size balance. File size ~4.9 GB.
- Compatible with computers that have 8-16 GB RAM with no GPU.
- Served through Ollama -> clean REST API at `localhost:11434` -> Rust `reqwest` client.

**Alternative (Better for Reasoning Tasks):** `qwen2.5:7b-instruct-q4_K_M`
- Use if the user has a computer with a dedicated GPU (Nvidia 8GB+ VRAM).
- Slightly stronger analytical reasoning on personal reflection tasks.

**User selection during setup:** Let the user pick from a dropdown during onboarding based on their hardware. Default recommendation shown based on detected RAM.

**Serving method:** Ollama — user installs Ollama, Atlas auto-pulls the model on first run.

---

## 4. DATABASE

### Options Evaluated

| Database | Type | Server needed? | Encryption | Graph queries | Verdict |
|:---------|:-----|:--------------|:-----------|:-------------|:--------|
| **PostgreSQL** | SQL | Yes | External (pgcrypto) | Via SQL joins | REJECTED — server required |
| **Neo4j** | Graph | Yes | Commercial license | Native Cypher | REJECTED — too heavy (~1GB RAM) |
| **ArangoDB** | Multi-model | Yes | Enterprise feature | Native AQL | REJECTED — same issue |
| **DuckDB** | SQL | No (embedded) | No encryption | SQL joins | REJECTED — no encryption |
| **SQLite** (plain) | SQL | No (embedded) | No encryption | SQL joins | REJECTED — no encryption |
| **SQLite + SQLCipher** | SQL | No (embedded) | AES-256 | SQL joins | **CHOSEN** |
| **LanceDB** | Vector + SQL | No (embedded) | Partial | Minimal | No mature Rust crate |

### FINAL DECISION: SQLite via SQLCipher 4.x

**Why:**
- Zero server dependency. The entire database is a single `.atlas.db` file on disk.
- AES-256 page-level encryption via SQLCipher — raw file is completely unreadable without the derived key.
- Full SQL power for complex timeline queries, version chain traversal, and entity joins.
- Perfect backup story: just copy one encrypted file.
- The Rust `sqlx` crate provides async, compile-time checked queries against SQLite.

---

## 5. VECTOR SEARCH

### Options Evaluated

| Library | Embedded in SQLite? | Server needed? | Encryption inherited? | Rust crate? | Verdict |
|:--------|:--------------------|:--------------|:---------------------|:------------|:--------|
| **Pinecone** | No | Cloud | No (cloud) | API only | REJECTED — cloud |
| **Qdrant** | No | Local server | No (separate) | Yes | REJECTED — separate process |
| **Chroma** | No | Local server | No (separate) | Python only | REJECTED — Python dep |
| **FAISS** | No | Embedded (C++) | No | Partial | REJECTED — no encryption |
| **sqlite-vss** | Yes | No | Yes (SQLCipher) | Yes via rusqlite | Deprecated |
| **sqlite-vec** | Yes | No | Yes (SQLCipher) | Yes via rusqlite | **CHOSEN** |

### FINAL DECISION: `sqlite-vec`

**Why:**
- Lives inside the SQLite file. Inherits full SQLCipher AES-256 encryption automatically.
- KNN queries run in SQL: `SELECT node_id FROM vec_items WHERE embedding MATCH ? LIMIT 20`
- No separate process, no port, no service to manage.
- Actively maintained (successor to sqlite-vss, recommended by the SQLite ecosystem).

---

## 6. KEY DERIVATION / ENCRYPTION

### FINAL DECISION: Argon2id

| Method | Memory-Hard | GPU Resistant | Max passphrase | Verdict |
|:-------|:-----------|:-------------|:---------------|:--------|
| MD5/SHA | No | No | Unlimited | Not a password hash |
| PBKDF2 | No | No | Unlimited | GPU-crackable |
| bcrypt | Partial | Partial | **72 bytes max** | Truncates long passphrases |
| scrypt | Yes | Yes | Unlimited | Good alternative |
| **Argon2id** | Yes | Yes | Unlimited | **CHOSEN** |

**Parameters:** `m=65536` (64MB memory), `t=3` (3 iterations), `p=1` (1 lane) -> 32-byte key for SQLCipher.

---

## 7. TELEGRAM BOT (Companion / Reminder Feature)

### What It Does
A Telegram Bot companion for Atlas that acts as a lightweight notification and reminder channel.
It does NOT store your data — it only relays summaries and nudges pulled from your local Atlas instance.

### Architecture
```
Atlas Desktop App (Local)
        |
        |  Rust scheduled job fires (e.g. 8 AM daily)
        |  Reads: weekly goal progress, habit streaks, scheduled calendar events
        |
        v
Telegram Bot API (HTTPS POST to api.telegram.org)
        |
        v
Your Telegram Chat -> You receive the message
```

### What The Bot Will Send You
- Morning brief: "You have 3 goals active this week. You've been consistent with coding — 6 days in a row."
- Habit nudge: "You haven't logged a voice diary entry in 3 days."
- Random memory: "1 year ago: You started the Verdict AI hackathon."
- Calendar reminder: "Meeting: Team sync in 2 hours."

### Privacy Design
The bot sends only pre-aggregated summaries, not raw data or file contents.
- No file paths exposed over Telegram.
- No entity content (just names and counts).
- Bot token stored locally in Atlas vault (encrypted), never sent to any third party.

### Tech Stack For Bot
| Layer | Choice | Reason |
|:------|:-------|:-------|
| Bot API Library | `teloxide` Rust crate | Native Rust, async, Telegram Bot API v6+ |
| Hosting | No hosting needed | Atlas itself is the "server" — calls Telegram outbound only |
| Scheduling | `tokio-cron-scheduler` | Fires at configured times |
| Secrets | Stored in Atlas vault (SQLCipher encrypted) | Token never leaves encrypted DB |

### What You Need To Set It Up
1. Create a bot via @BotFather on Telegram -> get a bot token.
2. Enter the token into Atlas Settings -> Telegram Integration.
3. Start a conversation with your bot and Atlas captures your `chat_id`.
4. Atlas handles the rest locally.

---

## 8. SUMMARY TABLE — ALL FINAL CHOICES

| Layer | Final Choice | Size | Local? |
|:------|:------------|:-----|:-------|
| Desktop framework | Tauri 2 + React 18 + TypeScript | ~10 MB installer | Yes |
| Backend | Rust 1.75+ | — | Yes |
| Database | SQLite + SQLCipher 4.x | Single file | Yes |
| Vector search | sqlite-vec (inside SQLite) | ~300 KB extension | Yes |
| Key derivation | Argon2id (argon2 Rust crate) | — | Yes |
| Embedding model | bge-small-en-v1.5 (ONNX, 384-dim) | 130 MB | Yes |
| ONNX Runtime | ort Rust crate | ~20 MB | Yes |
| Voice transcription | Whisper Base (ONNX via ort) | 145 MB | Yes |
| Audio capture | cpal Rust crate | — | Yes |
| Local LLM (primary) | Llama 3.1 8B Instruct Q4_K_M via Ollama | 4.9 GB | Yes |
| Local LLM (GPU alt) | Qwen 2.5 7B Instruct Q4_K_M via Ollama | 4.4 GB | Yes |
| Filesystem watch | notify Rust crate | — | Yes |
| PDF parsing | pdf-extract Rust crate | — | Yes |
| Plugin sandbox | wasmtime Rust crate | — | Yes |
| Telegram Bot | teloxide Rust crate + Telegram Bot API | — | Outbound only |
| CSS Styling | Vanilla CSS (HSL variables, 8px grid) | — | Yes |
| Animation (Avatar) | Inline SVG + CSS transitions | — | Yes |
