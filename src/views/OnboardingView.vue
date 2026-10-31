<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'

const profile = useProfileStore()
const router = useRouter()
const logo = `${import.meta.env.BASE_URL}favicon.svg`
const name = ref('')
const error = ref('')
function start() {
  if (!name.value.trim()) { error.value = 'Digite seu primeiro nome para começar.'; return }
  profile.complete(name.value)
  router.replace('/')
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand via-violet to-deep p-5" style="padding-top: calc(var(--safe-top) + 20px); padding-bottom: calc(var(--safe-bottom) + 20px)">
    <main class="w-full max-w-md">
      <div class="mb-6 text-center text-white">
        <img :src="logo" alt="" class="mx-auto mb-4 h-16 w-16 rounded-2xl shadow-pop" />
        <p class="font-display text-sm font-bold tracking-widest opacity-90">RITMO</p>
      </div>
      <form class="rounded-[28px] bg-card p-6 shadow-2xl" @submit.prevent="start">
        <h1 class="font-display text-3xl font-extrabold leading-tight">Sua melhor versão começa hoje.</h1>
        <p class="mt-2 text-sm text-muted">Organize suas metas, acompanhe seus hábitos e descubra o quanto você pode evoluir.</p>
        <label class="label mt-6" for="ob-name">Como podemos te chamar?</label>
        <input id="ob-name" v-model="name" class="field" maxlength="40" autocomplete="given-name" placeholder="Seu primeiro nome" autofocus />
        <p v-if="error" class="mt-2 text-sm font-semibold text-rose" role="alert">{{ error }}</p>
        <button class="btn-primary mt-5 w-full !min-h-[52px] !text-base" type="submit">Começar minha jornada</button>
        <p class="mt-4 text-center text-xs text-muted">Sem cadastro, sem senha. Seus dados ficam só neste dispositivo.</p>
      </form>
    </main>
  </div>
</template>
