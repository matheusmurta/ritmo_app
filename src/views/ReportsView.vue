<script setup lang="ts">
import { computed, ref } from 'vue'
import EvolutionLineChart from '@/components/charts/EvolutionLineChart.vue'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart.vue'
import ProgressDonutChart from '@/components/charts/ProgressDonutChart.vue'
import HabitHeatmap from '@/components/charts/HabitHeatmap.vue'
import DistributionChart from '@/components/charts/DistributionChart.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import InsightCard from '@/components/dashboard/InsightCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useDataStore } from '@/stores/data.store'
import { usePeriod, PERIODS } from '@/composables/useStatistics'
import { adherenceSeries } from '@/services/reports/summary'
import { generateInsights } from '@/services/insights/insights'
import { formatFull, rangeLength } from '@/utils/date'

const store = useDataStore()
const { key, custom, range } = usePeriod()
const tab = ref<'all' | 'study' | 'exercise' | 'habits' | 'goals'>('all')
const tabs = [['all', 'Visão geral'], ['study', 'Estudos'], ['exercise', 'Exercícios'], ['habits', 'Hábitos'], ['goals', 'Metas']] as const
const points = computed(() => adherenceSeries(store.data, range.value))
const insights = computed(() => generateInsights(store.data, range.value))
const empty = computed(() => !store.data.studySessions.length && !store.data.exercises.length && !store.data.tasks.length && !store.data.habitLogs.length && !store.data.goals.length)
</script>

<template>
  <div class="space-y-4">
    <header class="space-y-3">
      <h1 class="font-display text-2xl font-extrabold">Relatórios</h1>
      <div><label class="label" for="rp-per">Período</label><select id="rp-per" v-model="key" class="field"><option v-for="p in PERIODS" :key="p.k" :value="p.k">{{ p.l }}</option></select></div>
      <div v-if="key === 'custom'" class="grid grid-cols-2 gap-3"><div><label class="label" for="rp-f">De</label><input id="rp-f" v-model="custom.from" type="date" class="field" /></div><div><label class="label" for="rp-t">Até</label><input id="rp-t" v-model="custom.to" type="date" class="field" /></div></div>
      <p class="text-xs text-muted">{{ formatFull(range.from) }} a {{ formatFull(range.to) }} · {{ rangeLength(range) }} dias</p>
      <div class="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-line/60 p-1" role="tablist"><button v-for="t in tabs" :key="t[0]" role="tab" class="min-h-[44px] shrink-0 rounded-xl px-4 text-sm font-bold" :class="tab === t[0] ? 'bg-card text-brand shadow-card' : 'text-muted'" :aria-selected="tab === t[0]" @click="tab = t[0]">{{ t[1] }}</button></div>
    </header>

    <div v-if="empty" class="card"><EmptyState title="Ainda sem dados para relatórios" text="Registre estudos, treinos, tarefas ou hábitos — ou explore o modo demonstração." action="Ver modo demonstração" @action="store.enterDemo()" /></div>
    <template v-else>
      <ProgressDonutChart v-if="tab === 'all'" :range="range" />
      <InsightCard :insights="insights" title="Insights do período" />
      <section v-if="tab === 'all'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Evolução geral (% da meta)</h2><EvolutionLineChart :points="points" /></section>
      <section v-if="tab === 'all' || tab === 'study' || tab === 'exercise'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Horas por semana</h2><MonthlyBarChart :range="range" /></section>
      <section v-if="tab === 'all' || tab === 'study'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Tempo por matéria</h2><DistributionChart kind="subjects" :range="range" /></section>
      <section v-if="tab === 'all' || tab === 'goals'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Progresso por categoria de metas</h2><DistributionChart kind="categories" :range="range" /></section>
      <section v-if="tab === 'all' || tab === 'habits'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Consistência de hábitos</h2><HabitHeatmap /></section>
      <section v-if="tab === 'all'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Semana atual vs. anterior</h2><DistributionChart kind="weekly" :range="range" /></section>
      <section v-if="tab === 'all' || tab === 'study' || tab === 'exercise'" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Tendência mensal</h2><TrendChart /></section>
    </template>
  </div>
</template>
