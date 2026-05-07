import { Worker } from 'node:worker_threads'
import { config } from '../config.js'
import type { RunnerEvent, RunPayload, RunResult } from './types.js'

interface Task {
	payload: RunPayload
	onEvent: (event: RunnerEvent) => void
	resolve: (result: RunResult) => void
}

const POOL_SIZE = Math.max(2, config.concurrency || 4)
const workers: Worker[] = []
const queue: Task[] = []
const busy = new Set<Worker>()

function spawnWorker(): Worker {
	const workerUrl = new URL(
		`./executor.${config.workerExt}`,
		import.meta.url,
	)
	const worker = new Worker(workerUrl, {
		execArgv:
			config.workerExt === 'ts'
				? ['--loader', 'tsx']
				: [],
	})

	worker.on('error', (err) => {
		console.error('Worker pool error:', err)
		replaceWorker(worker)
	})

	worker.on('exit', (code) => {
		if (code !== 0) {
			console.error('Worker exited with code', code)
			replaceWorker(worker)
		}
	})

	return worker
}

function replaceWorker(oldWorker: Worker) {
	const idx = workers.indexOf(oldWorker)
	if (idx !== -1) {
		oldWorker.terminate().catch(() => {})
		workers[idx] = spawnWorker()
		processNext(workers[idx])
	}
}

for (let i = 0; i < POOL_SIZE; i++) {
	workers.push(spawnWorker())
}

function processNext(worker: Worker) {
	if (queue.length === 0 || busy.has(worker)) return
	const task = queue.shift()!
	busy.add(worker)

	let settled = false
	const settle = (result: RunResult) => {
		if (settled) return
		settled = true
		worker.off('message', onMessage)
		worker.off('error', onError)
		busy.delete(worker)
		task.resolve(result)
		processNext(worker)
	}

	const onMessage = (message: RunnerEvent) => {
		task.onEvent(message)
		if (message.type === 'done') {
			settle({
				success: message.data.success ?? false,
				runtimeMs: message.data.runtimeMs ?? 0,
				error: message.data.message,
			})
		}
	}

	const onError = (error: Error) => {
		task.onEvent({
			type: 'error',
			data: { message: error.message },
		})
		settle({
			success: false,
			runtimeMs: 0,
			error: error.message,
		})
	}

	worker.on('message', onMessage)
	worker.on('error', onError)

	const timeout = setTimeout(() => {
		settle({
			success: false,
			runtimeMs: task.payload.timeoutMs,
			error: 'Execution timed out',
		})
		replaceWorker(worker)
	}, task.payload.timeoutMs + 500)

	worker.postMessage(task.payload)
}

export const runInPool = (
	payload: RunPayload,
	onEvent: (event: RunnerEvent) => void,
): Promise<RunResult> => {
	return new Promise((resolve) => {
		queue.push({ payload, onEvent, resolve })
		for (const worker of workers) {
			processNext(worker)
		}
	})
}
