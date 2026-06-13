<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">TAXONOMY</p>
        <h2>标签体系</h2>
        <p>维护知识主题、技术栈和内容标签，支持文章聚合与搜索筛选。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadTags">刷新</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card :title="editingId ? '编辑标签' : '新增标签'" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-form layout="vertical" :model="form" @finish="handleSubmit">
            <a-form-item label="标签名称" name="name" :rules="[{ required: true, message: '请输入标签名称' }]">
              <a-input v-model:value.trim="form.name" placeholder="例如 Express" />
            </a-form-item>
            <a-form-item label="Slug" name="slug" :rules="[{ required: true, message: '请输入 slug' }]">
              <a-input v-model:value.trim="form.slug" placeholder="例如 express" />
            </a-form-item>
            <a-form-item label="标签颜色">
              <a-input v-model:value.trim="form.color" placeholder="#1677ff" />
            </a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">{{ editingId ? '保存修改' : '新增标签' }}</a-button>
              <a-button v-if="editingId" @click="cancelEdit">取消编辑</a-button>
            </a-space>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="16">
        <a-card class="enterprise-table-card" title="标签维度" :bordered="false">
          <a-table
            row-key="id"
            :columns="columns"
            :data-source="tags"
            :pagination="{ pageSize: 10, showSizeChanger: false }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <a-tag :color="record.color">{{ record.name }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="startEdit(record)">编辑</a-button>
                  <a-popconfirm title="确定删除此标签？" @confirm="handleDelete(record.id)">
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { createAdminTag, deleteAdminTag, listAdminTags, updateAdminTag } from '@/services/admin'

const tags = ref([])
const errorMessage = ref('')
const editingId = ref(null)
const form = reactive({
  name: '',
  slug: '',
  color: '#1677ff'
})

const columns = [
  { title: '标签', key: 'name', dataIndex: 'name' },
  { title: 'Slug', key: 'slug', dataIndex: 'slug' },
  { title: '文章数', key: 'articleCount', dataIndex: 'articleCount', width: 100 },
  { title: '操作', key: 'action', width: 150 }
]

async function loadTags() {
  tags.value = await listAdminTags()
}

async function handleSubmit() {
  errorMessage.value = ''

  try {
    if (editingId.value) {
      await updateAdminTag(editingId.value, form)
      message.success('标签已更新')
      cancelEdit()
    } else {
      await createAdminTag(form)
      message.success('标签已创建')
      form.name = ''
      form.slug = ''
      form.color = '#1677ff'
    }
    await loadTags()
  } catch (error) {
    errorMessage.value = error.message || '操作失败'
  }
}

function startEdit(record) {
  editingId.value = record.id
  form.name = record.name
  form.slug = record.slug
  form.color = record.color || '#1677ff'
}

function cancelEdit() {
  editingId.value = null
  form.name = ''
  form.slug = ''
  form.color = '#1677ff'
}

async function handleDelete(id) {
  try {
    await deleteAdminTag(id)
    message.success('标签已删除')
    await loadTags()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadTags)
</script>
