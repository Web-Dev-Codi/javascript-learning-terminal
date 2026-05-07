# Challenge Validation System

## Problem
34 challenges exist across the app but none have validation. Users can run code and see output but never get told if they solved the challenge correctly.

## Design: Hybrid AST + Output Validation

No backend changes. All validation runs client-side after execution completes.

### Types (src/types/lesson.ts)

```typescript
interface ChallengeSection {
  // ... existing fields
  expectedOutput?: string[]
  codeChecks?: CodeCheck[]
}

type CodeCheck =
  | { type: 'declares-const'; name: string; description: string }
  | { type: 'declares-let'; name: string; description: string }
  | { type: 'declares-function'; name: string; description: string }
  | { type: 'uses-if'; description: string }
  | { type: 'has-return'; description: string }
  | { type: 'contains-string'; text: string; description: string }
  | { type: 'custom'; description: string; check: string }
```

### New file: src/components/checker/challengeValidator.ts

Exports `validateChallenge(code, output, checks)` returning `ValidationResult[]`.

- **AST checks**: Parse code with babel, walk AST using existing `walkAST` utility
- **Output checks**: Compare captured console output lines against expected patterns (substring match)
- **Custom checks**: `new Function(code)` for arbitrary validation logic

### Wiring in EditorPanel.tsx

After `done` event fires, call `validateChallenge()`. Display results:
- All pass -> console `pass` message + `markLessonCompleted()`
- Some fail -> console `fail` messages showing what's missing

### First challenge populated: 01-a-let-const

```typescript
expectedOutput: ["SYNTHSCRIPT", "3"],
codeChecks: [
  { type: 'declares-const', name: 'gameName', description: 'Declare gameName as a const' },
  { type: 'declares-let', name: 'lives', description: 'Declare lives as a let' },
]
```

### Files changed

| File | Change |
|------|--------|
| src/types/lesson.ts | Add `CodeCheck` type + `expectedOutput`, `codeChecks` to `ChallengeSection` |
| src/components/checker/challengeValidator.ts | **New** — validation logic with AST + output checks |
| src/components/editor/EditorPanel.tsx | Wire validation into run flow after `done` event |
| src/data/lessons.ts | Add validation data for challenge-01 |

### What stays the same

Console panel already has `pass`/`fail` styles. `markLessonCompleted` already exists. No backend changes. No WebSocket changes. No new dependencies.
