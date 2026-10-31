<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import IconBadge from '@/components/ui/IconBadge.vue'
import { useGoalsStore } from '@/stores/goals.store'
import { useUiStore } from '@/stores/ui.store'
import { COLOR_CHOICES } from '@/constants/categories'
import { ICON_NAMES } from '@/constants/icons'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const goals = useGoalsStore()
const ui = useUiStore()
const cat = ref({ name: '', color: COLOR_CHOICES[0]!, icon: 'Star' })
function addCat() {
  if (!cat.value.name.trim()) return
  goals.addCategory({ name: cat.value.name.trim(), color: cat.value.color, icon: cat.value.icon })
  ui.toast('Categoria criada')
  cat.value = { name: '', color: COLOR_CHOICES[0]!, icon: 'Star' }
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Nova categoria" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="addCat">
      <div><label class="label" for="cat-name">Nome</label><input id="cat-name" v-model="cat.name" class="field" maxlength="60" required /></div>
      <fieldset><legend class="label">Cor</legend><div class="flex flex-wrap gap-2"><button v-for="c in COLOR_CHOICES" :key="c" type="button" class="h-11 w-11 rounded-full border-2" :class="cat.color === c ? 'border-ink' : 'border-transparent'" :style="{ background: c }" :aria-label="`Cor ${c}`" @click="cat.color = c" /></div></fieldset>
      <fieldset><legend class="label">Ícone</legend><div class="flex flex-wrap gap-1"><button v-for="i in ICON_NAMES" :key="i" type="button" class="rounded-xl p-0.5" :class="cat.icon === i ? 'ring-2 ring-brand' : ''" :aria-label="`Ícone ${i}`" @click="cat.icon = i"><IconBadge :icon="i" :color="cat.color" :size="38" /></button></div></fieldset>
      <button class="btn-primary w-full" type="submit">Criar categoria</button>
    </form>
  </BaseModal>
</template>
