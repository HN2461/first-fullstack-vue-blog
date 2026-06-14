<template>
  <section class="writer-studio">
    <header class="writer-studio__topbar">
      <input
        v-model.trim="form.title"
        class="writer-studio__title"
        type="text"
        maxlength="120"
        placeholder="输入文章标题"
        @input="handleTitleInput"
      >

      <div class="writer-studio__actions">
        <a-segmented
          v-model:value="viewMode"
          class="writer-studio__mode-switch"
          :options="viewModeOptions"
        />
        <a-button :loading="saving" @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" :loading="publishing" @click="openPublishModal">发布</a-button>
      </div>
    </header>

    <div class="writer-studio__body">
      <div v-if="viewMode === 'preview'" class="writer-studio__preview-board">
        <div class="writer-studio__preview-header">
          <h1>{{ form.title.trim() || '无标题文章' }}</h1>
        </div>
        <div class="writer-studio__preview-body">
          <MdPreview
            :id="`${editorId}-preview-mode`"
            class="writer-studio__preview-content"
            :model-value="form.contentMarkdown"
            theme="light"
            preview-theme="github"
            code-theme="atom"
          />
        </div>
      </div>

      <div v-else class="writer-studio__editor-shell">
        <MdEditor
          :id="editorId"
          v-model="form.contentMarkdown"
          :class="['writer-studio__editor', { 'writer-studio__editor--compare': viewMode === 'compare' }]"
          theme="light"
          language="zh-CN"
          preview-theme="github"
          code-theme="atom"
          placeholder="开始在线写作"
          :toolbars="toolbars"
          :show-code-row-number="true"
          :tab-width="2"
          :auto-detect-code="true"
          :input-box-width="viewMode === 'compare' ? '50%' : '100%'"
          :footers="[]"
          :preview="viewMode === 'compare'"
          :no-upload-img="false"
          :on-upload-img="handleUploadImg"
        />
      </div>
    </div>

    <a-modal
      v-model:open="publishModalVisible"
      title="发布文章"
      :confirm-loading="publishing"
      :mask-closable="false"
      centered
      width="720px"
      ok-text="确认发布"
      cancel-text="取消"
      @ok="confirmPublish"
      @cancel="closePublishModal"
    >
      <a-form layout="vertical" class="publish-form">
        <a-form-item label="文章摘要">
          <a-textarea
            v-model:value.trim="publishForm.summary"
            :rows="4"
            :maxlength="300"
            show-count
            placeholder="建议用 2-3 句话总结文章内容与价值。"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属分类">
              <div class="publish-field-row">
                <a-select
                  v-model:value="publishForm.category"
                  allow-clear
                  placeholder="选择分类"
                  :options="categoryOptions"
                />
                <a-button @click="openCategoryModal">新建</a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="推荐文章">
              <a-switch
                v-model:checked="publishForm.isRecommended"
                checked-children="推荐"
                un-checked-children="普通"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="文章标签">
          <div class="publish-field-row">
            <a-select
              v-model:value="publishForm.tags"
              mode="multiple"
              allow-clear
              placeholder="选择标签"
              :options="tagOptions"
              :max-tag-count="4"
            />
            <a-button @click="openTagModal">新建</a-button>
          </div>
        </a-form-item>

        <a-form-item label="封面图片地址">
          <a-input-group compact>
            <a-input
              v-model:value.trim="publishForm.cover"
              style="width: calc(100% - 96px)"
              placeholder="可选，填写封面图 URL"
            />
            <a-button style="width: 96px" @click="openCoverPicker">选择图片</a-button>
          </a-input-group>
          <div v-if="publishForm.cover" class="cover-preview">
            <img :src="publishForm.cover" alt="封面预览">
          </div>
        </a-form-item>

        <a-form-item label="关联资源">
          <div class="publish-resource-toolbar">
            <a-button @click="openResourcePicker">从媒体库选择</a-button>
          </div>
          <div v-if="publishForm.resources.length === 0" class="publish-resource-empty">
            当前还没有关联资源
          </div>
          <div v-else class="publish-resource-list">
            <div
              v-for="(resource, index) in publishForm.resources"
              :key="`${resource.url}-${index}`"
              class="publish-resource-item"
            >
              <div class="publish-resource-item__meta">
                <strong>{{ resource.name }}</strong>
                <span>{{ resource.kind === 'image' ? '图片资源' : '附件资源' }}</span>
              </div>
              <a-input
                v-model:value.trim="resource.description"
                placeholder="资源说明，可选"
              />
              <a-button danger @click="removeResource(index)">移除</a-button>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="mediaPickerVisible"
      title="选择封面图片"
      width="920px"
      :footer="null"
      centered
      @cancel="closeMediaPicker"
    >
      <div class="media-picker">
        <div class="media-picker__toolbar">
          <a-input-search
            v-model:value="mediaKeyword"
            placeholder="搜索文件名"
            allow-clear
            style="width: 240px"
            @search="loadMediaOptions"
          />
          <a-button @click="loadMediaOptions">刷新</a-button>
        </div>

        <div v-if="mediaLoading" class="media-picker__status">正在加载媒体文件...</div>
        <div v-else-if="mediaItems.length === 0" class="media-picker__status">暂无可用图片，请先上传图片素材。</div>

        <div v-else class="media-picker__grid">
          <button
            v-for="item in mediaItems"
            :key="item.id"
            type="button"
            class="media-picker__card"
            @click="selectCoverImage(item)"
          >
            <div class="media-picker__thumb">
              <img :src="item.url" :alt="item.originalName">
            </div>
            <strong>{{ item.originalName }}</strong>
            <span>{{ Math.ceil((item.size || 0) / 1024) }} KB</span>
          </button>
        </div>

        <div v-if="mediaTotal > mediaPageSize" class="media-picker__pagination">
          <a-pagination
            v-model:current="mediaPage"
            :page-size="mediaPageSize"
            :total="mediaTotal"
            size="small"
            @change="loadMediaOptions"
          />
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="resourcePickerVisible"
      title="选择关联资源"
      width="920px"
      :footer="null"
      centered
      @cancel="closeResourcePicker"
    >
      <div class="media-picker">
        <div class="media-picker__toolbar">
          <a-input-search
            v-model:value="resourceKeyword"
            placeholder="搜索文件名"
            allow-clear
            style="width: 240px"
            @search="loadResourceOptions"
          />
          <a-button @click="loadResourceOptions">刷新</a-button>
        </div>

        <div v-if="resourceLoading" class="media-picker__status">正在加载资源...</div>
        <div v-else-if="resourceItems.length === 0" class="media-picker__status">暂无可用资源，请先上传媒体文件。</div>

        <div v-else class="media-picker__grid">
          <button
            v-for="item in resourceItems"
            :key="item.id"
            type="button"
            class="media-picker__card"
            @click="selectArticleResource(item)"
          >
            <div class="media-picker__thumb" :class="{ 'media-picker__thumb--file': item.kind !== 'image' }">
              <img v-if="item.kind === 'image'" :src="item.url" :alt="item.originalName">
              <span v-else>{{ item.originalName.split('.').at(-1)?.toUpperCase() || 'FILE' }}</span>
            </div>
            <strong>{{ item.originalName }}</strong>
            <span>{{ Math.ceil((item.size || 0) / 1024) }} KB</span>
          </button>
        </div>

        <div v-if="resourceTotal > resourcePageSize" class="media-picker__pagination">
          <a-pagination
            v-model:current="resourcePage"
            :page-size="resourcePageSize"
            :total="resourceTotal"
            size="small"
            @change="loadResourceOptions"
          />
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="categoryModalVisible"
      title="新建分类"
      :confirm-loading="categorySubmitting"
      centered
      ok-text="保存分类"
      cancel-text="取消"
      @ok="handleCreateCategory"
      @cancel="closeCategoryModal"
    >
      <a-form layout="vertical">
        <a-form-item label="分类名称" required>
          <a-input v-model:value.trim="categoryDraft.name" placeholder="例如 产品文档" />
        </a-form-item>
        <a-form-item label="分类路径">
          <a-input v-model:value.trim="categoryDraft.slug" placeholder="不填则自动生成" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="tagModalVisible"
      title="新建标签"
      :confirm-loading="tagSubmitting"
      centered
      ok-text="保存标签"
      cancel-text="取消"
      @ok="handleCreateTag"
      @cancel="closeTagModal"
    >
      <a-form layout="vertical">
        <a-form-item label="标签名称" required>
          <a-input v-model:value.trim="tagDraft.name" placeholder="例如 入门指南" />
        </a-form-item>
        <a-form-item label="标签路径">
          <a-input v-model:value.trim="tagDraft.slug" placeholder="不填则自动生成" />
        </a-form-item>
        <a-form-item label="标签颜色">
          <a-input v-model:value.trim="tagDraft.color" placeholder="#1677ff" />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import 'md-editor-v3/lib/preview.css'
import {
  createAdminArticle,
  createAdminCategory,
  createAdminTag,
  getAdminArticle,
  listAllAdminCategories,
  listAdminMedia,
  listAllAdminTags,
  publishAdminArticle,
  updateAdminArticle,
  uploadAdminMedia
} from '@/services/admin'
import { useUnsavedChanges } from '@/composables/useAdminUi'

const route = useRoute()
const router = useRouter()
const articleId = computed(() => route.params.id)
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const publishModalVisible = ref(false)
const mediaPickerVisible = ref(false)
const resourcePickerVisible = ref(false)
const categoryModalVisible = ref(false)
const tagModalVisible = ref(false)
const categorySubmitting = ref(false)
const tagSubmitting = ref(false)
const mediaLoading = ref(false)
const resourceLoading = ref(false)
const categories = ref([])
const tags = ref([])
const mediaItems = ref([])
const mediaKeyword = ref('')
const mediaPage = ref(1)
const mediaPageSize = 12
const mediaTotal = ref(0)
const resourceItems = ref([])
const resourceKeyword = ref('')
const resourcePage = ref(1)
const resourcePageSize = 12
const resourceTotal = ref(0)
const editorId = 'knowledge-writer-editor'
const viewMode = ref('edit')
const viewModeOptions = [
  { label: '编辑', value: 'edit' },
  { label: '对比', value: 'compare' },
  { label: '预览', value: 'preview' }
]

const toolbars = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  'fullscreen'
]

const form = reactive({
  title: '',
  contentMarkdown: '',
  status: 'draft'
})

const publishForm = reactive({
  summary: '',
  category: undefined,
  tags: [],
  cover: '',
  isRecommended: false,
  resources: []
})
const categoryDraft = reactive({
  name: '',
  slug: ''
})
const tagDraft = reactive({
  name: '',
  slug: '',
  color: '#1677ff'
})

const { markClean, pauseTracking } = useUnsavedChanges({
  getSnapshot: () => ({
    title: form.title.trim(),
    contentMarkdown: form.contentMarkdown,
    publish: normalizePublishPayload()
  }),
  enabled: () => !loading.value && !saving.value && !publishing.value,
  title: '离开写作页面？',
  content: '当前文章还有未保存修改，离开后将丢失本次写作内容。'
})

const categoryOptions = computed(() => categories.value.map((item) => ({
  label: item.name,
  value: item.id
})))

const tagOptions = computed(() => tags.value.map((item) => ({
  label: item.name,
  value: item.id
})))

function handleTitleInput() {
  return form.title
}

function normalizePublishPayload() {
  return {
    summary: publishForm.summary.trim(),
    category: publishForm.category || null,
    tags: Array.isArray(publishForm.tags) ? publishForm.tags : [],
    cover: publishForm.cover.trim(),
    isRecommended: !!publishForm.isRecommended,
    resources: Array.isArray(publishForm.resources)
      ? publishForm.resources.map((item) => ({
        mediaId: item.mediaId || null,
        name: item.name,
        url: item.url,
        kind: item.kind,
        description: item.description || '',
        fileSize: item.fileSize || 0,
        mimeType: item.mimeType || ''
      }))
      : []
  }
}

function buildSimpleSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/[\u4e00-\u9fa5]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeArticlePayload(status = 'draft') {
  return {
    title: form.title.trim(),
    contentMarkdown: form.contentMarkdown,
    status,
    ...normalizePublishPayload()
  }
}

function applyArticleToForm(article) {
  form.title = article.title || ''
  form.contentMarkdown = article.contentMarkdown || ''
  form.status = article.status || 'draft'

  publishForm.summary = article.summary || ''
  publishForm.category = article.category?.id || article.category || undefined
  publishForm.tags = (article.tags || []).map((tag) => tag.id || tag)
  publishForm.cover = article.cover || ''
  publishForm.isRecommended = !!article.isRecommended
  publishForm.resources = Array.isArray(article.resources) ? article.resources.map((item) => ({ ...item })) : []
}

async function loadOptions() {
  const [categoryList, tagList] = await Promise.all([
    listAllAdminCategories(),
    listAllAdminTags()
  ])
  categories.value = categoryList
  tags.value = tagList
}

async function loadArticle() {
  if (!articleId.value) return
  const article = await getAdminArticle(articleId.value)
  applyArticleToForm(article)
}

function validateWritingContent() {
  if (!form.title.trim()) {
    message.warning('请输入文章标题')
    return false
  }

  if (!form.contentMarkdown.trim()) {
    message.warning('正文内容不能为空，请先完成写作')
    return false
  }

  return true
}

function validatePublishPayload() {
  if (!validateWritingContent()) {
    return false
  }

  return true
}

async function ensureDraftSaved() {
  const payload = normalizeArticlePayload('draft')
  const saved = articleId.value
    ? await updateAdminArticle(articleId.value, payload)
    : await createAdminArticle(payload)

  applyArticleToForm(saved)
  return saved
}

async function saveDraft() {
  if (!validateWritingContent()) {
    return
  }

  saving.value = true
  try {
    const saved = await ensureDraftSaved()

    if (!articleId.value && saved?.id) {
      pauseTracking()
      await router.replace(`/console/manage/articles/${saved.id}`)
    }

    markClean({
      title: form.title.trim(),
      contentMarkdown: form.contentMarkdown,
      publish: normalizePublishPayload()
    })
    message.success('草稿已保存')
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function openPublishModal() {
  if (!validateWritingContent()) {
    return
  }

  publishModalVisible.value = true
}

function closePublishModal() {
  publishModalVisible.value = false
}

function openCategoryModal() {
  categoryDraft.name = ''
  categoryDraft.slug = ''
  categoryModalVisible.value = true
}

function closeCategoryModal() {
  categoryModalVisible.value = false
}

async function handleCreateCategory() {
  if (!categoryDraft.name.trim()) {
    message.warning('请输入分类名称')
    return
  }

  categorySubmitting.value = true
  try {
    const created = await createAdminCategory({
      name: categoryDraft.name.trim(),
      slug: categoryDraft.slug.trim() || buildSimpleSlug(categoryDraft.name),
      sortOrder: 0,
      status: 'active'
    })
    await loadOptions()
    publishForm.category = created.id
    categoryModalVisible.value = false
    message.success('分类已创建')
  } catch (error) {
    message.error(error.message || '分类创建失败')
  } finally {
    categorySubmitting.value = false
  }
}

function openTagModal() {
  tagDraft.name = ''
  tagDraft.slug = ''
  tagDraft.color = '#1677ff'
  tagModalVisible.value = true
}

function closeTagModal() {
  tagModalVisible.value = false
}

async function handleCreateTag() {
  if (!tagDraft.name.trim()) {
    message.warning('请输入标签名称')
    return
  }

  tagSubmitting.value = true
  try {
    const created = await createAdminTag({
      name: tagDraft.name.trim(),
      slug: tagDraft.slug.trim() || buildSimpleSlug(tagDraft.name),
      color: tagDraft.color.trim() || '#1677ff',
      sortOrder: 0,
      status: 'active'
    })
    await loadOptions()
    publishForm.tags = [...new Set([...publishForm.tags, created.id])]
    tagModalVisible.value = false
    message.success('标签已创建')
  } catch (error) {
    message.error(error.message || '标签创建失败')
  } finally {
    tagSubmitting.value = false
  }
}

function openCoverPicker() {
  mediaPickerVisible.value = true
  if (mediaItems.value.length === 0) {
    loadMediaOptions()
  }
}

function closeMediaPicker() {
  mediaPickerVisible.value = false
}

function openResourcePicker() {
  resourcePickerVisible.value = true
  if (resourceItems.value.length === 0) {
    loadResourceOptions()
  }
}

function closeResourcePicker() {
  resourcePickerVisible.value = false
}

async function loadMediaOptions() {
  mediaLoading.value = true
  try {
    const result = await listAdminMedia({
      kind: 'image',
      page: mediaPage.value,
      pageSize: mediaPageSize,
      keyword: mediaKeyword.value || undefined
    })
    mediaItems.value = result.items || []
    mediaTotal.value = result.total || 0
  } catch (error) {
    message.error(error.message || '媒体文件加载失败')
  } finally {
    mediaLoading.value = false
  }
}

async function loadResourceOptions() {
  resourceLoading.value = true
  try {
    const result = await listAdminMedia({
      page: resourcePage.value,
      pageSize: resourcePageSize,
      keyword: resourceKeyword.value || undefined
    })
    resourceItems.value = result.items || []
    resourceTotal.value = result.total || 0
  } catch (error) {
    message.error(error.message || '资源加载失败')
  } finally {
    resourceLoading.value = false
  }
}

function selectCoverImage(item) {
  publishForm.cover = item.url
  mediaPickerVisible.value = false
  message.success('封面图片已选中')
}

function selectArticleResource(item) {
  const exists = publishForm.resources.some((resource) => resource.url === item.url)
  if (exists) {
    message.info('该资源已添加到文章')
    return
  }

  publishForm.resources.push({
    mediaId: item.id,
    name: item.originalName,
    url: item.url,
    kind: item.kind === 'image' ? 'image' : 'attachment',
    description: '',
    fileSize: item.size || 0,
    mimeType: item.mimeType || ''
  })
  resourcePickerVisible.value = false
  message.success('关联资源已添加')
}

function removeResource(index) {
  publishForm.resources.splice(index, 1)
}

async function confirmPublish() {
  if (!validatePublishPayload()) {
    return
  }

  publishing.value = true
  try {
    const saved = await ensureDraftSaved()

    if (!articleId.value && saved?.id) {
      pauseTracking()
      await router.replace(`/console/manage/articles/${saved.id}`)
    }

    await publishAdminArticle(saved.id)
    form.status = 'published'
    publishModalVisible.value = false
    markClean({
      title: form.title.trim(),
      contentMarkdown: form.contentMarkdown,
      publish: normalizePublishPayload()
    })
    message.success('文章已发布')
  } catch (error) {
    message.error(error.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

async function handleUploadImg(files, callback) {
  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const media = await uploadAdminMedia(file)
        return {
          url: media.url,
          alt: media.originalName || file.name,
          title: media.originalName || file.name
        }
      })
    )

    callback(uploaded)
  } catch (error) {
    message.error(error.message || '图片上传失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadOptions()
    await loadArticle()
    markClean({
      title: form.title.trim(),
      contentMarkdown: form.contentMarkdown,
      publish: normalizePublishPayload()
    })
  } catch (error) {
    message.error(error.message || '写作页面初始化失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.writer-studio {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 56px 40px;
  background: #f6f3ea;
}

.writer-studio__topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 8px 0 20px;
}

.writer-studio__title {
  width: 100%;
  border: none;
  padding: 0;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f1f1f;
  background: transparent;
  outline: none;
}

.writer-studio__title::placeholder {
  color: #c5c0b3;
}

.writer-studio__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.writer-studio__mode-switch {
  margin-right: 8px;
}

.writer-studio__body {
  flex: 1 1 auto;
  min-height: 0;
  background: transparent;
}

.writer-studio__preview-board {
  height: calc(100vh - 210px);
  min-height: 680px;
  overflow: auto;
  border: 1px solid rgba(31, 35, 41, 0.08);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 18px 46px rgba(31, 35, 41, 0.06);
}

.writer-studio__preview-header {
  padding: 28px 44px 16px;
  border-bottom: 1px solid rgba(28, 28, 28, 0.08);
}

.writer-studio__preview-header h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.3;
  color: #1f1f1f;
}

.writer-studio__preview-body {
  padding: 24px 0 60px;
}

.writer-studio__preview-content {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 44px;
}

.writer-studio__editor-shell {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

.writer-studio__editor {
  height: calc(100vh - 210px);
  min-height: 680px;
  border: 1px solid rgba(31, 35, 41, 0.08);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 18px 46px rgba(31, 35, 41, 0.06);
}

.writer-studio__editor :deep(.md-editor) {
  height: 100%;
  min-height: 100%;
  border: none;
  background: #ffffff;
  box-shadow: none;
}

.writer-studio__editor :deep(.md-editor-toolbar) {
  padding: 0 8px 0 4px;
  border-bottom: 1px solid rgba(28, 28, 28, 0.08);
  background: #ffffff;
}

.writer-studio__editor :deep(.md-editor-toolbar-wrapper) {
  width: 100%;
  padding: 14px 20px 10px;
  background: #ffffff;
}

.writer-studio__editor :deep(.md-editor-input-wrapper) {
  background: #ffffff;
}

.writer-studio__editor :deep(.cm-editor) {
  height: 100%;
  background: #ffffff;
}

.writer-studio__editor :deep(.cm-scroller) {
  height: 100%;
  padding: 24px 0 40px;
}

.writer-studio__editor :deep(.cm-content) {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 330px);
  padding: 8px 44px 120px !important;
  font-size: 19px;
  line-height: 2;
  color: #262626;
}

.writer-studio__editor :deep(.cm-line) {
  padding: 0;
}

.writer-studio__editor :deep(.cm-focused) {
  outline: none;
}

.writer-studio__editor :deep(.md-editor-input),
.writer-studio__editor :deep(.md-editor-preview-wrapper),
.writer-studio__editor :deep(.md-editor-preview) {
  background: #ffffff;
}

.writer-studio__editor--compare :deep(.md-editor-preview-wrapper) {
  border-left: 1px solid rgba(28, 28, 28, 0.08);
}

.writer-studio__editor--compare :deep(.md-editor-preview) {
  padding: 28px 28px 80px;
}

.writer-studio__preview-content :deep(.md-editor-preview) {
  padding: 0;
  font-size: 18px;
  line-height: 2;
  color: #262626;
}

.writer-studio__editor :deep(.md-editor-footer) {
  display: none;
}

.publish-field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.cover-preview {
  margin-top: 12px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  aspect-ratio: 16 / 9;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 960px) {
  .writer-studio {
    min-height: 100vh;
    padding: 20px 18px 28px;
  }

  .writer-studio__topbar {
    grid-template-columns: 1fr;
  }

  .writer-studio__actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .writer-studio__mode-switch {
    width: 100%;
    margin-right: 0;
  }

  .writer-studio__title {
    font-size: 28px;
  }

  .writer-studio__editor-shell {
    max-width: 100%;
  }

  .writer-studio__preview-board,
  .writer-studio__editor {
    height: calc(100vh - 180px);
    min-height: 560px;
  }

  .writer-studio__preview-header {
    padding: 20px 20px 14px;
  }

  .writer-studio__preview-header h1 {
    font-size: 28px;
  }

  .writer-studio__preview-content {
    padding: 0 20px;
  }

  .writer-studio__editor :deep(.cm-content) {
    min-height: calc(100vh - 280px);
    padding: 4px 20px 72px !important;
    font-size: 17px;
  }
}
</style>
