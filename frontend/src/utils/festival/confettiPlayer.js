let confettiModulePromise = null

async function loadConfetti() {
  if (!confettiModulePromise) {
    confettiModulePromise = import('canvas-confetti').then((module) => module.default || module)
  }
  return confettiModulePromise
}

function makeShapes(confetti, emojis, scalar) {
  return emojis.map((emoji) => confetti.shapeFromText({ text: emoji, scalar }))
}

export async function playFestivalConfetti(festival, options = {}) {
  if (typeof window === 'undefined' || !festival) return
  const confetti = await loadConfetti()
  const isMobile = Boolean(options.isMobile)
  const scalar = isMobile ? 1.4 : 1.8
  const shapes = makeShapes(confetti, festival.particle || ['✨'], scalar)
  const particleCount = isMobile ? 36 : 72

  await confetti({
    particleCount,
    spread: festival.level === 'major' ? 80 : 58,
    startVelocity: festival.level === 'major' ? 36 : 24,
    ticks: isMobile ? 150 : 220,
    gravity: 0.75,
    scalar,
    shapes,
    origin: { y: 0.35 },
    disableForReducedMotion: true
  })
}

export async function playBirthdayConfetti(isMobile = false) {
  const confetti = await loadConfetti()
  const count = isMobile ? 42 : 90
  const defaults = {
    particleCount: Math.round(count / 3),
    spread: 70,
    startVelocity: 34,
    ticks: isMobile ? 150 : 220,
    scalar: isMobile ? 0.9 : 1.1,
    disableForReducedMotion: true
  }

  await Promise.all([
    confetti({ ...defaults, origin: { x: 0.2, y: 0.45 }, colors: ['#f472b6', '#fb7185', '#fbbf24'] }),
    confetti({ ...defaults, origin: { x: 0.5, y: 0.35 }, shapes: makeShapes(confetti, ['🎂', '💗'], isMobile ? 1.3 : 1.7) }),
    confetti({ ...defaults, origin: { x: 0.8, y: 0.45 }, colors: ['#60a5fa', '#a78bfa', '#34d399'] })
  ])
}
