<template>
  <div class="profile-page">
    <!-- 左侧卡片：个人信息 + Tab -->
    <div class="profile-sidebar">
      <div class="sidebar-card">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerAvatarUpload">
            <a-avatar :size="80" :src="userAvatar" class="user-avatar">
              {{ userInitial }}
            </a-avatar>
            <div class="avatar-overlay">
              <CameraOutlined />
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style="display: none"
              @change="handleAvatarFileSelect"
            />
          </div>
          <h3 class="user-name">{{ authStore.user?.username || '未设置昵称' }}</h3>
          <p class="user-email">{{ authStore.user?.email || '未绑定邮箱' }}</p>
          <a-tag :color="isAdmin ? 'blue' : 'default'" class="role-tag">
            {{ isAdmin ? '管理员' : '普通用户' }}
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
            :model="passwordForm"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  SafetyOutlined,
  LinkOutlined,
  BellOutlined,
  CameraOutlined,
  DesktopOutlined,
  GithubOutlined,
  QqOutlined,
  WechatOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import {
  changePassword,
  getLoginRecords,
  getNotificationSettings,
  getProfile,
  getUserStats,
  updateNotificationSettings,
  updateProfile,
  uploadAvatar
} from '@/services/http'
import AvatarCropper from '@/components/AvatarCropper.vue'

const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === 'admin')
const userAvatar = computed(() => authStore.user?.avatar || '')
const userInitial = computed(() => {
  const name = authStore.user?.username || authStore.user?.email || ''
  return name.charAt(0).toUpperCase()
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
  { key: 'notification', label: '通知设置', icon: BellOutlined }
]

const activeTab = ref('basic')

const profileForm = reactive({
  username: '',
  bio: '',
  website: '',
  location: ''
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
const loginRecords = ref([])
const avatarInputRef = ref(null)

// 裁剪相关状态
const cropperVisible = ref(false)
const cropperSrc = ref('')
const uploadingAvatar = ref(false)
const avatarCropperRef = ref(null)

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

function syncProfileForm(user = {}) {
  profileForm.username = user.username || ''
  profileForm.bio = user.bio || ''
  profileForm.website = user.website || ''
  profileForm.location = user.location || ''
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
      location: profileForm.location
    })
    authStore.user = { ...authStore.user, ...result }
    syncProfileForm(result)
    message.success('个人资料更新成功')
  } catch (error) {
    message.error(error.message || '更新失败')
  } finally {
    saving.value = false
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
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  if (passwordForm.newPassword.length < 8) {
    message.error('新密码至少需要 8 个字符')
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
})
</script>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  height: calc(100vh - 120px);
  overflow: hidden;
}

/* ========== 左侧卡片 ========== */
.profile-sidebar {
  height: 100%;
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
}

.main-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px 32px;
  height: 100%;
  overflow-y: auto;
}

.content-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
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
}
</style>
