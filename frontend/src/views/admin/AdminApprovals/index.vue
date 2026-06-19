<template>
  <section class="approval-page">
    <header class="approval-head">
      <div>
        <p class="enterprise-page-kicker">PERMISSION APPROVAL</p>
        <h1>权限审批</h1>
        <p>所有管理员权限申请由超级管理员统一处理，审批通过后自动授予目标角色。</p>
      </div>
      <a-select v-model:value="statusFilter" class="approval-filter" @change="tableRef?.refresh?.()">
        <a-select-option value="all">全部状态</a-select-option>
        <a-select-option value="pending">待审批</a-select-option>
        <a-select-option value="approved">已通过</a-select-option>
        <a-select-option value="rejected">已驳回</a-select-option>
      </a-select>
    </header>

    <BlogTable
      ref="tableRef"
      :api-fn="loadRequests"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :show-column-setting="true"
      :height="'100%'"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'applicant'">
          <div class="approval-user-cell">
            <strong>{{ record.user?.username || '-' }}</strong>
            <span>{{ record.user?.email || '-' }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'targetRole'">
          <a-tag color="blue" :bordered="false">{{ record.targetRole?.name || '-' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusMeta(record.status).color" :bordered="false">
            {{ getStatusMeta(record.status).label }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          <span>{{ formatDate(record.createdAt) }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space v-if="record.status === 'pending'" size="small">
            <a-button type="link" size="small" @click="approve(record)">通过</a-button>
            <a-button type="link" danger size="small" @click="openReject(record)">驳回</a-button>
          </a-space>
          <span v-else class="approval-muted">已处理</span>
        </template>
      </template>
    </BlogTable>

    <a-modal
      v-model:open="rejectVisible"
      title="驳回权限申请"
      ok-text="确认驳回"
      cancel-text="取消"
      :confirm-loading="reviewing"
      :width="520"
      :destroy-on-close="true"
      @ok="submitReject"
    >
      <a-form layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea
            v-model:value="rejectReason"
            :rows="4"
            :maxlength="500"
            show-count
            placeholder="请说明驳回原因，申请人将在结果中看到"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listPermissionRequests, reviewPermissionRequest } from '@/services/admin'

const tableRef = ref(null)
const statusFilter = ref('pending')
const rejectVisible = ref(false)
const rejectReason = ref('')
const currentRequest = ref(null)
const reviewing = ref(false)

const filterParams = computed(() => ({
  status: statusFilter.value
}))

const columns = [
  { title: '申请人', key: 'applicant', width: 220 },
  { title: '目标角色', key: 'targetRole', width: 140, align: 'center' },
  { title: '申请说明', dataIndex: 'reason', key: 'reason' },
  { title: '状态', key: 'status', width: 110, align: 'center' },
  { title: '申请时间', key: 'createdAt', width: 170, align: 'center' },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

function getStatusMeta(status) {
  if (status === 'approved') return { label: '已通过', color: 'green' }
  if (status === 'rejected') return { label: '已驳回', color: 'red' }
  return { label: '待审批', color: 'gold' }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

async function loadRequests(params) {
  const result = await listPermissionRequests(params)
  return { items: result.items || [], total: result.total || 0 }
}

async function approve(record) {
  reviewing.value = true
  try {
    await reviewPermissionRequest(record.id, { action: 'approve' })
    message.success('已通过权限申请')
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '审批失败')
  } finally {
    reviewing.value = false
  }
}

function openReject(record) {
  currentRequest.value = record
  rejectReason.value = ''
  rejectVisible.value = true
}

async function submitReject() {
  if (!rejectReason.value.trim()) {
    message.warning('请填写驳回原因')
    return
  }

  reviewing.value = true
  try {
    await reviewPermissionRequest(currentRequest.value.id, {
      action: 'reject',
      rejectReason: rejectReason.value.trim()
    })
    message.success('已驳回权限申请')
    rejectVisible.value = false
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '审批失败')
  } finally {
    reviewing.value = false
  }
}
</script>

<style scoped>
.approval-page {
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.approval-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.approval-head h1 {
  margin: 0;
  font-size: 22px;
}

.approval-head p {
  margin: 6px 0 0;
  color: var(--console-text-secondary);
}

.approval-filter {
  width: 140px;
}

.approval-user-cell {
  display: grid;
  gap: 3px;
}

.approval-user-cell span,
.approval-muted {
  color: var(--console-text-secondary);
}
</style>
