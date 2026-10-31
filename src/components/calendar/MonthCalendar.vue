<script setup lang="ts">
/** Grade mensal (segunda a domingo) com pontos coloridos por categoria e destaque de atrasadas. */
import { computed } from 'vue'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { occurrencesOn } from '@/utils/recurrence'
import { dayOfMonth, monthGrid, todayISO, WEEKDAY_ABBR, type ISODate } from '@/utils/date'
import type { TaskOccurrence } from '@/models'

const props = defineProps<{ month: string; selected: ISODate; filter: (o: TaskOccurrence) => boolean }>()
const emit = defineEmits<{ select: [ISODate] }>()
const store = useDataStore()
const goals = useGoalsStore()
const today = todayISO()
const grid = computed(() => monthGrid(props.month))
const cells = computed(() => grid.value.map((d) => {
  const occ = occurrencesOn(store.data.tasks, d).filter(props.filter)
  const colors = [...new Set(occ.map((o) => goals.category(o.categoryId).color))].slice(0, 4)
  return { d, colors, count: occ.length, overdue: occ.some((o) => o.overdue) }
}))
</script>

<template>
  <div role="grid" aria-label="Calendário mensal">
    <div class="mb-1 grid grid-cols-7 text-center text-[11px] font-bold text-muted"><span v-for="w in WEEKDAY_ABBR" :key="w">{{ w }}</span></div>
    <div class="grid grid-cols-7 gap-1">
      <button v-for="c in cells" :key="c.d" role="gridcell" class="relative flex min-h-[48px] flex-col items-center justify-center rounded-xl border text-sm font-semibold transition active:scale-95 md:min-h-[72px]"
        :class="[c.d === selected ? 'border-brand bg-brand text-white shadow-pop' : c.d === today ? 'border-brand/60 bg-lilac text-brand' : 'border-transparent hover:bg-bg', c.d.slice(0, 7) !== month.slice(0, 7) ? 'opacity-40' : '']"
        :aria-label="`${dayOfMonth(c.d)}, ${c.count} atividades${c.overdue ? ', com atrasadas' : ''}`" :aria-selected="c.d === selected" @click="emit('select', c.d)">
        {{ dayOfMonth(c.d) }}
        <span class="mt-0.5 flex h-1.5 gap-0.5"><span v-for="col in c.colors" :key="col" class="h-1.5 w-1.5 rounded-full" :style="{ background: c.d === selected ? '#fff' : col }" /></span>
        <span v-if="c.overdue" class="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
