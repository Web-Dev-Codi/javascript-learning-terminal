# Responsive Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SYNTHSCRIPT from a 2-mode layout (desktop/mobile) into a 5-tier fluid responsive application covering 320px–1440px+ screens with 3 distinct layout modes.

**Architecture:** A `ResponsiveShell` React context provider exposes `useResponsive()` throughout the component tree. `Workspace.tsx` branches into `DesktopLayout` (3 resizable panels, >=1024px), `TabletLayout` (collapsible sidebar + content tabs, 640–1023px), or `MobileLayout` (single panel + tab bar, <640px). All typography migrates from 3 static font-size tokens to a 6-token fluid `clamp()` scale.

**Tech Stack:** React 19, TypeScript, CSS Modules, react-resizable-panels, Zustand, Vite

---

## Files Overview

**Create (8):**
- `src/hooks/useResponsive.ts`
- `src/components/layout/ResponsiveShell.tsx`
- `src/components/layout/DesktopLayout.tsx` + `DesktopLayout.module.css`
- `src/components/layout/TabletLayout.tsx` + `TabletLayout.module.css`
- `src/components/layout/MobileLayout.tsx` + `MobileLayout.module.css`
- `src/components/layout/TabBar.tsx` + `TabBar.module.css`

**Modify (15):**
- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/store/lessonStore.ts`
- `src/App.tsx`
- `src/components/layout/Workspace.tsx`
- `src/components/layout/Header.tsx` + `Header.module.css`
- `src/components/layout/Sidebar.tsx` + `Sidebar.module.css`
- `src/components/editor/EditorPanel.tsx` + `EditorPanel.module.css`
- `src/components/editor/ConsolePanel.tsx` + `ConsolePanel.module.css`
- `src/components/checker/FeedbackPanel.tsx` + `FeedbackPanel.module.css`
- `src/components/lesson/LessonPanel.module.css`

**Remove (3):**
- `src/components/layout/MobileTabBar.tsx`
- `src/components/layout/MobileTabBar.module.css`
- `src/components/layout/Workspace.module.css`

---

### Task 1: Fluid Typography & Design Tokens

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Replace font-size tokens with fluid clamp() values**

Replace the current typography section (lines 36-48) in `src/styles/tokens.css`:

Old:
```
  /* Font Sizes */
  --text-sm:      11px;
  --text-xl:      16px;
  --text-2xl:     18px;

  /* Border Radius */
  --radius-sm:    2px;

  /* Z-Index Scale */
  --z-base:       0;
  --z-header:     100;
  --z-overlay:    9000;
  --z-tooltip:    9999;
```

New:
```
  /* Font Sizes */
  --text-xs:      clamp(9px, 0.6rem + 0.15vw, 10px);
  --text-sm:      clamp(11px, 0.7rem + 0.2vw, 12px);
  --text-base:    clamp(13px, 0.85rem + 0.3vw, 15px);
  --text-lg:      clamp(15px, 0.95rem + 0.4vw, 17px);
  --text-xl:      clamp(17px, 1.05rem + 0.5vw, 20px);
  --text-2xl:     clamp(20px, 1.2rem + 0.7vw, 26px);

  /* Spacing */
  --spacing-xs:   clamp(4px, 0.3rem + 0.15vw, 6px);
  --spacing-sm:   clamp(6px, 0.4rem + 0.2vw, 8px);
  --spacing-md:   clamp(10px, 0.6rem + 0.3vw, 14px);
  --spacing-lg:   clamp(16px, 1rem + 0.4vw, 22px);

  /* Line Heights */
  --line-height-tight:   1.3;
  --line-height-relaxed: 1.9;

  /* Interactive */
  --touch-target: 48px;

  /* Border Radius */
  --radius-sm:    2px;

  /* Z-Index Scale */
  --z-base:       0;
  --z-header:     100;
  --z-sidebar-overlay: 200;
  --z-overlay:    9000;
  --z-tooltip:    9999;

  /* Layout */
  --sidebar-width: 260px;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(design): replace static font-size tokens with fluid clamp() scale"
```

---

### Task 2: Responsive Hook + Context

**Files:**
- Create: `src/hooks/useResponsive.ts`

- [ ] **Step 1: Create the hooks directory and file**

Run: `mkdir -p src/hooks`

- [ ] **Step 2: Write useResponsive.ts**

```typescript
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

export interface ResponsiveInfo {
	breakpoint: Breakpoint;
	orientation: "portrait" | "landscape";
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

export const ResponsiveContext = createContext<ResponsiveInfo>({
	breakpoint: "xl",
	orientation: "landscape",
	isMobile: false,
	isTablet: false,
	isDesktop: true,
});

function computeBreakpoint(width: number): Breakpoint {
	if (width < 320) return "xs";
	if (width < 640) return "sm";
	if (width < 1024) return "md";
	if (width < 1440) return "lg";
	return "xl";
}

function deriveResponsiveInfo(width: number, orientation: "portrait" | "landscape"): ResponsiveInfo {
	const breakpoint = computeBreakpoint(width);
	return {
		breakpoint,
		orientation,
		isMobile: breakpoint === "xs" || breakpoint === "sm",
		isTablet: breakpoint === "md",
		isDesktop: breakpoint === "lg" || breakpoint === "xl",
	};
}

export function useResponsiveValue(): ResponsiveInfo {
	const [info, setInfo] = useState<ResponsiveInfo>(() =>
		deriveResponsiveInfo(
			typeof document !== "undefined" ? document.documentElement.clientWidth : 1440,
			typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches
				? "portrait"
				: "landscape",
		),
	);

	useEffect(() => {
		if (typeof document === "undefined") return;

		const observer = new ResizeObserver(
			useCallback((entries: ResizeObserverEntry[]) => {
				const width = entries[0]?.contentRect.width ?? document.documentElement.clientWidth;
				const orientation: "portrait" | "landscape" = window.matchMedia(
					"(orientation: portrait)",
				).matches
					? "portrait"
					: "landscape";
				setInfo(deriveResponsiveInfo(width, orientation));
			}, []),
		);

		observer.observe(document.documentElement);

		const orientationQuery = window.matchMedia("(orientation: portrait)");
		const handleOrientationChange = () => {
			const orientation: "portrait" | "landscape" = orientationQuery.matches
				? "portrait"
				: "landscape";
			setInfo((prev) => ({ ...prev, orientation }));
		};
		orientationQuery.addEventListener("change", handleOrientationChange);

		return () => {
			observer.disconnect();
			orientationQuery.removeEventListener("change", handleOrientationChange);
		};
	}, []);

	return useMemo(() => info, [info]);
}

export function useResponsive(): ResponsiveInfo {
	return useContext(ResponsiveContext);
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors in useResponsive.ts

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useResponsive.ts
git commit -m "feat(responsive): add useResponsive hook with ResizeObserver-driven breakpoint detection"
```

---

### Task 3: ResponsiveShell Provider

**Files:**
- Create: `src/components/layout/ResponsiveShell.tsx`

- [ ] **Step 1: Write ResponsiveShell.tsx**

```tsx
import { ResponsiveContext, useResponsiveValue } from "../../hooks/useResponsive";

interface ResponsiveShellProps {
	children: React.ReactNode;
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
	const value = useResponsiveValue();
	return (
		<ResponsiveContext.Provider value={value}>
			{children}
		</ResponsiveContext.Provider>
	);
}
```

- [ ] **Step 2: Wire into App.tsx**

Read `src/App.tsx` and replace with:

```tsx
import "./App.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/layout/Header";
import { ResponsiveShell } from "./components/layout/ResponsiveShell";
import { StatusBar } from "./components/layout/StatusBar";
import { Workspace } from "./components/layout/Workspace";

function App() {
	return (
		<div className="App">
			<ResponsiveShell>
				<ErrorBoundary>
					<Header />
					<ErrorBoundary>
						<Workspace />
					</ErrorBoundary>
					<StatusBar />
				</ErrorBoundary>
			</ResponsiveShell>
		</div>
	);
}

export default App;
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/ResponsiveShell.tsx src/App.tsx
git commit -m "feat(responsive): add ResponsiveShell provider wrapping App"
```

---

### Task 4: Store — sidebarOpen and feedbackOpen

**Files:**
- Modify: `src/store/lessonStore.ts`

- [ ] **Step 1: Add state fields and actions to LessonState interface**

Add inside `interface LessonState` after `lastCompletedDate`:
```typescript
	sidebarOpen: boolean;
	feedbackOpen: boolean;

	// UI Actions
	toggleSidebar: () => void;
	closeSidebar: () => void;
	toggleFeedback: () => void;
	closeFeedback: () => void;
```

- [ ] **Step 2: Add initial values**

Add inside the `set` callback for the persist initializer, after `lastCompletedDate: null`:
```typescript
			sidebarOpen: false,
			feedbackOpen: false,
```

- [ ] **Step 3: Add action implementations**

Add after `navigatePrev` implementation (before the closing `)` of persist):
```typescript

			toggleSidebar: () => {
				set((state) => ({ sidebarOpen: !state.sidebarOpen }));
			},
			closeSidebar: () => {
				set({ sidebarOpen: false });
			},
			toggleFeedback: () => {
				set((state) => ({ feedbackOpen: !state.feedbackOpen }));
			},
			closeFeedback: () => {
				set({ feedbackOpen: false });
			},
```

- [ ] **Step 4: Update partialize to exclude transient UI state**

The `partialize` already lists explicit keys, so `sidebarOpen` and `feedbackOpen` are automatically excluded. No change needed.

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/store/lessonStore.ts
git commit -m "feat(store): add sidebarOpen and feedbackOpen UI state with toggle/close actions"
```

---

### Task 5: Unified TabBar Component (replaces MobileTabBar)

**Files:**
- Create: `src/components/layout/TabBar.tsx`
- Create: `src/components/layout/TabBar.module.css`

- [ ] **Step 1: Write TabBar.module.css**

```css
/* TabBar Component Styles */

.tabBar {
	display: flex;
	flex-shrink: 0;
}

/* Mobile variant — bottom bar */
.variantMobile {
	height: 54px;
	background: var(--bg-panel);
	border-top: 1px solid var(--border-mid);
	box-shadow: 0 -1px 0 #bf00ff33;
	z-index: var(--z-header);
}

/* Tablet variant — inline top strip */
.variantTablet {
	height: 44px;
	background: var(--bg-panel);
	border-bottom: 1px solid var(--border-mid);
}

.tabButton {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	font-family: var(--font-mono);
	font-size: var(--text-sm);
	letter-spacing: 1.5px;
	text-transform: uppercase;
	border: none;
	background: transparent;
	color: var(--text-muted);
	cursor: pointer;
	transition: all 0.12s ease;
	padding: 8px 0;
	min-height: var(--touch-target);
}

.variantTablet .tabButton {
	flex-direction: row;
	gap: 6px;
	padding: 6px 14px;
	flex: none;
	min-height: 44px;
	font-size: var(--text-base);
}

.tabButton:hover {
	background: rgba(255, 255, 255, 0.05);
}

.tabButton:nth-child(1).active {
	color: var(--neon-purple);
	text-shadow: var(--glow-purple);
	border-top: 2px solid var(--neon-purple);
	background: rgba(191, 0, 255, 0.05);
}

.tabButton:nth-child(2).active {
	color: var(--neon-pink);
	text-shadow: var(--glow-pink);
	border-top: 2px solid var(--neon-pink);
	background: rgba(255, 45, 154, 0.05);
}

.tabButton:nth-child(3).active {
	color: var(--neon-green);
	text-shadow: var(--glow-green);
	border-top: 2px solid var(--neon-green);
	background: rgba(0, 255, 159, 0.05);
}

.variantTablet .tabButton.active {
	border-top: none;
	border-bottom: 2px solid currentColor;
}

.tabIcon {
	font-size: var(--text-base);
}

.tabLabel {
	font-weight: 500;
}

.variantTablet .tabIcon {
	font-size: var(--text-sm);
}
```

- [ ] **Step 2: Write TabBar.tsx**

```tsx
import { useLessonStore } from "../../store/lessonStore";
import type { PanelType } from "../../types/lesson";
import styles from "./TabBar.module.css";

interface TabBarProps {
	variant: "mobile" | "tablet";
}

const tabs: { id: PanelType; label: string; icon: string }[] = [
	{ id: "lessons", label: "LESSONS", icon: "📚" },
	{ id: "lesson", label: "LESSON", icon: "📖" },
	{ id: "editor", label: "EDITOR", icon: "💻" },
];

export function TabBar({ variant }: TabBarProps) {
	const { activePanel, setActivePanel } = useLessonStore();

	const variantClass = variant === "mobile" ? styles.variantMobile : styles.variantTablet;

	return (
		<div className={`${styles.tabBar} ${variantClass}`} role="tablist">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					role="tab"
					aria-selected={activePanel === tab.id}
					className={`${styles.tabButton} ${activePanel === tab.id ? styles.active : ""}`}
					onClick={() => setActivePanel(tab.id)}
				>
					<span className={styles.tabIcon}>{tab.icon}</span>
					<span className={styles.tabLabel}>{tab.label}</span>
				</button>
			))}
		</div>
	);
}
```

- [ ] **Step 3: Create MobileLayout.tsx**

```tsx
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./MobileLayout.module.css";

export function MobileLayout() {
	const { activePanel } = useLessonStore();

	return (
		<div className={styles.mobileLayout}>
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

- [ ] **Step 4: Write MobileLayout.module.css**

```css
.mobileLayout {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	overflow: hidden;
}

.panel {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	min-height: 0;
}
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors from TabBar.tsx or MobileLayout.tsx. The `PanelType` import type should already exist at `src/types/lesson.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/TabBar.tsx src/components/layout/TabBar.module.css src/components/layout/MobileLayout.tsx src/components/layout/MobileLayout.module.css
git commit -m "feat(layout): add unified TabBar component and MobileLayout"
```

---

### Task 6: DesktopLayout

**Files:**
- Create: `src/components/layout/DesktopLayout.tsx`
- Create: `src/components/layout/DesktopLayout.module.css`

- [ ] **Step 1: Write DesktopLayout.module.css**

```css
.desktopLayout {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	overflow: hidden;
}

.sidebar {
	height: 100%;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--border-mid);
	background: var(--bg-panel);
}

.lessonPanel {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: var(--bg-panel-alt);
}

.editorPanel {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: var(--bg-void);
}
```

- [ ] **Step 2: Write DesktopLayout.tsx**

```tsx
import { Group, Panel, Separator } from "react-resizable-panels";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import styles from "./DesktopLayout.module.css";
import { Sidebar } from "./Sidebar";

export function DesktopLayout() {
	return (
		<div className={styles.desktopLayout}>
			<Group direction="horizontal">
				<Panel defaultSize={15} minSize={15} maxSize={20}>
					<aside className={styles.sidebar}>
						<Sidebar />
					</aside>
				</Panel>
				<Separator className="resizeHandle" />
				<Panel defaultSize={42} minSize={25} maxSize={50}>
					<section className={styles.lessonPanel}>
						<LessonPanel />
					</section>
				</Panel>
				<Separator className="resizeHandle" />
				<Panel defaultSize={43} minSize={30} maxSize={60}>
					<div className={styles.editorPanel}>
						<EditorPanel />
					</div>
				</Panel>
			</Group>
		</div>
	);
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/DesktopLayout.tsx src/components/layout/DesktopLayout.module.css
git commit -m "feat(layout): add DesktopLayout with 3 resizable panels"
```

---

### Task 7: TabletLayout

**Files:**
- Create: `src/components/layout/TabletLayout.tsx`
- Create: `src/components/layout/TabletLayout.module.css`

- [ ] **Step 1: Write TabletLayout.module.css**

```css
.tabletLayout {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	overflow: hidden;
}

.contentArea {
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.contentBody {
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	overflow: hidden;
}

.panel {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0%;
	min-height: 0;
}

.sidebarOverlay {
	position: fixed;
	inset: 0;
	z-index: var(--z-sidebar-overlay);
	display: flex;
}

.sidebarBackdrop {
	position: absolute;
	inset: 0;
	background: rgba(7, 0, 26, 0.8);
}

.sidebarPanel {
	position: relative;
	width: 280px;
	max-width: 85vw;
	height: 100%;
	background: var(--bg-panel);
	border-right: 1px solid var(--border-mid);
	z-index: 1;
	animation: slideIn 0.2s ease-out;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

@keyframes slideIn {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(0);
	}
}
```

- [ ] **Step 2: Write TabletLayout.tsx**

```tsx
import type { PanelType } from "../../types/lesson";
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./TabletLayout.module.css";

export function TabletLayout() {
	const { activePanel, setActivePanel, sidebarOpen, closeSidebar } = useLessonStore();

	return (
		<div className={styles.tabletLayout}>
			{sidebarOpen && (
				<div className={styles.sidebarOverlay}>
					<div
						className={styles.sidebarBackdrop}
						onClick={closeSidebar}
						onKeyDown={(e) => {
							if (e.key === "Escape") closeSidebar();
						}}
					/>
					<div className={styles.sidebarPanel}>
						<Sidebar overlay onLessonSelect={closeSidebar} />
					</div>
				</div>
			)}

			<div className={styles.contentArea}>
				<TabBar variant="tablet" />
				<div className={styles.contentBody}>
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
				</div>
			</div>
		</div>
	);
}
```

Wait — the TabletLayout shouldn't import `PanelType` directly. Let me rewrite it without unused import:

```tsx
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./TabletLayout.module.css";

export function TabletLayout() {
	const { activePanel, sidebarOpen, closeSidebar } = useLessonStore();

	return (
		<div className={styles.tabletLayout}>
			{sidebarOpen && (
				<div className={styles.sidebarOverlay}>
					<div
						className={styles.sidebarBackdrop}
						onClick={closeSidebar}
						onKeyDown={(e) => {
							if (e.key === "Escape") closeSidebar();
						}}
					/>
					<div className={styles.sidebarPanel}>
						<Sidebar overlay onLessonSelect={closeSidebar} />
					</div>
				</div>
			)}

			<div className={styles.contentArea}>
				<TabBar variant="tablet" />
				<div className={styles.contentBody}>
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
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 3: Update Sidebar.tsx for overlay and onLessonSelect props**

Read `src/components/layout/Sidebar.tsx` and add new props interface + wire them in.

Change the `export const Sidebar: React.FC = () => {` line to:

```tsx
interface SidebarProps {
	overlay?: boolean;
	onLessonSelect?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ overlay, onLessonSelect }) => {
```

Then update `handleLessonClick` and `handleSubLessonClick` to call `onLessonSelect`:

In `handleLessonClick`:
```typescript
	const handleLessonClick = (lesson: Lesson) => {
		setActiveLesson(lesson.id);
		onLessonSelect?.();
		// Auto-expand when clicking a main lesson that has sub-lessons
		if (lesson.subLessons?.length) {
			setExpandedLessons((prev) => {
				const next = new Set(prev);
				next.add(lesson.id);
				return next;
			});
		}
	};
```

In `handleSubLessonClick`:
```typescript
	const handleSubLessonClick = (subId: string, parentId: string) => {
		setActiveLesson(subId);
		onLessonSelect?.();
		setExpandedLessons((prev) => {
			const next = new Set(prev);
			next.add(parentId);
			return next;
		});
	};
```

- [ ] **Step 4: Add sidebar overlay styles**

Add at the bottom of `src/components/layout/Sidebar.module.css`:

```css
/* Overlay mode */
.sidebar.overlay {
	border-right: none;
}
```

Add the `overlay` class conditionally to the root sidebar div. In the JSX, change:
```tsx
		<div className={styles.sidebar}>
```
to:
```tsx
		<div className={`${styles.sidebar} ${overlay ? styles.overlay : ""}`}>
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/TabletLayout.tsx src/components/layout/TabletLayout.module.css src/components/layout/Sidebar.tsx src/components/layout/Sidebar.module.css
git commit -m "feat(layout): add TabletLayout with collapsible overlay sidebar"
```

---

### Task 8: Wire Up Workspace with Responsive Branching

**Files:**
- Modify: `src/components/layout/Workspace.tsx`

- [ ] **Step 1: Replace Workspace.tsx**

```tsx
import { useResponsive } from "../../hooks/useResponsive";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";
import { TabletLayout } from "./TabletLayout";

export function Workspace() {
	const { isMobile, isTablet } = useResponsive();

	if (isMobile) return <MobileLayout />;
	if (isTablet) return <TabletLayout />;
	return <DesktopLayout />;
}
```

- [ ] **Step 2: Verify compilation and build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Workspace.tsx
git commit -m "feat(layout): branch Workspace into DesktopLayout, TabletLayout, or MobileLayout by breakpoint"
```

---

### Task 9: Header — Tablet/Mobile Hamburger Button

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Header.module.css`

- [ ] **Step 1: Add hamburger button to Header.tsx**

Import `useResponsive` and `sidebarOpen/toggleSidebar`:

```tsx
import type React from 'react'
import { useResponsive } from '../../hooks/useResponsive'
import { useLessonStore } from '../../store/lessonStore'
import styles from './Header.module.css'

export const Header: React.FC = () => {
  const { getProgress, activeLesson, currentStreak, sidebarOpen, toggleSidebar } = useLessonStore()
  const { isDesktop } = useResponsive()
  const progress = getProgress()
```

Add the hamburger button **before** the logo section in the header:

```tsx
  return (
    <header className={styles.header}>
      {!isDesktop && (
        <button
          type="button"
          className={styles.hamburgerButton}
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          aria-label="Toggle lesson sidebar"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}
      <div className={styles.logoSection}>
```

- [ ] **Step 2: Add hamburger button styles to Header.module.css**

Add at the bottom:

```css
.hamburgerButton {
	font-size: var(--text-2xl);
	color: var(--neon-cyan);
	background: transparent;
	border: 1px solid var(--border-dim);
	padding: var(--spacing-xs) var(--spacing-sm);
	cursor: pointer;
	transition: all 0.12s ease;
	flex-shrink: 0;
	min-height: var(--touch-target);
	min-width: var(--touch-target);
	display: flex;
	align-items: center;
	justify-content: center;
}

.hamburgerButton:hover {
	border-color: var(--neon-cyan);
	box-shadow: var(--glow-cyan);
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Header.module.css
git commit -m "feat(header): add responsive hamburger button for tablet/mobile sidebar toggle"
```

---

### Task 10: Editor Panel — Responsive Vertical Splits

**Files:**
- Modify: `src/components/editor/EditorPanel.tsx`
- Modify: `src/components/editor/EditorPanel.module.css`

- [ ] **Step 1: Update EditorPanel.tsx — add responsive layout**

Replace the JSX return at the bottom (from `return (` onward) with the desktop/tablet/mobile-aware version. Import `useResponsive` at the top of the component:

Inside `EditorPanel`, add:
```tsx
	const { isMobile, isTablet } = useResponsive();
```

Replace the return block from `return (` through the end of the component:

```tsx
	return (
		<div className={styles.editorPanel}>
			{activeTab !== "scratch" && <ChallengeInfo />}

			<div className={isMobile ? styles.editorWrapMobile : styles.editorWrap}>
				<div className={styles.editorBar}>
					<div className={styles.editorTabs}>
						<button
							type="button"
							className={`${styles.editorTab} ${activeTab === "challenge" ? styles.active : ""}`}
							onClick={() => handleTabClick("challenge")}
						>
							challenge.js
						</button>
						<button
							type="button"
							className={`${styles.editorTab} ${activeTab === "scratch" ? styles.active : ""}`}
							onClick={() => handleTabClick("scratch")}
						>
							scratch.js
						</button>
					</div>
					<div className={styles.editorActions}>
						<button
							type="button"
							className={`${styles.editorButton} ${styles.resetButton}`}
							onClick={handleReset}
							data-tooltip="Reset code to starter template"
						>
							↺ RESET
						</button>
						<button
							type="button"
							className={`${styles.editorButton} ${styles.runButton} ${isExecuting ? styles.executing : ""}`}
							onClick={handleRun}
							disabled={isExecuting}
							data-tooltip={
								isExecuting ? "Code is running…" : "Run code (Ctrl+Enter)"
							}
						>
							{runButtonText} <span className={styles.shortcut}>^↵</span>
						</button>
					</div>
				</div>
				<div className={styles.editorBody}>
					<div ref={containerRef} className={styles.editorContainer} />
				</div>
			</div>

			{/* Bottom section: flexible on narrow, side-by-side on wide */}
			<div className={isMobile || isTablet ? styles.bottomSectionStacked : styles.bottomSection}>
				<div className={isMobile || isTablet ? styles.consoleWrapFull : styles.consoleWrap}>
					<ConsolePanel />
				</div>

				{!isMobile && (
					<div className={styles.feedbackWrap}>
						<FeedbackPanel
							diagnostics={diagnostics}
							onGoToLine={(line) => goToLine(line)}
						/>
					</div>
				)}
			</div>
		</div>
	);
```

- [ ] **Step 2: Update EditorPanel.module.css — new responsive classes**

Add these new classes before the existing `@media` queries:

```css
.editorWrapMobile {
	flex: 1;
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid var(--border-mid);
	overflow: hidden;
	min-height: 200px;
}

.bottomSectionStacked {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 0;
}

.consoleWrapFull {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 0;
}
```

Remove the `border-left: 1px solid var(--border-mid);` from `.feedbackWrap` (line 158) since the layout handles this:

Replace:
```css
.feedbackWrap {
	width: 300px;
	flex-shrink: 0;
	border-left: 1px solid var(--border-mid);
	overflow: hidden;
}
```
With:
```css
.feedbackWrap {
	width: 280px;
	flex-shrink: 0;
	overflow: hidden;
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/EditorPanel.tsx src/components/editor/EditorPanel.module.css
git commit -m "feat(editor): add responsive editor/console split for mobile, tablet, and desktop"
```

---

### Task 11: Console Panel — Feedback Toggle Button

**Files:**
- Modify: `src/components/editor/ConsolePanel.tsx`
- Modify: `src/components/editor/ConsolePanel.module.css`

- [ ] **Step 1: Add toggle button to ConsolePanel.tsx**

Add import and wire toggle:

```tsx
import { useResponsive } from "../../hooks/useResponsive";
import { useEditorStore } from "../../store/editorStore";
import { useLessonStore } from "../../store/lessonStore";
import styles from "./ConsolePanel.module.css";

export const ConsolePanel: React.FC = () => {
	const { consoleMessages, clearConsole } = useEditorStore();
	const { feedbackOpen, toggleFeedback } = useLessonStore();
	const { isDesktop } = useResponsive();
```

Add the toggle button next to the CLEAR button in the `consoleBar`:

```tsx
			<div className={styles.consoleBar}>
				<div className={styles.consoleTitle}>
					<div className={styles.statusDot}></div>
					CONSOLE
				</div>
				<div className={styles.consoleActions}>
					{!isDesktop && (
						<button className={styles.clearButton} type="button" onClick={toggleFeedback}>
							{feedbackOpen ? "HIDE ISSUES" : "ISSUES"}
						</button>
					)}
					<button className={styles.clearButton} type="button" onClick={handleClear}>
						CLEAR
					</button>
				</div>
			</div>
```

- [ ] **Step 2: Update ConsolePanel.module.css**

Add `.consoleActions` class:

```css
.consoleActions {
	display: flex;
	gap: var(--spacing-xs);
	flex-shrink: 0;
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/ConsolePanel.tsx src/components/editor/ConsolePanel.module.css
git commit -m "feat(editor): add feedback/ISSUES toggle button to ConsolePanel for tablet/mobile"
```

---

### Task 12: FeedbackPanel — Collapsible Drawer on Mobile

**Files:**
- Modify: `src/components/checker/FeedbackPanel.tsx`
- Modify: `src/components/checker/FeedbackPanel.module.css`

- [ ] **Step 1: Add collapsible and expanded props to FeedbackPanel.tsx**

Change the component signature:

```tsx
interface FeedbackPanelProps {
	diagnostics: Diagnostic[];
	onGoToLine?: (line: number) => void;
	collapsible?: boolean;
	expanded?: boolean;
}
```

Wire `collapsible` into the root div class:

Find: `<div className={styles.feedbackPanel}>`
Replace with: `<div className={`${styles.feedbackPanel} ${collapsible ? styles.collapsible : ""}`}>`

For the closed state (collapsible=true, expanded=false), replace the entire panel content. Add after the existing `if (!collapsible && diagnostics.length === 0)` or add a new early return wrapper:

Actually, simpler approach — add a conditional wrapper at the very top of the return:

```tsx
	if (collapsible && !expanded) {
		return (
			<div className={`${styles.feedbackPanel} ${styles.collapsible}`}>
				<div className={styles.header}>
					<span className={styles.title}>ISSUES</span>
					<span className={styles.count}>
						{diagnostics.length}
					</span>
				</div>
			</div>
		);
	}
```

This goes right after the existing `if (diagnostics.length === 0)` block (after that closing `}`), and BEFORE the error/warning/info count computation block.

- [ ] **Step 2: Add collapsible styles to FeedbackPanel.module.css**

Remove the `border-left` from `.feedbackPanel` class (line 8):

Replace:
```css
.feedbackPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
  border-left: 1px solid var(--border-mid);
}
```
With:
```css
.feedbackPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-panel);
}
```

Add at the bottom:

```css
.feedbackPanel.collapsible {
	height: auto;
	max-height: 44px;
	overflow: hidden;
	border-top: 1px solid var(--border-mid);
}

@media (max-width: 640px) {
	.feedbackPanel.collapsible {
		max-height: 44px;
	}
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit --pretty --project tsconfig.app.json 2>&1 | head -30`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/checker/FeedbackPanel.tsx src/components/checker/FeedbackPanel.module.css
git commit -m "feat(checker): add collapsible feedback panel for mobile bottom-sheet mode"
```

---

### Task 13: Lesson Panel Token Swap

**Files:**
- Modify: `src/components/lesson/LessonPanel.module.css`

- [ ] **Step 1: Replace hardcoded values with fluid tokens**

Replace line-height on `.lessonBody`:
```css
	line-height: var(--line-height-relaxed);
```

Replace font-size on `.lessonTitle`:
```css
	font-size: clamp(var(--text-xl), 3vw, var(--text-2xl));
```

Replace line-height on `.lessonIntro`:
```css
	line-height: var(--line-height-relaxed);
```

Replace padding on `.lessonBody`:
```css
	padding: var(--spacing-lg) var(--spacing-md) 0;
```

Replace padding on `.panelBar`:
```css
	padding: var(--spacing-sm) var(--spacing-md);
```

Replace padding on `.lessonFooter`:
```css
	padding: var(--spacing-sm) var(--spacing-md);
```

Replace gap on `.panelPills`:
```css
	gap: var(--spacing-xs);
```

- [ ] **Step 2: Also fix the StatusBar hideOnSmall breakpoint**

In `src/components/layout/StatusBar.module.css` (line 78), change:
```css
@media (max-width: 600px) {
```
to:
```css
@media (max-width: 480px) {
```

This keeps the ACTIVE RULES label visible on wider small screens.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/lesson/LessonPanel.module.css src/components/layout/StatusBar.module.css
git commit -m "refactor(lesson): replace hardcoded padding/line-height with fluid design tokens"
```

---

### Task 14: Remove Old Files and Clean Up

**Files:**
- Remove: `src/components/layout/MobileTabBar.tsx`
- Remove: `src/components/layout/MobileTabBar.module.css`
- Remove: `src/components/layout/Workspace.module.css`

- [ ] **Step 1: Remove old files**

Run: `rm src/components/layout/MobileTabBar.tsx src/components/layout/MobileTabBar.module.css src/components/layout/Workspace.module.css`

- [ ] **Step 2: Update global.css to remove old imports**

The `src/styles/global.css` file imports `./resize-handle.css`. The old `Workspace.module.css` was NOT imported there — each component imported its own CSS module. So no changes needed in global.css.

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: Build succeeds with no references to deleted files.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/layout/
git commit -m "chore: remove old MobileTabBar and Workspace.module.css"
```

---

### Task 15: Test — useResponsive Hook

**Files:**
- Create: `src/hooks/useResponsive.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { describe, expect, it } from "vitest";
import { computeBreakpoint } from "./useResponsive";

// Note: We test the pure function since hooks require React render context
describe("computeBreakpoint", () => {
	it("returns xs for widths below 320px", () => {
		expect(computeBreakpoint(280)).toBe("xs");
	});

	it("returns sm for widths between 320px and 639px", () => {
		expect(computeBreakpoint(320)).toBe("sm");
		expect(computeBreakpoint(500)).toBe("sm");
	});

	it("returns md for widths between 640px and 1023px", () => {
		expect(computeBreakpoint(640)).toBe("md");
		expect(computeBreakpoint(800)).toBe("md");
	});

	it("returns lg for widths between 1024px and 1439px", () => {
		expect(computeBreakpoint(1024)).toBe("lg");
		expect(computeBreakpoint(1366)).toBe("lg");
	});

	it("returns xl for widths at or above 1440px", () => {
		expect(computeBreakpoint(1440)).toBe("xl");
		expect(computeBreakpoint(2560)).toBe("xl");
	});
});

describe("deriveResponsiveInfo", () => {
	it("marks xs/sm breakpoints as mobile", () => {
		const { deriveResponsiveInfo } = require("./useResponsive");
		expect(deriveResponsiveInfo(360, "portrait").isMobile).toBe(true);
		expect(deriveResponsiveInfo(480, "portrait").isMobile).toBe(true);
	});

	it("marks md breakpoint as tablet", () => {
		const { deriveResponsiveInfo } = require("./useResponsive");
		expect(deriveResponsiveInfo(768, "portrait").isTablet).toBe(true);
		expect(deriveResponsiveInfo(768, "landscape").isTablet).toBe(true);
	});

	it("marks lg/xl breakpoints as desktop", () => {
		const { deriveResponsiveInfo } = require("./useResponsive");
		expect(deriveResponsiveInfo(1200, "portrait").isDesktop).toBe(true);
		expect(deriveResponsiveInfo(1920, "landscape").isDesktop).toBe(true);
	});

	it("tracks orientation", () => {
		const { deriveResponsiveInfo } = require("./useResponsive");
		expect(deriveResponsiveInfo(800, "portrait").orientation).toBe("portrait");
		expect(deriveResponsiveInfo(800, "landscape").orientation).toBe("landscape");
	});
});
```

- [ ] **Step 2: Export the pure functions for testing**

In `src/hooks/useResponsive.ts`, add `export` to the two functions:

Change `function computeBreakpoint` to `export function computeBreakpoint`
Change `function deriveResponsiveInfo` to `export function deriveResponsiveInfo`

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/ src/store/ src/components/ src/styles/ src/App.tsx
git commit -m "test(responsive): add breakpoint computation unit tests"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Run full lint**

Run: `npm run lint`
Expected: No lint errors. If there are any, fix them.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds with no warnings.

- [ ] **Step 4: Start dev server and visually verify at multiple widths**

Run: `npm run dev`
Open browser and test at:
- 320px (mobile portrait) — tab bar visible, single panel
- 640px (midpoint) — should be tablet layout with tabs at top
- 768px (iPad portrait) — tablet layout, hamburger available
- 1024px (iPad landscape) — desktop 3-panel layout
- 1440px+ (desktop) — full resizable panels

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final lint and build verification for responsive overhaul"
```

---

## Plan Self-Review

**1. Spec coverage:**
- [x] Breakpoint system (5-tier em-based) → Task 2 (useResponsive.ts)
- [x] Layout mode matrix (3 layouts per breakpoint) → Tasks 5-8
- [x] Fluid typography tokens → Task 1 (tokens.css)
- [x] New components (ResponsiveShell, DesktopLayout, TabletLayout, MobileLayout, TabBar) → Tasks 2-7
- [x] Modified Header with hamburger → Task 9
- [x] Modified Sidebar with overlay → Task 7 steps 3-4
- [x] Modified EditorPanel with responsive splits → Task 10
- [x] Modified ConsolePanel with feedback toggle → Task 11
- [x] Modified FeedbackPanel with collapsible → Task 12
- [x] Modified LessonPanel with token swap → Task 13
- [x] Modified lessonStore with UI state → Task 4
- [x] Remove old files → Task 14
- [x] Edge cases → implicit in responsive design, plus StatusBar fix (Task 13)
- [x] Testing → Task 15
- [x] Final lint + build → Task 16

**2. Placeholder scan:** No "TBD", "TODO", or vague instructions found.

**3. Type consistency:** `useResponsive` returns `ResponsiveInfo { isMobile, isTablet, isDesktop }` defined in Task 2, consumed consistently in Tasks 5-12. `LessonState.sidebarOpen/feedbackOpen` defined in Task 4, consumed in Tasks 7, 9, 11, 12. All imports reference correct relative paths.

