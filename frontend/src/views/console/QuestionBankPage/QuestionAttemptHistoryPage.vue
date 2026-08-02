<template>
  <section class="question-bank-page">
    <BlogTable
      ref="tableRef"
      :api-fn="listQuestionAttempts"
      :columns="columns"
      :params="filters"
      :scroll="{ x: 920 }"
      striped
      show-column-setting
    >
      <template #toolbar>
        <a-select v-model:value="filters.mode" class="question-bank-filter" :options="attemptModeOptions" allow-clear show-search option-filter-prop="label" placeholder="全部模式" @change="reload" />
        <a-select v-model:value="filters.status" class="question-bank-filter" :options="statusOptions" allow-clear show-search option-filter-prop="label" placeholder="全部状态" @change="reload" />
        <a-button @click="reload"><template #icon><ReloadOutlined /></template>刷新</a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <div class="question-bank-stem-cell"><strong>{{ record.title }}</strong><span>{{ record.questionCount }} 道题</span></div>
        </template>
        <template v-else-if="column.key === 'mode'">
          <a-tag :color="getOptionMeta(attemptModeOptions, record.mode).color">{{ getOptionMeta(attemptModeOptions, record.mode).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'score'">
          <strong v-if="record.status === 'submitted'">{{ record.totalScore }} 分</strong>
          <a-tag v-else color="processing">进行中</a-tag>
        </template>
        <template v-else-if="column.key === 'accuracy'">
          {{ record.status === 'submitted' ? `${record.correctCount}/${record.questionCount}` : '-' }}
        </template>
        <template v-else-if="column.key === 'createdAt'">{{ formatQuestionTime(record.createdAt) }}</template>
        <template v-else-if="column.key === 'action'">
          <a-tooltip :title="record.status === 'submitted' ? '查看答卷' : '继续作答'">
            <a-button size="small" @click="router.push(`/console/question-bank/attempts/${record.id}`)"><template #icon><EyeOutlined /></template></a-button>
          </a-tooltip>
        </template>
      </template>
    </BlogTable>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listQuestionAttempts } from '@/services/questionBank'
import { attemptModeOptions, formatQuestionTime, getOptionMeta } from './questionBankMeta'
import './questionBank.css'

const router = useRouter()
const tableRef = ref(null)
const filters = reactive({ mode: undefined, status: undefined })
const statusOptions = [
  { label: '进行中', value: 'in_progress' },
  { label: '已提交', value: 'submitted' }
]
const columns = [
  { title: '名称', key: 'title', dataIndex: 'title', width: 320, fixed: 'left' },
  { title: '模式', key: 'mode', width: 110 },
  { title: '成绩', key: 'score', width: 100 },
  { title: '答对', key: 'accuracy', width: 100 },
  { title: '开始时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' }
]

function reload() {
  tableRef.value?.reload?.()
}
</script>
