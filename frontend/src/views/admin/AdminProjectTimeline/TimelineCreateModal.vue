<template>
  <a-modal
    :open="open"
    title="新增项目记录"
    width="620px"
    centered
    :confirm-loading="submitting"
    :mask-closable="false"
    ok-text="保存记录"
    cancel-text="取消"
    class="timeline-create-modal"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" class="timeline-form">
      <a-form-item label="记录时间" required>
        <a-input
          v-model:value="form.occurredAt"
          type="datetime-local"
        />
      </a-form-item>

      <a-form-item label="事件标题" required>
        <a-input
          v-model:value="form.title"
          placeholder="例如：菜单权限体系统一完成"
          :maxlength="160"
          show-count
        />
      </a-form-item>

      <a-form-item label="记录分类">
        <a-auto-complete
          v-model:value="form.category"
          :options="categoryOptions"
          :filter-option="filterCategoryOption"
          placeholder="选择或输入分类"
        />
      </a-form-item>

      <a-form-item label="事件详情" required>
        <a-textarea
          v-model:value="form.detail"
          placeholder="记录本阶段完成的功能、修复的问题、版本调整或部署节点。"
          :rows="7"
          :maxlength="12000"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { buildCategoryOptions } from './timelineMeta'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'submit'])

const categoryOptions = computed(() => buildCategoryOptions(props.categories))

const form = reactive({
  occurredAt: '',
  title: '',
  detail: '',
  category: '手动记录'
})

function formatLocalInput(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function resetForm() {
  form.occurredAt = formatLocalInput()
  form.title = ''
  form.detail = ''
  form.category = '手动记录'
}

function filterCategoryOption(input, option) {
  return String(option?.label || '').toLowerCase().includes(String(input || '').toLowerCase())
}

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!form.occurredAt) {
    message.warning('请选择记录时间')
    return
  }
  if (!form.title.trim()) {
    message.warning('请输入事件标题')
    return
  }
  if (!form.detail.trim()) {
    message.warning('请输入事件详情')
    return
  }
  if (form.category.trim().length > 40) {
    message.warning('记录分类不能超过 40 个字符')
    return
  }

  const occurredAt = new Date(form.occurredAt)
  if (Number.isNaN(occurredAt.getTime())) {
    message.warning('记录时间不正确')
    return
  }

  emit('submit', {
    title: form.title.trim(),
    detail: form.detail.trim(),
    category: form.category.trim() || '手动记录',
    occurredAt: occurredAt.toISOString()
  })
}

watch(() => props.open, (visible) => {
  if (visible) {
    resetForm()
  }
})
</script>
