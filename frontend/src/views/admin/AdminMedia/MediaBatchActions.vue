<template>
  <div class="media-batch-actions">
    <span class="media-batch-actions__count">已选择 {{ count }} 个</span>
    <a-button size="small" type="primary" ghost @click="emit('download')">
      <template #icon><DownloadOutlined /></template>
      批量下载
    </a-button>
    <a-dropdown :trigger="['click']" placement="bottomRight">
      <a-button size="small">
        批量操作
        <DownOutlined />
      </a-button>
      <template #overlay>
        <a-menu class="media-action-menu" @click="handleMenuClick">
          <a-menu-item-group title="组织管理">
            <a-menu-item key="move">
              <SwapOutlined />
              <span>迁移分类</span>
            </a-menu-item>
            <a-menu-item v-if="canManageShares" key="share">
              <ShareAltOutlined />
              <span>创建分享</span>
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
    <a-tooltip title="取消选择">
      <a-button size="small" type="text" aria-label="取消媒体选择" @click="emit('clear')">
        <template #icon><CloseOutlined /></template>
      </a-button>
    </a-tooltip>
  </div>
</template>

<script setup>
import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  ShareAltOutlined,
  SwapOutlined
} from '@ant-design/icons-vue'

defineProps({
  count: {
    type: Number,
    default: 0
  },
  canManageShares: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['download', 'move', 'share', 'delete', 'clear'])

function handleMenuClick({ key }) {
  emit(key)
}
</script>
