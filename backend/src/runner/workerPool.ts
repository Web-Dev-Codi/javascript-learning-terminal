import { Worker } from "node:worker_threads";
import { config } from "../config.js";
import type { RunnerEvent, RunPayload, RunResult } from "./types.js";

interface Task {
	payload: RunPayload;
	onEvent: (event: RunnerEvent) => void;
	resolve: (result: RunResult) => void;
}

const POOL_SIZE = Math.max(2, config.concurrency || 4);
let workers: Worker[] = [];
const queue: Task[] = [];
const busy = new Set<Worker>();
const CRASH_LOOP_WINDOW_MS = 10_000;
const CRASH_LOOP_MAX = 5;
const spawnTimestamps: number[] = [];
let poolStarted = false;

function isCrashLoop(): boolean {
	const now = Date.now();
	while (spawnTimestamps.length > 0 && now - spawnTimestamps[0] > CRASH_LOOP_WINDOW_MS) {
		spawnTimestamps.shift();
	}
	return spawnTimestamps.length >= CRASH_LOOP_MAX;
}

function spawnWorker(): Worker | null {
	if (isCrashLoop()) {
		console.error(
			"Worker pool: crash loop detected — stopping worker respawn. Fix the worker module and restart.",
		);
		return null;
	}
	spawnTimestamps.push(Date.now());

	const workerUrl = new URL(`./executor.${config.workerExt}`, import.meta.url);
	const worker = new Worker(workerUrl, {
		execArgv: config.workerExt === "ts" ? ["--import", "tsx"] : [],
	}) as Worker & { _replacing?: boolean };

	worker.on("error", (err) => {
		console.error("Worker pool error:", err);
		if (!worker._replacing) {
			worker._replacing = true;
			replaceWorker(worker);
		}
	});

	worker.on("exit", (code) => {
		if (code !== 0) {
			console.error("Worker exited with code", code);
			if (!worker._replacing) {
				worker._replacing = true;
				replaceWorker(worker);
			}
		}
	});

	return worker;
}

function replaceWorker(oldWorker: Worker) {
	const idx = workers.indexOf(oldWorker);
	if (idx === -1) {
		return;
	}
	oldWorker.terminate().catch(() => {});
	busy.delete(oldWorker);
	const replacement = spawnWorker();
	if (replacement) {
		workers[idx] = replacement;
		processNext(replacement);
	} else {
		workers.splice(idx, 1);
		processAllAvailable();
	}
}

function processAllAvailable() {
	for (const worker of workers) {
		processNext(worker);
	}
}

export const initPool = () => {
	if (poolStarted) return;
	poolStarted = true;
	for (let i = 0; i < POOL_SIZE; i++) {
		const w = spawnWorker();
		if (w) workers.push(w);
	}
};

export const shutdownPool = async () => {
	const oldWorkers = workers;
	workers = [];
	queue.length = 0;
	busy.clear();
	await Promise.all(oldWorkers.map((w) => w.terminate().catch(() => {})));
};

function processNext(worker: Worker) {
	if (queue.length === 0 || busy.has(worker)) return;
	const task = queue.shift();
	if (!task) return;
	busy.add(worker);

	let settled = false;
	const settle = (result: RunResult) => {
		if (settled) return;
		settled = true;
		clearTimeout(timeout);
		worker.off("message", onMessage);
		worker.off("error", onError);
		busy.delete(worker);
		task.resolve(result);
		processNext(worker);
	};

	const onMessage = (message: RunnerEvent) => {
		task.onEvent(message);
		if (message.type === "done") {
			settle({
				success: message.data.success ?? false,
				runtimeMs: message.data.runtimeMs ?? 0,
				error: message.data.message,
			});
		}
	};

	const onError = (error: Error) => {
		task.onEvent({
			type: "error",
			data: { message: error.message },
		});
		settle({
			success: false,
			runtimeMs: 0,
			error: error.message,
		});
	};

	worker.on("message", onMessage);
	worker.on("error", onError);

	const timeout = setTimeout(() => {
		settle({
			success: false,
			runtimeMs: task.payload.timeoutMs,
			error: "Execution timed out",
		});
		replaceWorker(worker);
	}, task.payload.timeoutMs + 500);

	worker.postMessage(task.payload);
}

export const runInPool = (
	payload: RunPayload,
	onEvent: (event: RunnerEvent) => void,
): Promise<RunResult> => {
	return new Promise((resolve) => {
		queue.push({ payload, onEvent, resolve });
		for (const worker of workers) {
			processNext(worker);
		}
	});
};
