<template>
  <a-modal
    :open="open"
    :title="category?.id ? '编辑分类' : '新增分类'"
    :width="520"
    :confirm-loading="submitting"
    :destroy-on-close="true"
    ok-text="保存"
    cancel-text="取消"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="分类名称" name="name">
        <a-input v-model:value="form.name" :maxlength="40" placeholder="例如：通勤、学习、医疗" />
      </a-form-item>
      <div class="ledger-category-modal__grid">
        <a-form-item label="类型" name="type">
          <a-select v-model:value="form.type" :options="typeOptions" />
        </a-form-item>
        <a-form-item label="颜色" name="color">
          <div class="ledger-color-picker">
            <button
              v-for="c in colorPresets"
              :key="c"
              type="button"
              class="ledger-color-swatch"
              :class="{ 'is-active': form.color === c }"
              :style="{ backgroundColor: c }"
              @click="form.color = c"
            />
            <a-input v-model:value="form.color" class="ledger-color-input" size="small" :maxlength="7" placeholder="#hex" />
          </div>
        </a-form-item>
      </div>
      <a-form-item label="别名">
        <a-input v-model:value="form.aliasText" :maxlength="160" placeholder="用于导入识别，多个别名用逗号分隔" />
      </a-form-item>
      <a-form-item label="归档">
        <a-switch v-model:checked="form.archived" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createLedgerCategory, updateLedgerCategory } from '@/services/ledger'
import { COLOR_PRESETS } from './ledgerUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  bookId: { type: String, default: '' },
  category: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'saved'])

const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  name: '',
  type: 'expense',
  color: '#1677ff',
  aliasText: '',
  archived: false
})

const colorPresets = COLOR_PRESETS

const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

const rules = {
  name: [{ required: true, message: '请输入分类名称' }],
  type: [{ required: true, message: '请选择类型' }],
  color: [{ required: true, message: '请选择颜色' }]
}

function parseAliases(value = '') {
  return String(value)
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    if (props.category?.id) {
      form.name = props.category.name || ''
      form.type = props.category.type || 'expense'
      form.color = props.category.color || '#1677ff'
      form.aliasText = (props.category.aliases || []).join('，')
      form.archived = props.category.archived === true
      return
    }
    form.name = ''
    form.type = 'expense'
    form.color = '#1677ff'
    form.aliasText = ''
    form.archived = false
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
      name: form.name,
      type: form.type,
      color: form.color,
      aliases: parseAliases(form.aliasText),
      archived: form.archived
    }
    if (props.category?.id) {
      await updateLedgerCategory(props.category.id, payload)
      message.success('分类已更新')
    } else {
      await createLedgerCategory({ ...payload, bookId: props.bookId })
      message.success('分类已创建')
    }
    emit('update:open', false)
    emit('saved')
  } catch (error) {
    message.error(error.message || '分类保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ledger-category-modal__grid {
  display: grid;
  grid-template-columns: 1fr 92px;
  gap: 12px;
}

.ledger-color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.ledger-color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}

.ledger-color-swatch:hover {
  transform: scale(1.15);
}

.ledger-color-swatch.is-active {
  border-color: var(--console-text, #101828);
  box-shadow: 0 0 0 2px var(--console-surface, #fff);
}

.ledger-color-input {
  width: 80px;
}
</style>
