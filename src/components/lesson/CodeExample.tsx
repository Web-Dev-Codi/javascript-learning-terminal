import React from 'react'
import styles from './CodeExample.module.css'

interface CodeExampleProps {
  label?: string
  code: string
  highlightLines?: number[]
  onRun?: (code: string) => void
}

export const CodeExample: React.FC<CodeExampleProps> = ({ 
  label, 
  code, 
  highlightLines, 
  onRun 
}) => {
  // Simple syntax highlighting for JavaScript
  const highlightCode = (code: string): React.ReactNode[] => {
    const lines = code.split('\n')
    return lines.map((line, index) => {
      const lineNumber = index + 1
      const isHighlighted = highlightLines?.includes(lineNumber)
      
      // Basic syntax highlighting
      let highlightedLine = line
        .replace(/\b(let|const|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|typeof|instanceof|in|of|class|extends|import|export|from|async|await)\b/g, 
          '<span class="keyword">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, 
          '<span class="boolean">$1</span>')
        .replace(/\b\d+(\.\d+)?\b/g, 
          '<span class="number">$&</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
          '<span class="string">$&</span>')
        .replace(/\/\/.*$/gm, 
          '<span class="comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, 
          '<span class="comment">$&</span>')
        .replace(/\b(console|Math|Date|Array|Object|String|Number|Boolean|RegExp|JSON|parseInt|parseFloat|isNaN|isFinite|eval|setTimeout|setInterval|clearTimeout|clearInterval)\b/g, 
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

  const handleRunClick = () => {
    if (onRun) {
      onRun(code)
    }
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
      
      {onRun && (
        <button className={styles.runButton} onClick={handleRunClick}>
          ▶ RUN EXAMPLE
        </button>
      )}
    </div>
  )
}
