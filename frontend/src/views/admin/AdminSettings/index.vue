<template>
  <div class="settings-page">
    <div class="settings-workspace">
      <div class="settings-toolbar">
        <div class="system-status" aria-label="系统运行信息">
          <span class="system-status__item system-status__item--online">
            <i class="system-status__dot"></i>
            服务运行中
          </span>
          <span class="system-status__divider"></span>
          <span class="system-status__item">Node.js</span>
          <span class="system-status__item">MongoDB</span>
          <span class="system-status__time">
            <ClockCircleOutlined />
            {{ currentTime }}
          </span>
        </div>
        <div class="settings-actions">
          <a-button :loading="loading" @click="loadSettings">
            <template #icon><UndoOutlined /></template>
            重置
          </a-button>
          <a-button type="primary" :loading="saving" :disabled="loading" @click="saveSettings">
            <template #icon><SaveOutlined /></template>
            保存设置
          </a-button>
        </div>
      </div>

      <div v-if="loadError" class="settings-alert settings-alert--error">
        <ExclamationCircleOutlined />
        <span>{{ loadError }}</span>
        <a-button type="link" size="small" @click="loadSettings">重新加载</a-button>
      </div>
      <div v-else-if="saving" class="settings-alert settings-alert--saving">
        <LoadingOutlined spin />
        <span>正在保存设置...</span>
      </div>

      <a-tabs v-model:active-key="activeSection" class="settings-tabs">
        <a-tab-pane key="site" tab="基础信息">
          <section class="settings-section">
            <div class="settings-section__header">
              <h3>基础信息</h3>
              <span>站点身份、公开描述和版本信息</span>
            </div>
            <a-form layout="vertical" class="settings-form">
              <div class="form-item">
                <div class="field-header">
                  <label for="siteTitle">站点标题</label>
                  <a-tooltip :title="settingHelp.siteTitle">
                    <QuestionCircleOutlined class="field-help" />
                  </a-tooltip>
                </div>
                <a-input
                  id="siteTitle"
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
                <div class="field-header">
                  <label for="siteDescription">站点描述</label>
                  <a-tooltip :title="settingHelp.siteDescription">
                    <QuestionCircleOutlined class="field-help" />
                  </a-tooltip>
                </div>
                <a-textarea
                  id="siteDescription"
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
                  <div class="field-header">
                    <label for="authorName">作者名称</label>
                    <a-tooltip :title="settingHelp.authorName">
                      <QuestionCircleOutlined class="field-help" />
                    </a-tooltip>
                  </div>
                  <a-input
                    id="authorName"
                    v-model:value.trim="form.authorName"
                    placeholder="显示在文章页面"
                    :maxlength="32"
                  >
                    <template #prefix><UserOutlined /></template>
                  </a-input>
                </div>
                <div class="form-item form-item--half">
                  <div class="field-header">
                    <label for="systemVersion">系统版本</label>
                    <a-tooltip :title="settingHelp.systemVersion">
                      <QuestionCircleOutlined class="field-help" />
                    </a-tooltip>
                  </div>
                  <a-input
                    id="systemVersion"
                    v-model:value.trim="form.systemVersion"
                    placeholder="例如 v1.0.0"
                    :maxlength="20"
                  >
                    <template #prefix><TagOutlined /></template>
                  </a-input>
                </div>
              </div>
            </a-form>
          </section>
        </a-tab-pane>

        <a-tab-pane key="experience" tab="外观与体验">
          <section class="settings-section">
            <div class="settings-section__header">
              <h3>外观与体验</h3>
              <span>统一新访客主题、评论入口和网站欢迎效果</span>
            </div>
            <a-form layout="vertical" class="settings-form">
              <div class="form-row form-row--preferences">
                <div class="form-item form-item--half">
                  <div class="field-header">
                    <label>默认主题</label>
                    <a-tooltip :title="settingHelp.defaultTheme">
                      <QuestionCircleOutlined class="field-help" />
                    </a-tooltip>
                  </div>
                  <a-radio-group v-model:value="form.defaultTheme" class="theme-switcher">
                    <a-radio-button value="light" class="theme-opt theme-opt--light">
                      <Sun :size="16" /> 浅色
                    </a-radio-button>
                    <a-radio-button value="dark" class="theme-opt theme-opt--dark">
                      <Moon :size="16" /> 深色
                    </a-radio-button>
                  </a-radio-group>
                  <span class="form-hint">用于访客和选择“跟随站点默认”的用户</span>
                </div>

                <div class="form-item form-item--half">
                  <div class="field-header">
                    <label>评论功能</label>
                    <a-tooltip :title="settingHelp.commentEnabled">
                      <QuestionCircleOutlined class="field-help" />
                    </a-tooltip>
                  </div>
                  <div class="toggle-field">
                    <div class="toggle-field__copy">
                      <strong>允许登录用户发表评论</strong>
                      <span>关闭后保留历史评论，仅停止新增评论。</span>
                    </div>
                    <a-switch v-model:checked="form.commentEnabled" />
                  </div>
                </div>
              </div>

              <div class="section-divider"></div>
              <SiteEntranceEffectSettings v-model:value="form.siteEntranceEffect" />
            </a-form>
          </section>
        </a-tab-pane>

        <a-tab-pane key="recovery" tab="账号服务">
          <section class="settings-section">
            <div class="settings-section__header">
              <h3>账号服务</h3>
              <span>配置登录页展示的人工找回渠道</span>
            </div>
            <AccountRecoverySettings v-model:value="form.accountRecovery" />
          </section>
        </a-tab-pane>

        <a-tab-pane key="calendar" tab="日历数据">
          <section class="settings-section settings-section--calendar">
            <FestivalSettings />
          </section>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  ExclamationCircleOutlined,
  LoadingOutlined,
  FontColorsOutlined,
  UserOutlined,
  TagOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  UndoOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { Sun, Moon } from 'lucide-vue-next'
import { getAdminSettings, updateAdminSettings } from '@/services/admin'
import { setCachedSiteProfile } from '@/utils/siteProfile'
import { useAdminActions, useUnsavedChanges } from '@/composables/useAdminUi'
import { useSiteStore } from '@/stores/site'
import SiteEntranceEffectSettings from './components/SiteEntranceEffectSettings.vue'
import FestivalSettings from './components/FestivalSettings.vue'
import AccountRecoverySettings from './components/AccountRecoverySettings.vue'
import {
  DEFAULT_SITE_ENTRANCE_EFFECT,
  normalizeSiteEntranceEffectConfig
} from '@/utils/entranceEffects/siteEntranceEffect'

const defaultForm = {
  siteTitle: '',
  siteDescription: '',
  authorName: '',
  commentEnabled: true,
  defaultTheme: 'light',
  systemVersion: '',
  accountRecovery: {
    enabled: true,
    instructions: '请通过下方联系方式与管理员核验身份，核验通过后管理员会发送一次性密码重置链接。',
    contactHours: '',
    qq: { enabled: false, account: '', allowLaunch: true, qrCode: { mediaId: '', url: '', name: '' } },
    wechat: { enabled: false, account: '', qrCode: { mediaId: '', url: '', name: '' } },
    email: { enabled: false, address: '' }
  },
  siteEntranceEffect: { ...DEFAULT_SITE_ENTRANCE_EFFECT }
}

const settingHelp = {
  siteTitle: '站点标题会同步到公开站点页眉、浏览器标题和 SEO 标题，用于让访客快速识别站点身份。',
  siteDescription: '站点描述用于首页简介、搜索引擎摘要和社交分享预览，建议写成一句完整说明。',
  authorName: '作者名称会展示在文章页、站点品牌区和公开入口中，代表站点内容的署名主体。',
  commentEnabled: '关闭后会统一禁止新增评论，前台提交入口将直接返回“评论功能已关闭”。',
  defaultTheme: '默认主题决定新访客首次进入站点时采用的浅色或暗色外观。',
  systemVersion: '系统版本用于后台信息展示和后续运维排查，建议与当前发布版本保持一致。'
}

function normalizeSettings(settings = {}) {
  return {
    ...defaultForm,
    ...settings,
    commentEnabled: settings.commentEnabled !== false,
    accountRecovery: {
      ...defaultForm.accountRecovery,
      ...(settings.accountRecovery || {}),
      qq: { ...defaultForm.accountRecovery.qq, ...(settings.accountRecovery?.qq || {}), qrCode: { ...defaultForm.accountRecovery.qq.qrCode, ...(settings.accountRecovery?.qq?.qrCode || {}) } },
      wechat: { ...defaultForm.accountRecovery.wechat, ...(settings.accountRecovery?.wechat || {}), qrCode: { ...defaultForm.accountRecovery.wechat.qrCode, ...(settings.accountRecovery?.wechat?.qrCode || {}) } },
      email: { ...defaultForm.accountRecovery.email, ...(settings.accountRecovery?.email || {}) }
    },
    siteEntranceEffect: normalizeSiteEntranceEffectConfig(settings.siteEntranceEffect)
  }
}

const saving = ref(false)
const loading = ref(false)
const activeSection = ref('site')
const currentTime = ref('')
const loadError = ref('')
const { runAction, toMessage } = useAdminActions()
const siteStore = useSiteStore()

const form = reactive(normalizeSettings())
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
    Object.assign(form, normalizeSettings(settings))
    setCachedSiteProfile({ ...form })
    siteStore.setProfile({ ...form })
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
    const payload = normalizeSettings(form)
    await runAction(() => updateAdminSettings(payload), {
      successMessage: '设置已保存',
      errorMessage: '保存失败'
    })
    Object.assign(form, payload)
    setCachedSiteProfile(payload)
    siteStore.setProfile(payload)
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
  width: 100%;
  min-width: 0;
}

.settings-workspace {
  width: 100%;
  min-width: 0;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  overflow: hidden;
}

.settings-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 62px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.system-status,
.system-status__item,
.system-status__time {
  display: flex;
  align-items: center;
}

.system-status {
  min-width: 0;
  gap: 14px;
  color: var(--console-text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.system-status__item,
.system-status__time {
  gap: 7px;
}

.system-status__item--online {
  color: var(--console-text);
  font-weight: 600;
}

.system-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 3px color-mix(in srgb, #52c41a 16%, transparent);
}

.system-status__divider {
  width: 1px;
  height: 16px;
  background: var(--console-border);
}

.system-status__time {
  font-variant-numeric: tabular-nums;
}

.settings-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.settings-actions :deep(.ant-btn) {
  min-width: 92px;
  height: 36px;
  border-radius: 6px;
}

.settings-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--console-border);
  font-size: 13px;
  line-height: 1.6;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
}

.settings-alert > span {
  min-width: 0;
  flex: 1;
}

.settings-alert--error {
  color: #ff7875;
  background: color-mix(in srgb, #ff4d4f 12%, var(--console-surface));
}

.settings-alert--saving {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.settings-tabs :deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 24px;
  background: var(--console-surface);
}

.settings-tabs :deep(.ant-tabs-tab) {
  min-height: 52px;
  padding: 14px 4px;
}

.settings-tabs :deep(.ant-tabs-content-holder) {
  min-width: 0;
}

.settings-section {
  width: 100%;
  max-width: 980px;
  min-height: 440px;
  padding: 26px 28px 34px;
}

.settings-section__header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--console-border);
}

.settings-section__header h3 {
  margin: 0;
  color: var(--console-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.settings-section__header span {
  display: block;
  margin-top: 3px;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.settings-section--calendar {
  padding-top: 4px;
}

.settings-form {
  max-width: 100%;
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.field-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--console-text);
  letter-spacing: 0;
}

.field-help {
  margin-top: 1px;
  color: var(--console-text-secondary);
  font-size: 14px;
  cursor: help;
  transition: color 0.2s;
}

.field-help:hover {
  color: var(--console-primary-strong);
}

.form-item > :deep(.ant-input),
.form-item > :deep(.ant-input-affix-wrapper),
.form-item > :deep(.ant-input-textarea) {
  border-radius: 8px;
  transition: all 0.2s;
}

.form-item > :deep(.ant-input):hover,
.form-item > :deep(.ant-input-affix-wrapper:hover),
.form-item > :deep(.ant-input-textarea:hover) {
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

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.form-item--half {
  margin-bottom: 0;
}

.form-row--preferences {
  align-items: stretch;
  margin-bottom: 24px;
}

.form-row--preferences .form-item {
  min-width: 0;
}

.section-divider {
  height: 1px;
  margin: 0 0 24px;
  background: var(--console-border);
}

.theme-switcher {
  display: flex;
  width: 100%;
  gap: 8px;
}

.theme-opt {
  flex: 1;
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

.theme-switcher .ant-radio-button-wrapper {
  border: 1px solid var(--console-border) !important;
  background: var(--console-surface);
}

.theme-switcher .ant-radio-button-wrapper:not(:first-child)::before {
  display: none !important;
}

.theme-switcher .ant-radio-button-wrapper-checked {
  border-color: var(--console-primary) !important;
  background: var(--console-primary-soft);
  box-shadow: none !important;
}

.theme-opt--light {
  color: #d48806;
}

.theme-opt--dark {
  color: #597ef7;
}

.toggle-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 48px;
  padding: 14px 16px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.toggle-field__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.toggle-field__copy strong {
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.toggle-field__copy span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .system-status__divider,
  .system-status__item:not(.system-status__item--online) {
    display: none;
  }
}

@media (max-width: 640px) {
  .settings-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
  }

  .system-status {
    justify-content: space-between;
  }

  .settings-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-actions :deep(.ant-btn) {
    width: 100%;
  }

  .settings-tabs :deep(.ant-tabs-nav) {
    padding: 0 16px;
  }

  .settings-tabs :deep(.ant-tabs-nav-wrap) {
    overflow-x: auto;
  }

  .settings-section {
    min-height: 360px;
    padding: 22px 16px 28px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row--preferences {
    gap: 24px;
  }

  .theme-opt {
    padding: 0 12px;
  }

  .system-status__time {
    font-size: 12px;
  }
}
</style>
