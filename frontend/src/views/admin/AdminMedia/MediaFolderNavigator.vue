<template>
  <section class="media-folder-navigator">
    <div class="media-folder-navigator__toolbar">
      <a-input-search v-model:value="keyword" allow-clear placeholder="搜索分类文件夹" size="small" />
      <a-checkbox v-model:checked="showEmpty">显示空分类</a-checkbox>
      <a-tooltip title="查看当前页签的全部文件">
        <a-button size="small" @click="$emit('files')">全部文件</a-button>
      </a-tooltip>
      <MediaViewSwitcher model-value="folders" @update:model-value="$emit('update:layout', $event)" />
      <a-tooltip title="刷新分类文件夹">
        <a-button size="small" type="text" aria-label="刷新分类文件夹" :loading="loading" @click="load">
          <ReloadOutlined />
        </a-button>
      </a-tooltip>
    </div>
    <div v-if="loading" class="media-folder-navigator__state" role="status"><a-spin tip="正在加载分类文件夹" /></div>
    <div v-else-if="error" class="media-folder-navigator__state" role="alert">
      <FolderOpenOutlined />
      <strong>分类加载失败</strong>
      <span>{{ error }}</span>
      <a-button size="small" @click="load">重试</a-button>
    </div>
    <div v-else-if="!visibleCount" class="media-folder-navigator__state" role="status">
      <FolderOpenOutlined />
      <strong>{{ keyword ? '没有匹配的文件夹' : '当前页签还没有资源分类' }}</strong>
      <span>{{ keyword ? '可以清除搜索，或按文件名查找全部文件。' : '可显示空分类，或查看当前页签的全部文件。' }}</span>
      <a-space>
        <a-button v-if="keyword" size="small" @click="keyword = ''">清除搜索</a-button>
        <a-button v-else size="small" @click="showEmpty = true">显示空分类</a-button>
        <a-button size="small" @click="$emit('files')">全部文件</a-button>
      </a-space>
    </div>
    <div v-else class="media-folder-navigator__content">
      <section v-for="group in groups" :key="group.label">
        <div v-if="group.items.length" class="media-folder-navigator__heading">
          <strong>{{ group.label }}</strong>
          <small>{{ group.items.length }} 个</small>
        </div>
        <div v-if="group.items.length" class="media-folder-navigator__grid">
          <MediaFolderCard
            v-for="folder in group.items"
            :key="folder.id || folder.name"
            :folder="folder"
            @open="$emit('open', $event)"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { FolderOpenOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { listAdminMediaCategories } from '@/services/admin'
import { useAuthStore } from '@/stores/auth'
import MediaFolderCard from './MediaFolderCard.vue'
import MediaViewSwitcher from './MediaViewSwitcher.vue'

const props = defineProps({ workspace: { type: String, required: true } })
defineEmits(['open', 'files', 'update:layout'])
const auth = useAuthStore()
const keyword = ref('')
const showEmpty = ref(false)
const categories = ref([])
const loading = ref(true)
const error = ref('')
let version = 0
let disposed = false
const visibleCategories = computed(() =>
  categories.value.filter(
    (item) =>
      item.accessMode !== 'vault' &&
      item.builtinKey !== 'vault' &&
      (showEmpty.value || item.count > 0) &&
      `${item.name} ${item.ownerName || ''}`.toLowerCase().includes(keyword.value.trim().toLowerCase())
  )
)
const groups = computed(() => [
  { label: '自定义分类', items: visibleCategories.value.filter((item) => !item.system) },
  { label: '系统分类', items: visibleCategories.value.filter((item) => item.system) }
])
const visibleCount = computed(() => visibleCategories.value.length)
async function load() {
  const current = ++version
  loading.value = true
  error.value = ''
  try {
    // 数量由后端按页签和账号统计，不能使用全库数字或当前文件分页推测。
    const result = await listAdminMediaCategories({
      workspace: props.workspace,
      scope: auth.isSuperAdmin ? 'all' : undefined
    })
    if (!disposed && current === version) categories.value = result
  } catch (reason) {
    if (!disposed && current === version) error.value = reason.message || '请稍后重试'
  } finally {
    if (!disposed && current === version) loading.value = false
  }
}
watch(() => props.workspace, load, { immediate: true })
onBeforeUnmount(() => {
  disposed = true
  version += 1
})
defineExpose({ refresh: load })
</script>

<style scoped>
.media-folder-navigator {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  container-type: inline-size;
}
.media-folder-navigator__toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.media-folder-navigator__toolbar :deep(.ant-input-search) {
  flex: 1 1 170px;
  min-width: 130px;
  max-width: 320px;
}
.media-folder-navigator__toolbar :deep(.ant-checkbox-wrapper) {
  margin: 0;
  font-size: 12px;
  white-space: nowrap;
}
.media-folder-navigator__content {
  min-height: 0;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px;
}
.media-folder-navigator__heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--console-text);
}
.media-folder-navigator__heading strong {
  font-size: 13px;
  font-weight: 600;
}
.media-folder-navigator__heading small {
  color: var(--console-text-secondary);
}
.media-folder-navigator__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 8px;
}
.media-folder-navigator__grid :deep(.media-folder-card) {
  padding: 10px;
  min-height: 88px;
  gap: 9px;
}
.media-folder-navigator__grid :deep(.media-folder-card__icon) {
  width: 30px;
  height: 30px;
  flex-basis: 30px;
  font-size: 18px;
}
.media-folder-navigator__state {
  flex: 1;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--console-text-secondary);
  text-align: center;
}
@container (max-width: 500px) {
  .media-folder-navigator__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .media-folder-navigator__grid :deep(.media-folder-card__arrow) {
    display: none;
  }
}
@container (max-width: 330px) {
  .media-folder-navigator__grid {
    grid-template-columns: 1fr;
  }
}
</style>
