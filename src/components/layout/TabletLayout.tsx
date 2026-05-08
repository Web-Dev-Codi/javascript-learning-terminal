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

	const getLessonFlexClass = () => {
		if (activePanel === "lesson") return styles.lessonPanelActive;
		if (activePanel === "editor") return styles.lessonPanelInactive;
		return "";
	};

	const getEditorFlexClass = () => {
		if (activePanel === "editor") return styles.editorPanelActive;
		if (activePanel === "lesson") return styles.editorPanelInactive;
		return "";
	};

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
						role="presentation"
					/>
					<div className={styles.sidebarPanel}>
						<Sidebar overlay onLessonSelect={handleLessonSelect} />
					</div>
				</div>
			)}

			<div className={styles.splitContent}>
				<div className={`${styles.splitPanel} ${styles.lessonPanel} ${getLessonFlexClass()}`}>
					<LessonPanel />
				</div>
				<div className={styles.splitDivider} />
				<div className={`${styles.splitPanel} ${styles.editorPanel} ${getEditorFlexClass()}`}>
					<EditorPanel />
				</div>
			</div>

			<TabBar variant="tablet-bottom" />
		</div>
	);
}
