<template>
  <div v-if="visible" class="festival-atmosphere" :class="`festival-atmosphere--${atmosphere.theme}`" :style="festivalStyle">
    <div class="festival-atmosphere__scene" aria-hidden="true">
    </div>
    <a-tooltip placement="bottomRight">
      <template #title>
        <span>{{ activeFestival.text }}</span>
      </template>
      <div class="festival-ribbon">
        <span class="festival-ribbon__icon"><FestivalIcon :icon="activeFestival.icons?.[0] || '✨'" /></span>
        <span class="festival-ribbon__meta">{{ activeFestival.displayName || activeFestival.name }}</span>
        <a-tooltip title="关闭本端节日氛围">
          <button class="festival-ribbon__close" type="button" aria-label="关闭节日氛围" @click="$emit('close')">
            <X :size="14" :stroke-width="2" aria-hidden="true" />
          </button>
        </a-tooltip>
      </div>
    </a-tooltip>

    <div v-if="!isMobile" class="festival-particles" aria-hidden="true">
      <span
        v-for="particle in particles"
        :key="particle.id"
        :style="{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration, '--particle-size': particle.size, '--particle-drift': particle.drift, '--particle-rotation': particle.rotation }"
      >
        {{ particle.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import FestivalIcon from './FestivalIcon.vue'
import { getFestivalAtmosphereProfile } from '@/utils/festival/festivalCatalog'
import { getParticleItems } from '@/utils/festival/festivalCalendar'

const props = defineProps({
  activeFestival: { type: Object, default: null },
  isMobile: { type: Boolean, default: false },
  visible: { type: Boolean, default: false }
})

defineEmits(['close'])

const particles = computed(() => getParticleItems(props.activeFestival, props.isMobile))
const atmosphere = computed(() => getFestivalAtmosphereProfile(props.activeFestival))
const festivalStyle = computed(() => ({
  '--festival-accent': props.activeFestival?.accent || '#2563eb',
  '--festival-tint': props.activeFestival?.tint || '#eff6ff',
  '--festival-secondary': atmosphere.value.secondary,
  '--festival-glow': atmosphere.value.glow,
  '--festival-drift': `${atmosphere.value.drift}px`
}))
</script>

<style scoped>
.festival-atmosphere {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 49;
  overflow: hidden;
}

/* The atmosphere is an edge treatment. It never places a large decoration over content. */
.festival-atmosphere__scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.festival-atmosphere__scene::before {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, transparent, var(--festival-accent) 18%, var(--festival-secondary) 50%, var(--festival-accent) 82%, transparent);
  opacity: .72;
}

.festival-atmosphere__scene::after {
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  height: 22px;
  content: '';
  background: linear-gradient(180deg, color-mix(in srgb, var(--festival-tint) 34%, transparent), transparent);
  opacity: .34;
}

.festival-atmosphere--lantern .festival-atmosphere__scene::after {
  background: repeating-linear-gradient(90deg, transparent 0 54px, color-mix(in srgb, var(--festival-secondary) 32%, transparent) 55px 56px, transparent 57px 112px);
  opacity: .22;
}

.festival-atmosphere--river .festival-atmosphere__scene::after,
.festival-atmosphere--drizzle .festival-atmosphere__scene::after {
  top: auto;
  bottom: 10vh;
  left: 0;
  right: 0;
  height: 32px;
  background: repeating-linear-gradient(172deg, transparent 0 12px, color-mix(in srgb, var(--festival-secondary) 20%, transparent) 13px 14px, transparent 15px 24px);
  opacity: .34;
}

.festival-atmosphere--drizzle .festival-atmosphere__scene::before {
  height: 1px;
  background: repeating-linear-gradient(105deg, transparent 0 22px, color-mix(in srgb, var(--festival-secondary) 38%, transparent) 23px 24px, transparent 25px 42px);
  opacity: .4;
}

.festival-atmosphere--snow .festival-atmosphere__scene::after {
  background: linear-gradient(180deg, color-mix(in srgb, #dbeafe 42%, transparent), transparent);
  opacity: .26;
}

.festival-atmosphere--moon .festival-atmosphere__scene::after,
.festival-atmosphere--starfield .festival-atmosphere__scene::after {
  background: radial-gradient(circle at 84% 8%, color-mix(in srgb, var(--festival-secondary) 16%, transparent), transparent 18%), repeating-linear-gradient(90deg, transparent 0 38px, color-mix(in srgb, var(--festival-secondary) 12%, transparent) 39px 40px, transparent 41px 80px);
  opacity: .28;
}

.festival-atmosphere--fireworks .festival-atmosphere__scene::after,
.festival-atmosphere--radiant .festival-atmosphere__scene::after {
  background: repeating-linear-gradient(90deg, transparent 0 34px, color-mix(in srgb, var(--festival-secondary) 18%, transparent) 35px 36px, transparent 37px 76px);
  opacity: .25;
}

.festival-atmosphere--tribute .festival-atmosphere__scene::before,
.festival-atmosphere--candle .festival-atmosphere__scene::before {
  background: linear-gradient(90deg, transparent, #64748b 36%, #cbd5e1 50%, #64748b 64%, transparent);
  opacity: .42;
}

.festival-atmosphere--tribute .festival-atmosphere__scene::after,
.festival-atmosphere--candle .festival-atmosphere__scene::after {
  background: linear-gradient(180deg, rgba(71, 85, 105, .12), transparent);
  opacity: .22;
}

.festival-ribbon {
  pointer-events: auto;
  position: fixed;
  top: 72px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: min(240px, calc(100vw - 32px));
  min-height: 32px;
  padding: 5px 7px 5px 9px;
  border: 1px solid color-mix(in srgb, var(--festival-accent) 26%, var(--console-border));
  border-left: 3px solid var(--festival-accent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--console-surface) 94%, var(--festival-tint));
  box-shadow: 0 5px 16px rgba(16, 24, 40, .08);
  color: var(--console-text);
  opacity: .96;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.festival-ribbon:hover {
  border-color: color-mix(in srgb, var(--festival-accent) 45%, var(--console-border));
  box-shadow: 0 7px 20px rgba(16, 24, 40, .12);
}

.festival-ribbon__icon {
  flex: 0 0 auto;
  display: inline-flex;
  width: 18px;
  height: 18px;
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
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 5px;
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
  font-size: var(--particle-size, 15px);
  color: var(--festival-accent);
  opacity: .22;
  text-shadow: 0 1px 6px color-mix(in srgb, var(--festival-accent) 18%, transparent);
  animation: festivalFall linear infinite;
  will-change: transform;
}

.festival-atmosphere--lantern .festival-particles span,
.festival-atmosphere--fireworks .festival-particles span,
.festival-atmosphere--radiant .festival-particles span {
  opacity: .28;
}

.festival-atmosphere--drizzle .festival-particles span {
  opacity: .16;
  transform: rotate(18deg);
}

.festival-atmosphere--snow .festival-particles span {
  opacity: .2;
}

.festival-atmosphere--balloon .festival-particles span,
.festival-atmosphere--petal .festival-particles span {
  animation-name: festivalSway;
}

@keyframes festivalFall {
  0% { transform: translate3d(0, -20px, 0) rotate(0deg); }
  100% { transform: translate3d(var(--particle-drift, 24px), calc(100vh + 64px), 0) rotate(calc(180deg * var(--particle-rotation, 1))); }
}

@keyframes festivalSway {
  0% { transform: translate3d(0, -20px, 0) rotate(-8deg); }
  50% { transform: translate3d(calc(var(--particle-drift, 24px) * -1), 50vh, 0) rotate(10deg); }
  100% { transform: translate3d(var(--particle-drift, 24px), calc(100vh + 64px), 0) rotate(-8deg); }
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

@media (prefers-reduced-motion: reduce) {
  .festival-particles {
    display: none;
  }

  .festival-ribbon {
    transition: none;
  }
}
</style>
