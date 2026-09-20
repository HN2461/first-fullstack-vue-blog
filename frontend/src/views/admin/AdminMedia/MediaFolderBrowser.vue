<template>
  <section class="media-folder-browser">
    <div class="media-folder-browser__toolbar">
      <div class="media-folder-browser__path">
        <a-button v-if="activeFolder" type="text" size="small" aria-label="返回资源文件夹" @click="emit('back')">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <button type="button" class="media-folder-browser__crumb" @click="emit('back')">
          <FolderOutlined />
          <span>全部资源</span>
        </button>
        <template v-if="activeFolder">
          <RightOutlined class="media-folder-browser__separator" />
          <strong :title="activeFolder.name">{{ activeFolder.name }}</strong>
        </template>
      </div>
      <div class="media-folder-browser__tools">
        <a-input-search
          v-model:value="keywordDraft"
          allow-clear
          size="small"
          :placeholder="activeFolder ? '搜索当前文件夹' : '搜索文件夹名称'"
          @search="submitKeyword"
          @press-enter="submitKeyword"
        />
        <a-button
          type="primary"
          size="small"
          :disabled="Boolean(activeFolder && !canUploadCurrentFolder)"
          @click="emit('upload', activeFolder || '')"
        >
          <template #icon><UploadOutlined /></template>
          <span class="media-folder-browser__upload-label">{{ activeFolder && !canUploadCurrentFolder ? '当前分类不可上传' : (activeFolder ? '上传到此处' : '上传资源') }}</span>
        </a-button>
      </div>
    </div>

    <div v-if="!activeFolder" class="media-folder-browser__root">
      <div class="media-folder-browser__section-heading">
        <div>
          <strong>自定义资源分类</strong>
          <span>按你创建的资源分类快速浏览文件</span>
        </div>
        <a-button type="link" size="small" @click="emit('manage-categories')">管理分类</a-button>
      </div>
      <div v-if="visibleCustomFolders.length" class="media-folder-browser__folder-grid">
        <MediaFolderCard v-for="folder in visibleCustomFolders" :key="folder.id || `${folder.owner || 'system'}-${folder.name}`" :folder="folder" @open="openFolder" />
      </div>
      <a-empty v-else class="media-folder-browser__empty" description="还没有自定义分类" />

      <div class="media-folder-browser__section-heading media-folder-browser__section-heading--system">
        <div>
          <strong>系统资源</strong>
          <span>文章图片、原始文档和历史登记资源仍由媒体治理流程维护</span>
        </div>
      </div>
      <div class="media-folder-browser__folder-grid">
        <MediaFolderCard v-for="folder in visibleSystemFolders" :key="folder.id || `${folder.owner || 'system'}-${folder.name}`" :folder="folder" @open="openFolder" />
      </div>
    </div>

    <template v-else>
      <div class="media-folder-browser__content-heading">
        <div>
          <strong>{{ activeFolder.name }}</strong>
          <span>{{ total }} 个资源<span v-if="activeFolder.ownerName"> · {{ activeFolder.ownerName }}</span></span>
        </div>
        <MediaBatchActions
          v-if="selectedKeys.length"
          :count="selectedKeys.length"
          :can-manage-shares="canManageShares"
          @download="emit('batch-download')"
          @move="emit('batch-move')"
          @share="emit('batch-share')"
          @delete="emit('batch-delete')"
          @clear="emit('clear-selection')"
        />
      </div>
      <MediaFileGrid
        :items="items"
        :loading="loading"
        :total="total"
        :page="page"
        :page-size="pageSize"
        :selected-keys="selectedKeys"
        @page-change="emit('page-change', $event)"
        @selection-change="handleSelectionChange"
        @view="emit('view', $event)"
        @download="emit('download', $event)"
        @rename="emit('rename', $event)"
        @move="emit('move', $event)"
        @references="emit('references', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeftOutlined, FolderOutlined, RightOutlined, UploadOutlined } from '@ant-design/icons-vue'
import MediaBatchActions from './MediaBatchActions.vue'
import MediaFileGrid from './MediaFileGrid.vue'
import MediaFolderCard from './MediaFolderCard.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  activeFolderId: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 24 },
  keyword: { type: String, default: '' },
  selectedKeys: { type: Array, default: () => [] },
  canManageShares: { type: Boolean, default: false },
  currentUserId: { type: String, default: '' }
})

const emit = defineEmits([
  'open-folder',
  'back',
  'upload',
  'manage-categories',
  'search',
  'page-change',
  'selection-change',
  'view',
  'download',
  'rename',
  'move',
  'references',
  'delete',
  'batch-download',
  'batch-move',
  'batch-share',
  'batch-delete',
  'clear-selection'
])

const keywordDraft = ref(props.keyword)
const activeFolder = computed(() => props.categories.find((item) => (
  (item.id && String(item.id) === String(props.activeFolderId)) ||
  ((!item.id || item.system) && item.name === props.activeFolderId)
)) || null)
const customFolders = computed(() => props.categories.filter((item) => !item.system && item.id))
const systemFolders = computed(() => props.categories.filter((item) => item.system || !item.id))
const selectedKeys = computed(() => props.selectedKeys.map(String))
const canUploadCurrentFolder = computed(() => (
  !activeFolder.value || (
    !activeFolder.value.virtual && (
      activeFolder.value.system || String(activeFolder.value.owner || '') === String(props.currentUserId || '')
    )
  )
))
const folderMatchesKeyword = (item) => !props.keyword || String(item.name || '').toLowerCase().includes(props.keyword.toLowerCase())
const visibleCustomFolders = computed(() => customFolders.value.filter(folderMatchesKeyword))
const visibleSystemFolders = computed(() => systemFolders.value.filter(folderMatchesKeyword))

watch(() => props.keyword, (value) => {
  keywordDraft.value = value
})

function submitKeyword() {
  emit('search', keywordDraft.value.trim())
}

function handleSelectionChange(keys, rows) {
  emit('selection-change', keys, rows)
}

function openFolder(folder) {
  emit('open-folder', folder)
}
</script>

<style scoped>
.media-folder-browser {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.media-folder-browser__toolbar,
.media-folder-browser__content-heading,
.media-folder-browser__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex: 0 0 auto;
}

.media-folder-browser__toolbar {
  min-height: 42px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--console-border);
}

.media-folder-browser__path,
.media-folder-browser__tools {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.media-folder-browser__path strong,
.media-folder-browser__content-heading strong,
.media-folder-browser__section-heading strong {
  color: var(--console-text);
  font-size: 15px;
  font-weight: 600;
}

.media-folder-browser__crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  color: var(--console-primary-strong);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}

.media-folder-browser__separator {
  color: var(--console-text-secondary);
  font-size: 11px;
}

.media-folder-browser__tools :deep(.ant-input-search) {
  width: 240px;
}

.media-folder-browser__root,
.media-folder-browser__content-heading {
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}

.media-folder-browser__root {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 2px;
  overflow-y: auto;
}

.media-folder-browser__section-heading {
  align-items: flex-start;
}

.media-folder-browser__section-heading > div,
.media-folder-browser__content-heading > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.media-folder-browser__section-heading span,
.media-folder-browser__content-heading span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.media-folder-browser__section-heading--system {
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--console-border);
}

.media-folder-browser__folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.media-folder-browser__empty {
  padding: 20px 0;
  border: 1px dashed var(--console-border);
  border-radius: 8px;
}

.media-folder-browser__content-heading {
  overflow: visible;
}

@media (max-width: 720px) {
  .media-folder-browser__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .media-folder-browser__tools {
    width: 100%;
  }

  .media-folder-browser__tools :deep(.ant-input-search) {
    width: auto;
    flex: 1;
  }

  .media-folder-browser__folder-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .media-folder-card {
    min-height: 100px;
    padding: 12px;
  }

  .media-folder-card__icon {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 17px;
  }

  .media-folder-card__arrow {
    display: none;
  }

  .media-folder-browser__content-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 420px) {
  .media-folder-browser__folder-grid {
    grid-template-columns: 1fr;
  }

  .media-folder-browser__upload-label {
    display: none;
  }
}
</style>
