import { describe, expect, it } from 'vitest'
import { buildFolderTree, collectFolderBranchIds, flattenFolders } from './bookmarkUtils'

describe('bookmark folder utilities', () => {
  it('collects the current folder and every descendant in its branch', () => {
    const tree = buildFolderTree([
      { id: 'root', name: '根目录', parentId: null, sortOrder: 10 },
      { id: 'child', name: '子目录', parentId: 'root', sortOrder: 10 },
      { id: 'grandchild', name: '孙目录', parentId: 'child', sortOrder: 10 },
      { id: 'sibling', name: '同级目录', parentId: null, sortOrder: 20 }
    ])
    const root = flattenFolders(tree).find((folder) => folder.id === 'root')

    expect(collectFolderBranchIds(root)).toEqual(['root', 'child', 'grandchild'])
    expect(collectFolderBranchIds(null)).toEqual([])
  })
})
