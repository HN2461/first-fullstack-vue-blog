<template>
  <a-modal
    :open="open"
    title="资源引用详情"
    :footer="null"
    width="760px"
    centered
    :body-style="{ maxHeight: '72vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <a-spin :spinning="loading" tip="正在扫描引用...">
      <div v-if="detail" class="media-reference">
        <div class="media-reference__summary">
          <div>
            <strong>{{ detail.media.originalName }}</strong>
            <span>{{ detail.media.url }}</span>
          </div>
          <a-tag :color="detail.summary.referenceCount > 0 ? 'green' : 'orange'" :bordered="false">
            {{ detail.summary.usageStatusLabel }} · {{ detail.summary.referenceCount }} 处
          </a-tag>
        </div>

        <div v-if="detail.references.length === 0" class="media-reference__empty">
          当前没有扫描到文章、用户头像或系统设置引用，可结合业务确认后移入回收站。
        </div>

        <div v-else class="media-reference__list">
          <article
            v-for="item in detail.references"
            :key="`${item.type}-${item.ownerId}-${item.ownerTitle}`"
            class="media-reference__item"
          >
            <div class="media-reference__item-main">
              <a-tag :bordered="false" color="blue">{{ item.typeLabel }}</a-tag>
              <div>
                <strong>{{ item.ownerTitle }}</strong>
                <span>{{ item.ownerSubtitle || '无补充信息' }}</span>
              </div>
            </div>
            <a-button
              v-if="item.routePath"
              type="link"
              size="small"
              @click="goTo(item.routePath)"
            >
              打开
            </a-button>
          </article>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAdminMediaReferences } from '@/services/admin'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null }
})

const emit = defineEmits(['update:open'])
const router = useRouter()
const loading = ref(false)
const detail = ref(null)

watch(
  () => [props.open, props.record?.id],
  async ([visible, id]) => {
    if (!visible || !id) {
      detail.value = null
      return
    }

    loading.value = true
    try {
      detail.value = await getAdminMediaReferences(id)
    } catch (error) {
      message.error(error.message || '引用详情加载失败')
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

function goTo(path) {
  emit('update:open', false)
  router.push(path)
}
</script>

<style scoped>
.media-reference {
  display: grid;
  gap: 14px;
}

.media-reference__summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.media-reference__summary > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.media-reference__summary strong,
.media-reference__item strong {
  color: var(--text-primary);
  font-weight: 600;
}

.media-reference__summary span,
.media-reference__item span,
.media-reference__empty {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.media-reference__empty {
  padding: 24px 12px;
  text-align: center;
}

.media-reference__list {
  display: grid;
  gap: 8px;
}

.media-reference__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-elevated);
}

.media-reference__item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.media-reference__item-main > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}
</style>
