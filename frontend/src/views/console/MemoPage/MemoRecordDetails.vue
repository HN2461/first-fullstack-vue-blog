<template>
  <a-drawer
    :open="open"
    :title="detail?.title || record?.title || '记录详情'"
    :width="560"
    :style="{ top: '24px', height: 'calc(100vh - 48px)' }"
    :body-style="{ padding: 0, overflow: 'hidden' }"
    :footer-style="{ padding: '12px 20px', borderTop: '1px solid var(--console-border)' }"
    class="memo-detail-drawer"
    @close="close"
  >
    <div class="memo-detail-scroll">
      <a-spin :spinning="loading">
        <div v-if="errorMessage" class="memo-detail-state">
          <a-alert type="error" show-icon :message="errorMessage" />
          <a-button @click="loadDetail">重试</a-button>
        </div>

        <template v-else-if="detail">
          <div class="memo-detail-meta">
            <a-tag :color="detail.kind === 'reference' ? 'cyan' : 'blue'" :bordered="false">
              {{ detail.kind === 'reference' ? '资料' : getTypeLabel(detail.type) }}
            </a-tag>
            <a-tag v-if="detail.category">{{ detail.category }}</a-tag>
            <a-tag v-if="detail.kind === 'capture'" :color="statusMeta.color" :bordered="false">
              {{ statusMeta.label }}
            </a-tag>
            <a-tag v-if="detail.kind === 'capture'" :bordered="false">
              {{ getPriorityLabel(detail.priority) }}
            </a-tag>
          </div>

          <section v-if="detail.kind === 'reference'" class="memo-detail-section">
            <h3>资料字段</h3>
            <div v-if="detail.fields?.length" class="memo-detail-fields">
              <div v-for="field in orderedFields" :key="field.key" class="memo-detail-field">
                <div class="memo-detail-field__label">
                  <span>{{ field.label }}</span>
                  <LockKeyhole v-if="field.isSensitive" :size="13" aria-label="敏感字段" />
                </div>
                <div class="memo-detail-field__value" :class="{ 'memo-detail-field__value--sensitive': field.isSensitive }">
                  <span>{{ getFieldValue(field) }}</span>
                  <div v-if="field.isSensitive && field.hasValue" class="memo-detail-field__actions">
                    <a-tooltip :title="isRevealed(field) ? '隐藏内容' : '显示内容'">
                      <a-button
                        type="text"
                        size="small"
                        :aria-label="isRevealed(field) ? `隐藏${field.label}` : `显示${field.label}`"
                        :loading="revealing[field.key] === true"
                        @click="toggleSensitiveField(field)"
                      >
                        <template #icon>
                          <EyeOff v-if="isRevealed(field)" :size="15" />
                          <Eye v-else :size="15" />
                        </template>
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="复制内容">
                      <a-button
                        v-if="isRevealed(field)"
                        type="text"
                        size="small"
                        :aria-label="`复制${field.label}`"
                        @click="copyField(field)"
                      >
                        <template #icon><Copy :size="15" /></template>
                      </a-button>
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <a-empty v-else description="尚未添加资料字段" :image="false" />
          </section>

          <section v-else class="memo-detail-section">
            <h3>记录内容</h3>
            <div class="memo-detail-content">{{ detail.content || '暂无正文' }}</div>
            <div v-if="detail.dueAt" class="memo-detail-due">
              <CalendarDays :size="15" />
              <span>计划日期：{{ formatDate(detail.dueAt) }}</span>
            </div>
          </section>

          <section v-if="detail.tags?.length" class="memo-detail-section">
            <h3>标签</h3>
            <div class="memo-detail-tags">
              <a-tag v-for="tag in detail.tags" :key="tag">{{ tag }}</a-tag>
            </div>
          </section>

          <div class="memo-detail-timestamps">
            <span>创建于 {{ formatTime(detail.createdAt) }}</span>
            <span>更新于 {{ formatTime(detail.updatedAt) }}</span>
          </div>
        </template>
      </a-spin>
    </div>

    <template #footer>
      <div v-if="detail" class="memo-detail-footer">
        <a-tooltip :title="detail.isPinned ? '取消置顶' : '置顶记录'">
          <a-button :aria-label="detail.isPinned ? '取消置顶' : '置顶记录'" @click="emitAction('pin')">
            <template #icon><Pin :size="15" /></template>
          </a-button>
        </a-tooltip>
        <a-button v-if="detail.kind === 'capture'" @click="emitAction('complete')">
          <template #icon><Check :size="15" /></template>
          {{ detail.status === 'completed' ? '重新打开' : '标记完成' }}
        </a-button>
        <a-button @click="emitAction('archive')">
          <template #icon><Archive :size="15" /></template>
          {{ detail.status === 'archived' ? '取消归档' : '归档' }}
        </a-button>
        <a-button @click="$emit('edit', detail)">
          <template #icon><Pencil :size="15" /></template>
          编辑
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { Archive, CalendarDays, Check, Copy, Eye, EyeOff, LockKeyhole, Pencil, Pin } from 'lucide-vue-next'
import { getMemo, getMemoSensitiveField } from '@/services/memo'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null }
})
const emit = defineEmits(['close', 'edit', 'action'])

const detail = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const sensitiveValues = reactive({})
const revealing = reactive({})
let requestToken = 0

const orderedFields = computed(() => [...(detail.value?.fields || [])].sort((a, b) => a.order - b.order))
const statusMeta = computed(() => {
  const values = {
    open: { label: '待推进', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    archived: { label: '已归档', color: 'default' }
  }
  return values[detail.value?.status] || values.open
})

watch(
  () => [props.open, props.record?.id],
  ([open]) => {
    if (open) loadDetail()
    else clearSensitiveValues()
  }
)

function close() {
  requestToken += 1
  clearSensitiveValues()
  detail.value = null
  errorMessage.value = ''
  emit('close')
}

function clearSensitiveValues() {
  Object.keys(sensitiveValues).forEach((key) => delete sensitiveValues[key])
  Object.keys(revealing).forEach((key) => delete revealing[key])
}

async function loadDetail() {
  if (!props.record?.id) return
  const token = ++requestToken
  loading.value = true
  errorMessage.value = ''
  clearSensitiveValues()

  try {
    const result = await getMemo(props.record.id)
    if (token === requestToken) detail.value = result
  } catch (error) {
    if (token === requestToken) errorMessage.value = error.message || '记录加载失败'
  } finally {
    if (token === requestToken) loading.value = false
  }
}

function isRevealed(field) {
  return Object.hasOwn(sensitiveValues, field.key)
}

function getFieldValue(field) {
  if (!field.hasValue) return '未填写'
  if (!field.isSensitive) return field.value || '未填写'
  if (!isRevealed(field)) return '••••••••'
  return sensitiveValues[field.key] || '未填写'
}

async function toggleSensitiveField(field) {
  if (isRevealed(field)) {
    delete sensitiveValues[field.key]
    return
  }

  revealing[field.key] = true
  const recordId = detail.value?.id
  const token = requestToken
  try {
    const result = await getMemoSensitiveField(recordId, field.key)
    if (token === requestToken && detail.value?.id === recordId) {
      sensitiveValues[field.key] = result.value || ''
    }
  } catch (error) {
    message.error(error.message || '敏感字段读取失败')
  } finally {
    delete revealing[field.key]
  }
}

async function copyField(field) {
  const value = sensitiveValues[field.key]
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    message.success(`已复制${field.label}`)
  } catch {
    message.error('复制失败，请检查浏览器剪贴板权限')
  }
}

function emitAction(action) {
  emit('action', { action, record: detail.value })
}

function getTypeLabel(type) {
  return {
    idea: '灵感',
    plan: '计划',
    study: '研究',
    work: '工作'
  }[type] || '灵感'
}

function getPriorityLabel(priority) {
  return {
    low: '低优先级',
    medium: '中优先级',
    high: '高优先级'
  }[priority] || '中优先级'
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

defineExpose({ loadDetail })
</script>

<style scoped>
.memo-detail-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 22px 28px;
}

.memo-detail-meta,
.memo-detail-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.memo-detail-section {
  margin-top: 24px;
}

.memo-detail-section h3 {
  margin: 0 0 12px;
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.memo-detail-fields {
  border-top: 1px solid var(--console-border);
}

.memo-detail-field {
  display: grid;
  grid-template-columns: minmax(110px, 0.34fr) minmax(0, 1fr);
  gap: 18px;
  padding: 12px 0;
  border-bottom: 1px solid var(--console-border);
}

.memo-detail-field__label {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.memo-detail-field__label :deep(svg) {
  flex: 0 0 auto;
  margin-top: 4px;
  color: var(--console-text-tertiary);
}

.memo-detail-field__value {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  color: var(--console-text);
  font-size: 13px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.memo-detail-field__value--sensitive {
  font-variant-numeric: tabular-nums;
}

.memo-detail-field__actions {
  display: flex;
  flex: 0 0 auto;
  margin: -4px -8px 0 0;
}

.memo-detail-content {
  color: var(--console-text);
  font-size: 14px;
  line-height: 1.8;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.memo-detail-due,
.memo-detail-timestamps {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.memo-detail-due {
  margin-top: 18px;
}

.memo-detail-timestamps {
  flex-wrap: wrap;
  gap: 8px 18px;
  padding-top: 18px;
  margin-top: 24px;
  border-top: 1px solid var(--console-border);
}

.memo-detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.memo-detail-state {
  display: grid;
  justify-items: start;
  gap: 12px;
}

:global(.memo-detail-drawer .ant-drawer-content-wrapper) {
  max-width: 100vw;
}

:global(.memo-detail-drawer .ant-drawer-wrapper-body) {
  min-height: 0;
}

:global(.memo-detail-drawer .ant-drawer-body) {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 640px) {
  .memo-detail-scroll {
    padding: 16px 16px 24px;
  }

  .memo-detail-field {
    grid-template-columns: minmax(88px, 0.3fr) minmax(0, 1fr);
    gap: 10px;
  }

  .memo-detail-footer :deep(.ant-btn) {
    flex: 1 1 auto;
  }
}
</style>
