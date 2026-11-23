<template>
  <a-modal :open="open" title="发布历史" width="800px" :footer="null" @cancel="$emit('close')">
    <div class="history-body">
      <a-spin :spinning="loading">
        <a-empty v-if="!loading && !items.length" description="暂无被替换的发布版本" />
        <a-list v-else :data-source="items">
          <template #renderItem="{ item }">
            <a-list-item>
              <span>第 {{ item.number }} 版 · {{ new Date(item.savedAt).toLocaleString() }} {{ item.author }}</span>
              <a-button type="link" @click="inspect(item.number)">比较</a-button>
            </a-list-item>
          </template>
        </a-list>
        <a-button v-if="hasMore" @click="loadMore">加载更早版本</a-button>
      </a-spin>
      <template v-if="selected">
        <ArticleRevisionDiff :before="current" :after="selected" before-label="编辑中" :after-label="`历史第 ${number} 版`" :categories="categories" :tags="tags" />
        <a-popconfirm title="用此版本替换编辑区当前输入？保存或发布后生效。" @confirm="$emit('restore', selected)">
          <a-button>将第 {{ number }} 版载入编辑区</a-button>
        </a-popconfirm>
      </template>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getArticleRevision, listArticleRevisions } from '@/services/articleEditor'
import ArticleRevisionDiff from './ArticleRevisionDiff.vue'

const props = defineProps({ open: Boolean, articleId: String, current: Object, categories: Array, tags: Array })
defineEmits(['restore', 'close'])
const items = ref([])
const selected = ref(null)
const number = ref(0)
const hasMore = ref(false)
const loading = ref(false)
let generation = 0
let selectedRequest = 0
watch(() => [props.open, props.articleId], () => {
  generation++
  items.value = []
  selected.value = null
  hasMore.value = false
  loading.value = false
  if (props.open && props.articleId) loadMore()
}, { immediate: true })
async function loadMore() {
  if (loading.value) return
  const request = generation
  loading.value = true
  try {
    const page = await listArticleRevisions(props.articleId, items.value.at(-1)?.number)
    if (request !== generation) return
    items.value.push(...page.items)
    hasMore.value = page.hasMore
  } catch (error) {
    if (request === generation) message.error(error.message || '读取发布历史失败')
  } finally {
    if (request === generation) loading.value = false
  }
}
async function inspect(target) {
  const request = ++selectedRequest
  const session = generation
  selected.value = null
  try {
    const content = await getArticleRevision(props.articleId, target)
    if (request !== selectedRequest || session !== generation) return
    number.value = target
    selected.value = content
  } catch (error) {
    if (request === selectedRequest && session === generation) message.error(error.message || '读取历史稿件失败')
  }
}
</script>

<style scoped>
.history-body { max-height: min(65vh, 680px); overflow: auto; }
</style>
