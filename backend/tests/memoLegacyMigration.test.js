import { describe, expect, it } from 'vitest'
import { LEGACY_PERSONAL_MEMO_FIELDS, parseLegacyPersonalMemo } from '../src/utils/legacyPersonalMemoMigration.js'

const legacyContent = [
  '- 姓名：测试姓名｜英文名：Test Name',
  '- 身份证：000000000000000000｜生日：2002‑10‑13｜星座：天秤座｜民族：测试族',
  '- 政治面貌：测试团员｜婚姻：未婚｜籍贯：测试省测试市',
  '- 户口所在地：测试省测试市测试路｜户口性质：测试类型',
  '- 档案：测试人才服务中心｜手机号：13900000000',
  '- 现住址（测试）：测试省测试市测试街道｜邮编 315000',
  '- 老家地址：测试省测试县测试乡｜邮编 236000'
].join('\n')

describe('legacy personal memo parser', () => {
  it('maps legacy labels and address postal codes to the complete encrypted profile template', () => {
    const result = parseLegacyPersonalMemo(legacyContent)
    const byKey = Object.fromEntries(result.fields.map((field) => [field.key, field]))

    expect(LEGACY_PERSONAL_MEMO_FIELDS).toHaveLength(17)
    expect(result).toMatchObject({
      recognizedFieldCount: 17,
      missingLabels: [],
      duplicateLabels: [],
      invalidDateLabels: [],
      unknownFragmentCount: 0
    })
    expect(byKey.birthday.value).toBe('2002-10-13')
    expect(byKey['current-postcode'].value).toBe('315000')
    expect(byKey['hometown-postcode'].value).toBe('236000')
    expect(byKey['identity-number'].isSensitive).toBe(true)
    expect(byKey['current-postcode'].isSensitive).toBe(false)
  })

  it('reports ambiguous, missing, invalid-date, and unmapped segments without including their values', () => {
    const result = parseLegacyPersonalMemo([
      '姓名：甲｜姓名：乙｜生日：日期不明',
      '额外字段：只计数，不保留为资料字段'
    ].join('\n'))

    expect(result.duplicateLabels).toContain('姓名')
    expect(result.invalidDateLabels).toContain('生日')
    expect(result.unknownFragmentCount).toBe(1)
    expect(result.missingLabels).toContain('身份证')
  })
})
