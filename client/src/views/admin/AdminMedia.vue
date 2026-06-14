<template>
  <section class="enterprise-page">
    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">ASSETS</p>
        <h2>媒体资产</h2>
        <p>统一上传和管理文章配图、附件和资料文件，当前存储到本地 uploads 目录。</p>
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
          <BlogTable
            ref="tableRef"
            :api-fn="loadMedia"
            :columns="columns"
            :auto-load="true"
            :page-size="10"
            :page-sizes="['10', '20', '50']"
            :bare="true"
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
                <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
              </template>
            </template>
          </BlogTable>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { deleteAdminMedia, listAdminMedia, uploadAdminMedia } from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const tableRef = ref(null)
const file = ref(null)
const errorMessage = ref('')
const uploading = ref(false)
const actionLoadingKey = ref('')
const { runAction, confirmAction } = useAdminActions()

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

// 作为 apiFn 传给 BlogTable（返回数组，前端分页）
async function loadMedia(params) {
  return await listAdminMedia(params)
}

async function uploadFile() {
  if (!file.value) return
  errorMessage.value = ''
  uploading.value = true
  try {
    await runAction(() => uploadAdminMedia(file.value), {
      successMessage: '上传成功',
      errorMessage: '上传失败'
    })
    file.value = null
    tableRef.value?.refresh()
  } catch (error) {
    errorMessage.value = error.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

function handleDelete(record) {
  confirmAction({
    title: '确定删除此文件？',
    content: `文件「${record.originalName}」删除后将无法继续在文章或公告中引用。`,
    okText: '确认删除',
    okType: 'danger',
    async onOk() {
      actionLoadingKey.value = `delete:${record.id}`
      try {
        await runAction(() => deleteAdminMedia(record.id), {
          successMessage: '文件已删除',
          errorMessage: '删除失败',
          onSuccess: () => tableRef.value?.refresh()
        })
      } finally {
        actionLoadingKey.value = ''
      }
    }
  }).catch(() => {})
}
</script>

<style scoped>
.enterprise-page-header {
  margin-bottom: 16px;
}

.enterprise-page-kicker {
  font-size: 11px;
  letter-spacing: 2px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.enterprise-page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.enterprise-page-header p {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
}

.upload-button {
  margin-top: 16px;
}
</style>
