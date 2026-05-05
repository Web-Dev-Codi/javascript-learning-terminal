import { useState } from 'react'
import type { ChallengeTest } from '../../types/lesson'
import { ChallengeEditor } from './ChallengeEditor'
import styles from './ChallengeSection.module.css'

interface ChallengeSectionProps {
  readonly challengeId: string
  readonly prompt: string
  readonly starterCode: string
  readonly hints?: string[]
  readonly tests?: ChallengeTest[]
}

export function ChallengeSection({
  challengeId,
  prompt,
  starterCode,
  hints = [],
  tests = [],
}: ChallengeSectionProps) {
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)

  const handleShowHint = () => {
    if (!showHints) {
      setShowHints(true)
    } else if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1)
    }
  }

  const hasMoreHints = currentHintIndex < hints.length - 1

  return (
    <div className={styles.challengeWrap}>
      <div className={styles.challengeHeader}>
        <h3 className={styles.challengeTitle}>🎯 CHALLENGE</h3>
      </div>
      
      <div className={styles.challengePrompt}>
        {prompt}
      </div>

      <ChallengeEditor
        challengeId={challengeId}
        starterCode={starterCode}
      />

      {/* Hints Section */}
      {hints.length > 0 && (
        <div className={styles.hintsSection}>
          {showHints ? (
            <div className={styles.hintsContent}>
              <div className={styles.hintItem}>
                <strong>
                  💡 HINT {currentHintIndex + 1}:
                </strong>{' '}
                {hints[currentHintIndex]}
              </div>
              {hasMoreHints && (
                <button
                  className={styles.nextHintButton}
                  onClick={handleShowHint}
                  type="button"
                >
                  💡 NEXT HINT
                </button>
              )}
            </div>
          ) : (
            <button
              className={styles.hintButton}
              onClick={handleShowHint}
              type="button"
            >
              💡 SHOW HINT
            </button>
          )}
        </div>
      )}

      {/* Tests Section */}
      {tests.length > 0 && (
        <div className={styles.testsSection}>
          <h4 className={styles.testsTitle}>📋 TESTS</h4>
          <ul className={styles.testsList}>
            {tests.map((test) => (
              <li key={test.id} className={styles.testItem}>
                {test.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
