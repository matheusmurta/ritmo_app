<script setup lang="ts">
/** Detalhes de uma ocorrência: concluir/reabrir, reagendar, editar (ocorrência ou série) e excluir. */
import { computed, ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CategoryBadge from '@/components/ui/CategoryBadge.vue'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { PRIORITY_LABEL, STATUS_LABEL } from '@/constants/labels'
import { formatLong, formatMinutes } from '@/utils/date'
import { occurrenceOf } from '@/utils/recurrence'
import type { TaskStatus } from '@/models'

const props = defineProps<{ taskId: string | null; date: string }>()
const emit = defineEmits<{ close: [] }>()
const tasks = useTasksStore()
const ui = useUiStore()
const newDate = ref('')
const occ = computed(() => {
  const t = props.taskId ? tasks.find(props.taskId) : undefined
  return t ? occurrenceOf(t, props.date) : null
})
const statuses: TaskStatus[] = ['pending', 'in_progress', 'done', 'cancelled']

function set(s: TaskStatus) { if (occ.value) tasks.setStatus(occ.value.taskId, props.date, s) }
function edit() { if (occ.value) { ui.openQuick('task', props.date, occ.value.taskId); emit('close') } }
function remove() {
  if (!occ.value) return
  if (occ.value.recurring) tasks.skipOccurrence(occ.value.taskId, props.date)
  else tasks.remove(occ.value.taskId)
  emit('close')
}
function removeSeries() { if (occ.value) { tasks.remove(occ.value.taskId); emit('close') } }
function reschedule() { if (occ.value && newDate.value) { tasks.reschedule(occ.value.taskId, props.date, newDate.value); newDate.value = ''; emit('close') } }
</script>

<template>
  <BaseModal :open="!!occ" :title="occ?.title ?? ''" @close="emit('close')">
    <template v-if="occ">
      <div class="mb-3 flex flex-wrap items-center gap-2"><CategoryBadge :category-id="occ.categoryId" /><span class="chip bg-bg text-muted">Prioridade {{ PRIORITY_LABEL[occ.priority].toLowerCase() }}</span><span v-if="occ.recurring" class="chip bg-lilac text-brand">Recorrente</span></div>
      <p class="text-sm">{{ formatLong(occ.date) }}<span v-if="occ.time"> · {{ occ.time }}</span><span v-if="occ.durationMin"> · {{ formatMinutes(occ.durationMin) }}</span></p>
      <p v-if="occ.task.description" class="mt-2 whitespace-pre-line text-sm text-muted">{{ occ.task.description }}</p>
      <fieldset class="mt-4"><legend class="label">Status desta ocorrência</legend>
        <div class="grid grid-cols-2 gap-2"><button v-for="s in statuses" :key="s" class="min-h-[44px] rounded-xl border text-sm font-semibold" :class="occ.status === s ? 'border-brand bg-brand text-white' : 'border-line'" :aria-pressed="occ.status === s" @click="set(s)">{{ STATUS_LABEL[s] }}</button></div>
      </fieldset>
      <div class="mt-4 flex items-end gap-2"><div class="flex-1"><label class="label" for="td-date">Reagendar para</label><input id="td-date" v-model="newDate" type="date" class="field" /></div><button class="btn-soft" :disabled="!newDate" @click="reschedule">Mover</button></div>
      <div class="mt-5 flex flex-wrap gap-2">
        <button class="btn-ghost flex-1" @click="edit">{{ occ.recurring ? 'Editar série' : 'Editar' }}</button>
        <button class="btn-danger flex-1" @click="remove">{{ occ.recurring ? 'Excluir só este dia' : 'Excluir' }}</button>
        <button v-if="occ.recurring" class="btn-ghost w-full !text-rose" @click="removeSeries">Excluir a série inteira</button>
      </div>
    </template>
  </BaseModal>
</template>
