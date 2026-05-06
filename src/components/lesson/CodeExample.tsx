import { type FC, useEffect } from 'react'
import { useCodeMirror } from '../editor/useCodeMirror'
import styles from './CodeExample.module.css'

interface CodeExampleProps {
  label?: string
  code: string
  highlightLines?: number[]
}

export const CodeExample: FC<CodeExampleProps> = ({
  label,
  code,
  highlightLines,
}) => {
  const { containerRef, createEditor, destroyEditor } = useCodeMirror({
    initialCode: code,
    readOnly: true,
    highlightLines,
  })

  useEffect(() => {
    createEditor()
    return () => {
      destroyEditor()
    }
  }, [createEditor, destroyEditor])

  return (
    <div className={styles.codeExample}>
      {label && (
        <div className={styles.codeLabel}>
          {label}
        </div>
      )}

      <div className={styles.codeBlock}>
        <div ref={containerRef} className={styles.codeEditor} />
      </div>
    </div>
  )
}
