<template>
  <a-modal
    :open="open"
    :title="result ? '共享阅读链接' : '快速共享文章'"
    :width="640"
    :confirm-loading="saving"
    :ok-text="result ? '关闭' : (reusable && !forceCreate ? '复制已有链接' : '生成并复制链接')"
    :cancel-text="result ? undefined : '取消'"
    :cancel-button-props="result ? { style: { display: 'none' } } : undefined"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    @update:open="handleOpenChange"
    @ok="result ? close() : submit()"
    @cancel="close"
  >
    <div class="article-share-create-modal">
      <template v-if="!result">
        <div class="article-share-create-modal__article">
          <span class="article-share-create-modal__eyebrow">当前文章</span>
          <strong>{{ article?.title || '未选择文章' }}</strong>
          <span v-if="article?.category?.name" class="article-share-create-modal__muted">目录：{{ article.category.name }}</span>
        </div>

        <a-form layout="vertical">
          <a-form-item label="分享范围">
            <a-radio-group v-model:value="form.scopeType" class="article-share-create-modal__scope" button-style="solid" @change="checkReusable">
              <a-radio-button value="article">仅当前文章</a-radio-button>
              <a-radio-button v-if="openCategoryId" value="category">当前目录</a-radio-button>
              <a-radio-button value="articles">自选多篇</a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item v-if="form.scopeType === 'category'" label="文章目录">
            <a-input :value="article?.category?.name || '未分类'" disabled />
            <a-checkbox v-model:checked="form.includeDescendants" class="article-share-create-modal__checkbox" @change="checkReusable">包含子目录中的文章</a-checkbox>
          </a-form-item>

          <a-form-item v-if="form.scopeType === 'articles'" label="选择文章" required>
            <a-select
              v-model:value="form.articleIds"
              mode="multiple"
              show-search
              option-filter-prop="label"
              :max-tag-count="3"
              :options="articleOptions"
              :loading="loadingSources"
              placeholder="搜索并选择至少 2 篇文章"
              @change="checkReusable"
            />
          </a-form-item>

          <a-alert v-if="reusable && !forceCreate" type="info" show-icon class="article-share-create-modal__reuse" message="发现相同范围的有效分享，将直接复用" :description="`${reusable.entryCount} 篇文章 · ${reusable.mode === 'password' ? '需要提取码' : '直接访问'}`">
            <template #action><a-button type="link" size="small" @click="chooseNewShare">新建另一条</a-button></template>
          </a-alert>

          <div class="article-share-create-modal__grid">
            <a-form-item label="访问方式">
              <a-select v-model:value="form.mode" :options="modeOptions" />
            </a-form-item>
            <a-form-item label="有效期">
              <a-select v-model:value="form.expiryMode" :options="expiryOptions" />
            </a-form-item>
          </div>

          <a-form-item v-if="form.expiryMode === 'custom'" label="失效时间">
            <a-date-picker v-model:value="form.expiresAt" show-time format="YYYY-MM-DD HH:mm" style="width: 100%" />
          </a-form-item>
          <a-form-item label="分享标题">
            <a-input v-model:value="form.title" maxlength="120" show-count placeholder="留空则使用文章或目录名称" />
          </a-form-item>
          <a-form-item label="分享说明">
            <a-textarea v-model:value="form.description" :rows="3" maxlength="500" show-count placeholder="可选" />
          </a-form-item>
        </a-form>
      </template>

      <template v-else>
        <a-result status="success" :title="reused ? '已复用现有分享' : '共享阅读链接已生成'" :sub-title="`${result.entryCount} 篇文章 · ${result.mode === 'password' ? '提取码访问' : '直接访问'}`" />
        <div class="article-share-create-modal__result">
          <div class="article-share-create-modal__result-row">
            <span>访客链接</span>
            <code>{{ shareUrl(result) }}</code>
            <a-tooltip title="复制共享链接"><a-button type="text" aria-label="复制共享链接" @click="copyText(shareUrl(result), '共享链接已复制')"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
          </div>
          <div v-if="result.extractionCode" class="article-share-create-modal__result-row">
            <span>提取码</span>
            <code>{{ result.extractionCode }}</code>
            <a-tooltip title="复制提取码"><a-button type="text" aria-label="复制提取码" @click="copyText(result.extractionCode, '提取码已复制')"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
          </div>
        </div>
        <div class="article-share-create-modal__result-actions">
          <a-button type="primary" @click="copyPackage">复制链接和提取码</a-button>
          <a-button @click="openPublicPage">打开访客页面</a-button>
          <a-button type="link" @click="resetForAnother">新建另一条</a-button>
        </div>
      </template>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { createAdminArticleShare, findReusableAdminArticleShare, listArticleShareSources } from '@/services/articleShare'

const props = defineProps({
  open: { type: Boolean, default: false },
  article: { type: Object, default: null }
})
const emit = defineEmits(['update:open', 'created'])

const modeOptions = [{ label: '直接访问', value: 'public' }, { label: '提取码访问', value: 'password' }]
const expiryOptions = [{ label: '永久有效', value: 'never' }, { label: '指定时间', value: 'custom' }]
const openCategoryId = computed(() => props.article?.category?.id || props.article?.category?._id || '')
const form = ref(createForm())
const articleOptions = ref([])
const loadingSources = ref(false)
const saving = ref(false)
const reusable = ref(null)
const result = ref(null)
const reused = ref(false)
const forceCreate = ref(false)

function createForm() {
  const categoryId = openCategoryId.value
  return {
    scopeType: categoryId ? 'category' : 'article',
    articleId: props.article?.id || undefined,
    articleIds: props.article?.id ? [props.article.id] : [],
    categoryId: categoryId || undefined,
    includeDescendants: false,
    title: '',
    description: '',
    mode: 'public',
    expiryMode: 'never',
    expiresAt: null
  }
}

function handleOpenChange(value) {
  emit('update:open', value)
  if (value) initialize()
}

async function initialize() {
  result.value = null
  reused.value = false
  forceCreate.value = false
  form.value = createForm()
  reusable.value = null
  await loadSources()
  await checkReusable()
}

async function loadSources() {
  if (articleOptions.value.length) return
  loadingSources.value = true
  try {
    const sources = await listArticleShareSources({ pageSize: 500 })
    articleOptions.value = (sources?.articles || []).map((item) => ({ label: item.title, value: item.id }))
  } catch (error) {
    message.error(error.message || '分享来源加载失败')
  } finally {
    loadingSources.value = false
  }
}

function scopePayload() {
  const payload = { scopeType: form.value.scopeType, includeDescendants: form.value.includeDescendants }
  if (form.value.scopeType === 'article') payload.articleId = props.article?.id
  if (form.value.scopeType === 'category') payload.categoryId = form.value.categoryId
  if (form.value.scopeType === 'articles') payload.articleIds = form.value.articleIds
  return payload
}

async function checkReusable() {
  forceCreate.value = false
  reusable.value = null
  const payload = scopePayload()
  if ((payload.scopeType === 'articles' && payload.articleIds.length < 2) || (payload.scopeType === 'category' && !payload.categoryId) || (payload.scopeType === 'article' && !payload.articleId)) return
  try {
    reusable.value = await findReusableAdminArticleShare(payload)
  } catch {
    reusable.value = null
  }
}

async function submit() {
  if (form.value.scopeType === 'articles' && form.value.articleIds.length < 2) return message.warning('请至少选择 2 篇文章')
  if (form.value.expiryMode === 'custom' && (!form.value.expiresAt || form.value.expiresAt.isBefore(dayjs()))) return message.warning('请选择未来的失效时间')
  saving.value = true
  try {
    const existing = forceCreate.value ? null : await findReusableAdminArticleShare(scopePayload())
    if (existing) {
      result.value = existing
      reused.value = true
      emit('created', existing)
      await copyPackage()
      return
    }
    result.value = await createAdminArticleShare({ ...scopePayload(), title: form.value.title, description: form.value.description, mode: form.value.mode, expiresAt: form.value.expiryMode === 'custom' ? form.value.expiresAt.toISOString() : null })
    emit('created', result.value)
    await copyPackage()
  } catch (error) {
    message.error(error.message || '共享阅读链接生成失败')
  } finally {
    saving.value = false
  }
}

function shareUrl(record) { return new URL(record.sharePath, window.location.origin).toString() }
async function copyText(value, successMessage) { try { await navigator.clipboard.writeText(value); message.success(successMessage) } catch { message.error('复制失败，请手动复制') } }
async function copyPackage() { await copyText(result.value.extractionCode ? `共享链接：${shareUrl(result.value)}\n提取码：${result.value.extractionCode}` : shareUrl(result.value), '分享内容已复制') }
function openPublicPage() { window.open(shareUrl(result.value), '_blank', 'noopener,noreferrer') }
function chooseNewShare() { forceCreate.value = true }
function resetForAnother() { result.value = null; reused.value = false; reusable.value = null; forceCreate.value = true }
function close() { emit('update:open', false) }

watch(() => props.open, (value) => { if (value) initialize() })
</script>

<style scoped>
.article-share-create-modal { max-height: 68vh; overflow-y: auto; padding: 2px 2px 4px; color: var(--console-text, #101828); }
.article-share-create-modal__article { display: grid; gap: 4px; margin-bottom: 18px; padding: 14px 16px; border: 1px solid var(--console-border, #e5e7eb); border-left: 3px solid var(--console-primary, #1677ff); background: var(--console-surface-muted, #fafafa); }
.article-share-create-modal__eyebrow { color: var(--console-text-tertiary, #98a2b3); font-size: 12px; }
.article-share-create-modal__muted { color: var(--console-text-secondary, #667085); font-size: 12px; }
.article-share-create-modal__checkbox { display: block; margin-top: 10px; }
.article-share-create-modal__scope { display: flex; flex-wrap: wrap; }
.article-share-create-modal__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.article-share-create-modal__reuse { margin: 0 0 16px; }
.article-share-create-modal__result { display: grid; gap: 10px; padding: 14px 16px; border: 1px solid var(--console-border, #e5e7eb); background: var(--console-surface-muted, #fafafa); }
.article-share-create-modal__result-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.article-share-create-modal__result-row > span { width: 56px; flex: 0 0 auto; color: var(--console-text-secondary, #667085); font-size: 12px; }
.article-share-create-modal__result-row code { min-width: 0; flex: 1; overflow-wrap: anywhere; color: var(--console-primary, #1677ff); font-size: 12px; }
.article-share-create-modal__result-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 16px; }
@media (max-width: 620px) { .article-share-create-modal__scope :deep(.ant-radio-button-wrapper) { flex: 1 1 auto; text-align: center; } .article-share-create-modal__grid { grid-template-columns: 1fr; } .article-share-create-modal__result-actions > .ant-btn-primary { width: 100%; } }
</style>
