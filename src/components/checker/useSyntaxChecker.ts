import { useCallback, useState } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { useEditorStore } from '../../store/editorStore'
import { SyntaxChecker } from './syntaxChecker'
import { RuleEngine } from './ruleEngine'
import type { ESTreeAST } from './ruleEngine'
import { MessageDictionary } from './messages'
import type { Diagnostic, RuleId } from '../../types/lesson'
import { lessons } from '../../data/lessons'

interface UseSyntaxCheckerResult {
  diagnostics: Diagnostic[]
  isChecking: boolean
  shouldBlockExecution: boolean
  checkSyntax: (code: string, activeRules?: RuleId[]) => void
  clearDiagnostics: () => void
  issueSummary: {
    errors: number
    warnings: number
    info: number
  }
}

export const useSyntaxChecker = (): UseSyntaxCheckerResult => {
  const { activeLesson } = useLessonStore()
  const { addConsoleMessage } = useEditorStore()

  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckedCode, setLastCheckedCode] = useState<string>('')

  // Get active rules for current lesson from lessons.ts (LC-02, SC-06)
  const getActiveRules = useCallback((): RuleId[] => {
    if (!activeLesson) return []
    const lesson = lessons.find(l => l.id === activeLesson)
    return lesson?.activeRules ?? []
  }, [activeLesson])

  const checkSyntax = useCallback((code: string, activeRules?: RuleId[]) => {
    if (code === lastCheckedCode) {
      return // Don't re-check the same code
    }

    setIsChecking(true)
    setLastCheckedCode(code)

    try {
      // Layer 1: Syntax parsing with Babel
      const syntaxResult = SyntaxChecker.checkSyntax(code)

      if (!syntaxResult.success) {
        // If there are syntax errors, show them and stop
        const formattedDiagnostics = syntaxResult.errors.map(diag =>
          MessageDictionary.formatDiagnostic(diag)
        )
        setDiagnostics(formattedDiagnostics)

        addConsoleMessage('error', `✕ ${syntaxResult.errors.length} syntax error(s) found`)
        return
      }

      // Layer 2: Rule engine for style and logical issues
      const rulesToCheck = activeRules || getActiveRules()
      const ruleDiagnostics = RuleEngine.runRules(syntaxResult.ast as unknown as ESTreeAST, rulesToCheck)

      // If strictMode, escalate warnings to errors (LC-02 strictMode)
      let finalDiagnostics = ruleDiagnostics
      if (activeLesson) {
        const lesson = lessons.find(l => l.id === activeLesson)
        if (lesson?.strictMode) {
          finalDiagnostics = ruleDiagnostics.map(d =>
            d.severity === 'warning' ? { ...d, severity: 'error' as const } : d
          )
        }
      }

      // Combine all diagnostics
      const allDiagnostics = [...syntaxResult.errors, ...finalDiagnostics]
      const formattedDiagnostics = allDiagnostics.map(diag =>
        MessageDictionary.formatDiagnostic(diag)
      )

      setDiagnostics(formattedDiagnostics)

      // Provide console feedback
      const summary = SyntaxChecker.getIssueSummary(formattedDiagnostics)
      if (summary.errors === 0 && summary.warnings === 0) {
        addConsoleMessage('info', '✓ No issues found')
      } else {
        if (summary.errors > 0) {
          addConsoleMessage('error', `✕ ${summary.errors} error(s) found`)
        }
        if (summary.warnings > 0) {
          addConsoleMessage('warn', `△ ${summary.warnings} warning(s) found`)
        }
        if (summary.info > 0) {
          addConsoleMessage('info', `○ ${summary.info} info message(s) found`)
        }
      }
    } catch (error) {
      console.error('Syntax checker error:', error)
      const errorDiagnostic: Diagnostic = {
        ruleId: 'syntax-error',
        severity: 'error',
        line: 1,
        column: 1,
        messages: {
          short: 'Checker error',
          long: 'The syntax checker encountered an error',
          hint: 'Try refreshing the page or contact support'
        }
      }
      setDiagnostics([errorDiagnostic])
      addConsoleMessage('error', '✕ Syntax checker error')
    } finally {
      setIsChecking(false)
    }
  }, [lastCheckedCode, getActiveRules, addConsoleMessage, activeLesson])

  const clearDiagnostics = useCallback(() => {
    setDiagnostics([])
    setLastCheckedCode('')
  }, [])

  const shouldBlockExecution = diagnostics.some(d => d.severity === 'error')

  const issueSummary = diagnostics.reduce((summary, diagnostic) => {
    switch (diagnostic.severity) {
      case 'error':
        summary.errors++
        break
      case 'warning':
        summary.warnings++
        break
      case 'info':
        summary.info++
        break
    }
    return summary
  }, { errors: 0, warnings: 0, info: 0 })

  return {
    diagnostics,
    isChecking,
    shouldBlockExecution,
    checkSyntax,
    clearDiagnostics,
    issueSummary
  }
}
