import { describe, expect, it, vi } from 'vitest'
import { useMediaConfirm } from './useMediaConfirm'

const fixture = vi.hoisted(() => ({ options: null, destroy: vi.fn(), unmounted: null }))
vi.mock('vue', () => ({ onUnmounted: (callback) => { fixture.unmounted = callback } }))
vi.mock('ant-design-vue', () => ({ Modal: { confirm: (options) => {
  fixture.options = options
  return { destroy: fixture.destroy }
} } }))

describe('资源确认框生命周期', () => {
  it('锁定或页面卸载销毁所属确认框，迟到确认事件不能执行操作', async () => {
    const action = vi.fn()
    const confirmations = useMediaConfirm()
    const result = confirmations.confirmAction({ title: '敏感文件', onOk: action })
    fixture.unmounted()
    await expect(result).resolves.toBe(false)
    expect(fixture.destroy).toHaveBeenCalled()
    await fixture.options.onOk()
    expect(action).not.toHaveBeenCalled()
  })

  it('正常确认等待操作结束并返回结果', async () => {
    const confirmations = useMediaConfirm()
    const result = confirmations.confirmAction({ onOk: async () => 'done' })
    await fixture.options.onOk()
    await expect(result).resolves.toBe('done')
    confirmations.cancelConfirmations()
  })
})
