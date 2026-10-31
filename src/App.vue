<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import QuickCreateHost from '@/components/layout/QuickCreateHost.vue'
import SearchModal from '@/components/layout/SearchModal.vue'
import UpdatePrompt from '@/components/layout/UpdatePrompt.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useTheme } from '@/composables/useTheme'
import { useDataStore } from '@/stores/data.store'

useTheme()
const route = useRoute()
const store = useDataStore()
const isPublic = computed(() => !!route.meta.public)
</script>

<template>
  <div v-if="store.loadMessage" class="fixed inset-x-4 top-4 z-[80] mx-auto max-w-md rounded-2xl bg-rose p-4 text-sm text-white shadow-pop" role="alert">
    <p class="font-bold">Atenção ao carregar seus dados</p>
    <p class="mt-1">{{ store.loadMessage }} Uma cópia do conteúdo original foi preservada no navegador (chave ritmo:corrupt-backup).</p>
    <button class="mt-2 rounded-xl bg-white/20 px-3 py-2 font-bold" @click="store.dismissLoadWarning()">Entendi</button>
  </div>
  <RouterView v-if="isPublic" />
  <AppShell v-else>
    <RouterView v-slot="{ Component }"><Transition name="page" mode="out-in"><component :is="Component" /></Transition></RouterView>
  </AppShell>
  <template v-if="!isPublic"><QuickCreateHost /><SearchModal /></template>
  <ToastContainer />
  <UpdatePrompt />
</template>
