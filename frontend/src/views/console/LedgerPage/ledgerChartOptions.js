/**
 * 账本仪表盘图表配置
 * 精简为 3 个核心图表：趋势折线、分类占比、支出排行
 */

const moneyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2
})

export function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0)
}

function formatShortMoney(value) {
  const num = Number(value) || 0
  if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(Math.round(num))
}

function axisTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-text-secondary') || '#667085'
}

function splitLineColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-border') || '#eaecf0'
}

function surfaceColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-surface') || '#fff'
}

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#ef4444'
const BALANCE_COLOR = '#3b82f6'

/**
 * 收支趋势折线图 — 面积图，收入/支出/结余
 */
export function buildTrendOption(summary = {}) {
  const rows = summary.trend || summary.byMonth || []
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: surfaceColor(),
      borderColor: splitLineColor(),
      textStyle: { color: axisTextColor(), fontSize: 12 },
      formatter(params) {
        const lines = params.map((p) => {
          const color = p.color
          const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;"></span>`
          return `${dot}${p.seriesName}　<strong>${formatMoney(p.value)}</strong>`
        })
        return `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:4px;">${params[0].axisValue}</div>${lines.join('<br>')}`
      }
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: axisTextColor(), fontSize: 12 }
    },
    grid: { top: 36, right: 16, bottom: 28, left: 52 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.label || item.month || item.year || item.date),
      axisLabel: { color: axisTextColor(), fontSize: 11 },
      axisLine: { lineStyle: { color: splitLineColor() } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), fontSize: 11, formatter: (v) => formatShortMoney(v) },
      splitLine: { lineStyle: { color: splitLineColor(), type: 'dashed' } }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: rows.length <= 31,
        lineStyle: { width: 2 },
        areaStyle: { color: `${INCOME_COLOR}18` },
        data: rows.map((item) => item.income),
        color: INCOME_COLOR
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: rows.length <= 31,
        lineStyle: { width: 2 },
        areaStyle: { color: `${EXPENSE_COLOR}18` },
        data: rows.map((item) => item.expense),
        color: EXPENSE_COLOR
      },
      {
        name: '结余',
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 5,
        showSymbol: rows.length <= 31,
        lineStyle: { width: 1.5, type: 'dashed' },
        data: rows.map((item) => item.balance),
        color: BALANCE_COLOR
      }
    ]
  }
}

/**
 * 支出分类占比 — 环形图，带百分比标签
 */
export function buildCategoryOption(summary = {}) {
  const rows = (summary.byCategory || []).slice(0, 10)
  const total = rows.reduce((s, r) => s + r.amount, 0)

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: surfaceColor(),
      borderColor: splitLineColor(),
      textStyle: { color: axisTextColor(), fontSize: 12 },
      formatter({ name, value, percent }) {
        return `<strong>${name}</strong><br>${formatMoney(value)}　${percent}%`
      }
    },
    legend: { show: false },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: surfaceColor(), borderWidth: 2 },
        label: {
          formatter({ name, percent }) {
            return percent >= 5 ? `${name}\n${percent}%` : ''
          },
          fontSize: 11,
          lineHeight: 16,
          color: axisTextColor()
        },
        labelLine: { length: 12, length2: 8 },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' }
        },
        data: rows.map((item) => ({
          name: item.name,
          value: item.amount,
          itemStyle: { color: item.color }
        }))
      },
      // 中心总金额
      {
        type: 'pie',
        radius: ['0%', '0%'],
        center: ['50%', '50%'],
        label: {
          show: true,
          position: 'center',
          formatter: `总支出\n${formatShortMoney(total)}`,
          fontSize: 13,
          fontWeight: 'bold',
          lineHeight: 20,
          color: axisTextColor()
        },
        data: [{ value: 0 }],
        silent: true
      }
    ]
  }
}

/**
 * 每日支出柱状图
 */
export function buildDailyOption(summary = {}) {
  const rows = summary.byDay || []
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: surfaceColor(),
      borderColor: splitLineColor(),
      textStyle: { color: axisTextColor(), fontSize: 12 },
      formatter(params) {
        const p = params[0]
        return `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:2px;">${p.axisValue}</div>支出　<strong>${formatMoney(p.value)}</strong>`
      }
    },
    grid: { top: 12, right: 12, bottom: 28, left: 48 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.date.slice(5)),
      axisLabel: { color: axisTextColor(), fontSize: 10, interval: Math.max(0, Math.floor(rows.length / 15) - 1) },
      axisLine: { lineStyle: { color: splitLineColor() } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), fontSize: 11, formatter: (v) => formatShortMoney(v) },
      splitLine: { lineStyle: { color: splitLineColor(), type: 'dashed' } }
    },
    series: [
      {
        name: '每日支出',
        type: 'bar',
        data: rows.map((item) => item.expense),
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: EXPENSE_COLOR },
            { offset: 1, color: `${EXPENSE_COLOR}60` }
          ]
        },
        barMaxWidth: 16,
        borderRadius: [3, 3, 0, 0]
      }
    ]
  }
}

/**
 * 餐饮趋势 — 面积折线
 */
export function buildMealOption(summary = {}) {
  const rows = summary.mealTrend || []
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: surfaceColor(),
      borderColor: splitLineColor(),
      textStyle: { color: axisTextColor(), fontSize: 12 },
      formatter(params) {
        const p = params[0]
        return `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:2px;">${p.axisValue}</div>餐饮　<strong>${formatMoney(p.value)}</strong>`
      }
    },
    grid: { top: 12, right: 12, bottom: 28, left: 48 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.date.slice(5)),
      axisLabel: { color: axisTextColor(), fontSize: 10, interval: Math.max(0, Math.floor(rows.length / 15) - 1) },
      axisLine: { lineStyle: { color: splitLineColor() } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), fontSize: 11, formatter: (v) => formatShortMoney(v) },
      splitLine: { lineStyle: { color: splitLineColor(), type: 'dashed' } }
    },
    series: [
      {
        name: '餐饮支出',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#0ea5e9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0ea5e930' },
              { offset: 1, color: '#0ea5e908' }
            ]
          }
        },
        data: rows.map((item) => item.amount)
      }
    ]
  }
}

/**
 * 年度支出热力图
 */
export function buildCalendarOption(summary = {}) {
  const rows = summary.calendar || []
  const dates = rows.map((item) => item[0])
  const year = dates[0]?.slice(0, 4) || String(new Date().getFullYear())
  return {
    tooltip: {
      backgroundColor: surfaceColor(),
      borderColor: splitLineColor(),
      textStyle: { color: axisTextColor(), fontSize: 12 },
      formatter({ value }) {
        if (!value?.[0]) return ''
        return `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:2px;">${value[0]}</div>支出　<strong>${formatMoney(value[1] || 0)}</strong>`
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: Math.max(1, ...rows.map((item) => item[1] || 0)),
      inRange: { color: ['#e0f2fe', '#0ea5e9', '#0369a1'] }
    },
    calendar: {
      top: 20,
      left: 34,
      right: 12,
      bottom: 8,
      range: year,
      cellSize: ['auto', 14],
      itemStyle: { borderWidth: 2, borderColor: surfaceColor() },
      dayLabel: { color: axisTextColor(), fontSize: 10 },
      monthLabel: { color: axisTextColor(), fontSize: 11 },
      yearLabel: { show: false }
    },
    series: [
      { type: 'heatmap', coordinateSystem: 'calendar', data: rows }
    ]
  }
}
