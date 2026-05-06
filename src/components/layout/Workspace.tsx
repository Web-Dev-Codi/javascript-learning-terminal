import React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from './Sidebar'
import { LessonPanel } from '../lesson/LessonPanel'
import { EditorPanel } from '../editor/EditorPanel'
import { MobileTabBar } from './MobileTabBar'
import { useLessonStore } from '../../store/lessonStore'
import styles from './Workspace.module.css'

export const Workspace: React.FC = () => {
	const { activePanel } = useLessonStore()

	return (
		<div className={styles.workspace}>
			<div className={styles.desktopLayout}>
				<PanelGroup direction="horizontal">
					<Panel defaultSize={15} minSize={10} maxSize={25}>
						<aside className={styles.sidebar}>
							<Sidebar />
						</aside>
					</Panel>
					<PanelResizeHandle className="resizeHandle" />
					<Panel defaultSize={35} minSize={20} maxSize={50}>
						<section className={styles.lessonPanel}>
							<LessonPanel />
						</section>
					</Panel>
					<PanelResizeHandle className="resizeHandle" />
					<Panel defaultSize={50} minSize={25}>
						<div className={styles.rightColumn}>
							<EditorPanel />
						</div>
					</Panel>
				</PanelGroup>
			</div>

			<div className={styles.mobileLayout}>
				{activePanel === 'lessons' && (
					<aside className={styles.panel}>
						<Sidebar />
					</aside>
				)}
				{activePanel === 'lesson' && (
					<section className={styles.panel}>
						<LessonPanel />
					</section>
				)}
				{activePanel === 'editor' && (
					<div className={styles.panel}>
						<EditorPanel />
					</div>
				)}
				<MobileTabBar />
			</div>
		</div>
	)
}