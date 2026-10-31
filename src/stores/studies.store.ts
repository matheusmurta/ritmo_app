import { computed } from 'vue'
import { defineStore } from 'pinia'
import type { StudySession, StudyTimer } from '@/models'
import { nowTimestamp, todayISO, uid } from '@/utils/date'
import { useDataStore } from './data.store'
import { useUiStore } from './ui.store'

export type StudyInput = Omit<StudySession, 'id' | 'createdAt'>

export const useStudiesStore = defineStore('studies', () => {
  const store = useDataStore()
  const ui = useUiStore()

  const sessions = computed(() => store.data.studySessions)
  const subjects = computed(() => [...new Set(store.data.studySessions.map((s) => s.subject))].sort((a, b) => a.localeCompare(b, 'pt-BR')))

  function add(input: StudyInput): StudySession {
    const s: StudySession = { ...input, id: uid(), createdAt: nowTimestamp() }
    store.data.studySessions.push(s)
    return s
  }
  function update(id: string, patch: Partial<StudyInput>) {
    const s = store.data.studySessions.find((x) => x.id === id)
    if (s) Object.assign(s, patch)
  }
  function remove(id: string) {
    const idx = store.data.studySessions.findIndex((s) => s.id === id)
    if (idx < 0) return
    const [removed] = store.data.studySessions.splice(idx, 1)
    ui.toast('Sessão excluída', 'info', () => { if (removed) store.data.studySessions.push(removed) })
  }

  /* ---- Cronômetro: baseado em timestamps, nunca em contagem de ticks ---- */
  const timer = computed<StudyTimer | null>(() => store.data.timer)

  /** Tempo decorrido calculado a partir de timestamps (imune a throttling de setInterval). */
  function elapsedMs(now: number = Date.now()): number {
    const t = store.data.timer
    if (!t) return 0
    return t.accumulatedMs + (t.running && t.resumedAt != null ? Math.max(0, now - t.resumedAt) : 0)
  }
  function startTimer(subject: string, type: StudyTimer['type'], goalId?: string) {
    const now = Date.now()
    store.data.timer = { subject, type, goalId, startedAt: now, accumulatedMs: 0, resumedAt: now, lastSeenAt: now, running: true }
  }
  function pauseTimer() {
    const t = store.data.timer
    if (!t || !t.running) return
    const now = Date.now()
    t.accumulatedMs = elapsedMs(now)
    t.resumedAt = null
    t.running = false
    t.lastSeenAt = now
  }
  function resumeTimer() {
    const t = store.data.timer
    if (!t || t.running) return
    const now = Date.now()
    t.resumedAt = now
    t.running = true
    t.lastSeenAt = now
  }
  function touch() {
    if (store.data.timer?.running) store.data.timer.lastSeenAt = Date.now()
  }
  /** Ao restaurar após reload, pausa preservando apenas o tempo visto pela última vez (evita contagem indevida). */
  function restoreSafely() {
    const t = store.data.timer
    if (!t || !t.running) return false
    const seen = Math.max(t.lastSeenAt, t.resumedAt ?? 0)
    t.accumulatedMs += Math.max(0, seen - (t.resumedAt ?? seen))
    t.resumedAt = null
    t.running = false
    return true
  }
  function discardTimer() {
    store.data.timer = null
  }
  /** Finaliza e salva a sessão; retorna null quando a duração é inferior a 1 minuto. */
  function finishTimer(overrideMinutes?: number): StudySession | null {
    const t = store.data.timer
    if (!t) return null
    const minutes = overrideMinutes ?? Math.round(elapsedMs() / 60000)
    store.data.timer = null
    if (minutes < 1) {
      ui.toast('Sessão muito curta (menos de 1 minuto) — não foi salva.', 'info')
      return null
    }
    const s = add({ subject: t.subject || 'Estudo livre', date: todayISO(), minutes, type: t.type, goalId: t.goalId })
    ui.toast('Sessão de estudo salva! 📚', 'success')
    return s
  }

  return { sessions, subjects, add, update, remove, timer, elapsedMs, startTimer, pauseTimer, resumeTimer, touch, restoreSafely, discardTimer, finishTimer }
})
