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
