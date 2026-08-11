<template>
  <a-spin :spinning="loading">
    <section class="question-bank-page">
      <div class="question-bank-toolbar">
        <a-button type="primary" @click="router.push('/console/question-bank/practice')">
          <template #icon><RocketOutlined /></template>
          开始练习
        </a-button>
        <a-button @click="router.push('/console/question-bank/review')">
          <template #icon><RedoOutlined /></template>
          复习错题
        </a-button>
        <a-button @click="loadOverview">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <span class="question-bank-toolbar__spacer"></span>
        <QuestionBankHelp topic="overview" />
      </div>

      <div class="question-bank-metrics">
        <div v-for="metric in metrics" :key="metric.key" class="question-bank-metric">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
      </div>

      <section class="question-bank-section">
        <header class="question-bank-section__head">
          <strong>最近作答</strong>
          <a-button type="link" size="small" @click="router.push('/console/question-bank/attempts')">全部记录</a-button>
        </header>
        <div v-if="overview.recentAttempts?.length" class="question-bank-recent-list">
          <button
            v-for="item in overview.recentAttempts"
            :key="item.id"
            type="button"
            class="question-bank-recent-item"
            @click="router.push(`/console/question-bank/attempts/${item.id}`)"
          >
            <strong>{{ item.title }}</strong>
            <a-tag :color="getOptionMeta(attemptModeOptions, item.mode).color">
              {{ getOptionMeta(attemptModeOptions, item.mode).label }}
            </a-tag>
            <span>{{ item.status === 'submitted' ? `${item.totalScore} 分` : '进行中' }}</span>
            <span class="question-bank-muted">{{ formatQuestionTime(item.createdAt) }}</span>
            <RightOutlined />
          </button>
        </div>
        <a-empty v-else class="question-bank-empty" description="还没有作答记录" />
      </section>
    </section>
  </a-spin>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { RedoOutlined, ReloadOutlined, RightOutlined, RocketOutlined } from '@ant-design/icons-vue'
import { getQuestionBankOverview } from '@/services/questionBank'
import { attemptModeOptions, formatQuestionTime, getOptionMeta } from './questionBankMeta'
import QuestionBankHelp from './QuestionBankHelp.vue'
import './questionBank.css'

const router = useRouter()
const loading = ref(false)
const overview = ref({})
const metrics = computed(() => [
  { key: 'questions', label: '可用题目', value: overview.value.questionCount || 0 },
  { key: 'papers', label: '可用试卷', value: overview.value.paperCount || 0 },
  { key: 'attempts', label: '完成次数', value: overview.value.attemptCount || 0 },
  { key: 'average', label: '平均得分', value: `${overview.value.averageScore || 0}` },
  { key: 'wrong', label: '待攻克错题', value: overview.value.wrongCount || 0 },
  { key: 'due', label: '今日待复习', value: overview.value.dueCount || 0 }
])

async function loadOverview() {
  loading.value = true
  try {
    overview.value = await getQuestionBankOverview()
  } catch (error) {
    message.error(error.message || '题库总览加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadOverview)
</script>

<style scoped>
.question-bank-recent-item {
  appearance: none;
  width: 100%;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  background: var(--console-surface, #fff);
  color: var(--console-text, #101828);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.question-bank-recent-item:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.question-bank-recent-item:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid var(--console-primary, #1677ff);
  outline-offset: -2px;
}
</style>
