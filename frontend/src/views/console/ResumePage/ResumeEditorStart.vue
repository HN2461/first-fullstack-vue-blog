<template>
  <section class="resume-editor-start">
    <div class="resume-editor-start__pane">
      <div class="resume-editor-start__form">
        <a-select
          v-model:value="selectedResumeId"
          :options="resumeOptions"
          placeholder="选择已有简历"
          allow-clear
          show-search
          option-filter-prop="label"
        />
        <a-tooltip title="编辑选中的简历">
          <a-button type="primary" :disabled="!selectedResumeId" @click="selectResume">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
        </a-tooltip>
        <a-tooltip title="返回简历列表">
          <a-button @click="$emit('list')">
            <template #icon><UnorderedListOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>

      <a-divider />

      <a-form layout="vertical" class="resume-editor-start__create">
        <a-form-item label="简历标题" required>
          <a-input v-model:value.trim="form.title" :maxlength="80" placeholder="例如：前端工程师投递版" />
        </a-form-item>
        <a-form-item label="目标岗位">
          <a-input v-model:value.trim="form.targetRole" :maxlength="80" placeholder="例如：Vue 前端开发工程师" />
        </a-form-item>
        <a-form-item label="模板">
          <a-select
            v-model:value="form.templateKey"
            :options="templateOptions"
            show-search
            option-filter-prop="label"
          />
        </a-form-item>
        <a-button type="primary" block :loading="creating" @click="createResume">
          <template #icon><PlusOutlined /></template>
          新建并编辑
        </a-button>
      </a-form>
    </div>

    <div class="resume-editor-start__recent">
      <div class="resume-panel__head">
        <strong>最近简历</strong>
        <a-tooltip title="刷新">
          <a-button size="small" @click="loadResumes">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
      <div class="resume-editor-start__list">
        <button
          v-for="item in recentResumes"
          :key="item.id"
          type="button"
          class="resume-editor-start__item"
          @click="$emit('select', item.id)"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.sections?.profile?.name || '未填写姓名' }} / {{ item.targetRole || '未设置岗位' }}</span>
        </button>
        <a-empty v-if="!recentResumes.length" description="暂无简历" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'
import { listResumes } from '@/services/resume'

const props = defineProps({
  templateOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(['select', 'create', 'list'])

const selectedResumeId = ref(undefined)
const recentResumes = ref([])
const resumeOptions = ref([])
const creating = ref(false)
const form = reactive({
  title: '',
  targetRole: '',
  templateKey: 'boss'
})

async function loadResumes() {
  const result = await listResumes({ pageSize: 20 })
  recentResumes.value = result.items.slice(0, 6)
  resumeOptions.value = result.items.map((item) => ({
    label: `${item.title}${item.targetRole ? ` / ${item.targetRole}` : ''}`,
    value: item.id
  }))
}

function selectResume() {
  if (!selectedResumeId.value) return
  emit('select', selectedResumeId.value)
}

async function createResume() {
  if (!form.title.trim()) {
    message.warning('请填写简历标题')
    return
  }

  creating.value = true
  try {
    emit('create', { ...form })
  } finally {
    creating.value = false
  }
}

watch(() => props.templateOptions, (options) => {
  if (!form.templateKey) {
    form.templateKey = options[0]?.value || 'boss'
  }
}, { immediate: true })

onMounted(loadResumes)
</script>
