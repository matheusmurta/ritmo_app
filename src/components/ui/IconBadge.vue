<script setup lang="ts">
/** Ícone Lucide sobre fundo colorido translúcido. */
import { computed } from 'vue'
import { iconFor } from '@/constants/icons'
const props = withDefaults(defineProps<{ icon: string; color?: string; size?: number }>(), { color: '#3B5BFF', size: 40 })
const Comp = computed(() => iconFor(props.icon))
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-2xl"
    :style="{ width: size + 'px', height: size + 'px', background: color + '22', color }"
    aria-hidden="true"
  >
    <component :is="Comp" :size="Math.round(size * 0.5)" :stroke-width="2.2" />
  </span>
</template>
