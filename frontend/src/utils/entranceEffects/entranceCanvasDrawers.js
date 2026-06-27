import { drawStar, easeOutCubic, entranceAlpha, random, TAU, withAlpha } from './entranceCanvasUtils'
import { drawColorBurst, drawShockwave, drawWaterRipples } from './entranceCanvasKineticDrawers'
import { drawFalling } from './entranceCanvasFallingDrawers'

export function drawScene(scene, progress, now) {
  const { ctx, width, height, options } = scene
  ctx.clearRect(0, 0, width, height)

  const alpha = entranceAlpha(progress)
  if (alpha <= 0) return

  if (options.effectKey === 'starlight') drawStarlight(scene, alpha, now)
  if (['firework-bloom', 'particle-burst'].includes(options.effectKey)) drawBursts(scene, alpha, progress)
  if (options.effectKey === 'color-burst') drawColorBurst(scene, alpha, progress)
  if (options.effectKey === 'ripple') drawWaterRipples(scene, alpha, now)
  if (options.effectKey === 'shockwave') drawShockwave(scene, alpha, now)
  if (options.effectKey === 'light-sweep' || options.effectKey === 'shadow-sweep') drawSweeps(scene, alpha)
  if (options.effectKey === 'meteor-night') drawMeteors(scene, alpha)
  if (options.effectKey === 'shatter') drawShards(scene, alpha, progress)
  if (options.effectKey === 'screen-shake') drawGlitch(scene, alpha, now)
  if (options.effectKey === 'petals' || options.effectKey === 'snow') drawFalling(scene, alpha)
  if (options.effectKey === 'glow') drawGlow(scene, alpha, now)
  if (options.effectKey === 'fog') drawFog(scene, alpha, now)
}

function drawStarlight(scene, alpha, now) {
  const { ctx, width, height, items, options } = scene
  const centerX = width / 2
  const centerY = height / 2
  const tone = options.tone
  const nebula = ctx.createRadialGradient(width * 0.52, height * 0.48, 0, width * 0.52, height * 0.48, Math.max(width, height) * 0.72)
  nebula.addColorStop(0, withAlpha(options.accent, 0.18 * alpha))
  nebula.addColorStop(0.35, withAlpha(tone, 0.2 * alpha))
  nebula.addColorStop(1, `rgba(4, 9, 18, ${0.62 * alpha})`)
  ctx.fillStyle = nebula
  ctx.fillRect(0, 0, width, height)

  items.forEach((star, index) => {
    const pulse = 0.48 + Math.sin(now * 0.004 * star.speed + star.twinkle) * 0.52
    star.x += (star.x - centerX) * 0.0016 * star.z
    star.y += (star.y - centerY) * 0.0016 * star.z
    if (star.x < -20 || star.x > width + 20 || star.y < -20 || star.y > height + 20) {
      star.x = centerX + (Math.random() - 0.5) * 80
      star.y = centerY + (Math.random() - 0.5) * 80
    }

    ctx.globalAlpha = alpha * (0.2 + pulse * 0.8)
    drawStar(ctx, star.x, star.y, star.r * (1 + pulse * 0.9), index % 5 === 0 ? options.accent : tone)
  })

  ctx.globalAlpha = alpha * 0.22
  ctx.strokeStyle = options.accent
  ctx.lineWidth = 0.8
  for (let index = 0; index < items.length - 1; index += 4) {
    const a = items[index]
    const b = items[index + 2]
    if (!b) continue
    const distance = Math.hypot(a.x - b.x, a.y - b.y)
    if (distance < 160) {
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

function drawBursts(scene, alpha, progress) {
  const { ctx, bursts, options } = scene
  ctx.fillStyle = `rgba(6, 5, 12, ${0.22 * alpha})`
  ctx.fillRect(0, 0, scene.width, scene.height)
  bursts.forEach((burst) => {
    const local = Math.max(0, Math.min(1, (progress - burst.delay) / 0.62))
    if (local <= 0) return
    const halo = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, Math.min(scene.width, scene.height) * (0.12 + local * 0.28))
    halo.addColorStop(0, withAlpha(options.accent, alpha * (1 - local) * 0.42))
    halo.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, scene.width, scene.height)
    burst.particles.forEach((particle) => {
      const ease = easeOutCubic(local)
      const x = burst.x + Math.cos(particle.angle) * particle.speed * ease
      const y = burst.y + Math.sin(particle.angle) * particle.speed * ease + local * local * 70
      const tailX = burst.x + Math.cos(particle.angle) * particle.speed * Math.max(0, ease - 0.12)
      const tailY = burst.y + Math.sin(particle.angle) * particle.speed * Math.max(0, ease - 0.12)
      ctx.globalAlpha = alpha * (1 - local)
      ctx.strokeStyle = particle.color
      ctx.lineWidth = particle.size * 1.15
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(x, y, particle.size * 1.65, 0, TAU)
      ctx.fill()
    })
  })
  ctx.globalAlpha = alpha * 0.12
  ctx.fillStyle = options.tone
  ctx.fillRect(0, 0, scene.width, scene.height)
  ctx.globalAlpha = 1
}

function drawSweeps(scene, alpha) {
  const { ctx, width, height, items, options } = scene
  const isShadow = options.effectKey === 'shadow-sweep'
  if (isShadow) {
    const daylight = ctx.createLinearGradient(0, 0, width, height)
    daylight.addColorStop(0, `rgba(255, 250, 205, ${0.18 * alpha})`)
    daylight.addColorStop(0.48, `rgba(224, 251, 252, ${0.12 * alpha})`)
    daylight.addColorStop(1, `rgba(255, 255, 255, ${0.04 * alpha})`)
    ctx.fillStyle = daylight
  } else {
    ctx.fillStyle = `rgba(8, 8, 10, ${0.12 * alpha})`
  }
  ctx.fillRect(0, 0, width, height)
  items.forEach((beam) => {
    beam.x += beam.speed
    if (beam.x > width * 1.25) beam.x = -width * 0.5
    const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x + beam.width, beam.y)
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.32, isShadow ? `rgba(255,255,255,${alpha * beam.alpha * 0.45})` : withAlpha(options.accent, alpha * beam.alpha))
    gradient.addColorStop(0.55, isShadow ? withAlpha(options.accent, alpha * beam.alpha) : withAlpha(options.accent, alpha * beam.alpha))
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.save()
    ctx.translate(beam.x, beam.y)
    ctx.rotate(beam.angle)
    ctx.fillStyle = gradient
    ctx.filter = isShadow ? 'blur(6px)' : 'blur(0)'
    ctx.fillRect(0, -height * (isShadow ? 0.6 : 0.45), beam.width, height * (isShadow ? 1.2 : 0.9))
    ctx.restore()
  })
}

function drawMeteors(scene, alpha) {
  const { ctx, width, height, items, options } = scene
  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, `rgba(4, 9, 26, ${0.62 * alpha})`)
  sky.addColorStop(0.46, `rgba(15, 30, 58, ${0.38 * alpha})`)
  sky.addColorStop(1, `rgba(43, 55, 72, ${0.16 * alpha})`)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const moon = ctx.createRadialGradient(width * 0.78, height * 0.18, 0, width * 0.78, height * 0.18, Math.min(width, height) * 0.16)
  moon.addColorStop(0, `rgba(255, 248, 213, ${0.42 * alpha})`)
  moon.addColorStop(0.34, `rgba(255, 248, 213, ${0.12 * alpha})`)
  moon.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = moon
  ctx.fillRect(0, 0, width, height)

  ctx.globalAlpha = alpha * 0.42
  items.slice(0, 48).forEach((star, index) => {
    const x = (index * 73) % width
    const y = (index * 41) % Math.max(1, height * 0.56)
    drawStar(ctx, x, y, 0.55 + (index % 3) * 0.28, index % 4 ? '#dbeafe' : options.accent)
  })
  ctx.globalAlpha = 1

  items.forEach((meteor) => {
    meteor.wait -= 1
    if (meteor.wait > 0) return
    meteor.x -= meteor.speed
    meteor.y += meteor.speed * 0.62
    if (meteor.x < -meteor.length || meteor.y > height + meteor.length) {
      meteor.x = width + random(width * 0.5)
      meteor.y = -random(height * 0.4)
      meteor.wait = random(120)
    }
    const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x + meteor.length, meteor.y - meteor.length * 0.58)
    gradient.addColorStop(0, withAlpha(options.accent, alpha))
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = meteor.size + Math.min(3, meteor.length / 100)
    ctx.beginPath()
    ctx.moveTo(meteor.x, meteor.y)
    ctx.lineTo(meteor.x + meteor.length, meteor.y - meteor.length * 0.58)
    ctx.stroke()
  })
}

function drawShards(scene, alpha, progress) {
  const { ctx, width, height, items, options } = scene
  ctx.fillStyle = `rgba(18, 12, 18, ${0.32 * alpha})`
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = withAlpha(options.accent, alpha * (1 - progress) * 0.55)
  ctx.lineWidth = 1
  for (let index = 0; index < 14; index += 1) {
    ctx.beginPath()
    ctx.moveTo(width / 2, height / 2)
    ctx.lineTo(width * (index / 13), index % 2 ? 0 : height)
    ctx.stroke()
  }
  items.forEach((shard) => {
    const move = easeOutCubic(progress)
    const x = width / 2 + shard.dx * move
    const y = height / 2 + shard.dy * move
    ctx.save()
    ctx.globalAlpha = alpha * (1 - progress * 0.55)
    ctx.translate(x, y)
    ctx.rotate(shard.angle + progress * shard.spin)
    ctx.fillStyle = shard.color
    ctx.beginPath()
    ctx.moveTo(0, -shard.size)
    ctx.lineTo(shard.size * 0.9, 0)
    ctx.lineTo(0, shard.size * 1.1)
    ctx.lineTo(-shard.size * 0.7, shard.size * 0.2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })
}

function drawGlitch(scene, alpha, now) {
  const { ctx, width, height, items, options } = scene
  const wash = ctx.createLinearGradient(0, 0, width, height)
  wash.addColorStop(0, `rgba(209, 250, 229, ${0.14 * alpha})`)
  wash.addColorStop(0.52, `rgba(255, 246, 143, ${0.12 * alpha})`)
  wash.addColorStop(1, `rgba(224, 242, 254, ${0.12 * alpha})`)
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, width, height)
  items.forEach((bar, index) => {
    const jitter = Math.sin(now * 0.04 + index) * bar.shift
    ctx.fillStyle = withAlpha(index % 2 ? options.tone : options.accent, alpha * (bar.alpha + 0.08))
    ctx.fillRect(jitter, bar.y, width, bar.height)
  })
}

function drawGlow(scene, alpha, now) {
  const { ctx, width, height, items, options } = scene
  ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * alpha})`
  ctx.fillRect(0, 0, width, height)
  items.forEach((orb) => {
    orb.x += orb.vx
    orb.y += orb.vy
    const pulse = 0.75 + Math.sin(now * 0.002 + orb.phase) * 0.25
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse)
    gradient.addColorStop(0, withAlpha(options.accent, alpha * 0.42))
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2)
  })
}

function drawFog(scene, alpha, now) {
  const { ctx, width, height, items } = scene
  ctx.fillStyle = `rgba(238, 244, 247, ${0.07 * alpha})`
  ctx.fillRect(0, 0, width, height)
  ctx.filter = 'blur(16px)'
  items.forEach((fog) => {
    fog.x += fog.speed
    if (fog.x - fog.r > width) fog.x = -fog.r
    const y = fog.y + Math.sin(now * 0.001 + fog.phase) * 22
    const gradient = ctx.createRadialGradient(fog.x, y, 0, fog.x, y, fog.r)
    gradient.addColorStop(0, `rgba(238, 244, 247, ${0.34 * alpha})`)
    gradient.addColorStop(1, 'rgba(238,244,247,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(fog.x - fog.r, y - fog.r * 0.45, fog.r * 2, fog.r)
  })
  ctx.filter = 'none'
}

