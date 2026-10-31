<script setup lang="ts">
import { CircleAlert, CircleCheck, Info } from '@lucide/vue'
import { useUiStore } from '@/stores/ui.store'
const ui = useUiStore()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4" style="bottom: calc(var(--nav-h) + var(--safe-bottom) + 12px)" aria-live="polite" role="status">
    <TransitionGroup name="sheet">
      <div v-for="t in ui.toasts" :key="t.id" class="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-bg shadow-pop">
        <CircleCheck v-if="t.kind === 'success'" :size="18" class="shrink-0 text-mint" />
        <CircleAlert v-else-if="t.kind === 'error'" :size="18" class="shrink-0 text-rose" />
        <Info v-else :size="18" class="shrink-0 text-sky" />
        <span class="flex-1">{{ t.text }}</span>
        <button v-if="t.action" class="min-h-[44px] px-2 font-bold text-sky" @click="t.action(); ui.dismiss(t.id)">{{ t.actionLabel }}</button>
      </div>
    </TransitionGroup>
  </div>
</template>
