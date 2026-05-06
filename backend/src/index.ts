import { Worker as BullWorker, type Job } from "bullmq";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { createServer, type IncomingMessage } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "./config.js";
import { connection, runQueue, runQueueEvents } from "./queue.js";
import { runInWorker } from "./runner/runInWorker.js";
import type { RunnerEvent, RunPayload } from "./runner/types.js";

// Simple in-memory queue for development without Redis
interface MemoryJob {
	id: string;
	data: { code: string };
	resolve: (result: unknown) => void;
	reject: (error: Error) => void;
}

const memoryQueue: MemoryJob[] = [];
const isProcessingMemoryQueue = { value: false };

const processMemoryQueue = async () => {
	if (isProcessingMemoryQueue.value || memoryQueue.length === 0) return;

	isProcessingMemoryQueue.value = true;
	const job = memoryQueue.shift();
	if (!job) {
		isProcessingMemoryQueue.value = false;
		return;
	}

	try {
		const payload: RunPayload = {
			code: job.data.code,
			timeoutMs: config.workerTimeoutMs,
			memoryMb: config.workerMemoryMb,
			maxOutputLines: config.maxOutputLines,
		};

		const result = await runInWorker({
			payload,
			onEvent: (event) => {
				publishEvent(job.id, event);
			},
		});

		publishEvent(job.id, {
			type: "done",
			data: {
				success: true,
				runtimeMs: result.runtimeMs,
			},
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
		// Process next job
		setImmediate(processMemoryQueue);
	}
};

const addMemoryJob = (data: { code: string }): { id: string } => {
	const id = `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	void new Promise((resolve, reject) => {
		memoryQueue.push({ id, data, resolve, reject });
		processMemoryQueue();
	});
	return { id };
};

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

app.post("/api/runs", async (req: Request, res: Response) => {
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
	const match = /^\/api\/runs\/(.+)$/.exec(url.pathname);

	if (!match) {
		socket.destroy();
		return;
	}

	const runId = decodeURIComponent(match[1]);

	wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
		const clients = clientMap.get(runId) ?? new Set();
		clients.add(ws);
		clientMap.set(runId, clients);

		const cached = eventCache.get(runId) ?? [];
		cached.forEach((event) => {
			ws.send(JSON.stringify(event));
		});

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
	({ jobId, data }: { jobId: string | number; data: RunnerEvent }) => {
		const runId = String(jobId);
		publishEvent(runId, data);
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

const runnerWorker = new BullWorker(
	"runs",
	async (job: Job<{ code: string }>) => {
		const payload: RunPayload = {
			code: job.data.code,
			timeoutMs: config.workerTimeoutMs,
			memoryMb: config.workerMemoryMb,
			maxOutputLines: config.maxOutputLines,
		};

		const result = await runInWorker({
			payload,
			onEvent: (event) => {
				job.updateProgress(event);
			},
		});

		return result;
	},
	{
		connection,
		concurrency: config.concurrency,
	},
);

runnerWorker.on("error", (error: Error) => {
	console.error("Runner worker error:", error);
});

server.listen(config.port, () => {
	console.log(`Runner API listening on ${config.port}`);
});
