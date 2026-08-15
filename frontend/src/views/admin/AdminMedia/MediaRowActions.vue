<template>
  <a-space :size="4">
    <a-tooltip title="预览">
      <a-button type="text" size="small" class="media-row-action media-row-action--view" aria-label="预览媒体" @click="emit('view')">
        <template #icon><EyeOutlined /></template>
      </a-button>
    </a-tooltip>
    <a-dropdown :trigger="['click']" placement="bottomRight">
      <a-tooltip title="更多操作">
        <a-button type="text" size="small" class="media-row-action" aria-label="打开媒体操作菜单">
          <template #icon><MoreOutlined /></template>
        </a-button>
      </a-tooltip>
      <template #overlay>
        <a-menu class="media-action-menu" @click="handleMenuClick">
          <a-menu-item-group title="文件操作">
            <a-menu-item key="download">
              <DownloadOutlined />
              <span>下载</span>
            </a-menu-item>
            <a-menu-item key="rename">
              <EditOutlined />
              <span>重命名</span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group title="组织管理">
            <a-menu-item key="move">
              <SwapOutlined />
              <span>调整分类</span>
            </a-menu-item>
            <a-menu-item key="references">
              <LinkOutlined />
              <span>查看引用</span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-divider />
          <a-menu-item key="delete" danger>
            <DeleteOutlined />
            <span>移入回收站</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-space>
</template>

<script setup>
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  MoreOutlined,
  SwapOutlined
} from '@ant-design/icons-vue'

const emit = defineEmits(['view', 'download', 'rename', 'move', 'references', 'delete'])

function handleMenuClick({ key }) {
  emit(key)
}
</script>

<style scoped>
.media-row-action {
  width: 28px;
  min-width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
}

.media-row-action--view {
  color: #3b82f6;
}

.media-row-action--view:hover {
  color: #2563eb;
  background: #eff6ff;
}

:deep(.dark-theme) .media-row-action--view:hover {
  background: var(--console-surface-hover);
}
</style>
