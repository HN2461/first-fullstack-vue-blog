<template>
  <div class="ledger-toolbar">
    <div class="ledger-toolbar__left">
      <div class="ledger-toolbar__book">
        <BookOpen :size="14" class="ledger-toolbar__book-icon" />
        <a-select
          :value="bookId"
          class="ledger-toolbar__book-select"
          :options="bookOptions"
          :bordered="false"
          show-search
          option-filter-prop="label"
          @change="$emit('update:bookId', $event)"
        />
      </div>

      <span class="ledger-toolbar__divider" />

      <div class="ledger-toolbar__periods">
        <a-tooltip v-for="p in periodOptions" :key="p.value" :title="p.tip || `切换到${p.label}数据`">
          <button
            :class="['ledger-period-btn', { active: period === p.value }]"
            @click="$emit('update:period', p.value)"
          >
            {{ p.label }}
          </button>
        </a-tooltip>
      </div>

      <a-range-picker
        v-if="period === 'custom'"
        :value="rangeValue"
        class="ledger-toolbar__range"
        size="small"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="handleRangeChange"
      />
    </div>

    <div class="ledger-toolbar__right">
      <a-tooltip title="刷新">
        <button class="ledger-toolbar__icon-btn" @click="$emit('reload')">
          <RefreshCw :size="15" />
        </button>
      </a-tooltip>
      <a-dropdown :trigger="['click']">
        <button class="ledger-toolbar__icon-btn">
          <MoreHorizontal :size="15" />
        </button>
        <template #overlay>
          <a-menu @click="$emit('action', $event.key)">
            <a-menu-item key="categories">
              <AppstoreOutlined /> 分类管理
            </a-menu-item>
            <a-menu-item key="newCategory">
              <TagsOutlined /> 新增分类
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="importRecords">
              <HistoryOutlined /> 导入记录
            </a-menu-item>
            <a-menu-item key="importExcel">
              <UploadOutlined /> 导入 Excel
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="exportAnalysis">
              <DownloadOutlined /> 导出图表
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AppstoreOutlined, DownloadOutlined, HistoryOutlined, TagsOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { BookOpen, MoreHorizontal, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  bookId: { type: String, default: '' },
  bookOptions: { type: Array, default: () => [] },
  period: { type: String, default: 'thisMonth' },
  range: { type: Array, default: () => [] },
  periodOptions: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:bookId',
  'update:period',
  'update:range',
  'reload',
  'action'
])

const rangeValue = computed(() => {
  const [from, to] = props.range || []
  return from && to ? [from, to] : []
})

function handleRangeChange(value) {
  emit('update:range', value || [])
}
</script>

<style scoped>
.ledger-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  padding: 6px 10px;
  background: var(--console-surface);
}

.ledger-toolbar__left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.ledger-toolbar__right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ledger-toolbar__book {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ledger-toolbar__book-icon {
  color: var(--console-text-secondary);
  flex-shrink: 0;
}

.ledger-toolbar__book-select {
  width: 140px;
  font-weight: 600;
}

.ledger-toolbar__book-select :deep(.ant-select-selector) {
  padding-left: 0 !important;
}

.ledger-toolbar__divider {
  width: 1px;
  height: 18px;
  background: var(--console-border);
  flex-shrink: 0;
  margin: 0 4px;
}

.ledger-toolbar__periods {
  display: flex;
  gap: 2px;
}

.ledger-toolbar__range {
  width: 230px;
  margin-left: 4px;
}

.ledger-period-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--console-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  line-height: 22px;
}

.ledger-period-btn:hover {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 8%, transparent);
  color: var(--console-text);
}

.ledger-period-btn.active {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 12%, transparent);
  color: var(--console-primary, #1677ff);
  font-weight: 600;
}

.ledger-toolbar__icon-btn {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--console-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ledger-toolbar__icon-btn:hover {
  background: color-mix(in srgb, var(--console-text) 6%, transparent);
  color: var(--console-text);
}

@media (max-width: 760px) {
  .ledger-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .ledger-toolbar__left {
    width: 100%;
  }

  .ledger-toolbar__book {
    width: 100%;
  }

  .ledger-toolbar__book-select {
    width: 100%;
  }

  .ledger-toolbar__divider {
    display: none;
  }

  .ledger-toolbar__periods {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .ledger-toolbar__right {
    justify-content: flex-end;
  }

  .ledger-toolbar__range {
    width: 100%;
  }
}
</style>
