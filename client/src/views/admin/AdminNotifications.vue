<template>
  <section class="enterprise-page announce-page">
    <!-- 页头 -->
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">OPERATIONS</p>
        <h2>公告管理</h2>
        <p>维护站内公告和运营通知，保持门户信息同步更新。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button type="primary" @click="openCreateModal">
          <template #icon><PlusOutlined /></template>
          发布公告
        </a-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <a-card class="enterprise-filter-card" :bordered="false">
      <div class="announce-filter">
        <div class="announce-filter-left">
          <a-select
            v-model:value="filterLevel"
            placeholder="公告级别"
            style="width: 130px"
            allow-clear
          >
            <a-select-option value="info">普通提示</a-select-option>
            <a-select-option value="warning">重要警告</a-select-option>
            <a-select-option value="error">紧急高危</a-select-option>
          </a-select>
          <a-select
            v-model:value="filterIsActive"
            placeholder="上下架状态"
            style="width: 130px"
            allow-clear
          >
            <a-select-option value="true">已上架</a-select-option>
            <a-select-option value="false">已下架</a-select-option>
          </a-select>
        </div>
        <div class="announce-filter-right">
          <a-button @click="resetFilters">
            <template #icon><ClearOutlined /></template>
            重置
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 表格 -->
    <BlogTable
      ref="tableRef"
      :api-fn="fetchAnnouncements"
      :columns="columns"
      :params="filterParams"
      :row-selection="true"
      :auto-load="true"
      :page-size="15"
      :page-sizes="['10', '15', '30', '50']"
      :scroll="{ x: 900 }"
      @selection-change="onSelectionChange"
    >
      <template #toolbar>
        <div v-if="selectedRowKeys.length > 0" class="announce-batch-bar">
          <span class="announce-batch-text">已选择 {{ selectedRowKeys.length }} 项</span>
          <a-button size="small" @click="handleBatchToggle(true)">批量上架</a-button>
          <a-button size="small" @click="handleBatchToggle(false)">批量下架</a-button>
          <a-button size="small" danger @click="handleBatchDelete">批量删除</a-button>
          <a-button size="small" type="link" @click="tableRef?.clearSelection()">取消选择</a-button>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <!-- 标题列 -->
        <template v-if="column.key === 'title'">
          <div class="announce-title-cell">
            <span class="announce-title-text">{{ record.title }}</span>
          </div>
        </template>

        <!-- 级别列 -->
        <template v-else-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)" class="announce-level-tag">
            <span class="announce-level-dot" :style="{ background: getLevelDotColor(record.level) }" />
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>

        <!-- 状态列 -->
        <template v-else-if="column.key === 'isActive'">
          <a-badge
            :status="record.isActive ? 'success' : 'default'"
            :text="record.isActive ? '已上架' : '已下架'"
          />
        </template>

        <!-- 时间列 -->
        <template v-else-if="column.key === 'createdAt'">
          <div class="announce-time-cell">
            <span>{{ formatDate(record.createdAt) }}</span>
          </div>
        </template>

        <!-- 阅读量列 -->
        <template v-else-if="column.key === 'viewCount'">
          <span class="announce-view-count">
            <EyeOutlined /> {{ record.readCount || 0 }}
          </span>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openDetailModal(record)">详情</a-button>
            <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
            <a-button
              type="link"
              size="small"
              @click="handleToggleActive(record)"
            >
              {{ record.isActive ? '下架' : '上架' }}
            </a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <!-- 新建 / 编辑弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="editingId ? '编辑公告' : '发布公告'"
      :confirm-loading="submitting"
      width="680px"
      :mask-closable="false"
      centered
      :ok-text="editingId ? '保存修改' : '发布公告'"
      cancel-text="取消"
      class="announce-form-modal"
      @ok="handleFormSubmit"
      @cancel="closeFormModal"
    >
      <a-form layout="vertical" class="announce-form">
        <a-form-item label="公告标题" required>
          <a-input
            v-model:value="form.title"
            placeholder="请输入公告标题"
            :maxlength="120"
            show-count
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="公告级别">
              <a-select v-model:value="form.level">
                <a-select-option value="info">
                  <span style="color: #1677ff">●</span> 普通提示
                </a-select-option>
                <a-select-option value="warning">
                  <span style="color: #fa8c16">●</span> 重要警告
                </a-select-option>
                <a-select-option value="error">
                  <span style="color: #f5222d">●</span> 紧急高危
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="上下架状态">
              <a-switch
                v-model:checked="form.isActive"
                checked-children="上架"
                un-checked-children="下架"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="公告内容" required>
          <a-textarea
            v-model:value="form.content"
            placeholder="请输入公告内容"
            :rows="8"
            :maxlength="10000"
            show-count
          />
        </a-form-item>

        <a-form-item label="关联链接">
          <a-input
            v-model:value="form.link"
            placeholder="可选，点击公告后跳转的链接"
          />
        </a-form-item>

        <a-form-item label="弹窗推送">
          <a-switch
            v-model:checked="form.autoPopup"
            checked-children="开启"
            un-checked-children="关闭"
          />
          <div class="announce-form-hint">开启后，公告发布时将对所有在线用户弹窗提醒（仅首次）</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="detailData?.title || '公告详情'"
      :footer="null"
      width="640px"
      centered
      class="announce-detail-modal"
    >
      <template v-if="detailData">
        <div class="announce-detail-meta">
          <a-tag :color="getLevelColor(detailData.level)">
            {{ getLevelText(detailData.level) }}
          </a-tag>
          <a-badge
            :status="detailData.isActive ? 'success' : 'default'"
            :text="detailData.isActive ? '已上架' : '已下架'"
          />
          <span class="announce-detail-time">
            <ClockCircleOutlined /> 发布于 {{ formatDate(detailData.createdAt) }}
          </span>
          <span class="announce-detail-views">
            <EyeOutlined /> {{ detailData.readCount || 0 }} 人已读
          </span>
        </div>
        <a-divider style="margin: 16px 0" />
        <div class="announce-detail-content">{{ detailData.content }}</div>
        <div v-if="detailData.link" class="announce-detail-link">
          <LinkOutlined /> <a :href="detailData.link" target="_blank">{{ detailData.link }}</a>
        </div>
        <div v-if="detailData.autoPopup" class="announce-detail-popup-badge">
          <a-tag color="purple">弹窗推送已开启</a-tag>
        </div>
      </template>
    </a-modal>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  ClearOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  batchDeleteAnnouncements,
  batchToggleAnnouncement,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement
} from '@/services/admin'

const tableRef = ref(null)
const selectedRowKeys = ref([])

// 筛选
const filterLevel = ref(undefined)
const filterIsActive = ref(undefined)

const filterParams = computed(() => ({
  level: filterLevel.value,
  isActive: filterIsActive.value
}))

// 表单弹窗
const formModalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = reactive({
  title: '',
  content: '',
  link: '',
  level: 'info',
  isActive: true,
  autoPopup: false
})

// 详情弹窗
const detailModalVisible = ref(false)
const detailData = ref(null)

// 级别映射
const levelMap = {
  info: { text: '普通提示', color: 'blue', dot: '#1677ff' },
  warning: { text: '重要警告', color: 'orange', dot: '#fa8c16' },
  error: { text: '紧急高危', color: 'red', dot: '#f5222d' }
}

function getLevelText(level) {
  return levelMap[level]?.text || '普通提示'
}

function getLevelColor(level) {
  return levelMap[level]?.color || 'blue'
}

function getLevelDotColor(level) {
  return levelMap[level]?.dot || '#1677ff'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 表格列
const columns = [
  { title: '公告标题', key: 'title', dataIndex: 'title', width: '28%', ellipsis: true },
  { title: '公告级别', key: 'level', width: 120, align: 'center' },
  { title: '上下架', key: 'isActive', width: 100, align: 'center' },
  { title: '发布时间', key: 'createdAt', width: 170 },
  { title: '阅读量', key: 'viewCount', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

// 数据加载（适配 BlogTable 的 apiFn 格式）
async function fetchAnnouncements(params) {
  const result = await listAdminAnnouncements(params)
  return { items: result.items || [], total: result.total || 0 }
}

// 筛选重置
function resetFilters() {
  filterLevel.value = undefined
  filterIsActive.value = undefined
}

// 行选择
function onSelectionChange(keys) {
  selectedRowKeys.value = keys
}

// 新建弹窗
function openCreateModal() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.link = ''
  form.level = 'info'
  form.isActive = true
  form.autoPopup = false
  formModalVisible.value = true
}

// 编辑弹窗
function openEditModal(record) {
  editingId.value = record.id
  form.title = record.title
  form.content = record.content
  form.link = record.link || ''
  form.level = record.level || 'info'
  form.isActive = record.isActive !== false
  form.autoPopup = record.autoPopup || false
  formModalVisible.value = true
}

function closeFormModal() {
  formModalVisible.value = false
}

// 提交表单
async function handleFormSubmit() {
  if (!form.title.trim()) {
    message.warning('请输入公告标题')
    return
  }
  if (!form.content.trim()) {
    message.warning('请输入公告内容')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateAdminAnnouncement(editingId.value, form)
      message.success('公告已更新')
    } else {
      await createAdminAnnouncement(form)
      message.success('公告已发布')
    }
    closeFormModal()
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 详情弹窗
async function openDetailModal(record) {
  try {
    const detail = await getAdminAnnouncement(record.id)
    detailData.value = detail
    detailModalVisible.value = true
  } catch (error) {
    message.error(error.message || '获取详情失败')
  }
}

// 上架 / 下架
async function handleToggleActive(record) {
  try {
    await updateAdminAnnouncement(record.id, { isActive: !record.isActive })
    message.success(record.isActive ? '已下架' : '已上架')
    tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '操作失败')
  }
}

// 删除
function handleDelete(record) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除公告「${record.title}」吗？删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteAdminAnnouncement(record.id)
        message.success('公告已删除')
        tableRef.value?.refresh()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

// 批量操作
async function handleBatchToggle(isActive) {
  Modal.confirm({
    title: isActive ? '批量上架' : '批量下架',
    content: `确定要${isActive ? '上架' : '下架'} ${selectedRowKeys.value.length} 条公告吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await batchToggleAnnouncement(selectedRowKeys.value, isActive)
        message.success(`已${isActive ? '上架' : '下架'}所选公告`)
        selectedRowKeys.value = []
        tableRef.value?.refresh()
      } catch (error) {
        message.error(error.message || '操作失败')
      }
    }
  })
}

function handleBatchDelete() {
  Modal.confirm({
    title: '批量删除',
    content: `确定要删除 ${selectedRowKeys.value.length} 条公告吗？删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await batchDeleteAnnouncements(selectedRowKeys.value)
        message.success('已删除所选公告')
        selectedRowKeys.value = []
        tableRef.value?.refresh()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}
</script>

<style scoped>
.announce-page {
  max-width: 1400px;
}

/* 筛选栏 */
.announce-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.announce-filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.announce-filter-right {
  display: flex;
  gap: 8px;
}

/* 批量操作栏 */
.announce-batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.announce-batch-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--console-primary-strong, #0958d9);
  margin-right: 8px;
}

/* 标题单元格 */
.announce-title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.announce-title-text {
  font-weight: 500;
  color: var(--console-text);
  line-height: 1.5;
}

/* 级别标签 */
.announce-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  font-weight: 500;
}

.announce-level-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* 时间 */
.announce-time-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--console-text-secondary);
}

/* 阅读量 */
.announce-view-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--console-text-secondary);
}

/* 表单弹窗 */
.announce-form-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.announce-form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--console-text-secondary);
  line-height: 1.6;
}

/* 详情弹窗 */
.announce-detail-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.announce-detail-time,
.announce-detail-views {
  font-size: 13px;
  color: var(--console-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.announce-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.8;
  color: var(--console-text);
}

.announce-detail-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--console-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.announce-detail-popup-badge {
  margin-top: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .announce-filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .announce-filter-left {
    width: 100%;
  }
}
</style>
