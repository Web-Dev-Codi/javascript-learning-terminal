export interface ExecutionResult {
  success: boolean
  output: string[]
  error?: string
  runtime?: number
}

export interface SandboxConfig {
  timeout: number
  allowedGlobals: string[]
  blockedGlobals: string[]
}

export class SandboxEngine {
  private static iframe: HTMLIFrameElement | null = null
  private static isInitialized = false
  private static isReadyFlag = false
  private static messageHandler: ((event: MessageEvent) => void) | null = null
  private static pendingRuns: Map<string, {
    outputs: string[]
    resolve: (res: ExecutionResult) => void
    startTime: number
    timer: number
    config: SandboxConfig
  }> = new Map()

  private static readonly defaultConfig: SandboxConfig = {
    timeout: 5000,
    allowedGlobals: [
      'console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'
    ],
    blockedGlobals: [
      'window', 'document', 'location', 'navigator', 'fetch', 'XMLHttpRequest',
      'WebSocket', 'Worker', 'SharedWorker', 'ServiceWorker', 'localStorage',
      'sessionStorage', 'indexedDB', 'webkitStorageInfo', 'open', 'close',
      'alert', 'confirm', 'prompt', 'eval', 'Function', 'GeneratorFunction',
      'AsyncFunction', 'import', 'require', 'process', 'global', 'Buffer'
    ]
  }

  /**
   * Initialize the sandbox iframe
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized && this.isReadyFlag) return

    return new Promise((resolve, reject) => {
      // Create hidden iframe
      this.iframe = document.createElement('iframe')
      this.iframe.style.display = 'none'
      this.iframe.style.width = '0'
      this.iframe.style.height = '0'
      this.iframe.style.border = 'none'

      // Security: only allow scripts; no same-origin
      this.iframe.sandbox.add('allow-scripts')

      // Add to DOM first
      document.body.appendChild(this.iframe)

      // Global message handler
      const onMessage = (event: MessageEvent) => {
        if (!this.iframe || event.source !== this.iframe.contentWindow) return
        const data = event.data as any
        if (!data || data.__synth__ !== true) return

        if (data.type === 'ready') {
          this.isReadyFlag = true
          this.isInitialized = true
          resolve()
          return
        }

        // Handle run messages
        const run = data.execId ? this.pendingRuns.get(String(data.execId)) : undefined
        if (!run) return

        if (data.type === 'log' || data.type === 'warn' || data.type === 'error' || data.type === 'info' || data.type === 'pass' || data.type === 'fail') {
          const line = `[${data.type}] ${Array.isArray(data.args) ? data.args.join(' ') : ''}`
          run.outputs.push(line)
          // Cap at 200 lines (S-06)
          if (run.outputs.length > 200) {
            run.outputs.splice(0, run.outputs.length - 200)
          }
          return
        }

        if (data.type === 'done') {
          clearTimeout(run.timer)
          const runtime = Math.round(performance.now() - run.startTime)
          this.pendingRuns.delete(String(data.execId))
          run.resolve({ success: true, output: run.outputs, runtime })
          return
        }
      }

      this.messageHandler = onMessage
      window.addEventListener('message', onMessage)

      // Bootstrap srcdoc that only signals readiness
      this.iframe.srcdoc = this.createBootstrapHTML()

      // Safety: fallback timeout if ready never arrives
      setTimeout(() => {
        if (!this.isReadyFlag) {
          reject(new Error('Failed to initialize sandbox iframe'))
        }
      }, 3000)
    })
  }

  // Bootstrap doc that posts ready
  private static createBootstrapHTML(): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><script>(function(){try{parent.postMessage({__synth__:true,type:'ready'},'*')}catch(e){}})();</script></head><body></body></html>`
  }

  // Build per-run HTML with preamble that forwards console and errors, then runs user code
  private static createRunHTML(code: string, execId: string, cfg: SandboxConfig): string {
    // Basic escape to avoid closing the script tag
    const safeCode = code.replace(/<\\/script / gi, '<\\/script')
    const blocked = JSON.stringify(cfg.blockedGlobals)
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><script>(function(){
  try{
    var __BLOCKED__ = ${blocked};
    for(var i=0;i<__BLOCKED__.length;i++){try{self[__BLOCKED__[i]]=undefined}catch(e){}}
  }catch(e){}
  function __send__(type){
    var args = Array.prototype.slice.call(arguments,1).map(function(a){
      try{ if (typeof a === 'object') return JSON.stringify(a) }catch(e){}
      return String(a)
    });
    try{ parent.postMessage({__synth__:true,type:type,args:args,execId:'${execId}'}, '*') }catch(e){}
  }
  var __origOnError__ = self.onerror;
  self.onerror = function(msg,src,line,col,err){
    __send__('error', (msg||'Error') + (line?(' @ '+line+':'+(col||0)):'') );
    if (typeof __origOnError__ === 'function') try{__origOnError__.apply(self, arguments)}catch(e){}
  };
  ['log','warn','error','info'].forEach(function(m){
    var orig = console[m];
    console[m] = function(){ __send__(m, Array.prototype.slice.call(arguments).join(' ')); try{orig&&orig.apply(console,arguments)}catch(e){} };
  });
})();</script></head><body><script>try{\n${safeCode}\n}catch(e){try{parent.postMessage({__synth__:true,type:'error',args:[e && e.message ? e.message : String(e)],execId:'${execId}'},'*')}catch(_){} } finally { try{parent.postMessage({__synth__:true,type:'done',execId:'${execId}'},'*')}catch(_){} }</script></body></html>`
  }

  /**
   * Execute JavaScript code in the sandbox
   */
  static async execute(code: string, config: Partial<SandboxConfig> = {}): Promise<ExecutionResult> {
    if (!this.isInitialized || !this.isReadyFlag) {
      await this.initialize()
    }

    if (!this.iframe) {
      return { success: false, output: [], error: 'Sandbox not available' }
    }

    const finalConfig: SandboxConfig = { ...this.defaultConfig, ...config }
    const startTime = performance.now()
    const execId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    return new Promise<ExecutionResult>((resolve) => {
      // Register pending run
      const runRecord = {
        outputs: [] as string[],
        resolve,
        startTime,
        timer: 0 as unknown as number,
        config: finalConfig
      }
      // Timeout handling (S-07)
      runRecord.timer = window.setTimeout(() => {
        this.pendingRuns.delete(execId)
        resolve({
          success: false,
          output: runRecord.outputs,
          error: `Execution timed out after ${Math.round(finalConfig.timeout / 1000)}s — check for infinite loops`,
          runtime: Math.round(performance.now() - startTime)
        })
      }, finalConfig.timeout)

      this.pendingRuns.set(execId, runRecord)

      // Inject per-run srcdoc
      const html = this.createRunHTML(code, execId, finalConfig)
      this.iframe!.srcdoc = html
    })
  }

  /**
   * Clean up the sandbox
   */
  static cleanup(): void {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe)
      this.iframe = null
    }
    this.isInitialized = false
    this.isReadyFlag = false
    this.pendingRuns.clear()
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler)
      this.messageHandler = null
    }
  }

  /**
   * Check if sandbox is ready
   */
  static isReady(): boolean {
    return this.isInitialized && this.isReadyFlag && this.iframe !== null
  }

  /**
   * Reset sandbox document to bootstrap (clear state)
   */
  static reset(): void {
    if (!this.iframe) return
    this.isReadyFlag = false
    this.iframe.srcdoc = this.createBootstrapHTML()
  }
}
