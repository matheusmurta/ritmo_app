<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Plus, Search } from '@lucide/vue'
import { NAV_ITEMS } from '@/constants/nav'
import { useUiStore } from '@/stores/ui.store'
const route = useRoute()
const ui = useUiStore()
const logo = `${import.meta.env.BASE_URL}favicon.svg`
const active = (m: string[]) => m.includes(String(route.name))
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-card p-5 md:flex">
    <div class="mb-8 flex items-center gap-3">
      <img :src="logo" alt="" class="h-10 w-10" />
      <div><p class="font-display text-xl font-extrabold leading-none">Ritmo</p><p class="mt-1 text-[11px] text-muted">Sua melhor versão, todos os dias.</p></div>
    </div>
    <nav aria-label="Navegação principal" class="flex-1">
      <ul class="space-y-1">
        <li v-for="i in NAV_ITEMS" :key="i.to">
          <RouterLink :to="i.to" class="flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition" :class="active(i.match) ? 'bg-brand text-white shadow-pop' : 'text-muted hover:bg-bg hover:text-ink'" :aria-current="active(i.match) ? 'page' : undefined">
            <component :is="i.icon" :size="20" />{{ i.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    <button class="btn-ghost mb-2 w-full justify-start" @click="ui.searchOpen = true"><Search :size="18" /> Buscar</button>
    <button class="btn-primary w-full" @click="ui.quickMenuOpen = true"><Plus :size="18" /> Novo</button>
  </aside>
</template>
