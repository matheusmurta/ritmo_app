import { onMounted, onUnmounted, watchEffect } from 'vue'
import { usePreferencesStore } from '@/stores/preferences.store'

/** Aplica tema (claro/escuro/sistema) e preferência de animações reduzidas ao <html>. */
export function useTheme() {
  const prefs = usePreferencesStore()
  const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

  const apply = () => {
    const t = prefs.prefs.theme
    const dark = t === 'dark' || (t === 'system' && !!mq?.matches)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('reduce-motion', prefs.prefs.reducedMotion)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B1020' : '#3B5BFF')
  }
  onMounted(() => mq?.addEventListener('change', apply))
  onUnmounted(() => mq?.removeEventListener('change', apply))
  watchEffect(apply)
  const toggle = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    prefs.setTheme(isDark ? 'light' : 'dark')
  }
  return { toggle }
}
