<template>
  <section class="ledger-dashboard">
    <a-skeleton v-if="loading" active :paragraph="{ rows: 8 }" />
    <template v-else>
      <!-- 核心指标卡 -->
      <div class="ledger-metrics">
        <div class="ledger-metric ledger-metric--income">
          <div class="ledger-metric__icon">
            <TrendingUp :size="18" />
          </div>
          <div class="ledger-metric__body">
            <span>收入</span>
            <strong>{{ formatMoney(overview.income) }}</strong>
          </div>
        </div>
        <div class="ledger-metric ledger-metric--expense">
          <div class="ledger-metric__icon">
            <TrendingDown :size="18" />
          </div>
          <div class="ledger-metric__body">
            <span>支出</span>
            <strong>{{ formatMoney(overview.expense) }}</strong>
          </div>
        </div>
        <div class="ledger-metric" :class="overview.balance >= 0 ? 'ledger-metric--positive' : 'ledger-metric--negative'">
          <div class="ledger-metric__icon">
            <Wallet :size="18" />
          </div>
          <div class="ledger-metric__body">
            <span>结余</span>
            <strong>{{ formatMoney(overview.balance) }}</strong>
          </div>
        </div>
      </div>

      <!-- 次要统计行 -->
      <div class="ledger-stats">
        <span class="ledger-stat">
          <small>日均支出</small>
          <em>{{ formatMoney(overview.averageDailyExpense) }}</em>
        </span>
        <span class="ledger-stat">
          <small>最大单日</small>
          <em>{{ formatMoney(overview.maxDailyExpense) }}</em>
        </span>
        <span class="ledger-stat">
          <small>支出笔数</small>
          <em>{{ expenseCount }}</em>
        </span>
        <span class="ledger-stat">
          <small>收入笔数</small>
          <em>{{ incomeCount }}</em>
        </span>
      </div>

      <!-- 趋势图 -->
      <div class="ledger-chart ledger-chart--wide">
        <div class="ledger-chart__head">
          <span>{{ trendTitle }}</span>
        </div>
        <VChart class="ledger-chart__canvas" :option="trendOption" autoresize />
      </div>

      <!-- 分类占比 + 每日支出 -->
      <div class="ledger-chart-row">
        <div class="ledger-chart">
          <div class="ledger-chart__head">
            <span>支出分类</span>
            <small class="ledger-chart__sub">TOP {{ categoryRows.length }}</small>
          </div>
          <VChart class="ledger-chart__canvas" :option="categoryOption" autoresize />
          <!-- 分类排行列表 -->
          <div class="ledger-category-list">
            <div
              v-for="item in categoryRows"
              :key="item.name"
              class="ledger-category-rank"
            >
              <span class="ledger-category-dot" :style="{ background: item.color }" />
              <span class="ledger-category-name">{{ item.name }}</span>
              <span class="ledger-category-bar-wrap">
                <span class="ledger-category-bar" :style="{ width: item.percent + '%', background: item.color }" />
              </span>
              <span class="ledger-category-amount">{{ formatMoney(item.amount) }}</span>
              <span class="ledger-category-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </div>

        <div class="ledger-chart">
          <div class="ledger-chart__head">
            <span>每日支出</span>
            <small class="ledger-chart__sub">{{ dailyRows.length }} 天</small>
          </div>
          <VChart class="ledger-chart__canvas" :option="dailyOption" autoresize />
        </div>
      </div>

      <!-- 更多图表（折叠） -->
      <a-collapse v-model:activeKey="extraChartsOpen" :bordered="false" class="ledger-extra-collapse">
        <a-collapse-panel key="extra" :show-arrow="false">
          <template #header>
            <span class="ledger-extra-toggle">
              <ChevronDown :size="14" :class="{ 'is-open': extraChartsOpen.includes('extra') }" />
              更多图表
            </span>
          </template>
          <div class="ledger-chart-row">
            <div class="ledger-chart">
              <div class="ledger-chart__head">
                <span>餐饮趋势</span>
              </div>
              <VChart class="ledger-chart__canvas" :option="mealOption" autoresize />
            </div>
            <div class="ledger-chart">
              <div class="ledger-chart__head">
                <span>年度支出热力</span>
                <small class="ledger-chart__sub">{{ calendarYear }}</small>
              </div>
              <VChart class="ledger-chart__canvas ledger-chart__canvas--calendar" :option="calendarOption" autoresize />
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </template>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts'
import { CalendarComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { ChevronDown, TrendingDown, TrendingUp, Wallet } from 'lucide-vue-next'
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
  groupBy: { type: String, default: 'month' },
  loading: { type: Boolean, default: false }
})

const extraChartsOpen = ref([])

const overview = computed(() => props.summary.overview || {})
const trendOption = computed(() => buildTrendOption(props.summary))
const categoryOption = computed(() => buildCategoryOption(props.summary))
const dailyOption = computed(() => buildDailyOption(props.summary))
const mealOption = computed(() => buildMealOption(props.summary))
const calendarOption = computed(() => buildCalendarOption(props.summary))
const calendarYear = computed(() => {
  const dates = props.summary.calendar || []
  return dates[0]?.[0]?.slice(0, 4) || String(new Date().getFullYear())
})

const categoryRows = computed(() => {
  const rows = props.summary.byCategory || []
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1
  return rows.slice(0, 8).map((r) => ({
    ...r,
    percent: Math.round((r.amount / total) * 100)
  }))
})

const dailyRows = computed(() => props.summary.byDay || [])

const expenseCount = computed(() => {
  const days = props.summary.byDay || []
  return days.reduce((s, d) => s + (d.expense > 0 ? 1 : 0), 0)
})

const incomeCount = computed(() => {
  const days = props.summary.byDay || []
  return days.reduce((s, d) => s + (d.income > 0 ? 1 : 0), 0)
})

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
.ledger-dashboard { display: grid; gap: 12px; }
.ledger-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }

.ledger-metric { display: flex; align-items: center; gap: 12px; border: 1px solid var(--console-border); border-radius: 8px; padding: 14px 16px; background: var(--console-surface); }
.ledger-metric__icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; flex-shrink: 0; }

.ledger-metric--income .ledger-metric__icon { background: color-mix(in srgb, #22c55e 12%, transparent); color: #22c55e; }
.ledger-metric--expense .ledger-metric__icon { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.ledger-metric--positive .ledger-metric__icon { background: color-mix(in srgb, #3b82f6 12%, transparent); color: #3b82f6; }
.ledger-metric--negative .ledger-metric__icon { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.ledger-metric__body { display: grid; gap: 2px; min-width: 0; }
.ledger-metric__body span { color: var(--console-text-secondary); font-size: 12px; }
.ledger-metric__body strong { font-size: 20px; line-height: 26px; letter-spacing: -0.3px; }
.ledger-metric--income .ledger-metric__body strong, .ledger-metric--positive .ledger-metric__body strong { color: inherit; }
.ledger-metric--expense .ledger-metric__body strong, .ledger-metric--negative .ledger-metric__body strong { color: inherit; }

/* ── 次要统计 ── */
.ledger-stats { display: flex; gap: 16px; flex-wrap: wrap; padding: 0 2px; }
.ledger-stat { display: inline-flex; align-items: baseline; gap: 6px; }
.ledger-stat small { color: var(--console-text-secondary); font-size: 12px; }
.ledger-stat em { font-style: normal; font-size: 13px; font-weight: 600; color: var(--console-text); }

.ledger-chart { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface); padding: 14px; }
.ledger-chart--wide { min-height: 260px; }
.ledger-chart__head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.ledger-chart__head span { color: var(--console-text); font-weight: 650; font-size: 14px; }
.ledger-chart__sub { color: var(--console-text-secondary); font-size: 12px; font-weight: 400; }
.ledger-chart__canvas { min-height: 220px; }
.ledger-chart-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }

.ledger-category-list { display: grid; gap: 8px; padding-top: 10px; border-top: 1px solid var(--console-border); margin-top: 10px; }
.ledger-category-rank { display: grid; grid-template-columns: 10px 72px 1fr auto auto; align-items: center; gap: 8px; font-size: 12px; }
.ledger-category-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ledger-category-name { color: var(--console-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ledger-category-bar-wrap { height: 6px; background: var(--console-border); border-radius: 3px; overflow: hidden; }
.ledger-category-bar { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.ledger-category-amount { color: var(--console-text); font-weight: 500; text-align: right; min-width: 60px; }
.ledger-category-percent { color: var(--console-text-secondary); text-align: right; min-width: 32px; }

/* ── 更多图表折叠 ── */
.ledger-extra-collapse {
  background: transparent;
  border: none;
}

.ledger-extra-collapse :deep(.ant-collapse-item) {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  overflow: hidden;
}

.ledger-extra-collapse :deep(.ant-collapse-header) {
  background: var(--console-surface);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--console-text-secondary);
}

.ledger-extra-collapse :deep(.ant-collapse-content) {
  background: transparent;
  border: none;
}

.ledger-extra-collapse :deep(.ant-collapse-content-box) {
  padding: 12px 0 0;
}

.ledger-extra-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.ledger-extra-toggle svg {
  transition: transform 0.2s ease;
}

.ledger-extra-toggle .is-open {
  transform: rotate(180deg);
}

.ledger-chart__canvas--calendar {
  min-height: 160px;
}

/* ── 响应式 ── */
@media (max-width: 1100px) {
  .ledger-chart-row { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .ledger-metrics { grid-template-columns: 1fr; }
  .ledger-stats { gap: 10px; }
  .ledger-category-rank { grid-template-columns: 10px 56px 1fr auto; }
  .ledger-category-percent { display: none; }
}
</style>
