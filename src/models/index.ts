import type { z } from 'zod'
import type {
  AchievementSchema,
  AppDataSchema,
  CategorySchema,
  ChecklistItemSchema,
  ExerciseSchema,
  GoalSchema,
  HabitLogSchema,
  HabitSchema,
  OccurrenceOverrideSchema,
  PreferencesSchema,
  ProfileSchema,
  ProgressEntrySchema,
  RecurrenceSchema,
  StudySessionSchema,
  TaskSchema,
  TimerSchema,
} from '@/schemas'
import type { ISODate } from '@/utils/date'

/** Modelos de domínio — derivados dos schemas Zod para evitar divergência entre validação e tipos. */
export type AppData = z.infer<typeof AppDataSchema>
export type Category = z.infer<typeof CategorySchema>
export type Recurrence = z.infer<typeof RecurrenceSchema>
export type OccurrenceOverride = z.infer<typeof OccurrenceOverrideSchema>
export type Task = z.infer<typeof TaskSchema>
export type Goal = z.infer<typeof GoalSchema>
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>
export type Habit = z.infer<typeof HabitSchema>
export type HabitLog = z.infer<typeof HabitLogSchema>
export type StudySession = z.infer<typeof StudySessionSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type Achievement = z.infer<typeof AchievementSchema>
export type StudyTimer = z.infer<typeof TimerSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Preferences = z.infer<typeof PreferencesSchema>

export type TaskStatus = Task['status']
export type Priority = Task['priority']
export type GoalType = Goal['type']
export type GoalPeriod = Goal['period']
export type GoalSource = Goal['source']
export type StudyType = StudySession['type']
export type ExerciseType = Exercise['type']
export type ThemeMode = Preferences['theme']
export type CalendarView = Preferences['calendarView']

/** Ocorrência concreta de uma tarefa (única ou recorrente) em uma data. */
export interface TaskOccurrence {
  key: string
  taskId: string
  task: Task
  date: ISODate
  title: string
  time?: string
  durationMin?: number
  status: TaskStatus
  categoryId: string
  priority: Priority
  recurring: boolean
  overdue: boolean
}
