export const ENTRANCE_EFFECT_FAMILY_MAP = {
  'fade-soft': 'minimal',
  'float-up': 'minimal',
  'slide-left': 'minimal',
  'slide-right': 'minimal',
  'scale-pop': 'minimal',
  'flip-3d': 'minimal',
  starlight: 'particle',
  'firework-bloom': 'particle',
  'particle-burst': 'particle',
  ripple: 'particle',
  'light-sweep': 'particle',
  'meteor-night': 'ambient',
  'shadow-sweep': 'ambient',
  'flash-open': 'ambient',
  curtain: 'ambient',
  shatter: 'impact',
  'color-burst': 'impact',
  shockwave: 'impact',
  'screen-shake': 'impact',
  petals: 'soft',
  snow: 'soft',
  glow: 'soft',
  fog: 'soft'
}

const countMap = {
  starlight: 86,
  'firework-bloom': 74,
  'particle-burst': 82,
  ripple: 12,
  'light-sweep': 22,
  'meteor-night': 34,
  'shadow-sweep': 14,
  'flash-open': 8,
  curtain: 16,
  shatter: 52,
  'color-burst': 78,
  shockwave: 18,
  'screen-shake': 26,
  petals: 46,
  snow: 76,
  glow: 20,
  fog: 18
}

export function getEntranceEffectFamily(effectKey) {
  return ENTRANCE_EFFECT_FAMILY_MAP[effectKey] || 'minimal'
}

export function createMinimalLines(effectKey) {
  const lineCount = effectKey === 'fade-soft' ? 6 : 10
  return createItems(lineCount, (index) => ({
    '--line-index': index,
    '--line-y': `${12 + index * (78 / lineCount)}vh`,
    '--line-delay': `${(index % 5) * 0.08}s`
  }))
}

export function createParticleItems(effectKey) {
  return createItems(countMap[effectKey] || 40, (index) => {
    const angle = (index * 137.5) % 360
    const radius = 16 + (index % 9) * 9
    const size = effectKey === 'starlight' ? 2 + (index % 3) : 5 + (index % 18)
    return {
      '--x': `${(index * 31) % 101}vw`,
      '--y': `${(index * 47) % 101}vh`,
      '--size': `${size}px`,
      '--delay': `${((index % 14) * 0.055).toFixed(3)}s`,
      '--angle': `${angle}deg`,
      '--radius': `${radius}vmin`,
      '--spin': `${index % 2 === 0 ? 1 : -1}`,
      '--color': pickColor(index)
    }
  })
}

export function createAmbientItems(effectKey) {
  return createItems(countMap[effectKey] || 18, (index) => ({
    '--x': `${(index * 43) % 101}vw`,
    '--y': `${(index * 29) % 82}vh`,
    '--size': `${18 + (index % 9) * 10}px`,
    '--delay': `${((index % 10) * 0.08).toFixed(2)}s`,
    '--angle': `${-34 + (index % 7) * 11}deg`,
    '--drift': `${index % 2 === 0 ? 120 : -120}px`
  }))
}

export function createImpactItems(effectKey) {
  return createItems(countMap[effectKey] || 40, (index) => ({
    '--x': `${(index * 19) % 101}vw`,
    '--y': `${(index * 41) % 101}vh`,
    '--size': `${8 + (index % 10) * 7}px`,
    '--delay': `${((index % 8) * 0.035).toFixed(3)}s`,
    '--angle': `${(index * 31) % 360}deg`,
    '--dx': `${(index % 2 === 0 ? 1 : -1) * (80 + (index % 11) * 18)}px`,
    '--dy': `${(index % 3 - 1) * (70 + (index % 7) * 16)}px`,
    '--radius': `${18 + (index % 9) * 10}vmin`,
    '--color': pickColor(index)
  }))
}

export function createSoftItems(effectKey) {
  return createItems(countMap[effectKey] || 30, (index) => ({
    '--x': `${(index * 37) % 101}vw`,
    '--y': `${-12 + (index % 12) * 9}vh`,
    '--size': `${8 + (index % 10) * 8}px`,
    '--delay': `${((index % 16) * 0.07).toFixed(2)}s`,
    '--drift': `${(index % 2 === 0 ? 1 : -1) * (26 + (index % 6) * 14)}px`,
    '--angle': `${(index * 23) % 360}deg`
  }))
}

function createItems(count, getStyle) {
  return Array.from({ length: count }, (_item, index) => ({
    id: index,
    style: getStyle(index)
  }))
}

function pickColor(index) {
  const colors = ['var(--entrance-tone)', 'var(--entrance-accent)', '#ffffff', '#f59e0b', '#38bdf8']
  return colors[index % colors.length]
}
