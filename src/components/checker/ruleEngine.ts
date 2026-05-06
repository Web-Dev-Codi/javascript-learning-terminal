import type { Diagnostic, RuleId } from '../../types/lesson'

// ESTree node types (simplified for our use case)
export interface ESTreeNode {
  type: string
  loc?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  [key: string]: unknown
}

export interface ESTreeProgram extends ESTreeNode {
  type: 'Program'
  body: ESTreeNode[]
}

export interface ESTreeAST {
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
  check: (ctx: { ast: ESTreeAST; source: string }) => Diagnostic[]
}

export class RuleEngine {
  private static rules: Map<RuleId, Rule> = new Map()

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
  static runRules(ast: ESTreeAST, source: string, activeRules: RuleId[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []

    for (const ruleId of activeRules) {
      const rule = this.rules.get(ruleId)
      if (rule) {
        try {
          const ruleDiagnostics = rule.check({ ast, source })
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
  check: ({ ast, source }: { ast: ESTreeAST; source: string }): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []
    const lines = source.split('\n')

    RuleEngine.walkAST(ast, {
      ExpressionStatement: (node: ESTreeNode) => {
        if (!node.loc) return
        const expression = node.expression as ESTreeNode
        if (!expression) return

        const endLine = node.loc.end.line
        const endCol = node.loc.end.column

        const lineIndex = endLine - 1
        if (lineIndex < 0 || lineIndex >= lines.length) return

        const lineText = lines[lineIndex]
        const charBeforeEnd = endCol > 0 ? lineText[endCol - 1] : ''

        if (charBeforeEnd !== ';') {
          diagnostics.push({
            ruleId: 'require-semicolons',
            severity: 'error',
            line: endLine,
            column: endCol,
            messages: {
              short: 'Missing semicolon',
              long: 'Statements must end with a semicolon (;)',
              hint: 'Add a semicolon at the end of this statement'
            }
          })
        }
      },
      VariableDeclaration: (node: ESTreeNode) => {
        if (!node.loc) return
        const endLine = node.loc.end.line
        const endCol = node.loc.end.column

        const lineIndex = endLine - 1
        if (lineIndex < 0 || lineIndex >= lines.length) return

        const lineText = lines[lineIndex]
        const charBeforeEnd = endCol > 0 ? lineText[endCol - 1] : ''

        if (charBeforeEnd !== ';') {
          diagnostics.push({
            ruleId: 'require-semicolons',
            severity: 'error',
            line: endLine,
            column: endCol,
            messages: {
              short: 'Missing semicolon',
              long: 'Variable declarations must end with a semicolon (;)',
              hint: 'Add a semicolon at the end of this declaration'
            }
          })
        }
      },
      ReturnStatement: (node: ESTreeNode) => {
        if (!node.loc) return
        const endLine = node.loc.end.line
        const endCol = node.loc.end.column

        const lineIndex = endLine - 1
        if (lineIndex < 0 || lineIndex >= lines.length) return

        const lineText = lines[lineIndex]
        const charBeforeEnd = endCol > 0 ? lineText[endCol - 1] : ''

        if (charBeforeEnd !== ';') {
          diagnostics.push({
            ruleId: 'require-semicolons',
            severity: 'error',
            line: endLine,
            column: endCol,
            messages: {
              short: 'Missing semicolon',
              long: 'Return statements must end with a semicolon (;)',
              hint: 'Add a semicolon at the end of this return statement'
            }
          })
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
  check: ({ ast }: { ast: ESTreeAST; source: string }): Diagnostic[] => {
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
  check: ({ ast }: { ast: ESTreeAST; source: string }): Diagnostic[] => {
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
  check: ({ ast }: { ast: ESTreeAST; source: string }): Diagnostic[] => {
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

const JS_BUILTINS = new Set([
  'console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean',
  'Symbol', 'BigInt', 'JSON', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet',
  'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError',
  'URIError', 'AggregateError', 'RegExp', 'Function', 'ArrayBuffer',
  'SharedArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array',
  'Uint32Array', 'Uint8ClampedArray', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'NaN', 'Infinity', 'undefined', 'globalThis',
  'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
  'escape', 'unescape', 'eval', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'requestAnimationFrame',
  'cancelAnimationFrame', 'queueMicrotask',
  'window', 'document', 'navigator', 'localStorage', 'sessionStorage',
  'fetch', 'Response', 'Request', 'URL', 'URLSearchParams', 'FormData',
  'HTMLElement', 'Event', 'CustomEvent', 'Node', 'Element',
  'alert', 'confirm', 'prompt', 'atob', 'btoa',
  'performance', 'crypto', 'Proxy', 'Reflect', 'Iterator',
  'AbortController', 'AbortSignal', 'Blob', 'File', 'FileReader',
  'Image', 'Audio', 'WebSocket', 'Worker', 'MessageChannel',
  'Notification', 'IntersectionObserver', 'MutationObserver',
  'ResizeObserver', 'MediaQueryList',
])

// Rule: Undefined variable
const undefinedVariableRule: Rule = {
  id: 'undefined-variable',
  name: 'Undefined Variable',
  description: 'Variable is used before being defined',
  severity: 'warning',
  check: ({ ast }: { ast: ESTreeAST; source: string }): Diagnostic[] => {
    const diagnostics: Diagnostic[] = []
    const declaredVariables = new Set<string>()
    const parentMap = new Map<ESTreeNode, ESTreeNode | null>()

    // Build parent map and collect declarations
    const buildParentMap = (node: ESTreeNode, parent: ESTreeNode | null) => {
      if (!node || typeof node !== 'object') return
      parentMap.set(node, parent)
      for (const key in node) {
        if (key === 'type' || key === 'loc') continue
        const child = node[key as keyof typeof node]
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object') buildParentMap(item as ESTreeNode, node)
          }
        } else if (child && typeof child === 'object' && (child as ESTreeNode).type) {
          buildParentMap(child as ESTreeNode, node)
        }
      }
    }

    if (ast.program) {
      buildParentMap(ast.program as unknown as ESTreeNode, null)
    }

    // First pass: collect all declared variables and scope-relevant nodes
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
      },
      FunctionDeclaration: (node: ESTreeNode) => {
        const id = node.id as ESTreeNode & { name?: string } | undefined
        if (id?.name) declaredVariables.add(id.name)
        // Collect function parameters
        const params = node.params as ESTreeNode[] | undefined
        if (params) {
          for (const param of params) {
            collectBindingNames(param, declaredVariables)
          }
        }
      },
      FunctionExpression: (node: ESTreeNode) => {
        const params = node.params as ESTreeNode[] | undefined
        if (params) {
          for (const param of params) {
            collectBindingNames(param, declaredVariables)
          }
        }
      },
      ArrowFunctionExpression: (node: ESTreeNode) => {
        const params = node.params as ESTreeNode[] | undefined
        if (params) {
          for (const param of params) {
            collectBindingNames(param, declaredVariables)
          }
        }
      },
      CatchClause: (node: ESTreeNode) => {
        const param = node.param as ESTreeNode & { name?: string } | undefined
        if (param?.name) declaredVariables.add(param.name)
      },
      ForOfStatement: (node: ESTreeNode) => {
        const left = node.left as ESTreeNode
        if (left) collectBindingNames(left, declaredVariables)
      },
      ForInStatement: (node: ESTreeNode) => {
        const left = node.left as ESTreeNode
        if (left) collectBindingNames(left, declaredVariables)
      },
      ClassDeclaration: (node: ESTreeNode) => {
        const id = node.id as ESTreeNode & { name?: string } | undefined
        if (id?.name) declaredVariables.add(id.name)
      },
      ImportDeclaration: (node: ESTreeNode) => {
        const specifiers = node.specifiers as ESTreeNode[] | undefined
        if (specifiers) {
          for (const spec of specifiers) {
            const local = spec.local as ESTreeNode & { name?: string } | undefined
            if (local?.name) declaredVariables.add(local.name)
          }
        }
      },
    })

    // Second pass: check for undefined variables, skipping property accesses
    RuleEngine.walkAST(ast, {
      Identifier: (node: ESTreeNode) => {
        const identifier = node as ESTreeNode & { name?: string }
        if (!identifier.name || !identifier.loc) return
        if (declaredVariables.has(identifier.name)) return
        if (JS_BUILTINS.has(identifier.name)) return

        // Skip if this identifier is a property access (e.g., obj.prop)
        const parent = parentMap.get(node)
        if (parent?.type === 'MemberExpression' && (parent as ESTreeNode & { property?: ESTreeNode }).property === node && !(parent as ESTreeNode & { computed?: boolean }).computed) {
          return
        }

        // Skip if this is an object key in ObjectExpression
        if (parent?.type === 'Property' && (parent as ESTreeNode & { key?: ESTreeNode }).key === node && !(parent as ESTreeNode & { computed?: boolean }).computed) {
          return
        }

        // Skip identifiers that are shorthand property values
        if (parent?.type === 'Property' && (parent as ESTreeNode & { shorthand?: boolean }).shorthand) {
          return
        }

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
      },
    })

    return diagnostics
  }
}

function collectBindingNames(pattern: ESTreeNode, set: Set<string>) {
  if (!pattern || typeof pattern !== 'object') return
  if (pattern.type === 'Identifier') {
    const id = pattern as ESTreeNode & { name?: string }
    if (id.name) set.add(id.name)
  } else if (pattern.type === 'ObjectPattern') {
    const properties = pattern.properties as ESTreeNode[] | undefined
    if (properties) {
      for (const prop of properties) {
        if ((prop as ESTreeNode & { type?: string }).type === 'RestElement') {
          collectBindingNames(prop as ESTreeNode, set)
        } else {
          const value = (prop as ESTreeNode & { value?: ESTreeNode }).value
          if (value) collectBindingNames(value, set)
        }
      }
    }
  } else if (pattern.type === 'ArrayPattern') {
    const elements = pattern.elements as (ESTreeNode | null)[] | undefined
    if (elements) {
      for (const el of elements) {
        if (el) collectBindingNames(el, set)
      }
    }
  } else if (pattern.type === 'RestElement' || pattern.type === 'AssignmentPattern') {
    const arg = (pattern as ESTreeNode & { argument?: ESTreeNode }).argument
    if (arg) collectBindingNames(arg, set)
  }
}

// Register all rules after their definitions
RuleEngine.registerRule(requireSemicolonsRule)
RuleEngine.registerRule(requireAssignmentOperatorRule)
RuleEngine.registerRule(noVarRule)
RuleEngine.registerRule(constReassignmentRule)
RuleEngine.registerRule(undefinedVariableRule)
