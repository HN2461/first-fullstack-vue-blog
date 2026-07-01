import mongoose from 'mongoose'
import { connectDatabase } from '#config/database'
import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'

const applyChanges = process.argv.includes('--apply')
const toolbarNames = ['书签栏', '收藏夹栏', '书签工具栏', 'Bookmarks Bar', 'Favorites Bar', 'Bookmarks Toolbar']

async function getNextSortOrder(userId) {
  const latest = await Bookmark.findOne({ userId, folderId: null }).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return Number(latest?.sortOrder || 0) + 10
}

async function getNextFolderSortOrder(userId) {
  const latest = await BookmarkFolder.findOne({ userId, parentId: null }).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return Number(latest?.sortOrder || 0) + 10
}

async function mergeFolder(folder) {
  const childFolderCount = await BookmarkFolder.countDocuments({ userId: folder.userId, parentId: folder._id })
  const bookmarkCount = await Bookmark.countDocuments({ userId: folder.userId, folderId: folder._id })
  console.log(`发现浏览器书签栏容器：user=${folder.userId} folder=${folder._id} name=${folder.name} bookmarks=${bookmarkCount} childFolders=${childFolderCount}`)

  if (!applyChanges) return { bookmarks: bookmarkCount, folders: childFolderCount + 1 }

  const baseSortOrder = await getNextSortOrder(folder.userId)
  const bookmarks = await Bookmark.find({ userId: folder.userId, folderId: folder._id }).sort({ sortOrder: 1, createdAt: 1 })
  await Promise.all(bookmarks.map((bookmark, index) => Bookmark.updateOne(
    { _id: bookmark._id },
    {
      $set: {
        folderId: null,
        sortOrder: baseSortOrder + index * 10
      }
    }
  )))

  const childFolders = await BookmarkFolder.find({ userId: folder.userId, parentId: folder._id }).sort({ sortOrder: 1, createdAt: 1 })
  const folderBaseSortOrder = await getNextFolderSortOrder(folder.userId)
  await Promise.all(childFolders.map((child, index) => BookmarkFolder.updateOne(
    { _id: child._id },
    {
      $set: {
        parentId: null,
        sortOrder: folderBaseSortOrder + index * 10
      }
    }
  )))
  await BookmarkFolder.deleteOne({ _id: folder._id })
  return { bookmarks: bookmarks.length, folders: childFolders.length + 1 }
}

async function main() {
  await connectDatabase()
  const folders = await BookmarkFolder.find({
    parentId: null,
    name: { $in: toolbarNames },
    source: { $in: ['html_import', 'json_import'] }
  }).sort({ userId: 1, createdAt: 1 })

  console.log(`${applyChanges ? 'Apply' : 'Dry-run'}: 待处理浏览器书签栏容器 ${folders.length} 个。`)
  let movedBookmarks = 0
  let removedFolders = 0
  for (const folder of folders) {
    const result = await mergeFolder(folder)
    movedBookmarks += result.bookmarks
    removedFolders += result.folders
  }

  console.log(`${applyChanges ? '已处理' : '预计处理'}：迁移书签 ${movedBookmarks} 条，调整文件夹 ${removedFolders} 个。`)
  if (!applyChanges) {
    console.log('确认已有 mongodump 备份后，执行：node src/scripts/mergeBookmarkToolbarFolders.js --apply')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
