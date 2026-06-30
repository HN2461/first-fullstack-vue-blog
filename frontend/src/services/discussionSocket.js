import { io } from 'socket.io-client'
import { getStoredToken } from './http'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

let socket = null

function ensureDiscussionSocket() {
  if (socket) {
    return socket
  }

  socket = io(`${API_BASE_URL}/discussions`, {
    withCredentials: true,
    auth: (cb) => {
      cb({ token: getStoredToken() })
    }
  })

  return socket
}

export function connectDiscussionSocket(handlers = {}) {
  const currentSocket = ensureDiscussionSocket()

  Object.entries(handlers).forEach(([event, handler]) => {
    currentSocket.on(event, handler)
  })

  return currentSocket
}

export function subscribeDiscussionSocket(handlers = {}) {
  const currentSocket = ensureDiscussionSocket()
  const entries = Object.entries(handlers)

  entries.forEach(([event, handler]) => {
    currentSocket.on(event, handler)
  })

  return () => {
    entries.forEach(([event, handler]) => {
      currentSocket.off(event, handler)
    })
  }
}

export function joinDiscussionRoom(threadId) {
  if (!socket || !threadId) return
  socket.emit('discussion:join', threadId)
}

export function disconnectDiscussionSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
