# Challenge Validation Data — Batch 2 (Lessons 02-11)

**Goal:** Add `expectedOutput` and `codeChecks` to all 31 remaining challenges in `src/data/lessons.ts`.

## Approach

Add validation data to each challenge section. Run-as-is challenges get `expectedOutput` only. Write-code challenges get both.

## Edits

All edits target `src/data/lessons.ts`. Each edit appends after the `hints` array `]` and before the closing `},` of the challenge object.

### 1. 02-a-strings (line ~313)

```typescript
            hints: [
              'Template literals use backticks: `text here`',
              'Embed variables with ${variableName}',
              'Result should be: Player: Brian Schmidt — Level 7'
            ],
            expectedOutput: ['Player: Brian Schmidt — Level 7'],
            codeChecks: [
              { type: 'contains-string', text: '`Player:', description: 'Use a template literal with backticks' },
            ],
```

### 2. 02-b-numbers (line ~366)

```typescript
            hints: [
              'Remaining seconds: use modulo % — totalSeconds % 60, then Math.floor it',
              'Math.floor(137.6 / 60) = 2 minutes',
              'Math.floor(137.6 % 60) = 17 seconds'
            ],
            expectedOutput: ['Minutes: 2', 'Seconds: 17'],
            codeChecks: [
              { type: 'contains-string', text: '%', description: 'Use modulo % to get remaining seconds' },
            ],
```

### 3. 02-c-booleans (line ~416)

```typescript
            hints: ['Run this as-is first — it should work!', 'Notice that "0" (string) is truthy but 0 (number) is falsy'],
            expectedOutput: ['0 => false', 'hello => true', '42 => true', '0 => true'],
```

### 4. 02-e-typeof (line ~496)

```typescript
            hints: ['typeof val gives you the type string', 'Use a template literal to build the message', 'null will show "object" — that is the expected quirk'],
            expectedOutput: [
              'The value 42 is of type number',
              'The value hello is of type string',
              'The value true is of type boolean',
              'The value null is of type object',
            ],
```

### 5. 03-a-arithmetic (line ~571)

```typescript
            hints: ['totalXP = (baseXP * difficulty) + bonus', 'Use parentheses to make the order clear', 'Expected result: 750'],
            expectedOutput: ['Total XP: 750'],
            codeChecks: [
              { type: 'contains-string', text: '*', description: 'Multiply baseXP by difficulty' },
            ],
```

### 6. 03-c-comparison (line ~664)

```typescript
            hints: ['Use > to compare which is higher', 'areEqual should be false', 'aIsHigher should be false since 8500 < 9000'],
            expectedOutput: ['Equal: false', 'A is higher: false'],
            codeChecks: [
              { type: 'contains-string', text: '>', description: 'Use > to compare scores' },
            ],
```

### 7. 04-a-semicolons (line ~792)

```typescript
            hints: ['Every statement should end with ;', 'There are 5 statements that need semicolons', 'The last line needs one too'],
            expectedOutput: ['Brian: 50%'],
```

### 8. 05-a-arithmetic-ops (line ~952)

```typescript
            hints: ['Just run it — this one works as starter code', 'Try converting to a loop in scratch.js for bonus practice'],
            expectedOutput: ['Lap: 1', 'Lap: 5'],
```

### 9. 05-c-comparison-ops (line ~1033)

```typescript
            hints: ['hasEnoughLevel: level >= 5', 'canUnlock uses && to combine both conditions', 'With level=4, canUnlock should be false'],
            expectedOutput: ['Can unlock bonus stage: false'],
            codeChecks: [
              { type: 'contains-string', text: '>= 5', description: 'Check level >= 5 using comparison' },
            ],
```

### 10. 05-e-ternary (line ~1126)

```typescript
            hints: ['This one is complete — run it and then try changing temp to test other ranges'],
            expectedOutput: ['18°C is mild'],
```

### 11. 06-a-if (line ~1206)

```typescript
            hints: ['if (condition) { ... }', 'condition: playerScore > 10000', 'Log "High score!" inside the block'],
            expectedOutput: ['High score!'],
            codeChecks: [
              { type: 'uses-if', description: 'Use an if statement' },
            ],
```

### 12. 06-b-else (line ~1254)

```typescript
            hints: ['This one is complete — run it', 'Try changing number to 4 to see the even branch'],
            expectedOutput: ['17 is odd'],
```

### 13. 06-c-else-if (line ~1312)

```typescript
            hints: ['Fill in the Gold and Diamond branches', '750 XP should output Silver', '5000+ should output Diamond'],
            expectedOutput: ['Silver'],
            codeChecks: [
              { type: 'contains-string', text: 'console.log("Gold")', description: 'Add log for Gold rank' },
              { type: 'contains-string', text: 'console.log("Diamond")', description: 'Add log for Diamond rank' },
            ],
```

### 14. 06-d-switch (line ~1394)

```typescript
            hints: ['Each case needs a return statement (return works like break in a function)', 'case 404: return "Not Found";', 'default: return "Unknown";'],
            expectedOutput: ['OK', 'Not Found', 'Server Error', 'Unknown'],
            codeChecks: [
              { type: 'contains-string', text: 'return "Not Found"', description: 'Return "Not Found" for 404' },
              { type: 'contains-string', text: 'return "Unknown"', description: 'Return "Unknown" as default' },
            ],
```

### 15. 07-a-for (line ~1506)

```typescript
            hints: ['result = 7 * i', 'The loop goes from i=1 to i=10 inclusive'],
            expectedOutput: ['7 × 1 = 7', '7 × 10 = 70'],
            codeChecks: [
              { type: 'contains-string', text: '7 * i', description: 'Multiply 7 by i inside the loop' },
            ],
```

### 16. 07-b-while (line ~1561)

```typescript
            hints: ['This is complete — run it', 'Try changing withdrawal to see different results'],
            expectedOutput: ['Remaining balance: €850', 'Insufficient funds. Final balance: €100'],
```

### 17. 07-d-for-of (line ~1646)

```typescript
            hints: ['This is complete — run it', 'Try adding more numbers to the array'],
            expectedOutput: ['Total: 133'],
```

### 18. 07-f-break-continue (line ~1728)

```typescript
            hints: ['This is complete — run it and verify the output', 'Should log: 1, 2, 4, 5, 7, 8, 10, 11, 13, 14'],
            expectedOutput: ['1', '2', '4', '5', '7', '8', '10', '11', '13', '14'],
```

### 19. 08-a-declarations (line ~1803)

```typescript
            hints: ['Math.PI is the built-in pi constant', 'radius ** 2 squares the radius', 'toFixed(2) rounds to 2 decimal places'],
            expectedOutput: ['Area: 78.54'],
```

### 20. 08-c-arrow-fns (line ~1901)

```typescript
            hints: [
              'const square = x => x * x;',
              'const isEven = n => n % 2 === 0;',
              'const greet = name => `Hi, ${name}!`;'
            ],
            expectedOutput: ['25', 'true', 'Hi, Sam!'],
            codeChecks: [
              { type: 'contains-string', text: '=>', description: 'Use arrow function syntax' },
            ],
```

### 21. 08-e-return (line ~1983)

```typescript
            hints: ['This is complete — run it', 'Early returns handle the edge cases cleanly'],
            expectedOutput: ['5', '0', '10'],
```

### 22. 08-f-defaults-rest (line ~2027)

```typescript
            hints: ['This is complete — run it', 'undefined as first arg triggers the default'],
            expectedOutput: ['Hi, Brian!', 'Hi, Alex!', 'Hi, Sam!', 'Hello, Merlin!'],
```

### 23. 09-b-function-scope (line ~2142)

```typescript
            hints: ['Each function call gets a fresh count=0', 'To persist count across calls you need a closure (next lesson)'],
            expectedOutput: ['1', '1', '1'],
```

### 24. 09-d-closures (line ~2244)

```typescript
            hints: ['This is complete — run it', 'Each call to makeMultiplier creates a new closure with its own factor'],
            expectedOutput: ['10', '15', '20'],
```

### 25. 10-a-array-basics (line ~2357)

```typescript
            hints: ['This is complete — run it and change the games array'],
            expectedOutput: ['First: Zelda', 'Last: Doom', 'Middle: Minecraft'],
```

### 26. 10-c-array-iteration (line ~2443)

```typescript
            hints: ['This is complete — run it and verify', 'Chain: filter → map → reduce'],
            expectedOutput: ['Result: 240'],
```

### 27. 10-d-object-basics (line ~2500)

```typescript
            hints: ['toLocaleString() formats numbers with commas', 'Access properties with dot notation inside the template literal'],
            expectedOutput: ['2019 Toyota Corolla — 45,000 miles'],
```

### 28. 10-e-object-methods (line ~2538)

```typescript
            hints: ['Object.entries returns [key, value] pairs', 'Destructure each pair in the for...of: [key, value]'],
            expectedOutput: ['fps = 60', 'resolution = 1080p', 'fullscreen = true'],
```

### 29. 10-f-destructuring (line ~2593)

```typescript
            hints: ['This is complete — run it', 'Destructure nested objects in two separate statements or use nested destructuring'],
            expectedOutput: ['200', 'Brian', '9500'],
```

### 30. 11-d-then-catch (line ~2797)

```typescript
            hints: ['This is complete — run it', 'Each .then() receives the return value of the previous one'],
            expectedOutput: ['Result: 42'],
```

### 31. 11-f-error-handling (line ~2898)

```typescript
            hints: ['This is complete — run it', 'true → success path, false → catch path'],
            expectedOutput: ['Operation successful!', 'Handled: Operation failed!'],
```

## Verification

Run these commands after edits:
```bash
npx vitest run          # 21 tests must pass
npx tsc -p tsconfig.app.json --noEmit   # only pre-existing useEditor.ts error
npm run lint            # 0 errors (pre-existing warning OK)
```

## Commit

```bash
git add src/data/lessons.ts
git commit -m "feat: add validation data to lessons 02-11 (31 challenges)"
```
