import type { Lesson } from '../types/lesson'

export const lessons: Lesson[] = [

  /* ══════════════════════════════════════════
     01 — VARIABLES & VALUES
  ══════════════════════════════════════════ */
  {
    id: '01-variables-values',
    title: 'Variables & Values',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'fundamentals',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'Welcome to SYNTHSCRIPT! Before writing any useful JavaScript you need somewhere to store data. That storage container is called a **variable**.\n\nIn this lesson you will learn how to declare variables, assign values to them, and understand the difference between `let` and `const`. Sub-lessons dive into naming conventions and how values can change over time.'
      },
      {
        type: 'quiz',
        question: 'Which keyword should you use when a value will never change?',
        options: ['var', 'let', 'const', 'set'],
        correctIndex: 2,
        explanation: '`const` declares a constant — a variable whose binding cannot be reassigned after declaration. Use `let` when you need to change the value later.'
      }
    ],
    subLessons: [
      {
        id: '01-a-let-const',
        title: 'let vs const',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '01-variables-values',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: '`let` declares a variable whose value **can** be reassigned later. Use it whenever the data will change — a score that goes up, a counter that increments, a name the user edits.\n\n`const` declares a variable whose **binding** is fixed. You must assign a value immediately and you cannot point the name at a different value afterwards. Prefer `const` by default; only reach for `let` when you know a reassignment is coming.'
          },
          {
            type: 'code-example',
            label: 'let — mutable binding',
            code: `let score = 0;
console.log(score);  // 0

score = 100;
console.log(score);  // 100`
          },
          {
            type: 'code-example',
            label: 'const — fixed binding',
            code: `const MAX_LEVEL = 99;
console.log(MAX_LEVEL);  // 99

MAX_LEVEL = 50;  // ← TypeError: Assignment to constant variable`
          },
          {
            type: 'quiz',
            question: 'When should you use `let` instead of `const`?',
            options: [
              'When you want a global variable',
              'When the value will be reassigned after declaration',
              'When the variable holds a string',
              'Always — let is safer'
            ],
            correctIndex: 1,
            explanation: 'Use `let` when you know the value will change. For everything else, `const` signals to the next developer that this binding is intentionally fixed.'
          },
          {
            type: 'challenge',
            id: 'challenge-01',
            prompt: 'Declare a `const` called `gameName` set to `"SYNTHSCRIPT"`, then declare a `let` called `lives` set to `3`. Log both to the console.',
            starterCode: `// Declare gameName as a const
const gameName

// Declare lives as a let
let lives

console.log(gameName);
console.log(lives);`,
            hints: [
              'const requires an immediate value: const x = value;',
              'Don\'t forget the semicolons at the end of each line',
              'Strings need quote marks: "like this"'
            ],
            expectedOutput: ['SYNTHSCRIPT', '3'],
            codeChecks: [
              { type: 'declares-const', name: 'gameName', description: 'Declare gameName as a const' },
              { type: 'declares-let', name: 'lives', description: 'Declare lives as a let' },
            ],
          }
        ]
      },
      {
        id: '01-b-naming',
        title: 'Naming Conventions',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '01-variables-values',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'JavaScript variable names must start with a letter, underscore `_`, or dollar sign `$`. They **cannot** start with a number and **cannot** contain spaces or hyphens.\n\nThe JavaScript community uses **camelCase** — the first word is lowercase, every subsequent word starts with a capital: `playerScore`, `isGameOver`, `totalLevelCount`. Avoid single-letter names except for short loop counters (`i`, `j`).'
          },
          {
            type: 'code-example',
            label: 'VALID names',
            code: `let playerScore = 0;
let isGameOver = false;
let _privateValue = 42;
const MAX_LIVES = 5;       // SCREAMING_SNAKE for constants is also common`
          },
          {
            type: 'code-example',
            label: 'INVALID names — these cause errors',
            code: `let 1player = "Brian";   // cannot start with a number
let my-score = 10;        // hyphens not allowed
let let = "hello";        // 'let' is a reserved keyword`
          },
          {
            type: 'quiz',
            question: 'Which variable name follows JavaScript camelCase convention?',
            options: ['player_score', 'PlayerScore', 'playerScore', 'player-score'],
            correctIndex: 2,
            explanation: 'camelCase starts lowercase and capitalises each new word: `playerScore`. `player_score` is snake_case (used in Python). `PlayerScore` is PascalCase (used for classes). Hyphens are invalid in variable names.'
          },
          {
            type: 'challenge',
            id: 'challenge-02',
            prompt: 'Rename the poorly-named variables below to proper camelCase, then log each one.',
            starterCode: `const max_level = 10;
let Player_Name = "Brian";
let CURRENT_score = 500;

console.log(max_level);
console.log(Player_Name);
console.log(CURRENT_score);`,
            hints: [
              'camelCase: first word lowercase, rest capitalised — maxLevel',
              'Replace underscores and fix capitalisation',
              'The values stay the same, only the names change'
            ],
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
          }
        ]
      },
      {
        id: '01-c-reassignment',
        title: 'Reassignment & Mutation',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '01-variables-values',
        activeRules: ['require-semicolons', 'require-assignment-operator', 'const-reassignment'],
        sections: [
          {
            type: 'text',
            content: '**Reassignment** means pointing a variable at a completely different value. Only `let` allows this — trying to reassign a `const` throws a `TypeError`.\n\n**Mutation** is different: you change the *contents* of the value without changing what the variable points to. Objects and arrays declared with `const` can still be mutated internally — `const` only prevents the *binding* from changing, not the contents.'
          },
          {
            type: 'code-example',
            label: 'Reassignment with let',
            code: `let energy = 100;
energy = energy - 25;    // reassign: subtract 25
console.log(energy);     // 75`
          },
          {
            type: 'quiz',
            question: 'What happens when you try to reassign a `const` variable?',
            options: [
              'The value silently stays the same',
              'JavaScript allows it because const is flexible',
              'A TypeError is thrown at runtime',
              'A SyntaxError is thrown at parse time'
            ],
            correctIndex: 2,
            explanation: 'Reassigning a `const` throws a `TypeError: Assignment to constant variable` at runtime. The parser does not catch this — it only becomes an error when that line executes.'
          },
          {
            type: 'challenge',
            id: 'challenge-03',
            prompt: 'A player starts with 100 health. They take 30 damage, then find a potion that restores 20 health. Track the health using `let` and log the final value.',
            starterCode: `let health = 100;

// Take 30 damage
health

// Restore 20 health
health

console.log("Final health:", health); // should print 90`,
            hints: [
              'Subtraction reassignment: health = health - 30; or health -= 30;',
              'Addition reassignment: health = health + 20; or health += 20;',
              'The final value should be 90'
            ],
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
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     02 — DATA TYPES
  ══════════════════════════════════════════ */
  {
    id: '02-data-types',
    title: 'Data Types',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'fundamentals',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'Every value in JavaScript has a **type** that determines what you can do with it. The seven primitive types are: `string`, `number`, `boolean`, `undefined`, `null`, `symbol`, and `bigint`. You will use the first four constantly.\n\nSub-lessons cover each type in depth, plus the `typeof` operator that lets you inspect types at runtime.'
      },
      {
        type: 'quiz',
        question: 'How many primitive types does JavaScript have?',
        options: ['4', '5', '6', '7'],
        correctIndex: 3,
        explanation: 'JavaScript has 7 primitive types: string, number, boolean, undefined, null, symbol, and bigint. In practice you\'ll mainly work with the first four until you reach advanced topics.'
      }
    ],
    subLessons: [
      {
        id: '02-a-strings',
        title: 'Strings',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'fundamentals',
        parentId: '02-data-types',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'A **string** is a sequence of characters — text. Wrap text in single quotes `\'..\'`, double quotes `"..."`, or backticks `` `...` ``.\n\nBacktick strings are called **template literals**. They let you embed expressions directly inside the string using the syntax with a dollar sign and curly braces, like $ {expression} — no need to concatenate with `+`.\n\nStrings have a `.length` property and many built-in methods: `.toUpperCase()`, `.toLowerCase()`, `.includes()`, `.slice()`, `.trim()`, and more.'
          },
          {
            type: 'code-example',
            label: 'Strings and template literals',
            code: `const firstName = "Brian";
const lastName = 'Schmidt';
const fullName = \`\${firstName} \${lastName}\`;

console.log(fullName);            // Brian Schmidt
console.log(fullName.length);     // 13
console.log(fullName.toUpperCase()); // BRIAN SCHMIDT
console.log(fullName.includes("Brian")); // true`
          },
          {
            type: 'quiz',
            question: 'Which syntax lets you embed a variable inside a string without using `+`?',
            options: [
              'Double quotes: "Hello " + name',
              'Template literal: `Hello ${name}`',
              'Single quotes: \'Hello \' + name',
              'Brackets: [Hello name]'
            ],
            correctIndex: 1,
            explanation: 'Template literals use backticks and `${expression}` placeholders to embed values directly inside a string. This is cleaner and less error-prone than concatenation with `+`.'
          },
          {
            type: 'challenge',
            prompt: 'Create variables for a player\'s first name, last name, and level. Use a template literal to log: "Player: Brian Schmidt — Level 7"',
            starterCode: `const firstName = "Brian";
const lastName = "Schmidt";
const level = 7;

// Use a template literal to build the message
const message

console.log(message);`,
            hints: [
              'Template literals use backticks: `text here`',
              'Embed variables with ${variableName}',
              'Result should be: Player: Brian Schmidt — Level 7'
            ],
            expectedOutput: ['Player: Brian Schmidt — Level 7'],
            codeChecks: [
              { type: 'contains-string', text: '`Player:', description: 'Use a template literal with backticks' },
            ],
          }
        ]
      },
      {
        id: '02-b-numbers',
        title: 'Numbers',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '02-data-types',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'JavaScript has a single `number` type covering both integers and decimals. There is no separate `int` or `float`.\n\nTwo special values: `Infinity` (result of dividing by zero) and `NaN` — "Not a Number" — returned when a numeric operation fails, like `"hello" * 2`. Always check for `NaN` with `Number.isNaN()` rather than `=== NaN`, because `NaN !== NaN` by specification.'
          },
          {
            type: 'code-example',
            label: 'Numbers in JavaScript',
            code: `const price = 9.99;
const lives = 3;

console.log(typeof price);        // number
console.log(typeof lives);        // number

console.log(10 / 0);             // Infinity
console.log("hello" * 2);        // NaN
console.log(Number.isNaN(NaN));  // true
console.log(Math.round(4.7));    // 5
console.log(Math.floor(4.9));    // 4`
          },
          {
            type: 'quiz',
            question: 'What does `"abc" * 2` evaluate to in JavaScript?',
            options: ['0', '"abcabc"', 'NaN', 'An error is thrown'],
            correctIndex: 2,
            explanation: 'Multiplying a non-numeric string produces `NaN` (Not a Number). JavaScript does not throw — it silently returns NaN, which is why always validating inputs before arithmetic is important.'
          },
          {
            type: 'challenge',
            prompt: 'A game session lasted 137.6 seconds. Convert this to whole minutes (floor division) and remaining seconds (modulo), then log both.',
            starterCode: `const totalSeconds = 137.6;

const minutes = Math.floor(totalSeconds / 60);
const seconds

console.log(\`Minutes: \${minutes}\`);
console.log(\`Seconds: \${seconds}\`);`,
            hints: [
              'Remaining seconds: use modulo % — totalSeconds % 60, then Math.floor it',
              'Math.floor(137.6 / 60) = 2 minutes',
              'Math.floor(137.6 % 60) = 17 seconds'
            ],
            expectedOutput: ['Minutes: 2', 'Seconds: 17'],
            codeChecks: [
              { type: 'contains-string', text: '%', description: 'Use modulo % to get remaining seconds' },
            ],
          }
        ]
      },
      {
        id: '02-c-booleans',
        title: 'Booleans & Truthy / Falsy',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'fundamentals',
        parentId: '02-data-types',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'A **boolean** is simply `true` or `false`. Booleans are the result of comparison expressions and drive all conditional logic.\n\nEvery JavaScript value is either **truthy** or **falsy** when evaluated in a boolean context. The **falsy** values are: `false`, `0`, `""` (empty string), `null`, `undefined`, and `NaN`. Everything else is truthy — including `"0"`, `[]`, and `{}`.'
          },
          {
            type: 'code-example',
            label: 'Booleans and truthy/falsy',
            code: `const isAlive = true;
const isGameOver = false;

// Falsy values
console.log(Boolean(0));         // false
console.log(Boolean(""));        // false
console.log(Boolean(null));      // false
console.log(Boolean(undefined)); // false

// Truthy values
console.log(Boolean(1));         // true
console.log(Boolean("hello"));   // true
console.log(Boolean([]));        // true — empty array is truthy!`
          },
          {
            type: 'quiz',
            question: 'Which of the following is TRUTHY in JavaScript?',
            options: ['0', '""', 'null', '"false"'],
            correctIndex: 3,
            explanation: 'The string `"false"` is truthy because it is a non-empty string. The word "false" inside quotes does not make it the boolean `false`. Only empty string `""` is falsy.'
          },
          {
            type: 'challenge',
            prompt: 'Use `Boolean()` to check each value below and log whether it is truthy or falsy.',
            starterCode: `const values = [0, "hello", "", null, 42, undefined, "0"];

values.forEach(function(val) {
  const result = Boolean(val);
  console.log(val, "=>", result);
});`,
            hints: ['Run this as-is first — it should work!', 'Notice that "0" (string) is truthy but 0 (number) is falsy'],
            expectedOutput: ['0 => false', 'hello => true', '42 => true', '0 => true'],
          }
        ]
      },
      {
        id: '02-d-null-undefined',
        title: 'null vs undefined',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '02-data-types',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`undefined` means a variable has been declared but not yet assigned a value. JavaScript assigns it automatically.\n\n`null` is an intentional empty value — you set it explicitly to signal "this slot exists but currently holds nothing". Use `null` when you want to clear a value on purpose; `undefined` typically comes from the engine, not from you.'
          },
          {
            type: 'code-example',
            label: 'null vs undefined',
            code: `let score;
console.log(score);           // undefined — declared but not assigned

let activePlayer = null;
console.log(activePlayer);    // null — intentionally empty

console.log(typeof undefined); // undefined
console.log(typeof null);      // object — historic JavaScript quirk!

// Checking for either
console.log(score == null);    // true (== checks both null and undefined)
console.log(score === null);   // false (=== is strict)`
          },
          {
            type: 'quiz',
            question: 'What does `typeof null` return?',
            options: ['"null"', '"undefined"', '"object"', '"empty"'],
            correctIndex: 2,
            explanation: '`typeof null` returns `"object"` — a historic bug in JavaScript from 1995 that was never fixed to preserve backward compatibility. Always check `=== null` explicitly rather than relying on typeof.'
          }
        ]
      },
      {
        id: '02-e-typeof',
        title: 'The typeof Operator',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '02-data-types',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The `typeof` operator returns a string describing the type of a value. It is especially useful when you receive data from user input or external sources and need to validate it before processing.\n\nRemember: `typeof null` returns `"object"` (a known quirk), and `typeof` of an undeclared variable returns `"undefined"` without throwing a ReferenceError.'
          },
          {
            type: 'code-example',
            label: 'typeof in practice',
            code: `console.log(typeof "hello");     // string
console.log(typeof 42);          // number
console.log(typeof true);        // boolean
console.log(typeof undefined);   // undefined
console.log(typeof null);        // object — quirk!
console.log(typeof {});          // object
console.log(typeof []);          // object — arrays too!
console.log(typeof function(){}); // function`
          },
          {
            type: 'challenge',
            prompt: 'Write a function `describeValue` that takes any value and logs: `"The value X is of type Y"` using typeof.',
            starterCode: `function describeValue(val) {
  const t = typeof val;
  console.log(\`The value \${val} is of type \${t}\`);
}

describeValue(42);
describeValue("hello");
describeValue(true);
describeValue(null);
describeValue(undefined);`,
            hints: ['typeof val gives you the type string', 'Use a template literal to build the message', 'null will show "object" — that is the expected quirk'],
            expectedOutput: [
              'The value 42 is of type number',
              'The value hello is of type string',
              'The value true is of type boolean',
              'The value null is of type object',
            ],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     03 — EXPRESSIONS
  ══════════════════════════════════════════ */
  {
    id: '03-expressions',
    title: 'Expressions',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'fundamentals',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'An **expression** is any piece of code that evaluates to a value. `2 + 2` is an expression (evaluates to `4`). `name === "Brian"` is an expression (evaluates to `true` or `false`).\n\nSub-lessons cover the four main categories: arithmetic, string concatenation, comparison, and logical expressions.'
      },
      {
        type: 'quiz',
        question: 'What is the result of `5 + 3 * 2`?',
        options: ['16', '11', '13', '10'],
        correctIndex: 1,
        explanation: 'Multiplication has higher precedence than addition. `3 * 2 = 6` first, then `5 + 6 = 11`. Use parentheses `(5 + 3) * 2 = 16` to change the order.'
      }
    ],
    subLessons: [
      {
        id: '03-a-arithmetic',
        title: 'Arithmetic Expressions',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '03-expressions',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'Arithmetic operators perform math on numbers: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `%` (modulo — remainder after division), `**` (exponentiation).\n\n**Operator precedence** follows the same rules as maths: exponentiation first, then multiplication/division/modulo, then addition/subtraction. Use parentheses to make your intent explicit and override precedence.'
          },
          {
            type: 'code-example',
            label: 'Arithmetic operators',
            code: `console.log(10 + 3);    // 13
console.log(10 - 3);    // 7
console.log(10 * 3);    // 30
console.log(10 / 3);    // 3.3333...
console.log(10 % 3);    // 1  (remainder: 10 = 3*3 + 1)
console.log(2 ** 10);   // 1024

// Precedence
console.log(2 + 3 * 4);    // 14 — * first
console.log((2 + 3) * 4);  // 20 — () overrides`
          },
          {
            type: 'quiz',
            question: 'What does the `%` (modulo) operator return for `17 % 5`?',
            options: ['3', '2', '12', '0.4'],
            correctIndex: 1,
            explanation: '17 divided by 5 is 3 with a remainder of 2. Modulo returns that remainder: `17 % 5 = 2`. Modulo is very useful for checking even/odd (`n % 2 === 0`) or cycling through a fixed range.'
          },
          {
            type: 'challenge',
            prompt: 'A game awards XP based on: base XP × difficulty multiplier + bonus XP. Calculate and log the total XP for: baseXP=200, difficulty=3, bonus=150.',
            starterCode: `const baseXP = 200;
const difficulty = 3;
const bonus = 150;

const totalXP

console.log("Total XP:", totalXP); // should be 750`,
            hints: ['totalXP = (baseXP * difficulty) + bonus', 'Use parentheses to make the order clear', 'Expected result: 750'],
            expectedOutput: ['Total XP: 750'],
            codeChecks: [
              { type: 'contains-string', text: '*', description: 'Multiply baseXP by difficulty' },
            ],
          }
        ]
      },
      {
        id: '03-b-template-literals',
        title: 'String Concatenation & Template Literals',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '03-expressions',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'The `+` operator joins strings when at least one operand is a string. JavaScript converts the other value to a string automatically — this is called **type coercion**.\n\nTemplate literals (backtick strings) are usually cleaner: embed any expression with `${...}`. Anything inside the braces is evaluated first, then converted to a string and inserted.'
          },
          {
            type: 'code-example',
            label: 'Concatenation vs template literals',
            code: `const player = "Brian";
const score = 9500;

// Old style — easy to make spacing mistakes
const msg1 = "Player: " + player + " Score: " + score;

// Template literal — cleaner
const msg2 = \`Player: \${player} Score: \${score}\`;

// You can embed full expressions
const msg3 = \`Double score: \${score * 2}\`;

console.log(msg1);
console.log(msg2);
console.log(msg3);`
          },
          {
            type: 'quiz',
            question: 'What does `"5" + 3` evaluate to?',
            options: ['8', '"53"', 'NaN', 'Error'],
            correctIndex: 1,
            explanation: 'When one operand of `+` is a string, JavaScript converts the other to a string too, then concatenates them. `"5" + 3` → `"5" + "3"` → `"53"`. This is why mixing types carelessly leads to bugs.'
          }
        ]
      },
      {
        id: '03-c-comparison',
        title: 'Comparison Expressions',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'fundamentals',
        parentId: '03-expressions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Comparison operators always produce a **boolean**. The most important distinction in JavaScript: `==` (loose equality, allows type coercion) vs `===` (strict equality, types must match).\n\nAlways use `===` and `!==` in modern JavaScript. Loose equality has surprising results: `0 == false` is `true`, `"" == 0` is `true`. Strict equality avoids all of that.'
          },
          {
            type: 'code-example',
            label: 'Strict vs loose equality',
            code: `// Strict equality — use this
console.log(5 === 5);     // true
console.log(5 === "5");   // false — different types
console.log(5 !== "5");   // true

// Loose equality — avoid
console.log(5 == "5");    // true — type coercion!
console.log(0 == false);  // true — confusing!
console.log(null == undefined); // true — also confusing

// Relational
console.log(10 > 5);   // true
console.log(10 <= 10); // true`
          },
          {
            type: 'quiz',
            question: 'What is the result of `5 === "5"`?',
            options: ['true', 'false', 'NaN', 'undefined'],
            correctIndex: 1,
            explanation: 'Strict equality (`===`) checks both value AND type. `5` is a number; `"5"` is a string. They are different types, so `5 === "5"` is `false`. With loose equality (`==`) it would be `true` due to type coercion.'
          },
          {
            type: 'challenge',
            prompt: 'Compare two game scores and log whether they are strictly equal, and which is higher.',
            starterCode: `const scoreA = 8500;
const scoreB = 9000;

const areEqual = scoreA === scoreB;
const aIsHigher

console.log("Equal:", areEqual);
console.log("A is higher:", aIsHigher);`,
            hints: ['Use > to compare which is higher', 'areEqual should be false', 'aIsHigher should be false since 8500 < 9000'],
            expectedOutput: ['Equal: false', 'A is higher: false'],
            codeChecks: [
              { type: 'contains-string', text: '>', description: 'Use > to compare scores' },
            ],
          }
        ]
      },
      {
        id: '03-d-logical',
        title: 'Logical Expressions',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'fundamentals',
        parentId: '03-expressions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Logical AND** (`&&`) returns the first falsy value it encounters, or the last value if all are truthy.\n\n**Logical OR** (`||`) returns the first truthy value, or the last value if all are falsy.\n\n**Logical NOT** (`!`) flips a boolean: `!true === false`.\n\nThis short-circuit evaluation means `&&` and `||` are often used for default values and guard clauses, not just in `if` conditions.'
          },
          {
            type: 'code-example',
            label: 'Logical operators',
            code: `const hasKey = true;
const hasSword = false;

console.log(hasKey && hasSword);  // false — AND: both must be true
console.log(hasKey || hasSword);  // true  — OR: one must be true
console.log(!hasKey);             // false — NOT: flip it

// Short-circuit default value
const name = "" || "Anonymous";
console.log(name);  // Anonymous — empty string is falsy`
          },
          {
            type: 'quiz',
            question: 'What does `true && false || true` evaluate to?',
            options: ['true', 'false', 'undefined', 'Error'],
            correctIndex: 0,
            explanation: '`&&` has higher precedence than `||`. So: `(true && false) || true` = `false || true` = `true`.'
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     04 — SYNTAX RULES
  ══════════════════════════════════════════ */
  {
    id: '04-syntax-rules',
    title: 'Syntax Rules & Semicolons',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'fundamentals',
    activeRules: ['require-semicolons', 'require-assignment-operator'],
    sections: [
      {
        type: 'text',
        content: 'JavaScript has strict syntax rules. Breaking them produces errors before your code even runs. The most common mistakes for beginners are missing semicolons, unmatched brackets, and typos in keywords.\n\nSub-lessons cover semicolons and ASI, bracket matching, and how to write comments.'
      },
      {
        type: 'quiz',
        question: 'Which of the following will cause a SyntaxError?',
        options: [
          'let x = 5',
          'let x = 5;',
          'const x = 5;',
          'All of the above'
        ],
        correctIndex: 0,
        explanation: 'Actually `let x = 5` without a semicolon MAY work due to ASI, but relying on ASI is risky and leads to hard-to-find bugs. Always add semicolons explicitly. Sub-lesson 04-a covers the dangers of ASI.'
      }
    ],
    subLessons: [
      {
        id: '04-a-semicolons',
        title: 'Semicolons & ASI',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '04-syntax-rules',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'Every JavaScript **statement** should end with a semicolon `;`. JavaScript has a feature called **Automatic Semicolon Insertion (ASI)** that adds them for you in many cases — but not always.\n\nASI can fail silently, leading to bizarre bugs. The classic example: a return statement followed by an object on the next line will return `undefined`, not the object, because ASI inserts a semicolon after `return`. Always add semicolons yourself.'
          },
          {
            type: 'code-example',
            label: 'ASI danger example',
            code: `// Looks like it returns an object — but ASI strikes!
function getConfig() {
  return    // ASI inserts ; here!
  {
    theme: "dark"
  };
}

console.log(getConfig()); // undefined — not {theme: "dark"}

// Fix: opening brace on the same line as return
function getConfigFixed() {
  return {
    theme: "dark"
  };
}
console.log(getConfigFixed()); // {theme: "dark"}`
          },
          {
            type: 'quiz',
            question: 'What does ASI stand for?',
            options: [
              'Automatic Syntax Inspector',
              'Automatic Semicolon Insertion',
              'Abstract Syntax Interface',
              'Assigned Statement Identifier'
            ],
            correctIndex: 1,
            explanation: 'ASI — Automatic Semicolon Insertion — is JavaScript\'s built-in mechanism that inserts semicolons at certain line endings automatically. Relying on it is considered bad practice because it does not always work as expected.'
          },
          {
            type: 'challenge',
            prompt: 'Fix the missing semicolons in this code so it runs correctly.',
            starterCode: `let playerName = "Brian"
let score = 500
const MAX_SCORE = 1000

const percentage = (score / MAX_SCORE) * 100

console.log(\`\${playerName}: \${percentage}%\`)`,
            hints: ['Every statement should end with ;', 'There are 5 statements that need semicolons', 'The last line needs one too'],
            expectedOutput: ['Brian: 50%'],
          }
        ]
      },
      {
        id: '04-b-brackets',
        title: 'Brackets & Braces',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '04-syntax-rules',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'JavaScript uses three kinds of brackets and every opening one must have a matching closing one:\n\n- `()` parentheses — function calls, conditions, grouping\n- `{}` curly braces — code blocks, objects\n- `[]` square brackets — arrays, property access\n\nNesting must be strictly correct: you cannot close an outer bracket before closing an inner one. A good code editor will highlight unmatched brackets — use that.'
          },
          {
            type: 'code-example',
            label: 'Correct bracket matching',
            code: `// All brackets properly matched
function greet(name) {
  const msg = \`Hello, \${name}!\`;
  return msg;
}

const players = ["Brian", "Alex", "Sam"];
console.log(greet(players[0]));  // Hello, Brian!`
          },
          {
            type: 'quiz',
            question: 'What type of brackets are used for array literals?',
            options: ['() parentheses', '{} curly braces', '[] square brackets', '<> angle brackets'],
            correctIndex: 2,
            explanation: 'Square brackets `[]` create array literals and are also used for property/index access: `arr[0]`. Curly braces `{}` are used for objects and code blocks. Parentheses `()` are for function calls and grouping.'
          }
        ]
      },
      {
        id: '04-c-comments',
        title: 'Comments',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '04-syntax-rules',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Comments are text in your code that JavaScript ignores completely. They exist purely for humans.\n\n`//` starts a **single-line comment** — everything after `//` on that line is ignored.\n\n`/* ... */` creates a **multi-line comment** — everything between the markers is ignored, even across many lines.\n\nWrite comments that explain *why* something is done, not *what* it does. The code already shows what — good comments explain the reasoning.'
          },
          {
            type: 'code-example',
            label: 'Comment styles',
            code: `// Single-line comment — good for short notes
const TAX_RATE = 0.2;  // UK VAT rate

/*
  Multi-line comment — good for explanations.
  This function calculates the final price including tax.
  Rounds to 2 decimal places to avoid floating-point drift.
*/
function addTax(price) {
  return Math.round(price * (1 + TAX_RATE) * 100) / 100;
}

console.log(addTax(50)); // 60`
          },
          {
            type: 'quiz',
            question: 'Which comment style spans multiple lines?',
            options: ['// comment', '/* comment */', '# comment', '-- comment'],
            correctIndex: 1,
            explanation: '`/* ... */` is the multi-line comment syntax. `//` only comments to the end of the current line. `#` is used in Python/bash, and `--` in SQL — neither works in JavaScript.'
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     05 — OPERATORS
  ══════════════════════════════════════════ */
  {
    id: '05-operators',
    title: 'Operators',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'fundamentals',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'An **operator** is a symbol that performs an operation on one or more values. You have already seen `+`, `=`, and `===`. This lesson goes deeper into all operator categories: arithmetic, assignment shorthand, strict comparison, logical, and the ternary operator.'
      },
      {
        type: 'quiz',
        question: 'Which operator should you always use to compare values in JavaScript?',
        options: ['==', '=', '===', '<>'],
        correctIndex: 2,
        explanation: '`===` is strict equality and checks both value and type. `==` performs type coercion and leads to surprising results. `=` is assignment, not comparison.'
      }
    ],
    subLessons: [
      {
        id: '05-a-arithmetic-ops',
        title: 'Arithmetic Operators',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '05-operators',
        activeRules: ['require-semicolons', 'require-assignment-operator'],
        sections: [
          {
            type: 'text',
            content: 'You already know `+`, `-`, `*`, `/`, `%` and `**`. Two more to learn: **increment** `++` adds 1 to a variable, **decrement** `--` subtracts 1.\n\n`x++` is post-increment (returns original value, then adds 1). `++x` is pre-increment (adds 1, then returns new value). In most real code you use these in loops or counters where the distinction does not matter.'
          },
          {
            type: 'code-example',
            label: 'Increment and decrement',
            code: `let counter = 0;
counter++;                  // post-increment
console.log(counter);      // 1

let lives = 3;
lives--;                    // post-decrement
console.log(lives);        // 2

// Pre vs post
let a = 5;
console.log(a++);  // 5 — returns THEN increments
console.log(a);    // 6 — now it's incremented`
          },
          {
            type: 'quiz',
            question: 'What does `let x = 5; console.log(x++);` log?',
            options: ['6', '5', '4', 'undefined'],
            correctIndex: 1,
            explanation: 'Post-increment `x++` returns the current value (5) first, THEN increments x to 6. If you check `x` on the next line it will be 6. Pre-increment `++x` would return 6 immediately.'
          },
          {
            type: 'challenge',
            prompt: 'Write a simple lap counter that starts at 0 and logs the lap number after each increment, for 5 laps.',
            starterCode: `let lap = 0;

// Increment and log 5 times
lap++;
console.log("Lap:", lap);

lap++;
console.log("Lap:", lap);

lap++;
console.log("Lap:", lap);

lap++;
console.log("Lap:", lap);

lap++;
console.log("Lap:", lap);`,
            hints: ['Just run it — this one works as starter code', 'Try converting to a loop in scratch.js for bonus practice'],
            expectedOutput: ['Lap: 1', 'Lap: 5'],
          }
        ]
      },
      {
        id: '05-b-assignment-ops',
        title: 'Assignment Operators',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '05-operators',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Assignment shorthand operators combine an arithmetic operation with assignment:\n\n- `x += 5` is short for `x = x + 5`\n- `x -= 5` means `x = x - 5`\n- `x *= 2` means `x = x * 2`\n- `x /= 2` means `x = x / 2`\n- `x %= 3` means `x = x % 3`\n- `x **= 2` means `x = x ** 2`\n\nThese are just convenience shorthand — they produce identical bytecode.'
          },
          {
            type: 'code-example',
            label: 'Assignment operators in a game loop',
            code: `let health = 100;
let mana = 50;
let multiplier = 1;

health -= 30;     // took damage: health = 70
mana += 20;       // mana regen:  mana = 70
multiplier *= 2;  // power-up:    multiplier = 2

console.log(\`HP: \${health}, Mana: \${mana}, Mult: \${multiplier}\`);`
          },
          {
            type: 'quiz',
            question: 'What is the result of: `let n = 10; n *= 3; n -= 5;`?',
            options: ['30', '25', '35', '15'],
            correctIndex: 1,
            explanation: '`n *= 3` → n = 30. Then `n -= 5` → n = 25.'
          }
        ]
      },
      {
        id: '05-c-comparison-ops',
        title: 'Comparison Operators',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '05-operators',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'You have six comparison operators: `===`, `!==`, `>`, `<`, `>=`, `<=`. They all return a boolean.\n\nThe critical rule: **always use `===` (strict) and `!==`** rather than `==` and `!=`. Loose equality performs type coercion that leads to counter-intuitive results like `null == undefined` being `true`.'
          },
          {
            type: 'code-example',
            label: 'All comparison operators',
            code: `const a = 10;
const b = 20;

console.log(a === b);   // false
console.log(a !== b);   // true
console.log(a < b);     // true
console.log(a > b);     // false
console.log(a <= 10);   // true
console.log(b >= 20);   // true

// Type matters with ===
console.log(10 === "10");  // false
console.log(10 == "10");   // true (avoid!)`
          },
          {
            type: 'challenge',
            prompt: 'A player needs at least 1000 XP and at least level 5 to unlock a bonus stage. Log whether both conditions are met.',
            starterCode: `const xp = 1250;
const level = 4;

const hasEnoughXP = xp >= 1000;
const hasEnoughLevel

const canUnlock = hasEnoughXP && hasEnoughLevel;

console.log("Can unlock bonus stage:", canUnlock); // false — level is only 4`,
            hints: ['hasEnoughLevel: level >= 5', 'canUnlock uses && to combine both conditions', 'With level=4, canUnlock should be false'],
            expectedOutput: ['Can unlock bonus stage: false'],
            codeChecks: [
              { type: 'contains-string', text: '>= 5', description: 'Check level >= 5 using comparison' },
            ],
          }
        ]
      },
      {
        id: '05-d-logical-ops',
        title: 'Logical & Nullish Operators',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'fundamentals',
        parentId: '05-operators',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`&&`, `||`, and `!` you already know. Two more modern operators:\n\n**Nullish coalescing** `??` returns the right-hand side only if the left side is `null` or `undefined` (unlike `||` which triggers for any falsy value including `0` and `""`).\n\n**Optional chaining** `?.` safely accesses nested properties — returns `undefined` instead of throwing if the chain is broken.'
          },
          {
            type: 'code-example',
            label: 'Nullish coalescing vs OR',
            code: `const userScore = 0;

// || triggers for ANY falsy — bad for 0
const displayScoreA = userScore || "No score";
console.log(displayScoreA);  // No score — wrong! 0 is a valid score

// ?? only triggers for null/undefined — correct
const displayScoreB = userScore ?? "No score";
console.log(displayScoreB);  // 0 — correct!

// Optional chaining
const user = { profile: { name: "Brian" } };
console.log(user?.profile?.name);   // Brian
console.log(user?.settings?.theme); // undefined — no error`
          },
          {
            type: 'quiz',
            question: 'When should you use `??` instead of `||` for default values?',
            options: [
              'When the value could be 0 or an empty string',
              'When you only want to trigger on false',
              'Never — || is always better',
              'When comparing strings'
            ],
            correctIndex: 0,
            explanation: 'Use `??` when valid values include `0`, `""`, or `false`, and you only want to fall back when the value is truly absent (`null` or `undefined`). `||` would incorrectly replace those valid values.'
          }
        ]
      },
      {
        id: '05-e-ternary',
        title: 'Ternary Operator',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'fundamentals',
        parentId: '05-operators',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The **ternary operator** is a compact one-line if/else: `condition ? valueIfTrue : valueIfFalse`.\n\nIt is an *expression* (produces a value), unlike an `if` statement. This makes it useful for assigning a value based on a condition in a single line. Keep ternaries simple — if the condition or values are complex, use an `if` statement instead for readability.'
          },
          {
            type: 'code-example',
            label: 'Ternary operator',
            code: `const score = 750;
const grade = score >= 800 ? "A" : score >= 600 ? "B" : "C";
console.log(grade);  // B

const lives = 0;
const status = lives > 0 ? "Alive" : "Game Over";
console.log(status);  // Game Over

// Equivalent if/else
let statusVerbose;
if (lives > 0) {
  statusVerbose = "Alive";
} else {
  statusVerbose = "Game Over";
}
console.log(statusVerbose);`
          },
          {
            type: 'challenge',
            prompt: 'Use ternary to classify a temperature: below 0 is "freezing", 0-15 is "cold", 16-25 is "mild", above 25 is "hot".',
            starterCode: `const temp = 18;

const climate = temp < 0 ? "freezing"
  : temp <= 15 ? "cold"
  : temp <= 25 ? "mild"
  : "hot";

console.log(\`\${temp}°C is \${climate}\`); // 18°C is mild`,
            hints: ['This one is complete — run it and then try changing temp to test other ranges'],
            expectedOutput: ['18°C is mild'],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     06 — CONDITIONALS
  ══════════════════════════════════════════ */
  {
    id: '06-conditionals',
    title: 'Conditionals',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'control-flow',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'Conditionals let your program make decisions: "if this condition is true, do X; otherwise do Y." JavaScript provides `if`, `else if`, `else`, `switch`, and the ternary operator.\n\nSub-lessons cover each form in depth with real examples.'
      },
      {
        type: 'quiz',
        question: 'What runs when an `if` condition is falsy?',
        options: ['The if block runs anyway', 'Nothing runs', 'The else block runs', 'An error is thrown'],
        correctIndex: 2,
        explanation: 'When an `if` condition evaluates to a falsy value the `else` block runs (if one exists). If there is no `else`, execution simply continues after the entire `if` statement.'
      }
    ],
    subLessons: [
      {
        id: '06-a-if',
        title: 'The if Statement',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '06-conditionals',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The `if` statement runs a block of code only when its condition is truthy. The condition goes inside parentheses; the code to run goes inside curly braces.\n\nAlways use curly braces `{}` even for single-line bodies. Omitting them is technically allowed but leads to bugs when you add a second line later.'
          },
          {
            type: 'code-example',
            label: 'if statement',
            code: `const lives = 3;

if (lives > 0) {
  console.log("Still in the game!");
}

const password = "secret123";
if (password.length < 8) {
  console.log("Password too short");
}
console.log("Check complete");`
          },
          {
            type: 'quiz',
            question: 'What happens if the `if` condition is `0`?',
            options: [
              'The block runs — 0 is a number',
              'The block is skipped — 0 is falsy',
              'A TypeError is thrown',
              'It depends on the browser'
            ],
            correctIndex: 1,
            explanation: '`0` is falsy in JavaScript. When an `if` receives a falsy condition the block is skipped entirely.'
          },
          {
            type: 'challenge',
            prompt: 'Write an `if` that logs "High score!" only when the player\'s score is greater than 10000.',
            starterCode: `const playerScore = 12500;

// Write your if statement here


console.log("Check done");`,
            hints: ['if (condition) { ... }', 'condition: playerScore > 10000', 'Log "High score!" inside the block'],
            expectedOutput: ['High score!'],
            codeChecks: [
              { type: 'uses-if', description: 'Use an if statement' },
            ],
          }
        ]
      },
      {
        id: '06-b-else',
        title: 'else Clause',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'control-flow',
        parentId: '06-conditionals',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The `else` clause runs when the `if` condition is falsy. It must immediately follow the closing `}` of the `if` block.\n\nWith `if/else`, exactly one of the two blocks will always run — they are mutually exclusive.'
          },
          {
            type: 'code-example',
            label: 'if…else',
            code: `const score = 450;

if (score >= 500) {
  console.log("You passed!");
} else {
  console.log("Try again — need 500 to pass");
}

// One block always runs
const isLoggedIn = false;
const greeting = null;

if (isLoggedIn) {
  console.log("Welcome back!");
} else {
  console.log("Please log in");
}`
          },
          {
            type: 'challenge',
            prompt: 'Check if a number is even or odd using if/else. A number is even if `n % 2 === 0`.',
            starterCode: `const number = 17;

if (number % 2 === 0) {
  console.log(number, "is even");
} else {
  console.log(number, "is odd");
}`,
            hints: ['This one is complete — run it', 'Try changing number to 4 to see the even branch'],
            expectedOutput: ['17 is odd'],
          }
        ]
      },
      {
        id: '06-c-else-if',
        title: 'else if Chains',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '06-conditionals',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`else if` lets you check multiple conditions in sequence. JavaScript evaluates each condition top to bottom and runs the **first** block whose condition is truthy, then skips the rest.\n\nThe final `else` (optional) is a catch-all that runs if no condition matched. Think of it like routing: only one route handles each request.'
          },
          {
            type: 'code-example',
            label: 'else if chain — grade system',
            code: `const score = 72;

if (score >= 90) {
  console.log("A — Excellent");
} else if (score >= 80) {
  console.log("B — Good");
} else if (score >= 70) {
  console.log("C — Satisfactory");
} else if (score >= 60) {
  console.log("D — Needs improvement");
} else {
  console.log("F — Failed");
}
// Logs: "C — Satisfactory"`
          },
          {
            type: 'quiz',
            question: 'In an else-if chain where multiple conditions are true, how many blocks run?',
            options: ['All matching blocks', 'Only the last matching block', 'Only the first matching block', 'Depends on the values'],
            correctIndex: 2,
            explanation: 'JavaScript evaluates conditions top to bottom and runs the FIRST matching block, then jumps past the entire chain. Only one block ever runs in an if/else-if/else chain.'
          },
          {
            type: 'challenge',
            prompt: 'Write an else-if chain to classify a player\'s rank: Unranked (<100 XP), Bronze (100-499), Silver (500-999), Gold (1000-4999), Diamond (5000+).',
            starterCode: `const xp = 750;

if (xp < 100) {
  console.log("Unranked");
} else if (xp < 500) {
  console.log("Bronze");
} else if (xp < 1000) {
  console.log("Silver");
} else if (xp < 5000) {

} else {

}`,
            hints: ['Fill in the Gold and Diamond branches', '750 XP should output Silver', '5000+ should output Diamond'],
            expectedOutput: ['Silver'],
            codeChecks: [
              { type: 'contains-string', text: 'console.log("Gold")', description: 'Add log for Gold rank' },
              { type: 'contains-string', text: 'console.log("Diamond")', description: 'Add log for Diamond rank' },
            ],
          }
        ]
      },
      {
        id: '06-d-switch',
        title: 'switch Statement',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'control-flow',
        parentId: '06-conditionals',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`switch` is designed for equality-based branching on a single value. It is cleaner than a long `else-if` chain when you have many possible values to check against.\n\n**Critical:** each `case` must end with `break;` to prevent **fall-through** — without `break`, execution continues into the next case regardless of whether it matches. The `default` case (like `else`) runs if nothing matched.'
          },
          {
            type: 'code-example',
            label: 'switch statement',
            code: `const direction = "north";

switch (direction) {
  case "north":
    console.log("Moving north");
    break;
  case "south":
    console.log("Moving south");
    break;
  case "east":
    console.log("Moving east");
    break;
  case "west":
    console.log("Moving west");
    break;
  default:
    console.log("Unknown direction");
}

// Intentional fall-through (group cases)
const day = "Saturday";
switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend!");
    break;
  default:
    console.log("Weekday");
}`
          },
          {
            type: 'quiz',
            question: 'What happens if you forget `break` in a switch case?',
            options: [
              'A SyntaxError is thrown',
              'Only the matched case runs',
              'Execution falls through into the next case',
              'The switch exits automatically'
            ],
            correctIndex: 2,
            explanation: 'Without `break`, execution "falls through" into the next case and continues running regardless of whether it matches. This is occasionally useful for grouping cases, but usually a bug. Always add `break` unless fall-through is intentional.'
          },
          {
            type: 'challenge',
            prompt: 'Complete the switch for HTTP status codes: 200 = "OK", 404 = "Not Found", 500 = "Server Error", default = "Unknown".',
            starterCode: `function getStatusMessage(code) {
  switch (code) {
    case 200:
      return "OK";
    case 404:

    case 500:

    default:

  }
}

console.log(getStatusMessage(200));   // OK
console.log(getStatusMessage(404));   // Not Found
console.log(getStatusMessage(500));   // Server Error
console.log(getStatusMessage(418));   // Unknown`,
            hints: ['Each case needs a return statement (return works like break in a function)', 'case 404: return "Not Found";', 'default: return "Unknown";'],
            expectedOutput: ['OK', 'Not Found', 'Server Error', 'Unknown'],
            codeChecks: [
              { type: 'contains-string', text: 'return "Not Found"', description: 'Return "Not Found" for 404' },
              { type: 'contains-string', text: 'return "Unknown"', description: 'Return "Unknown" as default' },
            ],
          }
        ]
      },
      {
        id: '06-e-nullish',
        title: 'Nullish Coalescing & Optional Chaining',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '06-conditionals',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`??` and `?.` are modern JavaScript operators (ES2020) that make conditional checks on `null`/`undefined` much cleaner.\n\n**`??` (nullish coalescing)** provides a default only when the left side is `null` or `undefined` — not for `0` or `""`.\n\n**`?.` (optional chaining)** safely reads a nested property. If any part of the chain is `null` or `undefined`, it short-circuits and returns `undefined` instead of throwing a `TypeError`.'
          },
          {
            type: 'code-example',
            label: 'Nullish coalescing and optional chaining',
            code: `const config = {
  volume: 0,        // valid value — should not use default
  theme: null       // genuinely absent
};

// ?? respects 0
const volume = config.volume ?? 50;
console.log(volume);  // 0 — correct! || would give 50

// optional chaining on nested objects
const user = { name: "Brian", address: null };

console.log(user?.address?.city);       // undefined — no error
console.log(user?.address?.city ?? "Unknown city");  // Unknown city`
          },
          {
            type: 'quiz',
            question: 'What does `0 ?? "default"` return?',
            options: ['"default"', '0', 'null', 'false'],
            correctIndex: 1,
            explanation: '`??` only falls back to the right side when the left side is `null` or `undefined`. `0` is neither, so `0 ?? "default"` returns `0`.'
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     07 — LOOPS
  ══════════════════════════════════════════ */
  {
    id: '07-loops',
    title: 'Loops',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'control-flow',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'A **loop** repeats a block of code multiple times without you writing it out repeatedly. JavaScript has several loop forms: `for`, `while`, `do...while`, `for...of`, and `for...in`. Choose the form that matches your intent most clearly.'
      },
      {
        type: 'quiz',
        question: 'Which loop is guaranteed to execute its body at least once?',
        options: ['for', 'while', 'do...while', 'for...of'],
        correctIndex: 2,
        explanation: 'A `do...while` loop checks its condition AFTER the first iteration, so the body always runs at least once — even if the condition starts false.'
      }
    ],
    subLessons: [
      {
        id: '07-a-for',
        title: 'for Loop',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The `for` loop has three parts: **initializer** (run once at the start), **condition** (checked before each iteration), and **update** (run after each iteration):\n\n```\nfor (initializer; condition; update) { body }\n```\n\nUse `for` when you know in advance how many times to loop — counting, array indexes, fixed repetitions.'
          },
          {
            type: 'code-example',
            label: 'Classic for loop',
            code: `// Count from 1 to 5
for (let i = 1; i <= 5; i++) {
  console.log("Step:", i);
}

// Loop over array by index
const weapons = ["sword", "bow", "staff"];
for (let i = 0; i < weapons.length; i++) {
  console.log(i, ":", weapons[i]);
}`
          },
          {
            type: 'quiz',
            question: 'In `for (let i = 0; i < 5; i++)`, how many times does the body run?',
            options: ['4', '5', '6', 'Infinite'],
            correctIndex: 1,
            explanation: 'i starts at 0 and runs while i < 5. Values: 0, 1, 2, 3, 4 — that is 5 iterations. When i becomes 5, the condition `5 < 5` is false and the loop ends.'
          },
          {
            type: 'challenge',
            prompt: 'Use a for loop to log the multiplication table of 7 (7×1 through 7×10).',
            starterCode: `for (let i = 1; i <= 10; i++) {
  const result
  console.log(\`7 × \${i} = \${result}\`);
}`,
            hints: ['result = 7 * i', 'The loop goes from i=1 to i=10 inclusive'],
            expectedOutput: ['7 × 1 = 7', '7 × 10 = 70'],
            codeChecks: [
              { type: 'contains-string', text: '7 * i', description: 'Multiply 7 by i inside the loop' },
            ],
          }
        ]
      },
      {
        id: '07-b-while',
        title: 'while Loop',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A `while` loop repeats as long as its condition remains truthy. The condition is checked **before** each iteration.\n\nAlways ensure the condition will eventually become false — if it never does you have an infinite loop which freezes the environment. A common pattern: check a value that your loop body modifies each time.'
          },
          {
            type: 'code-example',
            label: 'while loop — health drain',
            code: `let health = 100;
let round = 1;

while (health > 0) {
  health -= 20;
  console.log(\`Round \${round}: health = \${health}\`);
  round++;
}

console.log("Game over after", round - 1, "rounds");`
          },
          {
            type: 'quiz',
            question: 'What causes an infinite loop?',
            options: [
              'The body runs too slowly',
              'The condition never becomes falsy',
              'Using let instead of const',
              'Having a break statement'
            ],
            correctIndex: 1,
            explanation: 'If the while condition never evaluates to false the loop never ends. This is called an infinite loop and it freezes the page or crashes the Node process. Always make sure something inside the loop will eventually make the condition false.'
          },
          {
            type: 'challenge',
            prompt: 'A bank account starts at €1000. Write a while loop that withdraws €150 each iteration and stops when there is not enough to withdraw.',
            starterCode: `let balance = 1000;
const withdrawal = 150;

while (balance >= withdrawal) {
  balance -= withdrawal;
  console.log("Remaining balance: €" + balance);
}

console.log("Insufficient funds. Final balance: €" + balance);`,
            hints: ['This is complete — run it', 'Try changing withdrawal to see different results'],
            expectedOutput: ['Remaining balance: €850', 'Insufficient funds. Final balance: €100'],
          }
        ]
      },
      {
        id: '07-c-do-while',
        title: 'do...while Loop',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A `do...while` loop is like `while` but checks the condition **after** the body runs. This guarantees the body executes at least once, regardless of whether the condition starts true or false.\n\nUse it when the first execution must happen before you can evaluate whether to continue — like prompting a user for input and then checking if they want to continue.'
          },
          {
            type: 'code-example',
            label: 'do...while loop',
            code: `let attempts = 0;
const MAX_ATTEMPTS = 3;

do {
  attempts++;
  console.log(\`Attempt \${attempts}\`);
  // Simulate: succeed on attempt 2
  if (attempts === 2) {
    console.log("Success!");
    break;
  }
} while (attempts < MAX_ATTEMPTS);`
          },
          {
            type: 'quiz',
            question: 'How many times does a `do...while` body run if the condition is immediately false?',
            options: ['0', '1', '2', 'Infinite'],
            correctIndex: 1,
            explanation: 'The do...while body always runs at least once because the condition is checked AFTER the first iteration. Even if the condition is false from the start, the body runs once before it is evaluated.'
          }
        ]
      },
      {
        id: '07-d-for-of',
        title: 'for...of Loop',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`for...of` iterates over the **values** of any iterable: arrays, strings, Sets, Maps, and more. It is the cleanest way to loop over array elements when you do not need the index.\n\nFor strings it iterates one character at a time. If you need the index alongside the value, use `Array.entries()` with destructuring: `for (const [i, val] of arr.entries())`.'
          },
          {
            type: 'code-example',
            label: 'for...of with arrays and strings',
            code: `const heroes = ["Arthur", "Merlin", "Guinevere"];

for (const hero of heroes) {
  console.log("Hero:", hero);
}

// With index via entries()
for (const [index, hero] of heroes.entries()) {
  console.log(\`\${index + 1}. \${hero}\`);
}

// Over a string
for (const char of "ABC") {
  console.log(char);
}`
          },
          {
            type: 'challenge',
            prompt: 'Use for...of to sum all numbers in the array and log the total.',
            starterCode: `const numbers = [12, 7, 34, 56, 3, 21];
let total = 0;

for (const num of numbers) {
  total += num;
}

console.log("Total:", total); // 133`,
            hints: ['This is complete — run it', 'Try adding more numbers to the array'],
            expectedOutput: ['Total: 133'],
          }
        ]
      },
      {
        id: '07-e-for-in',
        title: 'for...in Loop',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`for...in` iterates over the **enumerable property keys** of an object. It gives you each key as a string, which you can use to access the value with bracket notation.\n\nDo **not** use `for...in` on arrays — it iterates keys (which are string indexes) and also picks up any inherited properties. Use `for...of` or `.forEach()` for arrays.'
          },
          {
            type: 'code-example',
            label: 'for...in on objects',
            code: `const player = {
  name: "Brian",
  level: 12,
  class: "Mage",
  xp: 8400
};

for (const key in player) {
  console.log(\`\${key}: \${player[key]}\`);
}

// Get all keys as array
const keys = Object.keys(player);
console.log(keys);`
          },
          {
            type: 'quiz',
            question: 'What does for...in iterate over on an object?',
            options: ['The values', 'The enumerable keys', 'Both keys and values as pairs', 'Only numeric properties'],
            correctIndex: 1,
            explanation: 'for...in iterates the enumerable property keys (as strings). Use `obj[key]` inside the loop to get the corresponding value.'
          }
        ]
      },
      {
        id: '07-f-break-continue',
        title: 'break & continue',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '07-loops',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**`break`** immediately exits the current loop. Execution continues after the loop.\n\n**`continue`** skips the rest of the current iteration and moves to the next one. The loop continues — only the current iteration is skipped.\n\nBoth work inside `for`, `while`, `do...while`, and `for...of` loops. In a `switch`, `break` exits the switch rather than a loop.'
          },
          {
            type: 'code-example',
            label: 'break and continue',
            code: `// break — exit early
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log("break loop:", i);
}
// logs 0 1 2 3 4

// continue — skip evens
for (let i = 0; i < 8; i++) {
  if (i % 2 === 0) continue;
  console.log("odd:", i);
}
// logs 1 3 5 7`
          },
          {
            type: 'challenge',
            prompt: 'Loop through 1-20. Skip multiples of 3, and stop completely when you reach 15. Log each number you do not skip.',
            starterCode: `for (let i = 1; i <= 20; i++) {
  if (i === 15) break;
  if (i % 3 === 0) continue;
  console.log(i);
}`,
            hints: ['This is complete — run it and verify the output', 'Should log: 1, 2, 4, 5, 7, 8, 10, 11, 13, 14'],
            expectedOutput: ['1', '2', '4', '5', '7', '8', '10', '11', '13', '14'],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     08 — FUNCTIONS
  ══════════════════════════════════════════ */
  {
    id: '08-functions',
    title: 'Functions',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    category: 'control-flow',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'A **function** is a reusable block of code. Instead of writing the same logic multiple times, you define it once and call it by name whenever you need it. Functions accept **inputs** (parameters), do work, and optionally return an **output**.'
      },
      {
        type: 'quiz',
        question: 'What is the main benefit of functions?',
        options: [
          'They make code run faster',
          'They allow code reuse without repetition',
          'They are required for every program',
          'They replace variables'
        ],
        correctIndex: 1,
        explanation: 'Functions let you write logic once and call it many times. This eliminates repetition (DRY — Don\'t Repeat Yourself), makes code easier to test, and makes changes easier since you only update one place.'
      }
    ],
    subLessons: [
      {
        id: '08-a-declarations',
        title: 'Function Declarations',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A **function declaration** uses the `function` keyword. It is **hoisted** — JavaScript moves it to the top of the scope, so you can call a declared function before its definition appears in the source code.\n\nStructure: `function name(parameters) { body }`'
          },
          {
            type: 'code-example',
            label: 'Function declarations',
            code: `// Called before declaration — works due to hoisting
greet("Brian");

function greet(name) {
  console.log("Hello, " + name + "!");
}

function add(a, b) {
  return a + b;
}

const sum = add(3, 7);
console.log("Sum:", sum);  // 10`
          },
          {
            type: 'challenge',
            prompt: 'Write a function `circleArea` that takes a radius and returns the area (π × r²). Log the area for radius 5.',
            starterCode: `function circleArea(radius) {
  return Math.PI * radius ** 2;
}

const area = circleArea(5);
console.log("Area:", area.toFixed(2)); // Area: 78.54`,
            hints: ['Math.PI is the built-in pi constant', 'radius ** 2 squares the radius', 'toFixed(2) rounds to 2 decimal places'],
            expectedOutput: ['Area: 78.54'],
          }
        ]
      },
      {
        id: '08-b-expressions-fn',
        title: 'Function Expressions',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A **function expression** assigns an anonymous function to a variable. Unlike declarations, function expressions are **not hoisted** — you cannot call them before the line they are defined.\n\nBecause they are stored in variables you can pass them to other functions (callbacks), return them from functions, and store them in arrays or objects.'
          },
          {
            type: 'code-example',
            label: 'Function expressions',
            code: `const multiply = function(a, b) {
  return a * b;
};

console.log(multiply(4, 5));  // 20

// Storing functions in objects
const calculator = {
  add: function(a, b) { return a + b; },
  sub: function(a, b) { return a - b; }
};

console.log(calculator.add(10, 3));  // 13
console.log(calculator.sub(10, 3));  // 7`
          },
          {
            type: 'quiz',
            question: 'Can you call a function expression before it is defined?',
            options: [
              'Yes — all functions are hoisted',
              'No — function expressions are not hoisted',
              'Yes — if you use var',
              'Only in strict mode'
            ],
            correctIndex: 1,
            explanation: 'Function expressions are not hoisted. The variable name is hoisted (as undefined with var, or in the temporal dead zone with let/const) but the function is not assigned until that line executes.'
          }
        ]
      },
      {
        id: '08-c-arrow-fns',
        title: 'Arrow Functions',
        difficulty: 'beginner',
        estimatedMinutes: 12,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Arrow functions** are a compact function expression syntax: `(params) => expression`.\n\nIf the body is a single expression the `return` keyword is implicit. If you need multiple statements use `{}` and an explicit `return`.\n\nKey difference: arrow functions do not have their own `this`. This matters in objects and classes — for callbacks and standalone functions they behave the same.'
          },
          {
            type: 'code-example',
            label: 'Arrow function forms',
            code: `// Full syntax
const greet = (name) => {
  return "Hello, " + name;
};

// Single expression — implicit return
const double = n => n * 2;

// No parameters
const getRandom = () => Math.random();

// Multiple params
const add = (a, b) => a + b;

console.log(greet("Brian"));   // Hello, Brian
console.log(double(7));        // 14
console.log(add(3, 4));        // 7`
          },
          {
            type: 'challenge',
            prompt: 'Convert these regular functions to arrow functions.',
            starterCode: `// Convert to arrow functions
const square = function(x) { return x * x; };
const isEven = function(n) { return n % 2 === 0; };
const greet = function(name) { return \`Hi, \${name}!\`; };

console.log(square(5));    // 25
console.log(isEven(4));    // true
console.log(greet("Sam")); // Hi, Sam!`,
            hints: [
              'const square = x => x * x;',
              'const isEven = n => n % 2 === 0;',
              'const greet = name => `Hi, ${name}!`;'
            ],
            expectedOutput: ['25', 'true', 'Hi, Sam!'],
            codeChecks: [
              { type: 'contains-string', text: '=>', description: 'Use arrow function syntax' },
            ],
          }
        ]
      },
      {
        id: '08-d-params-args',
        title: 'Parameters & Arguments',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Parameters** are the names listed in the function definition. **Arguments** are the actual values passed when you call the function.\n\nIf you pass fewer arguments than parameters, the missing ones are `undefined`. If you pass more, the extras are simply ignored (unless you use the `arguments` object or rest params).'
          },
          {
            type: 'code-example',
            label: 'Parameters and arguments',
            code: `function describe(name, level, class_) {
  console.log(\`\${name} — Level \${level} \${class_}\`);
}

describe("Brian", 12, "Mage");      // Brian — Level 12 Mage
describe("Alex", 7);                 // Alex — Level 7 undefined

// Extra arguments are ignored
describe("Sam", 5, "Rogue", "extra"); // Sam — Level 5 Rogue`
          },
          {
            type: 'quiz',
            question: 'What value does an unprovided parameter have?',
            options: ['null', '0', 'undefined', 'Error'],
            correctIndex: 2,
            explanation: 'If an argument is not provided for a parameter, JavaScript assigns `undefined` to that parameter. This is why default parameters (next lesson) are useful — they replace `undefined` with a sensible fallback.'
          }
        ]
      },
      {
        id: '08-e-return',
        title: 'Return Values',
        difficulty: 'beginner',
        estimatedMinutes: 8,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`return` sends a value back to the caller and immediately exits the function. A function without `return` (or with bare `return;`) returns `undefined`.\n\nEarly returns make code cleaner by handling edge cases first. Instead of deeply nested `if/else`, return early and let the main logic be unindented.'
          },
          {
            type: 'code-example',
            label: 'return and early return',
            code: `// Basic return
function square(n) {
  return n * n;
}
console.log(square(5)); // 25

// Early return pattern — cleaner than if/else nesting
function divide(a, b) {
  if (b === 0) return "Cannot divide by zero";
  return a / b;
}

console.log(divide(10, 2));  // 5
console.log(divide(10, 0));  // Cannot divide by zero`
          },
          {
            type: 'challenge',
            prompt: 'Write a function `clamp(value, min, max)` that returns value, but no lower than min and no higher than max.',
            starterCode: `function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

console.log(clamp(5, 0, 10));   // 5
console.log(clamp(-3, 0, 10));  // 0
console.log(clamp(15, 0, 10));  // 10`,
            hints: ['This is complete — run it', 'Early returns handle the edge cases cleanly'],
            expectedOutput: ['5', '0', '10'],
          }
        ]
      },
      {
        id: '08-f-defaults-rest',
        title: 'Default Params & Rest',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'control-flow',
        parentId: '08-functions',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Default parameters** assign a fallback value to a parameter when no argument is provided (or `undefined` is passed): `function greet(name = "Stranger")`.\n\n**Rest parameters** (`...rest`) collect all remaining arguments into an array. The rest parameter must always be last: `function sum(...numbers)`. This replaces the old `arguments` object which did not work in arrow functions.'
          },
          {
            type: 'code-example',
            label: 'Default and rest parameters',
            code: `// Default parameter
function createPlayer(name, level = 1, class_ = "Warrior") {
  return \`\${name} — Level \${level} \${class_}\`;
}
console.log(createPlayer("Brian", 5, "Mage")); // Brian — Level 5 Mage
console.log(createPlayer("Alex"));             // Alex — Level 1 Warrior

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4, 5)); // 15`
          },
          {
            type: 'challenge',
            prompt: 'Write `greetAll(greeting = "Hello", ...names)` that logs the greeting followed by each name.',
            starterCode: `function greetAll(greeting = "Hello", ...names) {
  for (const name of names) {
    console.log(\`\${greeting}, \${name}!\`);
  }
}

greetAll("Hi", "Brian", "Alex", "Sam");
greetAll(undefined, "Merlin");  // uses default greeting`,
            hints: ['This is complete — run it', 'undefined as first arg triggers the default'],
            expectedOutput: ['Hi, Brian!', 'Hi, Alex!', 'Hi, Sam!', 'Hello, Merlin!'],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     09 — SCOPE & CLOSURES
  ══════════════════════════════════════════ */
  {
    id: '09-scope-closures',
    title: 'Scope & Closures',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    category: 'control-flow',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: '**Scope** determines where a variable is accessible. **Closures** are functions that remember the variables from the scope in which they were created, even after that scope has finished executing.\n\nUnderstanding scope and closures is essential for writing predictable, bug-free JavaScript.'
      },
      {
        type: 'quiz',
        question: 'Where is a variable declared with `var` accessible?',
        options: ['Only within its block `{}`', 'Within its function', 'Only in the global scope', 'Anywhere in the file'],
        correctIndex: 1,
        explanation: '`var` is function-scoped. It ignores blocks like `if` and `for`. This is why `let` and `const` were introduced — they are block-scoped and behave more predictably.'
      }
    ],
    subLessons: [
      {
        id: '09-a-global-scope',
        title: 'Global Scope',
        difficulty: 'intermediate',
        estimatedMinutes: 8,
        category: 'control-flow',
        parentId: '09-scope-closures',
        activeRules: ['require-semicolons', 'no-var'],
        sections: [
          {
            type: 'text',
            content: '**Global scope** is the outermost scope — variables declared here are accessible from anywhere in the program.\n\nGlobal variables seem convenient but cause problems: any function can accidentally modify them, name collisions occur across large codebases, and debugging becomes harder. Minimise globals; keep most data inside functions.'
          },
          {
            type: 'code-example',
            label: 'Global vs local scope',
            code: `const APP_NAME = "SYNTHSCRIPT";  // global — accessible everywhere

function showAppName() {
  console.log(APP_NAME);  // can access global
}

showAppName();
console.log(APP_NAME);  // works here too`
          },
          {
            type: 'quiz',
            question: 'Why should you minimise the use of global variables?',
            options: [
              'They run slower than local variables',
              'They can be accidentally modified from anywhere, causing bugs',
              'They are not supported in strict mode',
              'They cannot hold objects'
            ],
            correctIndex: 1,
            explanation: 'Any function anywhere in the codebase can read or overwrite a global. This makes code hard to reason about. Prefer passing data as function arguments and returning results.'
          }
        ]
      },
      {
        id: '09-b-function-scope',
        title: 'Function Scope',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '09-scope-closures',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Variables declared inside a function are **local** — only accessible within that function. Each function call creates a fresh scope.\n\n**Variable shadowing** occurs when a local variable has the same name as an outer one. The inner variable takes precedence within its own scope without changing the outer one.'
          },
          {
            type: 'code-example',
            label: 'Function scope and shadowing',
            code: `const name = "Global Brian";

function getLocalName() {
  const name = "Local Alex";  // shadows the outer name
  console.log(name);           // Local Alex
}

getLocalName();
console.log(name);  // Global Brian — unchanged

// Cannot access local variables outside
function createSecret() {
  const secret = "42";
}
createSecret();
// console.log(secret);  // ReferenceError: secret is not defined`
          },
          {
            type: 'challenge',
            prompt: 'Create a function `makeCounter` that has a private count variable and returns it after incrementing. Call it 3 times.',
            starterCode: `function makeCounter() {
  let count = 0;
  count++;
  return count;
}

console.log(makeCounter()); // 1
console.log(makeCounter()); // 1 — each call has its own count
console.log(makeCounter()); // 1`,
            hints: ['Each function call gets a fresh count=0', 'To persist count across calls you need a closure (next lesson)'],
            expectedOutput: ['1', '1', '1'],
          }
        ]
      },
      {
        id: '09-c-block-scope',
        title: 'Block Scope',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '09-scope-closures',
        activeRules: ['require-semicolons', 'no-var'],
        sections: [
          {
            type: 'text',
            content: '`let` and `const` are **block-scoped** — they only exist within the `{}` block they are declared in. `var` ignores blocks and leaks into the enclosing function, which is why it causes bugs in loops.\n\nAlways prefer `let`/`const` over `var`.'
          },
          {
            type: 'code-example',
            label: 'Block scope vs var leakage',
            code: `// let is block-scoped — safe
for (let i = 0; i < 3; i++) {
  console.log("inside:", i);
}
// console.log(i);  // ReferenceError — i doesn't exist here

// var leaks out of the block — dangerous
for (var j = 0; j < 3; j++) {
  // same loop
}
console.log("outside:", j);  // 3 — j leaked!`
          },
          {
            type: 'quiz',
            question: 'What error do you get when accessing a `let` variable outside its block?',
            options: ['TypeError', 'SyntaxError', 'RangeError', 'ReferenceError'],
            correctIndex: 3,
            explanation: 'Accessing a `let` or `const` variable outside the block it was declared in throws a `ReferenceError` — the variable does not exist in that scope.'
          }
        ]
      },
      {
        id: '09-d-closures',
        title: 'Closures',
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        category: 'control-flow',
        parentId: '09-scope-closures',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A **closure** is a function that "closes over" variables from its outer scope — it remembers them even after the outer function has returned.\n\nEvery function in JavaScript forms a closure. The practical use: private state. You can create a variable in an outer function and return an inner function that has exclusive access to it.'
          },
          {
            type: 'code-example',
            label: 'Closure — counter with private state',
            code: `function createCounter() {
  let count = 0;        // private to this closure

  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.value());  // 2
// count is inaccessible directly — truly private!`
          },
          {
            type: 'quiz',
            question: 'What is the key characteristic of a closure?',
            options: [
              'It runs automatically when a function is created',
              'It remembers variables from its surrounding scope even after that scope ends',
              'It prevents variables from being garbage collected globally',
              'It only works with arrow functions'
            ],
            correctIndex: 1,
            explanation: 'A closure captures a reference to the variables from its enclosing scope. Even after the outer function returns, the inner function retains access to those variables — they are not garbage collected as long as the closure exists.'
          },
          {
            type: 'challenge',
            prompt: 'Create a `makeMultiplier(factor)` function that returns a new function which multiplies its argument by that factor.',
            starterCode: `function makeMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
console.log(double(10));  // 20`,
            hints: ['This is complete — run it', 'Each call to makeMultiplier creates a new closure with its own factor'],
            expectedOutput: ['10', '15', '20'],
          }
        ]
      },
      {
        id: '09-e-hoisting',
        title: 'Hoisting',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'control-flow',
        parentId: '09-scope-closures',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Hoisting** is JavaScript\'s behaviour of moving declarations to the top of their scope before execution.\n\n- **Function declarations** are fully hoisted — you can call them before their definition.\n- **`var`** declarations are hoisted but initialised to `undefined` until assigned.\n- **`let` and `const`** are hoisted to the top of their block but are in the **Temporal Dead Zone (TDZ)** — accessing them before declaration throws a ReferenceError.\n\nFor clarity, always declare variables and functions before using them.'
          },
          {
            type: 'code-example',
            label: 'Hoisting behaviour',
            code: `// Function declaration — hoisted fully
greet();  // works!
function greet() { console.log("Hello"); }

// var — hoisted as undefined
console.log(x);  // undefined (not an error)
var x = 5;
console.log(x);  // 5

// let — TDZ — throws ReferenceError if accessed early
// console.log(y);  // ReferenceError!
let y = 10;`
          },
          {
            type: 'quiz',
            question: 'What is the Temporal Dead Zone (TDZ)?',
            options: [
              'The time between declaring and assigning a var',
              'The zone between let/const declaration and its initialisation where accessing it throws an error',
              'A deprecated zone where eval runs',
              'The scope outside all functions'
            ],
            correctIndex: 1,
            explanation: 'The TDZ is the period from the start of a block to the point where a let/const declaration is reached. Accessing the variable in this zone throws a ReferenceError, unlike var which is quietly undefined.'
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     10 — ARRAYS & OBJECTS
  ══════════════════════════════════════════ */
  {
    id: '10-arrays-objects',
    title: 'Arrays & Objects',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    category: 'advanced',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'Arrays and objects are JavaScript\'s primary data structures. An **array** is an ordered list of values. An **object** is an unordered collection of key-value pairs. Together they model almost any real-world data structure you will encounter.'
      },
      {
        type: 'quiz',
        question: 'What is the index of the first element in a JavaScript array?',
        options: ['1', '-1', '0', 'Depends on the array'],
        correctIndex: 2,
        explanation: 'JavaScript arrays are zero-indexed. The first element is at index 0, second at 1, and so on. `arr[arr.length - 1]` gives the last element.'
      }
    ],
    subLessons: [
      {
        id: '10-a-array-basics',
        title: 'Array Basics',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Create arrays with square brackets. Access elements by their zero-based index. `.length` returns the count.\n\nArrays are objects under the hood, so `typeof []` returns `"object"`. Use `Array.isArray(value)` to reliably check for arrays.'
          },
          {
            type: 'code-example',
            label: 'Array fundamentals',
            code: `const heroes = ["Arthur", "Merlin", "Guinevere"];

console.log(heroes[0]);          // Arthur
console.log(heroes[2]);          // Guinevere
console.log(heroes.length);      // 3
console.log(heroes[heroes.length - 1]);  // last element

// Mixed types (allowed but unusual)
const mixed = [1, "hello", true, null];
console.log(Array.isArray(mixed)); // true`
          },
          {
            type: 'challenge',
            prompt: 'Create an array of 5 favourite games. Log the first, last, and middle elements.',
            starterCode: `const games = ["Zelda", "Dark Souls", "Minecraft", "Portal", "Doom"];

const first = games[0];
const last = games[games.length - 1];
const middle = games[Math.floor(games.length / 2)];

console.log("First:", first);
console.log("Last:", last);
console.log("Middle:", middle);`,
            hints: ['This is complete — run it and change the games array'],
            expectedOutput: ['First: Zelda', 'Last: Doom', 'Middle: Minecraft'],
          }
        ]
      },
      {
        id: '10-b-array-methods-mutate',
        title: 'Array Methods — Mutation',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Some array methods **mutate** (change) the original array:\n\n- `push(item)` — add to end, returns new length\n- `pop()` — remove from end, returns removed item\n- `shift()` — remove from start, returns removed item\n- `unshift(item)` — add to start, returns new length\n- `splice(start, deleteCount, ...items)` — insert/remove at any position'
          },
          {
            type: 'code-example',
            label: 'Mutating array methods',
            code: `const inventory = ["sword", "shield", "potion"];

inventory.push("bow");
console.log(inventory);  // ["sword","shield","potion","bow"]

const dropped = inventory.pop();
console.log(dropped);    // bow
console.log(inventory);  // ["sword","shield","potion"]

inventory.unshift("helmet");
console.log(inventory);  // ["helmet","sword","shield","potion"]

// splice(index, deleteCount, ...newItems)
inventory.splice(1, 1, "axe");  // replace "sword" with "axe"
console.log(inventory);  // ["helmet","axe","shield","potion"]`
          },
          {
            type: 'quiz',
            question: 'Which method adds an element to the END of an array?',
            options: ['unshift', 'push', 'append', 'add'],
            correctIndex: 1,
            explanation: '`push()` adds one or more elements to the end of an array and returns the new length. `unshift()` adds to the beginning. `append` and `add` are not array methods in JavaScript.'
          }
        ]
      },
      {
        id: '10-c-array-iteration',
        title: 'Array Methods — Iteration',
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The powerful non-mutating iteration methods take a **callback function**:\n\n- `forEach(fn)` — runs fn for each element (returns undefined)\n- `map(fn)` — returns a new array with fn applied to each element\n- `filter(fn)` — returns a new array with only elements where fn returns true\n- `reduce(fn, initial)` — reduces array to a single value\n- `find(fn)` — returns the first element where fn returns true\n- `some(fn)` / `every(fn)` — returns boolean'
          },
          {
            type: 'code-example',
            label: 'map, filter, reduce',
            code: `const scores = [45, 82, 67, 91, 38, 75];

// map — transform each element
const doubled = scores.map(s => s * 2);
console.log(doubled);  // [90,164,134,182,76,150]

// filter — keep elements matching condition
const passing = scores.filter(s => s >= 60);
console.log(passing);  // [82,67,91,75]

// reduce — accumulate to single value
const total = scores.reduce((sum, s) => sum + s, 0);
console.log("Average:", total / scores.length);  // 66.33`
          },
          {
            type: 'challenge',
            prompt: 'From the prices array, filter out items over €50, double the remaining prices, then sum them.',
            starterCode: `const prices = [12, 65, 34, 89, 22, 47, 5, 71];

const result = prices
  .filter(p => p <= 50)
  .map(p => p * 2)
  .reduce((sum, p) => sum + p, 0);

console.log("Result:", result); // 240`,
            hints: ['This is complete — run it and verify', 'Chain: filter → map → reduce'],
            expectedOutput: ['Result: 240'],
          }
        ]
      },
      {
        id: '10-d-object-basics',
        title: 'Object Basics',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Objects store key-value pairs. Keys are strings (or Symbols); values can be anything. Access properties with **dot notation** (`obj.name`) or **bracket notation** (`obj["name"]`).\n\nBracket notation is required when the key is a variable, contains spaces, or starts with a number.'
          },
          {
            type: 'code-example',
            label: 'Object basics',
            code: `const player = {
  name: "Brian",
  level: 12,
  class: "Mage",
  hp: 250
};

// Dot notation
console.log(player.name);       // Brian

// Bracket notation
console.log(player["level"]);   // 12

// Dynamic key
const prop = "class";
console.log(player[prop]);      // Mage

// Add / update properties
player.xp = 8400;
player.level = 13;
console.log(player);`
          },
          {
            type: 'challenge',
            prompt: 'Create a `car` object with make, model, year, and mileage. Write a function `carSummary(car)` that returns a template literal describing the car.',
            starterCode: `const car = {
  make: "Toyota",
  model: "Corolla",
  year: 2019,
  mileage: 45000
};

function carSummary(car) {
  return \`\${car.year} \${car.make} \${car.model} — \${car.mileage.toLocaleString()} miles\`;
}

console.log(carSummary(car));`,
            hints: ['toLocaleString() formats numbers with commas', 'Access properties with dot notation inside the template literal'],
            expectedOutput: ['2019 Toyota Corolla — 45,000 miles'],
          }
        ]
      },
      {
        id: '10-e-object-methods',
        title: 'Object Methods & Spread',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`Object.keys(obj)` returns an array of keys. `Object.values(obj)` returns values. `Object.entries(obj)` returns `[key, value]` pairs.\n\nThe **spread operator** `{...obj}` creates a shallow copy of an object. This is the standard way to update objects without mutating the original — create a new object with the spread, then override the properties you want to change.'
          },
          {
            type: 'code-example',
            label: 'Object methods and spread',
            code: `const settings = { theme: "dark", volume: 80, lang: "en" };

console.log(Object.keys(settings));    // ["theme","volume","lang"]
console.log(Object.values(settings));  // ["dark",80,"en"]

// Spread — create a modified copy
const updatedSettings = { ...settings, theme: "light", volume: 60 };
console.log(updatedSettings);  // {theme:"light",volume:60,lang:"en"}
console.log(settings);         // unchanged!`
          },
          {
            type: 'challenge',
            prompt: 'Using Object.entries and a for...of loop, log each setting as "key = value".',
            starterCode: `const config = { fps: 60, resolution: "1080p", fullscreen: true };

for (const [key, value] of Object.entries(config)) {
  console.log(\`\${key} = \${value}\`);
}`,
            hints: ['Object.entries returns [key, value] pairs', 'Destructure each pair in the for...of: [key, value]'],
            expectedOutput: ['fps = 60', 'resolution = 1080p', 'fullscreen = true'],
          }
        ]
      },
      {
        id: '10-f-destructuring',
        title: 'Destructuring',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '10-arrays-objects',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Destructuring** extracts values from arrays or objects into variables in a single statement.\n\n**Object destructuring** `const { name, level } = player` extracts named properties. You can rename: `const { name: playerName } = player`. You can set defaults: `const { name = "Unknown" } = player`.\n\n**Array destructuring** `const [first, second] = arr` extracts by position. Skip elements with commas: `const [,, third] = arr`.'
          },
          {
            type: 'code-example',
            label: 'Destructuring',
            code: `const player = { name: "Brian", level: 12, class: "Mage" };

// Object destructuring
const { name, level, class: playerClass } = player;
console.log(name, level, playerClass);  // Brian 12 Mage

// With defaults
const { name: n, hp = 100 } = player;
console.log(n, hp);  // Brian 100 — hp defaults

// Array destructuring
const rgb = [255, 128, 0];
const [red, green, blue] = rgb;
console.log(red, green, blue);  // 255 128 0

// In function parameters
function display({ name, level }) {
  console.log(\`\${name} (Level \${level})\`);
}
display(player);`
          },
          {
            type: 'challenge',
            prompt: 'Destructure the response object to extract status, data.name, and data.score in one expression each.',
            starterCode: `const response = {
  status: 200,
  data: { name: "Brian", score: 9500, rank: 1 }
};

const { status } = response;
const { name, score } = response.data;

console.log(status);  // 200
console.log(name);    // Brian
console.log(score);   // 9500`,
            hints: ['This is complete — run it', 'Destructure nested objects in two separate statements or use nested destructuring'],
            expectedOutput: ['200', 'Brian', '9500'],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     11 — PROMISES & ASYNC
  ══════════════════════════════════════════ */
  {
    id: '11-promises-async',
    title: 'Promises & Async',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    category: 'advanced',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'JavaScript is **single-threaded** but designed for asynchronous work. Instead of blocking while waiting for a network request or timer, you give JavaScript a function to call when the work is done.\n\nModern JavaScript uses **Promises** and `async/await` to manage async work in a readable, sequential style.'
      },
      {
        type: 'quiz',
        question: 'What are the three states of a Promise?',
        options: [
          'open, processing, done',
          'pending, fulfilled, rejected',
          'waiting, success, error',
          'start, middle, end'
        ],
        correctIndex: 1,
        explanation: 'A Promise is always in one of three states: pending (work in progress), fulfilled (succeeded with a value), or rejected (failed with a reason). Once settled (fulfilled or rejected) a Promise cannot change state.'
      }
    ],
    subLessons: [
      {
        id: '11-a-sync-async',
        title: 'Synchronous vs Asynchronous',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Synchronous** code executes line by line. Each line finishes before the next starts. This is simple but means a slow operation (reading a file, fetching data) would freeze everything.\n\n**Asynchronous** code starts an operation and moves on — a callback, Promise, or `await` is used to handle the result when it arrives. JavaScript uses an **event loop** to process async callbacks when the main thread is idle.'
          },
          {
            type: 'code-example',
            label: 'Sync vs async execution order',
            code: `console.log("1 — start");

setTimeout(() => {
  console.log("3 — timeout callback");
}, 0);

console.log("2 — end");

// Output order: 1, 2, 3
// Even with 0ms delay, setTimeout is async
// — its callback runs after the current synchronous code finishes`
          },
          {
            type: 'quiz',
            question: 'What is the event loop?',
            options: [
              'A for loop that processes DOM events',
              'The mechanism that processes async callbacks when the call stack is empty',
              'A way to create infinite loops safely',
              'A loop that checks for user input'
            ],
            correctIndex: 1,
            explanation: 'The event loop continuously monitors the call stack and the callback queue. When the call stack is empty, it moves the next pending callback from the queue onto the stack to execute. This is how async operations are handled in a single-threaded environment.'
          }
        ]
      },
      {
        id: '11-b-callbacks',
        title: 'Callbacks',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A **callback** is a function passed as an argument to another function, to be called later. Array methods like `map` and `filter` use synchronous callbacks. `setTimeout` uses an asynchronous callback.\n\n**Callback hell** is the deeply-nested code that results from chaining multiple async callbacks — each success callback starts the next async operation. Promises and async/await solve this.'
          },
          {
            type: 'code-example',
            label: 'Callbacks — sync and async',
            code: `// Synchronous callback
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function(n) {
  return n * 2;
});
console.log(doubled);  // [2,4,6,8,10]

// Asynchronous callback with setTimeout
console.log("Before timer");
setTimeout(function() {
  console.log("Timer fired after 1000ms");
}, 1000);
console.log("After timer setup");`
          },
          {
            type: 'quiz',
            question: 'What is "callback hell"?',
            options: [
              'When callbacks throw errors',
              'Deeply nested callbacks making code hard to read',
              'Using too many synchronous callbacks',
              'Callbacks that never execute'
            ],
            correctIndex: 1,
            explanation: 'Callback hell (also called the "pyramid of doom") occurs when multiple async operations are chained as nested callbacks. Code indentation grows with each operation making it hard to read, maintain, and handle errors. Promises flatten this structure.'
          }
        ]
      },
      {
        id: '11-c-promises',
        title: 'Promises',
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'A **Promise** is an object representing the eventual result of an async operation. You create one with `new Promise((resolve, reject) => {...})`.\n\nCall `resolve(value)` when the work succeeds. Call `reject(error)` when it fails. The Promise transitions from pending to fulfilled or rejected and stays there permanently.'
          },
          {
            type: 'code-example',
            label: 'Creating and consuming Promises',
            code: `function fetchScore(userId) {
  return new Promise((resolve, reject) => {
    // Simulate async work
    setTimeout(() => {
      if (userId > 0) {
        resolve({ userId, score: 9500 });
      } else {
        reject(new Error("Invalid user ID"));
      }
    }, 500);
  });
}

fetchScore(1)
  .then(data => console.log("Score:", data.score))
  .catch(err => console.error("Error:", err.message));`
          },
          {
            type: 'quiz',
            question: 'What function makes a Promise succeed?',
            options: ['fulfill()', 'resolve()', 'success()', 'done()'],
            correctIndex: 1,
            explanation: 'Call `resolve(value)` inside a Promise executor to fulfill the Promise with a value. Call `reject(reason)` to reject it. The names `fulfill`, `success`, and `done` are not standard Promise API.'
          }
        ]
      },
      {
        id: '11-d-then-catch',
        title: '.then() and .catch() Chaining',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`.then(onFulfilled)` runs when a Promise resolves. `.catch(onRejected)` runs when any Promise in the chain rejects. `.finally(fn)` runs in both cases (cleanup).\n\nThe key power: `.then()` always returns a new Promise. This lets you **chain** multiple async operations sequentially without nesting.'
          },
          {
            type: 'code-example',
            label: 'Promise chaining',
            code: `function getUser(id) {
  return Promise.resolve({ id, name: "Brian" });
}

function getScore(user) {
  return Promise.resolve({ ...user, score: 9500 });
}

getUser(1)
  .then(user => getScore(user))
  .then(result => {
    console.log(\`\${result.name}: \${result.score}\`);
    return result;
  })
  .catch(err => console.error("Failed:", err.message))
  .finally(() => console.log("Done"));`
          },
          {
            type: 'challenge',
            prompt: 'Chain two Promises: first resolves with a number, second doubles it and logs the result.',
            starterCode: `const p = Promise.resolve(21)
  .then(n => n * 2)
  .then(n => console.log("Result:", n))  // 42
  .catch(err => console.error(err));`,
            hints: ['This is complete — run it', 'Each .then() receives the return value of the previous one'],
            expectedOutput: ['Result: 42'],
          }
        ]
      },
      {
        id: '11-e-async-await',
        title: 'async / await',
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`async/await` is syntactic sugar over Promises. An `async` function always returns a Promise. `await` pauses execution of the async function until the awaited Promise settles — making async code look synchronous.\n\n`await` can only be used inside an `async` function (or at the top level of ES modules).'
          },
          {
            type: 'code-example',
            label: 'async/await',
            code: `async function loadPlayerData(id) {
  // Simulate API call
  const user = await Promise.resolve({ id, name: "Brian" });
  const score = await Promise.resolve(9500);

  return { ...user, score };
}

// Async functions always return a Promise
loadPlayerData(1).then(data => {
  console.log(\`\${data.name} scored \${data.score}\`);
});`
          },
          {
            type: 'quiz',
            question: 'What does `await` do inside an async function?',
            options: [
              'Blocks the entire JavaScript thread',
              'Pauses the async function until the Promise settles, then resumes it',
              'Converts a Promise to a synchronous value',
              'Runs the function on a separate thread'
            ],
            correctIndex: 1,
            explanation: '`await` pauses only the current async function — the rest of the JavaScript engine continues running. When the awaited Promise settles, the async function resumes from where it paused.'
          }
        ]
      },
      {
        id: '11-f-error-handling',
        title: 'Error Handling in Async Code',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '11-promises-async',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'With async/await, wrap `await` calls in `try/catch` blocks to handle rejections. The `catch` block receives the rejection reason. `finally` always runs for cleanup (close connections, hide loaders, etc.).\n\nAlways handle Promise rejections — unhandled rejections produce warnings in Node.js and can crash the process in newer versions.'
          },
          {
            type: 'code-example',
            label: 'try/catch with async/await',
            code: `async function fetchData(shouldFail) {
  try {
    if (shouldFail) throw new Error("Network error");
    const data = await Promise.resolve({ value: 42 });
    console.log("Success:", data.value);
    return data;
  } catch (err) {
    console.error("Caught:", err.message);
    return null;
  } finally {
    console.log("Always runs — cleanup here");
  }
}

fetchData(false);  // Success: 42
fetchData(true);   // Caught: Network error`
          },
          {
            type: 'challenge',
            prompt: 'Write an async function that awaits a potentially failing Promise and handles the error gracefully.',
            starterCode: `function riskyOperation(succeed) {
  return new Promise((resolve, reject) => {
    if (succeed) resolve("Operation successful!");
    else reject(new Error("Operation failed!"));
  });
}

async function runSafely(succeed) {
  try {
    const result = await riskyOperation(succeed);
    console.log(result);
  } catch (err) {
    console.error("Handled:", err.message);
  }
}

runSafely(true);
runSafely(false);`,
            hints: ['This is complete — run it', 'true → success path, false → catch path'],
            expectedOutput: ['Operation successful!', 'Handled: Operation failed!'],
          }
        ]
      }
    ]
  },

  /* ══════════════════════════════════════════
     12 — DOM MANIPULATION
  ══════════════════════════════════════════ */
  {
    id: '12-dom-manipulation',
    title: 'DOM Manipulation',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    category: 'advanced',
    activeRules: [],
    sections: [
      {
        type: 'text',
        content: 'The **Document Object Model (DOM)** is a JavaScript API that represents an HTML page as a tree of objects. You can read and modify this tree with JavaScript — changing text, styles, structure, and responding to user interactions.\n\n**Note:** DOM APIs require a browser environment. The sandbox here runs plain JavaScript — DOM lessons show the API syntax and concepts.'
      },
      {
        type: 'quiz',
        question: 'What does DOM stand for?',
        options: [
          'Document Object Model',
          'Dynamic Object Management',
          'Display Output Module',
          'Data Object Map'
        ],
        correctIndex: 0,
        explanation: 'DOM stands for Document Object Model — a programming interface for HTML and XML documents that represents the page as a tree of nodes. JavaScript can navigate and manipulate this tree.'
      }
    ],
    subLessons: [
      {
        id: '12-a-dom-intro',
        title: 'What is the DOM?',
        difficulty: 'intermediate',
        estimatedMinutes: 10,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'The DOM is a tree-like representation of an HTML document. Every HTML element becomes a **node**. The `document` object is the entry point — it represents the entire page.\n\nCommon node types: Element nodes (HTML tags), Text nodes (the text inside), and Comment nodes. You traverse and manipulate the tree using DOM APIs.'
          },
          {
            type: 'code-example',
            label: 'DOM tree structure (conceptual)',
            code: `
  HTML:
  <html>
    <body>
      <h1 id="title">Hello</h1>
      <p class="intro">World</p>
    </body>
  </html>

  DOM tree:
  document
  └── html
      └── body
          ├── h1 #title ("Hello")
          └── p .intro ("World")


// In a browser environment:
// console.log(document.title);      // page title
// console.log(document.body);       // <body> element
// console.log(document.children);   // all direct children`
          },
          {
            type: 'quiz',
            question: 'What is the entry point object for accessing the DOM?',
            options: ['window', 'html', 'document', 'body'],
            correctIndex: 2,
            explanation: 'The `document` object is the entry point to the DOM. It has methods like `querySelector`, `getElementById`, and `createElement` for selecting and creating elements.'
          }
        ]
      },
      {
        id: '12-b-selecting',
        title: 'Selecting Elements',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Modern JavaScript uses two primary selection methods:\n\n- `document.querySelector(selector)` — returns the first matching element (uses CSS selector syntax)\n- `document.querySelectorAll(selector)` — returns a NodeList of all matching elements\n\nLegacy methods still used: `getElementById(id)`, `getElementsByClassName(cls)`, `getElementsByTagName(tag)`.'
          },
          {
            type: 'code-example',
            label: 'Selection methods',
            code: `//  In a browser — these would work on the page:

// By ID
const title = document.getElementById("title");
const same  = document.querySelector("#title");

// By class
const items = document.querySelectorAll(".nav-item");

// By tag
const buttons = document.querySelectorAll("button");

// Complex CSS selector
const firstLink = document.querySelector("nav a:first-child");

// Convert NodeList to Array for array methods
const itemArray = Array.from(items);
itemArray.forEach(el => console.log(el.textContent));


console.log("DOM APIs require a browser environment");
console.log("Run this lesson code in the browser console");`
          },
          {
            type: 'quiz',
            question: 'What does `querySelectorAll` return when no elements match?',
            options: ['null', 'undefined', 'An empty NodeList', 'An error'],
            correctIndex: 2,
            explanation: '`querySelectorAll` always returns a NodeList (which may be empty). `querySelector` returns `null` when nothing matches. Always check for `null` before using the result of `querySelector`.'
          }
        ]
      },
      {
        id: '12-c-modifying',
        title: 'Modifying Elements',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Once you have a reference to an element you can modify:\n\n- `element.textContent` — change the text (safe, no HTML parsing)\n- `element.innerHTML` — change HTML content (careful with user input — XSS risk)\n- `element.style.property` — inline styles (camelCase: `backgroundColor`)\n- `element.classList.add/remove/toggle/contains` — class manipulation\n- `element.setAttribute(name, value)` — set any attribute'
          },
          {
            type: 'code-example',
            label: 'Modifying elements',
            code: `//  In a browser:

const heading = document.querySelector("h1");

// Text
heading.textContent = "New Heading";

// Style
heading.style.color = "#ff2d9a";
heading.style.fontSize = "2rem";

// Classes
heading.classList.add("highlighted");
heading.classList.remove("muted");
heading.classList.toggle("active");

// Attributes
const link = document.querySelector("a");
link.setAttribute("href", "https://example.com");
link.setAttribute("target", "_blank");


console.log("Try these in your browser DevTools console!");`
          }
        ]
      },
      {
        id: '12-d-creating-removing',
        title: 'Creating & Removing Elements',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: 'Create new elements with `document.createElement(tagName)`. Then set their properties, add children, and insert them into the document with `parent.appendChild(child)` or `parent.insertBefore(child, reference)`.\n\nRemove elements with `element.remove()` (modern) or `parent.removeChild(child)` (older).'
          },
          {
            type: 'code-example',
            label: 'Creating and removing elements',
            code: `//  In a browser:

// Create a new list item
const li = document.createElement("li");
li.textContent = "New item";
li.classList.add("nav-item");

// Append to an existing list
const ul = document.querySelector("ul");
ul.appendChild(li);

// Create with innerHTML (faster for complex HTML)
const card = document.createElement("div");
card.innerHTML = '<h2>Title</h2><p>Body text</p>';
document.body.appendChild(card);

// Remove
const oldItem = document.querySelector(".old");
oldItem.remove();  // modern
// oldItem.parentNode.removeChild(oldItem);  // older


console.log("createElement + appendChild in the browser!");`
          },
          {
            type: 'quiz',
            question: 'Which method is used to create a new HTML element in JavaScript?',
            options: ['document.newElement()', 'document.createElement()', 'document.buildElement()', 'document.makeElement()'],
            correctIndex: 1,
            explanation: '`document.createElement(tagName)` creates a new HTML element. The element exists in memory but is not in the document until you insert it with `appendChild`, `insertBefore`, or similar.'
          }
        ]
      },
      {
        id: '12-e-events',
        title: 'Event Listeners',
        difficulty: 'intermediate',
        estimatedMinutes: 15,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '`element.addEventListener(type, handler)` attaches a function to run when an event occurs. The handler receives an **event object** (`e`) with details about what happened (`e.target`, `e.key`, `e.clientX`, etc.).\n\nCommon events: `click`, `input`, `change`, `submit`, `keydown`, `keyup`, `mouseover`, `mouseout`, `scroll`, `load`.\n\nAlways remove listeners when done to avoid memory leaks: `element.removeEventListener(type, handler)` — requires the same function reference.'
          },
          {
            type: 'code-example',
            label: 'Event listeners',
            code: `//  In a browser:

const button = document.querySelector("button");

// Click event
button.addEventListener("click", function(e) {
  console.log("Clicked!", e.target);
  e.target.style.background = "red";
});

// Keyboard event
document.addEventListener("keydown", (e) => {
  console.log("Key pressed:", e.key, e.code);
  if (e.key === "Escape") {
    console.log("Escape pressed — close modal");
  }
});

// Input event
const input = document.querySelector("input");
input.addEventListener("input", (e) => {
  console.log("Value:", e.target.value);
});


console.log("Add event listeners in the browser!");`
          },
          {
            type: 'quiz',
            question: 'What is the first argument to `addEventListener`?',
            options: ['The handler function', 'The event type string (e.g. "click")', 'The target element', 'Options object'],
            correctIndex: 1,
            explanation: 'The first argument is the event type as a string: "click", "input", "keydown", etc. The second argument is the handler function. The optional third argument is an options object (capture, once, passive, etc.).'
          }
        ]
      },
      {
        id: '12-f-event-delegation',
        title: 'Event Delegation & Bubbling',
        difficulty: 'intermediate',
        estimatedMinutes: 12,
        category: 'advanced',
        parentId: '12-dom-manipulation',
        activeRules: ['require-semicolons'],
        sections: [
          {
            type: 'text',
            content: '**Event bubbling** means an event fired on a child element propagates up through its ancestors — a click on a `<button>` inside a `<li>` inside a `<ul>` fires on all three.\n\n**Event delegation** exploits this: attach one listener to a parent rather than many listeners to each child. Use `e.target` to determine which child was actually clicked. This is more performant and handles dynamically added elements automatically.'
          },
          {
            type: 'code-example',
            label: 'Event delegation',
            code: `// In a browser:

// Instead of this (one listener per button — bad at scale):
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", handleClick);
});

// Use delegation — one listener on the parent:
const toolbar = document.querySelector("#toolbar");

toolbar.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;  // click was not on a button

  const action = btn.dataset.action;
  console.log("Action:", action);

  switch (action) {
    case "save":   save(); break;
    case "delete": deleteItem(); break;
  }
});
// Works for buttons added dynamically after page load!


console.log("Event delegation — one listener rules them all");`
          },
          {
            type: 'quiz',
            question: 'What is the main advantage of event delegation?',
            options: [
              'Events fire faster',
              'One parent listener handles all matching children, including dynamically added ones',
              'It prevents event bubbling',
              'It only works with click events'
            ],
            correctIndex: 1,
            explanation: 'Event delegation puts one listener on a parent element. Because events bubble up, the parent catches clicks on any child. This is efficient and works for elements added to the DOM after the listener was attached.'
          }
        ]
      }
    ]
  }
]