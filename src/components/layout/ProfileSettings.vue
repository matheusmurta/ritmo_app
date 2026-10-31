<script setup lang="ts">
import { computed, ref } from 'vue'
import { Moon, Share2, Sun } from '@lucide/vue'
import { useDataStore } from '@/stores/data.store'
import { usePreferencesStore } from '@/stores/preferences.store'
import { useProfileStore } from '@/stores/profile.store'
import { useUiStore } from '@/stores/ui.store'
import { weekShareText } from '@/services/reports/summary'

const store = useDataStore()
const prefs = usePreferencesStore()
const profile = useProfileStore()
const ui = useUiStore()
const name = ref(profile.name)
const studyH = ref(prefs.prefs.weeklyStudyGoalMin ? String(prefs.prefs.weeklyStudyGoalMin / 60) : '')
const workouts = ref(prefs.prefs.weeklyWorkoutGoal ? String(prefs.prefs.weeklyWorkoutGoal) : '')
const dark = computed(() => prefs.prefs.theme === 'dark' || (prefs.prefs.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches))

function saveName() {
  if (name.value.trim()) { profile.rename(name.value); ui.toast('Nome atualizado') }
}
function saveGoals() {
  const h = studyH.value === '' ? null : Number(studyH.value)
  const w = workouts.value === '' ? null : Number(workouts.value)
  if ((h != null && !(h >= 0)) || (w != null && !(w >= 0))) return ui.toast('Valores inválidos', 'error')
  prefs.setStudyGoal(h ? Math.round(h * 60) : null)
  prefs.setWorkoutGoal(w || null)
  ui.toast('Metas semanais salvas')
}
async function copyFallback(text: string) {
  try { await navigator.clipboard.writeText(text); ui.toast('Resumo copiado') } catch { ui.toast('Não foi possível compartilhar', 'error') }
}
async function share() {
  const text = weekShareText(store.data)
  try {
    if (navigator.share) await navigator.share({ text })
    else await copyFallback(text)
  } catch { await copyFallback(text) }
}
</script>

<template>
  <section class="card space-y-3 p-4">
    <h2 class="font-display text-base font-extrabold">Configurações</h2>
    <form class="flex items-end gap-2" @submit.prevent="saveName"><div class="flex-1"><label class="label" for="pf-name">Nome</label><input id="pf-name" v-model="name" class="field" maxlength="40" /></div><button class="btn-soft" type="submit">Salvar</button></form>
    <form class="grid grid-cols-2 gap-3" @submit.prevent="saveGoals">
      <div><label class="label" for="pf-sh">Meta de estudo (h/semana)</label><input id="pf-sh" v-model="studyH" type="number" min="0" step="any" inputmode="decimal" class="field" /></div>
      <div><label class="label" for="pf-wo">Meta de treinos (/semana)</label><input id="pf-wo" v-model="workouts" type="number" min="0" inputmode="numeric" class="field" /></div>
      <button class="btn-soft col-span-2" type="submit">Salvar metas semanais</button>
    </form>
    <div class="flex items-center justify-between"><span class="text-sm font-semibold">Tema {{ dark ? 'escuro' : 'claro' }}</span><button class="btn-ghost" :aria-label="dark ? 'Usar tema claro' : 'Usar tema escuro'" @click="prefs.setTheme(dark ? 'light' : 'dark')"><Sun v-if="dark" :size="18" /><Moon v-else :size="18" />Alternar</button></div>
    <label class="flex min-h-[44px] items-center justify-between text-sm font-semibold">Animações reduzidas<input type="checkbox" class="h-5 w-5" :checked="prefs.prefs.reducedMotion" @change="prefs.setReducedMotion(($event.target as HTMLInputElement).checked)" /></label>
    <button class="btn-ghost w-full" @click="share"><Share2 :size="18" />Compartilhar resumo da semana</button>
    <button v-if="!store.demo" class="btn-ghost w-full" @click="store.enterDemo()">✨ Explorar modo demonstração</button>
    <button v-else class="btn-primary w-full" @click="store.exitDemo()">Sair do modo demonstração</button>
  </section>
</template>
