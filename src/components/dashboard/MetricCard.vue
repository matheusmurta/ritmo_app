<script setup lang="ts">
/** Card de indicador clicável com barra de progresso opcional. */
import { computed } from 'vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatComparison from '@/components/ui/StatComparison.vue'
import type { Comparison } from '@/services/reports/metrics'

const props = defineProps<{
  to: string; icon: string; color: string; title: string; value: string; sub?: string; pct?: number | null; cmp?: Comparison; extra?: string
}>()
const hasBar = computed(() => props.pct !== undefined)
</script>

<template>
  <RouterLink :to="to" class="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 active:scale-[0.98]">
    <div class="flex items-center gap-2"><IconBadge :icon="icon" :color="color" :size="34" /><span class="text-xs font-semibold text-muted">{{ title }}</span></div>
    <p class="font-display text-2xl font-extrabold leading-none">{{ value }}</p>
    <p v-if="sub" class="text-xs text-muted">{{ sub }}</p>
    <ProgressBar v-if="hasBar" :value="pct ?? 0" :color="color" :label="title" />
    <p v-if="hasBar && pct == null" class="text-[11px] text-muted">Sem meta definida</p>
    <p v-else-if="hasBar" class="text-xs font-bold" :style="{ color }">{{ pct }}%</p>
    <StatComparison v-if="cmp" :cmp="cmp" />
    <p v-if="extra" class="text-xs text-muted">{{ extra }}</p>
  </RouterLink>
</template>
