import { defineStore } from 'pinia'
import type { Habit } from '@/models'
import { nowTimestamp, todayISO, uid, type ISODate } from '@/utils/date'
import { useDataStore } from './data.store'
import { useUiStore } from './ui.store'

export type HabitInput = Pick<Habit, 'name' | 'icon' | 'color' | 'days'> & { startDate?: ISODate }

export const useHabitsStore = defineStore('habits', () => {
  const store = useDataStore()
  const ui = useUiStore()

  function add(input: HabitInput): Habit {
    const h: Habit = { ...input, startDate: input.startDate ?? todayISO(), archived: false, id: uid(), createdAt: nowTimestamp() }
    store.data.habits.push(h)
    return h
  }
  function update(id: string, patch: Partial<HabitInput>) {
    const h = store.data.habits.find((x) => x.id === id)
    if (h) Object.assign(h, patch)
  }
  function remove(id: string) {
    const habit = store.data.habits.find((h) => h.id === id)
    if (!habit) return
    const logs = store.data.habitLogs.filter((l) => l.habitId === id)
    store.data.habits = store.data.habits.filter((h) => h.id !== id)
    store.data.habitLogs = store.data.habitLogs.filter((l) => l.habitId !== id)
    ui.toast('Hábito excluído', 'info', () => {
      store.data.habits.push(habit)
      store.data.habitLogs.push(...logs)
    })
  }
  const isDone = (id: string, date: ISODate) => store.data.habitLogs.some((l) => l.habitId === id && l.date === date)
  function toggle(id: string, date: ISODate = todayISO()) {
    const idx = store.data.habitLogs.findIndex((l) => l.habitId === id && l.date === date)
    if (idx >= 0) store.data.habitLogs.splice(idx, 1)
    else {
      store.data.habitLogs.push({ habitId: id, date })
      ui.toast('Hábito registrado! 🔥', 'success')
    }
  }
  return { add, update, remove, toggle, isDone }
})
