import { defineStore } from 'pinia'
import type { Exercise } from '@/models'
import { nowTimestamp, uid } from '@/utils/date'
import { useDataStore } from './data.store'
import { useUiStore } from './ui.store'

export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt'>

export const useExercisesStore = defineStore('exercises', () => {
  const store = useDataStore()
  const ui = useUiStore()

  function add(input: ExerciseInput): Exercise {
    const e: Exercise = { ...input, id: uid(), createdAt: nowTimestamp() }
    store.data.exercises.push(e)
    return e
  }
  function update(id: string, patch: Partial<ExerciseInput>) {
    const e = store.data.exercises.find((x) => x.id === id)
    if (e) Object.assign(e, patch)
  }
  function remove(id: string) {
    const idx = store.data.exercises.findIndex((e) => e.id === id)
    if (idx < 0) return
    const [removed] = store.data.exercises.splice(idx, 1)
    ui.toast('Treino excluído', 'info', () => { if (removed) store.data.exercises.push(removed) })
  }
  return { add, update, remove }
})
