<template>
  <a-modal
    :open="open"
    title="导入项目记录"
    width="560px"
    centered
    :confirm-loading="submitting"
    :mask-closable="false"
    ok-text="开始导入"
    cancel-text="取消"
    class="timeline-import-modal"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-upload
      accept=".json,application/json"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :max-count="1"
      @remove="handleRemove"
    >
      <a-button>
        <template #icon><UploadOutlined /></template>
        选择 JSON 文件
      </a-button>
    </a-upload>

    <div class="timeline-import-format">
      <span>格式</span>
      <code>{"date":"2026-06-21","records":[{"id":"unique-id","title":"标题","detail":"详情"}]}</code>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'

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

const selectedFile = ref(null)
const fileList = ref([])

function handleBeforeUpload(file) {
  if (!file.name?.toLowerCase().endsWith('.json')) {
    message.warning('请选择 JSON 文件')
    return false
  }

  selectedFile.value = file
  fileList.value = [file]
  return false
}

function handleRemove() {
  selectedFile.value = null
  fileList.value = []
}

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!selectedFile.value) {
    message.warning('请先选择项目记录 JSON 文件')
    return
  }

  emit('submit', selectedFile.value)
}

watch(() => props.open, (visible) => {
  if (!visible) {
    selectedFile.value = null
    fileList.value = []
  }
})
</script>
