import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lesson, PanelType } from '../types/lesson'

interface QuizAnswer {
  lessonId: string
  questionIndex: number
  selectedOption: number
}

interface LessonState {
  // Active state
  activeLesson: string | null
  activePanel: PanelType
  
  // Progress tracking
  completedLessons: string[]
  startedLessons: string[]
  quizAnswers: QuizAnswer[]
  
  // Streak tracking
  currentStreak: number
  lastCompletedDate: string | null
  
  // Actions
  setActiveLesson: (lessonId: string) => void
  setActivePanel: (panel: PanelType) => void
  markLessonStarted: (lessonId: string) => void
  markLessonCompleted: (lessonId: string) => void
  saveQuizAnswer: (lessonId: string, questionIndex: number, selectedOption: number) => void
  getQuizAnswer: (lessonId: string, questionIndex: number) => number | null
  updateStreak: () => void
  getProgress: () => { completed: number; total: number }
  isLessonCompleted: (lessonId: string) => boolean
  isLessonStarted: (lessonId: string) => boolean
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeLesson: null,
      activePanel: 'lessons',
      completedLessons: [],
      startedLessons: [],
      quizAnswers: [],
      currentStreak: 0,
      lastCompletedDate: null,

      // Actions
      setActiveLesson: (lessonId: string) => {
        set({ activeLesson: lessonId })
        // Auto-mark as started when lesson is activated
        const state = get()
        if (!state.startedLessons.includes(lessonId)) {
          set({
            startedLessons: [...state.startedLessons, lessonId]
          })
        }
      },

      setActivePanel: (panel: PanelType) => {
        set({ activePanel: panel })
      },

      markLessonStarted: (lessonId: string) => {
        const state = get()
        if (!state.startedLessons.includes(lessonId)) {
          set({
            startedLessons: [...state.startedLessons, lessonId]
          })
        }
      },

      markLessonCompleted: (lessonId: string) => {
        const state = get()
        if (!state.completedLessons.includes(lessonId)) {
          const newCompletedLessons = [...state.completedLessons, lessonId]
          set({ completedLessons: newCompletedLessons })
          
          // Update streak
          get().updateStreak()
        }
      },

      saveQuizAnswer: (lessonId: string, questionIndex: number, selectedOption: number) => {
        const state = get()
        const existingAnswerIndex = state.quizAnswers.findIndex(
          answer => answer.lessonId === lessonId && answer.questionIndex === questionIndex
        )

        const newAnswer: QuizAnswer = {
          lessonId,
          questionIndex,
          selectedOption
        }

        if (existingAnswerIndex >= 0) {
          // Update existing answer
          const updatedAnswers = [...state.quizAnswers]
          updatedAnswers[existingAnswerIndex] = newAnswer
          set({ quizAnswers: updatedAnswers })
        } else {
          // Add new answer
          set({
            quizAnswers: [...state.quizAnswers, newAnswer]
          })
        }
      },

      getQuizAnswer: (lessonId: string, questionIndex: number) => {
        const state = get()
        const answer = state.quizAnswers.find(
          answer => answer.lessonId === lessonId && answer.questionIndex === questionIndex
        )
        return answer?.selectedOption ?? null
      },

      updateStreak: () => {
        const state = get()
        const today = new Date().toDateString()
        const lastCompleted = state.lastCompletedDate

        if (lastCompleted === today) {
          // Already completed today, don't update streak
          return
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toDateString()

        if (lastCompleted === yesterdayString) {
          // Consecutive day, increment streak
          set({
            currentStreak: state.currentStreak + 1,
            lastCompletedDate: today
          })
        } else {
          // Not consecutive, reset streak
          set({
            currentStreak: 1,
            lastCompletedDate: today
          })
        }
      },

      getProgress: () => {
        const state = get()
        return {
          completed: state.completedLessons.length,
          total: 12 // This should match the total number of lessons
        }
      },

      isLessonCompleted: (lessonId: string) => {
        const state = get()
        return state.completedLessons.includes(lessonId)
      },

      isLessonStarted: (lessonId: string) => {
        const state = get()
        return state.startedLessons.includes(lessonId)
      }
    }),
    {
      name: 'synthscript-lesson-store',
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        startedLessons: state.startedLessons,
        quizAnswers: state.quizAnswers,
        currentStreak: state.currentStreak,
        lastCompletedDate: state.lastCompletedDate
      })
    }
  )
)
