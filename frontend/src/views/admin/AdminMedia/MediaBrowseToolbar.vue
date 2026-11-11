<template>
  <div class="media-browse-toolbar">
    <a-input-search
      v-model:value="keyword"
      class="media-browse-toolbar__search"
      placeholder="搜索文件名或分类"
      allow-clear
      size="small"
      @search="search"
    />
    <a-select
      v-if="workspace !== 'vault'"
      :value="filters.categoryId || undefined"
      class="media-browse-toolbar__category"
      size="small"
      placeholder="全部分类"
      allow-clear
      show-search
      option-filter-prop="label"
      :options="categoryOptions"
      @change="update('categoryId', $event)"
    />
    <a-popover
      v-model:open="filterOpen"
      trigger="click"
      placement="bottomRight"
      :overlay-style="{ maxWidth: 'calc(100vw - 32px)' }"
    >
      <template #content>
        <div class="media-browse-toolbar__advanced">
          <label>
            类型
            <a-select
              :value="filters.fileClass || undefined"
              allow-clear
              show-search
              option-filter-prop="label"
              :options="fileClassOptions"
              @change="update('fileClass', $event)"
            />
          </label>
          <label>
            使用情况
            <a-select
              :value="filters.usageStatus || undefined"
              allow-clear
              show-search
              option-filter-prop="label"
              :options="usageOptions"
              @change="update('usageStatus', $event)"
            />
          </label>
          <label v-if="workspace !== 'vault'">
            文件来源
            <a-select
              :value="filters.scene || undefined"
              allow-clear
              show-search
              option-filter-prop="label"
              :options="sceneOptions"
              @change="update('scene', $event)"
            />
          </label>
          <label>
            保留状态
            <a-select
              :value="filters.lifecycleStatus || undefined"
              allow-clear
              show-search
              option-filter-prop="label"
              :options="resourceLifecycleOptions"
              @change="update('lifecycleStatus', $event)"
            />
          </label>
          <a-button size="small" @click="reset">清除筛选</a-button>
        </div>
      </template>
      <a-button
        size="small"
        :type="advancedCount ? 'primary' : 'default'"
        :ghost="advancedCount > 0"
        aria-label="展开资源筛选"
      >
        <FilterOutlined />
        筛选{{ advancedCount ? ` (${advancedCount})` : '' }}
      </a-button>
    </a-popover>
    <MediaViewSwitcher :model-value="layout" @update:model-value="$emit('update:layout', $event)" />
    <slot />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { FilterOutlined } from '@ant-design/icons-vue'
import MediaViewSwitcher from './MediaViewSwitcher.vue'
import { fileClassOptions, resourceSceneOptions, resourceLifecycleOptions } from './mediaWorkspace'

const props = defineProps({
  filters: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  layout: String,
  workspace: String
})
const emit = defineEmits(['update:filters', 'update:layout'])
const keyword = ref(props.filters.keyword || '')
const filterOpen = ref(false)
const advancedCount = computed(
  () => ['fileClass', 'usageStatus', 'scene', 'lifecycleStatus'].filter((key) => props.filters[key]).length
)
const sceneOptions = computed(() =>
  resourceSceneOptions.filter((item) =>
    props.workspace === 'library'
      ? item.value === 'admin-library'
      : props.workspace === 'business'
        ? item.value !== 'admin-library'
        : true
  )
)
const categoryOptions = computed(() =>
  props.categories
    .filter((item) => item.accessMode !== 'vault')
    .map((item) => ({
      label: `${item.name}${item.ownerName ? ` · ${item.ownerName}` : ''}`,
      value: item.id || item.name
    }))
)
const usageOptions = [
  { value: 'referenced', label: '正在使用' },
  { value: 'unreferenced', label: '暂未查到使用位置' }
]
watch(
  () => props.filters.keyword,
  (value) => {
    keyword.value = value || ''
  }
)
function update(key, value) {
  emit('update:filters', { ...props.filters, [key]: value || '' })
}
function search() {
  update('keyword', keyword.value.trim())
}
function reset() {
  keyword.value = ''
  emit('update:filters', {
    keyword: '',
    categoryId: '',
    fileClass: '',
    usageStatus: '',
    scene: '',
    lifecycleStatus: ''
  })
}
</script>

<style scoped>
.media-browse-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  min-width: 0;
}
.media-browse-toolbar__search {
  flex: 1 1 180px;
  min-width: 120px;
  max-width: 320px;
}
.media-browse-toolbar__category {
  width: 152px;
  min-width: 104px;
}
.media-browse-toolbar__advanced {
  display: grid;
  gap: 12px;
  width: min(300px, calc(100vw - 64px));
}
.media-browse-toolbar__advanced label {
  display: grid;
  gap: 5px;
  color: var(--console-text-secondary);
  font-size: 12px;
}
.media-browse-toolbar__advanced :deep(.ant-select) {
  width: 100%;
}
@container (max-width: 620px) {
  .media-browse-toolbar__category {
    width: 120px;
  }
  .media-browse-toolbar__search {
    max-width: none;
  }
}
</style>
