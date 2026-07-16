# Atlas — Task Tracker

> Live build checklist. Mark `[x]` when done, `[/]` when in progress. Add verification results inline.

---

## Phase 1: Core Infrastructure

### 1.1 Tauri + Rust Scaffold
- [ ] Run `npm create tauri-app@latest` with React/TypeScript template
- [ ] Verify `tauri dev` launches without errors
- [ ] Configure `src-tauri/Cargo.toml` with all dependencies:
  - [ ] `sqlx`, `rusqlite` or `sqlcipher` bindings
  - [ ] `secrecy` (zeroizing passphrase memory)
  - [ ] `argon2` (key derivation)
- [x] Run `npm create tauri-app@latest` with React/TypeScript template
- [x] Verify `tauri dev` launches without errors
- [x] Configure `src-tauri/Cargo.toml` with all dependencies:
  - [x] `sqlx`, `rusqlite` or `sqlcipher` bindings
  - [x] `secrecy` (zeroizing passphrase memory)
  - [x] `argon2` (key derivation)
  - [x] `notify` (filesystem watcher)
  - [x] `ort` (ONNX runtime)
  - [x] `reqwest` (Ollama HTTP client)
  - [x] `tokio` (async runtime)
- [x] Create basic folder structure under `src-tauri/src/`

**Verification:** `tauri dev` boots, empty app window opens. No compiler errors.

---

### 1.2 SQLCipher Encrypted Database
- [x] Compile SQLCipher static library (or use pre-built bindings)
- [x] Create `vault.rs` module
- [x] Implement Argon2id key derivation from master passphrase
  - Parameters: `m=65536`, `t=3`, `p=1`, 32-byte output
- [x] Open SQLCipher connection with derived key via `PRAGMA key`
- [x] Run schema initialization SQL (all tables from `04_DATABASE_DESIGN.md`)
- [x] Write unit test: wrong passphrase returns `SQLITE_NOTADB`
- [x] Write unit test: correct passphrase returns open connection

**Verification:**
- [x] `atlas.db` opened in hex editor shows random bytes (encrypted ✓)
- [x] Schema tables visible after correct passphrase entry

---

### 1.3 Onboarding UI (Passphrase Setup)
- [x] Build `SetupPage.tsx` — first-run passphrase creation screen
- [x] Build passphrase strength meter component
- [x] Generate BIP39 recovery key (display once, do not store)
- [x] Build `UnlockPage.tsx` — returning user passphrase entry
- [x] Wire up Tauri IPC: `unlock_vault(passphrase: string)` → Rust

---

## Phase 2: Ingestion & Local AI Engines

### 2.1 Directory Watcher & Audio Capture
- [x] Create `watcher.rs`
- [x] Implement `notify` watcher on `~/Atlas-Observed/` source directory
- [x] Queue file change events (`file-observed`) for parser dispatch to frontend
- [x] Create `audio.rs` (`cpal`) for raw microphone recording & clean 16kHz mono WAV export (`diary_ts.wav`)

### 2.2 Vector Embeddings & sqlite-vec Search
- [x] Create `embed.rs` with `ort` ONNX Runtime engine (`bge-small-en-v1.5.onnx`)
- [x] Register `sqlite-vec` virtual table (`vec0`) inside `rusqlite` connections (`node_embeddings`)
- [x] Implement vector similarity query via `MATCH ? ORDER BY distance LIMIT ?`
- [x] Build Phase 2 interactive test dashboard (`App.tsx`) with real-time UI controls
- [ ] Parse YAML frontmatter fields (date, tags, status)
- [ ] Extract H1 / H2 headings as entity names
- [ ] Extract `[[wikilinks]]` as graph edge candidates
- [ ] Map to entity types: Note, Project, Goal, Decision (by tag or folder)

**Verification:**
- [ ] Feed 50 test `.md` files → 40+ entities extracted
- [ ] Entity types are varied (not all `Note`)

### 2.3 Git Commit Crawler
- [ ] Create `ingestion/git.rs`
- [ ] Run `git log --all --format="%H|%ae|%cd|%s"` on user repos
- [ ] Map each repo → `Project` entity
- [ ] Extract languages from file extensions in diff stats → `Skill` entities
- [ ] Derive `Habit` entity from commit time distribution (e.g. "night coder")

**Verification:**
- [ ] Feed 1 local git repo → Project entity + ≥1 Skill entity created

### 2.4 Calendar ICS Parser
- [ ] Create `ingestion/calendar.rs`
- [ ] Parse `VEVENT` blocks: `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`
- [ ] Map to `CalendarEvent` entities
- [ ] Extract attendee names → `Person` entities (hash before storing)

### 2.5 PDF Extractor
- [ ] Create `ingestion/pdf.rs`
- [ ] Use `pdf-extract` crate to extract text
- [ ] Chunk text into 512-token segments
- [ ] Map to `Document` + `KnowledgeNode` entities

### 2.6 Chat Export Parsers
- [ ] Create `ingestion/chat.rs`
- [ ] Parse WhatsApp export format (`.txt`, date line pattern)
- [ ] Parse Telegram export format (`messages.json`)
- [ ] Map conversations → `Chat` entities + `Memory` entities

### 2.7 PII Anonymizer
- [ ] Create `ingestion/pii.rs`
- [ ] Regex detection: email addresses, phone numbers, contact names
- [ ] SHA-256 hash detected PII before any DB write
- [ ] Store `pii_hash` in `people.contact_hash` column only

**Verification:**
- [ ] Feed a WhatsApp export → no raw names/phones in any DB column

---

## Phase 3: Identity Graph + Vector Search

### 3.1 SQL Schema Initialization
- [ ] Create `graph/schema.rs` with all `CREATE TABLE IF NOT EXISTS` statements
- [ ] Run on first vault open
- [ ] Verify all 25+ tables created correctly

### 3.2 ONNX Embedding Pipeline
- [ ] Download `bge-small-en-v1.5` ONNX model (place in `assets/models/`)
- [ ] Create `embeddings.rs`
- [ ] Load model via `ort` crate on app startup
- [ ] Implement `embed(text: &str) -> Vec<f32>` function (384-dim output)
- [ ] Write to `embeddings` table after each node insert

**Verification:**
- [ ] Embed "I started learning Rust" → 384-element float vector returned
- [ ] Embedding inference < 50ms on CPU

### 3.3 sqlite-vec KNN Search
- [ ] Load `sqlite-vec` extension into SQLCipher connection
- [ ] Create virtual table `vec_items` mirroring `embeddings`
- [ ] Implement KNN query: top 20 nearest nodes to query vector
- [ ] Write retrieval integration test

**Verification:**
- [ ] 1,000 nodes → KNN query returns in < 200ms

### 3.4 Graph Traversal Queries
- [ ] Create `graph/mod.rs`
- [ ] Implement `get_neighbors(node_id, depth)` function
- [ ] Implement `get_shortest_path(source_id, target_id)` function
- [ ] Implement entity deduplication check (name + type uniqueness per version chain)

### 3.5 Version Chain Logic
- [ ] On entity update: set old node `is_current = 0`
- [ ] Insert new node with `parent_version_id = old_node.id`
- [ ] Verify: timeline view shows correct version history

---

## Phase 4: Local AI + Retrieval

### 4.1 Ollama REST Client
- [ ] Create `ai.rs`
- [ ] Implement `POST /api/chat` call to localhost:11434
- [ ] Handle streaming response (SSE / chunked)
- [ ] Implement model check: verify model is downloaded before use

### 4.2 Hybrid Retrieval Scorer
- [ ] Create `retrieval.rs`
- [ ] Implement hybrid score: `0.5·VecScore + 0.3·GraphScore - 0.2·ΔT`
- [ ] Filter: drop candidates where Score < 0.65
- [ ] Return ranked list of up to 20 context nodes

### 4.3 Past-Persona Temporal Filter
- [ ] Accept `cutoff_timestamp: Option<i64>` in all retrieval queries
- [ ] Append `AND created_at <= :cutoff` when cutoff is Some
- [ ] Test: query with 2024 cutoff → zero 2025/2026 entities in result

### 4.4 Context Packer
- [ ] Assemble retrieved nodes into structured prompt context
- [ ] Count tokens (approximate: chars / 4)
- [ ] If > 6000 tokens: run recursive summarization via Ollama
- [ ] Attach citation indices [1][2] to each context snippet

### 4.5 Streaming Token Handler
- [ ] Stream Ollama tokens via Tauri event emission
- [ ] Parse citation markers in streaming output
- [ ] On stream end: save conversation to `ai_conversations` table

---

## Phase 5: Frontend UI

### 5.1 Base Setup
- [ ] Configure CSS variables in `src/index.css` (all tokens from `05_DESIGN_SYSTEM.md`)
- [ ] Set up React Router v6 with routes for all 5 pages
- [ ] Build `Sidebar.tsx` (64px icon-only nav, 5 main icons + 2 bottom icons)
- [ ] Import Outfit + Inter fonts from Google Fonts

### 5.2 Dashboard Page
- [ ] Hero reflection card (glassmorphic, weekly summary)
- [ ] Three metric chips: entities, decisions, habits count
- [ ] Three-column grid: Recent Timeline | Identity DNA | Sources
- [ ] DNA trait progress bars (6 traits, percentage + label)
- [ ] Source sync status list (last-synced timestamps)

### 5.3 Timeline Page
- [ ] Category filter pills (All / Projects / Decisions / Habits / Memories)
- [ ] Vertical event feed (680px centered column)
- [ ] GitHub-style activity heatmap (52×7 grid, blue scale)
- [ ] Entity card on click (type badge, date, description, tags, source path)

### 5.4 AI Chat Page
- [ ] Three-panel layout: Thread list | Chat area | Citation rail
- [ ] Persona switcher: Past / Present / Future mode
- [ ] User messages: right-aligned dark blue pill
- [ ] Atlas responses: left-aligned, plain text with [1][2] citation markers
- [ ] Dynamic SVG Anime Avatar:
  - [ ] Render responsive SVG inline character face component
  - [ ] Implement animations: blink loop, idle breathing, and talking lip-sync
  - [ ] Implement expressions: smirk (confidence), worry (sad/concerned), spark (curiosity) mapped to LLM sentiment
- [ ] Audio recording button and audio visualization overlay
- [ ] Confidence bar below each AI response
- [ ] Input: floating pill shape with send button + model selector
- [ ] Citation rail: expandable source cards with file path + date

### 5.5 Settings Page
- [ ] Source directory management (add/remove watched folders)
- [ ] Change master passphrase
- [ ] Toggle "Mirror Persona Mode" (enables casual/candid tone & cursing)
- [ ] Toggle "Hotkey Popup Mode" (configures tray-only, shortcut to show/hide)
- [ ] Trigger manual personality scenario questionnaire (16Personalities style)
- [ ] Manual sync trigger button
- [ ] Export backup button (copies atlas.db to chosen location)
- [ ] Model selector (which Ollama model to use)

---

## Phase 6: Security + Polish

### 6.1 Security Checks
- [ ] Memory dump test: passphrase not visible in process memory after unlock
- [ ] Verify no outbound network requests in DevTools while app is running
- [ ] Plugin sandbox: test `wasmtime` isolation of external scripts

### 6.2 Window & OS Integration
- [ ] Set up system tray/menu bar launch configurations
- [ ] Implement global hotkey registration (`Alt + Space` or user-defined)
- [ ] Setup window focus/blur handlers (pressing `Esc` or clicking away hides app)

### 6.3 Packaging
- [ ] Configure Tauri bundler for Windows MSI
- [ ] Configure Tauri bundler for macOS DMG (if applicable)
- [ ] Configure Tauri bundler for Linux `.deb` (if applicable)
- [ ] Publish GitHub release with binary checksums

---

## Verification Checkpoints

### ✅ Checkpoint A — Database Security
- [ ] `atlas.db` opened in hex viewer shows random bytes (encrypted)
- [ ] Wrong passphrase → error, no data returned
- [ ] Correct passphrase → entity count > 0 after test import

### ✅ Checkpoint B — Ingestion & Transcription
- [ ] 50 Obsidian notes → ≥40 entities extracted
- [ ] Voice memo recording WAV generated on disk locally
- [ ] Local Whisper transcription converts WAV to correct text entity matching spoken words
- [ ] No raw PII visible in any DB column

### ✅ Checkpoint C — Retrieval
- [ ] Vector KNN on 1,000 nodes: < 200ms
- [ ] Hybrid scorer top result is visibly relevant to query
- [ ] Past-persona filter: 2024 cutoff → zero 2025+ entities returned

### ✅ Checkpoint D — AI Quality
- [ ] "What was I working on in [month]?" → cited, dated entities
- [ ] Past-persona answer has zero post-cutoff references
- [ ] All citation markers [1][2] link to real local file paths
- [ ] Mirror Persona prompt injects style cues (candid vocabulary, customized slang/cursing limits)

### ✅ Checkpoint E — UI & Window Popups
- [ ] Global shortcut toggles window visibility instantly (<100ms)
- [ ] Focus lost (clicking away) hides the window to the tray
- [ ] Dashboard loads < 300ms
- [ ] Animated SVG avatar shifts paths/states based on response sentiment
- [ ] Timeline scrolls smoothly with 1,000+ events
- [ ] No network requests in DevTools Network tab

