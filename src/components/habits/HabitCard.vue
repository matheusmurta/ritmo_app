<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Pencil, Trash2 } from '@lucide/vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import { useDataStore } from '@/stores/data.store'
import { useHabitsStore } from '@/stores/habits.store'
import { habitScheduled, habitStreaks } from '@/services/reports/habits'
import { daysBetween, todayISO, weekRange, WEEKDAY_LETTERS } from '@/utils/date'
import type { Habit } from '@/models'

const props = defineProps<{ habit: Habit }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
const store = useDataStore()
const habits = useHabitsStore()
const today = todayISO()
const streak = computed(() => habitStreaks(store.data, props.habit, today))
const week = computed(() => daysBetween(weekRange(today).from, weekRange(today).to))
const doneToday = computed(() => habits.isDone(props.habit.id, today))
</script>

<template>
  <div class="card p-4">
    <div class="flex items-center gap-3">
      <IconBadge :icon="habit.icon" :color="habit.color" :size="42" />
      <div class="min-w-0 flex-1">
        <p class="truncate font-display text-sm font-extrabold">{{ habit.name }}</p>
        <p class="flex items-center gap-1 text-xs text-muted"><Flame :size="13" class="text-amber" />{{ streak.current }} {{ streak.current === 1 ? 'dia' : 'dias' }} · melhor {{ streak.best }}</p>
      </div>
      <button v-if="habitScheduled(habit, today)" class="btn min-w-[44px] px-3" :class="doneToday ? 'bg-mint text-white' : 'bg-lilac text-brand'" :aria-pressed="doneToday" @click="habits.toggle(habit.id, today)">{{ doneToday ? 'Feito ✓' : 'Hoje' }}</button>
      <span v-else class="chip bg-bg text-muted">Folga</span>
    </div>
    <div class="mt-3 flex justify-between">
      <button v-for="(d, i) in week" :key="d" :disabled="!habitScheduled(habit, d) || d > today" class="flex flex-col items-center gap-1 text-[10px] font-bold text-muted disabled:cursor-default" :aria-label="`${WEEKDAY_LETTERS[i]} ${d}`" :aria-pressed="habits.isDone(habit.id, d)" @click="habits.toggle(habit.id, d)">
        {{ WEEKDAY_LETTERS[i] }}
        <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs" :class="habits.isDone(habit.id, d) ? 'border-mint bg-mint text-white' : !habitScheduled(habit, d) ? 'border-dashed border-line opacity-50' : 'border-line'">{{ habits.isDone(habit.id, d) ? '✓' : '' }}</span>
      </button>
    </div>
    <div class="mt-2 flex justify-end gap-1">
      <button class="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-bg" :aria-label="`Editar ${habit.name}`" @click="emit('edit')"><Pencil :size="16" /></button>
      <button class="flex h-11 w-11 items-center justify-center rounded-full text-rose hover:bg-bg" :aria-label="`Excluir ${habit.name}`" @click="emit('remove')"><Trash2 :size="16" /></button>
    </div>
  </div>
</template>
