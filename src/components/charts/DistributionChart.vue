<script setup lang="ts">
/** Gráficos de distribuição: barras horizontais por categoria de meta, matérias e semana atual vs anterior. */
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { goalProgress } from '@/services/reports/goals'
import { studyBySubject, sumExerciseMin, sumStudy, taskStats } from '@/services/reports/metrics'
import { formatMinutes, previousRange, todayISO, weekRange, type Range } from '@/utils/date'
const props = defineProps<{ range: Range; kind: 'categories' | 'subjects' | 'weekly' }>()
const store = useDataStore()
const goals = useGoalsStore()
const option = computed(() => {
  const d = store.data
  if (props.kind === 'categories') {
    const m = new Map<string, number[]>()
    for (const g of d.goals.filter((x) => !x.archived)) m.set(g.categoryId, [...(m.get(g.categoryId) ?? []), Math.min(100, goalProgress(d, g).pct ?? 0)])
    const rows = [...m].map(([id, v]) => ({ c: goals.category(id), v: Math.round(v.reduce((a, b) => a + b, 0) / v.length) }))
    return { grid: { left: 110, right: 24, top: 8, bottom: 8 }, tooltip: { valueFormatter: (v: number) => `${v}%` }, xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } }, yAxis: { type: 'category', data: rows.map((r) => r.c.name) },
      series: [{ type: 'bar', data: rows.map((r) => ({ value: r.v, itemStyle: { color: r.c.color, borderRadius: [0, 6, 6, 0] } })), label: { show: true, position: 'right', formatter: '{c}%' } }] }
  }
  if (props.kind === 'subjects') {
    return { tooltip: { trigger: 'item', valueFormatter: (v: number) => formatMinutes(v) }, legend: { bottom: 0, type: 'scroll' },
      series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '42%'], label: { show: false }, data: studyBySubject(d, props.range).map((s) => ({ name: s.subject, value: s.minutes })) }] }
  }
  const cur = weekRange(todayISO())
  const prev = previousRange(cur)
  const vals = (r: Range) => [Math.round(sumStudy(d, r) / 6) / 10, Math.round(sumExerciseMin(d, r) / 6) / 10, taskStats(d, r).done]
  return { grid: { left: 40, right: 12, top: 16, bottom: 56 }, legend: { bottom: 0 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Estudo (h)', 'Exercício (h)', 'Tarefas'] }, yAxis: { type: 'value' },
    series: [{ name: 'Semana atual', type: 'bar', color: '#3B5BFF', data: vals(cur) }, { name: 'Semana anterior', type: 'bar', color: '#B9C3FF', data: vals(prev) }] }
})
const desc = computed(() => ({ categories: 'Progresso médio das metas por categoria', subjects: 'Tempo de estudo por matéria no período', weekly: 'Comparativo entre a semana atual e a anterior' })[props.kind])
</script>

<template><BaseChart :option="option" :height="kind === 'categories' ? '220px' : '260px'" :description="desc" /></template>
