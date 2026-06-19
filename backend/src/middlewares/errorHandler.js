import { fail } from '#utils/apiResponse.js'

export function notFoundHandler(req, res) {
  res.status(404).json(fail(`接口不存在：${req.method} ${req.originalUrl}`, 'NOT_FOUND'))
}

export function errorHandler(error, req, res, next) {
  const status = error.statusCode || error.status || 500
  const message = status >= 500 ? '服务器内部错误' : error.message

  if (status >= 500) {
    console.error(error)
  }

  res.status(status).json(fail(message, error.code || 'INTERNAL_ERROR'))
}
