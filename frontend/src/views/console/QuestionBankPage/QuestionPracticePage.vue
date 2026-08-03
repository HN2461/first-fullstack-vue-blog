<template>
  <a-spin :spinning="loading">
    <section class="question-bank-page">
      <div class="question-bank-toolbar">
        <a-segmented v-model:value="form.mode" :options="[{ label: '快速练习', value: 'practice' }, { label: '模拟测验', value: 'exam' }]" />
        <span class="question-bank-toolbar__spacer"></span>
        <QuestionBankHelp topic="practice" />
      </div>
      <section class="question-bank-section question-practice-config">
        <a-form layout="vertical">
          <div class="question-bank-form-grid">
            <a-form-item label="技术分类">
              <a-select v-model:value="form.categoryId" :options="categoryOptions" allow-clear show-search option-filter-prop="label" placeholder="全部技术分类" />
            </a-form-item>
            <a-form-item label="题目数量">
              <a-input-number v-model:value="form.count" :min="1" :max="100" style="width: 100%" />
            </a-form-item>
          </div>
          <div class="question-bank-form-grid">
            <a-form-item label="题型">
              <a-select v-model:value="form.types" mode="multiple" :options="questionTypeOptions" show-search option-filter-prop="label" placeholder="全部题型" />
            </a-form-item>
            <a-form-item label="难度">
              <a-select v-model:value="form.difficulties" mode="multiple" :options="difficultyOptions" show-search option-filter-prop="label" placeholder="全部难度" />
            </a-form-item>
          </div>
          <div class="question-bank-form-grid">
            <a-form-item label="标签">
              <a-select v-model:value="form.tags" mode="tags" show-search :token-separators="['，', ',']" placeholder="不填写则不限制" />
            </a-form-item>
            <a-form-item label="限时（分钟）">
              <a-input-number v-model:value="form.durationMinutes" :min="0" :max="480" style="width: 100%" />
            </a-form-item>
          </div>
          <div class="question-practice-actions">
            <a-button @click="resetForm">
              <template #icon><ClearOutlined /></template>
              重置条件
            </a-button>
            <a-button type="primary" :loading="starting" @click="start">
              <template #icon><PlayCircleOutlined /></template>
              开始{{ form.mode === 'exam' ? '测验' : '练习' }}
            </a-button>
          </div>
        </a-form>
      </section>
    </section>
  </a-spin>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ClearOutlined, PlayCircleOutlined } from '@ant-design/icons-vue'
import { listQuestionCategories, startQuickAttempt } from '@/services/questionBank'
import { difficultyOptions, flattenCategoryOptions, questionTypeOptions } from './questionBankMeta'
import QuestionBankHelp from './QuestionBankHelp.vue'
import './questionBank.css'

const router = useRouter()
const loading = ref(false)
const starting = ref(false)
const categoryTree = ref([])
const categoryOptions = computed(() => flattenCategoryOptions(categoryTree.value))
const form = reactive({
  mode: 'practice',
  categoryId: undefined,
  count: 20,
  types: [],
  difficulties: [],
  tags: [],
  durationMinutes: 0
})

function resetForm() {
  Object.assign(form, {
    categoryId: undefined,
    count: 20,
    types: [],
    difficulties: [],
    tags: [],
    durationMinutes: 0
  })
}

async function start() {
  starting.value = true
  try {
    const selectedCategory = categoryOptions.value.find((item) => item.value === form.categoryId)
    const attempt = await startQuickAttempt({
      ...form,
      title: selectedCategory ? `${selectedCategory.label} · ${form.mode === 'exam' ? '模拟测验' : '快速练习'}` : undefined,
      passScore: 60
    })
    router.push(`/console/question-bank/attempts/${attempt.id}`)
  } catch (error) {
    message.error(error.message || '练习启动失败')
  } finally {
    starting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const result = await listQuestionCategories()
    categoryTree.value = result.tree || []
  } catch (error) {
    message.error(error.message || '技术分类加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.question-practice-config {
  width: min(860px, 100%);
  padding: 24px;
}

.question-practice-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 18px;
  border-top: 1px solid var(--console-border, #e5e7eb);
}

@media (max-width: 640px) {
  .question-practice-config {
    padding: 16px;
  }

  .question-practice-actions > .ant-btn {
    flex: 1;
  }
}
</style>
