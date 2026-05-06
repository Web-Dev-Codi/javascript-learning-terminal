import { useCallback, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { findLessonById, useLessonStore } from '../../store/lessonStore'
import type { Diagnostic, RuleId } from '../../types/lesson'
import { MessageDictionary } from './messages'
import type { ESTreeAST } from './ruleEngine'
import { RuleEngine } from './ruleEngine'
import { SyntaxChecker } from './syntaxChecker'

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
  const lastCheckedCodeRef = useRef<string>('')

  const getActiveRules = useCallback((): RuleId[] => {
    if (!activeLesson) return []
    const lesson = findLessonById(activeLesson)
    return lesson?.activeRules ?? []
  }, [activeLesson])

  const checkSyntax = useCallback((code: string, activeRules?: RuleId[]) => {
    if (code === lastCheckedCodeRef.current) {
      return
    }

    lastCheckedCodeRef.current = code
    setIsChecking(true)

    try {
      const syntaxResult = SyntaxChecker.checkSyntax(code)

      if (!syntaxResult.success) {
        const formattedDiagnostics = syntaxResult.errors.map(diag =>
          MessageDictionary.formatDiagnostic(diag)
        )
        setDiagnostics(formattedDiagnostics)

        addConsoleMessage('error', `✕ ${syntaxResult.errors.length} syntax error(s) found`)
        return
      }

      const rulesToCheck = activeRules || getActiveRules()
      const ruleDiagnostics = RuleEngine.runRules(syntaxResult.ast as unknown as ESTreeAST, code, rulesToCheck)

      let finalDiagnostics = ruleDiagnostics
      if (activeLesson) {
        const lesson = findLessonById(activeLesson)
        if (lesson?.strictMode) {
          finalDiagnostics = ruleDiagnostics.map(d =>
            d.severity === 'warning' ? { ...d, severity: 'error' as const } : d
          )
        }
      }

      const allDiagnostics = [...syntaxResult.errors, ...finalDiagnostics]
      const formattedDiagnostics = allDiagnostics.map(diag =>
        MessageDictionary.formatDiagnostic(diag)
      )

      setDiagnostics(formattedDiagnostics)

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
  }, [getActiveRules, addConsoleMessage, activeLesson])

  const clearDiagnostics = useCallback(() => {
    setDiagnostics([])
    lastCheckedCodeRef.current = ''
  }, [])

  const shouldBlockExecution = diagnostics.some(d => d.severity === 'error')
  const issueSummary = useMemo(
    () => SyntaxChecker.getIssueSummary(diagnostics),
    [diagnostics],
  )

  return {
    diagnostics,
    isChecking,
    shouldBlockExecution,
    checkSyntax,
    clearDiagnostics,
    issueSummary
  }
}
