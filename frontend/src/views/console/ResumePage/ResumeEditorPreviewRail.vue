<template>
  <aside class="resume-preview-rail">
    <div class="resume-preview-rail__head">
      <div>
        <strong>{{ profile.name || resume.title || '未命名简历' }}</strong>
        <span>{{ resume.targetRole || '未设置目标岗位' }}</span>
      </div>
      <a-tooltip title="打开整体预览">
        <a-button size="small" @click="$emit('open-preview')">
          <template #icon><EyeOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="resume-preview-rail__meter">
      <a-progress :percent="completion" size="small" :show-info="false" />
      <span>{{ completion }}%</span>
    </div>

    <div class="resume-preview-rail__meta">
      <span>{{ profile.phone || '未填电话' }}</span>
      <span>{{ profile.email || '未填邮箱' }}</span>
      <span>{{ profile.location || '未填所在地' }}</span>
    </div>

    <div class="resume-preview-rail__sections">
      <button
        v-for="item in sectionSummary"
        :key="item.key"
        type="button"
        :class="{ active: activeSection === item.key }"
        @click="$emit('edit-section', item.key)"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </button>
    </div>

    <div class="resume-preview-rail__paper" :class="`is-${resume.templateKey || 'classic'}`">
      <header>
        <strong>{{ profile.name || '姓名' }}</strong>
        <span>{{ resume.targetRole || '目标岗位' }}</span>
      </header>
      <p v-if="profile.summary">{{ profile.summary }}</p>
      <section v-if="firstSkill">
        <b>专业技能</b>
        <span>{{ firstSkill.name }}{{ firstSkill.level ? ` / ${firstSkill.level}` : '' }}</span>
      </section>
      <section v-if="firstProject">
        <b>项目经历</b>
        <span>{{ firstProject.name }}</span>
        <em>{{ firstProject.description || firstProject.techStack }}</em>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { EyeOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  activeSection: { type: String, default: 'profile' }
})

defineEmits(['open-preview', 'edit-section'])

const sections = computed(() => props.resume.sections || {})
const profile = computed(() => sections.value.profile || {})
const firstSkill = computed(() => sorted(sections.value.skills)[0])
const firstProject = computed(() => sorted(sections.value.projects)[0])
const sectionSummary = computed(() => [
  { key: 'profile', label: '基础', value: filledProfileCount.value },
  { key: 'skills', label: '技能', value: sections.value.skills?.length || 0 },
  { key: 'education', label: '教育', value: sections.value.education?.length || 0 },
  { key: 'workExperiences', label: '工作', value: sections.value.workExperiences?.length || 0 },
  { key: 'projects', label: '项目', value: sections.value.projects?.length || 0 },
  { key: 'selfEvaluation', label: '评价', value: sections.value.selfEvaluation?.length || 0 }
])
const filledProfileCount = computed(() => {
  return ['name', 'phone', 'email', 'location', 'summary']
    .filter((key) => String(profile.value[key] || '').trim()).length
})
const completion = computed(() => {
  const checks = [
    !!profile.value.name,
    !!profile.value.phone,
    !!profile.value.email,
    !!profile.value.summary,
    !!sections.value.skills?.length,
    !!sections.value.education?.length,
    !!sections.value.workExperiences?.length,
    !!sections.value.projects?.length,
    !!sections.value.projects?.some((item) => item.highlights?.length),
    !!sections.value.selfEvaluation?.length
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

function sorted(items = []) {
  return [...(items || [])].sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0))
}
</script>

<style scoped>
.resume-preview-rail {
  position: sticky;
  top: 12px;
  align-self: start;
  display: grid;
  gap: 10px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 12px;
  background: var(--console-surface);
}

.resume-preview-rail__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
}

.resume-preview-rail__head strong,
.resume-preview-rail__head span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-preview-rail__head strong {
  color: var(--console-text);
}

.resume-preview-rail__head span,
.resume-preview-rail__meta {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.resume-preview-rail__meter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 8px;
  align-items: center;
}

.resume-preview-rail__meter span {
  color: var(--console-text-secondary);
  font-size: 12px;
  text-align: right;
}

.resume-preview-rail__meta {
  display: grid;
  gap: 3px;
}

.resume-preview-rail__sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.resume-preview-rail__sections button {
  border: 1px solid var(--console-border);
  border-radius: 6px;
  padding: 7px 8px;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  cursor: pointer;
}

.resume-preview-rail__sections button.active {
  color: var(--console-primary);
  border-color: var(--console-primary);
  background: color-mix(in srgb, var(--console-primary) 10%, transparent);
}

.resume-preview-rail__sections span,
.resume-preview-rail__sections strong {
  display: block;
  line-height: 1.3;
}

.resume-preview-rail__paper {
  --rail-accent: #1677ff;
  display: grid;
  gap: 8px;
  min-height: 230px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  padding: 14px;
  background: var(--console-surface-muted);
  overflow: hidden;
}

.resume-preview-rail__paper.is-compact {
  --rail-accent: #0f766e;
}

.resume-preview-rail__paper.is-executive {
  --rail-accent: #7c3aed;
}

.resume-preview-rail__paper header {
  display: grid;
  gap: 3px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--rail-accent);
}

.resume-preview-rail__paper.is-executive header {
  margin: -14px -14px 4px;
  padding: 12px 14px;
  color: #fff;
  background: var(--rail-accent);
}

.resume-preview-rail__paper header strong {
  color: var(--rail-accent);
  font-size: 18px;
}

.resume-preview-rail__paper.is-executive header strong,
.resume-preview-rail__paper.is-executive header span {
  color: #fff;
}

.resume-preview-rail__paper header span,
.resume-preview-rail__paper p,
.resume-preview-rail__paper em {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.resume-preview-rail__paper p,
.resume-preview-rail__paper section {
  margin: 0;
}

.resume-preview-rail__paper section {
  display: grid;
  gap: 3px;
}

.resume-preview-rail__paper b {
  color: var(--rail-accent);
  font-size: 13px;
}

.resume-preview-rail__paper span {
  color: var(--console-text);
  font-size: 12px;
}

.resume-preview-rail__paper em {
  display: -webkit-box;
  overflow: hidden;
  font-style: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
