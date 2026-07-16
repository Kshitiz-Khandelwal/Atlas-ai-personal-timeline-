# ATLAS — Final Model & Technology Decisions
**Status:** FINALIZED v2 · July 2026
**Changelog from v1:** R1 sqlx→rusqlite, R2 LLM embedding clarified, R3 recovery policy added, R4 Telegram reframed, R5 Whisper Small default, R6 2026 model table, R7 context window column, R8 ort GPU note.

> **DO NOT CHANGE** any choice below without updating this document and DECISIONS.md first.

---

## 1. SPEECH TRANSCRIPTION (Voice Diary)

### Options Evaluated

| Model | Local? | Size | Speed (30s) | Accuracy on informal speech | Verdict |
|:------|:-------|:-----|:------------|:---------------------------|:--------|
| Whisper Large v3 (OpenAI cloud) | No | Cloud | Fast | Excellent | REJECTED — privacy violation |
| Whisper Medium GGML (local) | Yes | ~1.5 GB | ~8s CPU | Very Good | Too large |
| **Whisper Small ONNX (local)** | Yes | ~480 MB | ~3s CPU | **Good — chosen for diary audio** | **DEFAULT** |
| Whisper Base ONNX (local) | Yes | ~145 MB | ~1.5s CPU | OK on clean speech / Poor on informal | Low-storage fallback |
| whisper.cpp Small | Yes | ~480 MB | ~2.5s CPU | Good | Alt if ONNX fails |
| Vosk | Yes | ~50 MB | <1s | Poor on informal speech | REJECTED |

### FINAL DECISION: `whisper-small` ONNX via `ort` Rust crate (default). `whisper-base` as low-storage fallback toggle in Settings.

**Why Small over Base:**
- Atlas's primary use case is informal voice diary entries — not clean read-aloud audio.
- On conversational/diary-style audio, Whisper Small vs Base shows a measurable WER gap of ~8–15 percentage points. Transcription errors corrupt the user's actual memories — the worst place to cut accuracy.
- The extra 335 MB is a reasonable cost for a personal identity app.

**GPU acceleration (R8):** `ort` supports CUDA, DirectML (Windows), and CoreML (Apple Silicon) execution providers. On GPU-equipped machines, Whisper Small transcription drops to ~0.5s. Falls back to CPU automatically if no provider is detected.

**Model file:** `assets/models/whisper-small.onnx`
**Fallback:** `assets/models/whisper-base.onnx` (user-selectable in Settings → Performance)

---

## 2. TEXT EMBEDDING MODEL

### Options Evaluated

| Model | Dims | Size | Speed (CPU) | Quality | Verdict |
|:------|:-----|:-----|:------------|:--------|:--------|
| text-embedding-ada-002 (cloud) | 1536 | Cloud | Fast | Excellent | REJECTED — cloud |
| bge-large-en-v1.5 | 1024 | 1.3 GB | ~15ms | Best local | Too heavy |
| **bge-small-en-v1.5** | **384** | **130 MB** | **~5ms** | **Very Good** | **CHOSEN** |
| all-MiniLM-L6-v2 | 384 | 90 MB | ~4ms | Good | Fallback |
| nomic-embed-text | 768 | 550 MB | ~15ms | Excellent | Good but heavier |

### FINAL DECISION: `bge-small-en-v1.5` (ONNX, 384-dim)

**Why:** Top MTEB benchmark performer at this size class. 5ms per embed = 200 entities/second during bulk ingestion. Bundled with installer at 130 MB.

**GPU acceleration (R8):** Same `ort` crate — auto-detects CUDA/DirectML/CoreML. GPU inference drops to <1ms per embedding, making real-time ingestion of large note libraries instant.

**Fallback:** `all-MiniLM-L6-v2` — same 384 dims, slightly lower quality.

**Model file:** `assets/models/bge-small-en-v1.5.onnx`

---

## 3. LOCAL LLM (Main AI Brain)

> **R6 applied:** Table updated with 2026-era models. R7 applied: context window column added.

### Options Evaluated

| Model | Params | Size (Q4) | RAM needed | Speed (CPU) | Context Window | Reasoning | Instruction | License | Verdict |
|:------|:-------|:---------|:-----------|:------------|:--------------|:---------|:------------|:--------|:--------|
| GPT-4o / Claude (cloud) | — | Cloud | — | Fast | 128k | Best | Best | Proprietary | REJECTED — cloud |
| Llama 3.1 70B Q4 | 70B | ~40 GB | 48 GB+ | Very slow | 128k | Excellent | Excellent | Meta (non-commercial) | Too large |
| **Llama 3.1 8B Instruct Q4_K_M** | 8B | ~4.9 GB | 8–10 GB | ~15 tok/s | 128k | Good | Very Good | Meta License | **PRIMARY (no GPU)** |
| **Qwen3 8B Q4_K_M** | 8B | ~5.0 GB | 8–10 GB | ~16 tok/s | 128k | Very Good | Good | Apache 2.0 | **PRIMARY (GPU alt)** |
| Qwen 2.5 7B Q4_K_M | 7B | ~4.4 GB | 8 GB | ~18 tok/s | 32k | Very Good | Good | Apache 2.0 | Good, shorter context |
| Phi-4-mini Q4 | 3.8B | ~2.5 GB | 4–6 GB | ~30 tok/s | 128k | OK | Good | MIT | Low-RAM fallback |
| Gemma 3 12B Q4 | 12B | ~7 GB | 12 GB | ~10 tok/s | 128k | Good | Good | Google ToS | Non-commercial only |
| Mistral Small 3.1 Q4 | ~8B | ~5 GB | 8–10 GB | ~14 tok/s | 128k | Good | Good | Apache 2.0 | Solid but no edge over Qwen3 |
| Devstral 24B Q4 | 24B | ~14 GB | 20 GB+ | ~6 tok/s | 128k | Excellent (code) | Very Good | Apache 2.0 | GPU-only, code specialist |

### FINAL DECISION — Two-path setup:

**Path A — No GPU / 8–16 GB RAM (Most users):** `llama3.1:8b-instruct-q4_K_M`
- Best instruction-following at 8B scale. 128k context = can pack 6 months of diary entries as context.
- Meta's license allows personal non-commercial use (Atlas is a personal app, not a SaaS product).

**Path B — Dedicated GPU (8GB+ VRAM):** `qwen3:8b-q4_K_M`
- Apache 2.0 license — fully open, no restrictions.
- Stronger multi-step reasoning on reflection and identity analysis tasks.

**Path C — Low-RAM machine (4–6 GB RAM):** `phi4-mini:3.8b-q4_K_M`
- MIT licensed. Runs entirely on CPU with 4 GB RAM.
- 128k context window is a strong advantage at this size.
- Trade-off: weaker reasoning on complex "why did I change my mind on X?" queries.

> **R2 note on serving method:** Ollama is the default serving mechanism during development (easiest path, REST API at `localhost:11434`). The future v2 roadmap targets embedded `llama-cpp-2` Rust bindings to eliminate the Ollama dependency entirely and enable true single-binary distribution. For now: Ollama required.

**User selection:** Onboarding wizard detects available RAM and GPU, recommends a path, user confirms. Model pulled automatically via Ollama on first run.

---

## 4. DATABASE

### Options Evaluated

| Database | Type | Server needed? | Encryption at rest | Verdict |
|:---------|:-----|:--------------|:-------------------|:--------|
| PostgreSQL | SQL | Yes | External only | REJECTED — server |
| Neo4j | Graph | Yes | Commercial | REJECTED — too heavy |
| DuckDB | SQL | No | None | REJECTED — no encryption |
| SQLite plain | SQL | No | None | REJECTED — no encryption |
| **SQLite + SQLCipher 4.x** | SQL | No | AES-256 page encryption | **CHOSEN** |

### FINAL DECISION: SQLite + SQLCipher 4.x

**Why:** Single file on disk. AES-256 page encryption. No server. Backup = copy one `.atlas.db` file. Full SQL for timeline/version queries.

---

## 5. SQLITE RUST DRIVER

> **R1 applied:** This section is new — previously `sqlx` was incorrectly listed.

### The Problem with sqlx
`sqlx`'s SQLite driver does **not** support `load_extension()`. Loading `sqlite-vec` as a runtime extension requires calling `load_extension` on the raw SQLite connection handle. `sqlx` wraps this in an abstraction that blocks it.

### FINAL DECISION: `rusqlite` + connection pool

| Library | load_extension? | SQLCipher PRAGMA key? | Async? | Verdict |
|:--------|:---------------|:---------------------|:-------|:--------|
| sqlx (SQLite driver) | No | Via feature flag | Yes | REJECTED — blocks sqlite-vec |
| **rusqlite** | **Yes** | **Yes (bundled feature)** | Via tokio spawn_blocking | **CHOSEN** |

**Implementation pattern:**
```rust
// rusqlite with SQLCipher and sqlite-vec
let conn = rusqlite::Connection::open("atlas.db")?;
conn.execute_batch(&format!("PRAGMA key = '{}';", derived_key))?;
conn.load_extension(Path::new("sqlite_vec"), None)?;
```

**Connection pooling:** Use `r2d2` + `r2d2-sqlite` for a thread-safe connection pool. Wrap in a Tauri `State<Mutex<Pool>>`.

**`sqlx` is dropped from the stack entirely.**

---

## 6. VECTOR SEARCH

### FINAL DECISION: `sqlite-vec` (loaded into rusqlite connection)

Inherits SQLCipher AES-256 encryption. KNN queries run as SQL. No separate process. Loaded via `rusqlite`'s `load_extension` (see Section 5 — this is exactly why rusqlite was chosen).

---

## 7. KEY DERIVATION + PASSPHRASE RECOVERY

> **R3 applied:** Recovery policy added.

### Key Derivation: Argon2id

| Method | Memory-Hard | GPU Resistant | Passphrase limit | Verdict |
|:-------|:-----------|:-------------|:----------------|:--------|
| PBKDF2 | No | No | Unlimited | GPU-crackable |
| bcrypt | Partial | Partial | **72 bytes** — truncates long phrases | Rejected |
| scrypt | Yes | Yes | Unlimited | Good alternative |
| **Argon2id** | Yes | Yes | Unlimited | **CHOSEN** |

**Parameters:** `m=65536` (64 MB), `t=3`, `p=1` → 32-byte SQLCipher key.

### Recovery Policy (R3)

**Decision:** One-time BIP39 recovery phrase generated at setup.

**How it works:**
1. On first vault creation, Atlas generates a 24-word BIP39 mnemonic.
2. The mnemonic is displayed **once** on a dedicated "Write This Down" screen with a print option.
3. Atlas derives a secondary 32-byte key from the mnemonic using the same Argon2id parameters.
4. This secondary key is stored in the DB in a `recovery_key_verifier` table — encrypted with the mnemonic itself (not the passphrase). This means Atlas can verify a recovery attempt without knowing the original passphrase.
5. The mnemonic itself is **never stored** anywhere in Atlas. Only the user's written copy exists.

**If passphrase is forgotten:** User enters recovery phrase → Atlas decrypts the vault key → User sets a new passphrase.

**If both are lost:** Data is permanently unrecoverable. This is disclosed explicitly on the setup screen with the message: *"If you lose both your passphrase and recovery phrase, your Atlas vault cannot be recovered by anyone, including the developers. Write these down and store them safely."*

---

## 8. TELEGRAM BOT — OPT-IN EXCEPTION TO LOCAL-ONLY DESIGN

> **R4 applied:** Reframed as an explicit opt-in privacy exception, not a peer feature.

> **IMPORTANT: This is the ONLY component that sends any data off-device. It is OFF by default. It is an opt-in exception, not part of the local-first core.**

### What It Is
A Telegram Bot that sends you lightweight summaries and nudges from your local Atlas data.

### Explicit Consent Screen (shown before enabling)
Before activation, the user sees:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Telegram Integration — Privacy Notice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enabling this feature sends data to Telegram's servers.

The following data WILL leave your device:
  • Entity names (e.g. "Verdict AI", "Fitness Goal")
  • Counts and streak numbers (e.g. "6-day coding streak")
  • Calendar event titles and times
  • Habit status (complete/missed)

The following data will NEVER leave your device:
  • File contents or file paths
  • Journal entries or diary text
  • Chat message contents
  • Your bot token (stored encrypted locally)

Telegram's privacy policy applies to messages sent through their service.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Enable Telegram Bot ]  [ Cancel ]
```

### What The Bot Sends
- Morning brief: goal progress, habit streaks
- Habit nudge: "No voice diary in 3 days"
- Memory flash: "1 year ago: You started Verdict AI"
- Calendar reminder: "Team sync in 2 hours"

### Tech Stack
| Layer | Choice |
|:------|:-------|
| Library | `teloxide` Rust crate (async, Bot API v6+) |
| Hosting | None — Atlas calls Telegram outbound only |
| Scheduling | `tokio-cron-scheduler` |
| Bot token storage | Encrypted inside Atlas vault (SQLCipher) |

---

## 9. FULL SUMMARY TABLE

| Layer | Final Choice | Size | Local? |
|:------|:------------|:-----|:-------|
| Desktop framework | Tauri 2.x + React 18 + TypeScript | ~10 MB installer | Yes |
| Backend | Rust 1.75+ | — | Yes |
| Database | SQLite + SQLCipher 4.x | Single file | Yes |
| SQLite Rust driver | **rusqlite** + r2d2 pool (NOT sqlx) | — | Yes |
| Vector search | sqlite-vec (loaded via rusqlite) | ~300 KB | Yes |
| Key derivation | Argon2id (argon2 Rust crate) | — | Yes |
| Passphrase recovery | BIP39 24-word mnemonic (user-held only) | — | Yes |
| Embedding model | bge-small-en-v1.5 (ONNX, 384-dim) | 130 MB | Yes |
| ONNX Runtime | ort Rust crate (+ GPU via CUDA/DirectML/CoreML) | ~20 MB | Yes |
| Voice transcription | **Whisper Small** ONNX via ort (default) | 480 MB | Yes |
| Voice transcription (fallback) | Whisper Base ONNX (low-storage toggle) | 145 MB | Yes |
| Audio capture | cpal Rust crate | — | Yes |
| LLM — no GPU (8+ GB RAM) | Llama 3.1 8B Instruct Q4_K_M via Ollama | 4.9 GB | Yes |
| LLM — GPU (8+ GB VRAM) | Qwen3 8B Q4_K_M via Ollama | 5.0 GB | Yes |
| LLM — low RAM (4–6 GB) | Phi-4-mini Q4_K_M via Ollama | 2.5 GB | Yes |
| LLM serving (now) | Ollama (REST at localhost:11434) | — | Yes |
| LLM serving (future v2) | llama-cpp-2 embedded Rust bindings | — | Yes |
| Filesystem watch | notify Rust crate | — | Yes |
| PDF parsing | pdf-extract Rust crate | — | Yes |
| Plugin sandbox | wasmtime Rust crate | — | Yes |
| Telegram Bot | teloxide + Telegram API (OPT-IN ONLY) | — | Outbound exception |
| CSS Styling | Vanilla CSS (HSL variables, 8px grid) | — | Yes |
| Avatar animation | Inline SVG + CSS path morphing | — | Yes |
