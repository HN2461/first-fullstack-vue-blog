<template>
  <section class="ledger-dashboard">
    <a-skeleton v-if="loading" active :paragraph="{ rows: 8 }" />
    <template v-else>
      <div class="ledger-metrics">
        <div v-for="item in metricCards" :key="item.key" :class="['ledger-metric', `ledger-metric--${item.tone}`]">
          <div class="ledger-metric__icon">
            <component :is="item.icon" :size="20" />
          </div>
          <div class="ledger-metric__body">
            <span class="ledger-metric__label">{{ item.label }}</span>
            <strong class="ledger-metric__value">{{ formatMoney(item.value) }}</strong>
            <div v-if="prev" class="ledger-metric__change" :class="changeClass(item.rate, item.key === 'expense')">
              <span>{{ changeArrow(item.rate) }}</span>
              <span>{{ Math.abs(item.rate) }}% vs 上期</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ledger-stats">
        <div v-for="item in statCards" :key="item.label" class="ledger-stat-card">
          <span class="ledger-stat-card__label">{{ item.label }}</span>
          <span class="ledger-stat-card__value">{{ item.value }}</span>
        </div>
      </div>

      <div class="ledger-chart ledger-chart--wide">
        <div class="ledger-chart__head">
          <div class="ledger-chart__title">
            <span>{{ trendTitle }}</span>
          </div>
          <div class="ledger-chart__controls">
            <a-tooltip title="切换趋势图展示的收支指标">
              <a-radio-group v-model:value="trendMetric" size="small">
                <a-radio-button value="all">收支</a-radio-button>
                <a-radio-button value="expense">支出</a-radio-button>
                <a-radio-button value="income">收入</a-radio-button>
                <a-radio-button value="balance">结余</a-radio-button>
              </a-radio-group>
            </a-tooltip>
            <a-tooltip title="切换趋势图的图形样式">
              <a-radio-group v-model:value="trendView" size="small">
                <a-radio-button value="line">折线</a-radio-button>
                <a-radio-button value="bar">柱状</a-radio-button>
              </a-radio-group>
            </a-tooltip>
          </div>
        </div>
        <VChart class="ledger-chart__canvas" :option="trendOption" autoresize />
      </div>

      <div class="ledger-chart-row">
        <div class="ledger-chart">
          <div class="ledger-chart__head">
            <div class="ledger-chart__title">
              <span>分类构成</span>
              <small>TOP {{ categoryRows.length }}</small>
            </div>
            <div class="ledger-chart__controls">
              <a-tooltip title="切换支出或收入分类构成">
                <a-radio-group v-model:value="categoryType" size="small">
                  <a-radio-button value="expense">支出</a-radio-button>
                  <a-radio-button value="income">收入</a-radio-button>
                </a-radio-group>
              </a-tooltip>
              <a-tooltip title="切换分类占比或排行视图">
                <a-radio-group v-model:value="categoryView" size="small">
                  <a-radio-button value="pie">环形</a-radio-button>
                  <a-radio-button value="bar">排行</a-radio-button>
                </a-radio-group>
              </a-tooltip>
            </div>
          </div>
          <VChart v-if="categoryChartOption" class="ledger-chart__canvas" :option="categoryChartOption" autoresize />
          <div v-else class="ledger-chart__empty">暂无分类数据</div>
          <div class="ledger-category-list">
            <div v-for="item in categoryRows" :key="item.categoryId || item.name" class="ledger-category-rank">
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
            <div class="ledger-chart__title">
              <span>每日走势</span>
              <small>{{ dailyRows.length }} 天</small>
            </div>
            <div class="ledger-chart__controls">
              <a-tooltip title="切换每日走势统计指标">
                <a-radio-group v-model:value="dailyMetric" size="small">
                  <a-radio-button value="expense">支出</a-radio-button>
                  <a-radio-button value="income">收入</a-radio-button>
                  <a-radio-button value="balance">结余</a-radio-button>
                </a-radio-group>
              </a-tooltip>
              <a-tooltip title="切换每日走势的图形样式">
                <a-radio-group v-model:value="dailyView" size="small">
                  <a-radio-button value="bar">柱状</a-radio-button>
                  <a-radio-button value="line">折线</a-radio-button>
                </a-radio-group>
              </a-tooltip>
            </div>
          </div>
          <VChart class="ledger-chart__canvas" :option="dailyOption" autoresize />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-vue-next'
import {
  buildCategoryBarOption,
  buildCategoryOption,
  buildDailyOption,
  buildIncomeCategoryOption,
  buildTrendOption
} from './ledgerChartBuilders'
import { formatMoney } from './ledgerChartOptions'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent])

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
  groupBy: { type: String, default: 'month' },
  loading: { type: Boolean, default: false }
})

const trendMetric = ref('all')
const trendView = ref('line')
const categoryType = ref('expense')
const categoryView = ref('pie')
const dailyMetric = ref('expense')
const dailyView = ref('bar')

const overview = computed(() => props.summary.overview || {})
const prev = computed(() => props.summary.previousPeriod || null)
const dailyRows = computed(() => props.summary.byDay || [])

const metricCards = computed(() => [
  { key: 'income', label: '收入', value: overview.value.income, rate: prev.value?.changeRate?.income || 0, tone: 'income', icon: TrendingUp },
  { key: 'expense', label: '支出', value: overview.value.expense, rate: prev.value?.changeRate?.expense || 0, tone: 'expense', icon: TrendingDown },
  { key: 'balance', label: '结余', value: overview.value.balance, rate: prev.value?.changeRate?.balance || 0, tone: overview.value.balance >= 0 ? 'positive' : 'negative', icon: Wallet }
])

const statCards = computed(() => [
  { label: '日均支出', value: formatMoney(overview.value.averageDailyExpense) },
  { label: '最大单日', value: formatMoney(overview.value.maxDailyExpense) },
  { label: '支出天数', value: dailyRows.value.reduce((s, d) => s + (d.expense > 0 ? 1 : 0), 0) },
  { label: '收入天数', value: dailyRows.value.reduce((s, d) => s + (d.income > 0 ? 1 : 0), 0) }
])

const trendOption = computed(() => buildTrendOption(props.summary, { metricMode: trendMetric.value, view: trendView.value }))
const dailyOption = computed(() => buildDailyOption(props.summary, { metric: dailyMetric.value, view: dailyView.value }))
const currentCategorySource = computed(() => categoryType.value === 'income' ? props.summary.byIncomeCategory || [] : props.summary.byCategory || [])
const categoryRows = computed(() => {
  const total = currentCategorySource.value.reduce((s, r) => s + r.amount, 0) || 1
  return currentCategorySource.value.slice(0, 8).map((r) => ({ ...r, percent: Math.round((r.amount / total) * 100) }))
})
const categoryChartOption = computed(() => {
  if (categoryView.value === 'bar') return buildCategoryBarOption(categoryRows.value, categoryType.value === 'income' ? '收入分类' : '支出分类')
  return categoryType.value === 'income' ? buildIncomeCategoryOption(props.summary) : buildCategoryOption(props.summary)
})
const trendTitle = computed(() => ({ day: '每日收支趋势', month: '月度收支趋势', year: '年度收支趋势', all: '总收支概览' }[props.groupBy] || '收支趋势'))

function changeArrow(rate) {
  return rate > 0 ? '↑' : rate < 0 ? '↓' : '→'
}

function changeClass(rate, invertForExpense = false) {
  if (rate === 0) return 'change-neutral'
  const positive = rate > 0
  if (invertForExpense) return positive ? 'change-bad' : 'change-good'
  return positive ? 'change-good' : 'change-bad'
}
</script>

<style scoped>
.ledger-dashboard { display: grid; gap: 12px; }
.ledger-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.ledger-metric { display: flex; align-items: center; gap: 14px; border: 1px solid var(--console-border); border-radius: 8px; padding: 16px 18px; background: var(--console-surface); }
.ledger-metric__icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 8px; flex-shrink: 0; }
.ledger-metric--income .ledger-metric__icon { background: color-mix(in srgb, #22c55e 12%, transparent); color: #22c55e; }
.ledger-metric--expense .ledger-metric__icon { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.ledger-metric--positive .ledger-metric__icon { background: color-mix(in srgb, #3b82f6 12%, transparent); color: #3b82f6; }
.ledger-metric--negative .ledger-metric__icon { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.ledger-metric__body { display: grid; gap: 3px; min-width: 0; }
.ledger-metric__label { color: var(--console-text-secondary); font-size: 12px; line-height: 1; }
.ledger-metric__value { font-size: 22px; line-height: 28px; font-weight: 700; color: var(--console-text); }
.ledger-metric--income .ledger-metric__value { color: #16a34a; }
.ledger-metric--expense .ledger-metric__value,
.ledger-metric--negative .ledger-metric__value { color: #dc2626; }
.ledger-metric--positive .ledger-metric__value { color: #2563eb; }
.ledger-metric__change { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; line-height: 1; margin-top: 2px; }
.change-good { color: #22c55e; }
.change-bad { color: #ef4444; }
.change-neutral { color: var(--console-text-secondary); }
.ledger-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.ledger-stat-card { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface); }
.ledger-stat-card__label { color: var(--console-text-secondary); font-size: 11px; line-height: 1; }
.ledger-stat-card__value { font-size: 14px; font-weight: 600; color: var(--console-text); line-height: 1.2; }
.ledger-chart { min-width: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface); padding: 14px; }
.ledger-chart--wide { min-height: 260px; }
.ledger-chart__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.ledger-chart__title { display: flex; align-items: baseline; gap: 8px; min-width: 0; padding-top: 2px; }
.ledger-chart__title span { color: var(--console-text); font-weight: 650; font-size: 14px; line-height: 24px; white-space: nowrap; }
.ledger-chart__title small { color: var(--console-text-secondary); font-size: 12px; line-height: 24px; white-space: nowrap; }
.ledger-chart__controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
.ledger-chart__controls :deep(.ant-radio-group) { display: inline-flex; flex-wrap: nowrap; padding: 2px; border: 1px solid var(--console-border); border-radius: 6px; background: color-mix(in srgb, var(--console-surface) 84%, var(--console-border)); }
.ledger-chart__controls :deep(.ant-radio-button-wrapper) { border: none; background: transparent; font-size: 12px; }
.ledger-chart__controls :deep(.ant-radio-button-wrapper::before) { display: none; }
.ledger-chart__controls :deep(.ant-radio-button-wrapper-checked) { border-radius: 4px; background: var(--console-surface); box-shadow: 0 1px 2px color-mix(in srgb, #000 8%, transparent); }
.ledger-chart__canvas { min-height: 220px; }
.ledger-chart__empty { display: grid; place-items: center; min-height: 220px; color: var(--console-text-secondary); font-size: 13px; }
.ledger-chart-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.ledger-category-list { display: grid; gap: 8px; padding-top: 10px; border-top: 1px solid var(--console-border); margin-top: 10px; }
.ledger-category-rank { display: grid; grid-template-columns: 10px 72px 1fr auto auto; align-items: center; gap: 8px; font-size: 12px; }
.ledger-category-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ledger-category-name { color: var(--console-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ledger-category-bar-wrap { height: 6px; background: var(--console-border); border-radius: 3px; overflow: hidden; }
.ledger-category-bar { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.ledger-category-amount { color: var(--console-text); font-weight: 500; text-align: right; min-width: 60px; }
.ledger-category-percent { color: var(--console-text-secondary); text-align: right; min-width: 32px; }
@media (max-width: 1100px) { .ledger-chart-row { grid-template-columns: 1fr; } }
@media (max-width: 760px) {
  .ledger-chart__head { flex-direction: column; }
  .ledger-chart__controls { justify-content: flex-start; }
}
@media (max-width: 640px) {
  .ledger-metrics { grid-template-columns: 1fr; }
  .ledger-stats { grid-template-columns: repeat(2, 1fr); }
  .ledger-category-rank { grid-template-columns: 10px 56px 1fr auto; }
  .ledger-category-percent { display: none; }
}
</style>
