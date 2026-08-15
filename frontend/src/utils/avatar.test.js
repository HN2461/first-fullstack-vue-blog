import { describe, expect, it } from 'vitest'
import {
  getDefaultAvatar,
  getGenderLabel,
  getUserAvatar,
  normalizeGender
} from './avatar'

describe('avatar helpers', () => {
  it('normalizes missing and unsupported genders to unknown', () => {
    expect(normalizeGender()).toBe('unknown')
    expect(normalizeGender('not-supported')).toBe('unknown')
    expect(getGenderLabel('not-supported')).toBe('未知')
  })

  it('maps each supported gender to its default avatar asset', () => {
    expect(getDefaultAvatar('unknown')).toBe('/default-avatars/unknown.svg')
    expect(getDefaultAvatar('male')).toBe('/default-avatars/male.svg')
    expect(getDefaultAvatar('female')).toBe('/default-avatars/female.svg')
  })

  it('prefers a custom avatar while falling back by gender', () => {
    expect(getUserAvatar({ avatar: '/uploads/custom.png', gender: 'female' })).toBe('/uploads/custom.png')
    expect(getUserAvatar({ avatar: '', gender: 'male' })).toBe('/default-avatars/male.svg')
    expect(getUserAvatar({ gender: 'female' })).toBe('/default-avatars/female.svg')
  })
})
