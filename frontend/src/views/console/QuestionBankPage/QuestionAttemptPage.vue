<template>
  <a-spin :spinning="loading">
    <section v-if="attempt.id" class="question-attempt-page">
      <header class="question-attempt-header">
        <a-tooltip title="返回作答记录">
          <a-button @click="router.push('/console/question-bank/attempts')"><template #icon><ArrowLeftOutlined /></template></a-button>
        </a-tooltip>
        <div class="question-attempt-title">
          <strong>{{ attempt.title }}</strong>
          <span>{{ getOptionMeta(attemptModeOptions, attempt.mode).label }} · {{ attempt.questionCount }} 道题</span>
        </div>
        <span v-if="attempt.status === 'in_progress'" :class="['question-attempt-timer', { 'is-urgent': remainingSeconds <= 300 && attempt.durationMinutes }]">
          {{ attempt.durationMinutes ? formatClock(remainingSeconds) : `${answeredCount}/${attempt.questionCount}` }}
        </span>
        <a-button v-if="attempt.status === 'in_progress'" type="primary" danger :loading="submitting" @click="confirmSubmit">提交答卷</a-button>
        <a-tag v-else :color="resultStatus.color">
          {{ resultStatus.label }}
        </a-tag>
      </header>

      <template v-if="attempt.status === 'in_progress'">
        <div class="question-attempt-layout">
          <main class="question-attempt-main">
            <div class="question-attempt-question-meta">
              <strong>第 {{ currentIndex + 1 }} 题</strong>
              <a-tag :color="getOptionMeta(questionTypeOptions, currentQuestion.type).color">{{ getOptionMeta(questionTypeOptions, currentQuestion.type).label }}</a-tag>
              <a-tag :color="getOptionMeta(difficultyOptions, currentQuestion.difficulty).color">{{ getOptionMeta(difficultyOptions, currentQuestion.difficulty).label }}</a-tag>
              <span class="question-bank-muted">{{ currentQuestion.categoryName }}</span>
            </div>
            <MarkdownRenderer class="question-attempt-stem" :content="currentQuestion.stem" code-wrap />

            <div class="question-attempt-answer">
              <a-radio-group
                v-if="currentQuestion.type === 'single_choice'"
                :value="getAnswer(currentQuestion)[0]"
                class="question-attempt-options"
                @change="setAnswer(currentQuestion, [$event.target.value])"
              >
                <a-radio v-for="option in currentQuestion.options" :key="option.id" :value="option.id">{{ option.id }}. {{ option.content }}</a-radio>
              </a-radio-group>
              <a-checkbox-group
                v-else-if="currentQuestion.type === 'multiple_choice'"
                :value="getAnswer(currentQuestion)"
                class="question-attempt-options"
                @change="setAnswer(currentQuestion, $event)"
              >
                <a-checkbox v-for="option in currentQuestion.options" :key="option.id" :value="option.id">{{ option.id }}. {{ option.content }}</a-checkbox>
              </a-checkbox-group>
              <a-segmented
                v-else-if="currentQuestion.type === 'true_false'"
                :value="getAnswer(currentQuestion)[0]"
                :options="[{ label: '正确', value: 'true' }, { label: '错误', value: 'false' }]"
                @change="setAnswer(currentQuestion, [$event])"
              />
              <a-textarea
                v-else
                :value="getAnswer(currentQuestion)[0] || ''"
                :auto-size="{ minRows: 5, maxRows: 12 }"
                :placeholder="currentQuestion.assessmentMode === 'self' ? '输入口述要点、实现思路或代码，交卷后对照参考答案自评' : '填写答案'"
                @change="setTextAnswer(currentQuestion, $event.target.value)"
              />
            </div>

            <footer class="question-attempt-footer">
              <a-button :disabled="currentIndex === 0" @click="currentIndex -= 1"><template #icon><LeftOutlined /></template>上一题</a-button>
              <a-button :disabled="currentIndex === attempt.questions.length - 1" type="primary" @click="currentIndex += 1">下一题<template #icon><RightOutlined /></template></a-button>
            </footer>
          </main>

          <aside class="question-attempt-sheet">
            <div class="question-attempt-sheet__head"><strong>答题卡</strong><span>{{ answeredCount }}/{{ attempt.questionCount }}</span></div>
            <div class="question-attempt-grid">
              <button
                v-for="(question, index) in attempt.questions"
                :key="question.questionId"
                type="button"
                :class="{ active: currentIndex === index, answered: getAnswer(question).length > 0 }"
                @click="currentIndex = index"
              >{{ index + 1 }}</button>
            </div>
          </aside>
        </div>
      </template>

      <template v-else>
        <section class="question-result-summary">
          <div class="question-result-score"><strong>{{ attempt.autoQuestionCount ? attempt.totalScore : '--' }}</strong><span>自动判题得分</span></div>
          <div class="question-result-metric"><strong>{{ attempt.correctCount }}/{{ attempt.autoQuestionCount }}</strong><span>自动判题</span></div>
          <div class="question-result-metric"><strong>{{ autoAccuracy }}</strong><span>自动题正确率</span></div>
          <div v-if="attempt.selfQuestionCount" class="question-result-metric"><strong>{{ selfAssessedCount }}/{{ attempt.selfQuestionCount }}</strong><span>自评完成</span></div>
          <div class="question-result-metric"><strong>{{ formatDuration(attempt.startedAt, attempt.submittedAt) }}</strong><span>作答用时</span></div>
        </section>

        <section class="question-result-breakdown">
          <a-tag v-for="item in categoryBreakdown" :key="item.name" :color="breakdownColor(item)">
            {{ item.name }}<template v-if="item.autoTotal"> · 自动 {{ item.correct }}/{{ item.autoTotal }}</template><template v-if="item.selfTotal"> · 自评 {{ item.assessed }}/{{ item.selfTotal }}</template>
          </a-tag>
        </section>

        <a-collapse v-model:activeKey="resultOpenKeys">
          <a-collapse-panel v-for="(question, index) in attempt.questions" :key="question.questionId">
            <template #header>
              <a-space>
                <CheckCircleFilled v-if="question.correct || question.selfAssessment === 'mastered'" style="color: #52c41a" />
                <QuestionCircleFilled v-else-if="question.selfAssessment === 'uncertain'" style="color: #faad14" />
                <ClockCircleFilled v-else-if="question.assessmentMode === 'self' && !question.selfAssessment" style="color: #fa8c16" />
                <CloseCircleFilled v-else style="color: #ff4d4f" />
                <span>第 {{ index + 1 }} 题 · {{ question.categoryName }}</span>
              </a-space>
            </template>
            <template #extra>
              <a-tooltip title="收藏题目">
                <a-button type="text" size="small" @click.stop="favoriteQuestion(question)"><template #icon><StarOutlined /></template></a-button>
              </a-tooltip>
            </template>
            <div class="question-result-panel">
              <MarkdownRenderer :content="question.stem" code-wrap />
              <div class="question-result-answer">
                <div><span>你的答案</span><strong>{{ formatAnswer(question, question.submittedAnswer) }}</strong></div>
                <div><span>{{ question.assessmentMode === 'self' ? '参考答案' : '正确答案' }}</span><strong>{{ formatAnswer(question, question.answerKeys) }}</strong></div>
              </div>
              <div class="question-result-explanation">
                <div class="question-result-explanation__title"><BulbOutlined />答案解析</div>
                <MarkdownRenderer :content="question.explanation || '暂无解析'" code-wrap />
              </div>
              <div v-if="question.assessmentMode === 'self'" class="question-result-self-assessment">
                <span>对照参考答案后自评</span>
                <a-segmented
                  :value="question.selfAssessment"
                  :options="selfAssessmentOptions"
                  :disabled="assessingQuestionId === question.questionId"
                  @change="saveSelfAssessment(question, $event)"
                />
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </template>
    </section>
  </a-spin>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  LeftOutlined,
  QuestionCircleFilled,
  RightOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import {
  assessQuestionAttempt,
  getQuestionAttempt,
  saveQuestionAnswer,
  setQuestionFavorite,
  submitQuestionAttempt
} from '@/services/questionBank'
import {
  attemptModeOptions,
  difficultyOptions,
  formatDuration,
  getOptionMeta,
  questionTypeOptions,
  selfAssessmentOptions
} from './questionBankMeta'
import './questionBank.css'
import './questionAttempt.css'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const assessingQuestionId = ref('')
const attempt = reactive({})
const answers = reactive({})
const currentIndex = ref(0)
const remainingSeconds = ref(0)
const resultOpenKeys = ref([])
const textTimers = new Map()
let clockTimer = null

const currentQuestion = computed(() => attempt.questions?.[currentIndex.value] || {})
const answeredCount = computed(() => (attempt.questions || []).filter((item) => getAnswer(item).length > 0).length)
const selfAssessedCount = computed(() => (attempt.questions || []).filter((item) => item.assessmentMode === 'self' && item.selfAssessment).length)
const autoAccuracy = computed(() => attempt.autoQuestionCount
  ? `${Math.round(attempt.correctCount / attempt.autoQuestionCount * 100)}%`
  : '--')
const resultStatus = computed(() => {
  if (attempt.pendingSelfAssessmentCount) return { label: `待自评 ${attempt.pendingSelfAssessmentCount} 题`, color: 'warning' }
  if (!attempt.autoQuestionCount) return { label: '自评已完成', color: 'success' }
  return attempt.totalScore >= attempt.passScore
    ? { label: '已通过', color: 'success' }
    : { label: '未通过', color: 'error' }
})
const categoryBreakdown = computed(() => {
  const groups = new Map()
  for (const question of attempt.questions || []) {
    const item = groups.get(question.categoryName) || { name: question.categoryName, correct: 0, autoTotal: 0, assessed: 0, selfTotal: 0 }
    if (question.assessmentMode === 'self') {
      item.selfTotal += 1
      if (question.selfAssessment) item.assessed += 1
    } else {
      item.autoTotal += 1
      if (question.correct) item.correct += 1
    }
    groups.set(question.categoryName, item)
  }
  return [...groups.values()]
})

function breakdownColor(item) {
  if (item.selfTotal && item.assessed < item.selfTotal) return 'orange'
  if (!item.autoTotal || item.correct === item.autoTotal) return 'green'
  return 'default'
}

function getAnswer(question) {
  return answers[question.questionId] || []
}

async function persistAnswer(question, answerKeys) {
  try {
    await saveQuestionAnswer(attempt.id, { questionId: question.questionId, answerKeys })
  } catch (error) {
    message.error(error.message || '答案保存失败')
  }
}

function setAnswer(question, answerKeys) {
  answers[question.questionId] = [...answerKeys]
  persistAnswer(question, answerKeys)
}

function setTextAnswer(question, value) {
  answers[question.questionId] = value.trim() ? [value] : []
  clearTimeout(textTimers.get(question.questionId))
  textTimers.set(question.questionId, setTimeout(() => persistAnswer(question, answers[question.questionId]), 500))
}

function formatAnswer(question, answerKeys = []) {
  if (!answerKeys?.length) return '未作答'
  if (question.type === 'true_false') return answerKeys[0] === 'true' ? '正确' : '错误'
  if (['single_choice', 'multiple_choice'].includes(question.type)) {
    const optionMap = new Map((question.options || []).map((item) => [item.id, item.content]))
    return answerKeys.map((key) => `${key}. ${optionMap.get(key) || ''}`).join('；')
  }
  return answerKeys.join('；')
}

function formatClock(seconds) {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

function startClock() {
  if (!attempt.durationMinutes || attempt.status !== 'in_progress') return
  const deadline = new Date(attempt.startedAt).getTime() + attempt.durationMinutes * 60 * 1000
  const update = () => {
    remainingSeconds.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    if (remainingSeconds.value === 0) {
      clearInterval(clockTimer)
      submitNow(true)
    }
  }
  update()
  clockTimer = setInterval(update, 1000)
}

async function loadAttempt() {
  loading.value = true
  try {
    const result = await getQuestionAttempt(route.params.id)
    Object.assign(attempt, result)
    for (const question of result.questions || []) answers[question.questionId] = [...(question.submittedAnswer || [])]
    if (result.status === 'submitted') resultOpenKeys.value = result.questions.filter((item) => !item.correct).map((item) => item.questionId)
    startClock()
  } catch (error) {
    message.error(error.message || '答题记录加载失败')
  } finally {
    loading.value = false
  }
}

async function submitNow(automatic = false) {
  if (submitting.value || attempt.status !== 'in_progress') return
  submitting.value = true
  try {
    const payload = {
      answers: Object.entries(answers).map(([questionId, answerKeys]) => ({ questionId, answerKeys }))
    }
    const result = await submitQuestionAttempt(attempt.id, payload)
    Object.assign(attempt, result)
    if (clockTimer) clearInterval(clockTimer)
    resultOpenKeys.value = result.questions.filter((item) => !item.correct).map((item) => item.questionId)
    message.success(automatic ? '考试时间结束，答卷已自动提交' : '答卷已提交')
  } catch (error) {
    message.error(error.message || '答卷提交失败')
  } finally {
    submitting.value = false
  }
}

function confirmSubmit() {
  Modal.confirm({
    title: '提交答卷',
    content: `已完成 ${answeredCount.value}/${attempt.questionCount} 道题，提交后不能修改答案。`,
    okText: '提交',
    cancelText: '继续作答',
    onOk: () => submitNow(false)
  })
}

async function favoriteQuestion(question) {
  try {
    await setQuestionFavorite(question.questionId, true)
    message.success('已加入收藏')
  } catch (error) {
    message.error(error.message || '收藏失败')
  }
}

async function saveSelfAssessment(question, assessment) {
  assessingQuestionId.value = question.questionId
  try {
    const result = await assessQuestionAttempt(attempt.id, {
      questionId: question.questionId,
      assessment
    })
    Object.assign(attempt, result)
    message.success('自评结果已保存')
  } catch (error) {
    message.error(error.message || '自评结果保存失败')
  } finally {
    assessingQuestionId.value = ''
  }
}

onMounted(loadAttempt)
onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  for (const timer of textTimers.values()) clearTimeout(timer)
})
</script>
