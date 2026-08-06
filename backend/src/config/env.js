import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(rootDir, '.env') })

function readNumber(name, fallback) {
  const value = Number(process.env[name])
  return Number.isFinite(value) ? value : fallback
}

function readList(name, fallback = []) {
  const value = process.env[name]
  if (!value) return fallback
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = Object.freeze({
  rootDir,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: readNumber('SERVER_PORT', 3001),
  businessTimeZone: process.env.APP_TIME_ZONE || 'Asia/Shanghai',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
  clientOrigins: readList('CLIENT_ORIGINS', [process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173']),
  teaDemoClientOrigins: readList('TEA_DEMO_CLIENT_ORIGINS', [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://127.0.0.1:5175',
    'http://localhost:5175'
  ]),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_fullstack_blog',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  teaDemoJwtSecret: process.env.TEA_DEMO_JWT_SECRET || `${process.env.JWT_SECRET || 'development-only-secret'}:tea-demo`,
  teaDemoJwtExpiresIn: process.env.TEA_DEMO_JWT_EXPIRES_IN || '2h',
  teaDemoAuthChallengeTtlMs: readNumber('TEA_DEMO_AUTH_CHALLENGE_TTL_MS', 2 * 60 * 1000),
  sessionCookieMaxAgeMs: readNumber('SESSION_COOKIE_MAX_AGE_MS', 2 * 60 * 60 * 1000),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  officeConverterPath: process.env.OFFICE_CONVERTER_PATH || '',
  legacyNotesDir: process.env.OLD_NOTES_DIR || path.resolve(rootDir, 'legacy-notes'),
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || ''
})
