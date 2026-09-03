<template>
  <div class="auth-settings" :class="[theme, { 'auth-settings--embedded': embedded }]">
    <!-- 主题切换 -->
    <button
      class="setting-btn"
      type="button"
      :aria-label="isDark ? '切换亮色主题' : '切换暗色主题'"
      :title="isDark ? '切换亮色主题' : '切换暗色主题'"
      @click="toggleTheme"
    >
      <Sun v-if="isDark" :size="17" />
      <Moon v-else :size="17" />
    </button>

    <!-- 语言切换 - 纯文字 -->
    <button
      class="setting-btn lang-btn"
      type="button"
      :aria-label="lang === 'zh' ? 'Switch to English' : '切换中文'"
      :title="lang === 'zh' ? 'Switch to English' : '切换中文'"
      @click="toggleLang"
    >
      {{ lang === 'zh' ? 'EN' : '中' }}
    </button>

    <!-- 布局切换 - 使用下拉菜单 -->
    <div class="layout-dropdown" ref="dropdownRef">
      <button
        class="setting-btn"
        type="button"
        aria-label="布局设置"
        title="布局设置"
        :aria-expanded="showLayoutMenu"
        @click="showLayoutMenu = !showLayoutMenu"
      >
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
  LayoutOutlined,
  ColumnWidthOutlined,
  AlignLeftOutlined,
  AlignRightOutlined
} from '@ant-design/icons-vue'
import { Moon, Sun } from 'lucide-vue-next'

const props = defineProps({
  theme: { type: String, default: 'dark' },
  lang: { type: String, default: 'zh' },
  layout: { type: String, default: 'right' },
  embedded: { type: Boolean, default: false }
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
  top: 28px;
  right: 28px;
  display: flex;
  gap: 2px;
  z-index: 100;
}

.auth-settings--embedded {
  position: static;
  flex: 0 0 auto;
}

.auth-settings.dark .setting-btn {
  color: #98a2b3;
  background: transparent;
}

.auth-settings.dark .setting-btn:hover {
  color: #8ab4ff;
  background: rgba(138, 180, 255, 0.12);
}

.auth-settings.light .setting-btn {
  color: #606266;
  background: transparent;
}

.auth-settings.light .setting-btn:hover {
  color: #337ecc;
  background: #ecf5ff;
}

.setting-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.16s ease, background 0.16s ease;
  padding: 0;
  outline: none;
}

.setting-btn:focus-visible {
  color: #337ecc;
  background: #ecf5ff;
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.32);
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

@media (max-width: 767px) {
  .auth-settings:not(.auth-settings--embedded) {
    top: 48px;
    right: 28px;
  }

  .setting-btn,
  .layout-menu-item {
    min-width: 36px;
    min-height: 36px;
  }

  .setting-btn {
    width: 36px;
    height: 36px;
  }

  .layout-menu-item {
    padding: 10px 12px;
  }
}
</style>
