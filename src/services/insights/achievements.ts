import type { AppData } from '@/models'
import { goalProgress } from '@/services/reports/goals'
import { overallStreaks } from '@/services/reports/habits'
import { summarizePeriod } from '@/services/reports/summary'
import { addDaysISO, todayISO, weekRange } from '@/utils/date'

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  check: (d: AppData, today: string) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-goal', title: 'Primeira meta concluída', description: 'Conclua uma meta.', icon: 'Trophy',
    check: (d, t) => d.goals.some((g) => goalProgress(d, g, t).complete),
  },
  {
    id: 'first-week', title: 'Primeira semana completa', description: 'Conclua todas as tarefas planejadas de uma semana passada.', icon: 'CalendarCheck',
    check: (d, t) => {
      for (let i = 1; i <= 12; i++) {
        const r = weekRange(addDaysISO(t, -7 * i))
        const s = summarizePeriod(d, r, t)
        if (s.tasks.planned >= 3 && s.tasks.done === s.tasks.planned) return true
      }
      return false
    },
  },
  {
    id: 'study-10h', title: 'Dez horas de estudo', description: 'Registre 10 horas de estudo no total.', icon: 'BookOpen',
    check: (d) => d.studySessions.reduce((a, s) => a + s.minutes, 0) >= 600,
  },
  {
    id: 'workout-10', title: 'Dez treinos', description: 'Conclua 10 treinos.', icon: 'Dumbbell',
    check: (d) => d.exercises.length >= 10,
  },
  {
    id: 'streak-7', title: 'Sequência de sete dias', description: 'Mantenha um hábito por 7 ocorrências seguidas.', icon: 'Flame',
    check: (d, t) => overallStreaks(d, t).best >= 7,
  },
]

/** IDs de conquistas cujas condições são atendidas e ainda não foram registradas. */
export function newlyUnlocked(d: AppData, today = todayISO()): AchievementDef[] {
  const have = new Set(d.achievements.map((a) => a.id))
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(d, today))
}
