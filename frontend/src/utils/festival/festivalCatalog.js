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
    icons: ['🎊', '🧨', '✨'],
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
  qixi: { accent: '#c2410c', tint: '#fff7ed', particle: ['💗', '🌹', '🎊'] },
  qingming: { accent: '#4d7c0f', tint: '#f7fee7', particle: ['🌿', '☔'] },
  winter: { accent: '#0369a1', tint: '#eff6ff', particle: ['❄️', '🥟'] },
  labor: { accent: '#047857', tint: '#ecfdf5', particle: ['🌿', '✨'] },
  chongyang: { accent: '#b45309', tint: '#fffbeb', particle: ['🍂', '🌼'] },
  'new-year': { accent: '#c2410c', tint: '#fff7ed', particle: ['🎊', '🧨', '✨'] },
  'solar-term': { accent: '#0f766e', tint: '#ecfdf5', particle: ['🌿', '✨'] },
  'term-spring': { accent: '#16a34a', tint: '#f0fdf4', particle: ['🌱', '🌿', '✨'] },
  'term-summer': { accent: '#ca8a04', tint: '#fefce8', particle: ['☀️', '🍃', '✨'] },
  'term-autumn': { accent: '#b45309', tint: '#fffbeb', particle: ['🍂', '🍁', '✨'] },
  'term-winter': { accent: '#0369a1', tint: '#eff6ff', particle: ['❄️', '✨'] },
  'lunar-folk': { accent: '#b45309', tint: '#fffbeb', particle: ['🌙', '🏮', '✨'] },
  birthday: { accent: '#db2777', tint: '#fdf2f8', particle: ['🎂', '💗', '🎉'] }
}

// Each atmosphere has a distinct motion language so the same falling-emoji
// animation is not reused for every holiday. The values stay lightweight and
// are consumed by both the ambient layer and the celebration confetti.
const ATMOSPHERE_PROFILES = {
  spring: { theme: 'lantern', secondary: '#f59e0b', particleCount: 12, duration: 17, drift: 28, glow: 'rgba(220, 38, 38, .18)', confettiColors: ['#b91c1c', '#dc2626', '#f59e0b'] },
  lantern: { theme: 'lantern', secondary: '#fbbf24', particleCount: 10, duration: 15, drift: 18, glow: 'rgba(245, 158, 11, .2)', confettiColors: ['#dc2626', '#f59e0b', '#fef3c7'] },
  'new-year-eve': { theme: 'night-fire', secondary: '#f59e0b', particleCount: 8, duration: 19, drift: 16, glow: 'rgba(245, 158, 11, .16)', confettiColors: ['#991b1b', '#f59e0b', '#fef3c7'] },
  'mid-autumn': { theme: 'moon', secondary: '#fbbf24', particleCount: 8, duration: 21, drift: 12, glow: 'rgba(251, 191, 36, .18)', confettiColors: ['#b45309', '#f59e0b', '#fef3c7'] },
  qixi: { theme: 'starfield', secondary: '#a78bfa', particleCount: 9, duration: 23, drift: 10, glow: 'rgba(124, 58, 237, .16)', confettiColors: ['#7c3aed', '#db2777', '#f5d0fe'] },
  national: { theme: 'radiant', secondary: '#fbbf24', particleCount: 10, duration: 16, drift: 20, glow: 'rgba(220, 38, 38, .18)', confettiColors: ['#b91c1c', '#dc2626', '#fbbf24'] },
  'new-year': { theme: 'spark', secondary: '#f59e0b', particleCount: 10, duration: 14, drift: 26, glow: 'rgba(234, 88, 12, .18)', confettiColors: ['#c2410c', '#f59e0b', '#fef3c7'] },
  duanwu: { theme: 'river', secondary: '#0f766e', particleCount: 8, duration: 24, drift: 14, glow: 'rgba(15, 118, 110, .14)', confettiColors: ['#15803d', '#0f766e', '#bef264'] },
  qingming: { theme: 'drizzle', secondary: '#60a5fa', particleCount: 8, duration: 26, drift: 8, glow: 'rgba(14, 116, 144, .12)', confettiColors: ['#4d7c0f', '#0f766e', '#bae6fd'] },
  christmas: { theme: 'snow', secondary: '#ef4444', particleCount: 12, duration: 20, drift: 30, glow: 'rgba(15, 118, 110, .16)', confettiColors: ['#0f766e', '#dc2626', '#f8fafc'] },
  winter: { theme: 'snow', secondary: '#38bdf8', particleCount: 10, duration: 24, drift: 24, glow: 'rgba(3, 105, 161, .14)', confettiColors: ['#0369a1', '#38bdf8', '#f8fafc'] },
  chongyang: { theme: 'autumn', secondary: '#f97316', particleCount: 9, duration: 22, drift: 34, glow: 'rgba(180, 83, 9, .16)', confettiColors: ['#b45309', '#f97316', '#facc15'] },
  labor: { theme: 'breeze', secondary: '#84cc16', particleCount: 8, duration: 25, drift: 42, glow: 'rgba(4, 120, 87, .12)', confettiColors: ['#047857', '#84cc16', '#fef08a'] },
  love: { theme: 'petal', secondary: '#f9a8d4', particleCount: 9, duration: 20, drift: 28, glow: 'rgba(219, 39, 119, .16)', confettiColors: ['#db2777', '#fb7185', '#fbcfe8'] },
  birthday: { theme: 'balloon', secondary: '#fbbf24', particleCount: 10, duration: 18, drift: 22, glow: 'rgba(219, 39, 119, .16)', confettiColors: ['#db2777', '#f59e0b', '#34d399'] },
  'solar-term': { theme: 'breeze', secondary: '#5eead4', particleCount: 7, duration: 27, drift: 36, glow: 'rgba(15, 118, 110, .12)', confettiColors: ['#0f766e', '#16a34a', '#a7f3d0'] },
  'term-spring': { theme: 'breeze', secondary: '#86efac', particleCount: 8, duration: 24, drift: 38, glow: 'rgba(22, 163, 74, .12)', confettiColors: ['#16a34a', '#84cc16', '#dcfce7'] },
  'term-summer': { theme: 'spark', secondary: '#fde047', particleCount: 7, duration: 22, drift: 24, glow: 'rgba(202, 138, 4, .16)', confettiColors: ['#ca8a04', '#f59e0b', '#fef08a'] },
  'term-autumn': { theme: 'autumn', secondary: '#fbbf24', particleCount: 8, duration: 23, drift: 36, glow: 'rgba(180, 83, 9, .14)', confettiColors: ['#b45309', '#f97316', '#fde68a'] },
  'term-winter': { theme: 'snow', secondary: '#bae6fd', particleCount: 9, duration: 25, drift: 26, glow: 'rgba(3, 105, 161, .12)', confettiColors: ['#0369a1', '#7dd3fc', '#f8fafc'] },
  'lunar-folk': { theme: 'moon', secondary: '#fbbf24', particleCount: 7, duration: 24, drift: 16, glow: 'rgba(180, 83, 9, .12)', confettiColors: ['#b45309', '#f59e0b', '#fef3c7'] },
  'system-broadcast': { theme: 'spark', secondary: '#fbbf24', particleCount: 8, duration: 20, drift: 24, glow: 'rgba(37, 99, 235, .14)', confettiColors: ['#2563eb', '#7c3aed', '#fbbf24'] },
  fireworks: { theme: 'fireworks', secondary: '#fbbf24', particleCount: 11, duration: 13, drift: 22, glow: 'rgba(234, 88, 12, .2)', confettiColors: ['#c2410c', '#f59e0b', '#fef3c7'] },
  blossom: { theme: 'petal', secondary: '#f9a8d4', particleCount: 10, duration: 22, drift: 30, glow: 'rgba(219, 39, 119, .14)', confettiColors: ['#db2777', '#fb7185', '#fbcfe8'] },
  playful: { theme: 'balloon', secondary: '#38bdf8', particleCount: 11, duration: 17, drift: 25, glow: 'rgba(234, 88, 12, .15)', confettiColors: ['#ea580c', '#38bdf8', '#facc15'] },
  tribute: { theme: 'candle', secondary: '#94a3b8', particleCount: 5, duration: 28, drift: 8, glow: 'rgba(71, 85, 105, .12)', confettiColors: ['#475569', '#94a3b8', '#e2e8f0'] },
  growth: { theme: 'breeze', secondary: '#86efac', particleCount: 9, duration: 26, drift: 40, glow: 'rgba(22, 163, 74, .14)', confettiColors: ['#15803d', '#84cc16', '#dcfce7'] },
  harvest: { theme: 'autumn', secondary: '#fbbf24', particleCount: 8, duration: 23, drift: 32, glow: 'rgba(180, 83, 9, .14)', confettiColors: ['#b45309', '#f59e0b', '#fde68a'] },
  honor: { theme: 'radiant', secondary: '#fbbf24', particleCount: 8, duration: 20, drift: 14, glow: 'rgba(185, 28, 28, .14)', confettiColors: ['#991b1b', '#dc2626', '#fbbf24'] },
  'dragon-boat': { theme: 'river', secondary: '#2dd4bf', particleCount: 9, duration: 25, drift: 16, glow: 'rgba(15, 118, 110, .14)', confettiColors: ['#15803d', '#0f766e', '#5eead4'] }
}

const FESTIVAL_NAME_ATMOSPHERES = {
  春节: 'spring',
  元宵: 'lantern',
  除夕: 'new-year-eve',
  元宵节: 'lantern',
  七夕: 'qixi',
  端午节: 'duanwu',
  端午: 'dragon-boat',
  清明节: 'qingming',
  清明: 'qingming',
  中秋节: 'mid-autumn',
  国庆节: 'national',
  圣诞节: 'christmas',
  重阳节: 'chongyang',
  元旦: 'fireworks',
  情人节: 'blossom',
  妇女节: 'blossom',
  国际妇女节: 'blossom',
  植树节: 'growth',
  劳动节: 'labor',
  儿童节: 'playful',
  青年节: 'fireworks',
  建党节: 'honor',
  建军节: 'honor',
  教师节: 'blossom',
  烈士纪念日: 'tribute',
  南京大屠杀死难者国家公祭日: 'tribute',
  世界粮食日: 'harvest',
  生日: 'birthday',
  生日快乐: 'birthday'
}

const FESTIVAL_NAME_VISUALS = {
  元旦: { effect: 'new-year', icons: ['🥂', '🧨', '✨'], accent: '#c2410c', tint: '#fff7ed' },
  春节: { effect: 'spring', icons: ['🐲', '🧧', '🎊'], accent: '#b91c1c', tint: '#fff1f2' },
  除夕: { effect: 'spring', icons: ['🌙', '🧨', '🍲'], accent: '#b91c1c', tint: '#fff1f2' },
  元宵节: { effect: 'lantern', icons: ['🏮', '🍡', '🌕'], accent: '#dc2626', tint: '#fff1f2' },
  情人节: { effect: 'love', icons: ['💗', '🌹', '🎁'], accent: '#db2777', tint: '#fdf2f8' },
  妇女节: { effect: 'love', icons: ['🌷', '💐', '✨'], accent: '#db2777', tint: '#fdf2f8' },
  植树节: { effect: 'labor', icons: ['🌱', '🌿', '🌳'], accent: '#15803d', tint: '#f0fdf4' },
  清明节: { effect: 'qingming', icons: ['🪦', '☔', '🕊️'], accent: '#4d7c0f', tint: '#f7fee7' },
  劳动节: { effect: 'labor', icons: ['🎉', '🛠️', '🌿'], accent: '#047857', tint: '#ecfdf5' },
  青年节: { effect: 'labor', icons: ['🔥', '🚩', '✨'], accent: '#c2410c', tint: '#fff7ed' },
  儿童节: { effect: 'love', icons: ['🎈', '🎁', '🎉'], accent: '#ea580c', tint: '#fff7ed' },
  建党节: { effect: 'national', icons: ['⭐', '🚩', '🎉'], accent: '#b91c1c', tint: '#fff1f2' },
  建军节: { effect: 'national', icons: ['⭐', '🛡️', '🎖️'], accent: '#b91c1c', tint: '#fff1f2' },
  教师节: { effect: 'love', icons: ['📖', '🍎', '💐'], accent: '#c2410c', tint: '#fff7ed' },
  国庆节: { effect: 'national', icons: ['🇨🇳', '🎉', '🎊'], accent: '#dc2626', tint: '#fff1f2' },
  世界湿地日: { effect: 'solar-term', icons: ['🪷', '🦆', '🌿'], accent: '#0f766e', tint: '#ecfdf5' },
  国际妇女节: { effect: 'love', icons: ['🌷', '💐', '✨'], accent: '#db2777', tint: '#fdf2f8' },
  消费者权益日: { effect: 'national', icons: ['⚖️', '🛡️', '✅'], accent: '#2563eb', tint: '#eff6ff' },
  世界水日: { effect: 'solar-term', icons: ['💧', '🌊', '🌍'], accent: '#2563eb', tint: '#eff6ff' },
  世界气象日: { effect: 'solar-term', icons: ['🌦️', '🌤️', '🌍'], accent: '#0f766e', tint: '#ecfdf5' },
  愚人节: { effect: 'love', icons: ['🤡', '🎭', '✨'], accent: '#7c3aed', tint: '#f5f3ff' },
  世界卫生日: { effect: 'national', icons: ['🩺', '🫶', '🌍'], accent: '#0f766e', tint: '#ecfdf5' },
  世界读书日: { effect: 'love', icons: ['📚', '📖', '✨'], accent: '#c2410c', tint: '#fff7ed' },
  世界地球日: { effect: 'solar-term', icons: ['🌍', '🌱', '♻️'], accent: '#15803d', tint: '#f0fdf4' },
  护士节: { effect: 'love', icons: ['🩹', '💗', '🩺'], accent: '#db2777', tint: '#fdf2f8' },
  国际博物馆日: { effect: 'love', icons: ['🏛️', '🖼️', '✨'], accent: '#b45309', tint: '#fffbeb' },
  世界环境日: { effect: 'solar-term', icons: ['🌳', '🌱', '♻️'], accent: '#15803d', tint: '#f0fdf4' },
  世界献血者日: { effect: 'national', icons: ['🩸', '❤️', '🫶'], accent: '#dc2626', tint: '#fff1f2' },
  中国医师节: { effect: 'national', icons: ['🩺', '⚕️', '🫶'], accent: '#2563eb', tint: '#eff6ff' },
  国际和平日: { effect: 'love', icons: ['🕊️', '☮️', '🌍'], accent: '#2563eb', tint: '#eff6ff' },
  烈士纪念日: { effect: 'national', icons: ['🕯️', '🌹', '🕊️'], accent: '#b91c1c', tint: '#fff1f2' },
  世界粮食日: { effect: 'labor', icons: ['🌾', '🍞', '🌍'], accent: '#b45309', tint: '#fffbeb' },
  联合国日: { effect: 'national', icons: ['🌐', '🕊️', '🤝'], accent: '#2563eb', tint: '#eff6ff' },
  记者节: { effect: 'labor', icons: ['📰', '🎙️', '📸'], accent: '#c2410c', tint: '#fff7ed' },
  消防宣传日: { effect: 'national', icons: ['🚒', '🧯', '🔥'], accent: '#dc2626', tint: '#fff1f2' },
  世界艾滋病日: { effect: 'national', icons: ['🎗️', '❤️', '🫶'], accent: '#dc2626', tint: '#fff1f2' },
  国家宪法日: { effect: 'national', icons: ['⚖️', '📜', '🛡️'], accent: '#2563eb', tint: '#eff6ff' },
  南京大屠杀死难者国家公祭日: { effect: 'national', icons: ['🕯️', '🕊️', '🌹'], accent: '#475569', tint: '#f1f5f9' },
  端午节: { effect: 'duanwu', icons: ['🚣', '🌿', '🐉'], accent: '#15803d', tint: '#f0fdf4' },
  七夕: { effect: 'qixi', icons: ['🧵', '🌌', '💫'], accent: '#c2410c', tint: '#fff7ed' },
  中秋节: { effect: 'mid-autumn', icons: ['🥮', '🌕', '🏮'], accent: '#b45309', tint: '#fffbeb' },
  重阳节: { effect: 'chongyang', icons: ['🧗', '🌼', '🍂'], accent: '#b45309', tint: '#fffbeb' },
  圣诞节: { effect: 'christmas', icons: ['🎄', '🎁', '🔔'], accent: '#0f766e', tint: '#ecfdf5' },
  网站首次成功部署纪念日: { effect: 'new-year', icons: ['🎊', '🎁', '🌟'], accent: '#c2410c', tint: '#fff7ed' }
}

const FESTIVAL_TYPE_VISUALS = {
  'legal-holiday': { effect: 'national', icons: ['🎉', '🎊', '✨'], accent: '#dc2626', tint: '#fff1f2' },
  'make-up-workday': { effect: 'labor', icons: ['💼', '📅', '✅'], accent: '#b45309', tint: '#fffbeb' },
  traditional: { effect: 'lunar-folk', icons: ['🏮', '🎊', '✨'], accent: '#b45309', tint: '#fffbeb' },
  'solar-term': { effect: 'solar-term', icons: ['🌿', '☀️', '🍃'], accent: '#0f766e', tint: '#ecfdf5' },
  national: { effect: 'national', icons: ['⭐', '🚩', '🎉'], accent: '#b91c1c', tint: '#fff1f2' },
  industry: { effect: 'labor', icons: ['🎉', '🏅', '✨'], accent: '#c2410c', tint: '#fff7ed' },
  international: { effect: 'national', icons: ['🌐', '🎉', '✨'], accent: '#2563eb', tint: '#eff6ff' },
  social: { effect: 'love', icons: ['🎉', '🎁', '✨'], accent: '#db2777', tint: '#fdf2f8' },
  birthday: { effect: 'birthday', icons: ['🎂', '🎁', '🎉'], accent: '#db2777', tint: '#fdf2f8' }
}

// The API returns the complete chinese-days festival names; map each lunar observance and solar term
// to its own subject icon so uncommon entries do not all inherit the lantern fallback.
const FESTIVAL_NAME_ICONS = {
  腊八节: '🥣', 官家送灶: '🍳', 民间送灶: '🧹', 接玉皇: '👑',
  封井: '🪣', 祭井神: '⛲', 贴春联: '📜', 迎财神: '💰',
  鸡日: '🐓', 犬日: '🐕', 猪日: '🐖', 羊日: '🐐', 牛日: '🐂', 马日: '🐎',
  元始天尊诞辰: '☯️', 孙天医诞辰: '🩺', 开市: '🏪', 路神诞辰: '🛣️',
  人日: '🧑', 送火神: '🔥', 谷日: '🌾', 阎王诞辰: '👹', 天日: '☀️',
  玉皇诞辰: '🎎', 地日: '🌍', 石头生日: '🪨', '上(试)灯日': '🪔', 上试灯日: '🪔',
  上灯日: '🎐', 关公升天日: '🎖️', 上元节: '🌕', 正灯日: '💡', 天官诞辰: '🎭', 落灯日: '🕯️',
  '天仓(填仓)节': '🏺', 天仓节: '🏺', 填仓节: '🏺', 太阳生日: '🌞', 春龙节: '🐉',
  土地公生日: '🏞️', 济公活佛生日: '🍶', 文昌帝君诞辰: '📚',
  '百花生日(花朝节)': '🌸', 花朝节: '🌸', 九天玄女诞辰: '🪶', 太上老君诞辰: '🎐',
  精忠岳王诞辰: '🛡️', 寒食节: '🍃', 观音菩萨诞辰: '🙏', 普贤菩萨诞辰: '🐘',
  上巳节: '🪭', 赵公元帅诞辰: '🪙', 泰山老母诞辰: '🧿', 祭雹神: '🌨️',
  文殊菩萨诞辰: '🦁', '浴佛节(龙华会)': '🪷', 浴佛节: '🪷', 龙华会: '🪷',
  蛇王诞辰: '🐍', 吕洞宾诞辰: '⚔️', 华佗诞辰: '🧪', '药王(神农)诞辰': '💊',
  药王诞辰: '💊', 神农诞辰: '🌱', 端午节: '🐉', 雨节: '🌧️', 黄帝诞辰: '🏯',
  半年节: '📅', 晒衣节: '👘', 观音菩萨得道: '☸️', 雷神诞辰: '⚡',
  荷花生日: '🌺', 关公诞辰: '🗡️', 祭海神: '🐚', 乞巧节: '🧵',
  '中元(鬼)节': '👻', 中元节: '👻', 地官诞辰: '🎑', 孟兰盆会: '🪷',
  西王母诞辰: '🍑', 棉花生日: '☁️', 诸葛亮诞辰: '🏹', 地藏菩萨诞辰: '🧎',
  天医节: '⚕️', 灶君生日: '🍲', 瑶池大会: '🍽️', 水稻生日: '🌽',
  孔子诞辰: '🎓', 观音菩萨出家: '🧘', 十月朝: '🧥', 寒衣节: '🧣',
  下元节: '💧', 水官诞辰: '🫗', 小年朝: '🧨', 破五日: '🎆',
  立春: '🌱', 雨水: '🌧️', 惊蛰: '⚡', 春分: '🌗', 清明: '🌿', 清明节: '🌿',
  谷雨: '🌾', 立夏: '☀️', 小满: '🍚', 芒种: '🚜', 夏至: '🌞', 小暑: '🌡️',
  大暑: '🧊', 立秋: '🍂', 处暑: '🍃', 白露: '💧', 秋分: '⚖️', 寒露: '🌫️',
  霜降: '🍁', 立冬: '🧣', 小雪: '🌨️', 大雪: '❄️', 冬至: '🥟', 小寒: '🧤', 大寒: '🥶'
}

const SYSTEM_BROADCAST_VISUALS = [
  { effect: 'new-year', icons: ['🎊', '🎁', '🌟'], accent: '#c2410c', tint: '#fff7ed' },
  { effect: 'spring', icons: ['🏮', '🧧', '🎉'], accent: '#b91c1c', tint: '#fff1f2' },
  { effect: 'love', icons: ['🎈', '💐', '✨'], accent: '#db2777', tint: '#fdf2f8' },
  { effect: 'national', icons: ['🎉', '🎊', '⭐'], accent: '#dc2626', tint: '#fff1f2' }
]

function visualIndex(value, length) {
  let hash = 0
  for (const char of String(value || '')) hash = (hash * 31 + char.charCodeAt(0)) % 1000003
  return hash % length
}

export function getFestivalVisual(name = '', type = '', effect = '') {
  const nameMatch = Object.entries(FESTIVAL_NAME_VISUALS).find(([key]) => String(name).includes(key))
  if (nameMatch) return nameMatch[1]
  const nameIcon = Object.entries(FESTIVAL_NAME_ICONS)
    .sort(([left], [right]) => right.length - left.length)
    .find(([key]) => String(name).includes(key))?.[1]
  if (nameIcon) {
    const visual = type === 'solar-term' ? EFFECT_META['solar-term'] : EFFECT_META['lunar-folk']
    return { ...visual, icons: [nameIcon] }
  }
  if (type === 'system-broadcast' || type === 'project') {
    return SYSTEM_BROADCAST_VISUALS[visualIndex(name, SYSTEM_BROADCAST_VISUALS.length)]
  }
  return FESTIVAL_TYPE_VISUALS[type] || EFFECT_META[effect] || EFFECT_META['new-year']
}

export function getFestivalAtmosphereProfile(festival = {}) {
  const name = String(festival.name || festival.displayName || '')
  const matchedName = Object.entries(FESTIVAL_NAME_ATMOSPHERES)
    .sort(([left], [right]) => right.length - left.length)
    .find(([key]) => name.includes(key))?.[1]
  const profile = ATMOSPHERE_PROFILES[matchedName || festival.effect] || ATMOSPHERE_PROFILES['new-year']
  return {
    ...profile,
    key: matchedName || festival.effect || 'new-year',
    particle: festival.particle?.length ? festival.particle : ['✨']
  }
}
