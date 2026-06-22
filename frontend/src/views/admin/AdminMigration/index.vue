<template>
  <section class="mg-page">
    <!-- ══════ 页面头部 ══════ -->
    <header class="mg-page-header">
      <div class="mg-header-info">
        <p class="mg-header-kicker">内容资产</p>
        <h2>知识库迁移配置</h2>
        <p class="mg-header-desc">编辑分类层级、排序和文章归属，按当前数据库内容手动对齐你的知识库目录习惯。</p>
      </div>
      <div class="mg-header-toolbar">
        <a-button class="mg-btn" @click="reloadAll" :loading="treeLoading">
          <template #icon><ReloadOutlined /></template>
          刷新数据
        </a-button>
        <a-button type="primary" class="mg-btn mg-btn-primary" @click="openCreateModal()">
          <template #icon><PlusOutlined /></template>
          新增根分类
        </a-button>
      </div>
    </header>

    <!-- ══════ 主体工作区 ══════ -->
    <div class="mg-workspace">
      <!-- ── 左栏：分类树 ── -->
      <aside class="mg-tree-aside">
        <div class="mg-aside-header">
          <div class="mg-aside-title">
            <ApartmentOutlined class="mg-aside-icon" />
            <strong>分类树</strong>
            <span class="mg-aside-count">{{ flatCategories.length }} 个节点</span>
          </div>
          <a-input-search
            v-model:value="categoryKeyword"
            placeholder="搜索分类名称"
            allow-clear
            class="mg-tree-search"
          />
        </div>

        <div class="mg-tree-body">
          <a-spin :spinning="treeLoading" tip="加载中...">
            <a-tree
              v-if="filteredTreeData.length"
              :tree-data="filteredTreeData"
              :selected-keys="selectedKeys"
              :expanded-keys="expandedKeys"
              block-node
              class="mg-category-tree"
              @select="handleSelectTree"
              @expand="handleExpandTree"
            >
              <template #title="{ dataRef }">
                <span
                  class="mg-tree-node"
                  :class="{
                    'mg-tree-node--locked': dataRef.isSystem,
                    'mg-tree-node--hidden': dataRef.status === 'hidden',
                    'mg-tree-node--branch': dataRef.children?.length
                  }"
                >
                  <span
                    class="mg-tree-node-icon"
                    :class="{ 'mg-tree-node-icon--toggleable': dataRef.children?.length }"
                    :role="dataRef.children?.length ? 'button' : undefined"
                    :tabindex="dataRef.children?.length ? 0 : -1"
                    :aria-label="dataRef.children?.length ? `${isTreeNodeExpanded(dataRef.id) ? '收起' : '展开'}${dataRef.titleText}` : undefined"
                    @click.stop="toggleTreeNode(dataRef)"
                    @keydown.enter.stop.prevent="toggleTreeNode(dataRef)"
                    @keydown.space.stop.prevent="toggleTreeNode(dataRef)"
                  >
                    <InboxOutlined v-if="dataRef.isSystem" />
                    <FolderOpenOutlined v-else-if="dataRef.children?.length && isTreeNodeExpanded(dataRef.id)" />
                    <FolderOutlined v-else />
                  </span>
                  <span class="mg-tree-name">{{ dataRef.titleText }}</span>
                  <a-tag v-if="dataRef.isSystem" color="gold" class="mg-tree-tag">锁定</a-tag>
                  <a-tag v-else-if="dataRef.status === 'hidden'" class="mg-tree-tag mg-tree-tag--hidden">隐藏</a-tag>
                  <span
                    class="mg-tree-arts"
                    title="当前分类及其子分类下的文章数量"
                  >
                    {{ dataRef.branchArticleCount ?? dataRef.articleCount ?? 0 }}
                  </span>
                </span>
              </template>
            </a-tree>
            <a-empty v-else description="暂无分类数据" class="mg-tree-empty" />
          </a-spin>
        </div>
      </aside>

      <!-- ── 右栏主区域 ── -->
      <div class="mg-main">
        <!-- ── 分类详情面板 ── -->
        <div class="mg-detail-panel">
          <div class="mg-panel-header">
            <div class="mg-panel-title-group">
              <div class="mg-panel-icon-wrap">
                <FolderOutlined />
              </div>
              <div>
                <strong class="mg-panel-title">当前分类</strong>
                <span class="mg-panel-subtitle">{{ currentCategory ? currentCategory.name : '请从左侧选择一个分类' }}</span>
              </div>
            </div>
            <a-space :size="6" class="mg-panel-actions">
              <a-button
                class="mg-btn mg-btn-ghost"
                :disabled="!currentCategory || isLockedCategory"
                @click="openCreateModal(selectedCategoryId ? currentCategory?.id : null)"
              >
                <template #icon><FolderAddOutlined /></template>
                新增子分类
              </a-button>
              <a-button
                class="mg-btn mg-btn-ghost"
                :disabled="!currentCategory || isLockedCategory"
                @click="resetEditForm"
              >
                <template #icon><UndoOutlined /></template>
                重置
              </a-button>
              <a-button
                class="mg-btn mg-btn-ghost"
                :disabled="!currentCategory"
                @click="openCategoryArticlesModal"
              >
                <template #icon><UnorderedListOutlined /></template>
                查看该分类文章
              </a-button>
              <a-button
                type="primary"
                class="mg-btn mg-btn-primary"
                :disabled="!currentCategory || isLockedCategory"
                :loading="savingCategory"
                @click="saveSelectedCategory"
              >
                <template #icon><SaveOutlined /></template>
                保存
              </a-button>
              <a-popconfirm
                :title="currentCategory ? `确定删除分类「${currentCategory.name}」？` : '请先选择分类'"
                ok-text="删除"
                cancel-text="取消"
                :ok-button-props="{ danger: true }"
                :disabled="!currentCategory || isLockedCategory"
                @confirm="deleteSelectedCategory"
              >
                <a-button
                  danger
                  class="mg-btn"
                  :disabled="!currentCategory || isLockedCategory"
                  :loading="deletingCategory"
                >
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>

          <template v-if="currentCategory">
            <!-- 锁定提示 -->
            <a-alert
              v-if="isLockedCategory"
              type="warning"
              show-icon
              class="mg-lock-alert"
              message="系统保留分类"
              description="该分类由系统自动维护，不支持编辑、移动或删除操作。"
            />

            <!-- 编辑表单 -->
            <a-form
              ref="editFormRef"
              :model="editForm"
              layout="vertical"
              class="mg-form"
            >
              <div class="mg-form-grid">
                <a-form-item
                  label="分类名称"
                  name="name"
                  :rules="[{ required: true, message: '请输入分类名称' }]"
                >
                  <a-input v-model:value.trim="editForm.name" :disabled="isLockedCategory" placeholder="例如 JavaScript" />
                </a-form-item>
                <a-form-item label="Slug" name="slug">
                  <a-input v-model:value.trim="editForm.slug" :disabled="isLockedCategory" placeholder="留空自动生成" />
                </a-form-item>
                <a-form-item label="父级分类" name="parent">
                  <a-tree-select
                    v-model:value="editForm.parent"
                    :tree-data="parentTreeData"
                    :disabled="isLockedCategory"
                    allow-clear
                    placeholder="保持为空则为顶级分类"
                    tree-default-expand-all
                  />
                </a-form-item>
                <a-form-item label="排序" name="sortOrder">
                  <a-input-number v-model:value="editForm.sortOrder" :disabled="isLockedCategory" :min="0" :max="9999" style="width: 100%" />
                </a-form-item>
                <a-form-item label="状态" name="status">
                  <a-select v-model:value="editForm.status" :disabled="isLockedCategory">
                    <a-select-option value="active">启用</a-select-option>
                    <a-select-option value="hidden">隐藏</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="说明" name="description" class="mg-form-span-full">
                  <a-textarea
                    v-model:value="editForm.description"
                    :disabled="isLockedCategory"
                    :rows="3"
                    placeholder="分类说明可留空"
                  />
                </a-form-item>
              </div>
            </a-form>

            <!-- 元信息条 -->
            <div class="mg-meta-bar">
              <div class="mg-meta-item">
                <span class="mg-meta-label">路径</span>
                <span class="mg-meta-value">{{ currentCategoryPath }}</span>
              </div>
              <div class="mg-meta-item">
                <span class="mg-meta-label">含子分类文章数</span>
                <span class="mg-meta-value mg-meta-value--number">{{ currentCategoryBranchArticleCount }}</span>
              </div>
              <div class="mg-meta-item">
                <span class="mg-meta-label">创建时间</span>
                <span class="mg-meta-value">{{ formatDate(currentCategory.createdAt) }}</span>
              </div>
              <div class="mg-meta-item">
                <span class="mg-meta-label">更新时间</span>
                <span class="mg-meta-value">{{ formatDate(currentCategory.updatedAt) }}</span>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-else class="mg-empty-state">
            <FolderOpenOutlined class="mg-empty-icon" />
            <strong>选择一个分类开始管理</strong>
            <span>从左侧分类树中选择节点，即可编辑属性；文章列表通过弹窗查看。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════ 分类文章弹窗 ══════ -->
    <a-modal
      v-model:open="categoryArticlesModalVisible"
      :title="currentCategory ? `分类文章：${currentCategory.name}` : '分类文章'"
      width="1080px"
      :footer="null"
      destroy-on-close
      class="mg-modal mg-articles-modal"
      @cancel="closeCategoryArticlesModal"
    >
      <BlogTable
        ref="articleTableRef"
        :key="categoryArticlesModalVisible ? selectedCategoryId : 'closed'"
        :api-fn="loadBranchArticles"
        :columns="articleColumns"
        :auto-load="categoryArticlesModalVisible && Boolean(selectedCategoryId)"
        :page-size="8"
        :page-sizes="['8', '15', '30']"
        :row-selection="selectedCategoryId ? true : false"
        :show-column-setting="true"
        height="560px"
        @selection-change="handleArticleSelectionChange"
      >
        <template #toolbar>
          <div class="mg-article-toolbar">
            <template v-if="selectedArticleIds.length > 0">
              <a-tag color="processing" class="mg-selected-tag">
                已选 {{ selectedArticleIds.length }} 篇
              </a-tag>
              <a-button type="primary" size="small" @click="openBatchMoveModal">
                <template #icon><SwapOutlined /></template>
                批量迁移
              </a-button>
              <a-button size="small" @click="clearArticleSelection">清空</a-button>
            </template>
            <a-tag v-else class="mg-total-tag">
              共 {{ branchArticlesTotal }} 篇
            </a-tag>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="mg-article-title">
              <strong>{{ record.title }}</strong>
              <span>{{ record.summary || '暂无摘要' }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'category'">
            <a-tag :bordered="false">{{ record.category?.name || DEFAULT_CATEGORY_LABEL }}</a-tag>
          </template>

          <template v-else-if="column.key === 'publishedAt'">
            <span class="mg-time-cell">{{ formatDate(record.publishedAt || record.createdAt) }}</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openMoveArticleModal(record)">
              <template #icon><SwapOutlined /></template>
              迁移
            </a-button>
          </template>
        </template>
      </BlogTable>
    </a-modal>

    <!-- ══════ 新增分类弹窗 ══════ -->
    <a-modal
      v-model:open="createModalVisible"
      :title="createForm.id ? '编辑分类' : '新增分类'"
      :confirm-loading="createSubmitting"
      width="620px"
      destroy-on-close
      ok-text="确认"
      cancel-text="取消"
      class="mg-modal"
      @ok="submitCreateForm"
      @cancel="closeCreateModal"
    >
      <a-form ref="createFormRef" :model="createForm" layout="vertical" class="mg-form">
        <div class="mg-form-grid">
          <a-form-item
            label="分类名称"
            name="name"
            :rules="[{ required: true, message: '请输入分类名称' }]"
          >
            <a-input v-model:value.trim="createForm.name" placeholder="例如 Vue" />
          </a-form-item>
          <a-form-item label="Slug" name="slug">
            <a-input v-model:value.trim="createForm.slug" placeholder="留空自动生成" />
          </a-form-item>
          <a-form-item label="父级分类" name="parent">
            <a-tree-select
              v-model:value="createForm.parent"
              :tree-data="createParentTreeData"
              allow-clear
              placeholder="留空则创建顶级分类"
              tree-default-expand-all
            />
          </a-form-item>
          <a-form-item label="排序" name="sortOrder">
            <a-input-number v-model:value="createForm.sortOrder" :min="0" :max="9999" style="width: 100%" />
          </a-form-item>
          <a-form-item label="状态" name="status">
            <a-select v-model:value="createForm.status">
              <a-select-option value="active">启用</a-select-option>
              <a-select-option value="hidden">隐藏</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="说明" name="description" class="mg-form-span-full">
            <a-textarea
              v-model:value="createForm.description"
              :rows="3"
              placeholder="分类说明可留空"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <!-- ══════ 迁移文章弹窗 ══════ -->
    <a-modal
      v-model:open="moveArticleModalVisible"
      title="迁移文章"
      :confirm-loading="movingArticle"
      width="540px"
      destroy-on-close
      ok-text="确认迁移"
      cancel-text="取消"
      class="mg-modal"
      @ok="submitMoveArticle"
      @cancel="closeMoveArticleModal"
    >
      <div class="mg-move-modal-body">
        <div v-if="moveSummaryText" class="mg-move-summary">
          <div class="mg-move-summary-icon">
            <SwapOutlined />
          </div>
          <div>
            <strong>{{ moveSummaryText }}</strong>
            <span>{{ moveSourceText }}</span>
          </div>
        </div>
        <a-form layout="vertical">
          <a-form-item label="目标分类">
            <a-tree-select
              v-model:value="moveArticleTargetId"
              :tree-data="articleMoveTreeData"
              allow-clear
              placeholder="选择要迁移到的分类"
              tree-default-expand-all
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  ApartmentOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  UndoOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategoryArticles,
  listAdminCategoryTree,
  moveAdminArticleCategory,
  moveAdminArticlesCategory,
  moveAdminCategory,
  updateAdminCategory
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const { runAction } = useAdminActions()

const DEFAULT_CATEGORY_LABEL = '默认分类'

const treeLoading = ref(false)
const savingCategory = ref(false)
const deletingCategory = ref(false)
const createSubmitting = ref(false)
const movingArticle = ref(false)
const categoryTree = ref([])
const selectedCategoryId = ref('')
const selectedKeys = computed(() => (selectedCategoryId.value ? [selectedCategoryId.value] : []))
const expandedKeys = ref([])
const articleTableRef = ref(null)
const editFormRef = ref(null)
const createFormRef = ref(null)
const createModalVisible = ref(false)
const categoryArticlesModalVisible = ref(false)
const moveArticleModalVisible = ref(false)
const moveMode = ref('single')
const movingArticleRecord = ref(null)
const selectedArticleIds = ref([])
const selectedArticleRows = ref([])
const moveArticleTargetId = ref('')
const categoryKeyword = ref('')
const branchArticlesTotal = ref(0)

const editForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  parent: null,
  sortOrder: 0,
  status: 'active'
})

const createForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  parent: null,
  sortOrder: 0,
  status: 'active'
})

const articleColumns = [
  { title: '标题', key: 'title', ellipsis: true },
  { title: '当前分类', key: 'category', width: 160 },
  { title: '发布时间', key: 'publishedAt', width: 160 },
  { title: '操作', key: 'action', width: 100, align: 'center' }
]

function cloneCategoryTree(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    titleText: node.name,
    key: node.id,
    value: node.id,
    title: node.name,
    directArticleCount: node.directArticleCount ?? node.articleCount ?? 0,
    branchArticleCount: node.branchArticleCount ?? node.articleCount ?? 0,
    children: cloneCategoryTree(node.children || [])
  }))
}

function disableSystemParentNodes(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    disabled: !!node.isSystem,
    children: disableSystemParentNodes(node.children || [])
  }))
}

function flattenCategoryTree(nodes = [], output = []) {
  for (const node of nodes) {
    output.push(node)
    if (node.children?.length) {
      flattenCategoryTree(node.children, output)
    }
  }
  return output
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    const found = findNodeById(node.children || [], id)
    if (found) {
      return found
    }
  }
  return null
}

function findPath(nodes, id, trail = []) {
  for (const node of nodes) {
    const nextTrail = [...trail, node]
    if (node.id === id) {
      return nextTrail
    }
    const found = findPath(node.children || [], id, nextTrail)
    if (found) {
      return found
    }
  }
  return null
}

function collectDescendantIds(nodes, id) {
  const node = findNodeById(nodes, id)
  if (!node) {
    return []
  }

  const ids = [node.id]
  const walk = (children = []) => {
    for (const child of children) {
      ids.push(child.id)
      walk(child.children || [])
    }
  }
  walk(node.children || [])
  return ids
}

function filterTree(nodes, keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) {
    return nodes
  }

  return nodes
    .map((node) => {
      const children = filterTree(node.children || [], text)
      const hit = `${node.name} ${node.slug || ''}`.toLowerCase().includes(text)
      if (!hit && children.length === 0) {
        return null
      }

      return {
        ...node,
        children
      }
    })
    .filter(Boolean)
}

const normalizedTree = computed(() => cloneCategoryTree(categoryTree.value))
const flatCategories = computed(() => flattenCategoryTree(categoryTree.value))
const currentCategory = computed(() => findNodeById(categoryTree.value, selectedCategoryId.value))
const isLockedCategory = computed(() => !!currentCategory.value?.isSystem)
const currentCategoryPath = computed(() => {
  const path = currentCategory.value ? findPath(categoryTree.value, currentCategory.value.id) : null
  return path?.map((node) => node.name).join(' / ') || '-'
})
const currentCategoryBranchArticleCount = computed(() => currentCategory.value?.branchArticleCount ?? currentCategory.value?.articleCount ?? 0)
const filteredTreeData = computed(() => filterTree(normalizedTree.value, categoryKeyword.value))
const parentTreeData = computed(() => {
  if (!selectedCategoryId.value) {
    return disableSystemParentNodes(normalizedTree.value)
  }

  const bannedIds = new Set(collectDescendantIds(categoryTree.value, selectedCategoryId.value))

  const walk = (nodes = []) => {
    return nodes
      .map((node) => {
        if (bannedIds.has(node.id)) {
          return null
        }

        return {
          ...node,
          disabled: !!node.isSystem,
          children: walk(node.children || [])
        }
      })
      .filter(Boolean)
  }

  return walk(normalizedTree.value)
})
const createParentTreeData = computed(() => {
  if (!createForm.id) {
    return disableSystemParentNodes(normalizedTree.value)
  }

  const bannedIds = new Set(collectDescendantIds(categoryTree.value, createForm.id))

  const walk = (nodes = []) => {
    return nodes
      .map((node) => {
        if (bannedIds.has(node.id)) {
          return null
        }

        return {
          ...node,
          disabled: !!node.isSystem,
          children: walk(node.children || [])
        }
      })
      .filter(Boolean)
  }

  return walk(normalizedTree.value)
})
const articleMoveTreeData = computed(() => normalizedTree.value)
const moveSummaryText = computed(() => {
  if (moveMode.value === 'batch') {
    return `批量迁移 ${selectedArticleIds.value.length} 篇文章`
  }

  return movingArticleRecord.value ? `迁移文章：${movingArticleRecord.value.title}` : ''
})
const moveSourceText = computed(() => {
  if (moveMode.value === 'batch') {
    return selectedArticleRows.value.length > 0
      ? `来源分类：${selectedArticleRows.value[0]?.category?.name || DEFAULT_CATEGORY_LABEL}`
      : '来源分类：批量选择'
  }

  return movingArticleRecord.value
    ? `来源分类：${movingArticleRecord.value.category?.name || DEFAULT_CATEGORY_LABEL}`
    : ''
})

async function reloadAll() {
  await loadCategoryTree()
  if (categoryArticlesModalVisible.value) {
    articleTableRef.value?.refresh?.()
  }
}

async function loadCategoryTree() {
  treeLoading.value = true
  try {
    const tree = await listAdminCategoryTree()
    categoryTree.value = Array.isArray(tree) ? tree : []

    if (selectedCategoryId.value && !findNodeById(categoryTree.value, selectedCategoryId.value)) {
      selectedCategoryId.value = ''
    }

    expandedKeys.value = selectedCategoryId.value ? (findPath(categoryTree.value, selectedCategoryId.value)?.map((node) => node.id) || []) : []
    syncEditForm()
  } finally {
    treeLoading.value = false
  }
}

function syncEditForm() {
  if (!currentCategory.value) {
    Object.assign(editForm, {
      id: '',
      name: '',
      slug: '',
      description: '',
      parent: null,
      sortOrder: 0,
      status: 'active'
    })
    return
  }

  Object.assign(editForm, {
    id: currentCategory.value.id,
    name: currentCategory.value.name || '',
    slug: currentCategory.value.slug || '',
    description: currentCategory.value.description || '',
    parent: currentCategory.value.parent || null,
    sortOrder: currentCategory.value.sortOrder ?? 0,
    status: currentCategory.value.status || 'active'
  })
}

function resetEditForm() {
  syncEditForm()
}

function handleSelectTree(selectedKeysValue) {
  const nextId = selectedKeysValue?.[0] || ''
  if (!nextId) {
    return
  }

  selectedCategoryId.value = nextId
  expandedKeys.value = findPath(categoryTree.value, nextId)?.map((node) => node.id) || []
  syncEditForm()
  clearArticleSelection()
  if (categoryArticlesModalVisible.value) {
    articleTableRef.value?.refresh?.()
  }
}

function handleExpandTree(keys) {
  expandedKeys.value = keys
}

function isTreeNodeExpanded(id) {
  return expandedKeys.value.includes(id)
}

function toggleTreeNode(node) {
  if (!node?.children?.length) {
    return
  }

  const key = node.id
  expandedKeys.value = isTreeNodeExpanded(key)
    ? expandedKeys.value.filter((item) => item !== key)
    : [...expandedKeys.value, key]
}

async function saveSelectedCategory() {
  if (!currentCategory.value || isLockedCategory.value) {
    return
  }

  try {
    await editFormRef.value?.validateFields()
  } catch {
    return
  }

  savingCategory.value = true
  try {
    const hierarchyChanged = String(editForm.parent || '') !== String(currentCategory.value.parent || '') || Number(editForm.sortOrder) !== Number(currentCategory.value.sortOrder || 0)
    const profileChanged =
      editForm.name !== currentCategory.value.name ||
      (editForm.slug || '') !== (currentCategory.value.slug || '') ||
      (editForm.description || '') !== (currentCategory.value.description || '') ||
      editForm.status !== currentCategory.value.status

    await runAction(async () => {
      if (hierarchyChanged) {
        await moveAdminCategory(editForm.id, {
          targetParentId: editForm.parent || null,
          sortOrder: editForm.sortOrder
        })
      }

      if (profileChanged) {
        const payload = {
          name: editForm.name,
          slug: editForm.slug || '',
          description: editForm.description,
          status: editForm.status
        }

        await updateAdminCategory(editForm.id, payload)
      }
    }, {
      successMessage: '分类已保存',
      errorMessage: '保存失败'
    })

    await reloadAll()
    selectedCategoryId.value = editForm.id
    expandedKeys.value = findPath(categoryTree.value, editForm.id)?.map((node) => node.id) || []
    syncEditForm()
  } finally {
    savingCategory.value = false
  }
}

async function deleteSelectedCategory() {
  if (!currentCategory.value || isLockedCategory.value) {
    return
  }

  deletingCategory.value = true
  try {
    await runAction(() => deleteAdminCategory(currentCategory.value.id), {
      successMessage: '分类已删除',
      errorMessage: '删除失败'
    })
    await reloadAll()
  } finally {
    deletingCategory.value = false
  }
}

function openCreateModal(parentId = null) {
  Object.assign(createForm, {
    id: '',
    name: '',
    slug: '',
    description: '',
    parent: parentId || null,
    sortOrder: currentCategory.value ? (currentCategory.value.sortOrder || 0) + 1 : 0,
    status: 'active'
  })
  createModalVisible.value = true
}

function closeCreateModal() {
  createModalVisible.value = false
}

async function submitCreateForm() {
  try {
    await createFormRef.value?.validateFields()
  } catch {
    return
  }

  createSubmitting.value = true
  try {
    const payload = {
      name: createForm.name,
      description: createForm.description,
      parent: createForm.parent || null,
      sortOrder: createForm.sortOrder,
      status: createForm.status
    }

    if (String(createForm.slug || '').trim()) {
      payload.slug = createForm.slug
    }

    const created = await runAction(() => createAdminCategory(payload), {
      successMessage: '分类已创建',
      errorMessage: '创建失败'
    })

    createModalVisible.value = false
    await reloadAll()
    selectedCategoryId.value = created?.id || selectedCategoryId.value
    expandedKeys.value = findPath(categoryTree.value, selectedCategoryId.value)?.map((node) => node.id) || []
    syncEditForm()
  } finally {
    createSubmitting.value = false
  }
}

async function loadBranchArticles(params = {}) {
  if (!selectedCategoryId.value) {
    branchArticlesTotal.value = 0
    return { items: [], total: 0, page: 1, pageSize: params.pageSize || 8 }
  }

  const result = await listAdminCategoryArticles(selectedCategoryId.value, params)
  branchArticlesTotal.value = result.total || 0
  return result
}

function openCategoryArticlesModal() {
  if (!selectedCategoryId.value) {
    return
  }

  categoryArticlesModalVisible.value = true
  clearArticleSelection()
}

function closeCategoryArticlesModal() {
  categoryArticlesModalVisible.value = false
  clearArticleSelection()
}

function handleArticleSelectionChange(keys, rows) {
  selectedArticleIds.value = keys || []
  selectedArticleRows.value = rows || []
}

function clearArticleSelection() {
  selectedArticleIds.value = []
  selectedArticleRows.value = []
  articleTableRef.value?.clearSelection?.()
}

function openMoveArticleModal(record) {
  moveMode.value = 'single'
  movingArticleRecord.value = record
  moveArticleTargetId.value = ''
  moveArticleModalVisible.value = true
}

function openBatchMoveModal() {
  if (selectedArticleIds.value.length === 0) {
    return
  }

  moveMode.value = 'batch'
  movingArticleRecord.value = null
  moveArticleTargetId.value = ''
  moveArticleModalVisible.value = true
}

function closeMoveArticleModal() {
  moveArticleModalVisible.value = false
  movingArticleRecord.value = null
  moveArticleTargetId.value = ''
  moveMode.value = 'single'
}

async function submitMoveArticle() {
  if (!moveArticleTargetId.value) {
    return
  }

  movingArticle.value = true
  try {
    if (moveMode.value === 'batch') {
      await runAction(() => moveAdminArticlesCategory(selectedArticleIds.value, moveArticleTargetId.value), {
        successMessage: '文章已批量迁移',
        errorMessage: '批量迁移失败'
      })
      clearArticleSelection()
    } else if (movingArticleRecord.value) {
      await runAction(() => moveAdminArticleCategory(movingArticleRecord.value.id, moveArticleTargetId.value), {
        successMessage: '文章已迁移',
        errorMessage: '迁移失败'
      })
    }

    closeMoveArticleModal()
    if (categoryArticlesModalVisible.value) {
      articleTableRef.value?.refresh?.()
    }
    await reloadAll()
  } finally {
    movingArticle.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(currentCategory, () => {
  syncEditForm()
})

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   迁移配置 - 企业级管理面板样式
   风格: Data-Dense Dashboard / Swiss Modernism
   ═══════════════════════════════════════════ */

/* ── 页面骨架 ── */
.mg-page {
  display: flex;
  flex-direction: column;
  gap: var(--console-page-gap);
  width: 100%;
  min-height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  overflow: visible;
}

/* ── 页面头部 ── */
.mg-page-header {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.mg-header-kicker {
  margin: 0 0 2px;
  color: var(--console-primary-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.mg-page-header h2 {
  margin: 0;
  color: var(--console-text);
  font-size: 20px;
  font-weight: 650;
  line-height: 28px;
}

.mg-header-desc {
  margin: 4px 0 0;
  max-width: 680px;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.mg-header-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
}

/* ── 按钮系统 ── */
.mg-btn {
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mg-btn-primary {
  box-shadow: 0 1px 2px rgba(9, 88, 217, 0.2);
}

.mg-btn-ghost {
  border-color: var(--console-border);
  color: var(--console-text-secondary);
}

.mg-btn-ghost:not(:disabled):hover {
  color: var(--console-primary-strong);
  border-color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

/* ── 工作区双栏布局 ── */
.mg-workspace {
  flex: 1 1 0;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: var(--console-page-gap);
  min-height: 0;
}

/* ── 左栏：分类树侧栏 ── */
.mg-tree-aside {
  display: flex;
  flex-direction: column;
  min-height: 720px;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  overflow: hidden;
}

.mg-aside-header {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--console-border);
}

.mg-aside-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mg-aside-icon {
  color: var(--console-primary-strong);
  font-size: 16px;
}

.mg-aside-title strong {
  color: var(--console-text);
  font-size: 15px;
  font-weight: 650;
}

.mg-aside-count {
  margin-left: auto;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.mg-tree-search {
  width: 100%;
}

.mg-tree-search :deep(.ant-input) {
  border-radius: 6px;
  font-size: 13px;
}

/* ── 树体 ── */
.mg-tree-body {
  flex: 1 1 0;
  padding: 8px 10px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--console-border) transparent;
}

.mg-tree-body::-webkit-scrollbar {
  width: 5px;
}

.mg-tree-body::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--console-border);
}

.mg-tree-body::-webkit-scrollbar-track {
  background: transparent;
}

/* ── Ant Design Tree 微调（只调视觉，不动布局）── */
/* 节点行高收紧 */
.mg-category-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

/* 折叠箭头隐藏，改为节点图标承载展开/收起 */
.mg-category-tree :deep(.ant-tree-switcher) {
  width: 0;
  min-width: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
  pointer-events: none;
}

/* 节点内容区域：hover / 选中态 */
.mg-category-tree :deep(.ant-tree-node-content-wrapper) {
  padding: 3px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.mg-category-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: var(--console-surface-hover);
}

.mg-category-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background: var(--console-primary-soft);
  box-shadow: inset 3px 0 0 var(--console-primary-strong);
}

/* 树节点内容 */
.mg-tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-size: 13.5px;
  line-height: 26px;
  cursor: pointer;
}

.mg-tree-node--locked {
  opacity: 0.9;
}

.mg-tree-node-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 22px;
  color: var(--console-text-secondary);
  font-size: 15px;
  transition: all 0.15s ease;
}

.mg-tree-node-icon--toggleable {
  cursor: pointer;
}

.mg-tree-node--branch .mg-tree-node-icon {
  color: var(--console-primary-strong);
}

.mg-tree-node--locked .mg-tree-node-icon {
  color: #ad6800;
}

.mg-category-tree :deep(.ant-tree-node-content-wrapper:hover) .mg-tree-node-icon,
.mg-category-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) .mg-tree-node-icon {
  color: var(--console-primary-strong);
}

.mg-tree-node--hidden .mg-tree-name {
  color: var(--console-text-secondary);
  text-decoration: line-through;
  text-decoration-color: var(--console-border);
}

.mg-tree-name {
  color: var(--console-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  max-width: 150px;
}

/* 锁定标签 — 紧凑精致 */
.mg-tree-tag {
  flex: 0 0 auto;
  font-size: 11px;
  line-height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.mg-tree-tag--hidden {
  color: var(--console-text-secondary);
  border-color: var(--console-border);
}

/* 文章计数 — 右对齐数字，紧凑显示 */
.mg-tree-arts {
  margin-left: auto;
  flex: 0 0 auto;
  min-width: 30px;
  height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 20px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
  border-radius: 999px;
}

.mg-category-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) .mg-tree-arts {
  color: var(--console-primary-strong);
  background: var(--console-surface);
  border-color: color-mix(in srgb, var(--console-primary-strong) 38%, var(--console-border));
}

.mg-tree-empty {
  padding: 40px 0;
}

/* ── 右栏主区域 ── */
.mg-main {
  display: flex;
  flex-direction: column;
  gap: var(--console-page-gap);
  min-width: 0;
}

/* ── 面板通用 ── */
.mg-detail-panel,
.mg-article-panel {
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  overflow: hidden;
}

.mg-detail-panel {
  flex: 0 0 auto;
}

/* ── 面板头部 ── */
.mg-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}

.mg-panel-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mg-panel-icon-wrap {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 15px;
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.mg-panel-title {
  display: block;
  color: var(--console-text);
  font-size: 15px;
  font-weight: 650;
  line-height: 20px;
}

.mg-panel-subtitle {
  display: block;
  margin-top: 1px;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mg-panel-actions {
  flex: 0 0 auto;
}

/* ── 锁定提示 ── */
.mg-lock-alert {
  margin: 16px 18px 0;
  border-radius: 6px;
}

/* ── 表单系统 ── */
.mg-form {
  padding: 14px 16px 0;
}

.mg-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.mg-form-span-full {
  grid-column: 1 / -1;
}

.mg-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  font-size: 13px;
  color: var(--console-text);
}

.mg-form :deep(.ant-input),
.mg-form :deep(.ant-select-selector),
.mg-form :deep(.ant-input-number),
.mg-form :deep(.ant-picker) {
  border-radius: 6px;
  font-size: 13px;
}

/* ── 元信息条 ── */
.mg-meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 10px 16px 14px;
  padding: 0;
  border-top: 1px solid var(--console-border);
  border-radius: 0;
  background: transparent;
}

.mg-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px 10px 0;
  min-width: 0;
}

.mg-meta-item + .mg-meta-item {
  padding-left: 16px;
  border-left: 1px solid var(--console-border);
}

.mg-meta-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--console-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.mg-meta-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--console-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mg-meta-value--number {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 42px;
  color: var(--console-primary-strong);
  font-size: 18px;
  line-height: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ── 空状态 ── */
.mg-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 36px 20px;
  text-align: center;
}

.mg-empty-icon {
  font-size: 32px;
  color: var(--console-border-strong);
  margin-bottom: 4px;
}

.mg-empty-state strong {
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.mg-empty-state span {
  color: var(--console-text-secondary);
  font-size: 13px;
}

/* ── 文章面板扩展 ── */
.mg-article-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mg-selected-tag {
  font-weight: 600;
  font-size: 12px;
}

.mg-total-tag {
  color: var(--console-text-secondary);
  font-size: 12px;
  border-color: var(--console-border);
}

.mg-table-hint {
  display: inline-flex;
  align-items: center;
  color: var(--console-text-secondary);
  font-size: 12px;
}

/* ── BlogTable 微调 ── */
.mg-main :deep(.blog-table) {
  border-radius: 8px;
}

.mg-article-title {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mg-article-title strong {
  font-size: 13px;
  font-weight: 500;
  color: var(--console-text);
}

.mg-article-title span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.mg-time-cell {
  font-size: 13px;
  color: var(--console-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ── 迁移弹窗 ── */
.mg-move-modal-body {
  padding: 4px 0 0;
}

.mg-move-summary {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--console-primary-soft);
  border: 1px solid var(--console-border);
}

.mg-move-summary-icon {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--console-primary);
  color: #fff;
  font-size: 16px;
}

.mg-move-summary strong {
  display: block;
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.mg-move-summary span {
  display: block;
  margin-top: 2px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

/* ── 弹窗表单微调 ── */
.mg-modal :deep(.ant-modal-header) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--console-border);
}

.mg-modal :deep(.ant-modal-body) {
  padding: 20px 24px;
}

/* ═══════════════════════════════════════════
   响应式
   ═══════════════════════════════════════════ */
@media (max-width: 1280px) {
  .mg-workspace {
    grid-template-columns: 1fr;
  }

  .mg-tree-aside {
    min-height: 420px;
  }
}

@media (max-width: 1024px) {
  .mg-workspace {
    grid-template-columns: 1fr;
  }

  .mg-tree-aside {
    max-height: 420px;
  }

  .mg-article-panel {
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .mg-page-header {
    flex-direction: column;
    gap: 12px;
  }

  .mg-header-toolbar {
    padding-top: 0;
  }

  .mg-form-grid {
    grid-template-columns: 1fr;
  }

  .mg-meta-bar {
    flex-direction: column;
  }

  .mg-meta-item + .mg-meta-item {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--console-border);
  }

  .mg-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mg-panel-actions {
    width: 100%;
  }
}
</style>
