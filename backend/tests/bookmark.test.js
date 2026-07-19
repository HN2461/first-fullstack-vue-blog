import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { BookmarkWorkspace } from '#modules/bookmark/models/BookmarkWorkspace.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUserWithRole(roleCode, overrides = {}) {
  const role = await Role.findOne({ code: roleCode })
  return User.create({
    username: overrides.username || roleCode,
    email: overrides.email || `${roleCode}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.USER,
    roles: role ? [role._id] : [],
    ...overrides
  })
}

function buildBookmarkHtml({ folder = '工具', title = '示例', includeExtra = true } = {}) {
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1782900000">${folder}</H3>
    <DL><p>
        <DT><A HREF="https://example.com/a" ADD_DATE="1782900010">${title}</A>
        ${includeExtra ? '<DT><A HREF="https://example.com/b" ADD_DATE="1782900020">仅当前库</A>' : ''}
    </DL><p>
</DL><p>`
}

describe('bookmark workspace routes', () => {
  let app
  let user
  let token

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'bookmark-user',
      email: 'bookmark-user@example.com'
    })
    token = signAccessToken(user)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  async function createWorkspace(name, browserType, isPrimary = false) {
    const response = await request(app)
      .post('/api/bookmarks/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name, browserType, isPrimary })
      .expect(201)
    return response.body.data
  }

  async function importHtml(workspaceId, html, mode = 'merge') {
    return request(app)
      .post(`/api/bookmarks/workspaces/${workspaceId}/imports/html`)
      .set('Authorization', `Bearer ${token}`)
      .field('mode', mode)
      .attach('file', Buffer.from(html, 'utf8'), 'bookmarks.html')
      .expect(200)
  }

  it('keeps browser workspaces isolated and deduplicates URLs only inside each workspace', async () => {
    const chrome = await createWorkspace('Chrome 主库', 'chrome', true)
    const edge = await createWorkspace('Edge', 'edge')

    await importHtml(chrome.id, buildBookmarkHtml({ folder: '开发', title: 'Chrome 名称' }))
    await importHtml(edge.id, buildBookmarkHtml({ folder: '工作', title: 'Edge 名称', includeExtra: false }))

    expect(await Bookmark.countDocuments({ userId: user._id })).toBe(3)
    const chromeBookmark = await Bookmark.findOne({ workspaceId: chrome.id, urlKey: 'https://example.com/a' })
    const edgeBookmark = await Bookmark.findOne({ workspaceId: edge.id, urlKey: 'https://example.com/a' })
    expect(chromeBookmark.title).toBe('Chrome 名称')
    expect(edgeBookmark.title).toBe('Edge 名称')
    expect(chromeBookmark.folderId.toString()).not.toBe(edgeBookmark.folderId.toString())

    const workspaces = await request(app)
      .get('/api/bookmarks/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(workspaces.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: chrome.id, isPrimary: true, bookmarkCount: 2, folderCount: 1 }),
      expect.objectContaining({ id: edge.id, isPrimary: false, bookmarkCount: 1, folderCount: 1 })
    ]))
  })

  it('replaces auxiliary workspace snapshots without affecting the primary workspace', async () => {
    const chrome = await createWorkspace('Chrome 主库', 'chrome', true)
    const edge = await createWorkspace('Edge', 'edge')
    await importHtml(chrome.id, buildBookmarkHtml())
    await importHtml(edge.id, buildBookmarkHtml())

    const replaced = await importHtml(edge.id, buildBookmarkHtml({ includeExtra: false }), 'replace')
    expect(replaced.body.data).toMatchObject({ inserted: 1, updated: 0 })
    expect(await Bookmark.countDocuments({ workspaceId: edge.id })).toBe(1)
    expect(await Bookmark.countDocuments({ workspaceId: chrome.id })).toBe(2)
    expect(await BookmarkFolder.countDocuments({ workspaceId: edge.id })).toBe(1)
  })

  it('compares primary and auxiliary workspaces and copies selected missing URLs to a primary folder', async () => {
    const chrome = await createWorkspace('Chrome 主库', 'chrome', true)
    const edge = await createWorkspace('Edge', 'edge')
    await importHtml(chrome.id, buildBookmarkHtml({ folder: 'Chrome 分类', includeExtra: false }))
    await importHtml(edge.id, buildBookmarkHtml({ folder: 'Edge 分类' }))

    const edgeOnly = await Bookmark.findOne({ workspaceId: edge.id, urlKey: 'https://example.com/b' })
    const targetFolder = await request(app)
      .post(`/api/bookmarks/workspaces/${chrome.id}/folders`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '待整理' })
      .expect(201)

    const comparison = await request(app)
      .get('/api/bookmarks/comparisons')
      .set('Authorization', `Bearer ${token}`)
      .query({
        primaryWorkspaceId: chrome.id,
        secondaryWorkspaceId: edge.id,
        status: 'secondary_only'
      })
      .expect(200)
    expect(comparison.body.data.stats).toMatchObject({ common: 1, secondaryOnly: 1, folderDiff: 1 })
    expect(comparison.body.data.items).toHaveLength(1)
    expect(comparison.body.data.items[0].secondary.id).toBe(edgeOnly.id)

    const copied = await request(app)
      .post('/api/bookmarks/comparisons/copy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sourceWorkspaceId: edge.id,
        targetWorkspaceId: chrome.id,
        targetFolderId: targetFolder.body.data.id,
        bookmarkIds: [edgeOnly.id]
      })
      .expect(200)
    expect(copied.body.data).toEqual({ inserted: 1, skipped: 0 })

    const inserted = await Bookmark.findOne({ workspaceId: chrome.id, urlKey: edgeOnly.urlKey })
    expect(inserted.folderId.toString()).toBe(targetFolder.body.data.id)
    expect(await Bookmark.countDocuments({ workspaceId: edge.id })).toBe(2)
  })

  it('supports scoped CRUD, toolbar import compatibility and workspace exports', async () => {
    const chrome = await createWorkspace('Chrome 主库', 'chrome', true)
    const toolbarHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3>书签栏
  <DL><p>
    <DT><A HREF="https://developer.mozilla.org">MDN
    <DT><A HREF="https://vite.dev">Vite
  </DL><p>
</DL><p>`
    await importHtml(chrome.id, toolbarHtml)
    expect(await BookmarkFolder.findOne({ workspaceId: chrome.id, name: '书签栏' })).toBeNull()
    expect(await Bookmark.countDocuments({ workspaceId: chrome.id, folderId: null })).toBe(2)

    const folder = await request(app)
      .post(`/api/bookmarks/workspaces/${chrome.id}/folders`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '资料夹' })
      .expect(201)
    const bookmark = await request(app)
      .post(`/api/bookmarks/workspaces/${chrome.id}/bookmarks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: folder.body.data.id, title: 'Vue', url: 'https://vuejs.org', tags: ['前端'] })
      .expect(201)

    await request(app)
      .patch(`/api/bookmarks/workspaces/${chrome.id}/bookmarks/move`)
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: null, ids: [bookmark.body.data.id] })
      .expect(200)

    const htmlResponse = await request(app)
      .get(`/api/bookmarks/workspaces/${chrome.id}/exports/html`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(htmlResponse.text).toContain('https://vuejs.org')

    const jsonResponse = await request(app)
      .get(`/api/bookmarks/workspaces/${chrome.id}/exports/json`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(jsonResponse.body).toMatchObject({ schemaVersion: 2, source: 'bookmark_workspace_backup' })
    expect(jsonResponse.body.workspace.name).toBe('Chrome 主库')
  })

  it('clears and deletes only the selected workspace and promotes another primary workspace', async () => {
    const chrome = await createWorkspace('Chrome 主库', 'chrome', true)
    const edge = await createWorkspace('Edge', 'edge')
    await importHtml(chrome.id, buildBookmarkHtml())
    await importHtml(edge.id, buildBookmarkHtml())

    await request(app)
      .delete(`/api/bookmarks/workspaces/${edge.id}/content`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(await Bookmark.countDocuments({ workspaceId: edge.id })).toBe(0)
    expect(await Bookmark.countDocuments({ workspaceId: chrome.id })).toBe(2)

    await request(app)
      .delete(`/api/bookmarks/workspaces/${chrome.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const promoted = await BookmarkWorkspace.findById(edge.id)
    expect(promoted.isPrimary).toBe(true)
  })

  it('blocks bookmark APIs when the role lacks bookmark menu permission', async () => {
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    role.menuIds = role.menuIds
      .filter((menu) => !['knowledge.root', 'knowledge.bookmarks'].includes(menu.code))
      .map((menu) => menu._id)
    await role.save()

    await request(app)
      .get('/api/bookmarks/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
