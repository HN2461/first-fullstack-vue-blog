import { describe, expect, it } from 'vitest'
import { calculateBmi, calculateDiscount, calculateGrowth, calculateRatio, calculateShare } from './calculationTools'

describe('工具箱精确十进制计算', () => {
  it('优惠按金额分币守恒处理半分，避免浮点和前后金额不一致', () => {
    expect(calculateDiscount('0.10', '20')).toEqual({ price: '0.08', saved: '0.02' })
    expect(calculateDiscount('0.01', '50')).toEqual({ price: '0.01', saved: '0.00' })
    expect(calculateDiscount('100', '100')).toEqual({ price: '0.00', saved: '100.00' })
    expect(calculateDiscount('9007199254740993.00', '10')).toEqual({ price: '8106479329266893.70', saved: '900719925474099.30' })
    expect(() => calculateDiscount('0.001', 20)).toThrow('两位小数')
    expect(() => calculateDiscount(100, 101)).toThrow('100%')
  })

  it('占比与增长率分别覆盖零、超百分比、下降与正基数口径', () => {
    expect(calculateShare('1', '3')).toBe('33.33')
    expect(calculateShare('0', '10')).toBe('0.00')
    expect(calculateShare('3', '2')).toBe('150.00')
    expect(calculateGrowth('100', '120')).toBe('20.00')
    expect(calculateGrowth('100', '80')).toBe('-20.00')
    expect(calculateGrowth('100', '-50')).toBe('-150.00')
    expect(() => calculateGrowth('0', '10')).toThrow('大于 0')
    expect(() => calculateGrowth('-10', '10')).toThrow('大于 0')
    expect(() => calculateShare(1, 0)).toThrow('大于 0')
  })

  it('比例可精确处理小数与大整数，零与负除数明确失败', () => {
    expect(calculateRatio('16', '9', '1920')).toBe('1080.00')
    expect(calculateRatio('0.3', '0.1', '0.9')).toBe('0.30')
    expect(calculateRatio('.5', '1', '2')).toBe('4.00')
    expect(calculateRatio('1', '0', '0')).toBe('0.00')
    expect(calculateRatio('1', '1', '9007199254740993')).toBe('9007199254740993.00')
    expect(() => calculateRatio('0', '1', '2')).toThrow()
    expect(() => calculateRatio('-1', '1', '2')).toThrow()
  })

  it('BMI 分类使用原值而非显示值，不允许空身高导致 Infinity', () => {
    expect(calculateBmi('175', '65')).toEqual({ bmi: '21.2', level: '正常' })
    expect(calculateBmi('100', '23.95')).toEqual({ bmi: '24.0', level: '正常' })
    expect(calculateBmi('100', '24')).toEqual({ bmi: '24.0', level: '偏高' })
    expect(() => calculateBmi('0', '65')).toThrow()
    expect(() => calculateBmi('', '65')).toThrow()
    expect(() => calculateBmi('3000', '65')).toThrow('单位')
  })

  it.each([null, undefined, '', ' ', NaN, Infinity, '-Infinity', '12abc', '0x10', true, '1e101'])('拒绝不完整或非法数值 %s', (value) => {
    expect(() => calculateRatio(value, 1, 1)).toThrow()
    expect(() => calculateBmi(175, value)).toThrow()
  })
})
