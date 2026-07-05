<template>
  <div class="resume-material-list">
    <BlogTable
      ref="tableRef"
      :api-fn="listResumeMaterials"
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
          placeholder="搜索资料标题、路径、正文"
          allow-clear
          @search="reloadTable"
          @change="handleFilterInput"
        />
        <a-select
          v-model:value="filters.category"
          class="resume-toolbar__select"
          :options="categoryOptions"
          placeholder="资料分类"
          allow-clear
          show-search
          option-filter-prop="label"
          @change="reloadTable"
        />
        <a-input v-model:value.trim="filters.tag" class="resume-toolbar__select" placeholder="标签" allow-clear @change="handleFilterInput" />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <button type="button" class="resume-title-cell is-clickable" @click="openMaterial(record)">
            <strong>{{ record.title }}</strong>
            <span class="resume-text-muted">{{ record.relativePath }}</span>
          </button>
        </template>
        <template v-else-if="column.key === 'category'">
          <a-tag :bordered="false">{{ record.category }}</a-tag>
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-tag v-for="tag in record.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
          <span v-if="!record.tags?.length" class="resume-text-muted">-</span>
        </template>
        <template v-else-if="column.key === 'excerpt'">
          <span class="resume-material-excerpt">{{ record.excerpt }}</span>
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          {{ formatTime(record.updatedAt) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-tooltip title="查看原文">
            <a-button size="small" @click="openMaterial(record)">
              <template #icon><FileTextOutlined /></template>
            </a-button>
          </a-tooltip>
        </template>
      </template>
    </BlogTable>

    <a-drawer
      v-model:open="drawerOpen"
      width="760"
      title="资料原文"
    >
      <div class="resume-drawer-body">
        <a-descriptions size="small" :column="1" bordered>
          <a-descriptions-item label="标题">{{ activeMaterial.title }}</a-descriptions-item>
          <a-descriptions-item label="路径">{{ activeMaterial.relativePath }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ activeMaterial.category }}</a-descriptions-item>
        </a-descriptions>
        <pre class="resume-material-content">{{ activeMaterial.content || '暂无内容' }}</pre>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { getResumeMaterial, listResumeMaterials } from '@/services/resume'
import { formatTime } from './resumeHelpers'

const tableRef = ref(null)
const drawerOpen = ref(false)
const activeMaterial = ref({})
let filterTimer = null

const filters = reactive({
  keyword: '',
  category: undefined,
  tag: ''
})
const categoryOptions = [
  '根目录资料',
  '导航',
  '项目全景',
  '证据与映射',
  '亮点深挖',
  '简历成稿',
  '面试准备'
].map((item) => ({ label: item, value: item }))
const columns = [
  { title: '资料', key: 'title', dataIndex: 'title', width: 280, fixed: 'left' },
  { title: '分类', key: 'category', dataIndex: 'category', width: 120 },
  { title: '标签', key: 'tags', dataIndex: 'tags', width: 200 },
  { title: '摘要', key: 'excerpt', dataIndex: 'excerpt', width: 360 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 90, fixed: 'right' }
]

function reloadTable() {
  tableRef.value?.reload?.()
}

function handleFilterInput() {
  clearTimeout(filterTimer)
  filterTimer = setTimeout(reloadTable, 300)
}

async function openMaterial(record) {
  try {
    activeMaterial.value = await getResumeMaterial(record.id)
    drawerOpen.value = true
  } catch (error) {
    message.error(error.message || '加载资料失败')
  }
}
</script>
