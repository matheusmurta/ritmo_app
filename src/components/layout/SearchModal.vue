<script setup lang="ts">
/** Busca global em metas, hábitos, tarefas, estudos e exercícios. */
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@lucide/vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useDataStore } from '@/stores/data.store'
import { useUiStore } from '@/stores/ui.store'
import { EXERCISE_LABEL } from '@/constants/labels'
import { formatShort } from '@/utils/date'

const ui = useUiStore()
const store = useDataStore()
const router = useRouter()
const q = ref('')
watch(() => ui.searchOpen, (o) => { if (o) q.value = '' })
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

interface Hit { key: string; kind: string; label: string; sub?: string; go: () => void }
const hits = computed<Hit[]>(() => {
  const t = norm(q.value.trim())
  if (t.length < 2) return []
  const d = store.data
  const out: Hit[] = []
  const close = () => (ui.searchOpen = false)
  d.goals.filter((g) => norm(g.name).includes(t)).forEach((g) => out.push({ key: 'g' + g.id, kind: 'Meta', label: g.name, go: () => { close(); router.push(`/metas/${g.id}`) } }))
  d.habits.filter((h) => norm(h.name).includes(t)).forEach((h) => out.push({ key: 'h' + h.id, kind: 'Hábito', label: h.name, go: () => { close(); router.push('/metas') } }))
  d.tasks.filter((x) => norm(x.title).includes(t)).forEach((x) => out.push({ key: 't' + x.id, kind: 'Tarefa', label: x.title, sub: formatShort(x.date), go: () => { close(); router.push({ path: '/calendario', query: { d: x.date } }) } }))
  d.studySessions.filter((s) => norm(s.subject).includes(t)).slice(0, 8).forEach((s) => out.push({ key: 's' + s.id, kind: 'Estudo', label: s.subject, sub: formatShort(s.date), go: () => { close(); router.push('/estudos') } }))
  d.exercises.filter((e) => norm(EXERCISE_LABEL[e.type]).includes(t) || norm(e.notes ?? '').includes(t)).slice(0, 8).forEach((e) => out.push({ key: 'e' + e.id, kind: 'Exercício', label: EXERCISE_LABEL[e.type], sub: formatShort(e.date), go: () => { close(); router.push('/exercicios') } }))
  return out.slice(0, 30)
})
</script>

<template>
  <BaseModal :open="ui.searchOpen" title="Buscar" @close="ui.searchOpen = false">
    <label class="label" for="q">Metas, hábitos, tarefas e atividades</label>
    <div class="relative"><Search :size="18" class="absolute left-3 top-3.5 text-muted" /><input id="q" v-model="q" class="field !pl-10" type="search" placeholder="Digite ao menos 2 letras" /></div>
    <ul class="mt-3 space-y-1" aria-live="polite">
      <li v-for="h in hits" :key="h.key"><button class="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-bg" @click="h.go()"><span class="chip bg-lilac text-brand">{{ h.kind }}</span><span class="flex-1 truncate text-sm font-semibold">{{ h.label }}</span><span class="text-xs text-muted">{{ h.sub }}</span></button></li>
      <li v-if="q.trim().length >= 2 && !hits.length" class="py-4 text-center text-sm text-muted">Nada encontrado.</li>
    </ul>
  </BaseModal>
</template>
