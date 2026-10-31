<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, Plus, Trash2 } from '@lucide/vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import CategoryBadge from '@/components/ui/CategoryBadge.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import GoalChecklist from '@/components/goals/GoalChecklist.vue'
import GoalRecords from '@/components/goals/GoalRecords.vue'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { useUiStore } from '@/stores/ui.store'
import { goalProgress } from '@/services/reports/goals'
import { formatFull, todayISO } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const store = useDataStore()
const goals = useGoalsStore()
const ui = useUiStore()
const goal = computed(() => store.data.goals.find((g) => g.id === route.params.id))
const p = computed(() => (goal.value ? goalProgress(store.data, goal.value) : null))
const confirmDel = ref(false)
const addOpen = ref(false)
const val = ref('')
const note = ref('')

function addProgress() {
  const v = Number(val.value)
  if (!goal.value || !Number.isFinite(v) || v === 0) return
  goals.addProgress(goal.value.id, v, todayISO(), note.value.trim() || undefined)
  ui.toast('Progresso adicionado 🎉')
  val.value = note.value = ''
  addOpen.value = false
}
function remove() {
  if (goal.value) { goals.remove(goal.value.id); router.replace('/metas') }
}
</script>

<template>
  <div v-if="goal && p" class="space-y-4">
    <header class="flex items-center gap-2">
      <button class="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card" aria-label="Voltar" @click="router.back()"><ArrowLeft :size="18" /></button>
      <h1 class="flex-1 truncate font-display text-xl font-extrabold">{{ goal.name }}</h1>
      <button class="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card" aria-label="Editar meta" @click="ui.openQuick('goal', undefined, goal.id)"><Pencil :size="16" /></button>
      <button class="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-rose" aria-label="Excluir meta" @click="confirmDel = true"><Trash2 :size="16" /></button>
    </header>
    <section class="card space-y-3 p-4">
      <div class="flex items-center gap-3"><IconBadge :icon="goal.icon" :color="goal.color" :size="48" /><div class="flex-1"><CategoryBadge :category-id="goal.categoryId" /><p class="mt-1 text-xs text-muted">{{ formatFull(goal.startDate) }}<template v-if="goal.deadline"> → {{ formatFull(goal.deadline) }}</template></p></div><p class="font-display text-3xl font-extrabold" :style="{ color: goal.color }">{{ p.pct ?? 0 }}%</p></div>
      <ProgressBar :value="p.pct ?? 0" :color="goal.color" :height="10" :label="goal.name" />
      <p class="text-sm"><template v-if="goal.type === 'binary'">{{ p.complete ? 'Concluída' : 'Em andamento' }}</template><template v-else>{{ p.current }} de {{ p.target }} {{ goal.unit }}</template><span v-if="p.expected != null" class="text-muted"> · esperado {{ p.expected }}% até hoje</span></p>
      <p v-if="goal.description" class="text-sm text-muted">{{ goal.description }}</p>
      <div class="flex gap-2">
        <button v-if="goal.type !== 'binary' && goal.type !== 'tasks'" class="btn-primary flex-1" @click="addOpen = true"><Plus :size="16" />Adicionar progresso</button>
        <button v-if="goal.type === 'binary'" class="btn-primary flex-1" @click="goals.toggleComplete(goal.id)">{{ goal.completedAt ? 'Reabrir meta' : 'Marcar como concluída' }}</button>
      </div>
    </section>
    <GoalChecklist v-if="goal.type === 'tasks'" :goal="goal" />
    <GoalRecords :goal="goal" />
    <section v-if="goal.notes" class="card p-4"><h2 class="mb-1 font-display text-base font-extrabold">Notas</h2><p class="whitespace-pre-line text-sm text-muted">{{ goal.notes }}</p></section>
    <ConfirmDialog :open="confirmDel" title="Excluir meta?" message="Os registros de progresso desta meta serão removidos. Você poderá desfazer logo após." confirm-label="Excluir" @cancel="confirmDel = false" @confirm="remove" />
    <BaseModal :open="addOpen" title="Adicionar progresso" @close="addOpen = false">
      <form class="space-y-3" @submit.prevent="addProgress">
        <div><label class="label" for="pv">Valor ({{ goal.unit }})</label><input id="pv" v-model="val" type="number" step="any" inputmode="decimal" class="field" required /></div>
        <div><label class="label" for="pn">Nota (opcional)</label><input id="pn" v-model="note" class="field" maxlength="500" /></div>
        <p class="text-xs text-muted">Estudos e treinos vinculados a esta meta já são contados automaticamente — não os registre aqui de novo.</p>
        <button class="btn-primary w-full" type="submit">Salvar</button>
      </form>
    </BaseModal>
  </div>
  <div v-else class="card p-8 text-center"><p class="mb-3 text-sm text-muted">Meta não encontrada.</p><RouterLink to="/metas" class="btn-primary">Voltar às metas</RouterLink></div>
</template>
