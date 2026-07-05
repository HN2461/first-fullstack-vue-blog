<template>
  <a-drawer
    :open="open"
    title="简历整体预览"
    width="860"
    class="resume-preview-drawer"
    @close="$emit('update:open', false)"
  >
    <div class="resume-preview-shell">
      <div :class="['resume-preview-sheet', `is-${resume.templateKey || 'classic'}`]">
        <header class="resume-preview-header">
          <div>
            <h2>{{ profile.name || resume.title || '未命名简历' }}</h2>
            <p>{{ resume.targetRole || '未设置目标岗位' }}</p>
          </div>
          <div class="resume-preview-contact">
            <span v-if="profile.phone">{{ profile.phone }}</span>
            <span v-if="profile.email">{{ profile.email }}</span>
            <span v-if="profile.location">{{ profile.location }}</span>
            <span v-if="profile.website">{{ profile.website }}</span>
          </div>
        </header>

        <section v-if="profile.summary" class="resume-preview-section">
          <PreviewHead label="基础信息" section-key="profile" :show-action="showSectionActions" @edit="handleEdit" />
          <p class="resume-preview-text">{{ profile.summary }}</p>
        </section>

        <section v-if="sections.skills?.length" class="resume-preview-section">
          <PreviewHead label="专业技能" section-key="skills" :show-action="showSectionActions" @edit="handleEdit" />
          <div class="resume-preview-skill-list">
            <div v-for="skill in sorted(sections.skills)" :key="skill.id" class="resume-preview-skill">
              <strong>{{ skill.name || '未命名技能' }}</strong>
              <span v-if="skill.level">{{ skill.level }}</span>
              <p v-if="skill.description">{{ skill.description }}</p>
            </div>
          </div>
        </section>

        <section v-if="sections.education?.length" class="resume-preview-section">
          <PreviewHead label="教育经历" section-key="education" :show-action="showSectionActions" @edit="handleEdit" />
          <TimelineBlock
            v-for="item in sorted(sections.education)"
            :key="item.id"
            :title="joinText([item.school, item.major]) || '未命名教育经历'"
            :subtitle="item.degree"
            :range="formatRange(item)"
            :description="item.description"
          />
        </section>

        <section v-if="sections.workExperiences?.length" class="resume-preview-section">
          <PreviewHead label="工作经历" section-key="workExperiences" :show-action="showSectionActions" @edit="handleEdit" />
          <TimelineBlock
            v-for="item in sorted(sections.workExperiences)"
            :key="item.id"
            :title="item.company || '未命名公司'"
            :subtitle="item.role"
            :range="formatRange(item)"
            :description="item.description"
            :bullets="item.achievements"
          />
        </section>

        <section v-if="sections.projects?.length" class="resume-preview-section">
          <PreviewHead label="项目经历" section-key="projects" :show-action="showSectionActions" @edit="handleEdit" />
          <TimelineBlock
            v-for="item in sorted(sections.projects)"
            :key="item.id"
            :title="item.name || '未命名项目'"
            :subtitle="joinText([item.role, item.techStack])"
            :range="formatRange(item)"
            :description="item.description"
            :bullets="item.highlights"
          />
        </section>

        <section v-if="sections.selfEvaluation?.length" class="resume-preview-section">
          <PreviewHead label="自我评价" section-key="selfEvaluation" :show-action="showSectionActions" @edit="handleEdit" />
          <ul class="resume-preview-bullets">
            <li v-for="item in sorted(sections.selfEvaluation)" :key="item.id">
              {{ item.content || '未填写评价内容' }}
            </li>
          </ul>
        </section>

        <a-empty v-if="isEmpty" description="暂无可预览内容" />
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { Button } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import './resumePreview.css'

const props = defineProps({
  open: { type: Boolean, default: false },
  resume: { type: Object, default: () => ({}) },
  showSectionActions: { type: Boolean, default: true }
})

const emit = defineEmits(['update:open', 'edit-section'])

const sections = computed(() => props.resume.sections || {})
const profile = computed(() => sections.value.profile || {})
const isEmpty = computed(() => {
  const data = sections.value
  return !profile.value.summary &&
    !data.skills?.length &&
    !data.education?.length &&
    !data.workExperiences?.length &&
    !data.projects?.length &&
    !data.selfEvaluation?.length
})

const PreviewHead = defineComponent({
  props: { label: String, sectionKey: String, showAction: Boolean },
  emits: ['edit'],
  setup(headProps, { emit: headEmit }) {
    return () => h('div', { class: 'resume-preview-section__head' }, [
      h('h3', headProps.label),
      headProps.showAction
        ? h(Button, {
            size: 'small',
            type: 'link',
            onClick: () => headEmit('edit', headProps.sectionKey)
          }, {
            icon: () => h(EditOutlined),
            default: () => '编辑'
          })
        : null
    ])
  }
})

const TimelineBlock = defineComponent({
  props: {
    title: String,
    subtitle: String,
    range: String,
    description: String,
    bullets: { type: Array, default: () => [] }
  },
  setup(blockProps) {
    return () => h('article', { class: 'resume-preview-timeline' }, [
      h('div', { class: 'resume-preview-timeline__head' }, [
        h('div', [
          h('strong', blockProps.title),
          blockProps.subtitle ? h('span', blockProps.subtitle) : null
        ]),
        blockProps.range ? h('time', blockProps.range) : null
      ]),
      blockProps.description ? h('p', { class: 'resume-preview-text' }, blockProps.description) : null,
      blockProps.bullets?.length
        ? h('ul', { class: 'resume-preview-bullets' }, sorted(blockProps.bullets).map((item) => (
          h('li', { key: item.id }, item.content || '未填写亮点内容')
        )))
        : null
    ])
  }
})

function sorted(items = []) {
  return [...items].sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0))
}

function joinText(parts = []) {
  return parts.filter(Boolean).join(' / ')
}

function formatRange(item = {}) {
  return joinText([item.startDate, item.endDate])
}

function handleEdit(sectionKey) {
  emit('update:open', false)
  emit('edit-section', sectionKey)
}
</script>
