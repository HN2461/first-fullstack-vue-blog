export const LEDGER_EXPORT_COLUMNS = [
  {
    key: 'occurredAt',
    title: '日期',
    width: 14,
    align: 'center',
    formatter: (record, helpers) => helpers.formatDate(record.occurredAt)
  },
  {
    key: 'weekday',
    title: '星期',
    width: 10,
    align: 'center',
    formatter: (record, helpers) => helpers.formatWeekday(record.occurredAt)
  },
  {
    key: 'type',
    title: '类型',
    width: 10,
    align: 'center',
    formatter: (record) => record.type === 'income' ? '收入' : '支出'
  },
  {
    key: 'category',
    title: '分类',
    width: 16,
    align: 'center',
    formatter: (record) => record.category?.name || record.categoryNameSnapshot || ''
  },
  {
    key: 'amount',
    title: '金额',
    width: 14,
    align: 'right',
    type: 'money',
    formatter: (record) => Number(record.amount || 0)
  },
  {
    key: 'signedAmount',
    title: '收支金额',
    width: 14,
    align: 'right',
    type: 'money',
    formatter: (record) => {
      const amount = Number(record.amount || 0)
      return record.type === 'income' ? amount : -amount
    }
  },
  {
    key: 'note',
    title: '单笔备注',
    width: 28,
    align: 'left',
    wrap: true,
    formatter: (record) => record.note || ''
  },
  {
    key: 'tags',
    title: '标签',
    width: 20,
    align: 'left',
    formatter: (record) => (record.tags || []).join('、')
  },
  {
    key: 'dailyNote',
    title: '当日备注',
    width: 34,
    align: 'left',
    wrap: true,
    formatter: (record) => record.dailyNote || ''
  },
  {
    key: 'source',
    title: '来源',
    width: 12,
    align: 'center',
    formatter: (record) => record.source === 'excel_import' ? 'Excel导入' : '手动'
  },
  {
    key: 'updatedAt',
    title: '更新时间',
    width: 22,
    align: 'center',
    formatter: (record, helpers) => helpers.formatDateTime(record.updatedAt)
  }
]

export const LEDGER_EXPORT_PRESETS = [
  {
    key: 'standard',
    name: '标准流水',
    description: '保留完整账本字段，适合日常备份和复查。',
    columns: ['occurredAt', 'type', 'category', 'amount', 'note', 'tags', 'dailyNote', 'source', 'updatedAt'],
    options: {
      zebra: true,
      colorAmount: true,
      freezeHeader: true,
      autoFilter: true,
      summaryRow: true,
      includeMeta: true
    }
  },
  {
    key: 'reimburse',
    name: '报销整理',
    description: '字段更简洁，适合对外提交或报销说明。',
    columns: ['occurredAt', 'category', 'amount', 'note', 'tags'],
    options: {
      zebra: true,
      colorAmount: false,
      freezeHeader: true,
      autoFilter: true,
      summaryRow: true,
      includeMeta: true
    }
  },
  {
    key: 'review',
    name: '财务复盘',
    description: '带星期、收支金额和备注，适合月度复盘。',
    columns: ['occurredAt', 'weekday', 'type', 'category', 'signedAmount', 'note', 'dailyNote'],
    options: {
      zebra: true,
      colorAmount: true,
      freezeHeader: true,
      autoFilter: true,
      summaryRow: true,
      includeMeta: true
    }
  },
  {
    key: 'raw',
    name: '原始数据',
    description: '弱化样式，便于二次处理和导入其他工具。',
    columns: ['occurredAt', 'type', 'category', 'amount', 'note', 'tags', 'dailyNote', 'source', 'updatedAt'],
    options: {
      zebra: false,
      colorAmount: false,
      freezeHeader: true,
      autoFilter: true,
      summaryRow: false,
      includeMeta: false
    }
  }
]

export function getDefaultExportColumnKeys() {
  return [...LEDGER_EXPORT_PRESETS[0].columns]
}
