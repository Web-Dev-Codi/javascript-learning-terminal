import { useEffect } from "react";
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import styles from "./MobileLayout.module.css";

export function MobileLayout() {
	const { activePanel, sidebarOpen, closeSidebar, setActivePanel } = useLessonStore();

	useEffect(() => {
		if (sidebarOpen) {
			setActivePanel("lessons");
		}
	}, [sidebarOpen, setActivePanel]);

	const handleLessonSelect = () => {
		setActivePanel("lesson");
		closeSidebar();
	};

	return (
		<div className={styles.mobileLayout}>
			{activePanel === "lessons" && (
				<aside className={styles.panel}>
					<Sidebar onLessonSelect={handleLessonSelect} />
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
