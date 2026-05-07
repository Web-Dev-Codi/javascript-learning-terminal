import ivm from 'isolated-vm'
import { parentPort } from 'node:worker_threads'
import type { RunnerEvent, RunPayload } from './types.js'

if (!parentPort) {
	throw new Error('executor.ts must be run inside a Worker thread')
}

const sendEvent = (event: RunnerEvent) => {
	parentPort!.postMessage(event)
}

const formatArgs = (args: unknown[]) =>
	args.map((arg) => {
		if (typeof arg === 'string') return arg
		try {
			return JSON.stringify(arg)
		} catch {
			return Object.prototype.toString.call(arg)
		}
	})

const parseErrorLocation = (stack?: string) => {
	if (!stack) return null
	const match = /user-code\.js:(\d+):(\d+)/.exec(stack)
	if (!match) return null
	return {
		line: Number.parseInt(match[1], 10),
		column: Number.parseInt(match[2], 10),
	}
}

const execute = async (payload: RunPayload): Promise<void> => {
	const isolate = new ivm.Isolate({
		memoryLimit: payload.memoryMb,
		onCatastrophicError: (err) => {
			console.error('Isolate catastrophic error:', err)
			sendEvent({
				type: 'error',
				data: { message: 'Runner crashed (catastrophic error).' },
			})
			sendEvent({ type: 'done', data: { success: false, runtimeMs: 0 } })
		},
	})

	const context = await isolate.createContext()
	const jail = context.global
	await jail.set('global', jail.derefInto())

	let outputCount = 0
	let outputLimited = false

	const pushOutput = (type: 'stdout' | 'stderr', args: unknown[]) => {
		if (outputLimited) return
		outputCount += 1
		if (outputCount > payload.maxOutputLines) {
			outputLimited = true
			sendEvent({
				type: 'stderr',
				data: { message: 'Output limit reached (200 lines).' },
			})
			return
		}
		sendEvent({
			type,
			data: { message: formatArgs(args).join(' ') },
		})
	}

	const sendRef = new ivm.Reference((type: string, args: unknown[]) => {
		pushOutput(type as 'stdout' | 'stderr', args)
	})

	await jail.set('send', sendRef)

	await context.eval(`
		const __send__ = (type, args) =>
			send.applySync(undefined, [type, args], { arguments: { copy: true } })

		globalThis.console = {
			log: (...args) => __send__('stdout', args.map(String)),
			info: (...args) => __send__('stdout', args.map(String)),
			warn: (...args) => __send__('stderr', args.map(String)),
			error: (...args) => __send__('stderr', args.map(String)),
		}
	`)

	const startTime = performance.now()
	try {
		const script = await isolate.compileScript(payload.code, {
			filename: 'user-code.js',
		})
		await script.run(context, { timeout: payload.timeoutMs })
		const runtimeMs = Math.round(performance.now() - startTime)
		sendEvent({ type: 'done', data: { success: true, runtimeMs } })
	} catch (error) {
		const err =
			error instanceof Error ? error : new Error('Unknown execution error')
		const location = parseErrorLocation(err.stack)
		const runtimeMs = Math.round(performance.now() - startTime)
		sendEvent({
			type: 'error',
			data: {
				message: err.message,
				line: location?.line,
				column: location?.column,
			},
		})
		sendEvent({ type: 'done', data: { success: false, runtimeMs } })
	} finally {
		isolate.dispose()
	}
}

parentPort.on('message', async (payload: RunPayload) => {
	await execute(payload)
})
