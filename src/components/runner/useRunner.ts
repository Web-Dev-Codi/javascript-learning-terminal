import { useCallback, useEffect, useRef, useState } from 'react'
import type {
	RunnerEvent,
	RunnerResult,
	RunnerStatus,
	RunResponse,
} from './types'

interface RunOptions {
	onEvent?: (event: RunnerEvent) => void
}

interface UseRunnerResult {
	runCode: (code: string, options?: RunOptions) => Promise<RunnerResult>
	isExecuting: boolean
	status: RunnerStatus
	error: string | null
	clearError: () => void
	isReady: boolean
}

const getRunnerBaseUrl = () =>
	import.meta.env.VITE_RUNNER_URL ?? 'http://localhost:4000'

const buildWebSocketUrl = (baseUrl: string, runId: string) => {
	const normalized = baseUrl.replace(/\/$/, '')
	const wsBase = normalized.replace(/^http/, 'ws')
	return `${wsBase}/api/runs/${encodeURIComponent(runId)}`
}

export const useRunner = (): UseRunnerResult => {
	const [isExecuting, setIsExecuting] = useState(false)
	const [status, setStatus] = useState<RunnerStatus>('idle')
	const [error, setError] = useState<string | null>(null)
	const [isReady, setIsReady] = useState(false)
	const socketRef = useRef<WebSocket | null>(null)

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

		return () => {
			if (socketRef.current) {
				socketRef.current.close()
				socketRef.current = null
			}
		}
	}, [])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	const runCode = useCallback(async (
		code: string,
		options?: RunOptions,
	): Promise<RunnerResult> => {
		const baseUrl = getRunnerBaseUrl()
		setIsExecuting(true)
		setStatus('running')
		setError(null)

		try {
			const response = await fetch(`${baseUrl}/api/runs`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ code }),
			})

			if (!response.ok) {
				const message = await response.text()
				throw new Error(message || 'Failed to submit run')
			}

			const data = (await response.json()) as RunResponse
			const wsUrl = buildWebSocketUrl(baseUrl, data.runId)

			return await new Promise((resolve) => {
				const socket = new WebSocket(wsUrl)
				socketRef.current = socket

				socket.onmessage = (event) => {
					const message = JSON.parse(event.data) as RunnerEvent
					options?.onEvent?.(message)

					if (message.type === 'status') {
						if (message.data.status === 'failed') {
							setStatus('error')
							setError('Runner failed')
						}
					}

					if (message.type === 'error' && message.data.message) {
						setError(message.data.message)
					}

					if (message.type === 'done') {
						setIsExecuting(false)
						setStatus('ready')
						socket.close()
						resolve({
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
					setStatus('error')
					setIsExecuting(false)
					socket.close()
					resolve({
						success: false,
						runtimeMs: 0,
						error: 'Runner WebSocket error',
					})
				}
			})
		} catch (err) {
			const message = err instanceof Error
				? err.message
				: 'Runner request failed'
			setIsExecuting(false)
			setStatus('error')
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
		status,
		error,
		clearError,
		isReady,
	}
}
