import { Setting } from '#modules/settings/models/Setting.js'
import { DEFAULT_SITE_ENTRANCE_EFFECT } from '#modules/settings/constants/siteEntranceEffects.js'
import { DEFAULT_MEDIA_ALLOWED_EXTENSIONS } from '#modules/media/constants/mediaUpload.constants.js'

const DEFAULT_SETTINGS = {
  siteTitle: '个人全栈博客系统',
  siteDescription: '一个由 Vue、Express 和 MongoDB 驱动的个人技术博客。',
  authorName: 'Haonan',
  commentEnabled: true,
  defaultTheme: 'light',
  systemVersion: 'v1.0.0',
  mediaMaxFilesPerUpload: 5,
  mediaMaxFileSizeMB: 20,
  mediaAllowedExtensions: [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS],
  accountRecovery: {
    enabled: true,
    instructions: '请通过下方联系方式与管理员核验身份，核验通过后管理员会发送一次性密码重置链接。',
    contactHours: '',
    qq: { enabled: false, account: '', allowLaunch: true, qrCode: { mediaId: '', url: '', name: '' } },
    wechat: { enabled: false, account: '', qrCode: { mediaId: '', url: '', name: '' } },
    email: { enabled: false, address: '' }
  },
  siteEntranceEffect: { ...DEFAULT_SITE_ENTRANCE_EFFECT }
}

export async function getSettings() {
  const settings = await Setting.find()
  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(settings.map((item) => [item.key, item.value]))
  }
}

export async function updateSettings(input, user) {
  const entries = Object.entries(input)

  for (const [key, value] of entries) {
    await Setting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        group: key.startsWith('site') || key.startsWith('author') ? 'site' : key.startsWith('media') ? 'media' : 'system',
        updatedBy: user._id
      },
      {
        upsert: true,
        new: true
      }
    )
  }

  return getSettings()
}

export async function getPublicSiteProfile() {
  const settings = await getSettings()
  const accountRecovery = settings.accountRecovery || DEFAULT_SETTINGS.accountRecovery
  const recoveryEnabled = accountRecovery.enabled !== false
  const qqEnabled = recoveryEnabled && accountRecovery.qq?.enabled === true && !!accountRecovery.qq?.account
  const wechatEnabled = recoveryEnabled && accountRecovery.wechat?.enabled === true && !!accountRecovery.wechat?.account
  const emailEnabled = recoveryEnabled && accountRecovery.email?.enabled === true && !!accountRecovery.email?.address
  const hasRecoveryContact = qqEnabled || wechatEnabled || emailEnabled

  return {
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    authorName: settings.authorName,
    commentEnabled: settings.commentEnabled,
    defaultTheme: settings.defaultTheme,
    systemVersion: settings.systemVersion,
    siteEntranceEffect: settings.siteEntranceEffect,
    accountRecovery: {
      enabled: recoveryEnabled,
      instructions: hasRecoveryContact ? String(accountRecovery.instructions || '') : '',
      contactHours: hasRecoveryContact ? String(accountRecovery.contactHours || '') : '',
      qq: {
        enabled: qqEnabled,
        account: qqEnabled ? String(accountRecovery.qq?.account || '') : '',
        allowLaunch: accountRecovery.qq?.allowLaunch !== false,
        qrCodeUrl: qqEnabled ? String(accountRecovery.qq?.qrCode?.url || '') : ''
      },
      wechat: {
        enabled: wechatEnabled,
        account: wechatEnabled ? String(accountRecovery.wechat?.account || '') : '',
        qrCodeUrl: wechatEnabled ? String(accountRecovery.wechat?.qrCode?.url || '') : ''
      },
      email: {
        enabled: emailEnabled,
        address: emailEnabled ? String(accountRecovery.email?.address || '') : ''
      }
    }
  }
}
