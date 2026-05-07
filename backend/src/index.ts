import { Worker as BullWorker, type Job } from "bullmq";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { createServer, type IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "./config.js";
import { connection, runQueue, runQueueEvents } from "./queue.js";
import type { RunnerEvent, RunPayload } from "./runner/types.js";
import { initPool, runInPool } from "./runner/workerPool.js";

const buildPayload = (code: string): RunPayload => ({
	code,
	timeoutMs: config.workerTimeoutMs,
	memoryMb: config.workerMemoryMb,
	maxOutputLines: config.maxOutputLines,
});

// Simple in-memory queue for development without Redis
interface MemoryJob {
	id: string;
	data: { code: string };
	resolve: (result: unknown) => void;
	reject: (error: Error) => void;
}

const memoryQueue: MemoryJob[] = [];
const isProcessingMemoryQueue = { value: false };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_CONCURRENT_JOBS = 5;
const activeJobCount = { value: 0 };

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const rateLimitMiddleware = (req: Request, res: Response, next: () => void) => {
	const clientIp = req.ip ?? req.socket.remoteAddress ?? "unknown";
	const now = Date.now();
	const entry = rateLimitStore.get(clientIp);
	if (!entry || now > entry.resetAt) {
		rateLimitStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		next();
		return;
	}
	entry.count++;
	if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
		res.status(429).json({ error: "Rate limit exceeded. Try again later." });
		return;
	}
	next();
};

const processMemoryQueue = async () => {
	if (isProcessingMemoryQueue.value || memoryQueue.length === 0) return;

	isProcessingMemoryQueue.value = true;
	const job = memoryQueue.shift();
	if (!job) {
		isProcessingMemoryQueue.value = false;
		return;
	}

	activeJobCount.value++;

	try {
		const payload = buildPayload(job.data.code);

		const result = await runInPool(payload, (event) => {
			publishEvent(job.id, event);
		});

		job.resolve(result);
	} catch (error) {
		publishEvent(job.id, {
			type: "error",
			data: { message: (error as Error).message },
		});
		job.reject(error as Error);
	} finally {
		isProcessingMemoryQueue.value = false;
		activeJobCount.value--;
		setImmediate(processMemoryQueue);
	}
};

const addMemoryJob = (data: { code: string }): { id: string } => {
	const id = `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	new Promise((resolve, reject) => {
		memoryQueue.push({ id, data, resolve, reject });
		processMemoryQueue();
	}).catch((error: unknown) => {
		console.error(`Job ${id} failed:`, error);
	});
	return { id };
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

app.post("/api/runs", rateLimitMiddleware, async (req: Request, res: Response) => {
	if (activeJobCount.value >= MAX_CONCURRENT_JOBS) {
		res.status(503).json({ error: "Server busy. Try again later." });
		return;
	}

	const code = typeof req.body?.code === "string" ? req.body.code : "";

	if (!code.trim()) {
		res.status(400).json({ error: "Code is required." });
		return;
	}

	let runId: string;
	if (config.useMemoryQueue || !runQueue) {
		const result = addMemoryJob({ code });
		runId = result.id;
	} else {
		const job = await runQueue.add(
			"run",
			{ code },
			{
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
		runId = job.id ?? `job-${Date.now()}`;
	}

	res.json({ runId });
});

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const clientMap = new Map<string, Set<WebSocket>>();
const eventCache = new Map<string, RunnerEvent[]>();

const MAX_EVENT_CACHE_RUNS = 100;

setInterval(() => {
	if (eventCache.size > MAX_EVENT_CACHE_RUNS) {
		const keys = [...eventCache.keys()].slice(
			0,
			eventCache.size - MAX_EVENT_CACHE_RUNS,
		);
		for (const k of keys) {
			eventCache.delete(k);
			clientMap.delete(k);
		}
	}
}, 60_000);

const cacheEvent = (runId: string, event: RunnerEvent) => {
	const events = eventCache.get(runId) ?? [];
	events.push(event);
	if (events.length > 200) {
		events.splice(0, events.length - 200);
	}
	eventCache.set(runId, events);
};

const broadcast = (runId: string, event: RunnerEvent) => {
	const clients = clientMap.get(runId);
	if (!clients || clients.size === 0) return;
	const payload = JSON.stringify(event);

	for (const client of clients) {
		if (client.readyState !== WebSocket.OPEN) continue;
		client.send(payload);
	}
};

const publishEvent = (runId: string, event: RunnerEvent) => {
	cacheEvent(runId, event);
	broadcast(runId, event);
};

server.on("upgrade", (req: IncomingMessage, socket, head) => {
	const host = req.headers.host ?? "localhost";
	const url = new URL(req.url ?? "/", `http://${host}`);
	const match = /^\/api\/runs\/([a-zA-Z0-9_-]+)$/.exec(url.pathname);

	if (!match) {
		socket.destroy();
		return;
	}

	const runId = match[1];

	wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
		const clients = clientMap.get(runId) ?? new Set();
		clients.add(ws);
		clientMap.set(runId, clients);

		const cached = eventCache.get(runId) ?? [];
		for (const event of cached) {
			try {
				ws.send(JSON.stringify(event));
			} catch {
				// WebSocket may have closed between cache check and send
			}
		}

		ws.on("close", () => {
			const current = clientMap.get(runId);
			if (!current) return;
			current.delete(ws);
			if (current.size === 0) clientMap.delete(runId);
		});
	});
});

runQueueEvents?.on(
	"progress",
	({ jobId, data }: { jobId: string; data: unknown }) => {
		publishEvent(jobId, data as RunnerEvent);
	},
);

runQueueEvents?.on("active", ({ jobId }: { jobId: string | number }) => {
	publishEvent(String(jobId), {
		type: "status",
		data: { status: "active" },
	});
});

runQueueEvents?.on("waiting", ({ jobId }: { jobId: string | number }) => {
	publishEvent(String(jobId), {
		type: "status",
		data: { status: "waiting" },
	});
});

runQueueEvents?.on("completed", ({ jobId }: { jobId: string | number }) => {
	publishEvent(String(jobId), {
		type: "status",
		data: { status: "completed" },
	});
});

runQueueEvents?.on(
	"failed",
	({
		jobId,
		failedReason,
	}: {
		jobId: string | number;
		failedReason: string;
	}) => {
		publishEvent(String(jobId), {
			type: "status",
			data: { status: "failed" },
		});
		publishEvent(String(jobId), {
			type: "error",
			data: { message: failedReason },
		});
	},
);

const runnerWorker = config.useMemoryQueue
	? null
	: new BullWorker(
			"runs",
			async (job: Job<{ code: string }>) => {
				const payload = buildPayload(job.data.code);

				return await runInPool(payload, (event) => {
					job.updateProgress(event).catch(() => {
						// Progress updates are best-effort; ignore errors
					});
				});
			},
			{
				connection,
				concurrency: config.concurrency,
			},
		);

runnerWorker?.on("error", (error: Error) => {
	console.error("Runner worker error:", error);
});

initPool();

server.listen(config.port, () => {
	console.log(`Runner API listening on ${config.port}`);
});
