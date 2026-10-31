import { createRouter, createWebHashHistory } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/bem-vindo', name: 'onboarding', component: () => import('@/views/OnboardingView.vue'), meta: { public: true } },
    { path: '/', name: 'home', component: () => import('@/views/DashboardView.vue'), meta: { title: 'Início' } },
    { path: '/calendario', name: 'calendar', component: () => import('@/views/CalendarView.vue'), meta: { title: 'Calendário' } },
    { path: '/metas', name: 'goals', component: () => import('@/views/GoalsView.vue'), meta: { title: 'Metas' } },
    { path: '/metas/:id', name: 'goal', component: () => import('@/views/GoalDetailView.vue'), meta: { title: 'Meta' } },
    { path: '/estudos', name: 'studies', component: () => import('@/views/StudiesView.vue'), meta: { title: 'Estudos' } },
    { path: '/exercicios', name: 'exercises', component: () => import('@/views/ExercisesView.vue'), meta: { title: 'Exercícios' } },
    { path: '/relatorios', name: 'reports', component: () => import('@/views/ReportsView.vue'), meta: { title: 'Relatórios' } },
    { path: '/perfil', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { title: 'Perfil' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const profile = useProfileStore()
  if (!to.meta.public && !profile.onboarded) return { name: 'onboarding' }
  if (to.name === 'onboarding' && profile.onboarded) return { name: 'home' }
  return true
})
router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + ' · ' : ''}Ritmo`
})
