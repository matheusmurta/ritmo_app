<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useDataStore } from '@/stores/data.store'
import { useExercisesStore } from '@/stores/exercises.store'
import { useUiStore } from '@/stores/ui.store'
import { EXERCISE_LABEL } from '@/constants/labels'
import { todayISO } from '@/utils/date'
import type { ExerciseType } from '@/models'

const props = defineProps<{ exerciseId?: string; date?: string }>()
const emit = defineEmits<{ done: [] }>()
const data = useDataStore()
const ex = useExercisesStore()
const ui = useUiStore()
const e = props.exerciseId ? data.data.exercises.find((x) => x.id === props.exerciseId) : undefined
const f = reactive({
  type: (e?.type ?? 'gym') as ExerciseType, date: e?.date ?? props.date ?? todayISO(), minutes: e ? String(e.minutes) : '',
  distance: e?.distanceKm != null ? String(e.distanceKm) : '', intensity: e?.intensity != null ? String(e.intensity) : '', notes: e?.notes ?? '', goalId: e?.goalId ?? '',
})
const error = ref('')
function submit() {
  const minutes = Number(f.minutes)
  if (!(minutes >= 1 && minutes <= 1440)) return (error.value = 'Duração deve ser entre 1 e 1440 minutos.')
  const distanceKm = f.distance !== '' ? Number(f.distance) : undefined
  if (distanceKm !== undefined && !(distanceKm >= 0)) return (error.value = 'Distância inválida.')
  const intensity = f.intensity !== '' ? Number(f.intensity) : undefined
  if (intensity !== undefined && !(Number.isInteger(intensity) && intensity >= 1 && intensity <= 10)) return (error.value = 'Intensidade deve ser de 1 a 10.')
  const payload = { type: f.type, date: f.date, minutes, distanceKm, intensity, notes: f.notes.trim() || undefined, goalId: f.goalId || undefined }
  if (e) { ex.update(e.id, payload); ui.toast('Treino atualizado') }
  else { ex.add(payload); ui.toast('Treino registrado 💪') }
  emit('done')
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div class="grid grid-cols-2 gap-3">
      <div><label class="label" for="ef-type">Tipo</label><select id="ef-type" v-model="f.type" class="field"><option v-for="(l, k) in EXERCISE_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
      <div><label class="label" for="ef-date">Data</label><input id="ef-date" v-model="f.date" type="date" class="field" required /></div>
      <div><label class="label" for="ef-min">Duração (min)</label><input id="ef-min" v-model="f.minutes" type="number" inputmode="numeric" min="1" max="1440" class="field" required /></div>
      <div><label class="label" for="ef-dist">Distância (km, opcional)</label><input id="ef-dist" v-model="f.distance" type="number" inputmode="decimal" min="0" step="any" class="field" /></div>
      <div class="col-span-2"><label class="label" for="ef-int">Intensidade percebida 1–10 (opcional)</label><input id="ef-int" v-model="f.intensity" type="number" inputmode="numeric" min="1" max="10" class="field" /></div>
    </div>
    <div><label class="label" for="ef-goal">Meta vinculada</label><select id="ef-goal" v-model="f.goalId" class="field"><option value="">Nenhuma</option><option v-for="g in data.data.goals" :key="g.id" :value="g.id">{{ g.name }}</option></select></div>
    <div><label class="label" for="ef-notes">Observações</label><textarea id="ef-notes" v-model="f.notes" class="field py-2" rows="2" maxlength="2000" /></div>
    <p v-if="error" class="text-sm font-semibold text-rose" role="alert">{{ error }}</p>
    <button class="btn-primary w-full" type="submit">{{ e ? 'Salvar alterações' : 'Registrar treino' }}</button>
  </form>
</template>
