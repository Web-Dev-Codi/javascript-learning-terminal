import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PanelType, NavEntry } from '../types/lesson'
import { lessons } from '../data/lessons'

interface QuizAnswer {
  lessonId: string
  questionIndex: number
  selectedOption: number
}

interface LessonState {
  activeLesson: string | null
  activePanel: PanelType
  completedLessons: string[]
  startedLessons: string[]
  quizAnswers: QuizAnswer[]
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

  // Navigation helpers
  getFlatNavList: () => NavEntry[]
  navigateNext: () => void
  navigatePrev: () => void
  canNavigateNext: () => boolean
  canNavigatePrev: () => boolean
}

/** Build the flat navigation order: main → sub, main → sub, ... */
function buildFlatNavList(): NavEntry[] {
  const list: NavEntry[] = []
  for (const lesson of lessons) {
    list.push({ lessonId: lesson.id, isSubLesson: false })
    if (lesson.subLessons) {
      for (const sub of lesson.subLessons) {
        list.push({ lessonId: sub.id, parentId: lesson.id, isSubLesson: true })
      }
    }
  }
  return list
}

const flatNav = buildFlatNavList()

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      activeLesson: null,
      activePanel: 'lessons',
      completedLessons: [],
      startedLessons: [],
      quizAnswers: [],
      currentStreak: 0,
      lastCompletedDate: null,

      setActiveLesson: (lessonId: string) => {
        set({ activeLesson: lessonId })
        const state = get()
        if (!state.startedLessons.includes(lessonId)) {
          set({ startedLessons: [...state.startedLessons, lessonId] })
        }
      },

      setActivePanel: (panel: PanelType) => { set({ activePanel: panel }) },

      markLessonStarted: (lessonId: string) => {
        const state = get()
        if (!state.startedLessons.includes(lessonId)) {
          set({ startedLessons: [...state.startedLessons, lessonId] })
        }
      },

      markLessonCompleted: (lessonId: string) => {
        const state = get()
        if (!state.completedLessons.includes(lessonId)) {
          set({ completedLessons: [...state.completedLessons, lessonId] })
          get().updateStreak()
        }
      },

      saveQuizAnswer: (lessonId: string, questionIndex: number, selectedOption: number) => {
        const state = get()
        const idx = state.quizAnswers.findIndex(
          a => a.lessonId === lessonId && a.questionIndex === questionIndex
        )
        const newAnswer: QuizAnswer = { lessonId, questionIndex, selectedOption }
        if (idx >= 0) {
          const updated = [...state.quizAnswers]
          updated[idx] = newAnswer
          set({ quizAnswers: updated })
        } else {
          set({ quizAnswers: [...state.quizAnswers, newAnswer] })
        }
      },

      getQuizAnswer: (lessonId: string, questionIndex: number) => {
        const state = get()
        return state.quizAnswers.find(
          a => a.lessonId === lessonId && a.questionIndex === questionIndex
        )?.selectedOption ?? null
      },

      updateStreak: () => {
        const state = get()
        const today = new Date().toDateString()
        if (state.lastCompletedDate === today) return
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toDateString()
        set({
          currentStreak: state.lastCompletedDate === yesterdayStr
            ? state.currentStreak + 1
            : 1,
          lastCompletedDate: today
        })
      },

      getProgress: () => {
        const state = get()
        const total = flatNav.length
        return { completed: state.completedLessons.length, total }
      },

      isLessonCompleted: (lessonId: string) => get().completedLessons.includes(lessonId),
      isLessonStarted: (lessonId: string) => get().startedLessons.includes(lessonId),

      getFlatNavList: () => flatNav,

      canNavigateNext: () => {
        const { activeLesson } = get()
        if (!activeLesson) return flatNav.length > 0
        const idx = flatNav.findIndex(e => e.lessonId === activeLesson)
        return idx >= 0 && idx < flatNav.length - 1
      },

      canNavigatePrev: () => {
        const { activeLesson } = get()
        if (!activeLesson) return false
        const idx = flatNav.findIndex(e => e.lessonId === activeLesson)
        return idx > 0
      },

      navigateNext: () => {
        const { activeLesson, setActiveLesson } = get()
        if (!activeLesson) {
          if (flatNav.length > 0) setActiveLesson(flatNav[0].lessonId)
          return
        }
        const idx = flatNav.findIndex(e => e.lessonId === activeLesson)
        if (idx >= 0 && idx < flatNav.length - 1) {
          setActiveLesson(flatNav[idx + 1].lessonId)
        }
      },

      navigatePrev: () => {
        const { activeLesson, setActiveLesson } = get()
        if (!activeLesson) return
        const idx = flatNav.findIndex(e => e.lessonId === activeLesson)
        if (idx > 0) setActiveLesson(flatNav[idx - 1].lessonId)
      }
    }),
    {
      name: 'synthscript-lesson-store',
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        startedLessons: state.startedLessons,
        quizAnswers: state.quizAnswers,
        currentStreak: state.currentStreak,
        lastCompletedDate: state.lastCompletedDate,
        activeLesson: state.activeLesson
      })
    }
  )
)

/** Resolve any lesson ID (main or sub) to its Lesson object */
export function findLessonById(id: string) {
  for (const lesson of lessons) {
    if (lesson.id === id) return lesson
    if (lesson.subLessons) {
      const sub = lesson.subLessons.find(s => s.id === id)
      if (sub) return sub
    }
  }
  return null
}

/** Find the parent main lesson for a sub-lesson ID */
export function findParentLesson(subId: string) {
  return lessons.find(l => l.subLessons?.some(s => s.id === subId)) ?? null
}