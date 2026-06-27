export const TAU = Math.PI * 2

export function drawStar(ctx, x, y, radius, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = radius * 5
  ctx.beginPath()
  for (let index = 0; index < 8; index += 1) {
    const r = index % 2 === 0 ? radius * 2.4 : radius * 0.65
    const angle = (index / 8) * TAU
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function entranceAlpha(progress) {
  if (progress < 0.12) return progress / 0.12
  if (progress > 0.82) return Math.max(0, (1 - progress) / 0.18)
  return 1
}

export function withAlpha(color, alpha) {
  if (color.startsWith('#')) {
    const value = color.slice(1)
    const full = value.length === 3 ? value.split('').map((item) => item + item).join('') : value
    const number = Number.parseInt(full, 16)
    return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`
  }
  return color
}

export function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3)
}

export function createItems(count, factory) {
  return Array.from({ length: count }, (_item, index) => factory(index))
}

export function random(max) {
  return Math.random() * max
}
