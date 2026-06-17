<template>
  <div v-if="toc.length" ref="tocContainer" class="table-of-contents">
    <nav class="toc-nav" aria-label="文章目录">
      <a
        v-for="item in toc"
        :key="`${item.slug}:${item.level}`"
        :href="`#${item.slug}`"
        :class="['toc-item', `toc-level-${item.level}`, { active: activeSlug === item.slug }]"
        @click.prevent="scrollToHeading(item.slug)"
      >
        {{ item.text }}
      </a>
    </nav>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { resolveScrollableContainer } from '@/utils/scrollContainer'

const props = defineProps({
  toc: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['navigate'])

const activeSlug = ref('')
const tocContainer = ref(null)
let scrollContainer = null
let scrollHandler = null
let scrollTimeout = null

function resolveScrollContainer() {
  return resolveScrollableContainer(
    document.querySelector('[data-reading-scroll-container="true"]'),
    document.querySelector('.enterprise-content'),
    document.scrollingElement
  )
}

function scrollToHeading(slug) {
  const element = document.getElementById(slug)
  if (!element || !scrollContainer) {
    return
  }

  const containerRect = scrollContainer.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const scrollTop = scrollContainer.scrollTop
  const offset = elementRect.top - containerRect.top + scrollTop - 88

  scrollContainer.scrollTo({
    top: offset,
    behavior: 'smooth'
  })
  emit('navigate', slug)
}

function updateActiveSlug() {
  if (!scrollContainer || props.toc.length === 0) {
    return
  }

  const containerRect = scrollContainer.getBoundingClientRect()
  const scrollTop = scrollContainer.scrollTop
  const headings = props.toc
    .map((item) => {
      const element = document.getElementById(item.slug)
      if (!element) {
        return null
      }

      const rect = element.getBoundingClientRect()
      return {
        slug: item.slug,
        offsetTop: rect.top - containerRect.top + scrollTop
      }
    })
    .filter(Boolean)

  if (!headings.length) {
    return
  }

  let activeHeading = headings[0]
  for (let index = headings.length - 1; index >= 0; index -= 1) {
    if (headings[index].offsetTop <= scrollTop + 100) {
      activeHeading = headings[index]
      break
    }
  }

  activeSlug.value = activeHeading.slug
}

function scrollTocToActive() {
  if (!tocContainer.value || !activeSlug.value) {
    return
  }

  const activeElement = tocContainer.value.querySelector(`[href="#${activeSlug.value}"]`)
  if (!activeElement) {
    return
  }

  const visibleTop = activeElement.offsetTop - tocContainer.value.scrollTop
  const visibleBottom = visibleTop + activeElement.offsetHeight
  const isVisible = visibleTop >= 0 && visibleBottom <= tocContainer.value.clientHeight

  if (!isVisible) {
    tocContainer.value.scrollTo({
      top: Math.max(0, activeElement.offsetTop - 60),
      behavior: 'smooth'
    })
  }
}

function debouncedUpdateActiveSlug() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  scrollTimeout = setTimeout(updateActiveSlug, 50)
}

function bindScrollContainer() {
  if (scrollHandler && scrollContainer) {
    scrollContainer.removeEventListener('scroll', scrollHandler)
  }

  scrollContainer = resolveScrollContainer()
  if (!scrollContainer) {
    return
  }

  scrollHandler = debouncedUpdateActiveSlug
  scrollContainer.addEventListener('scroll', scrollHandler, { passive: true })
  setTimeout(updateActiveSlug, 120)
}

watch(() => props.toc, () => {
  nextTick(() => {
    bindScrollContainer()
    updateActiveSlug()
  })
}, { immediate: true })

watch(activeSlug, () => {
  nextTick(scrollTocToActive)
})

onMounted(() => {
  nextTick(bindScrollContainer)
})

onUnmounted(() => {
  if (scrollHandler && scrollContainer) {
    scrollContainer.removeEventListener('scroll', scrollHandler)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.table-of-contents {
  max-height: min(68vh, 560px);
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
  box-shadow: 0 12px 32px rgba(24, 32, 44, 0.07);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-item {
  display: block;
  padding: 6px 9px;
  border-left: 2px solid transparent;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.toc-item:hover {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--primary-color) 6%, transparent);
}

.toc-item.active {
  color: var(--text-primary);
  border-left-color: var(--primary-color);
  background: transparent;
  font-weight: 700;
}

.toc-level-1 {
  padding-left: 10px;
}

.toc-level-2 {
  padding-left: 16px;
}

.toc-level-3 {
  padding-left: 26px;
  color: var(--text-muted);
}

.toc-level-4,
.toc-level-5,
.toc-level-6 {
  padding-left: 36px;
  color: var(--text-muted);
}

.table-of-contents::-webkit-scrollbar {
  width: 6px;
}

.table-of-contents::-webkit-scrollbar-track {
  background: transparent;
}

.table-of-contents::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--border-color);
}
</style>
