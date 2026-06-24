import { formatMoney } from './ledgerChartOptions'
import {
  axisTextColor,
  baseTooltip,
  formatShortMoney,
  getMetricMeta,
  splitLineColor,
  surfaceColor
} from './ledgerChartTheme'

function axisGrid(top = 12, left = 48) {
  return { top, right: 12, bottom: 28, left }
}

function valueAxis() {
  return {
    type: 'value',
    axisLabel: { color: axisTextColor(), fontSize: 11, formatter: (v) => formatShortMoney(v) },
    splitLine: { lineStyle: { color: splitLineColor(), type: 'dashed' } }
  }
}

function categoryAxis(labels, interval = 0) {
  return {
    type: 'category',
    data: labels,
    axisLabel: { color: axisTextColor(), fontSize: 10, interval },
    axisLine: { lineStyle: { color: splitLineColor() } },
    axisTick: { show: false }
  }
}

function metricSeries(rows, metrics, view) {
  const type = view === 'bar' ? 'bar' : 'line'
  return metrics.map((metric) => {
    const meta = getMetricMeta(metric)
    return {
      name: meta.label,
      type,
      smooth: type === 'line',
      symbol: type === 'line' ? (metric === 'balance' ? 'diamond' : 'circle') : undefined,
      showSymbol: type === 'line' ? rows.length <= 31 : undefined,
      lineStyle: type === 'line' ? { width: metric === 'balance' ? 1.5 : 2, type: metric === 'balance' ? 'dashed' : 'solid' } : undefined,
      areaStyle: type === 'line' && metric !== 'balance' ? { color: `${meta.color}18` } : undefined,
      barMaxWidth: type === 'bar' ? 18 : undefined,
      data: rows.map((item) => item[metric]),
      color: meta.color
    }
  })
}

function pieOption(rows, title) {
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return {
    tooltip: {
      trigger: 'item',
      ...baseTooltip(),
      formatter: ({ name, value, percent }) => `<strong>${name}</strong><br>${formatMoney(value)}　${percent}%`
    },
    legend: { show: false },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '50%'],
        itemStyle: { borderRadius: 4, borderColor: surfaceColor(), borderWidth: 2 },
        label: {
          formatter: ({ name, percent }) => percent >= 5 ? `${name}\n${percent}%` : '',
          fontSize: 11,
          lineHeight: 16,
          color: axisTextColor()
        },
        data: rows.map((item) => ({ name: item.name, value: item.amount, itemStyle: { color: item.color } }))
      },
      {
        type: 'pie',
        radius: ['0%', '0%'],
        center: ['50%', '50%'],
        label: { show: true, position: 'center', formatter: `${title}\n${formatShortMoney(total)}`, fontSize: 13, fontWeight: 'bold', lineHeight: 20, color: axisTextColor() },
        data: [{ value: 0 }],
        silent: true
      }
    ]
  }
}

export function buildTrendOption(summary = {}, options = {}) {
  const rows = summary.trend || summary.byMonth || []
  const metrics = ['income', 'expense', 'balance'].includes(options.metricMode) ? [options.metricMode] : ['income', 'expense', 'balance']
  return {
    tooltip: {
      trigger: 'axis',
      ...baseTooltip(),
      formatter(params) {
        const lines = params.map((p) => `${p.marker}${p.seriesName}　<strong>${formatMoney(p.value)}</strong>`)
        return `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:4px;">${params[0].axisValue}</div>${lines.join('<br>')}`
      }
    },
    legend: { top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { color: axisTextColor(), fontSize: 12 } },
    grid: axisGrid(36, 52),
    xAxis: categoryAxis(rows.map((item) => item.label || item.month || item.year || item.date)),
    yAxis: valueAxis(),
    series: metricSeries(rows, metrics, options.view || 'line')
  }
}

export function buildCategoryOption(summary = {}) {
  return pieOption((summary.byCategory || []).slice(0, 10), '总支出')
}

export function buildIncomeCategoryOption(summary = {}) {
  const rows = (summary.byIncomeCategory || []).slice(0, 10)
  if (!rows.reduce((s, r) => s + r.amount, 0)) return null
  return pieOption(rows, '总收入')
}

export function buildCategoryBarOption(rows = [], label = '分类排行') {
  const data = rows.slice(0, 12).reverse()
  return {
    tooltip: { trigger: 'axis', ...baseTooltip(), formatter: (params) => `<strong>${params[0].name}</strong><br>${label}　${formatMoney(params[0].value)}` },
    grid: { top: 12, right: 24, bottom: 24, left: 72 },
    xAxis: valueAxis(),
    yAxis: categoryAxis(data.map((item) => item.name)),
    series: [{ name: label, type: 'bar', barMaxWidth: 16, data: data.map((item) => ({ value: item.amount, itemStyle: { color: item.color } })) }]
  }
}

export function buildDailyOption(summary = {}, options = {}) {
  const rows = summary.byDay || []
  const metric = options.metric || 'expense'
  const meta = getMetricMeta(metric)
  const type = options.view === 'line' ? 'line' : 'bar'
  return {
    tooltip: { trigger: 'axis', ...baseTooltip(), formatter: (params) => `<div style="font-size:12px;color:${axisTextColor()};margin-bottom:2px;">${params[0].axisValue}</div>${meta.label}　<strong>${formatMoney(params[0].value)}</strong>` },
    grid: axisGrid(),
    xAxis: categoryAxis(rows.map((item) => item.date.slice(5)), Math.max(0, Math.floor(rows.length / 15) - 1)),
    yAxis: valueAxis(),
    series: [{
      name: `每日${meta.label}`,
      type,
      smooth: type === 'line',
      symbol: type === 'line' ? 'none' : undefined,
      lineStyle: type === 'line' ? { width: 2, color: meta.color } : undefined,
      areaStyle: type === 'line' ? { color: `${meta.color}18` } : undefined,
      barMaxWidth: type === 'bar' ? 16 : undefined,
      color: type === 'bar' ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: meta.color }, { offset: 1, color: `${meta.color}60` }] } : meta.color,
      data: rows.map((item) => item[metric])
    }]
  }
}
