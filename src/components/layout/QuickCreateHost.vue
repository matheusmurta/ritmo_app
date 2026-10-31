<script setup lang="ts">
/** Hospeda os formulários de criação/edição e o menu de ações rápidas. */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Dumbbell, Flame, ListTodo, Target } from '@lucide/vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import TaskForm from '@/components/calendar/TaskForm.vue'
import GoalForm from '@/components/goals/GoalForm.vue'
import HabitForm from '@/components/habits/HabitForm.vue'
import StudySessionForm from '@/components/studies/StudySessionForm.vue'
import ExerciseForm from '@/components/exercises/ExerciseForm.vue'
import { useUiStore, type QuickKind } from '@/stores/ui.store'

const ui = useUiStore()
const router = useRouter()
const titles: Record<QuickKind, string> = { task: 'Tarefa', goal: 'Meta', habit: 'Hábito', study: 'Estudo', exercise: 'Treino' }
const title = computed(() => (ui.quick ? (ui.quick.id ? 'Editar ' : 'Novo(a) ') + titles[ui.quick.kind].toLowerCase() : ''))
const items: { kind: QuickKind; label: string; icon: unknown; color: string }[] = [
  { kind: 'task', label: 'Nova tarefa', icon: ListTodo, color: '#3B5BFF' },
  { kind: 'goal', label: 'Nova meta', icon: Target, color: '#22B985' },
  { kind: 'habit', label: 'Novo hábito', icon: Flame, color: '#F6A623' },
  { kind: 'study', label: 'Registrar estudo', icon: BookOpen, color: '#7968F8' },
  { kind: 'exercise', label: 'Registrar exercício', icon: Dumbbell, color: '#EC62A0' },
]
function goalDone(id: string) {
  ui.closeQuick()
  router.push(`/metas/${id}`)
}
</script>

<template>
  <BaseModal :open="ui.quickMenuOpen" title="O que você quer fazer?" @close="ui.quickMenuOpen = false">
    <ul class="space-y-2">
      <li v-for="i in items" :key="i.kind">
        <button class="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-line px-3 text-left font-semibold hover:bg-bg" @click="ui.openQuick(i.kind)">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl" :style="{ background: i.color + '22', color: i.color }"><component :is="i.icon" :size="20" /></span>{{ i.label }}
        </button>
      </li>
    </ul>
  </BaseModal>
  <BaseModal :open="!!ui.quick" :title="title" @close="ui.closeQuick()">
    <template v-if="ui.quick">
      <TaskForm v-if="ui.quick.kind === 'task'" :task-id="ui.quick.id" :date="ui.quick.date" @done="ui.closeQuick()" />
      <GoalForm v-else-if="ui.quick.kind === 'goal'" :goal-id="ui.quick.id" @done="goalDone" />
      <HabitForm v-else-if="ui.quick.kind === 'habit'" :habit-id="ui.quick.id" @done="ui.closeQuick()" />
      <StudySessionForm v-else-if="ui.quick.kind === 'study'" :session-id="ui.quick.id" :date="ui.quick.date" @done="ui.closeQuick()" />
      <ExerciseForm v-else :exercise-id="ui.quick.id" :date="ui.quick.date" @done="ui.closeQuick()" />
    </template>
  </BaseModal>
</template>
