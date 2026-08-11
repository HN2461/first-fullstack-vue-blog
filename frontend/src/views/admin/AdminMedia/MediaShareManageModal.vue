<template>
  <a-modal :open="open" title="资源分享管理" :footer="null" width="900px" centered :body-style="{ height: 'min(68vh, 680px)', overflow: 'hidden', padding: 0 }" @cancel="emit('update:open', false)">
    <div class="media-share-manage">
      <div class="media-share-manage__toolbar">
        <span>创建后的公开链接、有效期和访问额度都在这里统一管理。</span>
        <a-tooltip title="刷新分享列表"><a-button type="text" aria-label="刷新分享列表" :loading="loading" @click="loadShares"><template #icon><ReloadOutlined /></template></a-button></a-tooltip>
      </div>
      <a-spin :spinning="loading" class="media-share-manage__body">
        <a-empty v-if="!loading && shares.length === 0" description="暂无资源分享" />
        <div v-else class="media-share-manage__list">
          <article v-for="item in shares" :key="item.id" class="media-share-row">
            <div class="media-share-row__main">
              <div class="media-share-row__title"><strong>{{ item.name }}</strong><a-tag :bordered="false" :color="statusColor(item.status)">{{ statusLabel(item.status) }}</a-tag><a-tag :bordered="false">{{ item.mode === 'password' ? '提取码' : '公开' }}</a-tag></div>
              <p>{{ item.entryCount }} 个资源 · {{ formatFileSize(item.totalSize) }} · {{ accessLabel(item) }}</p>
              <code>{{ buildShareUrl(item.sharePath) }}</code>
            </div>
            <div class="media-share-row__meta">
              <span>有效期</span><strong>{{ item.expiresAt ? formatDate(item.expiresAt) : '永久有效' }}</strong>
              <span>下载</span><strong>{{ item.downloadCount }} 次</strong>
            </div>
            <div class="media-share-row__actions">
              <a-tooltip title="复制分享链接"><a-button type="text" aria-label="复制分享链接" @click="copyShareUrl(item)"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="编辑分享配置"><a-button type="text" aria-label="编辑分享配置" :disabled="item.status === 'revoked'" @click="openEdit(item)"><template #icon><EditOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="撤销分享"><a-button type="text" danger aria-label="撤销分享" :disabled="item.status === 'revoked'" @click="confirmRevoke(item)"><template #icon><StopOutlined /></template></a-button></a-tooltip>
            </div>
          </article>
        </div>
      </a-spin>
    </div>
  </a-modal>

  <a-modal v-model:open="editVisible" title="编辑分享配置" width="560px" centered :confirm-loading="saving" ok-text="保存配置" @ok="saveEdit">
    <a-form layout="vertical">
      <a-form-item label="资源包名称"><a-input v-model:value="editForm.name" :maxlength="80" /></a-form-item>
      <a-form-item label="资源包说明"><a-textarea v-model:value="editForm.description" :maxlength="500" :rows="3" /></a-form-item>
      <div class="media-share-edit__grid">
        <a-form-item label="有效期">
          <a-select v-model:value="editForm.expiryMode" :options="[{ label: '永久有效', value: 'never' }, { label: '指定时间', value: 'custom' }]" />
        </a-form-item>
        <a-form-item v-if="editForm.expiryMode === 'custom'" label="失效时间"><a-date-picker v-model:value="editForm.expiresAt" show-time format="YYYY-MM-DD HH:mm" style="width: 100%" /></a-form-item>
        <a-form-item label="访问人数上限">
          <div class="media-share-edit__limit"><a-switch v-model:checked="editForm.limitEnabled" /><a-input-number v-if="editForm.limitEnabled" v-model:value="editForm.maxAccessCount" :min="Math.max(1, editRecord?.accessCount || 1)" :max="100000" /><span v-else>不限制</span></div>
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message, Modal } from 'ant-design-vue'
import { CopyOutlined, EditOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons-vue'
import { listAdminMediaShares, revokeAdminMediaShare, updateAdminMediaShare } from '@/services/admin'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open'])
const loading = ref(false)
const saving = ref(false)
const shares = ref([])
const editVisible = ref(false)
const editRecord = ref(null)
const editForm = reactive({ name: '', description: '', expiryMode: 'never', expiresAt: null, limitEnabled: false, maxAccessCount: 100 })

watch(() => props.open, (visible) => { if (visible) loadShares() })

async function loadShares() {
  loading.value = true
  try {
    const result = await listAdminMediaShares({ page: 1, pageSize: 100 })
    shares.value = result.items
  } catch (error) {
    message.error(error.message || '分享列表加载失败')
  } finally {
    loading.value = false
  }
}

function buildShareUrl(path) { return new URL(path, window.location.origin).href }
function statusLabel(status) { return ({ active: '生效中', expired: '已过期', exhausted: '次数已用尽', revoked: '已撤销' }[status] || status) }
function statusColor(status) { return ({ active: 'green', expired: 'orange', exhausted: 'gold', revoked: 'default' }[status] || 'default') }
function accessLabel(item) { return item.maxAccessCount === null ? `已访问 ${item.accessCount} 人` : `已访问 ${item.accessCount}/${item.maxAccessCount} 人` }
function formatDate(value) { return dayjs(value).format('YYYY-MM-DD HH:mm') }
function formatFileSize(size = 0) { if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`; if (size >= 1024) return `${Math.round(size / 1024)} KB`; return `${size} B` }

async function copyShareUrl(item) {
  try { await navigator.clipboard.writeText(buildShareUrl(item.sharePath)); message.success('分享链接已复制') } catch { message.error('复制失败，请手动复制') }
}

function openEdit(item) {
  editRecord.value = item
  Object.assign(editForm, { name: item.name, description: item.description || '', expiryMode: item.expiresAt ? 'custom' : 'never', expiresAt: item.expiresAt ? dayjs(item.expiresAt) : null, limitEnabled: item.maxAccessCount !== null, maxAccessCount: item.maxAccessCount || Math.max(100, item.accessCount) })
  editVisible.value = true
}

async function saveEdit() {
  if (!editForm.name.trim()) return message.warning('请输入资源包名称')
  if (editForm.expiryMode === 'custom' && !editForm.expiresAt) return message.warning('请选择分享失效时间')
  if (editForm.expiresAt && editForm.expiresAt.isBefore(dayjs())) return message.warning('分享失效时间必须晚于当前时间')
  saving.value = true
  try {
    await updateAdminMediaShare(editRecord.value.id, { name: editForm.name.trim(), description: editForm.description.trim(), expiresAt: editForm.expiryMode === 'never' ? null : editForm.expiresAt.toISOString(), maxAccessCount: editForm.limitEnabled ? editForm.maxAccessCount : null })
    message.success('分享配置已更新')
    editVisible.value = false
    await loadShares()
  } catch (error) {
    message.error(error.message || '分享配置更新失败')
  } finally {
    saving.value = false
  }
}

function confirmRevoke(item) {
  Modal.confirm({
    title: '撤销资源分享',
    content: `撤销后，访客将无法继续预览或下载「${item.name}」中的资源。`,
    okText: '确认撤销',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await revokeAdminMediaShare(item.id)
        message.success('资源分享已撤销')
        await loadShares()
      } catch (error) {
        message.error(error.message || '资源分享撤销失败')
        throw error
      }
    }
  })
}
</script>

<style scoped>
.media-share-manage { display: grid; grid-template-rows: auto minmax(0, 1fr); height: 100%; }
.media-share-manage__toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 48px; padding: 0 16px; border-bottom: 1px solid var(--console-border); color: var(--console-text-secondary); font-size: 12px; }
.media-share-manage__body { min-height: 0; overflow: hidden; }
.media-share-manage__body :deep(.ant-spin-container) { height: 100%; }
.media-share-manage__list { height: 100%; overflow-y: auto; padding: 6px 16px 16px; scrollbar-width: none; }
.media-share-manage__list::-webkit-scrollbar { display: none; }
.media-share-row { display: grid; grid-template-columns: minmax(0, 1fr) 180px auto; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--console-border); }
.media-share-row__main { min-width: 0; }
.media-share-row__title { display: flex; align-items: center; gap: 7px; min-width: 0; }
.media-share-row__title strong { overflow: hidden; color: var(--console-text); text-overflow: ellipsis; white-space: nowrap; }
.media-share-row__main p { margin: 5px 0; color: var(--console-text-secondary); font-size: 12px; }
.media-share-row__main code { display: block; overflow: hidden; color: var(--console-text-tertiary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.media-share-row__meta { display: grid; grid-template-columns: 48px 1fr; gap: 4px 8px; font-size: 12px; }
.media-share-row__meta span, .media-share-edit__limit span { color: var(--console-text-tertiary); }
.media-share-row__meta strong { color: var(--console-text-secondary); font-weight: 500; }
.media-share-row__actions { display: flex; align-items: center; }
.media-share-edit__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.media-share-edit__limit { display: flex; align-items: center; gap: 10px; min-height: 32px; }
@media (max-width: 720px) { .media-share-row { grid-template-columns: 1fr auto; } .media-share-row__meta { grid-column: 1 / -1; } .media-share-edit__grid { grid-template-columns: 1fr; } }
</style>
