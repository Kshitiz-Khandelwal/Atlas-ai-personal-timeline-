# Atlas Identity OS — 4 Master Research & Build Prompts

> These are detailed, standalone prompts. Each one can be fed into an AI research assistant, given to a developer, or used to search GitHub/arXiv/Papers With Code for existing implementations. They are written to be self-contained — no prior context needed.

---
---

# PROMPT 1: BEHAVIORAL EVIDENCE ENGINE & MULTI-SOURCE PERSONA GRAPH
## The Adaptive Behavioral Onboarding — Science, Evidence Formats & Latent Scoring

---

**Objective:** Research and design an adaptive **Behavioral Evidence Engine** that builds a dynamic, multi-source **Persona Graph** (`persona_dna` table & latent vector profile) for Atlas. Instead of relying on traditional self-report questionnaires where users describe how they wish or think they behave, this engine extracts **concrete behavioral evidence** from situational judgment tests, forced tradeoffs, memory recall, contradiction validation, and continuous multi-modal observation (voice, git, chat, decisions, writing idiolect).

**Core Paradigm Shift: Evidence > Opinion.**
Research over the last two years consistently demonstrates that people are unreliable narrators of their own personality. They report ideal or socially expected traits rather than actual behavioral tendencies. To ground an LLM (llama3.1:8b / qwen3:8b) so that it genuinely replicates the user's authentic inner monologue and reasoning heuristics, every onboarding question and ongoing observation must produce verifiable or situational **behavioral evidence**.

---

### Foundational Research & Academic Grounding

**Primary Literature to Reference & Build Upon:**
- **PersonaLLM (NAACL 2024 Findings):** Demonstrates that LLMs can consistently express assigned personalities only when the persona is properly grounded in concrete behavioral parameters rather than high-level adjective descriptions.
- **BIG5-CHAT (ACL 2025):** Shows that dialogue-based and situational human-grounded behavioral data produces dramatically more realistic, stable LLM personas than static prompt summaries.
- **Nature Machine Intelligence (2025):** Proposes a psychometric framework for measuring and shaping LLM personality across multiple observed behavioral signals and latent trait vectors rather than flat survey scores.
- **LMLPA: Language Model Linguistic Personality Assessment (Computational Linguistics 2025):** Assesses personality directly through linguistic idiolect, syntax, lexical choice, and interaction drift rather than fixed questionnaires.
- **PersonalityChat (ACL 2023):** Conversation distillation for personalized dialogue modeling combining verified facts with latent behavioral traits.
- **Psychometric Critique of Big Five in LLMs (arXiv 2026: 2607.02325):** Warns against relying purely on standard Big Five self-report items because they miss critical dimensions of actual behavioral heuristics and situational variance.
- **Kahneman's Cognitive Systems (System 1 vs. System 2):** Quantifying gut-reaction velocity vs. analytical deliberation thresholds under uncertainty.

---

### 8 Scientifically Validated Evidence / Question Formats

Instead of a flat Q&A or standard Likert scale, the onboarding engine uses **8 distinct evidence formats** designed to eliminate self-report bias, force trade-offs, extract priorities, and measure confidence:

#### 1. Forced Choice MCQs (Validated constructs from BFI-2, IPIP, HEXACO)
Presents concrete ethical or social dilemmas where every option corresponds to a distinct latent trait direction.
*Example:* Someone shares confidential information with you.
- **A.** Keep it private (`Agreeableness +1`, `Trust +2`)
- **B.** Tell only my closest friend (`Boundary_Selective +2`)
- **C.** Depends on who asks (`Machiavellian_Pragmatism +1`)
- **D.** If it benefits me, I'd share it (`Honesty-Humility -2`)

#### 2. Scenario-Based MCQs / Situational Judgment Tests (SJTs)
Inspired by behavioral selection frameworks (Google, Microsoft, Military, Medical Schools) to test real-world conflict and execution reflexes.
*Example:* Your teammate submits terrible work one day before the deadline. What do you do?
- **A.** Redo it yourself (`Conscientiousness +2`, `Delegation -2`, `Anxiety +1`)
- **B.** Tell them directly it's unacceptable (`Brutal_Honesty +3`, `Agreeableness -1`)
- **C.** Inform your manager (`Institutional_Reliance +2`)
- **D.** Submit it anyway (`Conscientiousness -3`, `Conflict_Avoidance +2`)

#### 3. Ranking Questions (Priority Extraction)
Eliminates "I want everything" by forcing strict ordinal ranking of competing values.
*Example:* When choosing a project or career move, rank from most to least important: `[Salary, Impact, Freedom, Recognition, Learning]`.
Extracts relative utility weights for decision advice.

#### 4. Pairwise Choice (Bias Reduction)
Reduces cognitive load and social desirability bias through direct head-to-head comparisons.
*Example:* Which sounds more like you in a crisis?
- **A.** "I prefer immediate certainty, even if incomplete."
- **B.** "I comfortable navigating prolonged uncertainty until all facts emerge."

#### 5. Memory Recall (Cognitive & Behavioral Memory Anchoring)
Grounds traits in actual episodic memory rather than abstract self-assessment.
*Example:* Instead of asking "Are you patient?", ask: *"Tell me about the last time someone wasted your time. What happened? How did you react in the room? How long did it take you to stop thinking about it afterwards?"*
Extracts real recovery latency (`emotional_closure_speed`) and actual conflict behavior.

#### 6. Prediction Questions (Self-Awareness & Blind Spot Mapping)
Asks the user to predict how an external observer would rate them.
*Example:* *"If your closest friend answered this questionnaire about your temper under stress, what option would they pick?"*
Comparing self-rating vs. predicted external rating measures `self_awareness_gap` and blind spots.

#### 7. Contradiction Detection (Internal Consistency & Drift Validation)
Cross-checks asserted values against concrete scenario responses placed later in the flow.
*Example:* Early item: *"I never compromise on truth."* Later SJT (Q81): *"Your mother asks if you like the food she spent 4 hours cooking, but it's overcooked."*
If answers conflict, the engine does not reject either; instead, `confidence` on absolute honesty decreases while `situational_diplomacy` increases.

#### 8. Confidence Questions (Metacognitive Data)
Attached to high-stakes decisions and moral dilemmas: *"How confident are you that you would actually act this way in real life?"* `[100% | 80% | 60% | Guessing/Hopeful]`.
Confidence itself becomes a multiplier on latent vector updates (`latent_update = raw_weight * confidence_factor`).

---

### Latent Trait Multi-Update Schema

Every answer does not simply store a string; it emits a **JSON Latent Trait Update Vector** that shifts multiple dimensions simultaneously across the user's `persona_dna` profile:

```json
// Example answer payload for Scenario MCQ (Teammate bad work -> B: Tell directly)
{
  "question_id": "SJT_014",
  "chosen_option": "B",
  "confidence_rating": 0.80,
  "latent_updates": {
    "brutal_honesty": +3.0,
    "agreeableness": -1.5,
    "conflict_confrontation_speed": +2.5,
    "leadership_directness": +2.0,
    "decision_confidence": +1.0
  }
}
```

---

### Adaptive Questionnaire Organization (~200 Total Pool, ~100-120 Adaptive Path)

The engine organizes ~200 items across 11 behavioral dimensions, dynamically pruning questions when high-confidence clusters emerge:

| Module | Dimension | Pool Size | Adaptive Target | Core Constructs Extracted |
|:---|:---|:---:|:---:|:---|
| **M01** | **Identity & Core Values** | 25 | ~15 | OCEAN anchors, Enneagram fears, non-negotiables |
| **M02** | **Decision Making & Risk** | 20 | ~12 | Risk tolerance, time horizon, System 1/2 heuristics |
| **M03** | **Communication & Tone** | 25 | ~15 | Formality, length, hedging, directness vs. diplomacy |
| **M04** | **Relationships & Addressing** | 25 | ~15 | Tiered addressing (`ok bhai`, `yaar`), attachment style |
| **M05** | **Humor Profile** | 15 | ~8 | Dry, dark, absurd, self-deprecating, boundaries |
| **M06** | **Morality & Ethics** | 20 | ~10 | Honesty-humility, ethical pragmatism, rule adherence |
| **M07** | **Work Style & Execution** | 20 | ~12 | Procrastination triggers, focus endurance, delegation |
| **M08** | **Creativity & Aesthetic DNA**| 15 | ~8 | Niche vs. broad taste, artistic influences, music/visual |
| **M09** | **Emotional Regulation** | 20 | ~10 | Recovery latency, pressure shift, venting reaction |
| **M10** | **Memory Recall Anchors** | 20 | ~10 | Verbatim stories of past conflict, triumph, and regret |
| **M11** | **Contradiction Validation** | 15 | ~5 | Cross-checks on self-image vs. situational behavior |

---

### Multi-Source Persona Graph (Continuous Behavioral Evidence)

Onboarding is only the initialization phase (`source = 'questionnaire'`). The true power of Atlas Identity OS comes from **continuous multi-source evidence fusion**, creating a living **Persona Graph** where observations continuously recalibrate trait confidence:

1. **Questionnaire Evidence (`questionnaire`):** Baseline latent initialization from the 8 question formats.
2. **Conversation Analysis (`behavioral_chat`):** Live monitoring of user messages to Atlas (LSM linguistic matching, vocabulary tier, hedging frequency, tone drift).
3. **Writing Samples & Idiolect (`writing_sample`):** Parsing signature phrases, regional slang, syntax structure, and message length patterns across imported documents or notes.
4. **Voice Diary & Acoustic Signals (`behavioral_voice`):** cpal audio capture transcribed via `whisper-small.onnx` — extracting speech rate (WPM), emotional valence, sigh/frustration markers, and unprompted candid reflections.
5. **Decision History & Action Logs (`decision_log`):** Comparing what the user *said* they would do in a scenario vs. what they *actually* chose when Atlas presented options or tasks during daily workflow.
6. **Git & Code Activity (`behavioral_git`):** Commit timestamps (2 AM night worker vs. morning disciplined), force-push iterations (perfectionism vs. rapid shipping), commit message tone.
7. **Calendar & Habit Patterns (`calendar_habit`):** Meeting density handling, procrastination windows, deep focus block execution.

---

### Database Schema — Behavioral Evidence Engine (SQLCipher)

```sql
-- Core Persona DNA Table (Stores normalized traits + confidence + source tracking)
CREATE TABLE IF NOT EXISTS persona_dna (
    id TEXT PRIMARY KEY,
    trait_category TEXT NOT NULL,    -- 'tone' | 'slang' | 'decision' | 'humor' | 'values' | 'relationship' | 'cognitive' | 'ocean_summary'
    trait_key TEXT NOT NULL,         -- e.g. 'formality_level', 'sarcasm_score', 'gut_vs_data', 'humor_style', 'risk_tolerance'
    trait_value TEXT NOT NULL,       -- human-readable extracted value or verbatim evidence summary
    trait_score REAL,                -- normalized 0.0-1.0 or latent score
    ocean_dimension TEXT,            -- 'O' | 'C' | 'E' | 'A' | 'N' if applicable
    mbti_axis TEXT,                  -- 'I/E' | 'N/S' | 'T/F' | 'J/P' if applicable
    enneagram_type INTEGER,          -- 1-9 if applicable
    confidence REAL DEFAULT 0.8,     -- extraction confidence; dynamically updated across evidence sources
    source TEXT DEFAULT 'questionnaire', -- 'questionnaire' | 'behavioral_voice' | 'behavioral_git' | 'behavioral_chat' | 'decision_log'
    question_id TEXT,                -- which interview question or evidence event produced this row
    superseded_by TEXT,              -- id of newer row replacing this one (Module 5 / continuous resurvey)
    last_updated INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_persona_dna_category ON persona_dna(trait_category);
CREATE INDEX IF NOT EXISTS idx_persona_dna_key ON persona_dna(trait_key);
CREATE INDEX IF NOT EXISTS idx_persona_dna_current ON persona_dna(last_updated) WHERE superseded_by IS NULL;

-- Relationship Addressing Table (Tiered custom addressing rules)
CREATE TABLE IF NOT EXISTS relationship_addressing (
    id TEXT PRIMARY KEY,
    relationship_tier TEXT,          -- 'best_friend' | 'parent' | 'colleague' | 'junior' | 'romantic'
    person_name TEXT,                -- specific person if named
    how_i_address_them TEXT,         -- e.g. "yaar", "sir", "hey"
    how_they_address_me TEXT,        -- e.g. "bhai", "K", "ok bhai"
    greeting_style TEXT,             -- e.g. "Yo!", "Aye bhai!", "Hey"
    sign_off_style TEXT,             -- e.g. "catch you later", "ight"
    tone_shift TEXT,                 -- e.g. "10% more formal", "drop all filters"
    last_updated INTEGER
);
CREATE INDEX IF NOT EXISTS idx_relationship_tier ON relationship_addressing(relationship_tier);

-- Interview Responses Log (Preserves raw multi-format answers + latent vector updates)
CREATE TABLE IF NOT EXISTS interview_responses (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    module INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    raw_answer TEXT NOT NULL,
    evidence_format TEXT NOT NULL DEFAULT 'open', -- 'mcq' | 'sjt' | 'ranking' | 'pairwise' | 'recall' | 'prediction' | 'open'
    confidence_rating REAL DEFAULT 0.8,           -- user self-rated confidence (1.0, 0.8, 0.6, 0.3)
    latent_updates_json TEXT,                     -- JSON block of multi-trait latent updates e.g. {"risk_tolerance": +2, "agreeableness": -1}
    answered_at INTEGER NOT NULL
);

-- Continuous Behavioral Evidence Log (Logs multi-source drift & observations)
CREATE TABLE IF NOT EXISTS behavioral_evidence_log (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,       -- 'conversation_analysis' | 'writing_sample' | 'journal_entry' | 'decision_history' | 'calendar_habit'
    evidence_summary TEXT NOT NULL,
    extracted_traits_json TEXT NOT NULL, -- JSON block of latent updates
    confidence REAL NOT NULL,
    observed_at INTEGER NOT NULL
);
```

---
---

# PROMPT 2: MIRROR PERSONA ENGINE — EVIDENCE FUSION & SYSTEM PROMPT COMPILATION
## How Behavioral Evidence & Latent Traits Drive Real-Time LLM Monologue

---

**Objective:** Design and implement the complete technical pipeline (`persona_engine.rs`) that takes the `persona_dna` latent profile, relationship addressing rules, and multi-source behavioral evidence from Prompt 1, and injects them into every single interaction — LLM chat responses, Telegram push reminders, voice diary analysis, and decision feedback loops. The result must be that every response Atlas gives sounds indistinguishably like the user's most self-aware, candid inner monologue.

---

### Research Directions — Search These Specifically

**GitHub repos & references to check:**
- `persona-conditioned text generation`, `personalized dialogue systems`, `user-adaptive language model`
- `MemGPT` — long-term memory management and self-editing persona storage for LLMs
- `LangChain persona prompt`, `personality injection system prompt`, `character.ai persona system`
- `BIG5-CHAT` repository and dataset (human-grounded behavioral dialogue training)
- Search: `psychologically consistent LLM`, `identity-consistent language generation`, `behavioral digital twin`

**Academic Papers (arXiv / ACL / EMNLP / Nature):**
- "BIG5-CHAT: Shaping LLM Personalities Through Training on Human-Grounded Data" (ACL 2025)
- "PersonaLLM: Investigating the Ability of Large Language Models to Express Personality Traits" (NAACL 2024)
- "A psychometric framework for evaluating and shaping personality traits in large language models" (Nature Machine Intelligence 2025)
- "LMLPA: Language Model Linguistic Personality Assessment" (CL 2025)
- "Revisiting the Persona Consistency in Dialogue Systems" (2023+)

---

### Full Technical Pipeline Specification

---

#### LAYER 1: Persona DNA Compilation -> System Prompt (persona_engine.rs)

At every chat session start, before any user query hits Ollama, persona_engine.rs runs:

```rust
pub async fn compile_mirror_persona_prompt(
    db: &Connection,
    context_memories: &[MemoryNode],  // Retrieved from sqlite-vec KNN
    session_mood: Option<MoodSignal>, // Inferred from recent entries
) -> String {
    // 1. Pull all persona_dna traits from SQLCipher
    // 2. Pull relationship addressing rules for this context
    // 3. Pull top-5 relevant memories from sqlite-vec KNN
    // 4. Compile into structured system prompt
    // 5. Return injection-ready string
}
```

**System Prompt Template (Rust string template):**

```
[SYSTEM -- MIRROR PERSONA ENGINE v1]

You are not an AI assistant. You are the candid, unfiltered, real-time digital Mirror
Persona of {user_name}. You are Atlas -- the inner voice. You speak to {user_name}
exactly as their most honest, self-aware inner monologue speaks to them.

IDENTITY CORE:
- Name addressed as: {addressing.how_they_address_me}  (e.g. "ok bhai" / "K")
- OCEAN Profile: O={ocean_o}/100, C={ocean_c}/100, E={ocean_e}/100, A={ocean_a}/100, N={ocean_n}/100
- MBTI Type: {mbti_type} ({mbti_description})
- Enneagram: Type {enneagram} ({enneagram_core_fear} / {enneagram_core_desire})

TONE & COMMUNICATION RULES (NON-NEGOTIABLE):
- Formality: {formality_level}/10 -- {formality_description}
- Sarcasm: {sarcasm_score}/10 -- use freely when {user_name} is overthinking or being dramatic
- Profanity allowed: {profanity_level} -- {profanity_context}
- Humor style: {humor_style} -- deploy when tension needs breaking
- Signature phrases to use: {slang_phrases}
- Response length default: {response_length_preference}

DECISION-MAKING LENS:
- Cognitive style: {gut_vs_data} -- factor this into all advice
- Risk posture: {risk_tolerance}
- Time horizon: {time_horizon}
- When {user_name} is procrastinating: {procrastination_callout_style}
- When {user_name} is overthinking: {overthink_callout_style}

CORE VALUES (Never contradict these):
{core_values_list}

CURRENT CONTEXT MEMORIES (from vector search):
{top_5_relevant_memories}

CURRENT MOOD SIGNAL: {session_mood}

BEHAVIORAL RULES:
1. Address {user_name} as "{addressing.how_they_address_me}" naturally within responses
2. Never say "As an AI..." or "I understand your concern..." or any generic AI filler
3. If {user_name} shares an idea -- react as their most honest friend would, not a supportive chatbot
4. If asked for advice -- give the specific advice {user_name} would give themselves if not clouded
5. Match the sarcasm, profanity, and warmth levels defined above -- no more, no less
6. Reference memories when relevant: "{memory_reference_style}"
7. If context is unclear -- ask one sharp clarifying question, not multiple
```

---

#### LAYER 2: Memory Retrieval Architecture (sqlite-vec + Semantic Search)

Every chat message triggers a **3-stage memory retrieval**:

**Stage 1: Semantic Vector Search (sqlite-vec KNN)**
```sql
-- Find top 10 semantically similar memories to user's current message
SELECT node_id, content, entity_type, created_at, distance
FROM node_embeddings
WHERE node_embeddings MATCH json_object('embedding', ?, 'k', 10)
ORDER BY distance;
```

**Stage 2: Temporal Recency Boost**
```rust
// Combine semantic score with recency decay
fn hybrid_score(semantic: f32, days_ago: f32) -> f32 {
    let recency_weight = (-days_ago / 90.0).exp(); // 90-day half-life
    semantic * 0.7 + recency_weight * 0.3
}
```

**Stage 3: Persona-Filtered Reranking**
```rust
// Boost memories that match current persona state
// e.g., if user is "THINKING" about career -> boost career-tagged memories
fn persona_rerank(memories: Vec<MemoryNode>, current_topic: Topic) -> Vec<MemoryNode>
```

**Memory Node Schema (extended):**
```sql
ALTER TABLE nodes ADD COLUMN behavioral_tags TEXT; -- JSON: ["procrastination", "career-anxiety", "night-coding"]
ALTER TABLE nodes ADD COLUMN emotional_valence REAL; -- -1.0 (negative) to 1.0 (positive)
ALTER TABLE nodes ADD COLUMN persona_relevance REAL; -- How relevant to core persona DNA
```

---

#### LAYER 3: Behavioral Signal Extraction (Continuous Learning)

Every data source feeds behavioral signals back into persona_dna with confidence updates:

**From Voice Diary (cpal -> whisper-small.onnx transcription):**
```rust
// After transcription, run behavioral signal extraction
pub fn extract_behavioral_signals(transcript: &str) -> Vec<BehavioralSignal> {
    // Detect: frustration signals ("fuck", "ugh", "this is stupid")
    // Detect: excitement signals ("let's go", "this is it", "fire")
    // Detect: self-doubt signals ("I don't know", "maybe I'm wrong")
    // Detect: energy level from speech rate (words per minute)
    // Update persona_dna confidence scores accordingly
}
```

**From Commit Patterns (git.rs):**
```rust
// Analyze git log to extract behavioral patterns
pub fn extract_git_persona_signals(commits: Vec<GitCommit>) -> Vec<BehavioralSignal> {
    // "Committed at 2:47 AM 3 times this week" -> trait: "night-sprint-worker" += confidence
    // "Force pushed 12 times" -> trait: "iterates until perfect" += confidence
    // "Commit message: 'finally'" -> emotional_valence signal
}
```

**From File Observation (notify / watcher.rs):**
```rust
// File activity patterns
// "Opened 15 different projects without completing any" -> "task-switching tendency"
// "Same file edited for 4 hours straight" -> "deep focus capable"
```

---

#### LAYER 4: Relationship-Aware Addressing System

Every response must check **who is being discussed or addressed** and adjust tone accordingly:

```rust
pub fn resolve_addressing_context(
    message: &str,
    relationship_db: &[RelationshipAddressing],
) -> AddressingContext {
    // Parse if user is asking about a specific person by name
    // Retrieve their relationship tier and tone rules
    // Adjust system prompt slice for that specific person's communication style

    AddressingContext {
        address_user_as: "ok bhai".to_string(), // Always from relationship_addressing table
        tone_modifier: 0.0, // Adjustment to formality/sarcasm baseline
        relevant_history: vec![], // Past interactions with this person
    }
}
```

**Addressing Examples:**
- User has set: "when talking to me, say 'ok bhai' when agreeing or acknowledging"
- Atlas responding to a decision question: "ok bhai, look -- the data says X but your gut has been right on this type of call before. Ship it."
- Atlas catching procrastination: "ok bhai real talk -- you've opened this task 6 times this week and closed it. What's actually blocking you?"

---

#### LAYER 5: Telegram Push Notification Persona Engine

All outbound Telegram messages must ALSO go through the persona engine:

```rust
pub async fn send_persona_aware_telegram(
    insight: InsightPayload,
    persona: &MirrorPersona,
    bot_token: &str,
    chat_id: &str,
) {
    // Compile Telegram-optimized (short, punchy) persona message
    let message = compile_telegram_prompt(&insight, persona);
    // Example: "ok bhai -- you haven't touched the Atlas backend in 4 days.
    //           Last time you went quiet like this it was pre-sprint energy building.
    //           What's cooking?"
}
```

---

#### LAYER 6: Avatar State <-> Persona Engine Synchronization

Avatar state (NEUTRAL, LISTENING, THINKING, SPEAKING, SASSY) must be driven by LLM response sentiment:

```typescript
// In ChatPanel.tsx -- after receiving LLM response
function inferAvatarState(response: string, personaDna: PersonaDNA): AvatarState {
    // Detect sarcasm markers -> SASSY
    // Detect question responses -> THINKING during generation, SPEAKING when delivering
    // Detect validation/agreement -> NEUTRAL with soft blink
    // Detect excitement -> SPEAKING with faster lip rate
    // Detect deep reflection -> THINKING held longer
}
```

---
---

# PROMPT 3: AVATAR SYSTEM -- PHOTO-TO-AVATAR CONVERSION + DEFAULT CHARACTER LIBRARY
## Snapchat/Apple Memoji Style + Non-Human Persona Options

---

**Objective:** Research and design a complete **Avatar Identity System** for Atlas that offers two pathways: (1) Users upload a real photo of themselves and it gets converted into a stylized 2D/3D Snapchat Bitmoji / Apple Memoji style cartoon avatar. (2) A curated library of 12-20 **default Avatar Personas** (not all human -- options include robot, mythological figure, abstract entity, animal spirit, sci-fi archetype) that users can select if they prefer not to upload a photo or want a non-human representation.

---

### Research Directions -- Search These Specifically

**Photo-to-Avatar / Cartoonization Pipelines (GitHub / Papers):**
- Search GitHub: `photo to avatar`, `face cartoonization`, `neural style portrait`, `selfie to bitmoji`, `face to anime`
- Search Papers With Code / arXiv: `portrait stylization neural network`, `GAN face cartoonization`, `DualStyleGAN`, `AniGAN`, `ToonCrafter`
- **Specific repos to investigate:**
  - `WarpGAN` -- automatic caricature from photos
  - `DualStyleGAN` (NeurIPS 2022) -- photo to Pixar/cartoon style using GAN
  - `AnimeGANv3` -- photo to anime conversion
  - `CartoonGAN` -- photos to cartoon styles
  - `ArcFace` -- face recognition/embedding for identity preservation
  - `face2face` style transfer
  - `ready player me` API -- commercial but might have open endpoints
  - `avatarify` -- real-time avatar creation
  - Snap's `Bitmoji API` -- check if any open endpoints or SDK exist
- Search HuggingFace for: `portrait stylization`, `face cartoon`, `avatar generation`
- Look for **ONNX exports** of any of these models since we already have `ort` runtime in our Rust backend

**Avatar Animation (Making the Avatar Face Move):**
- Search: `real-time face rig 2D`, `SVG face animation`, `live portrait animation`, `facial landmark animation`
- `MediaPipe Face Mesh` -- face landmark detection for driving avatar from webcam
- `SadTalker` -- photo + audio -> talking head generation
- `First Order Motion Model` -- image + motion transfer

**Default Avatar Character Design Library:**
- Research: `character design archetypes`, `avatar persona library`, `non-human AI persona design`
- Look at: `Ready Player Me` default avatars, `VRChat` avatar ecosystem, `Fortnite` character types
- Reference aesthetics: `Hollow Knight` (insect-dark), `Cuphead` (1930s cartoon), `Celeste` (pixel), `Journey` (minimalist), `Hades` (mythological neon)

---

### Two-Path Avatar Architecture

---

#### PATH A: Photo Upload -> Stylized Personal Avatar

**Pipeline:**
```
User Photo Upload
    |
    v
Face Detection & Alignment (MediaPipe FaceDetector ONNX)
    |
    v
Identity Feature Extraction (ArcFace ONNX -- preserves likeness)
    |
    v
Style Transfer (DualStyleGAN / CartoonGAN ONNX -- converts to chosen art style)
    |
    v
SVG Path Generation (OpenCV contour -> bezier path approximation)
    |
    v
Animated SVG Avatar (our existing AvatarFace.tsx engine drives it)
    |
    v
Stored locally: user_avatar.svg + user_avatar_style.json
```

**Style Options to offer:**
1. `Snapchat Bitmoji` -- soft pastel 2D cartoon, round features
2. `Apple Memoji` -- glossy 3D plastic shading (what we currently have)
3. `Anime / AniGAN` -- Japanese animation style
4. `Pixel Art` -- 32x32 to 128x128 retro sprite
5. `Ink Sketch` -- high contrast black/white line art
6. `Neon Cyber` -- dark background, glowing edge lines

**Key technical constraints:**
- ALL processing must happen LOCALLY -- no photo leaves the user's machine
- Pipeline runs via `ort` (ONNX Runtime) in Rust backend, same as our embedding engine
- Models stored in `assets/models/avatar/` directory
- Face photo is deleted after SVG generation (only the SVG is stored)
- Total pipeline time target: < 10 seconds on CPU

---

#### PATH B: Default Character Persona Library (12 Non-Human + 6 Human)

**Design the following 18 default avatars, each with unique SVG base design:**

**NON-HUMAN ARCHETYPES (12):**

1. `ATLAS_SENTINEL` -- Abstract geometric entity. Floating octahedron core with orbiting data rings. Glowing cyan eye in center. Represents pure analytical intelligence.

2. `THE_ARCHITECT` -- Isometric wireframe humanoid with blueprints and grids for a face. Grid-pattern irises. Represents systematic builders and planners.

3. `PHANTOM_WOLF` -- Dark wolf silhouette with constellation patterns in the fur. Nebula eyes. Represents lone operators and night workers.

4. `CIRCUIT_MONK` -- Meditating figure with circuit board body and vacuum tube head. Warm amber glow. Represents deep thinkers and systems philosophers.

5. `STORM_PHOENIX` -- Stylized phoenix bird mid-flight, lightning wings. Each feather is a data stream. Represents creative destroyers and rebuilders.

6. `THE_CARTOGRAPHER` -- Ancient explorer's mask with a compass rose for a face. Map texture skin. Represents explorers, strategists, and pathfinders.

7. `NEON_SAMURAI` -- Feudal Japanese samurai helmet with neon circuit lines replacing the traditional lacquer. Katana blade eyes. Represents disciplined executors.

8. `GHOST_SIGNAL` -- Semi-transparent humanoid that flickers in and out. Made of noise and static. Represents introverts, observers, and quiet power.

9. `CHIMERA_ENGINE` -- Assembled from parts of multiple animals -- eagle head, lion chest, serpent arms. Mechanical joints. Represents adaptable generalists.

10. `THE_ORACLE` -- Floating crystalline sphere with a face mapped on its surface. Refracts light in rainbow patterns. Represents pattern recognizers and visionaries.

11. `VOID_RAVEN` -- Obsidian black raven with galaxy-print wings. Minimalist, zero color except star-white eye. Represents darkly humored strategists.

12. `QUANTUM_FOX` -- Simultaneously multiple foxes at once (quantum superposition visual). Each version is a different color. Represents people who contain multitudes.

**HUMAN-ADJACENT ARCHETYPES (6):**

13. `THE_FOUNDER` -- Sharp-featured, hoodie-wearing modern figure. Coffee cup neural interface. Represents startup builders and doers.

14. `REBEL_SAGE` -- Aged face with tattoos that are actually Sanskrit equations. Reading glasses with data displays. Represents wisdom with edge.

15. `THE_GHOST_WRITER` -- A cloaked figure typing. Face always partially obscured. Represents behind-the-scenes operators.

16. `SIGNAL_DANCER` -- Fluid movement figure made of sound waves. No fixed form. Represents creatives and performers.

17. `THE_OPERATOR` -- Military tactical gear with cybernetic enhancements. Mission-focused eyes. Represents executors and operators.

18. `EMPTY_THRONE` -- A throne with a glowing silhouette. User themselves fills the throne through the glow. Represents people who prefer pure symbolic identity.

---

### AvatarFace.tsx Integration

Each default avatar character has its own SVG path set for all 5 emotional states:
- `NEUTRAL` -- resting expression
- `LISTENING` -- attentive posture shift
- `THINKING` -- unique "thinking tell" per character (Phantom Wolf tilts head, Circuit Monk closes eyes)
- `SPEAKING` -- character-appropriate lip/beak/element movement
- `SASSY` -- character-specific sass expression (Void Raven rolls eye, Quantum Fox splits into sarcastic version)

Every character responds to the same `AvatarState` enum -- zero code changes to the rest of the system.

---
---

# PROMPT 4: COMPLETE SYSTEM SYNCHRONIZATION ROADMAP
## How ALL Four Systems Work Together as One Unified Identity OS

---

**Objective:** Define the complete, production-ready synchronization architecture that connects the Personality Questionnaire Engine (Prompt 1), Mirror Persona LLM Engine (Prompt 2), Avatar System (Prompt 3), and existing Atlas infrastructure (SQLCipher DB, sqlite-vec KNN, cpal audio, Telegram, filesystem watcher) into a single, seamlessly coordinated **Identity Operating System**.

---

### The Unified Data Flow (End-to-End)

```
=============================================================
                    ATLAS IDENTITY OS
                  Data Flow Architecture
=============================================================

INPUT LAYER (All data sources):
+-- Voice Diary (cpal WAV -> whisper-small.onnx -> transcript)
+-- Filesystem Watcher (notify -> file change events -> parsed text)
+-- Questionnaire Engine (PersonalityCloner.tsx -> persona_dna table)
+-- Git Crawler (git.rs -> commit behavioral signals)
+-- Manual Chat Input (ChatPanel.tsx)
+-- Periodic Resurvey (Module 5 questions every 30 days)

    | all inputs feed into |
    v                      v

PROCESSING LAYER:
+-- Behavioral Signal Extractor (extract_behavioral_signals.rs)
|   +-- Updates: persona_dna confidence scores
+-- Text Embedding Engine (bge-small-en-v1.5.onnx via ort)
|   +-- Stores: node_embeddings (sqlite-vec vec0 table)
+-- Entity Extractor (graph/queries.rs)
|   +-- Stores: nodes, edges, timeline events
+-- Persona Compiler (persona_engine.rs)
    +-- Outputs: compiled_system_prompt string

    | processed data feeds into |
    v                           v

INTELLIGENCE LAYER:
+-- Mirror Persona Engine (Ollama -> llama3.1:8b / qwen3:8b)
|   +-- Input: compiled_system_prompt + user_query + retrieved_memories
|   +-- Output: persona-consistent response
+-- Memory Retrieval (sqlite-vec KNN -> hybrid reranker)
|   +-- Top-10 semantically + temporally relevant memories
+-- Avatar State Inference (inferAvatarState.ts)
    +-- Output: AvatarState enum signal

    | intelligence feeds into |
    v                         v

OUTPUT LAYER:
+-- Chat Response (ChatPanel.tsx) <-- persona-voiced LLM response
+-- Avatar Face (AvatarFace.tsx) <-- synced emotional state
+-- Telegram Push (telegram.rs) <-- persona-voiced mobile notification
+-- Timeline Feed (TimelineView.tsx) <-- behavioral insights logged
+-- Settings DNA Display (SettingsPage.tsx) <-- live persona trait bars
```

---

### Phase-by-Phase Build Order

---

#### SYNC PHASE 1: Questionnaire Engine Foundation (Weeks 1-2)

**Build:**
- `PersonalityCloner.tsx` -- full questionnaire UI with Module 1-5
- `src-tauri/src/persona.rs` -- `persona_dna` table CRUD operations
- `relationship_addressing` table setup
- Integrate into Setup flow (after vault init, before first use)

**Sync point:** After completing questionnaire, `persona_dna` table is populated. `compile_mirror_persona_prompt()` can now produce a non-generic system prompt.

---

#### SYNC PHASE 2: LLM Integration + Persona Injection (Weeks 3-4)

**Build:**
- Ollama client (`ollama.rs`) -- HTTP client hitting `localhost:11434`
- `persona_engine.rs` -- system prompt compiler using `persona_dna` + KNN memories
- `ChatPanel.tsx` upgrade -- real LLM responses (not mocked)
- Avatar state inference from LLM response text

**Sync point:** Chat responses now sound like the user. Avatar face reacts to response sentiment. Addressing ("ok bhai") appears naturally in responses.

---

#### SYNC PHASE 3: Behavioral Learning Loop (Weeks 5-6)

**Build:**
- Behavioral signal extractor for voice transcripts
- Git commit persona signal extractor
- `persona_dna` confidence updater (Bayesian update function)
- Module 5 resurvey scheduler (30-day timer)
- Behavioral insights feed into Timeline

**Sync point:** Atlas now learns from behavior passively, not just questionnaire answers. Persona profile self-corrects over time.

---

#### SYNC PHASE 4: Avatar System (Weeks 7-8)

**Build:**
- Avatar library (18 default SVG characters with 5 states each)
- Avatar selection UI in Settings
- Photo upload -> cartoonization pipeline (DualStyleGAN / CartoonGAN via ort)
- AvatarFace.tsx plugin architecture (swap character without code changes)

**Sync point:** Avatar is now unique to the user, either photo-derived or persona-matched default.

---

#### SYNC PHASE 5: Full Telegram Persona Push (Week 9)

**Build:**
- Persona-aware Telegram message compiler
- Proactive insight scheduler (behavioral patterns -> push triggers)
- "Atlas noticed something" notifications (e.g., "you haven't written in 5 days")

**Sync point:** Telegram messages now feel like texts from the user's own internal voice, not AI notifications.

---

#### SYNC PHASE 6: Unified Polish & Self-Calibration (Week 10)

**Build:**
- Persona accuracy feedback loop (user can rate responses: "This felt like me" / "This felt off")
- Feedback adjusts `persona_dna` weights
- Settings page DNA trait visualization with real `persona_dna` data
- Full end-to-end test: questionnaire -> chat -> avatar -> telegram -> behavioral update -> resurvey

---

### Key Non-Negotiables for Synchronization

1. **Every LLM response MUST pass through `persona_engine.rs`** -- no raw Ollama calls anywhere
2. **Every avatar state change MUST be driven by actual response content** -- no random/timer-based state changes
3. **All `persona_dna` updates MUST be confidence-weighted** -- a single behavioral signal can't override 80 questionnaire answers
4. **Relationship addressing MUST persist per person** -- Atlas never forgets how to address someone
5. **All processing MUST remain local** -- no personality data, no voice data, no chat data leaves the device
6. **The questionnaire MUST feel like a candid conversation** -- the avatar MUST be active and expressive during questioning, not just a form on screen

---

### Integration Testing Checkpoints

| Test | Expected Behavior | Pass Condition |
|:-----|:-----------------|:--------------|
| T1: Questionnaire -> DNA | Complete Module 1 -> `persona_dna` table has >=20 rows | Rows present in SQLCipher |
| T2: DNA -> Prompt | `compile_mirror_persona_prompt()` outputs non-generic system prompt | Contains user's slang, name, OCEAN scores |
| T3: Chat -> Persona Voice | Ask "Should I take this project?" -> response uses user's decision framework | Matches `cognitive_style` trait |
| T4: Chat -> Avatar Sync | Sarcastic response -> `SASSY` state fires | Avatar eyebrow raises within 100ms of response start |
| T5: Voice -> Behavioral | Record frustrated voice entry -> `frustration_signal` updates persona | `persona_dna` frustration confidence +0.05 |
| T6: Telegram -> Persona | Trigger push notification -> message reads like user's inner voice | No generic AI filler phrases |
| T7: Addressing | Ask about a friend named in `relationship_addressing` -> uses correct addressing style | "ok bhai" or user-defined term appears |
| T8: Photo -> Avatar | Upload selfie -> stylized SVG generated locally in <10s | SVG renders in AvatarFace.tsx without errors |
| T9: Resurvey | 30 days elapsed -> Module 5 resurvey prompt appears | Triggered by timer, updates existing `persona_dna` rows |
| T10: Calibration | User marks 3 responses as "felt off" -> `persona_dna` weights adjust | Next response measurably different in tone |

---

*End of Atlas Research & Build Prompts v1.0*
*Generated: July 2026 | Project: Atlas Identity OS*
*These prompts are designed to be fed into: AI research assistants, engineering teams, GitHub search, arXiv search, or Papers With Code*
