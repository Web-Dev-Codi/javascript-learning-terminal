export const config = {
	port: Number.parseInt(process.env.PORT ?? "8000", 10),
	redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
	useMemoryQueue: process.env.USE_MEMORY_QUEUE === "true",
	workerTimeoutMs: Number.parseInt(process.env.RUNNER_TIMEOUT_MS ?? "5000", 10),
	workerMemoryMb: Number.parseInt(process.env.RUNNER_MEMORY_MB ?? "128", 10),
	maxOutputLines: Number.parseInt(process.env.RUNNER_MAX_OUTPUT ?? "200", 10),
	workerExt: process.env.RUNNER_WORKER_EXT ?? "js",
	concurrency: Number.parseInt(process.env.RUNNER_CONCURRENCY ?? "2", 10),
};
