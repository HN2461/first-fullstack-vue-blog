import { getFestivalAtmosphereProfile } from './festivalCatalog'

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
  const profile = getFestivalAtmosphereProfile(festival)
  const scalar = isMobile ? 1.05 : 1.35
  const shapes = makeShapes(confetti, festival.particle || ['✨'], scalar)
  const particleCount = isMobile
    ? Math.max(16, Math.round(profile.particleCount * 1.8))
    : Math.max(24, profile.particleCount * 4)
  const isSoftTheme = ['drizzle', 'snow', 'moon'].includes(profile.theme)
  const isRadiantTheme = ['radiant', 'spark', 'night-fire'].includes(profile.theme)

  await confetti({
    particleCount,
    spread: isRadiantTheme ? 82 : isSoftTheme ? 105 : 68,
    startVelocity: isRadiantTheme ? 34 : isSoftTheme ? 16 : 26,
    ticks: isMobile ? 120 : 175,
    gravity: isSoftTheme ? 0.42 : 0.68,
    scalar,
    shapes,
    colors: profile.confettiColors,
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
    confetti({ ...defaults, origin: { x: 0.8, y: 0.45 }, colors: ['#f97316', '#fbbf24', '#34d399'] })
  ])
}
