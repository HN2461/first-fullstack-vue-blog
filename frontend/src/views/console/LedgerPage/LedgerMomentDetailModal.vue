<template>
  <a-modal
    v-model:open="visible"
    title="重要记录详情"
    :width="680"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto', padding: 0 }"
  >
    <article v-if="moment" class="ledger-moment-detail">
      <header class="ledger-moment-detail__header">
        <div class="ledger-moment-detail__date">
          <strong>{{ dateParts.primary }}</strong>
          <span>{{ dateParts.year }}</span>
          <small>{{ dateParts.weekday }}</small>
        </div>
        <div class="ledger-moment-detail__heading">
          <div>
            <a-tag v-if="moment.pinned" color="gold" :bordered="false">置顶</a-tag>
            <a-tag :bordered="false">{{ scopeLabel(moment.scope) }}</a-tag>
          </div>
          <h3>{{ moment.title }}</h3>
          <strong v-if="moment.amount" class="ledger-moment-detail__amount">
            {{ formatMoney(moment.amount) }}
          </strong>
        </div>
      </header>

      <div v-if="hasMeta" class="ledger-moment-detail__meta">
        <span v-if="momentCategoryText(moment)">
          <FolderOutlined />
          {{ momentCategoryText(moment) }}
        </span>
        <span v-if="moment.mood">
          <SmileOutlined />
          {{ moment.mood }}
        </span>
      </div>

      <div v-if="moment.tags?.length" class="ledger-moment-detail__tags">
        <a-tag v-for="tag in moment.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
      </div>

      <section class="ledger-moment-detail__content">
        <span>记录正文</span>
        <p>{{ moment.content || '暂无记录内容' }}</p>
      </section>
    </article>

    <template #footer>
      <a-button @click="visible = false">关闭</a-button>
      <a-button type="primary" @click="handleEdit">
        <template #icon><EditOutlined /></template>
        编辑记录
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { EditOutlined, FolderOutlined, SmileOutlined } from '@ant-design/icons-vue'
import { formatMoney } from './ledgerChartOptions'
import { formatMomentDateParts, momentCategoryText, scopeLabel } from './ledgerMomentUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  moment: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'edit'])

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})
const dateParts = computed(() => formatMomentDateParts(props.moment))
const hasMeta = computed(() => Boolean(momentCategoryText(props.moment) || props.moment?.mood))

function handleEdit() {
  visible.value = false
  emit('edit', props.moment)
}
</script>

<style scoped>
.ledger-moment-detail {
  color: var(--console-text);
}

.ledger-moment-detail__header {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  min-height: 150px;
  border-bottom: 1px solid var(--console-border);
}

.ledger-moment-detail__date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 24px;
  border-right: 1px solid var(--console-border);
  background: var(--console-surface-muted, #fafafa);
}

.ledger-moment-detail__date strong {
  font-size: 24px;
  line-height: 1.2;
}

.ledger-moment-detail__date span,
.ledger-moment-detail__date small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-moment-detail__heading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 24px;
}

.ledger-moment-detail__heading h3 {
  margin: 0;
  color: var(--console-text);
  font-size: 20px;
  line-height: 1.5;
}

.ledger-moment-detail__amount {
  color: var(--console-primary, #1677ff);
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.ledger-moment-detail__meta,
.ledger-moment-detail__tags,
.ledger-moment-detail__content {
  margin-inline: 24px;
}

.ledger-moment-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  padding: 18px 0 0;
  color: var(--console-text-secondary);
  font-size: 13px;
}

.ledger-moment-detail__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ledger-moment-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 14px;
}

.ledger-moment-detail__content {
  padding: 20px 0 28px;
}

.ledger-moment-detail__content > span {
  display: block;
  margin-bottom: 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.ledger-moment-detail__content p {
  margin: 0;
  color: var(--console-text);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 560px) {
  .ledger-moment-detail__header {
    grid-template-columns: 1fr;
  }

  .ledger-moment-detail__date {
    flex-direction: row;
    align-items: baseline;
    padding: 16px 18px;
    border-right: 0;
  }

  .ledger-moment-detail__heading {
    padding: 18px;
  }

  .ledger-moment-detail__meta,
  .ledger-moment-detail__tags,
  .ledger-moment-detail__content {
    margin-inline: 18px;
  }
}
</style>
