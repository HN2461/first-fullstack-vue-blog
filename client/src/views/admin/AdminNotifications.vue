<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">OPERATIONS</p>
        <h2>公告管理</h2>
        <p>维护站内公告和运营通知，保持门户信息同步更新。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadAnnouncements">刷新</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="9">
        <a-card title="发布公告" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-form layout="vertical" :model="form" @finish="createAnnouncement">
            <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入公告标题' }]">
              <a-input v-model:value.trim="form.title" />
            </a-form-item>
            <a-form-item label="内容" name="content" :rules="[{ required: true, message: '请输入公告内容' }]">
              <a-textarea v-model:value.trim="form.content" :rows="5" />
            </a-form-item>
            <a-form-item label="链接">
              <a-input v-model:value.trim="form.link" placeholder="可选" />
            </a-form-item>
            <a-button block type="primary" html-type="submit">发布公告</a-button>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="15">
        <a-card class="enterprise-table-card" title="公告列表" :bordered="false">
          <a-list :data-source="announcements" item-layout="vertical">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.level || 'info'" />
                <p>{{ item.content }}</p>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-if="announcements.length === 0" description="暂无公告" />
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createAdminAnnouncement, listAdminAnnouncements } from '@/services/admin'

const announcements = ref([])
const errorMessage = ref('')
const form = reactive({
  title: '',
  content: '',
  link: ''
})

async function loadAnnouncements() {
  announcements.value = await listAdminAnnouncements()
}

async function createAnnouncement() {
  errorMessage.value = ''
  try {
    await createAdminAnnouncement(form)
    form.title = ''
    form.content = ''
    form.link = ''
    await loadAnnouncements()
  } catch (error) {
    errorMessage.value = error.message || '公告创建失败'
  }
}

onMounted(loadAnnouncements)
</script>
