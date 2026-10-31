import { defineStore } from 'pinia'
import type { Task, TaskStatus } from '@/models'
import { nowTimestamp, uid, type ISODate } from '@/utils/date'
import { occurrencesOn } from '@/utils/recurrence'
import { useDataStore } from './data.store'
import { useUiStore } from './ui.store'

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'occurrences' | 'status'> & { status?: TaskStatus }

export const useTasksStore = defineStore('tasks', () => {
  const store = useDataStore()
  const ui = useUiStore()

  const find = (id: string) => store.data.tasks.find((t) => t.id === id)

  function add(input: TaskInput): Task {
    const ts = nowTimestamp()
    const task: Task = { status: 'pending', ...input, id: uid(), occurrences: {}, createdAt: ts, updatedAt: ts }
    store.data.tasks.push(task)
    return task
  }
  /** Edita a série inteira (ou a tarefa única). */
  function update(id: string, patch: Partial<TaskInput>) {
    const t = find(id)
    if (!t) return
    Object.assign(t, patch, { updatedAt: nowTimestamp() })
  }
  function remove(id: string) {
    const idx = store.data.tasks.findIndex((t) => t.id === id)
    if (idx < 0) return
    const [removed] = store.data.tasks.splice(idx, 1)
    ui.toast('Tarefa excluída', 'info', () => {
      if (removed) store.data.tasks.splice(Math.min(idx, store.data.tasks.length), 0, removed)
    })
  }
  /** Altera só uma ocorrência. Em tarefas únicas atualiza também o status da própria tarefa. */
  function setStatus(id: string, date: ISODate, status: TaskStatus) {
    const t = find(id)
    if (!t) return
    if (t.recurrence.kind === 'none') t.status = status
    t.occurrences[date] = { ...t.occurrences[date], status }
    t.updatedAt = nowTimestamp()
  }
  function toggleDone(id: string, date: ISODate) {
    const o = occurrencesOn(store.data.tasks, date).find((x) => x.taskId === id)
    if (!o) return
    const next: TaskStatus = o.status === 'done' ? 'pending' : 'done'
    setStatus(id, date, next)
    if (next === 'done') ui.toast('Tarefa concluída! ✅', 'success', () => setStatus(id, date, 'pending'))
  }
  /** Edita apenas uma ocorrência da série. */
  function updateOccurrence(id: string, date: ISODate, patch: { title?: string; time?: string; durationMin?: number }) {
    const t = find(id)
    if (!t) return
    t.occurrences[date] = { ...t.occurrences[date], ...patch }
    t.updatedAt = nowTimestamp()
  }
  /** Exclui apenas uma ocorrência da série. */
  function skipOccurrence(id: string, date: ISODate) {
    const t = find(id)
    if (!t) return
    const before = t.occurrences[date]
    t.occurrences[date] = { ...before, skipped: true }
    ui.toast('Ocorrência removida', 'info', () => {
      const cur = find(id)
      if (!cur) return
      if (before) cur.occurrences[date] = before
      else delete cur.occurrences[date]
    })
  }
  /** Reagenda: tarefa única muda de data; em séries, a ocorrência é pulada e uma tarefa única é criada. */
  function reschedule(id: string, from: ISODate, to: ISODate) {
    const t = find(id)
    if (!t || from === to) return
    if (t.recurrence.kind === 'none') {
      update(id, { date: to })
    } else {
      const o = occurrencesOn(store.data.tasks, from).find((x) => x.taskId === id)
      t.occurrences[from] = { ...t.occurrences[from], skipped: true }
      add({
        title: o?.title ?? t.title, description: t.description, categoryId: t.categoryId, date: to,
        time: o?.time, durationMin: o?.durationMin, priority: t.priority, goalId: t.goalId,
        recurrence: { kind: 'none', days: [] },
      })
    }
    ui.toast('Tarefa reagendada', 'success')
  }

  return { add, update, remove, setStatus, toggleDone, updateOccurrence, skipOccurrence, reschedule, find }
})
