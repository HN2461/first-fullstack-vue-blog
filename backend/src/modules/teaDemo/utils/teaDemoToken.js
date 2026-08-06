import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '#config/env'

export function signTeaDemoAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tv: user.tokenVersion || 0,
      scope: 'tea-demo'
    },
    env.teaDemoJwtSecret,
    {
      expiresIn: env.teaDemoJwtExpiresIn,
      jwtid: crypto.randomUUID()
    }
  )
}

export function verifyTeaDemoAccessToken(token) {
  return jwt.verify(token, env.teaDemoJwtSecret)
}
