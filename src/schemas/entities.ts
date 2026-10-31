import { z } from 'zod'

export const TASK_STATUSES = ['pending', 'in_progress', 'done', 'cancelled'] as const
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const RECURRENCE_KINDS = ['none', 'daily', 'weekdays', 'weekly', 'monthly'] as const
export const GOAL_TYPES = ['quantitative', 'count', 'frequency', 'binary', 'tasks'] as const
export const GOAL_PERIODS = ['weekly', 'monthly', 'custom'] as const
export const GOAL_SOURCES = ['manual', 'study', 'exercise'] as const
export const STUDY_TYPES = ['reading', 'video', 'exercises', 'review', 'project', 'mock'] as const
export const EXERCISE_TYPES = ['gym', 'run', 'walk', 'bike', 'swim', 'yoga', 'functional', 'other'] as const
export const THEMES = ['light', 'dark', 'system'] as const
export const CALENDAR_VIEWS = ['month', 'week', 'day'] as const

export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const IdSchema = z.string().min(1).max(100)
const TimestampSchema = z.string().min(1).max(40)

export const CategorySchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(60),
  color: z.string().max(20),
  icon: z.string().max(40),
  builtin: z.boolean().optional(),
})

export const RecurrenceSchema = z.object({
  kind: z.enum(RECURRENCE_KINDS),
  days: z.array(z.number().int().min(1).max(7)).default([]),
  until: ISODateSchema.optional(),
})

export const OccurrenceOverrideSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  time: TimeSchema.optional(),
  title: z.string().max(160).optional(),
  durationMin: z.number().int().min(1).max(1440).optional(),
  skipped: z.boolean().optional(),
})

export const TaskSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  categoryId: z.string(),
  date: ISODateSchema,
  time: TimeSchema.optional(),
  durationMin: z.number().int().min(1).max(1440).optional(),
  priority: z.enum(PRIORITIES).default('medium'),
  status: z.enum(TASK_STATUSES).default('pending'),
  goalId: z.string().optional(),
  recurrence: RecurrenceSchema.default(() => ({ kind: 'none' as const, days: [] })),
  occurrences: z.record(ISODateSchema, OccurrenceOverrideSchema).default({}),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
})

export const ChecklistItemSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(160),
  done: z.boolean().default(false),
})

export const GoalSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  categoryId: z.string(),
  type: z.enum(GOAL_TYPES),
  period: z.enum(GOAL_PERIODS),
  startDate: ISODateSchema,
  deadline: ISODateSchema.optional(),
  target: z.number().nonnegative(),
  unit: z.string().max(30).default(''),
  source: z.enum(GOAL_SOURCES).default('manual'),
  color: z.string().max(20),
  icon: z.string().max(40),
  notes: z.string().max(4000).optional(),
  checklist: z.array(ChecklistItemSchema).default([]),
  completedAt: TimestampSchema.optional(),
  archived: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
})

export const ProgressEntrySchema = z.object({
  id: IdSchema,
  goalId: IdSchema,
  date: ISODateSchema,
  value: z.number(),
  note: z.string().max(500).optional(),
  createdAt: TimestampSchema,
})
