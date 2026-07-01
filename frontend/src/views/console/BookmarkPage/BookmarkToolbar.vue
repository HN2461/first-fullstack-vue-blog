<template>
  <div class="bookmark-toolbar">
    <a-input-search
      :value="keyword"
      class="bookmark-toolbar__search"
      placeholder="搜索书签名称或地址"
      allow-clear
      @update:value="$emit('update:keyword', $event)"
      @search="$emit('search')"
      @change="$emit('typing')"
    />
    <a-tooltip title="刷新">
      <a-button @click="$emit('reload')">
        <template #icon><ReloadOutlined /></template>
      </a-button>
    </a-tooltip>
    <a-button @click="$emit('add-folder')">
      <template #icon><FolderAddOutlined /></template>
      新建文件夹
    </a-button>
    <a-button type="primary" @click="$emit('add-bookmark')">
      <template #icon><PlusOutlined /></template>
      新增书签
    </a-button>
    <a-dropdown>
      <a-button>
        <template #icon><ImportOutlined /></template>
        导入
      </a-button>
      <template #overlay>
        <a-menu @click="$emit('import', $event.key)">
          <a-menu-item key="html">浏览器 HTML</a-menu-item>
          <a-menu-item key="json">JSON 备份</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <a-dropdown>
      <a-button>
        <template #icon><DownloadOutlined /></template>
        导出
      </a-button>
      <template #overlay>
        <a-menu @click="$emit('export', $event.key)">
          <a-menu-item key="html">浏览器 HTML</a-menu-item>
          <a-menu-item key="json">JSON 备份</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import {
  DownloadOutlined,
  FolderAddOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'

defineProps({
  keyword: { type: String, default: '' }
})

defineEmits([
  'update:keyword',
  'typing',
  'search',
  'reload',
  'add-folder',
  'add-bookmark',
  'import',
  'export'
])
</script>

<style scoped>
.bookmark-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--console-surface);
}

.bookmark-toolbar__search {
  width: 320px;
  max-width: 100%;
}

@media (max-width: 780px) {
  .bookmark-toolbar__search {
    width: 100%;
  }

  .bookmark-toolbar > :deep(.ant-btn),
  .bookmark-toolbar > :deep(.ant-dropdown-trigger) {
    flex: 1 1 auto;
  }
}
</style>
