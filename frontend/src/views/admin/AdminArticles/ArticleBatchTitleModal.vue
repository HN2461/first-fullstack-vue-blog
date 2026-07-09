<template>
  <a-modal
    :open="open"
    :title="`批量改标题（${selectedCount} 篇）`"
    width="980px"
    wrap-class-name="business-modal batch-title-modal-wrap"
    :confirm-loading="submitting"
    centered
    @cancel="handleClose"
  >
    <div class="batch-title">
      <div class="batch-title-tools">
        <div class="batch-title-tools__row">
          <a-input
            v-model:value="findText"
            placeholder="查找内容"
            allow-clear
            :disabled="loading || submitting"
          />
          <a-input
            v-model:value="replaceText"
            placeholder="替换为"
            allow-clear
            :disabled="loading || submitting"
          />
          <a-button :disabled="loading || submitting" @click="handleReplace">应用替换</a-button>
        </div>

        <div class="batch-title-tools__row">
          <a-input
            v-model:value="prefixText"
            placeholder="要移除的开头前缀"
            allow-clear
            :disabled="loading || submitting"
          />
          <a-button :disabled="loading || submitting" @click="handleRemovePrefix">移除前缀</a-button>
          <a-button :disabled="loading || submitting" @click="$emit('reset-titles')">重置</a-button>
        </div>
      </div>

      <a-alert
        v-if="result"
        class="batch-title__result"
        type="info"
        show-icon
        :message="resultMessage"
      />

      <a-spin :spinning="loading">
        <div v-if="rows.length === 0" class="batch-title-empty">暂无可编辑文章</div>
        <div v-else class="batch-title-table">
          <div class="batch-title-table__head">
            <span>文章</span>
            <span>新标题</span>
            <span>状态</span>
          </div>

          <div
            v-for="(row, index) in rows"
            :key="row.id"
            class="batch-title-row"
            :class="{
              'is-changed': isRowChanged(row),
              'is-disabled': !row.available,
              'is-error': getRowError(row)
            }"
          >
            <div class="batch-title-row__article">
              <span class="batch-title-row__index">{{ index + 1 }}</span>
              <div>
                <strong>{{ row.oldTitle || row.id }}</strong>
                <span>{{ row.slug || '无 slug' }}</span>
              </div>
            </div>

            <div class="batch-title-row__editor">
              <a-input
                :value="row.nextTitle"
                :maxlength="120"
                show-count
                allow-clear
                :disabled="!row.available || loading || submitting"
                :status="getRowError(row) ? 'error' : undefined"
                placeholder="输入新标题"
                @update:value="(value) => $emit('update-title', row.id, value)"
              />
              <span v-if="getRowError(row)" class="batch-title-row__error">{{ getRowError(row) }}</span>
              <span v-else-if="row.messages?.length" class="batch-title-row__error">{{ row.messages.join('；') }}</span>
            </div>

            <div class="batch-title-row__status">
              <a-tag :color="getArticleStatusColor(row.articleStatus)" :bordered="false">
                {{ getArticleStatusLabel(row.articleStatus) }}
              </a-tag>
              <a-tag v-if="isRowChanged(row)" color="blue" :bordered="false">待更新</a-tag>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <template #footer>
      <div class="batch-title__footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button
          type="primary"
          :loading="submitting"
          :disabled="loading || rows.length === 0"
          @click="handleSubmit"
        >
          {{ changedCount > 0 ? `保存 ${changedCount} 篇标题` : '保存标题' }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] },
  result: { type: Object, default: null }
})

const emit = defineEmits([
  'update:open',
  'submit',
  'replace-titles',
  'remove-prefix',
  'reset-titles',
  'update-title'
])

const findText = ref('')
const replaceText = ref('')
const prefixText = ref('')

const changedRows = computed(() => props.rows.filter((row) => row.available && isRowChanged(row)))
const changedCount = computed(() => changedRows.value.length)
const resultMessage = computed(() => {
  if (!props.result) return ''
  return `已处理 ${props.result.total || 0} 篇，更新 ${props.result.updatedCount || 0} 篇，未变化 ${props.result.unchangedCount || 0} 篇，跳过 ${props.result.skippedCount || 0} 篇。`
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      findText.value = ''
      replaceText.value = ''
      prefixText.value = ''
    }
  }
)

function isRowChanged(row) {
  return String(row.nextTitle || '').trim() !== String(row.oldTitle || '').trim()
}

function getRowError(row) {
  if (!row.available) return ''

  const title = String(row.nextTitle || '').trim()
  if (!title) return '标题不能为空'
  if (title.length > 120) return '标题不能超过 120 个字符'
  return ''
}

function validateRows() {
  const invalid = props.rows.find((row) => getRowError(row))
  if (invalid) {
    message.warning('请先修正标题错误')
    return false
  }

  if (changedRows.value.length === 0) {
    message.warning('没有需要保存的标题变化')
    return false
  }

  return true
}

function handleReplace() {
  const keyword = findText.value
  if (!keyword) {
    message.warning('请填写查找内容')
    return
  }

  emit('replace-titles', {
    findText: keyword,
    replaceText: replaceText.value
  })
}

function handleRemovePrefix() {
  const prefix = prefixText.value
  if (!prefix) {
    message.warning('请填写要移除的开头前缀')
    return
  }

  emit('remove-prefix', prefix)
}

function handleSubmit() {
  if (!validateRows()) {
    return
  }

  emit('submit', changedRows.value.map((row) => ({
    id: row.id,
    title: String(row.nextTitle || '').trim()
  })))
}

function handleClose() {
  emit('update:open', false)
}

function getArticleStatusLabel(status) {
  if (status === 'published') return '已发布'
  if (status === 'draft') return '草稿'
  if (status === 'archived') return '已下架'
  return '不可用'
}

function getArticleStatusColor(status) {
  if (status === 'published') return 'green'
  if (status === 'draft') return 'default'
  if (status === 'archived') return 'orange'
  return 'red'
}
</script>
