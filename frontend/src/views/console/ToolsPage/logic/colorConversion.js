const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

function numeric(value, label) {
  if (!numberPattern.test(value) || !Number.isFinite(Number(value))) throw new Error(`${label}不是有效数字`)
  return Number(value)
}

function bounded(value, min, max, label) {
  if (value < min || value > max) throw new Error(`${label}必须在 ${min}–${max} 之间`)
  return value
}

function alphaValue(token = '1') {
  return token.endsWith('%')
    ? bounded(numeric(token.slice(0, -1), '透明度'), 0, 100, '透明度百分比') / 100
    : bounded(numeric(token, '透明度'), 0, 1, '透明度')
}

function hueValue(token) {
  const match = token.match(/^(.+?)(deg|grad|rad|turn)?$/i)
  const value = numeric(match?.[1] || '', '色相')
  const scale = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 }[match[2]?.toLowerCase() || 'deg']
  const degrees = value * scale
  if (!Number.isFinite(degrees)) throw new Error('色相数值过大，请缩短输入')
  return ((degrees % 360) + 360) % 360
}

function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs(hue / 60 % 2 - 1))
  const offset = lightness - chroma / 2
  const channels = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x]
  return channels.map((channel) => Math.round((channel + offset) * 255))
}

function rgbToHsl(channels) {
  const [red, green, blue] = channels.map((channel) => channel / 255)
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  if (!delta) return [0, 0, lightness * 100]
  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  let hue = max === red ? (green - blue) / delta % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4
  hue = ((hue * 60) + 360) % 360
  return [hue, saturation * 100, lightness * 100]
}

function display(value) {
  return String(Number(value.toFixed(6)))
}

/**
 * 在 HEX、RGB 与 HSL 之间转换，保留透明度；RGB 输出统一为最近的 8 位通道值。
 * @param {string} input 支持 3/4/6/8 位 HEX、逗号或空格语法的 rgb(a)/hsl(a)，色相支持角度单位。
 * @returns {{ hex: string, rgb: string, hsl: string }} 可直接复制使用的标准颜色表示。
 * @throws {Error} 输入不完整、尾随垃圾、通道越界或使用不支持的颜色语法时抛出中文错误。
 */
export function convertColor(input) {
  const value = String(input).trim()
  const hex = value.match(/^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i)
  let channels
  let alpha = 1
  if (hex) {
    const full = hex[1].length <= 4 ? [...hex[1]].map((char) => char + char).join('') : hex[1]
    channels = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16))
    if (full.length === 8) alpha = parseInt(full.slice(6), 16) / 255
  } else {
    const functional = value.match(/^(rgba?|hsla?)\(([\s\S]*)\)$/i)
    if (!functional) throw new Error('请输入完整的 HEX、RGB 或 HSL 颜色值')
    const body = functional[2].trim()
    let parts
    if (body.includes(',')) {
      if (body.includes('/')) throw new Error('逗号颜色语法不能混用斜杠透明度')
      parts = body.split(',').map((part) => part.trim())
    } else {
      const slash = body.split('/')
      if (slash.length > 2) throw new Error('颜色透明度只能使用一个斜杠')
      parts = slash[0].trim().split(/\s+/)
      if (parts.length !== 3) throw new Error('空格颜色语法需要三个通道，透明度请使用斜杠分隔')
      if (slash.length === 2) parts.push(slash[1].trim())
    }
    if (parts.length < 3 || parts.length > 4 || parts.some((part) => !part)) throw new Error('颜色需要三个通道和可选的透明度')
    alpha = alphaValue(parts[3])
    if (functional[1].toLowerCase().startsWith('rgb')) {
      const percentages = parts.slice(0, 3).filter((part) => part.endsWith('%')).length
      if (body.includes(',') && percentages !== 0 && percentages !== 3) throw new Error('逗号 RGB 语法中的三个通道应统一使用数字或百分比')
      channels = parts.slice(0, 3).map((part) => Math.round(part.endsWith('%')
        ? bounded(numeric(part.slice(0, -1), 'RGB 通道'), 0, 100, 'RGB 百分比') * 255 / 100
        : bounded(numeric(part, 'RGB 通道'), 0, 255, 'RGB 通道')))
    } else {
      if (!parts[1].endsWith('%') || !parts[2].endsWith('%')) throw new Error('HSL 饱和度和亮度需要使用百分比')
      const saturation = bounded(numeric(parts[1].slice(0, -1), '饱和度'), 0, 100, '饱和度') / 100
      const lightness = bounded(numeric(parts[2].slice(0, -1), '亮度'), 0, 100, '亮度') / 100
      channels = hslToRgb(hueValue(parts[0]), saturation, lightness)
    }
  }
  const alphaSuffix = alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, '0') : ''
  const hexOutput = `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}${alphaSuffix}`
  const [hue, saturation, lightness] = rgbToHsl(channels).map(display)
  return {
    hex: hexOutput,
    rgb: alpha < 1 ? `rgba(${channels.join(', ')}, ${display(alpha)})` : `rgb(${channels.join(', ')})`,
    hsl: alpha < 1 ? `hsla(${hue}, ${saturation}%, ${lightness}%, ${display(alpha)})` : `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
}
