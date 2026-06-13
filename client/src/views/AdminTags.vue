<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">TAXONOMY</p>
        <h2>标签体系</h2>
        <p>维护知识主题、技术栈和内容标签，支持文章聚合、搜索筛选和后续推荐能力。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadTags">刷新</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="新增标签" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-form layout="vertical" :model="form" @finish="createTag">
            <a-form-item label="标签名称" name="name" :rules="[{ required: true, message: '请输入标签名称' }]">
              <a-input v-model:value.trim="form.name" placeholder="例如 Express" />
            </a-form-item>
            <a-form-item label="Slug" name="slug" :rules="[{ required: true, message: '请输入 slug' }]">
              <a-input v-model:value.trim="form.slug" placeholder="例如 express" />
            </a-form-item>
            <a-form-item label="标签颜色">
              <a-input v-model:value.trim="form.color" placeholder="#1677ff" />
            </a-form-item>
            <a-button block type="primary" html-type="submit">新增标签</a-button>
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
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createAdminTag, listAdminTags } from '@/services/admin'

const tags = ref([])
const errorMessage = ref('')
const form = reactive({
  name: '',
  slug: '',
  color: '#1677ff'
})
const columns = [
  { title: '标签', key: 'name', dataIndex: 'name' },
  { title: 'Slug', key: 'slug', dataIndex: 'slug' },
  { title: '文章数', key: 'articleCount', dataIndex: 'articleCount', width: 100 }
]

async function loadTags() {
  tags.value = await listAdminTags()
}

async function createTag() {
  errorMessage.value = ''

  try {
    await createAdminTag(form)
    form.name = ''
    form.slug = ''
    form.color = '#1677ff'
    await loadTags()
  } catch (error) {
    errorMessage.value = error.message || '标签创建失败'
  }
}

onMounted(loadTags)
</script>
