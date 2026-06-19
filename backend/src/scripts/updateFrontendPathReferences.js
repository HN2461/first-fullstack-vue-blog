import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { User } from '#modules/user/models/User.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { Media } from '#modules/media/models/Media.js'

const applyChanges = process.argv.includes('--apply')

const pathMap = new Map([
  ['@/views/public/HomePage.vue', '@/views/public/HomePage/index.vue'],
  ['@/views/public/ArticleListPage.vue', '@/views/public/ArticleListPage/index.vue'],
  ['@/views/public/ArticleDetailPage.vue', '@/views/public/ArticleDetailPage/index.vue'],
  ['@/views/public/SearchPage.vue', '@/views/public/SearchPage/index.vue'],
  ['@/views/public/PublicLayout.vue', '@/views/public/PublicLayout/index.vue'],
  ['@/views/auth/LoginPage.vue', '@/views/auth/LoginPage/index.vue'],
  ['@/views/auth/RegisterPage.vue', '@/views/auth/RegisterPage/index.vue'],
  ['@/views/console/ConsoleLayout.vue', '@/views/console/ConsoleLayout/index.vue'],
  ['@/views/console/MemoPage.vue', '@/views/console/MemoPage/index.vue'],
  ['@/views/console/ProfilePage.vue', '@/views/console/ProfilePage/index.vue'],
  ['@/views/admin/AdminApprovals.vue', '@/views/admin/AdminApprovals/index.vue'],
  ['@/views/admin/AdminArticleEditor.vue', '@/views/admin/AdminArticleEditor/index.vue'],
  ['@/views/admin/AdminArticles.vue', '@/views/admin/AdminArticles/index.vue'],
  ['@/views/admin/AdminCategories.vue', '@/views/admin/AdminCategories/index.vue'],
  ['@/views/admin/AdminComments.vue', '@/views/admin/AdminComments/index.vue'],
  ['@/views/admin/AdminMedia.vue', '@/views/admin/AdminMedia/index.vue'],
  ['@/views/admin/AdminMenus.vue', '@/views/admin/AdminMenus/index.vue'],
  ['@/views/admin/AdminMigration.vue', '@/views/admin/AdminMigration/index.vue'],
  ['@/views/admin/AdminMonitor.vue', '@/views/admin/AdminMonitor/index.vue'],
  ['@/views/admin/AdminNotifications.vue', '@/views/admin/AdminNotifications/index.vue'],
  ['@/views/admin/AdminRoles.vue', '@/views/admin/AdminRoles/index.vue'],
  ['@/views/admin/AdminSettings.vue', '@/views/admin/AdminSettings/index.vue'],
  ['@/views/admin/AdminStats.vue', '@/views/admin/AdminStats/index.vue'],
  ['@/views/admin/AdminTags.vue', '@/views/admin/AdminTags/index.vue'],
  ['@/views/admin/AdminTrash.vue', '@/views/admin/AdminTrash/index.vue'],
  ['@/views/admin/AdminUsers.vue', '@/views/admin/AdminUsers/index.vue']
])

function rewriteValue(value) {
  if (typeof value === 'string') {
    let updated = value
    for (const [legacyPath, nextPath] of pathMap.entries()) {
      updated = updated.replaceAll(legacyPath, nextPath)
    }
    return updated
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteValue(item)])
    )
  }

  return value
}

function changed(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after)
}

async function updateDocuments(model, label, fields) {
  const docs = await model.find({})
  const matches = []

  for (const doc of docs) {
    const updates = {}

    for (const field of fields) {
      const nextValue = rewriteValue(doc.get(field))
      if (changed(doc.get(field), nextValue)) {
        updates[field] = nextValue
      }
    }

    if (Object.keys(updates).length) {
      matches.push({
        id: doc._id.toString(),
        updates
      })

      if (applyChanges) {
        doc.set(updates)
        await doc.save()
      }
    }
  }

  console.log(`${label}: ${matches.length} document(s) ${applyChanges ? 'updated' : 'matched'}`)
  for (const item of matches.slice(0, 5)) {
    console.log(`- ${label} ${item.id}: ${Object.keys(item.updates).join(', ')}`)
  }
}

async function main() {
  await connectDatabase()

  try {
    console.log(applyChanges ? 'Applying frontend path reference updates...' : 'Dry-run frontend path reference scan...')
    await updateDocuments(Menu, 'menus', ['routePath'])
    await updateDocuments(User, 'users', ['quickActions'])
    await updateDocuments(Setting, 'settings', ['value'])
    await updateDocuments(Media, 'media', ['url', 'storagePath'])
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
