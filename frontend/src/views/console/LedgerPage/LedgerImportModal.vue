<template>
  <a-modal
    :open="open"
    title="导入 Excel 账本"
    :width="760"
    :confirm-loading="submitting"
    :ok-text="previewResult ? '确认合并' : '解析预览'"
    cancel-text="取消"
    :destroy-on-close="true"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
    @ok="handleOk"
    @cancel="close"
  >
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
      <div class="ledger-import-stats">
        <div><span>{{ previewResult.stats?.inserted || 0 }}</span><small>新增</small></div>
        <div><span>{{ previewResult.stats?.updated || 0 }}</span><small>更新</small></div>
        <div><span>{{ previewResult.stats?.skipped || 0 }}</span><small>跳过</small></div>
        <div><span>{{ previewResult.stats?.errors || 0 }}</span><small>错误</small></div>
      </div>
      <a-alert
        v-if="previewResult.errors?.length"
        type="warning"
        show-icon
        message="部分行无法导入"
        :description="previewResult.errors.slice(0, 5).map((item) => `${item.sheetName || ''} 第${item.row || '-'}行：${item.message}`).join('；')"
      />
      <a-table
        size="small"
        :columns="columns"
        :data-source="previewResult.previewItems || []"
        :pagination="{ pageSize: 8, size: 'small' }"
        row-key="sourceKey"
        :scroll="{ x: 720 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-tag :color="record.action === 'insert' ? 'green' : 'blue'" :bordered="false">
              {{ record.action === 'insert' ? '新增' : '更新' }}
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
      </a-table>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { commitLedgerImport, previewLedgerImport } from '@/services/ledger'
import { formatMoney } from './ledgerChartOptions'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: '' }
})

const emit = defineEmits(['update:open', 'imported'])

const submitting = ref(false)
const selectedFile = ref(null)
const fileList = ref([])
const previewResult = ref(null)

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

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
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

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN')
}

async function handleOk() {
  if (!props.bookId) {
    message.warning('请先选择账本')
    return
  }

  submitting.value = true
  try {
    if (!previewResult.value) {
      if (!selectedFile.value) {
        message.warning('请先选择 Excel 文件')
        return
      }
      previewResult.value = await previewLedgerImport(props.bookId, selectedFile.value)
      message.success('Excel 解析完成')
      return
    }

    await commitLedgerImport(previewResult.value.id)
    message.success('账本导入已合并')
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

.ledger-import-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
</style>
