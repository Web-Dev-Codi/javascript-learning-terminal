import { useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useLessonStore } from '../../store/lessonStore'
import { FeedbackPanel } from '../checker/FeedbackPanel'
import { SandboxEngine } from '../sandbox/sandboxEngine'
import { useSandbox } from '../sandbox/useSandbox'
import { ConsolePanel } from './ConsolePanel'
import styles from './EditorPanel.module.css'
import { useEditor } from './useEditor'

export function EditorPanel () {
  const { activeLesson } = useLessonStore()
  const { clearConsole, addConsoleMessage } = useEditorStore()
  const { executeCode, isExecuting, isReady } = useSandbox()

  // Get current lesson data for starter code
  const getCurrentLessonData = () => {
    // This would be expanded to get actual lesson data
    const starterCode = `// 🎯 CHALLENGE: Fix the errors below

let playerName = "Brian";
let highScore 9500  // ← fix me
const level = 3;

console.log("Player: " + playerName);
console.log("Score: " + highScore);
console.log("Level: " + level);`

    return {
      lessonId: activeLesson || 'scratch',
      starterCode
    }
  }

  const { lessonId, starterCode } = getCurrentLessonData()

  const handleRun = async () => {
    const currentCode = getCurrentCode()
    await executeCode(currentCode)
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
    goToLine
  } = useEditor({
    lessonId,
    starterCode,
    onRun: handleRun
  })

  const handleReset = () => {
    resetCode()
    clearConsole()
    addConsoleMessage('info', '↺ Code reset to starter')
    // Clear sandbox context per spec S-08
    SandboxEngine.reset()
  }

  useEffect(() => {
    createEditor()
    return () => {
      destroyEditor()
    }
  }, [createEditor, destroyEditor])

  // Clear sandbox when lesson changes (S-08)
  useEffect(() => {
    const hasLesson = Boolean(lessonId)
    if (hasLesson) {
      SandboxEngine.reset()
    }
  }, [lessonId])

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
              disabled={isExecuting || !isReady}
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
