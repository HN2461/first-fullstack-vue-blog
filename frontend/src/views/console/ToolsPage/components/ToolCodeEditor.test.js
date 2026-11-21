// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { foldedRanges, forceParsing } from '@codemirror/language'
import { diagnosticCount, forEachDiagnostic } from '@codemirror/lint'
import ToolCodeEditor from './ToolCodeEditor.vue'

const mounted = new Set()

beforeAll(() => {
  // jsdom 不计算页面几何信息；只补布局接口，编辑器、事务与命令均使用真实 CodeMirror。
  const rectangle = () => new DOMRect(0, 0, 0, 0)
  if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = rectangle
  if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => []
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
  if (!HTMLElement.prototype.scrollTo) HTMLElement.prototype.scrollTo = function ({ top = 0, left = 0 } = {}) { this.scrollTop = top; this.scrollLeft = left }
})

afterEach(async () => {
  for (const editor of mounted) editor.unmount()
  document.documentElement.classList.remove('dark-theme')
  await nextTick()
  vi.restoreAllMocks()
})

function mountEditor(initial = {}) {
  const state = reactive({ modelValue: '', label: '测试编辑器', language: 'json', ...initial })
  const component = ref(null)
  const changes = []
  const limits = []
  const errors = []
  const element = document.createElement('div')
  document.body.appendChild(element)
  const app = createApp(defineComponent({
    setup: () => () => h(ToolCodeEditor, {
      ...state,
      ref: component,
      'onUpdate:modelValue': (value) => { changes.push(value); state.modelValue = value },
      onLimit: (message) => limits.push(message)
    })
  }))
  app.config.errorHandler = (error) => errors.push(error)
  app.mount(element)
  const view = EditorView.findFromDOM(element.querySelector('.cm-editor'))
  let disposed = false
  const editor = {
    state, component, view, element, changes, limits, errors,
    unmount() {
      if (disposed) return
      disposed = true
      app.unmount()
      element.remove()
      mounted.delete(editor)
    }
  }
  mounted.add(editor)
  return editor
}

async function flushUpdates() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('ToolCodeEditor 真实编辑器集成', () => {
  it('没有诊断信息也可完整挂载，初始文本、可访问名称与诊断状态正确', () => {
    const editor = mountEditor({ modelValue: '{"name":"中文😀"}' })
    expect(editor.errors).toEqual([])
    expect(editor.view).toBeInstanceOf(EditorView)
    expect(editor.view.state.doc.toString()).toBe('{"name":"中文😀"}')
    expect(editor.view.contentDOM.getAttribute('aria-label')).toBe('测试编辑器')
    expect(diagnosticCount(editor.view.state)).toBe(0)
  })

  it('外部替换不会被输入长度过滤吞掉，撤销与重做同步回父模型', async () => {
    const editor = mountEditor({ modelValue: 'old', maxLength: 4, language: 'text' })
    editor.state.modelValue = 'a longer external replacement'
    await flushUpdates()
    expect(editor.view.state.doc.toString()).toBe(editor.state.modelValue)
    expect(editor.limits).toEqual([])
    editor.component.value.undo()
    await flushUpdates()
    expect(editor.view.state.doc.toString()).toBe('old')
    expect(editor.state.modelValue).toBe('old')
    expect(editor.changes.at(-1)).toBe('old')
    editor.component.value.redo()
    await flushUpdates()
    expect(editor.state.modelValue).toBe('a longer external replacement')
    expect(editor.view.state.doc.toString()).toBe(editor.state.modelValue)
  })

  it('用户编辑同步回父模型，超限的用户输入保留原文并明确反馈', async () => {
    const editor = mountEditor({ modelValue: 'a', maxLength: 4, language: 'text' })
    editor.view.dispatch({ changes: { from: 1, insert: 'bc' } })
    await flushUpdates()
    expect(editor.state.modelValue).toBe('abc')
    editor.view.dispatch({ changes: { from: 3, insert: 'de' } })
    await flushUpdates()
    expect(editor.view.state.doc.toString()).toBe('abc')
    expect(editor.state.modelValue).toBe('abc')
    expect(editor.limits).toHaveLength(1)
  })

  it('只读结果无法编辑，外部结果替换不反向触发父输入更新', async () => {
    const editor = mountEditor({ modelValue: 'result', readonly: true, language: 'text' })
    expect(editor.view.state.facet(EditorState.readOnly)).toBe(true)
    expect(editor.view.state.facet(EditorView.editable)).toBe(false)
    expect(editor.view.contentDOM.getAttribute('contenteditable')).toBe('false')
    editor.state.modelValue = 'updated result'
    await flushUpdates()
    expect(editor.view.state.doc.toString()).toBe('updated result')
    expect(editor.changes).toEqual([])
    editor.state.readonly = false
    await flushUpdates()
    expect(editor.view.contentDOM.getAttribute('contenteditable')).toBe('true')
  })

  it('更新、定位与清除诊断使用真实 lint 状态和文本选择', async () => {
    const editor = mountEditor({ modelValue: '{\n  "name": true\n}' })
    editor.state.diagnostic = { offset: 12, message: '此处需要逗号' }
    await flushUpdates()
    expect(editor.errors).toEqual([])
    const diagnostics = []
    forEachDiagnostic(editor.view.state, (issue, from, to) => diagnostics.push({ message: issue.message, from, to }))
    expect(diagnostics).toEqual([{ message: '此处需要逗号', from: 12, to: 13 }])
    editor.component.value.reveal(12)
    expect(editor.view.state.selection.main.head).toBe(12)
    editor.state.diagnostic = null
    await flushUpdates()
    expect(diagnosticCount(editor.view.state)).toBe(0)
  })

  it('中文查找面板位于顶部浮层，不产生底部面板', () => {
    const editor = mountEditor({ modelValue: '{"value":"find me"}' })
    editor.component.value.search()
    const panel = editor.element.querySelector('.cm-panels-top')
    expect(panel).not.toBeNull()
    expect(editor.element.querySelector('.cm-panels-bottom')).toBeNull()
    expect(panel.querySelector('input[name="search"]').getAttribute('placeholder')).toBe('查找')
    expect(panel.querySelector('button[name="next"]').textContent).toBe('下一个')
    expect(panel.querySelector('button[name="prev"]').textContent).toBe('上一个')
    expect(panel.querySelector('button[name="close"]').getAttribute('aria-label')).toBe('关闭')
    expect(getComputedStyle(panel).position).toBe('absolute')
  })

  it('真实 JSON 语法树支持折叠与展开，原始文档不改变', () => {
    const input = '{\n  "nested": {\n    "enabled": true\n  },\n  "items": [1, 2]\n}'
    const editor = mountEditor({ modelValue: input })
    expect(forceParsing(editor.view, editor.view.state.doc.length, 200)).toBe(true)
    editor.component.value.foldAll()
    expect(foldedRanges(editor.view.state).size).toBeGreaterThan(0)
    editor.component.value.unfoldAll()
    expect(foldedRanges(editor.view.state).size).toBe(0)
    expect(editor.view.state.doc.toString()).toBe(input)
  })

  it('站点主题变化更新 CodeMirror dark facet，切回浅色也同步', async () => {
    const editor = mountEditor({ modelValue: '{}' })
    expect(editor.view.state.facet(EditorView.darkTheme)).toBe(false)
    document.documentElement.classList.add('dark-theme')
    await flushUpdates()
    expect(editor.view.state.facet(EditorView.darkTheme)).toBe(true)
    document.documentElement.classList.remove('dark-theme')
    await flushUpdates()
    expect(editor.view.state.facet(EditorView.darkTheme)).toBe(false)
  })

  it('卸载销毁编辑器并断开主题监听，之后不再派发更新', async () => {
    const editor = mountEditor({ modelValue: '{}' })
    const destroy = vi.spyOn(editor.view, 'destroy')
    const dispatch = vi.spyOn(editor.view, 'dispatch')
    editor.unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(editor.element.isConnected).toBe(false)
    dispatch.mockClear()
    document.documentElement.classList.add('dark-theme')
    await flushUpdates()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
