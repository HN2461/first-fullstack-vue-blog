<template>
  <a-modal
    :open="open"
    :width="820"
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    @ok="submit"
    @cancel="$emit('cancel')"
  >
    <template #title>
      <span class="question-bank-dialog-title">
        {{ question?.id ? '编辑题目' : '新增题目' }}
        <QuestionBankHelp topic="questionEditor" size="small" button-type="text" />
      </span>
    </template>
    <div class="question-bank-modal-body">
      <a-form layout="vertical">
        <div class="question-bank-form-grid">
          <a-form-item label="技术分类" required>
            <a-select
              v-model:value="form.categoryId"
              :options="categoryOptions"
              show-search
              option-filter-prop="label"
              placeholder="选择技术分类"
            />
          </a-form-item>
          <a-form-item label="题型" required>
            <a-select v-model:value="form.type" :options="questionTypeOptions" show-search option-filter-prop="label" @change="resetAnswerDefinition" />
          </a-form-item>
        </div>

        <a-form-item v-if="form.type === 'short_answer'" label="判分方式" required>
          <a-segmented v-model:value="form.assessmentMode" :options="questionAssessmentModeOptions" />
        </a-form-item>

        <a-form-item label="题干" required>
          <a-textarea v-model:value="form.stem" :auto-size="{ minRows: 4, maxRows: 10 }" :maxlength="12000" placeholder="支持 Markdown 与代码块" />
        </a-form-item>

        <template v-if="isChoice">
          <a-form-item label="选项" required>
            <div v-for="(option, index) in form.options" :key="`${index}-${option.id}`" class="question-bank-option-row">
              <a-input v-model:value.trim="option.id" :maxlength="20" />
              <a-input v-model:value.trim="option.content" :maxlength="3000" placeholder="选项内容" />
              <a-tooltip title="删除选项">
                <a-button danger type="text" @click="removeOption(index)">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-tooltip>
            </div>
            <a-button size="small" @click="addOption">
              <template #icon><PlusOutlined /></template>
              添加选项
            </a-button>
          </a-form-item>
          <a-form-item label="正确答案" required>
            <a-select
              v-if="form.type === 'single_choice'"
              v-model:value="singleAnswer"
              :options="answerOptions"
              show-search
              option-filter-prop="label"
              placeholder="选择正确选项"
            />
            <a-select
              v-else
              v-model:value="form.answerKeys"
              mode="multiple"
              :options="answerOptions"
              show-search
              option-filter-prop="label"
              placeholder="选择全部正确选项"
            />
          </a-form-item>
        </template>

        <a-form-item v-else-if="form.type === 'true_false'" label="正确答案" required>
          <a-segmented v-model:value="booleanAnswer" :options="[{ label: '正确', value: 'true' }, { label: '错误', value: 'false' }]" />
        </a-form-item>

        <a-form-item v-else-if="form.assessmentMode === 'self'" label="参考答案" required>
          <a-textarea
            v-model:value="selfReferenceAnswer"
            :auto-size="{ minRows: 5, maxRows: 12 }"
            :maxlength="12000"
            placeholder="填写口述要点、参考实现或评分依据，支持 Markdown 与代码块"
          />
        </a-form-item>

        <a-form-item v-else label="参考答案" required>
          <a-select
            v-model:value="form.answerKeys"
            mode="tags"
            show-search
            :token-separators="['，', ',']"
            placeholder="输入参考答案，回车添加；可配置多个等价答案"
          />
        </a-form-item>

        <a-form-item label="答案解析">
          <a-textarea v-model:value="form.explanation" :auto-size="{ minRows: 4, maxRows: 10 }" :maxlength="12000" placeholder="说明为什么，支持 Markdown" />
        </a-form-item>

        <div class="question-bank-form-grid">
          <a-form-item label="难度">
            <a-select v-model:value="form.difficulty" :options="difficultyOptions" show-search option-filter-prop="label" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="form.status" :options="questionStatusOptions" show-search option-filter-prop="label" />
          </a-form-item>
        </div>
        <a-form-item label="标签">
          <a-select v-model:value="form.tags" mode="tags" show-search :token-separators="['，', ',']" placeholder="输入标签后回车" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { createQuestion, updateQuestion } from '@/services/questionBank'
import QuestionBankHelp from './QuestionBankHelp.vue'
import {
  difficultyOptions,
  questionAssessmentModeOptions,
  questionStatusOptions,
  questionTypeOptions
} from './questionBankMeta'

const props = defineProps({
  open: { type: Boolean, default: false },
  question: { type: Object, default: null },
  categoryOptions: { type: Array, default: () => [] }
})
const emit = defineEmits(['cancel', 'saved'])

const form = reactive({
  categoryId: undefined,
  type: 'single_choice',
  assessmentMode: 'auto',
  stem: '',
  options: [],
  answerKeys: [],
  explanation: '',
  difficulty: 'medium',
  status: 'ready',
  tags: []
})
const submitting = ref(false)
const isChoice = computed(() => ['single_choice', 'multiple_choice'].includes(form.type))
const answerOptions = computed(() => form.options
  .filter((item) => item.id && item.content)
  .map((item) => ({ label: `${item.id}. ${item.content}`, value: item.id })))
const singleAnswer = computed({
  get: () => form.answerKeys[0],
  set: (value) => { form.answerKeys = value ? [value] : [] }
})
const booleanAnswer = computed({
  get: () => form.answerKeys[0] || 'true',
  set: (value) => { form.answerKeys = [value] }
})
const selfReferenceAnswer = computed({
  get: () => form.answerKeys[0] || '',
  set: (value) => { form.answerKeys = value.trim() ? [value] : [] }
})

function createDefaultOptions() {
  return ['A', 'B', 'C', 'D'].map((id) => ({ id, content: '' }))
}

function resetForm() {
  const question = props.question
  form.categoryId = question?.categoryId || undefined
  form.type = question?.type || 'single_choice'
  form.assessmentMode = question?.assessmentMode || 'auto'
  form.stem = question?.stem || ''
  form.options = question?.options?.length
    ? question.options.map((item) => ({ id: item.id, content: item.content }))
    : createDefaultOptions()
  form.answerKeys = [...(question?.answerKeys || [])]
  if (form.type === 'true_false' && !form.answerKeys.length) form.answerKeys = ['true']
  form.explanation = question?.explanation || ''
  form.difficulty = question?.difficulty || 'medium'
  form.status = question?.status || 'ready'
  form.tags = [...(question?.tags || [])]
}

function resetAnswerDefinition() {
  form.assessmentMode = 'auto'
  form.answerKeys = form.type === 'true_false' ? ['true'] : []
  form.options = isChoice.value ? createDefaultOptions() : []
}

function addOption() {
  const id = String.fromCharCode(65 + form.options.length)
  form.options.push({ id, content: '' })
}

function removeOption(index) {
  const [removed] = form.options.splice(index, 1)
  form.answerKeys = form.answerKeys.filter((item) => item !== removed?.id)
}

async function submit() {
  if (!form.categoryId || !form.stem.trim()) {
    message.warning('请填写技术分类和题干')
    return
  }
  const options = isChoice.value
    ? form.options.filter((item) => item.id.trim() && item.content.trim())
    : []
  if (isChoice.value && options.length < 2) {
    message.warning('选择题至少需要两个完整选项')
    return
  }
  if (!form.answerKeys.length) {
    message.warning('请设置正确答案')
    return
  }

  submitting.value = true
  try {
    const payload = {
      categoryId: form.categoryId,
      type: form.type,
      assessmentMode: form.assessmentMode,
      stem: form.stem,
      options,
      answerKeys: form.answerKeys,
      explanation: form.explanation,
      difficulty: form.difficulty,
      status: form.status,
      tags: form.tags
    }
    if (props.question?.id) await updateQuestion(props.question.id, payload)
    else await createQuestion(payload)
    message.success('题目已保存')
    emit('saved')
  } catch (error) {
    message.error(error.message || '题目保存失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) resetForm()
})
</script>
