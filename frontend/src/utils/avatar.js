export const USER_GENDER_OPTIONS = [
  { value: 'unknown', label: '未知' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
]

const DEFAULT_AVATAR_PATHS = Object.freeze({
  unknown: '/default-avatars/unknown.svg',
  male: '/default-avatars/male.svg',
  female: '/default-avatars/female.svg'
})

export function normalizeGender(gender) {
  return Object.prototype.hasOwnProperty.call(DEFAULT_AVATAR_PATHS, gender) ? gender : 'unknown'
}

export function getDefaultAvatar(gender) {
  return DEFAULT_AVATAR_PATHS[normalizeGender(gender)]
}

export function getUserAvatar(user) {
  return user?.avatar || getDefaultAvatar(user?.gender)
}

export function getGenderLabel(gender) {
  return USER_GENDER_OPTIONS.find((item) => item.value === normalizeGender(gender))?.label || '未知'
}
