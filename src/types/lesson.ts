/* SYNTHSCRIPT Lesson Type Definitions */

export type LessonCategory = 'fundamentals' | 'control-flow' | 'advanced'

export interface Lesson {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  activeRules: RuleId[]
  strictMode?: boolean
  category: LessonCategory
  parentId?: string          // set on sub-lessons; points to main lesson id
  subLessons?: Lesson[]      // only on main lessons
  sections: LessonSection[]
}

export type LessonSection =
  | TextSection
  | CodeExampleSection
  | QuizSection
  | ChallengeSection

export interface TextSection {
  type: 'text'
  content: string
}

export interface CodeExampleSection {
  type: 'code-example'
  label?: string
  code: string
  highlightLines?: number[]
}

export interface QuizSection {
  type: 'quiz'
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ChallengeSection {
	id?: string
  type: 'challenge'
  prompt: string
  starterCode: string
  hints?: string[]
  tests?: ChallengeTest[]
}

export interface ChallengeTest {
  id: string
  description: string
  fn: string
}

export interface Diagnostic {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  line: number
  column: number
  tokenName?: string
  messages: {
    short: string
    long: string
    hint?: string
  }
}

export type RuleId =
  | 'require-semicolons'
  | 'require-assignment-operator'
  | 'no-var'
  | 'const-reassignment'
  | 'undefined-variable'
  | 'missing-closing-bracket'

export type PanelType = 'lessons' | 'lesson' | 'editor'

export interface EditorTab {
  id: string
  name: string
  content: string
  isReadOnly?: boolean
}

/** Flat navigation entry — built from the main + sub lesson tree */
export interface NavEntry {
  lessonId: string
  parentId?: string
  isSubLesson: boolean
}