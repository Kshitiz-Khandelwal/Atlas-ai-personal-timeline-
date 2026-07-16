# ATLAS — UI/UX Design System Document
**Document 5 of 7 · Version 1.0 · Design Guidelines**

---

## 1. Brand Personality & Design Principles

The Atlas user interface is designed to evoke a sense of quiet focus, cognitive clarity, and absolute security. It draws inspiration from Apple’s structural hardware minimalism, Linear's crisp border grids, and Notion's spatial document typography.

### 1.1 Core Design Principles
*   **Cognitive Calmness:** Limit screen clutter. Avoid loud saturated banners or intrusive dialogs. Settle information on structured canvas boards.
*   **Micro-Structural Depth:** Use subtle drop shadows, semi-transparent overlays (glassmorphic backdrops), and crisp 1px borders to establish spatial hierarchy.
*   **Aesthetic Intentionality:** Every line, color accent, and motion animation exists to convey meaning—such as tracing relationships or representing timeline density.
*   **Explainable Visuals:** Graph nodes, citation links, and DNA traits must visibly display their supporting source metadata when hovered or selected.

---

## 2. Design Tokens

Design tokens are structured to maintain consistent spacing, colors, and layout metrics across all application layers.

### 2.1 Color Palette (HSL System)

```
Backgrounds (Dark Mode Base):   hsl(240, 10%, 4%)
Backgrounds (Light Mode Base):  hsl(0, 0%, 98%)
Border/Stroke (Neutral):        hsl(240, 5%, 84%) [Light] / hsl(240, 6%, 15%) [Dark]
Accent Primary (Active Blue):   hsl(215, 80%, 55%)
Accent Confidence (High):       hsl(142, 60%, 45%)
Accent Confidence (Medium):     hsl(37, 75%, 50%)
Accent Confidence (Low):        hsl(0, 70%, 50%)
```

### 2.2 Typography Scale
*   **Font Family Primary:** `Outfit`, sans-serif (Display and Titles)
*   **Font Family Secondary:** `Inter`, sans-serif (Body and interface controls)
*   **Font Family Monospace:** `JetBrains Mono` (Citations, paths, code logs)

| Token Name | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `font-size-h1` | 32px (2.0rem) | 1.2 | 600 (Semi-Bold) | Dashboard & Section Headers |
| `font-size-h2` | 24px (1.5rem) | 1.3 | 600 (Semi-Bold) | Module Sub-Headers / Cards |
| `font-size-body` | 14px (0.875rem) | 1.5 | 400 (Regular) | Body text, chat bubbles |
| `font-size-sm` | 12px (0.75rem) | 1.4 | 500 (Medium) | Citations, metadata details |
| `font-size-xs` | 10px (0.625rem) | 1.3 | 500 (Medium) | Subtitle tags, confidence scores|

### 2.3 Grid & Spacing Scale
Atlas uses an 8px base spacing grid system.

| Spacing Token | Value (px) | Usage |
| :--- | :--- | :--- |
| `spacing-xxs` | 4px | Small item gaps, sub-details |
| `spacing-xs` | 8px | Padding within tight cards, tags |
| `spacing-sm` | 16px | Standard button spacing, list margins |
| `spacing-md` | 24px | Main card padding, layout gutters |
| `spacing-lg` | 32px | Section margins |
| `spacing-xl` | 64px | Outer layout margins |

---

## 3. Light & Dark Themes

Themes are managed using standard CSS variables mapped to system root selectors. Dark theme is the application default.

### 3.1 Theme Variables

```css
/* Dark Mode Defaults */
:root {
  --color-bg-base: hsl(240, 10%, 4%);
  --color-bg-surface: hsl(240, 10%, 8%);
  --color-bg-overlay: hsla(240, 10%, 12%, 0.7);
  --color-border-subtle: hsl(240, 6%, 15%);
  --color-text-primary: hsl(0, 0%, 95%);
  --color-text-secondary: hsl(240, 4%, 65%);
  --color-accent-blue: hsl(215, 80%, 55%);
  --color-shadow: rgba(0, 0, 0, 0.4);
}

/* Light Mode Overrides */
[data-theme="light"] {
  --color-bg-base: hsl(0, 0%, 98%);
  --color-bg-surface: hsl(0, 0%, 100%);
  --color-bg-overlay: hsla(0, 0%, 94%, 0.7);
  --color-border-subtle: hsl(240, 5%, 88%);
  --color-text-primary: hsl(240, 10%, 10%);
  --color-text-secondary: hsl(240, 4%, 40%);
  --color-accent-blue: hsl(215, 85%, 48%);
  --color-shadow: rgba(0, 0, 0, 0.05);
}
```

---

## 4. Motion & Micro-interactions

Animations use CSS keyframes and spring-based transitions to maintain a tactile, organic UI response.

*   **Standard Transition (Ease-Out-Quad):** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
*   **Card Hover Scale:** `transform: scale(1.01) translateY(-2px);` with `200ms` duration.
*   **Timeline Scroll Transition:** Progressive fade-in of timeline cards as virtual scroll coordinates enter the viewport.
*   **Graph Node Selection:** Pulse effect (expanding radial ring) on click, with sibling nodes animating to $0.4$ opacity to focus target connection links.
*   **Chat Output Streaming:** Simulated vertical auto-scroll updates lock scroll positions to bottom only if user has not scrolled upward past current threshold coordinates.

---

## 5. Component Library Specifications

### 5.1 Timeline Components

```
Horizontal Chrono-Band Layout:
+-------------------------------------------------------------+
| [2024]                 [2025]                    [2026]     |
| ---o----------------------o-------------------------o------ |
|    |                      |                         |       |
|  [Decision: Grad]       [Project: Verdict]       [Goal Met] |
+-------------------------------------------------------------+
```

*   **Chrono-Band Track:** A horizontal accent line with small node markers. The size and color of indicators reflect density (higher event frequency = larger node marker).
*   **Entity Card:** A clean, rectangular container. Inside padding: `16px`. Features:
    *   *Top-Left:* Colored icon indicating entity classification type (e.g. green for Goal, purple for Skill).
    *   *Top-Right:* Text indicating confidence level (e.g. "94%").
    *   *Body:* Node title, short parsed snippet.
    *   *Bottom:* Provenance trail path display.

### 5.2 Graph Components
*   **Node Canvas (Force-Directed Graph):**
    *   *Nodes:* Solid colored circles surrounded by a subtle outer border. Standard radius values: Base (12px), Important (24px).
    *   *Edges:* Semi-transparent lines (`hsla(240, 6%, 15%, 0.5)`). Arrow markers indicate link directionality.
    *   *Interaction:* Drag node to pin in place, double-click to release physics engine, hover to view quick tooltips.

### 5.3 Chat UI
*   **Input Box Container:** A bottom-pinned, glassmorphic layout panel. Features:
    *   *TextArea Input:* Multi-line auto-expand textbox.
    *   *Controls:* Left toggle opens Temporal Persona Date picker; Right shows Model selector and execute arrow button.
*   **Response Bubbles:**
    *   *Inline Citation Marker:* JetBrains Mono font tag (`[1]`). Hovering changes background to primary blue, triggering highlighting on the referenced node in the citation sidebar panel.

### 5.4 Dashboard Widgets
*   **Activity Density Heatmap:** An array of colored squares representing commit and note frequency levels (modeled after GitHub contributions). Colors range from base surface grey to accent primary blue.
*   **DNA Trait Progress Bar:** A linear track bar detailing trait scores:
    *   *Track background:* Subtle grey border line.
    *   *Progress Fill:* Accent primary blue gradient.
    *   *Label:* Trait name (Left), value title (Right).

### 5.5 Reflection Views
*   **Reflection Layout Modal:** Split-screen design:
    *   *Left Column (70% Width):* Ingests parsed reflection copy with bold header metrics and clean typography.
    *   *Right Column (30% Width):* Vertically stacked "Evidence Cards" detailing every node referenced in the generated summary.

### 5.6 Search Experience
*   **Global Search Hub (`Ctrl + K`):** An overlay modal displaying a list of recent files, a search query input, and quick-action filters. Selecting a result focuses on the timeline or centers the graph node on-screen.

---

## 6. Accessibility & Figma Component Suggestions

### 6.1 Accessibility Standards (WCAG 2.1 AA)
*   **Color Contrast:** Ensure all typography has a minimum contrast ratio of 4.5:1 against backgrounds.
*   **Keyboard Navigation:** All button assets, sliders, input text boxes, and dropdown controls must support focus indicator states and respond to standard key mappings (e.g. `Tab` to navigate, `Esc` to dismiss modals, `Enter` to submit).
*   **Screen Reader Tags:** Interactive components feature descriptive `aria-label` tags (e.g. `aria-label="Set past persona date"`).

### 6.2 Figma Component Setup Recommendations
*   **Foundational Grids:** Establish layout grids with `8px` spacing increments.
*   **Library Variants:** Create components for Cards, Inputs, and Sidebar buttons with explicit state variants (`Default`, `Hover`, `Focus`, `Active`, `Disabled`).
*   **Color Styles:** Group colors into semantic tokens (`Background/Base`, `Border/Subtle`, `Text/Primary`, `Confidence/High`) to ensure easy mapping during Light/Dark theme conversions.
