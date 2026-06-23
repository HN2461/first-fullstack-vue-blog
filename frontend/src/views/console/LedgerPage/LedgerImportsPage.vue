<template>
  <section class="ledger-imports-page">
    <LedgerImportTable
      ref="tableRef"
      :book-id="bookId"
      :refresh-key="refreshKey"
    />
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import LedgerImportTable from './LedgerImportTable.vue'

const props = defineProps({
  bookId: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)

watch(
  () => [props.bookId, props.refreshKey],
  () => tableRef.value?.reload?.()
)
</script>

<style scoped>
.ledger-imports-page {
  min-width: 0;
}
</style>
