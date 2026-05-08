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
