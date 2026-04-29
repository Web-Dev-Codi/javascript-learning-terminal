import type { Diagnostic, RuleId } from '../../types/lesson'

// ESTree node types (simplified for our use case)
interface ESTreeNode {
  type: string
  loc?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  [key: string]: unknown
}

interface ESTreeProgram extends ESTreeNode {
  type: 'Program'
  body: ESTreeNode[]
}

interface ESTreeAST {
  program: ESTreeProgram
  errors?: Array<{
    message: string
    loc: { line: number; column: number }
  }>
}

export interface Rule {
  id: RuleId
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  check: (ast: ESTreeAST) => Diagnostic[]
}

export class RuleEngine {
  private static rules: Map<RuleId, Rule> = new Map()

  static {
    // Register all available rules - moved after rule definitions
  }

  /**
   * Register a new rule
   */
  static registerRule(rule: Rule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Get all available rules
   */
  static getAllRules(): Rule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Get rule by ID
   */
  static getRule(id: RuleId): Rule | undefined {
    return this.rules.get(id)
  }

  /**
   * Run specified rules against the AST
   */
  static runRules(ast: ESTreeAST, activeRules: RuleId[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []

    for (const ruleId of activeRules) {
      const rule = this.rules.get(ruleId)
      if (rule) {
        try {
          const ruleDiagnostics = rule.check(ast)
          diagnostics.push(...ruleDiagnostics)
        } catch (error) {
          console.warn(`Rule ${ruleId} failed:`, error)
        }
      }
    }

    return diagnostics
  }

  /**
   * Walk the AST and call visitor functions for each node type
   */
  static walkAST(ast: ESTreeAST, visitors: Record<string, (node: ESTreeNode) => void>): void {
    if (!ast || !ast.program) return

    const walk = (node: ESTreeNode) => {
      if (!node || typeof node !== 'object') return

      // Call visitor for this node type
      const visitor = visitors[node.type]
      if (visitor) {
        visitor(node)
      }

      // Walk child nodes
      for (const key in node) {
        if (key === 'type' || key === 'loc') continue

        const child = node[key] as ESTreeNode | ESTreeNode[]
        if (Array.isArray(child)) {
          for (const item of child) {
            walk(item)
          }
        } else if (child) {
          walk(child)
        }
      }
    }

    walk(ast.program)
  }
}

// Rule: Require semicolons
const requireSemicolonsRule: Rule = {
  id: 'require-semicolons',
  name: 'Require Semicolons',
  description: 'All statements must end with a semicolon',
  severity: 'error',
  check: (ast: ESTreeAST): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []

    RuleEngine.walkAST(ast, {
      ExpressionStatement: (node: ESTreeNode) => {
        if (node.loc) {
          // Check if the statement ends with a semicolon
          const expression = node.expression as ESTreeNode
          if (expression && expression.type !== 'Literal' && expression.type !== 'Identifier') {
            // This is a simplified check - in a real implementation we'd need the source code
            // For now, we'll assume most expression statements should have semicolons
            if (expression.type === 'CallExpression' ||
              expression.type === 'AssignmentExpression') {
              diagnostics.push({
                ruleId: 'require-semicolons',
                severity: 'error',
                line: node.loc.end.line,
                column: node.loc.end.column,
                messages: {
                  short: 'Missing semicolon',
                  long: 'Statements must end with a semicolon (;)',
                  hint: 'Add a semicolon at the end of this statement'
                }
              })
            }
          }
        }
      }
    })

    return diagnostics
  }
}

// Rule: Require assignment operator
const requireAssignmentOperatorRule: Rule = {
  id: 'require-assignment-operator',
  name: 'Require Assignment Operator',
  description: 'Variable declarations must use assignment operator (=)',
  severity: 'error',
  check: (ast: ESTreeAST): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []

    RuleEngine.walkAST(ast, {
      VariableDeclaration: (node: ESTreeNode) => {
        const declarations = node.declarations as ESTreeNode[]
        if (declarations) {
          for (const declarator of declarations) {
            const id = declarator.id as ESTreeNode & { name?: string }
            if (!declarator.init && id && id.loc && id.name) {
              diagnostics.push({
                ruleId: 'require-assignment-operator',
                severity: 'error',
                line: id.loc.start.line,
                column: id.loc.start.column,
                tokenName: id.name,
                messages: {
                  short: 'Missing assignment operator',
                  long: `Variable '${id.name}' is declared but not assigned a value`,
                  hint: 'Add an assignment operator (=) and a value'
                }
              })
            }
          }
        }
      }
    })

    return diagnostics
  }
}

// Rule: No var keyword
const noVarRule: Rule = {
  id: 'no-var',
  name: 'No var Keyword',
  description: 'Use let or const instead of var',
  severity: 'warning',
  check: (ast: ESTreeAST): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []

    RuleEngine.walkAST(ast, {
      VariableDeclaration: (node: ESTreeNode) => {
        if (node.kind === 'var' && node.loc) {
          diagnostics.push({
            ruleId: 'no-var',
            severity: 'warning',
            line: node.loc.start.line,
            column: node.loc.start.column,
            messages: {
              short: 'Use let or const instead of var',
              long: 'The var keyword is deprecated. Use let for variables that will be reassigned, or const for constants.',
              hint: 'Replace var with let or const'
            }
          })
        }
      }
    })

    return diagnostics
  }
}

// Rule: Const reassignment
const constReassignmentRule: Rule = {
  id: 'const-reassignment',
  name: 'Const Reassignment',
  description: 'Cannot reassign const variables',
  severity: 'error',
  check: (ast: ESTreeAST): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []
    const constDeclarations = new Map<string, { line: number; column: number }>()

    // First pass: collect const declarations
    RuleEngine.walkAST(ast, {
      VariableDeclaration: (node: ESTreeNode) => {
        if (node.kind === 'const') {
          const declarations = node.declarations as ESTreeNode[]
          if (declarations) {
            for (const declarator of declarations) {
              const id = declarator.id as ESTreeNode & { name?: string }
              if (id && id.name && id.loc) {
                constDeclarations.set(id.name, {
                  line: id.loc.start.line,
                  column: id.loc.start.column
                })
              }
            }
          }
        }
      }
    })

    // Second pass: check for reassignments
    RuleEngine.walkAST(ast, {
      AssignmentExpression: (node: ESTreeNode) => {
        const left = node.left as ESTreeNode & { name?: string }
        if (left && left.name && node.loc) {
          const constDecl = constDeclarations.get(left.name)
          if (constDecl) {
            diagnostics.push({
              ruleId: 'const-reassignment',
              severity: 'error',
              line: node.loc.start.line,
              column: node.loc.start.column,
              tokenName: left.name,
              messages: {
                short: 'Cannot reassign const variable',
                long: `Cannot reassign to constant '${left.name}' because it was declared with const`,
                hint: 'Use let instead of const if you need to reassign this variable'
              }
            })
          }
        }
      }
    })

    return diagnostics
  }
}

// Rule: Undefined variable
const undefinedVariableRule: Rule = {
  id: 'undefined-variable',
  name: 'Undefined Variable',
  description: 'Variable is used before being defined',
  severity: 'warning',
  check: (ast: ESTreeAST): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []
    const declaredVariables = new Set<string>()

    // First pass: collect all declared variables
    RuleEngine.walkAST(ast, {
      VariableDeclaration: (node: ESTreeNode) => {
        const declarations = node.declarations as ESTreeNode[]
        if (declarations) {
          for (const declarator of declarations) {
            const id = declarator.id as ESTreeNode & { name?: string }
            if (id && id.name) {
              declaredVariables.add(id.name)
            }
          }
        }
      }
    })

    // Second pass: check for undefined variables
    RuleEngine.walkAST(ast, {
      Identifier: (node: ESTreeNode) => {
        const identifier = node as ESTreeNode & { name?: string }
        // Skip if this is a declaration or property
        if (identifier.name && !declaredVariables.has(identifier.name) && identifier.loc) {
          // Check if this looks like a built-in or global
          const builtIns = ['console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'JSON']
          if (!builtIns.includes(identifier.name)) {
            diagnostics.push({
              ruleId: 'undefined-variable',
              severity: 'warning',
              line: identifier.loc.start.line,
              column: identifier.loc.start.column,
              tokenName: identifier.name,
              messages: {
                short: 'Undefined variable',
                long: `Variable '${identifier.name}' is used but not declared`,
                hint: 'Declare this variable before using it'
              }
            })
          }
        }
      }
    })

    return diagnostics
  }
}

// Rule: Missing closing bracket
const missingClosingBracketRule: Rule = {
  id: 'missing-closing-bracket',
  name: 'Missing Closing Bracket',
  description: 'Brackets, braces, or parentheses are not properly closed',
  severity: 'error',
  check: (): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []

    // This is a simplified check - in a real implementation we'd need to analyze the source code
    // For now, we'll rely on Babel's parser to catch most bracket issues
    // This rule could be enhanced to check for specific patterns

    return diagnostics
  }
}

// Register all rules after their definitions
RuleEngine.registerRule(requireSemicolonsRule)
RuleEngine.registerRule(requireAssignmentOperatorRule)
RuleEngine.registerRule(noVarRule)
RuleEngine.registerRule(constReassignmentRule)
RuleEngine.registerRule(undefinedVariableRule)
RuleEngine.registerRule(missingClosingBracketRule)
