# ATLAS MASTER ROADMAP & AGENTIC EXECUTION PROMPT
## The Complete Blueprint to Build a Local, Agentic "Mirror Alexa / J.A.R.V.I.S." Digital Twin

---

## Implementation Status (Live)

| Phase | Status | Commit | Description |
|---|---|---|---|
| Phase 1: Adaptive Onboarding | ✅ **COMPLETE** | `9bf7ac8` | 21-question MCQ `PersonalityCloner.tsx`, live OCEAN/MBTI bars, `save_onboarding_profile` IPC, SQLCipher persistence |
| Phase 2: Mirror Persona Chat | ✅ **COMPLETE** | `114f0ba` | `get_mirror_system_prompt` IPC wired to `ChatPanel.tsx`, Ollama integration, hybrid memory reranking, `inferAvatarState` sentiment-driven avatar |
| Phase 3: Agentic OS Control | ✅ **COMPLETE** | `63031df` | `agentic.rs` — play_music, launch_app, open_folder, control_volume, run_command, search_web. `<TOOL_CALL>` parsing in ChatPanel. Tool schema injected into Ollama system prompt. |
| Phase 4: Local Voice + Whisper | ✅ **COMPLETE** | `2977484` | Global hotkey push-to-talk `VoiceBar.tsx`, `cpal` recording, `/api/transcribe` local Ollama Whisper pipeline |
| Phase 5: Glassmorphism Polish | ✅ **COMPLETE** | `pending_commit` | Premium UI, micro-animations, first-run showcase demo flow (`FirstRunShowcase.tsx`) |

---

## Part 1: Can You Build a Local, Agentic "Alexa / J.A.R.V.I.S." That Controls Your Computer?

**YES — absolutely, definitively, and with far more power than any cloud-based assistant like Amazon Alexa or Siri.**

### Why Atlas (Tauri + Rust) is the Ultimate Foundation for Local Agentic Control:
Cloud assistants (Alexa/Siri) are restricted to whatever APIs Amazon or Apple expose over the internet. Because **Atlas runs locally as a native desktop application built on Tauri (Rust + TypeScript)** on your Windows machine, it has direct access to your operating system via Rust's standard libraries (`std::process::Command`) and native Windows system crates:

1. **Media & Music Control (`enigo` / Windows Media Keys / `open` crate):**
   - Play/Pause/Skip tracks on Spotify, Apple Music, or YouTube via virtual media keypresses or URI schemes (`open::that("spotify://")`).
   - Adjust system volume or mute audio.
2. **Application & File System Launcher:**
   - Launch development environments (`code .`, Terminal, Discord, Chrome with specific URLs).
   - Search, organize, read, or move local files across your workspace and desktop.
3. **Automated Workflow Execution:**
   - Run local Git commands (`git status`, `git commit`), run tests, or check system diagnostics.
4. **The "Mirror Persona" Difference:**
   - When you say: *"Atlas, play some chill beats and open VS Code, let's get to work."*
   - A generic Alexa replies: *"Opening Spotify and Visual Studio Code."*
   - **Atlas (powered by our `persona_engine.rs`) replies:** *"Got you ok bhai, throwing on your chill beats and booting up VS Code—let's lock in and crush this module."* while the animated `AvatarFace` transitions from `LISTENING` → `THINKING` → `SPEAKING` → executing the Rust tool calls.

---

## Part 2: Comprehensive Architecture Audit — What Is Built & Verified (`100% Done`)

Before starting the remaining phases, here is the exact state of what is already written, verified, and compiling cleanly inside the codebase:

### 1. Backend Database & Vector Schema (`src-tauri/src/graph/schema.rs`) — **COMPLETED**
- **`nodes` & `edges`**: Full directed graph storage for memory, concepts, and relationships.
- **`embeddings_metadata` & `node_embeddings` (`vec0` virtual table)**: Native `sqlite-vec` 384-dimensional vector indexing.
- **`persona_dna`**: Stores normalized traits, confidence weights, OCEAN/MBTI markers, and exact provenance (`questionnaire`, `behavioral_voice`, `behavioral_git`, `behavioral_chat`, `decision_log`).
- **`relationship_addressing`**: Stores tiered relationship customs (`ok bhai`, `yaar`, `bhai`) and dynamic tone shifts.
- **`interview_responses` & `behavioral_evidence_log`**: Preserves raw multi-format onboarding answers and continuous behavioral drift.

### 2. Mirror Persona & Reranking Engine (`src-tauri/src/graph/persona_engine.rs`) — **COMPLETED**
- **`compile_mirror_persona_prompt()`**: The **Terse Distillation Engine**. Solves the `PersonaChat / ConvAI2` and `PersonalityEdit` research problem by pulling only top high-confidence traits (`slang`, `tone`, `decision heuristics`) and compiling a concise 6–8 line bulleted prompt so local 8B models (`llama3.1:8b` / `qwen3:8b`) stay consistent without fatigue or drift.
- **`persona_rerank()`**: Hybrid vector retrieval formula:
  $$\text{Final Score} = (\text{Semantic Sim} \times 0.55) + (e^{-\lambda \cdot \Delta t} \times 0.30) + (\text{Persona Affinity} \times 0.15)$$
- **`resolve_addressing_context()`**: Dynamically resolves how Atlas addresses the user (`ok bhai`) and greets them (`yaar`) based on relationship tier.

### 3. Native Embedding & Vector Search (`src-tauri/src/embed.rs`) — **COMPLETED**
- Native `sqlite-vec` (`vec0`) KNN similarity search (`MATCH ? AND k = ?` on `ne.distance`) + local ONNX embedding inference (`bge-small-en-v1.5`).

### 4. Avatar State Animation Driver (`src/utils/inferAvatarState.ts`) — **COMPLETED**
- Real-time sentiment and sarcasm detector (`"oh sure"`, `"right, because"`, `"obviously"`, `"bhai seriously"`) driving `AvatarFace.tsx` (`NEUTRAL`, `LISTENING`, `THINKING`, `SPEAKING`, `SASSY`).

---

## Part 3: What Is Pending — The 5 Sequential Build Phases to a Showstopper Product

To turn Atlas into a complete, jaw-dropping, production-grade personal digital twin and agentic OS controller that you can proudly show off, we must execute **5 logical phases in exact order**.

```
+-----------------------------------------------------------------------------+
| PHASE 1: Adaptive Onboarding UI (26 Core Questions -> PersonalityCloner.tsx)|
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| PHASE 2: IPC Bridge & Live Chat Integration (ChatPanel.tsx + lib.rs bridge) |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| PHASE 3: Agentic OS Control & Alexa Tool Engine (agentic.rs Rust execution) |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| PHASE 4: Local Voice & Acoustic Loop (audio.rs + cpal + local Whisper)      |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| PHASE 5: Showstopper Polish, Glassmorphism UI & Final Demo Walkthrough      |
+-----------------------------------------------------------------------------+
```

---

## Part 4: Master Execution Prompts (Copy & Feed to Build Each Phase)

Whenever you are ready to build the next phase, copy the corresponding block below and feed it directly as your prompt. Each prompt contains all exact context, file paths, and technical criteria required.

---

### Phase 1 Prompt: The Adaptive 26-Question Onboarding Screen (`PersonalityCloner.tsx`)

```markdown
# TASK: Implement `PersonalityCloner.tsx` — The 26-Question Adaptive Behavioral Onboarding UI

## Context & Architecture
We have our official behavioral onboarding instrument documented in `docs/BEHAVIORAL_EVIDENCE_ENGINE.md` and our Rust backend database schema inside `src-tauri/src/graph/schema.rs` (`persona_dna`, `relationship_addressing`, `interview_responses`). Following the `PersonaChat` and `TwinVoice` research lessons, we are implementing a sleek, conversational 26-question core set that extracts high-signal scorable traits without user fatigue.

## Requirements
1. Create `src/components/PersonalityCloner.tsx` as an interactive, split-screen onboarding flow:
   - **Left Panel (Conversational Interviewer):** Renders the animated `AvatarFace.tsx` at the top with a chat bubble presenting questions one by one. Supports multiple response formats:
     - Forced Choice / Scenario MCQs (Buttons A/B/C/D with confidence slider 60%-100%).
     - Pairwise Choice (Two bold option cards).
     - Idiolect / Slang Text Input (For extracting `ok bhai`, `yaar`, and signature phrases).
   - **Right Panel (Live Behavioral Case File):** As the user answers, dynamically updates:
     - Live OCEAN trait progress bars (`Openness`, `Conscientiousness`, `Extraversion`, `Agreeableness`, `Neuroticism`).
     - MBTI & Cognitive lean axis indicators (`System 1 Intuition vs System 2 Analysis`, `Directness vs Diplomacy`).
     - Live Extraction Log showing exact latent trait updates (`+2.0 Brutal Honesty`, `-1.5 Agreeableness`).
2. Implement exact question flows for the 26 core items (e.g., Q1 Feedback Gap, Q2 Planning Style, Q21 Addressing Best Friend, Q22 Addressing Self `ok bhai`, Q35 Signature Phrases, Q51 Gut vs Data, Q68 Humor Style).
3. At completion, compile the extracted JSON profile (`persona_dna.json` + `relationship_addressing.json`) and call a Tauri IPC command (`save_onboarding_profile`) to persist rows directly into `persona_dna`, `relationship_addressing`, and `interview_responses` via `SQLCipher`.
4. Add a "Test My Clone" preview button that shows what the `compile_mirror_persona_prompt` output looks like based on their answers!
```

---

### Phase 2 Prompt: IPC Bridge & Live Chat Persona Injection (`ChatPanel.tsx`)

```markdown
# TASK: Connect `ChatPanel.tsx` to `persona_engine.rs` via Tauri IPC for Live Mirror Chat

## Context & Architecture
Our Rust backend (`src-tauri/src/graph/persona_engine.rs`) has `compile_mirror_persona_prompt()` and `persona_rerank()`. Our UI (`src/utils/inferAvatarState.ts`) has sentiment-driven avatar animation. We now need to wire the chat interface (`ChatPanel.tsx`) so every message naturally embodies the user's exact persona and addressing (`ok bhai`, `yaar`).

## Requirements
1. In `src-tauri/src/lib.rs`, register and expose two Tauri IPC commands:
   - `#[tauri::command] async fn get_mirror_system_prompt(tier: Option<String>, vault: State<'_, Arc<VaultManager>>) -> Result<String, AtlasError>` which calls `compile_mirror_persona_prompt`.
   - `#[tauri::command] async fn rerank_context_memories(candidates: Vec<MemoryCandidate>, vault: State<'_, Arc<VaultManager>>) -> Result<Vec<RerankedMemory>, AtlasError>` which calls `persona_rerank`.
2. Update `src/components/ChatPanel.tsx`:
   - On chat session start, call `get_mirror_system_prompt(relationship_tier)` and set it as the system prompt sent to local Ollama (`llama3.1:8b` / `qwen3:8b`).
   - When the user types a message (`query`), first call `search_graph_vector` (`sqlite-vec` KNN) to retrieve candidate nodes, pass them through `rerank_context_memories`, and append the top 3 reranked memories to the Ollama prompt context.
3. Hook `inferAvatarState(response, isGenerating, isListening)` directly into the `AvatarFace` component rendered inside `ChatPanel.tsx` so the head dynamically shifts between `THINKING` during stream generation, `SPEAKING` during output, and `SASSY` when sarcasm is detected!
```

---

### Phase 3 Prompt: Agentic OS Control & Alexa Tool Engine (`agentic.rs`)

```markdown
# TASK: Implement `agentic.rs` — Native Windows OS Automation & Tool Execution for Local Alexa/J.A.R.V.I.S.

## Context & Architecture
To make Atlas a true local agentic assistant (like J.A.R.V.I.S. or Alexa, but running locally in Rust with our mirror persona tone), we need a secure tool execution engine (`src-tauri/src/agentic.rs`) that can receive structured JSON commands from Ollama and execute native OS actions on Windows.

## Requirements
1. Create `src-tauri/src/agentic.rs` implementing `AgenticToolExecutor`:
   - **`execute_tool(tool_name: &str, params: serde_json::Value) -> Result<String>`** supporting:
     - `play_music`: Uses `open::that("spotify://")` or Windows Virtual Key events (`VK_MEDIA_PLAY_PAUSE`, `VK_MEDIA_NEXT_TRACK`) via `enigo` or `winapi` to start/control music playback.
     - `launch_app`: Launches standard development applications (`VS Code`, `Terminal`, `Discord`, `Chrome`) via `std::process::Command`.
     - `control_volume`: Adjusts system master volume (`mute`, `set_level`) via Windows Core Audio APIs or powershell bridge.
     - `open_folder` / `find_file`: Opens specific directories or searches workspace files.
2. In `ChatPanel.tsx` and `persona_engine.rs`, append a **System Tool Definition Schema** telling Ollama:
   *"You can execute local PC actions by replying with a JSON tool call block enclosed in `<TOOL_CALL>{"tool": "play_music", "playlist": "chill"}</TOOL_CALL>`. When doing so, also speak to the user in your natural mirror tone ('Got you ok bhai, putting on your beats now')."*
3. In `ChatPanel.tsx`, parse incoming LLM stream outputs for `<TOOL_CALL>` blocks, strip them from the displayed chat bubble, and call the Tauri IPC command `execute_agentic_tool` to execute the native action in Rust while `AvatarFace` shifts to `SPEAKING`!
```

---

### Phase 4 Prompt: Local Voice & Acoustic Loop (`audio.rs` + Local Whisper)

```markdown
# TASK: Implement Real-Time Local Voice Capture & Acoustic Transcription (`audio.rs`)

## Context & Architecture
An Alexa/J.A.R.V.I.S. assistant needs natural voice interaction without sending audio to the cloud. We have `audio.rs` in our Rust backend; we will finalize local voice capture and connect it to our persona-driven chat and tool engine.

## Requirements
1. Finalize `src-tauri/src/audio.rs` to record microphone audio via `cpal` when triggered by a global hotkey (`Ctrl+Shift+Space`) or push-to-talk button on the UI.
2. Integrate local transcription (via `whisper-small.onnx` or local local REST endpoint if Ollama/Whisper is running) to convert speech to text in $<1$ second.
3. Connect the transcribed text directly to `ChatPanel.tsx` and `inferAvatarState.ts`:
   - While recording, `AvatarFace` glows emerald in `LISTENING` state.
   - On completion, transcription feeds directly to our `persona_engine.rs` -> Ollama -> `execute_agentic_tool` pipeline!
```

---

### Phase 5 Prompt: Glassmorphism UI Polish & Showstopper Demo Flow

```markdown
# TASK: Polish Atlas into a Showstopper Premium UI (Glassmorphism, Animations & Demo Walkthrough)

## Context & Architecture
We have built all underlying engines: Behavioral Evidence Onboarding (`PersonalityCloner.tsx`), Mirror Persona Chat (`ChatPanel.tsx`), Agentic PC Control (`agentic.rs`), and Voice Capture (`audio.rs`). Now we polish the aesthetics to wow users at first glance (`web_application_development` best practices).

## Requirements
1. Upgrade `App.tsx` and core CSS with premium modern dark-mode glassmorphism (`backdrop-blur-md`, subtle vibrant HSL border glows `#7DD3FC` / `#A78BFA`, smooth layout transitions).
2. Add micro-animations for `AvatarFace` transitions when shifting between onboarding, chat, and OS automation.
3. Create a seamless, polished **"First Run Showcase Mode"** that transitions from:
   - Unlock Vault (`SQLCipher`) →
   - 26-Question Adaptive Behavioral Onboarding (`PersonalityCloner`) →
   - Live Mirror Chat where Atlas addresses you as `ok bhai`, uses your slang, and executes an agentic music/app launch command right before your eyes!
```
