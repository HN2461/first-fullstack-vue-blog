import { easeOutCubic, TAU, withAlpha } from './entranceCanvasUtils'

export function drawWaterRipples(scene, alpha, now) {
  const { ctx, width, height, items, options } = scene
  const water = ctx.createLinearGradient(0, 0, width, height)
  water.addColorStop(0, `rgba(214, 250, 255, ${0.12 * alpha})`)
  water.addColorStop(0.42, withAlpha(options.tone, 0.1 * alpha))
  water.addColorStop(1, `rgba(21, 96, 109, ${0.18 * alpha})`)
  ctx.fillStyle = water
  ctx.fillRect(0, 0, width, height)

  items.forEach((item, index) => {
    item.r += item.speed
    const maxRadius = Math.min(width, height) * 0.44
    if (item.r > maxRadius) item.r = 4
    const local = item.r / maxRadius
    const opacity = alpha * Math.pow(1 - local, 1.8) * 0.8
    const wobble = Math.sin(now * 0.002 + item.phase) * item.wobble

    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.scale(1 + wobble * 0.08, 0.42 + wobble * 0.04)
    ctx.strokeStyle = withAlpha(index % 3 ? '#b8f7ff' : options.accent, opacity)
    ctx.lineWidth = 1 + opacity * 4
    ctx.beginPath()
    ctx.arc(0, 0, item.r, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = opacity * 0.28
    ctx.fillStyle = withAlpha(options.accent, opacity * 0.18)
    ctx.beginPath()
    ctx.arc(0, 0, item.r * 0.18, 0, TAU)
    ctx.fill()
    ctx.restore()
  })
}

export function drawShockwave(scene, alpha, now) {
  const { ctx, width, height, items, options } = scene
  const centerX = width / 2
  const centerY = height / 2
  const backdrop = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.72)
  backdrop.addColorStop(0, withAlpha(options.accent, 0.18 * alpha))
  backdrop.addColorStop(0.28, `rgba(255,255,255,${0.08 * alpha})`)
  backdrop.addColorStop(1, `rgba(6, 14, 24, ${0.2 * alpha})`)
  ctx.fillStyle = backdrop
  ctx.fillRect(0, 0, width, height)

  items.forEach((item, index) => {
    item.r += item.speed
    const maxRadius = Math.max(width, height) * 0.84
    if (item.r > maxRadius) item.r = 8
    const local = item.r / maxRadius
    const opacity = alpha * Math.pow(1 - local, 1.35)
    const pulse = 1 + Math.sin(now * 0.004 + item.phase) * 0.04
    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.strokeStyle = withAlpha(index % 2 ? '#ffffff' : options.accent, opacity * 0.78)
    ctx.lineWidth = 2 + opacity * 9
    ctx.beginPath()
    ctx.arc(0, 0, item.r * pulse, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = opacity * 0.26
    ctx.strokeStyle = options.accent
    ctx.lineWidth = 1
    for (let spoke = 0; spoke < item.spokes; spoke += 1) {
      const angle = (spoke / item.spokes) * TAU + item.phase
      const inner = item.r * 0.78
      const outer = item.r * 1.06
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
      ctx.stroke()
    }
    ctx.restore()
  })
  ctx.globalAlpha = 1
}

export function drawColorBurst(scene, alpha, progress) {
  const { ctx, bursts } = scene
  ctx.fillStyle = `rgba(255, 255, 255, ${0.14 * alpha})`
  ctx.fillRect(0, 0, scene.width, scene.height)
  bursts.forEach((burst) => {
    const local = Math.max(0, Math.min(1, (progress - burst.delay) / 0.72))
    if (local <= 0) return
    const ease = easeOutCubic(local)
    const halo = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, Math.min(scene.width, scene.height) * (0.18 + local * 0.34))
    halo.addColorStop(0, `rgba(255,255,255,${alpha * (1 - local) * 0.5})`)
    halo.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, scene.width, scene.height)

    burst.particles.forEach((particle) => {
      const x = burst.x + Math.cos(particle.angle) * particle.speed * ease
      const y = burst.y + Math.sin(particle.angle) * particle.speed * ease
      ctx.save()
      ctx.globalAlpha = alpha * Math.max(0, 1 - local * 0.82)
      ctx.translate(x, y)
      ctx.rotate(particle.angle + local * 4 + particle.spin)
      ctx.fillStyle = particle.color
      if (particle.shape === 'stripe') {
        ctx.fillRect(-particle.size * 0.1, -particle.size * 0.9, particle.size * 0.2, particle.size * 1.8)
      } else {
        ctx.beginPath()
        ctx.moveTo(-particle.size * 0.7, -particle.size * 0.36)
        ctx.lineTo(particle.size * 0.68, -particle.size * 0.5)
        ctx.lineTo(particle.size * 0.48, particle.size * 0.52)
        ctx.lineTo(-particle.size * 0.55, particle.size * 0.42)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
    })
  })
}
