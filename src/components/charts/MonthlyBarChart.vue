<script setup lang="ts">
/** Barras agrupadas por semana: horas de estudo e de exercício (eixo em horas). */
import { computed, ref } from 'vue'
import BaseChart from './BaseChart.vue'
import { useDataStore } from '@/stores/data.store'
import { sumExerciseMin, sumStudy } from '@/services/reports/metrics'
import { weeksIn } from '@/services/reports/summary'
import { formatShort, toHours, type Range } from '@/utils/date'
const props = defineProps<{ range: Range }>()
const store = useDataStore()
const show = ref<'both' | 'study' | 'exercise'>('both')
const weeks = computed(() => weeksIn(props.range))
const option = computed(() => {
  const mk = (name: string, color: string, fn: (r: Range) => number) => ({ name, type: 'bar', color, itemStyle: { borderRadius: [6, 6, 0, 0] }, data: weeks.value.map((w) => toHours(fn(w))) })
  const series = [] as object[]
  if (show.value !== 'exercise') series.push(mk('Estudo (h)', '#7968F8', (w) => sumStudy(store.data, w)))
  if (show.value !== 'study') series.push(mk('Exercício (h)', '#22B985', (w) => sumExerciseMin(store.data, w)))
  return {
    grid: { left: 40, right: 12, top: 16, bottom: 56 }, legend: { bottom: 0 }, tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v} h` },
    xAxis: { type: 'category', data: weeks.value.map((w) => `Sem ${formatShort(w.from)}`) }, yAxis: { type: 'value', name: 'horas' }, series,
  }
})
</script>

<template>
  <div>
    <div class="mb-2 flex gap-1" role="group" aria-label="Métricas exibidas">
      <button v-for="o in [['both', 'Ambos'], ['study', 'Estudo'], ['exercise', 'Exercício']] as const" :key="o[0]" class="min-h-[44px] rounded-xl px-3 text-xs font-bold" :class="show === o[0] ? 'bg-brand text-white' : 'bg-bg text-muted'" :aria-pressed="show === o[0]" @click="show = o[0]">{{ o[1] }}</button>
    </div>
    <BaseChart :option="option" height="260px" description="Horas de estudo e de exercício por semana" />
  </div>
</template>
