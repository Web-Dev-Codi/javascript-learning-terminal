import React from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { Sidebar } from './Sidebar'
import { LessonPanel } from '../lesson/LessonPanel'
import { EditorPanel } from '../editor/EditorPanel'
import { MobileTabBar } from './MobileTabBar'
import styles from './Workspace.module.css'

export const Workspace: React.FC = () => {
  const { activePanel } = useLessonStore()

  return (
    <div className={styles.workspace}>
      <div className={styles.panels}>
        {/* Panel 1: Lessons Sidebar */}
        <aside 
          className={`${styles.panel} ${styles.sidebar} ${
            activePanel === 'lessons' ? styles.active : ''
          }`}
          id="panel-lessons"
        >
          <Sidebar />
        </aside>

        {/* Panel 2: Lesson Content */}
        <section 
          className={`${styles.panel} ${styles.lessonPanel} ${
            activePanel === 'lesson' ? styles.active : ''
          }`}
          id="panel-lesson"
        >
          <LessonPanel />
        </section>

        {/* Panel 3: Editor + Feedback + Console */}
        <div 
          className={`${styles.panel} ${styles.rightColumn} ${
            activePanel === 'editor' ? styles.active : ''
          }`}
          id="panel-editor"
        >
          <EditorPanel />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  )
}
