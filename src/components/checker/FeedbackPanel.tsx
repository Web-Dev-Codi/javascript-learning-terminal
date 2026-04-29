import React, { useState } from 'react'
import type { Diagnostic } from '../../types/lesson'
import { MessageDictionary } from './messages'
import styles from './FeedbackPanel.module.css'

interface FeedbackPanelProps {
  diagnostics: Diagnostic[]
  onGoToLine?: (line: number) => void
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ 
  diagnostics, 
  onGoToLine 
}) => {
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedDiagnostics)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedDiagnostics(newExpanded)
  }

  const handleGoToLine = (line: number) => {
    if (onGoToLine) {
      onGoToLine(line)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '✕'
      case 'warning': return '△'
      case 'info': return '○'
      default: return '○'
    }
  }

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'error': return styles.error
      case 'warning': return styles.warning
      case 'info': return styles.info
      default: return styles.info
    }
  }

  const formatDiagnostic = (diagnostic: Diagnostic): Diagnostic => {
    return MessageDictionary.formatDiagnostic(diagnostic)
  }

  if (diagnostics.length === 0) {
    return (
      <div className={styles.feedbackPanel}>
        <div className={styles.header}>
          <span className={styles.title}>ISSUES</span>
          <span className={`${styles.count} ${styles.success}`}>0</span>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successMessage}>
            No issues found! Your code looks good.
          </div>
        </div>
      </div>
    )
  }

  const errorCount = diagnostics.filter(d => d.severity === 'error').length
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length
  const infoCount = diagnostics.filter(d => d.severity === 'info').length

  return (
    <div className={styles.feedbackPanel}>
      <div className={styles.header}>
        <span className={styles.title}>ISSUES</span>
        <span className={`${styles.count} ${errorCount > 0 ? styles.error : warningCount > 0 ? styles.warning : styles.success}`}>
          {diagnostics.length}
        </span>
      </div>

      <div className={styles.diagnosticsList}>
        {diagnostics.map((diagnostic, index) => {
          const formatted = formatDiagnostic(diagnostic)
          const isExpanded = expandedDiagnostics.has(`${diagnostic.ruleId}-${index}`)
          const diagnosticId = `${diagnostic.ruleId}-${index}`

          return (
            <div
              key={diagnosticId}
              className={`${styles.diagnostic} ${getSeverityClass(diagnostic.severity)}`}
            >
              <div 
                className={styles.diagnosticHeader}
                onClick={() => toggleExpanded(diagnosticId)}
              >
                <span className={styles.severityIcon}>
                  {getSeverityIcon(diagnostic.severity)}
                </span>
                <span className={styles.shortMessage}>
                  {formatted.messages.short}
                </span>
                <span className={styles.lineNumber}>
                  Line {diagnostic.line}
                </span>
                <button 
                  className={styles.goToLineButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGoToLine(diagnostic.line)
                  }}
                  title="Go to line"
                >
                  →
                </button>
              </div>

              {isExpanded && (
                <div className={styles.diagnosticDetails}>
                  <div className={styles.longMessage}>
                    {formatted.messages.long}
                  </div>
                  {formatted.messages.hint && (
                    <div className={styles.hint}>
                      <strong>💡 Hint:</strong> {formatted.messages.hint}
                    </div>
                  )}
                  <div className={styles.diagnosticMeta}>
                    <span className={styles.ruleId}>
                      Rule: {diagnostic.ruleId}
                    </span>
                    <span className={styles.position}>
                      Line {diagnostic.line}, Column {diagnostic.column}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.summary}>
          <span className={`${styles.summaryItem} ${errorCount > 0 ? styles.error : ''}`}>
            {errorCount} errors
          </span>
          <span className={`${styles.summaryItem} ${warningCount > 0 ? styles.warning : ''}`}>
            {warningCount} warnings
          </span>
          <span className={`${styles.summaryItem} ${infoCount > 0 ? styles.info : ''}`}>
            {infoCount} info
          </span>
        </div>
      </div>
    </div>
  )
}
