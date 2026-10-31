<script setup lang="ts">
/** Exportar, importar (com resumo e confirmação) e apagar dados. */
import { ref } from 'vue'
import { Download, Trash2, Upload } from '@lucide/vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useDataStore } from '@/stores/data.store'
import { useUiStore } from '@/stores/ui.store'
import { backupFileName, createBackup, parseBackup, type BackupSummary } from '@/services/backup/backup'
import type { AppData } from '@/models'

const store = useDataStore()
const ui = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref<{ data: AppData; summary: BackupSummary } | null>(null)
const importError = ref('')
const wipeOpen = ref(false)

function exportData() {
  const blob = new Blob([createBackup(store.data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFileName()
  a.click()
  URL.revokeObjectURL(url)
  ui.toast('Backup exportado')
}
async function onFile(e: Event) {
  importError.value = ''
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { importError.value = 'Arquivo grande demais (máx. 10 MB).'; return }
  const res = parseBackup(await file.text())
  if (!res.ok) { importError.value = res.error; return }
  pending.value = { data: res.data, summary: res.summary }
}
function confirmImport() {
  if (!pending.value) return
  const r = store.replaceAll(pending.value.data)
  ui.toast(r.ok ? 'Backup restaurado com sucesso' : (r.error ?? 'Falha ao gravar'), r.ok ? 'success' : 'error')
  pending.value = null
}
function wipe() {
  const r = store.wipe()
  wipeOpen.value = false
  ui.toast(r.ok ? 'Todos os dados foram apagados' : (r.error ?? 'Erro'), r.ok ? 'info' : 'error')
  location.hash = '#/bem-vindo'
  location.reload()
}
</script>

<template>
  <section class="card space-y-3 p-4" aria-label="Backup">
    <h2 class="font-display text-base font-extrabold">Seus dados</h2>
    <p class="text-sm text-muted">Seus dados ficam somente neste navegador e dispositivo. Para transferi-los ou protegê-los contra perda, exporte um backup.</p>
    <div class="grid gap-2 sm:grid-cols-2">
      <button class="btn-soft" @click="exportData"><Download :size="18" />Exportar backup</button>
      <button class="btn-soft" @click="fileInput?.click()"><Upload :size="18" />Importar backup</button>
    </div>
    <input ref="fileInput" type="file" accept="application/json,.json" class="sr-only" aria-label="Selecionar arquivo de backup" tabindex="-1" @change="onFile" />
    <p v-if="importError" class="text-sm font-semibold text-rose" role="alert">{{ importError }}</p>
    <button class="btn-ghost w-full !text-rose" @click="wipeOpen = true"><Trash2 :size="18" />Apagar todos os dados</button>
    <BaseModal :open="!!pending" title="Importar backup" @close="pending = null">
      <template v-if="pending">
        <p class="text-sm text-muted">Backup de {{ pending.summary.profileName || 'sem nome' }} · exportado em {{ new Date(pending.summary.exportedAt).toLocaleString('pt-BR') }}.</p>
        <ul class="my-3 grid grid-cols-2 gap-2 text-sm"><li v-for="c in pending.summary.counts" :key="c.label" class="rounded-xl bg-bg p-2"><b>{{ c.value }}</b> {{ c.label.toLowerCase() }}</li></ul>
        <p class="mb-4 text-sm font-semibold text-rose">Isso substituirá todos os dados atuais deste dispositivo.</p>
        <div class="flex gap-2"><button class="btn-ghost flex-1" @click="pending = null">Cancelar</button><button class="btn-primary flex-1" @click="confirmImport">Substituir dados</button></div>
      </template>
    </BaseModal>
    <ConfirmDialog :open="wipeOpen" title="Apagar todos os dados?" message="Esta ação não poderá ser desfeita sem um backup. Metas, hábitos, tarefas, estudos e treinos serão removidos deste dispositivo." confirm-label="Apagar tudo" @cancel="wipeOpen = false" @confirm="wipe" />
  </section>
</template>
