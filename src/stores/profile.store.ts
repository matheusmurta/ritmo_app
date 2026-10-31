import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data.store'

export const useProfileStore = defineStore('profile', () => {
  const store = useDataStore()
  const profile = computed(() => store.data.profile)
  const name = computed(() => store.data.profile.name)
  const onboarded = computed(() => store.data.profile.onboarded)
  const initials = computed(() => (name.value.trim().charAt(0) || '?').toUpperCase())

  function complete(first: string) {
    store.data.profile.name = first.trim().split(/\s+/)[0] ?? ''
    store.data.profile.onboarded = true
    store.data.profile.startedAt = new Date().toISOString()
  }
  function rename(first: string) {
    const n = first.trim().split(/\s+/)[0] ?? ''
    if (n) store.data.profile.name = n
  }
  return { profile, name, onboarded, initials, complete, rename }
})
