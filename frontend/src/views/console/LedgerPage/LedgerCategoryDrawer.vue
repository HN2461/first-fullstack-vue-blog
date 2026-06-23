<template>
  <a-drawer
    :open="open"
    title="分类管理"
    width="520"
    :body-style="{ padding: '12px' }"
    @close="$emit('update:open', false)"
  >
    <a-tabs v-model:active-key="activeType">
      <a-tab-pane key="expense" tab="支出分类" />
      <a-tab-pane key="income" tab="收入分类" />
    </a-tabs>
    <div class="ledger-category-list">
      <button
        v-for="item in filteredCategories"
        :key="item.id"
        type="button"
        class="ledger-category-item"
        @click="$emit('edit', item)"
      >
        <span class="ledger-category-dot" :style="{ backgroundColor: item.color }"></span>
        <span>
          <strong>{{ item.name }}</strong>
          <small>{{ item.archived ? '已归档' : (item.aliases || []).join('，') || '无别名' }}</small>
        </span>
        <EditOutlined />
      </button>
      <a-empty v-if="!filteredCategories.length" description="暂无分类" :image-style="{ height: '48px' }" />
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { EditOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] }
})

defineEmits(['update:open', 'edit'])

const activeType = ref('expense')
const filteredCategories = computed(() => props.categories.filter((item) => item.type === activeType.value))
</script>

<style scoped>
.ledger-category-list {
  display: grid;
  gap: 8px;
}

.ledger-category-item {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--console-surface);
  color: var(--console-text);
  cursor: pointer;
  text-align: left;
}

.ledger-category-item:hover {
  border-color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}

.ledger-category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ledger-category-item strong,
.ledger-category-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-category-item small {
  margin-top: 2px;
  color: var(--console-text-secondary);
  font-size: 12px;
}
</style>
