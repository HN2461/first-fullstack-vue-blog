<template>
  <Teleport to="body">
    <div
      ref="containerRef"
      class="reading-toolbar-container"
      :style="positionStyle"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <button
        class="reading-fab"
        :class="{ 'is-expanded': isExpanded, 'is-dragging': isDragging }"
        type="button"
        aria-label="阅读工具栏"
        :aria-expanded="String(isExpanded)"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @click="handleClick"
        @keydown.enter.prevent="toggleExpand"
        @keydown.space.prevent="toggleExpand"
      >
        <svg class="progress-ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle class="progress-ring-bg" cx="22" cy="22" r="18" fill="none" stroke-width="3" />
          <circle
            class="progress-ring-fill"
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke-width="3"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </button>

      <Transition name="panel-slide">
        <section v-if="isExpanded" class="toolbar-panel" :style="panelStyle" aria-label="阅读设置">
          <header class="panel-header">
            <span class="panel-title">阅读工具</span>
            <button class="panel-close" type="button" aria-label="关闭阅读工具" @click.stop="isExpanded = false">
              <X :size="16" />
            </button>
          </header>

          <div class="panel-section">
            <div class="section-label">阅读进度</div>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
            </div>
            <div class="progress-info">{{ Math.round(progress) }}%</div>
          </div>

          <div class="panel-section">
            <div class="section-label">字体大小</div>
            <div class="font-controls">
              <button class="font-btn" type="button" :disabled="fontSize <= MIN_FONT_SIZE" @click.stop="decreaseFontSize">A-</button>
              <span class="font-size-value">{{ fontSize }}px</span>
              <button class="font-btn" type="button" :disabled="fontSize >= MAX_FONT_SIZE" @click.stop="increaseFontSize">A+</button>
              <button class="font-btn reset-btn" type="button" :disabled="fontSize === defaultFontSize" aria-label="重置字号" @click.stop="resetFontSize">
                <RotateCcw :size="14" />
              </button>
            </div>
          </div>

          <div class="panel-section">
            <button
              class="action-btn immersive-btn"
              :class="{ 'is-active': immersiveMode }"
              type="button"
              :aria-pressed="String(immersiveMode)"
              @click.stop="toggleImmersive"
            >
              <Focus :size="18" />
              <span>{{ immersiveMode ? '退出沉浸' : '沉浸阅读' }}</span>
            </button>
          </div>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Focus, RotateCcw, X } from 'lucide-vue-next'
import { getDefaultFontSize, getFontSize, MAX_FONT_SIZE, MIN_FONT_SIZE, setFontSize } from '@/utils/fontSizeStorage'
import { resolveScrollableContainer } from '@/utils/scrollContainer'

const emit = defineEmits(['fontSizeChange', 'toggleImmersive'])

defineProps({
  immersiveMode: {
    type: Boolean,
    default: false
  }
})

const containerRef = ref(null)
const isExpanded = ref(false)
const progress = ref(0)
const fontSize = ref(17)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isTouchDevice = ref(false)
const scrollContainer = ref(null)
const isDragging = ref(false)
const hasDragged = ref(false)
const position = ref({ x: null, y: null })
const dragStart = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

const circumference = 2 * Math.PI * 18
const defaultFontSize = computed(() => getDefaultFontSize(viewportWidth.value))
const progressOffset = computed(() => circumference - (progress.value / 100) * circumference)

const positionStyle = computed(() => {
  if (position.value.x === null) {
    return {
      right: '24px',
      bottom: '24px'
    }
  }

  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    right: 'auto',
    bottom: 'auto'
  }
})

const panelStyle = computed(() => {
  if (typeof window === 'undefined') {
    return { right: '0', bottom: '70px' }
  }

  const panelWidth = viewportWidth.value <= 768 ? Math.min(280, viewportWidth.value - 32) : 240
  const panelHeight = 252
  const buttonSize = viewportWidth.value <= 768 ? 48 : 56
  const padding = 16

  if (position.value.x === null) {
    return {
      right: '0',
      bottom: '70px',
      width: `${panelWidth}px`
    }
  }

  const buttonX = position.value.x
  const buttonY = position.value.y
  const viewportHeight = window.innerHeight
  const style = {
    width: `${panelWidth}px`,
    maxHeight: `${Math.min(panelHeight, viewportHeight - 40)}px`
  }

  if (viewportWidth.value <= 768) {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
    if (buttonY < viewportHeight / 2) {
      style.top = `${buttonY + buttonSize + padding}px`
    } else {
      style.bottom = `${viewportHeight - buttonY + padding}px`
    }
    return style
  }

  if (buttonX - panelWidth - padding >= 0) {
    style.right = `${viewportWidth.value - buttonX + padding}px`
  } else {
    style.left = `${Math.min(buttonX + buttonSize + padding, viewportWidth.value - panelWidth - padding)}px`
  }

  style.top = buttonY + panelHeight + padding <= viewportHeight
    ? `${buttonY}px`
    : `${Math.max(padding, buttonY + buttonSize - panelHeight)}px`

  return style
})

let ticking = false
let resizeHandler = null

function resolveScrollContainer() {
  return resolveScrollableContainer(
    document.querySelector('[data-reading-scroll-container="true"]'),
    document.querySelector('.enterprise-content'),
    document.scrollingElement
  )
}

function updateProgress() {
  if (!scrollContainer.value) {
    return
  }

  const maxScroll = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight
  progress.value = maxScroll <= 0
    ? 0
    : Math.min(100, Math.max(0, (scrollContainer.value.scrollTop / maxScroll) * 100))
}

function onScroll() {
  if (ticking) {
    return
  }

  requestAnimationFrame(() => {
    updateProgress()
    ticking = false
  })
  ticking = true
}

function setToolbarFontSize(nextSize) {
  fontSize.value = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, nextSize))
  setFontSize(fontSize.value)
  emit('fontSizeChange', fontSize.value)
}

function increaseFontSize() {
  setToolbarFontSize(fontSize.value + 2)
}

function decreaseFontSize() {
  setToolbarFontSize(fontSize.value - 2)
}

function resetFontSize() {
  setToolbarFontSize(defaultFontSize.value)
}

function toggleImmersive() {
  emit('toggleImmersive')
  isExpanded.value = false
}

function toggleExpand() {
  if (!isDragging.value) {
    isExpanded.value = !isExpanded.value
  }
}

function handleMouseEnter() {
  if (!isTouchDevice.value && viewportWidth.value > 768 && !isDragging.value && !hasDragged.value) {
    isExpanded.value = true
  }
}

function handleMouseLeave() {
  if (!isTouchDevice.value && viewportWidth.value > 768 && !isDragging.value) {
    isExpanded.value = false
  }
}

function handleClick() {
  if (hasDragged.value) {
    hasDragged.value = false
    return
  }

  if (isTouchDevice.value || viewportWidth.value <= 768) {
    toggleExpand()
  }
}

function startDrag(event) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  hasDragged.value = false
  isExpanded.value = false

  const pointer = event.type === 'touchstart' ? event.touches[0] : event
  dragStart.value = { x: pointer.clientX, y: pointer.clientY }

  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    dragOffset.value = {
      x: pointer.clientX - rect.left,
      y: pointer.clientY - rect.top
    }
  }

  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
  document.body.style.userSelect = 'none'
}

function onDrag(event) {
  if (!isDragging.value) {
    return
  }

  event.preventDefault()
  const pointer = event.type === 'touchmove' ? event.touches[0] : event
  const deltaX = Math.abs(pointer.clientX - dragStart.value.x)
  const deltaY = Math.abs(pointer.clientY - dragStart.value.y)

  if (deltaX > 5 || deltaY > 5) {
    hasDragged.value = true
  }

  const buttonSize = viewportWidth.value <= 768 ? 48 : 56
  const padding = 16
  const x = Math.max(padding, Math.min(pointer.clientX - dragOffset.value.x, window.innerWidth - buttonSize - padding))
  const y = Math.max(padding, Math.min(pointer.clientY - dragOffset.value.y, window.innerHeight - buttonSize - padding))

  position.value = { x, y }
  localStorage.setItem('reading-toolbar-position', JSON.stringify(position.value))
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  document.body.style.userSelect = ''
  setTimeout(() => {
    hasDragged.value = false
  }, 100)
}

function restorePosition() {
  try {
    const saved = JSON.parse(localStorage.getItem('reading-toolbar-position') || 'null')
    const buttonSize = viewportWidth.value <= 768 ? 48 : 56
    const padding = 16

    if (
      saved &&
      saved.x >= padding &&
      saved.y >= padding &&
      saved.x <= window.innerWidth - buttonSize - padding &&
      saved.y <= window.innerHeight - buttonSize - padding
    ) {
      position.value = saved
    }
  } catch {
    position.value = { x: null, y: null }
  }
}

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  fontSize.value = getFontSize(viewportWidth.value)
  emit('fontSizeChange', fontSize.value)
  restorePosition()

  setTimeout(() => {
    scrollContainer.value = resolveScrollContainer()
    scrollContainer.value?.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()
  }, 100)

  resizeHandler = () => {
    viewportWidth.value = window.innerWidth
    updateProgress()
  }
  window.addEventListener('resize', resizeHandler, { passive: true })
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', onScroll)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.reading-toolbar-container {
  position: fixed;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.reading-fab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--bg-elevated) 92%, transparent);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.reading-fab:hover,
.reading-fab.is-expanded {
  transform: scale(1.03);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
}

.reading-fab.is-dragging {
  cursor: grabbing;
  transform: scale(1.06);
}

.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-ring-bg {
  stroke: color-mix(in srgb, var(--text-muted) 28%, transparent);
}

.progress-ring-fill {
  stroke: var(--primary-color);
  transition: stroke-dashoffset 0.25s ease;
}

.progress-text {
  position: relative;
  z-index: 1;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
}

.toolbar-panel {
  position: fixed;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(8px);
  scrollbar-width: none;
}

.toolbar-panel::-webkit-scrollbar {
  display: none;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.panel-close,
.font-btn,
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.panel-close {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
}

.panel-close:hover,
.font-btn:hover:not(:disabled),
.action-btn:hover {
  border-color: color-mix(in srgb, var(--primary-color) 42%, var(--border-color));
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 7%, var(--bg-secondary));
}

.panel-section {
  margin-bottom: 16px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.section-label {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.progress-bar-container {
  height: 6px;
  overflow: hidden;
  margin-bottom: 4px;
  border-radius: 999px;
  background: var(--bg-muted);
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transition: width 0.2s ease;
}

.progress-info {
  color: var(--text-secondary);
  font-size: 12px;
  text-align: right;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.font-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.font-size-value {
  flex: 1;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.action-btn {
  width: 100%;
  gap: 10px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
}

.immersive-btn.is-active {
  border-color: color-mix(in srgb, var(--primary-color) 48%, var(--border-color));
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-secondary));
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (max-width: 768px) {
  .reading-fab {
    width: 48px;
    height: 48px;
  }

  .progress-text {
    font-size: 10px;
  }

  .toolbar-panel {
    padding: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-fab,
  .progress-ring-fill,
  .toolbar-panel,
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none !important;
  }
}
</style>
