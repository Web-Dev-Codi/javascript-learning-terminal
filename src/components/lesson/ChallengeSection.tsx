import React, { useState } from 'react'
import type { ChallengeSection as ChallengeSectionType } from '../../types/lesson'
import styles from './ChallengeSection.module.css'

interface ChallengeSectionProps {
  prompt: string
  starterCode: string
  hints?: string[]
  tests?: Array<{
    description: string
    fn: string
  }>
}

export const ChallengeSection: React.FC<ChallengeSectionProps> = ({
  prompt,
  starterCode,
  hints = [],
  tests = []
}) => {
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

      {/* Code editor placeholder - will be integrated with actual editor */}
      <div className={styles.codeEditorPlaceholder}>
        <div className={styles.editorHeader}>
          <span className={styles.editorLabel}>CHALLENGE CODE</span>
          <button className={styles.resetButton}>↺ RESET</button>
        </div>
        <div className={styles.codeContent}>
          <pre>{starterCode}</pre>
        </div>
      </div>

      {/* Hints Section */}
      {hints.length > 0 && (
        <div className={styles.hintsSection}>
          {!showHints ? (
            <button className={styles.hintButton} onClick={handleShowHint}>
              💡 SHOW HINT
            </button>
          ) : (
            <div className={styles.hintsContent}>
              <div className={styles.hintItem}>
                <strong>💡 HINT {currentHintIndex + 1}:</strong> {hints[currentHintIndex]}
              </div>
              {hasMoreHints && (
                <button className={styles.nextHintButton} onClick={handleShowHint}>
                  💡 NEXT HINT
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tests Section */}
      {tests.length > 0 && (
        <div className={styles.testsSection}>
          <h4 className={styles.testsTitle}>📋 TESTS</h4>
          <ul className={styles.testsList}>
            {tests.map((test, index) => (
              <li key={index} className={styles.testItem}>
                {test.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
