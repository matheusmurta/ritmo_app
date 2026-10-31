<script setup lang="ts">
import { ref } from 'vue'
import { usePreferencesStore } from '@/stores/preferences.store'
const prefs = usePreferencesStore()
const repo = ref(prefs.prefs.repoUrl)
const version = __APP_VERSION__
</script>

<template>
  <section class="card space-y-2 p-4 text-sm">
    <h2 class="font-display text-base font-extrabold">Sobre o Ritmo</h2>
    <p>Ritmo · versão {{ version }} · licença MIT. Sua melhor versão, todos os dias.</p>
    <p class="text-muted">Privacidade: não há contas, servidores nem rastreamento. Nada sai do seu dispositivo.</p>
    <div><label class="label" for="pf-repo">Link do repositório (opcional)</label>
      <div class="flex gap-2"><input id="pf-repo" v-model="repo" class="field" type="url" placeholder="https://..." @change="prefs.setRepoUrl(repo)" /><a v-if="/^https?:\/\//.test(prefs.prefs.repoUrl)" :href="prefs.prefs.repoUrl" target="_blank" rel="noopener noreferrer" class="btn-soft">Abrir</a></div></div>
    <p class="text-xs text-muted">Créditos: Vue, Vite, Pinia, Vue Router, Tailwind CSS, Lucide, Apache ECharts, date-fns, Zod, vite-plugin-pwa, Plus Jakarta Sans e Inter.</p>
  </section>
</template>
