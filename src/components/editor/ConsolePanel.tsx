import React from 'react'
import { useEditorStore } from '../../store/editorStore'
import styles from './ConsolePanel.module.css'

export const ConsolePanel: React.FC = () => {
  const { consoleMessages, clearConsole } = useEditorStore()

  const handleClear = () => {
    clearConsole()
  }

  const getMessageTypeClass = (type: string) => {
    switch (type) {
      case 'log': return styles.log
      case 'warn': return styles.warn
      case 'error': return styles.error
      case 'info': return styles.info
      case 'pass': return styles.pass
      case 'fail': return styles.fail
      default: return styles.log
    }
  }

  const formatMessage = (message: string) => {
    // Handle multiple arguments by joining with spaces
    return message
  }

  return (
    <div className={styles.consoleWrap}>
      <div className={styles.consoleBar}>
        <div className={styles.consoleTitle}>
          <div className={styles.statusDot}></div>
          CONSOLE
        </div>
        <button className={styles.clearButton} onClick={handleClear}>
          CLEAR
        </button>
      </div>
      
      <div className={styles.consoleOutput}>
        {consoleMessages.length === 0 ? (
          <div className={styles.emptyMessage}>
            <span className={styles.emptyType}>[info]</span>
            <span className={styles.emptyContent}>Console ready. Run some code to see output here.</span>
          </div>
        ) : (
          consoleMessages.map((message) => (
            <div key={message.id} className={`${styles.consoleLine} ${getMessageTypeClass(message.type)}`}>
              <span className={styles.consoleType}>[{message.type}]</span>
              <span className={styles.consoleMessage}>
                {formatMessage(message.content)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
