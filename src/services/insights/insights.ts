import type { AppData } from '@/models'
import { goalsInRange } from '@/services/reports/goals'
import { habitConsistency } from '@/services/reports/habits'
import { bestDay, compare, exerciseByDay, studyByDay, taskStats } from '@/services/reports/metrics'
import { summarizePeriod } from '@/services/reports/summary'
import { daysBetween, formatMinutes, isoWeekday, previousRange, todayISO, weekdayName, type Range } from '@/utils/date'

export interface Insight {
  id: string
  tone: 'positive' | 'neutral' | 'attention'
  text: string
}

const NEED_MORE = 'Registre mais atividades para liberar insights personalizados.'

/** Insights determinísticos: só geram frases quando os dados justificam a conclusão. */
export function generateInsights(d: AppData, range: Range, today = todayISO()): Insight[] {
  const out: Insight[] = []
  const prev = previousRange(range)
  const cur = summarizePeriod(d, range, today)
  const old = summarizePeriod(d, prev, today)

  if (cur.studyMin > 0 && old.studyMin > 0) {
    const c = compare(cur.studyMin, old.studyMin)
    if (c.change != null && c.change >= 5) out.push({ id: 'study-up', tone: 'positive', text: `Você estudou ${c.change}% a mais que no período anterior.` })
    else if (c.change != null && c.change <= -15) out.push({ id: 'study-down', tone: 'attention', text: `Seu tempo de estudos caiu ${Math.abs(c.change)}% em relação ao período anterior.` })
  }
  if (cur.workouts > 0 && old.workouts > 0 && cur.workouts > old.workouts) {
    out.push({ id: 'workout-up', tone: 'positive', text: `Você treinou mais vezes (${cur.workouts}) do que no período anterior (${old.workouts}).` })
  }
  if (cur.workoutGoal != null && cur.workoutGoal > 0 && cur.workouts >= cur.workoutGoal) {
    out.push({ id: 'workout-goal', tone: 'positive', text: 'Você concluiu todos os treinos planejados!' })
  }
  if (cur.tasks.planned > 0) {
    const left = cur.tasks.planned - cur.tasks.done
    if (left === 0) out.push({ id: 'tasks-all', tone: 'positive', text: 'Todas as tarefas do período foram concluídas. Excelente!' })
    else if (left <= 2 && cur.tasks.done > 0) out.push({ id: 'tasks-few', tone: 'neutral', text: `Faltam apenas ${left === 1 ? 'uma tarefa' : 'duas tarefas'} para concluir o período.` })
  }
  const studyDay = bestDay(studyByDay(d, range))
  const studyDays = Object.keys(studyByDay(d, range)).length
  if (studyDay && studyDays >= 3) {
    out.push({ id: 'best-study-day', tone: 'neutral', text: `Seu melhor dia de estudos foi ${weekdayName(isoWeekday(studyDay.date))} (${formatMinutes(studyDay.value)}).` })
  }
  // Dia mais produtivo (tarefas concluídas) – exige amostra mínima.
  const perWeekday = new Map<number, number>()
  let totalDone = 0
  for (const day of daysBetween(range.from, range.to)) {
    const s = taskStats(d, { from: day, to: day }, today)
    perWeekday.set(isoWeekday(day), (perWeekday.get(isoWeekday(day)) ?? 0) + s.done)
    totalDone += s.done
  }
  if (totalDone >= 5) {
    const top = [...perWeekday].sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] > 0) out.push({ id: 'productive-day', tone: 'neutral', text: `Seu dia mais produtivo costuma ser ${weekdayName(top[0])}.` })
  }
  const g = goalsInRange(d, range, today)
  if (g.total >= 2 && g.pct != null && g.pct >= 50) {
    out.push({ id: 'goals-pct', tone: 'positive', text: `Você completou ${g.pct}% das suas metas do período.` })
  }
  const h = habitConsistency(d, range, today)
  if (h.scheduled >= 5 && h.pct != null) {
    if (h.pct >= 80) out.push({ id: 'habit-solid', tone: 'positive', text: `Você manteve seus hábitos em ${h.done} de ${h.scheduled} ocorrências programadas.` })
    else if (h.pct < 40) out.push({ id: 'habit-low', tone: 'attention', text: 'Seus hábitos ficaram abaixo do ritmo. Que tal começar por um só hoje?' })
  }
  const exDays = Object.keys(exerciseByDay(d, range)).length
  if (studyDays >= 4 && studyDays >= Math.ceil(daysBetween(range.from, range.to).length * 0.5)) {
    out.push({ id: 'study-consistent', tone: 'positive', text: 'Você manteve uma rotina de estudos consistente.' })
  }
  if (exDays >= 4 && out.every((i) => i.id !== 'workout-up')) {
    out.push({ id: 'exercise-active', tone: 'positive', text: `Você se exercitou em ${exDays} dias diferentes.` })
  }

  if (out.length === 0) {
    const hasAny = d.studySessions.length + d.exercises.length + d.tasks.length + d.habitLogs.length + d.progress.length > 0
    out.push({ id: 'insufficient', tone: 'neutral', text: hasAny ? 'Ainda não há dados suficientes neste período para gerar conclusões confiáveis.' : NEED_MORE })
  }
  return out
}
