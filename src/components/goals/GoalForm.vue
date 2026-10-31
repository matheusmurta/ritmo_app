<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDataStore } from '@/stores/data.store'
import { useGoalsStore } from '@/stores/goals.store'
import { useUiStore } from '@/stores/ui.store'
import { COLOR_CHOICES } from '@/constants/categories'
import { ICON_NAMES } from '@/constants/icons'
import { GOAL_TYPE_LABEL, PERIOD_LABEL } from '@/constants/labels'
import IconBadge from '@/components/ui/IconBadge.vue'
import { addDaysISO, monthRange, todayISO, weekRange } from '@/utils/date'
import type { Goal } from '@/models'

const props = defineProps<{ goalId?: string }>()
const emit = defineEmits<{ done: [id: string] }>()
const data = useDataStore()
const goals = useGoalsStore()
const ui = useUiStore()
const g = props.goalId ? goals.find(props.goalId) : undefined
const f = reactive({
  name: g?.name ?? '', description: g?.description ?? '', categoryId: g?.categoryId ?? 'estudos',
  type: (g?.type ?? 'quantitative') as Goal['type'], period: (g?.period ?? 'weekly') as Goal['period'],
  startDate: g?.startDate ?? weekRange(todayISO()).from, deadline: g?.deadline ?? weekRange(todayISO()).to,
  target: g ? String(g.target) : '', unit: g?.unit ?? 'h', source: (g?.source ?? 'manual') as Goal['source'],
  color: g?.color ?? '#7968F8', icon: g?.icon ?? 'Target', notes: g?.notes ?? '',
})
const error = ref('')
const needsTarget = computed(() => ['quantitative', 'count', 'frequency'].includes(f.type))

function onPeriod() {
  const t = todayISO()
  if (f.period === 'weekly') { const r = weekRange(t); f.startDate = r.from; f.deadline = r.to }
  else if (f.period === 'monthly') { const r = monthRange(t); f.startDate = r.from; f.deadline = r.to }
  else { f.startDate = t; f.deadline = addDaysISO(t, 30) }
}
function submit() {
  error.value = ''
  if (!f.name.trim()) return (error.value = 'Informe o nome da meta.')
  const target = needsTarget.value ? Number(f.target) : f.type === 'binary' ? 1 : 0
  if (needsTarget.value && !(target > 0)) return (error.value = 'Informe um valor-alvo maior que zero.')
  if (f.deadline && f.deadline < f.startDate) return (error.value = 'O prazo deve ser posterior à data inicial.')
  const payload = {
    name: f.name.trim(), description: f.description.trim() || undefined, categoryId: f.categoryId, type: f.type, period: f.period,
    startDate: f.startDate, deadline: f.deadline || undefined, target, unit: f.unit.trim(), source: f.source, color: f.color, icon: f.icon,
    notes: f.notes.trim() || undefined,
  }
  if (g) { goals.update(g.id, payload); ui.toast('Meta atualizada'); emit('done', g.id) }
  else { const n = goals.add(payload); ui.toast('Meta criada 🎯'); emit('done', n.id) }
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div><label class="label" for="gf-name">Nome da meta</label><input id="gf-name" v-model="f.name" class="field" maxlength="120" required placeholder="Ex.: Estudar 12 horas por semana" /></div>
    <div><label class="label" for="gf-desc">Descrição</label><textarea id="gf-desc" v-model="f.description" class="field py-2" rows="2" maxlength="1000" /></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="label" for="gf-cat">Categoria</label><select id="gf-cat" v-model="f.categoryId" class="field"><option v-for="c in data.data.categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
      <div><label class="label" for="gf-per">Período</label><select id="gf-per" v-model="f.period" class="field" @change="onPeriod"><option v-for="(l, k) in PERIOD_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
    </div>
    <div><label class="label" for="gf-type">Tipo</label><select id="gf-type" v-model="f.type" class="field"><option v-for="(l, k) in GOAL_TYPE_LABEL" :key="k" :value="k">{{ l }}</option></select></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="label" for="gf-start">Data inicial</label><input id="gf-start" v-model="f.startDate" type="date" class="field" required /></div>
      <div><label class="label" for="gf-dead">Prazo</label><input id="gf-dead" v-model="f.deadline" type="date" class="field" /></div>
      <template v-if="needsTarget">
        <div><label class="label" for="gf-target">Valor-alvo</label><input id="gf-target" v-model="f.target" type="number" inputmode="decimal" min="0" step="any" class="field" /></div>
        <div><label class="label" for="gf-unit">Unidade</label><input id="gf-unit" v-model="f.unit" class="field" maxlength="30" placeholder="h, treinos, dias, páginas" /></div>
      </template>
    </div>
    <p v-if="f.type === 'frequency'" class="text-xs text-muted">Frequência: conta dias distintos com registro de progresso, estudo ou treino vinculado.</p>
    <p v-if="f.type === 'tasks'" class="text-xs text-muted">Adicione as subtarefas na página de detalhes da meta.</p>
    <fieldset><legend class="label">Cor</legend><div class="flex flex-wrap gap-2"><button v-for="c in COLOR_CHOICES" :key="c" type="button" class="h-11 w-11 rounded-full border-2" :class="f.color === c ? 'border-ink' : 'border-transparent'" :style="{ background: c }" :aria-label="`Cor ${c}`" :aria-pressed="f.color === c" @click="f.color = c" /></div></fieldset>
    <fieldset><legend class="label">Ícone</legend><div class="flex flex-wrap gap-1"><button v-for="i in ICON_NAMES" :key="i" type="button" class="rounded-xl p-0.5" :class="f.icon === i ? 'ring-2 ring-brand' : ''" :aria-label="`Ícone ${i}`" :aria-pressed="f.icon === i" @click="f.icon = i"><IconBadge :icon="i" :color="f.color" :size="38" /></button></div></fieldset>
    <div><label class="label" for="gf-notes">Observações</label><textarea id="gf-notes" v-model="f.notes" class="field py-2" rows="2" maxlength="4000" /></div>
    <p v-if="error" class="text-sm font-semibold text-rose" role="alert">{{ error }}</p>
    <button class="btn-primary w-full" type="submit">{{ g ? 'Salvar alterações' : 'Criar meta' }}</button>
  </form>
</template>
