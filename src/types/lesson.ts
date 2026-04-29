/* SYNTHSCRIPT Lesson Type Definitions */

export interface Lesson {
  id: string;                       // e.g. "04-syntax-rules"
  title: string;                    // e.g. "Syntax Rules & Semicolons"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  activeRules: RuleId[];            // rules enforced in this lesson's challenge
  strictMode?: boolean;             // if true, warnings become errors
  sections: LessonSection[];
}

export type LessonSection =
  | TextSection
  | CodeExampleSection
  | QuizSection
  | ChallengeSection;

export interface TextSection {
  type: 'text';
  content: string;                  // Markdown-lite string
}

export interface CodeExampleSection {
  type: 'code-example';
  label?: string;                   // e.g. "EXAMPLE — CORRECT"
  code: string;
  highlightLines?: number[];        // lines to visually emphasise
}

export interface QuizSection {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChallengeSection {
  type: 'challenge';
  prompt: string;
  starterCode: string;
  hints?: string[];
  tests?: ChallengeTest[];
}

export interface ChallengeTest {
  description: string;              // e.g. "score should equal 100"
  fn: string;                       // stringified assertion: "(output) => output.score === 100"
}

export interface Diagnostic {
  ruleId: string;                   // e.g. "require-semicolons"
  severity: 'error' | 'warning' | 'info';
  line: number;
  column: number;
  tokenName?: string;               // interpolated into the message
  messages: {
    short: string;
    long: string;
    hint?: string;
  };
}

export type RuleId =
  | 'require-semicolons'
  | 'require-assignment-operator'
  | 'no-var'
  | 'const-reassignment'
  | 'undefined-variable'
  | 'missing-closing-bracket';

export type PanelType = 'lessons' | 'lesson' | 'editor';

export interface EditorTab {
  id: string;
  name: string;
  content: string;
  isReadOnly?: boolean;
}
