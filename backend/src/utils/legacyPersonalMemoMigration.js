export const LEGACY_PERSONAL_MEMO_FIELDS = [
  { key: 'full-name', label: '姓名', type: 'text', isSensitive: false },
  { key: 'english-name', label: '英文名', type: 'text', isSensitive: false },
  { key: 'identity-number', label: '身份证', type: 'id-number', isSensitive: true },
  { key: 'birthday', label: '生日', type: 'date', isSensitive: true },
  { key: 'zodiac', label: '星座', type: 'text', isSensitive: false },
  { key: 'ethnicity', label: '民族', type: 'text', isSensitive: false },
  { key: 'political-status', label: '政治面貌', type: 'text', isSensitive: false },
  { key: 'marital-status', label: '婚姻状况', type: 'text', isSensitive: false },
  { key: 'native-place', label: '籍贯', type: 'text', isSensitive: true },
  { key: 'household-registration', label: '户口所在地', type: 'address', isSensitive: true },
  { key: 'household-type', label: '户口性质', type: 'text', isSensitive: true },
  { key: 'archive-agency', label: '档案存放机构', type: 'text', isSensitive: true },
  { key: 'phone', label: '手机号', type: 'phone', isSensitive: true },
  { key: 'current-address', label: '现住址', type: 'address', isSensitive: true },
  { key: 'current-postcode', label: '现住址邮编', type: 'text', isSensitive: false },
  { key: 'hometown-address', label: '老家地址', type: 'address', isSensitive: true },
  { key: 'hometown-postcode', label: '老家邮编', type: 'text', isSensitive: false }
]

const fieldAliases = new Map([
  ['姓名', 'full-name'],
  ['名字', 'full-name'],
  ['英文名', 'english-name'],
  ['身份证', 'identity-number'],
  ['身份证号', 'identity-number'],
  ['身份证号码', 'identity-number'],
  ['生日', 'birthday'],
  ['出生日期', 'birthday'],
  ['星座', 'zodiac'],
  ['民族', 'ethnicity'],
  ['政治面貌', 'political-status'],
  ['婚姻', 'marital-status'],
  ['婚姻状况', 'marital-status'],
  ['籍贯', 'native-place'],
  ['户口所在地', 'household-registration'],
  ['户籍所在地', 'household-registration'],
  ['户口性质', 'household-type'],
  ['档案', 'archive-agency'],
  ['档案存放机构', 'archive-agency'],
  ['手机号', 'phone'],
  ['手机号码', 'phone'],
  ['联系电话', 'phone'],
  ['现住址', 'current-address'],
  ['现住地址', 'current-address'],
  ['现居住地址', 'current-address'],
  ['老家地址', 'hometown-address'],
  ['家乡地址', 'hometown-address'],
  ['邮编', 'postcode'],
  ['邮政编码', 'postcode']
])

function normalizeLabel(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[（(].*?[）)]/g, '')
    .replace(/\s+/g, '')
    .trim()
}

function normalizeValue(field, value) {
  const trimmed = String(value || '').trim()
  if (field.key !== 'birthday') return trimmed

  const normalized = trimmed
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[年月/.]/g, '-')
    .replace(/日/g, '')
    .replace(/-+/g, '-')
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!match) return trimmed

  const [, year, month, day] = match
  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) return trimmed
  return isoDate
}

export function parseLegacyPersonalMemo(content) {
  const values = new Map()
  const duplicates = new Set()
  let unknownFragmentCount = 0

  for (const line of String(content || '').split(/\r?\n/)) {
    const fragments = line.replace(/^\s*(?:[-*+]\s+|>\s*)/, '').split(/[|｜]/)
    let addressScope = ''

    for (const rawFragment of fragments) {
      const fragment = rawFragment.trim()
      if (!fragment) continue

      const labelValue = fragment.match(/^([^:：]+)\s*[:：]\s*(.*)$/)
      let label = ''
      let value = ''
      if (labelValue) {
        label = normalizeLabel(labelValue[1])
        value = labelValue[2].trim()
      } else {
        const postalCode = fragment.match(/^(?:邮编|邮政编码)\s*([0-9A-Za-z-]+)$/)
        if (postalCode) {
          label = '邮编'
          value = postalCode[1]
        }
      }

      const key = fieldAliases.get(label)
      if (!key) {
        unknownFragmentCount += 1
        continue
      }

      let fieldKey = key
      if (key === 'postcode') {
        if (addressScope === 'current') fieldKey = 'current-postcode'
        else if (addressScope === 'hometown') fieldKey = 'hometown-postcode'
        else {
          unknownFragmentCount += 1
          continue
        }
      } else if (key === 'current-address') {
        addressScope = 'current'
      } else if (key === 'hometown-address') {
        addressScope = 'hometown'
      }

      if (values.has(fieldKey)) duplicates.add(fieldKey)
      const field = LEGACY_PERSONAL_MEMO_FIELDS.find((item) => item.key === fieldKey)
      values.set(fieldKey, normalizeValue(field, value))
    }
  }

  const fields = LEGACY_PERSONAL_MEMO_FIELDS.map((field, order) => ({
    ...field,
    value: values.get(field.key) || '',
    order
  }))
  const missingLabels = fields.filter((field) => !field.value).map((field) => field.label)
  const invalidDateLabels = fields
    .filter((field) => field.type === 'date' && field.value && !/^\d{4}-\d{2}-\d{2}$/.test(field.value))
    .map((field) => field.label)

  return {
    fields,
    recognizedFieldCount: values.size,
    missingLabels,
    duplicateLabels: [...duplicates].map((key) => LEGACY_PERSONAL_MEMO_FIELDS.find((field) => field.key === key).label),
    invalidDateLabels,
    unknownFragmentCount
  }
}
