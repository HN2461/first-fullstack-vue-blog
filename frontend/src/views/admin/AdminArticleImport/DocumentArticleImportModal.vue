<template>
  <a-modal
    :open="open"
    title="导入 Word 文档"
    width="680px"
    :confirm-loading="submitting"
    ok-text="导入为草稿"
    wrap-class-name="business-modal document-import-modal"
    centered
    destroy-on-close
    @ok="submit"
    @cancel="close"
  >
    <div class="document-import-modal__body">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item
          label="Word 文件"
          name="file"
          :rules="[{ required: true, message: '请选择 DOCX 文件' }]"
        >
          <a-upload-dragger
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            :multiple="false"
            :show-upload-list="false"
            :before-upload="selectFile"
          >
            <p class="ant-upload-drag-icon"><FileWordOutlined /></p>
            <p class="ant-upload-text">选择 DOCX 文件</p>
          </a-upload-dragger>
          <div v-if="form.file" class="document-import-modal__file">
            <FileWordOutlined />
            <strong>{{ form.file.name }}</strong>
            <span>{{ formatFileSize(form.file.size) }}</span>
            <a-button type="text" danger size="small" @click="clearFile">移除</a-button>
          </div>
        </a-form-item>

        <div class="document-import-modal__grid">
          <a-form-item
            label="文章标题"
            name="title"
            :rules="[{ required: true, whitespace: true, message: '请填写文章标题' }]"
          >
            <a-input v-model:value="form.title" :maxlength="120" show-count />
          </a-form-item>

          <a-form-item
            label="所属分类"
            name="categoryPath"
            :rules="[{ required: true, type: 'array', min: 1, message: '请选择所属分类' }]"
          >
            <a-cascader
              v-model:value="form.categoryPath"
              :options="categoryOptions"
              :loading="optionLoading"
              placeholder="请选择分类"
              change-on-select
              show-search
            />
          </a-form-item>
        </div>

        <a-form-item label="文章摘要" name="summary">
          <a-textarea
            v-model:value="form.summary"
            :rows="3"
            :maxlength="300"
            show-count
            placeholder="留空时从 Word 正文自动提取"
          />
        </a-form-item>

        <a-form-item label="文章标签" name="tags">
          <a-select
            v-model:value="form.tags"
            mode="multiple"
            :options="tagOptions"
            :loading="optionLoading"
            placeholder="可选"
            show-search
            option-filter-prop="label"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { FileWordOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { importDocumentArticle, listAllAdminCategories, listAllAdminTags } from '@/services/admin'
import { buildCategoryOptions } from '../AdminArticles/articleListUtils'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'imported'])
const formRef = ref(null)
const optionLoading = ref(false)
const submitting = ref(false)
const categoryOptions = ref([])
const tagOptions = ref([])
const form = reactive({
  file: null,
  title: '',
  summary: '',
  categoryPath: [],
  tags: []
})

function resetForm() {
  form.file = null
  form.title = ''
  form.summary = ''
  form.categoryPath = []
  form.tags = []
  formRef.value?.clearValidate?.()
}

function close() {
  emit('update:open', false)
}

function selectFile(file) {
  if (!/\.docx$/i.test(file.name || '')) {
    message.warning('请选择 .docx 文件')
    return false
  }
  form.file = file
  if (!form.title.trim()) {
    form.title = String(file.name || '').replace(/\.docx$/i, '')
  }
  formRef.value?.clearValidate?.('file')
  return false
}

function clearFile() {
  form.file = null
}

function formatFileSize(size = 0) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

async function loadOptions() {
  optionLoading.value = true
  try {
    const [categories, tags] = await Promise.all([
      listAllAdminCategories(),
      listAllAdminTags()
    ])
    categoryOptions.value = buildCategoryOptions(categories)
    tagOptions.value = tags.map((tag) => ({ label: tag.name, value: tag.id }))
  } catch (error) {
    message.error(error.message || '分类和标签加载失败')
  } finally {
    optionLoading.value = false
  }
}

async function submit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const categoryPath = Array.isArray(form.categoryPath) ? form.categoryPath : []
    const result = await importDocumentArticle(form.file, {
      title: form.title.trim(),
      summary: form.summary.trim(),
      category: categoryPath.at(-1),
      tags: form.tags
    })
    const modeLabel = result.readerMode === 'pdf' ? 'PDF 阅读版' : 'DOCX 只读模式'
    message.success(`Word 已导入，当前使用${modeLabel}`)
    emit('imported', result)
    close()
  } catch (error) {
    message.error(error.message || 'Word 文档导入失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) {
    resetForm()
    loadOptions()
  }
})
</script>

<style scoped>
.document-import-modal__body {
  max-height: min(68vh, 680px);
  overflow-y: auto;
  padding-inline: 2px 8px;
}

.document-import-modal__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.7fr);
  gap: 12px;
}

.document-import-modal__file {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  color: var(--console-text);
}

.document-import-modal__file strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-import-modal__file span {
  color: var(--console-text-secondary);
}

@media (max-width: 640px) {
  .document-import-modal__grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
