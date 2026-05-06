import { Worker } from 'node:worker_threads'
import { config } from '../config.js'
import type { RunnerEvent, RunPayload, RunResult } from './types.js'

interface RunInWorkerOptions {
	payload: RunPayload
	onEvent: (event: RunnerEvent) => void
}

export const runInWorker = ({
	payload,
	onEvent,
}: RunInWorkerOptions): Promise<RunResult> => {
	const workerUrl = new URL(
		`./executor.${config.workerExt}`,
		import.meta.url,
	)

	return new Promise((resolve) => {
		const worker = new Worker(workerUrl, {
			workerData: payload,
			execArgv:
				config.workerExt === 'ts'
					? ['--loader', 'tsx']
					: [],
		})

		let resolved = false

		const finish = (result: RunResult) => {
			if (resolved) return
			resolved = true
			worker.terminate().catch(() => {})
			resolve(result)
		}

		const timeout = setTimeout(() => {
			onEvent({
				type: 'error',
				data: {
					message:
						'Execution timed out — check for infinite loops.',
				},
			})

			finish({
				success: false,
				runtimeMs: payload.timeoutMs,
				error: 'Execution timed out',
			})
		}, payload.timeoutMs + 250)

		worker.on('message', (message: RunnerEvent) => {
			onEvent(message)
			if (message.type === 'done') {
				clearTimeout(timeout)
				finish({
					success: message.data.success ?? false,
					runtimeMs: message.data.runtimeMs ?? 0,
				})
			}
		})

		worker.on('error', (error) => {
			clearTimeout(timeout)
			onEvent({
				type: 'error',
				data: {
					message: error.message,
				},
			})
			finish({
				success: false,
				runtimeMs: 0,
				error: error.message,
			})
		})

		worker.on('exit', (code) => {
			if (code === 0) return
			clearTimeout(timeout)
			onEvent({
				type: 'error',
				data: {
					message: 'Runner crashed unexpectedly.',
				},
			})
			finish({
				success: false,
				runtimeMs: 0,
				error: 'Runner crashed unexpectedly',
			})
		})
	})
}
