<template>
  <a-modal
    :open="open"
    :width="760"
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <template #title>
      <span class="question-bank-dialog-title">
        {{ paper?.id ? '编辑试卷' : '新建试卷' }}
        <QuestionBankHelp topic="paperEditor" size="small" button-type="text" />
      </span>
    </template>
    <div class="question-bank-modal-body">
      <a-form layout="vertical">
        <a-form-item label="试卷名称" required>
          <a-input v-model:value.trim="form.title" :maxlength="120" placeholder="例如：JavaScript 高频八股模拟卷" />
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea v-model:value="form.description" :auto-size="{ minRows: 2, maxRows: 5 }" :maxlength="1000" />
        </a-form-item>
        <div class="question-bank-form-grid">
          <a-form-item label="组卷方式" required>
            <a-select v-model:value="form.mode" :options="paperModeOptions" show-search option-filter-prop="label" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="form.status" :options="paperStatusOptions" show-search option-filter-prop="label" />
          </a-form-item>
        </div>

        <template v-if="form.mode === 'fixed'">
          <a-form-item label="固定题目" required>
            <a-select
              v-model:value="form.questionIds"
              mode="multiple"
              :options="questionOptions"
              show-search
              option-filter-prop="label"
              :max-tag-count="4"
              placeholder="选择试卷题目"
            />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item label="抽题分类">
            <a-select
              v-model:value="form.filters.categoryIds"
              mode="multiple"
              :options="categoryOptions"
              show-search
              option-filter-prop="label"
              :max-tag-count="4"
              placeholder="不选择则从全部分类抽题"
            />
          </a-form-item>
          <div class="question-bank-form-grid">
            <a-form-item label="题型">
              <a-select v-model:value="form.filters.types" mode="multiple" :options="questionTypeOptions" show-search option-filter-prop="label" placeholder="全部题型" />
            </a-form-item>
            <a-form-item label="难度">
              <a-select v-model:value="form.filters.difficulties" mode="multiple" :options="difficultyOptions" show-search option-filter-prop="label" placeholder="全部难度" />
            </a-form-item>
          </div>
          <a-form-item label="标签">
            <a-select v-model:value="form.filters.tags" mode="tags" show-search :token-separators="['，', ',']" placeholder="不填写则不限制标签" />
          </a-form-item>
        </template>

        <div class="question-bank-form-grid">
          <a-form-item label="题目数量" required>
            <a-input-number v-model:value="form.questionCount" :disabled="form.mode === 'fixed'" :min="1" :max="200" style="width: 100%" />
          </a-form-item>
          <a-form-item label="考试时长（分钟）" required>
            <a-input-number v-model:value="form.durationMinutes" :min="1" :max="480" style="width: 100%" />
          </a-form-item>
        </div>
        <div class="question-bank-form-grid">
          <a-form-item label="及格分">
            <a-input-number v-model:value="form.passScore" :min="0" :max="100" style="width: 100%" />
          </a-form-item>
          <a-form-item label="随机题序">
            <a-switch v-model:checked="form.shuffleQuestions" />
          </a-form-item>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createQuestionPaper, updateQuestionPaper } from '@/services/questionBank'
import QuestionBankHelp from './QuestionBankHelp.vue'
import { difficultyOptions, paperModeOptions, questionTypeOptions } from './questionBankMeta'

const props = defineProps({
  open: { type: Boolean, default: false },
  paper: { type: Object, default: null },
  categoryOptions: { type: Array, default: () => [] },
  questionOptions: { type: Array, default: () => [] }
})
const emit = defineEmits(['cancel', 'saved'])
const submitting = ref(false)
const paperStatusOptions = [
  { label: '可用', value: 'ready' },
  { label: '草稿', value: 'draft' }
]
const form = reactive({
  title: '',
  description: '',
  mode: 'random',
  questionIds: [],
  filters: { categoryIds: [], tags: [], types: [], difficulties: [] },
  questionCount: 20,
  durationMinutes: 30,
  passScore: 60,
  shuffleQuestions: true,
  status: 'ready'
})

function resetForm() {
  const paper = props.paper
  form.title = paper?.title || ''
  form.description = paper?.description || ''
  form.mode = paper?.mode || 'random'
  form.questionIds = [...(paper?.questionIds || [])]
  form.filters = {
    categoryIds: [...(paper?.filters?.categoryIds || [])],
    tags: [...(paper?.filters?.tags || [])],
    types: [...(paper?.filters?.types || [])],
    difficulties: [...(paper?.filters?.difficulties || [])]
  }
  form.questionCount = paper?.questionCount || 20
  form.durationMinutes = paper?.durationMinutes || 30
  form.passScore = paper?.passScore ?? 60
  form.shuffleQuestions = paper?.shuffleQuestions !== false
  form.status = paper?.status || 'ready'
}

async function submit() {
  if (!form.title.trim()) {
    message.warning('请填写试卷名称')
    return
  }
  if (form.mode === 'fixed' && !form.questionIds.length) {
    message.warning('固定试卷至少选择一道题目')
    return
  }
  submitting.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description,
      mode: form.mode,
      questionIds: form.mode === 'fixed' ? form.questionIds : [],
      filters: form.mode === 'random' ? form.filters : { categoryIds: [], tags: [], types: [], difficulties: [] },
      questionCount: form.mode === 'fixed' ? form.questionIds.length : form.questionCount,
      durationMinutes: form.durationMinutes,
      passScore: form.passScore,
      shuffleQuestions: form.shuffleQuestions,
      status: form.status
    }
    if (props.paper?.id) await updateQuestionPaper(props.paper.id, payload)
    else await createQuestionPaper(payload)
    message.success('试卷已保存')
    emit('saved')
  } catch (error) {
    message.error(error.message || '试卷保存失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) resetForm()
})
watch(() => form.questionIds.length, (count) => {
  if (form.mode === 'fixed') form.questionCount = count || 1
})
</script>
