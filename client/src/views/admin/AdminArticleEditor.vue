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
        <a-button :loading="saving" @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" :loading="publishing" @click="openPublishModal">发布</a-button>
      </div>
    </header>

    <div class="writer-studio__body">
      <aside class="writer-studio__catalog" v-if="showCatalog">
        <div class="writer-studio__catalog-head">
          <strong>目录</strong>
          <a-button type="text" size="small" @click="showCatalog = false">收起</a-button>
        </div>
        <MdCatalog
          :editor-id="editorId"
          :scroll-element="scrollElement"
          theme="light"
          class="writer-studio__catalog-body"
        />
      </aside>

      <MdEditor
        :id="editorId"
        v-model="form.contentMarkdown"
        :class="['writer-studio__editor', { 'writer-studio__editor--with-catalog': showCatalog }]"
        theme="light"
        language="zh-CN"
        preview-theme="github"
        code-theme="atom"
        placeholder="开始在线写作"
        :toolbars="toolbars"
        :show-code-row-number="true"
        :tab-width="2"
        :auto-detect-code="true"
        :footers="[]"
        :no-upload-img="false"
        :on-upload-img="handleUploadImg"
      />
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
import { MdCatalog, MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
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
const categoryModalVisible = ref(false)
const tagModalVisible = ref(false)
const categorySubmitting = ref(false)
const tagSubmitting = ref(false)
const mediaLoading = ref(false)
const categories = ref([])
const tags = ref([])
const isSlugTouched = ref(false)
const mediaItems = ref([])
const mediaKeyword = ref('')
const mediaPage = ref(1)
const mediaPageSize = 12
const mediaTotal = ref(0)
const showCatalog = ref(true)
const editorId = 'knowledge-writer-editor'
const scrollElement = 'html'

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
  '=',
  'preview',
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
  isRecommended: false
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
    isRecommended: !!publishForm.isRecommended
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

function selectCoverImage(item) {
  publishForm.cover = item.url
  mediaPickerVisible.value = false
  message.success('封面图片已选中')
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
  height: calc(100vh - 108px);
  min-height: 720px;
}

.writer-studio__topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 0 0 16px;
}

.writer-studio__title {
  width: 100%;
  border: none;
  padding: 4px 0;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.25;
  color: #1f1f1f;
  background: transparent;
  outline: none;
}

.writer-studio__title::placeholder {
  color: #bfbfbf;
}

.writer-studio__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.writer-studio__body {
  flex: 1 1 auto;
  min-height: 0;
}

.writer-studio__editor {
  height: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.writer-studio__editor :deep(.md-editor) {
  height: 100%;
}

.writer-studio__editor :deep(.md-editor-toolbar) {
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
}

.writer-studio__editor :deep(.md-editor-input-wrapper textarea),
.writer-studio__editor :deep(.md-editor-preview) {
  font-size: 15px;
  line-height: 1.95;
}

.writer-studio__editor :deep(.md-editor-input-wrapper textarea) {
  padding: 20px 24px;
}

.writer-studio__editor :deep(.md-editor-preview) {
  padding: 20px 24px;
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
    height: auto;
    min-height: 0;
  }

  .writer-studio__topbar {
    grid-template-columns: 1fr;
  }

  .writer-studio__actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .writer-studio__title {
    font-size: 28px;
  }

  .writer-studio__body {
    min-height: 620px;
  }
}
</style>
