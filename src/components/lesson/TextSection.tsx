import React from 'react'
import styles from './TextSection.module.css'

interface TextSectionProps {
  content: string
}

export const TextSection: React.FC<TextSectionProps> = ({ content }) => {
  // Simple markdown-like parser
  const parseContent = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        // Empty line - add spacing
        elements.push(<br key={`br-${index}`} />)
        return
      }

      // Process inline formatting
      let processedLine = line
      const parts: React.ReactNode[] = []
      let lastIndex = 0

      // Handle bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g
      let match
      let boldIndex = 0

      while ((match = boldRegex.exec(text)) !== null) {
        // Add text before the bold
        if (match.index > lastIndex) {
          parts.push(processInlineFormatting(line.substring(lastIndex, match.index)))
        }
        
        // Add bold text
        parts.push(
          <strong key={`bold-${boldIndex++}`}>
            {processInlineFormatting(match[1])}
          </strong>
        )
        
        lastIndex = boldRegex.lastIndex
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(processInlineFormatting(line.substring(lastIndex)))
      }

      // If no bold formatting found, process the whole line
      if (parts.length === 0) {
        parts.push(processInlineFormatting(line))
      }

      elements.push(
        <p key={`line-${index}`} className={styles.textLine}>
          {parts}
        </p>
      )
    })

    return elements
  }

  // Handle inline code `code`
  const processInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let codeIndex = 0

    const codeRegex = /`(.*?)`/g
    let match

    while ((match = codeRegex.exec(text)) !== null) {
      // Add text before the code
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      
      // Add inline code
      parts.push(
        <code key={`code-${codeIndex++}`} className={styles.inlineCode}>
          {match[1]}
        </code>
      )
      
      lastIndex = codeRegex.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    // If no code formatting found, return the original text
    if (parts.length === 0) {
      return text
    }

    return <>{parts}</>
  }

  return (
    <div className={styles.textSection}>
      {parseContent(content)}
    </div>
  )
}
