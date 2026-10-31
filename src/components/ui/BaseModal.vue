<script setup lang="ts">
/** Modal no desktop, bottom sheet no mobile. Fecha com Esc e clique no fundo; prende o foco. */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
let previous: HTMLElement | null = null

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Tab' && panel.value) {
    const f = panel.value.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (!f.length) return
    const first = f[0]!, last = f[f.length - 1]!
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}
watch(() => props.open, async (o) => {
  if (o) {
    previous = document.activeElement as HTMLElement
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    await nextTick()
    panel.value?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus()
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
    previous?.focus?.()
  }
})
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center" @mousedown.self="emit('close')">
        <Transition name="sheet" appear>
          <div
            v-if="open" ref="panel" role="dialog" aria-modal="true" :aria-label="title"
            class="flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-card shadow-2xl md:max-w-lg md:rounded-[28px]"
            :style="{ paddingBottom: 'var(--safe-bottom)' }"
          >
            <div class="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
            <header class="flex items-center justify-between px-5 pb-2 pt-3">
              <h2 class="font-display text-lg font-extrabold">{{ title }}</h2>
              <button data-close class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg" aria-label="Fechar" @click="emit('close')"><X :size="20" /></button>
            </header>
            <div class="overflow-y-auto px-5 pb-5"><slot /></div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
