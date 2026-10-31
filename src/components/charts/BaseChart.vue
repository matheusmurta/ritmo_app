<script setup lang="ts">
/** Wrapper ECharts com tree-shaking, tema legível no escuro e descrição acessível. */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent, VisualMapComponent, CalendarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, LineChart, PieChart, HeatmapChart, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent, CalendarComponent, CanvasRenderer])

const props = withDefaults(defineProps<{ option: object; height?: string; description?: string }>(), { height: '240px', description: '' })
const dark = computed(() => document.documentElement.getAttribute('data-theme') === 'dark')
const merged = computed(() => ({
  animationDuration: 600,
  textStyle: { fontFamily: 'Inter Variable, system-ui, sans-serif', color: dark.value ? '#98A4BD' : '#64708A' },
  ...props.option,
}))
</script>

<template>
  <figure class="m-0 w-full min-w-0" role="img" :aria-label="description">
    <VChart :option="merged" autoresize :style="{ height, width: '100%' }" />
    <figcaption class="sr-only">{{ description }}</figcaption>
  </figure>
</template>
