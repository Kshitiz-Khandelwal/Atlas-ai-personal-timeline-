# Atlas — The Identity Operating System

Atlas is a **Local-First AI Identity System** designed to ingest, structure, and understand the entirety of an individual's digital life to build a living, time-aware model of their identity.

Unlike flat search indexes (RAG) or transient chat history databases, Atlas maps **identity over information**. It models people, events, projects, goals, habits, skills, and beliefs as a connected, versioned **Identity Graph** anchored to a high-fidelity **Timeline Engine**.

---

## Key Core Principles

1. **Local-First & Offline:** All computations, vector calculations, and local AI model inferences (Ollama/llama.cpp) happen strictly on the user's physical device. No telemetry, no cloud sync by default, and no tracking.
2. **Time-Aware Evolution:** Evolving beliefs, goals, and projects are tracked through temporal versioning. Atlas answers queries within specific past frames of mind (e.g. "Talk to 2024 self") without contamination from hindsight bias.
3. **Structured Graph Relations:** Parses notes (Obsidian), code history (GitHub), and schedules (Calendar) to map directed, typed relationships.
4. **Explainable Intelligence:** Every generated reflection and answer is traceably cited back to local source file pathways with mathematical confidence scores.

---

## Repository Structure & Design Suite

This repository contains the full, production-ready design and architectural specification documents for Atlas:

*   **[01_PRD.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/01_PRD.md):** Product Requirements Document detailing 6 target user personas, 50 detailed user stories, and strict verification metrics.
*   **[02_UX_AND_APP_FLOW.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/02_UX_AND_APP_FLOW.md):** User Journey flowcharts, comprehensive 19-screen detail specifications, and visual wireframe guidelines.
*   **[03_TRD.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/03_TRD.md):** Technical Requirements Document outlining Tauri frontend containers, Rust Core engines, ONNX embedding systems, and IPC APIs.
*   **[04_DATABASE_DESIGN.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/04_DATABASE_DESIGN.md):** Detailed generalization-specialization schema layout, SQLite SQL DDL schemas, and syntax-valid Prisma models (`schema.prisma`).
*   **[05_DESIGN_SYSTEM.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/05_DESIGN_SYSTEM.md):** CSS custom variable tokens, dark/light styling rules, custom timeline components, and force-directed WebGL canvas designs.
*   **[06_IMPLEMENTATION_PLAN.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/06_IMPLEMENTATION_PLAN.md):** 6-phase 90-day execution roadmaps, QA, Security, and Launch checklists.
*   **[07_ARCHITECTURE_BIBLE.md](file:///c:/Users/Admin/Desktop/Kshitiz/Atlas/07_ARCHITECTURE_BIBLE.md):** Structural theories, design trade-offs, graph acyclic rules, and hybrid contextual search algorithms.
