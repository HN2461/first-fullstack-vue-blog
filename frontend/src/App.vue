<template>
  <a-config-provider :locale="zhCN" :theme="antThemeConfig">
    <router-view />
    <DiscussionRealtimeBridge />
    <EntranceEffectHost />
    <PublicFestivalHost />
  </a-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { theme as antTheme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from '@/stores/app'
import EntranceEffectHost from '@/components/entrance/EntranceEffectHost.vue'
import DiscussionRealtimeBridge from '@/components/notification/DiscussionRealtimeBridge.vue'
import PublicFestivalHost from '@/components/festival/PublicFestivalHost.vue'
import '@/styles/festival.css'

const appStore = useAppStore()
const antThemeConfig = computed(() => {
  const isDark = appStore.isDark
  const primary = isDark ? '#8ab4ff' : '#165dff'
  const text = isDark ? '#f2f4f7' : '#1d2129'
  const textSecondary = isDark ? '#98a2b3' : '#4e5969'
  const border = isDark ? '#273244' : '#e5e6eb'
  const surface = isDark ? '#151f2e' : '#ffffff'
  const surfaceMuted = isDark ? '#1d2939' : '#f2f3f5'

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: primary,
      colorSuccess: isDark ? '#4fc782' : '#00b42a',
      colorWarning: isDark ? '#ffb65d' : '#ff7d00',
      colorError: isDark ? '#ff7875' : '#f53f3f',
      colorLink: primary,
      colorBgLayout: isDark ? '#0f1623' : '#f2f3f5',
      colorBgContainer: surface,
      colorBgElevated: isDark ? '#1a2637' : '#ffffff',
      colorText: text,
      colorTextSecondary: textSecondary,
      colorTextTertiary: isDark ? '#7d899a' : '#86909c',
      colorBorder: border,
      colorBorderSecondary: isDark ? '#222d3d' : '#f0f1f2',
      colorFillSecondary: surfaceMuted,
      colorFillTertiary: isDark ? '#182334' : '#f7f8fa',
      colorFillQuaternary: isDark ? '#151f2e' : '#fafbfc',
      controlOutline: isDark ? 'rgba(138, 180, 255, 0.22)' : 'rgba(22, 93, 255, 0.16)',
      borderRadius: isDark ? 8 : 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      fontFamily: "'Knowledge Sans SC', 'Microsoft YaHei UI', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif",
      fontSize: 14,
      fontWeightStrong: 600,
      lineWidth: 1
    },
    components: {
      Button: {
        borderRadius: isDark ? 8 : 6,
        colorPrimaryHover: isDark ? '#9bc0ff' : '#4080ff',
        colorPrimaryActive: isDark ? '#70a0f2' : '#0e42d2'
      },
      Card: {
        borderRadiusLG: isDark ? 8 : 6,
        colorBorderSecondary: border
      },
      Input: {
        colorBgContainer: isDark ? '#111927' : '#ffffff',
        colorBorder: isDark ? '#344054' : '#c9cdd4'
      },
      Menu: {
        colorItemText: isDark ? '#cbd5e1' : '#4e5969',
        colorItemTextHover: text,
        colorItemTextHoverHorizontal: text,
        colorItemTextSelected: text,
        colorItemTextSelectedHorizontal: text,
        colorItemBg: 'transparent',
        colorItemBgHover: isDark ? '#1d2939' : '#f2f3f5',
        colorSubItemBg: isDark ? '#151f2e' : '#ffffff',
        colorItemBgSelected: isDark ? 'rgba(138, 180, 255, 0.16)' : '#e8f3ff',
        colorItemBgSelectedHorizontal: 'transparent',
        colorActiveBarHeight: 2,
        itemMarginInline: 0,
        radiusItem: isDark ? 6 : 4,
        radiusSubMenuItem: isDark ? 6 : 4
      },
      Modal: {
        borderRadiusLG: 8,
        colorBgElevated: isDark ? '#1a2637' : '#ffffff'
      },
      Select: {
        colorBgElevated: isDark ? '#1a2637' : '#ffffff',
        controlItemBgHover: surfaceMuted,
        controlItemBgActive: isDark ? '#223047' : '#e8f3ff'
      },
      Table: {
        colorBgContainer: surface,
        colorFillAlter: surfaceMuted,
        colorTextHeading: isDark ? '#cbd5e1' : '#4e5969',
        colorBorderSecondary: border,
        colorFillContent: isDark ? '#223047' : '#f6f8fa',
        controlItemBgActive: isDark ? '#223047' : '#e8f3ff',
        fontSize: isDark ? 14 : 13
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
</script>
