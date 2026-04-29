import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorTab } from '../types/lesson'

interface ConsoleMessage {
  id: string
  type: 'log' | 'warn' | 'error' | 'info' | 'pass' | 'fail'
  content: string
  timestamp: number
}

interface RunHistory {
  id: string
  code: string
  timestamp: number
  hadErrors: boolean
}

interface EditorState {
  // Code content per lesson
  codeByLessonId: Record<string, string>
  
  // Editor state
  activeTab: string
  tabs: EditorTab[]
  
  // Console state
  consoleMessages: ConsoleMessage[]
  maxConsoleMessages: number
  
  // Run history
  runHistory: RunHistory[]
  
  // Cursor position
  cursorPosition: { line: number; column: number }
  
  // Actions
  setCode: (lessonId: string, code: string) => void
  getCode: (lessonId: string) => string
  resetCode: (lessonId: string, starterCode: string) => void
  
  // Tab management
  setActiveTab: (tabId: string) => void
  addTab: (tab: EditorTab) => void
  updateTabContent: (tabId: string, content: string) => void
  
  // Console management
  addConsoleMessage: (type: ConsoleMessage['type'], content: string) => void
  clearConsole: () => void
  
  // Run history
  addRunHistory: (code: string, hadErrors: boolean) => void
  getRunHistory: () => RunHistory[]
  
  // Cursor position
  setCursorPosition: (line: number, column: number) => void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      codeByLessonId: {},
      activeTab: 'challenge',
      tabs: [
        {
          id: 'challenge',
          name: 'challenge.js',
          content: '',
          isReadOnly: false
        },
        {
          id: 'scratch',
          name: 'scratch.js',
          content: '',
          isReadOnly: false
        }
      ],
      consoleMessages: [],
      maxConsoleMessages: 200,
      runHistory: [],
      cursorPosition: { line: 1, column: 1 },

      // Code management
      setCode: (lessonId: string, code: string) => {
        const state = get()
        set({
          codeByLessonId: {
            ...state.codeByLessonId,
            [lessonId]: code
          }
        })
        
        // Also update the active tab content
        const activeTab = state.tabs.find(tab => tab.id === state.activeTab)
        if (activeTab && !activeTab.isReadOnly) {
          get().updateTabContent(state.activeTab, code)
        }
      },

      getCode: (lessonId: string) => {
        const state = get()
        return state.codeByLessonId[lessonId] || ''
      },

      resetCode: (lessonId: string, starterCode: string) => {
        get().setCode(lessonId, starterCode)
      },

      // Tab management
      setActiveTab: (tabId: string) => {
        const state = get()
        const tab = state.tabs.find(t => t.id === tabId)
        if (tab) {
          set({ activeTab: tabId })
        }
      },

      addTab: (tab: EditorTab) => {
        const state = get()
        set({
          tabs: [...state.tabs, tab]
        })
      },

      updateTabContent: (tabId: string, content: string) => {
        const state = get()
        const updatedTabs = state.tabs.map(tab =>
          tab.id === tabId && !tab.isReadOnly
            ? { ...tab, content }
            : tab
        )
        set({ tabs: updatedTabs })
      },

      // Console management
      addConsoleMessage: (type: ConsoleMessage['type'], content: string) => {
        const state = get()
        const newMessage: ConsoleMessage = {
          id: `${Date.now()}-${Math.random()}`,
          type,
          content,
          timestamp: Date.now()
        }

        let updatedMessages = [...state.consoleMessages, newMessage]
        
        // Limit console messages
        if (updatedMessages.length > state.maxConsoleMessages) {
          updatedMessages = updatedMessages.slice(-state.maxConsoleMessages)
        }

        set({ consoleMessages: updatedMessages })
      },

      clearConsole: () => {
        set({ consoleMessages: [] })
      },

      // Run history
      addRunHistory: (code: string, hadErrors: boolean) => {
        const state = get()
        const newHistory: RunHistory = {
          id: `${Date.now()}-${Math.random()}`,
          code,
          timestamp: Date.now(),
          hadErrors
        }

        set({
          runHistory: [newHistory, ...state.runHistory].slice(0, 50) // Keep last 50 runs
        })
      },

      getRunHistory: () => {
        return get().runHistory
      },

      // Cursor position
      setCursorPosition: (line: number, column: number) => {
        set({ cursorPosition: { line, column } })
      }
    }),
    {
      name: 'synthscript-editor-store',
      partialize: (state) => ({
        codeByLessonId: state.codeByLessonId,
        tabs: state.tabs,
        runHistory: state.runHistory.slice(0, 10) // Only persist last 10 runs
      })
    }
  )
)
