import { AppDataSchema } from '@/schemas'
import type { AppData, ExerciseType, Goal, StudyType, Task } from '@/models'
import { addDaysISO, daysBetween, isoWeekday, monthRange, todayISO, weekRange } from '@/utils/date'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const SUBJECTS = ['TypeScript', 'Vue.js', 'Inglês', 'Arquitetura de software']
const STUDY_TYPES: StudyType[] = ['reading', 'video', 'exercises', 'review', 'project']
const EX_TYPES: ExerciseType[] = ['gym', 'gym', 'run', 'walk']

/** Dados de demonstração coerentes entre telas. Vivem só em memória: nunca tocam os dados reais. */
export function buildDemoData(name: string, today = todayISO()): AppData {
  const r = rng(42)
  const ts = new Date().toISOString()
  const week = weekRange(today)
  const month = monthRange(today)
  const base = AppDataSchema.parse({})
  base.profile = { name, onboarded: true, startedAt: addDaysISO(today, -75) + 'T09:00:00.000Z' }
  base.preferences.weeklyStudyGoalMin = 12 * 60
  base.preferences.weeklyWorkoutGoal = 4

  const gStudy = 'demo-g-study', gWork = 'demo-g-work', gRead = 'demo-g-read', gTasks = 'demo-g-tasks'
  type GoalExtra = Pick<Goal, 'categoryId' | 'type' | 'period' | 'startDate' | 'deadline' | 'target' | 'unit' | 'color' | 'icon'>
  const mk = (id: string, name: string, extra: GoalExtra): Goal => ({
    id, name, checklist: [], archived: false, source: 'manual', createdAt: ts, updatedAt: ts, ...extra,
  })
  base.goals = [
    mk(gStudy, 'Estudar programação 12 horas na semana', { categoryId: 'estudos', type: 'quantitative', period: 'weekly', startDate: week.from, deadline: week.to, target: 12, unit: 'h', color: '#7968F8', icon: 'Code' }),
    mk(gWork, 'Treinar quatro vezes por semana', { categoryId: 'exercicios', type: 'count', period: 'weekly', startDate: week.from, deadline: week.to, target: 4, unit: 'treinos', color: '#22B985', icon: 'Dumbbell' }),
    mk(gRead, 'Ler 20 páginas por dia', { categoryId: 'leitura', type: 'frequency', period: 'weekly', startDate: week.from, deadline: week.to, target: 7, unit: 'dias', color: '#4DA9FF', icon: 'BookMarked' }),
    mk(gTasks, 'Organizar 24 tarefas no mês', { categoryId: 'trabalho', type: 'count', period: 'monthly', startDate: month.from, deadline: month.to, target: 24, unit: 'tarefas', color: '#3B5BFF', icon: 'ListChecks' }),
  ]
  base.progress = [{ id: 'demo-p-tasks', goalId: gTasks, date: today, value: 18, note: 'Tarefas organizadas até agora', createdAt: ts }]
  for (const day of daysBetween(week.from, today)) {
    if (isoWeekday(day) !== 3 && isoWeekday(day) !== 6) base.progress.push({ id: `demo-p-read-${day}`, goalId: gRead, date: day, value: 20, createdAt: ts })
  }

  let n = 0
  for (const day of daysBetween(addDaysISO(today, -70), today)) {
    const wd = isoWeekday(day)
    if (r() < (wd <= 5 ? 0.78 : 0.45)) {
      const inWeek = day >= week.from
      base.studySessions.push({
        id: `demo-s-${n++}`, subject: SUBJECTS[Math.floor(r() * SUBJECTS.length)]!, date: day,
        minutes: 30 + Math.floor(r() * 7) * 15, type: STUDY_TYPES[Math.floor(r() * STUDY_TYPES.length)]!,
        goalId: inWeek ? gStudy : undefined, createdAt: ts,
      })
    }
    if (r() < ([1, 3, 5, 6].includes(wd) ? 0.7 : 0.15)) {
      const inWeek = day >= week.from
      base.exercises.push({
        id: `demo-e-${n++}`, type: EX_TYPES[Math.floor(r() * EX_TYPES.length)]!, date: day,
        minutes: 25 + Math.floor(r() * 6) * 10, goalId: inWeek ? gWork : undefined, createdAt: ts,
      })
    }
  }

  base.habits = [
    { id: 'demo-h-read', name: 'Ler diariamente', icon: 'BookOpen', color: '#4DA9FF', days: [1, 2, 3, 4, 5, 6, 7], startDate: addDaysISO(today, -70), archived: false, createdAt: ts },
    { id: 'demo-h-med', name: 'Meditar', icon: 'Brain', color: '#7968F8', days: [1, 2, 3, 4, 5], startDate: addDaysISO(today, -70), archived: false, createdAt: ts },
    { id: 'demo-h-water', name: 'Beber água', icon: 'Droplets', color: '#14B8A6', days: [1, 2, 3, 4, 5, 6, 7], startDate: addDaysISO(today, -70), archived: false, createdAt: ts },
  ]
  for (const h of base.habits) {
    for (const day of daysBetween(h.startDate, today)) {
      if (h.days.includes(isoWeekday(day)) && r() < 0.82 && day !== today) base.habitLogs.push({ habitId: h.id, date: day })
    }
  }

  const rec = (id: string, title: string, categoryId: string, time: string, durationMin: number, kind: 'daily' | 'weekdays', days: number[]): Task => ({
    id, title, categoryId, time, durationMin, priority: 'medium', status: 'pending', date: addDaysISO(today, -70),
    recurrence: { kind, days }, occurrences: {}, createdAt: ts, updatedAt: ts,
  })
  const series = [
    rec('demo-t-ts', 'Estudar TypeScript', 'estudos', '08:00', 60, 'weekdays', [1, 2, 3, 4, 5]),
    rec('demo-t-gym', 'Academia', 'exercicios', '11:00', 60, 'weekdays', [1, 3, 5]),
    rec('demo-t-rev', 'Revisar conteúdo', 'estudos', '14:00', 45, 'weekdays', [1, 2, 3, 4, 5]),
    rec('demo-t-org', 'Organizar tarefas', 'trabalho', '16:00', 20, 'daily', []),
  ]
  for (const t of series) {
    for (const day of daysBetween(t.date, addDaysISO(today, -1))) {
      if (r() < 0.8) t.occurrences[day] = { status: 'done' }
    }
  }
  base.tasks = series
  return AppDataSchema.parse(base)
}
