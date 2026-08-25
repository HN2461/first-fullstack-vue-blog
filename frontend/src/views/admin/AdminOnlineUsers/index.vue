<template>
  <section class="online-users-page enterprise-page">
    <div class="online-users-overview" aria-label="会话概览">
      <article v-for="metric in metrics" :key="metric.key" class="online-users-metric">
        <div class="online-users-metric__icon" :class="`is-${metric.tone}`">
          <component :is="metric.icon" />
        </div>
        <div class="online-users-metric__content">
          <div class="online-users-metric__label">
            <span>{{ metric.label }}</span>
            <small>{{ metric.badge }}</small>
          </div>
          <strong>{{ metric.value }}</strong>
          <span class="online-users-metric__help">{{ metric.help }}</span>
        </div>
      </article>
      <div class="online-users-overview__sync online-users-sync-card">
        <div class="online-users-sync-card__main">
          <div class="online-users-sync-card__icon" :class="{ 'is-paused': !autoRefreshEnabled }">
            <SyncOutlined />
            <span class="online-users-sync-dot" :class="{ 'is-paused': !autoRefreshEnabled }" />
          </div>
          <div class="online-users-sync-card__content">
            <div class="online-users-sync-card__label">
              <span>状态同步</span>
              <small>{{ autoRefreshEnabled ? '运行中' : '已暂停' }}</small>
            </div>
            <strong>{{ autoRefreshEnabled ? '每 30 秒刷新' : '手动刷新' }}</strong>
          </div>
        </div>
        <a-tooltip :title="autoRefreshEnabled ? '暂停自动更新' : '开启自动更新'">
          <a-switch v-model:checked="autoRefreshEnabled" size="small" aria-label="切换自动更新" />
        </a-tooltip>
      </div>
    </div>

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
      :scroll="{ x: 1080 }"
      column-border
      striped
      @data-change="handleDataChange"
    >
      <template #toolbar>
        <div class="online-users-toolbar">
          <div class="online-users-toolbar__heading">
            <div class="online-users-toolbar__title-line">
              <span class="online-users-toolbar__title">在线用户</span>
              <a-tag class="online-users-toolbar__tag" :bordered="false" color="blue">登录会话监控</a-tag>
            </div>
            <a-tooltip title="一行代表一次登录会话，同一账号在多个设备登录会显示多行。最近 3 分钟内有心跳且账号有效的会话视为在线，关闭浏览器或网络中断后会转为离线。">
              <QuestionCircleOutlined aria-label="在线状态说明" />
            </a-tooltip>
            <span class="online-users-toolbar__updated">更新于 {{ formatClock(lastRefreshAt) }}</span>
          </div>

          <div class="online-users-toolbar__filters">
            <a-segmented
              v-model:value="statusFilter"
              class="online-users-status"
              :options="statusOptions"
            />
            <a-input-search
              v-model:value="keywordInput"
              placeholder="搜索用户、邮箱或备注"
              allow-clear
              class="online-users-keyword"
              @search="applyKeyword"
              @change="handleKeywordChange"
            />
            <a-range-picker
              v-model:value="dateRange"
              class="online-users-date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="['登录开始', '登录结束']"
            />
          </div>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'sessionUser'">
          <div class="online-user-cell">
            <a-avatar :src="getUserAvatar(record.user)" :size="36">
              {{ getInitial(record.user?.username) }}
            </a-avatar>
            <div class="online-user-cell__identity">
              <strong>
                {{ record.user?.username || '-' }}
                <a-tag v-if="record.current" class="online-user-cell__current" :bordered="false" color="blue">当前</a-tag>
              </strong>
              <span v-if="record.user?.remarkName">{{ record.user.remarkName }}</span>
              <small>{{ record.user?.email || '-' }}</small>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionStatus'">
          <div class="online-users-status-cell">
            <span class="online-users-status-dot" :class="`is-${getStatusMeta(record.status).tone}`" />
            <span>{{ getStatusMeta(record.status).label }}</span>
            <small v-if="record.status === 'online'">{{ formatRelative(record.lastSeenAt) }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionDevice'">
          <div class="online-users-device">
            <span><component :is="getDeviceIcon(record.device)" />{{ record.device || '未知设备' }}</span>
            <small>{{ record.browser || '未知浏览器' }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionNetwork'">
          <div class="online-users-network">
            <span>{{ record.ip || '-' }}</span>
            <small>{{ record.user?.status === 'active' ? '账号正常' : '账号已停用' }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionLoginAt'">
          <div class="online-users-time-cell">
            <span>{{ formatDate(record.loginAt) }}</span>
            <small>持续 {{ formatDuration(record.loginAt, record.logoutAt) }}</small>
          </div>
        </template>
        <template v-else-if="column.key === 'sessionLastSeenAt'">
          <span class="online-users-time">{{ formatDate(record.lastSeenAt) }}</span>
        </template>
        <template v-else-if="column.key === 'sessionAction'">
          <a-tooltip title="查看会话详情">
            <a-button
              type="text"
              shape="circle"
              class="online-users-action"
              aria-label="查看会话详情"
              @click="openSessionDetail(record)"
            >
              <template #icon><EyeOutlined /></template>
            </a-button>
          </a-tooltip>
        </template>
      </template>
    </BlogTable>

    <a-drawer
      v-model:open="detailVisible"
      title="会话详情"
      placement="right"
      :width="420"
      :body-style="{ padding: '20px', overflow: 'auto' }"
    >
      <template v-if="detailRecord">
        <div class="session-detail__identity">
          <a-avatar :src="getUserAvatar(detailRecord.user)" :size="48">
            {{ getInitial(detailRecord.user?.username) }}
          </a-avatar>
          <div>
            <strong>{{ detailRecord.user?.username || '-' }}</strong>
            <span>{{ detailRecord.user?.email || '-' }}</span>
          </div>
          <a-tag v-if="detailRecord.current" color="blue" :bordered="false">当前会话</a-tag>
          <a-tag :color="getStatusMeta(detailRecord.status).color" :bordered="false">
            {{ getStatusMeta(detailRecord.status).label }}
          </a-tag>
        </div>

        <a-divider />

        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="设备">{{ detailRecord.device || '未知设备' }}</a-descriptions-item>
          <a-descriptions-item label="浏览器">{{ detailRecord.browser || '未知浏览器' }}</a-descriptions-item>
          <a-descriptions-item label="IP 地址">{{ detailRecord.ip || '-' }}</a-descriptions-item>
          <a-descriptions-item label="登录时间">{{ formatDate(detailRecord.loginAt) }}</a-descriptions-item>
          <a-descriptions-item label="最近活动">{{ formatDate(detailRecord.lastSeenAt) }}</a-descriptions-item>
          <a-descriptions-item label="退出时间">{{ formatDate(detailRecord.logoutAt) }}</a-descriptions-item>
          <a-descriptions-item label="会话时长">{{ formatDuration(detailRecord.loginAt, detailRecord.logoutAt) }}</a-descriptions-item>
        </a-descriptions>

        <div class="session-detail__note">
          <InfoCircleOutlined />
          <span>在线状态以服务端最近心跳和账号有效性为准。结束其他活跃会话后，对方下次请求会立即失效。</span>
        </div>

        <div class="session-detail__actions">
          <a-button
            v-if="detailRecord.status !== 'logged_out' && !detailRecord.current"
            danger
            :loading="revoking"
            @click="confirmRevokeSession(detailRecord)"
          >
            <template #icon><LogoutOutlined /></template>
            结束此会话
          </a-button>
          <span v-else-if="detailRecord.current" class="session-detail__current-hint">当前管理员会话不能从这里结束</span>
        </div>
      </template>
    </a-drawer>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  DesktopOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MobileOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  UserOutlined,
  WifiOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listAdminOnlineUsers, revokeAdminOnlineSession } from '@/services/admin'
import { getUserAvatar } from '@/utils/avatar'

const REFRESH_INTERVAL_MS = 30 * 1000

const tableRef = ref(null)
const keywordInput = ref('')
const keyword = ref('')
const statusFilter = ref('all')
const dateRange = ref([])
const onlineCount = ref(0)
const onlineUserCount = ref(0)
const recentLoginCount = ref(0)
const totalCount = ref(0)
const lastRefreshAt = ref(null)
const autoRefreshEnabled = ref(true)
const detailVisible = ref(false)
const detailRecord = ref(null)
const revoking = ref(false)
let refreshTimer = null

const statusOptions = computed(() => [
  { label: '全部', value: 'all' },
  { label: `在线 ${onlineCount.value || 0}`, value: 'online' },
  { label: '离线', value: 'offline' }
])

const filterParams = computed(() => ({
  keyword: keyword.value || undefined,
  status: statusFilter.value,
  from: dateRange.value?.[0] || undefined,
  to: dateRange.value?.[1] || undefined
}))

const metrics = computed(() => [
  { key: 'sessions', label: '在线会话', badge: '实时', value: onlineCount.value, help: '最近 3 分钟有心跳', icon: WifiOutlined, tone: 'blue' },
  { key: 'users', label: '在线用户', badge: '去重', value: onlineUserCount.value, help: '按账号统计', icon: UserOutlined, tone: 'green' },
  { key: 'logins', label: '近 24 小时登录', badge: '审计', value: recentLoginCount.value, help: '包含已结束会话', icon: ClockCircleOutlined, tone: 'orange' }
])

const columns = [
  { title: '用户 / 账号', key: 'sessionUser', width: 214, fixed: 'left' },
  { title: '状态', key: 'sessionStatus', width: 132 },
  { title: '设备 / 浏览器', key: 'sessionDevice', width: 176 },
  { title: 'IP 地址', key: 'sessionNetwork', width: 150 },
  { title: '登录时间', key: 'sessionLoginAt', width: 184 },
  { title: '最近活动', key: 'sessionLastSeenAt', width: 150 },
  { title: '', key: 'sessionAction', width: 52, fixed: 'right', align: 'center' }
]

async function loadSessions(params) {
  try {
    return await listAdminOnlineUsers(params)
  } catch (error) {
    message.error(error.message || '在线会话加载失败')
    throw error
  }
}

function handleDataChange({ total, raw }) {
  totalCount.value = total || 0
  onlineCount.value = raw?.onlineCount || 0
  onlineUserCount.value = raw?.onlineUserCount || 0
  recentLoginCount.value = raw?.recentLoginCount || 0
  lastRefreshAt.value = new Date()
}

function applyKeyword(value = keywordInput.value) {
  keyword.value = String(value || '').trim()
}

function handleKeywordChange(event) {
  if (!event?.target?.value) applyKeyword('')
}

function getStatusMeta(status) {
  if (status === 'online') return { label: '在线', color: 'green', tone: 'online' }
  if (status === 'logged_out') return { label: '已退出', color: 'default', tone: 'logged-out' }
  return { label: '已离线', color: 'gold', tone: 'offline' }
}

function getDeviceIcon(device = '') {
  return /移动|平板|手机/i.test(device) ? MobileOutlined : DesktopOutlined
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatClock(value) {
  if (!value) return '等待同步'
  return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatRelative(value) {
  if (!value) return '暂无活动'
  const diff = Math.max(0, Date.now() - new Date(value).getTime())
  const seconds = Math.floor(diff / 1000)
  if (seconds < 30) return '刚刚活动'
  if (seconds < 60) return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  return `${Math.floor(minutes / 60)} 小时前`
}

function formatDuration(start, end) {
  if (!start) return '-'
  const startAt = new Date(start).getTime()
  const endAt = end ? new Date(end).getTime() : Date.now()
  if (Number.isNaN(startAt) || Number.isNaN(endAt) || endAt < startAt) return '-'
  const minutes = Math.max(1, Math.floor((endAt - startAt) / 60000))
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`
}

function getInitial(name = '') {
  return String(name || '用').slice(0, 1).toUpperCase()
}

function openSessionDetail(record) {
  detailRecord.value = record
  detailVisible.value = true
}

function confirmRevokeSession(record) {
  Modal.confirm({
    title: '结束登录会话',
    content: `结束「${record.user?.username || '该用户'}」的这次登录会话？对方下次访问时需要重新登录。`,
    okText: '确认结束',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      revoking.value = true
      try {
        await revokeAdminOnlineSession(record.id)
        message.success('登录会话已结束')
        detailVisible.value = false
        await tableRef.value?.refresh?.()
      } catch (error) {
        message.error(error.message || '结束会话失败')
      } finally {
        revoking.value = false
      }
    }
  })
}

function startAutoRefresh() {
  refreshTimer = window.setInterval(() => {
    if (autoRefreshEnabled.value) tableRef.value?.refresh?.()
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
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
}

.online-users-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}

.online-users-metric,
.online-users-overview__sync {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 8px 10px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.online-users-metric { gap: 9px; }

.online-users-metric__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
}

.online-users-metric__icon.is-blue { color: var(--console-primary); background: var(--console-primary-soft); }
.online-users-metric__icon.is-green { color: #389e0d; background: #f6ffed; }
.online-users-metric__icon.is-orange { color: #d46b08; background: #fff7e6; }

.online-users-sync-card__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--console-primary);
  background: var(--console-primary-soft);
  font-size: 14px;
}

.online-users-sync-card__icon.is-paused {
  color: var(--console-text-tertiary, #909399);
  background: var(--console-surface-muted);
}

.online-users-sync-card__main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
}

.online-users-sync-card__content {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.online-users-metric__content { display: grid; min-width: 0; gap: 1px; }

.online-users-metric__label,
.online-users-sync-card__label { display: flex; align-items: center; gap: 6px; min-width: 0; }

.online-users-metric__label span,
.online-users-metric__label small,
.online-users-metric__help,
.online-users-sync-card__label span,
.online-users-sync-card__label small,
.online-users-overview__sync strong {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.online-users-metric__label small,
.online-users-sync-card__label small { color: var(--console-text-tertiary, #909399); }

.online-users-metric__content strong {
  color: var(--console-text);
  font-size: 20px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.online-users-metric__help { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.online-users-overview__sync { justify-content: space-between; gap: 10px; }
.online-users-overview__sync strong { color: var(--console-text); font-weight: 500; }

.online-users-sync-dot,
.online-users-status-dot {
  display: inline-block;
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 3px color-mix(in srgb, #52c41a 16%, transparent);
}

.online-users-sync-card__icon .online-users-sync-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 7px;
  height: 7px;
  border: 2px solid var(--console-surface);
  box-sizing: content-box;
  box-shadow: none;
}

.online-users-sync-dot.is-paused { background: #bfbfbf; box-shadow: none; }
.online-users-table { min-height: 0; }

.online-users-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 14px;
}

.online-users-toolbar__heading,
.online-users-toolbar__filters {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.online-users-toolbar__heading { flex: 0 0 auto; }
.online-users-toolbar__filters { justify-content: flex-end; flex: 1 1 auto; }

.online-users-toolbar__title-line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.online-users-toolbar__title { color: var(--console-text); font-size: 16px; font-weight: 600; white-space: nowrap; }
.online-users-toolbar__tag { margin: 0; font-size: 11px; line-height: 20px; }
.online-users-toolbar__heading > .anticon { color: var(--console-text-secondary); cursor: help; }

.online-users-toolbar__updated {
  padding-left: 8px;
  border-left: 1px solid var(--console-border);
  color: var(--console-text-tertiary, #909399);
  font-size: 12px;
  white-space: nowrap;
}

.online-users-status { min-width: 212px; }
.online-users-keyword { width: 220px; }
.online-users-date { width: 238px; }

.online-user-cell,
.online-users-status-cell,
.online-users-device span { display: flex; align-items: center; }
.online-user-cell { gap: 10px; min-width: 0; }
.online-user-cell__identity,
.online-users-device,
.online-users-network,
.online-users-time-cell { display: grid; min-width: 0; gap: 3px; }

.online-user-cell__identity strong,
.online-user-cell__identity span,
.online-user-cell__identity small,
.online-users-device span,
.online-users-device small,
.online-users-network span,
.online-users-network small,
.online-users-time-cell span,
.online-users-time-cell small,
.online-users-time { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.online-user-cell__identity strong,
.online-users-device span,
.online-users-network span,
.online-users-time-cell span { color: var(--console-text); }
.online-user-cell__identity strong { display: flex; align-items: center; gap: 6px; }
.online-user-cell__current { flex: 0 0 auto; margin: 0; font-size: 11px; line-height: 18px; }
.online-user-cell__identity span { color: var(--console-primary); font-size: 12px; }
.online-user-cell__identity small,
.online-users-device small,
.online-users-network small,
.online-users-time-cell small,
.online-users-time { color: var(--console-text-secondary); font-size: 12px; }

.online-users-device span { gap: 6px; }
.online-users-device .anticon { color: var(--console-text-secondary); font-size: 14px; }
.online-users-status-cell { gap: 7px; color: var(--console-text); font-size: 13px; }
.online-users-status-cell small { margin-left: 1px; color: var(--console-text-tertiary, #909399); font-size: 12px; }
.online-users-status-dot.is-offline { background: #faad14; box-shadow: 0 0 0 3px color-mix(in srgb, #faad14 16%, transparent); }
.online-users-status-dot.is-logged-out { background: #bfbfbf; box-shadow: none; }
.online-users-action { color: var(--console-primary); }

.session-detail__identity { display: flex; align-items: center; gap: 12px; }
.session-detail__identity > div { display: grid; flex: 1; min-width: 0; gap: 3px; }
.session-detail__identity strong { color: var(--console-text); font-size: 16px; }
.session-detail__identity span { color: var(--console-text-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.session-detail__note {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 12px;
  color: var(--console-text-secondary);
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
  font-size: 12px;
  line-height: 1.6;
}

.session-detail__note .anticon { flex: 0 0 auto; margin-top: 3px; color: var(--console-primary); }

.session-detail__actions { display: flex; align-items: center; justify-content: flex-end; min-height: 40px; margin-top: 18px; }
.session-detail__current-hint { color: var(--console-text-tertiary, #909399); font-size: 12px; }

@media (max-width: 1180px) {
  .online-users-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .online-users-overview__sync { min-height: 58px; }
  .online-users-toolbar { align-items: flex-start; flex-direction: column; }
  .online-users-toolbar__filters { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
}

@media (max-width: 680px) {
  .online-users-page { height: auto; min-height: var(--console-page-available-height); overflow: visible; }
  .online-users-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .online-users-metric,
  .online-users-overview__sync { min-height: 54px; padding-inline: 8px; }
  .online-users-metric__help { display: none; }
  .online-users-toolbar__heading { width: 100%; flex-wrap: wrap; }
  .online-users-toolbar__updated { margin-left: auto; }
  .online-users-status,
  .online-users-keyword,
  .online-users-date { width: 100%; }
}
</style>
