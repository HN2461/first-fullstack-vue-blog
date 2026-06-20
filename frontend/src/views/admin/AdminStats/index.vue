<template>
  <MobileView v-if="appStore.isMobile" />
  <PcView v-else />
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import MobileView from './MobileView.vue'
import PcView from './PcView.vue'

const appStore = useAppStore()
</script>
