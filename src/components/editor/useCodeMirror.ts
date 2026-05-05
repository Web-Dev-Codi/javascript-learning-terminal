import { defaultKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { useCallback, useEffect, useRef } from 'react'

interface UseCodeMirrorOptions {
	initialCode: string
	onChange?: (code: string) => void
	onCursorChange?: (line: number, column: number) => void
	onRun?: () => void
	readOnly?: boolean
}

const synthTheme = EditorView.theme({
	'&': {
		color: 'var(--text-primary)',
		backgroundColor: 'var(--bg-input)',
		fontFamily: 'var(--font-mono)',
		fontSize: '12px',
	},
	'.cm-content': {
		caretColor: 'var(--neon-cyan)',
		padding: '13px 14px',
		lineHeight: '1.4',
	},
	'.cm-focused': {
		outline: 'none',
	},
	'.cm-gutters': {
		backgroundColor: 'var(--bg-panel)',
		borderRight: '1px solid var(--border-dim)',
		color: 'var(--text-muted)',
		fontSize: '11px',
	},
	'.cm-lineNumbers .cm-gutterElement': {
		padding: '0 7px',
		minWidth: '36px',
		textAlign: 'right',
		lineHeight: '21px',
		height: '21px',
	},
	'.cm-activeLineGutter': {
		backgroundColor: 'rgba(0, 255, 231, 0.04)',
		color: 'var(--neon-cyan)',
	},
	'.cm-activeLine': {
		backgroundColor: 'rgba(0, 255, 231, 0.04)',
	},
	'.cm-selectionBackground, ::selection': {
		backgroundColor: 'rgba(191, 0, 255, 0.2)',
	},
	'.cm-cursor': {
		borderLeftColor: 'var(--neon-cyan)',
		boxShadow: '0 0 6px var(--neon-cyan)',
	},
	'& .cm-keyword': { color: 'var(--neon-pink)' },
	'& .cm-variable': { color: 'var(--neon-cyan)' },
	'& .cm-string': { color: 'var(--neon-yellow)' },
	'& .cm-number': { color: 'var(--neon-orange)' },
	'& .cm-comment': {
		color: 'var(--text-muted)',
		fontStyle: 'italic',
	},
	'& .cm-property': { color: 'var(--neon-purple)' },
	'& .cm-def': { color: 'var(--neon-purple)' },
	'& .cm-operator': { color: 'var(--text-primary)' },
	'& .cm-punctuation': { color: 'var(--text-primary)' },
	'& .cm-bracket': { color: 'var(--text-primary)' },
})

function buildRunKeymap (onRun?: () => void): Extension | null {
	if (!onRun) return null

	return keymap.of([
		{
			key: 'Ctrl-Enter',
			run: () => {
				onRun()
				return true
			},
		},
	])
}

export const useCodeMirror = ({
	initialCode,
	onChange,
	onCursorChange,
	onRun,
	readOnly = false,
}: UseCodeMirrorOptions) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const editorRef = useRef<EditorView | null>(null)
	const initialCodeRef = useRef(initialCode)
	const onChangeRef = useRef(onChange)
	const onCursorChangeRef = useRef(onCursorChange)
	const onRunRef = useRef(onRun)

	useEffect(() => {
		initialCodeRef.current = initialCode
	}, [initialCode])

	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	useEffect(() => {
		onCursorChangeRef.current = onCursorChange
	}, [onCursorChange])

	useEffect(() => {
		onRunRef.current = onRun
	}, [onRun])

	const createEditor = useCallback(() => {
		if (!containerRef.current || editorRef.current) return

		const runKeymap = buildRunKeymap(() => onRunRef.current?.())
		const extensions: Extension[] = [
			synthTheme,
			javascript(),
			EditorView.editable.of(!readOnly),
			keymap.of(defaultKeymap),
			EditorView.lineWrapping,
		]

		if (runKeymap) extensions.push(runKeymap)

		extensions.push(
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const newCode = update.state.doc.toString()
					onChangeRef.current?.(newCode)
				}

				if (update.selectionSet) {
					const cursor = update.state.selection.main.head
					const line = update.state.doc.lineAt(cursor)
					const column = cursor - line.from + 1
					onCursorChangeRef.current?.(line.number, column)
				}
			}),
		)

		const startState = EditorState.create({
			doc: initialCodeRef.current,
			extensions,
		})

		editorRef.current = new EditorView({
			state: startState,
			parent: containerRef.current,
		})
	}, [readOnly])

	const destroyEditor = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.destroy()
			editorRef.current = null
		}
	}, [])

	const setCode = useCallback((code: string) => {
		if (!editorRef.current) return

		const currentDoc = editorRef.current.state.doc.toString()
		if (currentDoc === code) return

		const transaction = editorRef.current.state.update({
			changes: {
				from: 0,
				to: editorRef.current.state.doc.length,
				insert: code,
			},
		})

		editorRef.current.dispatch(transaction)
	}, [])

	const getCode = useCallback(() => {
		return editorRef.current?.state.doc.toString() ?? ''
	}, [])

	const goToLine = useCallback((lineNumber: number, column = 1) => {
		if (!editorRef.current) return

		const view = editorRef.current
		const line = view.state.doc.line(Math.max(1, lineNumber))
		const position = line.from + Math.max(0, column - 1)

		view.dispatch({
			selection: { anchor: position },
			scrollIntoView: true,
		})
		view.focus()
	}, [])

	return {
		containerRef,
		createEditor,
		destroyEditor,
		setCode,
		getCode,
		goToLine,
	}
}
