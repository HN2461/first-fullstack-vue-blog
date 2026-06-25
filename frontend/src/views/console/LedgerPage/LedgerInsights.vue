<template>
  <section class="ledger-insights">
    <!-- 加载态 -->
    <a-skeleton v-if="loading" active :paragraph="{ rows: 6 }" />

    <!-- 空数据引导 -->
    <div v-else-if="!hasData" class="ledger-insights__empty">
      <span class="empty-icon">📊</span>
      <p>记录更多消费后，这里会生成你的消费洞察</p>
    </div>

    <!-- 有数据 -->
    <template v-else>
      <div class="ledger-insights__head">
        <span>生活洞察</span>
        <a-tooltip title="基于当前范围内的支出记录自动分析，帮你了解消费习惯。">
          <InfoCircleOutlined class="head-info" />
        </a-tooltip>
        <small>{{ fromToText }}</small>
      </div>

      <!-- 核心指标：一行4个迷你数字 -->
      <div class="insight-kpi">
        <div class="kpi-item">
          <span class="kpi-label">日均消费</span>
          <strong class="kpi-value">{{ fmt(data.dailyAvg) }}</strong>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">最长连续记账</span>
          <strong class="kpi-value">{{ data.longestStreak || 0 }} 天</strong>
        </div>
        <div v-if="data.maxDay?.date" class="kpi-item">
          <span class="kpi-label">单日最高</span>
          <strong class="kpi-value">{{ fmt(data.maxDay.expense) }}</strong>
          <span class="kpi-sub">{{ data.maxDay.date }}</span>
        </div>
        <div v-if="data.largestEntry" class="kpi-item">
          <span class="kpi-label">单笔最大</span>
          <strong class="kpi-value">{{ fmt(data.largestEntry.amount) }}</strong>
          <span class="kpi-sub">{{ data.largestEntry.categoryName }}</span>
        </div>
      </div>

      <!-- 星期消费分布 -->
      <div v-if="weekdayStats.length" class="insight-section">
        <div class="section-head">
          <a-tooltip title="按星期几统计的日均消费，帮你发现消费规律。柱子越高说明该星期几平均花得越多。">
            <span class="section-title">哪天花最多 <InfoCircleOutlined class="section-tip" /></span>
          </a-tooltip>
        </div>
        <VChart :option="weekdayChartOption" autoresize style="height: 150px; width: 100%; cursor: pointer;" @click="onWeekdayClick" />
      </div>

      <!-- Top 3 分类 -->
      <div v-if="data.topCategories?.length" class="insight-section">
        <div class="section-head">
          <a-tooltip title="支出最多的前 3 个消费分类，按金额从高到低排列。">
            <span class="section-title">钱花在哪了 <InfoCircleOutlined class="section-tip" /></span>
          </a-tooltip>
        </div>
        <div class="category-bars">
          <div v-for="(cat, idx) in data.topCategories" :key="idx" class="cat-row">
            <div class="cat-rank" :style="{ background: ['#1677ff','#3b82f6','#06b6d4'][idx] }">{{ idx + 1 }}</div>
            <span class="cat-name">{{ cat.name }}</span>
            <div class="cat-bar-wrap">
              <div class="cat-bar" :style="{ width: cat.percent + '%', background: ['#1677ff','#3b82f6','#06b6d4'][idx] }" />
            </div>
            <span class="cat-amount">{{ fmt(cat.amount) }}</span>
            <span class="cat-pct">{{ cat.percent }}%</span>
          </div>
        </div>
      </div>

      <!-- 工作日 vs 周末 -->
      <div v-if="workdayAvg || weekendAvg" class="insight-section">
        <div class="section-head">
          <a-tooltip title="把范围内的消费按工作日和周末分开，算出各自的日均消费进行对比。">
            <span class="section-title">工作日 vs 周末 <InfoCircleOutlined class="section-tip" /></span>
          </a-tooltip>
          <small class="section-date">{{ fromToText }}</small>
        </div>
        <div class="ww-bars">
          <div class="ww-row">
            <span class="ww-label">工作日</span>
            <div class="ww-track"><div class="ww-fill ww-fill--work" :style="{ width: workdayPct + '%' }" /></div>
            <span class="ww-val">{{ fmt(workdayAvg) }}/天</span>
          </div>
          <div class="ww-row">
            <span class="ww-label">周末</span>
            <div class="ww-track"><div class="ww-fill ww-fill--weekend" :style="{ width: weekendPct + '%' }" /></div>
            <span class="ww-val">{{ fmt(weekendAvg) }}/天</span>
          </div>
        </div>
        <div class="ww-hint">
          {{ weekendAvg > workdayAvg ? '周末' : '工作日' }}消费更高，日均多花 {{ fmt(Math.abs(weekendAvg - workdayAvg)) }}
        </div>
      </div>

      <!-- 消费趋势 + 餐饮：底部两列并排 -->
      <div class="insight-bottom-row">
        <!-- 消费趋势 -->
        <div v-if="recentComparison && recentComparison.previous7 > 0" class="insight-section insight-section--half">
          <div class="section-head">
            <span class="section-title">近 7 天 vs 前 7 天</span>
          </div>
          <div class="trend-layout">
            <div class="trend-side">
              <span class="trend-side__label">{{ trendPrevRange }}</span>
              <span class="trend-side__amount">{{ fmt(recentComparison.previous7) }}</span>
            </div>
            <div class="trend-pill" :class="trendClass">
              <span class="trend-pill__arrow">{{ trendArrow }}</span>
              <span class="trend-pill__pct">{{ Math.abs(recentComparison.changeRate) }}%</span>
            </div>
            <div class="trend-side">
              <span class="trend-side__label">{{ trendRecentRange }}</span>
              <span class="trend-side__amount">{{ fmt(recentComparison.recent7) }}</span>
            </div>
          </div>
        </div>

        <!-- 餐饮占比 -->
        <div v-if="data.mealExpense > 0" class="insight-section insight-section--half">
          <div class="section-head">
            <a-tooltip title="早餐、午餐、晚餐三项支出的总和，以及占全部支出的比例。">
              <span class="section-title">餐饮占比 <InfoCircleOutlined class="section-tip" /></span>
            </a-tooltip>
          </div>
          <div class="meal-row">
            <div class="meal-ring">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--console-border)" stroke-width="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f59e0b" stroke-width="3"
                  stroke-linecap="round" :stroke-dasharray="`${mealRatio} ${100 - mealRatio}`"
                  stroke-dashoffset="25" transform="rotate(-90 18 18)" />
              </svg>
              <span class="meal-ring-text">{{ data.mealRatio }}%</span>
            </div>
            <div class="meal-detail">
              <div class="meal-line"><span>餐饮总支出</span><strong>{{ fmt(data.mealExpense) }}</strong></div>
              <div class="meal-line"><span>日均</span><strong>{{ fmt(data.mealExpense / mealDays) }}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { buildWeekdayBarOption } from './ledgerChartBuilders'
import { formatMoney } from './ledgerChartOptions'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  bookId: { type: String, default: '' }
})

const emit = defineEmits(['select-weekday'])

const data = computed(() => props.data || {})
const hasData = computed(() => (data.value.insights?.length || 0) > 0 || (data.value.dailyAvg || 0) > 0)
const weekdayStats = computed(() => data.value.weekdayStats || [])
const recentComparison = computed(() => data.value.recentComparison || null)
const weekdayChartOption = computed(() => buildWeekdayBarOption(weekdayStats.value))

const shortDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const fromToText = computed(() => {
  const { from, to } = data.value
  if (!from || !to) return '最近 30 天数据'
  const days = Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1)
  return `${shortDate(from)} - ${shortDate(to)} · 共 ${days} 天`
})

const dayCount = computed(() => {
  const { from, to } = data.value
  if (!from || !to) return 30
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1)
})

const fmt = (v) => formatMoney(Number(v || 0))

const workdayAvg = computed(() => {
  const stats = weekdayStats.value
  const workday = stats.filter((s) => ['周一', '周二', '周三', '周四', '周五'].includes(s.name))
  const total = workday.reduce((s, w) => s + w.expense, 0)
  const days = workday.reduce((s, w) => s + w.daysInRange, 0)
  return days ? Math.round(total / days) : 0
})

const weekendAvg = computed(() => {
  const stats = weekdayStats.value
  const weekend = stats.filter((s) => ['周六', '周日'].includes(s.name))
  const total = weekend.reduce((s, w) => s + w.expense, 0)
  const days = weekend.reduce((s, w) => s + w.daysInRange, 0)
  return days ? Math.round(total / days) : 0
})

const maxBar = computed(() => Math.max(workdayAvg.value, weekendAvg.value, 1))
const workdayPct = computed(() => Math.round((workdayAvg.value / maxBar.value) * 100))
const weekendPct = computed(() => Math.round((weekendAvg.value / maxBar.value) * 100))

const mealDays = computed(() => data.value.mealDays || dayCount.value || 1)
const mealRatio = computed(() => data.value.mealRatio || 0)

const trendPrevRange = computed(() => {
  const { to } = data.value
  if (!to) return '前 7 天'
  const endDate = new Date(to)
  const msPerDay = 86400000
  const recent7Start = new Date(endDate.getTime() - 6 * msPerDay)
  const prev7End = new Date(recent7Start.getTime() - msPerDay)
  const prev7Start = new Date(prev7End.getTime() - 6 * msPerDay)
  return `${shortDate(prev7Start)}-${shortDate(prev7End)}`
})

const trendRecentRange = computed(() => {
  const { to } = data.value
  if (!to) return '最近 7 天'
  const endDate = new Date(to)
  const msPerDay = 86400000
  const recent7Start = new Date(endDate.getTime() - 6 * msPerDay)
  return `${shortDate(recent7Start)}-${shortDate(endDate)}`
})

const trendArrow = computed(() => {
  const rate = recentComparison.value?.changeRate || 0
  if (rate > 0) return '↑'
  if (rate < 0) return '↓'
  return '→'
})

const trendClass = computed(() => {
  const rate = recentComparison.value?.changeRate || 0
  if (rate > 0) return 'trend-up'
  if (rate < 0) return 'trend-down'
  return 'trend-flat'
})

function onWeekdayClick(params) {
  if (params.componentType === 'series') {
    const weekday = weekdayStats.value[params.dataIndex]?.name
    if (weekday) {
      emit('select-weekday', {
        weekday,
        from: data.value.from,
        to: data.value.to
      })
    }
  }
}
</script>

<style scoped>
.ledger-insights {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 14px;
}

/* 空数据 */
.ledger-insights__empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 16px; color: var(--console-text-secondary);
}
.empty-icon { font-size: 32px; margin-bottom: 8px; }
.ledger-insights__empty p { font-size: 13px; margin: 0; }

/* 头部 */
.ledger-insights__head {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px;
}
.ledger-insights__head span { color: var(--console-text); font-weight: 650; font-size: 14px; }
.head-info { color: var(--console-text-secondary); font-size: 13px; cursor: help; }
.ledger-insights__head small { color: var(--console-text-secondary); font-size: 12px; }

/* KPI 一行 */
.insight-kpi {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px;
}
.kpi-item {
  display: flex; flex-direction: column; gap: 2px;
  padding: 8px 10px; border-radius: 6px;
  background: color-mix(in srgb, var(--console-surface) 60%, transparent);
  border: 1px solid var(--console-border);
}
.kpi-label { font-size: 11px; color: var(--console-text-secondary); line-height: 1; }
.kpi-value { font-size: 14px; font-weight: 700; color: var(--console-text); line-height: 1.4; }
.kpi-sub { font-size: 10px; color: var(--console-text-secondary); line-height: 1; }

/* 通用 section */
.insight-section {
  margin-bottom: 14px; padding: 12px; border-radius: 6px;
  border: 1px solid var(--console-border);
  background: color-mix(in srgb, var(--console-surface) 60%, transparent);
}
.section-head {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px;
}
.section-title { font-size: 13px; font-weight: 600; color: var(--console-text); cursor: help; }
.section-tip { font-size: 11px; color: var(--console-text-secondary); cursor: help; }
.section-date { font-size: 11px; color: var(--console-text-secondary); margin-left: auto; }

/* Top 3 */
.category-bars { display: grid; gap: 8px; }
.cat-row { display: grid; grid-template-columns: 18px 48px 1fr 64px 32px; align-items: center; gap: 6px; font-size: 12px; }
.cat-rank {
  width: 18px; height: 18px; display: grid; place-items: center;
  border-radius: 4px; color: #fff; font-size: 10px; font-weight: 700;
}
.cat-name { color: var(--console-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cat-bar-wrap { height: 6px; background: var(--console-border); border-radius: 3px; overflow: hidden; }
.cat-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.cat-amount { font-weight: 600; color: var(--console-text); text-align: right; }
.cat-pct { color: var(--console-text-secondary); text-align: right; }

/* 工作日 vs 周末 */
.ww-bars { display: grid; gap: 8px; }
.ww-row { display: grid; grid-template-columns: 42px 1fr 72px; align-items: center; gap: 8px; }
.ww-label { font-size: 11px; color: var(--console-text-secondary); }
.ww-track { height: 10px; background: var(--console-border); border-radius: 5px; overflow: hidden; }
.ww-fill { height: 100%; border-radius: 5px; transition: width 0.4s ease; }
.ww-fill--work { background: #1677ff; }
.ww-fill--weekend { background: #f59e0b; }
.ww-val { font-size: 12px; font-weight: 600; color: var(--console-text); text-align: right; }
.ww-hint { font-size: 11px; color: var(--console-text-secondary); margin-top: 8px; }

/* 底部两列并排 */
.insight-bottom-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0;
}
.insight-section--half {
  margin-bottom: 0;
  min-height: 120px;
}

/* 7 天趋势 */
.trend-layout {
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.trend-side {
  display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1;
}
.trend-side__label {
  font-size: 11px; color: var(--console-text-secondary); line-height: 1;
}
.trend-side__amount {
  font-size: 16px; font-weight: 700; color: var(--console-text); line-height: 1.3;
}
.trend-pill {
  display: flex; align-items: center; gap: 3px;
  padding: 4px 12px; border-radius: 20px; flex-shrink: 0;
}
.trend-up { background: rgba(239,68,68,0.08); color: #ef4444; }
.trend-down { background: rgba(34,197,94,0.08); color: #22c55e; }
.trend-flat { background: rgba(0,0,0,0.04); color: var(--console-text-secondary); }
.trend-pill__arrow { font-size: 14px; font-weight: 700; }
.trend-pill__pct { font-size: 13px; font-weight: 700; }

/* 餐饮 */
.meal-row { display: flex; align-items: center; gap: 20px; }
.meal-ring { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
.meal-ring svg { width: 100%; height: 100%; }
.meal-ring-text {
  position: absolute; inset: 0; display: grid; place-items: center;
  font-size: 13px; font-weight: 700; color: #f59e0b;
}
.meal-detail { display: grid; gap: 4px; flex: 1; }
.meal-line { display: flex; justify-content: space-between; font-size: 12px; }
.meal-line span { color: var(--console-text-secondary); }
.meal-line strong { color: var(--console-text); }

@media (max-width: 760px) {
  .insight-bottom-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .insight-kpi { grid-template-columns: repeat(2, 1fr); }
  .cat-row { grid-template-columns: 18px 40px 1fr auto; }
  .cat-pct { display: none; }
}
</style>
