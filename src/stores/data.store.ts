import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { AppData } from '@/models'
import { buildDemoData } from '@/services/demo/demo'
import { ACHIEVEMENTS, newlyUnlocked } from '@/services/insights/achievements'
import { clearAll, createDebouncedSaver, emptyData, load, save, type LoadStatus } from '@/services/storage/storage'
import { useUiStore } from './ui.store'

/**
 * Núcleo de estado: mantém o AppData completo, persiste automaticamente (debounce) e
 * isola o modo demonstração (dados em memória, sem gravação).
 */
export const useDataStore = defineStore('data', () => {
  const ui = useUiStore()
  const loaded = load()
  const data = ref<AppData>(loaded.data)
  const loadStatus = ref<LoadStatus>(loaded.status)
  const loadMessage = ref(loaded.message ?? '')
  const saveError = ref('')
  const demo = ref(false)
  let stash: AppData | null = null

  const saver = createDebouncedSaver(() => {
    if (demo.value) return
    const res = save(data.value)
    saveError.value = res.ok ? '' : (res.error ?? 'Erro ao gravar.')
    if (!res.ok) ui.toast(saveError.value, 'error')
  })

  watch(data, () => {
    if (!demo.value) saver.schedule()
    checkAchievements()
  }, { deep: true })

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => saver.flush())
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saver.flush()
    })
  }

  function checkAchievements() {
    if (demo.value) return
    for (const a of newlyUnlocked(data.value)) {
      data.value.achievements.push({ id: a.id, unlockedAt: new Date().toISOString() })
      ui.toast(`Conquista desbloqueada: ${a.title} 🏅`, 'success')
    }
  }

  const unlocked = computed(() => new Set(data.value.achievements.map((a) => a.id)))
  const achievementList = computed(() => ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.value.has(a.id) })))

  function enterDemo() {
    if (demo.value) return
    stash = data.value
    data.value = buildDemoData(stash.profile.name || 'Visitante')
    demo.value = true
  }
  function exitDemo() {
    if (!demo.value || !stash) return
    data.value = stash
    stash = null
    demo.value = false
  }
  /** Substitui todos os dados (importação de backup) e grava imediatamente. */
  function replaceAll(next: AppData) {
    if (demo.value) exitDemo()
    data.value = next
    saver.flush()
    const res = save(next)
    saveError.value = res.ok ? '' : (res.error ?? '')
    return res
  }
  function wipe() {
    if (demo.value) exitDemo()
    const res = clearAll()
    data.value = emptyData()
    loadStatus.value = 'empty'
    return res
  }
  function dismissLoadWarning() {
    loadMessage.value = ''
  }

  return {
    data, loadStatus, loadMessage, saveError, demo, achievementList,
    enterDemo, exitDemo, replaceAll, wipe, dismissLoadWarning, flush: () => saver.flush(),
  }
})
