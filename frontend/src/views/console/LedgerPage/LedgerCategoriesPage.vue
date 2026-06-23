<template>
  <section class="ledger-categories-page">
    <div class="ledger-category-groups">
      <div v-for="group in groups" :key="group.type" class="ledger-category-group">
        <div class="ledger-category-group__head">
          <strong>{{ group.label }}</strong>
          <span>{{ group.items.length }} 个</span>
        </div>
        <div class="ledger-category-list">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="ledger-category-item"
            @click="$emit('edit-category', item)"
          >
            <span class="ledger-category-dot" :style="{ backgroundColor: item.color }"></span>
            <span class="ledger-category-main">
              <strong>{{ item.name }}</strong>
              <small>{{ item.archived ? '已归档' : (item.aliases || []).join('，') || '无别名' }}</small>
            </span>
            <EditOutlined />
          </button>
          <a-empty v-if="!group.items.length" description="暂无分类" :image-style="{ height: '48px' }" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { EditOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  categories: { type: Array, default: () => [] }
})

defineEmits(['edit-category'])

const groups = computed(() => [
  { type: 'expense', label: '支出分类', items: props.categories.filter((item) => item.type === 'expense') },
  { type: 'income', label: '收入分类', items: props.categories.filter((item) => item.type === 'income') }
])
</script>

<style scoped>
.ledger-category-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ledger-category-group {
  min-width: 0;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.ledger-category-group__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--console-border);
}

.ledger-category-group__head span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-category-list {
  display: grid;
  gap: 8px;
  padding: 12px;
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

.ledger-category-main strong,
.ledger-category-main small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-category-main small {
  margin-top: 2px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

@media (max-width: 900px) {
  .ledger-category-groups {
    grid-template-columns: 1fr;
  }
}
</style>
