<template>
  <section class="enterprise-page feedback-page">
    <a-alert v-if="loadError" type="error" show-icon :message="loadError"
      ><template #action><a-button type="link" @click="tableRef?.refresh()">重试</a-button></template></a-alert
    >
    <BlogTable
      ref="tableRef"
      :key="management ? 'management' : 'personal'"
      :api-fn="loadRows"
      :columns="columns"
      :params="params"
      height="100%"
      :scroll="{ x: management ? 1080 : 940 }"
      :page-size="20"
      :page-sizes="['10', '20', '50']"
      show-column-setting
    >
      <template #toolbar>
        <a-input-search
          v-model:value="keyword"
          class="feedback-page__search"
          placeholder="搜索标题或反馈编号"
          allow-clear
          @search="search"
          @change="scheduleSearch"
        />
        <a-select
          v-model:value="type"
          class="feedback-page__select"
          :options="feedbackTypes"
          placeholder="全部类型"
          allow-clear
          show-search
          option-filter-prop="label"
        />
        <a-select
          v-model:value="status"
          class="feedback-page__select"
          :options="feedbackStatuses"
          placeholder="全部状态"
          allow-clear
          show-search
          option-filter-prop="label"
        />
        <a-button v-if="hasFilters" type="link" @click="reset">重置全部</a-button>
        <a-tooltip
          :title="
            management
              ? '查看和回复用户反馈；完成时填写处理结果，系统会通知提交者。'
              : '报告问题、提出建议并与管理员沟通；反馈与截图仅本人和获授权处理人可见。'
          "
          ><a-button type="text" aria-label="意见反馈说明"><QuestionCircleOutlined /></a-button
        ></a-tooltip>
        <a-button v-if="!management" type="primary" @click="createOpen = true"><PlusOutlined />提交反馈</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'"
          ><button class="feedback-page__title" type="button" @click="openDetail(record.id)">{{ record.title }}</button></template
        >
        <template v-else-if="column.key === 'type'">{{ getFeedbackType(record.type) }}</template>
        <template v-else-if="column.key === 'status'"
          ><a-tag :color="getFeedbackStatus(record.status).color">{{ getFeedbackStatus(record.status).label }}</a-tag></template
        >
        <template v-else-if="column.key === 'createdBy'">{{ record.createdBy.username }}</template>
        <template v-else-if="column.key === 'lastActivityAt'">{{ feedbackTime(record.lastActivityAt) }}</template>
        <template v-else-if="column.key === 'action'"
          ><a-button type="link" size="small" @click="openDetail(record.id)">{{
            management ? '查看 / 处理' : '查看 / 回复'
          }}</a-button></template
        >
      </template>
      <template #empty>
        <div v-if="!loadError" class="feedback-page__empty" role="status">
          <MessageOutlined aria-hidden="true" /><strong>{{
            hasFilters ? '没有匹配的反馈' : management ? '暂未收到反馈' : '还没有提交过反馈'
          }}</strong>
          <span>{{
            hasFilters
              ? '调整类型、状态或关键词，查看其他反馈。'
              : management
                ? '用户提交问题或建议后，会显示在这里并发送站内通知。'
                : '遇到问题或希望增加功能时，可以在这里告诉管理员并跟踪进度。'
          }}</span>
          <a-button v-if="hasFilters" @click="reset">清除筛选</a-button
          ><a-button v-else-if="!management" type="primary" @click="createOpen = true">提交第一条反馈</a-button>
        </div>
      </template>
    </BlogTable>
    <FeedbackCreateModal v-model:open="createOpen" :source-path="sourcePath" @created="created" />
    <FeedbackDetailDrawer :id="activeId" :management="management" @close="closeDetail" @updated="tableRef?.refresh()" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessageOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listFeedback } from '@/services/feedback'
import { feedbackStatuses, feedbackTime, feedbackTypes, getFeedbackStatus, getFeedbackType } from './feedbackMeta'
import FeedbackCreateModal from './FeedbackCreateModal.vue'
import FeedbackDetailDrawer from './FeedbackDetailDrawer.vue'

const props = defineProps({ management: Boolean })
const route = useRoute()
const router = useRouter()
const tableRef = ref(null)
const keyword = ref('')
const submittedKeyword = ref('')
const type = ref(undefined)
const status = ref(undefined)
const loadError = ref('')
const createOpen = ref(false)
const sourcePath = ref('')
let searchTimer = null
const activeId = computed(() => (/^[a-f\d]{24}$/i.test(String(route.query.id || '')) ? String(route.query.id) : ''))
const params = computed(() => ({ keyword: submittedKeyword.value || undefined, type: type.value, status: status.value }))
const hasFilters = computed(() => Boolean(submittedKeyword.value || type.value || status.value))
const columns = computed(() => [
  { title: '编号', key: 'number', dataIndex: 'number', width: 230 },
  { title: '标题', key: 'title', width: 280 },
  { title: '类型', key: 'type', width: 130 },
  { title: '状态', key: 'status', width: 100 },
  ...(props.management ? [{ title: '提交者', key: 'createdBy', width: 140 }] : []),
  { title: '最近活动', key: 'lastActivityAt', width: 190 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
])

async function loadRows(filters) {
  loadError.value = ''
  try {
    return await listFeedback(filters, props.management)
  } catch (error) {
    loadError.value = error.message || '反馈加载失败'
    return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize }
  }
}
function search() {
  clearTimeout(searchTimer)
  submittedKeyword.value = keyword.value.trim()
}
function scheduleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(search, 300)
}
function reset() {
  clearTimeout(searchTimer)
  keyword.value = ''
  submittedKeyword.value = ''
  type.value = undefined
  status.value = undefined
}
function openDetail(id) {
  router.push({ path: route.path, query: { ...route.query, id } })
}
function closeDetail() {
  router.replace({ path: route.path, query: { ...route.query, id: undefined } })
}
function created(result) {
  tableRef.value?.reload()
  openDetail(result.id)
}

watch(
  () => route.query.create,
  (value) => {
    if (value !== '1' || props.management) return
    sourcePath.value = String(route.query.from || '').split(/[?#]/)[0]
    createOpen.value = true
    router.replace({ path: route.path, query: { ...route.query, create: undefined, from: undefined } })
  },
  { immediate: true }
)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<style scoped>
.feedback-page {
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feedback-page > :deep(.blog-table) {
  min-height: 0;
  flex: 1;
}
.feedback-page__search {
  width: 250px;
}
.feedback-page__select {
  width: 145px;
}
.feedback-page__title {
  max-width: 100%;
  padding: 0;
  border: 0;
  color: var(--console-primary);
  background: transparent;
  cursor: pointer;
  text-align: left;
  overflow-wrap: anywhere;
}
.feedback-page__empty {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: var(--console-text-secondary);
  padding: 24px;
}
.feedback-page__empty > :first-child {
  font-size: 30px;
  color: var(--console-primary);
}
.feedback-page__empty > strong {
  color: var(--console-text);
}
@media (max-width: 600px) {
  .feedback-page__search {
    width: 100%;
  }
  .feedback-page__select {
    width: 135px;
  }
}
</style>
