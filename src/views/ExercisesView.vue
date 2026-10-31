<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import ProgressRing from '@/components/ui/ProgressRing.vue'
import StatComparison from '@/components/ui/StatComparison.vue'
import { useDataStore } from '@/stores/data.store'
import { useExercisesStore } from '@/stores/exercises.store'
import { useUiStore } from '@/stores/ui.store'
import { EXERCISE_ICON, EXERCISE_LABEL } from '@/constants/labels'
import { compare, countExercises, exerciseByDay, exerciseByType, percent, sumExerciseMin } from '@/services/reports/metrics'
import { addDaysISO, daysBetween, formatFull, formatMinutes, formatShort, monthRange, previousRange, todayISO, weekRange } from '@/utils/date'
import type { ExerciseType } from '@/models'

const store = useDataStore()
const ex = useExercisesStore()
const ui = useUiStore()
const today = todayISO()
const week = weekRange(today)
const goal = computed(() => store.data.preferences.weeklyWorkoutGoal)
const s = computed(() => {
  const d = store.data
  const n = countExercises(d, week)
  const types = exerciseByType(d, monthRange(today))
  return {
    n, goalPct: percent(n, goal.value), weekMin: sumExerciseMin(d, week), monthMin: sumExerciseMin(d, monthRange(today)),
    top: types[0], cmp: compare(n, countExercises(d, previousRange(week))), active: Object.keys(exerciseByDay(d, week)).length,
  }
})
const recent = computed(() => [...store.data.exercises].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 15))
const barChart = computed(() => {
  const r = { from: addDaysISO(today, -13), to: today }
  const by = exerciseByDay(store.data, r)
  const ds = daysBetween(r.from, r.to)
  return {
    grid: { left: 36, right: 8, top: 16, bottom: 28 }, tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v} min` },
    xAxis: { type: 'category', data: ds.map(formatShort), axisLabel: { interval: 1 } }, yAxis: { type: 'value', name: 'min' },
    series: [{ type: 'bar', data: ds.map((d) => by[d] ?? 0), itemStyle: { color: '#22B985', borderRadius: [6, 6, 0, 0] } }],
  }
})
const typeChart = computed(() => ({
  tooltip: { trigger: 'item' }, legend: { bottom: 0, type: 'scroll' },
  series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'], label: { show: false }, data: exerciseByType(store.data, { from: addDaysISO(today, -89), to: today }).map((t) => ({ name: EXERCISE_LABEL[t.type as ExerciseType], value: t.count })) }],
}))
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between"><h1 class="font-display text-2xl font-extrabold">Exercícios</h1><button class="btn-primary" @click="ui.openQuick('exercise')"><Plus :size="18" />Registrar</button></header>
    <section class="card flex items-center gap-4 p-4" aria-label="Resumo semanal">
      <ProgressRing :value="s.goalPct" color="#22B985" :size="104" label="Meta semanal de treinos"><span class="font-display text-xl font-extrabold">{{ s.goalPct == null ? '—' : s.goalPct + '%' }}</span></ProgressRing>
      <div class="flex-1 space-y-1 text-sm">
        <p><b>{{ s.n }}</b> {{ s.n === 1 ? 'treino' : 'treinos' }} na semana<span v-if="goal"> de {{ goal }}</span></p>
        <p class="text-muted">Tempo na semana: {{ formatMinutes(s.weekMin) }} · mês: {{ formatMinutes(s.monthMin) }}</p>
        <p class="text-muted">Dias ativos: {{ s.active }} de 7<span v-if="s.top"> · mais frequente: {{ EXERCISE_LABEL[s.top.type as ExerciseType] }}</span></p>
        <StatComparison :cmp="s.cmp" />
        <p v-if="!goal" class="text-xs text-muted">Defina a meta semanal de treinos no Perfil.</p>
      </div>
    </section>
    <div v-if="store.data.exercises.length" class="grid gap-4 lg:grid-cols-2">
      <section class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Minutos por dia</h2><BaseChart :option="barChart" height="220px" description="Minutos de exercício por dia nos últimos 14 dias" /></section>
      <section class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Tipos (90 dias)</h2><BaseChart :option="typeChart" height="220px" description="Distribuição de treinos por tipo nos últimos 90 dias" /></section>
    </div>
    <section aria-label="Treinos recentes">
      <h2 class="mb-2 font-display text-base font-extrabold">Treinos recentes</h2>
      <ul v-if="recent.length" class="space-y-2">
        <li v-for="e in recent" :key="e.id" class="card flex items-center gap-2 p-3"><IconBadge :icon="EXERCISE_ICON[e.type]" color="#22B985" :size="38" /><div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ EXERCISE_LABEL[e.type] }}</p><p class="text-xs text-muted">{{ formatFull(e.date) }} · {{ formatMinutes(e.minutes) }}<span v-if="e.distanceKm != null"> · {{ e.distanceKm }} km</span></p></div>
          <button class="flex h-11 w-11 items-center justify-center text-muted" :aria-label="`Editar ${EXERCISE_LABEL[e.type]}`" @click="ui.openQuick('exercise', undefined, e.id)"><Pencil :size="16" /></button>
          <button class="flex h-11 w-11 items-center justify-center text-rose" :aria-label="`Excluir ${EXERCISE_LABEL[e.type]}`" @click="ex.remove(e.id)"><Trash2 :size="16" /></button></li>
      </ul>
      <div v-else class="card"><EmptyState title="Nenhum treino registrado" text="Registre sua primeira atividade física." action="Adicionar um treino" @action="ui.openQuick('exercise')" /></div>
    </section>
  </div>
</template>
