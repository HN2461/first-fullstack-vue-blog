<template>
  <a-modal
    :open="open"
    :title="meta?.title"
    :width="560"
    :z-index="1100"
    :confirm-loading="saving"
    :ok-text="meta?.button"
    :ok-button-props="{ danger: action === 'withdraw' }"
    cancel-text="取消"
    :mask-closable="false"
    wrap-class-name="business-modal feedback-action-modal"
    :body-style="{ maxHeight: '62vh', overflow: 'hidden' }"
    @ok="submit"
    @cancel="close"
  >
    <div class="feedback-action-scroll">
      <div class="feedback-action-subject">
        <span>{{ feedback?.number }}</span
        ><strong>{{ feedback?.title }}</strong>
      </div>
      <a-form ref="formRef" :model="form" layout="vertical" :rules="rules" name="feedback-action" :disabled="saving">
        <a-form-item v-if="action === 'status'" label="处理状态" name="status">
          <a-select
            v-model:value="form.status"
            :options="statusOptions"
            show-search
            option-filter-prop="label"
            :dropdown-style="{ zIndex: 1150 }"
            placeholder="选择处理状态"
          />
        </a-form-item>
        <a-form-item :label="meta?.label" name="content">
          <a-textarea
            v-model:value="form.content"
            :maxlength="10000"
            :auto-size="{ minRows: 4, maxRows: 8 }"
            show-count
            :placeholder="meta?.placeholder"
          />
        </a-form-item>
        <div class="feedback-action-note">
          <InfoCircleOutlined /><span>{{ note }}</span>
        </div>
        <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" class="feedback-action-error" />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { updateFeedback } from '@/services/feedback'
import { createFeedbackRequestId, feedbackStatuses, getFeedbackActionMeta } from './feedbackMeta'

const props = defineProps({
  open: Boolean,
  action: { type: String, default: 'status' },
  feedback: { type: Object, default: null },
  management: Boolean,
  hasReplyDraft: Boolean
})
const emit = defineEmits(['update:open', 'saved', 'conflict'])
const formRef = ref(null)
const form = reactive({ status: undefined, content: '' })
const saving = ref(false)
const errorMessage = ref('')
const meta = computed(() => getFeedbackActionMeta(props.action))
const statusOptions = computed(() => feedbackStatuses.filter((item) => item.value !== props.feedback?.status))
const rules = computed(() => ({
  status: [{ required: props.action === 'status', message: '请选择处理状态' }],
  content: [{ required: true, whitespace: true, message: `请填写${meta.value?.label || '说明'}` }]
}))
const note = computed(() =>
  props.action === 'withdraw'
    ? '撤回后将停止处理，已有反馈和沟通记录仍会保留。'
    : props.action === 'reopen'
      ? '反馈将回到待处理，管理员会收到继续跟进的通知。'
      : form.status === 'completed'
        ? '请确认问题已经解决或功能已上线。保存后会通知提交者。'
        : '处理说明会出现在沟通记录中，并通知提交者。'
)
let requestId = ''
let submittedSnapshot = ''
const hasDraft = computed(() => Boolean(form.content.trim() || form.status))

watch(
  () => props.feedback?.status,
  (status) => {
    // 冲突刷新后，不能再次提交已经生效的状态；处理说明仍保留供用户检查。
    if (form.status === status) form.status = undefined
  },
  { immediate: true }
)

watch(
  () => props.open,
  async (visible) => {
    if (!visible) return
    form.status = undefined
    form.content = ''
    errorMessage.value = ''
    requestId = createFeedbackRequestId()
    submittedSnapshot = ''
    await nextTick()
    formRef.value?.clearValidate()
  },
  { immediate: true }
)

async function submit() {
  if (saving.value || !props.feedback || !meta.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  const snapshot = JSON.stringify([props.action, form.status, form.content.trim()])
  if (submittedSnapshot && submittedSnapshot !== snapshot) requestId = createFeedbackRequestId()
  submittedSnapshot = snapshot
  saving.value = true
  errorMessage.value = ''
  try {
    // 结束反馈会收起回复区；只有明确确认后才放弃回复草稿，失败时仍保留。
    if (
      props.hasReplyDraft &&
      (props.action === 'withdraw' || (props.action === 'status' && ['completed', 'closed'].includes(form.status)))
    ) {
      const confirmed = await new Promise((resolve) =>
        Modal.confirm({
          title: '还有一段回复尚未发送',
          content: '结束反馈后将放弃这段回复，已填写的处理说明会正常保存。',
          okText: '保存处理并放弃回复',
          cancelText: '继续编辑',
          zIndex: 1200,
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        })
      )
      if (!confirmed) return
    }
    const result = await updateFeedback(
      props.feedback.id,
      props.action,
      {
        requestId,
        version: props.feedback.version,
        content: form.content.trim(),
        status: props.action === 'status' ? form.status : undefined
      },
      [],
      props.management
    )
    emit('saved', result)
    emit('update:open', false)
    message.success(props.action === 'withdraw' ? '反馈已撤回' : props.action === 'reopen' ? '反馈已重新打开' : '处理状态已更新')
  } catch (error) {
    errorMessage.value =
      error.code === 'FEEDBACK_VERSION_CONFLICT'
        ? '反馈已有新进展，已更新详情。请检查最新状态后再次保存，填写的说明已保留。'
        : error.message || '保存失败，说明已保留，请重试'
    if (error.code === 'FEEDBACK_VERSION_CONFLICT') emit('conflict')
  } finally {
    saving.value = false
  }
}

async function confirmLeave() {
  if (saving.value) return false
  if (!props.open || !hasDraft.value) return true
  return new Promise((resolve) =>
    Modal.confirm({
      title: '放弃本次处理？',
      content: '填写的处理说明尚未保存。',
      okText: '放弃修改',
      cancelText: '继续填写',
      zIndex: 1200,
      onOk: () => {
        form.content = ''
        form.status = undefined
        resolve(true)
      },
      onCancel: () => resolve(false)
    })
  )
}
async function close() {
  if (await confirmLeave()) emit('update:open', false)
}
defineExpose({ saving, hasDraft, confirmLeave })
</script>

<style scoped>
.feedback-action-scroll {
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 4px;
  color: var(--console-text);
  font-size: 14px;
  line-height: 1.7;
}
.feedback-action-subject {
  display: grid;
  gap: 6px;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--console-border);
}
.feedback-action-subject > span {
  color: var(--console-text-secondary);
  font-size: 12px;
}
.feedback-action-subject > strong {
  font-size: 14px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.feedback-action-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 20px;
}
.feedback-action-note > :first-child {
  margin-top: 4px;
  flex-shrink: 0;
}
.feedback-action-error {
  margin-top: 14px;
}
</style>
