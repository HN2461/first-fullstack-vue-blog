<template>
  <div ref="host" :class="['tool-code-editor', { 'tool-code-editor--readonly': readonly }]" />
</template>

<script setup>
import { nextTick, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { basicSetup } from 'codemirror'
import { Compartment, EditorState, Transaction } from '@codemirror/state'
import { EditorView, keymap, placeholder as editorPlaceholder } from '@codemirror/view'
import { indentWithTab, redo as redoCommand, undo as undoCommand } from '@codemirror/commands'
import { foldAll as foldAllCommand, HighlightStyle, indentUnit, syntaxHighlighting, unfoldAll as unfoldAllCommand } from '@codemirror/language'
import { json } from '@codemirror/lang-json'
import { openSearchPanel, search } from '@codemirror/search'
import { setDiagnostics } from '@codemirror/lint'
import { tags } from '@lezer/highlight'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  language: { type: String, default: 'text' },
  readonly: { type: Boolean, default: false },
  wrap: { type: Boolean, default: true },
  indent: { type: String, default: '2' },
  diagnostic: { type: Object, default: null },
  maxLength: { type: Number, default: 3 * 1024 * 1024 }
})
const emit = defineEmits(['update:modelValue', 'limit', 'scroll', 'execute'])
const host = ref(null)
const configuration = new Compartment()
const themeMode = new Compartment()
let view = null
let themeObserver = null

const colors = HighlightStyle.define([
  { tag: tags.string, color: 'var(--tool-code-string)' },
  { tag: tags.number, color: 'var(--tool-code-number)' },
  { tag: [tags.bool, tags.null], color: 'var(--tool-code-keyword)' },
  { tag: tags.propertyName, color: 'var(--tool-code-property)' }
])

function editorConfiguration() {
  return [
    props.language === 'json' ? json() : [],
    props.wrap ? EditorView.lineWrapping : [],
    EditorState.readOnly.of(props.readonly),
    EditorView.editable.of(!props.readonly),
    EditorView.contentAttributes.of({ 'aria-label': props.label, spellcheck: 'false', tabindex: '0' }),
    editorPlaceholder(props.placeholder),
    indentUnit.of(props.indent === 'tab' ? '\t' : ' '.repeat(props.indent === '4' ? 4 : 2))
  ]
}

function updateDiagnostic() {
  if (!view) return
  const issue = props.diagnostic
  const offset = Math.min(view.state.doc.length, Math.max(0, issue?.offset || 0))
  view.dispatch(setDiagnostics(view.state, issue ? [{ from: offset, to: Math.min(view.state.doc.length, offset + 1), severity: 'error', message: issue.message }] : []))
}

function updateThemeMode() {
  view?.dispatch({ effects: themeMode.reconfigure(EditorView.theme({}, { dark: document.documentElement.classList.contains('dark-theme') })) })
}

onMounted(() => {
  view = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        search({ top: true }),
        EditorState.phrases.of({
          Find: '查找', Replace: '替换', next: '下一个', previous: '上一个', all: '全选匹配',
          'match case': '区分大小写', regexp: '正则', 'by word': '全词', replace: '替换', 'replace all': '全部替换',
          close: '关闭', 'Go to line': '跳转到行', go: '跳转', 'folded code': '已折叠内容'
        }),
        keymap.of([indentWithTab]),
        configuration.of(editorConfiguration()),
        themeMode.of(EditorView.theme({}, { dark: document.documentElement.classList.contains('dark-theme') })),
        syntaxHighlighting(colors),
        EditorState.transactionFilter.of((transaction) => {
          if (transaction.docChanged && !props.readonly && transaction.newDoc.length > props.maxLength) {
            emit('limit', `输入超过 ${Math.floor(props.maxLength / 1024 / 1024)} Mi 字符，请拆分后处理`)
            return []
          }
          return transaction
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !props.readonly) emit('update:modelValue', update.state.doc.toString())
        }),
        EditorView.domEventHandlers({
          scroll: () => emit('scroll'),
          keydown: (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.isComposing) {
              event.preventDefault()
              emit('execute')
              return true
            }
            return false
          }
        }),
        EditorView.theme({
          '&': { height: '100%', color: 'var(--console-text)', backgroundColor: 'var(--console-input-bg)', fontSize: '13px' },
          '&.cm-focused': { outline: 'none' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'Cascadia Code', Consolas, monospace", lineHeight: '1.65' },
          '.cm-content': { padding: '10px 0' },
          '.cm-gutters': { color: 'var(--console-text-secondary)', backgroundColor: 'var(--console-surface-muted)', borderRight: '1px solid var(--console-border)' },
          '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--console-primary-soft)' },
          '.cm-cursor': { borderLeftColor: 'var(--console-text)' },
          '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--console-primary-soft)' },
          '.cm-panels, .cm-tooltip': { color: 'var(--console-text)', backgroundColor: 'var(--console-surface)' },
          // 查找面板浮在编辑区右上角，不再挤压底部或改变两列编辑区高度。
          '.cm-panels-top': { position: 'absolute', zIndex: '20', top: '4px', right: '4px', left: 'auto', width: 'min(460px, calc(100% - 8px))', border: '1px solid var(--console-border)', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,.08)' },
          '.cm-search': { position: 'relative', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', padding: '8px 28px 8px 8px', fontSize: '12px' },
          '.cm-search input[name="search"], .cm-search input[name="replace"]': { flex: '1 1 140px', width: '140px', minWidth: '80px', height: '26px', padding: '2px 6px', boxSizing: 'border-box' },
          '.cm-search button': { minHeight: '26px', padding: '2px 6px', lineHeight: '20px' },
          '.cm-search label': { display: 'inline-flex', alignItems: 'center', gap: '3px', margin: '0', whiteSpace: 'nowrap' },
          '.cm-search br': { display: 'block', flexBasis: '100%', height: '0' },
          '.cm-search button[name="close"]': { position: 'absolute', top: '3px', right: '3px', width: '22px', minHeight: '22px', height: '22px', padding: '0', border: '0' },
          '.cm-textfield, .cm-button': { color: 'var(--console-text)', background: 'var(--console-input-bg)', border: '1px solid var(--console-border)', borderRadius: '4px', fontSize: '12px' },
          '.cm-foldPlaceholder': { color: 'var(--console-text-secondary)', backgroundColor: 'var(--console-surface-muted)', borderColor: 'var(--console-border)' }
        })
      ]
    })
  })
  updateDiagnostic()
  // dark facet 也要跟随站点主题，查找、提示等未单独覆写的编辑器基础样式才能保持一致。
  themeObserver = new MutationObserver(updateThemeMode)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

watch(() => props.modelValue, (value) => {
  if (!view || view.state.doc.toString() === value) return
  // 外部载入、交换保留输入的撤销能力；只读结果的替换不需要保存编辑历史。
  // 上层负责文件和转换尺寸校验；外部替换必须与模型一致，不能被粘贴限制静默吞掉。
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value }, annotations: Transaction.addToHistory.of(!props.readonly), filter: false })
})
watch(() => [props.language, props.readonly, props.wrap, props.indent, props.placeholder, props.label], () => {
  view?.dispatch({ effects: configuration.reconfigure(editorConfiguration()) })
})
watch(() => props.diagnostic, updateDiagnostic)
onActivated(() => nextTick(() => {
  updateThemeMode()
  view?.requestMeasure()
}))
onBeforeUnmount(() => {
  themeObserver?.disconnect()
  view?.destroy()
  view = null
})

function runCommand(command) {
  if (!view) return
  view.focus()
  command(view)
}

defineExpose({
  focus: () => view?.focus(),
  search: () => runCommand(openSearchPanel),
  undo: () => runCommand(undoCommand),
  redo: () => runCommand(redoCommand),
  foldAll: () => runCommand(foldAllCommand),
  unfoldAll: () => runCommand(unfoldAllCommand),
  measure: () => view?.requestMeasure(),
  reveal: (offset) => {
    if (!view) return
    view.dispatch({ selection: { anchor: Math.max(0, Math.min(view.state.doc.length, offset || 0)) }, scrollIntoView: true })
    view.focus()
  },
  getScroll: () => view ? { top: view.scrollDOM.scrollTop, maximum: view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight } : null,
  setScrollRatio: (ratio) => { if (view) view.scrollDOM.scrollTop = ratio * Math.max(0, view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight) }
})
</script>

<style scoped>
.tool-code-editor { --tool-code-string: #2f6b3b; --tool-code-number: #99511b; --tool-code-keyword: #763c9a; --tool-code-property: #1555a3; flex: 1; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; border: 1px solid var(--console-border-strong, var(--console-border)); border-radius: 6px; }
.tool-code-editor:focus-within { border-color: var(--console-primary); }
:global(.dark-theme) .tool-code-editor { --tool-code-string: #9dcc9a; --tool-code-number: #f4ba8a; --tool-code-keyword: #d9b4ff; --tool-code-property: #a4c7ff; }
</style>
