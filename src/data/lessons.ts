import type { Lesson } from '../types/lesson'

export const lessons: Lesson[] = [
  {
    id: '01-variables-values',
    title: 'Variables & Values',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    activeRules: ['require-semicolons', 'require-assignment-operator'],
    sections: [
      {
        type: 'text',
        content: 'Welcome to JavaScript! Variables are containers for storing data values. In JavaScript, we use **let** and **const** to declare variables.'
      },
      {
        type: 'code-example',
        label: 'EXAMPLE — CORRECT',
        code: `let playerName = "Alex";
const maxScore = 1000;
console.log(playerName);
console.log(maxScore);`
      },
      {
        type: 'quiz',
        question: 'Which is the correct way to declare a variable?',
        options: [
          'variable score = 100;',
          'let score = 100;',
          'score := 100;',
          'declare score = 100;'
        ],
        correctIndex: 1,
        explanation: 'Use the **let** keyword followed by the variable name, an equals sign, and the value, ending with a semicolon.'
      },
      {
        type: 'challenge',
        prompt: 'Declare two variables: `name` with your name as a string, and `age` with your age as a number.',
        starterCode: `// Declare your variables here
let name 
let age

console.log("Name:", name);
console.log("Age:", age);`,
        hints: [
          'Remember to use assignment operator (=) to give values to variables',
          'Strings need quotes around them, numbers do not',
          'Don\'t forget semicolons at the end of each statement'
        ],
        tests: [
          {
            description: 'name should be a string',
            fn: '(output) => typeof output.find(line => line.includes("Name:"))?.split(":")[1]?.trim() === "string"'
          },
          {
            description: 'age should be a number',
            fn: '(output) => !isNaN(parseInt(output.find(line => line.includes("Age:"))?.split(":")[1]?.trim() || ""))'
          }
        ]
      }
    ]
  },
  {
    id: '02-data-types',
    title: 'Data Types',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    activeRules: ['require-semicolons', 'require-assignment-operator'],
    sections: [
      {
        type: 'text',
        content: 'JavaScript has several basic data types: **string** (text), **number** (numeric), **boolean** (true/false), and **undefined** (no value assigned).'
      },
      {
        type: 'code-example',
        label: 'EXAMPLE — DATA TYPES',
        code: `let text = "Hello World";     // string
let count = 42;              // number
let isActive = true;         // boolean
let empty;                   // undefined`
      },
      {
        type: 'quiz',
        question: 'What data type is `true`?',
        options: ['string', 'number', 'boolean', 'undefined'],
        correctIndex: 2,
        explanation: '`true` and `false` are boolean values, representing logical true or false.'
      },
      {
        type: 'challenge',
        prompt: 'Create variables of different types: a string `message`, a number `score`, and a boolean `isComplete`.',
        starterCode: `// Create variables with different types
let message
let score
let isComplete

console.log("Message:", message);
console.log("Score:", score);
console.log("Complete:", isComplete);`,
        hints: [
          'Strings need quotes: "hello"',
          'Numbers are written without quotes: 42',
          'Booleans are only true or false'
        ]
      }
    ]
  },
  {
    id: '03-expressions',
    title: 'Expressions',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    activeRules: ['require-semicolons', 'require-assignment-operator'],
    sections: [
      {
        type: 'text',
        content: 'Expressions are combinations of values, variables, and operators that can be evaluated to produce a result. JavaScript supports arithmetic, comparison, and logical operators.'
      },
      {
        type: 'code-example',
        label: 'EXAMPLE — EXPRESSIONS',
        code: `let x = 10;
let y = 5;
let sum = x + y;           // arithmetic
let isGreater = x > y;     // comparison
let result = sum > 10 && y < 10; // logical`
      },
      {
        type: 'quiz',
        question: 'What is the result of `5 + 3 * 2`?',
        options: ['16', '11', '13', '10'],
        correctIndex: 1,
        explanation: 'JavaScript follows order of operations: multiplication before addition. So `3 * 2 = 6`, then `5 + 6 = 11`.'
      },
      {
        type: 'challenge',
        prompt: 'Calculate the area of a rectangle with width 8 and height 6, then check if the area is greater than 40.',
        starterCode: `let width = 8;
let height = 6;
let area
let isLarge

console.log("Area:", area);
console.log("Is large:", isLarge);`,
        hints: [
          'Area = width × height',
          'Use the > operator to check if area is greater than 40'
        ]
      }
    ]
  },
  {
    id: '04-syntax-rules',
    title: 'Syntax Rules & Semicolons',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    activeRules: ['require-semicolons', 'require-assignment-operator', 'no-var'],
    sections: [
      {
        type: 'text',
        content: 'JavaScript has strict syntax rules. Breaking them causes errors before your code even runs. Every statement should end with a semicolon, and variable declarations need proper assignment operators.'
      },
      {
        type: 'code-example',
        label: 'EXAMPLE — CORRECT',
        code: `let score = 100;
let name = "Player One";
console.log(score);`
      },
      {
        type: 'code-example',
        label: 'EXAMPLE — ERROR',
        code: `let score 100;  // ← missing =
let name = "Brian" // ← missing semicolon`
      },
      {
        type: 'quiz',
        question: 'Which correctly declares and assigns a variable?',
        options: [
          'let score 100;',
          'let score = 100;',
          'variable score = 100;',
          'set score to 100;'
        ],
        correctIndex: 1,
        explanation: 'Use **let** followed by variable name, **=** operator, the value, and end with **;**'
      },
      {
        type: 'challenge',
        prompt: 'Fix the syntax errors in the code below.',
        starterCode: `let playerName "Brian"
let highScore 9500  // ← fix me
const level = 3

console.log("Player: " + playerName);
console.log("Score: " + highScore);
console.log("Level: " + level);`,
        hints: [
          'Check for missing assignment operators (=)',
          'Make sure all statements end with semicolons',
          'const declarations also need semicolons'
        ]
      }
    ]
  }
]
