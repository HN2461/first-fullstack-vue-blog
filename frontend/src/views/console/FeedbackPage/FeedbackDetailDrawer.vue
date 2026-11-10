<template>
  <a-drawer
    :open="Boolean(id)"
    :width="drawerWidth"
    :mask-closable="false"
    root-class-name="feedback-detail-drawer"
    :body-style="{ padding: 0, overflow: 'hidden' }"
    :header-style="{ padding: '18px 24px' }"
    @close="close"
  >
    <template #title
      ><div class="feedback-drawer-heading">
        <span>反馈详情</span><span v-if="detail">{{ detail.number }}</span>
      </div></template
    >
    <template #extra
      ><a-tooltip title="刷新反馈详情"
        ><a-button type="text" shape="circle" aria-label="刷新反馈详情" :loading="loading" :disabled="saving" @click="load"
          ><ReloadOutlined /></a-button></a-tooltip
    ></template>
    <div class="feedback-detail">
      <a-alert v-if="loadError" type="error" show-icon :message="loadError" class="feedback-detail__error"
        ><template #action><a-button type="link" @click="load">重试</a-button></template></a-alert
      >
      <div v-if="loading && !detail" class="feedback-detail__loading"><a-skeleton active :paragraph="{ rows: 8 }" /></div>
      <div v-if="detail" ref="scrollRef" class="feedback-detail__scroll">
        <header class="feedback-detail__overview">
          <div class="feedback-detail__status-row">
            <div class="feedback-detail__badges">
              <a-tag :color="getFeedbackStatus(detail.status).color" :bordered="false">{{ getFeedbackStatus(detail.status).label }}</a-tag
              ><span>{{ getFeedbackType(detail.type) }}</span>
            </div>
            <div class="feedback-detail__actions">
              <a-button v-if="management && !terminal" size="small" :disabled="saving" @click="openAction('status')">更新状态</a-button>
              <a-dropdown v-if="canWithdraw" :trigger="['click']"
                ><a-tooltip title="更多反馈操作"
                  ><a-button type="text" size="small" aria-label="更多反馈操作" :disabled="saving"><MoreOutlined /></a-button></a-tooltip
                ><template #overlay
                  ><a-menu @click="openAction('withdraw')"><a-menu-item key="withdraw" danger>撤回反馈</a-menu-item></a-menu></template
                ></a-dropdown
              >
            </div>
          </div>
          <h2>{{ detail.title }}</h2>
          <dl class="feedback-detail__facts">
            <div>
              <dt>提交人</dt>
              <dd>{{ detail.createdBy.username }}</dd>
            </div>
            <div>
              <dt>提交时间</dt>
              <dd>{{ feedbackTime(detail.createdAt) }}</dd>
            </div>
          </dl>
        </header>
        <section class="feedback-detail__section" aria-labelledby="feedback-description-title">
          <h3 id="feedback-description-title">反馈内容</h3>
          <p class="feedback-detail__description">{{ detail.content }}</p>
          <FeedbackAttachments :attachments="detail.attachments" />
          <details v-if="detail.sourcePath || detail.environment" class="feedback-detail__context">
            <summary>页面与环境信息</summary>
            <dl>
              <div v-if="detail.sourcePath">
                <dt>来源页面</dt>
                <dd>
                  <router-link :to="detail.sourcePath">{{ detail.sourcePath }}</router-link>
                </dd>
              </div>
              <div v-if="detail.environment">
                <dt>使用环境</dt>
                <dd>{{ detail.environment }}</dd>
              </div>
            </dl>
          </details>
        </section>
        <section class="feedback-detail__section feedback-detail__conversation" aria-labelledby="feedback-conversation-title">
          <div class="feedback-detail__section-heading">
            <h3 id="feedback-conversation-title">沟通记录</h3>
            <span>{{ eventTotal }} 条动态</span>
          </div>
          <a-button v-if="events.length < eventTotal" block class="feedback-detail__earlier" :loading="loadingMore" @click="loadMore"
            >加载更早的记录</a-button
          >
          <FeedbackActivityList :events="events" />
          <div v-if="!events.length" class="feedback-detail__no-replies">管理员的回复和处理进展会显示在这里。</div>
        </section>
      </div>
      <footer v-if="detail" class="feedback-reply">
        <template v-if="!terminal || hasReply">
          <div class="feedback-reply__heading">
            <label for="feedback-reply-content">{{ management ? '回复提交者' : '补充回复' }}</label
            ><span>{{ management ? '回复后将通知提交者' : '发送后将通知管理员' }}</span>
          </div>
          <a-alert
            v-if="terminal"
            type="info"
            show-icon
            message="反馈已结束，未发送的回复已保留。重新打开后可继续发送。"
            class="feedback-reply__draft-notice"
          />
          <a-textarea
            id="feedback-reply-content"
            ref="replyInput"
            v-model:value="content"
            :disabled="saving"
            :readonly="terminal"
            :maxlength="10000"
            :auto-size="{ minRows: 3, maxRows: 5 }"
            placeholder="补充信息或回复，可粘贴截图"
            @paste="imageInput?.handlePaste($event)"
            @keydown="replyShortcut"
          />
          <FeedbackImagesInput ref="imageInput" v-model="images" :disabled="saving || terminal" compact />
          <a-alert v-if="submitError" class="feedback-reply__error" type="error" show-icon :message="submitError" />
          <div class="feedback-reply__footer">
            <span>{{ content.length ? content.length + ' / 10000' : 'Ctrl / ⌘ + Enter 发送' }}</span
            ><a-button v-if="!terminal" type="primary" :loading="saving" :disabled="!hasReply || loading" @click="submitReply"
              ><SendOutlined />发送回复</a-button
            >
            <a-button v-else @click="openAction('reopen')">重新打开</a-button>
          </div>
        </template>
        <div v-else class="feedback-reply__closed">
          <div>
            <strong>{{ detail.status === 'completed' ? '这条反馈已完成' : '这条反馈已关闭' }}</strong>
            <p>如需继续沟通，可以说明原因后重新打开。</p>
          </div>
          <a-button @click="openAction('reopen')">重新打开</a-button>
        </div>
      </footer>
    </div>
    <FeedbackActionModal
      ref="actionModal"
      v-model:open="actionOpen"
      :action="currentAction"
      :feedback="detail"
      :management="management"
      :has-reply-draft="hasReply"
      @saved="actionSaved"
      @conflict="load"
    />
  </a-drawer>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { MoreOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons-vue'
import { getFeedback, listFeedbackEvents, updateFeedback } from '@/services/feedback'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { createFeedbackRequestId, feedbackTime, getFeedbackStatus, getFeedbackType } from './feedbackMeta'
import FeedbackActionModal from './FeedbackActionModal.vue'
import FeedbackActivityList from './FeedbackActivityList.vue'
import FeedbackAttachments from './FeedbackAttachments.vue'
import FeedbackImagesInput from './FeedbackImagesInput.vue'
import './feedback-detail.css'

const props = defineProps({ id: { type: String, default: '' }, management: Boolean })
const emit = defineEmits(['close', 'updated'])
const authStore = useAuthStore()
const appStore = useAppStore()
const detail = ref(null)
const events = ref([])
const eventTotal = ref(0)
const eventPage = ref(1)
const loading = ref(false)
const loadingMore = ref(false)
const loadError = ref('')
const saving = ref(false)
const submitError = ref('')
const content = ref('')
const images = ref([])
const imageInput = ref(null)
const replyInput = ref(null)
const scrollRef = ref(null)
const actionOpen = ref(false)
const currentAction = ref('status')
const actionModal = ref(null)
let requestId = createFeedbackRequestId()
let submittedSnapshot = ''
let loadVersion = 0
const drawerWidth = computed(() => (appStore.viewportWidth <= 720 ? '100%' : Math.min(880, appStore.viewportWidth - 48)))
const terminal = computed(() => ['completed', 'closed'].includes(detail.value?.status))
const hasReply = computed(() => Boolean(content.value.trim() || images.value.length))
const canWithdraw = computed(() => !terminal.value && detail.value?.createdBy.id === authStore.user?.id)

function apply(result) {
  detail.value = result
  events.value = [...result.events.items].reverse()
  eventTotal.value = result.events.total
  eventPage.value = 1
}

async function load() {
  if (!props.id || saving.value) return
  const version = ++loadVersion
  loading.value = true
  loadError.value = ''
  try {
    const result = await getFeedback(props.id, props.management)
    if (version === loadVersion) apply(result)
  } catch (error) {
    if (version === loadVersion) loadError.value = error.message || '反馈加载失败，请重试'
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || loading.value) return
  const id = props.id
  const version = loadVersion
  const area = scrollRef.value
  const oldHeight = area?.scrollHeight || 0
  const oldTop = area?.scrollTop || 0
  loadingMore.value = true
  try {
    const result = await listFeedbackEvents(id, eventPage.value + 1, props.management)
    if (version !== loadVersion || props.id !== id) return
    const seen = new Set(events.value.map((item) => item.id))
    events.value = [...result.items.filter((item) => !seen.has(item.id)).reverse(), ...events.value]
    eventPage.value = result.page
    eventTotal.value = result.total
    await nextTick()
    if (area) area.scrollTop = oldTop + area.scrollHeight - oldHeight
  } catch (error) {
    message.error(error.message || '历史记录加载失败')
  } finally {
    loadingMore.value = false
  }
}

async function submitReply() {
  if (saving.value || loading.value || !detail.value || !hasReply.value || terminal.value) return
  const snapshot = JSON.stringify([content.value.trim(), images.value.map((image) => image.uid)])
  if (submittedSnapshot && submittedSnapshot !== snapshot) requestId = createFeedbackRequestId()
  submittedSnapshot = snapshot
  saving.value = true
  submitError.value = ''
  const id = props.id
  try {
    const result = await updateFeedback(
      id,
      'reply',
      { requestId, version: detail.value.version, content: content.value.trim() },
      images.value,
      props.management
    )
    if (props.id !== id) return
    // 使尚在加载的旧详情失效，避免成功回复后被旧响应回填。
    loadVersion += 1
    apply(result)
    content.value = ''
    images.value = []
    requestId = createFeedbackRequestId()
    submittedSnapshot = ''
    message.success('回复已发送')
    emit('updated')
    await nextTick()
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' })
  } catch (error) {
    submitError.value =
      error.code === 'FEEDBACK_VERSION_CONFLICT'
        ? '反馈已有新进展。请刷新详情后重试，你的回复已保留。'
        : error.message || '回复发送失败，内容已保留，请重试'
    if (error.code === 'FEEDBACK_VERSION_CONFLICT') {
      saving.value = false
      await load()
    }
  } finally {
    saving.value = false
  }
}

function replyShortcut(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) {
    event.preventDefault()
    submitReply()
  }
}

async function discardReply(title = '放弃尚未发送的回复？') {
  if (!hasReply.value) return true
  return new Promise((resolve) =>
    Modal.confirm({
      title,
      content: '这段回复和所选图片尚未发送，已有沟通记录会保留。',
      okText: '放弃回复',
      cancelText: '继续填写',
      zIndex: 1200,
      onOk: () => {
        content.value = ''
        images.value = []
        resolve(true)
      },
      onCancel: () => resolve(false)
    })
  )
}

async function openAction(action) {
  if (saving.value || loading.value) return
  // 回复和处理说明各自保留草稿，切换处理动作或取消弹窗不丢失正在输入的回复。
  currentAction.value = action
  actionOpen.value = true
}

async function actionSaved(result) {
  loadVersion += 1
  apply(result)
  if (['completed', 'closed'].includes(result.status)) {
    content.value = ''
    images.value = []
  }
  emit('updated')
  await nextTick()
  scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' })
}

async function confirmLeave() {
  if (saving.value || actionModal.value?.saving) return false
  if (actionOpen.value && !(await actionModal.value?.confirmLeave())) return false
  return discardReply()
}
async function close() {
  if (await confirmLeave()) emit('close')
}
function beforeUnload(event) {
  if (hasReply.value || (actionOpen.value && actionModal.value?.hasDraft)) {
    event.preventDefault()
    event.returnValue = ''
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
    actionOpen.value = false
    requestId = createFeedbackRequestId()
    submittedSnapshot = ''
    if (props.id) load()
  },
  { immediate: true }
)
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => {
  loadVersion += 1
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>
