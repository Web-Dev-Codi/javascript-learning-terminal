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
