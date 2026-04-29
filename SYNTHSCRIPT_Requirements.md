# SYNTHSCRIPT — JavaScript Learning Platform
## Developer Requirements Document

**Version:** 1.0  
**Stack:** Vite + React + TypeScript  
**Target:** Low-spec laptop / desktop browser + mobile responsive  
**Theme:** Synthwave / Vaporwave — terminal monospace aesthetic

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack Decisions](#3-tech-stack-decisions)
4. [Feature Requirements](#4-feature-requirements)
   - 4.1 Layout & UI Shell
   - 4.2 Lesson Content System
   - 4.3 Code Editor
   - 4.4 Sandboxed Execution Engine
   - 4.5 Syntax Checker (Two-Layer)
   - 4.6 Feedback Panel
   - 4.7 Console Output Panel
   - 4.8 Lesson Interactivity
   - 4.9 Progress & State Persistence
   - 4.10 Responsive / Mobile Layout
5. [Data Schemas](#5-data-schemas)
6. [Non-Functional Requirements](#6-non-functional-requirements)

---

## 1. Project Overview

SYNTHSCRIPT is a self-contained, offline-capable JavaScript learning platform. It teaches JavaScript from first principles using interactive lessons, a live code editor, real-time syntax feedback, and a sandboxed console. It is designed to run entirely in the browser — no backend, no database, no accounts. All state persists locally via `localStorage`.

The platform has three core panels:

| Panel | Purpose |
|---|---|
| Lesson List (Sidebar) | Navigate between lessons; track completion |
| Lesson Content | Read lesson material, run examples, answer quizzes |
| Editor + Feedback + Console | Write code, receive syntax guidance, see output |

---

## 2. Architecture Overview

```
src/
├── main.tsx                  # Vite/React entry point
├── App.tsx                   # Root layout + panel routing
├── store/
│   ├── lessonStore.ts        # Zustand — active lesson, progress, completion state
│   └── editorStore.ts        # Zustand — current code per lesson, run history
├── data/
│   └── lessons.ts            # Flat lesson data array (TypeScript)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileTabBar.tsx
│   │   └── StatusBar.tsx
│   ├── lesson/
│   │   ├── LessonPanel.tsx
│   │   ├── LessonSection.tsx   # Renders text / code-example / quiz / challenge
│   │   ├── QuizBlock.tsx
│   │   └── CodeExample.tsx
│   ├── editor/
│   │   ├── EditorPanel.tsx
│   │   └── useEditor.ts        # CodeMirror hook
│   ├── checker/
│   │   ├── syntaxChecker.ts    # Layer 1: @babel/parser
│   │   ├── ruleEngine.ts       # Layer 2: AST visitor rules
│   │   ├── messages.ts         # Human-readable message dictionary
│   │   └── FeedbackPanel.tsx
│   └── console/
│       ├── ConsolePanel.tsx
│       └── Sandbox.tsx         # iframe sandboxed executor
├── styles/
│   ├── tokens.css              # CSS custom properties (all colours, fonts)
│   └── global.css
└── types/
    └── lesson.ts               # TypeScript interfaces for lesson data
```

---

## 3. Tech Stack Decisions

### 3.1 Build Tool — Vite

- Use `npm create vite@latest` with the `react-ts` template.
- Vite provides near-instant HMR, native ESM, and zero-config TypeScript support.
- No custom Vite plugins needed for this project beyond the default React plugin (`@vitejs/plugin-react`).
- For offline support, add `vite-plugin-pwa` to generate a Service Worker that caches the built assets after the first load.

### 3.2 Code Editor — `@uiw/react-codemirror`

**Chosen over raw CodeMirror 6 for React projects.**

`@uiw/react-codemirror` is a well-maintained React wrapper around CodeMirror 6. It exposes a proper React component with controlled state, TypeScript definitions, and a hook API (`useCodeMirror`) for advanced use. It has been updated as recently as January 2026.

```
npm install @uiw/react-codemirror
npm install @codemirror/lang-javascript
npm install @codemirror/lint
npm install @codemirror/theme-one-dark   # or use a custom theme
```

Key packages to use:

| Package | Purpose |
|---|---|
| `@uiw/react-codemirror` | React component wrapper |
| `@codemirror/lang-javascript` | JS syntax highlighting + autocompletion |
| `@codemirror/lint` | Inline diagnostic markers (underlines, gutter icons) |
| `@codemirror/state` | Editor state serialization for `localStorage` persistence |
| `@codemirror/commands` | Keymaps including `Ctrl+Enter` to run |

**Do not** use the deprecated `react-codemirror2` package.

**Theme:** Implement a custom synthwave theme via CodeMirror 6's `createTheme` API using the design tokens from `tokens.css`. Do not use `@codemirror/theme-one-dark` in production — it is only for dev reference.

### 3.3 Syntax Checker / Parser — `@babel/parser`

**Chosen over Acorn** because Babel is already present in the Vite build chain and its parser has a critical feature for educational use: `errorRecovery: true`. When this option is set, the parser does not throw on the first error — it collects all parse errors into an `ast.errors` array and continues parsing. This means multiple errors can be surfaced to the student simultaneously rather than stopping at the first one.

```
npm install @babel/parser
```

Usage pattern:

```ts
import { parse } from '@babel/parser';

const ast = parse(code, {
  sourceType: 'script',
  errorRecovery: true,       // collect all errors, don't throw
  plugins: ['estree'],       // ESTree-compatible output
});

// ast.errors → array of { message, loc.line, loc.column }
// ast.program → full AST for rule engine to walk
```

### 3.4 Sandboxed Code Execution — Custom iframe + postMessage

**Chosen over Sandpack** for this use case.

Sandpack (`@codesandbox/sandpack-react`) is a full in-browser bundler. It is powerful but significantly heavier than needed here — we are only running plain JavaScript, not React or npm packages. For a low-spec machine running educational JS, a custom sandboxed `<iframe>` with `sandbox="allow-scripts"` is sufficient, lighter, faster, and fully offline.

The iframe approach is the same mechanism used by CodePen, JSFiddle, and MDN Playground.

**If the curriculum ever expands to React/Node lessons**, consider switching to Sandpack or StackBlitz WebContainers at that point. For JavaScript fundamentals, the iframe sandbox is the correct tool.

Architecture:

- A hidden `<iframe sandbox="allow-scripts">` is rendered by the `Sandbox.tsx` component.
- Before execution, `console.log`, `console.warn`, `console.error`, `console.info`, and `window.onerror` are overridden inside the iframe to call `parent.postMessage(...)`.
- The parent React app listens for these messages and renders them in the Console panel.
- Code is injected via `iframe.srcdoc` — the entire document is replaced on each run, giving a clean execution context with no state bleed between runs.

### 3.5 State Management — Zustand

**Chosen for simplicity and zero boilerplate.**

Zustand (approx. 3KB) uses a hooks-based store model with no providers, no reducers, and no action types. It is ideal for this app's two main state concerns:

- **`lessonStore`** — which lesson is active, which lessons are completed, quiz answers per lesson.
- **`editorStore`** — the current code content per lesson (keyed by lesson ID), run history.

Zustand's `persist` middleware will be used to synchronize both stores with `localStorage` automatically.

```
npm install zustand
```

**Do not use** Redux or Jotai for this project. Redux is overkill. Jotai's atomic model adds unnecessary complexity for the relatively flat state shape here.

### 3.6 Routing

No router library required. The app is a single-page layout. Mobile panel switching is handled by a simple `activePanel` state field in the lesson store (`'lessons' | 'lesson' | 'editor'`). Tab switching calls `setActivePanel()` — no URL changes needed.

### 3.7 Styling

- **Plain CSS Modules** (`.module.css`) per component, scoped by Vite automatically.
- A single `tokens.css` file at the root defines all CSS custom properties (colours, fonts, glow values). All components import and reference these variables.
- **No Tailwind**, no CSS-in-JS, no styled-components. These add friction for a custom design system built around specific design tokens.
- **Fonts:** Load `Orbitron` (headings/logo) and `Share Tech Mono` (body/code) from Google Fonts via a `<link>` in `index.html`. These are the same fonts used in the UI mockup.

### 3.8 Testing — Vitest

```
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Vitest is the natural testing framework for Vite projects — it shares the Vite config, supports ESM natively, and is 3–4x faster than Jest. All unit tests for the rule engine and message dictionary should be written in Vitest.

### 3.9 Offline Support — `vite-plugin-pwa`

```
npm install -D vite-plugin-pwa
```

Configure to cache all built assets on first load so the app runs fully offline thereafter. This is important for the stated constraint of running on a low-spec laptop with potentially unreliable connectivity.

---

## 4. Feature Requirements

---

### 4.1 Layout & UI Shell

**Description:** The top-level layout that contains all panels.

| ID | Requirement |
|---|---|
| L-01 | The app shell must consist of: `<Header>`, `<Workspace>` (containing the panels), `<MobileTabBar>` (mobile only), and `<StatusBar>`. |
| L-02 | On **desktop** (viewport ≥ 801px), the workspace uses a CSS Grid with three columns: `220px` sidebar, `1fr` lesson panel, `1fr` editor column. |
| L-03 | On **mobile** (viewport ≤ 800px), the grid collapses to a single column. Only one panel is visible at a time, controlled by `activePanel` state. |
| L-04 | The full viewport height must be used. The header, tab bar, and status bar are fixed height. The workspace flex-grows to fill the remaining height. |
| L-05 | All text uses `Share Tech Mono` monospace font. Section/panel headings use `Orbitron`. |
| L-06 | A scanline effect (`repeating-linear-gradient`) and a perspective grid (`transform: perspective rotateX`) are rendered as CSS `::before`/`::after` pseudo-elements on `body`. Both are `pointer-events: none` and `z-index: 9000`. |
| L-07 | A status bar at the bottom always shows: sandbox status dot, issue count, active rule set, cursor position (line/column), and language mode. |

---

### 4.2 Lesson Content System

**Description:** The data model and rendering system for lesson material.

| ID | Requirement |
|---|---|
| LC-01 | All lesson data lives in `src/data/lessons.ts` as a TypeScript array of `Lesson` objects. See [Data Schemas](#5-data-schemas) for the full interface. |
| LC-02 | Each lesson has a unique `id`, `title`, `difficulty` (`beginner` / `intermediate` / `advanced`), `estimatedMinutes`, an `activeRules` array, and a `sections` array. |
| LC-03 | Each section has a `type` field. Supported types: `text`, `code-example`, `quiz`, `challenge`. |
| LC-04 | **Text sections** render Markdown-like content. Support bold (`**text**`), inline code (`` `code` ``), and unordered lists. A minimal client-side parser handles this — no external Markdown library required. |
| LC-05 | **Code-example sections** render a read-only, syntax-highlighted code block. A "▶ Run Example" button below the block sends the code to the sandbox and shows output in the console. |
| LC-06 | **Quiz sections** render a multiple-choice question with 2–4 options. Tapping an option reveals inline feedback (correct ✓ / wrong ✕) with an explanation. Once answered, all options become non-interactive for that session. |
| LC-07 | **Challenge sections** render a prompt, a pre-populated code editor (starter code), optional hints, and optional automated tests. See [4.3](#43-code-editor) and [4.5](#45-syntax-checker-two-layer). |
| LC-08 | Lesson navigation uses Previous / Next buttons in the lesson footer and section progress dots. |
| LC-09 | Lesson progress (started, completed, quiz answers) is persisted to `localStorage` via Zustand's `persist` middleware. |
| LC-10 | A sidebar search input filters the lesson list client-side by title. |
| LC-11 | Completed lessons show a green ✓ icon. The active lesson shows a cyan ▶ icon. Locked/future lessons show a dimmed ○. |

---

### 4.3 Code Editor

**Description:** The interactive code writing area powered by `@uiw/react-codemirror`.

| ID | Requirement |
|---|---|
| E-01 | The editor component is built using `@uiw/react-codemirror` with the `javascript()` language extension. |
| E-02 | The editor theme must be a custom synthwave theme using CSS variables from `tokens.css`. It must NOT use the default `oneDark` theme in production. |
| E-03 | When a challenge section is active, the editor is pre-populated with the `starterCode` field from the lesson data. |
| E-04 | A **Reset** button restores the starter code with a confirmation prompt. |
| E-05 | A **Run** button (and `Ctrl+Enter` keyboard shortcut) triggers the execution pipeline: syntax check → execution gate → sandbox run. |
| E-06 | Editor state for each lesson is persisted to `localStorage` (keyed by `lessonId`) via `editorStore`. Work in progress is never lost on page reload. |
| E-07 | The `@codemirror/lint` extension is integrated. After each run, the syntax checker feeds its results into the lint extension, which renders: colored underlines on error tokens, gutter icons (❌ / ⚠️) on error lines, and tooltip messages on hover. |
| E-08 | Lint markers are cleared immediately when the student begins editing (on any keystroke). |
| E-09 | Two editor tabs exist: `challenge.js` (the lesson challenge, has rules applied) and `scratch.js` (a free-form scratchpad, no rules enforced). |
| E-10 | The active line is highlighted with a subtle background. Error lines have a dashed pink underline across the full line width. |

---

### 4.4 Sandboxed Execution Engine

**Description:** The mechanism for safely running student-written JavaScript.

| ID | Requirement |
|---|---|
| S-01 | Code is executed inside a hidden `<iframe>` with `sandbox="allow-scripts"`. The iframe has no `src` — content is set via `srcdoc` on each run. |
| S-02 | Before injecting student code, a preamble script inside the iframe overrides `console.log`, `console.warn`, `console.error`, and `console.info` to call `window.parent.postMessage({ type, args, timestamp }, '*')` instead of the native console. |
| S-03 | `window.onerror` is also overridden in the preamble to forward runtime errors as `type: 'error'` messages via `postMessage`. |
| S-04 | The parent `Sandbox.tsx` component adds a `message` event listener. Messages are validated (check `event.source === iframeRef.current.contentWindow`) before being passed to the console store. |
| S-05 | Each run replaces the entire `iframe.srcdoc` content. This gives a clean, stateless execution context per run — no variable bleed between runs. |
| S-06 | Console output is limited to a maximum of 200 lines. When the limit is reached, older lines are removed from the top. |
| S-07 | A run timeout of 5 seconds is enforced. If the iframe does not complete within 5 seconds, an error message is shown: `"Execution timed out after 5s — check for infinite loops"`. |
| S-08 | When the student switches lessons or resets code, the sandbox is cleared (iframe `srcdoc` reset to blank). |

---

### 4.5 Syntax Checker (Two-Layer)

**Description:** A pre-execution pipeline that catches and explains syntax problems before code ever runs.

#### Layer 1 — Parser (`@babel/parser`)

| ID | Requirement |
|---|---|
| SC-01 | Before execution, the student's code is passed to `@babel/parser` with `errorRecovery: true` and `sourceType: 'script'`. |
| SC-02 | All entries in `ast.errors` are extracted. Each entry has `message`, `loc.line`, and `loc.column`. |
| SC-03 | The raw Babel error messages are mapped through `messages.ts` (see SC-10) to produce human-readable equivalents. |
| SC-04 | If `ast.errors` contains any items, they are classified as `severity: 'error'`. |

#### Layer 2 — Custom Rule Engine

| ID | Requirement |
|---|---|
| SC-05 | If parsing succeeds (no errors), the AST is passed to the rule engine. |
| SC-06 | The rule engine walks the AST using a simple visitor pattern. It only runs rules listed in the current lesson's `activeRules` array. |
| SC-07 | Each rule is a function `(ast, sourceCode) => Diagnostic[]`. Rules are imported by ID and composed at runtime based on the lesson config. |
| SC-08 | Rules must be implemented for the following IDs at minimum: `require-semicolons`, `require-assignment-operator`, `no-var`, `const-reassignment`, `undefined-variable`, `missing-closing-bracket`. |
| SC-09 | Rule violations can be `severity: 'error'` (blocks execution) or `severity: 'warning'` (allows execution but shows feedback). |

#### Message Dictionary

| ID | Requirement |
|---|---|
| SC-10 | All error messages live in `src/components/checker/messages.ts` as a plain TypeScript object keyed by rule ID and Babel error message patterns. |
| SC-11 | Each entry contains: `short` (one-line, used in gutter tooltip and feedback card heading), `long` (2–3 sentence explanation, shown in feedback panel body), and optional `hint` (actionable nudge, shown collapsed under "Show hint"). |
| SC-12 | Messages must interpolate the student's actual variable/token names where available (e.g. `"'highScore' was declared but never assigned a value"` not `"variable was declared"`). |

#### Execution Gate

| ID | Requirement |
|---|---|
| SC-13 | A single `shouldExecute(diagnostics: Diagnostic[])` function evaluates all checker results. If any `severity === 'error'` exists, it returns `false` — code is not sent to the sandbox. |
| SC-14 | If only `severity === 'warning'` items exist, execution is allowed. The feedback panel remains visible as a non-blocking notice. |
| SC-15 | If no diagnostics exist, the feedback panel shows a green confirmation: `"✓ No syntax issues found"`, then hides after 2 seconds. |

---

### 4.6 Feedback Panel

**Description:** The collapsible panel that displays structured syntax checker output.

| ID | Requirement |
|---|---|
| FP-01 | The feedback panel is positioned between the editor and the console in the right column. |
| FP-02 | The panel is hidden when there are no active issues. It becomes visible automatically when issues are found. |
| FP-03 | The panel is collapsible. Clicking the title bar toggles it open/closed. Its state (open/closed) persists in component state (not localStorage). |
| FP-04 | Each issue is rendered as a card containing: severity icon (❌ or ⚠️), `short` message as a heading, `long` explanation as body text, a "Go to line N" button, and a collapsible "Show hint" section. |
| FP-05 | "Go to line N" scrolls and focuses the CodeMirror editor at the offending line and column. |
| FP-06 | Issues are sorted by line number ascending. |
| FP-07 | An issue count badge appears in the panel title bar (e.g. `2 ISSUES`). |
| FP-08 | Error cards use a pink/red border. Warning cards use a yellow border. |

---

### 4.7 Console Output Panel

**Description:** Displays the forwarded output from the sandboxed iframe.

| ID | Requirement |
|---|---|
| CO-01 | The console panel renders messages received from the sandbox via `postMessage`. |
| CO-02 | Message types and their colors: `[log]` white, `[warn]` yellow, `[error]` pink/red, `[info]` cyan, test pass results green. |
| CO-03 | Each line shows the type tag and the message value. Multiple arguments to `console.log(a, b, c)` are joined with a space. |
| CO-04 | A **Clear** button clears all output. |
| CO-05 | A pulsing green dot in the panel title bar indicates the sandbox is ready. |
| CO-06 | When a run is blocked by the execution gate (errors found), the console shows a single `[warn]` line: `"Execution halted — fix errors and retry"`. |
| CO-07 | A visual divider line separates output from different runs. |
| CO-08 | Output is capped at 200 lines (see S-06). |

---

### 4.8 Lesson Interactivity

**Description:** In-lesson interactive elements beyond passive reading.

#### Quizzes

| ID | Requirement |
|---|---|
| I-01 | Each quiz option is tappable on both desktop and mobile. |
| I-02 | On selection, the correct option turns green, incorrect options turn dim red. An explanation text expands below the correct answer. |
| I-03 | Quiz answers are saved in `lessonStore` keyed by `lessonId + questionIndex`. Revisiting a completed lesson shows the previously selected answers. |

#### Challenges

| ID | Requirement |
|---|---|
| I-04 | Challenge sections define `starterCode` (pre-fills the editor), an optional `hints` array (strings, revealed one at a time via "Show Hint" button), and an optional `tests` array. |
| I-05 | Each test in `tests` is `{ description: string, fn: string }` where `fn` is a stringified assertion function run against the student's code output inside the sandbox. Test results appear in the console as `[pass]` or `[fail]` lines. |
| I-06 | When all tests pass, the lesson is automatically marked complete in `lessonStore`. |
| I-07 | The "Show Hint" button reveals hints one at a time. Once all hints are shown, the button is hidden. The current hint index is stored in component state. |

#### Code Examples

| ID | Requirement |
|---|---|
| I-08 | Code example blocks are read-only. They are rendered using a CodeMirror instance with `EditorState.readOnly.of(true)`. |
| I-09 | The "▶ Run Example" button sends the example code to the sandbox directly, bypassing the syntax checker (examples are guaranteed correct by the content author). |

---

### 4.9 Progress & State Persistence

| ID | Requirement |
|---|---|
| P-01 | Zustand `lessonStore` uses the `persist` middleware with `localStorage` as the storage engine. Persisted fields: `completedLessons`, `quizAnswers`, `activeLesson`. |
| P-02 | Zustand `editorStore` uses the `persist` middleware. Persisted fields: `codeByLessonId` (a record keyed by lesson ID). |
| P-03 | A global progress indicator in the header shows `X / 12 lessons` and a fill bar. |
| P-04 | A streak counter in the header badge increments each calendar day the student completes at least one lesson. Streak state is also persisted. |
| P-05 | No accounts, no server, no database. All state is client-side only. |

---

### 4.10 Responsive / Mobile Layout

| ID | Requirement |
|---|---|
| M-01 | Below 800px viewport width, the three-column grid collapses. Only one panel is visible at a time. |
| M-02 | A bottom tab bar with three tabs — `LESSONS`, `LESSON`, `EDITOR` — is shown only on mobile (`display: none` on desktop). |
| M-03 | Tapping a tab calls `lessonStore.setActivePanel(name)`. The correct panel gets `display: flex`; others get `display: none`. |
| M-04 | Each tab has a unique active accent color: purple for Lessons, pink for Lesson, green for Editor. |
| M-05 | The status bar hides low-priority items (rule set name, cursor position) on viewports below 600px. |
| M-06 | All scrollable panels (`lesson-content`, `console-out`, `lesson-list`) use `-webkit-overflow-scrolling: touch` for smooth mobile scrolling. |
| M-07 | Touch targets (tab buttons, quiz options, hint buttons) must be at least 44px tall to meet minimum touch target guidelines. |

---

## 5. Data Schemas

### 5.1 Lesson

```typescript
interface Lesson {
  id: string;                       // e.g. "04-syntax-rules"
  title: string;                    // e.g. "Syntax Rules & Semicolons"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  activeRules: RuleId[];            // rules enforced in this lesson's challenge
  strictMode?: boolean;             // if true, warnings become errors
  sections: LessonSection[];
}
```

### 5.2 Lesson Sections

```typescript
type LessonSection =
  | TextSection
  | CodeExampleSection
  | QuizSection
  | ChallengeSection;

interface TextSection {
  type: 'text';
  content: string;                  // Markdown-lite string
}

interface CodeExampleSection {
  type: 'code-example';
  label?: string;                   // e.g. "EXAMPLE — CORRECT"
  code: string;
  highlightLines?: number[];        // lines to visually emphasise
}

interface QuizSection {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ChallengeSection {
  type: 'challenge';
  prompt: string;
  starterCode: string;
  hints?: string[];
  tests?: ChallengeTest[];
}

interface ChallengeTest {
  description: string;              // e.g. "score should equal 100"
  fn: string;                       // stringified assertion: "(output) => output.score === 100"
}
```

### 5.3 Syntax Checker Diagnostic

```typescript
interface Diagnostic {
  ruleId: string;                   // e.g. "require-semicolons"
  severity: 'error' | 'warning' | 'info';
  line: number;
  column: number;
  tokenName?: string;               // interpolated into the message
  messages: {
    short: string;
    long: string;
    hint?: string;
  };
}
```

### 5.4 Rule IDs

```typescript
type RuleId =
  | 'require-semicolons'
  | 'require-assignment-operator'
  | 'no-var'
  | 'const-reassignment'
  | 'undefined-variable'
  | 'missing-closing-bracket';
```

---

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF-01 | **Performance:** The app must load and be interactive in under 3 seconds on a low-spec laptop (Intel Core i3 class, 4GB RAM) over a local file server or cached PWA. |
| NF-02 | **Offline:** After the first load, the app must function fully offline via the PWA service worker. No CDN dependencies at runtime. |
| NF-03 | **Bundle size:** Total JS bundle (after Vite build) must remain under 500KB gzipped. Audit with `npx vite-bundle-visualizer` before release. |
| NF-04 | **No backend:** Zero server-side components. The production build is a static folder of HTML/CSS/JS files deployable to any static host or run from `file://`. |
| NF-05 | **TypeScript strict mode:** All source files use TypeScript with `"strict": true` in `tsconfig.json`. No `any` types except in legacy adapter boundaries. |
| NF-06 | **Accessibility:** All interactive elements must be keyboard accessible. Tab order must follow visual layout. ARIA labels must be applied to icon-only buttons. |
| NF-07 | **Testing:** The rule engine (`ruleEngine.ts`) and message dictionary (`messages.ts`) must have unit test coverage ≥ 80% via Vitest. |
| NF-08 | **Lesson authoring:** Adding a new lesson requires only editing `src/data/lessons.ts`. No UI code changes are needed for standard lesson types. |
| NF-09 | **Security:** The sandbox iframe must use `sandbox="allow-scripts"` with no `allow-same-origin`. Student code must never be able to access the parent page's DOM or localStorage. |
| NF-10 | **Mobile responsive:** The layout must be fully usable on a 375px wide viewport (iPhone SE equivalent) using the mobile tab bar navigation. |

---

## Appendix A — Dependency Summary

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19 | UI framework |
| `react-dom` | ^19 | DOM renderer |
| `vite` | ^6 | Build tool |
| `@vitejs/plugin-react` | latest | Vite React plugin |
| `typescript` | ^5 | Type system |
| `@uiw/react-codemirror` | ^4 | Code editor component |
| `@codemirror/lang-javascript` | ^6 | JS highlighting + autocomplete |
| `@codemirror/lint` | ^6 | Inline diagnostic markers |
| `@codemirror/state` | ^6 | Editor state API |
| `@codemirror/commands` | ^6 | Keymaps |
| `@babel/parser` | ^7 | AST parser with error recovery |
| `zustand` | ^5 | State management |
| `vite-plugin-pwa` | latest | Service Worker / offline |
| `vitest` | latest | Unit testing |
| `@testing-library/react` | latest | React component testing |

---

## Appendix B — Folder Conventions

- Components are co-located with their CSS Module: `EditorPanel.tsx` + `EditorPanel.module.css`.
- All colours and design tokens are defined only in `tokens.css`. Never hardcode hex values in component CSS.
- Lesson data is authored in `lessons.ts` only. No lesson content lives inside React components.
- The syntax checker, rule engine, and message dictionary are pure TypeScript (no React imports) so they can be unit tested in isolation with Vitest.
