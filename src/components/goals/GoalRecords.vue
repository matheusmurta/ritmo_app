<script setup lang="ts">
/** Histórico de registros (manuais e vinculados) e gráfico de evolução acumulada. */
import { computed } from 'vue'
import { Trash2 } from '@lucide/vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { formatFull } from '@/utils/date'
import type { Goal } from '@/models'

const props = defineProps<{ goal: Goal }>()
const store = useDataStore()
const goals = useGoalsStore()
const entries = computed(() => store.data.progress.filter((x) => x.goalId === props.goal.id).sort((a, b) => b.date.localeCompare(a.date)))
const linked = computed(() => {
  const id = props.goal.id
  return [
    ...store.data.studySessions.filter((s) => s.goalId === id).map((s) => ({ k: 's' + s.id, date: s.date, text: `Estudo: ${s.subject} (${s.minutes} min)` })),
    ...store.data.exercises.filter((e) => e.goalId === id).map((e) => ({ k: 'e' + e.id, date: e.date, text: `Treino (${e.minutes} min)` })),
  ].sort((a, b) => b.date.localeCompare(a.date))
})
const chart = computed(() => {
  let acc = 0
  const pts = [...entries.value].reverse().map((e) => ({ d: e.date.slice(5).split('-').reverse().join('/'), v: (acc += e.value) }))
  return {
    grid: { left: 40, right: 16, top: 20, bottom: 30 }, tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: pts.map((p) => p.d) }, yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: pts.map((p) => p.v), color: props.goal.color, areaStyle: { opacity: 0.12 } }],
  }
})
</script>

<template>
  <div class="space-y-4">
    <section v-if="entries.length > 1" class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Evolução</h2><BaseChart :option="chart" height="200px" :description="`Evolução acumulada da meta ${goal.name}`" /></section>
    <section class="card p-4">
      <h2 class="mb-2 font-display text-base font-extrabold">Registros</h2>
      <ul v-if="entries.length || linked.length" class="divide-y divide-line text-sm">
        <li v-for="e in entries" :key="e.id" class="flex items-center justify-between py-2"><span>{{ formatFull(e.date) }} · <b>+{{ e.value }}</b> {{ goal.unit }}<span v-if="e.note" class="text-muted"> — {{ e.note }}</span></span><button class="h-11 w-11 text-rose" aria-label="Remover registro" @click="goals.removeProgress(e.id)"><Trash2 :size="15" class="mx-auto" /></button></li>
        <li v-for="l in linked" :key="l.k" class="py-2 text-muted">{{ formatFull(l.date) }} · {{ l.text }} <span class="chip bg-lilac text-brand">vinculado</span></li>
      </ul>
      <p v-else class="text-sm text-muted">Nenhum registro ainda.</p>
    </section>
  </div>
</template>
