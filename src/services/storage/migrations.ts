/** Versão atual do schema persistido. Incrementar ao alterar o formato e adicionar uma migração. */
export const SCHEMA_VERSION = 2

type Migration = (data: Record<string, unknown>) => Record<string, unknown>

/** Migração N atualiza dados da versão N para N+1. */
export const MIGRATIONS: Record<number, Migration> = {
  // v0 -> v1: campo `sessions` foi renomeado para `studySessions`.
  0: (d) => {
    const next = { ...d }
    if (Array.isArray(next.sessions) && !next.studySessions) {
      next.studySessions = next.sessions
      delete next.sessions
    }
    return next
  },
  // v1 -> v2: metas ganharam `source` (manual/study/exercise) e checklist.
  1: (d) => {
    const next = { ...d }
    if (Array.isArray(next.goals)) {
      next.goals = (next.goals as Record<string, unknown>[]).map((g) => ({
        source: 'manual',
        checklist: [],
        ...g,
      }))
    }
    return next
  },
}

export class MigrationError extends Error {}

export function migrate(data: unknown, from: number): Record<string, unknown> {
  if (from > SCHEMA_VERSION) {
    throw new MigrationError(`Os dados foram criados por uma versão mais nova do Ritmo (schema ${from}).`)
  }
  let current = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  for (let v = from; v < SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v]
    if (step) current = step(current)
  }
  return current
}
