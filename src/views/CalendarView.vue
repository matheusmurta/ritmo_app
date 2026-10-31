<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight, Plus } from '@lucide/vue'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import DayAgenda from '@/components/calendar/DayAgenda.vue'
import MonthGoals from '@/components/calendar/MonthGoals.vue'
import TaskDetailModal from '@/components/calendar/TaskDetailModal.vue'
import { useDataStore } from '@/stores/data.store'
import { usePreferencesStore } from '@/stores/preferences.store'
import { useUiStore } from '@/stores/ui.store'
import { PRIORITY_LABEL, STATUS_LABEL } from '@/constants/labels'
import { addDaysISO, addMonthsISO, formatLong, formatMonth, isValidISO, todayISO, type ISODate } from '@/utils/date'
import type { CalendarView, TaskOccurrence } from '@/models'

const store = useDataStore()
const prefs = usePreferencesStore()
const ui = useUiStore()
const route = useRoute()
const q = typeof route.query.d === 'string' && isValidISO(route.query.d) ? route.query.d : todayISO()
const selected = ref<ISODate>(q)
const month = ref<ISODate>(q)
const detail = ref<{ id: string; date: ISODate } | null>(null)
const filters = reactive({ category: '', priority: '', status: '' })
const view = computed(() => prefs.prefs.calendarView)
const views: { k: CalendarView; l: string }[] = [{ k: 'month', l: 'Mês' }, { k: 'week', l: 'Semana' }, { k: 'day', l: 'Dia' }]
const filter = (o: TaskOccurrence) => (!filters.category || o.categoryId === filters.category) && (!filters.priority || o.priority === filters.priority) && (!filters.status || o.status === filters.status)

function step(n: number) {
  if (view.value === 'month') { month.value = addMonthsISO(month.value, n); selected.value = month.value }
  else { selected.value = addDaysISO(selected.value, view.value === 'week' ? 7 * n : n); month.value = selected.value }
}
function pick(d: ISODate) { selected.value = d; if (d.slice(0, 7) !== month.value.slice(0, 7)) month.value = d }
function today() { selected.value = month.value = todayISO() }
const title = computed(() => (view.value === 'month' ? formatMonth(month.value) : formatLong(selected.value)))
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between"><h1 class="font-display text-2xl font-extrabold">Calendário</h1><button class="btn-soft" @click="today">Hoje</button></header>
    <div class="flex gap-1 rounded-2xl bg-line/60 p-1" role="tablist" aria-label="Visualização">
      <button v-for="v in views" :key="v.k" role="tab" class="min-h-[44px] flex-1 rounded-xl text-sm font-bold transition" :class="view === v.k ? 'bg-card text-brand shadow-card' : 'text-muted'" :aria-selected="view === v.k" @click="prefs.setView(v.k)">{{ v.l }}</button>
    </div>
    <div class="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section class="card p-3">
        <div class="mb-2 flex items-center justify-between">
          <button class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg" aria-label="Anterior" @click="step(-1)"><ChevronLeft :size="20" /></button>
          <h2 class="font-display text-base font-extrabold" aria-live="polite">{{ title }}</h2>
          <button class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-bg" aria-label="Próximo" @click="step(1)"><ChevronRight :size="20" /></button>
        </div>
        <MonthCalendar v-if="view === 'month'" :month="month" :selected="selected" :filter="filter" @select="pick" />
        <p v-else class="px-2 pb-2 text-xs text-muted">Use as setas para navegar. A visão {{ view === 'week' ? 'semanal' : 'diária' }} lista as atividades abaixo.</p>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <select v-model="filters.category" class="field !text-xs" aria-label="Filtrar por categoria"><option value="">Categoria</option><option v-for="c in store.data.categories" :key="c.id" :value="c.id">{{ c.name }}</option></select>
          <select v-model="filters.priority" class="field !text-xs" aria-label="Filtrar por prioridade"><option value="">Prioridade</option><option v-for="(l, k) in PRIORITY_LABEL" :key="k" :value="k">{{ l }}</option></select>
          <select v-model="filters.status" class="field !text-xs" aria-label="Filtrar por status"><option value="">Status</option><option v-for="(l, k) in STATUS_LABEL" :key="k" :value="k">{{ l }}</option></select>
        </div>
      </section>
      <section aria-label="Agenda">
        <DayAgenda :date="selected" :mode="view === 'week' ? 'week' : 'day'" :filter="filter" @open="(id, d) => (detail = { id, date: d })" />
      </section>
    </div>
    <MonthGoals :month="month" />
    <button class="btn-primary fixed right-4 z-30 !h-14 !w-14 !rounded-full !p-0 md:right-8" style="bottom: calc(var(--nav-h) + var(--safe-bottom) + 84px)" :aria-label="`Nova atividade em ${formatLong(selected)}`" @click="ui.openQuick('task', selected)"><Plus :size="26" /></button>
    <TaskDetailModal :task-id="detail?.id ?? null" :date="detail?.date ?? selected" @close="detail = null" />
  </div>
</template>
