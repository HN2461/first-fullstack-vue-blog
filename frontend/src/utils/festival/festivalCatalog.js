export const MAJOR_FESTIVAL_LABEL = '元旦、春节、清明、劳动节、端午、中秋、国庆和生日'

export const SOLAR_FESTIVALS = [
  {
    key: 'new-year',
    name: '元旦',
    type: 'solar',
    month: 1,
    day: 1,
    effect: 'new-year',
    level: 'major',
    icons: ['🎆', '✨'],
    greetings: ['新年快乐，愿今天是清亮的新开始。', '新的一年，愿计划都有回响，热爱都有去处。']
  },
  {
    key: 'valentine',
    name: '情人节',
    type: 'solar',
    month: 2,
    day: 14,
    effect: 'love',
    level: 'normal',
    icons: ['💗', '🌹'],
    greetings: ['愿今天有温柔相伴。', '愿被惦记的人，也正好惦记着你。']
  },
  {
    key: 'women-day',
    name: '妇女节',
    type: 'solar',
    month: 3,
    day: 8,
    effect: 'love',
    level: 'normal',
    icons: ['🌷', '✨'],
    greetings: ['愿每一份独立、热爱和选择都被认真尊重。', '愿你自在有光，步履从容。']
  },
  {
    key: 'arbor-day',
    name: '植树节',
    type: 'solar',
    month: 3,
    day: 12,
    effect: 'labor',
    level: 'normal',
    icons: ['🌱', '🌿'],
    greetings: ['种下一点绿色，也给明天留一点耐心。', '愿新的生长，从今天悄悄开始。']
  },
  {
    key: 'labor',
    name: '劳动节',
    type: 'solar',
    month: 5,
    day: 1,
    effect: 'labor',
    level: 'major',
    icons: ['🌿', '✨'],
    greetings: ['劳动节快乐，愿努力被看见，也愿休息被允许。', '致敬每一份认真生活的力气。']
  },
  {
    key: 'youth-day',
    name: '青年节',
    type: 'solar',
    month: 5,
    day: 4,
    effect: 'new-year',
    level: 'normal',
    icons: ['🔥', '✨'],
    greetings: ['愿热望不被磨平，行动始终有方向。', '愿你心里有火，眼里有路。']
  },
  {
    key: 'children-day',
    name: '儿童节',
    type: 'solar',
    month: 6,
    day: 1,
    effect: 'new-year',
    level: 'normal',
    icons: ['🎈', '✨'],
    greetings: ['愿童心不散场，快乐有回声。', '愿今天轻一点，甜一点。']
  },
  {
    key: 'party-day',
    name: '建党节',
    type: 'solar',
    month: 7,
    day: 1,
    effect: 'national',
    level: 'normal',
    icons: ['⭐', '✨'],
    greetings: ['不忘初心，继续向前。', '愿山河常新，理想常青。']
  },
  {
    key: 'army-day',
    name: '建军节',
    type: 'solar',
    month: 8,
    day: 1,
    effect: 'national',
    level: 'normal',
    icons: ['⭐', '🛡️'],
    greetings: ['致敬守护，愿山河无恙。', '愿平安常在，热血长明。']
  },
  {
    key: 'teacher-day',
    name: '教师节',
    type: 'solar',
    month: 9,
    day: 10,
    effect: 'new-year',
    level: 'normal',
    icons: ['📖', '✨'],
    greetings: ['师恩难忘，愿每一份点亮都被温柔记得。', '感谢引路，愿桃李有光。']
  },
  {
    key: 'national-day',
    name: '国庆节',
    type: 'solar',
    month: 10,
    day: 1,
    effect: 'national',
    level: 'major',
    icons: ['🇨🇳', '🎉'],
    greetings: ['山河锦绣，国泰民安。', '愿家国同庆，万事从容。']
  },
  {
    key: 'christmas',
    name: '圣诞节',
    type: 'solar',
    month: 12,
    day: 25,
    effect: 'christmas',
    level: 'normal',
    icons: ['🎄', '❄️'],
    greetings: ['愿冬夜有暖意。', '愿今天有灯火，也有一点小小的惊喜。']
  }
]

export const LUNAR_FESTIVAL_META = {
  春节: {
    key: 'spring-festival',
    name: '春节',
    effect: 'spring',
    level: 'major',
    icons: ['🏮', '🧧'],
    greetings: ['新春快乐，万事顺遂。', '愿新岁烟火暖，所行皆坦途。']
  },
  除夕: {
    key: 'new-year-eve-lunar',
    name: '除夕',
    effect: 'spring',
    level: 'major',
    icons: ['🏮', '🧧'],
    greetings: ['岁除夜暖，愿团圆抵达。', '辞旧迎新，愿这一年圆满收束。']
  },
  元宵节: {
    key: 'lantern',
    name: '元宵节',
    effect: 'lantern',
    level: 'normal',
    icons: ['🏮', '✨'],
    greetings: ['灯火团圆，元宵喜乐。', '愿月圆人安，诸事顺意。']
  },
  春龙节: {
    key: 'dragon-head',
    name: '龙抬头',
    effect: 'duanwu',
    level: 'normal',
    icons: ['🌿', '✨'],
    greetings: ['二月二，愿抬头见喜，万事有生机。', '愿春意抬头，好事也抬头。']
  },
  '百花生日(花朝节)': {
    key: 'flower-festival',
    name: '花朝节',
    effect: 'love',
    level: 'normal',
    icons: ['🌸', '✨'],
    greetings: ['花朝晴好，愿日子也开得热烈。', '愿万物有期，你也有光。']
  },
  上巳节: {
    key: 'shangsi',
    name: '上巳节',
    effect: 'qingming',
    level: 'normal',
    icons: ['🌿', '✨'],
    greetings: ['春水初生，愿心绪清朗。', '愿一身轻快，向春而行。']
  },
  寒食节: {
    key: 'cold-food',
    name: '寒食节',
    effect: 'qingming',
    level: 'normal',
    icons: ['🌿', '☔'],
    greetings: ['寒食将至，愿思念温和安放。', '愿春色清明，心事有归处。']
  },
  端午节: {
    key: 'dragon-boat',
    name: '端午节',
    effect: 'duanwu',
    level: 'major',
    icons: ['🥟', '🌿'],
    greetings: ['端午安康。', '粽叶飘香，愿平安常在。']
  },
  乞巧节: {
    key: 'qixi',
    name: '七夕',
    effect: 'qixi',
    level: 'normal',
    icons: ['✨', '💫'],
    greetings: ['愿星河有约，心意有回声。', '七夕快乐，愿温柔被好好珍惜。']
  },
  中元: {
    key: 'ghost-festival',
    name: '中元节',
    effect: 'qingming',
    level: 'normal',
    icons: ['🕯️', '🌙'],
    greetings: ['慎终追远，愿心有安处。', '愿思念被温柔照亮。']
  },
  中秋节: {
    key: 'mid-autumn',
    name: '中秋节',
    effect: 'mid-autumn',
    level: 'major',
    icons: ['🥮', '🌕'],
    greetings: ['月满人团圆。', '中秋快乐，愿清辉照见归途。']
  },
  重阳节: {
    key: 'double-ninth',
    name: '重阳节',
    effect: 'chongyang',
    level: 'normal',
    icons: ['🍂', '🌼'],
    greetings: ['岁岁重阳，久久安康。', '登高望远，愿长辈安康，日子舒展。']
  },
  寒衣节: {
    key: 'winter-clothes',
    name: '寒衣节',
    effect: 'winter',
    level: 'normal',
    icons: ['🕯️', '❄️'],
    greetings: ['天渐寒，愿所念之人皆被温柔记得。', '寄一份牵挂，愿心里有暖。']
  },
  下元节: {
    key: 'xiayuan',
    name: '下元节',
    effect: 'winter',
    level: 'normal',
    icons: ['🌙', '✨'],
    greetings: ['下元水润，愿忧烦渐平。', '愿岁末将近，心事渐清。']
  },
  腊八节: {
    key: 'laba',
    name: '腊八节',
    effect: 'winter',
    level: 'normal',
    icons: ['🥣', '❄️'],
    greetings: ['腊八粥暖，年味渐近。', '愿一碗热粥，熨平冬日的冷。']
  },
  官家送灶: {
    key: 'little-new-year-north',
    name: '北方小年',
    effect: 'spring',
    level: 'normal',
    icons: ['🏮', '✨'],
    greetings: ['小年纳福，愿归家的路越来越近。', '扫尘迎新，愿好事入门。']
  },
  民间送灶: {
    key: 'little-new-year-south',
    name: '南方小年',
    effect: 'spring',
    level: 'normal',
    icons: ['🏮', '✨'],
    greetings: ['小年快乐，愿灶火温暖，岁末安然。', '辞旧迎新，愿家中有暖。']
  }
}

export const EFFECT_META = {
  spring: { accent: '#c2410c', tint: '#fff1f2', particle: ['🏮', '🧧', '✨'] },
  lantern: { accent: '#dc2626', tint: '#fff1f2', particle: ['🏮', '✨'] },
  duanwu: { accent: '#15803d', tint: '#f0fdf4', particle: ['🥟', '🌿'] },
  'mid-autumn': { accent: '#b45309', tint: '#fffbeb', particle: ['🥮', '🌕', '✨'] },
  national: { accent: '#dc2626', tint: '#fff1f2', particle: ['🇨🇳', '🎉', '✨'] },
  christmas: { accent: '#0f766e', tint: '#ecfdf5', particle: ['🎄', '❄️'] },
  love: { accent: '#db2777', tint: '#fdf2f8', particle: ['💗', '🌹'] },
  qixi: { accent: '#7c3aed', tint: '#f5f3ff', particle: ['✨', '💫'] },
  qingming: { accent: '#4d7c0f', tint: '#f7fee7', particle: ['🌿', '☔'] },
  winter: { accent: '#0369a1', tint: '#eff6ff', particle: ['❄️', '🥟'] },
  labor: { accent: '#047857', tint: '#ecfdf5', particle: ['🌿', '✨'] },
  chongyang: { accent: '#b45309', tint: '#fffbeb', particle: ['🍂', '🌼'] },
  'new-year': { accent: '#2563eb', tint: '#eff6ff', particle: ['🎆', '✨'] },
  'solar-term': { accent: '#0f766e', tint: '#ecfdf5', particle: ['🌿', '✨'] },
  'term-spring': { accent: '#16a34a', tint: '#f0fdf4', particle: ['🌱', '🌿', '✨'] },
  'term-summer': { accent: '#ca8a04', tint: '#fefce8', particle: ['☀️', '🍃', '✨'] },
  'term-autumn': { accent: '#b45309', tint: '#fffbeb', particle: ['🍂', '🍁', '✨'] },
  'term-winter': { accent: '#0369a1', tint: '#eff6ff', particle: ['❄️', '✨'] },
  'lunar-folk': { accent: '#7c3aed', tint: '#f5f3ff', particle: ['🌙', '✨'] },
  birthday: { accent: '#db2777', tint: '#fdf2f8', particle: ['🎂', '💗', '🎉'] }
}
