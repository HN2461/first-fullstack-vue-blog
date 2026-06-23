<template>
  <section class="ledger-entries-page">
    <div class="ledger-entries-actions">
      <a-button type="primary" @click="$emit('open-entry-modal')">
        <template #icon><PlusOutlined /></template>
        新增流水
      </a-button>
    </div>

    <LedgerEntryTable
      ref="tableRef"
      :book-id="bookId"
      :categories="categories"
      :range="range"
      :refresh-key="refreshKey"
      @edit="$emit('edit-entry', $event)"
      @delete="$emit('delete-entry', $event)"
      @batch-edit="openBatchModal"
    />

    <a-modal
      v-model:open="batchModalOpen"
      title="批量修改流水"
      :width="520"
      :confirm-loading="submitting"
      ok-text="保存"
      cancel-text="取消"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      @ok="submitBatch"
    >
      <a-form layout="vertical">
        <a-alert
          type="info"
          show-icon
          :message="`已选择 ${selectedKeys.length} 条流水，只会修改已勾选的字段。`"
          class="ledger-batch-alert"
        />
        <a-form-item>
          <a-checkbox v-model:checked="enabled.occurredAt">统一日期</a-checkbox>
          <a-input v-model:value="form.occurredAt" type="date" :disabled="!enabled.occurredAt" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="enabled.typeCategory">统一类型和分类</a-checkbox>
          <div class="ledger-batch-grid">
            <a-select
              v-model:value="form.type"
              :options="typeOptions"
              :disabled="!enabled.typeCategory"
              @change="form.categoryId = undefined"
            />
            <a-select
              v-model:value="form.categoryId"
              :options="batchCategoryOptions"
              show-search
              option-filter-prop="label"
              placeholder="请选择分类"
              :disabled="!enabled.typeCategory"
            />
          </div>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="enabled.note">统一单笔备注</a-checkbox>
          <a-textarea v-model:value="form.note" :disabled="!enabled.note" :maxlength="500" show-count />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="enabled.dailyNote">统一当日备注</a-checkbox>
          <a-textarea v-model:value="form.dailyNote" :disabled="!enabled.dailyNote" :maxlength="1000" show-count />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import LedgerEntryTable from './LedgerEntryTable.vue'
import { batchUpdateLedgerEntries } from '@/services/ledger'

const props = defineProps({
  bookId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const emit = defineEmits(['edit-entry', 'delete-entry', 'reload', 'open-entry-modal'])

const tableRef = ref(null)
const batchModalOpen = ref(false)
const submitting = ref(false)
const selectedKeys = ref([])
const enabled = reactive({
  occurredAt: false,
  typeCategory: false,
  note: false,
  dailyNote: false
})
const form = reactive({
  occurredAt: '',
  type: 'expense',
  categoryId: undefined,
  note: '',
  dailyNote: ''
})

const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const batchCategoryOptions = computed(() => props.categories
  .filter((item) => item.type === form.type && !item.archived)
  .map((item) => ({ label: item.name, value: item.id })))

function openBatchModal(keys) {
  selectedKeys.value = keys
  batchModalOpen.value = true
}

function buildPatch() {
  const patch = {}
  if (enabled.occurredAt) patch.occurredAt = form.occurredAt
  if (enabled.typeCategory) {
    patch.type = form.type
    patch.categoryId = form.categoryId
  }
  if (enabled.note) patch.note = form.note
  if (enabled.dailyNote) patch.dailyNote = form.dailyNote
  return patch
}

async function submitBatch() {
  const patch = buildPatch()
  if (!Object.keys(patch).length) {
    message.warning('请选择要批量修改的字段')
    return
  }
  if (enabled.occurredAt && !patch.occurredAt) {
    message.warning('请选择统一日期')
    return
  }
  if (enabled.typeCategory && !patch.categoryId) {
    message.warning('请选择统一分类')
    return
  }

  submitting.value = true
  try {
    await batchUpdateLedgerEntries({ ids: selectedKeys.value, patch })
    message.success('批量修改完成')
    batchModalOpen.value = false
    tableRef.value?.clearSelection?.()
    tableRef.value?.reload?.()
    emit('reload')
  } catch (error) {
    message.error(error.message || '批量修改失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ledger-entries-page {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.ledger-entries-actions {
  display: flex;
  justify-content: flex-end;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--console-surface);
}

.ledger-batch-alert {
  margin-bottom: 12px;
}

.ledger-batch-grid {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 8px;
  margin-top: 8px;
}
</style>
