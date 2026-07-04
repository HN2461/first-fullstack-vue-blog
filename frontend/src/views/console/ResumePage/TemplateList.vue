<template>
  <section class="resume-workspace">
    <div class="resume-toolbar">
      <a-select
        v-model:value="selectedResumeId"
        class="resume-toolbar__search"
        :options="resumeOptions"
        placeholder="选择要应用模板的简历"
        allow-clear
        show-search
        option-filter-prop="label"
      />
      <a-tooltip title="刷新">
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="resume-template-grid">
      <article v-for="template in templates" :key="template.key" class="resume-template-card">
        <div class="resume-template-card__preview" :style="{ '--accent': template.accentColor }">
          <strong>姓名 Name</strong>
          <span>目标岗位 / Target Role</span>
          <div></div>
          <p>项目经历、专业技能、工作成果以结构化段落展示。</p>
        </div>
        <div class="resume-template-card__body">
          <strong>{{ template.name }}</strong>
          <p>{{ template.description }}</p>
          <div class="resume-action-row">
            <a-tag v-if="template.isSystem" color="blue" :bordered="false">系统模板</a-tag>
            <a-button type="primary" ghost :disabled="!selectedResumeId" @click="applyTemplate(template.key)">
              应用到简历
            </a-button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getResume, listResumes, listResumeTemplates, updateResume } from '@/services/resume'
import './resumePage.css'

const templates = ref([])
const resumeOptions = ref([])
const selectedResumeId = ref(undefined)

async function loadData() {
  const [templateItems, resumeResult] = await Promise.all([
    listResumeTemplates(),
    listResumes({ pageSize: 100 })
  ])
  templates.value = templateItems
  resumeOptions.value = resumeResult.items.map((item) => ({
    label: `${item.title}${item.targetRole ? ` / ${item.targetRole}` : ''}`,
    value: item.id
  }))
}

async function applyTemplate(templateKey) {
  if (!selectedResumeId.value) {
    message.warning('请先选择简历')
    return
  }

  try {
    const resume = await getResume(selectedResumeId.value)
    await updateResume(selectedResumeId.value, {
      title: resume.title,
      targetRole: resume.targetRole,
      status: resume.status,
      sections: resume.sections,
      templateKey
    })
    message.success('模板已应用')
  } catch (error) {
    message.error(error.message || '应用模板失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.resume-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.resume-template-card {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  overflow: hidden;
}

.resume-template-card__preview {
  display: grid;
  gap: 8px;
  min-height: 170px;
  padding: 18px;
  background: var(--console-surface-muted);
  border-bottom: 3px solid var(--accent);
}

.resume-template-card__preview strong {
  color: var(--accent);
  font-size: 20px;
}

.resume-template-card__preview span,
.resume-template-card__preview p {
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
}

.resume-template-card__preview div {
  width: 70%;
  height: 8px;
  border-radius: 4px;
  background: var(--accent);
  opacity: 0.25;
}

.resume-template-card__body {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.resume-template-card__body strong {
  color: var(--console-text);
}

.resume-template-card__body p {
  min-height: 42px;
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>
