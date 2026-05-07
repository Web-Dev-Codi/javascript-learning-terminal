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
