<template>
  <div class="auth-settings" :class="theme">
    <!-- 主题切换 -->
    <button class="setting-btn" @click="toggleTheme" :title="isDark ? '切换亮色主题' : '切换暗色主题'">
      <BulbOutlined />
    </button>

    <!-- 语言切换 - 纯文字 -->
    <button class="setting-btn lang-btn" @click="toggleLang" :title="lang === 'zh' ? 'Switch to English' : '切换中文'">
      {{ lang === 'zh' ? 'EN' : '中' }}
    </button>

    <!-- 布局切换 - 使用下拉菜单 -->
    <div class="layout-dropdown" ref="dropdownRef">
      <button class="setting-btn" @click="showLayoutMenu = !showLayoutMenu" title="布局设置">
        <LayoutOutlined />
      </button>
      <div v-if="showLayoutMenu" class="layout-menu">
        <div
          class="layout-menu-item"
          :class="{ active: layout === 'left' }"
          @click="setLayout('left')"
        >
          <AlignLeftOutlined />
          <span>{{ lang === 'zh' ? '居左' : 'Left' }}</span>
        </div>
        <div
          class="layout-menu-item"
          :class="{ active: layout === 'center' }"
          @click="setLayout('center')"
        >
          <ColumnWidthOutlined />
          <span>{{ lang === 'zh' ? '居中' : 'Center' }}</span>
        </div>
        <div
          class="layout-menu-item"
          :class="{ active: layout === 'right' }"
          @click="setLayout('right')"
        >
          <AlignRightOutlined />
          <span>{{ lang === 'zh' ? '居右' : 'Right' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BulbOutlined,
  LayoutOutlined,
  ColumnWidthOutlined,
  AlignLeftOutlined,
  AlignRightOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  theme: { type: String, default: 'dark' },
  lang: { type: String, default: 'zh' },
  layout: { type: String, default: 'right' }
})

const emit = defineEmits(['update:theme', 'update:lang', 'update:layout'])

const isDark = computed(() => props.theme === 'dark')
const showLayoutMenu = ref(false)
const dropdownRef = ref(null)

function toggleTheme() {
  emit('update:theme', props.theme === 'dark' ? 'light' : 'dark')
}

function toggleLang() {
  emit('update:lang', props.lang === 'zh' ? 'en' : 'zh')
}

function setLayout(value) {
  emit('update:layout', value)
  showLayoutMenu.value = false
}

// 点击外部关闭下拉菜单
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showLayoutMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.auth-settings {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

/* 暗黑模式按钮 - 更亮更清晰 */
.auth-settings.dark .setting-btn {
  background: #21262d;
  color: #e6edf3;
  border: 1px solid #30363d;
}

.auth-settings.dark .setting-btn:hover {
  background: #30363d;
  color: #ffffff;
  border-color: #8b949e;
}

/* 亮色模式按钮 */
.auth-settings.light .setting-btn {
  background: rgba(0, 0, 0, 0.06);
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.auth-settings.light .setting-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.setting-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  padding: 0;
  outline: none;
}

.lang-btn {
  font-size: 13px;
  font-weight: 600;
}

/* 布局下拉菜单 */
.layout-dropdown {
  position: relative;
}

.layout-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  border-radius: 8px;
  padding: 4px;
  min-width: 120px;
  z-index: 1000;
}

/* 暗黑模式弹窗 - 更亮的背景确保可见 */
.auth-settings.dark .layout-menu {
  background: #2a3a4e;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.auth-settings.dark .layout-menu-item {
  color: #ffffff;
}

.auth-settings.dark .layout-menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.auth-settings.dark .layout-menu-item.active {
  background: rgba(22, 119, 255, 0.3);
  color: #69b1ff;
}

/* 亮色模式弹窗 */
.auth-settings.light .layout-menu {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.auth-settings.light .layout-menu-item {
  color: #666;
}

.auth-settings.light .layout-menu-item:hover {
  background: #f5f5f5;
  color: #333;
}

.auth-settings.light .layout-menu-item.active {
  background: #e6f4ff;
  color: #1677ff;
}

.layout-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
</style>
