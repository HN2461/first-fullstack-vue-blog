<template>
  <section class="question-bank-page">
    <BlogTable
      ref="tableRef"
      :api-fn="listQuestions"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 1180 }"
      show-column-setting
      striped
    >
      <template #toolbar>
        <a-input-search
          v-model:value="filters.keyword"
          class="question-bank-search"
          allow-clear
          placeholder="搜索题干、编码或标签"
          @search="reload"
          @change="debouncedReload"
        />
        <a-select
          v-model:value="filters.categoryId"
          class="question-bank-category-filter"
          :options="categoryOptions"
          allow-clear
          show-search
          option-filter-prop="label"
          placeholder="全部技术分类"
          @change="reload"
        />
        <a-select v-model:value="filters.type" class="question-bank-filter" :options="questionTypeOptions" allow-clear show-search option-filter-prop="label" placeholder="全部题型" @change="reload" />
        <a-select v-model:value="filters.difficulty" class="question-bank-filter" :options="difficultyOptions" allow-clear show-search option-filter-prop="label" placeholder="全部难度" @change="reload" />
        <a-select v-model:value="filters.status" class="question-bank-filter" :options="questionStatusOptions" allow-clear show-search option-filter-prop="label" placeholder="全部状态" @change="reload" />
        <a-tooltip title="管理技术分类">
          <a-button @click="categoryDrawerOpen = true">
            <template #icon><ApartmentOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新增题目
        </a-button>
        <span class="question-bank-toolbar__spacer"></span>
        <QuestionBankHelp topic="questions" />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'stem'">
          <div class="question-bank-stem-cell">
            <button type="button" class="question-bank-stem-link" @click="openPreview(record)">{{ record.stem }}</button>
            <span>{{ record.code }} · v{{ record.version }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'category'">
          {{ record.category?.fullName || '-' }}
        </template>
        <template v-else-if="column.key === 'type'">
          <a-tag :color="getOptionMeta(questionTypeOptions, record.type).color">{{ getOptionMeta(questionTypeOptions, record.type).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'difficulty'">
          <a-tag :color="getOptionMeta(difficultyOptions, record.difficulty).color">{{ getOptionMeta(difficultyOptions, record.difficulty).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-tag v-for="tag in record.tags?.slice(0, 3)" :key="tag" :bordered="false">{{ tag }}</a-tag>
          <span v-if="!record.tags?.length" class="question-bank-muted">-</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getOptionMeta(questionStatusOptions, record.status).color">{{ getOptionMeta(questionStatusOptions, record.status).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          {{ formatQuestionTime(record.updatedAt) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="question-bank-action-row">
            <a-tooltip title="预览题目">
              <a-button size="small" @click="openPreview(record)"><template #icon><EyeOutlined /></template></a-button>
            </a-tooltip>
            <a-tooltip title="编辑题目">
              <a-button size="small" @click="openEdit(record)"><template #icon><EditOutlined /></template></a-button>
            </a-tooltip>
            <a-tooltip title="归档题目">
              <a-button size="small" danger @click="confirmArchive(record)"><template #icon><DeleteOutlined /></template></a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>

    <QuestionEditorModal
      :open="editorOpen"
      :question="editingQuestion"
      :category-options="categoryOptions"
      @cancel="editorOpen = false"
      @saved="handleSaved"
    />
    <QuestionPreviewModal
      :open="previewOpen"
      :loading="previewLoading"
      :question="previewQuestion"
      @cancel="previewOpen = false"
      @edit="handlePreviewEdit"
    />
    <QuestionCategoryDrawer :open="categoryDrawerOpen" @close="categoryDrawerOpen = false" @changed="loadCategories" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ApartmentOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  archiveQuestion,
  getQuestion,
  listQuestionCategories,
  listQuestions
} from '@/services/questionBank'
import {
  difficultyOptions,
  flattenCategoryOptions,
  formatQuestionTime,
  getOptionMeta,
  questionStatusOptions,
  questionTypeOptions
} from './questionBankMeta'
import QuestionCategoryDrawer from './QuestionCategoryDrawer.vue'
import QuestionEditorModal from './QuestionEditorModal.vue'
import QuestionBankHelp from './QuestionBankHelp.vue'
import QuestionPreviewModal from './QuestionPreviewModal.vue'
import './questionBank.css'

const tableRef = ref(null)
const editorOpen = ref(false)
const previewOpen = ref(false)
const previewLoading = ref(false)
const categoryDrawerOpen = ref(false)
const editingQuestion = ref(null)
const previewQuestion = ref(null)
const categoryTree = ref([])
const categoryOptions = computed(() => flattenCategoryOptions(categoryTree.value))
const filters = reactive({ keyword: '', categoryId: undefined, type: undefined, difficulty: undefined, status: undefined })
let filterTimer = null
const columns = [
  { title: '题目', key: 'stem', dataIndex: 'stem', width: 360, fixed: 'left' },
  { title: '技术分类', key: 'category', width: 220 },
  { title: '题型', key: 'type', dataIndex: 'type', width: 100 },
  { title: '难度', key: 'difficulty', dataIndex: 'difficulty', width: 90 },
  { title: '标签', key: 'tags', dataIndex: 'tags', width: 210 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 136, fixed: 'right' }
]

function reload() {
  tableRef.value?.reload?.()
}

function debouncedReload() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(reload, 300)
}

async function loadCategories() {
  const result = await listQuestionCategories()
  categoryTree.value = result.tree || []
}

function openCreate() {
  editingQuestion.value = null
  editorOpen.value = true
}

async function openPreview(record) {
  previewQuestion.value = null
  previewOpen.value = true
  previewLoading.value = true
  try {
    previewQuestion.value = await getQuestion(record.id)
  } catch (error) {
    previewOpen.value = false
    message.error(error.message || '题目预览加载失败')
  } finally {
    previewLoading.value = false
  }
}

async function openEdit(record) {
  try {
    editingQuestion.value = await getQuestion(record.id)
    editorOpen.value = true
  } catch (error) {
    message.error(error.message || '题目详情加载失败')
  }
}

function handlePreviewEdit(question) {
  previewOpen.value = false
  editingQuestion.value = question
  editorOpen.value = true
}

function handleSaved() {
  editorOpen.value = false
  reload()
}

function confirmArchive(record) {
  Modal.confirm({
    title: '归档题目',
    content: '归档后该题目不会再进入练习和组卷，历史答卷不受影响。',
    okText: '归档',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await archiveQuestion(record.id)
      message.success('题目已归档')
      reload()
    }
  })
}

onMounted(async () => {
  try {
    await loadCategories()
  } catch (error) {
    message.error(error.message || '技术分类加载失败')
  }
})
</script>
