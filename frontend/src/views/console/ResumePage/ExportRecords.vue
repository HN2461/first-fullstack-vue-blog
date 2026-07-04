<template>
  <section class="resume-workspace">
    <BlogTable
      ref="tableRef"
      :api-fn="listResumeExports"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 900 }"
      striped
      show-column-setting
    >
      <template #toolbar>
        <a-select
          v-model:value="filters.resumeId"
          class="resume-toolbar__search"
          :options="resumeOptions"
          placeholder="简历"
          allow-clear
          show-search
          option-filter-prop="label"
          @change="reloadTable"
        />
        <a-select
          v-model:value="filters.format"
          class="resume-toolbar__select"
          :options="formatOptions"
          @change="reloadTable"
        />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'format'">
          <a-tag :color="formatColorMap[record.format]">{{ formatLabelMap[record.format] }}</a-tag>
        </template>
        <template v-else-if="column.key === 'fileSize'">
          {{ formatSize(record.fileSize) }}
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatTime(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="resume-action-row">
            <a-tooltip title="下载">
              <a-button size="small" @click="download(record)">
                <template #icon><DownloadOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { downloadResumeExport, listResumeExports, listResumes } from '@/services/resume'
import { downloadBlob, formatTime } from './resumeHelpers'
import './resumePage.css'

const tableRef = ref(null)
const resumeOptions = ref([])
const filters = reactive({
  resumeId: undefined,
  format: 'all'
})
const formatOptions = [
  { label: '全部格式', value: 'all' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Word', value: 'word' }
]
const formatLabelMap = {
  markdown: 'Markdown',
  pdf: 'PDF',
  word: 'Word'
}
const formatColorMap = {
  markdown: 'blue',
  pdf: 'red',
  word: 'geekblue'
}
const columns = [
  { title: '文件名', dataIndex: 'filename', key: 'filename', width: 280, fixed: 'left' },
  { title: '简历', dataIndex: 'resumeTitle', key: 'resumeTitle', width: 220 },
  { title: '格式', dataIndex: 'format', key: 'format', width: 110 },
  { title: '模板', dataIndex: 'templateKey', key: 'templateKey', width: 120 },
  { title: '大小', dataIndex: 'fileSize', key: 'fileSize', width: 100 },
  { title: '导出时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 90, fixed: 'right' }
]

function reloadTable() {
  tableRef.value?.reload?.()
}

function formatSize(size = 0) {
  if (size < 1024) return `${size} B`
  return `${(size / 1024).toFixed(1)} KB`
}

async function download(record) {
  try {
    const blob = await downloadResumeExport(record.id)
    downloadBlob(blob, record.filename)
  } catch (error) {
    message.error(error.message || '下载失败')
  }
}

onMounted(async () => {
  const result = await listResumes({ pageSize: 100 })
  resumeOptions.value = result.items.map((item) => ({ label: item.title, value: item.id }))
})
</script>
