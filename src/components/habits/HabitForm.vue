<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useHabitsStore } from '@/stores/habits.store'
import { useDataStore } from '@/stores/data.store'
import { useUiStore } from '@/stores/ui.store'
import { COLOR_CHOICES } from '@/constants/categories'
import { ICON_NAMES } from '@/constants/icons'
import IconBadge from '@/components/ui/IconBadge.vue'
import { WEEKDAY_ABBR } from '@/utils/date'

const props = defineProps<{ habitId?: string }>()
const emit = defineEmits<{ done: [] }>()
const habits = useHabitsStore()
const data = useDataStore()
const ui = useUiStore()
const h = props.habitId ? data.data.habits.find((x) => x.id === props.habitId) : undefined
const f = reactive({ name: h?.name ?? '', icon: h?.icon ?? 'BookOpen', color: h?.color ?? '#F6A623', days: [...(h?.days ?? [1, 2, 3, 4, 5, 6, 7])] })
const error = ref('')
const toggle = (d: number) => (f.days = f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort())
function submit() {
  if (!f.name.trim()) return (error.value = 'Informe o nome do hábito.')
  if (!f.days.length) return (error.value = 'Escolha ao menos um dia da semana.')
  const payload = { name: f.name.trim(), icon: f.icon, color: f.color, days: f.days }
  if (h) { habits.update(h.id, payload); ui.toast('Hábito atualizado') }
  else { habits.add(payload); ui.toast('Hábito criado 🔥') }
  emit('done')
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div><label class="label" for="hf-name">Nome do hábito</label><input id="hf-name" v-model="f.name" class="field" maxlength="100" placeholder="Ex.: Meditar" required /></div>
    <fieldset><legend class="label">Dias programados</legend>
      <div class="flex gap-1"><button v-for="(n, i) in WEEKDAY_ABBR" :key="n" type="button" class="min-h-[44px] flex-1 rounded-xl border text-xs font-bold" :class="f.days.includes(i + 1) ? 'border-brand bg-brand text-white' : 'border-line'" :aria-pressed="f.days.includes(i + 1)" @click="toggle(i + 1)">{{ n }}</button></div>
    </fieldset>
    <fieldset><legend class="label">Cor</legend><div class="flex flex-wrap gap-2"><button v-for="c in COLOR_CHOICES" :key="c" type="button" class="h-11 w-11 rounded-full border-2" :class="f.color === c ? 'border-ink' : 'border-transparent'" :style="{ background: c }" :aria-label="`Cor ${c}`" :aria-pressed="f.color === c" @click="f.color = c" /></div></fieldset>
    <fieldset><legend class="label">Ícone</legend><div class="flex flex-wrap gap-1"><button v-for="i in ICON_NAMES" :key="i" type="button" class="rounded-xl p-0.5" :class="f.icon === i ? 'ring-2 ring-brand' : ''" :aria-label="`Ícone ${i}`" :aria-pressed="f.icon === i" @click="f.icon = i"><IconBadge :icon="i" :color="f.color" :size="38" /></button></div></fieldset>
    <p v-if="error" class="text-sm font-semibold text-rose" role="alert">{{ error }}</p>
    <button class="btn-primary w-full" type="submit">{{ h ? 'Salvar alterações' : 'Criar hábito' }}</button>
  </form>
</template>
