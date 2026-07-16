# 🌐 Atlas Identity OS
### The Local-First, Zero-Knowledge Neural Identity Operating System

<div align="center">
  <p>
    <b>Transform your scattered digital footprints into an evolving, time-aware, encrypted personal intelligence engine.</b>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Tauri-v2.0-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri v2" />
    <img src="https://img.shields.io/badge/Rust-Edition%202021-DEA584?style=for-the-badge&logo=rust&logoColor=black" alt="Rust" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/SQLCipher-256--bit%20AES-10B981?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLCipher AES-256" />
    <img src="https://img.shields.io/badge/ONNX%20Runtime-Local%20Embeddings-8B5CF6?style=for-the-badge&logo=onnx&logoColor=white" alt="ONNX Runtime" />
  </p>
</div>

---

## 💎 Executive Overview: Identity Over Information

Traditional productivity tools and RAG search engines treat your thoughts like static, flat files inside a filing cabinet. When you ask a generic chat interface about your past decisions or habits, it suffers from hindsight bias and lacks deep structural context.

**Atlas Identity OS** fundamentally redefines human-computer interaction by modeling **identity over information**. By continuously observing your notes, voice reflections, codebases, and conversations entirely offline, Atlas constructs a dynamic, version-controlled **Identity Graph** paired with a mathematical **Vector Similarity Index (`sqlite-vec`)** inside a zero-knowledge encrypted vault.

Whether you want to query your exact mindset from six months ago, visualize how a random conversation sparked a major architectural decision, or interact with a candid **Mirror Persona** that reflects your true communication style, Atlas serves as an uncompromising, sovereign extension of your mind.

---

## ⚡ Core Architectural Pillars

```
+-----------------------------------------------------------------------------------+
|                                 ATLAS DESKTOP OS                                  |
|                                                                                   |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  |  Interactive Face  |   | Chronological Feed  |   | Interactive Neural Graph |  |
|  |  (Lip-Sync / Sass) |   |  (Timeline Query)   |   |   (Circular Hub Canvas)  |  |
|  +---------+----------+   +----------+----------+   +------------+-------------+  |
|            |                         |                           |                |
|            +-------------------------+---------------------------+                |
|                                      |                                            |
|  +-----------------------------------v-----------------------------------------+  |
|  |                      TAURI IPC & RUST CORE ENGINE                       |  |
|  +-----------------------------------+-----------------------------------------+  |
|                                      |                                            |
|       +------------------------------+-------------------------------+            |
|       |                              |                               |            |
|  +----v--------------------+  +------v--------------------+  +-------v---------+  |
|  |   SQLCipher AES-256     |  |     ONNX Vector Engine    |  |  Audio & Files  |  |
|  | (Graph Nodes & Edges)   |  | (`bge-small-en-v1.5.onnx`)|  | (`cpal`/`notify`)|  |
|  +-------------------------+  +---------------------------+  +-----------------+  |
+-----------------------------------------------------------------------------------+
```

### 1. 🛡️ Zero-Knowledge Encrypted Vault (`SQLCipher AES-256`)
- **Sovereign Security:** Your identity is stored inside a single, highly secure `atlas.db` file encrypted at rest via **SQLCipher 256-bit AES**.
- **RAM Protection:** Master passphrases undergo strict key derivation (`PBKDF2`/`Argon`-style hashing) and are kept in transient, locked memory buffers that are instantly wiped upon locking or quit.
- **Spotlight Auto-Hide:** Pressing `Alt + Space` globally summons or dismisses the Atlas sidekick window. Pressing `Esc` instantly blurs and conceals your data from prying eyes.

### 2. 🧠 Local ONNX Vector Engine & Similarity Search (`sqlite-vec`)
- **100% Offline Inference:** Atlas embeds thoughts, notes, and transcripts using local ONNX inference (`bge-small-en-v1.5.onnx`) directly inside your app data directory (`vec0` virtual table).
- **Sub-100ms k-NN Queries:** When you chat or query your memories, the Rust backend executes lightning-fast cosine similarity searches across thousands of historical entries without sending a single byte to external cloud APIs.

### 3. 🕸️ Graph Traversal & Chronological Timeline Engine
- **Directed Graph Relationships:** Every entry is stored as a typed `TimelineNode` (`chat`, `voice_note`, `observed_file`, `git_commit`) linked to neighbors via explicit `GraphEdge` relationships (`similar`, `references`, `derived_from`).
- **Interactive Visual Canvas:** Explore your ideas visually using the built-in Canvas/SVG circular hub layout. Watch your identity network expand dynamically as new nodes form clusters around recurring topics.

### 4. 🎙️ Real-Time Voice Diary & Filesystem Watcher
- **Hardware Microphone Capture (`cpal`):** Record raw audio reflections right from your desk. Audio streams are captured directly into `.wav` buffers inside your encrypted vault directory.
- **Background File Watcher (`notify`):** Designate local folders (`C:\Users\Admin\Atlas-Observed` or custom directories) where Markdown notes, code files, and diaries are ingested and vectorized automatically upon save.

### 5. 🤖 3D Apple Memoji / Snapchat Bitmoji Character Engine (`AvatarFace.tsx`)
- **Expressive 3D Avatar UI:** Centered right in your workspace is a high-tech, vibrant 3D character face styled after Apple Memoji and Snapchat Bitmoji. Featuring 3D radial skin gradients, cyber headset gear, holographic irises, and real-time cheek blush (`feGaussianBlur`).
- **Dynamic Lip-Sync & Micro-Animations:** Watch your sidekick blink naturally (`NEUTRAL`), widen its eyes while pulsing audio rings (`LISTENING`), squint during heavy neural inference (`THINKING`), and sculpt dynamic lip-sync mouth paths (`SPEAKING`).
- **Candid Mirror Persona & Smirk Expressions:** Toggle Mirror Persona mode for sharp candor, confident raised-cheek smirks (`SASSY` / The Rock high-arch eyebrow), and unfiltered answers tailored directly to your personality traits.
- **Outbound Telegram Bot API:** Connect your personal `@BotFather` token and `chat_id` (`5552327622`) inside secure storage (`settings_secure`) to push real-time summaries and reminders directly to your mobile phone.

---

## 🖥️ Feature Suite & User Experience

| Page / Tab | Description | Key Capabilities |
| :--- | :--- | :--- |
| **✨ Avatar & Chat** | Your conversational sidekick | 3D Apple Memoji / Snapchat Bitmoji animated character face, Voice Diary recorder (`cpal`), vector similarity recall, and Telegram outbound config. |
| **⏳ Timeline Feed** | Chronological identity ledger | Filter pills (`ALL`, `💬 chat`, `🎙️ voice_note`, `📄 observed_file`), version tracking (`v1`), and neighborhood edge drilldowns. |
| **🕸️ Network Canvas** | Visual neural graph | Glowing circular hub nodes, directed relationship lines (`source -> target`), and click-to-inspect payload inspector. |
| **⚙️ Settings** | Security & system control | Lock vault button, SQLCipher vector stats (`embeddings_metadata`), real-time `notify` directory watcher management, and one-click database backup snapshot (`atlas.db`). |
| **🛠️ Backend Engines** | Diagnostic verification suite | Test cards for ONNX vector storage, background directory events, and live SQLite-vec k-NN nearest neighbor verification. |

---

## 🛠️ Technology Stack

Atlas is engineered from the ground up using a modern, high-performance systems architecture:

- **Desktop Framework:** [Tauri v2.0](https://v2.tauri.app/) (Ultra-lightweight webview container with native Rust IPC)
- **Core Engine:** Rust (Edition 2021) with `tokio` async runtime
- **Frontend UI:** React 18, TypeScript, Vanilla CSS (Design Tokens & Glassmorphism)
- **Database & Vectors:** `rusqlite` + `SQLCipher` (256-bit AES encryption) + `sqlite-vec` (`vec0` virtual table)
- **Audio Processing:** `cpal` (Cross-platform Audio Library for raw PCM stream capture)
- **Filesystem Observation:** `notify` (Real-time OS directory event watcher)
- **Outbound Networking:** `reqwest` (Asynchronous HTTP client for Telegram Bot API push notifications)

---

## 🚀 Quickstart & Installation

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (`v18+`) and `npm`
- **Rust Toolchain** (`rustc`, `cargo`, `rustup` via [rustup.rs](https://rustup.rs/))
- **C/C++ Build Tools** (Visual Studio C++ Build Tools on Windows, `build-essential` on Linux, Xcode Command Line Tools on macOS)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Kshitiz-Khandelwal/Atlas-ai-personal-timeline-.git
cd Atlas/atlas-app
npm install
```

### 2. Run in Development Mode
To launch the desktop app with live reload enabled for both the React frontend and Rust backend:
```bash
npm run tauri dev
```

### 3. Build Production Binary
To compile an optimized, self-contained desktop installer (`.msi` / `.exe` on Windows, `.app` on macOS):
```bash
npm run tauri build
```
The compiled binaries will be generated inside `atlas-app/src-tauri/target/release/bundle/`.

---

## 🔒 Security & Privacy Guarantees

1. **Air-Gapped by Default:** With the exception of explicit user-enabled Outbound Telegram push notifications, Atlas performs zero external network calls. No cloud sync, no tracking pixels, and no telemetry.
2. **Encrypted at Rest:** Your entire digital life (`atlas.db`) is locked behind SQLCipher. Opening the file in a hex viewer yields pure pseudo-random encrypted bytes.
3. **Instant Memory Sanitation:** When the vault is locked (`Alt+Space` or `Esc` -> Lock), the decryption key is purged from local application RAM immediately.

---

## 📚 Architectural Specification Index

This repository includes exhaustive engineering documentation outlining the foundational design theories and execution plans:

- **[01_PRD.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/01_PRD.md):** Product Requirements Document detailing target personas, user stories, and acceptance criteria.
- **[02_UX_AND_APP_FLOW.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/02_UX_AND_APP_FLOW.md):** Complete UI/UX specification, journey maps, and wireframe blueprints.
- **[03_TRD.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/03_TRD.md):** Technical Requirements Document detailing Tauri IPC endpoints, Rust engine loops, and ONNX models.
- **[04_DATABASE_DESIGN.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/04_DATABASE_DESIGN.md):** SQLCipher schema layout, generalization hierarchies, and `sqlite-vec` definitions.
- **[05_DESIGN_SYSTEM.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/05_DESIGN_SYSTEM.md):** Design tokens, typography guidelines, and animation micro-behaviors.
- **[06_IMPLEMENTATION_PLAN.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/06_IMPLEMENTATION_PLAN.md):** Step-by-step phased execution roadmap and verification milestones.
- **[07_ARCHITECTURE_BIBLE.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/07_ARCHITECTURE_BIBLE.md):** Deep engineering theories, temporal graph acyclic rules, and hybrid scoring algorithms.
- **[AI_HANDOFF.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/AI_HANDOFF.md):** Comprehensive developer onboarding guide and IPC command cheat sheet.

---

<div align="center">
  <p><b>Built with precision, candor, and uncompromising privacy for sovereign personal intelligence.</b></p>
  <p>© 2026 Atlas Identity OS Engineering Team</p>
</div>
