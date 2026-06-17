<template>
  <div class="slide-captcha" ref="containerRef">
    <!-- 灰色轨道 -->
    <div class="track" :class="{ success: verified }">
      <!-- 蓝色填充条：包裹圆球，右边缘与圆球右边缘重合 -->
      <div
        v-if="dragX > 0 || verified"
        class="track-fill"
        :style="{ width: verified ? '100%' : (dragX + THUMB_SIZE) + 'px' }"
      ></div>
      <!-- 白色圆球 -->
      <div
        class="track-thumb"
        :class="{ dragging: isDragging }"
        :style="{ left: verified ? 'calc(100% - ' + THUMB_SIZE + 'px)' : dragX + 'px' }"
        @mousedown.prevent="onDragStart"
        @touchstart.prevent="onDragStart"
      >
        <span v-if="!verified" class="arrow">›</span>
        <span v-else class="check">✓</span>
      </div>
      <!-- 提示文字 -->
      <div class="track-text">
        {{ verified ? '验证成功' : '请按住滑块拖动到最右边' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['success'])

// 圆球尺寸
const THUMB_SIZE = 36

const containerRef = ref(null)
const trackWidth = ref(320) // 轨道宽度，动态获取
const dragX = ref(0) // 圆球当前位置
const isDragging = ref(false)
const verified = ref(false)

let startX = 0
let startDragX = 0

onMounted(() => {
  // 动态获取轨道宽度
  if (containerRef.value) {
    trackWidth.value = containerRef.value.offsetWidth
  }
})

function onDragStart(e) {
  if (verified.value) return

  isDragging.value = true
  startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
  startDragX = dragX.value

  document.addEventListener('mousemove', onDragMove, { passive: false })
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e) {
  if (!isDragging.value) return
  e.preventDefault()

  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
  const diff = clientX - startX
  const newX = startDragX + diff

  // 最大拖拽距离 = 轨道宽度 - 圆球宽度
  const maxDrag = trackWidth.value - THUMB_SIZE

  // 限制在有效范围内
  dragX.value = Math.max(0, Math.min(maxDrag, newX))
}

function onDragEnd() {
  if (!isDragging.value) return

  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)

  const maxDrag = trackWidth.value - THUMB_SIZE

  // 到达最右侧（允许3px误差）则验证成功
  if (dragX.value >= maxDrag - 3) {
    verified.value = true
    dragX.value = maxDrag
    emit('success')
  } else {
    // 未完成，回弹到起点
    dragX.value = 0
  }
}

function reset() {
  verified.value = false
  dragX.value = 0
}

defineExpose({ reset, THUMB_SIZE })

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
})
</script>

<style scoped>
.slide-captcha {
  width: 100%;
  user-select: none;
}

/* 灰色轨道 */
.track {
  position: relative;
  height: 40px;
  background: #e8e8e8;
  border-radius: 20px;
  overflow: hidden;
}

/* 验证成功时轨道变绿 */
.track.success {
  background: #52c41a;
}

/* 蓝色填充条 */
.track-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #1677ff, #4096ff);
  border-radius: 20px;
}

.track.success .track-fill {
  background: linear-gradient(90deg, #52c41a, #73d13d);
}

/* 白色圆球 */
.track-thumb {
  position: absolute;
  top: 2px;
  left: 0;
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.track-thumb:active,
.track-thumb.dragging {
  cursor: grabbing;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.arrow {
  font-size: 22px;
  font-weight: bold;
  color: #1677ff;
  line-height: 1;
  margin-top: -4px; /* 向上偏移，视觉居中 */
}

.check {
  font-size: 18px;
  font-weight: bold;
  color: #52c41a;
  line-height: 1;
  margin-top: -3px;
}

/* 提示文字 */
.track-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  pointer-events: none;
  z-index: 5;
}

.track.success .track-text {
  color: #fff;
}
</style>
