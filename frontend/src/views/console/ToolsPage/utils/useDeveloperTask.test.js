// @vitest-environment jsdom
import { createApp, h, KeepAlive, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeveloperTask } from './useDeveloperTask'

let app
let host
let api
let visible
let workers

beforeEach(() => {
  vi.useFakeTimers()
  workers = []
  vi.stubGlobal('Worker', class {
    constructor() { this.terminated = false; workers.push(this) }
    postMessage(message) { this.request = message }
    terminate() { this.terminated = true }
  })
  visible = ref(true)
  const Tool = { setup() { api = useDeveloperTask(); return () => h('div') } }
  app = createApp({ setup: () => () => h(KeepAlive, null, { default: () => visible.value ? h(Tool) : null }) })
  host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
})

afterEach(() => {
  app.unmount()
  host.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('开发工具异步执行隔离', () => {
  it('terminates the previous task and ignores its late message', async () => {
    const first = api.run('json', { input: '1' })
    const cancelled = expect(first).rejects.toMatchObject({ cancelled: true })
    const second = api.run('json', { input: '2' })
    await cancelled
    expect(workers[0].terminated).toBe(true)
    workers[0].onmessage({ data: { result: { output: 'old' } } })
    expect(api.loading.value).toBe(true)
    workers[1].onmessage({ data: { result: { output: '2' } } })
    await expect(second).resolves.toEqual({ output: '2' })
    expect(workers[1].terminated).toBe(true)
    expect(api.loading.value).toBe(false)
  })

  it('enforces a time budget and releases the worker', async () => {
    const pending = api.run('json', { input: '{}' })
    const rejected = expect(pending).rejects.toThrow('8 秒')
    await vi.advanceTimersByTimeAsync(8000)
    await rejected
    expect(workers[0].terminated).toBe(true)
    expect(api.loading.value).toBe(false)
  })

  it('keeps worker error location for JSON navigation', async () => {
    const pending = api.run('json', { input: '{\n}' })
    const rejected = expect(pending).rejects.toMatchObject({ message: '非法输入', offset: 2, line: 2 })
    workers[0].onmessage({ data: { error: { message: '非法输入', offset: 2, line: 2 } } })
    await rejected
    expect(api.loading.value).toBe(false)
  })

  it('cancels running work when the cached tool is deactivated', async () => {
    const pending = api.run('base64', { input: 'test' })
    const rejected = expect(pending).rejects.toMatchObject({ cancelled: true })
    visible.value = false
    await nextTick()
    await rejected
    expect(workers[0].terminated).toBe(true)
    expect(api.loading.value).toBe(false)
  })

  it('cleans up after native worker errors and supports the next run', async () => {
    const failed = api.run('base64', { input: 'test' })
    const rejected = expect(failed).rejects.toThrow('线程出错')
    workers[0].onerror({})
    await rejected
    const next = api.run('base64', { input: 'next' })
    workers[1].onmessage({ data: { result: { output: 'bmV4dA==' } } })
    await expect(next).resolves.toMatchObject({ output: 'bmV4dA==' })
  })
})
