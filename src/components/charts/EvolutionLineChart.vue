<script setup lang="ts">
/** Linhas suaves de aderência (%) a estudos, exercícios e produtividade. */
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import type { DailyPoint } from '@/services/reports/summary'
import { formatShort } from '@/utils/date'
const props = defineProps<{ points: DailyPoint[] }>()
const option = computed(() => {
  const line = (name: string, color: string, pick: (p: DailyPoint) => number | null) => ({
    name, type: 'line', smooth: true, showSymbol: false, connectNulls: true, color, data: props.points.map(pick), lineStyle: { width: 3 },
  })
  return {
    grid: { left: 40, right: 12, top: 16, bottom: 56 },
    legend: { bottom: 0, itemWidth: 14 },
    tooltip: { trigger: 'axis', valueFormatter: (v: number | null) => (v == null ? 'sem meta' : `${v}%`) },
    xAxis: { type: 'category', data: props.points.map((p) => formatShort(p.date)), boundaryGap: false },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [line('Estudos', '#7968F8', (p) => p.study), line('Exercícios', '#22B985', (p) => p.exercise), line('Produtividade', '#3B5BFF', (p) => p.productivity)],
  }
})
const description = computed(() => `Evolução percentual de aderência em ${props.points.length} dias`)
</script>

<template><BaseChart :option="option" height="280px" :description="description" /></template>
