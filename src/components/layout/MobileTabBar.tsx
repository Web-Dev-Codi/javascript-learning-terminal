import React from 'react'
import { useLessonStore } from '../../store/lessonStore'
import styles from './MobileTabBar.module.css'

export const MobileTabBar: React.FC = () => {
  const { activePanel, setActivePanel } = useLessonStore()

  const tabs = [
    { id: 'lessons' as const, label: 'LESSONS', icon: '📚' },
    { id: 'lesson' as const, label: 'LESSON', icon: '📖' },
    { id: 'editor' as const, label: 'EDITOR', icon: '💻' }
  ]

  const handleTabClick = (tabId: typeof activePanel) => {
    setActivePanel(tabId)
  }

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          className={`${styles.tabButton} ${
            activePanel === tab.id ? styles.active : ''
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
