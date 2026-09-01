<template>
  <a-modal
    :open="open"
    title="导入 Excel 账本"
    :width="760"
    :confirm-loading="submitting"
    :ok-text="previewResult ? '确认同步' : '解析预览'"
    cancel-text="取消"
    :destroy-on-close="true"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
    @ok="handleOk"
    @cancel="close"
  >
    <a-form layout="vertical" class="ledger-import-form">
      <a-form-item label="导入目标账本" required>
        <a-select
          v-model:value="selectedBookId"
          :options="bookOptions"
          :disabled="Boolean(previewResult)"
          show-search
          option-filter-prop="label"
          placeholder="请选择本次导入要更新的账本"
        />
        <div class="ledger-import-help">当前页面选中的账本只作为默认值，本次导入以这里的选择为准。</div>
      </a-form-item>
    </a-form>

    <a-upload-dragger
      v-if="!previewResult"
      :before-upload="beforeUpload"
      :file-list="fileList"
      accept=".xls,.xlsx"
      :max-count="1"
      @remove="removeFile"
    >
      <p class="ant-upload-drag-icon"><UploadOutlined /></p>
      <p class="ant-upload-text">拖拽 Excel 到这里，或点击选择文件</p>
      <p class="ant-upload-hint">支持从语雀导出的月度收支明细 xlsx/xls 文件</p>
    </a-upload-dragger>

    <div v-else class="ledger-import-preview">
      <a-alert
        type="info"
        show-icon
        :message="`本次导入目标：${selectedBookName}`"
        description="预览和确认同步都只会作用于这个账本。"
      />
      <div class="ledger-import-stats">
        <div><span>{{ previewResult.stats?.inserted || 0 }}</span><small>新增</small></div>
        <div><span>{{ previewResult.stats?.updated || 0 }}</span><small>更新</small></div>
        <div class="ledger-import-stats__delete"><span>{{ previewResult.stats?.deleted || 0 }}</span><small>删除</small></div>
        <div><span>{{ previewResult.stats?.skipped || 0 }}</span><small>跳过</small></div>
        <div><span>{{ previewResult.stats?.errors || 0 }}</span><small>错误</small></div>
      </div>
      <a-alert
        v-if="previewResult.stats?.deleted"
        type="warning"
        show-icon
        message="本次同步包含删除"
        description="只会删除当前 Excel 覆盖范围内已经清空的 Excel 导入流水，手工录入的流水不会删除。请核对下方红色删除明细后再确认同步。"
      />
      <a-alert
        v-if="previewResult.errors?.length"
        type="warning"
        show-icon
        message="部分行无法导入"
        :description="previewResult.errors.slice(0, 5).map((item) => `${item.sheetName || ''} 第${item.row || '-'}行：${item.message}`).join('；')"
      />
      <BlogTable
        size="small"
        :columns="columns"
        :api-fn="loadPreviewItems"
        :page-size="8"
        :page-sizes="['8', '15', '30']"
        :auto-load="Boolean(previewResult)"
        row-key="sourceKey"
        :scroll="{ x: 720 }"
        height="360px"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-tag :color="actionMeta[record.action]?.color" :bordered="false">
              {{ actionMeta[record.action]?.label || record.action }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'occurredAt'">
            {{ formatDate(record.occurredAt) }}
          </template>
          <template v-else-if="column.key === 'type'">
            {{ record.type === 'income' ? '收入' : '支出' }}
          </template>
          <template v-else-if="column.key === 'amount'">
            {{ formatMoney(record.amount) }}
          </template>
        </template>
      </BlogTable>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { commitLedgerImport, previewLedgerImport } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'
import { formatDate } from './ledgerUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: '' },
  defaultBookId: { type: String, default: '' },
  bookOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open', 'imported'])

const submitting = ref(false)
const selectedFile = ref(null)
const fileList = ref([])
const previewResult = ref(null)
const selectedBookId = ref('')

const selectedBookName = computed(() => props.bookOptions.find((item) => item.value === selectedBookId.value)?.label || '未选择')

const actionMeta = {
  insert: { label: '新增', color: 'green' },
  update: { label: '更新', color: 'blue' },
  delete: { label: '删除', color: 'red' }
}

const columns = [
  { title: '动作', key: 'action', width: 80, fixed: 'left' },
  { title: '日期', key: 'occurredAt', width: 110 },
  { title: '类型', key: 'type', width: 80 },
  { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 120 },
  { title: '金额', key: 'amount', width: 120, align: 'right' },
  { title: '单笔备注', dataIndex: 'note', key: 'note', width: 180 },
  { title: '当日备注', dataIndex: 'dailyNote', key: 'dailyNote', width: 220 },
  { title: '工作表', dataIndex: 'sheetName', key: 'sheetName', width: 160 }
]

function loadPreviewItems(params = {}) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 8
  const items = previewResult.value?.previewItems || []
  const start = (page - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize
  }
}

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    selectedBookId.value = props.defaultBookId || props.bookId || props.bookOptions[0]?.value || ''
    selectedFile.value = null
    fileList.value = []
    previewResult.value = null
  }
)

function beforeUpload(file) {
  selectedFile.value = file
  fileList.value = [file]
  return false
}

function removeFile() {
  selectedFile.value = null
  fileList.value = []
}

function close() {
  emit('update:open', false)
}

async function handleOk() {
  if (!selectedBookId.value) {
    message.warning('请选择导入目标账本')
    return
  }

  submitting.value = true
  try {
    if (!previewResult.value) {
      if (!selectedFile.value) {
        message.warning('请先选择 Excel 文件')
        return
      }
      previewResult.value = await previewLedgerImport(selectedBookId.value, selectedFile.value)
      message.success('Excel 解析完成')
      return
    }

    await commitLedgerImport(previewResult.value.id)
    message.success('账本已按 Excel 同步')
    close()
    emit('imported')
  } catch (error) {
    message.error(error.message || '导入失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ledger-import-preview {
  display: grid;
  gap: 12px;
}

.ledger-import-form {
  margin-bottom: 4px;
}

.ledger-import-help {
  margin-top: 6px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-import-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.ledger-import-stats div {
  min-height: 64px;
  display: grid;
  align-content: center;
  justify-items: center;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.ledger-import-stats span {
  color: var(--console-text);
  font-size: 20px;
  font-weight: 700;
}

.ledger-import-stats small {
  color: var(--console-text-secondary);
}

.ledger-import-stats__delete span {
  color: #dc2626;
}

@media (max-width: 640px) {
  .ledger-import-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
