import React from 'react'
import type { LessonSection } from '../../types/lesson'
import { TextSection } from './TextSection'
import { CodeExample } from './CodeExample'
import { QuizBlock } from './QuizBlock'
import { ChallengeSection } from './ChallengeSection'

interface LessonSectionProps {
  section: LessonSection
  onRunExample?: (code: string) => void
}

export const LessonSection: React.FC<LessonSectionProps> = ({ 
  section, 
  onRunExample 
}) => {
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} />
    
    case 'code-example':
      return (
        <CodeExample 
          label={section.label}
          code={section.code}
          highlightLines={section.highlightLines}
          onRun={onRunExample}
        />
      )
    
    case 'quiz':
      return (
        <QuizBlock 
          question={section.question}
          options={section.options}
          correctIndex={section.correctIndex}
          explanation={section.explanation}
        />
      )
    
    case 'challenge':
      return (
        <ChallengeSection 
          prompt={section.prompt}
          starterCode={section.starterCode}
          hints={section.hints}
          tests={section.tests}
        />
      )
    
    default:
      console.warn('Unknown lesson section type:', section)
      return null
  }
}
