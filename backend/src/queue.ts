import { Queue, QueueEvents } from "bullmq";
import { config } from "./config.js";

const parseRedis = () => {
	const url = new URL(config.redisUrl);
	const port = url.port ? Number.parseInt(url.port, 10) : 6379;
	const username = url.username || undefined;
	const password = url.password || undefined;
	const host = url.hostname;
	const tls = url.protocol === "rediss:" ? {} : undefined;

	return {
		host,
		port,
		username,
		password,
		tls,
	};
};

export const connection = parseRedis();

export const runQueue = config.useMemoryQueue
	? null
	: new Queue("runs", { connection });
export const runQueueEvents = config.useMemoryQueue
	? null
	: new QueueEvents("runs", { connection });
