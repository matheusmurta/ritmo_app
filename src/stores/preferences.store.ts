import { computed } from 'vue'
import { defineStore } from 'pinia'
import type { Preferences, ThemeMode } from '@/models'
import { saveThemePref } from '@/services/storage/storage'
import { useDataStore } from './data.store'

export const usePreferencesStore = defineStore('preferences', () => {
  const store = useDataStore()
  const prefs = computed<Preferences>(() => store.data.preferences)

  function setTheme(t: ThemeMode) {
    store.data.preferences.theme = t
    saveThemePref(t)
  }
  const setReducedMotion = (v: boolean) => (store.data.preferences.reducedMotion = v)
  const setStudyGoal = (min: number | null) => (store.data.preferences.weeklyStudyGoalMin = min)
  const setWorkoutGoal = (n: number | null) => (store.data.preferences.weeklyWorkoutGoal = n)
  const setView = (v: Preferences['calendarView']) => (store.data.preferences.calendarView = v)
  const setRepoUrl = (u: string) => (store.data.preferences.repoUrl = u.trim())

  return { prefs, setTheme, setReducedMotion, setStudyGoal, setWorkoutGoal, setView, setRepoUrl }
})
