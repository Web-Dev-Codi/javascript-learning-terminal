import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useCodeMirror } from '../editor/useCodeMirror'
import type { ExecutionResult } from '../sandbox/sandboxEngine'
import { SandboxEngine } from '../sandbox/sandboxEngine'
import styles from './ChallengeEditor.module.css'

type ConsoleType = 'log' | 'warn' | 'error' | 'info' | 'pass' | 'fail'

interface ConsoleLine {
	id: string
	type: ConsoleType
	content: string
}

interface ChallengeEditorProps {
	readonly challengeId: string
	readonly starterCode: string
}

const createConsoleLine = (
	type: ConsoleType,
	content: string,
): ConsoleLine => ({
	id: `${Date.now()}-${Math.random()}`,
	type,
	content,
})

const parseOutputLine = (output: string): ConsoleLine => {
	const match = /^\[(.+?)\]\s*(.*)$/.exec(output)
	const rawType = match?.[1] ?? 'log'
	const content = match?.[2] ?? output
	const allowedTypes = ['log', 'warn', 'error', 'info', 'pass', 'fail']
	const type = allowedTypes.includes(rawType)
		? (rawType as ConsoleType)
		: 'log'

	return createConsoleLine(type, content)
}

export function ChallengeEditor ({
	challengeId,
	starterCode,
}: ChallengeEditorProps) {
	const savedCode = useEditorStore(
		(state) => state.challengeCodeById[challengeId],
	)
	const { setChallengeCode, resetChallengeCode } = useEditorStore()

	const initialCode = useMemo(
		() => savedCode ?? starterCode,
		[savedCode, starterCode],
	)

	const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([])
	const [isExecuting, setIsExecuting] = useState(false)
	const [isReady, setIsReady] = useState(false)
	const codeRef = useRef(initialCode)

	const handleChange = useCallback((newCode: string) => {
		codeRef.current = newCode
		setChallengeCode(challengeId, newCode)
	}, [challengeId, setChallengeCode])

	const buildResultLines = useCallback((result: ExecutionResult) => {
		const outputLines = result.output.map(parseOutputLine)
		const hasRuntimeErrors = outputLines.some(
			(line) => line.type === 'error',
		)
		const runtime = result.runtime ?? 0
		let status: ConsoleLine
		if (!result.success) {
			status = createConsoleLine(
				'error',
				`✕ Execution failed: ${
					result.error ?? 'Unknown error'
				}`,
			)
		} else if (hasRuntimeErrors) {
			status = createConsoleLine(
				'error',
				`⚠ Runtime errors detected (${runtime}ms)`,
			)
		} else {
			status = createConsoleLine(
				'info',
				`✓ Code executed (${runtime}ms)`,
			)
		}

		return [status, ...outputLines]
	}, [])

	const handleRun = useCallback(async () => {
		if (!isReady || isExecuting) return

		const code = codeRef.current
		if (!code.trim()) {
			setConsoleLines([
				createConsoleLine(
					'warn',
					'⚠ Nothing to run yet',
				),
			])
			return
		}

		setIsExecuting(true)
		const runningLine = createConsoleLine('info', '▶ Running code...')
		setConsoleLines([runningLine])

		try {
			const result = await SandboxEngine.execute(code)
			setConsoleLines([runningLine, ...buildResultLines(result)])
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Unknown execution error'
			setConsoleLines([
				runningLine,
				createConsoleLine('error', `✕ ${message}`),
			])
		} finally {
			setIsExecuting(false)
		}
	}, [buildResultLines, isExecuting, isReady])

	const {
		containerRef,
		createEditor,
		destroyEditor,
		setCode: setEditorCode,
	} = useCodeMirror({
		initialCode,
		onChange: handleChange,
		onRun: handleRun,
	})

	useEffect(() => {
		createEditor()
		return () => {
			destroyEditor()
		}
	}, [createEditor, destroyEditor])

	useEffect(() => {
		setEditorCode(initialCode)
		codeRef.current = initialCode
	}, [initialCode, setEditorCode])

	useEffect(() => {
		let isMounted = true

		const initSandbox = async () => {
			try {
				await SandboxEngine.initialize()
				if (isMounted) {
					setIsReady(true)
				}
			} catch (error) {
				if (!isMounted) return
				const message = error instanceof Error
					? error.message
					: 'Sandbox failed to initialize'
				setIsReady(false)
				setConsoleLines([
					createConsoleLine('error', `✕ ${message}`),
				])
			}
		}

		initSandbox()

		return () => {
			isMounted = false
		}
	}, [])

	const handleReset = useCallback(() => {
		setEditorCode(starterCode)
		codeRef.current = starterCode
		resetChallengeCode(challengeId, starterCode)
		setConsoleLines([
			createConsoleLine('info', '↺ Code reset to starter'),
		])
	}, [challengeId, resetChallengeCode, setEditorCode, starterCode])

	const handleClear = useCallback(() => {
		setConsoleLines([])
	}, [])

	return (
		<div className={styles.editorWrap}>
			<div className={styles.editorHeader}>
				<span className={styles.editorLabel}>CHALLENGE CODE</span>
				<div className={styles.editorActions}>
					<button
						className={`${styles.editorButton} ${styles.resetButton}`}
						onClick={handleReset}
						type="button"
					>
						↺ RESET
					</button>
					<button
						className={`${styles.editorButton} ${styles.runButton}`}
						onClick={handleRun}
						disabled={!isReady || isExecuting}
						type="button"
					>
						{isExecuting ? '⏳ RUNNING...' : '▶ RUN'}
					</button>
				</div>
			</div>
			<div className={styles.editorBody}>
				<div ref={containerRef} className={styles.editorContainer} />
			</div>
			<div className={styles.consoleWrap}>
				<div className={styles.consoleHeader}>
					<span className={styles.consoleTitle}>CONSOLE</span>
					<button
						className={styles.clearButton}
						onClick={handleClear}
						type="button"
					>
						CLEAR
					</button>
				</div>
				<div className={styles.consoleOutput}>
					{consoleLines.length === 0 ? (
						<div className={styles.emptyMessage}>
							<span className={styles.emptyType}>[info]</span>
							<span className={styles.emptyContent}>
								Run the challenge to see output.
							</span>
						</div>
					) : (
						consoleLines.map((line) => (
							<div
								key={line.id}
								className={`${styles.consoleLine} ${styles[line.type]}`}
							>
								<span className={styles.consoleType}>
									[{line.type}]
								</span>
								<span className={styles.consoleMessage}>
									{line.content}
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
