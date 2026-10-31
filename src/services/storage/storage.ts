import { AppDataSchema } from '@/schemas'
import type { AppData } from '@/models'
import { MigrationError, migrate, SCHEMA_VERSION } from './migrations'

export const NS = 'ritmo:'
export const DATA_KEY = `${NS}data`
export const THEME_KEY = `${NS}theme`

export type LoadStatus = 'empty' | 'ok' | 'recovered' | 'corrupt' | 'unavailable' | 'too_new'
export interface LoadResult {
  data: AppData
  status: LoadStatus
  message?: string
}
export interface SaveResult {
  ok: boolean
  error?: string
}

export const emptyData = (): AppData => AppDataSchema.parse({})

function getStorage(): Storage | null {
  try {
    const s = globalThis.localStorage
    if (!s) return null
    const probe = `${NS}probe`
    s.setItem(probe, '1')
    s.removeItem(probe)
    return s
  } catch {
    return null
  }
}

export const isStorageAvailable = (): boolean => getStorage() !== null

/**
 * Interpreta um envelope { schemaVersion, data } já em texto: JSON → migração → validação.
 * Lança erro descritivo quando algo está inválido.
 */
export function parseEnvelope(raw: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('O conteúdo não é um JSON válido.')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Formato inesperado.')
  const env = parsed as { schemaVersion?: unknown; data?: unknown }
  const version = typeof env.schemaVersion === 'number' ? env.schemaVersion : 0
  const migrated = migrate(env.data ?? {}, version)
  const result = AppDataSchema.safeParse(migrated)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(`Dados inválidos em "${issue?.path.join('.') ?? '?'}": ${issue?.message ?? 'erro'}.`)
  }
  return result.data
}

export function load(): LoadResult {
  const s = getStorage()
  if (!s) {
    return { data: emptyData(), status: 'unavailable', message: 'O armazenamento local não está disponível neste navegador.' }
  }
  const raw = s.getItem(DATA_KEY)
  if (raw == null) return { data: emptyData(), status: 'empty' }
  try {
    return { data: parseEnvelope(raw), status: 'ok' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido.'
    // Preserva o conteúdo original para não sobrescrever registros possivelmente recuperáveis.
    try {
      s.setItem(`${NS}corrupt-backup`, raw)
    } catch {
      /* sem espaço: segue sem backup */
    }
    return {
      data: emptyData(),
      status: e instanceof MigrationError ? 'too_new' : 'corrupt',
      message,
    }
  }
}

export function save(data: AppData): SaveResult {
  const s = getStorage()
  if (!s) return { ok: false, error: 'Armazenamento local indisponível.' }
  const check = AppDataSchema.safeParse(data)
  if (!check.success) return { ok: false, error: 'Dados inválidos não foram gravados.' }
  try {
    s.setItem(DATA_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data: check.data }))
    return { ok: true }
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)
    return { ok: false, error: quota ? 'Armazenamento cheio. Exporte um backup e libere espaço.' : 'Não foi possível gravar os dados.' }
  }
}

export function clearAll(): SaveResult {
  const s = getStorage()
  if (!s) return { ok: false, error: 'Armazenamento local indisponível.' }
  try {
    Object.keys(s)
      .filter((k) => k.startsWith(NS))
      .forEach((k) => s.removeItem(k))
    return { ok: true }
  } catch {
    return { ok: false, error: 'Não foi possível apagar os dados.' }
  }
}

export function saveThemePref(theme: string): void {
  try {
    globalThis.localStorage?.setItem(THEME_KEY, JSON.stringify(theme))
  } catch {
    /* ignora */
  }
}

/** Agrupa gravações em sequência (debounce) e permite forçar a gravação pendente. */
export function createDebouncedSaver(write: () => void, delay = 250) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return {
    schedule() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        write()
      }, delay)
    },
    flush() {
      if (timer) {
        clearTimeout(timer)
        timer = null
        write()
      }
    },
  }
}
