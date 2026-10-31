<script setup lang="ts">
import { computed } from 'vue'
import BackupSection from '@/components/layout/BackupSection.vue'
import ProfileSettings from '@/components/layout/ProfileSettings.vue'
import ProfileAbout from '@/components/layout/ProfileAbout.vue'
import { useDataStore } from '@/stores/data.store'
import { useProfileStore } from '@/stores/profile.store'
import { goalProgress } from '@/services/reports/goals'
import { formatFull, formatMinutes } from '@/utils/date'

const store = useDataStore()
const profile = useProfileStore()
const stats = computed(() => ({
  goals: store.data.goals.filter((g) => goalProgress(store.data, g).complete).length,
  study: store.data.studySessions.reduce((a, s) => a + s.minutes, 0),
  workouts: store.data.exercises.length,
}))
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-4">
    <h1 class="font-display text-2xl font-extrabold">Perfil</h1>
    <section class="card flex items-center gap-4 p-4">
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-violet font-display text-2xl font-extrabold text-white" aria-hidden="true">{{ profile.initials }}</span>
      <div><p class="font-display text-lg font-extrabold">{{ profile.name }}</p><p v-if="store.data.profile.startedAt" class="text-xs text-muted">Jornada iniciada em {{ formatFull(store.data.profile.startedAt.slice(0, 10)) }}</p></div>
    </section>
    <section class="grid grid-cols-3 gap-3 text-center">
      <div class="card p-3"><p class="font-display text-xl font-extrabold">{{ stats.goals }}</p><p class="text-xs text-muted">objetivos concluídos</p></div>
      <div class="card p-3"><p class="font-display text-xl font-extrabold">{{ formatMinutes(stats.study) }}</p><p class="text-xs text-muted">estudadas</p></div>
      <div class="card p-3"><p class="font-display text-xl font-extrabold">{{ stats.workouts }}</p><p class="text-xs text-muted">treinos</p></div>
    </section>
    <ProfileSettings />
    <BackupSection />
    <ProfileAbout />
  </div>
</template>
