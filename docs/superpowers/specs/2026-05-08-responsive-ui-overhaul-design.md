# Responsive UI Overhaul Design

## Overview

Five targeted UI/UX improvements to the SYNTHSCRIPT JavaScript Learning Terminal:

1. Decouple scratch.js challenge validation from the challenge editor
2. Collapsible mobile header stats drawer
3. Tablet layout: bottom TabBar + hamburger sidebar overlay + lesson/editor split
4. Unified lesson side panel overlay for tablet and mobile (60% width, left-animated)
5. Fix tablet editor console/issues rendering

---

## Req 1: Decouple Scratch from Challenge Validation

**Problem:** When running code in the scratch.js tab while a lesson is active, challenge validation fires against the lesson's expected output/code checks. This leaks pass/fail messages unrelated to the scratch code.

**Solution:**

1. `EditorPanel.tsx:handleRun` — Guard the challenge validation block (currently lines 93-119) with `if (activeTab === "challenge")`. The `activeTab` state comes from `useEditorStore`.

2. `EditorPanel.tsx` — When switching editor tabs (`handleTabClick`), clear console messages and runtime diagnostics so stale lint/validation output from the previous tab doesn't persist.

**Files changed:**
- `src/components/editor/EditorPanel.tsx`

**No new components.** Minimal diff.

---

## Req 2: Mobile Header Stats Drawer

**Problem:** On narrow viewports (< 640px), the header's `headerRight` stats (progress bar, progress text, level badge, streak badge) overflow to the right and are not visible.

**Solution: Collapsible terminal-style drawer**

### Header (always visible)
```
[Hamburger]  {SYNTHSCRIPT}  JAVASCRIPT/LEARNING/TERMINAL  [3/47 ▼]
```

- The **stats pill** (right side) shows: progress fraction + tiny inline progress bar + a down-chevron indicator
- Tapping the pill toggles the drawer open/closed
- The pill uses the existing `progressTrack`/`progressFill` elements but compacted

### Drawer (collapsible)
- Slides down from the header edge, overlays workspace content
- Full width, approximately 120px height (3 rows of content)
- Content (in order):
  1. **Progress bar** — full-width gradient bar with glow
  2. **Stats row** — `COMPLETED: 3/47` | `LEVEL: L01` | `STREAK: 🔥 4`
  3. Close hint: `[ TAP STATS TO COLLAPSE ]`
- Each row animates in with staggered `animation-delay` (0ms, 100ms, 200ms)
- Animation: `translateY(-100%)` → `translateY(0)` with `0.25s ease-out`
- Tapping the stats pill again collapses; tapping outside also collapses via backdrop or click-outside handler
- Same neon/cyberpunk aesthetic: borders, glows, scanline-compatible background

### State management
Add a `statsDrawerOpen: boolean` to `lessonStore` (Zustand) with a `toggleStatsDrawer` action. Not persisted.

### Files changed/created:
- `src/components/layout/Header.tsx` — add stats pill toggle, drawer rendering
- `src/components/layout/Header.module.css` — add drawer styles
- `src/store/lessonStore.ts` — add `statsDrawerOpen` state

---

## Req 3 + 4: Tablet Layout Redesign + Unified Sidebar Overlay

### Tablet Layout (Req 3)

**Current:** Top TabBar, single-panel content, fixed 280px sidebar overlay.

**New:**

```
┌──────────────────────────────────┐
│           Header                 │
├────────────────┬─────────────────┤
│   Lesson       │    Editor       │
│   Panel        │    Panel        │
│   (flex)       │    (flex)       │
│                │                 │
├────────────────┴─────────────────┤
│   TabBar (bottom, variant=tablet)│
└──────────────────────────────────┘
```

**Bottom TabBar:** Moves to bottom of layout. Same 3 tabs: `lessons`, `lesson`, `editor`. The tablet variant adapts to a bottom bar (icons above labels, like mobile, but using the tablet styling).

**Split view:** When `lesson` or `editor` tab is active, both panels render side-by-side:
- **`lesson` tab active** → lesson panel gets 60%, editor gets 40%
- **`editor` tab active** → lesson panel gets 40%, editor gets 60%
- Split uses `display: flex` with `flex` ratios (no resizable handles in tablet)
- Transition between ratios is animated (CSS transition on flex-basis, 0.3s ease)

**`lessons` tab:** Shows the overlay sidebar (see below). The split view stays at its previous ratio underneath.

**Files changed:**
- `src/components/layout/TabletLayout.tsx` — restructure to split layout + bottom TabBar
- `src/components/layout/TabletLayout.module.css` — new CSS for split layout

### Unified Sidebar Overlay (Req 4, shared tablet + mobile)

**Current state:**
- **Tablet:** Overlay, fixed 280px, `slideIn` animation 0.2s
- **Mobile:** No overlay — sidebar renders inline as a full `<aside>` panel

**New unified behavior:**
- Both tablet and mobile use the **overlay pattern**
- Slides from left edge, covers **60% of viewport width** (capped at 400px max)
- Animation: `translateX(-100%)` → `translateX(0)`, `0.3s ease-out`
- Backdrop: `rgba(7, 0, 26, 0.85)`, closes on click or Escape key
- Close via hamburger toggle as well

**MobileLayout changes:**
- Remove the inline `<aside>` rendering for `activePanel === "lessons"`
- Import and render the same overlay sidebar pattern as tablet (position: fixed, full-screen backdrop, sliding panel)
- When sidebar opens: set `activePanel` to whatever it was before (currently it forces "lessons")
- The overlay sits above `activePanel` content

**TabletLayout sidebar overlay changes:**
- Change `width: 280px` to `width: 60vw` with `max-width: 400px`
- Animation duration: `0.2s` → `0.3s`

**Files changed:**
- `src/components/layout/MobileLayout.tsx` — overlay sidebar
- `src/components/layout/MobileLayout.module.css` — overlay styles
- `src/components/layout/TabletLayout.tsx` — adjust sidebar width/anim
- `src/components/layout/TabletLayout.module.css` — adjust sidebar styles

---

## Req 5: Tablet Editor Console + Issues Fix

**Problems identified:**
1. `EditorPanel.tsx:236` — `FeedbackPanel` guard `{!isMobile && (` already passes for tablet (correct), so the feedback panel is visible
2. Feedback panel width — the `@media (max-width: 800px)` rule sets `.feedbackWrap { width: 100% }` but this only covers up to 800px. Tablets range 640-1023px, so between 800-1023px the feedback panel stays at the fixed `300px` width. Need to extend the media query or use `@media (max-width: 1023px)` to cover the full tablet range.
3. Editor body height — `.editorWrap` has `flex: 0 0 45%` which works for desktop but in the tablet split layout, the editor needs `flex: 1` to fill available space

**Fixes:**

1. **Feedback panel full width for tablet:** Change `@media (max-width: 800px)` to `@media (max-width: 1023px)` in `EditorPanel.module.css` for the `.bottomSection` and `.feedbackWrap` rules that switch to stacked layout.

2. **Editor body height:** In the tablet split context, the editor panel should use `flex: 1` like mobile. Use the `isTablet` responsive check to conditionally apply `.editorWrapMobile` behavior (or add a media query targeting the tablet range).

**Files changed:**
- `src/components/editor/EditorPanel.tsx` — fix feedback visibility guard
- `src/components/editor/EditorPanel.module.css` — ensure tablet editor wrap works in split context

---

## Files Summary

| File | Change |
|---|---|
| `src/components/editor/EditorPanel.tsx` | Guard challenge validation with `activeTab`; clear console on tab switch; fix feedback visibility for tablet |
| `src/components/layout/Header.tsx` | Stats pill + collapsible drawer |
| `src/components/layout/Header.module.css` | Drawer animations and styles |
| `src/store/lessonStore.ts` | Add `statsDrawerOpen` state |
| `src/components/layout/TabletLayout.tsx` | Bottom TabBar, split lesson/editor, unified sidebar overlay |
| `src/components/layout/TabletLayout.module.css` | Split layout CSS, updated overlay |
| `src/components/layout/MobileLayout.tsx` | Overlay sidebar instead of inline panel |
| `src/components/layout/MobileLayout.module.css` | Overlay styles |
| `src/components/editor/EditorPanel.module.css` | Tablet editor wrap fix |

No new components or store files needed. All changes are modifications to existing code.
