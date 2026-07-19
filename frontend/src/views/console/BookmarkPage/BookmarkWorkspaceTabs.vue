<template>
  <div class="workspace-strip">
    <div class="workspace-strip__tabs" role="tablist" aria-label="浏览器书签库">
      <div
        v-for="workspace in workspaces"
        :key="workspace.id"
        :class="['workspace-tab', { active: workspace.id === activeId }]"
      >
        <button
          type="button"
          class="workspace-tab__main"
          role="tab"
          :aria-selected="workspace.id === activeId"
          @click="$emit('select', workspace.id)"
        >
          <span :class="['workspace-tab__browser', `is-${workspace.browserType}`]">
            {{ browserShortName(workspace.browserType) }}
          </span>
          <span class="workspace-tab__label">
            <span class="workspace-tab__name">
              {{ workspace.name }}
              <StarFilled v-if="workspace.isPrimary" class="workspace-tab__primary" />
            </span>
            <small>{{ workspace.bookmarkCount || 0 }} 条</small>
          </span>
        </button>
        <a-dropdown :trigger="['click']">
          <a-button type="text" size="small" class="workspace-tab__more" aria-label="书签库操作" @click.stop>
            <template #icon><MoreOutlined /></template>
          </a-button>
          <template #overlay>
            <a-menu @click="({ key }) => $emit('action', key, workspace)">
              <a-menu-item key="edit">编辑书签库</a-menu-item>
              <a-menu-item v-if="!workspace.isPrimary" key="primary">设为主书签库</a-menu-item>
              <a-menu-item key="import">更新当前书签库</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="clear" danger>清空书签库内容</a-menu-item>
              <a-menu-item key="delete" danger>删除书签库</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <a-button class="workspace-strip__add" @click="$emit('create')">
        <template #icon><PlusOutlined /></template>
        新建书签库
      </a-button>
    </div>

    <a-segmented
      :value="mode"
      :options="modeOptions"
      @change="$emit('update:mode', $event)"
    />
  </div>
</template>

<script setup>
import { MoreOutlined, PlusOutlined, StarFilled } from '@ant-design/icons-vue'

defineProps({
  workspaces: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
  mode: { type: String, default: 'manage' }
})

defineEmits(['select', 'create', 'action', 'update:mode'])

const modeOptions = [
  { label: '书签管理', value: 'manage' },
  { label: '对比整理', value: 'compare' }
]

const browserLabels = {
  chrome: 'C',
  edge: 'E',
  firefox: 'F',
  brave: 'B',
  opera: 'O',
  safari: 'S',
  other: 'W'
}

function browserShortName(type) {
  return browserLabels[type] || 'W'
}
</script>

<style scoped>
.workspace-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.workspace-strip__tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.workspace-tab {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  min-width: 150px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.workspace-tab:hover,
.workspace-tab.active {
  border-color: var(--console-primary);
}

.workspace-tab.active {
  background: var(--console-primary-soft);
  box-shadow: inset 0 -2px 0 var(--console-primary-strong);
}

.workspace-tab__main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 7px 4px 7px 8px;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.workspace-tab__main:focus-visible {
  outline: 2px solid var(--console-primary-strong);
  outline-offset: 1px;
}

.workspace-tab__browser {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 50%;
  color: #fff;
  background: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.workspace-tab__browser.is-chrome { background: #2878d4; }
.workspace-tab__browser.is-edge { background: #0f8f82; }
.workspace-tab__browser.is-firefox { background: #d65c18; }
.workspace-tab__browser.is-brave { background: #d14a35; }
.workspace-tab__browser.is-opera { background: #c51d3c; }
.workspace-tab__browser.is-safari { background: #2587c8; }

.workspace-tab__label {
  display: grid;
  min-width: 0;
  line-height: 1.2;
}

.workspace-tab__name {
  max-width: 128px;
  overflow: hidden;
  color: var(--console-text);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-tab__label small {
  margin-top: 3px;
  color: var(--console-text-secondary);
}

.workspace-tab__primary {
  margin-left: 3px;
  color: #d99516;
  font-size: 12px;
}

.workspace-tab__more {
  margin-right: 2px;
}

.workspace-strip__add {
  flex: 0 0 auto;
}

@media (max-width: 900px) {
  .workspace-strip {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-strip :deep(.ant-segmented) {
    align-self: flex-end;
  }
}
</style>
