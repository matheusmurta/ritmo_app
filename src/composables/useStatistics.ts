import { computed, ref } from 'vue'
import { addDaysISO, isValidISO, monthRange, previousMonth, todayISO, type Range } from '@/utils/date'

export type PeriodKey = '7d' | '30d' | 'month' | 'prev' | 'custom'
export const PERIODS: { k: PeriodKey; l: string }[] = [
  { k: '7d', l: 'Últimos 7 dias' }, { k: '30d', l: 'Últimos 30 dias' }, { k: 'month', l: 'Mês atual' },
  { k: 'prev', l: 'Mês anterior' }, { k: 'custom', l: 'Personalizado' },
]

/** Estado do seletor de período dos relatórios (mantido enquanto o app está aberto). */
const key = ref<PeriodKey>('30d')
const custom = ref<Range>({ from: addDaysISO(todayISO(), -13), to: todayISO() })

export function usePeriod() {
  const range = computed<Range>(() => {
    const t = todayISO()
    switch (key.value) {
      case '7d': return { from: addDaysISO(t, -6), to: t }
      case '30d': return { from: addDaysISO(t, -29), to: t }
      case 'month': return monthRange(t)
      case 'prev': return previousMonth(t)
      default: {
        const { from, to } = custom.value
        return isValidISO(from) && isValidISO(to) && from <= to ? custom.value : { from: t, to: t }
      }
    }
  })
  return { key, custom, range }
}
