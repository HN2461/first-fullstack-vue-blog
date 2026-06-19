import jwt from 'jsonwebtoken'
import { env } from '#config/env'

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      tv: user.tokenVersion || 0
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
