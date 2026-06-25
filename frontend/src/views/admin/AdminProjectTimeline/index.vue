<template>
  <section class="project-timeline-page">
    <a-alert
      v-if="errorMessage"
      type="error"
      show-icon
      class="project-timeline-alert"
      :message="errorMessage"
    />

    <main class="project-timeline-workspace">
      <div class="project-timeline-toolbar">
        <a-input-search
          v-model:value="keyword"
          allow-clear
          placeholder="搜索标题或详情"
          class="project-timeline-search"
          :loading="loading"
          @search="handleSearch"
          @press-enter="handleSearch"
        />
        <a-select
          v-model:value="filterCategory"
          allow-clear
          show-search
          option-filter-prop="label"
          placeholder="全部分类"
          class="project-timeline-category"
          :options="categoryOptions"
          @change="handleFilterChange"
        />
        <a-tooltip title="用于留存系统搭建、迭代开发、问题修复、部署发布等关键节点。">
          <a-button class="project-timeline-help-button" shape="circle">
            <template #icon><QuestionCircleOutlined /></template>
          </a-button>
        </a-tooltip>
        <span class="project-timeline-total">共 {{ total }} 条</span>
        <a-button :loading="loading" @click="loadRecords">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button @click="importModalVisible = true">
          <template #icon><UploadOutlined /></template>
          导入记录
        </a-button>
        <a-button type="primary" @click="createModalVisible = true">
          <template #icon><PlusOutlined /></template>
          新增记录
        </a-button>
      </div>

      <div v-if="loading && records.length === 0" class="project-timeline-loading">
        <a-spin />
      </div>

      <a-empty
        v-else-if="records.length === 0"
        description="暂无项目记录"
        class="project-timeline-empty"
      />

      <a-timeline v-else class="project-timeline-list">
        <a-timeline-item v-for="record in records" :key="record.id">
          <TimelineEntry :record="record" />
        </a-timeline-item>
      </a-timeline>

      <footer v-if="total > 0" class="project-timeline-pagination">
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="total"
          :responsive="false"
          :show-less-items="false"
          :show-size-changer="true"
          :page-size-options="pageSizeOptions"
          :show-total="(value) => `共 ${value} 条`"
          show-quick-jumper
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
        />
      </footer>
    </main>

    <TimelineCreateModal
      v-model:open="createModalVisible"
      :submitting="submitting"
      :categories="knownCategories"
      @submit="handleCreate"
    />

    <TimelineImportModal
      v-model:open="importModalVisible"
      :submitting="importing"
      @submit="handleImport"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, QuestionCircleOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { createProjectTimelineRecord, importProjectTimelineRecords, listProjectTimelineRecords } from '@/services/admin'
import TimelineCreateModal from './TimelineCreateModal.vue'
import TimelineImportModal from './TimelineImportModal.vue'
import TimelineEntry from './TimelineEntry.vue'
import { buildCategoryOptions } from './timelineMeta'
import './styles.css'

const records = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const pageSizeOptions = ['10', '20', '50', '100']
const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const errorMessage = ref('')
const createModalVisible = ref(false)
const importModalVisible = ref(false)
const filterCategory = ref(undefined)
const keyword = ref('')
const knownCategories = ref([])

const categoryOptions = computed(() => buildCategoryOptions(knownCategories.value))

async function loadRecords(nextPage = page.value) {
  page.value = nextPage
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await listProjectTimelineRecords({
      page: page.value,
      pageSize: pageSize.value,
      category: filterCategory.value || undefined,
      keyword: keyword.value.trim() || undefined
    })
    records.value = result.items || []
    total.value = result.total || 0
    knownCategories.value = result.categories || []
  } catch (error) {
    errorMessage.value = error.message || '项目记录加载失败'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  page.value = 1
  loadRecords(1)
}

function handleSearch() {
  page.value = 1
  loadRecords(1)
}

function handlePageChange(nextPage, nextPageSize) {
  pageSize.value = nextPageSize || pageSize.value
  loadRecords(nextPage)
}

function handlePageSizeChange(_nextPage, nextPageSize) {
  pageSize.value = nextPageSize || pageSize.value
  page.value = 1
  loadRecords(1)
}

async function handleCreate(payload) {
  submitting.value = true
  try {
    await createProjectTimelineRecord(payload)
    message.success('项目记录已新增')
    createModalVisible.value = false
    page.value = 1
    await loadRecords(1)
  } catch (error) {
    message.error(error.message || '新增项目记录失败')
  } finally {
    submitting.value = false
  }
}

async function handleImport(file) {
  importing.value = true
  try {
    const result = await importProjectTimelineRecords(file)
    message.success(`导入完成：新增 ${result.inserted || 0} 条，已存在 ${result.duplicated || 0} 条`)
    importModalVisible.value = false
    page.value = 1
    await loadRecords(1)
  } catch (error) {
    message.error(error.message || '导入项目记录失败')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>
