<script setup lang="ts">
/** Card de meta com progresso real vs. esperado e, em metas de frequência, os 7 dias da semana. */
import { computed } from 'vue'
import { ChevronRight } from '@lucide/vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useDataStore } from '@/stores/data.store'
import { goalProgress } from '@/services/reports/goals'
import { daysBetween, inRange, todayISO, weekRange, WEEKDAY_LETTERS, type ISODate } from '@/utils/date'
import type { Goal } from '@/models'

const props = defineProps<{ goal: Goal }>()
const store = useDataStore()
const p = computed(() => goalProgress(store.data, props.goal))
const today = todayISO()
const week = computed(() => daysBetween(weekRange(today).from, weekRange(today).to))
const doneDays = computed(() => {
  const g = props.goal
  const s = new Set<ISODate>()
  const d = store.data
  d.progress.filter((x) => x.goalId === g.id).forEach((x) => s.add(x.date))
  ;[...d.studySessions, ...d.exercises].filter((x) => x.goalId === g.id).forEach((x) => s.add(x.date))
  return s
})
const showWeek = computed(() => props.goal.type === 'frequency')
const inGoal = (d: ISODate) => inRange(d, { from: props.goal.startDate, to: props.goal.deadline ?? '9999-12-31' })
const unitText = computed(() => (props.goal.type === 'binary' ? '' : ` ${props.goal.unit}`))
const status = computed(() => {
  if (p.value.complete) return { t: 'Concluída', c: 'text-mint' }
  if (p.value.daysLeft == null) return { t: 'Sem prazo', c: 'text-muted' }
  if (p.value.daysLeft < 0) return { t: 'Prazo encerrado', c: 'text-rose' }
  if (p.value.daysLeft === 0) return { t: 'Termina hoje', c: 'text-amber' }
  return { t: `${p.value.daysLeft} ${p.value.daysLeft === 1 ? 'dia restante' : 'dias restantes'}`, c: 'text-muted' }
})
</script>

<template>
  <RouterLink :to="`/metas/${goal.id}`" class="card block p-4 transition active:scale-[0.99]">
    <div class="flex items-center gap-3">
      <IconBadge :icon="goal.icon" :color="goal.color" :size="44" />
      <div class="min-w-0 flex-1">
        <p class="truncate font-display text-sm font-extrabold">{{ goal.name }}</p>
        <p class="text-xs text-muted">
          <template v-if="goal.type === 'binary'">{{ p.complete ? 'Concluída' : 'Em andamento' }}</template>
          <template v-else>{{ p.current }} de {{ p.target }}{{ unitText }}</template>
          <span v-if="p.expected != null"> · esperado {{ p.expected }}%</span>
        </p>
      </div>
      <div class="text-right"><p class="font-display text-lg font-extrabold" :style="{ color: goal.color }">{{ p.pct ?? 0 }}%</p></div>
      <ChevronRight :size="18" class="text-muted" aria-hidden="true" />
    </div>
    <div class="relative mt-3">
      <ProgressBar :value="p.pct ?? 0" :color="goal.color" :label="goal.name" />
      <span v-if="p.expected != null" class="absolute -top-1 h-4 w-0.5 rounded bg-ink/50" :style="{ left: p.expected + '%' }" aria-hidden="true" />
    </div>
    <div v-if="showWeek" class="mt-3 flex justify-between" aria-label="Dias da semana">
      <span v-for="(d, i) in week" :key="d" class="flex flex-col items-center gap-1 text-[10px] font-bold text-muted">
        {{ WEEKDAY_LETTERS[i] }}
        <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px]"
          :class="doneDays.has(d) ? 'border-mint bg-mint text-white' : !inGoal(d) ? 'border-dashed border-line opacity-50' : d > today ? 'border-line/70' : 'border-line bg-bg'"
          :aria-label="doneDays.has(d) ? 'feito' : d > today ? 'futuro' : 'pendente'">{{ doneDays.has(d) ? '✓' : '' }}</span>
      </span>
    </div>
    <p class="mt-2 text-xs font-semibold" :class="status.c">{{ status.t }}</p>
  </RouterLink>
</template>
