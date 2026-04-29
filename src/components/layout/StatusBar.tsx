import React from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useLessonStore } from '../../store/lessonStore'
import styles from './StatusBar.module.css'

export const StatusBar: React.FC = () => {
  const { cursorPosition, consoleMessages } = useEditorStore()
  const { activeLesson } = useLessonStore()

  const getActiveRules = (): string => {
    // This would be enhanced to show actual active rules from the current lesson
    return activeLesson ? 'SYNTAX' : 'NONE'
  }

  const getIssueCount = (): number => {
    // This would be enhanced to count actual syntax issues
    return 0
  }

  const getSandboxStatus = (): 'ready' | 'running' | 'error' => {
    // This would be enhanced to show actual sandbox status
    return 'ready'
  }

  const sandboxStatus = getSandboxStatus()
  const issueCount = getIssueCount()
  const activeRules = getActiveRules()

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusLeft}>
        <div className={styles.statusItem}>
          <div className={`${styles.statusDot} ${styles[sandboxStatus]}`} />
          <span>SANDBOX</span>
        </div>
        
        <div className={styles.statusSeparator} />
        
        <div className={styles.statusItem}>
          <span>{issueCount} ISSUES</span>
        </div>
        
        <div className={styles.statusSeparator} />
        
        <div className={styles.statusItem}>
          <span>{activeRules}</span>
        </div>
      </div>

      <div className={styles.statusRight}>
        <div className={`${styles.statusItem} ${styles.hideOnSmall}`}>
          <span>LINE {cursorPosition.line}</span>
        </div>
        
        <div className={styles.statusSeparator} />
        
        <div className={`${styles.statusItem} ${styles.hideOnSmall}`}>
          <span>COL {cursorPosition.column}</span>
        </div>
        
        <div className={styles.statusSeparator} />
        
        <div className={styles.statusItem}>
          <span>JAVASCRIPT</span>
        </div>
      </div>
    </div>
  )
}
