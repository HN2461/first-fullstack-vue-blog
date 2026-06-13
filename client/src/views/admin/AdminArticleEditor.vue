<template>
  <section class="admin-panel editor-panel">
    <div class="admin-page-head">
      <div>
        <p class="eyebrow">Markdown 写作</p>
        <h2>{{ articleId ? '编辑文章' : '新建文章' }}</h2>
      </div>
      <div class="admin-actions">
        <button class="icon-button" type="button" :disabled="saving" @click="saveDraft">
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button class="primary-button" type="button" :disabled="saving || !articleId" @click="publishArticle">
          发布
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="status-text is-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="status-text">{{ successMessage }}</p>

    <div class="editor-grid">
      <div class="meta-form">
        <label>
          标题
          <input v-model.trim="form.title" type="text">
        </label>
        <label>
          Slug
          <input v-model.trim="form.slug" type="text">
        </label>
        <label>
          摘要
          <textarea v-model.trim="form.summary" rows="4"></textarea>
        </label>
        <label>
          分类
          <select v-model="form.category">
            <option value="">未分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label>
          标签
          <select v-model="form.tags" multiple>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="markdown-editor">
        <textarea v-model="form.contentMarkdown" rows="22" placeholder="开始写 Markdown..."></textarea>
        <div class="editor-stats">
          <span>{{ form.contentMarkdown.length }} 字符</span>
          <span>预计 {{ readingMinutes }} 分钟</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createAdminArticle,
  getAdminArticle,
  listAdminCategories,
  listAdminTags,
  publishAdminArticle,
  updateAdminArticle
} from '@/services/admin'

const route = useRoute()
const router = useRouter()
const articleId = computed(() => route.params.id)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const categories = ref([])
const tags = ref([])
const form = reactive({
  title: '',
  slug: '',
  summary: '',
  contentMarkdown: '',
  category: '',
  tags: []
})

const readingMinutes = computed(() => {
  const words = form.contentMarkdown.trim() ? form.contentMarkdown.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(words / 300))
})

function normalizePayload() {
  return {
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    contentMarkdown: form.contentMarkdown,
    category: form.category || null,
    tags: form.tags
  }
}

async function loadOptions() {
  const [categoryList, tagList] = await Promise.all([
    listAdminCategories(),
    listAdminTags()
  ])
  categories.value = categoryList
  tags.value = tagList
}

async function loadArticle() {
  if (!articleId.value) return

  const article = await getAdminArticle(articleId.value)
  form.title = article.title
  form.slug = article.slug
  form.summary = article.summary || ''
  form.contentMarkdown = article.contentMarkdown || ''
  form.category = article.category?.id || article.category || ''
  form.tags = (article.tags || []).map((tag) => tag.id || tag)
}

async function saveDraft() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = normalizePayload()
    const saved = articleId.value
      ? await updateAdminArticle(articleId.value, payload)
      : await createAdminArticle(payload)

    successMessage.value = '草稿已保存'

    if (!articleId.value) {
      await router.replace(`/console/manage/articles/${saved.id}`)
    }
  } catch (error) {
    errorMessage.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function publishArticle() {
  if (!articleId.value) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await publishAdminArticle(articleId.value)
    successMessage.value = '文章已发布'
  } catch (error) {
    errorMessage.value = error.message || '发布失败'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadOptions()
    await loadArticle()
  } catch (error) {
    errorMessage.value = error.message || '编辑器初始化失败'
  }
})
</script>
