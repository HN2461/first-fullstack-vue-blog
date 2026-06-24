<template>
  <section class="ledger-page">
    <div class="ledger-toolbar">
      <a-space wrap>
        <a-select
          v-model:value="selectedBookId"
          class="ledger-book-select"
          :options="bookOptions"
          show-search
          option-filter-prop="label"
          @change="reloadAll"
        />
        <a-range-picker v-model:value="dateRangeValue" class="ledger-range" @change="reloadAll" />
        <a-tooltip title="刷新">
          <a-button @click="reloadAll">
            <template #icon><RefreshCw :size="16" /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>

    <RouterView
      :book-id="selectedBookId"
      :categories="categories"
      :range="queryRange"
      :refresh-key="refreshKey"
      @edit-entry="openEntryModal"
      @delete-entry="confirmDeleteEntry"
      @edit-category="openCategoryModal"
      @open-categories="categoryDrawerOpen = true"
      @open-category-modal="openCategoryModal"
      @open-import="importModalOpen = true"
      @open-entry-modal="openEntryModal"
      @reload="reloadAll"
    />

    <LedgerEntryModal
      v-model:open="entryModalOpen"
      :book-id="selectedBookId"
      :entry="currentEntry"
      :categories="categories"
      @saved="reloadAll"
    />

    <LedgerCategoryModal
      v-model:open="categoryModalOpen"
      :book-id="selectedBookId"
      :category="currentCategory"
      @saved="reloadCategoriesAndSummary"
    />

    <LedgerImportModal
      v-model:open="importModalOpen"
      :book-id="selectedBookId"
      @imported="reloadAll"
    />

    <LedgerCategoryDrawer
      v-model:open="categoryDrawerOpen"
      :categories="categories"
      @edit="openCategoryModal"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { RefreshCw } from 'lucide-vue-next'
import LedgerCategoryDrawer from './LedgerCategoryDrawer.vue'
import LedgerCategoryModal from './LedgerCategoryModal.vue'
import LedgerEntryModal from './LedgerEntryModal.vue'
import LedgerImportModal from './LedgerImportModal.vue'
import {
  deleteLedgerEntry,
  listLedgerBooks,
  listLedgerCategories
} from '@/services/ledger'

const loading = ref(false)
const books = ref([])
const categories = ref([])
const selectedBookId = ref('')
const dateRangeValue = ref([])
const refreshKey = ref(0)
const entryModalOpen = ref(false)
const categoryModalOpen = ref(false)
const importModalOpen = ref(false)
const categoryDrawerOpen = ref(false)
const currentEntry = ref(null)
const currentCategory = ref(null)

const bookOptions = computed(() => books.value.map((book) => ({
  label: book.name,
  value: book.id
})))

const queryRange = computed(() => {
  const [from, to] = dateRangeValue.value || []
  return [
    from ? from.format?.('YYYY-MM-DD') || from : '',
    to ? to.format?.('YYYY-MM-DD') || to : ''
  ]
})

async function loadBooks() {
  books.value = await listLedgerBooks()
  if (!selectedBookId.value && books.value.length) {
    selectedBookId.value = books.value[0].id
  }
}

async function loadCategories() {
  if (!selectedBookId.value) {
    categories.value = []
    return
  }
  categories.value = await listLedgerCategories({ bookId: selectedBookId.value })
}

async function reloadCategoriesAndSummary() {
  await loadCategories()
  refreshKey.value += 1
}

async function reloadAll() {
  loading.value = true
  try {
    await loadCategories()
    refreshKey.value += 1
  } catch (error) {
    message.error(error.message || '账本数据加载失败')
  } finally {
    loading.value = false
  }
}

function openEntryModal(entry = null) {
  currentEntry.value = entry
  entryModalOpen.value = true
}

function openCategoryModal(category = null) {
  currentCategory.value = category
  categoryModalOpen.value = true
}

function confirmDeleteEntry(entry) {
  let loading = false
  Modal.confirm({
    title: '删除流水',
    content: `确定删除「${entry.category?.name || entry.categoryNameSnapshot} ${entry.amount}」吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    okButtonProps: { loading },
    async onOk() {
      loading = true
      try {
        await deleteLedgerEntry(entry.id)
        message.success('流水已删除')
        await reloadAll()
      } catch (error) {
        message.error(error.message || '删除失败')
      } finally {
        loading = false
      }
    }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await loadBooks()
    await reloadAll()
  } catch (error) {
    message.error(error.message || '账本数据加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ledger-page {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.ledger-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--console-border);
  border-left: 3px solid var(--console-primary, #1677ff);
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--console-surface);
}

.ledger-page :deep(.ant-table-selection-column) {
  width: 48px !important;
  min-width: 48px !important;
  max-width: 48px !important;
  padding-inline: 12px !important;
  text-align: center;
}

.ledger-page :deep(.ant-table-selection-column .ant-checkbox-wrapper),
.ledger-page :deep(.ant-table-selection-column .ant-checkbox) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ledger-page :deep(.ant-table-sticky-scroll) {
  background: var(--console-surface);
}

.ledger-page :deep(.ant-table-sticky-scroll-bar) {
  background-color: color-mix(in srgb, var(--console-text-secondary, #667085) 38%, transparent);
}

.ledger-book-select {
  width: 180px;
}

.ledger-range {
  width: 260px;
}

@media (max-width: 900px) {
  .ledger-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .ledger-book-select,
  .ledger-range {
    width: 100%;
  }
}
</style>
