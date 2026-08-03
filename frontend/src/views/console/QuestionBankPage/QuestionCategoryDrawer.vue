<template>
  <a-drawer :open="open" :width="440" @close="$emit('close')">
    <template #title>
      <span class="question-bank-dialog-title">
        技术分类
        <QuestionBankHelp topic="categories" size="small" button-type="text" />
      </span>
    </template>
    <template #extra>
      <a-button type="primary" size="small" @click="openCreate()">
        <template #icon><PlusOutlined /></template>
        新增分类
      </a-button>
    </template>
    <a-spin :spinning="loading">
      <a-tree default-expand-all block-node :tree-data="treeData" class="question-category-tree">
        <template #title="node">
          <span class="question-category-node">
            <span>{{ node.name }}</span>
            <a-tooltip title="编辑分类">
              <a-button type="text" size="small" @click.stop="openEdit(node)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
          </span>
        </template>
      </a-tree>
    </a-spin>

    <a-modal
      v-model:open="formOpen"
      :confirm-loading="submitting"
      ok-text="保存"
      cancel-text="取消"
      @ok="submit"
    >
      <template #title>
        <span class="question-bank-dialog-title">
          {{ editing?.id ? '编辑分类' : '新增分类' }}
          <QuestionBankHelp topic="categories" size="small" button-type="text" />
        </span>
      </template>
      <div class="question-bank-modal-body">
        <a-form layout="vertical">
          <a-form-item v-if="!editing?.id" label="分类编码" required>
            <a-input v-model:value.trim="form.key" :maxlength="100" placeholder="例如 frontend.react" />
          </a-form-item>
          <a-form-item label="分类名称" required>
            <a-input v-model:value.trim="form.name" :maxlength="60" />
          </a-form-item>
          <a-form-item v-if="!editing?.id" label="上级分类">
            <a-select
              v-model:value="form.parentId"
              :options="categoryOptions"
              allow-clear
              show-search
              option-filter-prop="label"
              placeholder="不选择则创建一级分类"
            />
          </a-form-item>
          <a-form-item label="排序">
            <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
          </a-form-item>
          <a-form-item v-if="editing?.id" label="启用">
            <a-switch v-model:checked="form.enabled" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </a-drawer>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import {
  createQuestionCategory,
  listQuestionCategories,
  updateQuestionCategory
} from '@/services/questionBank'
import { flattenCategoryOptions } from './questionBankMeta'
import QuestionBankHelp from './QuestionBankHelp.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'changed'])
const loading = ref(false)
const submitting = ref(false)
const formOpen = ref(false)
const editing = ref(null)
const tree = ref([])
const form = reactive({ key: '', name: '', parentId: undefined, sortOrder: 0, enabled: true })
const categoryOptions = computed(() => flattenCategoryOptions(tree.value))
const treeData = computed(() => tree.value.map(toTreeNode))

function toTreeNode(item) {
  return {
    ...item,
    key: item.id,
    title: item.name,
    children: (item.children || []).map(toTreeNode)
  }
}

async function loadCategories() {
  loading.value = true
  try {
    const result = await listQuestionCategories({ includeDisabled: true })
    tree.value = result.tree || []
  } catch (error) {
    message.error(error.message || '分类加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate(parentId) {
  editing.value = null
  Object.assign(form, { key: '', name: '', parentId, sortOrder: 0, enabled: true })
  formOpen.value = true
}

function openEdit(category) {
  editing.value = category
  Object.assign(form, {
    key: category.key,
    name: category.name,
    parentId: category.parentId || undefined,
    sortOrder: category.sortOrder || 0,
    enabled: category.enabled !== false
  })
  formOpen.value = true
}

async function submit() {
  if (!form.name.trim() || (!editing.value?.id && !form.key.trim())) {
    message.warning('请填写完整的分类信息')
    return
  }
  submitting.value = true
  try {
    if (editing.value?.id) {
      await updateQuestionCategory(editing.value.id, {
        name: form.name,
        sortOrder: form.sortOrder,
        enabled: form.enabled
      })
    } else {
      await createQuestionCategory({
        key: form.key,
        name: form.name,
        parentId: form.parentId || null,
        sortOrder: form.sortOrder,
        enabled: true
      })
    }
    message.success('分类已保存')
    formOpen.value = false
    await loadCategories()
    emit('changed')
  } catch (error) {
    message.error(error.message || '分类保存失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) loadCategories()
})
</script>
