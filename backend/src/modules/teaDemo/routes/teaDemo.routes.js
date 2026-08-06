import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { requireTeaDemoAdmin, requireTeaDemoAuth, requireTeaDemoPermissions } from '#modules/teaDemo/middlewares/teaDemoAuth.js'
import {
  teaDemoChallengeRateLimit,
  teaDemoLoginRateLimit,
  teaDemoRegisterRateLimit
} from '#modules/teaDemo/middlewares/teaDemoRateLimit.js'
import {
  createTeaDemoProduct,
  deleteTeaDemoProduct,
  getTeaDemoCategories,
  getTeaDemoMe,
  getTeaDemoProductById,
  issueTeaDemoChallenge,
  listTeaDemoAdminProducts,
  listTeaDemoProducts,
  loginTeaDemoUser,
  logoutTeaDemoUser,
  registerTeaDemoUser,
  refreshTeaDemoToken,
  updateTeaDemoProduct,
  updateTeaDemoProductStatus
} from '#modules/teaDemo/services/teaDemo.service.js'
import {
  parseBody,
  teaDemoChallengeQuerySchema,
  teaDemoEncryptedAuthBodySchema,
  teaDemoProductCreateSchema,
  teaDemoProductIdSchema,
  teaDemoProductListQuerySchema,
  teaDemoProductStatusSchema,
  teaDemoProductUpdateSchema
} from '#modules/teaDemo/validators/teaDemo.validator.js'
import { TEA_DEMO_PERMISSIONS } from '#modules/teaDemo/constants/teaDemo.constants.js'

export const teaDemoRouter = Router()

teaDemoRouter.use('/auth', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

teaDemoRouter.get('/health', (req, res) => {
  res.json(ok({
    service: 'tea-demo-api',
    status: 'ok',
    time: new Date().toISOString()
  }))
})

teaDemoRouter.get('/auth/challenge', teaDemoChallengeRateLimit, asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoChallengeQuerySchema, req.query)
  res.json(ok(issueTeaDemoChallenge(input.purpose)))
}))

teaDemoRouter.post('/auth/register', teaDemoRegisterRateLimit, asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoEncryptedAuthBodySchema, req.body)
  const user = await registerTeaDemoUser(input.credential)
  res.status(201).json(ok(user, '注册成功'))
}))

teaDemoRouter.post('/auth/login', teaDemoLoginRateLimit, asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoEncryptedAuthBodySchema, req.body)
  const result = await loginTeaDemoUser(input.credential)
  res.json(ok(result, '登录成功'))
}))

teaDemoRouter.post('/auth/logout', requireTeaDemoAuth, asyncHandler(async (req, res) => {
  await logoutTeaDemoUser(req.user)
  res.json(ok(null, '退出登录成功'))
}))

teaDemoRouter.post('/auth/refresh', requireTeaDemoAuth, asyncHandler(async (req, res) => {
  res.json(ok(await refreshTeaDemoToken(req.user), '刷新成功'))
}))

teaDemoRouter.get('/auth/me', requireTeaDemoAuth, asyncHandler(async (req, res) => {
  res.json(ok(await getTeaDemoMe(req.user)))
}))

teaDemoRouter.get('/product-categories', asyncHandler(async (req, res) => {
  res.json(ok(getTeaDemoCategories()))
}))

teaDemoRouter.get('/products', asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductListQuerySchema, req.query)
  res.json(ok(await listTeaDemoProducts(input)))
}))

teaDemoRouter.get('/products/:id', asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductIdSchema, req.params)
  res.json(ok(await getTeaDemoProductById(input.id)))
}))

teaDemoRouter.get('/admin/products', requireTeaDemoAuth, requireTeaDemoAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductListQuerySchema, req.query)
  res.json(ok(await listTeaDemoAdminProducts(input)))
}))

teaDemoRouter.post('/admin/products', requireTeaDemoAuth, requireTeaDemoPermissions(TEA_DEMO_PERMISSIONS.PRODUCT_CREATE), asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductCreateSchema, req.body)
  res.status(201).json(ok(await createTeaDemoProduct(input), '商品已创建'))
}))

teaDemoRouter.get('/admin/products/:id', requireTeaDemoAuth, requireTeaDemoAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductIdSchema, req.params)
  res.json(ok(await getTeaDemoProductById(input.id, { admin: true })))
}))

teaDemoRouter.put('/admin/products/:id', requireTeaDemoAuth, requireTeaDemoPermissions(TEA_DEMO_PERMISSIONS.PRODUCT_UPDATE), asyncHandler(async (req, res) => {
  const idInput = parseBody(teaDemoProductIdSchema, req.params)
  const input = parseBody(teaDemoProductUpdateSchema, req.body)
  res.json(ok(await updateTeaDemoProduct(idInput.id, input), '商品已更新'))
}))

teaDemoRouter.patch('/admin/products/:id/status', requireTeaDemoAuth, requireTeaDemoPermissions(TEA_DEMO_PERMISSIONS.PRODUCT_PUBLISH), asyncHandler(async (req, res) => {
  const idInput = parseBody(teaDemoProductIdSchema, req.params)
  const input = parseBody(teaDemoProductStatusSchema, req.body)
  res.json(ok(await updateTeaDemoProductStatus(idInput.id, input.status), '商品状态已更新'))
}))

teaDemoRouter.delete('/admin/products/:id', requireTeaDemoAuth, requireTeaDemoPermissions(TEA_DEMO_PERMISSIONS.PRODUCT_DELETE), asyncHandler(async (req, res) => {
  const input = parseBody(teaDemoProductIdSchema, req.params)
  res.json(ok(await deleteTeaDemoProduct(input.id), '商品已删除'))
}))
