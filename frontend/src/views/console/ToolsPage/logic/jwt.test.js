import { describe, expect, it } from 'vitest'
import { decodeJwt, getJwtTimeClaims } from './jwt'

function segment(value) { return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url') }
function token(payload = {}, header = { alg: 'HS256', typ: 'JWT' }, signature = 'AQID') { return `${segment(header)}.${segment(payload)}.${signature}` }

describe('JWT 结构与严格编码', () => {
  it('解码标准三段对象、中文及 emoji，但不声明签名可信', () => {
    expect(decodeJwt(` ${token({ name: '中文😀', sub: '123' })}\n`)).toMatchObject({ header: { alg: 'HS256', typ: 'JWT' }, payload: { name: '中文😀', sub: '123' }, unsecured: false })
    expect(decodeJwt(token({}, { alg: 'none' }, '')).unsecured).toBe(true)
  })
  it('拒绝错误分段、空头部、填充符、非 Base64url 和非规范尾部位', () => {
    for (const input of ['', 'a.b', 'a.b.c.d.e', '.e30.AQID', `${segment({ alg: 'HS256' })}=.e30.AQID`, `${segment({ alg: 'HS256' })}.e30.A+ID`, `${segment({ alg: 'HS256' })}.e31.AQID`]) {
      expect(() => decodeJwt(input)).toThrow()
    }
  })
  it('拒绝非法 UTF-8、非 JSON 对象以及缺少算法', () => {
    const header = segment({ alg: 'HS256' })
    expect(() => decodeJwt(`${header}.${Buffer.from([0xc0, 0xaf]).toString('base64url')}.AQID`)).toThrow('UTF-8')
    expect(() => decodeJwt(`${header}.${segment('[]')}.AQID`)).toThrow('对象')
    expect(() => decodeJwt(`${header}.${segment('null')}.AQID`)).toThrow('对象')
    expect(() => decodeJwt(token({}, {}))).toThrow('alg')
    expect(() => decodeJwt(token({}, { alg: 'HS256' }, ''))).toThrow('Signature')
    expect(() => decodeJwt(token({}, { alg: 'none' }, 'AQID'))).toThrow('空签名')
  })
  it('展示和复制文本保留长整数、小数尾零、指数与负零，不回写元数据对象', () => {
    const result = decodeJwt(token(
      '{"id":9007199254740993,"amount":0.123456789012345678901,"trailing":1.2300,"exponent":1E+30,"zero":-0,"name":"中文😀"}',
      '{"alg":"HS256","customId":9007199254740995}'
    ))
    expect(result.headerText).toContain('"customId": 9007199254740995')
    for (const literal of ['9007199254740993', '0.123456789012345678901', '1.2300', '1E+30', '-0', '中文😀']) expect(result.payloadText).toContain(literal)
    expect(result.payloadText).not.toBe(JSON.stringify(result.payload, null, 2))
  })
  it('拒绝头部、载荷及嵌套对象中解码后重名的键，避免算法和声明歧义', () => {
    expect(() => decodeJwt(token('{}', '{"alg":"none","alg":"HS256"}'))).toThrow('Header 含重复键')
    expect(() => decodeJwt(token('{"exp":1,"\\u0065xp":2}'))).toThrow('Payload 含重复键')
    expect(() => decodeJwt(token('{"profile":{"id":1,"id":2}}'))).toThrow('重复键')
  })
  it('严格拒绝 JSON 注释、尾逗号与实际 BOM，但合法转义仍正常显示', () => {
    expect(() => decodeJwt(token('{"id":1,}'))).toThrow('JSON 无效')
    expect(() => decodeJwt(token('{/* note */"id":1}'))).toThrow('JSON 无效')
    expect(() => decodeJwt(token('\uFEFF{"id":1}'))).toThrow('JSON 无效')
    expect(decodeJwt(token('{"name":"\\u4e2d\\u6587"}')).payloadText).toContain('\\u4e2d\\u6587')
  })
})

describe('JWT 时间声明', () => {
  it('以秒解释 NumericDate，并展示到期边界和未来声明', () => {
    const now = 1700000000000
    const claims = getJwtTimeClaims({ exp: now / 1000, nbf: now / 1000 + 1, iat: now / 1000 + 2 }, now)
    expect(claims.map(({ key, state }) => [key, state])).toEqual([['exp', 'expired'], ['nbf', 'pending'], ['iat', 'future']])
    expect(claims[0].text).toContain('2023-11-14T22:13:20.000Z')
  })
  it('不强制转换非法声明，允许合法小数和零值，未声明字段不凭空补值', () => {
    expect(getJwtTimeClaims({ exp: '1700000000', nbf: null, iat: 1e30 }, 0).map(({ state }) => state)).toEqual(['invalid', 'invalid', 'invalid'])
    expect(getJwtTimeClaims({ exp: { valueOf: null, toString: null } }, 0)[0].state).toBe('invalid')
    expect(getJwtTimeClaims({ exp: 0.5 }, 0)[0]).toMatchObject({ state: 'normal', text: '1970-01-01T00:00:00.500Z' })
    expect(getJwtTimeClaims({ iat: 0 }, 0)[0].state).toBe('normal')
    expect(getJwtTimeClaims(null)).toEqual([])
  })
})
