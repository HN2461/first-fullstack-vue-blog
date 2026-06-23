const moneyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2
})

export function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0)
}

function axisTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-text-secondary') || '#667085'
}

function splitLineColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-border') || '#eaecf0'
}

export function buildTrendOption(summary = {}) {
  const rows = summary.trend || summary.byMonth || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 42, right: 18, bottom: 28, left: 58 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.label || item.month || item.year || item.date),
      axisLabel: { color: axisTextColor() }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), formatter: (value) => `${Math.round(value)}` },
      splitLine: { lineStyle: { color: splitLineColor() } }
    },
    series: [
      { name: '收入', type: 'line', smooth: true, data: rows.map((item) => item.income), color: '#16a34a' },
      { name: '支出', type: 'line', smooth: true, data: rows.map((item) => item.expense), color: '#dc2626' },
      { name: '结余', type: 'line', smooth: true, data: rows.map((item) => item.balance), color: '#2563eb' }
    ]
  }
}

export function buildCategoryOption(summary = {}) {
  const rows = summary.byCategory || []
  return {
    tooltip: { trigger: 'item', formatter: ({ name, value, percent }) => `${name}<br>${formatMoney(value)} (${percent}%)` },
    legend: { type: 'scroll', bottom: 0 },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['45%', '68%'],
        center: ['50%', '45%'],
        data: rows.map((item) => ({
          name: item.name,
          value: item.amount,
          itemStyle: { color: item.color }
        })),
        label: { formatter: '{b}' }
      }
    ]
  }
}

export function buildDailyOption(summary = {}) {
  const rows = summary.byDay || []
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: 18, right: 18, bottom: 28, left: 58 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.date.slice(5)),
      axisLabel: { color: axisTextColor() }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), formatter: (value) => `${Math.round(value)}` },
      splitLine: { lineStyle: { color: splitLineColor() } }
    },
    series: [
      { name: '每日支出', type: 'bar', data: rows.map((item) => item.expense), color: '#f97316', barMaxWidth: 18 }
    ]
  }
}

export function buildMealOption(summary = {}) {
  const rows = summary.mealTrend || []
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: 18, right: 18, bottom: 28, left: 58 },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.date.slice(5)),
      axisLabel: { color: axisTextColor() }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: axisTextColor(), formatter: (value) => `${Math.round(value)}` },
      splitLine: { lineStyle: { color: splitLineColor() } }
    },
    series: [
      { name: '餐饮支出', type: 'line', smooth: true, areaStyle: {}, data: rows.map((item) => item.amount), color: '#0ea5e9' }
    ]
  }
}

export function buildCalendarOption(summary = {}) {
  const rows = summary.calendar || []
  const dates = rows.map((item) => item[0])
  const year = dates[0]?.slice(0, 4) || String(new Date().getFullYear())
  return {
    tooltip: { formatter: ({ value }) => `${value?.[0] || '-'}<br>${formatMoney(value?.[1] || 0)}` },
    visualMap: {
      min: 0,
      max: Math.max(1, ...rows.map((item) => item[1] || 0)),
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      inRange: { color: ['#e0f2fe', '#0ea5e9', '#0369a1'] }
    },
    calendar: {
      top: 30,
      left: 34,
      right: 18,
      bottom: 42,
      range: year,
      cellSize: ['auto', 16],
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
      dayLabel: { color: axisTextColor() },
      monthLabel: { color: axisTextColor() },
      yearLabel: { show: false }
    },
    series: [
      { type: 'heatmap', coordinateSystem: 'calendar', data: rows }
    ]
  }
}
