<template>
  <a-modal
    :open="open"
    title="添加到主书签库"
    :width="620"
    :confirm-loading="submitting"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    ok-text="添加到主库"
    cancel-text="取消"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-alert
      type="info"
      show-icon
      :message="`将 ${count} 条书签复制到「${targetWorkspace?.name || '主书签库'}」`"
      description="来源书签库不会被修改；目标书签库中已存在的 URL 会自动跳过。"
    />
    <a-form class="bookmark-copy-form" layout="vertical">
      <a-form-item label="目标目录" required>
        <a-tree-select
          v-model:value="targetFolderId"
          :tree-data="treeOptions"
          show-search
          tree-node-filter-prop="title"
          tree-default-expand-all
          placeholder="请选择主书签库中的目录"
          :dropdown-style="{ maxHeight: '360px', overflow: 'auto' }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { buildFolderTree } from './bookmarkUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  folders: { type: Array, default: () => [] },
  targetWorkspace: { type: Object, default: null },
  submitting: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'submit'])
const targetFolderId = ref('toolbar')
const treeOptions = computed(() => [
  { title: '书签栏', value: 'toolbar', key: 'toolbar' },
  ...toTreeOptions(buildFolderTree(props.folders))
])

watch(() => props.open, (visible) => {
  if (visible) targetFolderId.value = 'toolbar'
})

function toTreeOptions(nodes = []) {
  return nodes.map((node) => ({
    title: node.name,
    value: node.id,
    key: node.id,
    children: toTreeOptions(node.children || [])
  }))
}

function submit() {
  if (!targetFolderId.value) {
    message.warning('请选择目标目录')
    return
  }
  emit('submit', targetFolderId.value === 'toolbar' ? null : targetFolderId.value)
}
</script>

<style scoped>
.bookmark-copy-form {
  margin-top: 16px;
}
</style>
