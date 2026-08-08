<template>
  <section v-if="hasNeighbors" class="reading-navigation" aria-label="相邻文章">
    <div class="reading-navigation__heading">
      <span>继续阅读</span>
      <small>{{ neighbors.position }} / {{ neighbors.total }}</small>
    </div>

    <div class="reading-navigation__list">
      <button
        v-for="item in neighbors.previous"
        :key="`previous-${item.id}`"
        type="button"
        class="reading-navigation__item"
        @click="navigate(item.slug)"
      >
        <ChevronUp :size="15" aria-hidden="true" />
        <span>
          <small>{{ item === neighbors.previous[0] ? '上一篇' : '更早文章' }}</small>
          <strong>{{ item.title }}</strong>
        </span>
      </button>

      <button
        v-for="item in neighbors.next"
        :key="`next-${item.id}`"
        type="button"
        class="reading-navigation__item"
        @click="navigate(item.slug)"
      >
        <ChevronDown :size="15" aria-hidden="true" />
        <span>
          <small>{{ item === neighbors.next[0] ? '下一篇' : '更晚文章' }}</small>
          <strong>{{ item.title }}</strong>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = defineProps({
  neighbors: {
    type: Object,
    default: () => ({ previous: [], next: [], position: 0, total: 0 })
  }
})

const emit = defineEmits(['navigate'])
const hasNeighbors = computed(() => props.neighbors.previous?.length || props.neighbors.next?.length)

function navigate(slug) {
  if (slug) emit('navigate', slug)
}
</script>

<style scoped>
.reading-navigation {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.reading-navigation__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.reading-navigation__heading small {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.reading-navigation__list {
  display: grid;
  gap: 4px;
  max-height: 238px;
  overflow-y: auto;
}

.reading-navigation__item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: start;
  gap: 6px;
  width: 100%;
  padding: 7px 6px;
  border: 0;
  border-radius: 6px;
  color: var(--text-secondary);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
}

.reading-navigation__item:hover,
.reading-navigation__item:focus-visible {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 9%, var(--bg-secondary));
  outline: none;
}

.reading-navigation__item > svg {
  margin-top: 2px;
  color: var(--primary-color);
}

.reading-navigation__item span {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.reading-navigation__item small {
  color: var(--text-muted);
  font-size: 11px;
}

.reading-navigation__item strong {
  overflow: hidden;
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .reading-navigation__item {
    transition: none;
  }
}
</style>
