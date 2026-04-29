import React, { useState, useMemo } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { lessons } from '../../data/lessons'
import styles from './Sidebar.module.css'

export const Sidebar: React.FC = () => {
  const { 
    activeLesson, 
    setActiveLesson, 
    completedLessons, 
    isLessonCompleted, 
    isLessonStarted 
  } = useLessonStore()
  
  const [searchQuery, setSearchQuery] = useState('')

  // Filter lessons based on search query
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons
    
    return lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group lessons by category based on their IDs
  const groupedLessons = useMemo(() => {
    const groups: Record<string, typeof lessons> = {
      'FUNDAMENTALS': [],
      'CONTROL FLOW': [],
      'ADVANCED': []
    }

    filteredLessons.forEach(lesson => {
      if (lesson.id.startsWith('01') || lesson.id.startsWith('02') || lesson.id.startsWith('03') || lesson.id.startsWith('04')) {
        groups['FUNDAMENTALS'].push(lesson)
      } else if (lesson.id.startsWith('05') || lesson.id.startsWith('06') || lesson.id.startsWith('07') || lesson.id.startsWith('08') || lesson.id.startsWith('09')) {
        groups['CONTROL FLOW'].push(lesson)
      } else {
        groups['ADVANCED'].push(lesson)
      }
    })

    return groups
  }, [filteredLessons])

  const getLessonStatus = (lessonId: string) => {
    if (lessonId === activeLesson) return 'active'
    if (isLessonCompleted(lessonId)) return 'completed'
    if (isLessonStarted(lessonId)) return 'started'
    return 'locked'
  }

  const getLessonNumber = (lessonId: string): string => {
    const match = lessonId.match(/^(\d+)/)
    return match ? match[1].padStart(2, '0') : '??'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'active': return '▶'
      default: return '○'
    }
  }

  const handleLessonClick = (lessonId: string) => {
    setActiveLesson(lessonId)
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span>// LESSONS</span>
        <span className={styles.totalCount}>{lessons.length} TOTAL</span>
      </div>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="search lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.lessonList}>
        {Object.entries(groupedLessons).map(([category, categoryLessons]) => (
          categoryLessons.length > 0 && (
            <React.Fragment key={category}>
              <div className={styles.sectionLabel}>
                // {category}
              </div>
              
              {categoryLessons.map((lesson) => {
                const status = getLessonStatus(lesson.id)
                const lessonNumber = getLessonNumber(lesson.id)
                
                return (
                  <div
                    key={lesson.id}
                    className={`${styles.lessonItem} ${styles[status]}`}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <span className={`${styles.statusIcon} ${styles[status]}`}>
                      {getStatusIcon(status)}
                    </span>
                    <span className={styles.lessonNumber}>{lessonNumber}</span>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                  </div>
                )
              })}
            </React.Fragment>
          )
        ))}
      </div>
    </div>
  )
}
