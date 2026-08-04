<template>
  <div class="workspace-tabs-preference">
    <div>
      <strong>启用多标签页</strong>
      <span>在控制台顶部保留已打开页面，便于在不同工作区之间切换。</span>
    </div>
    <a-switch
      :checked="modelValue"
      checked-children="开启"
      un-checked-children="关闭"
      @update:checked="handleChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Modal } from 'ant-design-vue'
import { useConsoleTabsStore } from '@/stores/consoleTabs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])
const tabsStore = useConsoleTabsStore()
const dirtyTabCount = computed(() => tabsStore.tabs.filter((tab) => tabsStore.isDirty(tab.key)).length)

function confirmDisableTabs() {
  return new Promise((resolve) => {
    Modal.confirm({
      title: '关闭多标签页？',
      content: `当前有 ${dirtyTabCount.value} 个标签存在未保存修改。保存此设置后，这些页面状态将被清除。`,
      okText: '仍要关闭',
      cancelText: '取消',
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  })
}

async function handleChange(enabled) {
  if (!enabled && props.modelValue && dirtyTabCount.value > 0 && !(await confirmDisableTabs())) return
  emit('update:modelValue', enabled)
}
</script>

<style scoped>
.workspace-tabs-preference {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--console-border);
  padding: 4px 0 20px;
}

.workspace-tabs-preference > div {
  min-width: 0;
}

.workspace-tabs-preference strong,
.workspace-tabs-preference span {
  display: block;
}

.workspace-tabs-preference strong {
  color: var(--console-text);
  font-size: 14px;
  line-height: 22px;
}

.workspace-tabs-preference span {
  margin-top: 3px;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

@media (max-width: 640px) {
  .workspace-tabs-preference {
    align-items: flex-start;
  }
}
</style>
