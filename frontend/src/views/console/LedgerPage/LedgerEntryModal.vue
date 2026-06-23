<template>
  <a-modal
    :open="open"
    :title="entry?.id ? '编辑流水' : '新增流水'"
    :width="560"
    :confirm-loading="submitting"
    :destroy-on-close="true"
    ok-text="保存"
    cancel-text="取消"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="日期" name="occurredAt">
        <a-input v-model:value="form.occurredAt" type="date" />
      </a-form-item>
      <div class="ledger-entry-modal__grid">
        <a-form-item label="类型" name="type">
          <a-select v-model:value="form.type" :options="typeOptions" @change="form.categoryId = undefined" />
        </a-form-item>
        <a-form-item label="分类" name="categoryId">
          <a-select
            v-model:value="form.categoryId"
            :options="categoryOptions"
            show-search
            option-filter-prop="label"
            placeholder="请选择分类"
          />
        </a-form-item>
      </div>
      <a-form-item label="金额" name="amount">
        <a-input-number v-model:value="form.amount" class="ledger-entry-modal__amount" :min="0.01" :precision="2" />
      </a-form-item>
      <a-form-item label="单笔备注" name="note">
        <a-textarea v-model:value="form.note" :maxlength="500" show-count :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-item>
      <a-form-item label="当日备注" name="dailyNote">
        <a-textarea v-model:value="form.dailyNote" :maxlength="1000" show-count :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createLedgerEntry, updateLedgerEntry } from '@/services/ledger'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: '' },
  entry: { type: Object, default: null },
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:open', 'saved'])

const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  occurredAt: '',
  type: 'expense',
  categoryId: undefined,
  amount: null,
  note: '',
  dailyNote: ''
})

const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const rules = {
  occurredAt: [{ required: true, message: '请选择日期' }],
  type: [{ required: true, message: '请选择类型' }],
  categoryId: [{ required: true, message: '请选择分类' }],
  amount: [{ required: true, message: '请输入金额' }]
}

const categoryOptions = computed(() => props.categories
  .filter((item) => item.type === form.type && !item.archived)
  .map((item) => ({ label: item.name, value: item.id })))

function toDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function resetForm() {
  form.occurredAt = toDateInput(new Date())
  form.type = 'expense'
  form.categoryId = props.categories.find((item) => item.type === 'expense' && !item.archived)?.id
  form.amount = null
  form.note = ''
  form.dailyNote = ''
}

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    if (props.entry?.id) {
      form.occurredAt = toDateInput(props.entry.occurredAt)
      form.type = props.entry.type || 'expense'
      form.categoryId = props.entry.categoryId
      form.amount = props.entry.amount
      form.note = props.entry.note || ''
      form.dailyNote = props.entry.dailyNote || ''
      return
    }
    resetForm()
  }
)

async function submit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = {
      occurredAt: form.occurredAt,
      type: form.type,
      categoryId: form.categoryId,
      amount: form.amount,
      note: form.note,
      dailyNote: form.dailyNote
    }
    if (props.entry?.id) {
      await updateLedgerEntry(props.entry.id, payload)
      message.success('流水已更新')
    } else {
      await createLedgerEntry({ ...payload, bookId: props.bookId })
      message.success('流水已创建')
    }
    emit('update:open', false)
    emit('saved')
  } catch (error) {
    message.error(error.message || '流水保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ledger-entry-modal__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ledger-entry-modal__amount {
  width: 100%;
}

@media (max-width: 640px) {
  .ledger-entry-modal__grid {
    grid-template-columns: 1fr;
  }
}
</style>
