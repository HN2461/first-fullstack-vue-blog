<template>
  <nav class="console-tabs-bar" aria-label="已打开页面">
    <div ref="scrollRef" class="console-tabs-bar__scroll" @wheel="handleWheel">
      <div class="console-tabs-bar__list" role="tablist">
        <a-dropdown v-for="tab in tabsStore.tabs" :key="tab.key" :trigger="['contextmenu']">
          <div
            class="console-tab"
            :class="{ 'is-active': activeKey === tab.key, 'is-affix': tab.affix }"
          >
            <button
              class="console-tab__main"
              type="button"
              role="tab"
              :aria-selected="activeKey === tab.key"
              :title="tab.title"
              @click="openTab(tab)"
            >
              <Pin v-if="tab.affix" class="console-tab__pin" :size="13" />
              <span class="console-tab__title">{{ tab.title }}</span>
              <span v-if="tabsStore.isDirty(tab.key)" class="console-tab__dirty" title="存在未保存修改"></span>
            </button>
            <button
              v-if="!tab.affix"
              class="console-tab__close"
              type="button"
              :aria-label="`关闭${tab.title}`"
              @click.stop="closeTab(tab)"
            >
              <X :size="14" />
            </button>
          </div>
          <template #overlay>
            <a-menu @click="handleMenuAction($event.key, tab)">
              <a-menu-item key="close" :disabled="tab.affix">
                <template #icon><X :size="15" /></template>
                关闭标签
              </a-menu-item>
              <a-menu-item key="open-window">
                <template #icon><ExternalLink :size="15" /></template>
                在新窗口打开
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="close-left" :disabled="!canCloseLeft(tab)">
                <template #icon><PanelLeftClose :size="15" /></template>
                关闭左侧标签
              </a-menu-item>
              <a-menu-item key="close-right" :disabled="!canCloseRight(tab)">
                <template #icon><PanelRightClose :size="15" /></template>
                关闭右侧标签
              </a-menu-item>
              <a-menu-item key="close-other" :disabled="!canCloseOther(tab)">
                <template #icon><CopyX :size="15" /></template>
                关闭其他标签
              </a-menu-item>
              <a-menu-item key="close-all" :disabled="!canCloseAll">
                <template #icon><PanelTopClose :size="15" /></template>
                关闭全部标签
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <div class="console-tabs-bar__actions">
      <a-dropdown :trigger="['click']">
        <a-tooltip title="更多标签操作">
          <button class="console-tabs-bar__action" type="button" aria-label="更多标签操作">
            <Ellipsis :size="17" />
          </button>
        </a-tooltip>
        <template #overlay>
          <a-menu @click="handleMenuAction($event.key, activeTab)">
            <a-menu-item key="close" :disabled="!activeTab || activeTab.affix">关闭当前标签</a-menu-item>
            <a-menu-item key="close-other" :disabled="!activeTab || !canCloseOther(activeTab)">关闭其他标签</a-menu-item>
            <a-menu-item key="close-all" :disabled="!canCloseAll">关闭全部标签</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-tooltip title="重新加载当前页面">
        <button class="console-tabs-bar__action" type="button" aria-label="重新加载当前页面" @click="refreshActiveTab">
          <RefreshCw :size="16" />
        </button>
      </a-tooltip>
      <a-tooltip title="内容最大化">
        <button class="console-tabs-bar__action" type="button" aria-label="内容最大化" @click="tabsStore.maximized = true">
          <Maximize2 :size="16" />
        </button>
      </a-tooltip>
    </div>
  </nav>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { Modal } from 'ant-design-vue'
import {
  CopyX,
  Ellipsis,
  ExternalLink,
  Maximize2,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  Pin,
  RefreshCw,
  X
} from 'lucide-vue-next'
import { useConsoleTabsStore } from '@/stores/consoleTabs'
import { buildConsoleTabKey, shouldConfirmConsoleTabClose } from '@/utils/consoleTabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useConsoleTabsStore()
const scrollRef = ref(null)

const activeKey = computed(() => buildConsoleTabKey(route))
const activeTab = computed(() => tabsStore.tabs.find((tab) => tab.key === activeKey.value) || null)
const canCloseAll = computed(() => tabsStore.tabs.some((tab) => !tab.affix))

function tabIndex(tab) {
  return tabsStore.tabs.findIndex((item) => item.key === tab?.key)
}

function canCloseLeft(tab) {
  const index = tabIndex(tab)
  return index > 0 && tabsStore.tabs.slice(0, index).some((item) => !item.affix)
}

function canCloseRight(tab) {
  const index = tabIndex(tab)
  return index >= 0 && tabsStore.tabs.slice(index + 1).some((item) => !item.affix)
}

function canCloseOther(tab) {
  return tabsStore.tabs.some((item) => item.key !== tab?.key && !item.affix)
}

function confirmDiscard(count = 1) {
  return new Promise((resolve) => {
    Modal.confirm({
      title: count > 1 ? '关闭包含未保存修改的标签？' : '关闭当前标签？',
      content: count > 1 ? `其中 ${count} 个页面存在未保存修改，关闭后修改将丢失。` : '当前页面存在未保存修改，关闭后修改将丢失。',
      okText: '仍要关闭',
      cancelText: '取消',
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  })
}

async function openTab(tab) {
  if (!tab || tab.key === activeKey.value) return
  await router.push(tab.fullPath)
}

async function closeTab(tab) {
  if (!tab || tab.affix) return
  if (shouldConfirmConsoleTabClose(tab, activeKey.value, tabsStore.isDirty(tab.key)) && !(await confirmDiscard())) return

  if (tab.key === activeKey.value) {
    const index = tabIndex(tab)
    const fallback = tabsStore.tabs[index - 1] || tabsStore.tabs[index + 1]
    if (!fallback) return
    const failure = await router.push(fallback.fullPath)
    if (isNavigationFailure(failure)) return
  }
  tabsStore.remove(tab.key)
}

async function closeTabSet(targetTabs, preferredTab = null) {
  const closableTabs = targetTabs.filter((tab) => !tab.affix)
  if (!closableTabs.length) return
  const dirtyCount = closableTabs.filter((tab) => tabsStore.isDirty(tab.key)).length
  if (dirtyCount > 0 && !(await confirmDiscard(dirtyCount))) return

  const removingActive = closableTabs.some((tab) => tab.key === activeKey.value)
  if (preferredTab && preferredTab.key !== activeKey.value) {
    const failure = await router.push(preferredTab.fullPath)
    if (isNavigationFailure(failure)) return
  } else if (removingActive) {
    const fallback = tabsStore.tabs.find((tab) => !closableTabs.some((item) => item.key === tab.key))
    if (!fallback) return
    const failure = await router.push(fallback.fullPath)
    if (isNavigationFailure(failure)) return
  }
  tabsStore.removeMany(closableTabs.map((tab) => tab.key))
}

async function handleMenuAction(action, tab) {
  if (!tab && action !== 'close-all') return
  const index = tabIndex(tab)
  if (action === 'close') await closeTab(tab)
  if (action === 'open-window') window.open(router.resolve(tab.fullPath).href, '_blank', 'noopener')
  if (action === 'close-left') await closeTabSet(tabsStore.tabs.slice(0, index))
  if (action === 'close-right') await closeTabSet(tabsStore.tabs.slice(index + 1))
  if (action === 'close-other') await closeTabSet(tabsStore.tabs.filter((item) => item.key !== tab.key), tab)
  if (action === 'close-all') await closeTabSet([...tabsStore.tabs])
}

async function refreshActiveTab() {
  if (!activeTab.value) return
  if (tabsStore.isDirty(activeTab.value.key) && !(await confirmDiscard())) return
  tabsStore.invalidate(activeTab.value.key)
}

function handleWheel(event) {
  if (!scrollRef.value || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
  scrollRef.value.scrollLeft += event.deltaY
}

async function scrollActiveIntoView() {
  await nextTick()
  scrollRef.value?.querySelector('.console-tab.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

watch(activeKey, scrollActiveIntoView, { immediate: true })
</script>

<style scoped>
.console-tabs-bar {
  height: var(--console-tabs-height, 48px);
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  overflow: hidden;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface);
}

.console-tabs-bar__scroll {
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.console-tabs-bar__scroll::-webkit-scrollbar {
  display: none;
}

.console-tabs-bar__list {
  width: max-content;
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
}

.console-tab {
  height: 100%;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  border-right: 1px solid var(--console-border);
  color: var(--console-text-secondary);
  background: transparent;
}

.console-tab:hover {
  color: var(--console-text);
  background: var(--console-surface-hover);
}

.console-tab.is-active {
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
  box-shadow: inset 0 -2px 0 var(--console-primary-strong);
}

.console-tab__main,
.console-tab__close,
.console-tabs-bar__action {
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.console-tab__main {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 12px;
}

.console-tab__title {
  max-width: 168px;
  overflow: hidden;
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-tab__pin {
  flex: 0 0 auto;
}

.console-tab__dirty {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--console-primary-strong);
}

.console-tab__close {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  border-radius: 4px;
  opacity: 0.5;
}

.console-tab:hover .console-tab__close,
.console-tab.is-active .console-tab__close,
.console-tab__close:focus-visible {
  opacity: 1;
}

.console-tab__close:hover,
.console-tabs-bar__action:hover {
  color: var(--console-primary-strong);
  background: var(--console-surface-hover);
}

.console-tabs-bar__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  border-left: 1px solid var(--console-border);
  padding: 0 6px;
  background: var(--console-surface);
}

.console-tabs-bar__action {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--console-menu-text);
}

.console-tab__main:focus-visible,
.console-tab__close:focus-visible,
.console-tabs-bar__action:focus-visible {
  outline: 2px solid var(--console-primary);
  outline-offset: -2px;
}

@media (max-width: 767px) {
  .console-tabs-bar {
    display: none;
  }
}
</style>
