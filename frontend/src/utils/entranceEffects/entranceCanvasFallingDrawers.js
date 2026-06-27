import { random, TAU, withAlpha } from './entranceCanvasUtils'

export function drawFalling(scene, alpha) {
  const { ctx, width, height, items, options } = scene
  const isSnow = items[0]?.kind === 'snow'
  const backdrop = ctx.createLinearGradient(0, 0, 0, height)
  backdrop.addColorStop(0, isSnow ? `rgba(205, 230, 255, ${0.12 * alpha})` : withAlpha(options.accent, 0.13 * alpha))
  backdrop.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = backdrop
  ctx.fillRect(0, 0, width, height)

  items.forEach((item) => {
    item.y += item.speed
    item.x += Math.sin(item.y * 0.018 + item.phase) * item.sway
    item.angle += item.spin
    if (item.y > height + 40) {
      item.y = -40
      item.x = random(width)
    }
    ctx.save()
    ctx.globalAlpha = alpha * item.alpha
    ctx.translate(item.x, item.y)
    ctx.rotate(item.angle)
    ctx.fillStyle = item.kind === 'snow' ? 'rgba(255,255,255,0.95)' : '#ff7aa8'
    ctx.strokeStyle = item.kind === 'snow' ? 'rgba(226, 246, 255, 0.96)' : '#ffb4cc'
    ctx.shadowColor = item.kind === 'snow' ? '#e0f2fe' : '#ff8fbd'
    ctx.shadowBlur = item.size * (item.kind === 'snow' ? 0.7 : 1.4)
    if (item.kind === 'snow') {
      drawSnowflake(ctx, item.size)
    } else {
      drawRosePetal(ctx, item.size)
    }
    ctx.restore()
  })
}

function drawRosePetal(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.8, -size * 0.65, size * 0.9, size * 0.22, size * 0.12, size)
  ctx.bezierCurveTo(-size * 0.8, size * 0.34, -size * 0.74, -size * 0.58, 0, -size)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha *= 0.5
  ctx.stroke()
  ctx.globalAlpha *= 2
}

function drawSnowflake(ctx, size) {
  ctx.lineWidth = Math.max(0.8, size * 0.12)
  ctx.lineCap = 'round'
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * TAU
    const x = Math.cos(angle) * size
    const y = Math.sin(angle) * size
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(x, y)
    ctx.stroke()
    const branchAngle = angle + 0.72
    const branchX = Math.cos(angle) * size * 0.58
    const branchY = Math.sin(angle) * size * 0.58
    ctx.beginPath()
    ctx.moveTo(branchX, branchY)
    ctx.lineTo(branchX + Math.cos(branchAngle) * size * 0.24, branchY + Math.sin(branchAngle) * size * 0.24)
    ctx.moveTo(branchX, branchY)
    ctx.lineTo(branchX + Math.cos(angle - 0.72) * size * 0.24, branchY + Math.sin(angle - 0.72) * size * 0.24)
    ctx.stroke()
  }
}
