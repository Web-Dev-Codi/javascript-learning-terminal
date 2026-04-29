import { parse } from '@babel/parser'
import type { Diagnostic } from '../../types/lesson'

interface ParseError {
  message: string
  loc: {
    line: number
    column: number
  }
}

interface ESTreeAST {
  program: {
    type: string
    body: unknown[]
  }
  errors?: ParseError[]
}

export interface SyntaxCheckResult {
  errors: Diagnostic[]
  ast: ESTreeAST
  success: boolean
}

export class SyntaxChecker {
  /**
   * Parse JavaScript code and collect syntax errors
   * Uses @babel/parser with errorRecovery to collect all errors
   */
  static checkSyntax(code: string): SyntaxCheckResult {
    try {
      const ast = parse(code, {
        sourceType: 'script',
        errorRecovery: true,       // collect all errors, don't throw
        plugins: ['estree'],       // ESTree-compatible output
      })

      // Convert Babel errors to our Diagnostic format
      const errors: Diagnostic[] = (ast.errors as ParseError[]).map(error => ({
        ruleId: 'syntax-error',
        severity: 'error' as const,
        line: error.loc.line,
        column: error.loc.column,
        messages: {
          short: 'Syntax error',
          long: error.message,
          hint: 'Check your syntax for missing brackets, semicolons, or other issues.'
        }
      }))

      return {
        errors,
        ast,
        success: errors.length === 0
      }
    } catch (error) {
      // This should not happen with errorRecovery: true, but handle it anyway
      return {
        errors: [{
          ruleId: 'syntax-error',
          severity: 'error' as const,
          line: 1,
          column: 1,
          messages: {
            short: 'Parse error',
            long: error instanceof Error ? error.message : 'Unknown parse error',
            hint: 'Check your JavaScript syntax.'
          }
        }],
        ast: { program: { type: 'Program', body: [] } },
        success: false
      }
    }
  }

  /**
   * Check if code should be blocked from execution
   * Returns true if there are any syntax errors
   */
  static shouldBlockExecution(errors: Diagnostic[]): boolean {
    return errors.some(error => error.severity === 'error')
  }

  /**
   * Get a summary of issues by severity
   */
  static getIssueSummary(errors: Diagnostic[]): {
    errors: number
    warnings: number
    info: number
  } {
    return errors.reduce((summary, error) => {
      switch (error.severity) {
        case 'error':
          summary.errors++
          break
        case 'warning':
          summary.warnings++
          break
        case 'info':
          summary.info++
          break
      }
      return summary
    }, { errors: 0, warnings: 0, info: 0 })
  }
}
