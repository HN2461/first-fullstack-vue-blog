<template>
  <a-modal
    :open="open"
    :width="860"
    :destroy-on-close="true"
    @cancel="$emit('cancel')"
  >
    <template #title>
      <span class="question-preview-title">
        <EyeOutlined />题目预览
        <QuestionBankHelp topic="preview" size="small" button-type="text" />
      </span>
    </template>

    <a-spin :spinning="loading">
      <div v-if="question?.id" class="question-preview-body">
        <div class="question-preview-meta">
          <div class="question-preview-meta__main">
            <strong>{{ question.category?.fullName || '未分类' }}</strong>
            <span>{{ question.code }} · v{{ question.version }}</span>
          </div>
          <a-space :size="6" wrap>
            <a-tag :color="getOptionMeta(questionTypeOptions, question.type).color">
              {{ getOptionMeta(questionTypeOptions, question.type).label }}
            </a-tag>
            <a-tag :color="getOptionMeta(difficultyOptions, question.difficulty).color">
              {{ getOptionMeta(difficultyOptions, question.difficulty).label }}
            </a-tag>
            <a-tag :color="getOptionMeta(questionStatusOptions, question.status).color">
              {{ getOptionMeta(questionStatusOptions, question.status).label }}
            </a-tag>
            <a-tag v-if="question.type === 'short_answer'">
              {{ getOptionMeta(questionAssessmentModeOptions, question.assessmentMode).label }}
            </a-tag>
          </a-space>
        </div>

        <section class="question-preview-section">
          <div class="question-preview-section__title">题干</div>
          <MarkdownRenderer :content="question.stem" code-wrap />
        </section>

        <section v-if="isChoice" class="question-preview-section">
          <div class="question-preview-section__title">选项</div>
          <div class="question-preview-options">
            <div
              v-for="option in question.options"
              :key="option.id"
              :class="['question-preview-option', { 'is-answer': answerKeySet.has(option.id) }]"
            >
              <span class="question-preview-option__key">{{ option.id }}</span>
              <span class="question-preview-option__content">{{ option.content }}</span>
              <CheckCircleFilled v-if="answerKeySet.has(option.id)" class="question-preview-option__check" />
            </div>
          </div>
        </section>

        <section class="question-preview-section question-preview-answer">
          <div class="question-preview-section__title">{{ answerTitle }}</div>
          <MarkdownRenderer v-if="question.type === 'short_answer'" :content="answerMarkdown" code-wrap />
          <strong v-else>{{ formattedAnswer }}</strong>
        </section>

        <section class="question-preview-section question-preview-explanation">
          <div class="question-preview-section__title"><BulbOutlined />答案解析</div>
          <MarkdownRenderer :content="question.explanation || '暂无解析'" code-wrap />
        </section>

        <section v-if="question.tags?.length" class="question-preview-tags">
          <span>标签</span>
          <a-tag v-for="tag in question.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
        </section>
      </div>
      <div v-else class="question-preview-loading-placeholder"></div>
    </a-spin>

    <template #footer>
      <a-button @click="$emit('cancel')">关闭</a-button>
      <a-button type="primary" :disabled="loading || !question?.id" @click="$emit('edit', question)">
        <template #icon><EditOutlined /></template>
        编辑题目
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import {
  BulbOutlined,
  CheckCircleFilled,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import QuestionBankHelp from './QuestionBankHelp.vue'
import {
  difficultyOptions,
  getOptionMeta,
  questionAssessmentModeOptions,
  questionStatusOptions,
  questionTypeOptions
} from './questionBankMeta'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  question: { type: Object, default: null }
})

defineEmits(['cancel', 'edit'])

const isChoice = computed(() => ['single_choice', 'multiple_choice'].includes(props.question?.type))
const answerKeySet = computed(() => new Set(props.question?.answerKeys || []))
const answerTitle = computed(() => props.question?.assessmentMode === 'self' ? '参考答案' : '正确答案')
const answerMarkdown = computed(() => (props.question?.answerKeys || []).join('\n\n---\n\n') || '暂无参考答案')
const formattedAnswer = computed(() => {
  const question = props.question
  const keys = question?.answerKeys || []
  if (!keys.length) return '暂无答案'
  if (question.type === 'true_false') return keys[0] === 'true' ? '正确' : '错误'
  const optionMap = new Map((question.options || []).map((item) => [item.id, item.content]))
  return keys.map((key) => `${key}. ${optionMap.get(key) || ''}`).join('；')
})
</script>

<style scoped>
.question-preview-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.question-preview-body {
  max-height: min(68vh, 720px);
  overflow-y: auto;
  padding-right: 8px;
  color: var(--console-text, #101828);
}

.question-preview-loading-placeholder {
  min-height: 260px;
}

.question-preview-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
}

.question-preview-meta__main {
  min-width: 0;
}

.question-preview-meta__main strong,
.question-preview-meta__main span {
  display: block;
}

.question-preview-meta__main span {
  margin-top: 4px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.question-preview-section {
  padding: 18px 0;
  border-top: 1px solid var(--console-border, #e5e7eb);
}

.question-preview-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
}

.question-preview-options {
  display: grid;
  gap: 8px;
}

.question-preview-option {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 6px;
  background: var(--console-surface, #fff);
}

.question-preview-option.is-answer {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.08);
}

.question-preview-option__key {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 4px;
  background: var(--console-surface-soft, #f8fafc);
  font-weight: 600;
}

.question-preview-option__content {
  min-width: 0;
  overflow-wrap: anywhere;
}

.question-preview-option__check {
  color: #52c41a;
}

.question-preview-answer strong {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.question-preview-explanation {
  padding-bottom: 8px;
}

.question-preview-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 12px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

@media (max-width: 640px) {
  .question-preview-meta {
    align-items: stretch;
    flex-direction: column;
  }

  .question-preview-body {
    max-height: 65vh;
  }
}
</style>
