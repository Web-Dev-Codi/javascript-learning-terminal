export type RunnerStatus = 'idle' | 'ready' | 'running' | 'error'

export interface RunnerEvent {
	type: 'stdout' | 'stderr' | 'error' | 'status' | 'done'
	data: {
		message?: string
		status?: 'waiting' | 'active' | 'completed' | 'failed'
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

export interface RunResponse {
	runId: string
}
