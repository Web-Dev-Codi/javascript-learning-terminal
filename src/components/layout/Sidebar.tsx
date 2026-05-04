import React, { useState, useMemo } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { lessons } from '../../data/lessons'
import type { Lesson } from '../../types/lesson'
import styles from './Sidebar.module.css'

export const Sidebar: React.FC = () => {
  const {
    activeLesson,
    setActiveLesson,
    isLessonCompleted,
    isLessonStarted
  } = useLessonStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(() => {
    // Auto-expand the parent of the active lesson on first render
    const initial = new Set<string>()
    const parent = lessons.find(l => l.subLessons?.some(s => s.id === activeLesson ?? ''))
    if (parent) initial.add(parent.id)
    if (activeLesson && lessons.find(l => l.id === activeLesson)) initial.add(activeLesson)
    return initial
  })

  const toggleExpanded = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev)
      if (next.has(lessonId)) {
        next.delete(lessonId)
      } else {
        next.add(lessonId)
      }
      return next
    })
  }

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons
    const q = searchQuery.toLowerCase()
    return lessons.filter(lesson => {
      const matchMain = lesson.title.toLowerCase().includes(q)
      const matchSub = lesson.subLessons?.some(s => s.title.toLowerCase().includes(q))
      return matchMain || matchSub
    })
  }, [searchQuery])

  const groupedLessons = useMemo(() => {
    const groups: Record<string, typeof lessons> = {
      'FUNDAMENTALS': [],
      'CONTROL FLOW': [],
      'ADVANCED': []
    }
    filteredLessons.forEach(lesson => {
      if (lesson.category === 'fundamentals') groups['FUNDAMENTALS'].push(lesson)
      else if (lesson.category === 'control-flow') groups['CONTROL FLOW'].push(lesson)
      else groups['ADVANCED'].push(lesson)
    })
    return groups
  }, [filteredLessons])

  const getLessonStatus = (lessonId: string) => {
    if (lessonId === activeLesson) return 'active'
    if (isLessonCompleted(lessonId)) return 'completed'
    if (isLessonStarted(lessonId)) return 'started'
    return 'locked'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'active': return '▶'
      case 'started': return '◐'
      default: return '○'
    }
  }

  const getLessonNum = (id: string) => id.split('-')[0].padStart(2, '0')

  const isParentOfActive = (lesson: Lesson) =>
    lesson.subLessons?.some(s => s.id === activeLesson) ?? false

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson.id)
    // Auto-expand when clicking a main lesson that has sub-lessons
    if (lesson.subLessons?.length) {
      setExpandedLessons(prev => {
        const next = new Set(prev)
        next.add(lesson.id)
        return next
      })
    }
  }

  const handleSubLessonClick = (subId: string, parentId: string) => {
    setActiveLesson(subId)
    setExpandedLessons(prev => {
      const next = new Set(prev)
      next.add(parentId)
      return next
    })
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span>// LESSONS</span>
        <span className={styles.totalCount}>{lessons.length} MODULES</span>
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
        {Object.entries(groupedLessons).map(([category, categoryLessons]) =>
          categoryLessons.length > 0 && (
            <React.Fragment key={category}>
              <div className={styles.sectionLabel}>// {category}</div>

              {categoryLessons.map((lesson) => {
                const status = getLessonStatus(lesson.id)
                const num = getLessonNum(lesson.id)
                const hasSubLessons = (lesson.subLessons?.length ?? 0) > 0
                const isExpanded = expandedLessons.has(lesson.id)
                const isActiveParent = isParentOfActive(lesson)

                return (
                  <React.Fragment key={lesson.id}>
                    {/* Main lesson row */}
                    <div
                      className={`
                        ${styles.lessonItem}
                        ${styles[status]}
                        ${isActiveParent ? styles.parentOfActive : ''}
                      `}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <span className={`${styles.statusIcon} ${styles[status]}`}>
                        {getStatusIcon(status)}
                      </span>
                      <span className={styles.lessonNumber}>{num}</span>
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                      {hasSubLessons && (
                        <button
                          className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleExpanded(lesson.id) }}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? '▾' : '▸'}
                        </button>
                      )}
                    </div>

                    {/* Sub-lessons */}
                    {hasSubLessons && isExpanded && lesson.subLessons!.map((sub, idx) => {
                      const subStatus = getLessonStatus(sub.id)
                      return (
                        <div
                          key={sub.id}
                          className={`${styles.subLessonItem} ${styles[subStatus]}`}
                          onClick={() => handleSubLessonClick(sub.id, lesson.id)}
                        >
                          <span className={styles.subIndent} />
                          <span className={`${styles.statusIcon} ${styles[subStatus]}`}>
                            {getStatusIcon(subStatus)}
                          </span>
                          <span className={styles.subLessonNum}>{String(idx + 1).padStart(2, '0')}</span>
                          <span className={styles.subLessonTitle}>{sub.title}</span>
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </React.Fragment>
          )
        )}
      </div>
    </div>
  )
}