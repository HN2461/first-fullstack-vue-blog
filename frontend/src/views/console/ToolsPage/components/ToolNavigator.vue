<template>
  <nav class="tool-navigator" aria-label="选择工具">
    <div class="tool-navigator__filters">
      <a-input ref="searchInput" :value="query" size="default" allow-clear autofocus aria-label="搜索工具" placeholder="搜索工具名称、缩写或用途" @update:value="emit('update:query', $event)" @press-enter="openFirst">
        <template #prefix><Search :size="15" /></template>
      </a-input>
    </div>
    <div class="tool-navigator__controls">
      <div class="tool-navigator__views" role="group" aria-label="工具范围">
        <button v-for="item in views" :key="item.key" type="button" :class="{ active: view === item.key }" :aria-pressed="view === item.key" @click="emit('update:view', item.key)">{{ item.label }}</button>
      </div>
      <a-select class="tool-navigator__category" :value="category" :options="categoryOptions" show-search option-filter-prop="label" aria-label="筛选分类" @update:value="emit('update:category', $event)" />
    </div>
    <div class="tool-navigator__list">
      <ul v-if="tools.length" class="tool-navigator__results">
        <li v-for="tool in tools" :key="tool.key" :class="['tool-navigator__item', { active: activeKey === tool.key }]">
          <button type="button" class="tool-navigator__open" :aria-current="activeKey === tool.key ? 'page' : undefined" @click="emit('open', tool)">
            <component :is="tool.icon" :size="17" aria-hidden="true" />
            <span class="tool-navigator__body"><strong>{{ tool.name }}</strong><small :title="tool.description">{{ tool.description }}</small></span>
          </button>
          <a-tooltip :title="favoriteKeys.includes(tool.key) ? '取消收藏' : '收藏工具'">
            <button type="button" :class="['tool-navigator__favorite', { saved: favoriteKeys.includes(tool.key) }]" :aria-pressed="favoriteKeys.includes(tool.key)" :aria-label="`${favoriteKeys.includes(tool.key) ? '取消收藏' : '收藏'}${tool.name}`" @click="emit('favorite', tool.key)"><Star :size="15" :fill="favoriteKeys.includes(tool.key) ? 'currentColor' : 'none'" /></button>
          </a-tooltip>
        </li>
      </ul>
      <div v-if="!tools.length" class="tool-navigator__empty" role="status">
        <Search :size="22" aria-hidden="true" /><span>{{ emptyMessage }}</span>
        <a-button v-if="query || category !== 'all'" type="link" size="small" @click="emit('reset')">清除筛选</a-button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { Search, Star } from '@lucide/vue'
import { TOOL_CATEGORIES } from '../toolCatalog'

const props = defineProps({
  tools: { type: Array, default: () => [] },
  query: { type: String, default: '' },
  category: { type: String, default: 'all' },
  view: { type: String, default: 'all' },
  activeKey: { type: String, default: '' },
  favoriteKeys: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:query', 'update:category', 'update:view', 'open', 'favorite', 'overview', 'reset'])
const searchInput = ref(null)
const views = [{ key: 'all', label: '全部' }, { key: 'favorites', label: '收藏' }, { key: 'recent', label: '最近' }]
const categoryOptions = TOOL_CATEGORIES.map(({ key, label }) => ({ value: key, label }))
const emptyMessage = computed(() => props.query || props.category !== 'all' ? '没有匹配的工具' : props.view === 'favorites' ? '点击工具旁的星标收藏' : '打开工具后可在这里找回')

onMounted(() => {
  // 选择器按需挂载，打开后直接接收搜索输入，不要求用户再次点击。
  nextTick(() => searchInput.value?.focus())
})

function openFirst(event) {
  // 中文输入法确认候选词时不能同时打开工具，避免打断搜索输入。
  if (event.isComposing || event.keyCode === 229) return
  if (props.tools[0]) emit('open', props.tools[0])
}
</script>

<style scoped>
.tool-navigator { display: flex; flex-direction: column; container-type: inline-size; width: 100%; height: 100%; min-height: 0; color: var(--console-text); }
.tool-navigator__filters { flex: 0 0 auto; padding-bottom: 8px; }
.tool-navigator__filters :deep(.ant-input-affix-wrapper) { width: 100%; }
.tool-navigator__filters :deep(.ant-input-prefix) { margin-right: 7px; color: var(--console-text-secondary); }
.tool-navigator__controls { display: flex; align-items: center; justify-content: space-between; flex: 0 0 auto; gap: 12px; border-bottom: 1px solid var(--console-border); }
.tool-navigator__views { display: flex; flex: 0 0 auto; gap: 22px; }
.tool-navigator__views button { position: relative; min-height: 45px; padding: 0 2px; border: 0; color: var(--console-text-secondary); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.tool-navigator__category { flex: 0 0 160px; width: 160px; min-width: 0; }
.tool-navigator__views button.active { color: var(--console-primary); font-weight: 600; }
.tool-navigator__views button.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--console-primary); content: ''; }
.tool-navigator__list { flex: 1; min-height: 0; padding-top: 8px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.tool-navigator__results { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 2px 12px; margin: 0; padding: 0; list-style: none; }
.tool-navigator__item { display: flex; align-items: center; min-width: 0; padding-right: 4px; border-radius: 5px; }
.tool-navigator__item:hover { background: var(--console-surface-hover); }
.tool-navigator__item.active { color: var(--console-primary); background: var(--console-primary-soft); }
.tool-navigator__open { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; min-height: 66px; padding: 10px 8px; border: 0; border-radius: 5px; color: inherit; background: transparent; font: inherit; text-align: left; cursor: pointer; }
.tool-navigator__open svg { flex: 0 0 auto; }
.tool-navigator__body { display: grid; gap: 4px; min-width: 0; }
.tool-navigator__body strong { overflow: hidden; font-size: 13px; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.tool-navigator__body small { overflow: hidden; color: var(--console-text-secondary); font-size: 12px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.tool-navigator__favorite { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 30px; height: 32px; padding: 0; border: 0; border-radius: 4px; color: var(--console-text-secondary); background: transparent; cursor: pointer; }
.tool-navigator__favorite:hover { color: var(--console-primary); background: var(--console-primary-soft); }
.tool-navigator__favorite.saved { color: var(--console-primary); }
.tool-navigator button:focus-visible { outline: 2px solid var(--console-primary); outline-offset: -2px; }
.tool-navigator__empty { display: grid; justify-items: center; gap: 10px; padding: 40px 8px; color: var(--console-text-secondary); font-size: 13px; text-align: center; }
@container (min-width: 520px) { .tool-navigator__results { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 380px) {
  .tool-navigator__views { gap: 12px; }
  .tool-navigator__category { flex-basis: 120px; width: 120px; }
}
</style>
