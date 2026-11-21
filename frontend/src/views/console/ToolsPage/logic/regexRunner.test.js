import { Worker as NodeWorker } from 'node:worker_threads'
import { describe, expect, it } from 'vitest'
import { createRegexRunner } from './regexRunner'

function nodeWorkerFactory() {
  const moduleUrl = new URL('./regex.js', import.meta.url).href
  const source = `const { parentPort } = require('node:worker_threads'); import(${JSON.stringify(moduleUrl)}).then(({ executeRegex }) => { parentPort.on('message', (data) => { try { parentPort.postMessage({ result: executeRegex(data) }) } catch (error) { parentPort.postMessage({ error: error.message }) } }) })`
  const worker = new NodeWorker(source, { eval: true })
  const adapter = { postMessage: (data) => worker.postMessage(data), terminate: () => worker.terminate(), onmessage: null, onerror: null }
  worker.on('message', (data) => adapter.onmessage?.({ data }))
  worker.on('error', (cause) => adapter.onerror?.(cause))
  return adapter
}

describe('正则 Worker 隔离', () => {
  it('通过独立线程返回匹配和表达式错误', async () => {
    const runner = createRegexRunner({ workerFactory: nodeWorkerFactory, timeoutMs: 2000 })
    await expect(runner.run({ pattern: '\\d+', flags: 'g', text: 'a12 b3' })).resolves.toMatchObject({ matches: [{ value: '12', index: 1 }, { value: '3', index: 5 }] })
    await expect(runner.run({ pattern: '[', flags: 'g', text: 'a' })).rejects.toThrow('表达式无效')
  })
  it('灾难性回溯在时间预算内被终止，之后仍可测试其他表达式', async () => {
    const runner = createRegexRunner({ workerFactory: nodeWorkerFactory, timeoutMs: 1000 })
    await expect(runner.run({ pattern: '(a+)+$', flags: '', text: `${'a'.repeat(45)}!` })).rejects.toThrow('超过执行时限')
    await expect(runner.run({ pattern: 'ok', flags: '', text: 'ok' })).resolves.toMatchObject({ matches: [{ value: 'ok' }] })
  })
  it('取消在途计算会拒绝旧任务，新任务不受影响', async () => {
    const runner = createRegexRunner({ workerFactory: nodeWorkerFactory, timeoutMs: 2000 })
    const pending = runner.run({ pattern: '(a+)+$', flags: '', text: `${'a'.repeat(45)}!` })
    const canceled = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    runner.cancel()
    await canceled
    await expect(runner.run({ pattern: '', flags: 'g', text: '' })).resolves.toMatchObject({ matches: [{ value: '', index: 0 }] })
  })
  it('无法创建 Worker 时明确报错，不退回主线程', async () => {
    const runner = createRegexRunner({ workerFactory: () => { throw new Error('disabled') } })
    await expect(runner.run({ pattern: 'a', flags: '', text: 'a' })).rejects.toThrow('安全执行线程')
  })
})
