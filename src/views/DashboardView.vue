<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from '@lucide/vue'
import WeeklyDateSelector from '@/components/dashboard/WeeklyDateSelector.vue'
import WeeklyGoalsCard from '@/components/dashboard/WeeklyGoalsCard.vue'
import WeekSummary from '@/components/dashboard/WeekSummary.vue'
import FirstSteps from '@/components/dashboard/FirstSteps.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import TaskCard from '@/components/dashboard/TaskCard.vue'
import InsightCard from '@/components/dashboard/InsightCard.vue'
import TaskDetailModal from '@/components/calendar/TaskDetailModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useDataStore } from '@/stores/data.store'
import { useProfileStore } from '@/stores/profile.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { weekReport } from '@/services/reports/summary'
import { generateInsights } from '@/services/insights/insights'
import { occurrencesOn } from '@/utils/recurrence'
import { formatLong, formatMinutes, greeting, todayISO, weekRange } from '@/utils/date'
import { MOTIVATION } from '@/constants/labels'

const store = useDataStore()
const profile = useProfileStore()
const tasks = useTasksStore()
const ui = useUiStore()
const today = todayISO()
const selected = ref(today)
const detail = ref<{ id: string; date: string } | null>(null)

const report = computed(() => weekReport(store.data, today))
const cur = computed(() => report.value.current)
const insights = computed(() => generateInsights(store.data, weekRange(today)))
const dayTasks = computed(() => occurrencesOn(store.data.tasks, selected.value))
const hasAnyData = computed(() => store.data.goals.length + store.data.tasks.length + store.data.habits.length + store.data.studySessions.length + store.data.exercises.length > 0)
const motivation = MOTIVATION[new Date().getDate() % MOTIVATION.length]
const studyGoalText = computed(() => (cur.value.studyGoalMin ? `Meta ${formatMinutes(cur.value.studyGoalMin)}` : 'Defina uma meta no Perfil'))
const workoutGoalText = computed(() => (cur.value.workoutGoal ? `Meta ${cur.value.workoutGoal} treinos` : 'Defina uma meta no Perfil'))
</script>

<template>
  <div class="space-y-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-extrabold">{{ greeting() }}, {{ profile.name }}! 👋</h1>
        <p class="text-sm text-muted">{{ formatLong(today) }}</p>
        <p class="mt-1 text-sm font-medium text-brand">{{ motivation }}</p>
      </div>
      <button class="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card" aria-label="Buscar" @click="ui.searchOpen = true"><Search :size="18" /></button>
    </header>

    <WeeklyDateSelector v-model="selected" />
    <WeeklyGoalsCard :done="cur.goals.done" :total="cur.goals.total" :pct="cur.goals.pct" />

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores da semana">
      <MetricCard to="/estudos" icon="BookOpen" color="#7968F8" title="Horas de estudo" :value="formatMinutes(cur.studyMin)" :sub="studyGoalText" :pct="cur.studyPct" :cmp="report.study" />
      <MetricCard to="/exercicios" icon="Dumbbell" color="#22B985" title="Exercícios" :value="`${cur.workouts} ${cur.workouts === 1 ? 'treino' : 'treinos'}`" :sub="workoutGoalText" :pct="cur.workoutPct" :extra="`Tempo total: ${formatMinutes(cur.exerciseMin)}`" />
      <MetricCard to="/calendario" icon="CircleCheck" color="#3B5BFF" title="Tarefas concluídas" :value="`${cur.tasks.done} de ${cur.tasks.planned}`" sub="planejadas na semana" :pct="cur.tasks.pct" />
      <MetricCard to="/metas" icon="Flame" color="#F6A623" title="Sequência de hábitos" :value="`${report.streak.current} ${report.streak.current === 1 ? 'dia' : 'dias'}`" :sub="`Maior sequência: ${report.streak.best}`" :extra="`${cur.habits.done} de ${cur.habits.scheduled} hábitos realizados`" />
    </section>

    <WeekSummary :report="report" />

    <section aria-label="Atividades">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="font-display text-base font-extrabold">{{ selected === today ? 'Atividades de hoje' : formatLong(selected) }}</h2>
        <button class="min-h-[44px] px-2 text-xs font-bold text-brand" @click="ui.openQuick('task', selected)">+ Adicionar</button>
      </div>
      <ul v-if="dayTasks.length" class="space-y-2"><li v-for="o in dayTasks" :key="o.key"><TaskCard :occ="o" @toggle="tasks.toggleDone(o.taskId, o.date)" @open="detail = { id: o.taskId, date: o.date }" /></li></ul>
      <div v-else class="card"><EmptyState title="Dia livre por aqui" text="Nenhuma atividade programada para este dia." action="Planejar atividade" @action="ui.openQuick('task', selected)" /></div>
    </section>

    <InsightCard :insights="insights" />
    <FirstSteps v-if="!hasAnyData" />
    <TaskDetailModal :task-id="detail?.id ?? null" :date="detail?.date ?? today" @close="detail = null" />
  </div>
</template>
