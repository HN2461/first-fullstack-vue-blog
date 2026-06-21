<template>
  <section class="menu-workbench enterprise-page">
    <div class="menu-workbench-grid">
      <a-card class="menu-tree-panel" :body-style="{ padding: 0 }">
        <template #title>
          <div class="menu-panel-title">
            <span>菜单树</span>
            <a-popover placement="bottomLeft" trigger="click" overlay-class-name="menu-help-popover">
              <template #content>
                <div class="menu-help-content">
                  <div class="menu-help-item">
                    <strong>点击节点</strong>
                    <span>父节点点击整行可展开或折叠，叶子节点点击后在右侧直接进入编辑。</span>
                  </div>
                  <div class="menu-help-item">
                    <strong>新增子菜单</strong>
                    <span>每行右侧的加号会自动把当前节点带入右侧表单的上级菜单。</span>
                  </div>
                  <div class="menu-help-item">
                    <strong>拖拽调整</strong>
                    <span>可直接改顺序，也可拖入其他节点下方形成新的父子关系。</span>
                  </div>
                </div>
              </template>
              <a-button class="menu-panel-help" type="text" size="small">
                <template #icon><QuestionCircleOutlined /></template>
              </a-button>
            </a-popover>
          </div>
        </template>
        <template #extra>
          <a-space>
            <a-tooltip title="刷新菜单">
              <a-button size="small" @click="loadMenus">
                <template #icon><ReloadOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="新增顶级菜单">
              <a-button size="small" type="primary" @click="openCreate(null)">
                <template #icon><PlusOutlined /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>

        <div class="menu-tree-scroll">
          <a-spin :spinning="loading">
            <a-empty v-if="!loading && !menuTree.length" description="暂无菜单" />
            <a-tree
              v-else
              class="menu-tree"
              block-node
              draggable
              :show-line="{ showLeafIcon: false }"
              :expanded-keys="expandedKeys"
              :selected-keys="selectedMenuId ? [selectedMenuId] : []"
              :tree-data="menuTree"
              :field-names="{ title: 'name', key: 'id', children: 'children' }"
              :allow-drop="allowDrop"
              @select="handleSelect"
              @expand="handleExpand"
              @drop="handleDrop"
              @rightClick="handleRightClick"
            >
              <template #title="{ id }">
                <div :class="['menu-tree-node', { 'menu-tree-node--module': isArticleDirectoryMenu(id) }]" @click.stop="handleNodeClick(id)">
                  <div class="menu-tree-node-main">
                    <strong>{{ getMenuName(id) }}</strong>
                    <span v-if="isArticleDirectoryMenu(id)" class="menu-tree-module-flag">系统模块</span>
                    <span v-if="isHiddenMenu(id)" class="menu-tree-hidden-flag">隐藏</span>
                  </div>
                  <div class="menu-tree-actions" @click.stop>
                    <a-tooltip :title="isArticleDirectoryMenu(id) ? '文章目录只可移动挂载位置，不能承载子菜单' : '新增子菜单'">
                      <a-button class="menu-tree-action-btn" type="text" size="small" :disabled="isArticleDirectoryMenu(id)" @click="openCreate(id)">
                        <template #icon><PlusOutlined /></template>
                      </a-button>
                    </a-tooltip>
                  </div>
                </div>
              </template>
            </a-tree>
          </a-spin>
        </div>
      </a-card>

      <a-card class="menu-form-panel" :body-style="{ padding: 0 }">
        <template #title>
          <div class="menu-panel-title">
            <span>菜单编辑</span>
            <a-popover placement="bottomLeft" trigger="click" overlay-class-name="menu-help-popover">
              <template #content>
                <div class="menu-help-content menu-help-content--form">
                  <div class="menu-help-item"><strong>上级菜单</strong><span>决定当前菜单挂在哪个节点下面；留空表示顶级菜单。</span></div>
                  <div class="menu-help-item"><strong>菜单名称</strong><span>左侧树和控制台导航中显示给用户看的名称。</span></div>
                  <div class="menu-help-item"><strong>菜单编码</strong><span>系统内部识别和权限绑定使用，通常保持唯一且稳定。</span></div>
                  <div class="menu-help-item"><strong>路由路径</strong><span>填写页面路由；留空表示该节点只做分组容器，只展开不跳转。</span></div>
                  <div class="menu-help-item"><strong>排序</strong><span>数值越小越靠前，同级节点按这个顺序展示。</span></div>
                  <div class="menu-help-item"><strong>图标</strong><span>用于控制台导航显示，点击控件后在弹窗中选择。</span></div>
                  <div class="menu-help-item"><strong>打开方式</strong><span>决定点击菜单后在当前页打开，还是新标签页打开。</span></div>
                  <div class="menu-help-item"><strong>适用范围</strong><span>仅对左侧菜单、一级菜单切换和工作台快捷入口生效；业务页里的“编辑/阅读”等按钮按各自业务规则执行。</span></div>
                  <div class="menu-help-item"><strong>启用 / 隐藏</strong><span>启用控制是否生效，隐藏控制是否在导航中展示。</span></div>
                </div>
              </template>
              <a-button class="menu-panel-help" type="text" size="small">
                <template #icon><QuestionCircleOutlined /></template>
              </a-button>
            </a-popover>
          </div>
        </template>
        <template #extra>
          <a-space>
            <a-button v-if="selectedMenuId" danger :disabled="selectedMenuIsSystem" @click="confirmDelete(selectedMenuId)">
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
            <a-button @click="openCreate(null)">
              <template #icon><PlusOutlined /></template>
              新建
            </a-button>
            <a-button type="primary" :loading="saving" @click="submitMenu">
              <template #icon><SaveOutlined /></template>
              保存
            </a-button>
          </a-space>
        </template>

        <div class="menu-form-scroll">
          <a-empty v-if="!selectedMenuId && !isCreating" description="请选择左侧菜单或点击新增" />
          <a-form v-else ref="formRef" :model="form" :rules="rules" layout="vertical" class="menu-form">
            <a-form-item label="上级菜单" name="parentId">
              <a-tree-select
                v-model:value="form.parentId"
                :tree-data="parentOptions"
                :field-names="{ label: 'name', value: 'id', children: 'children' }"
                allow-clear
                tree-default-expand-all
                placeholder="无（顶级菜单）"
              />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="菜单名称" name="name">
                  <a-input v-model:value="form.name" maxlength="40" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="菜单编码" name="code">
                  <a-input v-model:value="form.code" maxlength="80" :disabled="selectedMenuIsSystem" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="路由路径" name="routePath">
                  <a-input v-model:value="form.routePath" placeholder="/console/manage/articles" :disabled="selectedMenuIsSystem" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="页面标识" name="routeKey">
                  <a-input v-model:value="form.routeKey" placeholder="admin.article.list" :disabled="selectedMenuIsSystem" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="高亮菜单编码" name="activeMenuCode">
                  <a-input v-model:value="form.activeMenuCode" placeholder="content.articles" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="排序" name="sortOrder">
                  <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :lg="8">
                <a-form-item label="图标" name="icon">
                  <IconPicker v-model:value="form.icon" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="16">
                <a-form-item label="打开方式" name="openMode">
                  <a-segmented v-model:value="form.openMode" block :options="[{ label: '当前页', value: 'current' }, { label: '新标签页', value: 'blank' }]" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-switch v-model:checked="form.enabled" checked-children="启用" un-checked-children="禁用" />
                <span class="switch-label">启用菜单</span>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-switch v-model:checked="form.hidden" checked-children="隐藏" un-checked-children="显示" />
                <span class="switch-label">隐藏菜单</span>
              </a-col>
            </a-row>
            <div v-if="selectedMenuIsArticleDirectory" class="system-module-config">
              <div class="system-module-config__head">
                <span class="system-module-config__badge">系统内置模块</span>
                <strong>文章目录展示配置</strong>
              </div>
              <div class="system-module-config__body">
                <div>
                  <span class="system-module-config__label">非一级挂载时自动全展开</span>
                  <p>
                    文章目录挂载在任意普通父菜单下时，直接展示内部分类与文章；关闭后需要先点击文章目录节点展开。
                  </p>
                </div>
                <a-switch
                  :checked="effectiveDirectoryAutoExpand"
                  :disabled="articleDirectoryIsRoot"
                  checked-children="开启"
                  un-checked-children="关闭"
                  @change="handleDirectoryAutoExpandChange"
                />
              </div>
              <div v-if="articleDirectoryIsRoot" class="system-module-config__tip">
                当前文章目录为一级菜单，侧边栏会强制永久全展开，此配置自动失效。
              </div>
            </div>
          </a-form>
        </div>
      </a-card>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { createRbacMenu, deleteRbacMenu, listRbacMenus, reorderRbacMenus, updateRbacMenu } from '@/services/admin'
import IconPicker from '@/components/IconPicker.vue'

const loading = ref(false)
const saving = ref(false)
const menuTree = ref([])
const flatMenus = ref([])
const expandedKeys = ref([])
const selectedMenuId = ref('')
const isCreating = ref(false)
const formRef = ref(null)
const EXPANDED_KEYS_STORAGE_KEY = 'admin-menu-tree-expanded-keys'

const form = reactive({
  name: '',
  code: '',
  icon: 'MenuOutlined',
  routePath: '',
  routeKey: '',
  activeMenuCode: '',
  directoryAutoExpandWhenNested: true,
  openMode: 'current',
  hidden: false,
  enabled: true,
  parentId: null,
  sortOrder: 0
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称' }],
  code: [{ required: true, message: '请输入菜单编码' }]
}

const parentOptions = computed(() => {
  const excludeId = selectedMenuId.value || null
  const excludedIds = new Set(excludeId ? collectDescendantIds(excludeId) : [])
  return menuTree.value.map((item) => cloneForSelect(item, excludedIds)).filter(Boolean)
})
const selectedMenu = computed(() => flatMenus.value.find((item) => item.id === selectedMenuId.value) || null)
const selectedMenuIsSystem = computed(() => !!selectedMenu.value && selectedMenu.value.type === 'system')
const selectedMenuIsArticleDirectory = computed(() => isArticleDirectoryRecord(selectedMenu.value))
const articleDirectoryIsRoot = computed(() => selectedMenuIsArticleDirectory.value && !form.parentId)
const effectiveDirectoryAutoExpand = computed(() => articleDirectoryIsRoot.value || form.directoryAutoExpandWhenNested)

function collectDescendantIds(targetId) {
  const record = flatMenus.value.find((item) => item.id === targetId)
  if (!record) return []

  const result = [record.id]
  const walk = (items = []) => {
    items.forEach((item) => {
      result.push(item.id)
      walk(item.children || [])
    })
  }
  walk(record.children || [])
  return result
}

function cloneForSelect(item, excludedIds) {
  if (!item) return null
  if (excludedIds.has(item.id)) {
    return null
  }
  const isDirectory = isArticleDirectoryRecord(item)
  return {
    id: item.id,
    name: isDirectory ? `${item.name}（系统模块，不可作为父级）` : item.name,
    disabled: isDirectory,
    selectable: !isDirectory,
    children: (item.children || [])
      .map((child) => cloneForSelect(child, excludedIds))
      .filter(Boolean)
  }
}

function flatten(items = []) {
  return items.flatMap((item) => [item, ...flatten(item.children || [])])
}

function normalizeTree(items = [], level = 1) {
  return items.map((item) => ({
    ...item,
    level,
    children: normalizeTree(item.children || [], level + 1)
  }))
}

function resetForm(record = null) {
  form.name = record?.name || ''
  form.code = record?.code || ''
  form.icon = record?.icon || 'MenuOutlined'
  form.routePath = record?.routePath || ''
  form.routeKey = record?.routeKey || ''
  form.activeMenuCode = record?.activeMenuCode || ''
  form.directoryAutoExpandWhenNested = record?.directoryAutoExpandWhenNested !== false
  form.openMode = record?.openMode || 'current'
  form.hidden = !!record?.hidden
  form.enabled = record?.enabled !== false
  form.parentId = record?.parentId || null
  form.sortOrder = record?.sortOrder || 0
}

function getMenuName(id) {
  return flatMenus.value.find((item) => item.id === id)?.name || ''
}

function isHiddenMenu(id) {
  return !!flatMenus.value.find((item) => item.id === id)?.hidden
}

function isArticleDirectoryRecord(record) {
  return record?.code === 'knowledge.directory'
}

function isArticleDirectoryMenu(id) {
  return isArticleDirectoryRecord(flatMenus.value.find((item) => item.id === id))
}

function handleDirectoryAutoExpandChange(checked) {
  if (articleDirectoryIsRoot.value) return
  form.directoryAutoExpandWhenNested = checked
}

watch(selectedMenuId, () => {
  saveExpandedKeys()
})

function selectMenu(id) {
  const record = flatMenus.value.find((item) => item.id === id)
  if (!record) return
  selectedMenuId.value = id
  isCreating.value = false
  resetForm(record)
}

function openCreate(parentId = null) {
  if (parentId && isArticleDirectoryMenu(parentId)) {
    message.warning('文章目录是系统内置模块，不能新增子菜单')
    return
  }

  selectedMenuId.value = ''
  isCreating.value = true
  resetForm({ parentId })
}

function handleSelect(keys) {
  const id = keys?.[0]
  if (!id) return
  const record = flatMenus.value.find((item) => item.id === id)
  if (record?.children?.length) {
    expandedKeys.value = expandedKeys.value.includes(id)
      ? expandedKeys.value.filter((key) => key !== id)
      : [...expandedKeys.value, id]
  }
  selectMenu(id)
}

function handleNodeClick(id) {
  const record = flatMenus.value.find((item) => item.id === id)
  if (record?.children?.length) {
    expandedKeys.value = expandedKeys.value.includes(id)
      ? expandedKeys.value.filter((key) => key !== id)
      : [...expandedKeys.value, id]
  }
  selectMenu(id)
}

function handleExpand(keys) {
  expandedKeys.value = [...keys]
}

function allowDrop(info) {
  const dragId = info.dragNode?.key
  const targetId = info.node?.key
  if (!dragId || !targetId || dragId === targetId) return false
  if (!info.dropToGap && isArticleDirectoryMenu(targetId)) return false
  return true
}

function findNodeMeta(items, targetId, parentId = null) {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    if (item.id === targetId) {
      return { item, parentId, index, siblings: items }
    }
    const child = findNodeMeta(item.children || [], targetId, item.id)
    if (child) return child
  }
  return null
}

function removeNode(items, targetId) {
  const index = items.findIndex((item) => item.id === targetId)
  if (index >= 0) {
    return items.splice(index, 1)[0]
  }

  for (const item of items) {
    const removed = removeNode(item.children || [], targetId)
    if (removed) return removed
  }

  return null
}

function insertNode(items, node, targetMeta, dropToGap, dropPosition) {
  if (!targetMeta) return false

  if (!dropToGap) {
    if (isArticleDirectoryRecord(targetMeta.item)) {
      return false
    }

    targetMeta.item.children = targetMeta.item.children || []
    targetMeta.item.children.push({
      ...node,
      parentId: targetMeta.item.id
    })
    return true
  }

  const siblings = targetMeta.siblings || items
  const insertIndex = targetMeta.index + (dropPosition > 0 ? 1 : 0)
  siblings.splice(insertIndex, 0, {
    ...node,
    parentId: targetMeta.parentId || null
  })
  return true
}

async function handleDrop(info) {
  const dragId = info.dragNode?.key
  const targetId = info.node?.key
  if (!dragId || !targetId || dragId === targetId) return

  const next = normalizeTree(menuTree.value)
  const dragged = removeNode(next, dragId)
  if (!dragged) return

  const targetMeta = findNodeMeta(next, targetId)
  if (!targetMeta) return
  const ok = insertNode(next, dragged, targetMeta, info.dropToGap, info.dropPosition)
  if (!ok) return

  const payload = []
  const walk = (items, parentId = null) => {
    items.forEach((item, index) => {
      payload.push({
        id: item.id,
        parentId,
        sortOrder: (index + 1) * 10
      })
      walk(item.children || [], item.id)
    })
  }
  walk(next)

  try {
    const result = await reorderRbacMenus(payload)
    menuTree.value = normalizeTree(result.tree || result.roots || result.groups || [])
    flatMenus.value = flatten(menuTree.value)
    saveExpandedKeys()
    selectMenu(dragId)
    message.success('菜单顺序已更新')
  } catch (error) {
    message.error(error.message || '拖拽调整失败')
  }
}

function handleRightClick({ node, event }) {
  event?.preventDefault?.()
  selectMenu(node.key)
}

function isLeafSelected(id) {
  return selectedMenuId.value === id
}

async function loadMenus() {
  loading.value = true
  try {
    const result = await listRbacMenus()
    menuTree.value = normalizeTree(result.tree || result.roots || result.groups || [])
    flatMenus.value = flatten(menuTree.value)
    restoreExpandedKeys()
    if (!selectedMenuId.value && flatMenus.value.length) {
      selectMenu(flatMenus.value[0].id)
    }
  } catch (error) {
    message.error(error.message || '菜单列表加载失败')
  } finally {
    loading.value = false
  }
}

function saveExpandedKeys() {
  localStorage.setItem(EXPANDED_KEYS_STORAGE_KEY, JSON.stringify(expandedKeys.value))
}

function restoreExpandedKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EXPANDED_KEYS_STORAGE_KEY) || '[]')
    const validKeys = new Set(flatMenus.value.map((item) => item.id))
    expandedKeys.value = Array.isArray(parsed) ? parsed.filter((key) => validKeys.has(key)) : []
  } catch {
    expandedKeys.value = menuTree.value.map((item) => item.id)
  }
}

async function submitMenu() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (form.parentId && isArticleDirectoryMenu(form.parentId)) {
    message.warning('文章目录是系统内置模块，不能作为上级菜单')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      icon: form.icon,
      routePath: form.routePath || '',
      routeKey: form.routeKey || '',
      activeMenuCode: form.activeMenuCode || '',
      directoryAutoExpandWhenNested: selectedMenuIsArticleDirectory.value ? form.directoryAutoExpandWhenNested : true,
      openMode: form.openMode,
      hidden: form.hidden,
      enabled: form.enabled,
      parentId: form.parentId || null,
      sortOrder: form.sortOrder
    }

    if (isCreating.value) {
      const created = await createRbacMenu(payload)
      selectedMenuId.value = created.id
      isCreating.value = false
      message.success('菜单已创建')
    } else if (selectedMenuId.value) {
      await updateRbacMenu(selectedMenuId.value, payload)
      message.success('菜单已更新')
    }

    await loadMenus()
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function confirmDelete(id) {
  const record = flatMenus.value.find((item) => item.id === id)
  if (record?.type === 'system') {
    message.warning('系统内置菜单不允许删除，可通过隐藏或移动位置控制展示')
    return
  }

  Modal.confirm({
    title: '确认删除菜单',
    content: '删除后会同步移除子菜单及权限引用。',
    okType: 'danger',
    okText: '删除',
    cancelText: '取消',
    async onOk() {
      await deleteRbacMenu(id)
      message.success('菜单已删除')
      selectedMenuId.value = ''
      await loadMenus()
    }
  })
}

onMounted(loadMenus)

watch(expandedKeys, () => {
  saveExpandedKeys()
}, { deep: true })
</script>

<style scoped>
.menu-workbench {
  min-height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
}

.menu-workbench-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.42fr) minmax(520px, 1fr);
  gap: 16px;
}

.menu-panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.menu-panel-help {
  color: var(--console-text-secondary);
}

.menu-tree-panel,
.menu-form-panel {
  min-height: 0;
  overflow: hidden;
}

.menu-tree-scroll,
.menu-form-scroll {
  min-height: 0;
  height: 100%;
  overflow: auto;
  padding: 12px 14px 16px;
}

.menu-tree :deep(.ant-tree-treenode) {
  width: 100%;
  position: relative;
}

.menu-tree :deep(.ant-tree-indent-unit) {
  width: 24px;
  position: relative;
}

.menu-tree :deep(.ant-tree-switcher) {
  width: 24px;
  color: var(--console-text-secondary);
}

.menu-tree :deep(.ant-tree-switcher-line-icon) {
  color: var(--console-text-secondary);
}

.menu-tree :deep(.ant-tree-node-content-wrapper) {
  width: calc(100% - 24px);
  min-height: 38px;
  padding: 2px 6px 2px 0;
  border-radius: 6px;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.menu-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 6%, transparent);
}

.menu-tree :deep(.ant-tree-node-selected) {
  background: color-mix(in srgb, var(--console-primary, #1677ff) 10%, transparent) !important;
  box-shadow: inset 2px 0 0 var(--console-primary, #1677ff);
}

.menu-tree :deep(.ant-tree-indent-unit::before) {
  content: '';
  position: absolute;
  inset: -10px auto -10px 11px;
  width: 1px;
  background: color-mix(in srgb, var(--console-border, #d9d9d9) 72%, transparent);
}

.menu-tree :deep(.ant-tree-switcher::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 11px;
  width: 12px;
  height: 1px;
  background: color-mix(in srgb, var(--console-border, #d9d9d9) 72%, transparent);
}

.menu-tree :deep(.ant-tree-treenode:last-child > .ant-tree-indent .ant-tree-indent-unit:last-child::before) {
  bottom: 50%;
}

.menu-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
}

.menu-tree-node--module {
  padding: 0 6px;
  border: 1px dashed color-mix(in srgb, var(--console-border, #d9d9d9) 82%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--console-text-secondary, #8c8c8c) 7%, transparent);
}

.menu-tree-node-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.menu-tree-node strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: var(--console-text-primary);
}

.menu-tree-hidden-flag {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, #faad14 18%, transparent);
  color: #ad6800;
  font-size: 11px;
  line-height: 18px;
}

.menu-tree-module-flag {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--console-primary, #1677ff) 24%, transparent);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 9%, transparent);
  color: color-mix(in srgb, var(--console-primary, #1677ff) 88%, var(--console-text-primary));
  font-size: 11px;
  line-height: 18px;
}

.menu-tree-actions {
  display: inline-flex;
  gap: 0;
  opacity: 1;
  flex: 0 0 auto;
}

.menu-tree-action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  color: color-mix(in srgb, var(--console-text-secondary) 86%, transparent);
  border-radius: 6px;
}

.menu-tree-action-btn:hover {
  color: var(--console-primary, #1677ff);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 8%, transparent);
}

.menu-form {
  display: grid;
  gap: 12px;
}

.menu-help-content {
  display: grid;
  gap: 10px;
  max-width: 360px;
}

.menu-help-content--form {
  max-width: 420px;
}

.menu-help-item {
  display: grid;
  gap: 4px;
}

.menu-help-item strong {
  font-size: 13px;
  color: var(--console-text-primary);
}

.menu-help-item span {
  font-size: 12px;
  line-height: 1.6;
  color: var(--console-text-secondary);
}

.switch-label {
  margin-left: 8px;
  color: var(--console-text-secondary);
}

.system-module-config {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--console-primary, #1677ff) 24%, var(--console-border, #d9d9d9));
  border-radius: 8px;
  background: color-mix(in srgb, var(--console-primary, #1677ff) 6%, var(--console-card-bg, #fff));
}

.system-module-config__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-module-config__head strong {
  font-size: 14px;
  color: var(--console-text-primary);
}

.system-module-config__badge {
  flex: 0 0 auto;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--console-primary, #1677ff) 28%, transparent);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 10%, transparent);
  color: color-mix(in srgb, var(--console-primary, #1677ff) 88%, var(--console-text-primary));
  font-size: 12px;
  line-height: 20px;
}

.system-module-config__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.system-module-config__label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: var(--console-text-primary);
}

.system-module-config__body p,
.system-module-config__tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--console-text-secondary);
}

.system-module-config__tip {
  padding-top: 10px;
  border-top: 1px dashed color-mix(in srgb, var(--console-border, #d9d9d9) 86%, transparent);
}

@media (max-width: 1100px) {
  .menu-workbench-grid {
    grid-template-columns: 1fr;
  }
}
</style>
