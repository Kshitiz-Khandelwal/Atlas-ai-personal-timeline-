# Atlas — System Architecture

> Reference this before writing any module. All module names, data flows, and crate choices are locked here.

---

## 1. Architecture Overview

Atlas is a **Tauri desktop application** with three decoupled layers:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Frontend (React + TypeScript inside Tauri Webview) │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard · Timeline · Graph · Chat · Settings      │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │  Tauri IPC (tauri::command)          │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  LAYER 2: Rust Core Engine                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Ingestion   │  │  Graph + Vec │  │  Retrieval Engine │  │
│  │  Pipeline    │  │  Store       │  │  + Reflection     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                   │              │
│         └────────────────►│◄──────────────────┘              │
│                           │  SQLCipher (encrypted SQLite)    │
└──────────────────────────┬──────────────────────────────────┘
                           │  localhost:11434 REST
┌──────────────────────────▼──────────────────────────────────┐
│  LAYER 3: Inference Layer                                    │
│  Ollama server running GGUF quantized LLM on CPU/GPU        │
│  Models: Llama-3-8B-Instruct · Qwen-2.5-7B-Instruct         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Full Data Flow Pipeline

```
User's Local Files (notes, git, calendar, PDF, chat exports)
        │
        ▼
[Directory Watcher] — notify crate
        │  detects new/changed files
        ▼
[Parser Layer] — specialized per file type
  ├── Markdown Parser     → extracts frontmatter, headings, links
  ├── Git Commit Crawler  → reads git log, diffs, languages
  ├── ICS Calendar Parser → reads VEVENT blocks
  ├── PDF Extractor       → pdf-extract crate, text chunks
  └── Chat Export Parser  → WhatsApp .txt, Telegram .json
        │
        ▼
[PII Anonymizer]
  └── SHA-256 hash: all email, phone, external names
        │
        ▼
[Entity Classifier] — LLM or rule-based
  └── Assigns entity_type, confidence, date range
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
[SQL Write — nodes + extension tables]  [Embedding Compute]
  └── SQLCipher encrypted DB             └── ort crate + bge-small-en-v1.5 ONNX
                                            384-dim vectors → sqlite-vec index
        │
        ▼
[Identity Graph — nodes + edges]
  └── Version chain preserved: is_current, parent_version_id
        │
        ▼
[Retrieval Engine — on user query]
  ├── Embed query → 384-dim vector
  ├── KNN search on sqlite-vec (top 20 candidates)
  ├── Graph traversal scoring (degree centrality)
  ├── Hybrid scorer: 0.5·VecScore + 0.3·GraphScore - 0.2·ΔT
  └── Filter: Score ≥ 0.65 → context list
        │
        ▼
[Context Packer]
  └── 8k token window, recursive summarization if overflow
        │
        ▼
[Ollama REST Client] → localhost:11434
  └── Streaming token response with citation indices
        │
        ▼
[Tauri IPC Stream] → React Chat UI
```

---

## 3. Module Map (Rust Backend)

| Module Path | Responsibility |
|:---|:---|
| `src-tauri/src/main.rs` | Tauri app bootstrap, IPC command registration |
| `src-tauri/src/vault.rs` | Vault init, SQLCipher connection, key derivation (Argon2id) |
| `src-tauri/src/ingestion/mod.rs` | Ingestion pipeline orchestrator |
| `src-tauri/src/ingestion/markdown.rs` | Markdown + Obsidian parser |
| `src-tauri/src/ingestion/git.rs` | Git log reader and commit entity builder |
| `src-tauri/src/ingestion/calendar.rs` | ICS event parser |
| `src-tauri/src/ingestion/pdf.rs` | PDF text extractor |
| `src-tauri/src/ingestion/chat.rs` | WhatsApp + Telegram chat parser |
| `src-tauri/src/ingestion/pii.rs` | SHA-256 PII hashing module |
| `src-tauri/src/graph/mod.rs` | Graph traversal queries |
| `src-tauri/src/graph/schema.rs` | SQL schema init (CREATE TABLE statements) |
| `src-tauri/src/embeddings.rs` | ONNX runtime loader + embedding computation |
| `src-tauri/src/retrieval.rs` | Hybrid scorer, context packer, temporal filter |
| `src-tauri/src/ai.rs` | Ollama REST client, streaming handler |
| `src-tauri/src/reflection.rs` | Weekly reflection job, Identity DNA updater |

---

## 4. Frontend Module Map (React)

| Component / Page | Route | Responsibility |
|:---|:---|:---|
| `App.tsx` | `/` | Root router, sidebar layout, theme provider |
| `pages/Dashboard.tsx` | `/dashboard` | Weekly reflection card, DNA bars, source status |
| `pages/Timeline.tsx` | `/timeline` | Chronological event feed, date filters |
| `pages/Graph.tsx` | `/graph` | Force-directed node canvas (d3 or react-force-graph) |
| `pages/Chat.tsx` | `/chat` | 3-panel chat: threads, messages, citation rail |
| `pages/Settings.tsx` | `/settings` | Source management, passphrase change, backup |
| `components/Sidebar.tsx` | — | Icon-only navigation sidebar (64px) |
| `components/CitationCard.tsx` | — | Source file citation overlay in chat |
| `components/EntityCard.tsx` | — | Reusable entity display card (timeline + graph) |
| `components/DNABar.tsx` | — | Single trait progress bar with percentage |

---

## 5. Technology Stack (Locked)

| Layer | Technology | Version Target |
|:---|:---|:---|
| Desktop Framework | Tauri 2.x | 2.x stable |
| Frontend Language | TypeScript + React 18 | 18.x |
| Frontend Styling | Vanilla CSS (CSS variables, no Tailwind) | — |
| Backend Language | Rust | 1.75+ |
| Database | SQLite via SQLCipher | SQLCipher 4.x |
| Database ORM | `sqlx` crate | 0.7.x |
| Encryption | Argon2id (key derivation) + SQLCipher AES-256 | — |
| Memory Safety | `secrecy` crate (zeroizing sensitive values) | — |
| Filesystem Watch | `notify` crate | 6.x |
| PDF Parsing | `pdf-extract` crate | latest |
| Embedding Model | `bge-small-en-v1.5` (ONNX format, 384-dim) | — |
| ONNX Runtime | `ort` crate | 1.x |
| Vector Search | `sqlite-vec` extension | latest |
| LLM Inference | Ollama (REST at localhost:11434) | 0.x |
| LLM Models | Llama-3-8B-Instruct or Qwen-2.5-7B Q4_K_M GGUF | — |
| Plugin Sandbox | `wasmtime` crate | latest |

---

## 6. Database Schema Summary

**Core tables:** `nodes`, `edges`, `embeddings`, `timeline_events`, `source_references`

**Extension tables (one per entity type, share `nodes.id` as FK):**
`memories`, `projects`, `goals`, `habits`, `skills`, `beliefs`, `decisions`, `people`, `organizations`, `places`, `documents`, `notes`, `media_assets`, `chats`, `calendar_events`, `knowledge_nodes`

**AI/ops tables:** `ai_conversations`, `ai_sessions`, `reflections`, `identity_dna`, `import_sessions`, `activity_logs`

See `04_DATABASE_DESIGN.md` for full column-level schema.

---

## 7. Security Constraints

- **No network calls** containing user content. Ollama runs on localhost only.
- **Vault encryption:** Master passphrase → Argon2id → 256-bit key → SQLCipher page encryption
- **Memory safety:** All passphrase strings wrapped in `secrecy::Secret<String>`, zeroed on drop
- **PII rule:** SHA-256 hash all third-party names/emails/phones before DB write. Never store raw PII.
- **Plugin sandbox:** Any future user plugins run inside `wasmtime` sandbox with no filesystem access
