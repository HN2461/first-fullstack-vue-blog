<template>
  <a-config-provider :locale="zhCN" :theme="antThemeConfig">
    <router-view />
    <DiscussionRealtimeBridge />
    <EntranceEffectHost />
    <PublicFestivalHost />
  </a-config-provider>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'
import EntranceEffectHost from '@/components/entrance/EntranceEffectHost.vue'
import DiscussionRealtimeBridge from '@/components/notification/DiscussionRealtimeBridge.vue'
import PublicFestivalHost from '@/components/festival/PublicFestivalHost.vue'
import '@/styles/festival.css'

const appStore = useAppStore()
const authStore = useAuthStore()
const siteStore = useSiteStore()
const antThemeConfig = computed(() => {
  const isDark = appStore.isDark
  const primary = isDark ? '#8ab4ff' : '#409eff'
  const text = isDark ? '#f2f4f7' : '#303133'
  const textSecondary = isDark ? '#98a2b3' : '#606266'
  const border = isDark ? '#273244' : '#dcdfe6'
  const surface = isDark ? '#151f2e' : '#ffffff'
  const surfaceMuted = isDark ? '#1d2939' : '#f5f7fa'

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: primary,
      colorSuccess: isDark ? '#4fc782' : '#67c23a',
      colorWarning: isDark ? '#ffb65d' : '#e6a23c',
      colorError: isDark ? '#ff7875' : '#f56c6c',
      colorLink: primary,
      colorBgLayout: isDark ? '#0f1623' : '#f5f7fa',
      colorBgContainer: surface,
      colorBgElevated: isDark ? '#1a2637' : '#ffffff',
      colorText: text,
      colorTextSecondary: textSecondary,
      colorTextTertiary: isDark ? '#7d899a' : '#909399',
      colorBorder: border,
      colorBorderSecondary: isDark ? '#222d3d' : '#ebeef5',
      colorFillSecondary: surfaceMuted,
      colorFillTertiary: isDark ? '#182334' : '#f0f2f5',
      colorFillQuaternary: isDark ? '#151f2e' : '#fafafa',
      controlOutline: isDark ? 'rgba(138, 180, 255, 0.22)' : 'rgba(64, 158, 255, 0.16)',
      borderRadius: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      fontFamily: "'Knowledge Sans SC', 'Microsoft YaHei UI', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif",
      fontSize: 14,
      fontWeightStrong: 600,
      lineWidth: 1
    },
    components: {
      Button: {
        borderRadius: 8,
        colorPrimaryHover: isDark ? '#9bc0ff' : '#66b1ff',
        colorPrimaryActive: isDark ? '#70a0f2' : '#337ecc',
        defaultBorderColor: border
      },
      Card: {
        borderRadiusLG: 8,
        colorBorderSecondary: border
      },
      Input: {
        colorBgContainer: isDark ? '#111927' : '#ffffff',
        colorBorder: isDark ? '#344054' : '#dcdfe6',
        hoverBorderColor: isDark ? '#8ab4ff' : '#c0c4cc',
        activeBorderColor: primary,
        activeShadow: isDark ? '0 0 0 2px rgba(138, 180, 255, 0.16)' : '0 0 0 2px rgba(64, 158, 255, 0.14)'
      },
      Menu: {
        colorItemText: isDark ? '#cbd5e1' : '#606266',
        colorItemTextHover: text,
        colorItemTextHoverHorizontal: text,
        colorItemTextSelected: text,
        colorItemTextSelectedHorizontal: text,
        colorItemBg: 'transparent',
        colorItemBgHover: isDark ? '#1d2939' : '#f5f7fa',
        colorSubItemBg: isDark ? '#151f2e' : '#ffffff',
        colorItemBgSelected: isDark ? 'rgba(138, 180, 255, 0.16)' : '#ecf5ff',
        colorItemBgSelectedHorizontal: 'transparent',
        colorActiveBarHeight: 2,
        itemMarginInline: 0,
        radiusItem: 6,
        radiusSubMenuItem: 6
      },
      Modal: {
        borderRadiusLG: 8,
        colorBgElevated: isDark ? '#1a2637' : '#ffffff'
      },
      Select: {
        colorBgElevated: isDark ? '#1a2637' : '#ffffff',
        controlItemBgHover: surfaceMuted,
        controlItemBgActive: isDark ? '#223047' : '#ecf5ff'
      },
      Table: {
        colorBgContainer: surface,
        colorFillAlter: surfaceMuted,
        colorTextHeading: isDark ? '#cbd5e1' : '#606266',
        colorBorderSecondary: border,
        headerBg: isDark ? '#1d2939' : '#f5f7fa',
        rowHoverBg: isDark ? '#223047' : '#f5f7fa',
        colorFillContent: isDark ? '#223047' : '#f5f7fa',
        controlItemBgActive: isDark ? '#223047' : '#ecf5ff',
        fontSize: 14
      },
      Tabs: {
        colorPrimary: primary,
        colorText: text,
        colorTextSecondary: textSecondary
      }
    }
  }
})

onMounted(() => {
  appStore.applyTheme()
  appStore.initResponsive()
})

watch(
  () => siteStore.profile.defaultTheme,
  (value) => appStore.setSiteDefaultTheme(value)
)

watch(
  () => authStore.user?.themePreference,
  () => appStore.syncUserThemePreference(authStore.user)
)
</script>
