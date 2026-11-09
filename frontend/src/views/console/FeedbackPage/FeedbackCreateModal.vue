<template>
  <a-modal
    :open="open"
    title="提交意见反馈"
    :width="720"
    :confirm-loading="saving"
    ok-text="提交反馈"
    cancel-text="取消"
    wrap-class-name="business-modal"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    :mask-closable="false"
    @ok="submit"
    @cancel="close"
  >
    <div class="feedback-create-scroll">
      <a-form layout="vertical">
        <a-form-item label="反馈类型" required
          ><a-select v-model:value="form.type" :options="feedbackTypes" show-search option-filter-prop="label" :disabled="saving"
        /></a-form-item>
        <a-form-item label="标题" required
          ><a-input v-model:value="form.title" :maxlength="120" placeholder="用一句话描述问题或建议" :disabled="saving"
        /></a-form-item>
        <a-form-item label="详细内容" required>
          <a-textarea
            v-model:value="form.content"
            :maxlength="10000"
            show-count
            :auto-size="{ minRows: 6, maxRows: 12 }"
            :placeholder="contentHint"
            :disabled="saving"
            @paste="imageInput?.handlePaste($event)"
          />
        </a-form-item>
        <a-form-item label="截图（可选）"><FeedbackImagesInput ref="imageInput" v-model="images" :disabled="saving" /></a-form-item>
        <a-form-item label="问题所在页面（可选）"
          ><a-input
            v-model:value="form.sourcePath"
            :maxlength="500"
            placeholder="如 /console/ledger/entries，提交时不保留查询参数"
            :disabled="saving"
        /></a-form-item>
        <a-checkbox v-model:checked="includeEnvironment" :disabled="saving">附带浏览器和窗口尺寸，方便定位问题</a-checkbox>
        <div v-if="includeEnvironment" class="feedback-create-environment">{{ environment }}</div>
        <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" class="feedback-create-error" />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { onBeforeRouteLeave } from 'vue-router'
import { createFeedback } from '@/services/feedback'
import { createFeedbackRequestId, feedbackTypes } from './feedbackMeta'
import FeedbackImagesInput from './FeedbackImagesInput.vue'

const props = defineProps({ open: Boolean, sourcePath: { type: String, default: '' } })
const emit = defineEmits(['update:open', 'created'])
const form = reactive({ type: 'bug', title: '', content: '', sourcePath: '' })
const images = ref([])
const imageInput = ref(null)
const saving = ref(false)
const errorMessage = ref('')
const includeEnvironment = ref(false)
const environment = ref('')
let requestId = ''
const contentHint = computed(() =>
  form.type === 'bug'
    ? '发生了什么？当时做了哪些操作？原本希望出现什么结果？可以粘贴截图。'
    : form.type === 'suggestion'
      ? '你想解决什么问题？现在怎样处理？希望怎样更方便？'
      : '请描述需要帮助的地方。'
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    Object.assign(form, { type: 'bug', title: '', content: '', sourcePath: props.sourcePath })
    images.value = []
    includeEnvironment.value = false
    environment.value = `${navigator.userAgent}；窗口 ${window.innerWidth}×${window.innerHeight}`.slice(0, 300)
    errorMessage.value = ''
    requestId = createFeedbackRequestId()
  },
  { immediate: true }
)

async function submit() {
  if (saving.value) return
  if (!form.title.trim() || !form.content.trim()) {
    message.warning('请填写标题和详细内容')
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    const result = await createFeedback(
      { ...form, requestId, environment: includeEnvironment.value ? environment.value : '' },
      images.value
    )
    message.success(`反馈已提交：${result.number}`)
    emit('update:open', false)
    emit('created', result)
  } catch (error) {
    errorMessage.value = error.message || '提交失败，内容已保留，请重试'
  } finally {
    saving.value = false
  }
}

function close() {
  if (saving.value) return
  if (form.title.trim() || form.content.trim() || images.value.length) {
    Modal.confirm({
      title: '放弃本次反馈？',
      content: '填写的内容尚未提交，关闭后将丢弃。',
      okText: '放弃',
      cancelText: '继续填写',
      onOk: () => emit('update:open', false)
    })
  } else emit('update:open', false)
}

onBeforeRouteLeave(() => {
  if (!props.open) return true
  if (saving.value) return false
  if (!form.title.trim() && !form.content.trim() && !images.value.length) return true
  return new Promise((resolve) =>
    Modal.confirm({
      title: '放弃本次反馈？',
      content: '填写的内容尚未提交，离开后将丢弃。',
      okText: '放弃',
      cancelText: '继续填写',
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  )
})
</script>

<style scoped>
.feedback-create-scroll {
  max-height: calc(68vh - 4px);
  overflow-y: auto;
  padding-right: 6px;
}
.feedback-create-environment {
  margin-top: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
  overflow-wrap: anywhere;
}
.feedback-create-error {
  margin-top: 16px;
}
</style>
