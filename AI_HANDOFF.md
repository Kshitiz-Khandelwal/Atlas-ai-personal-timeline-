# ATLAS — Master AI Handoff Document
**Version:** 1.0 · **Date:** July 2026  
**Purpose:** Give this file to any AI model before asking it to work on Atlas. It contains everything the AI needs and nothing it should invent.

---

> [!IMPORTANT]
> **DO NOT HALLUCINATE.** If something is not in this document, ask the user — do not invent it. All technical details below are verified and accurate.

---

## Section 1: What Atlas Is

Atlas is a **desktop application** (not a web app, not a mobile app, not a CLI tool).

It is a **Local-First AI Identity System** — it builds a living, time-aware model of a person's identity from their digital life.

**It is NOT:** a chatbot, a note-taking app, a cloud service, a journaling app, a task manager.

**Core principle:** Everything runs locally. No cloud APIs. No accounts. No telemetry. No data leaves the device. Ever.

---

## Section 2: Documents That Exist (Do Not Re-create)

All files are in: `c:\Users\Admin\Desktop\Kshitiz\Atlas\`

| File | Description | Status |
|:-----|:------------|:-------|
| `01_PRD.md` | Product Requirements Document | ✅ Complete |
| `02_UX_AND_APP_FLOW.md` | App screens, navigation, user flows | ✅ Complete |
| `03_TRD.md` | Technical Requirements Document (component specs, tech stack) | ✅ Complete |
| `04_DATABASE_DESIGN.md` | Full SQL schema with all 25+ tables, all column types | ✅ Complete |
| `05_DESIGN_SYSTEM.md` | Color tokens (HSL), typography (Outfit + Inter), 8px spacing grid | ✅ Complete |
| `06_IMPLEMENTATION_PLAN.md` | Phased milestones | ✅ Complete |
| `07_ARCHITECTURE_BIBLE.md` | Theory, graph math, structural rules | ✅ Complete |
| `README.md` | Project entry point | ✅ Complete |
| `STITCH_PROMPTS.md` | Google Stitch UI generation prompts for all 5 screens | ✅ Complete |
| `PROJECT_CONTEXT.md` | Entity types, graph model, confidence scoring, retrieval algorithm | ✅ Complete |
| `ARCHITECTURE.md` | Module map, data flow pipeline, tech stack table | ✅ Complete |
| `DECISIONS.md` | D-001 → D-010 numbered decision log with rationale | ✅ Complete |
| `TASKS.md` | Phase-by-phase `[ ]` task checklist with verification targets | ✅ Complete |
| `ATLAS_DOCUMENT_LIST_AND_ROADMAP.md` | Document inventory + priority order | ✅ Complete |
| `stich desing/atlas_ai_personal_intelligence_os.html` | Working UI prototype from Google Stitch | ✅ Complete |

---

## Section 3: Tech Stack (All Locked — Do Not Change)

| Layer | Tool | Notes |
|:------|:-----|:------|
| Desktop Framework | **Tauri 2.x** | React/TS frontend, Rust backend |
| Frontend Language | **TypeScript + React 18** | Functional components, hooks only |
| Frontend Styling | **Vanilla CSS** (CSS variables) | NO Tailwind, NO styled-components |
| Backend Language | **Rust 1.75+** | All business logic in Rust |
| Database | SQLite via SQLCipher | SQLCipher 4.x |
| Database Driver | **`rusqlite`** + r2d2 pool (NOT sqlx — sqlx blocks load_extension) | latest |
| Encryption | Argon2id (key derivation) + SQLCipher AES-256 | — |
| Passphrase Recovery | BIP39 24-word mnemonic (user-held, never stored) | — |
| Memory Safety | `secrecy` crate (zeroizing sensitive values) | — |
| Filesystem Watch | `notify` crate | 6.x |
| PDF Parsing | `pdf-extract` crate | latest |
| Audio Recording | `cpal` crate | latest |
| Voice Transcription (default) | **Whisper Small** ONNX via `ort` crate (480 MB) | — |
| Voice Transcription (fallback) | Whisper Base ONNX via `ort` crate (145 MB) | — |
| Embedding Model | `bge-small-en-v1.5` (ONNX format, 384-dim) | — |
| ONNX Runtime | `ort` crate (+ CUDA/DirectML/CoreML GPU providers) | 1.x |
| Vector Search | `sqlite-vec` extension (loaded via rusqlite) | latest |
| LLM — no GPU | Llama 3.1 8B Instruct Q4_K_M via Ollama | 4.9 GB |
| LLM — GPU | **Qwen3 8B Q4_K_M** via Ollama (Apache 2.0) | 5.0 GB |
| LLM — low RAM | Phi-4-mini Q4_K_M via Ollama (MIT) | 2.5 GB |
| LLM Serving (now) | Ollama REST at localhost:11434 | — |
| LLM Serving (future) | llama-cpp-2 embedded Rust bindings | — |
| Plugin Sandbox | `wasmtime` crate | latest |extension system |

---

## Section 4: Entity Types (All 16 — Do Not Invent Others)

`Memory` · `Project` · `Goal` · `Habit` · `Skill` · `Belief` · `Decision` · `Person` · `Organization` · `Place` · `Document` · `Note` · `MediaAsset` · `Chat` · `CalendarEvent` · `KnowledgeNode`

---

## Section 5: Database Tables (Summary)

**Core tables:**
- `nodes` — base entity table (id, entity_type, name, content, confidence, created_at, version, is_current, parent_version_id)
- `edges` — directed relationships (id, source_node_id, target_node_id, relationship_type, created_at)
- `embeddings` — (node_id, vector BLOB, model_name, dimensions)
- `timeline_events` — (id, node_id, event_type, start_ts, end_ts)
- `source_references` — (id, node_id, file_path, file_type, line_start, line_end, import_session_id)

**Extension tables (one per entity type):** `memories`, `projects`, `goals`, `habits`, `skills`, `beliefs`, `decisions`, `people`, `organizations`, `places`, `documents`, `notes`, `media_assets`, `chats`, `calendar_events`, `knowledge_nodes`

**Full column specs:** See `04_DATABASE_DESIGN.md`

---

## Section 6: Key Algorithm — Hybrid Retrieval

$$Score = 0.5 \cdot \text{VectorScore} + 0.3 \cdot \text{GraphScore} - 0.2 \cdot \Delta t$$

- **VectorScore:** Cosine similarity (bge-small-en-v1.5, 384-dim)
- **GraphScore:** Node degree centrality + shortest path distance to anchors
- **Δt:** Age penalty for recent-query mode
- **Cutoff:** Score < 0.65 → node excluded from LLM context

---

## Section 7: Key Rules (Do Not Violate)

| Rule ID | Rule |
|:--------|:-----|
| **G-1** | No two nodes of same `entity_type` share the same name in the same version chain |
| **G-2** | Deleting a node cascades to all connected edges |
| **G-3** | Version chain (`parent_version_id`) must be acyclic |
| **T-1** | Every node must have either a `timestamp` or a `duration` (start + end) |
| **T-2** | An edge cannot have a future node influencing a past node |
| **R-1** | Retrieval cutoff: Score ≥ 0.65 only |
| **R-2** | All PII (names, emails, phones) SHA-256 hashed before DB write |
| **AI-1** | Past-persona: enforce `WHERE created_at <= :cutoff` at SQL layer, not prompt layer |
| **AI-2** | Future projections must carry `[Projection - Confidence: Low/Medium/High]` prefix |
| **AI-3** | Every AI statement about user's past must link to a citation node |

---

## Section 8: Design System (Key Tokens)

| Token | Value | Usage |
|:------|:------|:------|
| `--color-bg-base` | `hsl(240, 10%, 4%)` | Page background (dark mode default) |
| `--color-bg-surface` | `hsl(240, 10%, 8%)` | Card surfaces |
| `--color-bg-overlay` | `hsla(240, 10%, 12%, 0.7)` | Glassmorphic overlays |
| `--color-border-subtle` | `hsl(240, 6%, 15%)` | Card borders, dividers |
| `--color-text-primary` | `hsl(0, 0%, 95%)` | Headings, body text |
| `--color-text-secondary` | `hsl(240, 4%, 65%)` | Subtitles, metadata |
| `--color-accent-blue` | `hsl(215, 80%, 55%)` | Active states, buttons, links |
| `--color-confidence-high` | `hsl(142, 60%, 45%)` | Green — high confidence |
| `--color-confidence-medium` | `hsl(37, 75%, 50%)` | Amber — medium confidence |
| `--color-confidence-low` | `hsl(0, 70%, 50%)` | Red — low confidence |
| Font (Display) | **Outfit**, sans-serif | Headings, H1, H2 |
| Font (Body) | **Inter**, sans-serif | Body text, UI labels |
| Font (Mono) | **JetBrains Mono** | File paths, citations, code |
| Base spacing unit | **8px** | All spacing is multiples of 8 |

---

## Section 9: Frontend Pages and Routes

| Page | Route | Key Components |
|:-----|:------|:---------------|
| Dashboard | `/dashboard` | Reflection hero card, DNA bars, source list, metric chips |
| Timeline | `/timeline` | Activity heatmap, vertical event feed, category filters |
| Identity Graph | `/graph` | Force-directed canvas, entity type filter panel, node detail slide-in |
| AI Chat | `/chat` | Thread sidebar, chat area with citations, persona switcher, animated SVG avatar, audio recorder |
| Settings | `/settings` | Source management, passphrase, model selector, backup, mirror persona & tray togglers, scenario parser trigger |

**Sidebar:** 64px icon-only. 5 nav icons (top) + 2 icons (bottom: Settings, Profile).
**Desktop Layout:** Configured to support system tray startup and global hotkey `Alt + Space` popup toggle. Focus-loss automatically minimizes window to tray.

---

## Section 10: Expanded Dynamic Behaviors

### 10.1 Local Voice Ingestion
- Captured audio is routed to local `cpal` recorder, outputted as temporary WAV files.
- Transcribed locally using Whisper ONNX (`ort` crate) or `whisper.cpp` bindings. Transcripts are cleaned and written to database.

### 10.2 Mirror Persona (Authentic & Cursing Tone)
- **Constraint:** AI style matches the user's vocabulary complexity, favorite slang, and patterns mined from chat history imports.
- **Tone:** Allowed to express raw character traits including safe levels of cursing and informal remarks (configurable via settings) to avoid sanitized corporate chatbot behavior.

### 10.3 SVG Animated Avatar
- Inline SVG face render in UI driven by sentiment state tags injected by the backend (e.g. `<avatar:smirk>`).
- Path morphs handle idle blink loops, mouth movement sync during token streaming, and expressions for confidence levels (Smile/Smirk/Sigh/Neutral).

---

## Section 11: What Is NOT Built Yet

As of July 2026, no code has been written. The following are all planned but not yet implemented:

- [ ] Tauri app scaffold & tray integration
- [ ] SQLCipher database
- [ ] Any ingestion parser (Obsidian, Git, ICS, WhatsApp)
- [ ] Audio capture & local Whisper transcriber
- [ ] ONNX embedding pipeline (bge-small ONNX)
- [ ] sqlite-vec integration
- [ ] Ollama client
- [ ] Any React component (Dashboard, Timeline, Graph, Chat, Avatar SVG)
- [ ] Any CSS

**The UI design prototype exists** at: `c:\Users\Admin\Desktop\Kshitiz\Atlas\stich desing\atlas_ai_personal_intelligence_os.html`

---

## Section 12: GitHub Repository

URL: `https://github.com/Kshitiz-Khandelwal/Atlas-ai-personal-timeline-`  
Branch: `main`  
**Push all changes to this repo** after every session.

---

## Section 13: What To Work On Next (Priority Order)

1. **Tauri scaffold & Tray setup** — `npm create tauri-app` with React/TS, set up window properties and hotkeys
2. **SQLCipher setup** — vault.rs, Argon2id key derivation, schema init
3. **Markdown parser** — first ingestion engine
4. **Embedding pipeline** — bge-small ONNX via `ort` crate
5. **sqlite-vec KNN** — vector search integration
6. **Audio recording & Whisper transcriber** — local transcription logic
7. **Ollama client** — connect to local LLM with mirror persona prompting rules
8. **Hybrid retrieval** — scorer + context packer
9. **React frontend & Dynamic SVG Avatar** — dashboard, timeline, graph, settings, chat interface with avatar animations

