import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { getRecentRequestMetrics } from '../middlewares/requestMetrics.js'

const execFileAsync = promisify(execFile)
const packageJson = JSON.parse(fs.readFileSync(path.join(env.rootDir, 'package.json'), 'utf8'))
const serviceStartedAt = Date.now()
const cpuSnapshot = createCpuSnapshot()

function createCpuSnapshot() {
  const cpus = os.cpus()

  return {
    idle: cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0),
    total: cpus.reduce((sum, cpu) => {
      return sum + Object.values(cpu.times).reduce((innerSum, time) => innerSum + time, 0)
    }, 0)
  }
}

function readCpuUsagePercent() {
  const previous = { ...cpuSnapshot }
  const next = createCpuSnapshot()
  cpuSnapshot.idle = next.idle
  cpuSnapshot.total = next.total

  const idleDelta = next.idle - previous.idle
  const totalDelta = next.total - previous.total
  if (totalDelta <= 0) {
    return 0
  }

  return (1 - idleDelta / totalDelta) * 100
}

function toPercent(used, total) {
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) {
    return 0
  }

  return (used / total) * 100
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return 0
  }

  return bytes
}

async function getDiskUsage() {
  if (process.platform === 'win32') {
    const script = [
      '$drive = Get-PSDrive -Name ((Get-Location).Path.Substring(0,1))',
      'if (-not $drive) { throw \'Drive not found\' }',
      '@{ total = [double]($drive.Used + $drive.Free); used = [double]$drive.Used; free = [double]$drive.Free } | ConvertTo-Json -Compress'
    ].join('; ')

    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
      timeout: 3000
    })
    const parsed = JSON.parse(stdout.trim())
    return {
      total: parsed.total,
      used: parsed.used,
      free: parsed.free
    }
  }

  const { stdout } = await execFileAsync('df', ['-kP', env.rootDir], { timeout: 3000 })
  const lines = stdout.trim().split(/\r?\n/)
  const target = lines.at(-1)?.trim().split(/\s+/)

  if (!target || target.length < 6) {
    throw new Error('DISK_USAGE_PARSE_FAILED')
  }

  const total = Number(target[1]) * 1024
  const used = Number(target[2]) * 1024
  const free = Number(target[3]) * 1024

  return { total, used, free }
}

async function getDatabaseHealth() {
  const startedAt = Date.now()
  const readyState = mongoose.connection.readyState
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }

  if (readyState !== 1) {
    return {
      status: readyState === 2 ? 'degraded' : 'down',
      readyState,
      readyStateLabel: stateMap[readyState] || 'unknown',
      responseMs: Date.now() - startedAt
    }
  }

  try {
    await mongoose.connection.db.admin().ping()
    return {
      status: 'up',
      readyState,
      readyStateLabel: stateMap[readyState] || 'unknown',
      responseMs: Date.now() - startedAt
    }
  } catch (error) {
    return {
      status: 'down',
      readyState,
      readyStateLabel: stateMap[readyState] || 'unknown',
      responseMs: Date.now() - startedAt,
      message: error.message
    }
  }
}

function buildAlerts({ system, database, requests }) {
  const alerts = []

  if (system.cpu.usagePercent >= 85) {
    alerts.push({ level: 'warning', title: 'CPU 使用率偏高', description: '当前 CPU 使用率已超过 85%。' })
  }
  if (system.memory.usagePercent >= 85) {
    alerts.push({ level: 'warning', title: '系统内存占用偏高', description: '当前系统内存占用已超过 85%。' })
  }
  if (system.disk.usagePercent >= 80) {
    alerts.push({ level: 'warning', title: '磁盘空间偏紧张', description: '当前磁盘使用率已超过 80%，建议尽快清理。' })
  }
  if (database.status !== 'up') {
    alerts.push({ level: 'error', title: '数据库连接异常', description: 'MongoDB 当前未处于健康连接状态。' })
  }
  if (database.responseMs >= 1000) {
    alerts.push({ level: 'warning', title: '数据库响应较慢', description: 'MongoDB ping 已超过 1000ms。' })
  }
  if (requests.status5xx > 0) {
    alerts.push({ level: 'error', title: '近期存在服务错误', description: `最近 ${requests.windowMinutes} 分钟内出现 ${requests.status5xx} 次 5xx 请求。` })
  }
  if (requests.slowRequests > 0) {
    alerts.push({ level: 'warning', title: '近期存在慢请求', description: `最近 ${requests.windowMinutes} 分钟内出现 ${requests.slowRequests} 次慢请求。` })
  }

  return alerts
}

export async function getMonitorOverview() {
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory
  const nodeMemory = process.memoryUsage()
  const [disk, database] = await Promise.all([
    getDiskUsage().catch(() => ({ total: 0, used: 0, free: 0 })),
    getDatabaseHealth()
  ])
  const requests = getRecentRequestMetrics()
  const uptimeSeconds = process.uptime()
  const systemUptimeSeconds = os.uptime()

  const system = {
    hostname: os.hostname(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    environment: env.nodeEnv,
    serviceVersion: packageJson.version,
    serviceStartedAt: new Date(serviceStartedAt).toISOString(),
    uptimeSeconds,
    systemUptimeSeconds,
    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg(),
      usagePercent: readCpuUsagePercent()
    },
    memory: {
      total: formatBytes(totalMemory),
      used: formatBytes(usedMemory),
      free: formatBytes(freeMemory),
      usagePercent: toPercent(usedMemory, totalMemory)
    },
    disk: {
      total: formatBytes(disk.total),
      used: formatBytes(disk.used),
      free: formatBytes(disk.free),
      usagePercent: toPercent(disk.used, disk.total)
    },
    nodeProcess: {
      rss: formatBytes(nodeMemory.rss),
      heapTotal: formatBytes(nodeMemory.heapTotal),
      heapUsed: formatBytes(nodeMemory.heapUsed),
      external: formatBytes(nodeMemory.external)
    }
  }

  const service = {
    api: {
      status: 'up',
      responseMs: requests.lastRequestAt ? Math.max(1, Math.round(requests.avgResponseMs)) : 0
    },
    database
  }

  return {
    generatedAt: new Date().toISOString(),
    system,
    service,
    requests,
    alerts: buildAlerts({ system, database, requests })
  }
}
