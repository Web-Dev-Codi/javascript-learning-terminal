import ivm from "isolated-vm";
import { parentPort, workerData } from "node:worker_threads";
import type { RunnerEvent, RunPayload, RunResult } from "./types.js";

const payload = workerData as RunPayload;

const sendEvent = (event: RunnerEvent) => {
	parentPort?.postMessage(event);
};

const formatArgs = (args: unknown[]) =>
	args.map((arg) => {
		if (typeof arg === "string") return arg;
		try {
			return JSON.stringify(arg);
		} catch {
			return Object.prototype.toString.call(arg);
		}
	});

const parseErrorLocation = (stack?: string) => {
	if (!stack) return null;
	const match = /user-code\.js:(\d+):(\d+)/.exec(stack);
	if (!match) return null;
	return {
		line: Number.parseInt(match[1], 10),
		column: Number.parseInt(match[2], 10),
	};
};

const run = async (): Promise<RunResult> => {
	const isolate = new ivm.Isolate({
		memoryLimit: payload.memoryMb,
	});
	const context = await isolate.createContext();
	const jail = context.global;
	await jail.set("global", jail.derefInto());

	let outputCount = 0;
	let outputLimited = false;

	const pushOutput = (type: "stdout" | "stderr", args: unknown[]) => {
		if (outputLimited) return;
		outputCount += 1;
		if (outputCount > payload.maxOutputLines) {
			outputLimited = true;
			sendEvent({
				type: "stderr",
				data: {
					message: "Output limit reached (200 lines).",
				},
			});
			return;
		}

		sendEvent({
			type,
			data: {
				message: formatArgs(args).join(" "),
			},
		});
	};

	const sendRef = new ivm.Reference((type: string, args: unknown[]) => {
		if (type === "stderr") {
			pushOutput("stderr", args);
			return;
		}
		pushOutput("stdout", args);
	});

	await jail.set("send", sendRef);

	await context.eval(`
		const __send__ = (type, args) =>
			send.applySync(undefined, [type, args], {
				arguments: { copy: true },
			})

		globalThis.console = {
			log: (...args) => __send__('stdout', args.map(String)),
			info: (...args) => __send__('stdout', args.map(String)),
			warn: (...args) => __send__('stderr', args.map(String)),
			error: (...args) => __send__('stderr', args.map(String)),
		}
	`);

	const startTime = performance.now();
	try {
		const script = await isolate.compileScript(payload.code, {
			filename: "user-code.js",
		});

		await script.run(context, {
			timeout: payload.timeoutMs,
		});

		const runtimeMs = Math.round(performance.now() - startTime);
		sendEvent({
			type: "done",
			data: {
				success: true,
				runtimeMs,
			},
		});

		return {
			success: true,
			runtimeMs,
		};
	} catch (error) {
		const err =
			error instanceof Error ? error : new Error("Unknown execution error");
		const location = parseErrorLocation(err.stack);
		const runtimeMs = Math.round(performance.now() - startTime);

		sendEvent({
			type: "error",
			data: {
				message: err.message,
				line: location?.line,
				column: location?.column,
			},
		});

		sendEvent({
			type: "done",
			data: {
				success: false,
				runtimeMs,
			},
		});

		return {
			success: false,
			runtimeMs,
			error: err.message,
			line: location?.line,
			column: location?.column,
		};
	} finally {
		isolate.dispose();
	}
};

try {
	await run();
	parentPort?.close();
} catch (error) {
	const message =
		error instanceof Error ? error.message : "Unknown worker failure";

	sendEvent({
		type: "error",
		data: {
			message,
		},
	});
	parentPort?.close();
}
