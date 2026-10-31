import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createBackup, parseBackup } from '@/services/backup/backup'
import { DATA_KEY, load, parseEnvelope, save, emptyData } from '@/services/storage/storage'
import { migrate, SCHEMA_VERSION } from '@/services/storage/migrations'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { useStudiesStore } from '@/stores/studies.store'
import { useExercisesStore } from '@/stores/exercises.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useHabitsStore } from '@/stores/habits.store'
import { goalProgress } from '@/services/reports/goals'
import { habitStreaks } from '@/services/reports/habits'
import { weekReport } from '@/services/reports/summary'
import { todayISO } from '@/utils/date'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('armazenamento', () => {
  it('JSON inválido não quebra e preserva o conteúdo original', () => {
    localStorage.setItem(DATA_KEY, '{oops')
    const r = load()
    expect(r.status).toBe('corrupt')
    expect(r.data.goals).toEqual([])
    expect(localStorage.getItem('ritmo:corrupt-backup')).toBe('{oops')
  })
  it('estrutura inválida é rejeitada', () => {
    localStorage.setItem(DATA_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data: { goals: [{ id: 1 }] } }))
    expect(load().status).toBe('corrupt')
  })
  it('versão mais nova é recusada', () => {
    expect(() => migrate({}, SCHEMA_VERSION + 1)).toThrow()
  })
  it('migra schema v0 (sessions → studySessions) e v1 (goals)', () => {
    const old = { sessions: [{ id: 's', subject: 'A', date: '2026-01-01', minutes: 10, createdAt: 'x' }], goals: [] }
    const data = parseEnvelope(JSON.stringify({ schemaVersion: 0, data: old }))
    expect(data.studySessions).toHaveLength(1)
  })
  it('grava e relê', () => {
    const d = emptyData()
    d.profile.name = 'Ana'
    expect(save(d).ok).toBe(true)
    expect(load().data.profile.name).toBe('Ana')
  })
})

describe('backup', () => {
  it('exporta e importa com resumo', () => {
    const d = emptyData()
    d.profile.name = 'Ana'
    const r = parseBackup(createBackup(d))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.summary.profileName).toBe('Ana')
  })
  it('rejeita arquivos inválidos', () => {
    expect(parseBackup('nope').ok).toBe(false)
    expect(parseBackup(JSON.stringify({ foo: 1 })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ app: 'ritmo', schemaVersion: 999, exportedAt: 'x', data: {} })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ app: 'ritmo', schemaVersion: SCHEMA_VERSION, exportedAt: 'x', data: { goals: 'x' } })).ok).toBe(false)
  })
})

describe('integração das stores', () => {
  it('meta + estudo e treino vinculados atualizam progresso e relatório; persistência após reload', async () => {
    const store = useDataStore()
    const goals = useGoalsStore()
    const t = todayISO()
    const g = goals.add({ name: 'Estudar 10h', categoryId: 'estudos', type: 'quantitative', period: 'weekly', startDate: t, deadline: t, target: 10, unit: 'h', source: 'manual', color: '#000', icon: 'Target' })
    useStudiesStore().add({ subject: 'Vue', date: t, minutes: 120, type: 'reading', goalId: g.id })
    useExercisesStore().add({ type: 'run', date: t, minutes: 30 })
    expect(goalProgress(store.data, g).current).toBe(2)
    const rep = weekReport(store.data)
    expect(rep.current.studyMin).toBe(120)
    expect(rep.current.workouts).toBe(1)
    store.flush()
    await new Promise((r) => setTimeout(r, 400))
    expect(load().data.goals).toHaveLength(1)
  })
  it('concluir tarefa e hábito', () => {
    const store = useDataStore()
    const t = todayISO()
    const tasks = useTasksStore()
    const task = tasks.add({ title: 'X', categoryId: 'outros', date: t, priority: 'low', recurrence: { kind: 'none', days: [] } })
    tasks.toggleDone(task.id, t)
    expect(store.data.tasks[0]!.status).toBe('done')
    tasks.toggleDone(task.id, t)
    expect(store.data.tasks[0]!.status).toBe('pending')
    const habits = useHabitsStore()
    const h = habits.add({ name: 'Ler', icon: 'Star', color: '#000', days: [1, 2, 3, 4, 5, 6, 7] })
    habits.toggle(h.id, t)
    expect(habitStreaks(store.data, h).current).toBe(1)
  })
  it('modo demonstração não contamina dados reais', async () => {
    const store = useDataStore()
    store.data.profile.name = 'Real'
    store.enterDemo()
    expect(store.data.goals.length).toBeGreaterThan(0)
    store.exitDemo()
    expect(store.data.goals).toHaveLength(0)
    expect(store.data.profile.name).toBe('Real')
  })
  it('cronômetro é baseado em timestamps e restaura pausado', () => {
    const studies = useStudiesStore()
    const store = useDataStore()
    studies.startTimer('X', 'reading')
    const t = store.data.timer!
    t.resumedAt = Date.now() - 5 * 60000
    t.lastSeenAt = Date.now() - 60000
    expect(studies.elapsedMs()).toBeGreaterThanOrEqual(5 * 60000 - 50)
    studies.restoreSafely()
    expect(store.data.timer!.running).toBe(false)
    expect(store.data.timer!.accumulatedMs).toBeLessThan(5 * 60000)
  })
})
