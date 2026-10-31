<script setup lang="ts">
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '@/constants/nav'
const route = useRoute()
const active = (m: string[]) => m.includes(String(route.name))
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur md:hidden" style="padding-bottom: var(--safe-bottom)" aria-label="Navegação principal">
    <ul class="mx-auto flex h-[68px] max-w-lg items-stretch justify-around">
      <li v-for="i in NAV_ITEMS" :key="i.to" class="flex-1">
        <RouterLink :to="i.to" class="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition" :class="active(i.match) ? 'text-brand' : 'text-muted'" :aria-current="active(i.match) ? 'page' : undefined">
          <span class="flex h-7 w-12 items-center justify-center rounded-full transition" :class="active(i.match) ? 'bg-lilac' : ''"><component :is="i.icon" :size="21" /></span>
          {{ i.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
