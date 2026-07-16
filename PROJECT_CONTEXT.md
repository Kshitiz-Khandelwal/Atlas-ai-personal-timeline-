# Atlas — Project Context
> **READ THIS FIRST.** This is the ground truth document. Do not fabricate entities, schema fields, or tech decisions. Everything here is accurate as of July 2026.

---

## 1. What Atlas Actually Is

Atlas is **not** a chatbot, note-taking app, or cloud service.

Atlas is a **Local-First AI Identity System** — a desktop application that builds a living, time-aware model of a person's identity from their digital life (notes, code, calendars, chats, PDFs).

All computation happens locally. No cloud. No accounts. No telemetry. No data ever leaves the device.

The core output is an **Identity Graph** — a mathematical graph structure that models who the user is, who they were, and how they have changed over time.

---

## 2. Core Concepts

### 2.1 The Identity Graph

The graph is formally defined as:

$$\mathcal{G} = (\mathcal{V}, \mathcal{E}, \mathcal{T})$$

- **V (Vertices/Nodes):** Entities extracted from a user's digital life. Each entity has a `type`, `confidence_score`, `source_path`, and timestamp.
- **E (Edges):** Directed, typed relationships between entities (e.g. `REQUIRES`, `INFLUENCED_BY`, `LED_TO`).
- **T (Time):** Every node and edge is anchored to a specific timestamp or date range. Time is the primary coordinate axis, not metadata.

### 2.2 Entity Types (16 Types)

| Entity Type | Description | Example |
|:---|:---|:---|
| `Memory` | Episodic personal moment | "Attended hackathon in Bangalore" |
| `Project` | Goal-oriented effort with start/end | "Built Verdict AI" |
| `Goal` | Forward-looking aspiration | "Learn Rust by Q3 2025" |
| `Habit` | Recurring behavioural pattern | "Daily 6am coding sessions" |
| `Skill` | Acquired capability | "React, Python, LightGBM" |
| `Belief` | Values or philosophical position | "Privacy is a fundamental right" |
| `Decision` | A crossroads choice with context | "Chose Tauri over Electron" |
| `Person` | A known individual in the user's life | "Mentor at hackathon" (hashed) |
| `Organization` | Company, college, team | "IIT Bombay" |
| `Place` | Physical or digital location | "Bangalore" |
| `Document` | A processed file | "~/obsidian/ML_notes.md" |
| `Note` | Short-form capture | "Idea for identity graph" |
| `MediaAsset` | Photo, video, audio reference | "profile_photo_2024.jpg" |
| `Chat` | Conversation fragment | WhatsApp export |
| `CalendarEvent` | Time-bounded scheduled event | "Team sync — March 14, 2025" |
| `KnowledgeNode` | A concept or fact learned | "Transformers use attention" |

### 2.3 Temporal Identity Model

Atlas does not overwrite data. When an entity changes (e.g. a Goal is updated), a **new version node** is created. The old node is marked `is_current = 0` and linked to the new node via `parent_version_id`. This enables **point-in-time reconstruction** — the system can reconstruct the complete graph state for any past date.

### 2.4 Past-Persona Mode

A core feature: the user can query Atlas as "Past You — December 2024". The system enforces:

```sql
WHERE created_at <= :cutoff_timestamp
```

This makes the LLM completely blind to any events, skills, or decisions that occurred after the cutoff. The AI answers as if it is that past version of the user.

### 2.5 Confidence Score

Every extracted entity has a `confidence` score (0.0 → 1.0):
- **0.9 – 1.0 (High):** Multi-source corroboration or explicit user statement
- **0.6 – 0.89 (Medium):** Single strong source (e.g. git commit message)
- **0.0 – 0.59 (Low):** Inferred or ambiguous source

Color coding: **Green** (High) · **Amber** (Medium) · **Red** (Low)

---

## 3. Data Sources Atlas Reads

| Source | File Types | What Gets Extracted |
|:---|:---|:---|
| Obsidian / Markdown notes | `.md` | Notes, Projects, Decisions, Knowledge, Goals |
| Git repositories | `git log` | Projects, Skills, Habits (commit frequency) |
| Google Calendar | `.ics` | CalendarEvents, People, Organizations |
| PDF documents | `.pdf` | Documents, KnowledgeNodes, Decisions |
| WhatsApp exports | `.txt` | Chats, People (hashed), Memories |
| Telegram exports | `.json` | Chats, People (hashed), Memories |
| Browser history | `.json` | KnowledgeNodes, Skills (inferred) |

**PII Rule:** Any third-party person's name, email, or phone number found in imports is SHA-256 hashed before storing in the database. Raw PII is never written.

---

## 4. Memory Model

Atlas uses three cognitive memory layers (modelled after neuroscience):

| Memory Type | Maps To | Example |
|:---|:---|:---|
| **Episodic** (specific events) | `Memory`, `CalendarEvent`, `Chat` | "Hackathon launch on Apr 3, 2025" |
| **Semantic** (facts/concepts) | `KnowledgeNode`, `Skill`, `Belief` | "React uses virtual DOM" |
| **Procedural** (behaviour patterns) | `Habit`, inferred from git/calendar | "Commits between 9–11 PM daily" |

---

## 5. Retrieval Algorithm

When the user asks a question, the retrieval engine runs a **hybrid scorer**:

$$Score = w_1 \cdot \text{VectorScore} + w_2 \cdot \text{GraphScore} - w_3 \cdot \Delta t$$

- `VectorScore`: Cosine similarity between query embedding and node embedding (384-dim, bge-small-en-v1.5)
- `GraphScore`: Node degree centrality + shortest graph path to anchor entities
- `Δt`: Age penalty — older nodes rank lower unless query is historical
- Retrieval threshold: **Score ≥ 0.65** (records below this cutoff are dropped)

---

## 6. Identity DNA

A derived feature — six trait scores computed from the graph:

| Trait | Derived From |
|:---|:---|
| Curiosity | Volume + diversity of KnowledgeNodes over time |
| Persistence | Goal completion rate + Habit streak analysis |
| Focus | Coding session regularity (git commit patterns) |
| Risk Tolerance | Decision confidence scores + new project starts |
| Creativity | Diversity of Projects + Memory emotional tone |
| Leadership | Person + Organization edge centrality |

These are percentile scores (0–100) recomputed by the weekly Reflection Engine.
