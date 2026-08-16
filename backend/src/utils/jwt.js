import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { env } from '#config/env'

export function signAccessToken(user, options = {}) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tv: user.tokenVersion || 0,
      sid: options.sessionId || randomUUID()
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret)
}
