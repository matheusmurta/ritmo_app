<script setup lang="ts">
/** Seletor horizontal dos 7 dias da semana (segunda a domingo). */
import { computed } from 'vue'
import { daysBetween, dayOfMonth, todayISO, weekRange, weekdayShort } from '@/utils/date'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const days = computed(() => { const r = weekRange(props.modelValue); return daysBetween(r.from, r.to) })
const today = todayISO()
</script>

<template>
  <div class="grid grid-cols-7 gap-1.5" role="group" aria-label="Dias da semana">
    <button v-for="d in days" :key="d" class="flex min-h-[60px] flex-col items-center justify-center rounded-2xl border text-center transition active:scale-95"
      :class="d === modelValue ? 'border-brand bg-brand text-white shadow-pop' : d === today ? 'border-brand/50 bg-lilac text-brand' : 'border-line bg-card'"
      :aria-pressed="d === modelValue" :aria-label="`${weekdayShort(d)}, dia ${dayOfMonth(d)}${d === today ? ' (hoje)' : ''}`" @click="emit('update:modelValue', d)">
      <span class="text-[10px] font-bold tracking-wide" :class="d === modelValue ? 'text-white/80' : 'text-muted'">{{ weekdayShort(d) }}</span>
      <span class="font-display text-lg font-extrabold">{{ dayOfMonth(d) }}</span>
    </button>
  </div>
</template>
