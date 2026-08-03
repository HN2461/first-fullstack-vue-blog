<template>
  <section class="question-bank-page">
    <BlogTable
      ref="tableRef"
      :api-fn="listQuestionPapers"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 980 }"
      show-column-setting
      striped
    >
      <template #toolbar>
        <a-input-search v-model:value="filters.keyword" class="question-bank-search" allow-clear placeholder="搜索试卷名称" @search="reload" @change="debouncedReload" />
        <a-select v-model:value="filters.mode" class="question-bank-filter" :options="paperModeOptions" allow-clear show-search option-filter-prop="label" placeholder="全部组卷方式" @change="reload" />
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建试卷
        </a-button>
        <span class="question-bank-toolbar__spacer"></span>
        <QuestionBankHelp topic="papers" />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="question-bank-stem-cell">
            <strong>{{ record.title }}</strong>
            <span>{{ record.description || '暂无说明' }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'mode'">
          <a-tag :color="record.mode === 'fixed' ? 'blue' : 'cyan'">{{ getOptionMeta(paperModeOptions, record.mode).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'duration'">{{ record.durationMinutes }} 分钟</template>
        <template v-else-if="column.key === 'updatedAt'">{{ formatQuestionTime(record.updatedAt) }}</template>
        <template v-else-if="column.key === 'action'">
          <div class="question-bank-action-row">
            <a-tooltip title="开始考试">
              <a-button type="primary" size="small" :loading="startingId === record.id" @click="startPaper(record)"><template #icon><PlayCircleOutlined /></template></a-button>
            </a-tooltip>
            <a-tooltip title="编辑试卷">
              <a-button size="small" @click="openEdit(record)"><template #icon><EditOutlined /></template></a-button>
            </a-tooltip>
            <a-tooltip title="归档试卷">
              <a-button size="small" danger @click="confirmArchive(record)"><template #icon><DeleteOutlined /></template></a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>

    <QuestionPaperEditorModal
      :open="editorOpen"
      :paper="editingPaper"
      :category-options="categoryOptions"
      :question-options="questionOptions"
      @cancel="editorOpen = false"
      @saved="handleSaved"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlayCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  archiveQuestionPaper,
  getQuestionPaper,
  listQuestionCategories,
  listQuestionPapers,
  listQuestions,
  startQuestionPaper
} from '@/services/questionBank'
import { flattenCategoryOptions, formatQuestionTime, getOptionMeta, paperModeOptions } from './questionBankMeta'
import QuestionPaperEditorModal from './QuestionPaperEditorModal.vue'
import QuestionBankHelp from './QuestionBankHelp.vue'
import './questionBank.css'

const router = useRouter()
const tableRef = ref(null)
const editorOpen = ref(false)
const editingPaper = ref(null)
const categoryTree = ref([])
const questionItems = ref([])
const startingId = ref('')
const filters = reactive({ keyword: '', mode: undefined })
let filterTimer = null
const categoryOptions = computed(() => flattenCategoryOptions(categoryTree.value))
const questionOptions = computed(() => questionItems.value.map((item) => ({
  label: `${item.category?.fullName || '-'} · ${item.stem}`,
  value: item.id
})))
const columns = [
  { title: '试卷', key: 'title', dataIndex: 'title', width: 320, fixed: 'left' },
  { title: '组卷方式', key: 'mode', dataIndex: 'mode', width: 120 },
  { title: '题目数', key: 'questionCount', dataIndex: 'questionCount', width: 90 },
  { title: '时长', key: 'duration', width: 100 },
  { title: '及格分', key: 'passScore', dataIndex: 'passScore', width: 90 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]

function reload() {
  tableRef.value?.reload?.()
}

function debouncedReload() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(reload, 300)
}

function openCreate() {
  editingPaper.value = null
  editorOpen.value = true
}

async function openEdit(record) {
  try {
    editingPaper.value = await getQuestionPaper(record.id)
    editorOpen.value = true
  } catch (error) {
    message.error(error.message || '试卷详情加载失败')
  }
}

function handleSaved() {
  editorOpen.value = false
  reload()
}

async function startPaper(record) {
  startingId.value = record.id
  try {
    const attempt = await startQuestionPaper(record.id)
    router.push(`/console/question-bank/attempts/${attempt.id}`)
  } catch (error) {
    message.error(error.message || '考试启动失败')
  } finally {
    startingId.value = ''
  }
}

function confirmArchive(record) {
  Modal.confirm({
    title: '归档试卷',
    content: `确定归档「${record.title}」吗？历史答卷不受影响。`,
    okText: '归档',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await archiveQuestionPaper(record.id)
      message.success('试卷已归档')
      reload()
    }
  })
}

onMounted(async () => {
  try {
    const [categoryResult, questionResult] = await Promise.all([
      listQuestionCategories(),
      listQuestions({ pageSize: 200, status: 'ready' })
    ])
    categoryTree.value = categoryResult.tree || []
    questionItems.value = questionResult.items || []
  } catch (error) {
    message.error(error.message || '组卷数据加载失败')
  }
})
</script>
