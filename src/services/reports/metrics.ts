import type { AppData, TaskOccurrence } from '@/models'
import { occurrencesInRange } from '@/utils/recurrence'
import { inRange, todayISO, type ISODate, type Range } from '@/utils/date'

/** Percentual real (pode passar de 100). `null` = sem meta/base definida. */
export function percent(done: number, planned: number | null | undefined): number | null {
  if (planned == null || planned <= 0) return null
  return Math.round((done / planned) * 100)
}
/** Valor para barras: limitado a 0–100. */
export const barValue = (p: number | null): number => (p == null ? 0 : Math.max(0, Math.min(100, p)))

export interface Comparison {
  current: number
  previous: number
  /** Variação percentual; null quando o período anterior é 0. */
  change: number | null
  trend: 'up' | 'down' | 'flat'
  label: string
}
export function compare(current: number, previous: number): Comparison {
  const trend = current > previous ? 'up' : current < previous ? 'down' : 'flat'
  if (previous <= 0) {
    return {
      current, previous, change: null, trend,
      label: current > 0 ? 'Sem registros no período anterior' : 'Sem registros para comparar',
    }
  }
  const change = Math.round(((current - previous) / previous) * 100)
  return { current, previous, change, trend, label: `${change > 0 ? '+' : ''}${change}% vs. período anterior` }
}

export const sumStudy = (d: AppData, r: Range): number =>
  d.studySessions.filter((s) => inRange(s.date, r)).reduce((a, s) => a + s.minutes, 0)
export const sumExerciseMin = (d: AppData, r: Range): number =>
  d.exercises.filter((e) => inRange(e.date, r)).reduce((a, e) => a + e.minutes, 0)
export const countExercises = (d: AppData, r: Range): number => d.exercises.filter((e) => inRange(e.date, r)).length

export function studyByDay(d: AppData, r: Range): Record<ISODate, number> {
  const out: Record<ISODate, number> = {}
  for (const s of d.studySessions) if (inRange(s.date, r)) out[s.date] = (out[s.date] ?? 0) + s.minutes
  return out
}
export function studyBySubject(d: AppData, r: Range): { subject: string; minutes: number }[] {
  const m = new Map<string, number>()
  for (const s of d.studySessions) {
    if (!inRange(s.date, r)) continue
    const key = s.subject.trim()
    m.set(key, (m.get(key) ?? 0) + s.minutes)
  }
  return [...m].map(([subject, minutes]) => ({ subject, minutes })).sort((a, b) => b.minutes - a.minutes)
}
export function exerciseByDay(d: AppData, r: Range): Record<ISODate, number> {
  const out: Record<ISODate, number> = {}
  for (const e of d.exercises) if (inRange(e.date, r)) out[e.date] = (out[e.date] ?? 0) + e.minutes
  return out
}
export function exerciseByType(d: AppData, r: Range): { type: string; count: number; minutes: number }[] {
  const m = new Map<string, { count: number; minutes: number }>()
  for (const e of d.exercises) {
    if (!inRange(e.date, r)) continue
    const cur = m.get(e.type) ?? { count: 0, minutes: 0 }
    m.set(e.type, { count: cur.count + 1, minutes: cur.minutes + e.minutes })
  }
  return [...m].map(([type, v]) => ({ type, ...v })).sort((a, b) => b.count - a.count)
}
export function bestDay(byDay: Record<ISODate, number>): { date: ISODate; value: number } | null {
  let best: { date: ISODate; value: number } | null = null
  for (const [date, value] of Object.entries(byDay)) if (value > 0 && (!best || value > best.value)) best = { date, value }
  return best
}

/** Tarefas planejadas no período: ocorrências não canceladas, pela data agendada. */
export function plannedOccurrences(d: AppData, r: Range, today = todayISO()): TaskOccurrence[] {
  return occurrencesInRange(d.tasks, r, today).filter((o) => o.status !== 'cancelled')
}
export function taskStats(d: AppData, r: Range, today = todayISO()) {
  const planned = plannedOccurrences(d, r, today)
  const done = planned.filter((o) => o.status === 'done').length
  return { planned: planned.length, done, pct: percent(done, planned.length) }
}
