<template>
  <section class="resume-editor">
    <a-spin v-if="!initialLoaded" class="resume-editor__loading" />

    <ResumeEditorStart
      v-else-if="!resume.id"
      :template-options="templateOptions"
      @select="openResume"
      @create="createFromStart"
      @list="router.push('/console/resumes')"
    />

    <template v-else>
      <div class="resume-editor__top">
        <a-tooltip title="返回简历列表">
          <a-button @click="router.push('/console/resumes')">
            <template #icon><ArrowLeftOutlined /></template>
          </a-button>
        </a-tooltip>
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
        <a-tooltip title="整体预览">
          <a-button @click="previewOpen = true">
            <template #icon><EyeOutlined /></template>
            预览
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
            <ResumeSectionEditor
              :active-section="activeSection"
              :section-label="currentSectionLabel"
              :profile="sections.profile"
              :items="sectionItems"
              :resume-id="resume.id"
              :photo-uploading="photoUploading"
              @move-item="(from, to) => move(activeSection, from, to)"
              @remove-item="(index) => removeItem(activeSection, index)"
              @drag-start="dragStart"
              @drop-item="(index) => dropItem(activeSection, index)"
              @add-highlight="addHighlight"
              @remove-highlight="removeHighlight"
              @link-highlight="openInterviewDrawer"
              @upload-photo="handlePhotoUpload"
            />
          </div>
        </div>

        <ResumeEditorPreviewRail
          :resume="resume"
          :active-section="activeSection"
          @open-preview="previewOpen = true"
          @edit-section="goSection"
        />
      </div>

      <ResumePreviewDrawer v-model:open="previewOpen" :resume="resume" @edit-section="goSection" />

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
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import {
  createResume,
  createResumeInterview,
  getResume,
  listResumeInterviews,
  listResumeTemplates,
  uploadResumePhoto,
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
import ResumeEditorStart from './ResumeEditorStart.vue'
import ResumeEditorPreviewRail from './ResumeEditorPreviewRail.vue'
import ResumeSectionEditor from './ResumeSectionEditor.vue'
import ResumePreviewDrawer from './ResumePreviewDrawer.vue'
import './resumePage.css'

const route = useRoute()
const router = useRouter()
const activeSection = ref('profile')
const resume = reactive(createDraftResume())
const templateOptions = ref([])
const saving = ref(false)
const saveState = ref('idle')
const initialLoaded = ref(false)
const applyingServerData = ref(false)
const previewOpen = ref(false)
const photoUploading = ref(false)
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
  if (sectionTabs.some((item) => item.key === route.query.section)) {
    activeSection.value = route.query.section
  }
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

function openResume(id) {
  if (!id) return
  router.replace({ path: route.path, query: { id } })
}

async function createFromStart(input) {
  try {
    const saved = await createResume({
      title: input.title,
      targetRole: input.targetRole,
      templateKey: input.templateKey || templateOptions.value[0]?.value || 'boss',
      status: 'draft',
      sections: createEmptySections()
    })
    applyResume(saved)
    saveState.value = 'saved'
    message.success('简历已创建')
    router.replace({ path: route.path, query: { id: saved.id } })
  } catch (error) {
    message.error(error.message || '创建失败')
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
    advantages: () => ({ ...base, content: '' }),
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

function goSection(sectionKey) {
  activeSection.value = sectionKey || 'profile'
}

function addHighlight(item, key) {
  item[key].push({ id: createId(), title: '', content: '', sortOrder: item[key].length * 10 })
}

function removeHighlight(item, key, index) {
  item[key].splice(index, 1)
}

async function handlePhotoUpload(file) {
  if (!resume.id) {
    message.warning('请先保存简历，再上传证件照')
    return
  }

  photoUploading.value = true
  try {
    const saved = await uploadResumePhoto(resume.id, file)
    applyResume(saved)
    message.success('证件照已更新')
  } catch (error) {
    message.error(error.message || '证件照上传失败')
  } finally {
    photoUploading.value = false
  }
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
