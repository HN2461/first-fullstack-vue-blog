import { webcrypto } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { chooseItem, generatePassword, generateUuids, rollDice, secureRandomIndex, simulateCoins } from './randomTools'

const zeros = { getRandomValues: (buffer) => {
  buffer.fill(0)
  return buffer
} }

describe('工具箱安全随机与执行参数', () => {
  it('拒绝采样会丢弃导致取模偏差的尾部值', () => {
    const samples = [0xffffffff, 17]
    const provider = { getRandomValues: (buffer) => {
      buffer[0] = samples.shift()
      return buffer
    } }
    expect(secureRandomIndex(10, provider)).toBe(7)
    expect(samples).toEqual([])
    expect(secureRandomIndex(1, zeros)).toBe(0)
  })

  it('最低长度密码仍覆盖全部已选字符，单类密码只使用所选字符', () => {
    const value = generatePassword({ length: 8 }, zeros)
    expect(value).toHaveLength(8)
    expect(value).toMatch(/[A-Z]/)
    expect(value).toMatch(/[a-z]/)
    expect(value).toMatch(/[2-9]/)
    expect(value).toMatch(/[!@#$%^&*_=+?\-]/)
    expect(generatePassword({ length: 128, includeUpper: false, includeLower: false, includeSymbol: false }, zeros)).toMatch(/^[2-9]{128}$/)
    expect(() => generatePassword({ length: 8, includeUpper: false, includeLower: false, includeNumber: false, includeSymbol: false }, zeros)).toThrow('至少选择')
  })

  it.each([null, '', NaN, Infinity, 0, -1, 1.2, 7, 129])('不自动修正密码非法长度 %s', (length) => {
    expect(() => generatePassword({ length }, zeros)).toThrow()
  })

  it('UUID 正确设置 v4 与变体位，并支持受控批量', () => {
    expect(generateUuids(1, zeros)).toEqual(['00000000-0000-4000-8000-000000000000'])
    const values = generateUuids(1000, webcrypto)
    expect(new Set(values).size).toBe(1000)
    expect(values.every((value) => /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(value))).toBe(true)
    for (const count of [null, 0, 1.5, 1001]) expect(() => generateUuids(count, zeros)).toThrow()
  })

  it('候选项忽略空行，保留重复行，并限制输入数量', () => {
    expect(chooseItem('  甲  \r\n\r\n甲\n乙', zeros)).toEqual({ value: '甲', count: 3 })
    expect(() => chooseItem(' \n ', zeros)).toThrow('至少一个')
    expect(() => chooseItem(Array(10001).fill('甲').join('\n'), zeros)).toThrow('10000')
  })

  it('骰子边界与总点数使用实际参数，不接受空值或小数', () => {
    expect(rollDice({ sides: 100, count: 20 }, zeros)).toMatchObject({ sides: 100, count: 20, total: 20 })
    for (const options of [{ sides: null, count: 1 }, { sides: 6.2, count: 1 }, { sides: 1, count: 1 }, { sides: 6, count: null }, { sides: 6, count: 21 }]) expect(() => rollDice(options, zeros)).toThrow()
  })

  it('硬币统计返回绑定执行次数的快照，最大批量不超过 Crypto 配额', () => {
    const alternating = { getRandomValues: (buffer) => {
      for (let i = 0; i < buffer.length; i += 1) buffer[i] = i % 2
      return buffer
    } }
    expect(simulateCoins(10000, alternating)).toEqual({ total: 10000, heads: 5000, tails: 5000 })
    expect(simulateCoins(1, zeros)).toEqual({ total: 1, heads: 0, tails: 1 })
    for (const count of [null, '', 0, -1, 1.5, 10001]) expect(() => simulateCoins(count, zeros)).toThrow()
  })

  it('没有安全随机源时明确失败，不使用弱随机兜底', () => {
    expect(() => secureRandomIndex(6, {})).toThrow('安全随机数')
    expect(() => generateUuids(1, {})).toThrow('安全随机数')
  })
})
