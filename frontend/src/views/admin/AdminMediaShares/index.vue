<template>
  <section class="media-shares-page">
    <BlogTable
      ref="tableRef"
      class="media-shares-table"
      :api-fn="loadShares"
      :columns="columns"
      :params="tableParams"
      :page-size="15"
      :page-sizes="['15', '30', '50']"
      :scroll="{ x: 1200 }"
      :show-column-setting="true"
      empty-text="暂无符合条件的资源分享"
      @data-change="handleDataChange"
    >
      <template #toolbar>
        <div class="media-shares-toolbar">
          <div class="media-shares-toolbar__identity">
            <h2>资源分享</h2>
            <a-tooltip title="分享链接无需访客登录；撤销后记录会保留，便于追溯，只有已撤销记录可以手动删除。">
              <QuestionCircleOutlined aria-label="查看资源分享说明" />
            </a-tooltip>
          </div>
          <a-input-search v-model:value="keyword" allow-clear placeholder="搜索名称或说明" class="media-shares-toolbar__search" @search="reloadTable" />
          <a-select v-model:value="mode" allow-clear show-search option-filter-prop="label" placeholder="分享方式" :options="shareModeOptions" class="media-shares-toolbar__select" />
          <a-range-picker v-model:value="createdRange" class="media-shares-toolbar__date" />
          <a-button v-if="canCreateShare" type="primary" @click="router.push('/console/manage/media')"><template #icon><PlusOutlined /></template>创建分享</a-button>
        </div>
        <div class="media-shares-status-track">
          <button
            v-for="item in statusTrack"
            :key="item.value || 'all'"
            type="button"
            :class="{ 'is-active': status === item.value }"
            @click="status = item.value"
          >
            <span class="media-shares-status-track__dot" :class="`is-${item.value || 'all'}`" />
            {{ item.label }}
            <b>{{ item.count }}</b>
          </button>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <button class="media-share-name" type="button" @click="openDetail(record)">
            <strong>{{ record.name }}</strong>
            <span>{{ record.description || '暂无说明' }}</span>
          </button>
        </template>
        <template v-else-if="column.key === 'status'">
          <span class="media-share-status" :class="`is-${record.status}`"><i />{{ getShareStatusMeta(record.status).label }}</span>
        </template>
        <template v-else-if="column.key === 'mode'">
          <span class="media-share-mode"><LockOutlined v-if="record.mode === 'password'" /><GlobalOutlined v-else />{{ record.mode === 'password' ? '提取码访问' : '直接公开' }}</span>
        </template>
        <template v-else-if="column.key === 'resources'">
          <div class="media-share-cell-stack"><strong>{{ record.entryCount }} 个</strong><span>{{ formatFileSize(record.totalSize) }}</span></div>
        </template>
        <template v-else-if="column.key === 'accessCount'">
          <div class="media-share-cell-stack"><strong>{{ getAccessLabel(record) }}</strong><span>已访问 / 上限</span></div>
        </template>
        <template v-else-if="column.key === 'expiresAt'">
          <span :class="{ 'media-share-expired': record.status === 'expired' }">{{ record.expiresAt ? formatDate(record.expiresAt) : '永久有效' }}</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">{{ formatDate(record.createdAt) }}</template>
        <template v-else-if="column.key === 'action'">
          <div class="media-share-actions">
            <a-tooltip title="查看详情"><a-button type="text" aria-label="查看分享详情" @click="openDetail(record)"><template #icon><EyeOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="复制分享链接"><a-button type="text" aria-label="复制分享链接" @click="copyShareUrl(record)"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>

    <MediaShareDetailDrawer
      v-model:open="detailVisible"
      :record="currentRecord"
      @edit="openEdit"
      @revoke="confirmRevoke"
      @delete="confirmDelete"
    />
    <MediaShareEditModal v-model:open="editVisible" :record="editRecord" @saved="handleSaved" />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  CopyOutlined,
  EyeOutlined,
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { deleteAdminMediaShare, listAdminMediaShares, revokeAdminMediaShare } from '@/services/admin'
import { useAuthStore } from '@/stores/auth'
import MediaShareDetailDrawer from './MediaShareDetailDrawer.vue'
import MediaShareEditModal from './MediaShareEditModal.vue'
import {
  buildShareUrl,
  formatDate,
  formatFileSize,
  getAccessLabel,
  getShareStatusMeta,
  shareModeOptions,
  shareStatusOptions
} from './mediaShareDisplay'
import './media-share-page.css'

const router = useRouter()
const authStore = useAuthStore()
const tableRef = ref(null)
const keyword = ref('')
const mode = ref(undefined)
const status = ref('')
const createdRange = ref([])
const counts = ref({ all: 0, active: 0, expired: 0, exhausted: 0, revoked: 0 })
const detailVisible = ref(false)
const currentRecord = ref(null)
const editVisible = ref(false)
const editRecord = ref(null)
const canCreateShare = computed(() => authStore.canAccessPath('/console/manage/media'))
const statusTrack = computed(() => shareStatusOptions.map((item) => ({
  ...item,
  count: counts.value[item.value || 'all'] || 0
})))
const tableParams = computed(() => ({
  keyword: keyword.value.trim() || undefined,
  mode: mode.value || undefined,
  status: status.value || undefined,
  createdFrom: createdRange.value?.[0]?.startOf('day').toISOString(),
  createdTo: createdRange.value?.[1]?.endOf('day').toISOString()
}))
const columns = [
  { title: '资源包', key: 'name', dataIndex: 'name', width: 270, fixed: 'left' },
  { title: '状态', key: 'status', width: 110 },
  { title: '分享方式', key: 'mode', width: 130 },
  { title: '资源', key: 'resources', width: 110 },
  { title: '访问人数', key: 'accessCount', width: 130 },
  { title: '浏览', dataIndex: 'viewCount', key: 'viewCount', width: 80, align: 'right' },
  { title: '下载', dataIndex: 'downloadCount', key: 'downloadCount', width: 80, align: 'right' },
  { title: '有效期', key: 'expiresAt', width: 175 },
  { title: '创建时间', key: 'createdAt', width: 175 },
  { title: '操作', key: 'action', width: 100, fixed: 'right', align: 'center' }
]

async function loadShares(params) {
  try {
    return await listAdminMediaShares(params)
  } catch (error) {
    message.error(error.message || '资源分享列表加载失败')
    throw error
  }
}

function handleDataChange({ raw }) {
  counts.value = { ...counts.value, ...(raw?.counts || {}) }
}

function reloadTable() {
  tableRef.value?.reload()
}

function openDetail(record) {
  currentRecord.value = record
  detailVisible.value = true
}

function openEdit(record) {
  editRecord.value = record
  editVisible.value = true
}

function handleSaved(result) {
  currentRecord.value = result
  tableRef.value?.refresh()
}

async function copyShareUrl(record) {
  try {
    await navigator.clipboard.writeText(buildShareUrl(record.sharePath))
    message.success('分享链接已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}

function confirmRevoke(record) {
  Modal.confirm({
    title: '撤销资源分享',
    content: `撤销后，访客将立即无法继续预览或下载「${record.name}」。记录会保留，可在“已撤销”中查看或删除。`,
    okText: '确认撤销',
    okType: 'danger',
    async onOk() {
      await revokeAdminMediaShare(record.id)
      message.success('资源分享已撤销')
      detailVisible.value = false
      tableRef.value?.refresh()
    }
  })
}

function confirmDelete(record) {
  Modal.confirm({
    title: '删除分享记录',
    content: `确定永久删除「${record.name}」的分享记录吗？媒体资源文件不会被删除。`,
    okText: '删除记录',
    okType: 'danger',
    async onOk() {
      await deleteAdminMediaShare(record.id)
      message.success('分享记录已删除')
      detailVisible.value = false
      tableRef.value?.refresh()
    }
  })
}
</script>
