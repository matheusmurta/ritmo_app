import { describe, expect, it } from 'vitest'
import { habitStreaks } from '@/services/reports/habits'
import { generateInsights } from '@/services/insights/insights'
import { emptyData } from '@/services/storage/storage'
import type { Habit } from '@/models'

const ts = '2026-01-01T00:00:00.000Z'
const habit = (p: Partial<Habit> = {}): Habit => ({ id: 'h', name: 'H', icon: 'Star', color: '#000', days: [1, 2, 3, 4, 5, 6, 7], startDate: '2026-03-01', archived: false, createdAt: ts, ...p })

describe('sequência de hábitos', () => {
  const d = emptyData()
  it('hoje em aberto não quebra a sequência', () => {
    const h = habit()
    d.habits = [h]
    d.habitLogs = ['2026-03-05', '2026-03-06', '2026-03-07'].map((date) => ({ habitId: 'h', date }))
    expect(habitStreaks(d, h, '2026-03-08')).toEqual({ current: 3, best: 3 })
  })
  it('dia anterior perdido quebra a sequência', () => {
    const h = habit()
    d.habitLogs = [{ habitId: 'h', date: '2026-03-05' }, { habitId: 'h', date: '2026-03-07' }]
    expect(habitStreaks(d, h, '2026-03-08').current).toBe(1)
  })
  it('dias não programados não contam como falha', () => {
    const h = habit({ days: [1, 3, 5] })
    d.habitLogs = ['2026-03-02', '2026-03-04', '2026-03-06'].map((date) => ({ habitId: 'h', date }))
    expect(habitStreaks(d, h, '2026-03-07').current).toBe(3)
  })
})

describe('insights', () => {
  it('dados insuficientes geram mensagem neutra', () => {
    const r = generateInsights(emptyData(), { from: '2026-03-02', to: '2026-03-08' }, '2026-03-05')
    expect(r).toHaveLength(1)
    expect(r[0]!.id).toBe('insufficient')
  })
  it('regenera quando os dados mudam', () => {
    const d = emptyData()
    const range = { from: '2026-03-02', to: '2026-03-08' }
    d.studySessions = [
      { id: 'a', subject: 'X', date: '2026-03-03', minutes: 60, type: 'reading', createdAt: ts },
      { id: 'b', subject: 'X', date: '2026-02-24', minutes: 30, type: 'reading', createdAt: ts },
    ]
    expect(generateInsights(d, range, '2026-03-08').some((i) => i.id === 'study-up')).toBe(true)
  })
})
