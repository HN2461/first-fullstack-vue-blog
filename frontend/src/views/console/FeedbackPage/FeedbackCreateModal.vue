<template>
  <a-modal
    :open="open"
    title="提交反馈"
    :width="680"
    :confirm-loading="saving"
    ok-text="提交反馈"
    cancel-text="取消"
    :mask-closable="false"
    wrap-class-name="business-modal feedback-create-modal"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    @ok="submit"
    @cancel="close"
  >
    <div class="feedback-create-scroll" @dragover.prevent @drop="imageInput?.handleDrop($event)">
      <a-form ref="formRef" :model="form" :rules="rules" name="feedback-create" layout="vertical" :disabled="saving">
        <div class="feedback-create-type">
          <a-form-item label="反馈类型" name="type"
            ><a-select v-model:value="form.type" :options="feedbackTypes" show-search option-filter-prop="label"
          /></a-form-item>
          <a-tooltip title="反馈内容和截图仅本人及获授权处理人可见。"
            ><span class="feedback-create-privacy"><LockOutlined />仅本人和处理人可见</span></a-tooltip
          >
        </div>
        <a-form-item label="标题" name="title"
          ><a-input v-model:value="form.title" :maxlength="120" placeholder="用一句话描述你遇到的问题或建议"
        /></a-form-item>
        <a-form-item label="详细描述" name="content">
          <a-textarea
            v-model:value="form.content"
            :maxlength="10000"
            show-count
            :auto-size="{ minRows: 5, maxRows: 9 }"
            :placeholder="contentHint"
            @paste="imageInput?.handlePaste($event)"
          />
        </a-form-item>
        <a-form-item label="截图" class="feedback-create-images"
          ><FeedbackImagesInput ref="imageInput" v-model="images" :disabled="saving"
        /></a-form-item>
        <details class="feedback-create-extra">
          <summary>补充页面与环境信息（可选）</summary>
          <div class="feedback-create-extra__body">
            <a-form-item label="问题所在页面"
              ><a-input v-model:value="form.sourcePath" :maxlength="500" placeholder="粘贴发生问题的页面地址"
            /></a-form-item>
            <a-checkbox v-model:checked="includeEnvironment" :disabled="saving">附带浏览器和窗口尺寸</a-checkbox>
            <p v-if="includeEnvironment" class="feedback-create-environment">{{ environment }}</p>
          </div>
        </details>
        <a-alert v-if="errorMessage" :message="errorMessage" type="error" show-icon class="feedback-create-error" />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { LockOutlined } from '@ant-design/icons-vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { createFeedback } from '@/services/feedback'
import { createFeedbackRequestId, feedbackTypes } from './feedbackMeta'
import FeedbackImagesInput from './FeedbackImagesInput.vue'

const props = defineProps({ open: Boolean, sourcePath: { type: String, default: '' } })
const emit = defineEmits(['update:open', 'created'])
const formRef = ref(null)
const form = reactive({ type: 'bug', title: '', content: '', sourcePath: '' })
const images = ref([])
const imageInput = ref(null)
const saving = ref(false)
const errorMessage = ref('')
const includeEnvironment = ref(false)
const environment = ref('')
let requestId = ''
let submittedSnapshot = ''
const hasDraft = computed(() => Boolean(form.title.trim() || form.content.trim() || images.value.length))
const rules = {
  type: [{ required: true, message: '请选择反馈类型' }],
  title: [{ required: true, whitespace: true, message: '请填写反馈标题', trigger: ['blur', 'change'] }],
  content: [{ required: true, whitespace: true, message: '请描述具体的问题或建议', trigger: ['blur', 'change'] }]
}
const contentHint = computed(() =>
  form.type === 'bug'
    ? '发生了什么问题？\n当时做了哪些操作？\n原本希望出现什么结果？'
    : form.type === 'suggestion'
      ? '你想解决什么问题？\n现在怎样处理，希望怎样更方便？'
      : '请描述需要帮助的地方。'
)

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      images.value = []
      return
    }
    Object.assign(form, { type: 'bug', title: '', content: '', sourcePath: props.sourcePath })
    images.value = []
    includeEnvironment.value = false
    environment.value = (navigator.userAgent + '；窗口 ' + window.innerWidth + '×' + window.innerHeight).slice(0, 300)
    errorMessage.value = ''
    requestId = createFeedbackRequestId()
    submittedSnapshot = ''
    await nextTick()
    formRef.value?.clearValidate()
  },
  { immediate: true }
)

function sourcePath() {
  const value = form.sourcePath.trim()
  if (!value) return ''
  try {
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin ? url.pathname : ''
  } catch {
    return ''
  }
}

async function submit() {
  if (saving.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  const payload = {
    ...form,
    title: form.title.trim(),
    content: form.content.trim(),
    sourcePath: sourcePath(),
    environment: includeEnvironment.value ? environment.value : ''
  }
  const snapshot = JSON.stringify([payload, images.value.map((image) => image.uid)])
  if (submittedSnapshot && submittedSnapshot !== snapshot) requestId = createFeedbackRequestId()
  submittedSnapshot = snapshot
  saving.value = true
  errorMessage.value = ''
  try {
    const result = await createFeedback({ ...payload, requestId }, images.value)
    emit('update:open', false)
    emit('created', result)
    message.success('反馈已提交，管理员回复后会收到站内通知')
  } catch (error) {
    errorMessage.value = error.message || '提交失败，内容已保留，请重试'
  } finally {
    saving.value = false
  }
}

async function confirmLeave() {
  if (!props.open) return true
  if (saving.value) return false
  if (!hasDraft.value) return true
  return new Promise((resolve) =>
    Modal.confirm({
      title: '放弃本次反馈？',
      content: '填写的内容和截图尚未提交。',
      okText: '放弃填写',
      cancelText: '继续填写',
      onOk: () => {
        form.title = ''
        form.content = ''
        images.value = []
        resolve(true)
      },
      onCancel: () => resolve(false)
    })
  )
}
async function close() {
  if (await confirmLeave()) emit('update:open', false)
}
function beforeUnload(event) {
  if (props.open && hasDraft.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onBeforeRouteLeave(confirmLeave)
onBeforeRouteUpdate((to, from) => (props.open && to.query.id !== from.query.id ? confirmLeave() : true))
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<style scoped>
.feedback-create-scroll {
  max-height: calc(68vh - 4px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 6px 4px 0;
  color: var(--console-text);
  font-size: 14px;
  line-height: 1.7;
}
.feedback-create-type {
  display: grid;
  grid-template-columns: minmax(170px, 220px) minmax(0, 1fr);
  align-items: end;
  gap: 16px;
}
.feedback-create-privacy {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: end;
  margin-bottom: 28px;
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-create-scroll :deep(.ant-form-item) {
  margin-bottom: 20px;
}
.feedback-create-scroll :deep(.ant-form-item-label > label) {
  font-weight: 500;
}
.feedback-create-scroll :deep(textarea) {
  line-height: 1.7;
}
.feedback-create-extra {
  border-top: 1px solid var(--console-border);
  padding-top: 14px;
  margin-top: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
}
.feedback-create-extra summary {
  cursor: pointer;
  width: fit-content;
}
.feedback-create-extra__body {
  padding-top: 16px;
}
.feedback-create-environment {
  margin: 8px 0 0;
  font-size: 12px;
  overflow-wrap: anywhere;
  line-height: 20px;
}
.feedback-create-error {
  margin-top: 14px;
}
@media (max-width: 600px) {
  .feedback-create-type {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .feedback-create-privacy {
    display: none;
  }
}
</style>
