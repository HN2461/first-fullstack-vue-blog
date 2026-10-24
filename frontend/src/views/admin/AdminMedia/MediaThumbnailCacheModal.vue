<template>
  <a-modal
    :open="open"
    title="图片预览小图缓存"
    :footer="null"
    width="min(920px, calc(100vw - 32px))"
    wrap-class-name="media-thumbnail-cache-modal-wrap"
    :body-style="{ height: 'min(74vh, 720px)', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <div class="thumbnail-cache">
      <p class="thumbnail-cache__lead">
        这里只管理图片预览用的小图，不会删除原始图片、其他文件或媒体库记录。清理后再次显示图片时，小图会按需重新生成。
      </p>

      <div class="thumbnail-cache__stats" aria-label="图片预览小图占用情况">
        <div><span>预览小图</span><strong>{{ overview?.thumbnailCount ?? 0 }} 张 · {{ formatFileSize(overview?.thumbnailBytes) }}</strong></div>
        <div><span>孤儿小图</span><strong>{{ overview?.orphanCount ?? 0 }} 张 · {{ formatFileSize(overview?.orphanBytes) }}</strong></div>
        <div><span>回收站资源</span><strong>{{ overview?.trashCount ?? 0 }} 张 · {{ formatFileSize(overview?.trashBytes) }}</strong></div>
        <div><span>生成临时文件</span><strong>{{ overview?.temporaryCount ?? 0 }} 个 · {{ formatFileSize(overview?.temporaryBytes) }}</strong></div>
      </div>

      <div class="thumbnail-cache__actions">
        <span class="thumbnail-cache__hint">
        孤儿小图找不到可用的原始图片（记录不存在或原图文件缺失）；清理时也会删除超过 24 小时的生成残留。
        </span>
        <div class="thumbnail-cache__buttons">
          <a-tooltip title="刷新缓存清单和占用统计">
            <a-button aria-label="刷新缩略图缓存清单" :disabled="Boolean(cleaningScope)" @click="refreshCache">
              <template #icon><ReloadOutlined /></template>
            </a-button>
          </a-tooltip>
          <a-popconfirm
            title="只删除没有可用原图的小图和超过 24 小时的生成残留。"
            ok-text="清理孤儿小图"
            cancel-text="取消"
            :disabled="!canCleanOrphans || Boolean(cleaningScope)"
            @confirm="clearCache('orphans')"
          >
            <a-button :disabled="!canCleanOrphans || Boolean(cleaningScope)" :loading="cleaningScope === 'orphans'">
              清理孤儿小图
            </a-button>
          </a-popconfirm>
          <a-popconfirm
            title="会删除所有预览小图和缓存临时文件，不会删除原图；以后显示图片时再重新生成。"
            ok-text="清理全部小图"
            cancel-text="取消"
            :disabled="!overview?.thumbnailCount || Boolean(cleaningScope)"
            @confirm="clearCache('all')"
          >
            <a-button danger :disabled="!overview?.thumbnailCount || Boolean(cleaningScope)" :loading="cleaningScope === 'all'">
              <template #icon><DeleteOutlined /></template>
              清理全部小图
            </a-button>
          </a-popconfirm>
        </div>
      </div>

      <BlogTable
        v-if="props.open"
        ref="tableRef"
        class="thumbnail-cache__table"
        :api-fn="loadCacheEntries"
        :columns="columns"
        :page-size="12"
        :page-sizes="['12', '24', '48']"
        :scroll="{ x: 880 }"
        height="350px"
        row-key="id"
        empty-text="还没有生成图片预览小图"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cacheSize'">
            {{ formatFileSize(record.cacheSize) }}
          </template>
          <template v-else-if="column.key === 'originalSize'">
            {{ formatFileSize(record.originalSize) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :bordered="false" :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ formatDate(record.updatedAt) }}
          </template>
        </template>
      </BlogTable>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { clearAdminMediaThumbnailCache, getAdminMediaThumbnailCache } from '@/services/admin'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'changed'])
const tableRef = ref(null)
const overview = ref(null)
const cleaningScope = ref('')
const columns = [
  { title: '图片资源', dataIndex: 'originalName', key: 'originalName', width: 290, ellipsis: true },
  { title: '原文件大小', dataIndex: 'originalSize', key: 'originalSize', width: 120 },
  { title: '小图占用', dataIndex: 'cacheSize', key: 'cacheSize', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 130 },
  { title: '生成时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 190 }
]

const canCleanOrphans = computed(() => Boolean(overview.value?.orphanCount || overview.value?.staleTemporaryCount))

async function loadCacheEntries(params) {
  const result = await getAdminMediaThumbnailCache(params)
  overview.value = result
  return result
}

function refreshCache() {
  tableRef.value?.reload()
}

async function clearCache(scope) {
  if (cleaningScope.value) return
  cleaningScope.value = scope
  try {
    const result = await clearAdminMediaThumbnailCache(scope)
    const amount = formatFileSize(result.reclaimedBytes)
    message.success(`已清理 ${result.deletedCount} 个缓存文件，释放 ${amount} 磁盘空间；原始资源未变更`)
    await tableRef.value?.reload()
    emit('changed')
  } catch (error) {
    message.error(error?.message || '缩略图缓存清理失败，请刷新后重试')
  } finally {
    cleaningScope.value = ''
  }
}

function formatFileSize(size = 0) {
  const bytes = Number(size) || 0
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN')
}

function statusLabel(status) {
  return ({
    active: '资源正常',
    trash: '资源在回收站',
    orphan: '无对应资源',
    missingSource: '原图文件缺失',
    sourceUnavailable: '无法确认原图',
    temporary: '生成中或未过期',
    staleTemporary: '过期生成残留'
  }[status] || '未知状态')
}

function statusColor(status) {
  return ({ active: 'green', trash: 'orange', orphan: 'red', missingSource: 'red', sourceUnavailable: 'orange', temporary: 'blue', staleTemporary: 'red' }[status] || 'default')
}
</script>

<style>
.media-thumbnail-cache-modal-wrap .ant-modal { top: 28px; max-width: calc(100vw - 32px); padding-bottom: 44px; }
@media (max-width: 600px) {
  .media-thumbnail-cache-modal-wrap .ant-modal { top: 14px; padding-bottom: 28px; }
}
</style>

<style scoped>
.thumbnail-cache {
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.thumbnail-cache__lead,
.thumbnail-cache__hint {
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.thumbnail-cache__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--console-border);
  border-bottom: 1px solid var(--console-border);
}

.thumbnail-cache__stats > div {
  display: grid;
  align-content: center;
  gap: 5px;
  min-height: 64px;
  padding: 8px 12px;
  border-right: 1px solid var(--console-border);
}

.thumbnail-cache__stats > div:last-child { border-right: 0; }
.thumbnail-cache__stats span { color: var(--console-text-secondary); font-size: 12px; }
.thumbnail-cache__stats strong { color: var(--console-text); font-size: 13px; font-weight: 600; }

.thumbnail-cache__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.thumbnail-cache__hint { flex: 1; min-width: 0; }
.thumbnail-cache__buttons { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.thumbnail-cache__table { min-height: 0; }

@media (max-width: 700px) {
  .thumbnail-cache__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .thumbnail-cache__stats > div:nth-child(2) { border-right: 0; }
  .thumbnail-cache__stats > div:nth-child(-n + 2) { border-bottom: 1px solid var(--console-border); }
  .thumbnail-cache__actions { align-items: stretch; flex-direction: column; }
  .thumbnail-cache__buttons { justify-content: flex-end; flex-wrap: wrap; }
}
</style>
