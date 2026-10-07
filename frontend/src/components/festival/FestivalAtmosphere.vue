<template>
  <div v-if="visible" class="festival-atmosphere" :class="`festival-atmosphere--${atmosphere.theme}`" :style="festivalStyle">
    <div class="festival-atmosphere__scene" aria-hidden="true">
      <div class="festival-atmosphere__lights">
        <span class="festival-lights__wire"></span>
        <i
          v-for="light in lights"
          :key="light.id"
          class="festival-lights__bulb"
          :style="{
            left: light.left,
            top: light.top,
            '--light-delay': light.delay,
            '--light-color': light.color,
            '--light-size': light.size
          }"
        ></i>
      </div>
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
const lights = computed(() => {
  const count = props.isMobile ? 10 : 18
  const colors = [props.activeFestival?.accent || '#2563eb', atmosphere.value.secondary, '#fff1a8']
  return Array.from({ length: count }, (_, index) => ({
    id: `${props.activeFestival?.key || 'festival'}-light-${index}`,
    left: `${2 + (index * 96) / (count - 1)}%`,
    top: `${8 + (index % 5) * 6}px`,
    delay: `${(index % 9) * -0.24}s`,
    color: colors[index % colors.length],
    size: `${10 + (index % 3) * 2}px`
  }))
})
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

.festival-atmosphere__lights {
  position: absolute;
  z-index: 1;
  top: 0;
  left: -1%;
  width: 102%;
  height: 72px;
  pointer-events: none;
  filter: drop-shadow(0 5px 12px var(--festival-glow));
}

.festival-lights__wire {
  position: absolute;
  top: 8px;
  left: 0;
  width: 100%;
  height: 38px;
  border-bottom: 2px solid color-mix(in srgb, var(--festival-secondary) 68%, #475569);
  border-radius: 0 0 50% 50%;
  opacity: .62;
  box-shadow: 0 3px 4px color-mix(in srgb, var(--festival-accent) 18%, transparent);
}

.festival-lights__bulb {
  position: absolute;
  display: block;
  width: var(--light-size, 12px);
  height: calc(var(--light-size, 12px) * 1.35);
  transform: translateX(-50%);
  border: 1px solid color-mix(in srgb, var(--light-color) 78%, #fff);
  border-radius: 50% 50% 45% 45%;
  background: var(--light-color);
  box-shadow:
    0 0 4px var(--light-color),
    0 0 10px color-mix(in srgb, var(--light-color) 72%, transparent),
    0 0 18px color-mix(in srgb, var(--light-color) 34%, transparent);
  animation: festivalBulbPulse 2.8s ease-in-out var(--light-delay) infinite;
}

.festival-lights__bulb::after {
  position: absolute;
  top: -5px;
  left: 50%;
  width: 4px;
  height: 6px;
  content: '';
  transform: translateX(-50%);
  border-radius: 2px 2px 0 0;
  background: #334155;
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

.festival-atmosphere--lantern .festival-lights__bulb,
.festival-atmosphere--spark .festival-lights__bulb,
.festival-atmosphere--fireworks .festival-lights__bulb,
.festival-atmosphere--radiant .festival-lights__bulb,
.festival-atmosphere--night-fire .festival-lights__bulb {
  width: calc(var(--light-size, 12px) * 1.15);
  height: calc(var(--light-size, 12px) * 1.55);
  animation-duration: 2.1s;
}

.festival-atmosphere--lantern .festival-lights__wire,
.festival-atmosphere--night-fire .festival-lights__wire {
  height: 48px;
  border-bottom-width: 3px;
}

.festival-atmosphere--moon .festival-lights__bulb,
.festival-atmosphere--starfield .festival-lights__bulb {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  animation-duration: 3.8s;
}

.festival-atmosphere--moon .festival-lights__wire,
.festival-atmosphere--starfield .festival-lights__wire {
  height: 28px;
  border-bottom-style: dotted;
  opacity: .56;
}

.festival-atmosphere--snow .festival-lights__bulb {
  border-radius: 50%;
  box-shadow: 0 0 8px var(--light-color), 0 0 22px color-mix(in srgb, var(--light-color) 68%, transparent);
  animation-duration: 3.2s;
}

.festival-atmosphere--river .festival-lights__wire,
.festival-atmosphere--drizzle .festival-lights__wire,
.festival-atmosphere--breeze .festival-lights__wire {
  height: 24px;
  border-bottom-style: dashed;
  opacity: .5;
}

.festival-atmosphere--candle .festival-lights__bulb {
  width: 8px;
  height: 12px;
  opacity: .62;
  animation-duration: 4.6s;
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
  z-index: 2;
  font-size: var(--particle-size, 17px);
  color: var(--festival-accent);
  opacity: .25;
  text-shadow: 0 1px 7px color-mix(in srgb, var(--festival-accent) 26%, transparent);
  animation: festivalFall linear infinite;
  will-change: transform;
}

.festival-atmosphere--lantern .festival-particles span,
.festival-atmosphere--fireworks .festival-particles span,
.festival-atmosphere--radiant .festival-particles span {
  opacity: .32;
}

.festival-atmosphere--drizzle .festival-particles span {
  opacity: .16;
  transform: rotate(18deg);
}

.festival-atmosphere--snow .festival-particles span {
  opacity: .28;
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

@keyframes festivalBulbPulse {
  0%, 100% { opacity: .52; transform: translateX(-50%) scale(.82); }
  42% { opacity: 1; transform: translateX(-50%) scale(1.12); }
  58% { opacity: .84; transform: translateX(-50%) scale(1); }
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

  .festival-lights__bulb {
    animation: none;
  }
}
</style>
