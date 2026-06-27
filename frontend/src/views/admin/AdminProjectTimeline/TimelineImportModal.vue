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
      :multiple="true"
      :max-count="30"
      @remove="handleRemove"
    >
      <a-button>
        <template #icon><UploadOutlined /></template>
        选择 JSON 文件
      </a-button>
    </a-upload>

    <div v-if="fileList.length" class="timeline-import-summary">
      已选择 {{ fileList.length }} 个文件，单次最多导入 30 个。
    </div>

    <div class="timeline-import-format">
      <span>格式</span>
      <code>{"date":"2026-06-21","records":[{"id":"unique-id","title":"标题","detail":"详情","category":"自定义分类"}]}</code>
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

const selectedFiles = ref([])
const fileList = ref([])

function handleBeforeUpload(file) {
  if (!file.name?.toLowerCase().endsWith('.json')) {
    message.warning('请选择 JSON 文件')
    return false
  }

  if (selectedFiles.value.length >= 30) {
    message.warning('单次最多导入 30 个 JSON 文件')
    return false
  }

  selectedFiles.value = [...selectedFiles.value, file]
  fileList.value = selectedFiles.value.map((item) => ({
    uid: item.uid,
    name: item.name,
    status: 'done'
  }))
  return false
}

function handleRemove(file) {
  selectedFiles.value = selectedFiles.value.filter((item) => item.uid !== file.uid)
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)
}

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!selectedFiles.value.length) {
    message.warning('请先选择项目记录 JSON 文件')
    return
  }

  emit('submit', selectedFiles.value)
}

watch(() => props.open, (visible) => {
  if (!visible) {
    selectedFiles.value = []
    fileList.value = []
  }
})
</script>
