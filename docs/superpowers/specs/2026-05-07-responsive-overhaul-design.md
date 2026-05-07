# SYNTHSCRIPT Responsiveness Overhaul — Design Spec

**Date:** 2026-05-07
**Status:** Approved
**Approach:** C — Hybrid (Resizable Desktop, Grid Tablet/Mobile)

---

## 1. Breakpoint System

```css
/* 5-tier, em-based (font-size independent) */
@custom-media --xs  (width < 20em);   /* < 320px — tiny phones */
@custom-media --sm  (width < 40em);   /* < 640px — phones portrait */
@custom-media --md  (width < 64em);   /* < 1024px — tablets portrait, landscape phones */
@custom-media --lg  (width < 90em);   /* < 1440px — tablets landscape, small desktops */
@custom-media --xl  (width ≥ 90em);   /* ≥ 1440px — large desktops */
```

A `ResponsiveShell` provider component wraps `Workspace`, exposes `useResponsive()` hook returning `{ breakpoint, orientation, isMobile, isTablet, isDesktop }` via React context. Derived from a single `ResizeObserver` on `document.documentElement` + `matchMedia('(orientation: portrait)')`.

---

## 2. Layout Mode Matrix

| Tier    | Layout            | Panels                                                    | Sidebar                          | Resizable? |
| ------- | ----------------- | --------------------------------------------------------- | -------------------------------- | ---------- |
| xs/sm   | `MobileLayout`    | 1 panel + 3-tab bar                                       | Full-width when selected         | No         |
| md      | `TabletLayout`    | 2-area: collapsible sidebar + content with top tabs       | Toggleable overlay (hamburger)   | No         |
| lg/xl   | `DesktopLayout`   | 3 resizable panels                                        | Fixed left panel                 | Yes        |

### MobileLayout (`<640px`)
- Full-width panel swaps via `activePanel` store ("lessons" | "lesson" | "editor")
- `TabBar` component at bottom (renamed from `MobileTabBar`)
- Feedback panel: bottom slide-up drawer, toggled via button in ConsolePanel header

### TabletLayout (`640-1023px`)
- Sidebar: closed by default, opens as overlay when hamburger clicked, closes on lesson select
- Content area: top tab strip switching between Lesson and Editor views
- Within Editor view: vertical stack — ChallengeInfo → Editor → Console (full width each)
- Feedback panel: inline below console, height capped at 200px, expandable

### DesktopLayout (`>=1024px`)
- 3 `react-resizable-panels` panels: Sidebar (15-20%) | Lesson (25-50%) | Editor (25-55%)
- Within Editor panel: vertical `react-resizable-panels` split — Editor (default 55%) | Console+Feedback (default 45%)
- Console and Feedback side by side (FeedbackPanel 300px wide)

---

## 3. Fluid Typography Tokens

Replace current `--text-sm`/`--text-xl`/`--text-2xl` (11/16/18px static):

```css
--text-xs:   clamp(9px,  0.6rem + 0.15vw, 10px);   /* metadata, timestamps */
--text-sm:   clamp(11px, 0.7rem + 0.2vw,  12px);   /* pills, labels, tooltips */
--text-base: clamp(13px, 0.85rem + 0.3vw, 15px);   /* body text, sidebar items */
--text-lg:   clamp(15px, 0.95rem + 0.4vw, 17px);   /* subheadings, console output */
--text-xl:   clamp(17px, 1.05rem + 0.5vw, 20px);   /* section headers, titles */
--text-2xl:  clamp(20px, 1.2rem + 0.7vw,  26px);   /* main heading, hero text */
```

New supporting tokens:
```css
--touch-target: 48px;   /* min interactive size */
--spacing-xs:  clamp(4px,  0.3rem + 0.15vw, 6px);
--spacing-sm:  clamp(6px,  0.4rem + 0.2vw,  8px);
--spacing-md:  clamp(10px, 0.6rem + 0.3vw, 14px);
--spacing-lg:  clamp(16px, 1rem + 0.4vw,   22px);
--line-height-tight:   1.3;
--line-height-relaxed: 1.9;
```

All hardcoded font sizes (`17px` in console, `22px` console line height, etc.) replaced with token references.

---

## 4. Component Changes

### New Components
| Component              | File                                    | Role                                                         |
| ---------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `ResponsiveShell`      | `layout/ResponsiveShell.tsx`            | Provider: `useResponsive()` context via `createContext` + `ResizeObserver` |
| `DesktopLayout`        | `layout/DesktopLayout.tsx`              | 3-panel resizable workspace                                  |
| `TabletLayout`         | `layout/TabletLayout.tsx`               | Collapsible sidebar + content area with tabs                 |
| `MobileLayout`         | `layout/MobileLayout.tsx`               | Tabbed single-panel (extracted from current `Workspace.tsx`) |
| `useResponsive`        | `hooks/useResponsive.ts`                | Hook returning breakpoint, orientation, boolean flags        |

### Modified Components
| Component                    | Changes                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `Workspace.tsx`              | Renders `DesktopLayout` / `TabletLayout` / `MobileLayout` conditionally                            |
| `Header.tsx`                 | Adds hamburger button (visible `<1024px`), toggles `sidebarOpen` in store                          |
| `Sidebar.tsx`                | Adds `collapsed` + `overlay` props; overlay mode renders with backdrop + slide-in animation        |
| `EditorPanel.tsx`            | On lg/xl: vertical resizable split. On md/sm: vertical flex stack. Feedback panel toggle.          |
| `FeedbackPanel.tsx`          | Gains `collapsible` + `expanded` props; on mobile becomes bottom drawer                            |
| `ConsolePanel.tsx`           | Adds feedback toggle button in ConsoleBar (visible `<1024px`)                                      |
| `LessonPanel.tsx`            | Minor: adopt new spacing/font tokens                                                               |
| `TabBar` (renamed from `MobileTabBar`) | Used in both sm and md tiers; `variant` prop for styling differences                     |
| `lessonStore.ts`             | Add `sidebarOpen` state + `toggleSidebar` / `closeSidebar` actions. Add `feedbackOpen` state.      |

### Files to Remove
- `MobileTabBar.tsx` + `.module.css` → replaced by unified `TabBar`
- `Workspace.module.css` → layout styles move into individual layout component CSS

---

## 5. CSS Module Strategy

Each layout component gets its own `.module.css`:
- `DesktopLayout.module.css` — resizable panels, vertical editor split
- `TabletLayout.module.css` — sidebar overlay, content tabs, adaptive editor stack
- `MobileLayout.module.css` — tabbed panels, drawer feedback

`tokens.css` — expanded with fluid tokens
`global.css` — breakpoint media queries, base touch-target styles
`resize-handle.css` — unchanged

---

## 6. Edge Cases Covered

| Case                         | Handling                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Landscape phone (812×375)    | Fits md tier, gets 2-panel tablet layout. Narrow sidebar collapsed auto.                          |
| Short viewport (<500px height) | EditorPanel vertical split adjusts via `min-height: 200px` each; console becomes scrollable.    |
| Tiny screens (<320px)        | `--touch-target` drops to `44px`, tab labels truncate, padding reduces via fluid tokens.          |
| Very large screens (>2560px) | `clamp()` ceilings prevent oversized text. Resizable panels have sane `maxSize`.                  |
| No JS (SSR/prerender)        | Layout defaults to desktop 3-panel via CSS only; JS enhances with resizable panels.               |
| Keyboard navigation          | Hamburger toggle focusable, TabBar `role="tablist"` preserved, overlay sidebar traps focus.       |
| Resize handle drag on tablet | Tablet layout uses CSS only, no resize handles — avoids touch drag issues.                        |
| Feedback panel overflow      | Long diagnostic lists have `overflow-y: auto`, footer stays pinned.                               |

---

## 7. Migration & Risk

- **Backward compatibility:** `lessonStore` and `editorStore` persist keys unchanged. New `sidebarOpen`/`feedbackOpen` fields default to false (no breakage).
- **Performance:** `ResizeObserver` on single element (root). `useResponsive` memoized. Conditional rendering avoids mounting unused layout trees.
- **Testing:** Add `useResponsive` unit tests (mock `ResizeObserver`). Add layout tests using `@testing-library/react` at each breakpoint via `window.resizeTo`.
- **Font impact:** All existing CSS classes that reference `--text-sm`/`--text-xl`/`--text-2xl` will see their values change (from 11/16/18px to fluid values) — this is the desired behavior.
