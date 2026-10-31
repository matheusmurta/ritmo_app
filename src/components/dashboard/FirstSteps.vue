<script setup lang="ts">
import { useDataStore } from '@/stores/data.store'
import { useUiStore } from '@/stores/ui.store'
import { todayISO } from '@/utils/date'
const store = useDataStore()
const ui = useUiStore()
const today = todayISO()
</script>

<template>
  <section class="card p-4" aria-label="Primeiros passos">
    <h2 class="mb-1 font-display text-base font-extrabold">Primeiros passos</h2>
    <p class="mb-3 text-sm text-muted">Comece por uma destas ações ou conheça o app com dados de exemplo.</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button class="btn-soft justify-start" @click="ui.openQuick('goal')">🎯 Criar minha primeira meta</button>
      <button class="btn-soft justify-start" @click="ui.openQuick('task', today)">🗓️ Planejar minha semana</button>
      <button class="btn-soft justify-start" @click="ui.openQuick('study')">📚 Registrar um estudo</button>
      <button class="btn-soft justify-start" @click="ui.openQuick('exercise')">💪 Adicionar um treino</button>
      <button class="btn-soft justify-start" @click="ui.openQuick('habit')">🔥 Criar meu primeiro hábito</button>
      <button class="btn-ghost justify-start" @click="store.enterDemo()">✨ Ver modo demonstração</button>
    </div>
  </section>
</template>
