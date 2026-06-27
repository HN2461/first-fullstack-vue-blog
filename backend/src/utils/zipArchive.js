import { Buffer } from 'node:buffer'

const ZIP_LOCAL_FILE_HEADER = 0x04034b50
const ZIP_CENTRAL_DIRECTORY_HEADER = 0x02014b50
const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50
const DOS_EPOCH = new Date('1980-01-01T00:00:00Z')

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

function getDosDateTime(date = new Date()) {
  const safeDate = date < DOS_EPOCH ? DOS_EPOCH : date
  const dosTime = (safeDate.getHours() << 11) |
    (safeDate.getMinutes() << 5) |
    Math.floor(safeDate.getSeconds() / 2)
  const dosDate = ((safeDate.getFullYear() - 1980) << 9) |
    ((safeDate.getMonth() + 1) << 5) |
    safeDate.getDate()

  return { dosTime, dosDate }
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeUInt16(value) {
  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(value & 0xffff, 0)
  return buffer
}

function writeUInt32(value) {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(value >>> 0, 0)
  return buffer
}

export function createZip(entries) {
  const localParts = []
  const centralParts = []
  let offset = 0

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8')
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(String(entry.data || ''), 'utf8')
    const checksum = crc32(data)
    const { dosTime, dosDate } = getDosDateTime(entry.date || new Date())
    const localHeader = Buffer.concat([
      writeUInt32(ZIP_LOCAL_FILE_HEADER),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      nameBuffer
    ])

    localParts.push(localHeader, data)

    const centralHeader = Buffer.concat([
      writeUInt32(ZIP_CENTRAL_DIRECTORY_HEADER),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      nameBuffer
    ])

    centralParts.push(centralHeader)
    offset += localHeader.length + data.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const endRecord = Buffer.concat([
    writeUInt32(ZIP_END_OF_CENTRAL_DIRECTORY),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0)
  ])

  return Buffer.concat([...localParts, centralDirectory, endRecord])
}
