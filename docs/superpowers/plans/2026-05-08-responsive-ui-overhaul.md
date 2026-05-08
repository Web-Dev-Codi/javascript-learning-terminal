# Responsive UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 UI issues: scratch/challenge validation decoupling, mobile header stats drawer, tablet layout redesign, unified sidebar overlay, and tablet editor console/issues.

**Architecture:** All changes are modifications to existing components and stores. No new components. The plan touches EditorPanel, Header, TabletLayout, MobileLayout, lessonStore, and their CSS modules.

**Tech Stack:** React 19, Zustand, CSS Modules, CodeMirror 6

---

### Task 1: Decouple scratch.js from challenge validation

**Files:**
- Modify: `src/components/editor/EditorPanel.tsx`

- [ ] **Step 1: Guard challenge validation with activeTab check**

In `EditorPanel.tsx`, find the `handleRun` function and add `activeTab` guard around the challenge validation block (lines 93-119). Also clear console and runtime diagnostics on tab switch.

```tsx
// In the component body, add activeTab from store:
const { activeTab } = useEditorStore();

// In handleRun, wrap challenge validation:
if (activeTab === "challenge") {
  const lesson = activeLesson ? findLessonById(activeLesson) : null;
  const challengeSection = lesson?.sections?.find(
    (s): s is ChallengeSection => s.type === "challenge",
  );
  if (challengeSection?.codeChecks || challengeSection?.expectedOutput) {
    const results = validateChallenge(
      currentCode,
      consoleOutputRef.current,
      challengeSection.codeChecks,
      challengeSection.expectedOutput,
    );
    // ... rest of validation logic unchanged
  }
}
```

- [ ] **Step 2: Clear console on tab switch**

In `handleTabClick`, add console clear and runtime diagnostics reset:

```tsx
const handleTabClick = (tabId: string) => {
  setActiveTab(tabId);
  clearConsole();
  setRuntimeDiagnostics([]);
};
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 2: Add statsDrawerOpen state to lessonStore

**Files:**
- Modify: `src/store/lessonStore.ts`

- [ ] **Step 1: Add state and actions**

Add to the `LessonState` interface:

```ts
statsDrawerOpen: boolean;
toggleStatsDrawer: () => void;
closeStatsDrawer: () => void;
```

Add to the store initial state:

```ts
statsDrawerOpen: false,
```

Add actions alongside existing toggleSidebar/closeSidebar:

```ts
toggleStatsDrawer: () => {
  set((state) => ({ statsDrawerOpen: !state.statsDrawerOpen }));
},
closeStatsDrawer: () => {
  set({ statsDrawerOpen: false });
},
```

Do NOT add `statsDrawerOpen` to the `partialize` function — it shouldn't be persisted.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 3: Mobile header stats drawer

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Header.module.css`

- [ ] **Step 1: Add drawer to Header.tsx**

Replace the existing `headerRight` div content with a stats pill that toggles a drawer. The drawer renders below the header.

```tsx
import { useLessonStore } from '../../store/lessonStore'

// In component:
const { statsDrawerOpen, toggleStatsDrawer, closeStatsDrawer } = useLessonStore()

// Replace headerRight content (lines 46-65):
<div className={styles.headerRight}>
  <button
    type="button"
    className={styles.statsPill}
    onClick={toggleStatsDrawer}
    aria-expanded={statsDrawerOpen}
    aria-label="Toggle stats"
  >
    <div className={styles.statsPillProgress}>
      <div
        className={styles.statsPillFill}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
    <span className={styles.statsPillText}>
      {progress.completed}/{progress.total}
    </span>
    <span className={`${styles.statsPillChevron} ${statsDrawerOpen ? styles.chevronOpen : ''}`}>
      ▼
    </span>
  </button>
</div>

{/* Stats drawer - only on non-desktop */}
{!isDesktop && statsDrawerOpen && (
  <>
    <div className={styles.drawerBackdrop} onClick={closeStatsDrawer} />
    <div className={styles.statsDrawer}>
      <div className={styles.drawerRow} style={{ animationDelay: '0ms' }}>
        <span className={styles.drawerLabel}>PROGRESS</span>
        <div className={styles.drawerProgressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className={styles.drawerRow} style={{ animationDelay: '100ms' }}>
        <span className={styles.drawerLabel}>COMPLETED</span>
        <span className={styles.drawerValue}>{progress.completed}/{progress.total}</span>
      </div>
      <div className={styles.drawerRow} style={{ animationDelay: '200ms' }}>
        <span className={styles.drawerLabel}>LEVEL</span>
        <span className={styles.drawerValue}>L{getLessonNumber(activeLesson)}</span>
      </div>
      <div className={styles.drawerRow} style={{ animationDelay: '300ms' }}>
        <span className={styles.drawerLabel}>STREAK</span>
        <span className={styles.drawerValue}>🔥 {currentStreak}</span>
      </div>
    </div>
  </>
)}
```

Remove the old `.progressTrack`, `.progressText`, `.badge`, `.badgeLevel`, `.badgeStreak` elements from the `headerRight` div.

- [ ] **Step 2: Add drawer CSS to Header.module.css**

Remove the old `.progressTrack`/`.progressFill`/`.progressText`/`.badge*` rules. Replace with:

```css
/* Stats pill */
.statsPill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-dim);
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;
  min-height: var(--touch-target);
}

.statsPill:hover {
  border-color: var(--neon-purple);
  box-shadow: 0 0 12px rgba(191, 0, 255, 0.2);
}

.statsPillProgress {
  width: 30px;
  height: 3px;
  background: var(--border-dim);
  border-radius: 2px;
  overflow: hidden;
}

.statsPillFill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-pink));
  box-shadow: 0 0 8px var(--neon-pink);
  transition: width 0.3s ease;
}

.statsPillText {
  font-size: var(--text-2xl);
  color: var(--neon-purple);
  text-shadow: var(--glow-purple);
}

.statsPillChevron {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.chevronOpen {
  transform: rotate(180deg);
}

/* Drawer */
.drawerBackdrop {
  position: fixed;
  inset: 0;
  top: 48px;
  z-index: calc(var(--z-header) - 1);
  background: transparent;
}

.statsDrawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--z-header);
  background: linear-gradient(180deg, #0d0028 0%, #150040 50%, #0d0028 100%);
  border-bottom: 1px solid var(--neon-purple);
  box-shadow: 0 4px 20px rgba(191, 0, 255, 0.15);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: drawerSlideDown 0.25s ease-out;
}

@keyframes drawerSlideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.drawerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: drawerFadeIn 0.3s ease-out both;
}

@keyframes drawerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawerLabel {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  letter-spacing: 2px;
  color: var(--text-dim);
}

.drawerValue {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
}

.drawerProgressTrack {
  width: 120px;
  height: 4px;
  background: var(--border-dim);
  border-radius: 2px;
  overflow: hidden;
}
```

Also remove the old `@media (max-width: 380px)` rule for `.badgeStreak` since the streak badge no longer exists in the header.

Keep the `.hamburgerButton` styles unchanged.

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 4: Unified sidebar overlay (mobile + tablet)

**Files:**
- Modify: `src/components/layout/MobileLayout.tsx`
- Modify: `src/components/layout/MobileLayout.module.css`
- Modify: `src/components/layout/TabletLayout.tsx`
- Modify: `src/components/layout/TabletLayout.module.css`

- [ ] **Step 1: MobileLayout — replace inline sidebar with overlay**

```tsx
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./MobileLayout.module.css";

export function MobileLayout() {
  const { activePanel, sidebarOpen, closeSidebar } = useLessonStore();

  const handleLessonSelect = () => {
    closeSidebar();
  };

  return (
    <div className={styles.mobileLayout}>
      {sidebarOpen && (
        <div className={styles.sidebarOverlay}>
          <div
            className={styles.sidebarBackdrop}
            onClick={closeSidebar}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSidebar();
            }}
            role="presentation"
          />
          <div className={styles.sidebarPanel}>
            <Sidebar overlay onLessonSelect={handleLessonSelect} />
          </div>
        </div>
      )}

      {activePanel === "lessons" && (
        <aside className={styles.panel}>
          <Sidebar />
        </aside>
      )}
      {activePanel === "lesson" && (
        <section className={styles.panel}>
          <LessonPanel />
        </section>
      )}
      {activePanel === "editor" && (
        <div className={styles.panel}>
          <EditorPanel />
        </div>
      )}
      <TabBar variant="mobile" />
    </div>
  );
}
```

Note: Keep the inline `<Sidebar />` for `activePanel === "lessons"` — the overlay is in addition to the inline panel, triggered by the hamburger button.

- [ ] **Step 2: MobileLayout.module.css — add overlay styles**

```css
.sidebarOverlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-sidebar-overlay);
  display: flex;
}

.sidebarBackdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 0, 26, 0.85);
}

.sidebarPanel {
  position: relative;
  width: 60vw;
  max-width: 400px;
  height: 100%;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-mid);
  z-index: 1;
  animation: overlaySlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes overlaySlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

- [ ] **Step 3: TabletLayout — update sidebar overlay to 60% + 0.3s animation**

In `TabletLayout.module.css`, change `.sidebarPanel`:

```css
.sidebarPanel {
  position: relative;
  width: 60vw;
  max-width: 400px;
  height: 100%;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-mid);
  z-index: 1;
  animation: overlaySlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes overlaySlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

Remove the old `.sidebarPanel` and `@keyframes slideIn` block (lines 49-70).

- [ ] **Step 4: Remove MobileLayout useEffect that forces "lessons" panel**

Remove the `useEffect` and `setActivePanel` import from MobileLayout.tsx since we no longer auto-switch.

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 5: Tablet layout — bottom TabBar + lesson/editor split view

**Files:**
- Modify: `src/components/layout/TabBar.tsx`
- Modify: `src/components/layout/TabBar.module.css`
- Modify: `src/components/layout/TabletLayout.tsx`
- Modify: `src/components/layout/TabletLayout.module.css`

- [ ] **Step 1: Add a "tablet-bottom" variant to TabBar**

In `TabBar.tsx`, update the `TabBarProps` interface to accept `"tablet-bottom"` as a variant:

```tsx
interface TabBarProps {
  variant: "mobile" | "tablet" | "tablet-bottom";
}
```

Update the variant class selection:

```tsx
const variantClass = variant === "mobile"
  ? styles.variantMobile
  : variant === "tablet-bottom"
    ? styles.variantTabletBottom
    : styles.variantTablet;
```

- [ ] **Step 2: Add tablet-bottom CSS variant**

In `TabBar.module.css`, add:

```css
/* Tablet bottom variant */
.variantTabletBottom {
  height: 54px;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-mid);
  box-shadow: 0 -1px 0 #bf00ff33;
  z-index: var(--z-header);
}

.variantTabletBottom .tabButton {
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  min-height: 54px;
  font-size: var(--text-sm);
}

.variantTabletBottom .tabButton.active {
  border-top: 2px solid currentColor;
  border-bottom: none;
}

.variantTabletBottom .tabIcon {
  font-size: var(--text-base);
}
```

- [ ] **Step 3: Rewrite TabletLayout with bottom TabBar + split view**

```tsx
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./TabletLayout.module.css";

export function TabletLayout() {
  const { activePanel, sidebarOpen, closeSidebar } = useLessonStore();

  const handleLessonSelect = () => {
    closeSidebar();
  };

  return (
    <div className={styles.tabletLayout}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay}>
          <div
            className={styles.sidebarBackdrop}
            onClick={closeSidebar}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSidebar();
            }}
            role="presentation"
          />
          <div className={styles.sidebarPanel}>
            <Sidebar overlay onLessonSelect={handleLessonSelect} />
          </div>
        </div>
      )}

      {/* Lesson + Editor split view */}
      <div className={styles.splitContent}>
        <div
          className={`${styles.splitPanel} ${styles.lessonPanel} ${
            activePanel === "lesson" ? styles.lessonPanelActive : ""
          } ${activePanel === "editor" ? styles.lessonPanelInactive : ""}`}
        >
          <LessonPanel />
        </div>
        <div className={styles.splitDivider} />
        <div
          className={`${styles.splitPanel} ${styles.editorPanel} ${
            activePanel === "editor" ? styles.editorPanelActive : ""
          } ${activePanel === "lesson" ? styles.editorPanelInactive : ""}`}
        >
          <EditorPanel />
        </div>
      </div>

      {/* Bottom TabBar */}
      <TabBar variant="tablet-bottom" />
    </div>
  );
}
```

- [ ] **Step 4: TabletLayout.module.css — split layout CSS**

Replace the entire file:

```css
.tabletLayout {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  overflow: hidden;
}

.splitContent {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.splitPanel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  transition: flex 0.3s ease;
}

.lessonPanel {
  flex: 1;
}

.editorPanel {
  flex: 1;
}

.lessonPanelActive {
  flex: 6;
}

.lessonPanelInactive {
  flex: 4;
}

.editorPanelActive {
  flex: 6;
}

.editorPanelInactive {
  flex: 4;
}

.splitDivider {
  width: 1px;
  background: var(--border-dim);
  flex-shrink: 0;
}

/* Sidebar overlay */
.sidebarOverlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-sidebar-overlay);
  display: flex;
}

.sidebarBackdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 0, 26, 0.85);
}

.sidebarPanel {
  position: relative;
  width: 60vw;
  max-width: 400px;
  height: 100%;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-mid);
  z-index: 1;
  animation: overlaySlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes overlaySlideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

- [ ] **Step 5: Also show lesson panel when lessons tab is active in split view**

The `activePanel === "lessons"` case should show the split view at its previous ratio (e.g., use a neutral 50/50 split) rather than hiding panels. Adjust the class logic:

```tsx
const getLessonFlexClass = () => {
  if (activePanel === "lesson") return styles.lessonPanelActive;
  if (activePanel === "editor") return styles.lessonPanelInactive;
  return ""; // neutral split for "lessons" tab
};

const getEditorFlexClass = () => {
  if (activePanel === "editor") return styles.editorPanelActive;
  if (activePanel === "lesson") return styles.editorPanelInactive;
  return ""; // neutral split for "lessons" tab
};
```

Then in the JSX:

```tsx
<div className={`${styles.splitPanel} ${styles.lessonPanel} ${getLessonFlexClass()}`}>
  <LessonPanel />
</div>
<div className={styles.splitDivider} />
<div className={`${styles.splitPanel} ${styles.editorPanel} ${getEditorFlexClass()}`}>
  <EditorPanel />
</div>
```

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 6: Fix tablet editor console/issues

**Files:**
- Modify: `src/components/editor/EditorPanel.tsx`
- Modify: `src/components/editor/EditorPanel.module.css`

- [ ] **Step 1: Fix feedback panel visibility for tablet**

In `EditorPanel.tsx`, change the feedback panel rendering guard at line 236:

```tsx
{!isMobile && (
  <div className={styles.feedbackWrap}>
```

Since `isMobile` is false for tablet, this already renders. No change needed — the issue is CSS width.

- [ ] **Step 2: Extend media query to cover full tablet range**

In `EditorPanel.module.css`, change the media query from `@media (max-width: 800px)` to `@media (max-width: 1023px)`:

```css
@media (max-width: 1023px) {
  .editorWrap {
    flex: 0 0 50%;
  }

  .bottomSection {
    flex-direction: column;
  }

  .feedbackWrap {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border-mid);
    height: 200px;
  }
}
```

Also add a tablet-specific media query for `.editorWrap` since in tablet split view the editor is a column:

```css
@media (min-width: 640px) and (max-width: 1023px) {
  .editorWrapMobile {
    flex: 1;
    min-height: 100px;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No type errors

---

### Task 7: Test verification

**Files:**
- Run: project root

- [ ] **Step 1: Run existing tests**

Run: `npm test`
Expected: All existing tests pass

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds
