<template>
  <aside class="bookmark-folders">
    <div class="bookmark-folders__head">
      <strong>文件夹</strong>
      <a-tooltip title="新建文件夹">
        <a-button size="small" @click="$emit('add')">
          <template #icon><PlusOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <button
      type="button"
      :class="['bookmark-folder-static', { active: selectedKey === 'all' }]"
      @click="$emit('select', 'all')"
    >
      <UnorderedListOutlined />
      <span>全部书签</span>
    </button>
    <button
      type="button"
      :class="['bookmark-folder-static', { active: selectedKey === 'root' }]"
      @click="$emit('select', 'root')"
    >
      <FolderOpenOutlined />
      <span>根目录</span>
    </button>

    <a-tree
      class="bookmark-folder-tree"
      block-node
      draggable
      :tree-data="treeData"
      :selected-keys="selectedFolderKeys"
      :field-names="{ title: 'name', key: 'id', children: 'children' }"
      default-expand-all
      @select="handleSelect"
      @drop="handleDrop"
    >
      <template #title="{ name, id }">
        <div class="bookmark-folder-node">
          <span class="bookmark-folder-node__name">{{ name }}</span>
          <span class="bookmark-folder-node__actions">
            <a-tooltip title="编辑文件夹">
              <button type="button" @click.stop="$emit('edit', id)">
                <EditOutlined />
              </button>
            </a-tooltip>
            <a-tooltip title="删除文件夹">
              <button type="button" @click.stop="$emit('remove', id)">
                <DeleteOutlined />
              </button>
            </a-tooltip>
          </span>
        </div>
      </template>
    </a-tree>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  treeData: { type: Array, default: () => [] },
  selectedKey: { type: String, default: 'all' }
})

const emit = defineEmits(['select', 'add', 'edit', 'remove', 'move'])
const selectedFolderKeys = computed(() => ['all', 'root'].includes(props.selectedKey) ? [] : [props.selectedKey])

function handleSelect(keys) {
  if (keys?.[0]) emit('select', keys[0])
}

function handleDrop(info) {
  const draggedId = info.dragNode?.id || info.dragNode?.key
  const targetId = info.node?.id || info.node?.key
  if (!draggedId || !targetId || draggedId === targetId) return
  emit('move', {
    id: draggedId,
    parentId: info.dropToGap ? (info.node?.parentId || null) : targetId
  })
}
</script>

<style scoped>
.bookmark-folders {
  min-width: 0;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  overflow: hidden;
}

.bookmark-folders__head {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--console-border);
  padding: 0 12px;
}

.bookmark-folders__head strong {
  color: var(--console-text);
  font-size: 14px;
}

.bookmark-folder-static {
  width: calc(100% - 16px);
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 8px 0;
  border: 0;
  border-radius: 6px;
  padding: 0 10px;
  color: var(--console-menu-text);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.bookmark-folder-static:hover,
.bookmark-folder-static.active {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.bookmark-folder-tree {
  max-height: calc(100vh - 238px);
  overflow: auto;
  padding: 8px;
  background: transparent;
}

.bookmark-folder-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.bookmark-folder-node__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-folder-node__actions {
  display: inline-flex;
  gap: 2px;
  opacity: 0;
}

.bookmark-folder-node:hover .bookmark-folder-node__actions {
  opacity: 1;
}

.bookmark-folder-node__actions button {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  color: var(--console-text-secondary);
  background: transparent;
  cursor: pointer;
}

.bookmark-folder-node__actions button:hover {
  color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}
</style>
