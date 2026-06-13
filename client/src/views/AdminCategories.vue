<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">TAXONOMY</p>
        <h2>分类体系</h2>
        <p>维护知识库一级目录，用于文章归档、门户筛选和后续知识导航结构扩展。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadCategories">刷新</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="新增分类" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-form layout="vertical" :model="form" @finish="createCategory">
            <a-form-item label="分类名称" name="name" :rules="[{ required: true, message: '请输入分类名称' }]">
              <a-input v-model:value.trim="form.name" placeholder="例如 Node.js" />
            </a-form-item>
            <a-form-item label="Slug" name="slug" :rules="[{ required: true, message: '请输入 slug' }]">
              <a-input v-model:value.trim="form.slug" placeholder="例如 node-js" />
            </a-form-item>
            <a-button block type="primary" html-type="submit">新增分类</a-button>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="16">
        <a-card class="enterprise-table-card" title="知识目录" :bordered="false">
          <a-table
            row-key="id"
            :columns="columns"
            :data-source="categories"
            :pagination="{ pageSize: 10, showSizeChanger: false }"
          />
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createAdminCategory, listAdminCategories } from '@/services/admin'

const categories = ref([])
const errorMessage = ref('')
const form = reactive({
  name: '',
  slug: ''
})
const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name' },
  { title: 'Slug', dataIndex: 'slug', key: 'slug' },
  { title: '文章数', dataIndex: 'articleCount', key: 'articleCount', width: 100 }
]

async function loadCategories() {
  categories.value = await listAdminCategories()
}

async function createCategory() {
  errorMessage.value = ''

  try {
    await createAdminCategory(form)
    form.name = ''
    form.slug = ''
    await loadCategories()
  } catch (error) {
    errorMessage.value = error.message || '分类创建失败'
  }
}

onMounted(loadCategories)
</script>
