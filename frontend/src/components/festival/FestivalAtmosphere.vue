<template>
  <div v-if="visible" class="festival-atmosphere" :style="festivalStyle">
    <a-tooltip placement="bottomRight">
      <template #title>
        <span>{{ activeFestival.text }}</span>
      </template>
      <div class="festival-ribbon">
        <span class="festival-ribbon__icon">{{ activeFestival.icons?.[0] || '✨' }}</span>
        <span class="festival-ribbon__meta">{{ activeFestival.name }}</span>
        <a-tooltip title="关闭本端节日氛围">
          <button class="festival-ribbon__close" type="button" aria-label="关闭节日氛围" @click="$emit('close')">
            ×
          </button>
        </a-tooltip>
      </div>
    </a-tooltip>

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
  top: 72px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: min(240px, calc(100vw - 32px));
  min-height: 30px;
  padding: 5px 7px 5px 9px;
  border: 1px solid color-mix(in srgb, var(--festival-accent) 28%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--festival-tint) 80%, var(--console-surface));
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.1);
  color: var(--console-text);
  opacity: 0.92;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.festival-ribbon:hover {
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.14);
  opacity: 1;
}

.festival-ribbon__icon {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 1;
}

.festival-ribbon__meta {
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.festival-ribbon__close {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
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
  font-size: 15px;
  opacity: 0.32;
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
    top: 58px;
    right: 12px;
    max-width: 168px;
  }

  .festival-ribbon__meta {
    max-width: 108px;
  }
}
</style>
