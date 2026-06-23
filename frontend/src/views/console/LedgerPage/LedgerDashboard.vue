<template>
  <section class="ledger-dashboard">
    <div class="ledger-metrics">
      <div v-for="item in metrics" :key="item.key" class="ledger-metric">
        <span>{{ item.label }}</span>
        <strong :class="item.className">{{ item.value }}</strong>
      </div>
    </div>

    <div class="ledger-charts">
      <div class="ledger-chart ledger-chart--wide">
        <div class="ledger-chart__head">{{ trendTitle }}</div>
        <VChart class="ledger-chart__canvas" :option="trendOption" autoresize />
      </div>
      <div class="ledger-chart">
        <div class="ledger-chart__head">支出分类占比</div>
        <VChart class="ledger-chart__canvas" :option="categoryOption" autoresize />
      </div>
      <div class="ledger-chart">
        <div class="ledger-chart__head">每日支出</div>
        <VChart class="ledger-chart__canvas" :option="dailyOption" autoresize />
      </div>
      <div class="ledger-chart">
        <div class="ledger-chart__head">餐饮趋势</div>
        <VChart class="ledger-chart__canvas" :option="mealOption" autoresize />
      </div>
      <div class="ledger-chart ledger-chart--wide">
        <div class="ledger-chart__head">年度支出热力</div>
        <VChart class="ledger-chart__canvas" :option="calendarOption" autoresize />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts'
import { CalendarComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import {
  buildCalendarOption,
  buildCategoryOption,
  buildDailyOption,
  buildMealOption,
  buildTrendOption,
  formatMoney
} from './ledgerChartOptions'

use([
  CanvasRenderer,
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  CalendarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent
])

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
  groupBy: { type: String, default: 'month' }
})

const overview = computed(() => props.summary.overview || {})
const metrics = computed(() => [
  { key: 'income', label: '收入合计', value: formatMoney(overview.value.income), className: 'is-income' },
  { key: 'expense', label: '支出合计', value: formatMoney(overview.value.expense), className: 'is-expense' },
  { key: 'balance', label: '结余', value: formatMoney(overview.value.balance), className: overview.value.balance >= 0 ? 'is-income' : 'is-expense' },
  { key: 'averageDailyExpense', label: '日均支出', value: formatMoney(overview.value.averageDailyExpense), className: '' },
  { key: 'maxDailyExpense', label: '最大单日支出', value: formatMoney(overview.value.maxDailyExpense), className: '' }
])

const trendOption = computed(() => buildTrendOption(props.summary))
const categoryOption = computed(() => buildCategoryOption(props.summary))
const dailyOption = computed(() => buildDailyOption(props.summary))
const mealOption = computed(() => buildMealOption(props.summary))
const calendarOption = computed(() => buildCalendarOption(props.summary))
const trendTitle = computed(() => {
  const map = {
    day: '每日收支趋势',
    month: '月度收支趋势',
    year: '年度收支趋势',
    all: '总收支概览'
  }
  return map[props.groupBy] || '收支趋势'
})
</script>

<style scoped>
.ledger-dashboard {
  display: grid;
  gap: 12px;
}

.ledger-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.ledger-metric,
.ledger-chart {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.ledger-metric {
  min-height: 76px;
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 12px 14px;
}

.ledger-metric span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-metric strong {
  color: var(--console-text);
  font-size: 20px;
  line-height: 26px;
}

.ledger-metric .is-income {
  color: #16a34a;
}

.ledger-metric .is-expense {
  color: #dc2626;
}

.ledger-charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ledger-chart {
  min-width: 0;
  min-height: 280px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  padding: 12px;
}

.ledger-chart--wide {
  grid-column: 1 / -1;
}

.ledger-chart__head {
  color: var(--console-text);
  font-weight: 650;
  font-size: 14px;
}

.ledger-chart__canvas {
  min-height: 238px;
}

@media (max-width: 1100px) {
  .ledger-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ledger-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .ledger-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
