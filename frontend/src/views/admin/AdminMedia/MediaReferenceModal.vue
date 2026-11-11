<template>
  <a-modal
    :open="open"
    title="资源引用详情"
    :footer="null"
    width="760px"
    centered
    :body-style="{ height: 'min(62vh, 560px)', minHeight: '220px', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <div class="media-reference__content">
      <div v-if="loading" class="media-reference__loading">
        <a-spin tip="正在扫描引用..." />
      </div>
      <div v-else-if="loadError" class="media-reference__error">
        <span>{{ loadError }}</span>
        <a-button size="small" @click="loadDetail">重试</a-button>
      </div>
      <div v-else-if="detail" class="media-reference__scroll">
        <div class="media-reference">
          <div class="media-reference__summary">
            <div>
              <strong>{{ detail.media.originalName }}</strong>
              <span>{{ detail.media.url }}</span>
            </div>
            <a-tag :color="detail.summary.referenceCount > 0 ? 'green' : 'orange'" :bordered="false">
              {{ detail.summary.usageStatusLabel }} · {{ detail.summary.referenceCount }} 处
            </a-tag>
          </div>

          <a-descriptions class="media-reference__facts" :column="2" size="small" bordered>
            <a-descriptions-item label="资源分类">{{ detail.media.category || '未分类' }}</a-descriptions-item>
            <a-descriptions-item label="文件大小">{{ formatFileSize(detail.media.size) }}</a-descriptions-item>
            <a-descriptions-item label="资源地址" :span="2">{{ detail.media.url }}</a-descriptions-item>
          </a-descriptions>

          <div class="media-reference__section-heading">
            <div>
              <strong>引用对象</strong>
              <span>登记资源被业务使用的位置</span>
            </div>
            <a-tag :bordered="false" :color="detail.summary.referenceCount > 0 ? 'green' : 'default'">
              {{ detail.summary.referenceCount }} 处
            </a-tag>
          </div>

          <div v-if="detail.references.length === 0" class="media-reference__empty">
            当前没有扫描到业务引用，可结合用途确认后移入回收站。
          </div>

          <div v-else class="media-reference__list">
            <article
              v-for="item in detail.references"
              :key="`${item.type}-${item.ownerId}-${item.ownerTitle}`"
              class="media-reference__item"
            >
              <div class="media-reference__item-main">
                <a-tag :bordered="false" color="blue">{{ item.typeLabel }}</a-tag>
                <div>
                  <strong>{{ item.ownerTitle }}</strong>
                  <span>{{ item.ownerSubtitle || '无补充信息' }}</span>
                </div>
              </div>
              <a-button
                v-if="canOpenReference(item)"
                type="link"
                size="small"
                @click="goTo(item)"
              >
                打开
              </a-button>
              <span v-else-if="item.routePath" class="media-reference__unavailable">
                {{ item.type === 'workJournalEvidence' ? '仅记录所有者可查看' : '当前账号无访问权限' }}
              </span>
              <span v-else class="media-reference__unavailable">没有对应的管理入口</span>
            </article>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminMediaReferences } from '@/services/admin'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['update:open'])
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const detail = ref(null)
const loadError = ref('')
let requestVersion = 0

watch(
  () => [props.open, props.record?.id],
  ([visible, id]) => {
    requestVersion += 1
    if (!visible || !id) {
      detail.value = null
      loading.value = false
      loadError.value = ''
      return
    }

    void loadDetail()
  },
  { immediate: true }
)

async function loadDetail() {
  const id = props.record?.id
  if (!props.open || !id) return
  const currentVersion = ++requestVersion
  detail.value = null
  loadError.value = ''
  loading.value = true
  try {
    const result = await getAdminMediaReferences(id)
    if (currentVersion === requestVersion) detail.value = result
  } catch (error) {
    if (currentVersion === requestVersion) loadError.value = error.message || '引用详情加载失败'
  } finally {
    if (currentVersion === requestVersion) loading.value = false
  }
}

function canOpenReference(item) {
  if (!item.routePath || !authStore.canAccessPath(item.routePath)) return false
  if (item.type === 'resourceShare' && !authStore.isSuperAdmin) {
    return String(item.ownerUserId || '') === String(authStore.user?.id || '')
  }
  if (item.type === 'workJournalEvidence') {
    return String(item.ownerUserId || '') === String(authStore.user?.id || '')
  }
  return true
}

function goTo(item) {
  emit('update:open', false)
  const query = Object.fromEntries(Object.entries(item.routeQuery || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  router.push({ path: item.routePath, query })
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${size} B`
}
</script>

<style scoped>
.media-reference__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.media-reference__loading,
.media-reference__error {
  flex: 1 1 auto;
  display: grid;
  place-items: center;
  min-height: 0;
  gap: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.media-reference__error {
  align-content: center;
}

.media-reference {
  display: grid;
  gap: 14px;
}

.media-reference__scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: none;
}

.media-reference__scroll::-webkit-scrollbar {
  display: none;
}

.media-reference__summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.media-reference__summary > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.media-reference__summary strong,
.media-reference__item strong {
  color: var(--text-primary);
  font-weight: 600;
}

.media-reference__summary span,
.media-reference__item span,
.media-reference__empty,
.media-reference__section-heading span {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.media-reference__facts :deep(.ant-descriptions-item-content) {
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.media-reference__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.media-reference__section-heading > div {
  display: grid;
  gap: 2px;
}

.media-reference__section-heading strong {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.media-reference__empty {
  padding: 24px 12px;
  text-align: center;
}

.media-reference__list {
  display: grid;
  gap: 8px;
}

.media-reference__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-elevated);
}

.media-reference__item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.media-reference__item-main > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.media-reference__unavailable {
  flex: 0 0 auto;
  color: var(--text-secondary);
  font-size: 12px;
}

@media (max-width: 576px) {
  .media-reference__facts :deep(.ant-descriptions-view) {
    overflow-x: auto;
  }
}
</style>
