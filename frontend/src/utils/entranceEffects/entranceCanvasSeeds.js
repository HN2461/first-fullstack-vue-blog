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
    const burstCount = effectKey === 'firework-bloom' ? 10 : 7
    scene.bursts = createItems(window.innerWidth < 768 ? Math.ceil(burstCount * 0.65) : burstCount, (index) => makeBurst(scene, index))
  } else if (effectKey === 'ripple' || effectKey === 'shockwave') {
    const columns = window.innerWidth < 768 ? 3 : 5
    const rows = window.innerWidth < 768 ? 5 : 4
    scene.items = createItems(columns * rows, (index) => ({
      x: scene.width * ((index % columns) + 0.5) / columns,
      y: scene.height * (Math.floor(index / columns) + 0.5) / rows,
      r: (index % 5) * 28,
      speed: effectKey === 'shockwave' ? 8 + index * 0.45 : 4 + index * 0.3
    }))
  } else if (effectKey === 'light-sweep' || effectKey === 'shadow-sweep') {
    scene.items = createItems(window.innerWidth < 768 ? 22 : 42, (index) => ({
      x: -scene.width * (0.4 + Math.random()),
      y: scene.height * (0.03 + (index % 28) * 0.038),
      width: scene.width * (0.22 + Math.random() * 0.42),
      speed: scene.width * (0.005 + Math.random() * 0.008),
      alpha: 0.25 + Math.random() * 0.55,
      angle: -0.24 + Math.random() * 0.16
    }))
  } else if (effectKey === 'meteor-night') {
    scene.items = createItems(window.innerWidth < 768 ? 44 : 90, () => ({
      x: random(scene.width * 1.4),
      y: random(scene.height * 1.05) - scene.height * 0.32,
      length: 70 + Math.random() * 210,
      speed: 6 + Math.random() * 15,
      wait: Math.random() * 70
    }))
  } else if (effectKey === 'shatter') {
    scene.items = createItems(window.innerWidth < 768 ? 110 : 220, () => makeShard(scene))
  } else if (effectKey === 'screen-shake') {
    scene.items = createItems(window.innerWidth < 768 ? 32 : 58, () => ({
      y: random(scene.height),
      height: 3 + random(18),
      shift: -60 + random(120),
      alpha: 0.08 + random(0.24)
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
  const colors = [scene.options.tone, scene.options.accent, '#ffffff', '#f59e0b', '#38bdf8', '#f472b6']
  return {
    x: scene.width * (0.08 + Math.random() * 0.84),
    y: scene.height * (0.12 + Math.random() * 0.66),
    delay: index * 0.075,
    particles: createItems(scene.options.effectKey === 'firework-bloom' ? 130 : 170, (particleIndex) => ({
      angle: (particleIndex / 130) * TAU + random(0.22),
      speed: 80 + random(Math.min(scene.width, scene.height) * 0.42),
      size: 1.2 + random(2.8),
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
    size: kind === 'snow' ? 1.2 + random(3.2) : 5 + random(12),
    speed: kind === 'snow' ? 0.8 + random(2.9) : 1.2 + random(3.6),
    sway: kind === 'snow' ? 0.16 + random(0.5) : 0.4 + random(0.9),
    spin: kind === 'snow' ? 0.002 + random(0.01) : -0.025 + random(0.05),
    angle: random(TAU),
    phase: random(TAU),
    alpha: 0.42 + random(0.5)
  }
}
