import { z } from 'zod'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import {
  CALENDAR_VIEWS, CategorySchema, EXERCISE_TYPES, GoalSchema, ISODateSchema, ProgressEntrySchema, STUDY_TYPES, TaskSchema,
  THEMES, TimeSchema,
} from './entities'

export * from './entities'

const IdSchema = z.string().min(1).max(100)
const TimestampSchema = z.string().min(1).max(40)

export const HabitSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(100),
  icon: z.string().max(40),
  color: z.string().max(20),
  days: z.array(z.number().int().min(1).max(7)).min(1),
  startDate: ISODateSchema,
  archived: z.boolean().default(false),
  createdAt: TimestampSchema,
})
export const HabitLogSchema = z.object({ habitId: IdSchema, date: ISODateSchema })

export const StudySessionSchema = z.object({
  id: IdSchema,
  subject: z.string().min(1).max(100),
  date: ISODateSchema,
  startTime: TimeSchema.optional(),
  minutes: z.number().min(1).max(1440),
  type: z.enum(STUDY_TYPES).default('reading'),
  notes: z.string().max(2000).optional(),
  goalId: z.string().optional(),
  createdAt: TimestampSchema,
})

export const ExerciseSchema = z.object({
  id: IdSchema,
  type: z.enum(EXERCISE_TYPES),
  date: ISODateSchema,
  minutes: z.number().min(1).max(1440),
  distanceKm: z.number().min(0).max(1000).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
  goalId: z.string().optional(),
  createdAt: TimestampSchema,
})

export const AchievementSchema = z.object({ id: IdSchema, unlockedAt: TimestampSchema })

export const TimerSchema = z.object({
  subject: z.string().max(100).default(''),
  type: z.enum(STUDY_TYPES).default('reading'),
  goalId: z.string().optional(),
  startedAt: z.number(),
  accumulatedMs: z.number().min(0),
  resumedAt: z.number().nullable(),
  lastSeenAt: z.number(),
  running: z.boolean(),
})

export const ProfileSchema = z.object({
  name: z.string().max(60).default(''),
  startedAt: TimestampSchema.optional(),
  onboarded: z.boolean().default(false),
})

export const PreferencesSchema = z.object({
  theme: z.enum(THEMES).default('system'),
  reducedMotion: z.boolean().default(false),
  weeklyStudyGoalMin: z.number().min(0).nullable().default(null),
  weeklyWorkoutGoal: z.number().min(0).nullable().default(null),
  calendarView: z.enum(CALENDAR_VIEWS).default('month'),
  repoUrl: z.string().max(300).default(''),
})

export const AppDataSchema = z.object({
  profile: ProfileSchema.default(() => ProfileSchema.parse({})),
  preferences: PreferencesSchema.default(() => PreferencesSchema.parse({})),
  categories: z.array(CategorySchema).default(() => DEFAULT_CATEGORIES.map((c) => ({ ...c }))),
  goals: z.array(GoalSchema).default([]),
  progress: z.array(ProgressEntrySchema).default([]),
  habits: z.array(HabitSchema).default([]),
  habitLogs: z.array(HabitLogSchema).default([]),
  tasks: z.array(TaskSchema).default([]),
  studySessions: z.array(StudySessionSchema).default([]),
  exercises: z.array(ExerciseSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
  timer: TimerSchema.nullable().default(null),
})

export const BackupSchema = z.object({
  app: z.literal('ritmo'),
  schemaVersion: z.number().int().min(0),
  exportedAt: z.string(),
  data: z.unknown(),
})
