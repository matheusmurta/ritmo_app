import { describe, expect, it } from 'vitest'
import { addDaysISO, formatMinutes, isValidISO, monthGrid, monthRange, previousRange, weekRange, isoWeekday } from '@/utils/date'
import { occursOn, occurrencesOn } from '@/utils/recurrence'
import { barValue, compare, percent, sumExerciseMin, sumStudy } from '@/services/reports/metrics'
import { emptyData } from '@/services/storage/storage'
import type { AppData, Task } from '@/models'

const ts = '2026-01-01T00:00:00.000Z'
const task = (p: Partial<Task>): Task => ({ id: 't', title: 'T', categoryId: 'estudos', date: '2026-03-02', priority: 'medium', status: 'pending', recurrence: { kind: 'none', days: [] }, occurrences: {}, createdAt: ts, updatedAt: ts, ...p })

describe('percentual', () => {
  it('trata divisão por zero e distingue sem meta de 0%', () => {
    expect(percent(5, 0)).toBeNull()
    expect(percent(5, null)).toBeNull()
    expect(percent(0, 10)).toBe(0)
    expect(percent(6, 8)).toBe(75)
    expect(percent(15, 10)).toBe(150)
    expect(barValue(150)).toBe(100)
  })
})

describe('datas', () => {
  it('semana começa na segunda e respeita ano bissexto', () => {
    expect(weekRange('2026-03-04')).toEqual({ from: '2026-03-02', to: '2026-03-08' })
    expect(monthRange('2024-02-10').to).toBe('2024-02-29')
    expect(monthRange('2026-02-10').to).toBe('2026-02-28')
    expect(addDaysISO('2024-02-28', 2)).toBe('2024-03-01')
    expect(addDaysISO('2025-12-31', 1)).toBe('2026-01-01')
    expect(isValidISO('2026-02-30')).toBe(false)
    expect(monthGrid('2026-03-15')[0]).toBe('2026-02-23')
    expect(isoWeekday('2026-03-01')).toBe(7)
  })
  it('formata minutos', () => {
    expect(formatMinutes(150)).toBe('2h 30min')
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(0)).toBe('0 min')
  })
  it('período anterior tem mesma duração', () => {
    expect(previousRange({ from: '2026-03-08', to: '2026-03-14' })).toEqual({ from: '2026-03-01', to: '2026-03-07' })
  })
})

describe('somas e comparações', () => {
  const d: AppData = emptyData()
  d.studySessions = [
    { id: '1', subject: 'A', date: '2026-03-02', minutes: 60, type: 'reading', createdAt: ts },
    { id: '2', subject: 'B', date: '2026-03-03', minutes: 30, type: 'review', createdAt: ts },
    { id: '3', subject: 'B', date: '2026-04-03', minutes: 99, type: 'review', createdAt: ts },
  ]
  d.exercises = [{ id: 'e', type: 'run', date: '2026-03-02', minutes: 40, createdAt: ts }]
  it('soma estudo e exercícios no período', () => {
    expect(sumStudy(d, { from: '2026-03-01', to: '2026-03-31' })).toBe(90)
    expect(sumExerciseMin(d, { from: '2026-03-01', to: '2026-03-31' })).toBe(40)
  })
  it('comparação sem infinito', () => {
    expect(compare(120, 100).change).toBe(20)
    expect(compare(50, 100).trend).toBe('down')
    expect(compare(10, 0).change).toBeNull()
    expect(compare(0, 0).trend).toBe('flat')
  })
})

describe('recorrência', () => {
  it('diária, dias específicos, mensal em mês curto', () => {
    expect(occursOn(task({ recurrence: { kind: 'daily', days: [] } }), '2026-03-10')).toBe(true)
    expect(occursOn(task({ recurrence: { kind: 'daily', days: [] } }), '2026-03-01')).toBe(false)
    const wk = task({ recurrence: { kind: 'weekdays', days: [1, 3] } })
    expect(occursOn(wk, '2026-03-04')).toBe(true)
    expect(occursOn(wk, '2026-03-05')).toBe(false)
    const m = task({ date: '2026-01-31', recurrence: { kind: 'monthly', days: [] } })
    expect(occursOn(m, '2026-02-28')).toBe(true)
    expect(occursOn(m, '2026-02-27')).toBe(false)
  })
  it('concluir uma ocorrência não conclui as demais', () => {
    const t = task({ recurrence: { kind: 'daily', days: [] }, occurrences: { '2026-03-03': { status: 'done' } } })
    expect(occurrencesOn([t], '2026-03-03', '2026-03-05')[0]!.status).toBe('done')
    expect(occurrencesOn([t], '2026-03-04', '2026-03-05')[0]!.status).toBe('pending')
    expect(occurrencesOn([t], '2026-03-04', '2026-03-05')[0]!.overdue).toBe(true)
  })
  it('ocorrência pulada some', () => {
    const t = task({ recurrence: { kind: 'daily', days: [] }, occurrences: { '2026-03-04': { skipped: true } } })
    expect(occurrencesOn([t], '2026-03-04')).toHaveLength(0)
  })
})
