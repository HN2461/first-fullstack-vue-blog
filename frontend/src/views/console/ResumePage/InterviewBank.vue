<template>
  <section class="resume-workspace">
    <a-tabs v-model:activeKey="activeTab" class="resume-tabs">
      <a-tab-pane key="qa" tab="面试问答">
        <BlogTable
          ref="tableRef"
          :api-fn="listResumeInterviews"
          :columns="columns"
          :params="filters"
          :scroll="{ x: 1080 }"
          show-column-setting
          striped
        >
          <template #toolbar>
            <a-input-search
              v-model:value="filters.keyword"
              class="resume-toolbar__search"
              placeholder="搜索问题、回答或标签"
              allow-clear
              @search="reloadTable"
              @change="handleFilterInput"
            />
            <a-select
              v-model:value="filters.resumeId"
              class="resume-toolbar__select"
              :options="resumeOptions"
              placeholder="关联简历"
              allow-clear
              show-search
              option-filter-prop="label"
              @change="reloadTable"
            />
            <a-input v-model:value.trim="filters.tag" class="resume-toolbar__select" placeholder="标签" allow-clear @change="handleFilterInput" />
            <a-button type="primary" @click="openCreate">
              <template #icon><PlusOutlined /></template>
              新增问答
            </a-button>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'question'">
              <div class="resume-title-cell">
                <strong>{{ record.question }}</strong>
                <span class="resume-text-muted">{{ record.answerOutline || record.polishedAnswer || '暂无回答素材' }}</span>
              </div>
            </template>
            <template v-else-if="column.key === 'difficulty'">
              <a-tag :color="getOptionMeta(difficultyOptions, record.difficulty).color">
                {{ getOptionMeta(difficultyOptions, record.difficulty).label }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'tags'">
              <a-tag v-for="tag in record.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
              <span v-if="!record.tags?.length" class="resume-text-muted">-</span>
            </template>
            <template v-else-if="column.key === 'links'">
              <a-space wrap>
                <a-button
                  v-for="link in record.links || []"
                  :key="`${link.resumeId}-${link.sectionKey}-${link.entryId}-${link.highlightId}`"
                  size="small"
                  @click="jumpToResume(link)"
                >
                  原文
                </a-button>
                <span v-if="!record.links?.length" class="resume-text-muted">未关联</span>
              </a-space>
            </template>
            <template v-else-if="column.key === 'updatedAt'">
              {{ formatTime(record.updatedAt) }}
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="resume-action-row">
                <a-tooltip title="编辑">
                  <a-button size="small" @click="openEdit(record)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除">
                  <a-button size="small" danger @click="confirmDelete(record)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </template>
          </template>
        </BlogTable>

        <a-modal
          v-model:open="modalVisible"
          :title="editingId ? '编辑面试问答' : '新增面试问答'"
          :width="720"
          :confirm-loading="submitting"
          ok-text="保存"
          cancel-text="取消"
          @ok="submitForm"
        >
          <div class="resume-modal-body">
            <a-form layout="vertical">
              <a-form-item label="面试官提问" required>
                <a-input v-model:value.trim="form.question" :maxlength="300" />
              </a-form-item>
              <a-form-item label="回答思路">
                <a-textarea v-model:value="form.answerOutline" :auto-size="{ minRows: 4, maxRows: 8 }" />
              </a-form-item>
              <a-form-item label="优化话术">
                <a-textarea v-model:value="form.polishedAnswer" :auto-size="{ minRows: 4, maxRows: 10 }" />
              </a-form-item>
              <div class="resume-form-grid">
                <a-form-item label="难度">
                  <a-select v-model:value="form.difficulty" :options="difficultyOptions" />
                </a-form-item>
                <a-form-item label="标签">
                  <a-input v-model:value="form.tagsText" placeholder="多个标签用逗号分隔" />
                </a-form-item>
              </div>
            </a-form>
          </div>
        </a-modal>
      </a-tab-pane>
      <a-tab-pane key="materials" tab="资料库">
        <ResumeMaterialList />
      </a-tab-pane>
    </a-tabs>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  createResumeInterview,
  deleteResumeInterview,
  listResumeInterviews,
  listResumes,
  updateResumeInterview
} from '@/services/resume'
import { difficultyOptions, formatTime, getOptionMeta, parseTags } from './resumeHelpers'
import ResumeMaterialList from './ResumeMaterialList.vue'
import './resumePage.css'

const router = useRouter()
const tableRef = ref(null)
const activeTab = ref('qa')
const modalVisible = ref(false)
const submitting = ref(false)
const editingId = ref('')
const resumeOptions = ref([])
let filterTimer = null

const filters = reactive({
  keyword: '',
  resumeId: undefined,
  tag: ''
})
const form = reactive({
  question: '',
  answerOutline: '',
  polishedAnswer: '',
  difficulty: 'medium',
  tagsText: ''
})
const columns = [
  { title: '问题', key: 'question', dataIndex: 'question', width: 320, fixed: 'left' },
  { title: '难度', key: 'difficulty', dataIndex: 'difficulty', width: 90 },
  { title: '标签', key: 'tags', dataIndex: 'tags', width: 180 },
  { title: '关联原文', key: 'links', dataIndex: 'links', width: 180 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 110, fixed: 'right' }
]

function reloadTable() {
  tableRef.value?.reload?.()
}

function handleFilterInput() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(reloadTable, 300)
}

function resetForm() {
  editingId.value = ''
  form.question = ''
  form.answerOutline = ''
  form.polishedAnswer = ''
  form.difficulty = 'medium'
  form.tagsText = ''
}

function openCreate() {
  resetForm()
  modalVisible.value = true
}

function openEdit(record) {
  editingId.value = record.id
  form.question = record.question
  form.answerOutline = record.answerOutline || ''
  form.polishedAnswer = record.polishedAnswer || ''
  form.difficulty = record.difficulty || 'medium'
  form.tagsText = (record.tags || []).join('，')
  modalVisible.value = true
}

async function submitForm() {
  if (!form.question.trim()) {
    message.warning('请填写面试官提问')
    return
  }

  submitting.value = true
  try {
    const payload = {
      question: form.question,
      answerOutline: form.answerOutline,
      polishedAnswer: form.polishedAnswer,
      difficulty: form.difficulty,
      tags: parseTags(form.tagsText)
    }
    if (editingId.value) {
      await updateResumeInterview(editingId.value, payload)
    } else {
      await createResumeInterview(payload)
    }
    message.success('问答已保存')
    modalVisible.value = false
    reloadTable()
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

function jumpToResume(link) {
  router.push({
    path: '/console/resumes/editor',
    query: {
      id: link.resumeId,
      section: link.sectionKey,
      entry: link.entryId,
      highlight: link.highlightId
    }
  })
}

function confirmDelete(record) {
  Modal.confirm({
    title: '删除面试问答',
    content: `确定删除「${record.question}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteResumeInterview(record.id)
      message.success('问答已删除')
      reloadTable()
    }
  })
}

onMounted(async () => {
  const result = await listResumes({ pageSize: 100 })
  resumeOptions.value = result.items.map((item) => ({ label: item.title, value: item.id }))
})
</script>
