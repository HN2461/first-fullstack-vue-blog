<template>
  <a-modal
    v-model:open="modalOpen"
    :title="category ? `编排顺序：${category.name}` : '编排文章顺序'"
    width="860px"
    :footer="null"
    destroy-on-close
    class="article-order-modal"
    @cancel="handleClose"
  >
    <div class="article-order-modal__toolbar">
      <a-space size="small">
        <a-tag :bordered="false">共 {{ articles.length }} 篇</a-tag>
        <a-tag v-if="dirty" color="orange" :bordered="false">未保存</a-tag>
      </a-space>
      <a-space size="small">
        <a-tooltip title="刷新">
          <a-button size="small" :loading="loading" @click="loadArticles">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-button type="primary" size="small" :disabled="!dirty || loading" :loading="saving" @click="saveOrder">
          <template #icon><SaveOutlined /></template>
          保存排序
        </a-button>
      </a-space>
    </div>

    <div class="article-order-modal__body">
      <a-spin :spinning="loading">
        <a-empty v-if="!articles.length" description="当前分类暂无直接文章" />
        <div v-else class="article-order-list">
          <div
            v-for="(article, index) in articles"
            :key="article.id"
            :class="[
              'article-order-row',
              {
                'is-dragging': draggingArticleId === article.id,
                'is-drop-before': dragOverArticleId === article.id && dragOverPlacement === 'before',
                'is-drop-after': dragOverArticleId === article.id && dragOverPlacement === 'after'
              }
            ]"
            @dragover.prevent="handleDragOver($event, index)"
            @dragleave="handleDragLeave(article.id)"
            @drop.prevent="handleDrop(index)"
          >
            <span
              class="article-order-row__handle"
              title="拖拽调整顺序"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragend="clearDraggingState"
            >
              <MenuOutlined />
            </span>
            <span class="article-order-row__index">{{ index + 1 }}</span>
            <div class="article-order-row__main">
              <strong>{{ article.title }}</strong>
              <span>{{ article.summary || '暂无摘要' }}</span>
            </div>
            <span class="article-order-row__order">{{ article.sortOrder || 0 }}</span>
            <a-space size="small" class="article-order-row__actions">
              <a-tooltip title="置顶">
                <a-button size="small" :disabled="index === 0" @click="moveArticle(index, 0)">
                  <template #icon><VerticalAlignTopOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="上移">
                <a-button size="small" :disabled="index === 0" @click="moveArticle(index, index - 1)">
                  <template #icon><ArrowUpOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="下移">
                <a-button size="small" :disabled="index === articles.length - 1" @click="moveArticle(index, index + 1)">
                  <template #icon><ArrowDownOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="置底">
                <a-button size="small" :disabled="index === articles.length - 1" @click="moveArticle(index, articles.length - 1)">
                  <template #icon><VerticalAlignBottomOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-space>
          </div>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MenuOutlined,
  ReloadOutlined,
  SaveOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined
} from '@ant-design/icons-vue'
import { listAdminCategoryArticles, reorderAdminCategoryArticles } from '@/services/admin'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'saved'])

const loading = ref(false)
const saving = ref(false)
const dirty = ref(false)
const articles = ref([])
const draggingIndex = ref(-1)
const draggingArticleId = ref('')
const dragOverArticleId = ref('')
const dragOverPlacement = ref('')

const modalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

function normalizeRows(rows = []) {
  return rows.map((row, index) => ({
    ...row,
    sortOrder: Number(row.sortOrder || (index + 1) * 10)
  }))
}

async function collectCategoryArticles() {
  const items = []
  let page = 1
  let total = 0

  do {
    const result = await listAdminCategoryArticles(props.category.id, {
      page,
      pageSize: 100,
      includeDescendants: 0
    })
    const pageItems = Array.isArray(result.items) ? result.items : []
    items.push(...pageItems)
    total = Number(result.total || pageItems.length)
    page += 1
  } while (items.length < total)

  return items
}

async function loadArticles() {
  if (!props.category?.id) {
    articles.value = []
    dirty.value = false
    return
  }

  loading.value = true
  try {
    articles.value = normalizeRows(await collectCategoryArticles())
    dirty.value = false
  } catch (error) {
    message.error(error.message || '文章加载失败')
  } finally {
    loading.value = false
  }
}

function moveArticle(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return
  }

  applyArticleOrderMove(fromIndex, toIndex)
}

function applyArticleOrderMove(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= articles.value.length) {
    return
  }

  const boundedToIndex = Math.min(toIndex, articles.value.length - 1)
  const next = [...articles.value]
  const [item] = next.splice(fromIndex, 1)
  next.splice(boundedToIndex, 0, item)
  articles.value = next.map((article, index) => ({
    ...article,
    sortOrder: (index + 1) * 10
  }))
  dirty.value = true
}

function handleDragStart(event, index) {
  draggingIndex.value = index
  draggingArticleId.value = articles.value[index]?.id || ''
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', draggingArticleId.value)
}

function handleDragOver(event, index) {
  if (draggingIndex.value < 0 || draggingIndex.value === index) {
    dragOverArticleId.value = ''
    dragOverPlacement.value = ''
    return
  }

  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  const placement = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  dragOverArticleId.value = articles.value[index]?.id || ''
  dragOverPlacement.value = placement
}

function handleDragLeave(articleId) {
  if (dragOverArticleId.value !== articleId) {
    return
  }

  dragOverArticleId.value = ''
  dragOverPlacement.value = ''
}

function handleDrop(index) {
  if (draggingIndex.value < 0 || draggingIndex.value === index) {
    clearDraggingState()
    return
  }

  let targetIndex = dragOverPlacement.value === 'after' ? index + 1 : index
  if (draggingIndex.value < targetIndex) {
    targetIndex -= 1
  }
  applyArticleOrderMove(draggingIndex.value, targetIndex)
  clearDraggingState()
}

function clearDraggingState() {
  draggingIndex.value = -1
  draggingArticleId.value = ''
  dragOverArticleId.value = ''
  dragOverPlacement.value = ''
}

async function saveOrder() {
  if (!props.category?.id || !articles.value.length) {
    return
  }

  saving.value = true
  try {
    await reorderAdminCategoryArticles(props.category.id, articles.value.map((article, index) => ({
      id: article.id,
      sortOrder: (index + 1) * 10
    })))
    message.success('文章顺序已保存')
    dirty.value = false
    emit('saved')
    await loadArticles()
  } catch (error) {
    message.error(error.message || '保存排序失败')
  } finally {
    saving.value = false
  }
}

function handleClose() {
  modalOpen.value = false
}

watch(() => props.open, (open) => {
  if (open) {
    loadArticles()
  }
})
</script>

<style scoped>
.article-order-modal :deep(.ant-modal-body) {
  max-height: min(72vh, 720px);
  padding: 0;
  overflow: hidden;
}

.article-order-modal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.article-order-modal__body {
  max-height: min(62vh, 620px);
  padding: 12px;
  overflow-y: auto;
  background: var(--console-surface);
}

.article-order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-order-row {
  display: grid;
  grid-template-columns: 28px 42px minmax(0, 1fr) 64px auto;
  align-items: center;
  gap: 12px;
  min-height: 66px;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface);
  position: relative;
  transition: border-color 0.16s ease, background-color 0.16s ease, opacity 0.16s ease;
}

.article-order-row::before,
.article-order-row::after {
  position: absolute;
  right: 10px;
  left: 10px;
  height: 2px;
  border-radius: 2px;
  background: var(--console-primary-strong);
  opacity: 0;
  content: '';
}

.article-order-row::before {
  top: -5px;
}

.article-order-row::after {
  bottom: -5px;
}

.article-order-row.is-dragging {
  opacity: 0.48;
  border-style: dashed;
}

.article-order-row.is-drop-before::before,
.article-order-row.is-drop-after::after {
  opacity: 1;
}

.article-order-row__handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 32px;
  color: var(--console-text-secondary);
  cursor: grab;
  user-select: none;
  transition: color 0.16s ease;
}

.article-order-row__handle:hover {
  color: var(--console-primary-strong);
}

.article-order-row__handle:active {
  cursor: grabbing;
}

.article-order-row__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--console-text-secondary);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  background: var(--console-surface-muted);
}

.article-order-row__main {
  min-width: 0;
}

.article-order-row__main strong {
  display: block;
  overflow: hidden;
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-order-row__main span {
  display: block;
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-order-row__order {
  color: var(--console-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.article-order-row__actions {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .article-order-row {
    grid-template-columns: 28px 36px minmax(0, 1fr);
  }

  .article-order-row__order,
  .article-order-row__actions {
    grid-column: 3;
  }

  .article-order-row__actions {
    justify-content: flex-start;
  }
}
</style>
