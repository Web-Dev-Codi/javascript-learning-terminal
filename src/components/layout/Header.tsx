import type React from 'react'
import { useResponsive } from '../../hooks/useResponsive'
import { useLessonStore } from '../../store/lessonStore'
import styles from './Header.module.css'

export const Header: React.FC = () => {
  const { getProgress, activeLesson, currentStreak, sidebarOpen, toggleSidebar, statsDrawerOpen, toggleStatsDrawer, closeStatsDrawer } = useLessonStore()
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
        <button
          type="button"
          className={styles.statsPill}
          onClick={toggleStatsDrawer}
          aria-expanded={statsDrawerOpen}
          aria-label="Toggle stats"
        >
          <div className={styles.statsPillProgress}>
            <div
              className={styles.statsPillFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className={styles.statsPillText}>
            {progress.completed}/{progress.total}
          </span>
          <span className={`${styles.statsPillChevron} ${statsDrawerOpen ? styles.chevronOpen : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Stats drawer - only on non-desktop */}
      {!isDesktop && statsDrawerOpen && (
        <>
          <div className={styles.drawerBackdrop} onClick={closeStatsDrawer} role="presentation" />
          <div className={styles.statsDrawer}>
            <div className={styles.drawerRow} style={{ animationDelay: '0ms' }}>
              <span className={styles.drawerLabel}>PROGRESS</span>
              <div className={styles.drawerProgressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className={styles.drawerRow} style={{ animationDelay: '100ms' }}>
              <span className={styles.drawerLabel}>COMPLETED</span>
              <span className={styles.drawerValue}>{progress.completed}/{progress.total}</span>
            </div>
            <div className={styles.drawerRow} style={{ animationDelay: '200ms' }}>
              <span className={styles.drawerLabel}>LEVEL</span>
              <span className={styles.drawerValue}>L{getLessonNumber(activeLesson)}</span>
            </div>
            <div className={styles.drawerRow} style={{ animationDelay: '300ms' }}>
              <span className={styles.drawerLabel}>STREAK</span>
              <span className={styles.drawerValue}>🔥 {currentStreak}</span>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
