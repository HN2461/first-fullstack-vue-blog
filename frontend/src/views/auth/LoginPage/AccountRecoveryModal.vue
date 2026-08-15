<template>
  <a-modal
    :open="open"
    :footer="null"
    :width="820"
    :wrap-class-name="`account-recovery-modal theme-${theme}`"
    :body-style="bodyStyle"
    destroy-on-close
    @cancel="$emit('update:open', false)"
  >
    <template #title>
      <div class="modal-title">
        <div class="modal-title__icon"><SafetyCertificateOutlined /></div>
        <div>
          <strong>{{ lang === 'zh' ? '找回账号' : 'Recover your account' }}</strong>
          <span>{{ lang === 'zh' ? '联系管理员完成身份核验' : 'Contact an administrator to verify your identity' }}</span>
        </div>
      </div>
    </template>

    <div class="recovery-content">
      <div v-if="loading" class="recovery-state"><a-spin /></div>
      <template v-else-if="enabled && hasContacts">
        <div class="recovery-layout">
          <aside class="recovery-guide">
            <div class="recovery-guide__mark"><SafetyCertificateOutlined /></div>
            <h2>{{ lang === 'zh' ? '需要帮助？' : 'Need help?' }}</h2>
            <p>{{ instructions }}</p>

            <ol class="recovery-steps">
              <li><span>1</span><div><strong>{{ lang === 'zh' ? '提供账号信息' : 'Share your account' }}</strong><small>{{ lang === 'zh' ? '告知注册邮箱或用户名' : 'Provide your email or username' }}</small></div></li>
              <li><span>2</span><div><strong>{{ lang === 'zh' ? '管理员核验' : 'Identity check' }}</strong><small>{{ lang === 'zh' ? '确认账号归属后处理' : 'The administrator confirms ownership' }}</small></div></li>
              <li><span>3</span><div><strong>{{ lang === 'zh' ? '完成重置' : 'Reset access' }}</strong><small>{{ lang === 'zh' ? '按指引重新设置密码' : 'Follow the reset instructions' }}</small></div></li>
            </ol>

            <div v-if="recovery.contactHours" class="recovery-guide__footer">
              <ClockCircleOutlined />
              <span>{{ recovery.contactHours }}</span>
            </div>
          </aside>

          <main class="channel-panel">
            <div class="channel-panel__head">
              <div>
                <h3>{{ lang === 'zh' ? '联系管理员' : 'Contact administrator' }}</h3>
                <p>{{ lang === 'zh' ? '请选择一种已配置的联系渠道。' : 'Choose one of the configured contact channels.' }}</p>
              </div>
              <span>{{ contactCount }} {{ lang === 'zh' ? '种方式' : 'options' }}</span>
            </div>

            <div class="channel-list">
              <section v-if="recovery.qq?.enabled" class="channel-card">
                <div class="channel-card__header">
                  <div class="channel-card__identity">
                    <div class="channel-icon channel-icon--qq"><QqOutlined /></div>
                    <div><strong>QQ</strong><small>{{ recovery.qq.account }}</small></div>
                  </div>
                  <span class="channel-card__label">{{ lang === 'zh' ? '添加好友' : 'Add contact' }}</span>
                </div>
                <div class="channel-card__body">
                  <div class="channel-card__actions">
                    <a-button v-if="recovery.qq.allowLaunch" type="primary" @click="launchQq">{{ lang === 'zh' ? '打开 QQ 添加好友' : 'Open QQ to add' }}</a-button>
                    <a-button @click="copyText(recovery.qq.account, 'QQ 号')"><CopyOutlined />{{ lang === 'zh' ? '复制 QQ 号' : 'Copy QQ' }}</a-button>
                    <small>{{ lang === 'zh' ? '电脑或手机未唤起时，请使用二维码或复制账号。' : 'Use the QR code or copy the account if QQ does not open.' }}</small>
                  </div>
                  <div v-if="recovery.qq.qrCodeUrl" class="channel-qr"><a-image :width="100" :height="100" :src="recovery.qq.qrCodeUrl" :alt="lang === 'zh' ? 'QQ二维码' : 'QQ QR code'" /><span>{{ lang === 'zh' ? '扫码添加' : 'Scan to add' }}</span></div>
                </div>
              </section>

              <section v-if="recovery.wechat?.enabled" class="channel-card">
                <div class="channel-card__header">
                  <div class="channel-card__identity">
                    <div class="channel-icon channel-icon--wechat"><WechatOutlined /></div>
                    <div><strong>微信</strong><small>{{ recovery.wechat.account }}</small></div>
                  </div>
                  <span class="channel-card__label">{{ lang === 'zh' ? '添加好友' : 'Add contact' }}</span>
                </div>
                <div class="channel-card__body">
                  <div class="channel-card__actions">
                    <a-button type="primary" @click="launchWechat">{{ lang === 'zh' ? '打开微信添加好友' : 'Open WeChat to add' }}</a-button>
                    <a-button @click="copyText(recovery.wechat.account, '微信号')"><CopyOutlined />{{ lang === 'zh' ? '复制微信号' : 'Copy WeChat ID' }}</a-button>
                    <small>{{ lang === 'zh' ? '电脑或手机未唤起时，请使用二维码或复制账号。' : 'Use the QR code or copy the ID if WeChat does not open.' }}</small>
                  </div>
                  <div v-if="recovery.wechat.qrCodeUrl" class="channel-qr"><a-image :width="100" :height="100" :src="recovery.wechat.qrCodeUrl" :alt="lang === 'zh' ? '微信二维码' : 'WeChat QR code'" /><span>{{ lang === 'zh' ? '扫码添加' : 'Scan to add' }}</span></div>
                </div>
              </section>

              <section v-if="recovery.email?.enabled" class="channel-card channel-card--email">
                <div class="channel-card__identity">
                  <div class="channel-icon"><MailOutlined /></div>
                  <div><strong>{{ lang === 'zh' ? '联系邮箱' : 'Email' }}</strong><small>{{ recovery.email.address }}</small></div>
                </div>
                <a-button @click="copyText(recovery.email.address, '邮箱')"><CopyOutlined />{{ lang === 'zh' ? '复制邮箱地址' : 'Copy email' }}</a-button>
              </section>
            </div>
          </main>
        </div>
      </template>
      <a-empty v-else :description="lang === 'zh' ? '请联系站点管理员处理' : 'Please contact the site administrator'" />
    </div>
  </a-modal>
</template>

<script setup>
import { computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ClockCircleOutlined, CopyOutlined, MailOutlined, QqOutlined, SafetyCertificateOutlined, WechatOutlined } from '@ant-design/icons-vue'
import { useSiteStore } from '@/stores/site'

const props = defineProps({ open: Boolean, lang: { type: String, default: 'zh' }, theme: { type: String, default: 'dark' } })
defineEmits(['update:open'])
const siteStore = useSiteStore()
const loading = computed(() => !siteStore.ready)
const recovery = computed(() => siteStore.profile.accountRecovery || {})
const enabled = computed(() => recovery.value.enabled !== false)
const instructions = computed(() => recovery.value.instructions || '请联系站点管理员核验身份，核验通过后将获得一次性密码重置链接。')
const hasContacts = computed(() => Boolean(recovery.value.qq?.enabled || recovery.value.wechat?.enabled || recovery.value.email?.enabled))
const contactCount = computed(() => [recovery.value.qq, recovery.value.wechat, recovery.value.email].filter(item => item?.enabled).length)
const bodyStyle = { maxHeight: 'min(70vh, 620px)', overflow: 'hidden', padding: '0' }

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
  const account = encodeURIComponent(recovery.value.qq.account)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const launchUrl = isMobile
    ? `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${account}&card_type=person&source=qrcode`
    : `tencent://AddContact/?fromId=50&fromSubId=1&subcmd=all&uin=${account}`
  window.location.href = launchUrl
  window.setTimeout(() => message.info('如果 QQ 未打开，请复制 QQ 号或扫描二维码添加好友'), 900)
}

function launchWechat() {
  const account = encodeURIComponent(recovery.value.wechat.account)
  window.location.href = 'weixin://dl/chat?username=' + account
  window.setTimeout(() => message.info('如果微信未打开，请复制微信号或扫描二维码添加好友'), 900)
}
</script>

<style scoped>
.recovery-content { max-height: min(70vh, 620px); overflow-y: auto; padding: 26px 28px 30px; scrollbar-width: none; }
.recovery-content::-webkit-scrollbar { display: none; }
.recovery-state { display: grid; place-items: center; min-height: 260px; }
.modal-title { display: flex; align-items: center; gap: 12px; }
.modal-title__icon, .recovery-guide__mark { display: grid; place-items: center; border-radius: 8px; background: rgba(22, 119, 255, 0.12); color: #1677ff; }
.modal-title__icon { width: 34px; height: 34px; font-size: 18px; }
.modal-title strong, .modal-title span { display: block; }
.modal-title strong { color: var(--text-primary, #1f2937); font-size: 16px; line-height: 1.35; }
.modal-title span { margin-top: 2px; color: var(--text-secondary, #64748b); font-size: 12px; font-weight: 400; line-height: 1.4; }
.recovery-layout { display: grid; grid-template-columns: 236px minmax(0, 1fr); gap: 30px; align-items: start; }
.recovery-guide { padding: 3px 8px 0 2px; }
.recovery-guide__mark { width: 42px; height: 42px; margin-bottom: 18px; font-size: 20px; }
.recovery-guide h2 { margin: 0 0 10px; color: var(--text-primary, #1f2937); font-size: 25px; line-height: 1.25; }
.recovery-guide > p { margin: 0 0 26px; color: var(--text-secondary, #64748b); font-size: 13px; line-height: 1.75; }
.recovery-steps { display: grid; gap: 19px; margin: 0; padding: 0; list-style: none; }
.recovery-steps li { display: grid; grid-template-columns: 27px minmax(0, 1fr); gap: 10px; position: relative; }
.recovery-steps li:not(:last-child)::after { content: ''; position: absolute; top: 28px; left: 13px; width: 1px; height: 22px; background: var(--border-color, #e5e7eb); }
.recovery-steps li > span { display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid rgba(22, 119, 255, 0.35); border-radius: 50%; color: #1677ff; font-size: 12px; font-weight: 700; }
.recovery-steps strong, .recovery-steps small { display: block; }
.recovery-steps strong { color: var(--text-primary, #1f2937); font-size: 13px; line-height: 1.5; }
.recovery-steps small { margin-top: 2px; color: var(--text-secondary, #64748b); font-size: 12px; line-height: 1.5; }
.recovery-guide__footer { display: flex; gap: 8px; align-items: flex-start; margin-top: 27px; padding-top: 17px; border-top: 1px solid var(--border-color, #e5e7eb); color: var(--text-secondary, #64748b); font-size: 12px; line-height: 1.6; }
.recovery-guide__footer > :first-child { flex: 0 0 auto; margin-top: 2px; color: #1677ff; }
.channel-panel { min-width: 0; }
.channel-panel__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.channel-panel__head h3 { margin: 0 0 4px; color: var(--text-primary, #1f2937); font-size: 18px; line-height: 1.4; }
.channel-panel__head p, .channel-panel__head > span { margin: 0; color: var(--text-secondary, #64748b); font-size: 12px; line-height: 1.5; }
.channel-panel__head > span { flex-shrink: 0; }
.channel-list { display: grid; gap: 12px; }
.channel-card { display: grid; gap: 15px; min-width: 0; padding: 17px 18px; border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px; background: var(--surface-subtle, rgba(15, 23, 42, 0.025)); }
.channel-card__header, .channel-card--email { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-width: 0; }
.channel-card__identity { display: flex; align-items: center; gap: 11px; min-width: 0; }
.channel-icon { display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 auto; border-radius: 8px; background: rgba(22, 119, 255, 0.1); color: #1677ff; font-size: 19px; }
.channel-icon--qq { color: #12b7f5; background: rgba(18, 183, 245, 0.12); }
.channel-icon--wechat { color: #07c160; background: rgba(7, 193, 96, 0.12); }
.channel-card__identity strong, .channel-card__identity small { display: block; }
.channel-card__identity strong { color: var(--text-primary, #1f2937); font-size: 14px; line-height: 1.4; }
.channel-card__identity small { margin-top: 3px; overflow-wrap: anywhere; color: var(--text-secondary, #64748b); font-size: 13px; line-height: 1.4; }
.channel-card__label { flex-shrink: 0; color: var(--text-secondary, #64748b); font-size: 12px; }
.channel-card__body { display: grid; grid-template-columns: minmax(0, 1fr) 100px; gap: 18px; align-items: center; min-width: 0; }
.channel-card__actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-width: 0; }
.channel-card__actions :deep(.ant-btn), .channel-card--email :deep(.ant-btn) { height: 34px; border-radius: 6px; font-size: 12px; }
.channel-card__actions small { flex-basis: 100%; color: var(--text-secondary, #64748b); font-size: 11px; line-height: 1.6; }
.channel-qr { display: grid; justify-items: center; gap: 5px; color: var(--text-secondary, #64748b); font-size: 11px; line-height: 1.3; }
.channel-qr :deep(.ant-image) { width: 100px; height: 100px; overflow: hidden; border-radius: 6px; }
.channel-qr :deep(.ant-image-img) { width: 100px; height: 100px; object-fit: contain; }
.channel-card--email { padding-top: 14px; padding-bottom: 14px; }
:global(.account-recovery-modal) { align-items: flex-start; padding: clamp(20px, 4vh, 44px) 16px clamp(28px, 6vh, 64px); }
:global(.account-recovery-modal .ant-modal) { top: 0; max-width: calc(100vw - 24px); }
:global(.account-recovery-modal .ant-modal-content) { overflow: hidden; border-radius: 10px; }
:global(.account-recovery-modal .ant-modal-header) { padding: 20px 28px 16px; border-bottom: 1px solid var(--border-color, #e5e7eb); }
:global(.account-recovery-modal.theme-dark .ant-modal-content) { --text-primary: #f1f5f9; --text-secondary: #94a3b8; --border-color: #334155; --surface-subtle: rgba(255, 255, 255, 0.035); background: #18202d; color: #f1f5f9; }
:global(.account-recovery-modal.theme-dark .ant-modal-header) { background: #18202d; }
:global(.account-recovery-modal.theme-dark .ant-modal-title), :global(.account-recovery-modal.theme-dark .ant-modal-close) { color: #f1f5f9; }
:global(.account-recovery-modal.theme-light .ant-modal-content) { --text-primary: #1f2937; --text-secondary: #64748b; --border-color: #e5e7eb; --surface-subtle: #f8fafc; background: #ffffff; color: #1f2937; }
:global(.account-recovery-modal.theme-light .ant-modal-header) { background: #ffffff; }
@media (max-width: 760px) {
  .recovery-content { padding: 22px 20px 24px; }
  .recovery-layout { grid-template-columns: 1fr; gap: 25px; }
  .recovery-guide { padding: 0; }
}
@media (max-width: 520px) {
  .modal-title span { display: none; }
  :global(.account-recovery-modal .ant-modal-header) { padding: 16px 20px 14px; }
  .recovery-content { padding: 20px 16px 22px; }
  :global(.account-recovery-modal) { padding: 16px 12px 28px; }
  .channel-card__body { grid-template-columns: minmax(0, 1fr) 88px; gap: 12px; }
  .channel-qr :deep(.ant-image), .channel-qr :deep(.ant-image-img) { width: 88px; height: 88px; }
  .channel-card__actions :deep(.ant-btn) { flex: 1 1 auto; }
  .channel-card--email { align-items: flex-start; flex-direction: column; }
  .channel-card--email :deep(.ant-btn) { width: 100%; }
}
</style>
