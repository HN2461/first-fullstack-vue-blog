<template>
  <div class="settings-page">
    <!-- 左栏：站点信息配置 -->
    <div class="settings-main">
      <div class="settings-panel">
        <div class="panel-header">
          <div class="panel-header-icon">
            <SettingOutlined />
          </div>
          <div class="panel-header-text">
            <h3>站点信息</h3>
            <span>配置站点基本信息、作者身份和显示偏好</span>
          </div>
        </div>

        <div class="panel-body">
          <!-- 保存状态提示条 -->
          <div v-if="loadError" class="settings-alert settings-alert--error">
            <ExclamationCircleOutlined /> {{ loadError }}
          </div>
          <div v-else-if="saving" class="settings-alert settings-alert--saving">
            <LoadingOutlined spin /> 正在保存设置...
          </div>
          <div v-else class="settings-alert">
            <InfoCircleOutlined /> 修改后请主动保存，离开页面前会提醒未保存内容。
          </div>

          <!-- 表单 -->
          <a-form layout="vertical" class="settings-form">
            <div class="form-item">
              <label>站点标题</label>
              <a-input
                v-model:value.trim="form.siteTitle"
                placeholder="显示在浏览器标签页"
                :maxlength="60"
                show-count
              >
                <template #prefix><FontColorsOutlined /></template>
              </a-input>
              <span class="form-hint">用于浏览器标题栏和 SEO 标题</span>
            </div>

            <div class="form-item">
              <label>站点描述</label>
              <a-textarea
                v-model:value.trim="form.siteDescription"
                placeholder="简要描述你的站点内容..."
                :rows="3"
                :maxlength="200"
                show-count
              />
              <span class="form-hint">用于搜索引擎优化（SEO）和社交分享预览</span>
            </div>

            <div class="form-row">
              <div class="form-item form-item--half">
                <label>作者名称</label>
                <a-input
                  v-model:value.trim="form.authorName"
                  placeholder="显示在文章页面"
                  :maxlength="32"
                >
                  <template #prefix><UserOutlined /></template>
                </a-input>
              </div>
              <div class="form-item form-item--half">
                <label>系统版本</label>
                <a-input
                  v-model:value.trim="form.systemVersion"
                  placeholder="例如 v1.0.0"
                  :maxlength="20"
                >
                  <template #prefix><TagOutlined /></template>
                </a-input>
              </div>
            </div>

            <div class="form-item">
              <label>默认主题</label>
              <a-radio-group v-model:value="form.defaultTheme" class="theme-switcher">
                <a-radio-button value="light" class="theme-opt theme-opt--light">
                  <Sun :size="16" /> 浅色
                </a-radio-button>
                <a-radio-button value="dark" class="theme-opt theme-opt--dark">
                  <Moon :size="16" /> 暗色
                </a-radio-button>
              </a-radio-group>
            </div>
          </a-form>
        </div>
      </div>
    </div>

    <!-- 右栏：系统信息 + 操作 -->
    <div class="settings-aside">
      <!-- 系统信息卡片 -->
      <div class="settings-panel sys-info-panel">
        <div class="panel-header panel-header--compact">
          <InfoCircleOutlined />
          <h3>系统信息</h3>
        </div>
        <div class="sys-info-list">
          <div class="sys-info-item">
            <span class="sys-info-dot sys-info-dot--active"></span>
            <span class="sys-info-label">服务状态</span>
            <span class="sys-info-value sys-info-value--success">运行中</span>
          </div>
          <div class="sys-info-item">
            <span class="sys-info-dot sys-info-dot--env"></span>
            <span class="sys-info-label">运行环境</span>
            <span class="sys-info-value">Node.js</span>
          </div>
          <div class="sys-info-item">
            <span class="sys-info-dot sys-info-dot--db"></span>
            <span class="sys-info-label">数据库</span>
            <span class="sys-info-value">MongoDB</span>
          </div>
          <div class="sys-info-divider"></div>
          <div class="sys-info-time">
            <ClockCircleOutlined />
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="settings-actions">
        <a-button @click="loadSettings" :loading="loading" class="action-btn action-btn--reset">
          <template #icon><UndoOutlined /></template>
          重置
        </a-button>
        <a-button type="primary" @click="saveSettings" :loading="saving" class="action-btn action-btn--save">
          <template #icon><SaveOutlined /></template>
          保存设置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  SettingOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  FontColorsOutlined,
  UserOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UndoOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { Sun, Moon } from 'lucide-vue-next'
import { getAdminSettings, updateAdminSettings } from '@/services/admin'
import { setCachedSiteProfile } from '@/utils/siteProfile'
import { useAdminActions, useUnsavedChanges } from '@/composables/useAdminUi'

const saving = ref(false)
const loading = ref(false)
const currentTime = ref('')
const loadError = ref('')
const { runAction, toMessage } = useAdminActions()

const form = reactive({
  siteTitle: '',
  siteDescription: '',
  authorName: '',
  defaultTheme: 'light',
  systemVersion: ''
})
const { markClean } = useUnsavedChanges({
  getSnapshot: () => ({ ...form }),
  enabled: computed(() => !loading.value && !saving.value),
  title: '离开设置页面？',
  content: '当前站点设置还未保存，离开后本次修改会丢失。'
})

let timer = null

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

async function loadSettings() {
  loading.value = true
  loadError.value = ''
  try {
    const settings = await getAdminSettings()
    Object.assign(form, settings)
    setCachedSiteProfile(settings)
    markClean()
  } catch (error) {
    loadError.value = toMessage(error, '加载失败')
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await runAction(() => updateAdminSettings(form), {
      successMessage: '设置已保存',
      errorMessage: '保存失败'
    })
    setCachedSiteProfile(form)
    markClean()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.settings-page {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
  max-width: 1280px;
}

/* ===== 面板通用 ===== */
.settings-panel {
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 10px;
  overflow: hidden;
}

/* ===== 面板头部 ===== */
.panel-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.panel-header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--console-primary-soft);
  color: var(--console-primary-strong);
  font-size: 18px;
  flex-shrink: 0;
}

.panel-header-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--console-text);
  line-height: 1.5;
}

.panel-header-text span {
  font-size: 13px;
  color: var(--console-text-secondary);
  line-height: 1.5;
  margin-top: 2px;
}

.panel-header--compact {
  gap: 8px;
  padding: 14px 18px;
  background: transparent;
}

.panel-header--compact > .anticon {
  color: var(--console-primary-strong);
  font-size: 14px;
}

/* ===== 面板主体 ===== */
.panel-body {
  padding: 28px 28px 32px;
}

/* ===== 提示条 ===== */
.settings-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 24px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
}

.settings-alert--error {
  color: #cf1322;
  background: #fff2f0;
  border-color: #ffccc7;
}

.settings-alert--saving {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
  border-color: #adc5ff;
}

/* ===== 表单 ===== */
.settings-form {
  max-width: 100%;
}

.form-item {
  margin-bottom: 26px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--console-text);
  margin-bottom: 10px;
  letter-spacing: 0.03em;
}

.form-item :deep(.ant-input),
.form-item :deep(.ant-input-affix-wrapper),
.form-item :deep(.ant-input-textarea) {
  border-radius: 8px;
  transition: all 0.2s;
}

.form-item :deep(.ant-input):hover,
.form-item :deep(.ant-input-affix-wrapper:hover),
.form-item :deep(.ant-input-textarea:hover) {
  border-color: var(--console-primary);
}

.form-item :deep(.ant-input-prefix) {
  color: var(--console-text-secondary);
  margin-right: 8px;
}

.form-hint {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--console-text-secondary);
  line-height: 1.6;
}

/* 双列布局 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-item--half {
  margin-bottom: 26px;
}

/* 主题切换 */
.theme-switcher {
  display: flex;
  gap: 12px;
}

.theme-opt {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px !important;
  font-size: 14px;
  height: 40px;
  padding: 0 20px;
  transition: all 0.2s;
}

.theme-opt svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 移除 radio-button 默认边框 */
.theme-switcher .ant-radio-button-wrapper {
  border-left: none !important;
  border-right: none !important;
}

.theme-switcher .ant-radio-button-wrapper:not(:first-child)::before {
  display: none !important;
}

.theme-opt--light {
  color: #d48806;
}

.theme-opt--dark {
  color: #597ef7;
}

/* ===== 右侧栏 ===== */
.settings-aside {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 0;
}

/* 系统信息卡片 */
.sys-info-panel .panel-body {
  padding: 20px 20px 18px;
}

.sys-info-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sys-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.sys-info-item:hover {
  background: var(--console-surface-hover);
}

.sys-info-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sys-info-dot--active {
  background: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
}

.sys-info-dot--env {
  background: #1677ff;
}

.sys-info-dot--db {
  background: #722ed1;
}

.sys-info-label {
  font-size: 14px;
  color: var(--console-text-secondary);
  flex: 1;
  min-width: 0;
}

.sys-info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--console-text);
  font-variant-numeric: tabular-nums;
}

.sys-info-value--success {
  color: #52c41a;
}

.sys-info-divider {
  height: 1px;
  background: var(--console-border);
  margin: 8px 0;
}

.sys-info-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: var(--console-text-secondary);
  padding: 10px 0 4px;
  font-variant-numeric: tabular-nums;
}

/* 操作按钮 */
.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn--reset {
  border-color: var(--console-border);
  color: var(--console-text-secondary);
  background: var(--console-surface);
}

.action-btn--reset:hover {
  border-color: var(--console-primary);
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.action-btn--save {
  box-shadow: 0 2px 8px rgba(22, 104, 220, 0.25);
  font-weight: 600;
}

.action-btn--save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 104, 220, 0.35);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .settings-page {
    grid-template-columns: 1fr;
  }

  .settings-aside {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sys-info-panel {
    flex: 1;
    min-width: 240px;
  }

  .settings-actions {
    flex-direction: row;
    flex: 0 0 auto;
  }
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .settings-aside {
    flex-direction: column;
  }

  .settings-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .panel-body {
    padding: 18px 16px;
  }
}
</style>
