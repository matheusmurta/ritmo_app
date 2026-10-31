import type { Task, TaskOccurrence } from '@/models'
import { dayOfMonth, daysBetween, daysInMonthOf, isoWeekday, todayISO, type ISODate, type Range } from './date'

/** Verifica se a tarefa ocorre na data (considerando a série e o término). */
export function occursOn(task: Task, date: ISODate): boolean {
  if (date < task.date) return false
  const r = task.recurrence
  if (r.kind === 'none') return date === task.date
  if (r.until && date > r.until) return false
  switch (r.kind) {
    case 'daily':
      return true
    case 'weekdays':
      return r.days.includes(isoWeekday(date))
    case 'weekly':
      return isoWeekday(date) === isoWeekday(task.date)
    case 'monthly': {
      // Dia 31 em meses curtos cai no último dia do mês.
      const want = Math.min(dayOfMonth(task.date), daysInMonthOf(date))
      return dayOfMonth(date) === want
    }
    default:
      return false
  }
}

export function occurrenceOf(task: Task, date: ISODate, today: ISODate = todayISO()): TaskOccurrence | null {
  if (!occursOn(task, date)) return null
  const recurring = task.recurrence.kind !== 'none'
  const ov = task.occurrences[date]
  if (ov?.skipped) return null
  // Em séries, cada ocorrência tem status próprio (padrão: pendente); em únicas usa o status da tarefa.
  const status = recurring ? (ov?.status ?? 'pending') : (ov?.status ?? task.status)
  const overdue = date < today && (status === 'pending' || status === 'in_progress')
  return {
    key: `${task.id}@${date}`,
    taskId: task.id,
    task,
    date,
    title: ov?.title ?? task.title,
    time: ov?.time ?? task.time,
    durationMin: ov?.durationMin ?? task.durationMin,
    status,
    categoryId: task.categoryId,
    priority: task.priority,
    recurring,
    overdue,
  }
}

export function sortOccurrences(list: TaskOccurrence[]): TaskOccurrence[] {
  return [...list].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return a.title.localeCompare(b.title, 'pt-BR')
  })
}

export function occurrencesOn(tasks: Task[], date: ISODate, today: ISODate = todayISO()): TaskOccurrence[] {
  const out: TaskOccurrence[] = []
  for (const t of tasks) {
    const o = occurrenceOf(t, date, today)
    if (o) out.push(o)
  }
  return sortOccurrences(out)
}

export function occurrencesInRange(tasks: Task[], range: Range, today: ISODate = todayISO()): TaskOccurrence[] {
  return daysBetween(range.from, range.to).flatMap((d) => occurrencesOn(tasks, d, today))
}
