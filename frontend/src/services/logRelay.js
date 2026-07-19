import http from './http'

export function sendLogRelay(content) {
  return http.post('/api/log-relay', content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}

export function getLogRelayEntries() {
  return http.get('/api/log-relay')
}

export function clearLogRelayEntries() {
  return http.delete('/api/log-relay')
}
