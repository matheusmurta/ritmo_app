<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from '@lucide/vue'
import GoalCard from '@/components/goals/GoalCard.vue'
import CategoryModal from '@/components/goals/CategoryModal.vue'
import AchievementList from '@/components/goals/AchievementList.vue'
import HabitCard from '@/components/habits/HabitCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import { useDataStore } from '@/stores/data.store'
import { useHabitsStore } from '@/stores/habits.store'
import { useUiStore } from '@/stores/ui.store'
import { overallStreaks } from '@/services/reports/habits'

const store = useDataStore()
const habits = useHabitsStore()
const ui = useUiStore()
const tab = ref<'goals' | 'habits' | 'badges'>('goals')
const tabs = [['goals', 'Metas'], ['habits', 'Hábitos'], ['badges', 'Conquistas']] as const
const catFilter = ref('')
const list = computed(() => store.data.goals.filter((g) => !g.archived && (!catFilter.value || g.categoryId === catFilter.value)))
const streak = computed(() => overallStreaks(store.data))
const removing = ref<string | null>(null)
const catOpen = ref(false)
function confirmRemove() {
  if (removing.value) habits.remove(removing.value)
  removing.value = null
}
</script>

<template>
  <div class="space-y-4">
    <header class="flex items-center justify-between"><h1 class="font-display text-2xl font-extrabold">Metas</h1><button class="btn-primary" @click="ui.openQuick(tab === 'habits' ? 'habit' : 'goal')"><Plus :size="18" />Nova</button></header>
    <div class="grid grid-cols-2 gap-3">
      <RouterLink to="/estudos" class="card flex items-center gap-3 p-3"><IconBadge icon="BookOpen" color="#7968F8" :size="40" /><span class="text-sm font-bold">Estudos</span></RouterLink>
      <RouterLink to="/exercicios" class="card flex items-center gap-3 p-3"><IconBadge icon="Dumbbell" color="#22B985" :size="40" /><span class="text-sm font-bold">Exercícios</span></RouterLink>
    </div>
    <div class="flex gap-1 rounded-2xl bg-line/60 p-1" role="tablist">
      <button v-for="t in tabs" :key="t[0]" role="tab" class="min-h-[44px] flex-1 rounded-xl text-sm font-bold" :class="tab === t[0] ? 'bg-card text-brand shadow-card' : 'text-muted'" :aria-selected="tab === t[0]" @click="tab = t[0]">{{ t[1] }}</button>
    </div>
    <template v-if="tab === 'goals'">
      <div class="flex gap-2"><select v-model="catFilter" class="field flex-1" aria-label="Filtrar por categoria"><option value="">Todas as categorias</option><option v-for="c in store.data.categories" :key="c.id" :value="c.id">{{ c.name }}</option></select><button class="btn-ghost" @click="catOpen = true">+ Categoria</button></div>
      <div v-if="list.length" class="grid gap-3 md:grid-cols-2"><GoalCard v-for="g in list" :key="g.id" :goal="g" /></div>
      <div v-else class="card"><EmptyState title="Nenhuma meta ainda" text="Defina um objetivo claro com prazo e acompanhe seu progresso." action="Criar minha primeira meta" @action="ui.openQuick('goal')" /></div>
    </template>
    <template v-else-if="tab === 'habits'">
      <p class="text-sm text-muted">Sequência atual: <b>{{ streak.current }}</b> · melhor: <b>{{ streak.best }}</b></p>
      <div v-if="store.data.habits.length" class="grid gap-3 md:grid-cols-2"><HabitCard v-for="h in store.data.habits" :key="h.id" :habit="h" @edit="ui.openQuick('habit', undefined, h.id)" @remove="removing = h.id" /></div>
      <div v-else class="card"><EmptyState title="Sem hábitos" text="Crie hábitos como ler, meditar ou caminhar e acompanhe sua sequência." action="Criar meu primeiro hábito" @action="ui.openQuick('habit')" /></div>
    </template>
    <AchievementList v-else />
    <ConfirmDialog :open="!!removing" title="Excluir hábito?" message="O histórico deste hábito também será removido. Você poderá desfazer logo após." confirm-label="Excluir" @cancel="removing = null" @confirm="confirmRemove" />
    <CategoryModal :open="catOpen" @close="catOpen = false" />
  </div>
</template>
