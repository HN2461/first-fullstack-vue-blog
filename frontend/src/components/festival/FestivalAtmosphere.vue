<template>
  <div v-if="visible" class="festival-atmosphere" :style="festivalStyle">
    <div class="festival-ribbon">
      <span class="festival-ribbon__icon">{{ activeFestival.icons?.[0] || '✨' }}</span>
      <span class="festival-ribbon__text">{{ activeFestival.text }}</span>
      <span class="festival-ribbon__meta">{{ activeFestival.name }}</span>
      <a-tooltip title="关闭本端节日氛围">
        <button class="festival-ribbon__close" type="button" aria-label="关闭节日氛围" @click="$emit('close')">
          ×
        </button>
      </a-tooltip>
    </div>

    <div v-if="!isMobile" class="festival-particles" aria-hidden="true">
      <span
        v-for="particle in particles"
        :key="particle.id"
        :style="{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration }"
      >
        {{ particle.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getParticleItems } from '@/utils/festival/festivalCalendar'

const props = defineProps({
  activeFestival: { type: Object, default: null },
  isMobile: { type: Boolean, default: false },
  visible: { type: Boolean, default: false }
})

defineEmits(['close'])

const particles = computed(() => getParticleItems(props.activeFestival, props.isMobile))
const festivalStyle = computed(() => ({
  '--festival-accent': props.activeFestival?.accent || '#2563eb',
  '--festival-tint': props.activeFestival?.tint || '#eff6ff'
}))
</script>

<style scoped>
.festival-atmosphere {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 49;
}

.festival-ribbon {
  pointer-events: auto;
  position: fixed;
  top: 64px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(560px, calc(100vw - 32px));
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, var(--festival-accent) 28%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--festival-tint) 88%, var(--console-surface));
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.12);
  color: var(--console-text);
  transform: translateX(-50%);
}

.festival-ribbon__icon {
  font-size: 16px;
}

.festival-ribbon__text {
  overflow: hidden;
  color: var(--festival-accent);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.festival-ribbon__meta {
  color: var(--console-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.festival-ribbon__close {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--console-text-secondary);
  cursor: pointer;
}

.festival-ribbon__close:hover {
  background: color-mix(in srgb, var(--festival-accent) 10%, transparent);
  color: var(--festival-accent);
}

.festival-particles span {
  position: absolute;
  top: -32px;
  font-size: 18px;
  opacity: 0.82;
  animation: festivalFall linear infinite;
}

@keyframes festivalFall {
  0% {
    transform: translate3d(0, -20px, 0) rotate(0deg);
  }

  100% {
    transform: translate3d(24px, calc(100vh + 64px), 0) rotate(180deg);
  }
}

@media (max-width: 760px) {
  .festival-ribbon {
    top: auto;
    right: 12px;
    bottom: 12px;
    left: 12px;
    justify-content: center;
    max-width: none;
    transform: none;
  }

  .festival-ribbon__meta {
    display: none;
  }
}
</style>
