<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDataStore } from '@/stores/data.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { PRIORITY_LABEL, RECURRENCE_LABEL, STATUS_LABEL } from '@/constants/labels'
import { WEEKDAY_ABBR, isValidISO, todayISO } from '@/utils/date'
import type { Priority, Task, TaskStatus } from '@/models'

const props = defineProps<{ taskId?: string; date?: string }>()
const emit = defineEmits<{ done: [] }>()
const data = useDataStore()
const tasks = useTasksStore()
const ui = useUiStore()
const existing = computed(() => (props.taskId ? tasks.find(props.taskId) : undefined))
const t = existing.value
const f = reactive({
  title: t?.title ?? '', description: t?.description ?? '', categoryId: t?.categoryId ?? 'estudos',
  date: t?.date ?? props.date ?? todayISO(), time: t?.time ?? '', duration: t?.durationMin ? String(t.durationMin) : '',
  priority: (t?.priority ?? 'medium') as Priority, status: (t?.status ?? 'pending') as TaskStatus, goalId: t?.goalId ?? '',
  kind: (t?.recurrence.kind ?? 'none') as Task['recurrence']['kind'], days: [...(t?.recurrence.days ?? [])], until: t?.recurrence.until ?? '',
})
const error = ref('')

function toggleDay(d: number) {
  f.days = f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort()
}
function submit() {
  error.value = ''
  if (!f.title.trim()) return (error.value = 'Informe um título.')
  if (!isValidISO(f.date)) return (error.value = 'Informe uma data válida.')
  if (f.kind === 'weekdays' && !f.days.length) return (error.value = 'Escolha ao menos um dia da semana.')
  const dur = f.duration ? Number(f.duration) : undefined
  if (dur !== undefined && (!Number.isInteger(dur) || dur < 1 || dur > 1440)) return (error.value = 'Duração deve ser entre 1 e 1440 minutos.')
  const payload = {
    title: f.title.trim(), description: f.description.trim() || undefined, categoryId: f.categoryId, date: f.date,
    time: f.time || undefined, durationMin: dur, priority: f.priority, goalId: f.goalId || undefined,
    recurrence: { kind: f.kind, days: f.kind === 'weekdays' ? f.days : [], until: f.kind !== 'none' && isValidISO(f.until) ? f.until : undefined },
  }
  if (existing.value) {
    tasks.update(existing.value.id, { ...payload, ...(f.kind === 'none' ? { status: f.status } : {}) })
    ui.toast('Tarefa atualizada')
  } else {
    tasks.add(payload)
    ui.toast('Tarefa criada ✨')
  }
  emit('done')
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div><label class="label" for="tf-title">Título</label><input id="tf-title" v-model="f.title" class="field" maxlength="160" required /></div>
    <div><label class="label" for="tf-desc">Descrição / observações</label><textarea id="tf-desc" v-model="f.description" class="field py-2" rows="2" maxlength="2000" /></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="label" for="tf-cat">Categoria</label><select id="tf-cat" v-model="f.categoryId" class="field"><option v-for="c in data.data.categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
      <div><label class="label" for="tf-pri">Prioridade</label><select id="tf-pri" v-model="f.priority" class="field"><option v-for="(l, k) in PRIORITY_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
      <div><label class="label" for="tf-date">Data</label><input id="tf-date" v-model="f.date" type="date" class="field" required /></div>
      <div><label class="label" for="tf-time">Horário (opcional)</label><input id="tf-time" v-model="f.time" type="time" class="field" /></div>
      <div><label class="label" for="tf-dur">Duração (min)</label><input id="tf-dur" v-model="f.duration" type="number" inputmode="numeric" min="1" max="1440" class="field" /></div>
      <div v-if="existing && f.kind === 'none'"><label class="label" for="tf-st">Status</label><select id="tf-st" v-model="f.status" class="field"><option v-for="(l, k) in STATUS_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
    </div>
    <div><label class="label" for="tf-goal">Meta vinculada (opcional)</label><select id="tf-goal" v-model="f.goalId" class="field"><option value="">Nenhuma</option><option v-for="g in data.data.goals" :key="g.id" :value="g.id">{{ g.name }}</option></select></div>
    <div><label class="label" for="tf-rec">Recorrência</label><select id="tf-rec" v-model="f.kind" class="field"><option v-for="(l, k) in RECURRENCE_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
    <fieldset v-if="f.kind === 'weekdays'"><legend class="label">Dias da semana</legend>
      <div class="flex gap-1"><button v-for="(n, i) in WEEKDAY_ABBR" :key="n" type="button" class="min-h-[44px] flex-1 rounded-xl border text-xs font-bold" :class="f.days.includes(i + 1) ? 'border-brand bg-brand text-white' : 'border-line'" :aria-pressed="f.days.includes(i + 1)" @click="toggleDay(i + 1)">{{ n }}</button></div>
    </fieldset>
    <div v-if="f.kind !== 'none'"><label class="label" for="tf-until">Repetir até (opcional)</label><input id="tf-until" v-model="f.until" type="date" class="field" /></div>
    <p v-if="existing && f.kind !== 'none'" class="text-xs text-muted">Editando a série inteira. Para alterar só um dia, use as ações da ocorrência na agenda.</p>
    <p v-if="error" class="text-sm font-semibold text-rose" role="alert">{{ error }}</p>
    <button class="btn-primary w-full" type="submit">{{ existing ? 'Salvar alterações' : 'Criar tarefa' }}</button>
  </form>
</template>
