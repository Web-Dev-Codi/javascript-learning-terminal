const parseNum = (val: string | undefined, fallback: number, label: string): number => {
	const n = Number.parseInt(val ?? "", 10);
	if (Number.isNaN(n) || n < 1) {
		if (val !== undefined) console.warn(`Invalid ${label}, using fallback ${fallback}`);
		return fallback;
	}
	return n;
};

export const config = Object.freeze({
	port: parseNum(process.env.PORT, 4000, "PORT"),
	redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
	useMemoryQueue: process.env.USE_MEMORY_QUEUE === "true",
	workerTimeoutMs: parseNum(process.env.RUNNER_TIMEOUT_MS, 5000, "RUNNER_TIMEOUT_MS"),
	workerMemoryMb: parseNum(process.env.RUNNER_MEMORY_MB, 128, "RUNNER_MEMORY_MB"),
	maxOutputLines: parseNum(process.env.RUNNER_MAX_OUTPUT, 200, "RUNNER_MAX_OUTPUT"),
	workerExt: process.env.RUNNER_WORKER_EXT ?? "ts",
	concurrency: parseNum(process.env.RUNNER_CONCURRENCY, 2, "RUNNER_CONCURRENCY"),
});
