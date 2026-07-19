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
    <a-alert
      v-if="workspace"
      class="bookmark-import-target"
      type="info"
      show-icon
      :message="`目标书签库：${workspace.name}`"
      :description="workspace.isPrimary ? '主书签库默认合并导入，保留当前已经整理好的内容和目录。' : '辅助书签库默认覆盖更新，使它准确反映浏览器当前快照。'"
    />

    <a-form layout="vertical">
      <a-form-item label="导入方式" required>
        <a-radio-group v-model:value="mode">
          <a-radio value="merge">合并导入</a-radio>
          <a-radio value="replace">覆盖更新</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>

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
      :message="mode === 'replace' ? '覆盖更新规则' : '合并导入规则'"
      :description="mode === 'replace'
        ? '清空当前书签库内容后，以本次文件作为完整快照；其他书签库不受影响。'
        : '当前书签库内按 URL 去重；已存在网址保留当前目录，新网址按导入目录添加。'"
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
  workspace: { type: Object, default: null },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'submit'])
const selectedFile = ref(null)
const fileList = ref([])
const mode = ref('merge')

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    selectedFile.value = null
    fileList.value = []
    mode.value = props.workspace?.isPrimary ? 'merge' : 'replace'
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
  emit('submit', { file: selectedFile.value, mode: mode.value })
}
</script>

<style scoped>
.bookmark-import-tip {
  margin-top: 14px;
  border-radius: 8px;
}

.bookmark-import-target {
  margin-bottom: 16px;
  border-radius: 8px;
}
</style>
