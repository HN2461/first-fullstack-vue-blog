<template>
  <teleport to="body">
    <div
      class="entrance-effect"
      :class="[`entrance-effect--${effectKey}`, { 'is-leaving': leaving }]"
      :style="effectStyle"
      aria-hidden="true"
    >
      <div class="entrance-effect__wash"></div>
      <div class="entrance-effect__focus"></div>
      <div class="entrance-effect__curtain entrance-effect__curtain--left"></div>
      <div class="entrance-effect__curtain entrance-effect__curtain--right"></div>
      <span
        v-for="item in particles"
        :key="item.id"
        class="entrance-effect__particle"
        :style="item.style"
      ></span>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { getEntranceEffectMeta } from '@/utils/entranceEffects/effectCatalog'

const props = defineProps({
  effectKey: {
    type: String,
    default: 'fade-soft'
  },
  duration: {
    type: Number,
    default: 4
  },
  leaving: {
    type: Boolean,
    default: false
  }
})

const particleCountMap = {
  'fade-soft': 12,
  'float-up': 18,
  'slide-left': 16,
  'slide-right': 16,
  'scale-pop': 18,
  'flip-3d': 14,
  starlight: 58,
  'firework-bloom': 64,
  'particle-burst': 72,
  ripple: 24,
  'light-sweep': 18,
  'meteor-night': 34,
  'shadow-sweep': 18,
  'flash-open': 10,
  curtain: 18,
  shatter: 44,
  'color-burst': 70,
  shockwave: 30,
  'screen-shake': 24,
  petals: 42,
  snow: 58,
  glow: 24,
  fog: 20
}

const meta = computed(() => getEntranceEffectMeta(props.effectKey))
const effectStyle = computed(() => ({
  '--entrance-duration': `${props.duration}s`,
  '--entrance-tone': meta.value.tone
}))
const particles = computed(() => {
  const count = particleCountMap[props.effectKey] || 28
  return Array.from({ length: count }, (_item, index) => {
    const x = (index * 37) % 101
    const y = (index * 53) % 101
    const size = 5 + ((index * 11) % 22)
    const delay = ((index % 12) * 0.08).toFixed(2)
    const drift = ((index % 2 === 0 ? 1 : -1) * (24 + (index % 7) * 18))
    const angle = (index * 29) % 360
    return {
      id: index,
      style: {
        '--x': `${x}vw`,
        '--y': `${y}vh`,
        '--size': `${size}px`,
        '--delay': `${delay}s`,
        '--drift': `${drift}px`,
        '--angle': `${angle}deg`
      }
    }
  })
})
</script>

<style scoped>
.entrance-effect {
  position: fixed;
  inset: 0;
  z-index: 998;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--entrance-tone) 24%, transparent), transparent 42%),
    rgba(8, 13, 18, 0.2);
  animation: entranceBase var(--entrance-duration) ease both;
}

.entrance-effect.is-leaving {
  animation: entranceLeave 0.45s ease forwards;
}

.entrance-effect__wash,
.entrance-effect__focus,
.entrance-effect__curtain,
.entrance-effect__particle { position: absolute; }

.entrance-effect__wash {
  inset: -20%;
  background:
    linear-gradient(110deg, transparent 0 34%, rgba(255, 255, 255, 0.65) 48%, transparent 62%),
    linear-gradient(180deg, color-mix(in srgb, var(--entrance-tone) 34%, transparent), transparent);
  transform: translateX(-70%) rotate(8deg);
  animation: entranceSweep var(--entrance-duration) cubic-bezier(0.2, 0.72, 0.22, 1) both;
}

.entrance-effect__focus {
  inset: 18%;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--entrance-tone) 40%, rgba(255, 255, 255, 0.5));
  box-shadow: 0 0 80px color-mix(in srgb, var(--entrance-tone) 34%, transparent);
  opacity: 0;
  transform: scale(0.55);
  animation: entrancePulse var(--entrance-duration) ease-out both;
}

.entrance-effect__curtain {
  top: 0;
  bottom: 0;
  width: 52%;
  background: linear-gradient(115deg, color-mix(in srgb, var(--entrance-tone) 55%, #111827), rgba(255, 255, 255, 0.14));
  transform-origin: center;
  opacity: 0;
}

.entrance-effect__curtain--left {
  left: 0;
}

.entrance-effect__curtain--right {
  right: 0;
}

.entrance-effect__particle {
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  background: color-mix(in srgb, var(--entrance-tone) 64%, white);
  box-shadow: 0 0 18px color-mix(in srgb, var(--entrance-tone) 72%, transparent);
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: entranceParticle var(--entrance-duration) ease-out var(--delay) both;
}

.entrance-effect--fade-soft .entrance-effect__wash {
  opacity: 0.45;
}

.entrance-effect--float-up .entrance-effect__particle,
.entrance-effect--petals .entrance-effect__particle,
.entrance-effect--snow .entrance-effect__particle {
  animation-name: entranceFloat;
}

.entrance-effect--slide-left .entrance-effect__wash {
  animation-name: entranceSlideLeft;
}

.entrance-effect--slide-right .entrance-effect__wash {
  animation-name: entranceSlideRight;
}

.entrance-effect--scale-pop .entrance-effect__focus,
.entrance-effect--shockwave .entrance-effect__focus { animation-name: entranceShockwave; }

.entrance-effect--flip-3d { perspective: 900px; }

.entrance-effect--flip-3d .entrance-effect__focus {
  border-radius: 18px;
  animation-name: entranceFlip;
}

.entrance-effect--starlight .entrance-effect__particle {
  width: 3px; height: 3px; animation-name: entranceTwinkle;
}

.entrance-effect--firework-bloom .entrance-effect__particle,
.entrance-effect--particle-burst .entrance-effect__particle,
.entrance-effect--color-burst .entrance-effect__particle {
  animation-name: entranceBurst;
}

.entrance-effect--ripple .entrance-effect__particle {
  width: 12px; height: 12px; background: transparent;
  border: 1px solid color-mix(in srgb, var(--entrance-tone) 70%, white);
  animation-name: entranceRipple;
}

.entrance-effect--light-sweep .entrance-effect__wash,
.entrance-effect--shadow-sweep .entrance-effect__wash { opacity: 0.85; animation-name: entranceSweep; }

.entrance-effect--meteor-night .entrance-effect__particle {
  width: 72px;
  height: 2px;
  border-radius: 0;
  transform: rotate(var(--angle));
  animation-name: entranceMeteor;
}

.entrance-effect--flash-open {
  background: rgba(255, 255, 255, 0.82);
  animation-name: entranceFlash;
}

.entrance-effect--curtain .entrance-effect__curtain {
  opacity: 1;
  animation: entranceCurtain var(--entrance-duration) cubic-bezier(0.16, 0.8, 0.24, 1) both;
}

.entrance-effect--shatter .entrance-effect__particle {
  border-radius: 2px;
  animation-name: entranceShatter;
}

.entrance-effect--screen-shake {
  animation-name: entranceShake;
}

.entrance-effect--glow .entrance-effect__particle {
  filter: blur(4px);
  animation-name: entranceGlow;
}

.entrance-effect--fog .entrance-effect__particle {
  width: 120px;
  height: 48px;
  filter: blur(14px);
  opacity: 0.2;
  animation-name: entranceFog;
}

@keyframes entranceBase {
  0% { opacity: 0; }
  16% { opacity: 1; }
  78% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes entranceLeave {
  to { opacity: 0; }
}

@keyframes entranceSweep {
  0% { transform: translateX(-75%) rotate(8deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(75%) rotate(8deg); opacity: 0; }
}

@keyframes entranceSlideLeft {
  0% { transform: translateX(70%); opacity: 0; }
  20% { opacity: 0.85; }
  100% { transform: translateX(-70%); opacity: 0; }
}

@keyframes entranceSlideRight {
  0% { transform: translateX(-70%); opacity: 0; }
  20% { opacity: 0.85; }
  100% { transform: translateX(70%); opacity: 0; }
}

@keyframes entrancePulse {
  0% { opacity: 0; transform: scale(0.55); }
  24% { opacity: 0.9; }
  100% { opacity: 0; transform: scale(1.45); }
}

@keyframes entranceShockwave {
  0% { opacity: 0; transform: scale(0.18); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: scale(2.2); }
}

@keyframes entranceFlip {
  0% { opacity: 0; transform: rotateY(-72deg) scale(0.8); }
  34% { opacity: 0.8; }
  100% { opacity: 0; transform: rotateY(12deg) scale(1.28); }
}

@keyframes entranceParticle {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  25% { opacity: 0.85; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--drift)), calc(-50% - 34px)) scale(0.9); }
}

@keyframes entranceFloat {
  0% { opacity: 0; transform: translate(-50%, 28px) rotate(0deg); }
  20% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--drift)), -120px) rotate(var(--angle)); }
}

@keyframes entranceTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.4); }
  24%, 56% { opacity: 1; transform: scale(1.35); }
}

@keyframes entranceBurst {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) scale(0.2); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--drift) * 2), calc(-50% + var(--drift))) rotate(var(--angle)) scale(1); }
}

@keyframes entranceRipple {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
  25% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(5.5); }
}

@keyframes entranceMeteor {
  0% { opacity: 0; transform: translate(80px, -80px) rotate(var(--angle)); }
  30% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-180px, 160px) rotate(var(--angle)); }
}

@keyframes entranceFlash {
  0% { opacity: 0; }
  12% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes entranceCurtain {
  0% { transform: translateX(0); }
  76% { transform: translateX(0); }
  100% { transform: translateX(var(--curtain-exit, -110%)); }
}

.entrance-effect__curtain--right { --curtain-exit: 110%; }

@keyframes entranceShatter {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(1.8); }
  18% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--drift) * 1.8), calc(-50% + var(--drift) * -1.2)) rotate(var(--angle)) scale(0.2); }
}

@keyframes entranceShake {
  0%, 100% { opacity: 0; transform: translate3d(0, 0, 0); }
  16%, 78% { opacity: 1; }
  20% { transform: translate3d(-8px, 4px, 0); }
  24% { transform: translate3d(7px, -5px, 0); }
  28% { transform: translate3d(-4px, 6px, 0); }
  34% { transform: translate3d(0, 0, 0); }
}

@keyframes entranceGlow {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  38% { opacity: 0.55; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
}

@keyframes entranceFog {
  0% { opacity: 0; transform: translate(calc(-50% - 36px), -50%) scale(0.8); }
  30% { opacity: 0.32; }
  100% { opacity: 0; transform: translate(calc(-50% + 72px), -50%) scale(1.35); }
}

@media (max-width: 768px) {
  .entrance-effect__particle:nth-child(n + 35) {
    display: none;
  }

  .entrance-effect__focus {
    inset: 24%;
  }
}
</style>
