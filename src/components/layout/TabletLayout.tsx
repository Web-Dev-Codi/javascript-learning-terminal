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
