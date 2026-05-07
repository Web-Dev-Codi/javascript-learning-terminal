import type React from 'react'
import { useResponsive } from '../../hooks/useResponsive'
import { useLessonStore } from '../../store/lessonStore'
import styles from './Header.module.css'

export const Header: React.FC = () => {
  const { getProgress, activeLesson, currentStreak, sidebarOpen, toggleSidebar } = useLessonStore()
  const { isDesktop } = useResponsive()
  const progress = getProgress()
  
  // Get lesson number from active lesson ID
  const getLessonNumber = (lessonId: string | null): string => {
    if (!lessonId) return '00'
    const match = new RegExp(/^(\d+)/).exec(lessonId)
    return match ? match[1].padStart(2, '0') : '00'
  }

  const progressPercentage = (progress.completed / progress.total) * 100

  return (
    <header className={styles.header}>
      {!isDesktop && (
        <button
          type="button"
          className={styles.hamburgerButton}
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          aria-label="Toggle lesson sidebar"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <span className={styles.logoBracket}>{'{'}</span>
          SYNTHSCRIPT
          <span className={styles.logoBracket}>{'}'}</span>
        </div>
        <div className={styles.tagline}>
          <span>JAVASCRIPT</span>
          <span>LEARNING</span>
          <span>TERMINAL</span>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.progressTrack} data-tooltip="Course progress">
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <span className={styles.progressText}>
          {progress.completed}/{progress.total}
        </span>
        
        <span className={`${styles.badge} ${styles.badgeLevel}`} data-tooltip="Current level">
          L{getLessonNumber(activeLesson)}
        </span>
        
        <span className={`${styles.badge} ${styles.badgeStreak}`} data-tooltip="Day streak">
          🔥 {currentStreak}
        </span>
      </div>
    </header>
  )
}
