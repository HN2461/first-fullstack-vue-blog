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
        @change="handleResumeSelect"
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
          <div class="resume-template-paper" :class="`is-${template.key}`">
            <header>
              <strong>陈浩南</strong>
              <span>前端开发工程师</span>
            </header>
            <div class="resume-template-contact">
              <i></i>
              <i></i>
              <i></i>
            </div>
            <section>
              <b>专业技能</b>
              <p></p>
              <p></p>
            </section>
            <section>
              <b>项目经历</b>
              <p></p>
              <p class="short"></p>
              <p></p>
            </section>
          </div>
        </div>
        <div class="resume-template-card__body">
          <div class="resume-template-card__title">
            <strong>{{ template.name }}</strong>
            <a-tag v-if="template.isSystem" color="blue" :bordered="false">系统</a-tag>
          </div>
          <p>{{ template.description }}</p>
          <div class="resume-action-row">
            <a-tooltip title="预览模板">
              <a-button :loading="previewingKey === template.key" @click="previewTemplate(template)">
                <template #icon><EyeOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-button type="primary" ghost :disabled="!selectedResumeId" @click="applyTemplate(template.key)">
              <template #icon><CheckOutlined /></template>
              应用到简历
            </a-button>
          </div>
        </div>
      </article>
    </div>

    <ResumePreviewDrawer
      v-model:open="previewVisible"
      :resume="previewResumeData"
      :show-section-actions="false"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { CheckOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getResume, listResumes, listResumeTemplates, updateResume } from '@/services/resume'
import ResumePreviewDrawer from './ResumePreviewDrawer.vue'
import './resumePage.css'

const templates = ref([])
const resumeItems = ref([])
const resumeOptions = ref([])
const selectedResumeId = ref(undefined)
const selectedResume = ref(null)
const previewVisible = ref(false)
const activeTemplate = ref(null)
const previewingKey = ref('')
const sampleResume = {
  title: '前端工程师投递版',
  targetRole: '前端开发工程师 / Uni-app / Vue 3',
  sections: {
    profile: {
      name: '陈浩南',
      phone: '18375389267',
      email: '3519463440@qq.com',
      location: '合肥',
      summary: '熟悉 Vue 3、uni-app、小程序和 PC 中后台开发，具备动态表单、登录会话、WebSocket 和动态路由权限等复杂业务经验。'
    },
    skills: [
      { id: 'skill-vue', name: 'Vue 3 / uni-app', level: '熟悉', description: '可独立完成页面开发、状态管理、组件封装和跨端适配。', sortOrder: 10 },
      { id: 'skill-flow', name: '复杂业务链路', level: '项目经验', description: '参与动态表单、审批流、实时消息和多端登录链路建设。', sortOrder: 20 }
    ],
    education: [
      { id: 'edu', school: '铜陵学院', major: '计算机科学与技术', degree: '本科', startDate: '2021', endDate: '2025', sortOrder: 10 }
    ],
    workExperiences: [
      {
        id: 'work-runlan',
        company: '安徽润岚信息技术有限公司',
        role: '前端开发工程师',
        startDate: '2025.07',
        endDate: '2026.05',
        description: '持续参与 Uni-app / 小程序 / H5 和 Vue PC 中后台项目开发，负责页面开发、组件封装、联调维护和复杂业务链路落地。',
        achievements: [
          { id: 'work-a1', content: '围绕登录会话、请求层、实时消息、动态表单、动态工作流、动态路由权限等链路完成前端实现。', sortOrder: 10 },
          { id: 'work-a2', content: '参与多学校交付项目开发，根据菜单、角色、学校配置和平台差异完成适配。', sortOrder: 20 }
        ],
        sortOrder: 10
      }
    ],
    projects: [
      {
        id: 'project-mobile',
        name: '智慧校园平台型 Uni-app 移动端项目',
        role: '前端开发工程师',
        techStack: 'uni-app、Vue 3、Pinia、WebSocket、微信小程序、H5',
        startDate: '2025.07',
        endDate: '2026.05',
        description: '基于统一代码底座承载多学校、多角色、多业务域场景，并通过 schoolID、后台菜单、登录配置和平台适配实现差异化交付。',
        highlights: [
          { id: 'mobile-h1', content: '负责多平台登录与多身份会话治理，统一处理微信、钉钉、企业微信和家长双身份场景。', sortOrder: 10 },
          { id: 'mobile-h2', content: '封装全局请求层与会话 ready 判定，统一处理 token、schoolID、登录失效和公共链路启动时机。', sortOrder: 20 },
          { id: 'mobile-h3', content: '基于 uni.connectSocket + STOMP 落地消息链路，支撑私聊、群聊、通知和强制下线等协同场景。', sortOrder: 30 }
        ],
        sortOrder: 10
      },
      {
        id: 'project-pc',
        name: '智慧校园平台型 PC 中后台项目',
        role: '前端开发工程师',
        techStack: 'Vue 3、Element Plus、Vue Router、Axios、WebSocket',
        startDate: '2025.07',
        endDate: '2026.05',
        description: '公司长期维护的智慧校园平台型 PC 中后台，承接教务、学生、审批、实习、访客、统一消息等业务域。',
        highlights: [
          { id: 'pc-h1', content: '负责后端菜单驱动的动态路由与权限体系开发，完成角色过滤、面包屑生成和 keep-alive 缓存。', sortOrder: 10 },
          { id: 'pc-h2', content: '参与统一请求层、通用组件、WebSocket 实时通信和动态工作流表单等复杂协同模块建设。', sortOrder: 20 }
        ],
        sortOrder: 20
      }
    ],
    selfEvaluation: [
      { id: 'eval-1', content: '熟悉从移动端到 PC 中后台的前端业务开发，能够在长期迭代项目中维护公共能力和复杂链路。', sortOrder: 10 },
      { id: 'eval-2', content: '重视配置驱动、权限边界和跨端适配，能够把项目经验沉淀为可复用的工程方案。', sortOrder: 20 }
    ]
  }
}

const previewResumeData = computed(() => ({
  ...(selectedResume.value || sampleResume),
  templateKey: activeTemplate.value?.key || selectedResume.value?.templateKey || 'classic'
}))

async function loadData() {
  const [templateItems, resumeResult] = await Promise.all([
    listResumeTemplates(),
    listResumes({ pageSize: 100 })
  ])
  templates.value = templateItems
  resumeItems.value = resumeResult.items || []
  resumeOptions.value = resumeResult.items.map((item) => ({
    label: `${item.title}${item.targetRole ? ` / ${item.targetRole}` : ''}`,
    value: item.id
  }))
  if (selectedResumeId.value) {
    selectedResume.value = await getResume(selectedResumeId.value)
  }
}

async function previewTemplate(template) {
  previewingKey.value = template.key
  try {
    activeTemplate.value = template
    selectedResume.value = await resolvePreviewResume()
    previewVisible.value = true
  } catch (error) {
    message.error(error.message || '加载模板预览失败')
  } finally {
    previewingKey.value = ''
  }
}

async function resolvePreviewResume() {
  if (selectedResumeId.value) {
    return getResume(selectedResumeId.value)
  }

  const latestResume = resumeItems.value[0]
  if (latestResume?.id) {
    return getResume(latestResume.id)
  }

  return sampleResume
}

async function handleResumeSelect(id) {
  selectedResume.value = null
  if (!id) return
  try {
    selectedResume.value = await getResume(id)
  } catch (error) {
    message.error(error.message || '加载简历失败')
  }
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
    selectedResume.value = { ...resume, templateKey }
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
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 12px;
}

.resume-template-card {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  overflow: hidden;
}

.resume-template-card__preview {
  min-height: 230px;
  padding: 16px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 42%),
    var(--console-surface-muted);
}

.resume-template-paper {
  height: 198px;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, var(--console-border));
  border-radius: 6px;
  padding: 14px;
  color: var(--console-text);
  background: var(--console-surface);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.resume-template-paper header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: end;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--accent);
}

.resume-template-paper strong {
  color: var(--accent);
  font-size: 18px;
}

.resume-template-paper span {
  color: var(--console-text-secondary);
  font-size: 11px;
}

.resume-template-contact {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.resume-template-contact i,
.resume-template-paper p {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--console-text-secondary) 28%, transparent);
}

.resume-template-contact i {
  width: 28%;
}

.resume-template-paper section {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.resume-template-paper b {
  color: var(--console-text-secondary);
  font-size: 11px;
}

.resume-template-paper p {
  width: 100%;
  margin: 0;
}

.resume-template-paper p.short {
  width: 72%;
}

.resume-template-paper.is-compact section {
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
}

.resume-template-paper.is-executive header {
  border-bottom-width: 1px;
  background: var(--accent);
  color: #fff;
  margin: -14px -14px 10px;
  padding: 12px 14px;
}

.resume-template-paper.is-executive strong,
.resume-template-paper.is-executive span {
  color: #fff;
}

.resume-template-card__body {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.resume-template-card__body strong {
  color: var(--console-text);
}

.resume-template-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.resume-template-card__body p {
  min-height: 42px;
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>
