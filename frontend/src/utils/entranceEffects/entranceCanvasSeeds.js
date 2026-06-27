import { createItems, random, TAU } from './entranceCanvasUtils'

export function seedScene(scene) {
  const { effectKey } = scene.options
  const count = window.innerWidth < 768 ? 150 : 320

  if (effectKey === 'starlight') {
    scene.items = createItems(count, () => ({
      x: random(scene.width),
      y: random(scene.height),
      z: 0.25 + Math.random() * 1.4,
      r: 0.7 + Math.random() * 2.4,
      twinkle: Math.random() * TAU,
      speed: 0.12 + Math.random() * 0.42
    }))
  } else if (['firework-bloom', 'particle-burst', 'color-burst'].includes(effectKey)) {
    const burstCount = effectKey === 'firework-bloom' ? 10 : effectKey === 'color-burst' ? 5 : 7
    scene.bursts = createItems(window.innerWidth < 768 ? Math.ceil(burstCount * 0.65) : burstCount, (index) => makeBurst(scene, index))
  } else if (effectKey === 'ripple' || effectKey === 'shockwave') {
    if (effectKey === 'ripple') {
      scene.items = createItems(window.innerWidth < 768 ? 16 : 26, (index) => ({
        x: scene.width * (0.16 + ((index * 37) % 72) / 100),
        y: scene.height * (0.18 + ((index * 53) % 66) / 100),
        r: (index % 5) * 20,
        speed: 2.2 + random(2.1),
        wobble: 0.72 + random(0.72),
        phase: random(TAU)
      }))
    } else {
      scene.items = createItems(window.innerWidth < 768 ? 8 : 14, (index) => ({
        x: scene.width * (0.5 + (Math.random() - 0.5) * 0.12),
        y: scene.height * (0.5 + (Math.random() - 0.5) * 0.1),
        r: index * 34,
        speed: 9 + index * 0.9,
        spokes: 20 + (index % 5) * 4,
        phase: random(TAU)
      }))
    }
  } else if (effectKey === 'light-sweep' || effectKey === 'shadow-sweep') {
    scene.items = createItems(effectKey === 'shadow-sweep' ? 9 : (window.innerWidth < 768 ? 22 : 42), (index) => ({
      x: effectKey === 'shadow-sweep' ? scene.width * (0.18 + index * 0.09) : -scene.width * (0.4 + Math.random()),
      y: effectKey === 'shadow-sweep' ? scene.height * (0.18 + ((index * 17) % 58) / 100) : scene.height * (0.03 + (index % 28) * 0.038),
      width: effectKey === 'shadow-sweep' ? scene.width * (0.08 + random(0.08)) : scene.width * (0.22 + Math.random() * 0.42),
      speed: effectKey === 'shadow-sweep' ? scene.width * (0.0012 + random(0.0016)) : scene.width * (0.005 + Math.random() * 0.008),
      alpha: effectKey === 'shadow-sweep' ? 0.18 + Math.random() * 0.28 : 0.25 + Math.random() * 0.55,
      angle: effectKey === 'shadow-sweep' ? 0.08 + Math.random() * 0.18 : -0.24 + Math.random() * 0.16
    }))
  } else if (effectKey === 'meteor-night') {
    scene.items = createItems(window.innerWidth < 768 ? 44 : 90, () => ({
      x: random(scene.width * 1.4),
      y: random(scene.height * 1.05) - scene.height * 0.32,
      length: 70 + Math.random() * 210,
      speed: 6 + Math.random() * 15,
      size: 0.8 + Math.random() * 1.8,
      wait: Math.random() * 70
    }))
  } else if (effectKey === 'shatter') {
    scene.items = createItems(window.innerWidth < 768 ? 110 : 220, () => makeShard(scene))
  } else if (effectKey === 'screen-shake') {
    scene.items = createItems(window.innerWidth < 768 ? 32 : 58, () => ({
      y: random(scene.height),
      height: 3 + random(18),
      shift: -60 + random(120),
      alpha: 0.1 + random(0.26)
    }))
  } else if (effectKey === 'petals') {
    scene.items = createItems(window.innerWidth < 768 ? 90 : 180, () => makeFalling(scene, 'petal'))
  } else if (effectKey === 'snow') {
    scene.items = createItems(window.innerWidth < 768 ? 150 : 320, () => makeFalling(scene, 'snow'))
  } else if (effectKey === 'glow') {
    scene.items = createItems(window.innerWidth < 768 ? 28 : 56, () => ({
      x: random(scene.width),
      y: random(scene.height),
      r: 28 + random(120),
      vx: -0.24 + random(0.48),
      vy: -0.18 + random(0.36),
      phase: random(TAU)
    }))
  } else if (effectKey === 'fog') {
    scene.items = createItems(window.innerWidth < 768 ? 24 : 46, () => ({
      x: random(scene.width),
      y: scene.height * (0.15 + random(0.72)),
      r: 90 + random(190),
      speed: 0.28 + random(0.62),
      phase: random(TAU)
    }))
  }
}

function makeBurst(scene, index) {
  const colorBurstColors = ['#ff1744', '#ff9100', '#ffd600', '#00e676', '#00b0ff', '#d500f9']
  const colors = scene.options.effectKey === 'color-burst'
    ? colorBurstColors
    : [scene.options.tone, scene.options.accent, '#ffffff', '#f59e0b', '#38bdf8', '#f472b6']
  return {
    x: scene.options.effectKey === 'color-burst'
      ? scene.width * (0.2 + (index % 3) * 0.3)
      : scene.width * (0.08 + Math.random() * 0.84),
    y: scene.options.effectKey === 'color-burst'
      ? scene.height * (0.22 + (index % 2) * 0.34)
      : scene.height * (0.12 + Math.random() * 0.66),
    delay: scene.options.effectKey === 'color-burst' ? index * 0.12 : index * 0.075,
    particles: createItems(scene.options.effectKey === 'firework-bloom' ? 130 : scene.options.effectKey === 'color-burst' ? 90 : 170, (particleIndex) => ({
      angle: scene.options.effectKey === 'color-burst'
        ? (Math.floor(particleIndex / 9) / 10) * TAU + random(0.08)
        : (particleIndex / 130) * TAU + random(0.22),
      speed: scene.options.effectKey === 'color-burst'
        ? 130 + random(Math.min(scene.width, scene.height) * 0.5)
        : 80 + random(Math.min(scene.width, scene.height) * 0.42),
      size: scene.options.effectKey === 'color-burst' ? 8 + random(22) : 1.2 + random(2.8),
      spin: -0.18 + random(0.36),
      shape: scene.options.effectKey === 'color-burst' ? (particleIndex % 3 === 0 ? 'stripe' : 'block') : 'spark',
      color: colors[particleIndex % colors.length]
    }))
  }
}

function makeShard(scene) {
  const spread = Math.max(scene.width, scene.height) * 0.95
  return {
    dx: (Math.random() - 0.5) * spread * 2,
    dy: (Math.random() - 0.5) * spread * 1.2,
    size: 5 + random(24),
    angle: random(TAU),
    spin: -3 + random(6),
    color: Math.random() > 0.5 ? scene.options.tone : scene.options.accent
  }
}

function makeFalling(scene, kind) {
  return {
    kind,
    x: random(scene.width),
    y: random(scene.height * 1.15) - scene.height * 0.15,
    size: kind === 'snow' ? 4 + random(9) : 7 + random(16),
    speed: kind === 'snow' ? 0.55 + random(1.8) : 0.9 + random(2.8),
    sway: kind === 'snow' ? 0.08 + random(0.36) : 0.48 + random(1.2),
    spin: kind === 'snow' ? -0.006 + random(0.012) : -0.032 + random(0.064),
    angle: random(TAU),
    phase: random(TAU),
    alpha: 0.42 + random(0.5)
  }
}
