<template>
  <div class="media-header-actions">
    <a-dropdown :trigger="['click']" placement="bottomRight">
      <a-tooltip title="资源工具">
        <a-button class="media-header-actions__tool" aria-label="打开资源工具菜单">
          <template #icon><MoreOutlined /></template>
        </a-button>
      </a-tooltip>
      <template #overlay>
        <a-menu class="media-action-menu" @click="handleMenuClick">
          <a-menu-item-group title="组织与配置">
            <a-menu-item key="categories">
              <FolderOpenOutlined />
              <span>资源分类</span>
            </a-menu-item>
            <a-menu-item key="settings">
              <SettingOutlined />
              <span>上传限制</span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group title="维护工具">
            <a-menu-item v-if="superAdmin" key="inventory">
              <SearchOutlined />
              <span>扫描未登记资源</span>
            </a-menu-item>
            <a-menu-item key="trash">
              <RestOutlined />
              <span>媒体回收站</span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group v-if="canManageShares" title="协作">
            <a-menu-item key="shares">
              <ShareAltOutlined />
              <span>资源分享管理</span>
            </a-menu-item>
          </a-menu-item-group>
        </a-menu>
      </template>
    </a-dropdown>
    <a-button type="primary" @click="emit('upload')">
      <template #icon><InboxOutlined /></template>
      上传资源
    </a-button>
  </div>
</template>

<script setup>
import {
  FolderOpenOutlined,
  InboxOutlined,
  MoreOutlined,
  RestOutlined,
  SearchOutlined,
  SettingOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'

defineProps({
  superAdmin: {
    type: Boolean,
    default: false
  },
  canManageShares: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload', 'inventory', 'settings', 'trash', 'categories', 'shares'])

function handleMenuClick({ key }) {
  emit(key)
}
</script>

<style scoped>
.media-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.media-header-actions__tool {
  width: 32px;
  min-width: 32px;
  padding: 0;
}
</style>

<style>
.media-action-menu .ant-dropdown-menu-item-group-title {
  padding: 7px 12px 4px;
  font-size: 12px;
}

.media-action-menu .ant-dropdown-menu-item {
  min-width: 176px;
}

.media-action-menu .ant-dropdown-menu-item .anticon {
  margin-right: 8px;
}
</style>
