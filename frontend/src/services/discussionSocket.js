import { io } from 'socket.io-client'
import { getStoredToken } from './http'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

let socket = null
const statusListeners = new Set()
const socketStatus = {
  connected: false,
  connecting: false,
  reconnecting: false,
  manualReconnectRequired: false,
  lastError: '',
  lastReason: '',
  reconnectAttempt: 0
}

function emitStatus(nextStatus = {}) {
  Object.assign(socketStatus, nextStatus)
  statusListeners.forEach((listener) => listener({ ...socketStatus }))
}

function bindSocketStatus(currentSocket) {
  currentSocket.on('connect', () => {
    emitStatus({
      connected: true,
      connecting: false,
      reconnecting: false,
      manualReconnectRequired: false,
      lastError: '',
      lastReason: '',
      reconnectAttempt: 0
    })
  })

  currentSocket.on('connect_error', (error) => {
    emitStatus({
      connected: false,
      connecting: false,
      reconnecting: !!currentSocket.active,
      manualReconnectRequired: !currentSocket.active,
      lastError: error?.message || '连接失败'
    })
  })

  currentSocket.on('disconnect', (reason) => {
    emitStatus({
      connected: false,
      connecting: false,
      reconnecting: !!currentSocket.active,
      manualReconnectRequired: !currentSocket.active,
      lastReason: reason || '连接已断开'
    })
  })

  currentSocket.io.on('reconnect_attempt', (attempt) => {
    emitStatus({
      connected: false,
      connecting: false,
      reconnecting: true,
      reconnectAttempt: attempt
    })
  })

  currentSocket.io.on('reconnect', () => {
    emitStatus({
      connected: true,
      connecting: false,
      reconnecting: false,
      manualReconnectRequired: false,
      lastError: '',
      lastReason: '',
      reconnectAttempt: 0
    })
  })

  currentSocket.io.on('reconnect_error', (error) => {
    emitStatus({
      connected: false,
      reconnecting: true,
      lastError: error?.message || '重连失败'
    })
  })

  currentSocket.io.on('reconnect_failed', () => {
    emitStatus({
      connected: false,
      reconnecting: false,
      manualReconnectRequired: true,
      lastError: '自动重连失败'
    })
  })
}

function ensureDiscussionSocket() {
  if (socket) {
    return socket
  }

  emitStatus({
    connected: false,
    connecting: true,
    reconnecting: false,
    manualReconnectRequired: false,
    lastError: '',
    lastReason: ''
  })

  socket = io(`${API_BASE_URL}/discussions`, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    auth: (cb) => {
      cb({ token: getStoredToken() })
    }
  })
  bindSocketStatus(socket)

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
  const currentSocket = ensureDiscussionSocket()
  if (!threadId) return
  currentSocket.emit('discussion:join', threadId)
}

export function reconnectDiscussionSocket() {
  const currentSocket = ensureDiscussionSocket()
  emitStatus({
    connected: currentSocket.connected,
    connecting: !currentSocket.connected,
    reconnecting: false,
    manualReconnectRequired: false,
    lastError: '',
    lastReason: ''
  })
  currentSocket.auth = { token: getStoredToken() }
  currentSocket.connect()
}

export function subscribeDiscussionSocketStatus(listener) {
  if (typeof listener !== 'function') return () => {}
  statusListeners.add(listener)
  listener({ ...socketStatus })

  return () => {
    statusListeners.delete(listener)
  }
}

export function disconnectDiscussionSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
  emitStatus({
    connected: false,
    connecting: false,
    reconnecting: false,
    manualReconnectRequired: false,
    lastError: '',
    lastReason: ''
  })
}
