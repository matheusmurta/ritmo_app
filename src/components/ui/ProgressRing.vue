<script setup lang="ts">
/** Indicador circular de progresso (SVG). Slot padrão: conteúdo central. */
import { computed } from 'vue'
const props = withDefaults(defineProps<{ value: number | null; color?: string; size?: number; stroke?: number; label?: string }>(), {
  color: '#3B5BFF', size: 96, stroke: 10, label: 'Progresso',
})
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const pct = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))
</script>

<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }" role="img" :aria-label="`${label}: ${value == null ? 'sem meta definida' : value + '%'}`">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="currentColor" class="text-line" :stroke-width="stroke" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="color" :stroke-width="stroke" stroke-linecap="round"
        :stroke-dasharray="c" :stroke-dashoffset="c - (c * pct) / 100" class="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center"><slot /></div>
  </div>
</template>
