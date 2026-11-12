import { onUnmounted } from 'vue'
import { Modal } from 'ant-design-vue'

/**
 * 将资源确认框绑定到当前页面生命周期，锁定、关闭或离开时可逐个销毁。
 * @returns {{confirmAction:Function,cancelConfirmations:Function}} 确认操作和本页面取消入口。
 * @throws {Error} 操作失败时保留确认框供重试，并向调用方透传异常。
 */
export function useMediaConfirm() {
  const pending = new Set()

  function cancelConfirmations() {
    for (const cancel of [...pending]) cancel()
  }

  function confirmAction(options) {
    return new Promise((resolve, reject) => {
      let active = true
      let dialog
      const finish = () => {
        active = false
        pending.delete(cancel)
      }
      const cancel = () => {
        if (!active) return
        finish()
        dialog?.destroy()
        resolve(false)
      }
      pending.add(cancel)
      dialog = Modal.confirm({
        okText: '确认', cancelText: '取消', centered: true,
        ...options,
        async onOk() {
          // 已销毁的确认框即使收到迟到事件，也不能再提交资源操作。
          if (!active) return false
          try {
            const result = await options.onOk?.()
            finish()
            resolve(result)
            return result
          } catch (error) {
            reject(error)
            throw error
          }
        },
        onCancel: cancel
      })
    })
  }

  onUnmounted(cancelConfirmations)
  return { confirmAction, cancelConfirmations }
}
