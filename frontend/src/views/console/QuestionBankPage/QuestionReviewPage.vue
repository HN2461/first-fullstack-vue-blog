<template>
  <section class="question-bank-page">
    <BlogTable
      ref="tableRef"
      :api-fn="listQuestionProgress"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 980 }"
      striped
    >
      <template #toolbar>
        <a-segmented v-model:value="filters.scope" :options="scopeOptions" @change="reload" />
        <a-button type="primary" :loading="starting" @click="startScopeReview">
          <template #icon><RedoOutlined /></template>
          开始本组复习
        </a-button>
        <span class="question-bank-toolbar__spacer"></span>
        <QuestionBankHelp topic="review" />
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'question'">
          <div class="question-bank-stem-cell">
            <strong>{{ record.question.stem }}</strong>
            <span>{{ record.question.category?.fullName || '-' }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'type'">
          <a-tag :color="getOptionMeta(questionTypeOptions, record.question.type).color">{{ getOptionMeta(questionTypeOptions, record.question.type).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'accuracy'">{{ record.accuracy }}%</template>
        <template v-else-if="column.key === 'mastery'">
          <a-progress :percent="record.masteryLevel * 20" :show-info="false" size="small" />
        </template>
        <template v-else-if="column.key === 'nextReviewAt'">{{ formatQuestionTime(record.nextReviewAt) }}</template>
        <template v-else-if="column.key === 'action'">
          <div class="question-bank-action-row">
            <a-tooltip title="练习本题">
              <a-button size="small" @click="startSingle(record)"><template #icon><PlayCircleOutlined /></template></a-button>
            </a-tooltip>
            <a-tooltip :title="record.isFavorite ? '取消收藏' : '收藏题目'">
              <a-button size="small" @click="toggleFavorite(record)">
                <template #icon><StarFilled v-if="record.isFavorite" /><StarOutlined v-else /></template>
              </a-button>
            </a-tooltip>
          </div>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlayCircleOutlined, RedoOutlined, StarFilled, StarOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listQuestionProgress, setQuestionFavorite, startQuickAttempt } from '@/services/questionBank'
import { formatQuestionTime, getOptionMeta, questionTypeOptions } from './questionBankMeta'
import QuestionBankHelp from './QuestionBankHelp.vue'
import './questionBank.css'

const router = useRouter()
const tableRef = ref(null)
const starting = ref(false)
const filters = reactive({ scope: 'wrong' })
const scopeOptions = [
  { label: '错题', value: 'wrong' },
  { label: '今日到期', value: 'due' },
  { label: '收藏', value: 'favorite' }
]
const columns = [
  { title: '题目', key: 'question', width: 380, fixed: 'left' },
  { title: '题型', key: 'type', width: 100 },
  { title: '作答次数', key: 'attempts', dataIndex: 'attempts', width: 100 },
  { title: '正确率', key: 'accuracy', width: 90 },
  { title: '掌握度', key: 'mastery', width: 140 },
  { title: '下次复习', key: 'nextReviewAt', width: 170 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

function reload() {
  tableRef.value?.reload?.()
}

async function startAttempt(payload) {
  starting.value = true
  try {
    const attempt = await startQuickAttempt({ mode: 'review', ...payload })
    router.push(`/console/question-bank/attempts/${attempt.id}`)
  } catch (error) {
    message.error(error.message || '复习启动失败')
  } finally {
    starting.value = false
  }
}

function startScopeReview() {
  startAttempt({ reviewScope: filters.scope, count: 20, title: scopeOptions.find((item) => item.value === filters.scope)?.label })
}

function startSingle(record) {
  startAttempt({ questionIds: [record.questionId], count: 1, title: '单题复习' })
}

async function toggleFavorite(record) {
  try {
    await setQuestionFavorite(record.questionId, !record.isFavorite)
    message.success(record.isFavorite ? '已取消收藏' : '已收藏')
    reload()
  } catch (error) {
    message.error(error.message || '收藏状态更新失败')
  }
}
</script>
