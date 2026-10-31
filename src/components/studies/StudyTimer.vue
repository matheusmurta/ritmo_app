<script setup lang="ts">
/** Cronômetro de estudos baseado em timestamps; o setInterval só atualiza a tela. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Pause, Play, Square, Trash2 } from '@lucide/vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useDataStore } from '@/stores/data.store'
import { useStudiesStore } from '@/stores/studies.store'
import { formatDuration } from '@/utils/date'

const studies = useStudiesStore()
const data = useDataStore()
const subject = ref('')
const goalId = ref('')
const now = ref(Date.now())
const confirmDiscard = ref(false)
const restored = ref(false)
let id: ReturnType<typeof setInterval> | undefined

const timer = computed(() => studies.timer)
const elapsed = computed(() => studies.elapsedMs(now.value))

onMounted(() => {
  // Após recarregar, um timer "rodando" é pausado com segurança e o usuário decide o que fazer.
  if (studies.restoreSafely()) restored.value = true
  id = setInterval(() => { now.value = Date.now(); studies.touch() }, 1000)
})
onBeforeUnmount(() => clearInterval(id))

function start() {
  studies.startTimer(subject.value.trim() || 'Estudo livre', 'reading', goalId.value || undefined)
  restored.value = false
}
function finish() { studies.finishTimer(); restored.value = false }
function discard() { studies.discardTimer(); confirmDiscard.value = false; restored.value = false }
</script>

<template>
  <section class="card p-4" aria-label="Cronômetro de estudos">
    <h2 class="mb-3 font-display text-base font-extrabold">Cronômetro</h2>
    <template v-if="!timer">
      <label class="label" for="tm-sub">Matéria ou assunto</label>
      <input id="tm-sub" v-model="subject" class="field" list="tm-list" maxlength="100" placeholder="Ex.: TypeScript" />
      <datalist id="tm-list"><option v-for="s in studies.subjects" :key="s" :value="s" /></datalist>
      <label class="label mt-3" for="tm-goal">Meta (opcional)</label>
      <select id="tm-goal" v-model="goalId" class="field"><option value="">Nenhuma</option><option v-for="g in data.data.goals" :key="g.id" :value="g.id">{{ g.name }}</option></select>
      <button class="btn-primary mt-4 w-full" @click="start"><Play :size="18" />Iniciar</button>
    </template>
    <template v-else>
      <p class="text-center text-sm text-muted">{{ timer.subject }}</p>
      <p class="my-2 text-center font-display text-5xl font-extrabold tabular-nums" role="timer" aria-live="off">{{ formatDuration(elapsed) }}</p>
      <p v-if="restored" class="mb-3 rounded-xl bg-amber/15 p-2 text-center text-xs font-semibold" role="status">Sessão restaurada e pausada com o último tempo registrado. Retome ou finalize.</p>
      <div class="flex gap-2">
        <button v-if="timer.running" class="btn-soft flex-1" @click="studies.pauseTimer()"><Pause :size="18" />Pausar</button>
        <button v-else class="btn-primary flex-1" @click="studies.resumeTimer(); restored = false"><Play :size="18" />Retomar</button>
        <button class="btn-primary flex-1 !bg-mint" @click="finish"><Square :size="16" />Finalizar</button>
        <button class="btn-ghost !px-3 text-rose" aria-label="Descartar sessão" @click="confirmDiscard = true"><Trash2 :size="18" /></button>
      </div>
    </template>
    <ConfirmDialog :open="confirmDiscard" title="Descartar sessão?" message="O tempo desta sessão não será salvo." confirm-label="Descartar" @cancel="confirmDiscard = false" @confirm="discard" />
  </section>
</template>
