<script setup lang="ts">
import { Trophy } from '@lucide/vue'
import { useDataStore } from '@/stores/data.store'
const store = useDataStore()
</script>

<template>
  <ul class="grid gap-3 sm:grid-cols-2">
    <li v-for="a in store.achievementList" :key="a.id" class="card flex items-center gap-3 p-4" :class="a.unlocked ? '' : 'opacity-60'">
      <span class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="a.unlocked ? 'bg-amber/20 text-amber' : 'bg-line text-muted'"><Trophy :size="22" /></span>
      <div><p class="text-sm font-extrabold">{{ a.title }}</p><p class="text-xs text-muted">{{ a.unlocked ? 'Conquistada! 🏅' : a.description }}</p></div>
    </li>
  </ul>
</template>
