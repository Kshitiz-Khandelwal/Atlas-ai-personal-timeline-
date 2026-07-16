# ATLAS — Architecture Bible
**Document 7 of 7 · Version 1.0 · Technical Specifications**

---

## 1. Vision & Core Philosophy

### 1.1 The Vision
Atlas is the definitive cognitive extension of the self—a local-first digital identity operating system. It transforms fragmented artifacts of online life into an organized, time-aware model of a human mind. Rather than indexing files, Atlas models the person.

### 1.2 Core Philosophy
*   **Privacy is Absolute:** Local compute is not a marketing angle; it is the core architectural boundary. Network calls containing user data are forbidden.
*   **Temporal Identity:** A person is defined by their evolution. Atlas treats changing goals, beliefs, and values as evidence of growth rather than record errors.
*   **Explainable Reasoning:** Every assertion made by the system must display its structural math confidence rating, chronological placement, and link directly to local source files as evidence.

---

## 2. Theoretical Foundations

### 2.1 Identity Theory
In classical databases, information is stored as flat files or unrelated rows. In Atlas, **Identity** is modeled as a multi-dimensional, directed graph:
$$\mathcal{G} = (\mathcal{V}, \mathcal{E}, \mathcal{T})$$
*   $\mathcal{V}$: Entities representing the components of a person’s life (Decisions, Habits, Skills, Goals, Memories).
*   $\mathcal{E}$: Directed, typed relationships mapping influence, dependency, and collaboration.
*   $\mathcal{T}$: Chronological markers anchoring every node and edge to the timeline.

Identity is dynamic. It is reconstructed at query time by executing a graph traversal centered around the active user context.

### 2.2 Memory Theory
Atlas implements a localized cognitive memory layout:
1.  **Episodic Memory (Events/Memories):** Specific, timestamped moments (e.g., "Met with team for hackathon launch").
2.  **Semantic Memory (Knowledge/Skills):** Context-free facts, definitions, and concepts (e.g., "React uses a virtual DOM representation").
3.  **Procedural Memory (Habits/Work Styles):** Inferred behavioral patterns extracted from Git commit histories, calendars, and focus times.

### 2.3 Timeline Theory
Time is not a metadata attribute; it is the primary coordinate axis.
*   **Point-in-Time Reconstruction:** By parsing the version history and edge timestamps, the system can recreate the complete graph state for any specific day in the past.
*   **Version History:** Evolving entities do not overwrite their database rows. Instead, they generate a new version node, linking the previous state via a `superseded_by` edge, preserving the historical truth of past states of mind.

### 2.4 Reflection Theory
Self-knowledge requires structural abstraction.
*   **Active Consolidation:** The system runs weekly background jobs analyzing raw activity data. It clusters episodic memories to write high-level semantic reflections.
*   **Feedback Loops:** Reflections are not authoritative; they are presented as *evidence-linked observations* that users can accept, edit, or delete, updating the graph weighting metrics.

### 2.5 Knowledge Theory
Knowledge is the trail of intellectual provenance. Atlas tracks not only *what* a user knows, but *how* they learned it. Every `KnowledgeNode` maintains edge paths back to the raw source files, notes, and calendar events that introduced the concept.

---

## 3. Structural & Operational Rules

### 3.1 Graph Rules
*   **Rule G-1 (Node Uniqueness):** No two nodes of the same `entity_type` can share the same canonical name within the same version sequence.
*   **Rule G-2 (Edge Integrity):** Deleting a node triggers a cascade delete of all edges connected to it, preventing orphaned references.
*   **Rule G-3 (Acyclic Constraints for Versioning):** Evolving version links (`parent_version_id`) must remain strictly acyclic. A node cannot reference a descendant as its parent.

### 3.2 Timeline Rules
*   **Rule T-1 (Chronological Anchoring):** Every node in the database must possess either a single `timestamp` index or a `duration` span (start/end timestamps).
*   **Rule T-2 (Logical Causality):** An edge cannot represent a relationship where a future node influences a past node (e.g., a Decision in 2026 cannot have an `influenced_by` edge linking to a Project started in 2027).

### 3.3 Retrieval Rules
*   **Rule R-1 (Relevance Cutoff):** Hybrid context retrieval limits context outputs to candidate records matching a combined ranking score:
    $$Score \ge 0.65$$
*   **Rule R-2 (Privacy Hashing):** Importers must hash raw PII values (phone numbers, email addresses, external names) before writing node properties, unless explicitly authorized by the user.

### 3.4 AI Behavior Rules
*   **Rule AI-1 (Past-Persona Isolation):** When executing a query under a Past-Persona date, the system must append a metadata filter to SQL queries:
    ```sql
    WHERE created_at <= :cutoff_date
    ```
    This completely blocks the local LLM from reading any future events or skills.
*   **Rule AI-2 (Uncertainty Declaration):** If the LLM generates a projection about the future, it must prepend the tag:
    `[Projection - Confidence: Low/Medium/High]`
    and list the specific habit and goal trends used to compile the prediction.
*   **Rule AI-3 (Grounded Citations):** The LLM must not make a statement about the user's past actions without linking to an inline citation node.

---

## 4. Key Design Decisions & Trade-offs

### 4.1 SQLite + SQLCipher vs. Dedicated Graph DB (Neo4j/Memgraph)
*   **Decision:** Standardize on SQLite with relational graph tables.
*   **Trade-off:** Graph traversal queries are slower than native graph DB algorithms. However, embedding a full Neo4j/Memgraph server inside a client desktop wrapper increases memory usage by $\ge 1$ GB and complicates installation. SQLite is lightweight, serverless, and highly secure when compiled with SQLCipher.

### 4.2 Local Quantized LLM vs. Cloud API
*   **Decision:** 100% on-device model execution (GGUF via llama.cpp/Ollama).
*   **Trade-off:** Quantized 7B/8B models running on consumer CPUs have lower reasoning capabilities and slower output generation speeds compared to Claude 3.5 Sonnet or GPT-4. However, sending a user's private journals and chat logs to cloud servers violates the foundational privacy model of Atlas. Privacy is prioritized over reasoning depth.

### 4.3 Rejected Ideas
*   **Constant Screen Recording (Rewind Clone):** Rejected due to the high storage footprint ($\ge 20$ GB/month) and the security risk of caching raw screenshots containing bank details and passwords in local storage.
*   **Auto Cloud Sync:** Rejected to ensure a clean local-first architecture. Any future sync capability must be designed as an optional peer-to-peer end-to-end encrypted protocol.

---

## 5. Core Algorithms

### 5.1 Hybrid Search Scorer
Calculates the combined relevance score of a node based on semantic cosine similarity, graph link degree, and temporal decay:

```python
def calculate_hybrid_score(semantic_score, graph_degree, node_timestamp, current_time, decay_constant=0.05):
    # Calculate time delta in years
    delta_t = (current_time - node_timestamp) / (1000 * 60 * 60 * 24 * 365.25)
    
    # Calculate exponential decay
    temporal_weight = math.exp(-decay_constant * delta_t)
    
    # Combined score
    score = (0.5 * semantic_score) + (0.3 * min(graph_degree / 10.0, 1.0)) + (0.2 * temporal_weight)
    return score
```

### 5.2 Past-Persona Context Filtering
Filters the database context to match past states of mind:

```python
def filter_context_for_past_persona(db_connection, cutoff_timestamp):
    # Disable retrieval of future events and update references
    query = """
        SELECT id, name, content, entity_type 
        FROM nodes 
        WHERE created_at <= ? 
          AND is_current = 1 
          OR (is_current = 0 AND created_at <= ? AND id NOT IN (
              SELECT parent_version_id FROM nodes WHERE created_at <= ? AND parent_version_id IS NOT NULL
          ))
    """
    return db_connection.execute(query, (cutoff_timestamp, cutoff_timestamp, cutoff_timestamp))
```

---

## 6. Glossary

*   **Identity Graph:** The relational database mapping nodes (entities) and edges (relationships) derived from the user's digital footprint.
*   **Timeline Engine:** The system indexing events and version histories chronologically, enabling point-in-time reconstructions.
*   **Local-First:** System design prioritizing on-device storage and local execution, running normally without external network dependencies.
*   **Past-Persona:** An AI chat retrieval mode that restricts the LLM context to database entries timestamped before a user-selected date.
*   **Identity DNA:** An evidence-backed profile representing core user values, productivity habits, and learning styles, continuously updated by the Reflection Engine.
*   **SQLCipher:** An extension providing page-level AES-256 encryption for SQLite database files.
*   **sqlite-vec:** A C-based extension for SQLite implementing fast on-device vector index matching.

---

## 7. Long-Term Vision

Within 5 years, Atlas aims to transition from a single-device personal identity index to a secure, decentralized identity network. In this phase, individuals will hold absolute control over their digital identities, enabling secure peer-to-peer collaborations (e.g., team graphs) and private knowledge sharing without cloud brokers. Atlas will serve as the permanent, private, and secure repository of a human life—acting as a personal biographer during life and a preserved legacy for future generations.
