<template>
  <div class="icon-picker">
    <button class="icon-picker-trigger" type="button" :disabled="disabled" @click="openPicker">
      <span class="icon-picker-preview">
        <component :is="selectedIconComponent" />
      </span>
      <span class="icon-picker-meta">
        <strong>{{ selectedOption?.label || '选择图标' }}</strong>
        <small>{{ selectedValue || '未选择' }}</small>
      </span>
    </button>

    <a-modal
      v-model:open="open"
      title="选择菜单图标"
      width="760px"
      :footer="null"
      :body-style="{ padding: 0 }"
    >
      <div class="icon-picker-dialog">
        <div class="icon-picker-toolbar">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索图标名称，例如：文章、用户、设置"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div class="icon-picker-grid">
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            :class="['icon-picker-option', { active: option.value === selectedValue }]"
            @click="selectIcon(option.value)"
          >
            <component :is="option.component" />
            <span>{{ option.label }}</span>
          </button>
          <a-empty v-if="!filteredOptions.length" class="icon-picker-empty" description="未找到匹配图标" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
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
  ImportOutlined,
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
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyOutlined,
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

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value'])

const open = ref(false)
const keyword = ref('')
const selectedValue = computed(() => props.value || 'MenuOutlined')

const iconLabels = {
  ApiOutlined: '接口',
  ApartmentOutlined: '组织',
  AppstoreOutlined: '应用',
  AuditOutlined: '审核',
  BellOutlined: '公告',
  BookOutlined: '知识库',
  BulbOutlined: '备忘录',
  CalendarOutlined: '日历',
  CheckCircleOutlined: '确认',
  ClockCircleOutlined: '时间',
  CloudOutlined: '云端',
  CodeOutlined: '代码',
  CommentOutlined: '评论',
  ControlOutlined: '控制台',
  CustomerServiceOutlined: '音频',
  DashboardOutlined: '工作台',
  DatabaseOutlined: '数据',
  DeleteOutlined: '删除',
  DesktopOutlined: '桌面',
  ExperimentOutlined: '实验',
  EyeOutlined: '查看',
  FileDoneOutlined: '完成文件',
  FileSearchOutlined: '文件搜索',
  FileTextOutlined: '文章',
  FilterOutlined: '筛选',
  FireOutlined: '热门',
  FolderOutlined: '文件夹',
  FormOutlined: '表单',
  GlobalOutlined: '全局',
  HddOutlined: '存储',
  HeartOutlined: '喜欢',
  HomeOutlined: '首页',
  InboxOutlined: '收件',
  ImportOutlined: '导入',
  KeyOutlined: '密钥',
  LayoutOutlined: '布局',
  LinkOutlined: '链接',
  LockOutlined: '锁定',
  MailOutlined: '邮件',
  MenuOutlined: '菜单',
  MessageOutlined: '消息',
  MonitorOutlined: '监控',
  NotificationOutlined: '通知',
  PictureOutlined: '图片',
  ProfileOutlined: '资料',
  ProjectOutlined: '项目',
  QuestionCircleOutlined: '帮助',
  ReadOutlined: '阅读',
  RocketOutlined: '发布',
  SafetyOutlined: '安全',
  SearchOutlined: '搜索',
  SettingOutlined: '设置',
  ShareAltOutlined: '分享',
  ShopOutlined: '商店',
  StarOutlined: '收藏',
  SwapOutlined: '迁移',
  TableOutlined: '表格',
  TagsOutlined: '标签',
  TeamOutlined: '团队',
  ToolOutlined: '工具',
  UnorderedListOutlined: '列表',
  UploadOutlined: '上传',
  UserOutlined: '用户'
}

const iconComponents = {
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
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
  ImportOutlined,
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
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyOutlined,
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
}

const iconOptions = Object.entries(iconLabels).map(([value, label]) => ({
  value,
  label,
  component: iconComponents[value] || MenuOutlined
}))

const selectedOption = computed(() => {
  return iconOptions.find((item) => item.value === selectedValue.value)
})
const selectedIconComponent = computed(() => selectedOption.value?.component || MenuOutlined)
const filteredOptions = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return iconOptions

  return iconOptions.filter((item) => {
    return item.value.toLowerCase().includes(text) || item.label.toLowerCase().includes(text)
  })
})

function openPicker() {
  if (props.disabled) return
  open.value = true
}

function selectIcon(value) {
  emit('update:value', value)
  open.value = false
}

watch(open, (visible) => {
  if (!visible) {
    keyword.value = ''
  }
})
</script>

<style scoped>
.icon-picker {
  width: 100%;
}

.icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 6px 10px;
  border: 1px solid var(--console-border, #d9d9d9);
  border-radius: 6px;
  background: var(--console-bg-card, #fff);
  color: var(--console-text-primary, #1f1f1f);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.icon-picker-trigger:hover {
  border-color: var(--console-primary, #1677ff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--console-primary, #1677ff) 10%, transparent);
}

.icon-picker-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  background: color-mix(in srgb, var(--console-text-secondary, #8c8c8c) 7%, transparent);
}

.icon-picker-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--console-primary, #1677ff) 9%, transparent);
  color: var(--console-primary, #1677ff);
  font-size: 17px;
}

.icon-picker-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.icon-picker-meta strong,
.icon-picker-meta small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-picker-meta strong {
  font-size: 13px;
}

.icon-picker-meta small {
  color: var(--console-text-secondary, #8c8c8c);
  font-size: 12px;
}

.icon-picker-dialog {
  display: grid;
  grid-template-rows: auto minmax(260px, 56vh);
}

.icon-picker-toolbar {
  padding: 14px;
  border-bottom: 1px solid var(--console-border, #d9d9d9);
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 8px;
  align-content: start;
  overflow: auto;
  padding: 14px;
}

.icon-picker-option {
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 76px;
  padding: 10px 8px;
  border: 1px solid var(--console-border, #d9d9d9);
  border-radius: 6px;
  background: var(--console-bg-card, #fff);
  color: var(--console-text-primary, #1f1f1f);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.icon-picker-option:hover,
.icon-picker-option.active {
  border-color: var(--console-primary, #1677ff);
  background: color-mix(in srgb, var(--console-primary, #1677ff) 7%, transparent);
}

.icon-picker-option.active {
  box-shadow: inset 0 0 0 1px var(--console-primary, #1677ff);
}

.icon-picker-option :deep(.anticon) {
  font-size: 22px;
  color: var(--console-primary, #1677ff);
}

.icon-picker-option span {
  max-width: 100%;
  overflow: hidden;
  color: var(--console-text-secondary, #8c8c8c);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-picker-empty {
  grid-column: 1 / -1;
  margin: 40px 0;
}
</style>
