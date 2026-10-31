import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  getISODay,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Data civil local no formato yyyy-MM-dd (nunca convertida para UTC). */
export type ISODate = string
export interface Range {
  from: ISODate
  to: ISODate
}

const WEEK = { weekStartsOn: 1 } as const // segunda-feira
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export const toISO = (d: Date): ISODate => format(d, 'yyyy-MM-dd')
export const fromISO = (s: ISODate): Date => parse(s, 'yyyy-MM-dd', new Date(2000, 0, 1))
export const todayISO = (): ISODate => toISO(new Date())
export const nowTimestamp = (): string => new Date().toISOString()

export function isValidISO(s: unknown): s is ISODate {
  if (typeof s !== 'string' || !ISO_RE.test(s)) return false
  const d = fromISO(s)
  return isValid(d) && toISO(d) === s
}

export const addDaysISO = (s: ISODate, n: number): ISODate => toISO(addDays(fromISO(s), n))
export const addMonthsISO = (s: ISODate, n: number): ISODate => toISO(addMonths(fromISO(s), n))
export const diffDays = (a: ISODate, b: ISODate): number => differenceInCalendarDays(fromISO(a), fromISO(b))
export const isoWeekday = (s: ISODate): number => getISODay(fromISO(s)) // 1 = segunda … 7 = domingo
export const daysInMonthOf = (s: ISODate): number => getDaysInMonth(fromISO(s))
export const dayOfMonth = (s: ISODate): number => Number(s.slice(8, 10))

export function weekRange(s: ISODate): Range {
  const d = fromISO(s)
  return { from: toISO(startOfWeek(d, WEEK)), to: toISO(endOfWeek(d, WEEK)) }
}
export function monthRange(s: ISODate): Range {
  const d = fromISO(s)
  return { from: toISO(startOfMonth(d)), to: toISO(endOfMonth(d)) }
}
export function daysBetween(from: ISODate, to: ISODate): ISODate[] {
  if (from > to) return []
  return eachDayOfInterval({ start: fromISO(from), end: fromISO(to) }).map(toISO)
}
export const rangeLength = (r: Range): number => Math.max(0, diffDays(r.to, r.from) + 1)
export const inRange = (d: ISODate, r: Range): boolean => d >= r.from && d <= r.to
/** Período imediatamente anterior, com a mesma duração. */
export function previousRange(r: Range): Range {
  const n = rangeLength(r)
  return { from: addDaysISO(r.from, -n), to: addDaysISO(r.from, -1) }
}
/** Mesmo intervalo da semana/mês anterior, para visões fechadas. */
export const previousWeek = (s: ISODate): Range => weekRange(addDaysISO(s, -7))
export const previousMonth = (s: ISODate): Range => monthRange(addMonthsISO(s, -1))

/** Grade do calendário mensal: semanas completas de segunda a domingo. */
export function monthGrid(s: ISODate): ISODate[] {
  const m = monthRange(s)
  const start = toISO(startOfWeek(fromISO(m.from), WEEK))
  const end = toISO(endOfWeek(fromISO(m.to), WEEK))
  return daysBetween(start, end)
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
export const formatLong = (s: ISODate): string => cap(format(fromISO(s), "EEEE, d 'de' MMMM", { locale: ptBR }))
export const formatShort = (s: ISODate): string => format(fromISO(s), 'dd/MM')
export const formatFull = (s: ISODate): string => format(fromISO(s), 'dd/MM/yyyy')
export const formatMonth = (s: ISODate): string => cap(format(fromISO(s), 'MMMM yyyy', { locale: ptBR }))
export const formatMonthShort = (s: ISODate): string => format(fromISO(s), 'MMM', { locale: ptBR }).replace('.', '')
export const weekdayShort = (s: ISODate): string => format(fromISO(s), 'EEE', { locale: ptBR }).replace('.', '').toUpperCase()
export const weekdayName = (iso: number): string =>
  ['', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'][iso] ?? ''
export const WEEKDAY_LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
export const WEEKDAY_ABBR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function greeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Minutos → "2h 30min" (armazenamento sempre em minutos). */
export function formatMinutes(total: number): string {
  const m = Math.round(total)
  if (m <= 0) return '0 min'
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r} min`
  return r === 0 ? `${h}h` : `${h}h ${String(r).padStart(2, '0')}min`
}
export function formatMinutesLong(total: number): string {
  const m = Math.round(total)
  const h = Math.floor(m / 60)
  const r = m % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hora' : 'horas'}`)
  if (r > 0 || h === 0) parts.push(`${r} ${r === 1 ? 'minuto' : 'minutos'}`)
  return parts.join(' e ')
}
export const toHours = (min: number): number => Math.round((min / 60) * 10) / 10
export const formatPct = (p: number | null): string => (p == null ? '—' : `${p}%`)
export const formatDuration = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${p(h)}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`
}
export const timeToMinutes = (t: string): number => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
