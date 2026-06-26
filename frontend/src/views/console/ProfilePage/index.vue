<template>
  <div class="profile-page">
    <!-- 左侧卡片：个人信息 + Tab -->
    <div class="profile-sidebar">
      <div class="sidebar-card">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <button
            class="avatar-wrapper"
            type="button"
            :aria-label="userAvatar ? '预览头像' : '当前暂无头像'"
            @click="openAvatarPreview"
          >
            <a-avatar :size="80" :src="userAvatar" class="user-avatar">
              {{ userInitial }}
            </a-avatar>
            <div class="avatar-overlay">
              <EyeOutlined v-if="userAvatar" />
              <CameraOutlined v-else />
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style="display: none"
              @change="handleAvatarFileSelect"
            />
          </button>
          <h3 class="user-name">{{ authStore.user?.username || '未设置昵称' }}</h3>
          <p class="user-email">{{ authStore.user?.email || '未绑定邮箱' }}</p>
          <a-tag :color="roleMeta.color" class="role-tag">
            {{ roleMeta.label }}
          </a-tag>
        </div>

        <!-- 头像裁剪弹窗 -->
        <a-modal
          v-model:open="cropperVisible"
          title="裁剪头像"
          :confirm-loading="uploadingAvatar"
          :width="720"
          :destroy-on-close="true"
          ok-text="确认上传"
          cancel-text="取消"
          @ok="handleCropConfirm"
          @cancel="handleCropCancel"
        >
          <div v-if="cropperSrc" class="avatar-cropper-modal__body">
            <AvatarCropper
              ref="avatarCropperRef"
              :src="cropperSrc"
              :compress="0.9"
              :aspect-ratio="1"
            />
          </div>
          <div class="avatar-cropper-modal__tip">
            <p>拖拽调整裁剪区域，滚轮缩放图片。上传后图片将裁剪为正方形。</p>
          </div>
        </a-modal>

        <!-- 统计数据 -->
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-num">{{ userStats.articles }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ userStats.comments }}</span>
            <span class="stat-label">评论</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ userStats.likes }}</span>
            <span class="stat-label">获赞</span>
          </div>
        </div>

        <!-- Tab 切换 -->
        <div class="tab-list">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" />
            <span>{{ tab.label }}</span>
            <RightOutlined class="tab-arrow" />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧卡片：内容展示 -->
    <div class="profile-main">
      <div class="main-card">
        <!-- 基本资料 -->
        <div v-show="activeTab === 'basic'" class="tab-content">
          <h3 class="content-title">基本资料</h3>
          <div class="profile-avatar-panel">
            <button
              class="profile-avatar-preview-action"
              type="button"
              :aria-label="userAvatar ? '预览头像' : '当前暂无头像'"
              @click="openAvatarPreview"
            >
              <a-avatar :size="72" :src="userAvatar" class="profile-avatar-preview">
              {{ userInitial }}
              </a-avatar>
            </button>
            <div class="profile-avatar-panel__body">
              <strong>个人头像</strong>
              <span>头像会同步展示在顶部用户区、个人信息页和互动场景。</span>
            </div>
            <a-space>
              <a-button @click="triggerAvatarUpload">
                <template #icon><CameraOutlined /></template>
                更新头像
              </a-button>
              <a-button danger :disabled="!userAvatar" :loading="deletingAvatar" @click="handleDeleteAvatar">
                删除头像
              </a-button>
            </a-space>
          </div>
          <a-form
            :model="profileForm"
            @finish="handleSaveProfile"
            layout="vertical"
            class="profile-form"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="昵称" name="username">
                  <a-input
                    v-model:value="profileForm.username"
                    placeholder="请输入昵称"
                    :maxlength="32"
                    show-count
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="邮箱">
                  <a-input
                    :value="authStore.user?.email"
                    disabled
                    placeholder="未绑定邮箱"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="个人简介" name="bio">
              <a-textarea
                v-model:value="profileForm.bio"
                placeholder="介绍一下自己..."
                :maxlength="240"
                :rows="4"
                show-count
              />
            </a-form-item>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="个人网站" name="website">
                  <a-input
                    v-model:value="profileForm.website"
                    placeholder="https://example.com"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="所在地" name="location">
                  <a-input
                    v-model:value="profileForm.location"
                    placeholder="城市/地区"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="生日" name="birthday">
                  <a-input
                    v-model:value="profileForm.birthday"
                    type="date"
                    placeholder="YYYY-MM-DD"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="生日动画">
                  <a-checkbox v-model:checked="profileForm.closeBirthEffect">
                    不再提醒生日动画
                  </a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <EntranceEffectSettings v-model:value="profileForm.entranceEffect" />
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="saving">
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 安全设置 -->
        <div v-show="activeTab === 'security'" class="tab-content">
          <h3 class="content-title">修改密码</h3>
          <a-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            @finish="handleChangePassword"
            layout="vertical"
            class="password-form"
          >
            <a-form-item label="原密码" name="oldPassword">
              <a-input-password
                v-model:value="passwordForm.oldPassword"
                placeholder="请输入原密码"
              />
            </a-form-item>
            <a-form-item label="新密码" name="newPassword">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码（至少8位）"
              />
            </a-form-item>
            <a-form-item label="确认新密码" name="confirmPassword">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="changingPassword">
                修改密码
              </a-button>
            </a-form-item>
          </a-form>

          <!-- 登录记录 -->
          <h3 class="content-title" style="margin-top: 32px">登录记录</h3>
          <div v-if="loadingLoginRecords" class="record-loading">正在加载登录记录...</div>
          <div v-else-if="loginRecords.length" class="record-list">
            <div class="record-item" v-for="record in loginRecords" :key="record.id">
              <div class="record-icon"><DesktopOutlined /></div>
              <div class="record-info">
                <span class="record-title">{{ record.device || '未知设备' }}</span>
                <span class="record-desc">登录时间：{{ formatDate(record.loggedAt) }}</span>
              </div>
              <a-tag v-if="record.current" color="green">当前设备</a-tag>
            </div>
          </div>
          <a-empty
            v-else
            description="登录记录接口待接入真实审计数据"
            :image-style="{ height: '48px' }"
          />
        </div>

        <!-- 账号绑定 -->
        <div v-show="activeTab === 'binding'" class="tab-content">
          <h3 class="content-title">第三方账号绑定</h3>
          <div class="binding-list">
            <div class="binding-item" v-for="item in bindings" :key="item.key">
              <div class="binding-info">
                <span class="binding-icon" :style="{ color: item.color }">
                  <component :is="item.icon" />
                </span>
                <div>
                  <span class="binding-name">{{ item.name }}</span>
                  <span class="binding-desc">{{ item.desc }}</span>
                </div>
              </div>
              <a-button
                :type="item.bound ? 'default' : 'primary'"
                size="small"
                disabled
              >
                {{ item.bound ? '已绑定' : '去绑定' }}
              </a-button>
            </div>
          </div>
          <p class="feature-hint">第三方绑定模块已预留，后续接入正式授权接口。</p>
        </div>

        <!-- 通知设置 -->
        <div v-show="activeTab === 'notification'" class="tab-content">
          <h3 class="content-title">通知偏好</h3>
          <div class="setting-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">邮件通知</span>
                <span class="setting-desc">接收评论回复、系统通知等邮件</span>
              </div>
              <a-switch v-model:checked="notificationSettings.email" />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">站内消息</span>
                <span class="setting-desc">接收站内私信和系统消息</span>
              </div>
              <a-switch v-model:checked="notificationSettings.site" />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">评论提醒</span>
                <span class="setting-desc">有人评论您的文章时通知</span>
              </div>
              <a-switch v-model:checked="notificationSettings.comment" />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">点赞提醒</span>
                <span class="setting-desc">有人点赞您的文章时通知</span>
              </div>
              <a-switch v-model:checked="notificationSettings.like" />
            </div>
          </div>
          <div class="notification-actions">
            <a-button type="primary" :loading="savingNotifications" @click="handleSaveNotifications">
              保存通知设置
            </a-button>
          </div>
        </div>

        <!-- 权限申请 -->
        <div v-show="activeTab === 'permission'" class="tab-content">
          <div class="permission-header">
            <div>
              <h3 class="content-title">权限申请</h3>
              <p>选择需要申请的角色并提交说明后，由超级管理员统一审批。</p>
            </div>
            <a-button type="primary" :disabled="hasPendingPermissionRequest" @click="openPermissionApplication">
              提交申请
            </a-button>
          </div>

          <div class="role-summary">
            <span>当前角色</span>
            <a-space wrap size="small">
              <a-tag
                v-for="role in authStore.user?.roles || []"
                :key="role.id || role.code"
                :color="role.isSuperAdmin ? 'red' : 'blue'"
                :bordered="false"
              >
                {{ role.name || role.code }}
              </a-tag>
              <a-tag v-if="!authStore.user?.roles?.length" :bordered="false">未分配</a-tag>
            </a-space>
          </div>

          <h3 class="content-title" style="margin-top: 28px">申请记录</h3>
          <div v-if="loadingPermissionRequests" class="record-loading">正在加载申请记录...</div>
          <div v-else-if="permissionRequests.length" class="permission-request-list">
            <div v-for="item in permissionRequests" :key="item.id" class="permission-request-item">
              <div>
                <strong>{{ item.targetRole?.name || '管理员基础角色' }}</strong>
                <p>{{ item.reason }}</p>
                <small v-if="item.rejectReason">驳回原因：{{ item.rejectReason }}</small>
              </div>
              <div class="permission-request-meta">
                <a-tag :color="getPermissionStatusMeta(item.status).color" :bordered="false">
                  {{ getPermissionStatusMeta(item.status).label }}
                </a-tag>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
          <a-empty v-else description="暂无权限申请记录" :image-style="{ height: '48px' }" />
        </div>
      </div>
    </div>
  </div>

  <a-modal
    v-model:open="applicationVisible"
    title="提交权限申请"
    ok-text="提交申请"
    cancel-text="取消"
    :confirm-loading="submittingApplication"
    :destroy-on-close="true"
    @ok="submitPermissionApplication"
  >
    <a-form ref="applicationFormRef" :model="applicationForm" :rules="applicationRules" layout="vertical">
      <a-form-item label="申请角色" name="targetRoleId">
        <a-select
          v-model:value="applicationForm.targetRoleId"
          :loading="loadingApplicationRoles"
          :options="applicationRoleOptions"
          show-search
          option-filter-prop="label"
          placeholder="请选择要申请的角色"
        />
      </a-form-item>
      <a-form-item label="申请说明" name="reason">
        <a-textarea
          v-model:value="applicationForm.reason"
          :rows="5"
          :maxlength="500"
          show-count
          placeholder="请说明申请后台管理权限的用途，例如内容运营、评论审核或系统配置维护。"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="avatarPreviewVisible"
    title="头像预览"
    :footer="null"
    :width="720"
    centered
    :body-style="{ maxHeight: '72vh', overflow: 'auto' }"
  >
    <div class="avatar-preview-modal">
      <img v-if="userAvatar" :src="userAvatar" alt="头像预览">
      <a-empty v-else description="当前暂无头像" :image-style="{ height: '48px' }" />
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  SafetyOutlined,
  LinkOutlined,
  BellOutlined,
  KeyOutlined,
  CameraOutlined,
  DesktopOutlined,
  EyeOutlined,
  GithubOutlined,
  QqOutlined,
  WechatOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import {
  changePassword,
  createMyPermissionRequest,
  deleteAvatar,
  getLoginRecords,
  getNotificationSettings,
  getProfile,
  getUserStats,
  listMyPermissionRequestRoles,
  listMyPermissionRequests,
  updateNotificationSettings,
  updateProfile,
  uploadAvatar
} from '@/services/http'
import AvatarCropper from '@/components/AvatarCropper.vue'
import EntranceEffectSettings from './components/EntranceEffectSettings.vue'
import { DEFAULT_ENTRANCE_EFFECT, normalizeEntranceEffectConfig } from '@/utils/entranceEffects/effectCatalog'
import { cacheEntranceEffectConfig } from '@/utils/entranceEffects/entranceEffectStorage'

const authStore = useAuthStore()

const userAvatar = computed(() => authStore.user?.avatar || '')
const userInitial = computed(() => {
  const name = authStore.user?.username || authStore.user?.email || ''
  return name.charAt(0).toUpperCase()
})
const roleMeta = computed(() => {
  if (authStore.user?.isSuperAdmin || authStore.user?.role === 'super_admin') {
    return { label: '超级管理员', color: 'red' }
  }

  if (authStore.isAdmin) {
    return { label: '管理员', color: 'blue' }
  }

  return { label: '普通用户', color: 'default' }
})

const userStats = reactive({
  articles: 0,
  comments: 0,
  likes: 0
})

const tabs = [
  { key: 'basic', label: '基本资料', icon: UserOutlined },
  { key: 'security', label: '安全设置', icon: SafetyOutlined },
  { key: 'binding', label: '账号绑定', icon: LinkOutlined },
  { key: 'notification', label: '通知设置', icon: BellOutlined },
  { key: 'permission', label: '权限申请', icon: KeyOutlined }
]

const activeTab = ref('basic')

const profileForm = reactive({
  username: '',
  bio: '',
  website: '',
  location: '',
  birthday: '',
  closeBirthEffect: false,
  entranceEffect: { ...DEFAULT_ENTRANCE_EFFECT }
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const bindings = [
  { key: 'github', name: 'GitHub', desc: '用于快捷登录', icon: GithubOutlined, color: '#333', bound: false },
  { key: 'qq', name: 'QQ', desc: '用于快捷登录', icon: QqOutlined, color: '#12B7F5', bound: false },
  { key: 'wechat', name: '微信', desc: '用于快捷登录', icon: WechatOutlined, color: '#07C160', bound: false }
]

const notificationSettings = reactive({
  email: true,
  site: true,
  comment: true,
  like: false
})

const saving = ref(false)
const changingPassword = ref(false)
const savingNotifications = ref(false)
const loadingLoginRecords = ref(false)
const loadingPermissionRequests = ref(false)
const loadingApplicationRoles = ref(false)
const loginRecords = ref([])
const permissionRequests = ref([])
const applicationRoles = ref([])
const avatarInputRef = ref(null)
const passwordFormRef = ref(null)
const applicationFormRef = ref(null)
const applicationVisible = ref(false)
const submittingApplication = ref(false)

// 裁剪相关状态
const cropperVisible = ref(false)
const cropperSrc = ref('')
const uploadingAvatar = ref(false)
const deletingAvatar = ref(false)
const avatarPreviewVisible = ref(false)
const avatarCropperRef = ref(null)
const applicationForm = reactive({ targetRoleId: undefined, reason: '' })
const applicationRules = {
  targetRoleId: [
    { required: true, message: '请选择申请角色' }
  ],
  reason: [
    { required: true, message: '请填写申请说明' },
    { max: 500, message: '申请说明不能超过 500 个字符' }
  ]
}
const hasPendingPermissionRequest = computed(() => permissionRequests.value.some((item) => item.status === 'pending'))
const applicationRoleOptions = computed(() => applicationRoles.value.map((role) => ({
  label: role.remarkName ? `${role.name}（${role.remarkName}）` : role.name,
  value: role.id
})))

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 8, message: '新密码至少需要 8 个字符' },
    { max: 72, message: '新密码不能超过 72 个字符' },
    {
      validator: async (_rule, value) => {
        if (value && value === passwordForm.oldPassword) {
          throw new Error('新密码不能与原密码相同')
        }
      }
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: async (_rule, value) => {
        if (value && value !== passwordForm.newPassword) {
          throw new Error('两次输入的新密码不一致')
        }
      }
    }
  ]
}

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

function openAvatarPreview() {
  if (!userAvatar.value) return
  avatarPreviewVisible.value = true
}

function syncProfileForm(user = {}) {
  profileForm.username = user.username || ''
  profileForm.bio = user.bio || ''
  profileForm.website = user.website || ''
  profileForm.location = user.location || ''
  profileForm.birthday = user.birthday || ''
  profileForm.closeBirthEffect = Boolean(user.closeBirthEffect)
  profileForm.entranceEffect = normalizeEntranceEffectConfig(user.entranceEffect)
}

function syncNotificationSettings(settings = {}) {
  notificationSettings.email = settings.email ?? true
  notificationSettings.site = settings.site ?? true
  notificationSettings.comment = settings.comment ?? true
  notificationSettings.like = settings.like ?? false
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

function getPermissionStatusMeta(status) {
  if (status === 'approved') return { label: '已通过', color: 'green' }
  if (status === 'rejected') return { label: '已驳回', color: 'red' }
  return { label: '待审批', color: 'gold' }
}

/** 选择文件后，打开裁剪弹窗 */
function handleAvatarFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return

  // 校验文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    message.error('仅支持 JPG/PNG/GIF/WebP 格式')
    e.target.value = ''
    return
  }

  // 校验文件大小
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过 5MB')
    e.target.value = ''
    return
  }

  // 读取为 base64，打开裁剪弹窗
  const reader = new FileReader()
  reader.onload = (ev) => {
    cropperSrc.value = ev.target.result
    cropperVisible.value = true
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

/** 裁剪确认 → 上传 */
async function handleCropConfirm() {
  if (!avatarCropperRef.value) return

  uploadingAvatar.value = true
  try {
    const croppedFile = await avatarCropperRef.value.getCropFile('avatar.jpg', 'image/jpeg')
    const result = await uploadAvatar(croppedFile)
    authStore.user = { ...authStore.user, ...result }
    message.success('头像上传成功')
    cropperVisible.value = false
    cropperSrc.value = ''
  } catch (error) {
    message.error(error.message || '头像上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

/** 取消裁剪 */
function handleCropCancel() {
  cropperSrc.value = ''
}

async function handleSaveProfile() {
  saving.value = true
  try {
    const result = await updateProfile({
      username: profileForm.username,
      bio: profileForm.bio,
      website: profileForm.website,
      location: profileForm.location,
      birthday: profileForm.birthday,
      closeBirthEffect: profileForm.closeBirthEffect,
      entranceEffect: normalizeEntranceEffectConfig(profileForm.entranceEffect)
    })
    authStore.user = { ...authStore.user, ...result }
    cacheEntranceEffectConfig(result.entranceEffect)
    syncProfileForm(result)
    message.success('个人资料更新成功')
  } catch (error) {
    message.error(error.message || '更新失败')
  } finally {
    saving.value = false
  }
}

async function handleDeleteAvatar() {
  deletingAvatar.value = true
  try {
    const result = await deleteAvatar()
    authStore.user = { ...authStore.user, ...result }
    message.success('头像已删除')
  } catch (error) {
    message.error(error.message || '头像删除失败')
  } finally {
    deletingAvatar.value = false
  }
}

async function handleSaveNotifications() {
  savingNotifications.value = true
  try {
    const result = await updateNotificationSettings({ ...notificationSettings })
    syncNotificationSettings(result)
    authStore.user = {
      ...authStore.user,
      notificationSettings: { ...result }
    }
    message.success('通知设置已保存')
  } catch (error) {
    message.error(error.message || '通知设置保存失败')
  } finally {
    savingNotifications.value = false
  }
}

async function handleChangePassword() {
  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  changingPassword.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    message.error(error.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

async function loadPermissionRequests() {
  loadingPermissionRequests.value = true
  try {
    const result = await listMyPermissionRequests({ pageSize: 20 })
    permissionRequests.value = result.items || []
  } catch (error) {
    permissionRequests.value = []
    console.error('获取权限申请记录失败:', error)
  } finally {
    loadingPermissionRequests.value = false
  }
}

async function loadApplicationRoles() {
  loadingApplicationRoles.value = true
  try {
    applicationRoles.value = await listMyPermissionRequestRoles()
    if (!applicationForm.targetRoleId && applicationRoles.value.length === 1) {
      applicationForm.targetRoleId = applicationRoles.value[0].id
    }
  } catch (error) {
    applicationRoles.value = []
    message.error(error.message || '可申请角色加载失败')
  } finally {
    loadingApplicationRoles.value = false
  }
}

async function openPermissionApplication() {
  applicationVisible.value = true
  if (!applicationRoles.value.length) {
    await loadApplicationRoles()
  }
}

async function submitPermissionApplication() {
  try {
    await applicationFormRef.value?.validate()
  } catch {
    return
  }

  submittingApplication.value = true
  try {
    await createMyPermissionRequest({
      targetRoleId: applicationForm.targetRoleId,
      reason: applicationForm.reason
    })
    message.success('权限申请已提交')
    applicationVisible.value = false
    applicationForm.targetRoleId = undefined
    applicationForm.reason = ''
    await loadPermissionRequests()
  } catch (error) {
    message.error(error.message || '权限申请提交失败')
  } finally {
    submittingApplication.value = false
  }
}

onMounted(async () => {
  loadingLoginRecords.value = true
  const [profileResult, notificationResult, recordResult] = await Promise.allSettled([
    getProfile(),
    getNotificationSettings(),
    getLoginRecords()
  ])

  if (profileResult.status === 'fulfilled') {
    const profile = profileResult.value || {}
    authStore.user = { ...authStore.user, ...profile }
    syncProfileForm(profile)
    if (notificationResult.status !== 'fulfilled') {
      syncNotificationSettings(profile.notificationSettings)
    }
  } else {
    syncProfileForm(authStore.user || {})
    console.error('获取个人资料失败:', profileResult.reason)
  }

  if (notificationResult.status === 'fulfilled') {
    syncNotificationSettings(notificationResult.value)
  } else {
    syncNotificationSettings(authStore.user?.notificationSettings)
    console.error('获取通知设置失败:', notificationResult.reason)
  }

  if (recordResult.status === 'fulfilled') {
    loginRecords.value = recordResult.value.items || []
  } else {
    loginRecords.value = []
    console.error('获取登录记录失败:', recordResult.reason)
  }
  loadingLoginRecords.value = false

  // 获取用户统计数据
  try {
    const stats = await getUserStats()
    userStats.articles = stats.articles || 0
    userStats.comments = stats.comments || 0
    userStats.likes = stats.likes || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }

  await loadPermissionRequests()
})
</script>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  height: calc(100vh - 120px);
  overflow: hidden;
  min-height: 0;
}

/* ========== 左侧卡片 ========== */
.profile-sidebar {
  height: 100%;
  min-height: 0;
}

.sidebar-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.avatar-section {
  padding: 32px 24px 24px;
  text-align: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  margin-bottom: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #1677ff, #4096ff);
  font-size: 32px;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: #fff;
  font-size: 20px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.user-email {
  color: #8c8c8c;
  font-size: 13px;
  margin: 0 0 8px;
}

.role-tag {
  font-size: 12px;
}

/* 统计区域 */
.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* Tab 列表 */
.tab-list {
  padding: 8px;
  flex: 1;
  overflow-y: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.tab-item:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-item.active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

.tab-arrow {
  margin-left: auto;
  font-size: 12px;
  color: #d9d9d9;
}

.tab-item.active .tab-arrow {
  color: #1677ff;
}

/* ========== 右侧卡片 ========== */
.profile-main {
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.main-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px 32px;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-avatar-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.profile-avatar-preview-action {
  flex-shrink: 0;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.profile-avatar-preview {
  flex-shrink: 0;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  font-size: 28px;
  font-weight: 600;
}

.avatar-preview-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.avatar-preview-modal img {
  display: block;
  max-width: 100%;
  max-height: 68vh;
  border-radius: 8px;
  object-fit: contain;
}

.profile-avatar-panel__body {
  display: grid;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.profile-avatar-panel__body strong {
  color: #262626;
  font-size: 14px;
}

.profile-avatar-panel__body span {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.6;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-loading {
  padding: 16px;
  color: #8c8c8c;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.record-icon {
  font-size: 18px;
  color: #8c8c8c;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-title {
  font-weight: 500;
  font-size: 14px;
}

.record-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.feature-hint {
  text-align: center;
  color: #bfbfbf;
  font-size: 13px;
  margin: 16px 0 0;
  font-style: italic;
}

/* 绑定列表 */
.binding-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.binding-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.binding-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.binding-icon {
  font-size: 24px;
}

.binding-name {
  font-weight: 500;
  display: block;
  font-size: 14px;
}

.binding-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 设置列表 */
.setting-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-title {
  font-weight: 500;
  font-size: 14px;
}

.setting-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.notification-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.permission-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.permission-header .content-title {
  margin-bottom: 8px;
}

.permission-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 13px;
}

.role-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.role-summary > span {
  color: #595959;
  font-weight: 600;
}

.permission-request-list {
  display: grid;
  gap: 12px;
}

.permission-request-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.permission-request-item strong {
  display: block;
  font-size: 14px;
}

.permission-request-item p {
  margin: 6px 0 0;
  color: #595959;
  line-height: 1.7;
}

.permission-request-item small {
  display: block;
  margin-top: 6px;
  color: #cf1322;
}

.permission-request-meta {
  flex: 0 0 auto;
  display: grid;
  justify-items: end;
  gap: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

/* ========== 头像裁剪弹窗 ========== */
.avatar-cropper-modal__body {
  margin-top: 8px;
}

.avatar-cropper-modal__tip {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f6f8fa;
  border-radius: 6px;
}

.avatar-cropper-modal__tip p {
  margin: 0;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.6;
}

:deep(.dark-theme) .sidebar-card,
:deep(.dark-theme) .main-card {
  color: var(--console-text);
  border-color: var(--console-border);
  background: var(--console-surface);
}

:deep(.dark-theme) .avatar-section {
  background: linear-gradient(135deg, rgba(138, 180, 255, 0.14), rgba(21, 31, 46, 0.96));
}

:deep(.dark-theme) .stats-section,
:deep(.dark-theme) .content-title,
:deep(.dark-theme) .profile-avatar-panel,
:deep(.dark-theme) .role-summary,
:deep(.dark-theme) .permission-request-item {
  border-color: var(--console-border);
}

:deep(.dark-theme) .tab-item,
:deep(.dark-theme) .user-email,
:deep(.dark-theme) .stat-label,
:deep(.dark-theme) .record-desc,
:deep(.dark-theme) .binding-desc,
:deep(.dark-theme) .setting-desc,
:deep(.dark-theme) .permission-header p,
:deep(.dark-theme) .permission-request-meta,
:deep(.dark-theme) .avatar-cropper-modal__tip p {
  color: var(--console-text-secondary);
}

:deep(.dark-theme) .user-name,
:deep(.dark-theme) .stat-num,
:deep(.dark-theme) .content-title,
:deep(.dark-theme) .profile-avatar-panel__body strong,
:deep(.dark-theme) .record-title,
:deep(.dark-theme) .binding-name,
:deep(.dark-theme) .setting-title,
:deep(.dark-theme) .permission-request-item strong {
  color: var(--console-text);
}

:deep(.dark-theme) .tab-item:hover,
:deep(.dark-theme) .record-loading,
:deep(.dark-theme) .record-item,
:deep(.dark-theme) .binding-item,
:deep(.dark-theme) .setting-item,
:deep(.dark-theme) .profile-avatar-panel,
:deep(.dark-theme) .role-summary,
:deep(.dark-theme) .permission-request-item,
:deep(.dark-theme) .avatar-cropper-modal__tip {
  background: var(--console-surface-muted);
}

:deep(.dark-theme) .tab-item.active {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

:deep(.dark-theme) .tab-arrow {
  color: var(--console-text-secondary);
}

:deep(.dark-theme) .permission-request-item p,
:deep(.dark-theme) .role-summary > span {
  color: var(--console-menu-text);
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-page {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .profile-sidebar {
    height: auto;
  }

  .sidebar-card {
    height: auto;
  }

  .tab-list {
    max-height: 200px;
  }

  .profile-main {
    height: auto;
  }

  .main-card {
    height: auto;
    min-height: 400px;
    padding: 20px 16px;
  }

  .profile-avatar-panel {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
