import type { AppData, Habit } from '@/models'
import { percent } from './metrics'
import { addDaysISO, daysBetween, inRange, isoWeekday, todayISO, type ISODate, type Range } from '@/utils/date'

export const habitScheduled = (h: Habit, date: ISODate): boolean => date >= h.startDate && h.days.includes(isoWeekday(date))
export const habitDone = (d: AppData, habitId: string, date: ISODate): boolean =>
  d.habitLogs.some((l) => l.habitId === habitId && l.date === date)

/** Sequências respeitando só os dias programados; o dia de hoje em aberto não quebra a sequência. */
export function habitStreaks(d: AppData, h: Habit, today = todayISO()) {
  const done = new Set(d.habitLogs.filter((l) => l.habitId === h.id).map((l) => l.date))
  let current = 0
  let cursor = today
  let guard = 0
  while (cursor >= h.startDate && guard++ < 4000) {
    if (habitScheduled(h, cursor)) {
      if (done.has(cursor)) current++
      else if (cursor !== today) break
    }
    cursor = addDaysISO(cursor, -1)
  }
  let best = 0
  let run = 0
  const last = [...done].sort().pop() ?? today
  const end = last > today ? last : today
  if (h.startDate <= end) {
    for (const day of daysBetween(h.startDate, end)) {
      if (!habitScheduled(h, day) && !done.has(day)) continue
      if (done.has(day)) {
        run++
        best = Math.max(best, run)
      } else if (day !== today) run = 0
    }
  }
  return { current, best: Math.max(best, current) }
}

export function habitConsistency(d: AppData, r: Range, today = todayISO()) {
  const end = r.to > today ? today : r.to
  let scheduled = 0
  let done = 0
  if (r.from <= end) {
    for (const h of d.habits) {
      if (h.archived) continue
      for (const day of daysBetween(r.from, end)) {
        if (!habitScheduled(h, day)) continue
        scheduled++
        if (habitDone(d, h.id, day)) done++
      }
    }
  }
  return { scheduled, done, pct: percent(done, scheduled) }
}

export function habitDaysDone(d: AppData, r: Range): number {
  const s = new Set<string>()
  for (const l of d.habitLogs) if (inRange(l.date, r)) s.add(l.date)
  return s.size
}

export function overallStreaks(d: AppData, today = todayISO()) {
  let current = 0
  let best = 0
  for (const h of d.habits.filter((x) => !x.archived)) {
    const s = habitStreaks(d, h, today)
    current = Math.max(current, s.current)
    best = Math.max(best, s.best)
  }
  return { current, best }
}
