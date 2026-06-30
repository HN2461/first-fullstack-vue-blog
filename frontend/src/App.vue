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
const antThemeConfig = computed(() => ({
  algorithm: appStore.isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorPrimary: appStore.isDark ? '#8ab4ff' : '#1668dc',
    colorBgLayout: appStore.isDark ? '#0f1623' : '#f4f6f9',
    colorBgContainer: appStore.isDark ? '#151f2e' : '#ffffff',
    colorBgElevated: appStore.isDark ? '#1a2637' : '#ffffff',
    colorText: appStore.isDark ? '#f2f4f7' : '#101828',
    colorTextSecondary: appStore.isDark ? '#98a2b3' : '#667085',
    colorBorder: appStore.isDark ? '#273244' : '#e5e7eb',
    borderRadius: 8,
    fontFamily: "'Aptos', 'Segoe UI Variable Text', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
  },
  components: {
    Table: {
      headerBg: appStore.isDark ? '#1d2939' : '#f8fafc',
      headerColor: appStore.isDark ? '#cbd5e1' : '#344054',
      rowHoverBg: appStore.isDark ? '#223047' : '#f2f6fc',
      borderColor: appStore.isDark ? '#273244' : '#e5e7eb'
    },
    Input: {
      activeBg: appStore.isDark ? '#111927' : '#ffffff'
    },
    Select: {
      optionSelectedBg: appStore.isDark ? '#223047' : '#eaf2ff',
      optionActiveBg: appStore.isDark ? '#1d2939' : '#f2f6fc'
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent'
    }
  }
}))

onMounted(() => {
  appStore.applyTheme()
  appStore.initResponsive()
})
</script>
