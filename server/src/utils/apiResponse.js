export function ok(data = null, message = 'success') {
  return {
    success: true,
    message,
    data
  }
}

export function fail(message = 'request failed', code = 'BAD_REQUEST', details = null) {
  return {
    success: false,
    message,
    code,
    details
  }
}
