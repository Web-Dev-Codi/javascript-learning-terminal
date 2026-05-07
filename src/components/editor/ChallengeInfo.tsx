import { useState } from 'react'
import { findLessonById, useLessonStore } from '../../store/lessonStore'
import type { ChallengeSection } from '../../types/lesson'
import styles from './ChallengeInfo.module.css'

export function ChallengeInfo() {
  const { activeLesson } = useLessonStore()
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  if (!activeLesson) return null

  const lesson = findLessonById(activeLesson)
  if (!lesson) return null

  const challengeSection = lesson.sections.find(
    (s): s is ChallengeSection => s.type === 'challenge',
  )

  if (!challengeSection) {
    return (
      <div className={styles.noChallenge}>
        No challenge for this lesson. Use the editor as a scratchpad.
      </div>
    )
  }

  const hints = challengeSection.hints ?? []
  const hasHints = hints.length > 0
  const currentHint = hints[hintIndex] ?? ''
  const hasMoreHints = hintIndex < hints.length - 1

  return (
    <div className={styles.challengeInfo}>
      <div className={styles.challengeHeader}>
        <span className={styles.challengeIcon}>🎯</span>
        <span className={styles.challengeLabel}>CHALLENGE</span>
      </div>
      <div className={styles.challengePrompt}>{challengeSection.prompt}</div>

      {hasHints && (
        <div className={styles.hintsArea}>
          {showHints ? (
            <div className={styles.hintReveal}>
              <div className={styles.hintText}>
                <strong>💡 HINT {hintIndex + 1}:</strong> {currentHint}
              </div>
              <div className={styles.hintActions}>
                {hasMoreHints && (
                  <button
                    type="button"
                    className={styles.hintButton}
                    onClick={() => setHintIndex(hintIndex + 1)}
                  >
                    💡 NEXT HINT
                  </button>
                )}
                <button
                  type="button"
                  className={styles.hideHintButton}
                  onClick={() => {
                    setShowHints(false)
                    setHintIndex(0)
                  }}
                >
                  HIDE
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={styles.hintButton}
              onClick={() => setShowHints(true)}
            >
              💡 SHOW HINT
            </button>
          )}
        </div>
      )}
    </div>
  )
}
