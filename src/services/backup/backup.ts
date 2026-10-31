import { AppDataSchema, BackupSchema } from '@/schemas'
import type { AppData } from '@/models'
import { migrate, SCHEMA_VERSION } from '@/services/storage/migrations'

export interface BackupSummary {
  exportedAt: string
  schemaVersion: number
  profileName: string
  counts: { label: string; value: number }[]
}

export function createBackup(data: AppData, now: Date = new Date()): string {
  return JSON.stringify(
    { app: 'ritmo', schemaVersion: SCHEMA_VERSION, exportedAt: now.toISOString(), data },
    null,
    2,
  )
}

export function backupFileName(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `ritmo-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`
}

export const summarize = (data: AppData, exportedAt: string, schemaVersion: number): BackupSummary => ({
  exportedAt,
  schemaVersion,
  profileName: data.profile.name,
  counts: [
    { label: 'Metas', value: data.goals.length },
    { label: 'Hábitos', value: data.habits.length },
    { label: 'Tarefas', value: data.tasks.length },
    { label: 'Sessões de estudo', value: data.studySessions.length },
    { label: 'Exercícios', value: data.exercises.length },
  ],
})

export type ParseResult = { ok: true; data: AppData; summary: BackupSummary } | { ok: false; error: string }

/** Valida um backup SEM executar nada do conteúdo: apenas JSON.parse + Zod. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' }
  }
  const env = BackupSchema.safeParse(raw)
  if (!env.success) return { ok: false, error: 'Este arquivo não parece ser um backup do Ritmo.' }
  if (env.data.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'Este backup foi criado por uma versão mais nova do Ritmo.' }
  }
  let migrated: Record<string, unknown>
  try {
    migrated = migrate(env.data.data, env.data.schemaVersion)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha ao migrar o backup.' }
  }
  const parsed = AppDataSchema.safeParse(migrated)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return { ok: false, error: `Backup com estrutura inválida em "${i?.path.join('.') ?? '?'}".` }
  }
  return { ok: true, data: parsed.data, summary: summarize(parsed.data, env.data.exportedAt, env.data.schemaVersion) }
}
