import type React from 'react'
import { lessons } from '../../data/lessons'
import { useEditorStore } from '../../store/editorStore'
import { useLessonStore } from '../../store/lessonStore'
import styles from './StatusBar.module.css'

export const StatusBar: React.FC = () => {
  const { cursorPosition, runnerStatus, issueSummary } = useEditorStore()
  const { activeLesson } = useLessonStore()

  const activeRules = activeLesson
    ? lessons.find((l) => l.id === activeLesson)?.activeRules ?? []
    : []

  const getStatusDotClass = () => {
    switch (runnerStatus) {
      case 'running':
        return styles.running
      case 'error':
        return styles.error
      case 'ready':
        return styles.ready
      default:
        return styles.ready
    }
  }

  const getStatusText = () => {
    switch (runnerStatus) {
      case 'running':
        return 'RUNNING'
      case 'error':
        return 'ERROR'
      case 'ready':
        return 'READY'
      default:
        return 'IDLE'
    }
  }

  const totalIssues = issueSummary.errors + issueSummary.warnings + issueSummary.info

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <div className={styles.statusItem}>
          <div className={`${styles.statusDot} ${getStatusDotClass()}`} />
          <span>{getStatusText()}</span>
        </div>
        <div className={styles.statusSeparator} />
        <div className={styles.statusItem}>
          <span>{totalIssues} ISSUE{totalIssues === 1 ? '' : 'S'}</span>
        </div>
        <div className={styles.statusSeparator} />
        <div className={`${styles.statusItem} ${styles.hideOnSmall}`}>
          <span>
            ACTIVE RULES: {activeRules.length > 0 ? activeRules.length : '—'}
          </span>
        </div>
      </div>
      <div className={styles.statusRight}>
        <div className={styles.statusItem}>
          <span>LN {cursorPosition.line}</span>
        </div>
        <div className={styles.statusSeparator} />
        <div className={styles.statusItem}>
          <span>COL {cursorPosition.column}</span>
        </div>
      </div>
    </div>
  )
}
