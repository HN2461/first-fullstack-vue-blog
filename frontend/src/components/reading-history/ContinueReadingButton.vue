<template>
  <a-tooltip v-if="latestRecord" :title="`${latestRecord.article.title} · 已读 ${Math.round(latestRecord.progressPercent)}%`">
    <a-button @click="continueReading">
      <template #icon><HistoryOutlined /></template>
      继续阅读 {{ Math.round(latestRecord.progressPercent) }}%
    </a-button>
  </a-tooltip>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HistoryOutlined } from '@ant-design/icons-vue'
import { listArticleReadingProgress } from '@/services/readingProgress'
import { getReadingHistoryArticlePath } from '@/utils/readingHistory'

const router = useRouter()
const latestRecord = ref(null)

async function loadLatestRecord() {
  try {
    const result = await listArticleReadingProgress({ status: 'unfinished', pageSize: 1 })
    latestRecord.value = result?.items?.[0] || null
  } catch {
    latestRecord.value = null
  }
}

function continueReading() {
  if (!latestRecord.value?.article?.slug) return
  router.push(getReadingHistoryArticlePath(latestRecord.value.article.slug, { resume: true }))
}

onMounted(loadLatestRecord)
</script>
