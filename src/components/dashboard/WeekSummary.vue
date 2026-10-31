<script setup lang="ts">
import { BookOpen, CircleCheck, Dumbbell, Flame, Trophy } from '@lucide/vue'
import StatComparison from '@/components/ui/StatComparison.vue'
import type { WeekReport } from '@/services/reports/summary'
import { formatMinutes } from '@/utils/date'
defineProps<{ report: WeekReport }>()
</script>

<template>
  <section class="card p-4" aria-label="Resumo da semana">
    <div class="mb-3 flex items-center justify-between"><h2 class="font-display text-base font-extrabold">Resumo da semana</h2><RouterLink to="/relatorios" class="flex min-h-[44px] items-center text-xs font-bold text-brand">Relatórios</RouterLink></div>
    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div><dt class="flex items-center gap-1 text-xs text-muted"><BookOpen :size="12" />Estudo</dt><dd class="font-display font-extrabold">{{ formatMinutes(report.current.studyMin) }}</dd><StatComparison :cmp="report.study" short /></div>
      <div><dt class="flex items-center gap-1 text-xs text-muted"><Dumbbell :size="12" />Treinos</dt><dd class="font-display font-extrabold">{{ report.current.workouts }}</dd><StatComparison :cmp="report.workouts" short /></div>
      <div><dt class="flex items-center gap-1 text-xs text-muted"><CircleCheck :size="12" />Tarefas</dt><dd class="font-display font-extrabold">{{ report.current.tasks.done }}/{{ report.current.tasks.planned }}</dd><StatComparison :cmp="report.tasks" short /></div>
      <div><dt class="flex items-center gap-1 text-xs text-muted"><Trophy :size="12" />Metas</dt><dd class="font-display font-extrabold">{{ report.current.goals.done }}/{{ report.current.goals.total }}</dd><span class="text-xs text-muted">{{ report.current.goals.pct == null ? 'sem metas' : report.current.goals.pct + '%' }}</span></div>
      <div><dt class="flex items-center gap-1 text-xs text-muted"><Flame :size="12" />Consistência</dt><dd class="font-display font-extrabold">{{ report.current.habits.pct == null ? '—' : report.current.habits.pct + '%' }}</dd><StatComparison :cmp="report.habits" short /></div>
    </dl>
  </section>
</template>
