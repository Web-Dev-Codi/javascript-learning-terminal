export type RunnerEventType = "stdout" | "stderr" | "error" | "status" | "done";

export type RunnerQueueStatus = "waiting" | "active" | "completed" | "failed";

export interface RunnerEvent {
	type: RunnerEventType;
	data: {
		message?: string;
		status?: RunnerQueueStatus;
		runtimeMs?: number;
		line?: number;
		column?: number;
		success?: boolean;
	};
}

export interface RunPayload {
	code: string;
	timeoutMs: number;
	memoryMb: number;
	maxOutputLines: number;
}

export interface RunResult {
	success: boolean;
	runtimeMs: number;
	error?: string;
	line?: number;
	column?: number;
}
