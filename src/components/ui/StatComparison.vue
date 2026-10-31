<script setup lang="ts">
/** Variação em relação ao período anterior. Nunca mostra infinito. */
import { computed } from 'vue'
import { ArrowDownRight, ArrowUpRight, Minus } from '@lucide/vue'
import type { Comparison } from '@/services/reports/metrics'
const props = withDefaults(defineProps<{ cmp: Comparison; inverse?: boolean; short?: boolean }>(), { inverse: false, short: false })
const good = computed(() => (props.inverse ? props.cmp.trend === 'down' : props.cmp.trend === 'up'))
const cls = computed(() => (props.cmp.trend === 'flat' ? 'text-muted' : good.value ? 'text-mint' : 'text-rose'))
const text = computed(() => {
  if (props.cmp.change == null) return props.short ? '—' : props.cmp.label
  return props.short ? `${props.cmp.change > 0 ? '+' : ''}${props.cmp.change}%` : props.cmp.label
})
</script>

<template>
  <span class="inline-flex items-center gap-1 text-xs font-semibold" :class="cls">
    <ArrowUpRight v-if="cmp.trend === 'up' && cmp.change != null" :size="14" aria-hidden="true" />
    <ArrowDownRight v-else-if="cmp.trend === 'down' && cmp.change != null" :size="14" aria-hidden="true" />
    <Minus v-else :size="14" aria-hidden="true" />
    {{ text }}
  </span>
</template>
