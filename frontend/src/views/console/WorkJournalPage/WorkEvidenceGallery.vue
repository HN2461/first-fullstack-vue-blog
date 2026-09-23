<template>
  <section class="work-evidence">
    <div class="work-evidence__heading">
      <div>
        <strong>图片凭证</strong>
        <span>{{ items.length }} / 20</span>
        <a-tooltip v-if="!readonly && canManageMedia" title="在媒体资产中管理“工作日志”分类">
          <a-button type="text" size="small" aria-label="在媒体资产中管理图片凭证" @click="openMediaCategory"><template #icon><ExternalLink :size="14" /></template></a-button>
        </a-tooltip>
      </div>
      <input
        ref="fileInputRef"
        class="work-evidence__input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
        multiple
        aria-hidden="true"
        tabindex="-1"
        :disabled="uploading || items.length >= 20"
        @change="handleFiles"
      >
      <a-button v-if="!readonly" size="small" :loading="uploading" :disabled="items.length >= 20" @click="openFilePicker">
        <template #icon><Paperclip :size="15" /></template>
        添加图片
      </a-button>
    </div>

    <a-empty v-if="!items.length" class="work-evidence__empty" description="图片凭证仅授权后可读取，不会作为公开媒体文件提供" :image-style="{ height: '42px' }" />
    <div v-else class="work-evidence__grid">
      <article v-for="item in items" :key="item.id" class="work-evidence__item">
        <button class="work-evidence__preview" type="button" :aria-label="`预览 ${item.originalName}`" @click="preview(item)">
          <img v-if="previewUrls[item.id]" :src="previewUrls[item.id]" :alt="item.originalName">
          <span v-else class="work-evidence__loading">读取中…</span>
        </button>
        <div class="work-evidence__caption">
          <a-tooltip :title="item.originalName"><span>{{ item.originalName }}</span></a-tooltip>
          <div>
            <a-tooltip title="查看原图">
              <a-button type="text" size="small" :aria-label="`查看 ${item.originalName}`" @click="preview(item)">
                <template #icon><Expand :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip v-if="!readonly" title="删除图片凭证">
              <a-popconfirm title="删除这张图片凭证？" ok-text="删除" cancel-text="取消" @confirm="remove(item)">
                <a-button type="text" size="small" danger :aria-label="`删除 ${item.originalName}`">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-popconfirm>
            </a-tooltip>
          </div>
        </div>
      </article>
    </div>

    <a-modal
      :open="Boolean(previewItem)"
      :title="previewItem?.originalName || '图片凭证预览'"
      :footer="null"
      :width="900"
      :body-style="{ maxHeight: '72vh', overflow: 'hidden' }"
      wrap-class-name="work-journal-dialog work-evidence-dialog"
      @cancel="previewItem = null"
    >
      <div class="work-evidence__large">
        <img v-if="previewItem && previewUrls[previewItem.id]" :src="previewUrls[previewItem.id]" :alt="previewItem.originalName">
      </div>
      <div v-if="previewItem" class="work-evidence__integrity">
        SHA-256 <code>{{ previewItem.sha256 }}</code>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { Expand, ExternalLink, Paperclip, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { deleteWorkEvidence, getWorkEvidence, uploadWorkEvidence } from '@/services/workJournal'

const props = defineProps({
  log: { type: Object, default: null },
  readonly: { type: Boolean, default: false }
})
const router = useRouter()
const authStore = useAuthStore()
const canManageMedia = computed(() => authStore.canAccessPath('/console/manage/media'))
const emit = defineEmits(['changed'])
const items = ref([])
const fileInputRef = ref(null)
const previewUrls = ref({})
const previewItem = ref(null)
const uploading = ref(false)
let loadToken = 0

function revokePreviewUrls() {
  Object.values(previewUrls.value).forEach((url) => URL.revokeObjectURL(url))
  previewUrls.value = {}
}

async function loadPreviews(log) {
  const token = ++loadToken
  revokePreviewUrls()
  items.value = log?.evidence || []
  if (!log?.id || !items.value.length) return
  const pairs = await Promise.all(items.value.map(async (item) => {
    try {
      const blob = await getWorkEvidence(log.id, item.id)
      return [item.id, URL.createObjectURL(blob)]
    } catch {
      return [item.id, '']
    }
  }))
  if (token !== loadToken) {
    pairs.forEach(([, url]) => url && URL.revokeObjectURL(url))
    return
  }
  previewUrls.value = Object.fromEntries(pairs.filter(([, url]) => url))
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!props.log?.id || !files.length) return
  if (files.length + items.value.length > 20) {
    message.warning('一篇工作日记最多添加 20 张图片')
    return
  }
  uploading.value = true
  let uploadedCount = 0
  try {
    for (const file of files) {
      if (file.size > 15 * 1024 * 1024) throw new Error('单张图片不能超过 15MB')
      await uploadWorkEvidence(props.log.id, file)
      uploadedCount += 1
    }
    message.success(`已添加 ${files.length} 张图片凭证`)
    emit('changed')
  } catch (error) {
    if (uploadedCount) {
      message.warning(`已添加 ${uploadedCount} 张图片，其余图片未完成：${error.message || '上传失败'}`)
      emit('changed')
    } else {
      message.error(error.message || '上传图片凭证失败')
    }
  } finally {
    uploading.value = false
  }
}

function openFilePicker() {
  if (!uploading.value && items.value.length < 20) fileInputRef.value?.click()
}

function preview(item) {
  previewItem.value = item
}

function openMediaCategory() {
  router.push({ path: '/console/manage/media', query: { view: 'list', category: '工作日志' } })
}

async function remove(item) {
  try {
    await deleteWorkEvidence(props.log.id, item.id)
    message.success('图片凭证已删除')
    if (previewItem.value?.id === item.id) previewItem.value = null
    emit('changed')
  } catch (error) {
    message.error(error.message || '删除图片凭证失败')
  }
}

watch(() => props.log, loadPreviews, { immediate: true })
onBeforeUnmount(() => {
  loadToken += 1
  revokePreviewUrls()
})
</script>

<style scoped>
.work-evidence {
  padding-top: 15px;
  border-top: 1px solid var(--console-border, #e5e7eb);
}

.work-evidence__heading,
.work-evidence__heading > div,
.work-evidence__caption,
.work-evidence__caption > div {
  display: flex;
  align-items: center;
}

.work-evidence__heading,
.work-evidence__caption {
  justify-content: space-between;
  gap: 8px;
}

.work-evidence__heading > div {
  gap: 8px;
}

.work-evidence__heading > div > span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-evidence__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  opacity: 0;
  pointer-events: none;
}

.work-evidence__empty {
  margin: 15px 0 4px;
}

.work-evidence__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 12px;
  max-height: 310px;
  overflow: auto;
  padding: 12px 2px 2px;
}

.work-evidence__item {
  min-width: 0;
}

.work-evidence__preview {
  display: grid;
  width: 100%;
  height: 100px;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 5px;
  background: var(--console-surface-muted, #f7f8fa);
  cursor: zoom-in;
}

.work-evidence__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-evidence__loading {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-evidence__caption {
  height: 34px;
}

.work-evidence__caption > span {
  min-width: 0;
  overflow: hidden;
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-evidence__large {
  display: grid;
  height: min(62vh, 620px);
  place-items: center;
  overflow: auto;
  background: var(--console-surface-muted, #f7f8fa);
}

.work-evidence__large img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.work-evidence__integrity {
  padding-top: 10px;
  overflow-wrap: anywhere;
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.work-evidence__integrity code {
  color: inherit;
}
</style>
