<script setup lang="ts">
import { computed } from 'vue'
import { useGoalsStore } from '@/stores/goals.store'
const props = defineProps<{ categoryId: string }>()
const cat = computed(() => useGoalsStore().category(props.categoryId))
</script>

<template>
  <span class="chip" :style="{ background: cat.color + '22', color: cat.color }">
    <span class="h-1.5 w-1.5 rounded-full" :style="{ background: cat.color }" />{{ cat.name }}
  </span>
</template>
