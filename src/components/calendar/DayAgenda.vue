<script setup lang="ts">
/** Agenda de um dia (ordenada por horário) ou de uma semana. */
import { computed } from 'vue'
import TaskCard from '@/components/dashboard/TaskCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useDataStore } from '@/stores/data.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { occurrencesOn } from '@/utils/recurrence'
import { daysBetween, formatLong, weekRange, type ISODate } from '@/utils/date'
import type { TaskOccurrence } from '@/models'

const props = defineProps<{ date: ISODate; mode: 'day' | 'week'; filter: (o: TaskOccurrence) => boolean }>()
const emit = defineEmits<{ open: [id: string, date: ISODate] }>()
const store = useDataStore()
const tasks = useTasksStore()
const ui = useUiStore()
const days = computed(() => {
  const list = props.mode === 'day' ? [props.date] : daysBetween(weekRange(props.date).from, weekRange(props.date).to)
  return list.map((d) => ({ d, items: occurrencesOn(store.data.tasks, d).filter(props.filter) }))
})
const total = computed(() => days.value.reduce((a, x) => a + x.items.length, 0))
</script>

<template>
  <div class="space-y-4">
    <section v-for="g in days" :key="g.d" :aria-label="formatLong(g.d)">
      <h3 class="mb-1.5 text-sm font-extrabold">{{ formatLong(g.d) }}</h3>
      <ul v-if="g.items.length" class="space-y-2">
        <li v-for="o in g.items" :key="o.key" class="flex gap-2">
          <span class="w-12 shrink-0 pt-4 text-right text-xs font-bold text-muted">{{ o.time ?? '—' }}</span>
          <div class="min-w-0 flex-1"><TaskCard :occ="o" @toggle="tasks.toggleDone(o.taskId, o.date)" @open="emit('open', o.taskId, o.date)" /></div>
        </li>
      </ul>
      <p v-else-if="mode === 'week'" class="text-xs text-muted">Sem atividades.</p>
    </section>
    <div v-if="total === 0 && mode === 'day'" class="card"><EmptyState title="Nada agendado" text="Nenhuma atividade para este dia com os filtros atuais." action="Adicionar atividade" @action="ui.openQuick('task', date)" /></div>
  </div>
</template>
