<template>
  <a-modal
    :open="open"
    title="重命名资源"
    :confirm-loading="submitting"
    ok-text="保存名称"
    cancel-text="取消"
    centered
    width="460px"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-alert
      class="media-rename__alert"
      type="info"
      show-icon
      message="这里修改的是资源展示名，不会改动服务器上的实际文件和访问地址。"
    />
    <a-form layout="vertical">
      <a-form-item label="资源名称">
        <a-input
          v-model:value="draftName"
          placeholder="例如：课程封面图、接口示例文档、项目截图 01"
          :maxlength="160"
          show-count
          allow-clear
          @press-enter="handleSubmit"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit'])
const draftName = ref('')

watch(
  () => [props.open, props.record],
  ([visible, record]) => {
    if (visible && record) {
      draftName.value = record.originalName || ''
      return
    }

    if (!visible) {
      draftName.value = ''
    }
  },
  { immediate: true }
)

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  emit('submit', draftName.value)
}
</script>

<style scoped>
.media-rename__alert {
  margin-bottom: 16px;
}
</style>
