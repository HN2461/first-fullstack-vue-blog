<template>
  <a-drawer
    :open="Boolean(id)"
    :title="detail ? `${detail.number} · ${detail.title}` : '反馈详情'"
    width="min(820px, 100vw)"
    :mask-closable="false"
    :body-style="{ padding: '0', overflow: 'hidden' }"
    @close="close"
  >
    <div class="feedback-detail">
      <div class="feedback-detail__tools">
        <a-button size="small" :loading="loading" @click="load">刷新详情</a-button><span>仅提交者和获授权处理人可见</span>
      </div>
      <a-alert v-if="loadError" type="error" show-icon :message="loadError"
        ><template #action><a-button type="link" @click="load">重试</a-button></template></a-alert
      >
      <a-skeleton v-if="loading && !detail" active :paragraph="{ rows: 8 }" />
      <div v-if="detail" class="feedback-detail__scroll">
        <div class="feedback-detail__meta">
          <a-tag :color="getFeedbackStatus(detail.status).color">{{ getFeedbackStatus(detail.status).label }}</a-tag>
          <span>{{ getFeedbackType(detail.type) }}</span
          ><span>{{ detail.createdBy.username }}</span
          ><span>{{ feedbackTime(detail.createdAt) }}</span>
        </div>
        <p class="feedback-detail__text">{{ detail.content }}</p>
        <FeedbackAttachments :attachments="detail.attachments" />
        <div v-if="detail.sourcePath" class="feedback-detail__context">
          来源页面：<router-link :to="detail.sourcePath">{{ detail.sourcePath }}</router-link>
        </div>
        <div v-if="detail.environment" class="feedback-detail__context">环境：{{ detail.environment }}</div>
        <a-divider orientation="left">沟通与处理记录</a-divider>
        <a-button v-if="events.length < eventTotal" type="link" :loading="loadingMore" @click="loadMore"
          >加载更早记录（{{ events.length }}/{{ eventTotal }}）</a-button
        >
        <article v-for="event in events" :key="event.id" class="feedback-event">
          <div class="feedback-event__head">
            <strong>{{ event.actor.username }}</strong
            ><span>{{ eventLabel(event) }}</span
            ><time>{{ feedbackTime(event.createdAt) }}</time>
          </div>
          <p v-if="event.content" class="feedback-detail__text">{{ event.content }}</p>
          <FeedbackAttachments :attachments="event.attachments" />
        </article>
        <a-divider orientation="left">{{ terminal ? '后续处理' : '继续沟通' }}</a-divider>
        <a-form layout="vertical" class="feedback-detail__form">
          <div class="feedback-detail__action-fields">
            <a-form-item label="操作"
              ><a-select v-model:value="action" :options="actionOptions" show-search option-filter-prop="label" :disabled="saving"
            /></a-form-item>
            <a-form-item v-if="action === 'status'" label="处理状态"
              ><a-select
                v-model:value="nextStatus"
                :options="statusOptions"
                show-search
                option-filter-prop="label"
                placeholder="选择新的状态"
                :disabled="saving"
            /></a-form-item>
          </div>
          <a-form-item :label="action === 'reply' ? '回复内容' : '处理说明'">
            <a-textarea
              v-model:value="content"
              :disabled="saving"
              :maxlength="10000"
              show-count
              :auto-size="{ minRows: 3, maxRows: 7 }"
              :placeholder="
                action === 'status'
                  ? '说明安排或结果；标记已完成时，请确认修复或功能已上线。'
                  : action === 'reopen'
                    ? '请说明仍然存在的问题或需要继续处理的原因。'
                    : action === 'withdraw'
                      ? '请说明撤回原因，已有记录仍会保留。'
                      : '补充问题或回复；可粘贴截图。'
              "
              @paste="imageInput?.handlePaste($event)"
            />
          </a-form-item>
          <FeedbackImagesInput ref="imageInput" v-model="images" :disabled="saving" />
          <a-alert v-if="submitError" class="feedback-detail__submit-error" type="error" show-icon :message="submitError" />
          <div class="feedback-detail__submit">
            <a-button type="primary" :loading="saving" :disabled="!action" @click="submit">{{
              action === 'reply' ? '发送回复' : '确认提交'
            }}</a-button>
          </div>
        </a-form>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { getFeedback, listFeedbackEvents, updateFeedback } from '@/services/feedback'
import { useAuthStore } from '@/stores/auth'
import { createFeedbackRequestId, feedbackStatuses, feedbackTime, getFeedbackStatus, getFeedbackType } from './feedbackMeta'
import FeedbackAttachments from './FeedbackAttachments.vue'
import FeedbackImagesInput from './FeedbackImagesInput.vue'

const props = defineProps({ id: { type: String, default: '' }, management: Boolean })
const emit = defineEmits(['close', 'updated'])
const authStore = useAuthStore()
const detail = ref(null)
const events = ref([])
const eventTotal = ref(0)
const eventPage = ref(1)
const loading = ref(false)
const loadingMore = ref(false)
const loadError = ref('')
const saving = ref(false)
const submitError = ref('')
const action = ref('reply')
const nextStatus = ref(undefined)
const content = ref('')
const images = ref([])
const imageInput = ref(null)
let requestId = createFeedbackRequestId()
let loadVersion = 0
const terminal = computed(() => ['completed', 'closed'].includes(detail.value?.status))
const statusOptions = computed(() => feedbackStatuses.filter((item) => item.value !== detail.value?.status))
const actionOptions = computed(() => [
  ...(!terminal.value ? [{ value: 'reply', label: '回复 / 补充信息' }] : [{ value: 'reopen', label: '仍有问题，重新打开' }]),
  ...(props.management ? [{ value: 'status', label: '更新处理状态' }] : []),
  ...(!terminal.value && detail.value?.createdBy.id === authStore.user?.id ? [{ value: 'withdraw', label: '撤回反馈' }] : [])
])

function apply(result) {
  detail.value = result
  events.value = [...result.events.items].reverse()
  eventTotal.value = result.events.total
  eventPage.value = 1
  if (!actionOptions.value.some((item) => item.value === action.value)) action.value = actionOptions.value[0]?.value
}

async function load() {
  if (!props.id) return
  const version = ++loadVersion
  loading.value = true
  loadError.value = ''
  try {
    const result = await getFeedback(props.id, props.management)
    if (version === loadVersion) apply(result)
  } catch (error) {
    if (version === loadVersion) loadError.value = error.message || '反馈加载失败'
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

async function loadMore() {
  const id = props.id
  const version = loadVersion
  loadingMore.value = true
  try {
    const result = await listFeedbackEvents(id, eventPage.value + 1, props.management)
    if (version !== loadVersion || props.id !== id) return
    const seen = new Set(events.value.map((item) => item.id))
    events.value = [...result.items.filter((item) => !seen.has(item.id)).reverse(), ...events.value]
    eventPage.value = result.page
    eventTotal.value = result.total
  } catch (error) {
    message.error(error.message || '历史记录加载失败')
  } finally {
    loadingMore.value = false
  }
}

async function submit() {
  if (saving.value || !detail.value) return
  if (!content.value.trim() && (action.value !== 'reply' || !images.value.length)) {
    message.warning('请填写内容或处理说明')
    return
  }
  if (action.value === 'status' && !nextStatus.value) {
    message.warning('请选择新的处理状态')
    return
  }
  saving.value = true
  submitError.value = ''
  const id = props.id
  try {
    const result = await updateFeedback(
      id,
      action.value,
      {
        requestId,
        version: detail.value.version,
        content: content.value,
        status: action.value === 'status' ? nextStatus.value : undefined
      },
      images.value,
      props.management
    )
    if (props.id !== id) return
    // 使尚在加载的旧详情失效，避免成功回复后被旧响应回填。
    loadVersion += 1
    apply(result)
    content.value = ''
    images.value = []
    nextStatus.value = undefined
    requestId = createFeedbackRequestId()
    message.success('反馈已更新')
    emit('updated')
  } catch (error) {
    submitError.value = error.message || '发送失败，内容已保留，请重试'
    if (error.code === 'FEEDBACK_VERSION_CONFLICT') await load()
  } finally {
    saving.value = false
    loading.value = false
  }
}

function eventLabel(event) {
  if (event.kind === 'created') return '提交了反馈'
  const labels = { reply: '回复', status: '更新处理状态', reopen: '重新打开', withdraw: '撤回' }
  const changed = event.fromStatus !== event.toStatus
  return `${labels[event.kind] || ''}${changed ? ` · ${getFeedbackStatus(event.fromStatus).label} → ${getFeedbackStatus(event.toStatus).label}` : ''}`
}

function confirmLeave() {
  if (saving.value) return false
  if (!props.id || (!content.value.trim() && !images.value.length)) return true
  return new Promise((resolve) =>
    Modal.confirm({
      title: '放弃尚未发送的内容？',
      content: '已有沟通记录会保留，本次未发送内容将丢弃。',
      okText: '放弃',
      cancelText: '继续填写',
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  )
}
async function close() {
  if (await confirmLeave()) {
    content.value = ''
    images.value = []
    emit('close')
  }
}
onBeforeRouteLeave(confirmLeave)
onBeforeRouteUpdate((to, from) => (String(to.query.id || '') !== String(from.query.id || '') ? confirmLeave() : true))
watch(
  () => [props.id, props.management],
  () => {
    loadVersion += 1
    detail.value = null
    events.value = []
    content.value = ''
    images.value = []
    submitError.value = ''
    loadError.value = ''
    action.value = 'reply'
    requestId = createFeedbackRequestId()
    if (props.id) load()
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  loadVersion += 1
})
</script>

<style scoped>
.feedback-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px 20px;
  color: var(--console-text);
  background: var(--console-surface);
}
.feedback-detail__tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  gap: 10px;
  padding-bottom: 12px;
}
.feedback-detail__tools > span,
.feedback-detail__context {
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-detail__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  padding-bottom: 20px;
}
.feedback-detail__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
}
.feedback-detail__text {
  margin: 12px 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.8;
}
.feedback-detail__context {
  margin-top: 12px;
  overflow-wrap: anywhere;
}
.feedback-event {
  padding: 12px 0;
  border-bottom: 1px solid var(--console-border);
}
.feedback-event__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-event__head > strong {
  color: var(--console-text);
}
.feedback-event__head > time {
  margin-left: auto;
}
.feedback-detail__action-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.feedback-detail__submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.feedback-detail__submit-error {
  margin-top: 12px;
}
@media (max-width: 600px) {
  .feedback-detail {
    padding: 12px;
  }
  .feedback-detail__action-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
