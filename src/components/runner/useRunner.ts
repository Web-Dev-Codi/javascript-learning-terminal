import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type {
	RunnerEvent,
	RunnerResult,
	RunResponse,
} from './types'

interface RunOptions {
	onEvent?: (event: RunnerEvent) => void
}

interface UseRunnerResult {
	runCode: (code: string, options?: RunOptions) => Promise<RunnerResult>
	isExecuting: boolean
	error: string | null
	isReady: boolean
}

const getRunnerBaseUrl = () =>
	import.meta.env.VITE_RUNNER_URL ?? 'http://localhost:4000'

const buildWebSocketUrl = (baseUrl: string, runId: string) => {
	const normalized = baseUrl.replace(/\/$/, '')
	const wsBase = normalized.replace(/^http/, 'ws')
	return `${wsBase}/api/runs/${encodeURIComponent(runId)}`
}

const RUN_FETCH_TIMEOUT_MS = 8_000
const RUN_OVERALL_TIMEOUT_MS = 15_000

export const useRunner = (): UseRunnerResult => {
	const [isExecuting, setIsExecuting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isReady, setIsReady] = useState(false)
	const socketRef = useRef<WebSocket | null>(null)
	const setRunnerStatus = useEditorStore((s) => s.setRunnerStatus)

	useEffect(() => {
		const checkHealth = async () => {
			try {
				const baseUrl = getRunnerBaseUrl()
				const response = await fetch(`${baseUrl}/health`)
				setIsReady(response.ok)
				if (!response.ok) {
					setError('Runner not ready')
				}
			} catch (err) {
				setIsReady(false)
				setError(
					err instanceof Error
						? err.message
						: 'Runner not reachable',
				)
			}
		}

		checkHealth()
		const interval = setInterval(checkHealth, 10_000)

		return () => {
			clearInterval(interval)
			if (socketRef.current) {
				socketRef.current.close()
				socketRef.current = null
			}
		}
	}, [])

	const runCode = useCallback(async (
		code: string,
		options?: RunOptions,
	): Promise<RunnerResult> => {
		const baseUrl = getRunnerBaseUrl()
		setIsExecuting(true)
		setRunnerStatus('running')
		setError(null)

		const abortController = new AbortController()
		const fetchTimeout = setTimeout(() => abortController.abort(), RUN_FETCH_TIMEOUT_MS)

		try {
			const response = await fetch(`${baseUrl}/api/runs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
				signal: abortController.signal,
			})
			clearTimeout(fetchTimeout)

			if (!response.ok) {
				const message = await response.text()
				throw new Error(message || 'Failed to submit run')
			}

			const data = (await response.json()) as RunResponse
			const wsUrl = buildWebSocketUrl(baseUrl, data.runId)

			return await Promise.race([
				new Promise<RunnerResult>((resolve) => {
					const socket = new WebSocket(wsUrl)
					socketRef.current = socket

					let resolved = false
					const safeResolve = (result: RunnerResult) => {
						if (resolved) return
						resolved = true
						setIsExecuting(false)
						socket.close()
						socketRef.current = null
						resolve(result)
					}

					socket.onmessage = (event) => {
						const message = JSON.parse(event.data) as RunnerEvent
						options?.onEvent?.(message)

						if (message.type === 'status') {
							const s = message.data.status
							if (s === 'failed') {
								setRunnerStatus('error')
								setError('Runner failed')
							} else if (s === 'waiting' || s === 'active') {
								setRunnerStatus('running')
							} else if (s === 'completed') {
								setRunnerStatus('ready')
							}
						}

						if (message.type === 'error' && message.data.message) {
							setError(message.data.message)
						}

						if (message.type === 'done') {
							setRunnerStatus('ready')
							safeResolve({
								success: message.data.success ?? false,
								runtimeMs: message.data.runtimeMs ?? 0,
								error: message.data.message,
								line: message.data.line,
								column: message.data.column,
							})
						}
					}

					socket.onerror = () => {
						setError('Runner WebSocket error')
						setRunnerStatus('error')
						safeResolve({
							success: false,
							runtimeMs: 0,
							error: 'Runner WebSocket error',
						})
					}

					socket.onclose = () => {
						safeResolve({
							success: false,
							runtimeMs: 0,
							error: 'Connection closed unexpectedly',
						})
					}
				}),
				new Promise<RunnerResult>((resolve) => {
					setTimeout(() => {
						setIsExecuting(false)
						setRunnerStatus('error')
						setError('Run timed out — runner may be stuck.')
						socketRef.current?.close()
						socketRef.current = null
						resolve({
							success: false,
							runtimeMs: 0,
							error: 'Run timed out',
						})
					}, RUN_OVERALL_TIMEOUT_MS)
				}),
			])
		} catch (err) {
			clearTimeout(fetchTimeout)
			const message = err instanceof Error ? err.message : 'Runner request failed'
			setIsExecuting(false)
			setRunnerStatus('error')
			setError(message)
			return {
				success: false,
				runtimeMs: 0,
				error: message,
			}
		}
	}, [])

	return {
		runCode,
		isExecuting,
		error,
		isReady,
	}
}
