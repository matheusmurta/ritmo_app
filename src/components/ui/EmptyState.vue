<script setup lang="ts">
/** Estado vazio com ilustração SVG e ação sugerida. */
defineProps<{ title: string; text: string; action?: string }>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-8 text-center">
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="14" y="14" width="92" height="68" rx="16" fill="rgb(var(--c-lilac))" />
      <rect x="28" y="30" width="44" height="8" rx="4" fill="#7968F8" opacity=".5" />
      <rect x="28" y="46" width="64" height="8" rx="4" fill="#3B5BFF" opacity=".35" />
      <rect x="28" y="62" width="30" height="8" rx="4" fill="#22B985" opacity=".5" />
      <circle cx="96" cy="20" r="12" fill="#F6A623" /><path d="M91 20l4 4 6-8" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <h3 class="mt-3 font-display text-base font-extrabold">{{ title }}</h3>
    <p class="mt-1 max-w-xs text-sm text-muted">{{ text }}</p>
    <button v-if="action" class="btn-primary mt-4" @click="emit('action')">{{ action }}</button>
    <slot />
  </div>
</template>
