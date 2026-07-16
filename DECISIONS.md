# Atlas — Design Decisions Log

> This log records WHY specific technical choices were made. Read before suggesting alternatives.
> Format: Decision ID · Decision · Rationale · Rejected Alternatives

---

## D-001: Tauri over Electron

**Decision:** Use Tauri 2.x as the desktop application framework.

**Rationale:**
- Tauri uses the OS native webview (WebView2 on Windows, WKWebView on macOS), resulting in ~10 MB installer vs Electron's ~150 MB bundled Chromium.
- The Rust backend enforces type-safe IPC with a zero-cost abstraction boundary — no accidental data leaks through loose JS/Node IPC.
- Rust's ownership model provides memory safety guarantees critical for a security-sensitive app that handles personal data.

**Rejected:** Electron — too heavy, uses Node.js backend which increases attack surface, bundle size is unsuitable for a private local-first app.

---

## D-002: SQLite + SQLCipher over Dedicated Graph Database

**Decision:** Use SQLite (via SQLCipher for encryption) as the primary storage engine, modelling the graph with `nodes` and `edges` tables.

**Rationale:**
- Atlas is a single-user desktop app. Graph databases (Neo4j, ArangoDB) require a running server process — unnecessary overhead for one user's data.
- SQLite is a single file on disk, making it trivially simple to backup, move, and restore.
- SQLCipher provides AES-256 page-level encryption at rest with near-zero performance overhead.
- The Generalization-Specialization schema pattern (base `nodes` table + 16 typed extension tables) replicates graph semantics in relational SQL.

**Rejected:** Neo4j — server dependency, complex setup. ArangoDB — same. DuckDB — no encryption.

---

## D-003: bge-small-en-v1.5 for Embeddings

**Decision:** Use `bge-small-en-v1.5` ONNX model (384 dimensions) for all entity embeddings.

**Rationale:**
- 384 dimensions provides a strong quality/performance trade-off. Larger models (1536-dim OpenAI) would require too much disk and RAM.
- bge-small runs inference in ~5ms per embedding on CPU — fast enough for real-time ingestion.
- The ONNX format runs via the `ort` Rust crate (ONNX Runtime bindings) with no Python runtime dependency.
- The model runs fully locally — no API calls.

**Rejected:** OpenAI text-embedding-ada-002 — cloud API, violates local-only constraint. sentence-transformers — Python dependency.

**Fallback:** `all-MiniLM-L6-v2` ONNX — also 384-dim, acceptable substitute.

---

## D-004: sqlite-vec for Vector Search

**Decision:** Use `sqlite-vec` as the vector index, compiled into the SQLCipher binary.

**Rationale:**
- Keeps the entire data layer inside a single SQLite database file — no separate vector database process.
- Supports KNN cosine similarity queries directly in SQL.
- Eliminates the operational complexity of running Qdrant, Chroma, Weaviate, or Pinecone.
- The atlas.db file remains a single portable artifact containing both structured data and vector embeddings.

**Rejected:** Qdrant — separate server process. Chroma — Python dependency. FAISS — C++ build complexity, no encryption.

---

## D-005: Ollama for Local LLM Inference

**Decision:** Use Ollama as the local LLM serving backend (REST at localhost:11434).

**Rationale:**
- Ollama abstracts model download, GGUF quantization, and CPU/GPU routing behind a simple REST API.
- The Atlas core connects to it via a standard HTTP client (`reqwest` crate) — no native library linking required.
- Supports hot-swapping models without restarting Atlas.
- Supports streaming token responses.

**Rejected:** llama.cpp direct integration — more control but requires compiling and linking the library into the Rust binary, complex build system. OpenAI API — cloud, violates privacy constraint.

**Model targets:**
- Primary: `llama3:8b-instruct-q4_K_M` (best instruction following, 4.9GB)
- Alternative: `qwen2.5:7b-instruct-q4_K_M` (stronger on reasoning tasks, 4.4GB)

---

## D-006: Argon2id for Key Derivation

**Decision:** Use Argon2id (via `argon2` Rust crate) to derive the SQLCipher encryption key from the user's master passphrase.

**Rationale:**
- Argon2id is the Password Hashing Competition winner (2015). It is memory-hard and resistant to GPU brute-force attacks.
- Protects against offline dictionary attacks — even if the `atlas.db` file is stolen, brute-forcing the passphrase is computationally infeasible.
- PBKDF2 was considered but Argon2id is strictly superior for modern hardware threat models.

**Parameters:** `m=65536` (64MB memory), `t=3` (3 iterations), `p=1` (1 thread), 32-byte output key.

**Rejected:** PBKDF2 — lower memory hardness. bcrypt — 72-byte input limit (passphrases can be longer). Plain SHA-256 — not a password hash.

---

## D-007: Generalization-Specialization Schema Pattern

**Decision:** Use a base `nodes` table shared by all 16 entity types, with 16 one-to-one extension tables (e.g. `projects`, `skills`, `habits`) holding type-specific columns.

**Rationale:**
- Enables a single `nodes` query to search across all entity types simultaneously (used by retrieval, timeline, and graph views).
- Avoids the NULL column sprawl of a flat single-table approach (a flat table with 80+ columns, 90% of which are NULL per row).
- Avoids the JOIN explosion of a fully polymorphic approach (no single query possible across all types).
- Matches the "Inheritance by Table" pattern used in production PostgreSQL database designs.

**Rejected:** Single flat table — too many NULLs. One table per type — no cross-type queries. JSON column — unindexable, no schema enforcement.

---

## D-008: Vanilla CSS (No Tailwind)

**Decision:** Style the entire frontend using vanilla CSS with CSS custom properties (variables).

**Rationale:**
- Atlas has a precise design system (`05_DESIGN_SYSTEM.md`) with named tokens (HSL colors, 8px spacing grid). Vanilla CSS variables (`--color-accent-blue`, `--spacing-md`) map exactly to these tokens.
- No build-time dependency on a CSS framework — smaller bundle, no version conflicts.
- Easier dark/light theme switching via `:root` variable overrides.
- Avoids Tailwind's class name verbosity in JSX.

**Rejected:** Tailwind CSS — class-name verbosity, harder to express the glassmorphism and specific HSL color palette. styled-components — runtime overhead.

---

## D-009: Local Whisper for Voice Transcription
**Decision:** Use a lightweight local ONNX Whisper model (via `ort` crate) or `whisper-rs` (binding to `whisper.cpp`) to transcribe recorded WAV audio.
**Rationale:**
- Maintains absolute offline privacy for personal voice diaries.
- Whisper Small/Base ONNX models run in sub-second times for typical 30-second diary entries on modern CPUs.
- Avoids external API costs and key management.

**Rejected:** Google Cloud Speech-to-Text / OpenAI Whisper API (both violate the local-only constraint).

---

## D-010: SVG Path Morphing and CSS Animations for the Animated Anime Avatar
**Decision:** Implement the animated anime avatar using inline SVG nodes in React, morphing paths with CSS transitions or simple web-animation APIs, driven by sentiment-expression parameters from the LLM.
**Rationale:**
- Keeps the application lightweight. Heavy 3D rendering engines (Three.js, Unity, or Live2D Web SDK) introduce massive package bloat (>5MB JS bundle size) and high GPU/memory overhead.
- SVG paths can be easily modified programmatically to handle blinking, mouth movements (lip-syncing), and custom expressions (smile, smirk, sad, confused) with very clean visual styling matching the dark-mode aesthetic.
- Zero external assets or proprietary binaries required.

**Rejected:** Live2D Cubism SDK (heavy, complex licensing), Three.js 3D models (too heavy for a simple popup app).

---

## D-011: Global Shortcut and Tray Window Behavior
**Decision:** Configure the Tauri app as a tray-only or tray-primary helper application. Use `global-shortcut` or Tauri's native tray window management to capture hotkeys and toggle visibility.
**Rationale:**
- Creates a seamless "Spotlight/Raycast-like" user experience.
- Hides the dock/taskbar icon if desired, keeping the user's desktop workspace clean.
- The window maintains a fixed width and is styled as a right-aligned sliding panel or center HUD popup.

**Rejected:** Standard persistent desktop window (too bulky for quick reference and entry).

