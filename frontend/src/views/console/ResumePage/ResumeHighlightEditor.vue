<template>
  <div class="resume-highlight-editor">
    <div class="resume-item-card__head">
      <strong>{{ title }}</strong>
      <a-tooltip title="新增一条亮点">
        <a-button size="small" @click="$emit('add')">
          <template #icon><PlusOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="resume-highlight-row"
      draggable="true"
      @dragstart="activeDragIndex = index"
      @dragover.prevent
      @drop="reorder(index)"
    >
      <div class="resume-highlight-row__content">
        <a-input v-if="showTitle" v-model:value="item.title" placeholder="模块标题，例如：动态路由与权限" :maxlength="80" />
        <a-textarea v-model:value="item.content" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </div>
      <a-tooltip title="绑定面试问答">
        <a-button size="small" @click="$emit('link', item)">
          <template #icon><LinkOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="删除">
        <a-button size="small" danger @click="$emit('remove', index)">
          <template #icon><DeleteOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <a-empty v-if="!items.length" :description="`${title || '亮点'}为空`" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DeleteOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  title: { type: String, default: '' },
  showTitle: { type: Boolean, default: false },
  items: { type: Array, default: () => [] }
})

defineEmits(['add', 'remove', 'link'])

const activeDragIndex = ref(-1)

function reorder(targetIndex) {
  if (activeDragIndex.value < 0 || activeDragIndex.value === targetIndex) return
  const [item] = props.items.splice(activeDragIndex.value, 1)
  props.items.splice(targetIndex, 0, item)
  props.items.forEach((entry, index) => { entry.sortOrder = index * 10 })
  activeDragIndex.value = -1
}
</script>
