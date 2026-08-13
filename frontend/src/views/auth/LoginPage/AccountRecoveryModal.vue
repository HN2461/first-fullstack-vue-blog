<template>
  <a-modal
    :open="open"
    :title="lang === 'zh' ? '联系管理员找回账号' : 'Contact administrator'"
    :footer="null"
    :width="520"
    :wrap-class-name="`account-recovery-modal theme-${theme}`"
    :body-style="bodyStyle"
    destroy-on-close
    @cancel="$emit('update:open', false)"
  >
    <div class="recovery-content">
      <div v-if="loading" class="recovery-state"><a-spin /></div>
      <template v-else-if="enabled && hasContacts">
        <a-alert
          type="info"
          show-icon
          :message="lang === 'zh' ? '请先与管理员核验身份' : 'Verify your identity with the administrator'"
          :description="instructions"
        />
        <section v-if="recovery.qq?.enabled" class="contact-row">
          <div class="contact-row__icon contact-row__icon--qq"><QqOutlined /></div>
          <div class="contact-row__body"><strong>QQ</strong><span>{{ recovery.qq.account }}</span></div>
          <a-tooltip title="复制 QQ 号"><a-button type="text" aria-label="复制 QQ 号" @click="copyText(recovery.qq.account, 'QQ 号')"><CopyOutlined /></a-button></a-tooltip>
          <a-button v-if="recovery.qq.allowLaunch" size="small" @click="launchQq">打开 QQ</a-button>
          <a-image v-if="recovery.qq.qrCodeUrl" :width="46" :height="46" :src="recovery.qq.qrCodeUrl" class="contact-qr" />
        </section>

        <section v-if="recovery.wechat?.enabled" class="contact-row">
          <div class="contact-row__icon contact-row__icon--wechat"><WechatOutlined /></div>
          <div class="contact-row__body"><strong>微信</strong><span>{{ recovery.wechat.account }}</span></div>
          <a-tooltip title="复制微信号"><a-button type="text" aria-label="复制微信号" @click="copyText(recovery.wechat.account, '微信号')"><CopyOutlined /></a-button></a-tooltip>
          <a-image v-if="recovery.wechat.qrCodeUrl" :width="46" :height="46" :src="recovery.wechat.qrCodeUrl" class="contact-qr" />
        </section>

        <section v-if="recovery.email?.enabled" class="contact-row">
          <div class="contact-row__icon"><MailOutlined /></div>
          <div class="contact-row__body"><strong>{{ lang === 'zh' ? '联系邮箱' : 'Email' }}</strong><span>{{ recovery.email.address }}</span></div>
          <a-tooltip title="复制邮箱"><a-button type="text" aria-label="复制邮箱" @click="copyText(recovery.email.address, '邮箱')"><CopyOutlined /></a-button></a-tooltip>
        </section>

        <p v-if="recovery.contactHours" class="contact-hours"><ClockCircleOutlined />{{ recovery.contactHours }}</p>
      </template>
      <a-empty v-else :description="lang === 'zh' ? '请联系站点管理员处理' : 'Please contact the site administrator'" />

      <div class="recovery-flow">
        <span>1. 联系管理员</span><RightOutlined /><span>2. 核验身份</span><RightOutlined /><span>3. 获取一次性链接</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ClockCircleOutlined, CopyOutlined, MailOutlined, QqOutlined, RightOutlined, WechatOutlined } from '@ant-design/icons-vue'
import { useSiteStore } from '@/stores/site'

const props = defineProps({ open: Boolean, lang: { type: String, default: 'zh' }, theme: { type: String, default: 'dark' } })
defineEmits(['update:open'])
const siteStore = useSiteStore()
const loading = computed(() => !siteStore.ready)
const recovery = computed(() => siteStore.profile.accountRecovery || {})
const enabled = computed(() => recovery.value.enabled !== false)
const instructions = computed(() => recovery.value.instructions || '请联系站点管理员核验身份，核验通过后将获得一次性密码重置链接。')
const hasContacts = computed(() => recovery.value.qq?.enabled || recovery.value.wechat?.enabled || recovery.value.email?.enabled)
const bodyStyle = { maxHeight: '72vh', overflow: 'hidden', padding: '0' }

watch(() => props.open, (value) => { if (value) siteStore.loadProfile(true) })

async function copyText(value, label) {
  try {
    await navigator.clipboard.writeText(value)
    message.success(`${label}已复制`)
  } catch {
    message.warning(`复制失败，请手动记录${label}`)
  }
}

function launchQq() {
  window.open(`https://wpa.qq.com/msgrd?v=3&uin=${encodeURIComponent(recovery.value.qq.account)}&site=qq&menu=yes`, '_blank', 'noopener,noreferrer')
  message.info('已尝试打开 QQ；如未响应，请复制 QQ 号或扫描二维码')
}
</script>

<style scoped>
.recovery-content { max-height: 72vh; overflow-y: auto; padding: 22px; scrollbar-width: none; }
.recovery-content::-webkit-scrollbar { display: none; }
.recovery-state { display: grid; place-items: center; min-height: 180px; }
.contact-row { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 14px 0; border-bottom: 1px solid var(--border-color, #e5e7eb); }
.contact-row__icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; background: rgba(22, 119, 255, 0.1); color: #1677ff; font-size: 18px; flex-shrink: 0; }
.contact-row__icon--qq { color: #12b7f5; }
.contact-row__icon--wechat { color: #07c160; }
.contact-row__body { display: grid; gap: 2px; flex: 1; min-width: 0; }
.contact-row__body strong { color: var(--text-primary, #1f2937); }
.contact-row__body span { overflow-wrap: anywhere; color: var(--text-secondary, #64748b); font-size: 13px; }
.contact-qr { flex-shrink: 0; object-fit: contain; border-radius: 5px; }
.contact-hours { display: flex; gap: 8px; margin: 14px 0 0; color: var(--text-secondary, #64748b); font-size: 13px; line-height: 1.6; }
.recovery-flow { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 20px; padding: 12px; border-radius: 8px; background: rgba(127, 127, 127, 0.08); color: var(--text-secondary, #64748b); font-size: 12px; }
:global(.account-recovery-modal.theme-dark .ant-modal-content) { --text-primary: #f1f5f9; --text-secondary: #94a3b8; --border-color: #334155; background: #18202d; color: #f1f5f9; }
:global(.account-recovery-modal.theme-dark .ant-modal-header) { background: #18202d; }
:global(.account-recovery-modal.theme-dark .ant-modal-title), :global(.account-recovery-modal.theme-dark .ant-modal-close) { color: #f1f5f9; }
@media (max-width: 560px) { .recovery-content { padding: 18px 16px; } .contact-row { flex-wrap: wrap; } .contact-row__body { min-width: 150px; } }
</style>
