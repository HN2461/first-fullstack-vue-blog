<template>
  <a-modal
    :open="open"
    :title="modalTitle"
    :footer="mode === 'records' || generatedUrl ? null : undefined"
    :ok-text="mode === 'link' ? '生成链接' : '确认重置'"
    cancel-text="取消"
    :confirm-loading="submitting"
    :width="mode === 'records' ? 920 : 520"
    :body-style="bodyStyle"
    wrap-class-name="password-recovery-manager-modal"
    destroy-on-close
    @ok="submit"
    @cancel="close"
  >
    <template v-if="generatedUrl">
      <a-result status="success" title="一次性重置链接已生成" sub-title="链接关闭后无法再次查看；如有遗失，请重新生成。">
        <template #extra>
          <div class="generated-link">
            <a-textarea :value="generatedUrl" :rows="3" readonly />
            <a-button type="primary" @click="copyLink"><CopyOutlined />复制链接</a-button>
          </div>
        </template>
      </a-result>
    </template>

    <template v-else-if="mode === 'link'">
      <a-alert type="info" show-icon message="推荐使用一次性链接" description="用户自行设置新密码，管理员不会看到最终密码；再次生成会自动撤销旧链接。打开链接只检查状态，成功修改密码后才会失效。" />
      <a-form layout="vertical" class="recovery-form">
        <a-form-item label="目标用户"><a-input :value="targetLabel" disabled /></a-form-item>
        <a-form-item label="有效期" required>
          <a-select v-model:value="linkForm.expiresInMinutes" show-search option-filter-prop="label">
            <a-select-option v-for="item in expiryOptions" :key="item.value" :value="item.value" :label="item.label">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="核验备注">
          <a-textarea v-model:value="linkForm.note" :rows="3" :maxlength="200" show-count placeholder="可记录核验方式或处理原因" />
        </a-form-item>
      </a-form>
    </template>

    <template v-else-if="mode === 'direct'">
      <a-alert type="warning" show-icon message="管理员将知道用户的新密码" description="建议优先生成一次性链接。直接重置成功后，目标账号所有旧会话立即失效。" />
      <a-form layout="vertical" class="recovery-form">
        <a-form-item label="目标用户"><a-input :value="targetLabel" disabled /></a-form-item>
        <a-form-item label="新密码" required><a-input-password v-model:value="directForm.newPassword" autocomplete="new-password" placeholder="8-72 个字符" /></a-form-item>
        <a-form-item label="确认新密码" required><a-input-password v-model:value="directForm.confirmPassword" autocomplete="new-password" placeholder="再次输入新密码" /></a-form-item>
        <a-form-item label="操作备注"><a-textarea v-model:value="directForm.note" :rows="2" :maxlength="200" show-count /></a-form-item>
      </a-form>
    </template>

    <template v-else>
      <a-spin :spinning="loadingRecords">
        <div class="records-workspace">
          <div class="records-summary">
            <button
              v-for="item in summaryItems"
              :key="item.value"
              type="button"
              class="summary-item"
              :class="{ 'summary-item--active': statusFilter === item.value }"
              @click="statusFilter = item.value"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </button>
          </div>

          <div class="records-toolbar">
            <div class="records-toolbar__title">
              <span>{{ targetLabel }}</span>
              <a-tooltip title="打开链接不会消耗次数；仅成功修改密码后变为已使用。只有有效链接可以撤销，只有失效记录可以删除。">
                <QuestionCircleOutlined aria-label="查看密码重置记录规则" />
              </a-tooltip>
            </div>
            <a-segmented v-model:value="statusFilter" :options="filterOptions" size="small" />
          </div>

          <div class="records-table-shell">
            <a-empty v-if="!loadingRecords && filteredRecords.length === 0" description="当前筛选下暂无记录" />
            <table v-else class="records-table">
              <thead><tr><th>类型 / 状态</th><th>创建时间</th><th>结果时间</th><th>操作人 / 备注</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="record in filteredRecords" :key="record.id">
                  <td><div class="record-tags"><a-tag :color="record.mode === 'link' ? 'blue' : 'orange'">{{ modeLabel(record.mode) }}</a-tag><a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag></div></td>
                  <td><strong>{{ formatDate(record.createdAt) }}</strong><span v-if="record.expiresAt">有效至 {{ formatDate(record.expiresAt) }}</span></td>
                  <td><strong>{{ resultTimeLabel(record) }}</strong><span>{{ resultTime(record) }}</span></td>
                  <td><strong>{{ record.createdBy?.username || record.createdBy?.email || '-' }}</strong><a-tooltip v-if="record.note" :title="record.note"><span class="record-note">{{ record.note }}</span></a-tooltip><span v-else>无备注</span></td>
                  <td class="record-actions">
                    <a-popconfirm v-if="canRevoke(record)" title="撤销后该链接立即不可用，确认撤销？" @confirm="revokeRecord(record)">
                      <a-tooltip title="撤销有效链接"><a-button type="text" danger aria-label="撤销有效链接"><StopOutlined /></a-button></a-tooltip>
                    </a-popconfirm>
                    <a-popconfirm v-else title="删除后该条重置记录将永久移除且无法恢复，确认删除？" @confirm="deleteRecord(record)">
                      <a-tooltip title="删除失效记录"><a-button type="text" danger aria-label="删除失效记录"><DeleteOutlined /></a-button></a-tooltip>
                    </a-popconfirm>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </a-spin>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined, DeleteOutlined, QuestionCircleOutlined, StopOutlined } from '@ant-design/icons-vue'
import { createAdminPasswordResetLink, deleteAdminPasswordResetRecord, listAdminPasswordResetRecords, resetAdminUserPassword, revokeAdminPasswordResetLink } from '@/services/admin'

const props = defineProps({ open: Boolean, user: { type: Object, default: null }, initialMode: { type: String, default: 'link' } })
const emit = defineEmits(['update:open', 'completed', 'self-reset'])
const mode = ref('link')
const submitting = ref(false)
const loadingRecords = ref(false)
const generatedUrl = ref('')
const records = ref([])
const currentTime = ref(Date.now())
const statusFilter = ref('all')
let statusTimer = null
const linkForm = reactive({ expiresInMinutes: 30, note: '' })
const directForm = reactive({ newPassword: '', confirmPassword: '', note: '' })
const expiryOptions = [{ value: 15, label: '15 分钟' }, { value: 30, label: '30 分钟' }, { value: 60, label: '1 小时' }, { value: 1440, label: '24 小时' }]
const filterOptions = [{ label: '全部', value: 'all' }, { label: '有效', value: 'active' }, { label: '已使用', value: 'used' }, { label: '已撤销', value: 'revoked' }, { label: '已过期', value: 'expired' }]
const bodyStyle = computed(() => ({ maxHeight: '72vh', overflow: 'hidden', padding: mode.value === 'records' ? '0' : undefined }))
const targetLabel = computed(() => props.user ? `${props.user.username}（${props.user.email}）` : '')
const modalTitle = computed(() => ({ link: '生成密码重置链接', direct: props.user?.isSuperAdmin ? '修改本人密码' : '直接设置用户密码', records: '密码重置记录' }[mode.value]))
const displayRecords = computed(() => records.value.map((record) => ({ ...record, status: effectiveStatus(record) })))
const filteredRecords = computed(() => statusFilter.value === 'all' ? displayRecords.value : displayRecords.value.filter((item) => item.status === statusFilter.value))
const summaryItems = computed(() => filterOptions.map((item) => ({ ...item, count: item.value === 'all' ? displayRecords.value.length : displayRecords.value.filter((record) => record.status === item.value).length })))

watch(() => props.open, async (value) => {
  clearInterval(statusTimer)
  statusTimer = null
  if (!value) return
  mode.value = props.initialMode
  generatedUrl.value = ''
  statusFilter.value = 'all'
  linkForm.expiresInMinutes = 30
  linkForm.note = ''
  Object.assign(directForm, { newPassword: '', confirmPassword: '', note: '' })
  if (mode.value === 'records') {
    currentTime.value = Date.now()
    statusTimer = setInterval(() => { currentTime.value = Date.now() }, 30000)
    await loadRecords()
  }
})

onUnmounted(() => clearInterval(statusTimer))

function close() { emit('update:open', false) }
function formatDate(value) { return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-' }
function modeLabel(value) { return value === 'link' ? '一次性链接' : '直接重置' }
function statusLabel(status) { return ({ active: '有效', used: '已使用', revoked: '已撤销', expired: '已过期' })[status] || status }
function statusColor(status) { return ({ active: 'green', used: 'blue', revoked: 'red', expired: 'default' })[status] || 'default' }
function effectiveStatus(record) { return record.status === 'active' && new Date(record.expiresAt).getTime() <= currentTime.value ? 'expired' : record.status }
function resultTimeLabel(record) { return ({ used: '使用时间', revoked: '撤销时间', expired: '过期时间' })[record.status] || '等待使用' }
function resultTime(record) { return formatDate(record.usedAt || record.revokedAt || (record.status === 'expired' ? record.expiresAt : '')) }
function canRevoke(record) { return record.status === 'active' && new Date(record.expiresAt).getTime() > currentTime.value }

async function loadRecords() {
  loadingRecords.value = true
  try { records.value = await listAdminPasswordResetRecords(props.user.id) || [] }
  catch (error) { message.error(error.message || '重置记录加载失败') }
  finally { loadingRecords.value = false }
}

async function submit() {
  if (!props.user) return
  if (mode.value === 'direct') {
    if (directForm.newPassword.length < 8 || directForm.newPassword.length > 72) return message.warning('新密码长度需为 8-72 个字符')
    if (directForm.newPassword !== directForm.confirmPassword) return message.warning('两次输入的新密码不一致')
  }
  submitting.value = true
  try {
    if (mode.value === 'link') {
      const result = await createAdminPasswordResetLink(props.user.id, { ...linkForm })
      generatedUrl.value = result.resetUrl
      message.success('一次性重置链接已生成')
    } else {
      const result = await resetAdminUserPassword(props.user.id, { ...directForm })
      message.success('用户密码已重置')
      emit('completed')
      if (result.selfReset) emit('self-reset')
      close()
    }
  } catch (error) { message.error(error.message || '操作失败') }
  finally { submitting.value = false }
}

async function copyLink() {
  try { await navigator.clipboard.writeText(generatedUrl.value); message.success('重置链接已复制') }
  catch { message.warning('复制失败，请手动复制链接') }
}

async function revokeRecord(record) {
  try { await revokeAdminPasswordResetLink(record.id); message.success('重置链接已撤销'); await loadRecords() }
  catch (error) { message.error(error.message || '撤销失败') }
}

async function deleteRecord(record) {
  try { await deleteAdminPasswordResetRecord(record.id); message.success('失效记录已永久删除'); await loadRecords() }
  catch (error) { message.error(error.message || '删除失败') }
}
</script>

<style scoped>
.recovery-form { margin-top: 20px; }
.generated-link { display: grid; gap: 12px; text-align: left; }
.records-workspace { display: grid; grid-template-rows: auto auto minmax(260px, 1fr); max-height: 72vh; min-height: 480px; color: var(--console-text); }
.records-summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-bottom: 1px solid var(--console-border); background: var(--console-surface-muted); }
.summary-item { display: grid; gap: 5px; padding: 14px 16px; border: 0; border-right: 1px solid var(--console-border); background: transparent; color: var(--console-text-secondary); text-align: left; cursor: pointer; }
.summary-item:last-child { border-right: 0; }
.summary-item strong { color: var(--console-text); font-size: 20px; line-height: 1; }
.summary-item--active { box-shadow: inset 0 -2px 0 #409eff; background: var(--console-primary-soft, #ecf5ff); color: #337ecc; }
.records-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 18px; border-bottom: 1px solid var(--console-border); }
.records-toolbar__title { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--console-text-secondary); }
.records-toolbar__title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.records-table-shell { min-height: 0; overflow: auto; scrollbar-width: none; }
.records-table-shell::-webkit-scrollbar { display: none; }
.records-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.records-table th { position: sticky; top: 0; z-index: 1; padding: 10px 14px; border-bottom: 1px solid var(--console-border); background: var(--console-surface-muted); color: var(--console-text-secondary); font-size: 12px; font-weight: 500; text-align: left; }
.records-table td { padding: 14px; border-bottom: 1px solid var(--console-border); vertical-align: top; }
.records-table th:nth-child(1) { width: 150px; }
.records-table th:nth-child(2), .records-table th:nth-child(3) { width: 165px; }
.records-table th:nth-child(5) { width: 72px; text-align: center; }
.records-table td:not(:first-child, :last-child) { display: table-cell; color: var(--console-text-secondary); font-size: 12px; }
.records-table td > strong, .records-table td > span { display: block; overflow-wrap: anywhere; }
.records-table td > strong { margin-bottom: 5px; color: var(--console-text); font-size: 13px; }
.record-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.record-tags :deep(.ant-tag) { display: inline-flex; margin: 0; }
.record-note { max-width: 230px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.record-actions { text-align: center; }
@media (max-width: 720px) {
  .records-workspace { min-height: 440px; }
  .records-summary { grid-template-columns: repeat(5, 86px); overflow-x: auto; scrollbar-width: none; }
  .records-toolbar { align-items: flex-start; flex-direction: column; }
  .records-toolbar :deep(.ant-segmented) { width: 100%; overflow-x: auto; }
  .records-table thead { display: none; }
  .records-table, .records-table tbody, .records-table tr, .records-table td { display: block; width: 100%; }
  .records-table tr { position: relative; padding: 14px 54px 14px 14px; border-bottom: 1px solid var(--console-border); }
  .records-table td { padding: 3px 0; border: 0; }
  .records-table td.record-actions { position: absolute; top: 12px; right: 10px; width: 40px; }
}
</style>
