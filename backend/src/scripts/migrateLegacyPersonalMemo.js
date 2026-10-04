import { connectDatabase, disconnectDatabase } from '#config/database.js'
import { Memo } from '#modules/memo/models/Memo.js'
import { encryptMemoField, decryptMemoField } from '#utils/memoFieldEncryption.js'
import { LEGACY_PERSONAL_MEMO_FIELDS, parseLegacyPersonalMemo } from '#utils/legacyPersonalMemoMigration.js'

const LEGACY_MEMO_ID = '6ac10942806a4706d34cec9e'
const APPLY = process.argv.includes('--apply')

function assertLegacySource(memo) {
  if (!memo || memo.title !== '个人信息' || (memo.kind && memo.kind !== 'capture')) {
    throw new Error('指定的旧备忘录不存在或结构与预期不符，未执行写入')
  }
}

function fieldContext(memo, fieldKey) {
  return {
    ownerId: memo.createdBy.toString(),
    memoId: memo._id.toString(),
    fieldKey
  }
}

function summarizePreview(parsed) {
  console.log(`字段模板数: ${LEGACY_PERSONAL_MEMO_FIELDS.length}`)
  console.log(`识别字段数: ${parsed.recognizedFieldCount}`)
  console.log(`未识别片段数: ${parsed.unknownFragmentCount}`)
  console.log(`缺失字段: ${parsed.missingLabels.length ? parsed.missingLabels.join('、') : '无'}`)
  console.log(`重复字段: ${parsed.duplicateLabels.length ? parsed.duplicateLabels.join('、') : '无'}`)
  console.log(`日期格式异常: ${parsed.invalidDateLabels.length ? parsed.invalidDateLabels.join('、') : '无'}`)
  console.log(`敏感字段数: ${parsed.fields.filter((field) => field.isSensitive).length}`)
}

function assertCompleteParse(parsed) {
  if (parsed.missingLabels.length || parsed.duplicateLabels.length || parsed.invalidDateLabels.length || parsed.unknownFragmentCount) {
    throw new Error('旧记录无法无损映射到资料模板，请先检查预览结果，未删除旧记录')
  }
}

function assertTargetMetadata(target, source) {
  if (
    target.title !== '个人信息' ||
    target.kind !== 'reference' ||
    target.category !== '个人信息' ||
    target.migrationSourceId !== LEGACY_MEMO_ID ||
    (source && target.createdBy.toString() !== source.createdBy.toString())
  ) {
    throw new Error('已存在的迁移目标与预期不符，未删除旧记录')
  }
}

function assertTargetMatchesParse(target, parsed) {
  assertTargetMetadata(target)
  if (target.fields.length !== parsed.fields.length) throw new Error('迁移目标字段数量校验失败')

  for (const expected of parsed.fields) {
    const actual = target.fields.find((field) => field.key === expected.key)
    if (
      !actual ||
      actual.label !== expected.label ||
      actual.type !== expected.type ||
      actual.isSensitive !== expected.isSensitive
    ) {
      throw new Error(`迁移目标字段结构校验失败: ${expected.key}`)
    }

    const actualValue = actual.isSensitive
      ? decryptMemoField(actual.encryptedValue, fieldContext(target, actual.key))
      : actual.value || ''
    if (actualValue !== expected.value) throw new Error(`迁移目标内容校验失败: ${expected.key}`)
  }
}

function assertCompletedTarget(target) {
  assertTargetMetadata(target)
  if (target.fields.length !== LEGACY_PERSONAL_MEMO_FIELDS.length) throw new Error('已迁移记录字段数量异常')

  for (const expected of LEGACY_PERSONAL_MEMO_FIELDS) {
    const actual = target.fields.find((field) => field.key === expected.key)
    if (
      !actual ||
      actual.label !== expected.label ||
      actual.type !== expected.type ||
      actual.isSensitive !== expected.isSensitive
    ) {
      throw new Error(`已迁移记录字段结构异常: ${expected.key}`)
    }
    const value = actual.isSensitive
      ? decryptMemoField(actual.encryptedValue, fieldContext(target, actual.key))
      : actual.value || ''
    if (!value) throw new Error(`已迁移记录字段为空: ${expected.key}`)
  }
}

function createMigratedMemo(source, parsed) {
  const migrated = new Memo({
    title: '个人信息',
    content: '',
    kind: 'reference',
    category: '个人信息',
    type: source.type || 'idea',
    status: source.status || 'open',
    priority: source.priority || 'medium',
    tags: source.tags || [],
    isPinned: source.isPinned === true,
    dueAt: source.dueAt || null,
    createdBy: source.createdBy,
    createdAt: source.createdAt,
    migrationSourceId: LEGACY_MEMO_ID
  })

  migrated.fields = parsed.fields.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    value: field.isSensitive ? '' : field.value,
    encryptedValue: field.isSensitive
      ? encryptMemoField(field.value, fieldContext(migrated, field.key))
      : '',
    isSensitive: field.isSensitive,
    order: field.order
  }))

  return migrated
}

async function removeLegacyAfterVerification(source) {
  // 新记录已解密校验通过后才删除旧记录，保证任何校验失败都能保留原始内容。
  const result = await Memo.deleteOne({
    _id: source._id,
    createdBy: source.createdBy,
    updatedAt: source.updatedAt
  })
  if (result.deletedCount !== 1) throw new Error('旧记录在迁移期间发生变化，已保留新旧记录供后续核查')
}

async function main() {
  await connectDatabase()
  try {
    const source = await Memo.findById(LEGACY_MEMO_ID).select('+fields.encryptedValue')
    const targets = await Memo.find({ migrationSourceId: LEGACY_MEMO_ID })
      .select('+migrationSourceId +fields.encryptedValue')
      .limit(2)

    if (targets.length > 1) throw new Error('发现多个迁移目标记录，未执行任何删除')
    if (!source && !targets.length) throw new Error('未找到指定旧记录或已迁移目标，未执行任何写入')
    if (source) assertLegacySource(source)

    console.log(`模式: ${APPLY ? '正式写入' : 'dry-run'}`)
    console.log(`旧记录匹配数: ${source ? 1 : 0}`)
    console.log(`迁移目标匹配数: ${targets.length}`)

    if (!source) {
      assertCompletedTarget(targets[0])
      console.log(`迁移状态: 已完成，字段数 ${targets[0].fields.length}，敏感字段已解密校验`)
      return
    }

    const parsed = parseLegacyPersonalMemo(source.content)
    summarizePreview(parsed)
    if (!APPLY) return
    assertCompleteParse(parsed)

    if (targets.length) {
      assertTargetMatchesParse(targets[0], parsed)
      await removeLegacyAfterVerification(source)
      console.log('迁移恢复: 已验证此前写入的新记录并删除旧记录')
    } else {
      const migrated = createMigratedMemo(source, parsed)
      await migrated.save()
      const persisted = await Memo.findById(migrated._id).select('+migrationSourceId +fields.encryptedValue')
      assertTargetMatchesParse(persisted, parsed)
      await removeLegacyAfterVerification(source)
      console.log('迁移完成: 新记录解密校验通过，旧记录已删除')
    }

    const remainingLegacy = await Memo.countDocuments({ _id: LEGACY_MEMO_ID })
    const verifiedTarget = await Memo.findOne({ migrationSourceId: LEGACY_MEMO_ID })
      .select('+migrationSourceId +fields.encryptedValue')
    if (remainingLegacy || !verifiedTarget) throw new Error('迁移后记录数量校验失败')
    assertCompletedTarget(verifiedTarget)
    console.log(`迁移后校验: 旧记录 ${remainingLegacy} 条，资料记录 1 条，字段 ${verifiedTarget.fields.length} 项`)
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(`迁移失败: ${error.message || '未知错误'}`)
  process.exitCode = 1
})
