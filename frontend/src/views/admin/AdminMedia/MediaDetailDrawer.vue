<template>
  <a-drawer
    :open="open"
    title="资源详情"
    width="min(680px, 100vw)"
    placement="right"
    :destroy-on-close="true"
    :body-style="{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: '12px 16px', overflow: 'hidden' }"
    @close="$emit('update:open', false)"
  >
    <template v-if="record">
      <div class="media-detail__heading">
        <strong :title="record.originalName">{{ record.originalName }}</strong>
        <a-tag :bordered="false">{{ scopeLabel }}</a-tag>
      </div>
      <a-tabs v-model:active-key="tab" class="media-detail__tabs" size="small" :animated="false">
        <a-tab-pane key="info" tab="文件信息">
          <div class="media-detail__scroll">
            <div v-if="record.kind === 'image'" class="media-detail__image">
              <ResourceImage :src="record.url" :alt="record.originalName" />
            </div>
            <a-descriptions :column="1" size="small" bordered>
              <a-descriptions-item label="分类">{{ record.category || '未分类' }}</a-descriptions-item>
              <a-descriptions-item label="来源">
                {{ resourceSceneOptions.find((item) => item.value === record.scene)?.label || '历史素材' }}
              </a-descriptions-item>
              <a-descriptions-item label="上传人">{{ record.uploader?.username || '—' }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">{{ formatMediaSize(record.size) }}</a-descriptions-item>
              <a-descriptions-item label="保留状态">
                {{
                  resourceLifecycleOptions.find((item) => item.value === record.lifecycleStatus)?.label || '长期保留'
                }}
              </a-descriptions-item>
              <a-descriptions-item label="上传时间">
                {{ record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="访问地址">
                <a-typography-text :copyable="{ text: record.url }">{{ record.url }}</a-typography-text>
              </a-descriptions-item>
            </a-descriptions>
            <a-alert v-if="restrictions.moveReason" :message="restrictions.moveReason" type="info" show-icon />
          </div>
        </a-tab-pane>
        <a-tab-pane key="usage" tab="使用位置">
          <MediaReferencePanel
            :open="open && tab === 'usage'"
            :record="record"
            @loaded="referenceCount = $event.summary.referenceCount"
            @navigate="$emit('update:open', false)"
          />
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #footer>
      <a-space wrap size="small">
        <a-button size="small" @click="$emit('preview', record)">完整预览</a-button>
        <a-button size="small" @click="$emit('download', record)">下载</a-button>
        <a-button size="small" @click="$emit('rename', record)">重命名</a-button>
        <a-tooltip :title="restrictions.moveReason">
          <a-button size="small" :disabled="Boolean(restrictions.moveReason)" @click="$emit('move', record)">
            调整分类
          </a-button>
        </a-tooltip>
        <a-tooltip :title="restrictions.deleteReason">
          <a-button size="small" danger :disabled="Boolean(restrictions.deleteReason)" @click="$emit('delete', record)">
            移入回收站
          </a-button>
        </a-tooltip>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ResourceImage from '@/components/resources/ResourceImage.vue'
import MediaReferencePanel from './MediaReferencePanel.vue'
import {
  formatMediaSize,
  getMediaActionRestrictions,
  resourceSceneOptions,
  resourceLifecycleOptions
} from './mediaWorkspace'

const props = defineProps({
  open: Boolean,
  record: { type: Object, default: null },
  initialTab: { type: String, default: 'info' }
})
defineEmits(['update:open', 'preview', 'download', 'rename', 'move', 'delete'])
const tab = ref('info')
const referenceCount = ref(null)
watch(
  () => [props.open, props.record?.id, props.initialTab],
  () => {
    tab.value = props.initialTab
    referenceCount.value = null
  }
)
const restrictions = computed(() =>
  getMediaActionRestrictions({
    ...props.record,
    usage: { ...props.record?.usage, referenceCount: referenceCount.value ?? props.record?.usage?.referenceCount }
  })
)
const scopeLabel = computed(
  () => ({ public: '公开', private: '私人', vault: '密码箱' })[props.record?.accessScope] || '公开'
)
</script>

<style scoped>
.media-detail__heading {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-shrink: 0;
}
.media-detail__heading strong {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.media-detail__tabs {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}
.media-detail__tabs :deep(.ant-tabs-content-holder),
.media-detail__tabs :deep(.ant-tabs-content),
.media-detail__tabs :deep(.ant-tabs-tabpane-active) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.media-detail__scroll {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}
.media-detail__scroll :deep(.ant-descriptions-item-content) {
  overflow-wrap: anywhere;
}
.media-detail__image {
  display: grid;
  place-items: center;
  height: min(26vh, 200px);
  min-height: 100px;
  flex-shrink: 0;
  background: var(--console-surface-muted);
  border-radius: 6px;
  overflow: hidden;
}
.media-detail__image :deep(img) {
  width: 100%;
  height: 100%;
  max-height: min(26vh, 200px);
  object-fit: contain;
}
</style>
