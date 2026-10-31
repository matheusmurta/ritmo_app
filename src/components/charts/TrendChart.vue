<script setup lang="ts">
/** Tendência das horas registradas nos últimos 6 meses. */
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useDataStore } from '@/stores/data.store'
import { sumExerciseMin, sumStudy } from '@/services/reports/metrics'
import { addMonthsISO, formatMonthShort, monthRange, todayISO, toHours } from '@/utils/date'
const store = useDataStore()
const months = computed(() => [5, 4, 3, 2, 1, 0].map((i) => monthRange(addMonthsISO(todayISO(), -i))))
const option = computed(() => ({
  grid: { left: 40, right: 12, top: 16, bottom: 56 }, legend: { bottom: 0 }, tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v} h` },
  xAxis: { type: 'category', data: months.value.map((m) => formatMonthShort(m.from)) }, yAxis: { type: 'value', name: 'horas' },
  series: [
    { name: 'Estudo', type: 'line', smooth: true, color: '#7968F8', areaStyle: { opacity: 0.1 }, data: months.value.map((m) => toHours(sumStudy(store.data, m))) },
    { name: 'Exercício', type: 'line', smooth: true, color: '#22B985', areaStyle: { opacity: 0.1 }, data: months.value.map((m) => toHours(sumExerciseMin(store.data, m))) },
  ],
}))
</script>

<template><BaseChart :option="option" height="240px" description="Horas de estudo e exercício nos últimos 6 meses" /></template>
