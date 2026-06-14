<template>
  <div class="settings-page">
    <!-- 左栏：站点信息 -->
    <div class="settings-panel">
      <div class="panel-header">
        <SettingOutlined />
        <h3>站点信息</h3>
      </div>
      <div class="panel-body">
        <div class="form-item">
          <label>站点标题</label>
          <a-input v-model:value.trim="form.siteTitle" placeholder="显示在浏览器标签页" />
        </div>
        <div class="form-item">
          <label>站点描述</label>
          <a-textarea v-model:value.trim="form.siteDescription" :rows="3" placeholder="用于 SEO" />
        </div>
        <div class="form-item">
          <label>作者名称</label>
          <a-input v-model:value.trim="form.authorName" placeholder="显示在文章页面" />
        </div>
        <div class="form-item">
          <label>系统版本</label>
          <a-input v-model:value.trim="form.systemVersion" placeholder="例如 v1.0.0" />
        </div>
        <div class="form-item">
          <label>默认主题</label>
          <a-radio-group v-model:value="form.defaultTheme">
            <a-radio-button value="light">浅色</a-radio-button>
            <a-radio-button value="dark">暗色</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </div>

    <!-- 右栏 -->
    <div class="settings-right">
      <!-- 系统信息 -->
      <div class="settings-panel">
        <div class="panel-header">
          <InfoCircleOutlined />
          <h3>系统信息</h3>
        </div>
        <div class="panel-body info-body">
          <div class="info-item">
            <span class="info-label">运行环境</span>
            <span class="info-value">Node.js</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据库</span>
            <span class="info-value">MongoDB</span>
          </div>
          <div class="info-item">
            <span class="info-label">服务状态</span>
            <span class="info-value success">运行中</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前时间</span>
            <span class="info-value">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <a-button @click="loadSettings">重置</a-button>
        <a-button type="primary" @click="saveSettings" :loading="saving">保存设置</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { getAdminSettings, updateAdminSettings } from '@/services/admin'
import { setCachedSiteProfile } from '@/utils/siteProfile'

const saving = ref(false)
const currentTime = ref('')

const form = reactive({
  siteTitle: '',
  siteDescription: '',
  authorName: '',
  defaultTheme: 'light',
  systemVersion: ''
})

let timer = null

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

async function loadSettings() {
  try {
    const settings = await getAdminSettings()
    Object.assign(form, settings)
    setCachedSiteProfile(settings)
  } catch (error) {
    message.error('加载失败')
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await updateAdminSettings(form)
    setCachedSiteProfile(form)
    message.success('设置已保存')
  } catch (error) {
    message.error(error.message || '保存失败')
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
  grid-template-columns: 1fr 280px;
  gap: 16px;
  align-items: start;
}

.settings-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
  color: #1677ff;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.panel-body {
  padding: 20px;
}

/* 左侧表单 */
.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

/* 右侧 */
.settings-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 系统信息 */
.info-body {
  padding: 16px 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #8c8c8c;
}

.info-value {
  color: #1a1a1a;
  font-weight: 500;
}

.info-value.success {
  color: #52c41a;
}

/* 操作按钮 */
.action-bar {
  display: flex;
  gap: 10px;
}

.action-bar .ant-btn {
  flex: 1;
}
</style>
