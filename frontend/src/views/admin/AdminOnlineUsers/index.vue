<template>
  <section class="online-users-page enterprise-page">
    <BlogTable
      ref="tableRef"
      class="online-users-table"
      :api-fn="loadSessions"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="20"
      :page-sizes="['10', '20', '50', '100']"
      :show-column-setting="true"
      :height="'100%'"
      :scroll="{ x: 1320 }"
      striped
      @data-change="handleDataChange"
    >
      <template #toolbar>
        <a-space wrap>
          <span class="online-users-toolbar-title">
            在线用户
            <a-tooltip title="最近 3 分钟内有心跳的会话视为在线，浏览器关闭或断网后会在超时窗口内变为离线。">
              <QuestionCircleOutlined aria-label="在线状态说明" />
            </a-tooltip>
          </span>
          <a-input-search
            v-model:value="keywordInput"
            placeholder="搜索用户名、邮箱或备注"
            allow-clear
            class="online-users-keyword"
            @search="applyKeyword"
            @change="handleKeywordChange"
          />
          <a-select
            v-model:value="statusFilter"
            class="online-users-status"
            show-search
            option-filter-prop="label"
            :options="statusOptions"
          />
          <a-range-picker
            v-model:value="dateRange"
            class="online-users-date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :placeholder="['登录开始日期', '登录结束日期']"
          />
          <span class="online-users-summary">
            当前在线 <strong>{{ onlineCount }}</strong>
            <span>条记录 {{ totalCount }}</span>
          </span>
          <a-tooltip title="刷新在线状态">
            <a-button aria-label="刷新在线用户" @click="tableRef?.refresh?.()">
              <template #icon><ReloadOutlined /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'sessionUser'">
          <div class="online-user-cell">
            <a-avatar :src="getUserAvatar(record.user)" :size="34">
              {{ getInitial(record.user?.username) }}
            </a-avatar>
            <div class="online-user-cell__identity">
              <strong>{{ record.user?.username || '-' }}</strong>
              <span v-if="record.user?.remarkName">{{ record.user.remarkName }}</span>
              <small>{{ record.user?.email || '-' }}</small>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionStatus'">
          <a-tag :color="getStatusMeta(record.status).color" :bordered="false">
            {{ getStatusMeta(record.status).label }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'sessionLoginAt'">
          <span class="online-users-time">{{ formatDate(record.loginAt) }}</span>
        </template>
        <template v-else-if="column.key === 'sessionLastSeenAt'">
          <span class="online-users-time">{{ formatDate(record.lastSeenAt) }}</span>
        </template>
        <template v-else-if="column.key === 'sessionLogoutAt'">
          <span class="online-users-time">{{ formatDate(record.logoutAt) }}</span>
        </template>
        <template v-else-if="column.key === 'sessionDevice'">
          <div class="online-users-device">
            <span>{{ record.device || '未知设备' }}</span>
            <small>{{ record.browser || '未知浏览器' }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionIp'">
          <span class="online-users-ip">{{ record.ip || '-' }}</span>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listAdminOnlineUsers } from '@/services/admin'
import { getUserAvatar } from '@/utils/avatar'

const REFRESH_INTERVAL_MS = 30 * 1000

const tableRef = ref(null)
const keywordInput = ref('')
const keyword = ref('')
const statusFilter = ref('all')
const dateRange = ref([])
const onlineCount = ref(0)
const totalCount = ref(0)
let refreshTimer = null

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]

const filterParams = computed(() => ({
  keyword: keyword.value || undefined,
  status: statusFilter.value,
  from: dateRange.value?.[0] || undefined,
  to: dateRange.value?.[1] || undefined
}))

const columns = [
  { title: '用户', key: 'sessionUser', width: 250, fixed: 'left' },
  { title: '登录时间', key: 'sessionLoginAt', width: 175, align: 'center' },
  { title: '最近活动', key: 'sessionLastSeenAt', width: 175, align: 'center' },
  { title: '状态', key: 'sessionStatus', width: 100, align: 'center' },
  { title: '设备 / 浏览器', key: 'sessionDevice', width: 180 },
  { title: 'IP 地址', key: 'sessionIp', width: 160 },
  { title: '退出时间', key: 'sessionLogoutAt', width: 175, align: 'center' }
]

async function loadSessions(params) {
  try {
    return await listAdminOnlineUsers(params)
  } catch (error) {
    message.error(error.message || '在线用户加载失败')
    throw error
  }
}

function handleDataChange({ total, raw }) {
  totalCount.value = total || 0
  onlineCount.value = raw?.onlineCount || 0
}

function applyKeyword(value = keywordInput.value) {
  keyword.value = String(value || '').trim()
}

function handleKeywordChange(event) {
  if (!event?.target?.value) applyKeyword('')
}

function getStatusMeta(status) {
  if (status === 'online') return { label: '在线', color: 'green' }
  if (status === 'logged_out') return { label: '已退出', color: 'default' }
  return { label: '已离线', color: 'gold' }
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getInitial(name = '') {
  return String(name || '用').slice(0, 1).toUpperCase()
}

function startAutoRefresh() {
  refreshTimer = window.setInterval(() => {
    tableRef.value?.refresh?.()
  }, REFRESH_INTERVAL_MS)
}

onMounted(startAutoRefresh)

onUnmounted(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
  refreshTimer = null
})
</script>

<style scoped>
.online-users-page {
  height: var(--console-page-available-height);
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
}

.online-users-table {
  min-height: 0;
}

.online-users-toolbar-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--console-text-primary);
  font-weight: 600;
  white-space: nowrap;
}

.online-users-toolbar-title :deep(.anticon) {
  color: var(--console-text-secondary);
  cursor: help;
}

.online-users-keyword {
  width: 230px;
}

.online-users-status {
  width: 120px;
}

.online-users-date {
  width: 250px;
}

.online-users-summary {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  color: var(--console-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.online-users-summary strong {
  color: #389e0d;
  font-size: 18px;
  line-height: 1;
}

.online-users-summary span {
  color: var(--console-text-tertiary, #909399);
}

.online-user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.online-user-cell__identity {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.online-user-cell__identity strong,
.online-user-cell__identity span,
.online-user-cell__identity small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.online-user-cell__identity strong {
  color: var(--console-text-primary);
}

.online-user-cell__identity span,
.online-user-cell__identity small,
.online-users-time,
.online-users-device small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.online-users-device {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.online-users-device span,
.online-users-ip {
  overflow: hidden;
  color: var(--console-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 920px) {
  .online-users-keyword,
  .online-users-date {
    width: 100%;
  }

  .online-users-status {
    width: 140px;
  }
}
</style>
