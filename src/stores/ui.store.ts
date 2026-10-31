import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastKind = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  text: string
  kind: ToastKind
  actionLabel?: string
  action?: () => void
}
export type QuickKind = 'task' | 'goal' | 'habit' | 'study' | 'exercise'

/** Estado de interface: toasts (com desfazer), folhas de criação rápida e busca. */
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const quick = ref<{ kind: QuickKind; date?: string; id?: string } | null>(null)
  const searchOpen = ref(false)
  const quickMenuOpen = ref(false)
  let seq = 0

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  function toast(text: string, kind: ToastKind = 'success', undo?: () => void) {
    const id = ++seq
    toasts.value.push({ id, text, kind, actionLabel: undo ? 'Desfazer' : undefined, action: undo })
    setTimeout(() => dismiss(id), undo ? 6000 : 3500)
    return id
  }
  const openQuick = (kind: QuickKind, date?: string, id?: string) => {
    quickMenuOpen.value = false
    quick.value = { kind, date, id }
  }
  const closeQuick = () => (quick.value = null)

  return { toasts, quick, searchOpen, quickMenuOpen, toast, dismiss, openQuick, closeQuick }
})
