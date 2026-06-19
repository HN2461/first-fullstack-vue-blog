<template>
  <section class="menu-workbench enterprise-page">
    <header class="menu-page-head">
      <div class="menu-page-head-main">
        <h1>菜单管理</h1>
        <span>{{ flatMenus.length }} 个菜单节点</span>
      </div>
      <a-space>
        <a-button @click="loadMenus">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate()">
          <template #icon><PlusOutlined /></template>
          新增一级菜单
        </a-button>
      </a-space>
    </header>

    <div class="menu-workbench-grid">
      <a-card class="menu-tree-panel" :body-style="{ padding: 0 }">
        <template #title>
          <div class="panel-title">
            <strong>菜单树</strong>
            <span>左侧拖拽调整层级与顺序</span>
          </div>
        </template>
        <template #extra>
          <span class="panel-count">{{ flatMenus.length }} 项</span>
        </template>

        <div class="menu-tree-scroll">
          <a-spin :spinning="loading">
            <a-empty v-if="!loading && !menuTree.length" description="暂无菜单" />
            <a-tree
              v-else
              class="menu-tree"
              draggable
              block-node
              :expanded-keys="expandedMenuKeys"
              :tree-data="menuTree"
              :selected-keys="selectedMenuId ? [selectedMenuId] : []"
              :field-names="{ title: 'name', key: 'id', children: 'children' }"
              @select="handleSelect"
              @expand="handleExpand"
              @drop="handleDrop"
            >
              <template #title="{ id, name }">
                <div class="menu-tree-node">
                  <strong>{{ name }}</strong>
                  <div class="menu-tree-actions" @click.stop>
                    <a-tooltip title="新增下级">
                      <a-button size="small" type="text" @click="openCreate(id)">
                        <template #icon><PlusOutlined /></template>
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="编辑">
                      <a-button size="small" type="text" @click="selectMenu(id)">
                        <template #icon><EditOutlined /></template>
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
          <div class="panel-title">
            <strong>{{ isCreating ? '新增菜单' : '菜单配置' }}</strong>
            <span>{{ isCreating ? '右侧表单用于新建菜单' : selectedMenu?.name || '选择左侧菜单后编辑' }}</span>
          </div>
        </template>
        <template #extra>
          <a-space>
            <a-button v-if="selectedMenu && !isCreating" danger @click="confirmDelete(selectedMenu)">
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
            <a-button @click="openCreate()">
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
          <a-empty v-if="!selectedMenu && !isCreating" description="选择左侧菜单或点击新增菜单" />
          <a-form v-else ref="formRef" :model="form" :rules="rules" layout="vertical" class="menu-form">
            <div class="menu-form-section">
              <div class="menu-form-section-title">基础信息</div>
              <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="菜单名称" name="name">
                  <a-input v-model:value="form.name" placeholder="例如：文章管理" :maxlength="40" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="菜单编码" name="code">
                  <a-input v-model:value="form.code" placeholder="content.articles" :maxlength="80" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :lg="12">
                <a-form-item label="前端路由路径" name="routePath">
                  <a-input v-model:value="form.routePath" placeholder="/console/manage/articles" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-form-item label="上级菜单" name="parentId">
                  <a-cascader
                    v-model:value="parentPathValue"
                    allow-clear
                    show-search
                    change-on-select
                    placeholder="作为一级菜单"
                    :options="parentCascaderOptions"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :lg="8">
                <a-form-item label="菜单图标" name="icon">
                  <div class="icon-select-trigger">
                    <div class="icon-select-current">
                      <span class="icon-select-preview">
                        <component :is="selectedIconMeta.component" />
                      </span>
                      <div>
                        <strong>{{ selectedIconMeta.label }}</strong>
                        <span>{{ selectedIconMeta.name }}</span>
                      </div>
                    </div>
                    <a-button @click="openIconPicker">选择图标</a-button>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="排序权重" name="sortOrder">
                  <a-input-number v-model:value="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :lg="8">
                <a-form-item label="打开方式" name="openMode">
                  <a-segmented
                    v-model:value="form.openMode"
                    block
                    :options="[
                      { label: '当前页', value: 'current' },
                      { label: '新标签页', value: 'blank' }
                    ]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            </div>

            <div class="menu-form-section">
              <div class="menu-form-section-title">显示设置</div>
              <div class="menu-switch-row">
                <div class="menu-switch-item">
                  <div>
                    <strong>启用菜单</strong>
                    <span>关闭后该菜单不再作为有效权限入口。</span>
                  </div>
                  <a-switch v-model:checked="form.enabled" checked-children="启用" un-checked-children="禁用" />
                </div>
                <div class="menu-switch-item">
                  <div>
                    <strong>隐藏菜单</strong>
                    <span>隐藏后不显示在侧栏，但保留路由授权。</span>
                  </div>
                  <a-switch v-model:checked="form.hidden" checked-children="隐藏" un-checked-children="显示" />
                </div>
              </div>
            </div>
          </a-form>
        </div>
      </a-card>
    </div>

    <a-modal
      v-model:open="iconPickerVisible"
      title="选择菜单图标"
      :width="720"
      :footer="null"
      :destroy-on-close="true"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
    >
      <div class="icon-picker">
        <a-input-search
          v-model:value="iconKeyword"
          allow-clear
          placeholder="搜索图标名称或用途"
        />

        <div v-if="filteredIconOptions.length" class="icon-picker-grid">
          <button
            v-for="item in filteredIconOptions"
            :key="item.name"
            type="button"
            class="icon-picker-option"
            :class="{ active: form.icon === item.name }"
            @click="selectIcon(item.name)"
          >
            <component :is="item.component" />
            <strong>{{ item.label }}</strong>
            <span>{{ item.name }}</span>
          </button>
        </div>
        <a-empty v-else description="未找到匹配图标" />
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  CommentOutlined,
  ControlOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FireOutlined,
  FolderOutlined,
  FormOutlined,
  GlobalOutlined,
  HddOutlined,
  HeartOutlined,
  HomeOutlined,
  InboxOutlined,
  KeyOutlined,
  LayoutOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  MonitorOutlined,
  NotificationOutlined,
  PictureOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  ReloadOutlined,
  RocketOutlined,
  SafetyOutlined,
  SaveOutlined,
  SearchOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ShopOutlined,
  StarOutlined,
  SwapOutlined,
  TableOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { createRbacMenu, deleteRbacMenu, listRbacMenus, reorderRbacMenus, updateRbacMenu } from '@/services/admin'

const iconOptions = [
  { name: 'DashboardOutlined', label: '工作台', keywords: 'dashboard 控制台 首页', component: DashboardOutlined },
  { name: 'HomeOutlined', label: '首页', keywords: 'home 首页 门户', component: HomeOutlined },
  { name: 'AppstoreOutlined', label: '应用模块', keywords: 'appstore 应用 模块 九宫格', component: AppstoreOutlined },
  { name: 'ControlOutlined', label: '控制台', keywords: 'control 控制台 管理 后台', component: ControlOutlined },
  { name: 'BookOutlined', label: '知识库', keywords: 'book 知识库 文档 阅读', component: BookOutlined },
  { name: 'ReadOutlined', label: '阅读', keywords: 'read 阅读 文章 学习', component: ReadOutlined },
  { name: 'FileTextOutlined', label: '文章内容', keywords: 'file text 文章 内容 文档', component: FileTextOutlined },
  { name: 'FileDoneOutlined', label: '已发布内容', keywords: 'file done 发布 完成 已发布', component: FileDoneOutlined },
  { name: 'FileSearchOutlined', label: '内容检索', keywords: 'file search 检索 搜索 查询', component: FileSearchOutlined },
  { name: 'FormOutlined', label: '表单配置', keywords: 'form 表单 编辑 配置', component: FormOutlined },
  { name: 'ProfileOutlined', label: '档案资料', keywords: 'profile 档案 资料 简介', component: ProfileOutlined },
  { name: 'FolderOutlined', label: '分类目录', keywords: 'folder 分类 目录 文件夹', component: FolderOutlined },
  { name: 'ApartmentOutlined', label: '组织结构', keywords: 'apartment 组织 架构 层级', component: ApartmentOutlined },
  { name: 'ProjectOutlined', label: '项目管理', keywords: 'project 项目 看板 任务', component: ProjectOutlined },
  { name: 'SwapOutlined', label: '迁移转换', keywords: 'swap 迁移 转换 同步', component: SwapOutlined },
  { name: 'TagsOutlined', label: '标签管理', keywords: 'tags 标签 标记', component: TagsOutlined },
  { name: 'PictureOutlined', label: '媒体图片', keywords: 'picture 图片 媒体 素材', component: PictureOutlined },
  { name: 'UploadOutlined', label: '上传导入', keywords: 'upload 上传 导入 文件', component: UploadOutlined },
  { name: 'InboxOutlined', label: '收件归档', keywords: 'inbox 收件箱 归档 入库', component: InboxOutlined },
  { name: 'AuditOutlined', label: '审核审批', keywords: 'audit 审核 审批 评论', component: AuditOutlined },
  { name: 'UserOutlined', label: '用户', keywords: 'user 用户 个人', component: UserOutlined },
  { name: 'TeamOutlined', label: '用户组', keywords: 'team 团队 用户组 成员', component: TeamOutlined },
  { name: 'KeyOutlined', label: '密钥权限', keywords: 'key 密钥 权限 授权', component: KeyOutlined },
  { name: 'LockOutlined', label: '锁定安全', keywords: 'lock 锁定 安全 密码', component: LockOutlined },
  { name: 'MenuOutlined', label: '菜单', keywords: 'menu 菜单 导航', component: MenuOutlined },
  { name: 'SafetyOutlined', label: '安全权限', keywords: 'safety 安全 权限 角色', component: SafetyOutlined },
  { name: 'BellOutlined', label: '通知公告', keywords: 'bell 通知 公告 消息', component: BellOutlined },
  { name: 'NotificationOutlined', label: '运营公告', keywords: 'notification 运营 公告 通知', component: NotificationOutlined },
  { name: 'MessageOutlined', label: '消息会话', keywords: 'message 消息 会话 私信', component: MessageOutlined },
  { name: 'MailOutlined', label: '邮件', keywords: 'mail 邮件 邮箱', component: MailOutlined },
  { name: 'CommentOutlined', label: '评论互动', keywords: 'comment 评论 互动 留言', component: CommentOutlined },
  { name: 'CustomerServiceOutlined', label: '客服支持', keywords: 'customer service 客服 支持 服务', component: CustomerServiceOutlined },
  { name: 'SettingOutlined', label: '系统设置', keywords: 'setting 设置 配置 系统', component: SettingOutlined },
  { name: 'ToolOutlined', label: '工具维护', keywords: 'tool 工具 维护 运维', component: ToolOutlined },
  { name: 'MonitorOutlined', label: '系统监控', keywords: 'monitor 监控 状态 运维', component: MonitorOutlined },
  { name: 'ApiOutlined', label: '接口服务', keywords: 'api 接口 服务 调用', component: ApiOutlined },
  { name: 'DatabaseOutlined', label: '数据库', keywords: 'database 数据库 数据 存储', component: DatabaseOutlined },
  { name: 'HddOutlined', label: '存储空间', keywords: 'hdd 存储 磁盘 空间', component: HddOutlined },
  { name: 'CloudOutlined', label: '云服务', keywords: 'cloud 云 服务 部署', component: CloudOutlined },
  { name: 'DesktopOutlined', label: '终端设备', keywords: 'desktop 终端 设备 客户端', component: DesktopOutlined },
  { name: 'CodeOutlined', label: '代码开发', keywords: 'code 代码 开发 技术', component: CodeOutlined },
  { name: 'ExperimentOutlined', label: '实验功能', keywords: 'experiment 实验 测试 功能', component: ExperimentOutlined },
  { name: 'TableOutlined', label: '数据表格', keywords: 'table 表格 数据 列表', component: TableOutlined },
  { name: 'UnorderedListOutlined', label: '列表', keywords: 'list 列表 清单', component: UnorderedListOutlined },
  { name: 'FilterOutlined', label: '筛选过滤', keywords: 'filter 筛选 过滤 条件', component: FilterOutlined },
  { name: 'SearchOutlined', label: '搜索', keywords: 'search 搜索 查询 检索', component: SearchOutlined },
  { name: 'EyeOutlined', label: '查看预览', keywords: 'eye 查看 预览 可见', component: EyeOutlined },
  { name: 'CheckCircleOutlined', label: '完成通过', keywords: 'check circle 完成 通过 成功', component: CheckCircleOutlined },
  { name: 'ClockCircleOutlined', label: '时间计划', keywords: 'clock 时间 计划 定时', component: ClockCircleOutlined },
  { name: 'CalendarOutlined', label: '日程日历', keywords: 'calendar 日程 日历 日期', component: CalendarOutlined },
  { name: 'GlobalOutlined', label: '全局门户', keywords: 'global 全局 门户 国际化', component: GlobalOutlined },
  { name: 'LinkOutlined', label: '链接', keywords: 'link 链接 外链 绑定', component: LinkOutlined },
  { name: 'ShareAltOutlined', label: '分享分发', keywords: 'share 分享 分发 转发', component: ShareAltOutlined },
  { name: 'RocketOutlined', label: '发布上线', keywords: 'rocket 发布 上线 启动', component: RocketOutlined },
  { name: 'ShopOutlined', label: '站点商城', keywords: 'shop 商城 商品 店铺', component: ShopOutlined },
  { name: 'StarOutlined', label: '收藏精选', keywords: 'star 收藏 精选 推荐', component: StarOutlined },
  { name: 'HeartOutlined', label: '喜欢关注', keywords: 'heart 喜欢 关注 互动', component: HeartOutlined },
  { name: 'FireOutlined', label: '热门趋势', keywords: 'fire 热门 趋势 热点', component: FireOutlined },
  { name: 'LayoutOutlined', label: '页面布局', keywords: 'layout 页面 布局 模板', component: LayoutOutlined },
  { name: 'QuestionCircleOutlined', label: '帮助说明', keywords: 'question help 帮助 说明 问题', component: QuestionCircleOutlined },
  { name: 'DeleteOutlined', label: '回收站', keywords: 'delete 删除 回收站 垃圾箱', component: DeleteOutlined }
]

const loading = ref(false)
const saving = ref(false)
const menuTree = ref([])
const flatMenus = ref([])
const expandedMenuKeys = ref([])
const selectedMenuId = ref('')
const isCreating = ref(false)
const formRef = ref(null)
const iconPickerVisible = ref(false)
const iconKeyword = ref('')

const form = reactive({
  name: '',
  code: '',
  icon: 'MenuOutlined',
  routePath: '/console/manage/',
  openMode: 'current',
  hidden: false,
  enabled: true,
  parentId: null,
  sortOrder: 0
})

const rules = {
  name: [
    { required: true, message: '请输入菜单名称' },
    { min: 2, max: 40, message: '菜单名称需为 2-40 个字符' }
  ],
  code: [
    { required: true, message: '请输入菜单编码' },
    { pattern: /^[a-z][a-z0-9.-]{1,79}$/, message: '仅支持小写字母、数字、点号和连字符' }
  ],
  routePath: [
    { required: true, message: '请输入路由路径' },
    { pattern: /^\/[A-Za-z0-9_./:-]*$/, message: '路由路径格式不正确' }
  ]
}

const selectedMenu = computed(() => flatMenus.value.find((menu) => menu.id === selectedMenuId.value))
const selectedIconMeta = computed(() => {
  const selected = iconOptions.find((item) => item.name === form.icon)
  return selected || iconOptions.find((item) => item.name === 'MenuOutlined')
})
const filteredIconOptions = computed(() => {
  const keyword = iconKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return iconOptions
  }

  return iconOptions.filter((item) => {
    const searchableText = `${item.name} ${item.label} ${item.keywords}`.toLowerCase()
    return searchableText.includes(keyword)
  })
})
const parentOptions = computed(() => removeNodeFromTree(menuTree.value, selectedMenuId.value))
const parentCascaderOptions = computed(() => mapCascaderOptions(parentOptions.value))
const parentPathValue = computed({
  get: () => findNodePathIds(parentOptions.value, form.parentId),
  set: (value) => {
    form.parentId = Array.isArray(value) && value.length ? value[value.length - 1] : null
  }
})

function resetForm(record = null, parentId = null) {
  form.name = record?.name || ''
  form.code = record?.code || ''
  form.icon = record?.icon || 'MenuOutlined'
  form.routePath = record?.routePath || '/console/manage/'
  form.openMode = record?.openMode || 'current'
  form.hidden = !!record?.hidden
  form.enabled = record?.enabled !== false
  form.parentId = record?.parentId ?? parentId ?? null
  form.sortOrder = record?.sortOrder || 0
}

function flattenTree(items = []) {
  return items.flatMap((item) => [
    item,
    ...flattenTree(item.children || [])
  ])
}

function collectTreeKeys(items = []) {
  return items.flatMap((item) => [
    item.id,
    ...collectTreeKeys(item.children || [])
  ])
}

function mapCascaderOptions(items = []) {
  return items.map((item) => ({
    label: item.name,
    value: item.id,
    children: mapCascaderOptions(item.children || [])
  }))
}

function findNodePathIds(items = [], targetId, path = []) {
  for (const item of items) {
    const nextPath = [...path, item.id]
    if (item.id === targetId) {
      return nextPath
    }

    const children = item.children || []
    if (children.length) {
      const nested = findNodePathIds(children, targetId, nextPath)
      if (nested.length) {
        return nested
      }
    }
  }

  return []
}

function removeNodeFromTree(items = [], removedId = '') {
  return items
    .filter((item) => item.id !== removedId)
    .map((item) => ({
      ...item,
      children: removeNodeFromTree(item.children || [], removedId)
    }))
}

function toggleExpanded(id) {
  if (!id) return
  const next = new Set(expandedMenuKeys.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedMenuKeys.value = [...next]
}

function findSiblings(parentId) {
  if (!parentId) {
    return menuTree.value
  }
  return menuTree.value.length ? flattenTree(menuTree.value).find((menu) => menu.id === parentId)?.children || [] : []
}

function openCreate(parentId = null) {
  selectedMenuId.value = ''
  isCreating.value = true
  resetForm(null, parentId)
}

function openIconPicker() {
  iconKeyword.value = ''
  iconPickerVisible.value = true
}

function selectIcon(iconName) {
  form.icon = iconName
  iconPickerVisible.value = false
}

function selectMenu(id) {
  const record = flatMenus.value.find((menu) => menu.id === id)
  if (!record) return
  selectedMenuId.value = id
  isCreating.value = false
  resetForm(record)
}

function handleSelect(keys) {
  if (keys?.[0]) {
    const targetId = keys[0]
    const record = flatMenus.value.find((menu) => menu.id === targetId)
    if (record?.children?.length) {
      toggleExpanded(targetId)
    }
    selectMenu(targetId)
  }
}

function handleExpand(keys) {
  expandedMenuKeys.value = [...keys]
}

async function loadMenus() {
  loading.value = true
  try {
    const result = await listRbacMenus()
    menuTree.value = result.tree || []
    flatMenus.value = flattenTree(menuTree.value)
    expandedMenuKeys.value = collectTreeKeys(menuTree.value)
    if (!selectedMenuId.value && flatMenus.value.length && !isCreating.value) {
      selectMenu(flatMenus.value[0].id)
    }
  } catch (error) {
    message.error(error.message || '菜单列表加载失败')
  } finally {
    loading.value = false
  }
}

async function submitMenu() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      icon: form.icon,
      routePath: form.routePath,
      openMode: form.openMode,
      hidden: form.hidden,
      enabled: form.enabled,
      parentId: form.parentId || null,
      sortOrder: form.sortOrder
    }

    if (isCreating.value) {
      const created = await createRbacMenu(payload)
      message.success('菜单已创建')
      selectedMenuId.value = created.id
      isCreating.value = false
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

async function handleDrop(info) {
  const dragId = info.dragNode?.key
  const targetId = info.node?.key
  if (!dragId || !targetId || dragId === targetId) return

  const target = flatMenus.value.find((menu) => menu.id === targetId)
  const drag = flatMenus.value.find((menu) => menu.id === dragId)
  if (!target || !drag) return

  const dropPos = Number(info.node.pos?.split('-').at(-1) || 0)
  const droppedAfterTarget = info.dropPosition > dropPos
  const nextParentId = info.dropToGap ? (target.parentId || null) : target.id
  const nextSiblings = findSiblings(nextParentId).filter((item) => item.id !== dragId)
  const targetIndex = nextSiblings.findIndex((item) => item.id === targetId)
  const insertIndex = info.dropToGap
    ? Math.max(0, targetIndex + (droppedAfterTarget ? 1 : 0))
    : nextSiblings.length

  nextSiblings.splice(insertIndex, 0, {
    ...drag,
    parentId: nextParentId
  })

  const reorderItems = nextSiblings.map((item, index) => ({
    id: item.id,
    parentId: nextParentId,
    sortOrder: (index + 1) * 10
  }))

  const previousParentId = drag.parentId || null
  if (previousParentId !== nextParentId) {
    const previousSiblings = findSiblings(previousParentId)
      .filter((item) => item.id !== dragId)
      .map((item, index) => ({
        id: item.id,
        parentId: previousParentId,
        sortOrder: (index + 1) * 10
      }))
    reorderItems.push(...previousSiblings)
  }

  try {
    await reorderRbacMenus(reorderItems)
    message.success('菜单位置已更新')
    await loadMenus()
    selectMenu(dragId)
  } catch (error) {
    message.error(error.message || '拖拽调整失败')
  }
}

function confirmDelete(record) {
  Modal.confirm({
    title: '确认删除菜单',
    content: `确定要删除「${record.name}」吗？存在下级菜单时需先调整下级。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteRbacMenu(record.id)
        message.success('菜单已删除')
        selectedMenuId.value = ''
        await loadMenus()
      } catch (error) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

onMounted(loadMenus)
</script>

<style scoped>
.menu-workbench {
  height: calc(100vh - var(--console-header-height) - var(--console-content-padding) * 2);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.menu-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 2px 2px 0;
}

.menu-page-head-main {
  display: grid;
  gap: 4px;
}

.menu-page-head h1 {
  margin: 0;
  color: var(--console-text);
  font-size: 18px;
  line-height: 28px;
}

.menu-page-head span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.menu-workbench-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 0.44fr) minmax(520px, 1fr);
  gap: 16px;
}

.menu-tree-panel,
.menu-form-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.panel-count {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.panel-title {
  display: grid;
  gap: 2px;
}

.panel-title strong {
  color: var(--console-text);
  font-weight: 650;
}

.panel-title span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.menu-tree-panel :deep(.ant-card-head),
.menu-form-panel :deep(.ant-card-head) {
  background: var(--console-surface-muted);
}

.menu-tree-panel :deep(.ant-card-body),
.menu-form-panel :deep(.ant-card-body) {
  height: calc(100% - 53px);
  min-height: 0;
}

.menu-tree-scroll,
.menu-form-scroll {
  height: 100%;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}

.menu-tree-scroll {
  padding: 12px;
}

.menu-form-scroll {
  padding: 18px 20px 22px;
}

.menu-tree :deep(.ant-tree-treenode) {
  width: 100%;
  padding: 2px 0;
}

.menu-tree :deep(.ant-tree-node-content-wrapper) {
  min-height: 44px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 5px 10px;
  transition: background 0.18s ease, color 0.18s ease;
}

.menu-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: var(--console-surface-hover);
}

.menu-tree :deep(.ant-tree-node-selected) {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft) !important;
}

.menu-tree :deep(.ant-tree-title) {
  min-width: 0;
  flex: 1;
}

.menu-tree-node {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.menu-tree-node strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--console-text);
  font-size: 13px;
  font-weight: 650;
}

.menu-tree-actions {
  display: inline-flex;
  opacity: 0;
  flex: 0 0 auto;
  transition: opacity 0.18s ease;
}

.menu-tree :deep(.ant-tree-node-content-wrapper:hover) .menu-tree-actions,
.menu-tree :deep(.ant-tree-node-selected) .menu-tree-actions {
  opacity: 1;
}

.menu-form {
  display: grid;
  gap: 16px;
}

.menu-form-section {
  display: grid;
  gap: 2px;
}

.menu-form-section-title {
  margin-bottom: 6px;
  color: var(--console-text);
  font-size: 13px;
  font-weight: 650;
}

.menu-form :deep(.ant-form-item) {
  margin-bottom: 18px;
}

.menu-form :deep(.ant-form-item-label > label) {
  color: var(--console-text);
  font-weight: 600;
}

.menu-form :deep(.ant-input),
.menu-form :deep(.ant-input-number),
.menu-form :deep(.ant-input-affix-wrapper),
.menu-form :deep(.ant-select-selector),
.menu-form :deep(.ant-picker),
.menu-form :deep(.ant-input-number-input) {
  min-height: 40px;
}

.menu-form :deep(.ant-segmented) {
  background: var(--console-surface-muted);
}

.menu-form :deep(.ant-segmented-item-selected) {
  color: var(--console-primary-strong);
}

.icon-select-trigger {
  min-height: 40px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
}

.icon-select-current {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 11px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
}

.icon-select-preview {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
  font-size: 16px;
}

.icon-select-current div {
  min-width: 0;
  display: grid;
  gap: 1px;
}

.icon-select-current strong,
.icon-select-current span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-select-current strong {
  color: var(--console-text);
  font-size: 13px;
  line-height: 18px;
}

.icon-select-current span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 16px;
}

.icon-select-trigger :deep(.ant-btn) {
  height: auto;
  min-height: 40px;
  flex: 0 0 auto;
}

.icon-picker {
  display: grid;
  gap: 14px;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 10px;
}

.icon-picker-option {
  min-width: 0;
  height: 104px;
  display: grid;
  grid-template-rows: 28px 20px 18px;
  align-content: center;
  justify-items: center;
  gap: 6px;
  padding: 10px 8px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  color: var(--console-text);
  background: var(--console-surface-muted);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.icon-picker-option:hover {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
}

.icon-picker-option.active {
  border-color: var(--console-primary-strong);
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.icon-picker-option :deep(.anticon) {
  font-size: 24px;
}

.icon-picker-option strong,
.icon-picker-option span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-picker-option strong {
  font-size: 13px;
  line-height: 20px;
}

.icon-picker-option span {
  color: var(--console-text-secondary);
  font-size: 11px;
  line-height: 18px;
}

.icon-picker-option.active span {
  color: var(--console-primary-strong);
}

.menu-tree-panel :deep(.ant-tree-switcher) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin-inline-end: 2px;
}

.menu-tree-panel :deep(.ant-tree-switcher):hover {
  background: transparent;
}

.menu-switch-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.menu-switch-item {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
  transition: border-color 0.18s ease, background 0.18s ease;
}

.menu-switch-item:hover {
  border-color: var(--console-border-strong);
  background: var(--console-surface-hover);
}

.menu-switch-item strong,
.menu-switch-item span {
  display: block;
}

.menu-switch-item strong {
  color: var(--console-text);
}

.menu-switch-item span {
  margin-top: 4px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.menu-form-panel :deep(.ant-empty) {
  margin-top: 120px;
}

@media (max-width: 1100px) {
  .menu-workbench {
    height: auto;
  }

  .menu-workbench-grid {
    grid-template-columns: 1fr;
  }

  .menu-tree-panel,
  .menu-form-panel {
    min-height: 420px;
  }

  .menu-switch-row {
    grid-template-columns: 1fr;
  }
}
</style>
