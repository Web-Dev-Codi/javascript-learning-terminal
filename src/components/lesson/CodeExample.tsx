import React from 'react'
import styles from './CodeExample.module.css'
import { useSandbox } from '../sandbox/useSandbox'

interface CodeExampleProps {
  label?: string
  code: string
  highlightLines?: number[]
  onRun?: (code: string) => void
}

export const CodeExample: React.FC<CodeExampleProps> = ({
  label,
  code,
  highlightLines
}) => {
  
  // Simple syntax highlighting for JavaScript
  const highlightCode = (code: string): React.ReactNode[] => {
    const lines = code.split('\n')
    return lines.map((line, index) => {
      const lineNumber = index + 1
      const isHighlighted = highlightLines?.includes(lineNumber)

      // Basic syntax highlighting
      const highlightedLine = line
        .replaceAll(/\/\/.*$/gm,
          '<span class="comment">$&</span>')
        .replaceAll(/\/\*[\s\S]*?\*\//g,
          '<span class="comment">$&</span>')
        .replaceAll(/(?<!class=)(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
          '<span class="string">$&</span>')
        .replaceAll(/(?<!<span )\b(let|const|var|function|class)\b/g,
          '<span class="keyword">$1</span>')
        .replaceAll(/(?<!<span )\b(if|else|for|while|do|break|continue|switch|case|default)\b/g,
          '<span class="keyword">$1</span>')
        .replaceAll(/(?<!<span )\b(try|catch|finally|throw)\b/g,
          '<span class="keyword">$1</span>')
        .replaceAll(/(?<!<span )\b(return|new|typeof|instanceof|in|of)\b/g,
          '<span class="keyword">$1</span>')
        .replaceAll(/(?<!<span )\b(extends|import|export|from|async|await)\b/g,
          '<span class="keyword">$1</span>')
        .replaceAll(/\b(true|false|null|undefined)\b/g,
          '<span class="boolean">$1</span>')
        .replaceAll(/\b\d+(\.\d+)?\b/g,
          '<span class="number">$&</span>')
        .replaceAll(/\b(console|Math|Date|Array|Object|String|Number|Boolean|RegExp|JSON|parseInt|parseFloat|isNaN|isFinite|eval|setTimeout|setInterval|clearTimeout|clearInterval)\b/g,
          '<span class="function">$1</span>')

      return (
        <div
          key={lineNumber}
          className={`${styles.codeLine} ${isHighlighted ? styles.highlighted : ''}`}
        >
          <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
        </div>
      )
    })
  }

 

  return (
    <div className={styles.codeExample}>
      {label && (
        <div className={styles.codeLabel}>
          {label}
        </div>
      )}

      <div className={styles.codeBlock}>
        <div className={styles.lineNumbers}>
          {code.split('\n').map((_, index) => (
            <div key={index + 1} className={styles.lineNumber}>
              {index + 1}
            </div>
          ))}
        </div>

        <div className={styles.codeContent}>
          {highlightCode(code)}
        </div>
      </div>
      
    </div>
  )
}
