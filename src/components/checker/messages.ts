import type { Diagnostic } from '../../types/lesson'

export interface MessageTemplate {
  short: string
  long: string
  hint?: string
}

export class MessageDictionary {
  private static messages: Map<string, MessageTemplate> = new Map()

  static {
    // Syntax error messages
    this.messages.set('syntax-error', {
      short: 'Syntax error',
      long: 'Your JavaScript code has invalid syntax',
      hint: 'Check for missing brackets, semicolons, or other syntax issues'
    })

    // Rule-specific messages
    this.messages.set('require-semicolons', {
      short: 'Missing semicolon',
      long: 'All JavaScript statements must end with a semicolon (;)',
      hint: 'Add a semicolon at the end of this statement'
    })

    this.messages.set('require-assignment-operator', {
      short: 'Missing assignment',
      long: 'Variable declarations must include an assignment operator (=) and a value',
      hint: 'Add an assignment operator (=) followed by a value'
    })

    this.messages.set('no-var', {
      short: 'Use let/const',
      long: 'The var keyword is deprecated. Use let for variables that will be reassigned, or const for constants',
      hint: 'Replace var with let or const'
    })

    this.messages.set('const-reassignment', {
      short: 'Cannot reassign const',
      long: 'Variables declared with const cannot be reassigned',
      hint: 'Use let instead of const if you need to reassign this variable'
    })

    this.messages.set('undefined-variable', {
      short: 'Undefined variable',
      long: 'This variable is being used but has not been declared',
      hint: 'Declare this variable before using it with let or const'
    })

    this.messages.set('missing-closing-bracket', {
      short: 'Unclosed bracket',
      long: 'You have an opening bracket, brace, or parenthesis that is not properly closed',
      hint: 'Make sure all brackets, braces, and parentheses are paired and properly nested'
    })

    // Success messages
    this.messages.set('success', {
      short: '✓ No issues found',
      long: 'Your code looks good! No syntax or style issues detected.',
      hint: 'You can run this code'
    })

    // Execution messages
    this.messages.set('execution-ready', {
      short: 'Ready to run',
      long: 'Your code is ready to execute',
      hint: 'Click Run or press Ctrl+Enter to execute'
    })

    this.messages.set('execution-blocked', {
      short: 'Cannot run',
      long: 'Fix the errors above before running your code',
      hint: 'Address all error-level issues before executing'
    })
  }

  /**
   * Get message template by rule ID
   */
  static getTemplate(ruleId: string): MessageTemplate | undefined {
    return this.messages.get(ruleId)
  }

  /**
   * Format a diagnostic with token name interpolation
   */
  static formatDiagnostic(diagnostic: Diagnostic): Diagnostic {
    const template = this.messages.get(diagnostic.ruleId)
    
    if (!template) {
      return diagnostic
    }

    // Interpolate token name if provided
    const formatString = (str: string): string => {
      if (diagnostic.tokenName) {
        return str.replace(/\$\{tokenName\}/g, diagnostic.tokenName)
      }
      return str
    }

    return {
      ...diagnostic,
      messages: {
        short: formatString(template.short),
        long: formatString(template.long),
        hint: template.hint ? formatString(template.hint) : undefined
      }
    }
  }

  /**
   * Get a formatted message for a specific context
   */
  static getMessage(ruleId: string, context?: string): string {
    const template = this.messages.get(ruleId)
    if (!template) {
      return `Unknown rule: ${ruleId}`
    }

    if (context === 'short') return template.short
    if (context === 'hint') return template.hint || template.short
    
    return template.long
  }

  /**
   * Add a custom message template
   */
  static addMessage(key: string, template: MessageTemplate): void {
    this.messages.set(key, template)
  }

  /**
   * Get all available message keys
   */
  static getAvailableKeys(): string[] {
    return Array.from(this.messages.keys())
  }
}
