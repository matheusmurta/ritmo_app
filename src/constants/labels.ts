import type { ExerciseType, GoalPeriod, GoalType, Priority, StudyType, TaskStatus } from '@/models'

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
  cancelled: 'Cancelada',
}
export const PRIORITY_LABEL: Record<Priority, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' }
export const STUDY_TYPE_LABEL: Record<StudyType, string> = {
  reading: 'Leitura',
  video: 'Videoaula',
  exercises: 'Exercícios',
  review: 'Revisão',
  project: 'Projeto prático',
  mock: 'Simulado',
}
export const EXERCISE_LABEL: Record<ExerciseType, string> = {
  gym: 'Academia',
  run: 'Corrida',
  walk: 'Caminhada',
  bike: 'Ciclismo',
  swim: 'Natação',
  yoga: 'Yoga',
  functional: 'Treino funcional',
  other: 'Outros',
}
export const EXERCISE_ICON: Record<ExerciseType, string> = {
  gym: 'Dumbbell',
  run: 'Footprints',
  walk: 'Footprints',
  bike: 'Bike',
  swim: 'Waves',
  yoga: 'Leaf',
  functional: 'Flame',
  other: 'Star',
}
export const GOAL_TYPE_LABEL: Record<GoalType, string> = {
  quantitative: 'Quantitativa (ex.: estudar 40 horas)',
  count: 'Por quantidade (ex.: 12 treinos)',
  frequency: 'Por frequência (ex.: 5 dias por semana)',
  binary: 'Binária (concluir um projeto)',
  tasks: 'Por tarefas (checklist)',
}
export const PERIOD_LABEL: Record<GoalPeriod, string> = { weekly: 'Semanal', monthly: 'Mensal', custom: 'Prazo personalizado' }
export const RECURRENCE_LABEL = {
  none: 'Não repete',
  daily: 'Todos os dias',
  weekdays: 'Dias específicos da semana',
  weekly: 'Toda semana',
  monthly: 'Todo mês',
} as const

export const MOTIVATION = [
  'Pronto para mais uma semana produtiva?',
  'Pequenos passos todos os dias constroem grandes resultados.',
  'Consistência vale mais que intensidade.',
  'Um dia de cada vez, no seu ritmo.',
]
