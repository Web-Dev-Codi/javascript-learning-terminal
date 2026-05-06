import type React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useLessonStore } from "../../store/lessonStore";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import { MobileTabBar } from "./MobileTabBar";
import { Sidebar } from "./Sidebar";
import styles from "./Workspace.module.css";

export const Workspace: React.FC = () => {
	const { activePanel } = useLessonStore();

	return (
		<div className={styles.workspace}>
			<div className={styles.desktopLayout}>
				<Group orientation="horizontal">
					<Panel defaultSize={15} minSize={10} maxSize={25}>
						<aside className={styles.sidebar}>
							<Sidebar />
						</aside>
					</Panel>
					<Separator className="resizeHandle" />
					<Panel defaultSize={35} minSize={20} maxSize={50}>
						<section className={styles.lessonPanel}>
							<LessonPanel />
						</section>
					</Panel>
					<Separator className="resizeHandle" />
					<Panel defaultSize={50} minSize={25}>
						<div className={styles.rightColumn}>
							<EditorPanel />
						</div>
					</Panel>
				</Group>
			</div>

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
				<MobileTabBar />
			</div>
		</div>
	);
};
