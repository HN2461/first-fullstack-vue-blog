<template>
  <a-modal
    v-model:open="visible"
    :title="moment ? '编辑重要记录' : '新增重要记录'"
    :width="620"
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @ok="submit"
  >
    <a-form layout="vertical">
      <a-form-item label="标题">
        <a-input v-model:value="form.title" placeholder="例如：第一次独立承担大额支出" />
      </a-form-item>
      <div class="ledger-moment-modal__grid">
        <a-form-item label="记录范围">
          <a-select v-model:value="form.scope" :options="scopeOptions" @change="handleScopeChange" />
        </a-form-item>
        <a-form-item :label="dateLabel">
          <a-input v-model:value="form.occurredAt" :type="dateInputType" />
        </a-form-item>
      </div>
      <div class="ledger-moment-modal__grid">
        <a-form-item label="相关金额">
          <a-input-number v-model:value="form.amount" :min="0" :precision="2" class="ledger-moment-modal__full" />
        </a-form-item>
        <a-form-item label="记录分类">
          <a-input
            v-model:value="form.categoryText"
            :maxlength="40"
            allow-clear
            placeholder="例如：工作变化、人生节点、家庭事项"
          />
        </a-form-item>
      </div>
      <a-form-item label="心情/关键词">
        <a-input v-model:value="form.mood" placeholder="例如：值得纪念、压力大、开心" />
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="form.tags"
          mode="tags"
          :options="tagOptions"
          :token-separators="[',', '，']"
          :max-tag-count="6"
          placeholder="输入后回车"
          @change="handleTagsChange"
        />
      </a-form-item>
      <a-form-item label="记录内容">
        <a-textarea
          v-model:value="form.content"
          :maxlength="2000"
          show-count
          :auto-size="{ minRows: 5, maxRows: 9 }"
          placeholder="把这笔钱背后的事情记下来，之后回看会更有感觉。"
        />
      </a-form-item>
      <a-checkbox v-model:checked="form.pinned">置顶这条记录</a-checkbox>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createLedgerMoment, updateLedgerMoment } from '@/services/ledger'

const props = defineProps({
  open: { type: Boolean, default: false },
  moment: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'saved'])

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const submitting = ref(false)
const form = reactive({
  title: '',
  scope: 'day',
  occurredAt: '',
  amount: 0,
  categoryId: undefined,
  categoryText: '',
  mood: '',
  tags: [],
  content: '',
  pinned: false
})

const scopeOptions = [
  { label: '某一天', value: 'day' },
  { label: '某个月', value: 'month' },
  { label: '某一年', value: 'year' }
]

const tagOptions = computed(() => form.tags.map((tag) => ({ label: tag, value: tag })))
const dateInputType = computed(() => {
  if (form.scope === 'year') return 'number'
  if (form.scope === 'month') return 'month'
  return 'date'
})
const dateLabel = computed(() => {
  if (form.scope === 'year') return '年份'
  if (form.scope === 'month') return '月份'
  return '日期'
})

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function todayDate() {
  return formatDate(new Date())
}

function normalizeTags(tags = []) {
  const seen = new Set()
  return tags
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

function normalizeDateValue(value, scope) {
  if (!value) return ''
  if (scope === 'year') return String(value).slice(0, 4)
  if (scope === 'month') return String(value).slice(0, 7)
  return String(value).slice(0, 10)
}

function toSubmitDate(value, scope) {
  if (scope === 'year') return `${String(value).slice(0, 4)}-01-01`
  if (scope === 'month') return `${String(value).slice(0, 7)}-01`
  return value
}

function handleScopeChange() {
  form.occurredAt = normalizeDateValue(form.occurredAt || todayDate(), form.scope)
}

function handleTagsChange(value) {
  form.tags = normalizeTags(value)
}

function resetForm() {
  form.title = ''
  form.scope = 'day'
  form.occurredAt = todayDate()
  form.amount = 0
  form.categoryId = undefined
  form.categoryText = ''
  form.mood = ''
  form.tags = []
  form.content = ''
  form.pinned = false
}

async function submit() {
  if (!form.title.trim()) {
    message.warning('请填写标题')
    return
  }
  if (!form.occurredAt) {
    message.warning(`请选择${dateLabel.value}`)
    return
  }
  if (form.scope === 'year' && !/^\d{4}$/.test(String(form.occurredAt))) {
    message.warning('请填写正确年份')
    return
  }

  submitting.value = true
  try {
    const basePayload = {
      title: form.title,
      scope: form.scope,
      occurredAt: toSubmitDate(form.occurredAt, form.scope),
      amount: form.amount || 0,
      categoryId: form.categoryId || null,
      categoryText: form.categoryText.trim(),
      mood: form.mood,
      tags: normalizeTags(form.tags),
      content: form.content,
      pinned: form.pinned
    }
    if (props.moment?.id) {
      await updateLedgerMoment(props.moment.id, basePayload)
    } else {
      await createLedgerMoment(basePayload)
    }
    message.success('重要记录已保存')
    visible.value = false
    emit('saved')
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    resetForm()
    if (props.moment) {
      form.title = props.moment.title || ''
      form.scope = props.moment.scope || 'day'
      form.occurredAt = normalizeDateValue(formatDate(props.moment.occurredAt), form.scope)
      form.amount = props.moment.amount || 0
      form.categoryId = props.moment.categoryId || undefined
      form.categoryText = props.moment.categoryText || ''
      form.mood = props.moment.mood || ''
      form.tags = normalizeTags(props.moment.tags || [])
      form.content = props.moment.content || ''
      form.pinned = Boolean(props.moment.pinned)
    }
  }
)
</script>

<style scoped>
.ledger-moment-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ledger-moment-modal__full {
  width: 100%;
}

@media (max-width: 640px) {
  .ledger-moment-modal__grid {
    grid-template-columns: 1fr;
  }
}
</style>
