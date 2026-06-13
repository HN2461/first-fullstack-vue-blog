<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">SYSTEM</p>
        <h2>系统设置</h2>
        <p>维护门户基础信息、作者展示和默认主题等站点级配置。</p>
      </div>
    </div>

    <a-card title="站点信息" :bordered="false">
      <a-alert v-if="message" class="form-alert" type="success" show-icon :message="message" />
      <a-form class="settings-form" layout="vertical" :model="form" @finish="saveSettings">
        <a-form-item label="站点标题">
          <a-input v-model:value.trim="form.siteTitle" />
        </a-form-item>
        <a-form-item label="站点描述">
          <a-textarea v-model:value.trim="form.siteDescription" :rows="4" />
        </a-form-item>
        <a-form-item label="作者名称">
          <a-input v-model:value.trim="form.authorName" />
        </a-form-item>
        <a-form-item label="默认主题">
          <a-radio-group v-model:value="form.defaultTheme">
            <a-radio-button value="light">浅色</a-radio-button>
            <a-radio-button value="dark">暗色</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="系统版本">
          <a-input v-model:value.trim="form.systemVersion" placeholder="例如 v1.0.0" />
        </a-form-item>
        <a-button type="primary" html-type="submit">保存设置</a-button>
      </a-form>
    </a-card>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminSettings, updateAdminSettings } from '@/services/admin'

const message = ref('')
const form = reactive({
  siteTitle: '',
  siteDescription: '',
  authorName: '',
  defaultTheme: 'light',
  systemVersion: ''
})

onMounted(async () => {
  Object.assign(form, await getAdminSettings())
})

async function saveSettings() {
  await updateAdminSettings(form)
  message.value = '设置已保存'
}
</script>
