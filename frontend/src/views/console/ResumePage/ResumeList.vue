<template>
  <section class="resume-workspace">
    <BlogTable
      ref="tableRef"
      :api-fn="listResumes"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 980 }"
      show-column-setting
      striped
    >
      <template #toolbar>
        <a-input-search
          v-model:value="filters.keyword"
          class="resume-toolbar__search"
          placeholder="搜索标题、姓名、目标岗位"
          allow-clear
          @search="reloadTable"
          @change="handleFilterInput"
        />
        <a-select
          v-model:value="filters.status"
          class="resume-toolbar__select"
          :options="statusFilterOptions"
          show-search
          option-filter-prop="label"
          @change="reloadTable"
        />
        <a-select
          v-model:value="filters.templateKey"
          class="resume-toolbar__select"
          :options="templateOptions"
          placeholder="模板"
          allow-clear
          show-search
          option-filter-prop="label"
          @change="reloadTable"
        />
        <a-button type="primary" @click="openCreate">
          <template #icon><PlusOutlined /></template>
          新建简历
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <button type="button" class="resume-title-cell is-clickable" @click="previewResume(record)">
            <strong>{{ record.title }}</strong>
            <span class="resume-text-muted">{{ record.sections?.profile?.name || '未填写姓名' }} / {{ record.targetRole || '未设置岗位' }}</span>
          </button>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getOptionMeta(statusOptions, record.status).color">
            {{ getOptionMeta(statusOptions, record.status).label }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          {{ formatTime(record.updatedAt) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="resume-action-row">
            <a-tooltip title="预览">
              <a-button size="small" @click="previewResume(record)">
                <template #icon><EyeOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button size="small" @click="goEditor(record.id)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="复制">
              <a-button size="small" @click="copyResume(record)">
                <template #icon><CopyOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-dropdown>
              <a-button size="small">
                <template #icon><DownloadOutlined /></template>
              </a-button>
              <template #overlay>
                <a-menu @click="({ key }) => exportResume(record, key)">
                  <a-menu-item key="markdown">Markdown</a-menu-item>
                  <a-menu-item key="pdf">PDF</a-menu-item>
                  <a-menu-item key="word">Word</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
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
      v-model:open="createVisible"
      title="新建简历"
      :width="520"
      :confirm-loading="submitting"
      ok-text="创建并编辑"
      cancel-text="取消"
      @ok="submitCreate"
    >
      <div class="resume-modal-body">
        <a-form layout="vertical">
          <a-form-item label="简历标题" required>
            <a-input v-model:value.trim="createForm.title" :maxlength="80" placeholder="例如：前端工程师投递版" />
          </a-form-item>
          <a-form-item label="目标岗位">
            <a-input v-model:value.trim="createForm.targetRole" :maxlength="80" placeholder="例如：Vue 全栈开发工程师" />
          </a-form-item>
          <a-form-item label="模板">
            <a-select
              v-model:value="createForm.templateKey"
              :options="templateOptions"
              show-search
              option-filter-prop="label"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <ResumePreviewDrawer
      v-model:open="previewVisible"
      :resume="previewRecord"
      @edit-section="goPreviewEditor"
    />
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  createResume,
  createResumeExport,
  deleteResume,
  downloadResumeExport,
  duplicateResume,
  getResume,
  listResumes,
  listResumeTemplates
} from '@/services/resume'
import { createEmptySections, downloadBlob, formatTime, getOptionMeta, statusOptions } from './resumeHelpers'
import ResumePreviewDrawer from './ResumePreviewDrawer.vue'
import './resumePage.css'

const router = useRouter()
const tableRef = ref(null)
const createVisible = ref(false)
const previewVisible = ref(false)
const submitting = ref(false)
const templateOptions = ref([])
const previewRecord = ref({})
let filterTimer = null

const filters = reactive({
  keyword: '',
  status: 'all',
  templateKey: undefined
})
const createForm = reactive({
  title: '',
  targetRole: '',
  templateKey: 'classic'
})
const statusFilterOptions = [
  { label: '全部状态', value: 'all' },
  ...statusOptions
]
const columns = [
  { title: '简历', key: 'title', dataIndex: 'title', width: 280, fixed: 'left' },
  { title: '目标岗位', key: 'targetRole', dataIndex: 'targetRole', width: 180 },
  { title: '模板', key: 'templateKey', dataIndex: 'templateKey', width: 120 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 100 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 190, fixed: 'right' }
]

function reloadTable() {
  tableRef.value?.reload?.()
}

function handleFilterInput() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(reloadTable, 300)
}

function goEditor(id) {
  router.push({ path: '/console/resumes/editor', query: { id } })
}

function goPreviewEditor(sectionKey) {
  router.push({
    path: '/console/resumes/editor',
    query: { id: previewRecord.value.id, section: sectionKey }
  })
}

async function previewResume(record) {
  try {
    previewRecord.value = await getResume(record.id)
    previewVisible.value = true
  } catch (error) {
    message.error(error.message || '加载预览失败')
  }
}

function openCreate() {
  createForm.title = ''
  createForm.targetRole = ''
  createForm.templateKey = templateOptions.value[0]?.value || 'classic'
  createVisible.value = true
}

async function submitCreate() {
  if (!createForm.title.trim()) {
    message.warning('请填写简历标题')
    return
  }

  submitting.value = true
  try {
    const resume = await createResume({
      ...createForm,
      sections: createEmptySections()
    })
    message.success('简历已创建')
    createVisible.value = false
    goEditor(resume.id)
  } catch (error) {
    message.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

async function copyResume(record) {
  try {
    const resume = await duplicateResume(record.id)
    message.success('简历副本已创建')
    goEditor(resume.id)
  } catch (error) {
    message.error(error.message || '复制失败')
  }
}

async function exportResume(record, format) {
  try {
    const exportRecord = await createResumeExport({ resumeId: record.id, format })
    const blob = await downloadResumeExport(exportRecord.id)
    downloadBlob(blob, exportRecord.filename)
    message.success('导出文件已生成')
  } catch (error) {
    message.error(error.message || '导出失败')
  }
}

function confirmDelete(record) {
  Modal.confirm({
    title: '删除简历',
    content: `确定删除「${record.title}」吗？关联问答会保留，但会移除对应原文关联。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteResume(record.id)
      message.success('简历已删除')
      reloadTable()
    }
  })
}

onMounted(async () => {
  const templates = await listResumeTemplates()
  templateOptions.value = templates.map((item) => ({ label: item.name, value: item.key }))
})
</script>
