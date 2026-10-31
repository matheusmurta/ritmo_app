import type { AppData, Goal } from '@/models'
import { percent } from './metrics'
import { inRange, rangeLength, todayISO, type Range } from '@/utils/date'

export function goalRange(g: Goal, today = todayISO()): Range {
  return { from: g.startDate, to: g.deadline ?? today }
}

/**
 * Progresso atual da meta, derivado dos registros.
 * Estudos/treinos vinculados contam automaticamente; progresso manual é somado à parte (sem duplicação).
 */
export function goalCurrent(d: AppData, g: Goal, today = todayISO()): number {
  const range = goalRange(g, today)
  if (g.type === 'binary') return g.completedAt ? 1 : 0
  if (g.type === 'tasks') return g.checklist.filter((c) => c.done).length
  const manual = d.progress.filter((p) => p.goalId === g.id && inRange(p.date, range)).reduce((a, p) => a + p.value, 0)
  const study = d.studySessions.filter((s) => s.goalId === g.id && inRange(s.date, range))
  const ex = d.exercises.filter((e) => e.goalId === g.id && inRange(e.date, range))
  let linked = 0
  if (g.type === 'quantitative') {
    if (/^(h|hora|horas)$/i.test(g.unit)) linked = [...study, ...ex].reduce((a, x) => a + x.minutes / 60, 0)
    else if (/^(min|minutos)$/i.test(g.unit)) linked = [...study, ...ex].reduce((a, x) => a + x.minutes, 0)
  } else if (g.type === 'count') {
    linked = study.length + ex.length
  } else if (g.type === 'frequency') {
    linked = new Set([...study, ...ex].map((x) => x.date)).size
  }
  return Math.round((manual + linked) * 100) / 100
}

export function goalTarget(g: Goal): number {
  if (g.type === 'binary') return 1
  if (g.type === 'tasks') return g.checklist.length
  return g.target
}

export function goalProgress(d: AppData, g: Goal, today = todayISO()) {
  const current = goalCurrent(d, g, today)
  const target = goalTarget(g)
  const pct = percent(current, target)
  let expected: number | null = null
  if (g.deadline && g.type !== 'binary' && g.deadline >= g.startDate) {
    const total = rangeLength({ from: g.startDate, to: g.deadline })
    const upTo = today > g.deadline ? g.deadline : today
    const elapsed = upTo < g.startDate ? 0 : rangeLength({ from: g.startDate, to: upTo })
    expected = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : null
  }
  const daysLeft = g.deadline ? rangeLength({ from: today, to: g.deadline }) - 1 : null
  const complete = (target > 0 && current >= target) || !!g.completedAt
  return { current, target, pct, expected, daysLeft, complete }
}

export const activeGoals = (d: AppData): Goal[] => d.goals.filter((g) => !g.archived)

/** Metas que se sobrepõem ao período, e quantas estão concluídas. */
export function goalsInRange(d: AppData, r: Range, today = todayISO()) {
  const list = d.goals.filter((g) => !g.archived && g.startDate <= r.to && (g.deadline ?? '9999-12-31') >= r.from)
  const done = list.filter((g) => goalProgress(d, g, today).complete).length
  return { list, done, total: list.length, pct: percent(done, list.length) }
}
