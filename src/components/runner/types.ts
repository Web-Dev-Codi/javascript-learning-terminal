export type RunnerEventType =
	| 'stdout'
	| 'stderr'
	| 'error'
	| 'status'
	| 'done'

export type RunnerStatus = 'idle' | 'ready' | 'running' | 'error'

export type RunnerQueueStatus =
	| 'waiting'
	| 'active'
	| 'completed'
	| 'failed'

export interface RunnerEvent {
	type: RunnerEventType
	data: {
		message?: string
		status?: RunnerQueueStatus
		runtimeMs?: number
		success?: boolean
		line?: number
		column?: number
	}
}

export interface RunnerResult {
	success: boolean
	runtimeMs: number
	error?: string
	line?: number
	column?: number
}

export interface RunRequest {
	code: string
}

export interface RunResponse {
	runId: string
}
