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
        <a-select v-model:value="form.category" :options="categoryOptions" />
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
import { reactive, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit'])

const categoryOptions = [
  '内容上新',
  '功能更新',
  '问题修复',
  '系统公告',
  '部署发布',
  '项目搭建',
  '版本调整',
  '手动记录'
].map((value) => ({ label: value, value }))

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

  const occurredAt = new Date(form.occurredAt)
  if (Number.isNaN(occurredAt.getTime())) {
    message.warning('记录时间不正确')
    return
  }

  emit('submit', {
    title: form.title.trim(),
    detail: form.detail.trim(),
    category: form.category,
    occurredAt: occurredAt.toISOString()
  })
}

watch(() => props.open, (visible) => {
  if (visible) {
    resetForm()
  }
})
</script>
