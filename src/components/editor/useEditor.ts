import { useCallback, useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useSyntaxChecker } from '../checker/useSyntaxChecker'
import { useCodeMirror } from './useCodeMirror'

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
	onCursorChange,
}: UseEditorProps) => {
	const {
		getCode,
		setCode,
		activeTab,
		setActiveTab,
		setCursorPosition,
	} = useEditorStore()
	const { checkSyntax, diagnostics, clearDiagnostics } = useSyntaxChecker()

	const initialCode = lessonId
		? getCode(lessonId) || starterCode
		: starterCode

	const handleChange = useCallback((newCode: string) => {
		if (!lessonId) return

		setCode(lessonId, newCode)
		clearDiagnostics()
		setTimeout(() => {
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
		goToLine,
	} = useCodeMirror({
		initialCode,
		onChange: handleChange,
		onCursorChange: handleCursorChange,
		onRun,
	})

	useEffect(() => {
		setEditorCode(initialCode)
	}, [initialCode, setEditorCode])

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
	}
}
