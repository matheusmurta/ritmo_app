<script setup lang="ts">
import { Plus } from '@lucide/vue'
import BottomNavigation from './BottomNavigation.vue'
import DesktopSidebar from './DesktopSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { useDataStore } from '@/stores/data.store'
const ui = useUiStore()
const data = useDataStore()
const version = __APP_VERSION__
</script>

<template>
  <div class="min-h-dvh">
    <DesktopSidebar />
    <div v-if="data.demo" class="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-3 bg-amber px-3 py-1.5 text-xs font-bold text-ink md:left-64" style="padding-top: calc(var(--safe-top) + 6px)">
      Modo demonstração — dados de exemplo
      <button class="rounded-full bg-ink px-3 py-1 text-bg" @click="data.exitDemo()">Sair</button>
    </div>
    <main class="mx-auto max-w-app px-4 pt-[calc(var(--safe-top)+16px)] md:ml-64 md:px-8 md:pt-8 md:pb-10" :class="data.demo ? 'mt-8' : ''" style="padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 96px)">
      <slot />
      <footer class="mt-8 text-center text-xs text-muted">Ritmo · versão {{ version }}</footer>
    </main>
    <button class="btn-primary fixed right-4 z-40 !h-14 !w-14 !rounded-full !p-0 md:hidden" style="bottom: calc(var(--nav-h) + var(--safe-bottom) + 14px)" aria-label="Ações rápidas" @click="ui.quickMenuOpen = true"><Plus :size="26" /></button>
    <BottomNavigation />
  </div>
</template>
