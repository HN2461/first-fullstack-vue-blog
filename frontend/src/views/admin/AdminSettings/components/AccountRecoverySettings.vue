<template>
  <section class="recovery-settings">
    <div class="recovery-settings__head">
      <div>
        <strong>账号找回</strong>
        <span>配置登录页展示的人工联系渠道与二维码</span>
      </div>
      <a-switch v-model:checked="model.enabled" />
    </div>

    <div v-if="model.enabled" class="recovery-settings__body">
      <a-form layout="vertical">
        <a-form-item label="身份核验说明">
          <a-textarea v-model:value="model.instructions" :rows="3" :maxlength="500" show-count />
        </a-form-item>
        <a-form-item label="联系时间或补充说明">
          <a-textarea v-model:value="model.contactHours" :rows="2" :maxlength="200" show-count />
        </a-form-item>

        <div class="recovery-channel">
          <div class="recovery-channel__title"><strong>QQ</strong><a-switch v-model:checked="model.qq.enabled" size="small" /></div>
          <div class="recovery-channel__grid">
            <a-input v-model:value.trim="model.qq.account" placeholder="QQ 号" :maxlength="32" />
            <a-checkbox v-model:checked="model.qq.allowLaunch">允许尝试打开 QQ 添加好友</a-checkbox>
          </div>
          <QrCodeResourceField v-model:value="model.qq.qrCode" label="QQ 二维码" />
        </div>

        <div class="recovery-channel">
          <div class="recovery-channel__title"><strong>微信</strong><a-switch v-model:checked="model.wechat.enabled" size="small" /></div>
          <a-input v-model:value.trim="model.wechat.account" placeholder="微信号" :maxlength="64" />
          <QrCodeResourceField v-model:value="model.wechat.qrCode" label="微信二维码" />
        </div>

        <div class="recovery-channel">
          <div class="recovery-channel__title"><strong>联系邮箱</strong><a-switch v-model:checked="model.email.enabled" size="small" /></div>
          <a-input v-model:value.trim="model.email.address" placeholder="例如 admin@example.com" :maxlength="120" />
        </div>
      </a-form>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import QrCodeResourceField from './QrCodeResourceField.vue'

const props = defineProps({ value: { type: Object, required: true } })
const emit = defineEmits(['update:value'])

const model = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value)
})
</script>

<style scoped>
.recovery-settings { border: 1px solid var(--console-border); border-radius: 8px; overflow: hidden; }
.recovery-settings__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; background: var(--console-surface-muted); }
.recovery-settings__head > div { display: grid; gap: 3px; }
.recovery-settings__head strong, .recovery-channel__title strong { color: var(--console-text); }
.recovery-settings__head span { color: var(--console-text-secondary); font-size: 12px; }
.recovery-settings__body { padding: 18px 16px 2px; }
.recovery-channel { display: grid; gap: 12px; padding: 16px 0; border-top: 1px solid var(--console-border); }
.recovery-channel__title { display: flex; justify-content: space-between; align-items: center; }
.recovery-channel__grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; }
@media (max-width: 640px) { .recovery-channel__grid { grid-template-columns: 1fr; } }
</style>
