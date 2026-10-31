<script setup lang="ts">
import { Lightbulb } from '@lucide/vue'
import type { Insight } from '@/services/insights/insights'
defineProps<{ insights: Insight[]; title?: string }>()
</script>

<template>
  <section class="rounded-card border border-amber/30 bg-gradient-to-br from-amber/15 to-violet/10 p-4" aria-label="Insights">
    <div class="mb-2 flex items-center gap-2"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber/25 text-amber"><Lightbulb :size="18" /></span><h3 class="font-display text-sm font-extrabold">{{ title ?? 'Insight da semana' }}</h3></div>
    <ul class="space-y-1.5">
      <li v-for="i in insights" :key="i.id" class="text-sm leading-snug" :class="i.tone === 'attention' ? 'text-rose' : 'text-ink'">{{ i.text }}</li>
    </ul>
  </section>
</template>
