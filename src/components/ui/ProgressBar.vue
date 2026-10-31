<script setup lang="ts">
/** Barra de progresso animada. `value` é limitado a 0–100 na renderização. */
import { computed } from 'vue'
const props = withDefaults(defineProps<{ value: number | null; color?: string; height?: number; label?: string }>(), {
  color: '#3B5BFF', height: 8, label: 'Progresso',
})
const w = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-full bg-line/70"
    :style="{ height: props.height + 'px' }"
    role="progressbar"
    :aria-label="props.label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(w)"
  >
    <div class="h-full rounded-full transition-[width] duration-700 ease-out" :style="{ width: w + '%', background: props.color }" />
  </div>
</template>
