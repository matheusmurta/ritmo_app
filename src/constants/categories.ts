import type { Category } from '@/models'

/** Categorias iniciais (também usadas como categorias de tarefas no calendário). */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'estudos', name: 'Estudos', color: '#7968F8', icon: 'BookOpen', builtin: true },
  { id: 'saude', name: 'Saúde', color: '#EC62A0', icon: 'HeartPulse', builtin: true },
  { id: 'exercicios', name: 'Exercícios', color: '#22B985', icon: 'Dumbbell', builtin: true },
  { id: 'trabalho', name: 'Trabalho', color: '#3B5BFF', icon: 'Briefcase', builtin: true },
  { id: 'pessoal', name: 'Desenvolvimento pessoal', color: '#F6A623', icon: 'Sprout', builtin: true },
  { id: 'leitura', name: 'Leitura', color: '#4DA9FF', icon: 'BookMarked', builtin: true },
  { id: 'financas', name: 'Finanças', color: '#14B8A6', icon: 'Wallet', builtin: true },
  { id: 'outros', name: 'Outros', color: '#8A94A8', icon: 'Shapes', builtin: true },
]

export const COLOR_CHOICES = [
  '#3B5BFF', '#7968F8', '#22B985', '#F6A623', '#4DA9FF', '#F16B75', '#EC62A0', '#14B8A6', '#8A94A8',
]
