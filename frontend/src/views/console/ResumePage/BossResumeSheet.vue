<template>
  <article class="boss-resume-sheet">
    <header class="boss-resume-header">
      <div class="boss-resume-identity">
        <h1>{{ profile.name || resume.title || '未填写姓名' }}</h1>
        <p class="boss-resume-contact">
          <span v-if="profile.gender">{{ profile.gender }}</span>
          <span v-if="profile.age">年龄：{{ profile.age }}</span>
          <span v-if="profile.phone"><Phone :size="15" />{{ profile.phone }}</span>
          <span v-if="profile.email"><Mail :size="15" />{{ profile.email }}</span>
        </p>
        <p class="boss-resume-intention">
          <span v-if="profile.workYears">{{ profile.workYears }}</span>
          <span>求职意向：{{ resume.targetRole || '未设置' }}</span>
          <span>期望城市：{{ profile.expectedCity || profile.location || '未设置' }}</span>
        </p>
      </div>
      <div class="boss-resume-photo">
        <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="简历证件照" />
        <UserRound v-else :size="48" />
      </div>
    </header>

    <ResumeSection title="个人优势" section-key="advantages" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <ol class="boss-resume-advantages">
        <li v-for="item in advantages" :key="item.id">{{ item.content }}</li>
      </ol>
    </ResumeSection>

    <ResumeSection title="工作经历" section-key="workExperiences" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <section v-for="item in workExperiences" :key="item.id" class="boss-resume-entry">
        <EntryHeader :title="item.company" :role="item.role" :range="formatRange(item)" />
        <ul class="boss-resume-bullets">
          <li v-if="item.description">{{ item.description }}</li>
          <li v-for="achievement in sorted(item.achievements)" :key="achievement.id">{{ achievement.content }}</li>
        </ul>
      </section>
    </ResumeSection>

    <ResumeSection title="项目经历" section-key="projects" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <section v-for="project in projects" :key="project.id" class="boss-resume-entry boss-resume-project">
        <EntryHeader :title="project.name" :role="project.role" :range="formatRange(project)" />
        <ul class="boss-resume-bullets boss-resume-project-meta">
          <li v-if="project.description"><strong>项目背景：</strong>{{ project.description }}</li>
          <li v-if="project.techStack"><strong>技术栈：</strong>{{ project.techStack }}</li>
          <li v-if="project.highlights?.length"><strong>负责模块</strong></li>
        </ul>
        <ol v-if="project.highlights?.length" class="boss-resume-responsibilities">
          <li v-for="highlight in sorted(project.highlights)" :key="highlight.id">
            <strong v-if="highlight.title">{{ highlight.title }}：</strong>{{ highlight.content }}
          </li>
        </ol>
      </section>
    </ResumeSection>

    <ResumeSection title="教育经历" section-key="education" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <section v-for="item in education" :key="item.id" class="boss-resume-entry">
        <div class="boss-resume-education-row">
          <strong>{{ item.school || '未填写学校' }}</strong>
          <span>{{ item.degree }}</span>
          <span>{{ item.major }}</span>
          <time>{{ formatRange(item) }}</time>
        </div>
        <p v-if="item.description" class="boss-resume-description">{{ item.description }}</p>
      </section>
    </ResumeSection>

    <ResumeSection v-if="skills.length" title="专业技能" section-key="skills" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <ul class="boss-resume-bullets">
        <li v-for="skill in skills" :key="skill.id">
          <strong>{{ skill.name }}{{ skill.level ? `（${skill.level}）` : '' }}：</strong>{{ skill.description }}
        </li>
      </ul>
    </ResumeSection>

    <ResumeSection v-if="selfEvaluation.length" title="自我评价" section-key="selfEvaluation" :show-action="showSectionActions" @edit="$emit('edit-section', $event)">
      <ul class="boss-resume-bullets">
        <li v-for="item in selfEvaluation" :key="item.id">{{ item.content }}</li>
      </ul>
    </ResumeSection>
  </article>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { Button } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { Mail, Phone, UserRound } from 'lucide-vue-next'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  showSectionActions: { type: Boolean, default: false }
})

defineEmits(['edit-section'])

const sections = computed(() => props.resume.sections || {})
const profile = computed(() => sections.value.profile || {})
const advantages = computed(() => sorted(sections.value.advantages))
const workExperiences = computed(() => sorted(sections.value.workExperiences))
const projects = computed(() => sorted(sections.value.projects))
const education = computed(() => sorted(sections.value.education))
const skills = computed(() => sorted(sections.value.skills))
const selfEvaluation = computed(() => sorted(sections.value.selfEvaluation))

const ResumeSection = defineComponent({
  props: { title: String, sectionKey: String, showAction: Boolean },
  emits: ['edit'],
  setup(sectionProps, { emit, slots }) {
    return () => h('section', { class: 'boss-resume-section' }, [
      h('div', { class: 'boss-resume-section__head' }, [
        h('h2', sectionProps.title),
        sectionProps.showAction
          ? h(Button, {
              size: 'small',
              type: 'link',
              onClick: () => emit('edit', sectionProps.sectionKey)
            }, { icon: () => h(EditOutlined), default: () => '编辑' })
          : null
      ]),
      slots.default?.()
    ])
  }
})

const EntryHeader = defineComponent({
  props: { title: String, role: String, range: String },
  setup(entryProps) {
    return () => h('div', { class: 'boss-resume-entry__head' }, [
      h('strong', entryProps.title || '未填写名称'),
      h('span', entryProps.role || ''),
      h('time', entryProps.range || '')
    ])
  }
})

function sorted(items = []) {
  return [...(items || [])].sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
}

function formatRange(item = {}) {
  return [item.startDate, item.endDate].filter(Boolean).join('-')
}
</script>
