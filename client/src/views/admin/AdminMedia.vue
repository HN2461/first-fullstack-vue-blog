<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">ASSETS</p>
        <h2>媒体资产</h2>
        <p>统一上传和管理文章配图、附件和资料文件，当前存储到本地 uploads 目录。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="loadMedia">刷新</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="上传素材" :bordered="false">
          <a-alert v-if="errorMessage" class="form-alert" type="error" show-icon :message="errorMessage" />
          <a-upload-dragger
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/*,.pdf,.txt,.md,.zip"
          >
            <p class="ant-upload-drag-icon"><InboxOutlined /></p>
            <p class="ant-upload-text">点击或拖拽文件到此区域</p>
            <p class="ant-upload-hint">当前版本使用本地 uploads 目录保存文件。</p>
          </a-upload-dragger>
          <a-button block type="primary" class="upload-button" :disabled="!file" @click="uploadFile">
            {{ file ? `上传：${file.name}` : '选择文件后上传' }}
          </a-button>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="16">
        <a-card class="enterprise-table-card" title="媒体资产列表" :bordered="false">
          <a-table
            row-key="id"
            :columns="columns"
            :data-source="media"
            :pagination="{ pageSize: 10, showSizeChanger: false }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'kind'">
                <a-tag :color="record.kind === 'image' ? 'blue' : 'default'">{{ record.kind }}</a-tag>
              </template>
              <template v-else-if="column.key === 'size'">
                {{ Math.ceil(record.size / 1024) }} KB
              </template>
              <template v-else-if="column.key === 'url'">
                <a-typography-text copyable>{{ record.url }}</a-typography-text>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-popconfirm title="确定删除此文件？" @confirm="handleDelete(record.id)">
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { deleteAdminMedia, listAdminMedia, uploadAdminMedia } from '@/services/admin'

const file = ref(null)
const media = ref([])
const errorMessage = ref('')
const columns = [
  { title: '文件名', dataIndex: 'originalName', key: 'originalName' },
  { title: '类型', key: 'kind', width: 110 },
  { title: '大小', key: 'size', width: 110 },
  { title: '访问地址', key: 'url' },
  { title: '操作', key: 'action', width: 80 }
]

function beforeUpload(nextFile) {
  file.value = nextFile
  return false
}

async function loadMedia() {
  media.value = await listAdminMedia()
}

async function uploadFile() {
  if (!file.value) return
  errorMessage.value = ''
  try {
    await uploadAdminMedia(file.value)
    file.value = null
    await loadMedia()
  } catch (error) {
    errorMessage.value = error.message || '上传失败'
  }
}

async function handleDelete(id) {
  try {
    await deleteAdminMedia(id)
    message.success('文件已删除')
    await loadMedia()
  } catch (error) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadMedia)
</script>
