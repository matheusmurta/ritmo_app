import { defineStore } from 'pinia'
import type { Category, Goal, ProgressEntry } from '@/models'
import { nowTimestamp, todayISO, uid, type ISODate } from '@/utils/date'
import { useDataStore } from './data.store'
import { useUiStore } from './ui.store'

export type GoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'archived' | 'checklist'> & {
  checklist?: Goal['checklist']
}

export const useGoalsStore = defineStore('goals', () => {
  const store = useDataStore()
  const ui = useUiStore()
  const find = (id: string) => store.data.goals.find((g) => g.id === id)

  function add(input: GoalInput): Goal {
    const ts = nowTimestamp()
    const goal: Goal = { checklist: [], ...input, id: uid(), archived: false, createdAt: ts, updatedAt: ts }
    store.data.goals.push(goal)
    return goal
  }
  function update(id: string, patch: Partial<Goal>) {
    const g = find(id)
    if (g) Object.assign(g, patch, { updatedAt: nowTimestamp() })
  }
  function remove(id: string) {
    const goal = find(id)
    if (!goal) return
    const entries = store.data.progress.filter((p) => p.goalId === id)
    store.data.goals = store.data.goals.filter((g) => g.id !== id)
    store.data.progress = store.data.progress.filter((p) => p.goalId !== id)
    // Remove o vínculo de tarefas, estudos e treinos para não deixar referências órfãs.
    const unlink = (list: { goalId?: string }[]) => list.forEach((x) => { if (x.goalId === id) x.goalId = undefined })
    unlink(store.data.tasks)
    unlink(store.data.studySessions)
    unlink(store.data.exercises)
    ui.toast('Meta excluída', 'info', () => {
      store.data.goals.push(goal)
      store.data.progress.push(...entries)
    })
  }
  function addProgress(goalId: string, value: number, date: ISODate = todayISO(), note?: string): ProgressEntry {
    const entry: ProgressEntry = { id: uid(), goalId, date, value, note: note || undefined, createdAt: nowTimestamp() }
    store.data.progress.push(entry)
    return entry
  }
  function removeProgress(id: string) {
    store.data.progress = store.data.progress.filter((p) => p.id !== id)
  }
  function toggleComplete(id: string) {
    const g = find(id)
    if (!g) return
    g.completedAt = g.completedAt ? undefined : nowTimestamp()
    g.updatedAt = nowTimestamp()
  }
  function addChecklistItem(id: string, title: string) {
    find(id)?.checklist.push({ id: uid(), title: title.trim(), done: false })
  }
  function toggleChecklistItem(id: string, itemId: string) {
    const item = find(id)?.checklist.find((c) => c.id === itemId)
    if (item) item.done = !item.done
  }
  function removeChecklistItem(id: string, itemId: string) {
    const g = find(id)
    if (g) g.checklist = g.checklist.filter((c) => c.id !== itemId)
  }

  /* Categorias */
  function addCategory(input: Omit<Category, 'id'>): Category {
    const cat: Category = { ...input, id: uid() }
    store.data.categories.push(cat)
    return cat
  }
  function removeCategory(id: string): boolean {
    const cat = store.data.categories.find((c) => c.id === id)
    if (!cat || cat.builtin) return false
    store.data.categories = store.data.categories.filter((c) => c.id !== id)
    for (const list of [store.data.goals, store.data.tasks]) list.forEach((x) => { if (x.categoryId === id) x.categoryId = 'outros' })
    return true
  }
  const category = (id: string): Category =>
    store.data.categories.find((c) => c.id === id) ?? store.data.categories.find((c) => c.id === 'outros') ?? { id, name: 'Outros', color: '#8A94A8', icon: 'Shapes' }

  return {
    add, update, remove, find, addProgress, removeProgress, toggleComplete, addChecklistItem, toggleChecklistItem,
    removeChecklistItem, addCategory, removeCategory, category,
  }
})
