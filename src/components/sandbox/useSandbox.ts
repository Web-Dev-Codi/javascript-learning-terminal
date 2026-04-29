import { useCallback, useEffect, useState } from 'react'
import { SandboxEngine } from './sandboxEngine'
import type { ExecutionResult } from './sandboxEngine'
import { useEditorStore } from '../../store/editorStore'
import { useSyntaxChecker } from '../checker/useSyntaxChecker'

interface UseSandboxResult {
  executeCode: (code: string) => Promise<ExecutionResult>
  executeTrusted: (code: string) => Promise<ExecutionResult>
  isExecuting: boolean
  isReady: boolean
  error: string | null
  clearError: () => void
}

export const useSandbox = (): UseSandboxResult => {
  const [isReady, setIsReady] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { shouldBlockExecution } = useSyntaxChecker()
  const { addConsoleMessage, clearConsole } = useEditorStore()

  // Initialize sandbox on mount
  useEffect(() => {
    const initSandbox = async () => {
      try {
        await SandboxEngine.initialize()
        setIsReady(true)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize sandbox'
        setError(errorMessage)
        setIsReady(false)
      }
    }

    initSandbox()

    // Cleanup on unmount
    return () => {
      SandboxEngine.cleanup()
    }
  }, [])

  const executeCode = useCallback(async (code: string): Promise<ExecutionResult> => {
    if (!isReady) {
      const result: ExecutionResult = {
        success: false,
        output: [],
        error: 'Sandbox not ready'
      }
      addConsoleMessage('error', '✕ Sandbox not ready')
      return result
    }

    // Check if there are blocking syntax errors
    if (shouldBlockExecution) {
      const result: ExecutionResult = {
        success: false,
        output: [],
        error: 'Code has syntax errors that must be fixed before execution'
      }
      // Per spec CO-06: show single warn line when blocked
      addConsoleMessage('warn', 'Execution halted — fix errors and retry')
      return result
    }

    setIsExecuting(true)
    setError(null)

    // Clear previous console output
    clearConsole()
    addConsoleMessage('info', '▶ Running code...')

    try {
      const result = await SandboxEngine.execute(code)

      if (result.success) {
        addConsoleMessage('info', `✓ Code executed successfully (${result.runtime}ms)`)

        // Add all console output
        result.output.forEach(output => {
          const [type, ...messageParts] = output.split(' ')
          const message = messageParts.join(' ')

          switch (type) {
            case '[log]':
              addConsoleMessage('log', message)
              break
            case '[error]':
              addConsoleMessage('error', message)
              break
            case '[warn]':
              addConsoleMessage('warn', message)
              break
            case '[info]':
              addConsoleMessage('info', message)
              break
            default:
              addConsoleMessage('log', output)
          }
        })
      } else {
        addConsoleMessage('error', `✕ Execution failed: ${result.error}`)

        // Still add any console output that was captured
        result.output.forEach(output => {
          const [type, ...messageParts] = output.split(' ')
          const message = messageParts.join(' ')

          switch (type) {
            case '[log]':
              addConsoleMessage('log', message)
              break
            case '[error]':
              addConsoleMessage('error', message)
              break
            case '[warn]':
              addConsoleMessage('warn', message)
              break
            case '[info]':
              addConsoleMessage('info', message)
              break
            default:
              addConsoleMessage('log', output)
          }
        })
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution error'
      setError(errorMessage)
      addConsoleMessage('error', `✕ Sandbox error: ${errorMessage}`)

      return {
        success: false,
        output: [],
        error: errorMessage
      }
    } finally {
      setIsExecuting(false)
    }
  }, [isReady, shouldBlockExecution, addConsoleMessage, clearConsole])

  // Execute trusted code (e.g., examples) bypassing syntax checker
  const executeTrusted = useCallback(async (code: string): Promise<ExecutionResult> => {
    if (!isReady) {
      const result: ExecutionResult = {
        success: false,
        output: [],
        error: 'Sandbox not ready'
      }
      addConsoleMessage('error', '✕ Sandbox not ready')
      return result
    }

    setIsExecuting(true)
    setError(null)

    clearConsole()
    addConsoleMessage('info', '▶ Running example...')

    try {
      const result = await SandboxEngine.execute(code)

      if (result.success) {
        addConsoleMessage('info', `✓ Example executed (${result.runtime}ms)`)
        result.output.forEach(output => {
          const [type, ...messageParts] = output.split(' ')
          const message = messageParts.join(' ')
          switch (type) {
            case '[log]':
              addConsoleMessage('log', message)
              break
            case '[error]':
              addConsoleMessage('error', message)
              break
            case '[warn]':
              addConsoleMessage('warn', message)
              break
            case '[info]':
              addConsoleMessage('info', message)
              break
            default:
              addConsoleMessage('log', output)
          }
        })
      } else {
        addConsoleMessage('error', `✕ Example failed: ${result.error}`)
        result.output.forEach(output => {
          const [type, ...messageParts] = output.split(' ')
          const message = messageParts.join(' ')
          switch (type) {
            case '[log]':
              addConsoleMessage('log', message)
              break
            case '[error]':
              addConsoleMessage('error', message)
              break
            case '[warn]':
              addConsoleMessage('warn', message)
              break
            case '[info]':
              addConsoleMessage('info', message)
              break
            default:
              addConsoleMessage('log', output)
          }
        })
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution error'
      setError(errorMessage)
      addConsoleMessage('error', `✕ Sandbox error: ${errorMessage}`)
      return { success: false, output: [], error: errorMessage }
    } finally {
      setIsExecuting(false)
    }
  }, [isReady, addConsoleMessage, clearConsole])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    executeCode,
    executeTrusted,
    isExecuting,
    isReady,
    error,
    clearError
  }
}
