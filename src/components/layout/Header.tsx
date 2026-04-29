import React from 'react'
import { useLessonStore } from '../../store/lessonStore'
import styles from './Header.module.css'

export const Header: React.FC = () => {
  const { getProgress, activeLesson, currentStreak } = useLessonStore()
  const progress = getProgress()
  
  // Get lesson number from active lesson ID
  const getLessonNumber = (lessonId: string | null): string => {
    if (!lessonId) return '00'
    const match = lessonId.match(/^(\d+)/)
    return match ? match[1].padStart(2, '0') : '00'
  }

  const progressPercentage = (progress.completed / progress.total) * 100

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoBracket}>{'{'}</span>
        SYNTHSCRIPT
        <span className={styles.logoBracket}>{'}'}</span>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <span className={styles.progressText}>
          {progress.completed}/{progress.total}
        </span>
        
        <span className={`${styles.badge} ${styles.badgeLevel}`}>
          L{getLessonNumber(activeLesson)}
        </span>
        
        <span className={`${styles.badge} ${styles.badgeStreak}`}>
          🔥 {currentStreak}
        </span>
      </div>
    </header>
  )
}
