<script setup lang="ts">
import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW()
const hideOffline = ref(false)
setTimeout(() => { hideOffline.value = true }, 4000)
</script>

<template>
  <div v-if="needRefresh || (offlineReady && !hideOffline)" class="fixed inset-x-4 z-[70] mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-ink p-3 text-sm text-bg shadow-pop" role="alert" style="bottom: calc(var(--nav-h) + var(--safe-bottom) + 76px)">
    <span class="flex-1">{{ needRefresh ? 'Nova versão disponível!' : 'Pronto para uso offline.' }}</span>
    <button v-if="needRefresh" class="rounded-xl bg-brand px-3 py-2 font-bold text-white" @click="updateServiceWorker(true)">Atualizar</button>
    <button v-else class="px-2 font-bold" @click="hideOffline = true">OK</button>
  </div>
</template>
