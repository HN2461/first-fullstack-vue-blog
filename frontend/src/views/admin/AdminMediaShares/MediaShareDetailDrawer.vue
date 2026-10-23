<template>
  <a-drawer
    :open="open"
    :width="drawerWidth"
    class="share-detail-drawer"
    :body-style="{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }"
    @close="emit('update:open', false)"
  >
    <template #title>
      <div class="share-detail__title">
        <span>分享详情</span>
        <a-tag v-if="share" :color="statusMeta.color">{{ statusMeta.label }}</a-tag>
      </div>
    </template>

    <a-spin :spinning="loading" class="share-detail__spin">
      <div v-if="share" class="share-detail">
        <section class="share-detail__lead">
          <div>
            <h3>{{ share.name }}</h3>
            <p>{{ share.description || '暂无资源包说明' }}</p>
          </div>
          <a-tooltip title="打开访客分享页">
            <a-button aria-label="打开访客分享页" @click="openPublicPage">
              <template #icon><ExportOutlined /></template>
            </a-button>
          </a-tooltip>
        </section>

        <section class="share-detail__section">
          <h4>访问凭证</h4>
          <div class="share-detail__credential">
            <label>分享链接</label>
            <div><code>{{ shareUrl }}</code><a-button type="text" aria-label="复制分享链接" @click="copyText(shareUrl, '分享链接已复制')"><template #icon><CopyOutlined /></template></a-button></div>
          </div>
          <div v-if="share.mode === 'password'" class="share-detail__credential">
            <label>提取码</label>
            <div>
              <code class="share-detail__code">{{ revealedCode || '••••' }}</code>
              <a-tooltip :title="revealedCode ? '隐藏提取码' : '查看提取码'">
                <a-button type="text" :aria-label="revealedCode ? '隐藏提取码' : '查看提取码'" :loading="codeLoading" @click="toggleCode">
                  <template #icon><EyeInvisibleOutlined v-if="revealedCode" /><EyeOutlined v-else /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="复制提取码"><a-button type="text" aria-label="复制提取码" :disabled="!revealedCode" @click="copyText(revealedCode, '提取码已复制')"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
              <a-tooltip title="重新生成提取码"><a-button type="text" aria-label="重新生成提取码" :disabled="share.status === 'revoked'" @click="confirmResetCode"><template #icon><ReloadOutlined /></template></a-button></a-tooltip>
            </div>
          </div>
        </section>

        <section class="share-detail__section">
          <div class="share-detail__section-head"><h4>访问设置</h4><a-button size="small" :disabled="share.status === 'revoked'" @click="emit('edit', share)"><template #icon><EditOutlined /></template>编辑</a-button></div>
          <dl class="share-detail__metrics">
            <div><dt>分享方式</dt><dd>{{ share.mode === 'password' ? '提取码访问' : '直接公开' }}</dd></div>
            <div><dt>有效期</dt><dd>{{ share.expiresAt ? formatDate(share.expiresAt) : '永久有效' }}</dd></div>
            <div><dt>已访问人数</dt><dd>{{ getAccessLabel(share) }}</dd></div>
            <div><dt>页面浏览</dt><dd>{{ share.viewCount }} 次</dd></div>
            <div><dt>文件下载</dt><dd>{{ share.downloadCount }} 次</dd></div>
            <div><dt>创建时间</dt><dd>{{ formatDate(share.createdAt) }}</dd></div>
          </dl>
        </section>

        <section class="share-detail__section share-detail__resources">
          <div class="share-detail__section-head"><h4>资源清单</h4><span>{{ share.entryCount }} 个 · {{ formatFileSize(share.totalSize) }}</span></div>
          <div class="share-detail__resource-list">
            <div v-for="entry in share.entries" :key="entry.entryId" class="share-detail__resource">
              <FileOutlined />
              <div><strong :title="entry.originalName">{{ entry.originalName }}</strong><span>{{ entry.mimeType }} · {{ formatFileSize(entry.size) }}</span></div>
              <a-tag :color="entry.available ? 'success' : 'error'">{{ entry.available ? '可用' : '不可用' }}</a-tag>
              <a-tooltip :title="share.entries.length <= 1 ? '资源包至少保留一个资源，请撤销并删除整个分享' : '仅从此分享中移除，不会删除媒体文件'">
                <a-button
                  type="text"
                  danger
                  aria-label="从分享中移除资源"
                  :disabled="share.status === 'revoked' || share.entries.length <= 1"
                  :loading="removingEntryId === entry.entryId"
                  @click="confirmRemoveEntry(entry)"
                >
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </section>

        <div class="share-detail__footer">
          <a-button v-if="share.status !== 'revoked'" danger @click="emit('revoke', share)"><template #icon><StopOutlined /></template>撤销分享</a-button>
          <a-button v-else danger @click="emit('delete', share)"><template #icon><DeleteOutlined /></template>删除记录</a-button>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileOutlined,
  ReloadOutlined,
  StopOutlined
} from '@ant-design/icons-vue'
import { getAdminMediaShare, getAdminMediaShareCode, removeAdminMediaShareEntry, resetAdminMediaShareCode } from '@/services/admin'
import { buildShareUrl, formatDate, formatFileSize, getAccessLabel, getShareStatusMeta } from './mediaShareDisplay'

const props = defineProps({ open: { type: Boolean, default: false }, record: { type: Object, default: null } })
const emit = defineEmits(['update:open', 'edit', 'revoke', 'delete', 'entry-removed'])
const loading = ref(false)
const codeLoading = ref(false)
const removingEntryId = ref('')
const share = ref(null)
const revealedCode = ref('')
const drawerWidth = computed(() => window.innerWidth <= 720 ? 'calc(100vw - 16px)' : 680)
const statusMeta = computed(() => getShareStatusMeta(share.value?.status))
const shareUrl = computed(() => share.value ? buildShareUrl(share.value.sharePath) : '')

watch(() => [props.open, props.record?.id, props.record?.updatedAt], async ([visible]) => {
  revealedCode.value = ''
  if (!visible || !props.record?.id) return
  await loadDetail()
}, { immediate: true })

async function loadDetail() {
  loading.value = true
  try {
    share.value = await getAdminMediaShare(props.record.id)
  } catch (error) {
    message.error(error.message || '分享详情加载失败')
  } finally {
    loading.value = false
  }
}

async function toggleCode() {
  if (revealedCode.value) {
    revealedCode.value = ''
    return
  }
  codeLoading.value = true
  try {
    const result = await getAdminMediaShareCode(share.value.id)
    revealedCode.value = result.extractionCode
  } catch (error) {
    message.error(error.code === 'SHARE_CODE_UNAVAILABLE' ? '历史分享未保存可查看的提取码，请重新生成' : (error.message || '提取码读取失败'))
  } finally {
    codeLoading.value = false
  }
}

function confirmResetCode() {
  Modal.confirm({
    title: '重新生成提取码',
    content: '旧提取码和已经授权的访客会话将立即失效，访问人数会重新计数。',
    okText: '确认重新生成',
    async onOk() {
      const result = await resetAdminMediaShareCode(share.value.id)
      revealedCode.value = result.extractionCode
      message.success('提取码已重新生成')
      await loadDetail()
    }
  })
}

function confirmRemoveEntry(entry) {
  Modal.confirm({
    title: '从分享中移除资源',
    content: `移除「${entry.originalName}」后，访客将无法再通过此分享访问该资源；媒体文件本身不会删除。`,
    okText: '确认移除',
    okType: 'danger',
    async onOk() {
      removingEntryId.value = entry.entryId
      try {
        share.value = await removeAdminMediaShareEntry(share.value.id, entry.entryId)
        emit('entry-removed', share.value)
        message.success('已从分享中移除该资源')
      } finally {
        removingEntryId.value = ''
      }
    }
  })
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value)
    message.success(successMessage)
  } catch {
    message.error('复制失败，请手动复制')
  }
}

function openPublicPage() {
  window.open(shareUrl.value, '_blank', 'noopener,noreferrer')
}
</script>
