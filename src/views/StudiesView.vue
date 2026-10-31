<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import StudyTimer from '@/components/studies/StudyTimer.vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useDataStore } from '@/stores/data.store'
import { useStudiesStore } from '@/stores/studies.store'
import { useUiStore } from '@/stores/ui.store'
import { STUDY_TYPE_LABEL } from '@/constants/labels'
import { bestDay, percent, studyByDay, studyBySubject, sumStudy } from '@/services/reports/metrics'
import { addDaysISO, daysBetween, formatFull, formatMinutes, formatShort, monthRange, todayISO, weekRange, weekdayName, isoWeekday } from '@/utils/date'

const store = useDataStore()
const studies = useStudiesStore()
const ui = useUiStore()
const today = todayISO()
const week = weekRange(today)
const month = monthRange(today)
const goal = computed(() => store.data.preferences.weeklyStudyGoalMin)
const stats = computed(() => {
  const d = store.data
  const byDay = studyByDay(d, month)
  const days = Object.keys(byDay).length
  const best = bestDay(byDay)
  const mTotal = sumStudy(d, month)
  const wTotal = sumStudy(d, week)
  return { today: sumStudy(d, { from: today, to: today }), week: wTotal, month: mTotal, days, avg: days ? Math.round(mTotal / days) : 0, best, pct: percent(wTotal, goal.value) }
})
const subjects = computed(() => studyBySubject(store.data, month))
const recent = computed(() => [...store.data.studySessions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 15))
const dayChart = computed(() => {
  const r = { from: addDaysISO(today, -13), to: today }
  const by = studyByDay(store.data, r)
  const ds = daysBetween(r.from, r.to)
  return {
    grid: { left: 36, right: 8, top: 16, bottom: 28 }, tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v} min` },
    xAxis: { type: 'category', data: ds.map(formatShort), axisLabel: { interval: 1 } }, yAxis: { type: 'value', name: 'min' },
    series: [{ type: 'bar', data: ds.map((d) => by[d] ?? 0), itemStyle: { color: '#7968F8', borderRadius: [6, 6, 0, 0] } }],
  }
})
const subjectChart = computed(() => ({
  tooltip: { trigger: 'item', valueFormatter: (v: number) => formatMinutes(v) }, legend: { bottom: 0, type: 'scroll' },
  series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'], data: subjects.value.map((s) => ({ name: s.subject, value: s.minutes })), label: { show: false } }],
}))
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between"><h1 class="font-display text-2xl font-extrabold">Estudos</h1><button class="btn-primary" @click="ui.openQuick('study')"><Plus :size="18" />Registrar</button></header>
    <StudyTimer />
    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Estatísticas">
      <div class="card p-3"><p class="text-xs text-muted">Hoje</p><p class="font-display text-xl font-extrabold">{{ formatMinutes(stats.today) }}</p></div>
      <div class="card p-3"><p class="text-xs text-muted">Semana</p><p class="font-display text-xl font-extrabold">{{ formatMinutes(stats.week) }}</p><ProgressBar v-if="stats.pct != null" :value="stats.pct" color="#7968F8" label="Meta semanal" /><p class="mt-1 text-[11px] text-muted">{{ stats.pct == null ? 'Sem meta (defina no Perfil)' : stats.pct + '% da meta' }}</p></div>
      <div class="card p-3"><p class="text-xs text-muted">Mês</p><p class="font-display text-xl font-extrabold">{{ formatMinutes(stats.month) }}</p><p class="text-[11px] text-muted">{{ stats.days }} dias de estudo</p></div>
      <div class="card p-3"><p class="text-xs text-muted">Média por dia estudado</p><p class="font-display text-xl font-extrabold">{{ formatMinutes(stats.avg) }}</p><p v-if="stats.best" class="text-[11px] text-muted">Melhor: {{ weekdayName(isoWeekday(stats.best.date)) }}</p></div>
    </section>
    <div v-if="store.data.studySessions.length" class="grid gap-4 lg:grid-cols-2">
      <section class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Últimos 14 dias</h2><BaseChart :option="dayChart" height="220px" description="Minutos estudados por dia nos últimos 14 dias" /></section>
      <section class="card p-4"><h2 class="mb-2 font-display text-base font-extrabold">Por matéria (mês)</h2><BaseChart v-if="subjects.length" :option="subjectChart" height="220px" description="Distribuição do tempo de estudo por matéria no mês" /><p v-else class="py-8 text-center text-sm text-muted">Sem estudos neste mês.</p></section>
    </div>
    <section aria-label="Sessões recentes">
      <h2 class="mb-2 font-display text-base font-extrabold">Sessões recentes</h2>
      <ul v-if="recent.length" class="space-y-2">
        <li v-for="s in recent" :key="s.id" class="card flex items-center gap-2 p-3"><div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ s.subject }}</p><p class="text-xs text-muted">{{ formatFull(s.date) }} · {{ formatMinutes(s.minutes) }} · {{ STUDY_TYPE_LABEL[s.type] }}</p></div>
          <button class="flex h-11 w-11 items-center justify-center text-muted" :aria-label="`Editar ${s.subject}`" @click="ui.openQuick('study', undefined, s.id)"><Pencil :size="16" /></button>
          <button class="flex h-11 w-11 items-center justify-center text-rose" :aria-label="`Excluir ${s.subject}`" @click="studies.remove(s.id)"><Trash2 :size="16" /></button></li>
      </ul>
      <div v-else class="card"><EmptyState title="Nenhum estudo registrado" text="Use o cronômetro ou registre uma sessão manualmente." action="Registrar um estudo" @action="ui.openQuick('study')" /></div>
    </section>
  </div>
</template>
