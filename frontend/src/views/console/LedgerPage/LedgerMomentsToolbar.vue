<template>
  <div class="ledger-moments-toolbar">
    <div class="ledger-moments-toolbar__identity">
      <strong>重要记录</strong>
      <span v-if="Number.isFinite(total)">{{ total }} 条</span>
    </div>

    <a-select
      :value="scope"
      class="ledger-moments-toolbar__scope"
      :options="MOMENT_SCOPE_OPTIONS"
      show-search
      option-filter-prop="label"
      @update:value="$emit('update:scope', $event)"
    />
    <a-input
      :value="categoryText"
      class="ledger-moments-toolbar__category"
      allow-clear
      placeholder="记录分类"
      @update:value="$emit('update:category-text', $event)"
      @press-enter="$emit('search')"
    />
    <a-input-search
      :value="keyword"
      class="ledger-moments-toolbar__search"
      allow-clear
      placeholder="搜索标题、正文、心情或标签"
      @update:value="$emit('update:keyword', $event)"
      @change="$emit('keyword-input')"
      @search="$emit('search')"
    />
    <a-button @click="$emit('reset')">
      <template #icon><ClearOutlined /></template>
      重置筛选
    </a-button>

    <span class="ledger-moments-toolbar__spacer" />
    <a-radio-group
      :value="viewMode"
      class="ledger-moments-toolbar__view"
      size="small"
      button-style="solid"
      @update:value="$emit('update:view-mode', $event)"
    >
      <a-tooltip title="时间线视图">
        <a-radio-button value="timeline" aria-label="时间线视图">
          <ClockCircleOutlined />
        </a-radio-button>
      </a-tooltip>
      <a-tooltip title="表格视图">
        <a-radio-button value="table" aria-label="表格视图">
          <TableOutlined />
        </a-radio-button>
      </a-tooltip>
    </a-radio-group>
    <a-button type="primary" size="small" @click="$emit('add')">
      <template #icon><PlusOutlined /></template>
      新增记录
    </a-button>
  </div>
</template>

<script setup>
import { ClearOutlined, ClockCircleOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons-vue'
import { MOMENT_SCOPE_OPTIONS } from './ledgerMomentUtils'

const props = defineProps({
  scope: { type: String, default: '' },
  categoryText: { type: String, default: '' },
  keyword: { type: String, default: '' },
  viewMode: { type: String, default: 'timeline' },
  categories: { type: Array, default: () => [] },
  total: { type: Number, default: Number.NaN }
})

defineEmits([
  'update:scope',
  'update:category-text',
  'update:keyword',
  'update:view-mode',
  'keyword-input',
  'search',
  'reset',
  'add'
])

</script>

<style scoped>
.ledger-moments-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
}

.ledger-moments-toolbar__identity {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  white-space: nowrap;
}

.ledger-moments-toolbar__identity strong {
  color: var(--console-text);
  font-size: 13px;
  font-weight: 650;
}

.ledger-moments-toolbar__identity span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-moments-toolbar__scope {
  width: 124px;
}

.ledger-moments-toolbar__category {
  width: 150px;
}

.ledger-moments-toolbar__search {
  width: 280px;
}

.ledger-moments-toolbar__spacer {
  flex: 1;
}

.ledger-moments-toolbar__view :deep(.ant-radio-button-wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  padding-inline: 0;
}

@media (max-width: 760px) {
  .ledger-moments-toolbar {
    align-items: stretch;
  }

  .ledger-moments-toolbar__identity {
    width: 100%;
  }

  .ledger-moments-toolbar__scope,
  .ledger-moments-toolbar__category {
    width: calc(50% - 5px);
  }

  .ledger-moments-toolbar__search {
    width: 100%;
  }

  .ledger-moments-toolbar__spacer {
    display: none;
  }
}
</style>
