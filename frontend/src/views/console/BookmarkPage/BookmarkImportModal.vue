<template>
  <a-modal
    :open="open"
    :title="type === 'json' ? '导入 JSON 备份' : '导入浏览器书签 HTML'"
    :width="680"
    :confirm-loading="submitting"
    ok-text="开始导入"
    cancel-text="取消"
    :destroy-on-close="true"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-upload-dragger
      :before-upload="beforeUpload"
      :file-list="fileList"
      :accept="type === 'json' ? '.json,application/json' : '.html,.htm,text/html'"
      :max-count="1"
      @remove="removeFile"
    >
      <p class="ant-upload-drag-icon"><UploadOutlined /></p>
      <p class="ant-upload-text">拖拽文件到这里，或点击选择</p>
      <p class="ant-upload-hint">
        {{ type === 'json' ? '用于恢复系统导出的 JSON 备份' : '支持 Chrome / Edge / Firefox 导出的 HTML 书签文件' }}
      </p>
    </a-upload-dragger>

    <a-alert
      class="bookmark-import-tip"
      type="info"
      show-icon
      message="合并规则"
      description="URL 一致视为同一条书签；同 URL 不同名称会用本次导入名称覆盖；同名不同 URL 会分别保留。"
    />
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  type: { type: String, default: 'html' },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'submit'])
const selectedFile = ref(null)
const fileList = ref([])

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    selectedFile.value = null
    fileList.value = []
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

function submit() {
  if (!selectedFile.value) {
    message.warning('请先选择书签文件')
    return
  }
  emit('submit', selectedFile.value)
}
</script>

<style scoped>
.bookmark-import-tip {
  margin-top: 14px;
  border-radius: 8px;
}
</style>
