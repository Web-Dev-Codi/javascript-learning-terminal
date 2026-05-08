import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { Diagnostic } from '../../types/lesson'
import { useSyntaxChecker } from '../checker/useSyntaxChecker'
import { useCodeMirror } from './useCodeMirror'

interface UseEditorProps {
  lessonId?: string
  starterCode?: string
  onRun?: () => void
  onCursorChange?: (line: number, column: number) => void
  extraDiagnostics?: Diagnostic[]
}

export const useEditor = ({
  lessonId = '',
  starterCode = '',
  onRun,
  onCursorChange,
  extraDiagnostics = [],
}: UseEditorProps) => {
  const {
    getCode,
    setCode,
    activeTab,
    setActiveTab,
    setCursorPosition,
    setIssueSummary,
  } = useEditorStore()
  const {
    checkSyntax,
    diagnostics,
    clearDiagnostics,
    issueSummary,
    shouldBlockExecution,
  } = useSyntaxChecker()

	const initialCode = lessonId
		? getCode(lessonId) || starterCode
		: starterCode

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleChange = useCallback((newCode: string) => {
    if (!lessonId) return

    setCode(lessonId, newCode)
    clearDiagnostics()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      checkSyntax(newCode)
    }, 300)
  }, [lessonId, setCode, checkSyntax, clearDiagnostics])

	const handleCursorChange = useCallback((line: number, column: number) => {
		setCursorPosition(line, column)
		if (onCursorChange) {
			onCursorChange(line, column)
		}
	}, [setCursorPosition, onCursorChange])

	const {
		containerRef,
		createEditor,
		destroyEditor,
		setCode: setEditorCode,
		getCode: getEditorCode,
		setEditorDiagnostics,
		goToLine,
	} = useCodeMirror({
		initialCode,
		onChange: handleChange,
		onCursorChange: handleCursorChange,
		onRun,
	})

	const mergedDiagnostics = useMemo(
		() => [...diagnostics, ...extraDiagnostics],
		[diagnostics, extraDiagnostics],
	)

  useEffect(() => {
    setEditorCode(initialCode)
  }, [initialCode, setEditorCode])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

	useEffect(() => {
		setEditorDiagnostics(mergedDiagnostics)
		setIssueSummary(issueSummary)
	}, [mergedDiagnostics, issueSummary, setEditorDiagnostics, setIssueSummary])

	const resetCode = useCallback(() => {
		if (!lessonId) return

		setEditorCode(starterCode)
		setCode(lessonId, starterCode)
	}, [lessonId, starterCode, setCode, setEditorCode])

	const getCurrentCode = useCallback(() => getEditorCode(), [getEditorCode])

	return {
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
	}
}
