import { useCallback, useRef, useEffect } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { lint } from '@codemirror/lint'
import { keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { useEditorStore } from '../../store/editorStore'
import { useLessonStore } from '../../store/lessonStore'
import { useSyntaxChecker } from '../checker/useSyntaxChecker'

interface UseEditorProps {
  lessonId?: string
  starterCode?: string
  onRun?: () => void
  onCursorChange?: (line: number, column: number) => void
}

export const useEditor = ({
  lessonId = '',
  starterCode = '',
  onRun,
  onCursorChange
}: UseEditorProps) => {
  const {
    getCode,
    setCode,
    activeTab,
    setActiveTab,
    setCursorPosition
  } = useEditorStore()
  const { activeLesson } = useLessonStore()

  const { checkSyntax, diagnostics } = useSyntaxChecker()

  const editorRef = useRef<EditorView | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create custom synthwave theme
  const synthTheme = EditorView.theme({
    '&': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-input)',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px'
    },
    '.cm-content': {
      caretColor: 'var(--neon-cyan)',
      padding: '13px 14px',
      lineHeight: '1'
    },
    '.cm-focused': {
      outline: 'none'
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-dim)',
      color: 'var(--text-muted)',
      fontSize: '11px'
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 7px',
      minWidth: '36px',
      textAlign: 'right',
      lineHeight: '21px',
      height: '21px'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(0, 255, 231, 0.04)',
      color: 'var(--neon-cyan)'
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(0, 255, 231, 0.04)'
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(191, 0, 255, 0.2)'
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--neon-cyan)',
      boxShadow: '0 0 6px var(--neon-cyan)'
    },
    // Syntax highlighting
    '& .cm-keyword': { color: 'var(--neon-pink)' },
    '& .cm-variable': { color: 'var(--neon-cyan)' },
    '& .cm-string': { color: 'var(--neon-yellow)' },
    '& .cm-number': { color: 'var(--neon-orange)' },
    '& .cm-comment': { color: 'var(--text-muted)', fontStyle: 'italic' },
    '& .cm-property': { color: 'var(--neon-purple)' },
    '& .cm-def': { color: 'var(--neon-purple)' },
    '& .cm-operator': { color: 'var(--text-primary)' },
    '& .cm-punctuation': { color: 'var(--text-primary)' },
    '& .cm-bracket': { color: 'var(--text-primary)' },
    // Lint styling
    '.cm-lint-marker': {
      width: '16px',
      height: '16px'
    },
    '.cm-lint-marker-error': {
      backgroundColor: 'var(--neon-pink)',
      borderRadius: '50%'
    },
    '.cm-lint-marker-warning': {
      backgroundColor: 'var(--neon-yellow)',
      borderRadius: '50%'
    },
    '.cm-lint-marker-error::before': {
      content: '"✕"',
      color: 'var(--bg-void)',
      fontSize: '10px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    '.cm-lint-marker-warning::before': {
      content: '"△"',
      color: 'var(--bg-void)',
      fontSize: '10px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  })

  // Custom keymap for Ctrl+Enter to run
  const customKeymap = keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => {
        if (onRun) {
          onRun()
          return true
        }
        return false
      }
    }
  ])

  const createEditor = useCallback(() => {
    if (!containerRef.current) return

    // Get initial code - either from store or starter code
    const initialCode = lessonId ? getCode(lessonId) || starterCode : starterCode

    const startState = EditorState.create({
      doc: initialCode,
      extensions: [
        synthTheme,
        javascript(),
        lint(),
        customKeymap,
        defaultKeymap,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && lessonId) {
            const newCode = update.state.doc.toString()
            setCode(lessonId, newCode)

            // Run syntax checking on code change
            setTimeout(() => {
              checkSyntax(newCode)
            }, 300) // Debounce syntax checking
          }

          if (update.selectionSet) {
            const cursor = update.state.selection.main.head
            const line = update.state.doc.lineAt(cursor)
            const column = cursor - line.from + 1
            setCursorPosition(line.number, column)
            if (onCursorChange) {
              onCursorChange(line.number, column)
            }
          }
        })
      ]
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current
    })

    editorRef.current = view
  }, [lessonId, starterCode, getCode, setCode, setCursorPosition, onRun, onCursorChange, synthTheme])

  const destroyEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.destroy()
      editorRef.current = null
    }
  }, [])

  const resetCode = useCallback(() => {
    if (editorRef.current && lessonId) {
      const transaction = editorRef.current.state.update({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: starterCode
        }
      })
      editorRef.current.dispatch(transaction)
      setCode(lessonId, starterCode)
    }
  }, [lessonId, starterCode, setCode])

  const getCurrentCode = useCallback(() => {
    return editorRef.current?.state.doc.toString() || ''
  }, [])

  return {
    containerRef,
    createEditor,
    destroyEditor,
    resetCode,
    getCurrentCode,
    activeTab,
    setActiveTab,
    diagnostics
  }
}
