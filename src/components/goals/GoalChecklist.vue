<script setup lang="ts">
import { ref } from 'vue'
import { Trash2 } from '@lucide/vue'
import { useGoalsStore } from '@/stores/goals.store'
import type { Goal } from '@/models'
const props = defineProps<{ goal: Goal }>()
const goals = useGoalsStore()
const item = ref('')
function addItem() {
  if (item.value.trim()) { goals.addChecklistItem(props.goal.id, item.value); item.value = '' }
}
</script>

<template>
  <section class="card p-4">
    <h2 class="mb-2 font-display text-base font-extrabold">Checklist</h2>
    <ul class="space-y-1">
      <li v-for="c in goal.checklist" :key="c.id" class="flex items-center gap-2">
        <label class="flex min-h-[44px] flex-1 items-center gap-2 text-sm"><input type="checkbox" class="h-5 w-5" :checked="c.done" @change="goals.toggleChecklistItem(goal.id, c.id)" /><span :class="c.done ? 'text-muted line-through' : ''">{{ c.title }}</span></label>
        <button class="h-11 w-11 text-rose" :aria-label="`Remover ${c.title}`" @click="goals.removeChecklistItem(goal.id, c.id)"><Trash2 :size="15" class="mx-auto" /></button>
      </li>
    </ul>
    <form class="mt-2 flex gap-2" @submit.prevent="addItem"><label class="sr-only" for="ck">Nova subtarefa</label><input id="ck" v-model="item" class="field" placeholder="Nova subtarefa" maxlength="160" /><button class="btn-soft" type="submit">Adicionar</button></form>
  </section>
</template>
