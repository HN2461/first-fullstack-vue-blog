<template>
  <a-drawer
    :open="open"
    title="批量整理文章信息"
    width="720"
    class="article-batch-meta-drawer"
    :body-style="{ padding: 0 }"
    @close="handleClose"
  >
    <div class="batch-meta">
      <div class="batch-meta__summary">
        <div>
          <strong>已选择 {{ selectedCount }} 篇文章</strong>
          <span>仅启用的字段会被批量修改。</span>
        </div>
        <a-tag color="processing" :bordered="false">批量设置</a-tag>
      </div>

      <a-form layout="vertical" class="batch-meta__form">
        <section class="batch-meta-section">
          <div class="batch-meta-section__head">
            <a-checkbox v-model:checked="form.category.enabled">分类</a-checkbox>
            <span>统一调整文章所属分类</span>
          </div>
          <div class="batch-meta-section__body" :class="{ 'is-disabled': !form.category.enabled }">
            <a-radio-group v-model:value="form.category.mode" button-style="solid" size="small">
              <a-radio-button value="overwrite">覆盖</a-radio-button>
              <a-radio-button value="fillEmpty">仅填空</a-radio-button>
              <a-radio-button value="clear">清空</a-radio-button>
            </a-radio-group>
            <a-tree-select
              v-model:value="form.category.value"
              :tree-data="categoryOptions"
              :disabled="!form.category.enabled || form.category.mode === 'clear'"
              show-search
              allow-clear
              tree-node-filter-prop="title"
              tree-default-expand-all
              placeholder="选择目标分类"
              class="batch-meta__control"
            />
          </div>
        </section>

        <section class="batch-meta-section">
          <div class="batch-meta-section__head">
            <a-checkbox v-model:checked="form.tags.enabled">标签</a-checkbox>
            <span>追加、替换或移除文章标签</span>
          </div>
          <div class="batch-meta-section__body" :class="{ 'is-disabled': !form.tags.enabled }">
            <a-radio-group v-model:value="form.tags.mode" button-style="solid" size="small">
              <a-radio-button value="append">追加</a-radio-button>
              <a-radio-button value="replace">替换</a-radio-button>
              <a-radio-button value="remove">移除</a-radio-button>
              <a-radio-button value="clear">清空</a-radio-button>
            </a-radio-group>
            <a-select
              v-model:value="form.tags.value"
              :disabled="!form.tags.enabled || form.tags.mode === 'clear'"
              :options="tagOptions"
              mode="multiple"
              show-search
              option-filter-prop="label"
              allow-clear
              placeholder="选择标签"
              class="batch-meta__control"
            />
          </div>
        </section>

        <section class="batch-meta-section">
          <div class="batch-meta-section__head">
            <a-checkbox v-model:checked="form.cover.enabled">封面</a-checkbox>
            <span>批量设置或清理封面地址</span>
          </div>
          <div class="batch-meta-section__body" :class="{ 'is-disabled': !form.cover.enabled }">
            <a-radio-group v-model:value="form.cover.mode" button-style="solid" size="small">
              <a-radio-button value="overwrite">覆盖</a-radio-button>
              <a-radio-button value="fillEmpty">仅填空</a-radio-button>
              <a-radio-button value="clear">清空</a-radio-button>
            </a-radio-group>
            <div class="batch-meta-cover-control">
              <a-input
                v-model:value="form.cover.value"
                :disabled="!form.cover.enabled || form.cover.mode === 'clear'"
                placeholder="输入封面图片地址，或从媒体资产选择"
                class="batch-meta__control"
                allow-clear
              />
              <a-button
                :disabled="form.cover.mode === 'clear'"
                @click="openCoverPicker"
              >
                选择资源
              </a-button>
            </div>
          </div>
        </section>

        <section class="batch-meta-section">
          <div class="batch-meta-section__head">
            <a-checkbox v-model:checked="form.status.enabled">状态</a-checkbox>
            <span>发布会逐篇检查标题、正文、摘要和分类</span>
          </div>
          <div class="batch-meta-section__body" :class="{ 'is-disabled': !form.status.enabled }">
            <a-radio-group v-model:value="form.status.value" button-style="solid" size="small">
              <a-radio-button value="draft">草稿</a-radio-button>
              <a-radio-button value="archived">下架</a-radio-button>
              <a-radio-button value="published">发布</a-radio-button>
            </a-radio-group>
          </div>
        </section>
      </a-form>

      <a-alert
        v-if="result"
        class="batch-meta__result"
        type="info"
        show-icon
        :message="resultMessage"
      />

      <div v-if="result?.items?.length" class="batch-meta-result-list">
        <div
          v-for="item in result.items"
          :key="item.id"
          class="batch-meta-result-item"
          :class="`is-${item.status}`"
        >
          <div>
            <strong>{{ item.title || item.id }}</strong>
            <span>{{ getItemStatusLabel(item) }}</span>
          </div>
          <p v-if="item.messages?.length">{{ item.messages.join('；') }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="batch-meta__footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">执行批量设置</a-button>
      </div>
    </template>
  </a-drawer>

  <a-modal
    v-model:open="coverPickerVisible"
    title="选择封面图片"
    width="820px"
    :footer="null"
    wrap-class-name="business-modal batch-cover-picker-modal"
    centered
  >
    <div class="batch-cover-picker">
      <div class="batch-cover-picker__toolbar">
        <a-input-search
          v-model:value="coverKeyword"
          placeholder="搜索图片名称"
          allow-clear
          style="width: 260px"
          @search="loadCoverMedia"
        />
        <a-button @click="loadCoverMedia">刷新</a-button>
      </div>

      <div v-if="coverMediaLoading" class="batch-cover-picker__status">正在加载图片资源...</div>
      <div v-else-if="coverMediaItems.length === 0" class="batch-cover-picker__status">暂无可用图片资源</div>
      <div v-else class="batch-cover-grid">
        <button
          v-for="item in coverMediaItems"
          :key="item.id"
          type="button"
          class="batch-cover-card"
          :class="{ 'is-selected': form.cover.value === item.url }"
          @click="selectCoverMedia(item)"
        >
          <img :src="item.url" :alt="item.originalName" loading="lazy">
          <span>{{ item.originalName }}</span>
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  categoryOptions: { type: Array, default: () => [] },
  tagOptions: { type: Array, default: () => [] },
  coverMediaItems: { type: Array, default: () => [] },
  coverMediaLoading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  result: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'submit', 'clear-result', 'load-cover-media'])

const form = reactive(createDefaultForm())
const coverPickerVisible = ref(false)
const coverKeyword = ref('')

const resultMessage = computed(() => {
  if (!props.result) return ''
  return `已处理 ${props.result.total || 0} 篇，更新 ${props.result.updatedCount || 0} 篇，发布 ${props.result.publishedCount || 0} 篇，跳过 ${props.result.skippedCount || 0} 篇。`
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      Object.assign(form, createDefaultForm())
      emit('clear-result')
    }
  }
)

function createDefaultForm() {
  return {
    category: {
      enabled: false,
      mode: 'overwrite',
      value: null
    },
    tags: {
      enabled: false,
      mode: 'append',
      value: []
    },
    cover: {
      enabled: false,
      mode: 'overwrite',
      value: ''
    },
    status: {
      enabled: false,
      value: 'draft'
    }
  }
}

function hasEnabledField() {
  return form.category.enabled || form.tags.enabled || form.cover.enabled || form.status.enabled
}

function validateForm() {
  if (!hasEnabledField()) {
    message.warning('请选择至少一个批量设置项')
    return false
  }

  if (form.category.enabled && form.category.mode !== 'clear' && !form.category.value) {
    message.warning('请选择目标分类')
    return false
  }

  if (form.tags.enabled && form.tags.mode !== 'clear' && form.tags.value.length === 0) {
    message.warning('请选择目标标签')
    return false
  }

  if (form.cover.enabled && form.cover.mode !== 'clear' && !form.cover.value.trim()) {
    message.warning('请填写封面图片地址')
    return false
  }

  return true
}

function buildPayload() {
  return {
    category: {
      ...form.category
    },
    tags: {
      ...form.tags,
      value: [...form.tags.value]
    },
    cover: {
      ...form.cover,
      value: form.cover.value.trim()
    },
    status: {
      ...form.status
    }
  }
}

function openCoverPicker() {
  form.cover.enabled = true
  coverPickerVisible.value = true
  emit('load-cover-media', coverKeyword.value.trim())
}

function loadCoverMedia() {
  emit('load-cover-media', coverKeyword.value.trim())
}

function selectCoverMedia(item) {
  form.cover.enabled = true
  if (form.cover.mode === 'clear') {
    form.cover.mode = 'overwrite'
  }
  form.cover.value = item.url || ''
  coverPickerVisible.value = false
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }

  emit('submit', buildPayload())
}

function handleClose() {
  emit('update:open', false)
}

function getItemStatusLabel(item) {
  if (item.status === 'updated' && item.published) return '已更新并发布'
  if (item.status === 'updated') return '已更新'
  if (item.status === 'unchanged') return '无变化'
  return '已跳过'
}
</script>
