import type { AppData } from '@/models'
import { goalsInRange } from './goals'
import { habitConsistency, habitDaysDone, overallStreaks } from './habits'
import { compare, countExercises, percent, sumExerciseMin, sumStudy, taskStats, type Comparison } from './metrics'
import {
  addDaysISO, daysBetween, formatMinutes, previousRange, todayISO, weekRange, type ISODate, type Range,
} from '@/utils/date'

export interface PeriodSummary {
  range: Range
  studyMin: number
  studyGoalMin: number | null
  studyPct: number | null
  workouts: number
  workoutGoal: number | null
  workoutPct: number | null
  exerciseMin: number
  tasks: { planned: number; done: number; pct: number | null }
  goals: { done: number; total: number; pct: number | null }
  habits: { scheduled: number; done: number; pct: number | null }
  habitDays: number
}

/** Metas de estudo/treino são semanais; para outros períodos, escalam proporcionalmente aos dias. */
function scaledGoal(weekly: number | null, range: Range): number | null {
  if (weekly == null || weekly <= 0) return null
  const days = daysBetween(range.from, range.to).length
  return Math.round(weekly * (days / 7) * 10) / 10
}

export function summarizePeriod(d: AppData, range: Range, today = todayISO()): PeriodSummary {
  const studyMin = sumStudy(d, range)
  const workouts = countExercises(d, range)
  const studyGoalMin = scaledGoal(d.preferences.weeklyStudyGoalMin, range)
  const workoutGoal = scaledGoal(d.preferences.weeklyWorkoutGoal, range)
  return {
    range,
    studyMin,
    studyGoalMin,
    studyPct: percent(studyMin, studyGoalMin),
    workouts,
    workoutGoal,
    workoutPct: percent(workouts, workoutGoal),
    exerciseMin: sumExerciseMin(d, range),
    tasks: taskStats(d, range, today),
    goals: goalsInRange(d, range, today),
    habits: habitConsistency(d, range, today),
    habitDays: habitDaysDone(d, range),
  }
}

export interface WeekReport {
  current: PeriodSummary
  previous: PeriodSummary
  study: Comparison
  workouts: Comparison
  exerciseMin: Comparison
  tasks: Comparison
  habits: Comparison
  streak: { current: number; best: number }
}

export function weekReport(d: AppData, anchor: ISODate = todayISO(), today = todayISO()): WeekReport {
  const range = weekRange(anchor)
  const prevRange = previousRange(range)
  const current = summarizePeriod(d, range, today)
  const previous = summarizePeriod(d, prevRange, today)
  return {
    current,
    previous,
    study: compare(current.studyMin, previous.studyMin),
    workouts: compare(current.workouts, previous.workouts),
    exerciseMin: compare(current.exerciseMin, previous.exerciseMin),
    tasks: compare(current.tasks.done, previous.tasks.done),
    habits: compare(current.habits.done, previous.habits.done),
    streak: overallStreaks(d, today),
  }
}

/** Texto para compartilhar (Web Share / cópia). */
export function weekShareText(d: AppData, anchor: ISODate = todayISO()): string {
  const r = weekReport(d, anchor)
  const c = r.current
  const lines = [
    `📊 Meu resumo semanal no Ritmo (${c.range.from.split('-').reverse().slice(0, 2).join('/')} a ${c.range.to.split('-').reverse().slice(0, 2).join('/')})`,
    `🏆 Metas atingidas: ${c.goals.done} de ${c.goals.total}`,
    `📚 Estudos: ${formatMinutes(c.studyMin)}`,
    `💪 Treinos: ${c.workouts} (${formatMinutes(c.exerciseMin)})`,
    `✅ Tarefas: ${c.tasks.done} de ${c.tasks.planned}`,
    `🔥 Hábitos: ${c.habits.done} de ${c.habits.scheduled}`,
    '',
    'Ritmo — Sua melhor versão, todos os dias.',
  ]
  return lines.join('\n')
}

/** Série diária de 0–100 para os gráficos de evolução (somente % comparáveis). */
export interface DailyPoint {
  date: ISODate
  study: number | null
  exercise: number | null
  productivity: number | null
}

/** Aderência semanal (janela móvel de 7 dias que termina em cada dia). */
export function adherenceSeries(d: AppData, range: Range, today = todayISO()): DailyPoint[] {
  const out: DailyPoint[] = []
  for (const day of daysBetween(range.from, range.to)) {
    if (day > today) break
    const win = { from: addDaysISO(day, -6), to: day }
    const s = summarizePeriod(d, win, today)
    out.push({
      date: day,
      study: s.studyPct == null ? null : Math.min(100, s.studyPct),
      exercise: s.workoutPct == null ? null : Math.min(100, s.workoutPct),
      productivity: s.tasks.pct == null ? null : Math.min(100, s.tasks.pct),
    })
  }
  return out
}

/** Semanas (segunda a domingo) que cobrem o intervalo. */
export function weeksIn(range: Range): Range[] {
  const out: Range[] = []
  let cursor = weekRange(range.from).from
  while (cursor <= range.to) {
    out.push({ from: cursor, to: addDaysISO(cursor, 6) })
    cursor = addDaysISO(cursor, 7)
  }
  return out
}
