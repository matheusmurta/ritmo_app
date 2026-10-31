<script setup lang="ts">
/** Quatro indicadores circulares com tooltip de metodologia e comparação com o período anterior. */
import { computed } from 'vue'
import ProgressRing from '@/components/ui/ProgressRing.vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import StatComparison from '@/components/ui/StatComparison.vue'
import { useDataStore } from '@/stores/data.store'
import { summarizePeriod } from '@/services/reports/summary'
import { compare, countExercises, taskStats } from '@/services/reports/metrics'
import { habitConsistency } from '@/services/reports/habits'
import { formatMinutes, previousRange, type Range } from '@/utils/date'

const props = defineProps<{ range: Range }>()
const store = useDataStore()
const cards = computed(() => {
  const d = store.data
  const s = summarizePeriod(d, props.range)
  const prev = previousRange(props.range)
  const ps = summarizePeriod(d, prev)
  return [
    { t: 'Produtividade', icon: 'CircleCheck', color: '#3B5BFF', pct: s.tasks.pct, sub: `${s.tasks.done} de ${s.tasks.planned} tarefas`, cmp: compare(taskStats(d, props.range).done, taskStats(d, prev).done),
      tip: 'Tarefas concluídas ÷ tarefas planejadas no período (canceladas não contam).' },
    { t: 'Consistência', icon: 'Flame', color: '#F6A623', pct: s.habits.pct, sub: `${s.habits.done} de ${s.habits.scheduled} ocorrências`, cmp: compare(s.habits.done, habitConsistency(d, prev).done),
      tip: 'Ocorrências de hábitos cumpridas ÷ ocorrências programadas. Dias sem programação não contam como falha.' },
    { t: 'Estudos', icon: 'BookOpen', color: '#7968F8', pct: s.studyPct, sub: s.studyGoalMin ? `${formatMinutes(s.studyMin)} de ${formatMinutes(s.studyGoalMin)}` : `${formatMinutes(s.studyMin)} · sem meta`, cmp: compare(s.studyMin, ps.studyMin),
      tip: 'Horas estudadas ÷ meta semanal proporcional aos dias do período.' },
    { t: 'Exercícios', icon: 'Dumbbell', color: '#22B985', pct: s.workoutPct, sub: s.workoutGoal ? `${s.workouts} de ${s.workoutGoal} treinos` : `${s.workouts} treinos · sem meta`, cmp: compare(s.workouts, countExercises(d, prev)),
      tip: 'Treinos realizados ÷ meta semanal proporcional aos dias do período.' },
  ]
})
</script>

<template>
  <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores">
    <article v-for="c in cards" :key="c.t" class="card flex flex-col items-center gap-2 p-4 text-center" :title="c.tip">
      <div class="flex items-center gap-2 self-start"><IconBadge :icon="c.icon" :color="c.color" :size="30" /><h3 class="text-xs font-bold text-muted">{{ c.t }}</h3></div>
      <ProgressRing :value="c.pct" :color="c.color" :size="100" :label="c.t"><span class="font-display text-xl font-extrabold">{{ c.pct == null ? '—' : c.pct + '%' }}</span></ProgressRing>
      <p class="text-xs text-muted">{{ c.sub }}</p>
      <StatComparison :cmp="c.cmp" short />
      <p class="text-[10px] leading-tight text-muted">{{ c.tip }}</p>
    </article>
  </section>
</template>
