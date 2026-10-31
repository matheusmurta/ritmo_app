<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useDataStore } from '@/stores/data.store'
import { useStudiesStore } from '@/stores/studies.store'
import { useUiStore } from '@/stores/ui.store'
import { STUDY_TYPE_LABEL } from '@/constants/labels'
import { todayISO } from '@/utils/date'
import type { StudyType } from '@/models'

const props = defineProps<{ sessionId?: string; date?: string }>()
const emit = defineEmits<{ done: [] }>()
const data = useDataStore()
const studies = useStudiesStore()
const ui = useUiStore()
const s = props.sessionId ? data.data.studySessions.find((x) => x.id === props.sessionId) : undefined
const f = reactive({
  subject: s?.subject ?? '', date: s?.date ?? props.date ?? todayISO(), startTime: s?.startTime ?? '',
  minutes: s ? String(s.minutes) : '', type: (s?.type ?? 'reading') as StudyType, notes: s?.notes ?? '', goalId: s?.goalId ?? '',
})
const error = ref('')
function submit() {
  const minutes = Number(f.minutes)
  if (!f.subject.trim()) return (error.value = 'Informe a matéria ou assunto.')
  if (!(minutes >= 1 && minutes <= 1440)) return (error.value = 'Duração deve ser entre 1 e 1440 minutos.')
  const payload = { subject: f.subject.trim(), date: f.date, startTime: f.startTime || undefined, minutes, type: f.type, notes: f.notes.trim() || undefined, goalId: f.goalId || undefined }
  if (s) { studies.update(s.id, payload); ui.toast('Sessão atualizada') }
  else { studies.add(payload); ui.toast('Estudo registrado 📚') }
  emit('done')
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div><label class="label" for="sf-sub">Matéria ou assunto</label><input id="sf-sub" v-model="f.subject" class="field" list="sf-subjects" maxlength="100" required /><datalist id="sf-subjects"><option v-for="x in studies.subjects" :key="x" :value="x" /></datalist></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="label" for="sf-date">Data</label><input id="sf-date" v-model="f.date" type="date" class="field" required /></div>
      <div><label class="label" for="sf-time">Horário inicial</label><input id="sf-time" v-model="f.startTime" type="time" class="field" /></div>
      <div><label class="label" for="sf-min">Duração (min)</label><input id="sf-min" v-model="f.minutes" type="number" inputmode="numeric" min="1" max="1440" class="field" required /></div>
      <div><label class="label" for="sf-type">Tipo</label><select id="sf-type" v-model="f.type" class="field"><option v-for="(l, k) in STUDY_TYPE_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
    </div>
    <div><label class="label" for="sf-goal">Meta relacionada</label><select id="sf-goal" v-model="f.goalId" class="field"><option value="">Nenhuma</option><option v-for="g in data.data.goals" :key="g.id" :value="g.id">{{ g.name }}</option></select></div>
    <div><label class="label" for="sf-notes">Notas</label><textarea id="sf-notes" v-model="f.notes" class="field py-2" rows="2" maxlength="2000" /></div>
    <p v-if="error" class="text-sm font-semibold text-rose" role="alert">{{ error }}</p>
    <button class="btn-primary w-full" type="submit">{{ s ? 'Salvar alterações' : 'Registrar estudo' }}</button>
  </form>
</template>
