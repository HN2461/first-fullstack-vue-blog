import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { requireAuth } from '#middlewares/auth.js'
import { loginUser, registerUser } from '#modules/auth/services/auth.service.js'
import { consumePasswordResetLink, inspectPasswordResetLink } from '#modules/passwordReset/services/passwordReset.service.js'
import { passwordResetConsumeSchema, passwordResetCredentialSchema, passwordResetTokenSchema } from '#modules/passwordReset/validators/passwordReset.validator.js'
import { hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { clearAuthCookie, decryptCredential, issueCredentialChallenge, setAuthCookie } from '#utils/authSecurity.js'
import {
  credentialChallengeSchema,
  loginSchema,
  parseBody,
  registerSchema,
  secureLoginSchema,
  secureRegisterSchema
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
        gender: input.gender,
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

authRouter.post('/password-reset/inspect', asyncHandler(async (req, res) => {
  const input = parseBody(passwordResetTokenSchema, req.body)
  res.json(ok(await inspectPasswordResetLink(input.token, req.ip)))
}))

authRouter.post('/password-reset/consume', asyncHandler(async (req, res) => {
  const input = parseBody(passwordResetConsumeSchema, req.body)
  const credential = parseBody(
    passwordResetCredentialSchema,
    decryptCredential(input.credential, 'password-reset-link')
  )
  await consumePasswordResetLink(input.token, credential.newPassword, req.ip)
  clearAuthCookie(res)
  res.json(ok(null, '密码已更新，请使用新密码登录'))
}))

authRouter.post('/reset-password', (req, res) => {
  res.status(410).json({
    success: false,
    code: 'PASSWORD_RESET_DISABLED',
    message: '公开邮箱重置密码流程已关闭，请联系管理员获取一次性重置链接'
  })
})

authRouter.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json(ok(null, '退出成功'))
})

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await hydrateUserPermissions(req.user)))
}))
