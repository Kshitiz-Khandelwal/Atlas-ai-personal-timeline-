# Atlas Identity OS — 4 Master Research & Build Prompts

> These are detailed, standalone prompts. Each one can be fed into an AI research assistant, given to a developer, or used to search GitHub/arXiv/Papers With Code for existing implementations. They are written to be self-contained — no prior context needed.

---
---

# PROMPT 1: PERSONALITY CLONING QUESTIONNAIRE ENGINE
## The Deep Onboarding Interview — Science, Structure & Question Design

---

**Objective:** Research and design a scientifically grounded, psychologically validated, multi-dimensional **Personality Cloning Questionnaire** that captures a real human's authentic personality, communication style, behavioral heuristics, moral frameworks, slang, humor, decision-making patterns, and social relationship dynamics — at enough depth that an LLM (llama3.1:8b / qwen3:8b running locally via Ollama) can replicate that person's inner monologue, verbal tone, and reasoning style in real-time conversations.

**This is NOT a generic personality test.** This is a **behavioral fingerprinting system** designed to produce a structured JSON profile (`persona_dna.json`) that gets injected into every LLM system prompt, making the AI speak, react, decide, and advise exactly as the user would — to themselves.

---

### Research Directions — Search These Specifically

**Existing GitHub Repos / Papers to Find:**
- Search GitHub for: `personality cloning LLM`, `digital twin personality`, `persona replication language model`, `psychological profiling chatbot`, `Big Five personality LLM injection`
- Search arXiv / Papers With Code for: `personality-conditioned language generation`, `persona consistency LLM`, `user modeling dialogue systems`, `psychological trait extraction NLP`
- Search for: `MBTI + LLM`, `Big Five (OCEAN) + fine-tuning`, `PersonaChat dataset`, `FriendsPersona dataset`, `PersonalityEdit paper`

**Foundational Psychological Frameworks to Integrate:**
- **Big Five / OCEAN Model** (`Openness`, `Conscientiousness`, `Extraversion`, `Agreeableness`, `Neuroticism`) — each scored 0-100
- **16 Personalities (Myers-Briggs Type Indicator / MBTI)** — `INTJ`, `ENFP`, `ISTP`, etc. — map the user's type AND map how that type communicates differently to different people
- **Enneagram** — 9 core fear/motivation patterns (Type 1 Reformer through Type 9 Peacemaker) — critical for replicating WHY someone makes decisions, not just HOW
- **Attachment Style** (Secure / Anxious / Avoidant / Disorganized) — how the user communicates in high-stakes relationships
- **Love Languages** (Words of Affirmation / Acts of Service / Receiving Gifts / Quality Time / Physical Touch) — affects how user gives and receives feedback
- **Dark Triad signals** (Machiavellianism, Narcissism, Psychopathy — subtle presence detection only, never explicit)
- **Cognitive Style** — System 1 (gut / fast intuition) vs System 2 (slow deliberate analysis) from Kahneman

**Linguistic / Communication Fingerprint Extraction:**
- Search: `linguistic style matching LSM`, `LIWC (Linguistic Inquiry and Word Count)`, `text-based personality inference`, `idiolect modeling NLP`
- Key dimensions to extract from the questionnaire:
  - Formality level (casual-slang <-> precise-academic)
  - Hedging frequency ("maybe", "sort of", "I think" — avoidant vs direct)
  - Emotional expressiveness (emojis, exclamation marks, dry humor vs warm humor)
  - Response length preference (terse/blunt vs elaborate/contextual)
  - Vocabulary tier (street/regional slang <-> technical jargon <-> literary references)

---

### Questionnaire Structure — Exact Design Spec

The questionnaire must be **multi-stage, conversational, and adaptive** (not a flat form). It unfolds across **5 modules** with a total of **~80-120 questions** depending on branching. The UI presents them as a candid one-on-one conversation with the Avatar face, not a Google Form.

---

#### MODULE 1: CORE IDENTITY & VALUES (20 Questions)
*Goal: Extract OCEAN scores, Enneagram type, core non-negotiables*

**Question types:** Scenario-forced-choice + open text hybrid

Sample questions (exact wording matters — must feel like a close friend asking, not HR):

1. "When a close friend asks for honest feedback on a bad idea — what do you actually say vs what do you think?"
2. "Pick the one that's more you: (A) I've already thought 3 steps ahead before anyone else starts / (B) I figure it out as I go — the journey matters more"
3. "What's the one thing someone can do that makes you immediately lose respect for them? No softening."
4. "You have 72 hours to make a life-changing decision. Walk me through your actual process — not the ideal process, the real one."
5. "Rate your brutal honesty level 1-10. Now rate how others would rate it. What's the gap and why?"
6. "Which of these feels most like betrayal to you: (A) Someone lies to protect you / (B) Someone tells you a painful truth you didn't ask for / (C) Someone stays silent when they know you're wrong"
7. "What does 'winning' look like in your life right now — not in 10 years, right now?"
8. "Describe a moment where you went fully against your instincts and were right. Then one where you followed your gut and were wrong."
9. "How do you handle someone who is consistently late or disrespects your time?"
10. "What's your relationship with rules? (Concrete scale: 1=I follow rules even if they're wrong, 10=Rules are someone else's problem)"
11. "What kind of advice do you actually want from people close to you when you're struggling? Be specific."
12. "What topic can you talk about for 3 hours without getting bored?"
13. "If you had to describe your personal operating system in 3 words — not adjectives you wish described you, actual ones — what are they?"
14. "How do you feel about people who are significantly less ambitious than you? Be honest."
15. "What's a belief you held 5 years ago that you now think was completely wrong?"
16. "When you're at your worst — what does that look like? What triggers it?"
17. "Do you believe people fundamentally change or fundamentally stay the same? What does that say about you?"
18. "What's your relationship with money — as a tool, a scoreboard, security, or something else?"
19. "How important is being liked vs being respected? Where do you actually land?"
20. "If someone had to write the honest version of your life story right now — not the LinkedIn version — what would the chapter titles be?"

---

#### MODULE 2: COMMUNICATION STYLE & RELATIONSHIP DYNAMICS (25 Questions)
*Goal: Extract tone fingerprint, slang vocabulary, how user addresses different relationship tiers*

**Critical Feature:** User defines **named relationship tiers** and preferred addressing styles for EACH tier:
- "What do you call your closest male friend when greeting them?" -> "bhai", "yaar", "bro", "bud"
- "What do you call yourself when you want someone to address you? Any specific nickname?" -> "ok bhai", "K", "bhai"
- "How do you start a message to someone you respect professionally?" -> "Hey", "Sir", "yo"
- "How do you end a conversation with a best friend vs a colleague?"

Sample questions:

1. "Give me an example of something you said recently that you thought was funny. Don't explain why — just say it."
2. "Do you use profanity/abusive language? In what contexts? Rate: 1=never, 10=every sentence"
3. "What regional slang or insider vocabulary do you use that outsiders wouldn't understand?"
4. "How do you disagree with someone you respect? Give me an actual example."
5. "When texting your best friend about something exciting, what does that text look like? Type it out."
6. "How do you want people close to you to address you? What names feel natural vs wrong?"
7. "Do you match someone else's energy in conversation or maintain your own register?"
8. "How long are your typical messages — one line or paragraphs? Does it depend on the person?"
9. "What's your texting style when you're annoyed: (A) Radio silence / (B) Short clipped responses / (C) Longer than usual explaining / (D) Explosive and then fine"
10. "Do you give compliments easily or reluctantly? Do you receive them gracefully or deflect?"
11. "List 5 words or phrases you use constantly that are very 'you'. Don't think too hard."
12. "How do you handle someone who talks too much in a meeting or group setting?"
13. "Do you prefer written or verbal communication for serious topics? Why?"
14. "Rate your sarcasm level 1-10. Give me a sample sarcastic line in your actual voice."
15. "What's the fastest way to bore you in a conversation?"
16. "How do you show that you care about someone — without explicitly saying 'I care about you'?"
17. "When someone vents to you, what's your default mode: (A) Fix it / (B) Validate and listen / (C) Reframe with perspective / (D) Make them laugh out of it"
18. "How do you apologize when you're wrong? Be specific — what do you actually say?"
19. "What's your tone in a high-pressure situation — do you get quieter, louder, funnier, or colder?"
20. "Describe your relationship with eye contact and silence in conversations."
21. "Do you prefer direct questions or for people to read between the lines?"
22. "How quickly do you trust new people? What makes someone cross from 'stranger' to 'person I'd call at 2am'?"
23. "How differently do you talk to: (A) your parents / (B) your closest friend / (C) someone you're trying to impress / (D) someone junior to you?"
24. "What's something people always misunderstand about how you communicate?"
25. "Give me an example of your internal monologue when you're about to make a big decision. What does that voice sound like?"

---

#### MODULE 3: DECISION-MAKING & COGNITIVE HEURISTICS (20 Questions)
*Goal: Extract decision frameworks, risk tolerance, time orientation, cognitive biases*

1. "Walk me through the last decision you regret. What went wrong in the process — not the outcome, the process."
2. "Are you more afraid of committing too early or waiting too long?"
3. "How do you handle incomplete information? Do you wait for more data or act on what you have?"
4. "What's your relationship with risk? Is it consistent across domains (money, relationships, career, health) or domain-specific?"
5. "Do you optimize for reversibility (keeping options open) or commitment (burning ships)?"
6. "When you have a gut feeling that contradicts the data — which wins? Give an example."
7. "How many options do you want when making a decision? Do you narrow fast or want exhaustive choices?"
8. "How long does it take you to move on from a decision you made? Do you revisit or do you file it and move?"
9. "What's your relationship with deadlines — are they motivating, stressful, irrelevant, or energizing?"
10. "Describe the physical sensation you get when you know something is right. Where do you feel certainty?"
11. "How do you handle advice that contradicts your instincts?"
12. "What cognitive bias do you think affects you most? (Give options: Confirmation bias / Sunk cost / FOMO / Overconfidence / Loss aversion / Availability heuristic)"
13. "When you're stuck: do you think your way out, talk your way out, sleep on it, or work your way out?"
14. "How do you feel about asking for help? Be honest about the internal resistance if there is any."
15. "Do you make lists, use systems, or operate from your head?"
16. "What's your time horizon when you think about your life? (Day / Week / Year / Decade)"
17. "When things go wrong — is your first instinct to blame yourself, others, circumstances, or randomness?"
18. "What's a shortcut or heuristic you use that saves you time but might be wrong sometimes?"
19. "How do you know when to quit something vs when to push through?"
20. "What does your ideal working environment look like — time of day, setting, alone or with people, music or silence?"

---

#### MODULE 4: HUMOR, CREATIVITY & AESTHETIC DNA (15 Questions)
*Goal: Capture humor register, creative style, aesthetic sensibility — critical for personality replication*

1. "Tell me something genuinely funny. Not a joke — something that happened that you think is funny."
2. "What kind of humor makes you actually laugh vs politely smile?"
3. "What's your humor style: (A) Dry/deadpan / (B) Absurdist/surreal / (C) Sharp/roast-style / (D) Self-deprecating / (E) Observational / (F) Dark"
4. "What do you find offensive about most comedy? Where's your actual line?"
5. "What creative field (that isn't your main work) do you privately appreciate most — music, architecture, writing, visual art, cinema, game design, etc.?"
6. "Name 3 creators, thinkers, or figures whose work has shaped how you see the world."
7. "What's your aesthetic — in design, fashion, environment? Give me 3 concrete reference points."
8. "How do you feel about people who take themselves too seriously?"
9. "What's the last thing that made you genuinely laugh out loud?"
10. "If someone described your humor style to a stranger, what would they say?"
11. "Do you prefer references that are niche/obscure or widely understood?"
12. "What topics are off-limits for humor in your world?"
13. "How do you use humor in tension or conflict?"
14. "What film, book, or song best captures your current emotional state or worldview?"
15. "If your personality was a genre of music, what would it be and why?"

---

#### MODULE 5: CONTINUOUS LEARNING SIGNALS (10 Questions, asked periodically not just at setup)
*Goal: Keep persona updated as the user evolves — these are resurveyed every 30 days*

1. "What changed for you in the last month that you didn't expect?"
2. "What are you currently obsessed with — intellectually, creatively, professionally?"
3. "Who have you been spending the most time with? How are they influencing you?"
4. "What opinion have you changed recently?"
5. "What's draining you right now that you haven't addressed?"
6. "What's the one thing you keep telling yourself you'll do but haven't started?"
7. "How is your relationship with yourself different from 6 months ago?"
8. "What have you said no to recently that you're proud of?"
9. "What do you want Atlas to notice that it's been missing about you?"
10. "Is the persona Atlas shows you feeling accurate? What's off?"

---

### Output Schema — persona_dna Table (SQLCipher)

```sql
CREATE TABLE persona_dna (
    id TEXT PRIMARY KEY,
    trait_category TEXT NOT NULL,  -- 'tone', 'slang', 'decision', 'humor', 'values', 'relationship', 'cognitive'
    trait_key TEXT NOT NULL,       -- 'formality_level', 'sarcasm_score', 'gut_vs_data', 'humor_style'
    trait_value TEXT NOT NULL,     -- Human readable extracted value
    trait_score REAL,              -- Normalized 0.0-1.0 where applicable
    ocean_dimension TEXT,          -- O/C/E/A/N if applicable
    mbti_axis TEXT,                -- I/E, N/S, T/F, J/P if applicable
    enneagram_type INTEGER,        -- 1-9 if applicable
    confidence REAL DEFAULT 0.8,   -- How confident the extraction is
    source TEXT DEFAULT 'questionnaire',  -- 'questionnaire' | 'behavioral' | 'inferred'
    last_updated INTEGER           -- Unix timestamp
);

CREATE TABLE relationship_addressing (
    id TEXT PRIMARY KEY,
    relationship_tier TEXT,       -- 'best_friend', 'parent', 'colleague', 'junior', 'romantic'
    person_name TEXT,             -- Specific person if named
    how_i_address_them TEXT,      -- "yaar", "sir", "hey"
    how_they_address_me TEXT,     -- "bhai", "K", "ok bhai"
    greeting_style TEXT,          -- "Yo!", "Aye bhai!", "Hey"
    sign_off_style TEXT,          -- "catch you later", "ight"
    tone_shift TEXT               -- "10% more formal", "drop all filters"
);
```

---
---

# PROMPT 2: MIRROR PERSONA ENGINE — EXTRACTION, EMBEDDING & INTEGRATION
## How Personality DNA Gets Into Every LLM Response + Memory Vector System

---

**Objective:** Design and implement the complete technical pipeline that takes the `persona_dna` profile from Prompt 1 and integrates it into every single interaction — LLM chat responses, Telegram push reminders, voice diary analysis, and behavioral feedback loops. The result must be that every response Atlas gives sounds indistinguishably like the user speaking to themselves.

---

### Research Directions — Search These Specifically

**GitHub repos to find:**
- `persona-conditioned text generation`, `personalized dialogue systems`, `user-adaptive language model`
- `MemGPT` — long-term memory management for LLMs (critical architecture reference)
- `LangChain persona prompt`, `personality injection system prompt`, `character.ai persona system`
- `PersonaChat` (Facebook/Meta dataset), `Blenderbot persona`, `SPC (Speaker Persona Consistency)`
- Search: `psychologically consistent LLM`, `identity-consistent language generation`, `behavioral digital twin`

**Papers to find on arXiv / ACL / EMNLP:**
- "Revisiting the Persona Consistency in Dialogue Systems" (2023+)
- "PersonalityEdit: Editing LLM Personality"
- "Do LLMs Possess a Personality? Making the MBTI Evaluation Reasonable for LLMs"
- "Character is Destiny: Large Language Model-Empowered Dialogue Agents for Role-playing"
- "Faithful Persona-Based Conversational Dataset Generation with Large Language Models"

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
