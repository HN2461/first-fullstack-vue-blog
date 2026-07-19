import chineseDays from 'chinese-days'

const { getLunarDate } = chineseDays

function isSolarBirthday(birthday, dateKey) {
  return birthday.slice(5) === dateKey.slice(5)
}

function isLunarBirthday(birthday, dateKey) {
  try {
    const birthLunar = getLunarDate(birthday)
    const currentLunar = getLunarDate(dateKey)
    return birthLunar.lunarMon === currentLunar.lunarMon && birthLunar.lunarDay === currentLunar.lunarDay
  } catch {
    return false
  }
}

/**
 * 判断业务日期是否为用户生日。
 * @param {string} birthday 用户保存一次的公历出生日期，格式为 YYYY-MM-DD。
 * @param {'solar'|'lunar'|'both'} calendar 用户选择的生日历法。
 * @param {string} dateKey 待判断的业务日期，格式为 YYYY-MM-DD。
 * @returns {boolean} 阳历或农历生日命中时返回 true；缺少或无效日期时返回 false。
 */
export function isBirthdayOnDate(birthday, calendar, dateKey) {
  if (!birthday || !dateKey) return false

  const observesSolar = calendar === 'solar' || calendar === 'both'
  const observesLunar = calendar === 'lunar' || calendar === 'both'
  return (observesSolar && isSolarBirthday(birthday, dateKey)) ||
    (observesLunar && isLunarBirthday(birthday, dateKey))
}
