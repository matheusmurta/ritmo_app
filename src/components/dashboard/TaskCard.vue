<script setup lang="ts">
/** Linha de tarefa/ocorrência com checkbox, metadados e ações. */
import { Check, Clock, Pencil, Repeat } from '@lucide/vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import { useGoalsStore } from '@/stores/goals.store'
import { STATUS_LABEL } from '@/constants/labels'
import { formatMinutes } from '@/utils/date'
import type { TaskOccurrence } from '@/models'

const props = defineProps<{ occ: TaskOccurrence; compact?: boolean }>()
const emit = defineEmits<{ toggle: []; open: [] }>()
const cat = useGoalsStore().category(props.occ.categoryId)
</script>

<template>
  <div class="flex items-center gap-3 rounded-2xl border border-line bg-card p-3" :class="occ.status === 'cancelled' ? 'opacity-60' : ''">
    <button class="flex h-11 w-11 shrink-0 items-center justify-center" :aria-label="occ.status === 'done' ? `Reabrir ${occ.title}` : `Concluir ${occ.title}`" :aria-pressed="occ.status === 'done'" @click="emit('toggle')">
      <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 transition" :class="occ.status === 'done' ? 'pop-enter-active border-mint bg-mint text-white' : 'border-line'"><Check v-if="occ.status === 'done'" :size="16" :stroke-width="3" /></span>
    </button>
    <IconBadge :icon="cat.icon" :color="cat.color" :size="36" />
    <button class="min-w-0 flex-1 text-left" @click="emit('open')">
      <p class="truncate text-sm font-bold" :class="occ.status === 'done' ? 'text-muted line-through' : ''">{{ occ.title }}</p>
      <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
        <span v-if="occ.time" class="inline-flex items-center gap-0.5"><Clock :size="12" />{{ occ.time }}</span>
        <span v-if="occ.durationMin">{{ formatMinutes(occ.durationMin) }}</span>
        <Repeat v-if="occ.recurring" :size="12" aria-label="Recorrente" />
        <span :class="occ.overdue ? 'font-bold text-rose' : ''">{{ occ.overdue ? 'Atrasada' : STATUS_LABEL[occ.status] }}</span>
      </p>
    </button>
    <button class="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-bg" :aria-label="`Editar ${occ.title}`" @click="emit('open')"><Pencil :size="16" /></button>
  </div>
</template>
