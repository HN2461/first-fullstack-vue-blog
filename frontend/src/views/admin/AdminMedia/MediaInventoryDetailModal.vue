<template>
  <a-modal
    :open="open"
    title="未登记资源详情"
    :footer="null"
    width="760px"
    centered
    :body-style="{ maxHeight: '72vh', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <a-spin :spinning="loading" tip="正在读取资源详情...">
      <div v-if="detail" class="inventory-detail__scroll">
        <div class="inventory-detail">
          <div class="inventory-detail__summary">
            <div>
              <strong>{{ detail.originalName }}</strong>
              <span>{{ detail.relativePath }}</span>
            </div>
            <a-tag :bordered="false" :color="getSourceColor(detail.source?.type)">
              {{ detail.source?.label || '其他上传目录' }}
            </a-tag>
          </div>

          <a-descriptions class="inventory-detail__facts" size="small" :column="1" bordered>
            <a-descriptions-item label="资源路径">{{ detail.relativePath }}</a-descriptions-item>
            <a-descriptions-item label="资源类型">{{ getFileClassLabel(detail.fileClass) }}</a-descriptions-item>
            <a-descriptions-item label="文件格式">{{ detail.mimeType || '-' }}</a-descriptions-item>
            <a-descriptions-item label="文件大小">{{ formatFileSize(detail.size) }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ formatDate(detail.mtime) }}</a-descriptions-item>
            <a-descriptions-item label="来源说明">{{ detail.source?.description || '-' }}</a-descriptions-item>
            <a-descriptions-item label="登记状态">{{ getRegistrationStatus(detail) }}</a-descriptions-item>
            <a-descriptions-item v-if="detail.suspectedTestReason" label="测试标记">
              {{ detail.suspectedTestReason }}
            </a-descriptions-item>
          </a-descriptions>

          <section class="inventory-detail__references">
            <div class="inventory-detail__section-title">
              <span>业务引用</span>
              <a-tag :bordered="false" :color="detail.usage?.referenceCount > 0 ? 'green' : 'default'">
                {{ detail.usage?.referenceCount || 0 }} 处
              </a-tag>
            </div>

            <div v-if="detail.references?.length" class="inventory-detail__reference-list">
              <article
                v-for="item in detail.references"
                :key="`${item.type}-${item.ownerId}-${item.ownerTitle}`"
                class="inventory-detail__reference-item"
              >
                <a-tag :bordered="false" color="blue">{{ item.typeLabel }}</a-tag>
                <div>
                  <strong>{{ item.ownerTitle || '未命名对象' }}</strong>
                  <span>{{ item.ownerSubtitle || '无补充信息' }}</span>
                </div>
              </article>
            </div>
            <a-empty v-else description="当前没有扫描到业务引用" :image-style="{ height: '48px' }" />
          </section>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getUnregisteredAdminMediaDetail } from '@/services/admin'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['update:open'])
const loading = ref(false)
const detail = ref(null)

watch(
  () => [props.open, props.record?.relativePath],
  async ([visible, relativePath]) => {
    if (!visible || !relativePath) {
      detail.value = null
      return
    }

    loading.value = true
    try {
      detail.value = await getUnregisteredAdminMediaDetail(relativePath)
    } catch (error) {
      detail.value = null
      message.error(error.message || '未登记资源详情加载失败')
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

function getFileClassLabel(value) {
  return ({
    image: '图片',
    code: '代码',
    document: '文档',
    archive: '压缩包',
    other: '其他'
  })[value] || '其他'
}

function getRegistrationStatus(record) {
  if (record.source?.registerable === false) {
    return record.source?.protectedReason || '该业务专用资源不可登记为普通媒体资产'
  }
  if (record.usage?.referenceCount > 0) {
    return '可以登记；登记不会改变现有文件或业务引用'
  }
  return '可以登记到媒体资产库统一管理'
}

function getSourceColor(value) {
  return ({
    avatar: 'purple',
    resume: 'magenta',
    discussion: 'cyan',
    articleSnapshot: 'gold',
    media: 'blue',
    test: 'red',
    upload: 'default'
  })[value] || 'default'
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${size} B`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}
</script>

<style scoped>
.inventory-detail {
  display: grid;
  gap: 14px;
}

.inventory-detail__scroll {
  max-height: min(62vh, 560px);
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: none;
}

.inventory-detail__scroll::-webkit-scrollbar {
  display: none;
}

.inventory-detail__summary,
.inventory-detail__reference-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.inventory-detail__summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: var(--bg-secondary);
}

.inventory-detail__summary > div,
.inventory-detail__reference-item > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.inventory-detail__summary strong,
.inventory-detail__reference-item strong,
.inventory-detail__section-title {
  color: var(--text-primary);
  font-weight: 600;
}

.inventory-detail__summary span,
.inventory-detail__reference-item span {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.inventory-detail__facts :deep(.ant-descriptions-item-content) {
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.inventory-detail__references {
  display: grid;
  gap: 8px;
}

.inventory-detail__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inventory-detail__reference-list {
  display: grid;
  gap: 8px;
}

.inventory-detail__reference-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-elevated);
}
</style>
