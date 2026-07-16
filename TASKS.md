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
- [x] Parse YAML frontmatter fields (date, tags, status)
- [x] Extract H1 / H2 headings as entity names
- [x] Extract `[[wikilinks]]` as graph edge candidates
- [x] Map to entity types: Note, Project, Goal, Decision (by tag or folder)

**Verification:**
- [x] Feed 50 test `.md` files → 40+ entities extracted
- [x] Entity types are varied (not all `Note`)

### 2.3 Git Commit Crawler
- [x] Create `ingestion/git.rs`
- [x] Run `git log --all --format="%H|%ae|%cd|%s"` on user repos
- [x] Map each repo → `Project` entity
- [x] Extract languages from file extensions in diff stats → `Skill` entities
- [x] Derive `Habit` entity from commit time distribution (e.g. "night coder")

**Verification:**
- [x] Feed 1 local git repo → Project entity + ≥1 Skill entity created

### 2.4 Calendar ICS Parser
- [x] Create `ingestion/calendar.rs`
- [x] Parse `VEVENT` blocks: `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`
- [x] Map to `CalendarEvent` entities
- [x] Extract attendee names → `Person` entities (hash before storing)

### 2.5 PDF Extractor
- [x] Create `ingestion/pdf.rs`
- [x] Use `pdf-extract` crate to extract text
- [x] Chunk text into 512-token segments
- [x] Map to `Document` + `KnowledgeNode` entities

### 2.6 Chat Export Parsers
- [x] Create `ingestion/chat.rs`
- [x] Parse WhatsApp export format (`.txt`, date line pattern)
- [x] Parse Telegram export format (`messages.json`)
- [x] Map conversations → `Chat` entities + `Memory` entities

### 2.7 PII Anonymizer
- [x] Create `ingestion/pii.rs`
- [x] Regex detection: email addresses, phone numbers, contact names
- [x] SHA-256 hash detected PII before any DB write
- [x] Store `pii_hash` in `people.contact_hash` column only

**Verification:**
- [x] Feed a WhatsApp export → no raw names/phones in any DB column

---

## Phase 3: Interactive Animated Avatar Face & Outbound Telegram Bot

### 3.1 Identity Graph & Vector Engine (Completed in Phase 1 & 2)
- [x] SQL schema initialization (`graph/schema.rs`) across all 25+ tables
- [x] ONNX `bge-small-en-v1.5` embedding pipeline (`embed.rs` via `ort`)
- [x] `sqlite-vec` virtual table (`vec0`) and KNN similarity search (`AND k = ?`)

### 3.2 Dynamic Animated Avatar Face (`AvatarFace.tsx`)
- [x] Build `AvatarFace.tsx` SVG engine with smooth morphing paths (eyes, brows, mouth)
- [x] Implement emotional/conversational states (`NEUTRAL`, `LISTENING`, `THINKING`, `SPEAKING`, `SARCASM/SASSY`)
- [x] Add micro-animations (blinking, breathing, reactive lip-syncing when speaking)
- [x] Connect avatar state directly to voice recording (`cpal`) and AI inference states

### 3.3 Outbound Telegram Reminder Bot (`telegram.rs`)
- [x] Create `telegram.rs` background service using `reqwest` HTTP client
- [x] Implement encrypted storage for `telegram_bot_token` and `telegram_chat_id` in SQLCipher table (`settings_secure`)
- [x] Create `send_telegram_message` and `test_telegram_connection` IPC commands
- [x] Wire up UI config panel in React dashboard (`ChatPanel.tsx`) for instant phone pinging

**Verification:**
- [x] 1,000 nodes → KNN query returns in < 200ms

### 3.4 Graph Traversal & Timeline Queries (`graph/queries.rs`)
- [x] Create `graph/queries.rs`
- [x] Implement `get_node_neighbors(node_id, depth)` relationship query
- [x] Implement `get_timeline_nodes` chronological feed extraction
- [x] Implement `get_graph_network` visual canvas node/edge exporter

### 3.5 Version Chain & Entity Logic
- [x] On entity update: set old node `is_current = 0`
- [x] Insert new node with `parent_version_id = old_node.id`
- [x] Verify: timeline view (`TimelineView.tsx`) shows clean version history

---

## Phase 4: Visual Timeline & Interactive Graph Canvas (`TimelineView.tsx` & `NetworkGraph.tsx`)

### 4.1 Chronological Identity Timeline (`TimelineView.tsx`)
- [x] Build scrollable feed of all identity events (`chat`, `voice_note`, `observed_file`, `git_commit`)
- [x] Add real-time entity type filter pills (`ALL`, `chat`, `voice_note`, `observed_file`, `git_commit`)
- [x] Add neighborhood drill-down panel showing connected relationship edges on card click

### 4.2 Interactive Network Canvas (`NetworkGraph.tsx`)
- [x] Build SVG/Canvas circular hub layout mapping memory nodes to glowing color-coded circles
- [x] Render directed relationship lines (`source_node_id -> target_node_id`) with relationship labels
- [x] Add click-to-inspect node detail card alongside the visual network map

---

## Phase 5: Frontend UI

### 5.1 Base Setup
- [x] Configure CSS variables in `src/App.css` (all tokens from `05_DESIGN_SYSTEM.md`)
- [x] Set up view tabs and navigation (`App.tsx`)
- [x] Build `Sidebar/Navbar` view controls
- [x] Import Outfit + Inter fonts from Google Fonts

### 5.2 Dashboard Page
- [x] Hero reflection card (glassmorphic, weekly summary)
- [x] Metric chips: entities, decisions, habits count
- [x] Three-column layout: Recent Timeline | Identity DNA | Sources
- [x] DNA trait progress bars (6 traits, percentage + label)
### 5.2 Global Handoff Overlay (`Alt + Space` / `Esc`)
- [x] Configure global hotkey window invocation / hide
- [x] Listen for `Esc` key down across all pages to auto-hide overlay like OS spotlight
- [x] Source directory management list (watched paths)

### 5.3 Timeline & Network Pages (`TimelineView.tsx` & `NetworkGraph.tsx`)
- [x] Category filter pills (`ALL` / `chat` / `voice_note` / `observed_file`)
- [x] Vertical event feed and entity detail cards
- [x] Interactive Canvas circular node map with directed edges

### 5.4 AI Chat Page (`ChatPanel.tsx` & `AvatarFace.tsx`)
- [x] Dynamic SVG Anime Avatar with lip sync (`SPEAKING`), smirking (`SASSY`), blinking (`NEUTRAL`), and thinking states
- [x] Voice recording integration (`cpal`) with WAV path storage
- [x] Outbound Telegram API integration for real-time mobile push notifications
- [x] Local ONNX vector similarity (`bge-small-en-v1.5.onnx`) context injection

### 5.5 Settings Page (`SettingsPage.tsx`)
- [x] Source directory management (add/remove watched folders for `notify`)
- [x] Lock vault button / Master passphrase control
- [x] Toggle "Mirror Persona Mode" (enables casual/candid tone & candor)
- [x] Toggle "Global Shortcut (`Alt + Space`)" option
- [x] Export encrypted backup snapshot button (`atlas.db` export)
- [x] Real-time SQLCipher vector and graph stats display (`nodeCount`, `edgeCount`, `embeddings`)

---

## Phase 6: Security + Polish

### 6.1 Security Checks
- [x] Memory dump test: passphrase not visible in process memory after unlock
### 6.1 Security Audit & Sandboxing
- [x] Verify no outbound network requests in DevTools while app is running (except user-enabled Telegram push)
- [x] Plugin sandbox & IPC strict command permission validation

### 6.2 Window & OS Integration
- [x] Set up system tray/menu bar launch configurations (`TrayIconBuilder` with `toggle`, `lock`, `quit`)
- [x] Implement global hotkey registration (`Alt + Space` via `tauri-plugin-global-shortcut`)
- [x] Setup window focus/blur handlers (`Esc` key down & `onFocusChanged` Spotlight blur auto-hide)

### 6.3 Packaging
- [x] Configure Tauri bundler for Windows MSI (`targets: ["msi", "nsis"]`, custom window title & frameless transparent overlay)
- [x] Configure product identifier (`com.atlas.identity.os`) and branding

---

## Verification Checkpoints

### ✅ Checkpoint A — Database Security
- [x] `atlas.db` opened in hex viewer shows random bytes (SQLCipher AES-256 encrypted at rest)
- [x] Wrong passphrase → error, no data returned
- [x] Correct passphrase → entity count > 0 after test import

### ✅ Checkpoint B — Ingestion & Transcription
- [x] Obsidian notes / local directories → entities extracted & vectorized into `vec0`
- [x] Voice memo recording WAV generated on disk locally via `cpal`
- [x] No raw PII visible in unencrypted form

### ✅ Checkpoint C — Retrieval
- [x] Vector KNN (`sqlite-vec`) sub-100ms nearest neighbor recall
- [x] Hybrid scorer top result is visibly relevant to query
- [x] Chronological versioning tracking

### ✅ Checkpoint D — AI Quality
- [x] "What was I working on?" → cited, dated entities
- [x] Mirror Persona prompt injects style cues (candid vocabulary, customized sass/smirk responses)
- [x] Outbound Telegram mobile notifications pinged directly to `chat_id`

### ✅ Checkpoint E — UI & Window Popups
- [x] Global shortcut (`Alt + Space`) toggles window visibility instantly
- [x] Focus lost (clicking away) hides the window to the tray when Spotlight Blur Auto-Hide is enabled
- [x] Animated 3D Memoji / Bitmoji avatar shifts irises, head shading, antenna glow, and lip-sync paths based on response sentiment
- [x] Timeline & Network Graph scroll and zoom smoothly across nodes

