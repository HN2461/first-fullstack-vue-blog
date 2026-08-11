<template>
  <a-modal
    :open="open"
    :title="result ? '资源分享已创建' : '创建资源包分享'"
    width="680px"
    centered
    :mask-closable="false"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    @cancel="closeModal"
  >
    <div v-if="!result" class="media-share-create__scroll">
      <div class="media-share-create__selection">
        <div><strong>{{ mediaIds.length }}</strong><span>个资源将进入同一个分享页面</span></div>
        <a-tag :bordered="false" color="blue">资源包</a-tag>
      </div>

      <a-form layout="vertical">
        <a-form-item label="资源包名称" required>
          <a-input v-model:value="form.name" :maxlength="80" show-count placeholder="例如 Vue 3 项目模板与配套素材" />
        </a-form-item>
        <a-form-item label="资源包说明">
          <a-textarea v-model:value="form.description" :maxlength="500" :rows="3" show-count placeholder="可选，向访客说明资源内容和使用方式" />
        </a-form-item>
        <a-form-item label="分享方式" required>
          <a-radio-group v-model:value="form.mode" button-style="solid" class="media-share-create__mode">
            <a-radio-button value="public">直接公开</a-radio-button>
            <a-radio-button value="password">提取码访问</a-radio-button>
          </a-radio-group>
          <p class="media-share-create__field-note">
            {{ form.mode === 'public' ? '访客打开链接后即可查看和下载资源。' : '系统自动生成 4 位数字提取码，校验通过后才能查看资源。' }}
          </p>
        </a-form-item>

        <div class="media-share-create__grid">
          <a-form-item label="分享有效期">
            <a-select v-model:value="form.expiryPreset" :options="expiryOptions" />
          </a-form-item>
          <a-form-item v-if="form.expiryPreset === 'custom'" label="指定失效时间">
            <a-date-picker v-model:value="form.customExpiresAt" show-time format="YYYY-MM-DD HH:mm" style="width: 100%" />
          </a-form-item>
          <a-form-item label="访问人数上限">
            <div class="media-share-create__limit">
              <a-switch v-model:checked="form.limitEnabled" />
              <a-input-number v-if="form.limitEnabled" v-model:value="form.maxAccessCount" :min="1" :max="100000" style="width: 140px" />
              <span v-else>不限制</span>
            </div>
          </a-form-item>
        </div>
      </a-form>
    </div>

    <div v-else class="media-share-result">
      <a-result status="success" title="分享链接已生成" :sub-title="`${result.entryCount} 个资源 · ${modeLabel}`" />
      <div class="media-share-result__field">
        <span>分享链接</span>
        <div><code>{{ shareUrl }}</code><a-tooltip title="复制分享链接"><a-button type="text" aria-label="复制分享链接" @click="copyText(shareUrl, '分享链接已复制')"><template #icon><CopyOutlined /></template></a-button></a-tooltip></div>
      </div>
      <div v-if="result.extractionCode" class="media-share-result__code">
        <span>4 位提取码</span>
        <strong>{{ result.extractionCode }}</strong>
        <a-button size="small" @click="copyText(result.extractionCode, '提取码已复制')"><template #icon><CopyOutlined /></template>复制</a-button>
      </div>
      <a-alert v-if="result.extractionCode" type="warning" show-icon message="提取码仅在本次创建结果中展示，请与分享链接一起保存。" />
    </div>

    <template #footer>
      <a-button v-if="result" @click="closeModal">完成</a-button>
      <template v-else>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="submitShare">创建分享</a-button>
      </template>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { createAdminMediaShare } from '@/services/admin'

const props = defineProps({ open: { type: Boolean, default: false }, mediaIds: { type: Array, default: () => [] } })
const emit = defineEmits(['update:open', 'created'])
const submitting = ref(false)
const result = ref(null)
const form = reactive({ name: '', description: '', mode: 'public', expiryPreset: '7d', customExpiresAt: null, limitEnabled: false, maxAccessCount: 100 })
const expiryOptions = [
  { label: '1 天', value: '1d' },
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
  { label: '永久有效', value: 'never' },
  { label: '指定时间', value: 'custom' }
]
const shareUrl = computed(() => result.value ? new URL(result.value.sharePath, window.location.origin).href : '')
const modeLabel = computed(() => result.value?.mode === 'password' ? '提取码访问' : '直接公开')

watch(() => props.open, (visible) => {
  if (!visible) return
  result.value = null
  Object.assign(form, { name: `资源分享 ${dayjs().format('YYYY-MM-DD')}`, description: '', mode: 'public', expiryPreset: '7d', customExpiresAt: null, limitEnabled: false, maxAccessCount: 100 })
})

function getExpiresAt() {
  if (form.expiryPreset === 'never') return null
  if (form.expiryPreset === 'custom') return form.customExpiresAt?.toISOString() || ''
  const days = Number.parseInt(form.expiryPreset, 10)
  return dayjs().add(days, 'day').toISOString()
}

async function submitShare() {
  if (!form.name.trim()) return message.warning('请输入资源包名称')
  if (props.mediaIds.length === 0) return message.warning('请选择要分享的资源')
  const expiresAt = getExpiresAt()
  if (form.expiryPreset === 'custom' && !expiresAt) return message.warning('请选择分享失效时间')
  if (expiresAt && dayjs(expiresAt).isBefore(dayjs())) return message.warning('分享失效时间必须晚于当前时间')
  submitting.value = true
  try {
    result.value = await createAdminMediaShare({
      name: form.name.trim(),
      description: form.description.trim(),
      mediaIds: props.mediaIds,
      mode: form.mode,
      expiresAt,
      maxAccessCount: form.limitEnabled ? form.maxAccessCount : null
    })
    emit('created', result.value)
  } catch (error) {
    message.error(error.message || '资源分享创建失败')
  } finally {
    submitting.value = false
  }
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value)
    message.success(successMessage)
  } catch {
    message.error('复制失败，请手动复制')
  }
}

function closeModal() {
  emit('update:open', false)
}
</script>

<style scoped>
.media-share-create__scroll { max-height: min(62vh, 590px); overflow-y: auto; padding-right: 2px; scrollbar-width: none; }
.media-share-create__scroll::-webkit-scrollbar { display: none; }
.media-share-create__selection { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding: 12px 14px; border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface-muted); }
.media-share-create__selection > div { display: flex; align-items: baseline; gap: 6px; }
.media-share-create__selection strong { color: var(--console-primary-strong); font-size: 20px; }
.media-share-create__selection span, .media-share-create__field-note, .media-share-create__limit span { color: var(--console-text-secondary); font-size: 12px; }
.media-share-create__mode { width: 100%; }
.media-share-create__mode :deep(.ant-radio-button-wrapper) { width: 50%; text-align: center; }
.media-share-create__field-note { margin: 8px 0 0; line-height: 1.6; }
.media-share-create__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.media-share-create__limit { display: flex; align-items: center; gap: 12px; min-height: 32px; }
.media-share-result :deep(.ant-result) { padding: 8px 0 20px; }
.media-share-result__field { display: grid; gap: 6px; margin-bottom: 16px; }
.media-share-result__field > span, .media-share-result__code > span { color: var(--console-text-secondary); font-size: 12px; }
.media-share-result__field > div { display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: var(--console-surface-muted); }
.media-share-result__field code { flex: 1; min-width: 0; color: var(--console-text); overflow-wrap: anywhere; }
.media-share-result__code { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid var(--console-border); }
.media-share-result__code strong { color: var(--console-primary-strong); font-size: 24px; letter-spacing: 0; }
@media (max-width: 640px) { .media-share-create__grid { grid-template-columns: 1fr; } }
</style>
