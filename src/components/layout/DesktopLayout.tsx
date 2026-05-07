import { Group, Panel, Separator } from "react-resizable-panels";
import { EditorPanel } from "../editor/EditorPanel";
import { LessonPanel } from "../lesson/LessonPanel";
import styles from "./DesktopLayout.module.css";
import { Sidebar } from "./Sidebar";

export function DesktopLayout() {
	return (
		<div className={styles.desktopLayout}>
			<Group orientation="horizontal">
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
