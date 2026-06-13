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
        <a-card :title="editingId ? '编辑公告' : '发布公告'" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-form layout="vertical" :model="form" @finish="handleSubmit">
            <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入公告标题' }]">
              <a-input v-model:value.trim="form.title" />
            </a-form-item>
            <a-form-item label="级别" name="level">
              <a-select v-model:value="form.level">
                <a-select-option value="info">普通</a-select-option>
                <a-select-option value="success">成功</a-select-option>
                <a-select-option value="warning">警告</a-select-option>
                <a-select-option value="error">紧急</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="内容" name="content" :rules="[{ required: true, message: '请输入公告内容' }]">
              <a-textarea v-model:value.trim="form.content" :rows="5" />
            </a-form-item>
            <a-form-item label="链接">
              <a-input v-model:value.trim="form.link" placeholder="可选" />
            </a-form-item>
            <a-form-item label="状态">
              <a-switch v-model:checked="form.isActive" checked-children="启用" un-checked-children="禁用" />
            </a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">{{ editingId ? '保存修改' : '发布公告' }}</a-button>
              <a-button v-if="editingId" @click="cancelEdit">取消编辑</a-button>
            </a-space>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="15">
        <a-card class="enterprise-table-card" title="公告列表" :bordered="false">
          <a-list :data-source="announcements" item-layout="vertical">
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a-space>
                    <a-button type="link" size="small" @click="startEdit(item)">编辑</a-button>
                    <a-popconfirm title="确定删除此公告？" @confirm="handleDelete(item.id)">
                      <a-button type="link" size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
                <a-list-item-meta>
                  <template #title>
                    <a-space>
                      <span>{{ item.title }}</span>
                      <a-tag :color="getLevelColor(item.level)">{{ getLevelText(item.level) }}</a-tag>
                      <a-tag v-if="!item.isActive" color="default">已禁用</a-tag>
                    </a-space>
                  </template>
                  <template #description>
                    <span>{{ formatDate(item.createdAt) }}</span>
                  </template>
                </a-list-item-meta>
                <p>{{ item.content }}</p>
                <p v-if="item.link">
                  <a :href="item.link" target="_blank">{{ item.link }}</a>
                </p>
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
import { message } from 'ant-design-vue'
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement
} from '@/services/admin'

const announcements = ref([])
const errorMessage = ref('')
const editingId = ref(null)
const form = reactive({
  title: '',
  content: '',
  link: '',
  level: 'info',
  isActive: true
})

const levelColors = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red'
}

const levelTexts = {
  info: '普通',
  success: '成功',
  warning: '警告',
  error: '紧急'
}

function getLevelColor(level) {
  return levelColors[level] || 'blue'
}

function getLevelText(level) {
  return levelTexts[level] || '普通'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function loadAnnouncements() {
  announcements.value = await listAdminAnnouncements()
}

async function handleSubmit() {
  errorMessage.value = ''
  try {
    if (editingId.value) {
      await updateAdminAnnouncement(editingId.value, form)
      message.success('公告已更新')
      cancelEdit()
    } else {
      await createAdminAnnouncement(form)
      message.success('公告已发布')
      form.title = ''
      form.content = ''
      form.link = ''
      form.level = 'info'
      form.isActive = true
    }
    await loadAnnouncements()
  } catch (error) {
    errorMessage.value = error.message || '操作失败'
  }
}

function startEdit(item) {
  editingId.value = item.id
  form.title = item.title
  form.content = item.content
  form.link = item.link || ''
  form.level = item.level || 'info'
  form.isActive = item.isActive !== false
}

function cancelEdit() {
  editingId.value = null
  form.title = ''
  form.content = ''
  form.link = ''
  form.level = 'info'
  form.isActive = true
}

async function handleDelete(id) {
  try {
    await deleteAdminAnnouncement(id)
    message.success('公告已删除')
    await loadAnnouncements()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadAnnouncements)
</script>
