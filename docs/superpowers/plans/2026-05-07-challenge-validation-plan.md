# Challenge Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate user code against challenge requirements (AST structure + expected output) and display pass/fail results.

**Architecture:** Client-side only. New `challengeValidator.ts` uses babel parser + existing `walkAST` for AST checks, and compares console output for output checks. Wired into `EditorPanel.handleRun()` after code execution completes.

**Tech Stack:** TypeScript, babel/parser, existing walkAST utility, Zustand stores

---

### Task 1: Set up vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 2: Add test script to package.json**

Edit `package.json` to add `"test": "vitest run"` and `"test:watch": "vitest"` to the `scripts` section.

- [ ] **Step 3: Verify vitest works**

Run: `npx vitest run`
Expected: No test files found, exits cleanly (not an error)

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "test: add vitest config and test script"
```

---

### Task 2: Add CodeCheck types to lesson.ts

**Files:**
- Modify: `src/types/lesson.ts`

- [ ] **Step 1: Read the current types file**

Read `src/types/lesson.ts` to see the current `ChallengeSection` and understand where to add new types.

- [ ] **Step 2: Add CodeCheck type and update ChallengeSection**

Add after `ChallengeTest` definition:

```typescript
export type CodeCheck =
  | { type: 'declares-const'; name: string; description: string }
  | { type: 'declares-let'; name: string; description: string }
  | { type: 'declares-function'; name: string; description: string }
  | { type: 'uses-if'; description: string }
  | { type: 'has-return'; description: string }
  | { type: 'contains-string'; text: string; description: string }
  | { type: 'custom'; description: string; check: string }

export interface ValidationResult {
  pass: boolean
  description: string
  message: string
}
```

Add to `ChallengeSection`:
```typescript
  tests?: ChallengeTest[]
  expectedOutput?: string[]
  codeChecks?: CodeCheck[]
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (or the existing build check)
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/types/lesson.ts
git commit -m "feat: add CodeCheck and ValidationResult types"
```

---

### Task 3: Implement challengeValidator.ts (TDD)

**Files:**
- Create: `src/components/checker/challengeValidator.ts`
- Create: `src/components/checker/challengeValidator.test.ts`

- [ ] **Step 1: Write the failing test for AST checks**

```typescript
// src/components/checker/challengeValidator.test.ts
import { describe, it, expect } from 'vitest'
import { validateChallenge } from './challengeValidator'
import type { CodeCheck } from '../../types/lesson'

describe('validateChallenge', () => {
  describe('AST checks', () => {
    it('detects declares-const with correct name', () => {
      const code = 'const gameName = "SYNTHSCRIPT";\nconsole.log(gameName);'
      const checks: CodeCheck[] = [
        { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
      ]
      const results = validateChallenge(code, [], checks)
      expect(results[0].pass).toBe(true)
    })

    it('fails when declares-const name is missing', () => {
      const code = 'const lives = 3;\nconsole.log(lives);'
      const checks: CodeCheck[] = [
        { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
      ]
      const results = validateChallenge(code, [], checks)
      expect(results[0].pass).toBe(false)
    })

    it('detects declares-let with correct name', () => {
      const code = 'let lives = 3;\nconsole.log(lives);'
      const checks: CodeCheck[] = [
        { type: 'declares-let', name: 'lives', description: 'Declare lives as let' },
      ]
      const results = validateChallenge(code, [], checks)
      expect(results[0].pass).toBe(true)
    })

    it('fails when declares-let name is missing', () => {
      const code = 'const gameName = "SYNTHSCRIPT";\nconsole.log(gameName);'
      const checks: CodeCheck[] = [
        { type: 'declares-let', name: 'lives', description: 'Declare lives as let' },
      ]
      const results = validateChallenge(code, [], checks)
      expect(results[0].pass).toBe(false)
    })
  })

  describe('output checks', () => {
    it('passes when all expected output lines are present', () => {
      const output = ['SYNTHSCRIPT', '3']
      const results = validateChallenge('', output, [], ['SYNTHSCRIPT', '3'])
      expect(results.every(r => r.pass)).toBe(true)
    })

    it('fails when expected output is missing', () => {
      const output = ['SYNTHSCRIPT']
      const results = validateChallenge('', output, [], ['SYNTHSCRIPT', '3'])
      expect(results.some(r => !r.pass)).toBe(true)
    })
  })

  describe('combined checks', () => {
    it('passes when both AST and output are correct', () => {
      const code = 'const gameName = "SYNTHSCRIPT";\nlet lives = 3;\nconsole.log(gameName);\nconsole.log(lives);'
      const output = ['SYNTHSCRIPT', '3']
      const checks: CodeCheck[] = [
        { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
        { type: 'declares-let', name: 'lives', description: 'Declare lives as let' },
      ]
      const results = validateChallenge(code, output, checks, ['SYNTHSCRIPT', '3'])
      expect(results.every(r => r.pass)).toBe(true)
    })

    it('fails with descriptive message for missing output', () => {
      const code = 'const gameName = "SYNTHSCRIPT";\nlet lives = 3;\nconsole.log(gameName);\nconsole.log(lives);'
      const output: string[] = []
      const checks: CodeCheck[] = [
        { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
      ]
      const results = validateChallenge(code, output, checks, ['SYNTHSCRIPT'])
      const outputResult = results.find(r => r.description === 'Output should contain: "SYNTHSCRIPT"')
      expect(outputResult?.pass).toBe(false)
      expect(outputResult?.message).toContain('not found in console output')
    })

    it('handles empty code gracefully', () => {
      const results = validateChallenge('', [], [], [])
      expect(Array.isArray(results)).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/checker/challengeValidator.test.ts`
Expected: ERROR — module not found

- [ ] **Step 3: Write minimal challengeValidator.ts**

```typescript
// src/components/checker/challengeValidator.ts
import { parse } from '@babel/parser'
import type { CodeCheck, ValidationResult } from '../../types/lesson'
import { walkAST } from './ruleEngine'
import type { ESTreeAST, ESTreeNode } from './ruleEngine'

function parseCode(code: string): ESTreeAST | null {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    }) as unknown as ESTreeAST
    return ast
  } catch {
    return null
  }
}

function checkDeclaresConst(node: ESTreeNode, targetName: string): boolean {
  if (node.type !== 'VariableDeclaration') return false
  if (node.kind !== 'const') return false
  const decls = node.declarations as ESTreeNode[] | undefined
  if (!decls) return false
  return decls.some(d => {
    const id = d.id as ESTreeNode & { name?: string }
    return id?.name === targetName
  })
}

function checkDeclaresLet(node: ESTreeNode, targetName: string): boolean {
  if (node.type !== 'VariableDeclaration') return false
  if (node.kind !== 'let') return false
  const decls = node.declarations as ESTreeNode[] | undefined
  if (!decls) return false
  return decls.some(d => {
    const id = d.id as ESTreeNode & { name?: string }
    return id?.name === targetName
  })
}

function checkDeclaresFunction(node: ESTreeNode, targetName: string): boolean {
  if (node.type !== 'FunctionDeclaration') return false
  const id = node.id as ESTreeNode & { name?: string }
  return id?.name === targetName
}

function checkUsesIf(node: ESTreeNode): boolean {
  return node.type === 'IfStatement'
}

function checkHasReturn(node: ESTreeNode): boolean {
  return node.type === 'ReturnStatement'
}

function checkContainsString(source: string, text: string): boolean {
  return source.includes(text)
}

export function validateChallenge(
  code: string,
  consoleOutput: string[],
  codeChecks?: CodeCheck[],
  expectedOutput?: string[],
): ValidationResult[] {
  const results: ValidationResult[] = []

  if (codeChecks) {
    const ast = parseCode(code)

    for (const check of codeChecks) {
      switch (check.type) {
        case 'declares-const': {
          let found = false
          if (ast) {
            walkAST(ast, {
              VariableDeclaration: (node: ESTreeNode) => {
                if (checkDeclaresConst(node, check.name)) found = true
              },
            })
          }
          results.push({
            pass: found,
            description: check.description,
            message: found
              ? `${check.name} declared as const`
              : `Expected const '${check.name}' but it was not found. Make sure to use: const ${check.name} = value;`,
          })
          break
        }

        case 'declares-let': {
          let found = false
          if (ast) {
            walkAST(ast, {
              VariableDeclaration: (node: ESTreeNode) => {
                if (checkDeclaresLet(node, check.name)) found = true
              },
            })
          }
          results.push({
            pass: found,
            description: check.description,
            message: found
              ? `${check.name} declared as let`
              : `Expected let '${check.name}' but it was not found. Make sure to use: let ${check.name} = value;`,
          })
          break
        }

        case 'declares-function': {
          let found = false
          if (ast) {
            walkAST(ast, {
              FunctionDeclaration: (node: ESTreeNode) => {
                if (checkDeclaresFunction(node, check.name)) found = true
              },
            })
          }
          results.push({
            pass: found,
            description: check.description,
            message: found
              ? `Function ${check.name} declared`
              : `Expected function '${check.name}' but it was not found.`,
          })
          break
        }

        case 'uses-if': {
          let found = false
          if (ast) {
            walkAST(ast, {
              IfStatement: () => { found = true },
            })
          }
          results.push({
            pass: found,
            description: check.description,
            message: found ? 'if statement found' : 'Expected an if statement but none was found.',
          })
          break
        }

        case 'has-return': {
          let found = false
          if (ast) {
            walkAST(ast, {
              ReturnStatement: () => { found = true },
            })
          }
          results.push({
            pass: found,
            description: check.description,
            message: found ? 'return statement found' : 'Expected a return statement but none was found.',
          })
          break
        }

        case 'contains-string': {
          const found = checkContainsString(code, check.text)
          results.push({
            pass: found,
            description: check.description,
            message: found
              ? `Found "${check.text}" in code`
              : `Expected to find "${check.text}" in your code but it was missing.`,
          })
          break
        }

        default: {
          // TypeScript exhaustiveness check via never
          const _exhaustive: never = check
          break
        }
      }
    }
  }

  if (expectedOutput) {
    for (const expected of expectedOutput) {
      const found = consoleOutput.some(line => line.includes(expected))
      results.push({
        pass: found,
        description: `Output should contain: "${expected}"`,
        message: found
          ? `Found "${expected}" in console output`
          : `Expected "${expected}" in console output but it was not found. Check that your console.log statements are correct.`,
      })
    }
  }

  return results
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/checker/challengeValidator.test.ts`
Expected: 8 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/checker/challengeValidator.ts src/components/checker/challengeValidator.test.ts
git commit -m "feat: implement challengeValidator with AST + output checks"
```

---

### Task 4: Wire validation into EditorPanel

**Files:**
- Modify: `src/components/editor/EditorPanel.tsx`

- [ ] **Step 1: Read current EditorPanel.tsx**

Read the full file to understand the current `handleRun` flow.

- [ ] **Step 2: Update handleRun to validate after execution**

Import the validator and run it after the `done` event. Add state for collected console output and challenge validation results.

Key changes:

```typescript
import { validateChallenge } from "../checker/challengeValidator";
import type { ChallengeSection, ValidationResult } from "../../types/lesson";
```

In the component body, add:
```typescript
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
```

Inside `handleRun`, before calling `runCode`:
```typescript
    setValidationResults([]);
```

Inside the `onEvent` callback, add to the `stdout` case to collect output (store in a ref):
```typescript
      const consoleOutputRef = useRef<string[]>([]);
      // In handleRun:
      consoleOutputRef.current = [];
      // In stdout case:
      case "stdout":
        consoleOutputRef.current.push(event.data.message ?? "");
        addConsoleMessage("log", event.data.message ?? "");
        break;
```

In the `done` case, after the existing handling:
```typescript
      case "done":
        // Existing code...
        if (event.data.success) {
          addConsoleMessage("info", `✓ Code executed (${event.data.runtimeMs ?? 0}ms)`);
          
          // Challenge validation
          const lesson = activeLesson ? findLessonById(activeLesson) : null;
          const challengeSection = lesson?.sections?.find(
            (s): s is ChallengeSection => s.type === "challenge"
          );
          if (challengeSection?.codeChecks || challengeSection?.expectedOutput) {
            const currentCode = getCurrentCode();
            const results = validateChallenge(
              currentCode,
              consoleOutputRef.current,
              challengeSection.codeChecks,
              challengeSection.expectedOutput,
            );
            setValidationResults(results);
            
            const allPass = results.every(r => r.pass);
            if (allPass) {
              addConsoleMessage("pass", "✓ Challenge completed! All checks passed.");
              lessonStore.markLessonCompleted(activeLesson ?? "");
            } else {
              addConsoleMessage("fail", "✕ Some checks failed. See details below.");
              const failed = results.filter(r => !r.pass);
              for (const result of failed) {
                addConsoleMessage("fail", `  • ${result.description}: ${result.message}`);
              }
            }
          }
        }
        break;
```

Show validation results in the FeedbackPanel area (or just rely on console messages for now — simplest path).

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Write a test for the full validation flow**

Add to `challengeValidator.test.ts`:

```typescript
it('validates the challenge-01 scenario end-to-end', () => {
  const code = `const gameName = "SYNTHSCRIPT";
let lives = 3;
console.log(gameName);
console.log(lives);`
  const output = ['SYNTHSCRIPT', '3']
  const checks: CodeCheck[] = [
    { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
    { type: 'declares-let', name: 'lives', description: 'Declare lives as let' },
  ]
  const results = validateChallenge(code, output, checks, ['SYNTHSCRIPT', '3'])
  expect(results.every(r => r.pass)).toBe(true)
  expect(results).toHaveLength(4)
})

it('reports specific failures for challenge-01 starter code', () => {
  // Starter code: const gameName (no value), let lives (no value)
  const code = `// Declare gameName as a const
const gameName

// Declare lives as a let
let lives

console.log(gameName);
console.log(lives);`
  const output: string[] = []
  const checks: CodeCheck[] = [
    { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
    { type: 'declares-let', name: 'lives', description: 'Declare lives as let' },
  ]
  const results = validateChallenge(code, output, checks, ['SYNTHSCRIPT', '3'])
  expect(results[0].pass).toBe(true)  // declares const gameName — yes
  expect(results[1].pass).toBe(true)  // declares let lives — yes
  expect(results[2].pass).toBe(false) // output SYNTHSCRIPT — no
  expect(results[3].pass).toBe(false) // output 3 — no
})
```

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/editor/EditorPanel.tsx src/components/checker/challengeValidator.test.ts
git commit -m "feat: wire challenge validation into EditorPanel run flow"
```

---

### Task 5: Add validation data to challenge-01

**Files:**
- Modify: `src/data/lessons.ts`

- [ ] **Step 1: Find challenge-01 in lessons.ts**

Search for `'challenge-01'` in `src/data/lessons.ts`.

- [ ] **Step 2: Add expectedOutput and codeChecks**

Add to the challenge section object:
```typescript
            expectedOutput: ['SYNTHSCRIPT', '3'],
            codeChecks: [
              { type: 'declares-const', name: 'gameName', description: 'Declare gameName as a const' },
              { type: 'declares-let', name: 'lives', description: 'Declare lives as a let' },
            ],
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/data/lessons.ts
git commit -m "feat: add validation data to challenge-01 (let vs const)"
```

---

### Task 6: Add validation data to challenge-02 (naming)

**Files:**
- Modify: `src/data/lessons.ts`

- [ ] **Step 1: Find challenge-02 in lessons.ts**

Search for `'challenge-02'` in `src/data/lessons.ts`.

- [ ] **Step 2: Add validation data**

```typescript
            expectedOutput: ['10', 'Brian', '500'],
            codeChecks: [
              {
                type: 'contains-string',
                text: 'maxLevel',
                description: 'Rename max_level to camelCase maxLevel',
              },
              {
                type: 'contains-string',
                text: 'playerName',
                description: 'Rename Player_Name to camelCase playerName',
              },
              {
                type: 'contains-string',
                text: 'currentScore',
                description: 'Rename CURRENT_score to camelCase currentScore',
              },
            ],
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/data/lessons.ts
git commit -m "feat: add validation data to challenge-02 (naming)"
```

---

### Task 7: Add validation data to challenge-03 (reassignment)

**Files:**
- Modify: `src/data/lessons.ts`

- [ ] **Step 1: Find challenge-03 in lessons.ts**

Search for `'challenge-03'` in `src/data/lessons.ts`.

- [ ] **Step 2: Add validation data**

```typescript
            expectedOutput: ['Final health: 90'],
            codeChecks: [
              {
                type: 'contains-string',
                text: '- 30',
                description: 'Subtract 30 damage from health',
              },
              {
                type: 'contains-string',
                text: '+ 20',
                description: 'Add 20 health from potion',
              },
            ],
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Write test for new check types**

Add to `challengeValidator.test.ts`:

```typescript
describe('contains-string check', () => {
  it('passes when code contains the target string', () => {
    const code = 'health = health - 30;'
    const checks: CodeCheck[] = [
      { type: 'contains-string', text: '- 30', description: 'Subtract 30' },
    ]
    const results = validateChallenge(code, [], checks)
    expect(results[0].pass).toBe(true)
  })

  it('fails when code does not contain the target string', () => {
    const code = 'health = health + 20;'
    const checks: CodeCheck[] = [
      { type: 'contains-string', text: '- 30', description: 'Subtract 30' },
    ]
    const results = validateChallenge(code, [], checks)
    expect(results[0].pass).toBe(false)
  })
})
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/data/lessons.ts src/components/checker/challengeValidator.test.ts
git commit -m "feat: add validation data to challenge-03 (reassignment)"
```

---

### Task 8: Lint and final verification

**Files:** (none — just running commands)

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors (or fix any reported)

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 4: Final commit if needed**

```bash
git add -A
git commit -m "chore: fix lint and type issues"
```
