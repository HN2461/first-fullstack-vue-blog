import { Router } from 'express'
import svgCaptcha from 'svg-captcha'

const router = Router()

// 使用全局内存存储验证码（生产环境建议使用 Redis）
// 使用 global 对象以便与 auth.routes.js 共享
if (!global.captchaStore) {
  global.captchaStore = new Map()
}
const captchaStore = global.captchaStore

// 定期清理过期验证码（每5分钟）
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of captchaStore.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      captchaStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * GET /api/captcha/generate
 * 生成验证码
 */
router.get('/generate', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,           // 验证码长度
    ignoreChars: '0o1ilI',  // 排除易混淆字符
    noise: 3,          // 干扰线条数
    color: true,       // 验证码字符颜色
    background: '#f0f2f5', // 背景色
    width: 120,
    height: 40,
    fontSize: 36
  })

  // 生成唯一 ID
  const captchaId = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 存储验证码（转换为小写比对）
  captchaStore.set(captchaId, {
    text: captcha.text.toLowerCase(),
    timestamp: Date.now()
  })

  // 返回验证码 ID 和 SVG 图片
  res.json({
    captchaId,
    captchaSvg: captcha.data
  })
})

/**
 * POST /api/captcha/verify
 * 验证码校验（供内部使用，不在登录流程中直接调用）
 */
router.post('/verify', (req, res) => {
  const { captchaId, captchaText } = req.body

  if (!captchaId || !captchaText) {
    return res.status(400).json({ message: '验证码参数不完整' })
  }

  const stored = captchaStore.get(captchaId)

  if (!stored) {
    return res.status(400).json({ message: '验证码已过期，请重新获取' })
  }

  // 删除已使用的验证码
  captchaStore.delete(captchaId)

  // 比对验证码（不区分大小写）
  if (stored.text !== captchaText.toLowerCase()) {
    return res.status(400).json({ message: '验证码错误' })
  }

  res.json({ message: '验证码正确' })
})

export default router
