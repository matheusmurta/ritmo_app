<script setup lang="ts">
/** Metas do mês: progresso por objetivo mensal. */
import { computed } from 'vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useDataStore } from '@/stores/data.store'
import { goalProgress } from '@/services/reports/goals'
import { monthRange } from '@/utils/date'
const props = defineProps<{ month: string }>()
const store = useDataStore()
const list = computed(() => {
  const r = monthRange(props.month)
  return store.data.goals.filter((g) => !g.archived && g.period === 'monthly' && g.startDate <= r.to && (g.deadline ?? '9999') >= r.from).map((g) => ({ g, p: goalProgress(store.data, g) }))
})
</script>

<template>
  <section aria-label="Metas do mês">
    <h2 class="mb-2 font-display text-base font-extrabold">Metas do mês</h2>
    <ul v-if="list.length" class="space-y-2">
      <li v-for="x in list" :key="x.g.id"><RouterLink :to="`/metas/${x.g.id}`" class="card flex items-center gap-3 p-3">
        <IconBadge :icon="x.g.icon" :color="x.g.color" :size="38" />
        <div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ x.g.name }}</p><p class="mb-1 text-xs text-muted">{{ x.p.current }} / {{ x.p.target }} {{ x.g.unit }}</p><ProgressBar :value="x.p.pct ?? 0" :color="x.g.color" :label="x.g.name" /></div>
        <span class="text-sm font-extrabold" :style="{ color: x.g.color }">{{ x.p.pct ?? 0 }}%</span></RouterLink></li>
    </ul>
    <p v-else class="card p-4 text-sm text-muted">Nenhuma meta mensal neste mês. Crie uma meta com período “Mensal” na aba Metas.</p>
  </section>
</template>
