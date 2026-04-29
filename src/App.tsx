import React from 'react'
import { Header } from './components/layout/Header'
import { Workspace } from './components/layout/Workspace'
import { StatusBar } from './components/layout/StatusBar'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Workspace />
      <StatusBar />
    </div>
  )
}

export default App
