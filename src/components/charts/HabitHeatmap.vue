<script setup lang="ts">
/** Heatmap de consistência de hábitos nas últimas semanas (ECharts calendar). */
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useDataStore } from '@/stores/data.store'
import { habitConsistency } from '@/services/reports/habits'
import { addDaysISO, daysBetween, todayISO } from '@/utils/date'
const store = useDataStore()
const today = todayISO()
const from = addDaysISO(today, -111)
const data = computed(() => daysBetween(from, today).map((d) => {
  const c = habitConsistency(store.data, { from: d, to: d }, today)
  return [d, c.pct == null ? -1 : c.pct]
}))
const option = computed(() => ({
  tooltip: { formatter: (p: { value: [string, number] }) => `${p.value[0]}: ${p.value[1] < 0 ? 'sem hábitos programados' : p.value[1] + '%'}` },
  visualMap: { min: 0, max: 100, show: false, inRange: { color: ['#E8ECF4', '#B7E8D6', '#22B985'] } },
  calendar: { top: 24, left: 28, right: 8, cellSize: ['auto', 16], range: [from, today], itemStyle: { borderWidth: 2, borderColor: 'transparent' }, splitLine: { show: false }, yearLabel: { show: false },
    dayLabel: { firstDay: 1, nameMap: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] }, monthLabel: { nameMap: 'pt' as never } },
  series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: data.value.filter((x) => (x[1] as number) >= 0) }],
}))
</script>

<template><BaseChart :option="option" height="170px" description="Mapa de calor da consistência de hábitos nas últimas 16 semanas" /></template>
