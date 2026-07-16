# ATLAS — Google Stitch UI Prompts
**Ready-to-Use Prompt Bank for AI UI Generation**

> Copy-paste any prompt below directly into Google Stitch. Each prompt is self-contained and includes all visual, layout, and interaction context needed for generation.

---

## HOW TO USE
1. Open **Google Stitch** (stitch.withgoogle.com)
2. Choose a prompt from the sections below
3. Paste directly into the prompt field
4. Iterate using the "Refine" follow-up prompts provided after each main prompt

---

## SCREEN 1: DASHBOARD

### Option A — Dark Mode Hero (Recommended)
```
Design a desktop application dashboard for an AI personal identity system called "Atlas". 

Visual style: Dark mode. Background color #090a0f (very dark navy-black). Surface cards use #0f1117 with a subtle 1px border in #1e2030. The accent color is a rich blue (#3b82f6). Typography uses Outfit (headings) and Inter (body).

Layout (1440px wide, full desktop):
- Left sidebar (64px wide, icon-only): Contains icons for Dashboard, Timeline, Graph, Chat, Search. Bottom icons for Settings and Profile. Active icon highlighted with accent blue.
- Main content area fills the rest.

Main content from top to bottom:
1. Top bar: A small breathing green status dot labeled "Synced" on the left. A centered search bar (Ctrl+K) with placeholder "Ask anything about your life...". Right side shows the user avatar and date.
2. Hero section: A large glassmorphic card (semi-transparent dark surface, subtle backdrop blur, thin border) titled "Weekly Reflection — Week of July 14". Contains a short 2-sentence summary in body text. Below it, three small metric chips showing: "23 entities extracted", "4 decisions logged", "6 habits tracked". A button "Explore Full Report →".
3. Three-column grid below the hero:
   - Column 1 "Recent Timeline": A vertical list of 3 event cards. Each card has a colored left border (blue for Project, purple for Decision, green for Goal), a timestamp, and a title.
   - Column 2 "Identity DNA": Three horizontal progress bars labeled "Curiosity", "Persistence", "Focus". Each has a percentage and a small description beneath.
   - Column 3 "Sources": A compact list showing connected data sources (Obsidian, GitHub, Calendar) with green sync checkmarks and last-synced timestamps.

Use glassmorphism for the hero card. All other cards use flat dark surfaces. Spacing is generous (24px padding, 32px gaps). Rounded corners (12px on cards). Subtle box shadows.
```

### Option B — Light Mode Clean Professional
```
Design a desktop dashboard for a personal AI identity app called "Atlas" in light mode.

Background: Near-white #fafafa. Cards: Pure white #ffffff with a 1px border #e8eaf0 and a gentle box shadow (0 2px 8px rgba(0,0,0,0.06)). Accent: Rich blue #2563eb. Typography: Outfit bold for headers, Inter for body. Text primary: #0f1117. Text secondary: #6b7280.

Layout (1280px wide):
- Left sidebar (220px, expanded): Shows Atlas logo at top (a hexagonal graph icon + wordmark). Navigation links: Dashboard (active, blue highlight), Timeline, Graph, Chat, Search. Bottom: Settings, Profile. Each nav item has an icon + label.
- Main area fills remaining width.

Content:
1. Header row: "Good morning, Kshitiz" in Outfit 28px semibold. Subtitle "Monday, July 14 · 3 new reflections ready" in Inter 14px grey.
2. Reflection card (full width): Clean white card with a light blue left accent strip. Title "This Week's Summary". Two-paragraph text with key insight highlighted in bold. Tags at bottom: "6 habits", "2 decisions", "Coding".
3. Two-column layout:
   - Left (60%): "Identity Timeline" — A horizontal mini-timeline showing past 7 days as dots on a line. Below it, 3 recent entity cards with date chips.
   - Right (40%): "DNA Profile" — A radar/spider chart showing 6 traits (Curiosity, Focus, Risk Tolerance, Consistency, Creativity, Leadership). Below it, a "Last Updated" timestamp.

Clean, premium, Apple-inspired. Generous whitespace. No gradients except subtle blue tints on active states.
```

---

## SCREEN 2: AI CHAT INTERFACE

### Option A — Two-Panel Chat with Citation Rail
```
Design a desktop AI chat screen for a personal identity AI called "Atlas". The theme is dark mode, premium, minimal.

Colors: Background #090a0f. Surface #0f1117. Border #1e2030. Accent blue #3b82f6. Text primary #f5f5f5. Text muted #9ca3af. Font: Inter.

Layout (three panels horizontally):

LEFT PANEL (240px) — Thread History:
- Header: "Conversations" with a "+ New" button.
- List of 4-5 past conversation threads. Each shows: Thread title (truncated), date chip (e.g. "Jul 14"), and a small topic tag (blue pill). Active thread highlighted.
- Bottom: A temporal persona switcher toggle. Shows "Current You" by default. A calendar icon allows switching to "Past You — Select Date". When active, the entire panel shows a subtle amber tint.

CENTER PANEL (flexible) — Chat Area:
- Top bar: Shows thread title and active persona badge ("2026 · Full Context").
- Chat messages vertically stacked:
  - User message: Right-aligned, dark blue background pill (#1e3a5f), white text, Inter 14px.
  - AI response: Left-aligned, dark surface card (#1a1d27), white text with inline citation markers like [1] [2] in blue monospace (JetBrains Mono 12px). Response ends with a confidence bar: "Confidence: High — 94%" shown as a small progress bar.
- Show one full exchange: User asks "What was I working on in early 2025?" and Atlas gives a 3-sentence cited response referencing projects.
- Bottom input: Full-width input with placeholder "Ask anything about your life...", send button (blue arrow), and a small model selector showing "Qwen 7B ▾".

RIGHT PANEL (280px) — Citation Sources:
- Header: "Sources Used [3]"
- Three source citation cards stacked vertically. Each card:
  - Top: Entity type badge (e.g. "PROJECT", "DECISION") in colored capsule.
  - Title of the entity (e.g. "Verdict AI Hackathon").
  - File path in JetBrains Mono 11px (muted): ~/obsidian/projects/verdict.md
  - Date range chip: "Mar 2025 – Apr 2025"
  - Confidence bar: small horizontal bar, green fill.
- Bottom: "View in Graph" and "Open File" buttons.

Glassmorphism on the right panel overlay. Subtle dividers between panels (1px #1e2030). Scrollable center panel.
```

### Option B — Minimal Single Column Chat
```
Design a minimal, full-width AI chat interface for "Atlas", a local-first personal AI app. Dark mode.

Background: #07080d. Max content width: 720px centered. Padding: 64px left/right.

Style: Apple Notes meets Linear. Calm, distraction-free. No sidebars.

Top bar (full width, sticky):
- Left: Back arrow + "New Conversation" breadcrumb.
- Center: A persona mode switcher — three pills: "Past You" | "Present" (active, blue) | "Future".
- Right: Model name "Llama 3.8B" with a gear icon.

Chat messages:
- User bubble: A simple grey-dark pill aligned right with white text. No avatar.
- Atlas response: Left aligned, no bubble. Flows as plain rich text directly on the background. Citation numbers appear as superscript blue tags [¹] [²]. A subtle horizontal line separates each AI response from the next user message.
- After each response: A small row of meta tags: "📂 4 sources · ⏱ 2024–2025 · 🎯 Confidence: 91%". Clicking "4 sources" expands an inline accordion showing the source list.

Input area (bottom sticky):
- Thin, floating pill input (not a full-width box). Rounded pill shape. Send arrow inside. Faint glow when active.
- Below input: Small disclaimer "All answers cite local files only. No cloud." in 10px muted text.

Fonts: Inter only. Very tight spacing. Very clean.
```

---

## SCREEN 3: TIMELINE VIEW

### Option A — Horizontal Chronological Timeline
```
Design a desktop Timeline screen for a personal AI system called "Atlas". Dark mode, data-rich but clean.

Background: #090a0f. Primary surface: #0f1117. Accent: #3b82f6.

Layout:
- Sticky top bar: Title "Your Timeline". Filter pills: All | Projects | Decisions | Habits | Memories. Date jump input on the right ("Jump to: July 2024"). Zoom buttons: Day / Week / Month / Year.

Main content — Horizontal Timeline Canvas:
- Full-width horizontal timeline track with a thin continuous line (1px, #2a2d3e) running center.
- Year markers above the line in large Outfit 20px semibold: "2023", "2024", "2025", "2026".
- Month markers below the line as small Inter 11px labels: "Jan", "Feb", etc.
- Vertical event nodes sitting ON the timeline line — small colored circles (12px diameter):
  - Blue for Project
  - Purple for Decision
  - Green for Goal/Achievement
  - Amber for Habit change
  - Grey for Memory
- Dense periods show clustered nodes that merge into a numbered badge (e.g. "+7 events").

Below the timeline — Entity Cards:
- When a timeline node is selected (show one active state): A card slides up from below. The card shows:
  - Entity type badge (top left, colored capsule).
  - Title in Outfit 18px semibold.
  - Date range chip.
  - 2-sentence description.
  - Tags (skill tags, source tags).
  - Source path in monospace.
  - Two action buttons: "Open in Graph" and "Ask Atlas About This".

Left edge: Vertical category legend (colored dots with labels). Right edge: Scrollbar / zoom indicator.
```

### Option B — Vertical Feed Timeline (Instagram-style)
```
Design a vertical scrollable timeline for Atlas, a personal AI app. Think "GitHub contributions" meets "personal history log".

Style: Dark mode. #090a0f base. Cards use #111318 surface. Inter font. Calm, premium.

Layout: Single centered column, 680px wide, centered on screen.

Left sidebar (thin, 56px): Just navigation icons (home, graph, chat, search). Icon-only, no labels.

Main column — Vertical timeline list:
- A thin vertical grey line runs down the center-left of the column.
- Timeline entries hang off this line via a connector dot.
- Each entry is a flat card (no shadow, just a 1px #1e2030 border, 16px padding, 12px radius):
  - Top row: Colored entity type badge + Date chip on the right.
  - Second row: Bold title (Outfit 16px semibold).
  - Third row: Body text (Inter 13px, muted, 2 lines max).
  - Bottom row: Tag pills (blue, small) + "3 related nodes" clickable count.

Show 5 entries of mixed types: A project launch, a decision, a skill acquired, a goal completed, a memory.

Between entry groups: Month separators styled as a small sticky label ("March 2025") pinned to the side of the vertical line.

Top of page: A small GitHub-style contribution heatmap (52 weeks × 7 days grid of tiny squares). Darker squares = more entity extractions. Blue color scale. Label: "Activity — July 2025 to July 2026".
```

---

## SCREEN 4: IDENTITY GRAPH VISUALIZATION

### Option A — Force-Directed Canvas
```
Design a full-screen Identity Graph visualization for "Atlas", a personal AI app. Dark mode, data-visualization aesthetic.

Background: #05060b (near-black). The canvas takes the full screen. Think "network diagram" meets "galaxy map".

Graph canvas elements:
- Node types, represented as glowing circles:
  - Large nodes (28px): Core "You" node at center — bright white with a soft outer glow.
  - Medium nodes (16px): Projects (blue), Skills (cyan), Goals (green), People (amber), Decisions (purple).
  - Small nodes (10px): Individual memories, events, habits (grey).
- Edges: Thin lines (0.5px) connecting nodes. Color matches source node type. Semi-transparent (40% opacity). Show directional arrows on hover.
- Node labels: Short text labels next to each node (10px Inter, white 70% opacity). Only visible from mid-zoom or closer.

Show approximately 30-40 nodes in various clusters:
- A "Coding Projects" cluster (blue nodes) connected to "Skills" (cyan nodes).
- A "Goals 2025" cluster connected to multiple project nodes.
- A "People" cluster (amber) connected to relevant project nodes.

Left panel (240px, glassmorphic overlay):
- Header: "Identity Graph" with entity count "142 nodes · 389 edges".
- Filter toggles for each entity type (with colored icons and on/off switches).
- Zoom slider.
- "Focus on:" dropdown with options like "Career", "Relationships", "Learning".

Bottom bar (thin, full-width):
- Timeline mini-slider: "Viewing: All time" with drag handles to restrict date range.
- When restricted: Nodes outside the selected range fade to 20% opacity.

Right panel (appears on node click, 280px, slides in):
- Node name large (Outfit 20px).
- Entity type badge.
- Connected edges count.
- Description text.
- "View on Timeline" and "Ask Atlas" buttons.
```

---

## SCREEN 5: ONBOARDING / SETUP

### Option A — Premium Onboarding Wizard
```
Design an onboarding screen (step 2 of 4) for Atlas, a local-first AI identity app. Step: "Connect your data sources".

Style: Dark mode. Background #090a0f. Surface cards #0f1117. Accent blue #3b82f6. Outfit + Inter fonts. Premium, calm, trustworthy — like setting up an Apple device for the first time.

Layout (centered, 560px max width):
Top: Step indicator — four small dots, second dot filled blue, others grey. Label "Step 2 of 4 — Choose your sources".

Below: Large heading "What do you want Atlas to learn from?" (Outfit 28px semibold, white).
Subheading: "All selected sources stay on your device. Nothing is uploaded." (Inter 14px, muted). 

Source selection grid (2 columns, 3 rows):
Each source is a selectable card (bordered box, 16px padding):
- Icon (simple line icon) + Source name (Inter 16px semibold) + Short description (12px muted).
- When selected: Border turns accent blue, a checkmark appears top-right, background gets a faint blue tint.
- Sources to show: Obsidian Notes, GitHub, Google Calendar, WhatsApp Exports, PDF Library, Browser History.

Bottom of each card: A small pill showing the data type: "Text", "Commits", "Events", "Messages".

Below the grid: A disclaimer strip — a small shield icon + "Atlas reads files locally. No data leaves your device." (Inter 12px, muted grey).

Two buttons at bottom: "← Back" (ghost button) and "Continue →" (solid blue button, full-width, 48px tall, 12px radius).

The overall mood is: Calm setup experience — like a high-trust product. No cluttered explanations. Clean breathing room.
```

---

## REFINEMENT FOLLOW-UP PROMPTS

Use these after generating any screen above to iterate:

### To increase premium feel:
```
Make it more premium and minimal. Reduce the number of visible elements. Increase white space between sections. Make the typography feel more expensive — larger headings, tighter letter spacing. Reduce border visibility. Add a very subtle gradient to the background (top slightly lighter than bottom).
```

### To add glassmorphism:
```
Apply glassmorphism to the hero card and any overlay panels. Use backdrop-filter: blur(20px). Give the glass elements a semi-transparent background (rgba(255,255,255,0.03) for dark mode). Add a very subtle inner highlight on the top edge (1px white 8% opacity border-top).
```

### To make it more data-dense (power user mode):
```
Make the layout more information-dense. Show more data in the same space. Use tighter spacing (8px gaps instead of 24px). Add a second column to the sidebar. Make cards more compact with less padding. Show metadata inline instead of in separate sections.
```

### To convert to light mode:
```
Convert this design to light mode. Background becomes #fafafa. Cards become pure white (#ffffff) with 1px #e8eaf0 borders and a soft shadow (0 2px 12px rgba(0,0,0,0.05)). Text primary becomes #0f1117. Text secondary becomes #6b7280. Accent blue remains #2563eb but slightly more saturated. Remove any glow effects and replace with subtle shadows.
```
