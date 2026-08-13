<template>
  <div class="social-login">
    <div class="social-login__divider"><span>{{ lang === 'zh' ? '其他登录方式' : 'Other ways' }}</span></div>
    <div class="social-login__buttons">
      <a-tooltip title="QQ 登录"><button type="button" class="social-login__button social-login__button--qq" aria-label="QQ 登录" @click="unavailable('QQ')"><QqOutlined /></button></a-tooltip>
      <a-tooltip title="微信登录"><button type="button" class="social-login__button social-login__button--wechat" aria-label="微信登录" @click="unavailable('微信')"><WechatOutlined /></button></a-tooltip>
      <a-tooltip title="GitHub 登录"><button type="button" class="social-login__button social-login__button--github" aria-label="GitHub 登录" @click="unavailable('GitHub')"><GithubOutlined /></button></a-tooltip>
    </div>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue'
import { GithubOutlined, QqOutlined, WechatOutlined } from '@ant-design/icons-vue'
defineProps({ lang: { type: String, default: 'zh' } })
function unavailable(provider) { message.info(`${provider} 登录暂未开放`) }
</script>

<style scoped>
.social-login { margin-bottom: 24px; }
.social-login__divider { display: flex; align-items: center; margin-bottom: 16px; }
.social-login__divider::before, .social-login__divider::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }
.social-login__divider span { padding: 0 14px; color: var(--text-secondary); font-size: 13px; }
.social-login__buttons { display: flex; justify-content: center; gap: 16px; }
.social-login__button { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--border-color); border-radius: 50%; background: var(--input-bg); font-size: 20px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.social-login__button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); }
.social-login__button--qq { color: #12b7f5; }
.social-login__button--wechat { color: #07c160; }
.social-login__button--github { color: var(--text-primary); }
</style>
