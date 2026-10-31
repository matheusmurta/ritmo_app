import { CalendarDays, ChartNoAxesCombined, House, Target, UserRound } from '@lucide/vue'

export const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: House, match: ['home'] },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays, match: ['calendar'] },
  { to: '/metas', label: 'Metas', icon: Target, match: ['goals', 'goal', 'studies', 'exercises'] },
  { to: '/relatorios', label: 'Relatórios', icon: ChartNoAxesCombined, match: ['reports'] },
  { to: '/perfil', label: 'Perfil', icon: UserRound, match: ['profile'] },
]
