<template>
  <section class="log-relay-page">
    <div class="log-relay-toolbar">
      <div>
        <div class="log-relay-toolbar__eyebrow">开发调试工具</div>
        <h1>日志中转</h1>
      </div>
      <div class="log-relay-toolbar__actions">
        <a-tag color="blue">
          <template #icon><Database :size="13" /></template>
          MongoDB 持久化
        </a-tag>
        <a-button @click="docsVisible = true">
          <template #icon><BookOpen :size="15" /></template>
          接口调用说明
        </a-button>
      </div>
    </div>

    <a-alert v-if="errorMessage" class="log-relay-alert" type="error" show-icon :message="errorMessage" />

    <div class="log-relay-grid">
      <article class="log-relay-panel log-relay-panel--send">
        <div class="log-relay-panel__head">
          <div>
            <h2><Send :size="17" />发送日志</h2>
            <span>支持任意文本，保留原始换行和空格</span>
          </div>
          <div class="log-relay-panel__actions">
            <span class="log-relay-draft-size">{{ formatBytes(byteLength(draft)) }}</span>
            <a-tag :bordered="false">POST</a-tag>
            <a-button type="primary" :loading="sending" :disabled="!draft.length" @click="sendLog">
              <template #icon><Send :size="15" /></template>
              发送日志
            </a-button>
          </div>
        </div>

        <a-textarea
          v-model:value="draft"
          class="log-relay-editor"
          :auto-size="{ minRows: 15, maxRows: 24 }"
          placeholder="粘贴设备日志，或输入一段文本进行接口自测..."
          :disabled="sending"
        />
      </article>

      <article class="log-relay-panel log-relay-panel--receive">
        <div class="log-relay-panel__head">
          <div>
            <h2><Inbox :size="17" />接收日志</h2>
            <span v-if="lastRefreshed">最后刷新：{{ formatDate(lastRefreshed) }}</span>
            <span v-else>点击刷新获取最新内容</span>
          </div>
          <div class="log-relay-panel__actions">
            <a-tooltip title="刷新日志">
              <a-button :loading="loading" @click="refreshLogs">
                <template #icon><RefreshCw :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="复制全部日志">
              <a-button :disabled="!logContent" @click="copyText(logContent)">
                <template #icon><Copy :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="确定清空所有共享日志吗？"
              ok-text="清空"
              cancel-text="取消"
              :disabled="!logCount"
              @confirm="clearLogs"
            >
              <a-tooltip title="清空全部日志">
                <a-button danger :disabled="!logCount">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </div>

        <div class="log-relay-stats">
          <span><FileStack :size="14" />{{ logCount }} 条日志</span>
          <span><HardDrive :size="14" />{{ formatBytes(totalBytes) }}</span>
        </div>

        <div class="log-relay-entry-list" :class="{ 'log-relay-entry-list--empty': !entries.length }">
          <article v-for="(entry, index) in entries" :key="entry.id" class="log-relay-entry">
            <div class="log-relay-entry__head">
              <span class="log-relay-entry__index">#{{ index + 1 }}</span>
              <span class="log-relay-entry__time">{{ formatDate(entry.receivedAt) }}</span>
              <span class="log-relay-entry__bytes">{{ formatBytes(byteLength(entry.content)) }}</span>
              <a-tooltip title="复制这一条">
                <a-button type="text" size="small" @click="copyText(entry.content)">
                  <template #icon><Copy :size="14" /></template>
                </a-button>
              </a-tooltip>
            </div>
            <pre class="log-relay-entry__body">{{ entry.content }}</pre>
          </article>
          <div v-if="!entries.length" class="log-relay-empty">
            <Inbox :size="32" />
            <strong>暂无日志</strong>
            <span>发送内容后点击刷新即可查看</span>
          </div>
        </div>
      </article>
    </div>

    <LogRelayApiDocs v-model:open="docsVisible" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  BookOpen,
  Copy,
  Database,
  FileStack,
  HardDrive,
  Inbox,
  RefreshCw,
  Send,
  Trash2
} from 'lucide-vue-next'
import { clearLogRelayEntries, getLogRelayEntries, sendLogRelay } from '@/services/logRelay'
import LogRelayApiDocs from './LogRelayApiDocs.vue'

const draft = ref('')
const entries = ref([])
const logContent = ref('')
const logCount = ref(0)
const totalBytes = ref(0)
const loading = ref(false)
const sending = ref(false)
const docsVisible = ref(false)
const errorMessage = ref('')
const lastRefreshed = ref(null)

function byteLength(value) {
  return new TextEncoder().encode(value || '').length
}

function formatBytes(value) {
  if (!value) return '0 B'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(value) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

async function refreshLogs() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getLogRelayEntries()
    entries.value = data?.items || []
    logContent.value = data?.content || ''
    logCount.value = data?.count || 0
    totalBytes.value = data?.totalBytes || 0
    lastRefreshed.value = new Date()
  } catch (error) {
    errorMessage.value = error.message || '日志刷新失败'
  } finally {
    loading.value = false
  }
}

async function sendLog() {
  if (!draft.value.length) return
  sending.value = true
  errorMessage.value = ''
  try {
    await sendLogRelay(draft.value)
    draft.value = ''
    message.success('日志已发送，右侧内容已刷新')
    await refreshLogs()
  } catch (error) {
    errorMessage.value = error.message || '日志发送失败'
  } finally {
    sending.value = false
  }
}

async function clearLogs() {
  loading.value = true
  errorMessage.value = ''
  try {
    await clearLogRelayEntries()
    entries.value = []
    logContent.value = ''
    logCount.value = 0
    totalBytes.value = 0
    message.success('共享日志已清空')
  } catch (error) {
    errorMessage.value = error.message || '日志清空失败'
  } finally {
    loading.value = false
  }
}

async function copyText(value) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败，请检查浏览器剪贴板权限')
  }
}

onMounted(refreshLogs)
</script>

<style scoped>
.log-relay-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.log-relay-toolbar,
.log-relay-panel {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
}

.log-relay-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
}

.log-relay-toolbar > div:first-child,
.log-relay-panel__head > div:first-child {
  min-width: 0;
}

.log-relay-toolbar__eyebrow {
  margin-bottom: 3px;
  color: var(--console-primary);
  font-size: 12px;
  font-weight: 600;
}

.log-relay-toolbar h1,
.log-relay-panel h2 {
  margin: 0;
  color: var(--console-text-primary);
}

.log-relay-toolbar h1 {
  font-size: 20px;
  line-height: 1.35;
}

.log-relay-toolbar__actions,
.log-relay-panel__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-relay-toolbar__actions :deep(.ant-tag),
.log-relay-toolbar__actions :deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.log-relay-toolbar__actions :deep(.ant-tag) {
  gap: 5px;
  min-height: 30px;
  margin-inline-end: 0;
}

.log-relay-toolbar__actions :deep(.ant-btn-icon),
.log-relay-toolbar__actions :deep(.ant-tag .lucide) {
  display: inline-flex;
  align-items: center;
}

.log-relay-draft-size {
  color: var(--console-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}

.log-relay-alert {
  margin-bottom: 0;
}

.log-relay-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 16px;
  min-height: 0;
}

.log-relay-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 690px;
  padding: 18px;
}

.log-relay-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.log-relay-panel__head h2 {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 22px;
  font-size: 15px;
  line-height: 1.4;
}

.log-relay-panel__head > div:first-child > span {
  display: block;
  margin-top: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.log-relay-editor {
  flex: 1;
  min-height: 0;
}

.log-relay-editor :deep(textarea) {
  height: 100% !important;
  min-height: 300px;
  resize: none;
  border-color: var(--console-border-strong);
  background: var(--console-input-bg);
  color: var(--console-text-primary);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
}

.log-relay-stats {
  display: flex;
  gap: 16px;
  margin: -2px 0 12px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.log-relay-stats span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.log-relay-entry-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.log-relay-entry {
  overflow: hidden;
  margin-bottom: 10px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
}

.log-relay-entry:last-child {
  margin-bottom: 0;
}

.log-relay-entry__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 6px 0 10px;
  border-bottom: 1px solid var(--console-border);
  color: var(--console-text-secondary);
  font-size: 11px;
}

.log-relay-entry__index {
  color: var(--console-primary);
  font-weight: 700;
}

.log-relay-entry__time {
  flex: 1;
}

.log-relay-entry__body {
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 12px;
  color: var(--console-text-primary);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-relay-entry-list--empty {
  display: grid;
  place-items: center;
}

.log-relay-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.log-relay-empty strong {
  color: var(--console-text-primary);
  font-size: 14px;
}

@media (max-width: 1100px) {
  .log-relay-grid {
    grid-template-columns: 1fr;
  }

  .log-relay-panel {
    height: 580px;
  }
}

@media (max-width: 640px) {
  .log-relay-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .log-relay-toolbar__actions {
    width: 100%;
    justify-content: space-between;
  }

  .log-relay-panel {
    height: 540px;
    padding: 14px;
  }
}
</style>
