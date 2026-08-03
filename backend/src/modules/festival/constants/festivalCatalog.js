export const FESTIVAL_CATEGORIES = ['legal-holiday', 'make-up-workday', 'traditional', 'solar-term', 'national', 'industry', 'international', 'social', 'birthday']

// 该目录覆盖公共常用纪念日；地方性、临时设立日期由管理员在后台补充。
export const FIXED_FESTIVALS = [
  ['元旦', 1, 1, 'social', true], ['世界湿地日', 2, 2, 'international'], ['情人节', 2, 14, 'social'],
  ['国际妇女节', 3, 8, 'national'], ['植树节', 3, 12, 'national'], ['消费者权益日', 3, 15, 'national'],
  ['世界水日', 3, 22, 'international'], ['世界气象日', 3, 23, 'international'], ['愚人节', 4, 1, 'social'],
  ['世界卫生日', 4, 7, 'international'], ['世界读书日', 4, 23, 'international'], ['世界地球日', 4, 22, 'international'],
  ['劳动节', 5, 1, 'national', true], ['青年节', 5, 4, 'national'], ['护士节', 5, 12, 'industry'],
  ['国际博物馆日', 5, 18, 'international'], ['儿童节', 6, 1, 'national'], ['世界环境日', 6, 5, 'international'],
  ['世界献血者日', 6, 14, 'international'], ['建党节', 7, 1, 'national'], ['建军节', 8, 1, 'national'],
  ['中国医师节', 8, 19, 'industry'], ['教师节', 9, 10, 'national'], ['国际和平日', 9, 21, 'international'],
  ['烈士纪念日', 9, 30, 'national'], ['国庆节', 10, 1, 'national', true], ['世界粮食日', 10, 16, 'international'],
  ['联合国日', 10, 24, 'international'], ['记者节', 11, 8, 'industry'], ['消防宣传日', 11, 9, 'national'],
  ['世界艾滋病日', 12, 1, 'international'], ['国家宪法日', 12, 4, 'national'], ['南京大屠杀死难者国家公祭日', 12, 13, 'national'], ['圣诞节', 12, 25, 'social']
].map(([name, month, day, category, isMajor = false]) => ({ name, month, day, category, isMajor }))
