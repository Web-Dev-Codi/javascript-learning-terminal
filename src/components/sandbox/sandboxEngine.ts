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
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      // Create hidden iframe
      this.iframe = document.createElement('iframe')
      this.iframe.style.display = 'none'
      this.iframe.style.width = '0'
      this.iframe.style.height = '0'
      this.iframe.style.border = 'none'
      
      // Set sandbox attributes for security
      this.iframe.sandbox = 'allow-scripts'
      
      // Set up load handler
      this.iframe.onload = () => {
        this.setupSandboxEnvironment()
        this.isInitialized = true
        resolve()
      }

      this.iframe.onerror = () => {
        reject(new Error('Failed to initialize sandbox iframe'))
      }

      // Create the sandbox content
      const sandboxContent = this.createSandboxHTML()
      this.iframe.srcdoc = sandboxContent
      
      // Add to DOM
      document.body.appendChild(this.iframe)
    })
  }

  /**
   * Create the HTML content for the sandbox
   */
  private static createSandboxHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SYNTHSCRIPT Sandbox</title>
        <script>
          // Custom console that captures output
          window.capturedConsole = [];
          window.customConsole = {
            log: function(...args) {
              const message = args.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch {
                    return String(arg);
                  }
                }
                return String(arg);
              }).join(' ');
              window.capturedConsole.push({ type: 'log', message });
            },
            error: function(...args) {
              const message = args.map(String).join(' ');
              window.capturedConsole.push({ type: 'error', message });
            },
            warn: function(...args) {
              const message = args.map(String).join(' ');
              window.capturedConsole.push({ type: 'warn', message });
            },
            info: function(...args) {
              const message = args.map(String).join(' ');
              window.capturedConsole.push({ type: 'info', message });
            }
          };

          // Override console
          window.console = window.customConsole;

          // Signal that sandbox is ready
          window.isSandboxReady = true;
        </script>
      </head>
      <body>
        <div id="output"></div>
      </body>
      </html>
    `
  }

  /**
   * Set up the sandbox environment with security restrictions
   */
  private static setupSandboxEnvironment(): void {
    if (!this.iframe || !this.iframe.contentWindow) return

    const win = this.iframe.contentWindow

    // Block dangerous globals
    this.defaultConfig.blockedGlobals.forEach(global => {
      try {
        delete (win as any)[global]
      } catch {
        // Some globals can't be deleted, that's okay
      }
    })

    // Override dangerous functions
    try {
      (win as any).eval = () => { throw new Error('eval() is not allowed in sandbox') }
      (win as any).Function = () => { throw new Error('Function constructor is not allowed in sandbox') }
    } catch {
      // Some overrides might fail due to security restrictions
    }
  }

  /**
   * Execute JavaScript code in the sandbox
   */
  static async execute(code: string, config: Partial<SandboxConfig> = {}): Promise<ExecutionResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.iframe || !this.iframe.contentWindow) {
      return {
        success: false,
        output: [],
        error: 'Sandbox not available'
      }
    }

    const finalConfig = { ...this.defaultConfig, ...config }
    const win = this.iframe.contentWindow
    const startTime = performance.now()

    try {
      // Clear previous console output
      (win as any).capturedConsole = []

      // Check if sandbox is ready
      if (!(win as any).isSandboxReady) {
        return {
          success: false,
          output: [],
          error: 'Sandbox not ready'
        }
      }

      // Create a promise to handle execution timeout
      const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Execution timeout after ${finalConfig.timeout}ms`))
        }, finalConfig.timeout)
      })

      // Create a promise to handle actual execution
      const executionPromise = new Promise<ExecutionResult>((resolve, reject) => {
        try {
          // Execute the code
          const result = (win as any).eval(`
            (function() {
              try {
                ${code}
                return { success: true };
              } catch (error) {
                return { 
                  success: false, 
                  error: error.message || String(error),
                  stack: error.stack
                };
              }
            })()
          `)

          const runtime = performance.now() - startTime
          const capturedOutput = (win as any).capturedConsole || []

          if (result.success) {
            resolve({
              success: true,
              output: capturedOutput.map((log: any) => `[${log.type}] ${log.message}`),
              runtime: Math.round(runtime)
            })
          } else {
            resolve({
              success: false,
              output: capturedOutput.map((log: any) => `[${log.type}] ${log.message}`),
              error: result.error,
              runtime: Math.round(runtime)
            })
          }
        } catch (error) {
          const runtime = performance.now() - startTime
          const capturedOutput = (win as any).capturedConsole || []
          
          resolve({
            success: false,
            output: capturedOutput.map((log: any) => `[${log.type}] ${log.message}`),
            error: error instanceof Error ? error.message : String(error),
            runtime: Math.round(runtime)
          })
        }
      })

      // Race between execution and timeout
      return await Promise.race([executionPromise, timeoutPromise])

    } catch (error) {
      const runtime = performance.now() - startTime
      const capturedOutput = (win as any).capturedConsole || []

      return {
        success: false,
        output: capturedOutput.map((log: any) => `[${log.type}] ${log.message}`),
        error: error instanceof Error ? error.message : String(error),
        runtime: Math.round(runtime)
      }
    }
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
  }

  /**
   * Check if sandbox is ready
   */
  static isReady(): boolean {
    return this.isInitialized && 
           this.iframe !== null && 
           this.iframe.contentWindow !== null &&
           (this.iframe.contentWindow as any).isSandboxReady === true
  }
}
