<template>
  <a-modal
    :open="open"
    :title="mode === 'folder' ? folderTitle : bookmarkTitle"
    :width="640"
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    :destroy-on-close="true"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-form v-if="mode === 'folder'" layout="vertical">
      <a-form-item label="文件夹名称" required>
        <a-input v-model:value.trim="folderForm.name" :maxlength="120" placeholder="例如：技术文档" />
      </a-form-item>
      <a-form-item label="上级文件夹">
        <a-select
          v-model:value="folderForm.parentId"
          show-search
          option-filter-prop="label"
          :options="folderOptions"
          allow-clear
          placeholder="根目录"
        />
      </a-form-item>
    </a-form>

    <a-form v-else layout="vertical">
      <a-form-item label="书签名称">
        <a-input v-model:value.trim="bookmarkForm.title" :maxlength="240" placeholder="留空时使用 URL" />
      </a-form-item>
      <a-form-item label="URL 地址" required>
        <a-input v-model:value.trim="bookmarkForm.url" :maxlength="2048" placeholder="https://example.com" />
      </a-form-item>
      <a-form-item label="文件夹">
        <a-select
          v-model:value="bookmarkForm.folderId"
          show-search
          option-filter-prop="label"
          :options="folderOptions"
          allow-clear
          placeholder="根目录"
        />
      </a-form-item>
      <a-form-item label="标签">
        <a-input v-model:value="bookmarkForm.tagsText" :maxlength="180" placeholder="多个标签用逗号或空格分隔" />
      </a-form-item>
      <a-form-item label="备注">
        <a-textarea
          v-model:value="bookmarkForm.note"
          :maxlength="1000"
          :auto-size="{ minRows: 4, maxRows: 8 }"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { parseTags } from './bookmarkUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'bookmark' },
  item: { type: Object, default: null },
  folders: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'submit'])

const folderForm = reactive({ name: '', parentId: null })
const bookmarkForm = reactive({ title: '', url: '', folderId: null, tagsText: '', note: '' })
const folderTitle = computed(() => props.item?.id ? '编辑文件夹' : '新建文件夹')
const bookmarkTitle = computed(() => props.item?.id ? '编辑书签' : '新增书签')
const folderOptions = computed(() => props.folders
  .filter((folder) => folder.id !== props.item?.id)
  .map((folder) => ({
    label: `${'　'.repeat(folder.level || 0)}${folder.name}`,
    value: folder.id
  })))

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    if (props.mode === 'folder') {
      folderForm.name = props.item?.name || ''
      folderForm.parentId = props.item?.parentId || null
    } else {
      bookmarkForm.title = props.item?.title || ''
      bookmarkForm.url = props.item?.url || ''
      bookmarkForm.folderId = props.item?.folderId || null
      bookmarkForm.tagsText = (props.item?.tags || []).join('，')
      bookmarkForm.note = props.item?.note || ''
    }
  }
)

function submit() {
  if (props.mode === 'folder') {
    if (!folderForm.name.trim()) {
      message.warning('请输入文件夹名称')
      return
    }
    emit('submit', { name: folderForm.name.trim(), parentId: folderForm.parentId || null })
    return
  }

  if (!bookmarkForm.url.trim()) {
    message.warning('请输入书签 URL')
    return
  }
  emit('submit', {
    title: bookmarkForm.title.trim(),
    url: bookmarkForm.url.trim(),
    folderId: bookmarkForm.folderId || null,
    tags: parseTags(bookmarkForm.tagsText),
    note: bookmarkForm.note.trim()
  })
}
</script>
