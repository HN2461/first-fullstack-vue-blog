import { webcrypto } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { createHashRunner, hashText } from './hash'
import { MAX_TOOL_TEXT_LENGTH } from './textLimits'

const vectors = [
  ['SHA-1', 'abc', 'a9993e364706816aba3e25717850c26c9cd0d89d'],
  ['SHA-256', 'abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['SHA-384', 'abc', 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'],
  ['SHA-512', 'abc', 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'],
  ['SHA-1', '', 'da39a3ee5e6b4b0d3255bfef95601890afd80709'],
  ['SHA-256', '', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['SHA-384', '', '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b'],
  ['SHA-512', '', 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e']
]

describe('摘要算法标准向量', () => {
  it('拒绝孤立代理项，不把损坏文本与合法替换字符算成同一原文', async () => {
    for (const input of ['\ud800', '\udc00', 'a\ud800b']) await expect(hashText(input, 'SHA-256', webcrypto.subtle)).rejects.toThrow('孤立')
    await expect(hashText('\ufffd', 'SHA-256', webcrypto.subtle)).resolves.toHaveLength(64)
    await expect(hashText('a'.repeat(MAX_TOOL_TEXT_LENGTH + 1), 'SHA-256', webcrypto.subtle)).rejects.toThrow('1,048,576')
  })
  it.each(vectors)('%s 原文 %j', async (algorithm, input, expected) => {
    await expect(hashText(input, algorithm, webcrypto.subtle)).resolves.toBe(expected)
  })
  it('保留空白和 Unicode 原始编码，并明确报告不支持的环境或算法', async () => {
    const first = await hashText('中文😀\n', 'SHA-256', webcrypto.subtle)
    const second = await hashText('中文😀', 'SHA-256', webcrypto.subtle)
    expect(first).not.toBe(second)
    await expect(hashText('a', 'MD5', webcrypto.subtle)).rejects.toThrow('算法')
    await expect(hashText('a', 'SHA-256', null)).rejects.toThrow('HTTPS')
  })
})

describe('摘要异步过期处理', () => {
  it('迟到的旧请求不会覆盖后发结果', async () => {
    let resolveFirst
    const runner = createHashRunner((text) => text === 'first' ? new Promise((resolve) => { resolveFirst = resolve }) : Promise.resolve('new-hash'))
    const first = runner.run('first', 'SHA-256')
    const second = runner.run('second', 'SHA-256')
    await expect(second).resolves.toBe('new-hash')
    resolveFirst('old-hash')
    await expect(first).resolves.toBeNull()
  })
  it('取消后丢弃晚到异常，当前任务异常则正常报告', async () => {
    let rejectRequest
    const runner = createHashRunner(() => new Promise((resolve, reject) => { rejectRequest = reject }))
    const pending = runner.run('a', 'SHA-1')
    runner.cancel()
    rejectRequest(new Error('old failure'))
    await expect(pending).resolves.toBeNull()
    const failure = runner.run('b', 'SHA-1')
    rejectRequest(new Error('current failure'))
    await expect(failure).rejects.toThrow('current failure')
  })
})
