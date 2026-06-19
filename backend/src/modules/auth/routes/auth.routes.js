import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { requireAuth } from '#middlewares/auth.js'
import { loginUser, registerUser, resetPassword } from '#modules/auth/services/auth.service.js'
import { hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { clearAuthCookie, decryptCredential, issueCredentialChallenge, setAuthCookie } from '#utils/authSecurity.js'
import {
  credentialChallengeSchema,
  loginSchema,
  parseBody,
  registerSchema,
  resetPasswordSchema,
  secureLoginSchema,
  secureRegisterSchema,
  secureResetPasswordSchema
} from '#modules/auth/validators/auth.validator.js'

export const authRouter = Router()

authRouter.get('/challenge', (req, res) => {
  const input = parseBody(credentialChallengeSchema, req.query)
  const challenge = issueCredentialChallenge(input.purpose)

  res.json(ok({
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    expiresAt: challenge.expiresAt,
    publicKey: challenge.publicKey
  }))
})

authRouter.post('/register', asyncHandler(async (req, res) => {
  const input = req.body.credential ? parseBody(secureRegisterSchema, req.body) : parseBody(registerSchema, req.body)
  const secureInput = input.credential
    ? {
        username: input.username,
        email: input.email,
        permissionRequestReason: input.permissionRequestReason,
        ...decryptCredential(input.credential, 'register')
      }
    : input

  const result = await registerUser(secureInput)
  setAuthCookie(res, result.token)
  res.status(201).json(ok(result, '注册成功'))
}))

authRouter.post('/login', asyncHandler(async (req, res) => {
  const input = req.body.credential ? parseBody(secureLoginSchema, req.body) : parseBody(loginSchema, req.body)
  const secureInput = input.credential
    ? {
        email: input.email,
        ...decryptCredential(input.credential, 'login')
      }
    : input

  const result = await loginUser(secureInput)
  setAuthCookie(res, result.token)
  res.json(ok(result, '登录成功'))
}))

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const input = req.body.credential ? parseBody(secureResetPasswordSchema, req.body) : parseBody(resetPasswordSchema, req.body)
  const secureInput = input.credential
    ? {
        email: input.email,
        ...decryptCredential(input.credential, 'reset-password')
      }
    : input

  await resetPassword(secureInput)
  res.json(ok(null, '密码重置成功，请使用新密码登录'))
}))

authRouter.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json(ok(null, '退出成功'))
})

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await hydrateUserPermissions(req.user)))
}))
