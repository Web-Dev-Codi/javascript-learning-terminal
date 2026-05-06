import { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { findLessonById, useLessonStore } from '../../store/lessonStore'
import type { Diagnostic, ChallengeSection } from '../../types/lesson'
import { FeedbackPanel } from '../checker/FeedbackPanel'
import { useRunner } from '../runner/useRunner'
import { ConsolePanel } from './ConsolePanel'
import styles from './EditorPanel.module.css'
import { useEditor } from './useEditor'

export function EditorPanel () {
  const { activeLesson } = useLessonStore()
  const {
    clearConsole,
    addConsoleMessage,
    setRunnerStatus,
  } = useEditorStore()
  const { runCode, isExecuting, isReady, status } = useRunner()
  const [runtimeDiagnostics, setRuntimeDiagnostics] = useState<Diagnostic[]>([])

  const getCurrentLessonData = () => {
    const lesson = activeLesson ? findLessonById(activeLesson) : null
    const starterCode = lesson?.sections?.find(
      (s): s is ChallengeSection => s.type === 'challenge'
    )?.starterCode ?? `// Welcome! Write your code here.

console.log("Hello, world!");`

    return {
      lessonId: activeLesson || 'scratch',
      starterCode
    }
  }

  const { lessonId, starterCode } = getCurrentLessonData()

  const handleRun = async () => {
    const currentCode = getCurrentCode()
    setRuntimeDiagnostics([])
    clearConsole()
    addConsoleMessage('info', '▶ Running code...')
    setRunnerStatus('running')

    await runCode(currentCode, {
      onEvent: (event) => {
        switch (event.type) {
          case 'stdout':
            addConsoleMessage('log', event.data.message ?? '')
            break
          case 'stderr':
            addConsoleMessage('error', event.data.message ?? '')
            break
          case 'error':
            addConsoleMessage('error', `✕ ${event.data.message}`)
            if (event.data.line) {
              setRuntimeDiagnostics([
                {
                  ruleId: 'runtime-error',
                  severity: 'error',
                  line: event.data.line,
                  column: event.data.column ?? 1,
                  messages: {
                    short: 'Runtime error',
                    long: event.data.message ?? 'Runtime error',
                  },
                },
              ])
            }
            break
          case 'done':
            if (event.data.success) {
              addConsoleMessage(
                'info',
                `✓ Code executed (${event.data.runtimeMs ?? 0}ms)`,
              )
              setRunnerStatus('ready')
            } else {
              addConsoleMessage(
                'error',
                `✕ Execution failed (${event.data.runtimeMs ?? 0}ms)`,
              )
              setRunnerStatus('error')
            }
            break
          default:
            break
        }
      },
    })
  }

  const {
    containerRef,
    createEditor,
    destroyEditor,
    resetCode,
    getCurrentCode,
    activeTab,
    setActiveTab,
    diagnostics,
    goToLine,
    shouldBlockExecution,
  } = useEditor({
    lessonId,
    starterCode,
    onRun: handleRun,
    extraDiagnostics: runtimeDiagnostics,
  })

  const handleReset = () => {
    resetCode()
    clearConsole()
    addConsoleMessage('info', '↺ Code reset to starter')
    setRuntimeDiagnostics([])
  }

  useEffect(() => {
    createEditor()
    return () => {
      destroyEditor()
    }
  }, [createEditor, destroyEditor])

  // Clear sandbox when lesson changes (S-08)
  useEffect(() => {
    setRunnerStatus(status === 'running' ? 'running' : 'ready')
  }, [status, setRunnerStatus])

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <div className={styles.editorPanel}>
      {/* Editor Section */}
      <div className={styles.editorWrap}>
        <div className={styles.editorBar}>
          <div className={styles.editorTabs}>
            <button
              type="button"
              className={`${styles.editorTab} ${activeTab === 'challenge' ? styles.active : ''}`}
              onClick={() => handleTabClick('challenge')}
            >
              challenge.js
            </button>
            <button
              type="button"
              className={`${styles.editorTab} ${activeTab === 'scratch' ? styles.active : ''}`}
              onClick={() => handleTabClick('scratch')}
            >
              scratch.js
            </button>
          </div>
          <div className={styles.editorActions}>
            <button type="button" className={`${styles.editorButton} ${styles.resetButton}`} onClick={handleReset}>
              ↺ RESET
            </button>
            <button
              type="button"
              className={`${styles.editorButton} ${styles.runButton} ${isExecuting ? styles.executing : ''}`}
              onClick={handleRun}
              disabled={isExecuting || !isReady || shouldBlockExecution}
            >
              {isExecuting ? '⏳ RUNNING...' : '▶ RUN'} <span className={styles.shortcut}>^↵</span>
            </button>
          </div>
        </div>
        <div className={styles.editorBody}>
          <div ref={containerRef} className={styles.editorContainer} />
        </div>
      </div>

      {/* Console Section */}
      <div className={styles.bottomSection}>
        <div className={styles.consoleWrap}>
          <ConsolePanel />
        </div>

        {/* Feedback Panel */}
        <div className={styles.feedbackWrap}>
          <FeedbackPanel
            diagnostics={diagnostics}
            onGoToLine={(line) => goToLine(line)}
          />
        </div>
      </div>
    </div>
  )
}
