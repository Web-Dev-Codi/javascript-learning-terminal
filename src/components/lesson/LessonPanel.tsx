import React from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { lessons } from '../../data/lessons'
import { LessonSection } from './LessonSection'
import styles from './LessonPanel.module.css'
import { useSandbox } from '../sandbox/useSandbox'

export const LessonPanel: React.FC = () => {
  const { activeLesson } = useLessonStore()
  const { executeTrusted } = useSandbox()

  const currentLesson = lessons.find(lesson => lesson.id === activeLesson)

  const handleRunExample = (code: string) => {
    // Execute trusted example code (bypasses syntax checker per spec I-09)
    void executeTrusted(code)
  }

  return (
    <div className={styles.lessonPanel}>
      <div className={styles.panelBar}>
        <span className={styles.panelTitle}>
          {currentLesson ? `// ${currentLesson.id.toUpperCase().replace('-', ' — ')}` : '// SELECT A LESSON'}
        </span>
        {currentLesson && (
          <div className={styles.panelPills}>
            <span className={`${styles.pill} ${styles[currentLesson.difficulty]}`}>
              {currentLesson.difficulty.toUpperCase()}
            </span>
            <span className={`${styles.pill} ${styles.pillTime}`}>
              ⏱ {currentLesson.estimatedMinutes} MIN
            </span>
          </div>
        )}
      </div>

      <div className={styles.lessonBody}>
        {currentLesson ? (
          <div>
            <h1 className={styles.lessonTitle}>
              {currentLesson.title.toUpperCase()}
            </h1>

            {currentLesson.sections.map((section, index) => (
              <LessonSection
                key={index}
                section={section}
                onRunExample={handleRunExample}
              />
            ))}

            <div className={styles.lessonFooter}>
              <button className={styles.pageButton}>
                ← PREV
              </button>
              <div className={styles.dots}>
                {currentLesson.sections.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.dot} ${index === 0 ? styles.active : ''}`}
                  />
                ))}
              </div>
              <button className={styles.pageButton}>
                NEXT →
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h1 className={styles.lessonTitle}>NO LESSON SELECTED</h1>
            <p className={styles.lessonIntro}>
              Choose a lesson from the sidebar to get started with your JavaScript learning journey.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
