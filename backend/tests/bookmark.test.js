import request from 'supertest'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
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

function buildBookmarkHtml(title = '旧名称') {
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1782900000">工具</H3>
    <DL><p>
        <DT><A HREF="https://example.com/a" ADD_DATE="1782900010">${title}</A>
        <DT><A HREF="https://example.com/b" ADD_DATE="1782900020">同名</A>
    </DL><p>
    <DT><A HREF="https://example.com/c" ADD_DATE="1782900030">同名</A>
</DL><p>`
}

describe('bookmark routes', () => {
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

  it('imports browser bookmark HTML and merges by URL only', async () => {
    const first = await request(app)
      .post('/api/bookmarks/imports/html')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(buildBookmarkHtml(), 'utf8'), 'bookmarks.html')
      .expect(200)

    expect(first.body.data).toMatchObject({ inserted: 3, updated: 0 })
    expect(await Bookmark.countDocuments({ userId: user._id })).toBe(3)

    const second = await request(app)
      .post('/api/bookmarks/imports/html')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(buildBookmarkHtml('新名称'), 'utf8'), 'bookmarks.html')
      .expect(200)

    expect(second.body.data).toMatchObject({ inserted: 0, updated: 3 })
    expect(await Bookmark.countDocuments({ userId: user._id })).toBe(3)

    const updated = await Bookmark.findOne({ userId: user._id, url: 'https://example.com/a' })
    expect(updated.title).toBe('新名称')

    const sameNameBookmarks = await Bookmark.find({ userId: user._id, title: '同名' })
    expect(sameNameBookmarks.map((item) => item.url).sort()).toEqual([
      'https://example.com/b',
      'https://example.com/c'
    ])
  })

  it('treats browser toolbar folders as system bookmark bar during import', async () => {
    const toolbarHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1782900000">书签栏</H3>
    <DL><p>
        <DT><A HREF="https://example.com/toolbar" ADD_DATE="1782900010">工具栏书签</A>
    </DL><p>
</DL><p>`

    await request(app)
      .post('/api/bookmarks/imports/html')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(toolbarHtml, 'utf8'), 'bookmarks.html')
      .expect(200)

    const duplicatedToolbar = await BookmarkFolder.findOne({ userId: user._id, parentId: null, name: '书签栏' })
    expect(duplicatedToolbar).toBeNull()

    const rootBookmark = await Bookmark.findOne({ userId: user._id, url: 'https://example.com/toolbar' })
    expect(rootBookmark.folderId).toBeNull()
  })

  it('supports manual CRUD drag sorting and export formats', async () => {
    const folderResponse = await request(app)
      .post('/api/bookmarks/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '资料夹' })
      .expect(201)
    const folderId = folderResponse.body.data.id

    const first = await request(app)
      .post('/api/bookmarks/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId, title: 'Vue', url: 'https://vuejs.org', tags: ['前端'], note: '框架文档' })
      .expect(201)
    const second = await request(app)
      .post('/api/bookmarks/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId, title: 'Vite', url: 'https://vite.dev' })
      .expect(201)

    await request(app)
      .patch('/api/bookmarks/bookmarks/reorder')
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId, ids: [second.body.data.id, first.body.data.id] })
      .expect(200)

    const listResponse = await request(app)
      .get('/api/bookmarks/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .query({ folderId, keyword: 'vue' })
      .expect(200)
    expect(listResponse.body.data.items).toHaveLength(1)
    expect(listResponse.body.data.items[0]).toMatchObject({ title: 'Vue', note: '框架文档' })

    const htmlResponse = await request(app)
      .get('/api/bookmarks/exports/html')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(htmlResponse.text).toContain('NETSCAPE-Bookmark-file-1')
    expect(htmlResponse.text).toContain('https://vuejs.org')

    const jsonResponse = await request(app)
      .get('/api/bookmarks/exports/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(jsonResponse.body.source).toBe('bookmark_backup')
    expect(jsonResponse.body.bookmarks).toHaveLength(2)
  })

  it('moves bookmarks between folders and persists folder drag placement', async () => {
    const firstFolder = await request(app)
      .post('/api/bookmarks/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '待整理' })
      .expect(201)
    const secondFolder = await request(app)
      .post('/api/bookmarks/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '技术文档' })
      .expect(201)
    const nestedFolder = await request(app)
      .post('/api/bookmarks/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '前端', parentId: secondFolder.body.data.id })
      .expect(201)

    const bookmark = await request(app)
      .post('/api/bookmarks/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: firstFolder.body.data.id, title: 'MDN', url: 'https://developer.mozilla.org' })
      .expect(201)

    await request(app)
      .patch('/api/bookmarks/bookmarks/move')
      .set('Authorization', `Bearer ${token}`)
      .send({ folderId: secondFolder.body.data.id, ids: [bookmark.body.data.id] })
      .expect(200)

    const moved = await Bookmark.findById(bookmark.body.data.id)
    expect(moved.folderId.toString()).toBe(secondFolder.body.data.id)

    await request(app)
      .patch(`/api/bookmarks/folders/${nestedFolder.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ parentId: null })
      .expect(200)

    const rootFolders = await BookmarkFolder.find({ userId: user._id, parentId: null }).sort({ sortOrder: 1, createdAt: 1 })
    expect(rootFolders.map((folder) => folder.name)).toEqual(['待整理', '技术文档', '前端'])
  })

  it('blocks bookmark APIs when the role lacks bookmark menu permission', async () => {
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    role.menuIds = role.menuIds
      .filter((menu) => !['knowledge.root', 'knowledge.bookmarks'].includes(menu.code))
      .map((menu) => menu._id)
    await role.save()

    await request(app)
      .get('/api/bookmarks/folders')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
