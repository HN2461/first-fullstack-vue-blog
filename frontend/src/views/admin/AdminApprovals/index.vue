<template>
  <section class="approval-page enterprise-page">
    <BlogTable
      ref="tableRef"
      class="approval-table"
      :api-fn="loadRequests"
      :columns="columns"
      :params="filterParams"
      :auto-load="true"
      :page-size="10"
      :page-sizes="['10', '20', '50']"
      :show-column-setting="true"
      :height="'100%'"
      :scroll="{ x: 980 }"
      striped
    >
      <template #toolbar>
        <a-space wrap>
          <a-select
            v-model:value="statusFilter"
            class="approval-filter"
            show-search
            option-filter-prop="label"
            :options="statusOptions"
          />
          <a-button @click="tableRef?.refresh?.()">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'approvalApplicant'">
          <div class="approval-user-cell">
            <a-avatar :src="record.user?.avatar || undefined" :size="34">
              {{ getInitial(record.user?.username) }}
            </a-avatar>
            <div>
              <strong>{{ record.user?.username || '-' }}</strong>
              <span>{{ record.user?.email || '-' }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'approvalRole'">
          <div class="approval-role-cell">
            <a-tag color="blue" :bordered="false">{{ record.targetRole?.name || '-' }}</a-tag>
            <span v-if="record.targetRole?.remarkName">{{ record.targetRole.remarkName }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'approvalReason'">
          <div class="approval-reason">{{ record.reason || '-' }}</div>
        </template>
        <template v-else-if="column.key === 'approvalStatus'">
          <a-tag :color="getStatusMeta(record.status).color" :bordered="false">
            {{ getStatusMeta(record.status).label }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'approvalCreatedAt'">
          <span class="approval-time">{{ formatDate(record.createdAt) }}</span>
        </template>
        <template v-else-if="column.key === 'approvalAction'">
          <a-space v-if="record.status === 'pending'" size="small" class="approval-actions">
            <a-tooltip title="通过申请">
              <a-button type="text" class="approval-action approval-action--approve" :loading="reviewingId === record.id" @click="approve(record)">
                <template #icon><CheckOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="驳回申请">
              <a-button type="text" danger class="approval-action approval-action--reject" :disabled="reviewingId === record.id" @click="openReject(record)">
                <template #icon><CloseOutlined /></template>
              </a-button>
            </a-tooltip>
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
      :body-style="{ maxHeight: '60vh', overflowY: 'auto' }"
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
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listPermissionRequests, reviewPermissionRequest } from '@/services/admin'

const tableRef = ref(null)
const statusFilter = ref('pending')
const rejectVisible = ref(false)
const rejectReason = ref('')
const currentRequest = ref(null)
const reviewing = ref(false)
const reviewingId = ref('')

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

const filterParams = computed(() => ({
  status: statusFilter.value
}))

const columns = [
  { title: '申请人', key: 'approvalApplicant', width: 260 },
  { title: '目标角色', key: 'approvalRole', width: 170 },
  { title: '申请说明', key: 'approvalReason', minWidth: 280 },
  { title: '状态', key: 'approvalStatus', width: 110, align: 'center' },
  { title: '申请时间', key: 'approvalCreatedAt', width: 180, align: 'center' },
  { title: '操作', key: 'approvalAction', width: 120, align: 'center', fixed: 'right' }
]

function getStatusMeta(status) {
  if (status === 'approved') return { label: '已通过', color: 'green' }
  if (status === 'rejected') return { label: '已驳回', color: 'red' }
  return { label: '待审批', color: 'gold' }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', {
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

async function loadRequests(params) {
  const result = await listPermissionRequests(params)
  return { items: result.items || [], total: result.total || 0 }
}

async function approve(record) {
  reviewing.value = true
  reviewingId.value = record.id
  try {
    await reviewPermissionRequest(record.id, { action: 'approve' })
    message.success('已通过权限申请')
    tableRef.value?.refresh?.()
  } catch (error) {
    message.error(error.message || '审批失败')
  } finally {
    reviewing.value = false
    reviewingId.value = ''
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
  reviewingId.value = currentRequest.value?.id || ''
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
    reviewingId.value = ''
  }
}
</script>

<style scoped>
.approval-page {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: grid;
  grid-template-rows: minmax(0, 1fr);
}

.approval-table {
  min-height: 0;
}

.approval-filter {
  width: 160px;
}

.approval-user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.approval-user-cell > div,
.approval-role-cell {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.approval-user-cell span,
.approval-role-cell span,
.approval-time,
.approval-muted {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.approval-user-cell strong {
  color: var(--console-text-primary);
}

.approval-reason {
  color: var(--console-text);
  line-height: 1.6;
  max-width: 520px;
  white-space: normal;
}

.approval-actions {
  justify-content: center;
}

.approval-action {
  width: 30px;
  height: 30px;
}

.approval-action--approve {
  color: #16a34a;
}

.approval-action--approve:hover {
  background: color-mix(in srgb, #16a34a 12%, transparent);
  color: #15803d;
}

.approval-action--reject:hover {
  background: color-mix(in srgb, #dc2626 10%, transparent);
}

@media (max-width: 900px) {
  .approval-page {
    height: auto;
  }
}
</style>
