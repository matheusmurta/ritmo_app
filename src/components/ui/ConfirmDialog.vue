<script setup lang="ts">
import BaseModal from './BaseModal.vue'
withDefaults(defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean }>(), {
  confirmLabel: 'Confirmar', danger: true,
})
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('cancel')">
    <p class="mb-5 text-sm leading-relaxed text-muted">{{ message }}</p>
    <div class="flex gap-2">
      <button class="btn-ghost flex-1" @click="emit('cancel')">Cancelar</button>
      <button class="flex-1" :class="danger ? 'btn-danger' : 'btn-primary'" @click="emit('confirm')">{{ confirmLabel }}</button>
    </div>
  </BaseModal>
</template>
