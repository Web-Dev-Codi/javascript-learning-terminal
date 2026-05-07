import { describe, it, expect } from 'vitest'
import { validateChallenge } from '../checker/challengeValidator'
import type { CodeCheck } from '../../types/lesson'

describe('EditorPanel validation integration', () => {
  it('validates challenge-01 correct solution', () => {
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
  })

  it('shows descriptive failures for missing output', () => {
    const code = `const gameName = "SYNTHSCRIPT";
let lives = 3;
console.log(gameName);
console.log(lives);`
    const output: string[] = []
    const checks: CodeCheck[] = [
      { type: 'declares-const', name: 'gameName', description: 'Declare gameName as const' },
    ]
    const results = validateChallenge(code, output, checks, ['SYNTHSCRIPT'])
    const outputResult = results.find(r => r.description.includes('SYNTHSCRIPT'))
    expect(outputResult?.pass).toBe(false)
    expect(outputResult?.message).toContain('not found in console output')
  })

  it('validates without codeChecks when only expectedOutput is provided', () => {
    const code = 'console.log("hello");'
    const output = ['hello']
    const results = validateChallenge(code, output, undefined, ['hello'])
    expect(results[0].pass).toBe(true)
  })

  it('validates without expectedOutput when only codeChecks are provided', () => {
    const code = 'let x = 5;'
    const checks: CodeCheck[] = [
      { type: 'declares-let', name: 'x', description: 'Declare x as let' },
    ]
    const results = validateChallenge(code, [], checks, undefined)
    expect(results[0].pass).toBe(true)
  })
})
