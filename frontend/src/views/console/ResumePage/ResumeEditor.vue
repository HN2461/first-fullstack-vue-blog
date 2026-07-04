<template>
  <section class="resume-editor">
    <div class="resume-editor__top">
      <a-input v-model:value.trim="resume.title" class="resume-editor__title" :maxlength="80" placeholder="简历标题" />
      <a-input v-model:value.trim="resume.targetRole" class="resume-editor__role" :maxlength="80" placeholder="目标岗位" />
      <a-select v-model:value="resume.templateKey" class="resume-editor__select" :options="templateOptions" show-search option-filter-prop="label" />
      <a-select v-model:value="resume.status" class="resume-editor__select" :options="statusOptions" />
      <span :class="['resume-editor__save-state', `is-${saveState}`]">{{ saveStateText }}</span>
      <a-tooltip title="立即保存">
        <a-button type="primary" :loading="saving" @click="saveNow">
          <template #icon><SaveOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="resume-editor__layout">
      <nav class="resume-editor__nav">
        <button
          v-for="tab in sectionTabs"
          :key="tab.key"
          type="button"
          :class="{ active: activeSection === tab.key }"
          @click="activeSection = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="resume-panel">
        <div class="resume-panel__head">
          <strong>{{ currentSectionLabel }}</strong>
          <a-button v-if="activeSection !== 'profile'" type="primary" ghost @click="addItem(activeSection)">
            <template #icon><PlusOutlined /></template>
            新增条目
          </a-button>
        </div>
        <div class="resume-panel__body">
          <div v-if="activeSection === 'profile'" class="resume-form-grid">
            <a-form-item label="姓名"><a-input v-model:value="sections.profile.name" /></a-form-item>
            <a-form-item label="电话"><a-input v-model:value="sections.profile.phone" /></a-form-item>
            <a-form-item label="邮箱"><a-input v-model:value="sections.profile.email" /></a-form-item>
            <a-form-item label="所在地"><a-input v-model:value="sections.profile.location" /></a-form-item>
            <a-form-item label="个人链接"><a-input v-model:value="sections.profile.website" /></a-form-item>
            <a-form-item label="个人简介">
              <a-textarea v-model:value="sections.profile.summary" :auto-size="{ minRows: 3, maxRows: 8 }" />
            </a-form-item>
          </div>

          <div v-else class="resume-card-list">
            <article
              v-for="(item, index) in sectionItems"
              :key="item.id"
              class="resume-item-card"
              draggable="true"
              @dragstart="dragStart(index)"
              @dragover.prevent
              @drop="dropItem(activeSection, index)"
            >
              <div class="resume-item-card__head">
                <strong>{{ currentSectionLabel }} #{{ index + 1 }}</strong>
                <div class="resume-action-row">
                  <a-tooltip title="上移"><a-button size="small" @click="move(activeSection, index, index - 1)"><template #icon><ArrowUpOutlined /></template></a-button></a-tooltip>
                  <a-tooltip title="下移"><a-button size="small" @click="move(activeSection, index, index + 1)"><template #icon><ArrowDownOutlined /></template></a-button></a-tooltip>
                  <a-tooltip title="删除"><a-button size="small" danger @click="removeItem(activeSection, index)"><template #icon><DeleteOutlined /></template></a-button></a-tooltip>
                </div>
              </div>

              <div v-if="activeSection === 'skills'" class="resume-form-grid">
                <a-form-item label="技能"><a-input v-model:value="item.name" /></a-form-item>
                <a-form-item label="熟练度"><a-input v-model:value="item.level" /></a-form-item>
                <a-form-item label="说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
              </div>

              <div v-else-if="activeSection === 'education'" class="resume-form-grid">
                <a-form-item label="学校"><a-input v-model:value="item.school" /></a-form-item>
                <a-form-item label="专业"><a-input v-model:value="item.major" /></a-form-item>
                <a-form-item label="学历"><a-input v-model:value="item.degree" /></a-form-item>
                <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
                <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
                <a-form-item label="说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
              </div>

              <div v-else-if="activeSection === 'workExperiences'" class="resume-card-list">
                <div class="resume-form-grid">
                  <a-form-item label="公司"><a-input v-model:value="item.company" /></a-form-item>
                  <a-form-item label="职位"><a-input v-model:value="item.role" /></a-form-item>
                  <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
                  <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
                  <a-form-item label="工作说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
                </div>
                <HighlightEditor title="工作成果" :items="item.achievements" @add="addHighlight(item, 'achievements')" @remove="(i) => removeHighlight(item, 'achievements', i)" @link="(h) => openInterviewDrawer('workExperiences', item, h)" />
              </div>

              <div v-else-if="activeSection === 'projects'" class="resume-card-list">
                <div class="resume-form-grid">
                  <a-form-item label="项目"><a-input v-model:value="item.name" /></a-form-item>
                  <a-form-item label="角色"><a-input v-model:value="item.role" /></a-form-item>
                  <a-form-item label="技术栈"><a-input v-model:value="item.techStack" /></a-form-item>
                  <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
                  <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
                  <a-form-item label="项目说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
                </div>
                <HighlightEditor title="项目亮点" :items="item.highlights" @add="addHighlight(item, 'highlights')" @remove="(i) => removeHighlight(item, 'highlights', i)" @link="(h) => openInterviewDrawer('projects', item, h)" />
              </div>

              <div v-else-if="activeSection === 'selfEvaluation'">
                <a-textarea v-model:value="item.content" :auto-size="{ minRows: 2, maxRows: 6 }" />
              </div>
            </article>
            <a-empty v-if="sectionItems.length === 0" description="暂无条目" />
          </div>
        </div>
      </div>
    </div>

    <a-drawer v-model:open="interviewDrawerOpen" title="关联面试问答" width="520">
      <div class="resume-drawer-body">
        <a-alert v-if="!resume.id" type="warning" show-icon message="请先保存简历，再关联面试问答。" />
        <template v-else>
          <div class="resume-preview">{{ activeLink.excerpt || '当前条目暂无内容' }}</div>
          <a-divider />
          <a-list :data-source="linkedInterviews" size="small" bordered>
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.question" :description="item.answerOutline || item.polishedAnswer || '暂无回答素材'" />
              </a-list-item>
            </template>
          </a-list>
          <a-divider />
          <a-form layout="vertical">
            <a-form-item label="面试官提问">
              <a-input v-model:value.trim="interviewForm.question" :maxlength="300" />
            </a-form-item>
            <a-form-item label="回答思路">
              <a-textarea v-model:value="interviewForm.answerOutline" :auto-size="{ minRows: 3, maxRows: 7 }" />
            </a-form-item>
            <a-form-item label="优化话术">
              <a-textarea v-model:value="interviewForm.polishedAnswer" :auto-size="{ minRows: 3, maxRows: 7 }" />
            </a-form-item>
            <a-form-item label="标签">
              <a-input v-model:value="interviewForm.tagsText" placeholder="多个标签用逗号分隔" />
            </a-form-item>
            <a-button type="primary" block :loading="interviewSubmitting" @click="submitInterview">
              <template #icon><PlusOutlined /></template>
              新增并绑定
            </a-button>
          </a-form>
        </template>
      </div>
    </a-drawer>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import {
  createResume,
  createResumeInterview,
  getResume,
  listResumeInterviews,
  listResumeTemplates,
  updateResume
} from '@/services/resume'
import {
  createDraftResume,
  createEmptySections,
  createId,
  moveItem,
  parseTags,
  sectionTabs,
  statusOptions
} from './resumeHelpers'
import './resumePage.css'

const HighlightEditor = defineComponent({
  props: { title: String, items: { type: Array, default: () => [] } },
  emits: ['add', 'remove', 'link'],
  setup(props, { emit }) {
    const activeDragIndex = ref(-1)
    const reorder = (targetIndex) => {
      if (activeDragIndex.value < 0 || activeDragIndex.value === targetIndex) return
      const [item] = props.items.splice(activeDragIndex.value, 1)
      props.items.splice(targetIndex, 0, item)
      props.items.forEach((entry, index) => { entry.sortOrder = index * 10 })
      activeDragIndex.value = -1
    }

    return () => h('div', { class: 'resume-highlight-editor' }, [
      h('div', { class: 'resume-item-card__head' }, [
        h('strong', props.title),
        h('button', { class: 'ant-btn ant-btn-sm', type: 'button', onClick: () => emit('add') }, '新增')
      ]),
      ...(props.items || []).map((item, index) => h('div', {
        class: 'resume-highlight-row',
        key: item.id,
        draggable: true,
        onDragstart: () => { activeDragIndex.value = index },
        onDragover: (event) => event.preventDefault(),
        onDrop: () => reorder(index)
      }, [
        h('textarea', {
          class: 'ant-input',
          value: item.content,
          rows: 2,
          onInput: (event) => { item.content = event.target.value }
        }),
        h('button', { class: 'ant-btn ant-btn-sm', type: 'button', title: '绑定问答', onClick: () => emit('link', item) }, [h(LinkOutlined)]),
        h('button', { class: 'ant-btn ant-btn-sm ant-btn-dangerous', type: 'button', title: '删除', onClick: () => emit('remove', index) }, [h(DeleteOutlined)])
      ]))
    ])
  }
})

const route = useRoute()
const router = useRouter()
const activeSection = ref('profile')
const resume = reactive(createDraftResume())
const templateOptions = ref([])
const saving = ref(false)
const saveState = ref('idle')
const initialLoaded = ref(false)
const applyingServerData = ref(false)
const interviewDrawerOpen = ref(false)
const linkedInterviews = ref([])
const interviewSubmitting = ref(false)
const dragIndex = ref(-1)
let saveTimer = null

const activeLink = reactive({
  sectionKey: '',
  entryId: '',
  highlightId: '',
  excerpt: ''
})
const interviewForm = reactive({
  question: '',
  answerOutline: '',
  polishedAnswer: '',
  tagsText: ''
})
const sections = computed(() => resume.sections || createEmptySections())
const sectionItems = computed(() => sections.value[activeSection.value] || [])
const currentSectionLabel = computed(() => sectionTabs.find((item) => item.key === activeSection.value)?.label || '')
const saveStateText = computed(() => {
  if (saving.value) return '保存中'
  if (saveState.value === 'saved') return '已保存'
  if (saveState.value === 'error') return '保存失败'
  return resume.id ? '等待编辑' : '未创建'
})

function applyResume(data) {
  applyingServerData.value = true
  Object.assign(resume, createDraftResume(), data)
  resume.sections = {
    ...createEmptySections(),
    ...(data.sections || {})
  }
  setTimeout(() => {
    applyingServerData.value = false
  }, 0)
}

async function loadResume() {
  const id = String(route.query.id || '')
  initialLoaded.value = false
  if (id) {
    applyResume(await getResume(id))
  } else {
    applyResume(createDraftResume())
  }
  initialLoaded.value = true
}

async function saveNow() {
  if (!resume.title.trim()) {
    message.warning('请填写简历标题')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: resume.title,
      targetRole: resume.targetRole,
      templateKey: resume.templateKey,
      status: resume.status,
      sections: resume.sections
    }
    const saved = resume.id ? await updateResume(resume.id, payload) : await createResume(payload)
    applyResume(saved)
    saveState.value = 'saved'
    if (!route.query.id) {
      router.replace({ path: route.path, query: { id: saved.id } })
    }
  } catch (error) {
    saveState.value = 'error'
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function scheduleSave() {
  if (!initialLoaded.value || applyingServerData.value || !resume.id) return
  saveState.value = 'idle'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 1000)
}

function addItem(sectionKey) {
  const base = { id: createId(), sortOrder: sectionItems.value.length * 10 }
  const factories = {
    skills: () => ({ ...base, name: '', level: '', description: '' }),
    education: () => ({ ...base, school: '', degree: '', major: '', startDate: '', endDate: '', description: '' }),
    workExperiences: () => ({ ...base, company: '', role: '', startDate: '', endDate: '', description: '', achievements: [] }),
    projects: () => ({ ...base, name: '', role: '', techStack: '', startDate: '', endDate: '', description: '', highlights: [] }),
    selfEvaluation: () => ({ ...base, content: '' })
  }
  sections.value[sectionKey].push(factories[sectionKey]())
}

function removeItem(sectionKey, index) {
  sections.value[sectionKey].splice(index, 1)
}

function move(sectionKey, from, to) {
  sections.value[sectionKey] = moveItem(sections.value[sectionKey], from, to)
}

function dragStart(index) {
  dragIndex.value = index
}

function dropItem(sectionKey, index) {
  move(sectionKey, dragIndex.value, index)
  dragIndex.value = -1
}

function addHighlight(item, key) {
  item[key].push({ id: createId(), content: '', sortOrder: item[key].length * 10 })
}

function removeHighlight(item, key, index) {
  item[key].splice(index, 1)
}

async function openInterviewDrawer(sectionKey, entry, highlight) {
  Object.assign(activeLink, {
    sectionKey,
    entryId: entry.id,
    highlightId: highlight.id,
    excerpt: highlight.content || ''
  })
  interviewForm.question = ''
  interviewForm.answerOutline = ''
  interviewForm.polishedAnswer = ''
  interviewForm.tagsText = ''
  interviewDrawerOpen.value = true
  if (resume.id) {
    const result = await listResumeInterviews({
      resumeId: resume.id,
      sectionKey,
      entryId: entry.id,
      highlightId: highlight.id,
      pageSize: 50
    })
    linkedInterviews.value = result.items
  }
}

async function submitInterview() {
  if (!interviewForm.question.trim()) {
    message.warning('请填写面试官提问')
    return
  }

  interviewSubmitting.value = true
  try {
    await createResumeInterview({
      question: interviewForm.question,
      answerOutline: interviewForm.answerOutline,
      polishedAnswer: interviewForm.polishedAnswer,
      tags: parseTags(interviewForm.tagsText),
      links: [{ resumeId: resume.id, ...activeLink }]
    })
    message.success('问答已绑定')
    await openInterviewDrawer(activeLink.sectionKey, { id: activeLink.entryId }, { id: activeLink.highlightId, content: activeLink.excerpt })
  } catch (error) {
    message.error(error.message || '保存问答失败')
  } finally {
    interviewSubmitting.value = false
  }
}

onMounted(async () => {
  const [templates] = await Promise.all([listResumeTemplates(), loadResume()])
  templateOptions.value = templates.map((item) => ({ label: item.name, value: item.key }))
})

watch(() => route.query.id, loadResume)
watch(resume, scheduleSave, { deep: true })
</script>

<style scoped>
.resume-editor {
  display: grid;
  gap: 12px;
}

.resume-editor__top {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 180px 150px 120px auto auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.resume-editor__save-state {
  color: var(--console-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.resume-editor__save-state.is-saved {
  color: #16a34a;
}

.resume-editor__save-state.is-error {
  color: #dc2626;
}

.resume-editor__layout {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 12px;
}

.resume-editor__nav {
  display: grid;
  align-content: start;
  gap: 6px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  padding: 8px;
}

.resume-editor__nav button {
  border: 0;
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--console-text-secondary);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.resume-editor__nav button.active {
  color: var(--console-primary);
  background: color-mix(in srgb, var(--console-primary) 12%, transparent);
}

.resume-highlight-editor {
  display: grid;
  gap: 8px;
}

.resume-highlight-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px 32px;
  gap: 6px;
  align-items: start;
}

@media (max-width: 1000px) {
  .resume-editor__top,
  .resume-editor__layout {
    grid-template-columns: 1fr;
  }

  .resume-editor__nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
