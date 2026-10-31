<script setup lang="ts">
import { ChevronRight, Trophy } from '@lucide/vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
defineProps<{ done: number; total: number; pct: number | null }>()
</script>

<template>
  <section class="rounded-[24px] bg-gradient-to-br from-brand to-violet p-5 text-white shadow-pop" aria-label="Metas da semana">
    <div class="flex items-center gap-3">
      <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20"><Trophy :size="22" /></span>
      <div class="flex-1">
        <p class="text-sm font-semibold opacity-90">Metas da semana</p>
        <p class="font-display text-xl font-extrabold"><template v-if="total">{{ done }} de {{ total }} metas concluídas</template><template v-else>Nenhuma meta ativa</template></p>
      </div>
      <p v-if="total" class="font-display text-3xl font-extrabold">{{ pct }}%</p>
    </div>
    <div class="mt-4"><ProgressBar :value="pct ?? 0" color="#fff" :height="10" label="Metas da semana" /></div>
    <RouterLink to="/metas" class="mt-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold">{{ total ? 'Ver todas as metas' : 'Criar minha primeira meta' }}<ChevronRight :size="16" /></RouterLink>
  </section>
</template>
