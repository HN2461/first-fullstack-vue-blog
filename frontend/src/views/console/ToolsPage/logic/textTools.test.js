import { describe, expect, it } from 'vitest'
import { convertTextCase, createSlug, generatePlaceholder, getTextStats, processTextLines, translateMorse } from './textTools'
import { MAX_STATS_TEXT_LENGTH, MAX_TOOL_TEXT_LENGTH } from './textLimits'

function stats(text) { return Object.fromEntries(getTextStats(text).map(({ label, value }) => [label, value])) }

describe('Unicode 文本统计', () => {
  it('分词前拒绝超过十万字符的输入，不先截断再假装完成统计', () => {
    expect(() => getTextStats('a'.repeat(MAX_STATS_TEXT_LENGTH + 1))).toThrow('100,000')
  })
  it('区分码点、组合字素和 UTF-8 字节，不把 emoji 代理对算成两个字符', () => {
    const result = stats('A😀e\u0301')
    expect(result['字符数（码点）']).toBe(4)
    expect(result['字素数（组合字符）']).toBe(3)
    expect(result['UTF-8 字节']).toBe(8)
    expect(stats('👨‍👩‍👧‍👦')['字素数（组合字符）']).toBe(1)
  })
  it('正确统计空文本、CRLF、独立 CR 与末尾空行', () => {
    expect(Object.values(stats(''))).toEqual([0, 0, 0, 0, 0, 0])
    expect(stats('a\r\nb\rc\n')['行数']).toBe(4)
    expect(stats('\n')['行数']).toBe(2)
    expect(stats('a\u2028b\u2029c')['行数']).toBe(3)
    expect(stats('Hello, world!')['词语数']).toBe(2)
    expect(stats(' a\t😀\n')['非空白字符']).toBe(2)
  })
})

describe('文本工具处理规模', () => {
  it('转换前拒绝超过 1 Mi 字符的输入，避免主线程处理无限量文本', () => {
    const oversized = 'a'.repeat(MAX_TOOL_TEXT_LENGTH + 1)
    expect(() => convertTextCase(oversized, 'upper')).toThrow('1,048,576')
    expect(() => processTextLines(oversized, 'sort')).toThrow('1,048,576')
    expect(() => createSlug(oversized)).toThrow('1,048,576')
    expect(() => translateMorse(oversized, 'encode')).toThrow('1,048,576')
    expect(convertTextCase('a'.repeat(MAX_TOOL_TEXT_LENGTH), 'upper')).toHaveLength(MAX_TOOL_TEXT_LENGTH)
  })
})

describe('大小写和命名格式', () => {
  it.each([
    ['camel', 'httpServerHelloWorld'],
    ['pascal', 'HttpServerHelloWorld'],
    ['snake', 'http_server_hello_world'],
    ['kebab', 'http-server-hello-world'],
    ['title', 'Http Server Hello World']
  ])('识别缩写、camelCase 和 PascalCase：%s', (mode, expected) => {
    expect(convertTextCase('HTTPServer helloWorld', mode)).toBe(expected)
  })
  it('保留大小写转换中的标点空白，识别 Unicode 词边界与数字', () => {
    expect(convertTextCase(' hi, 世界!\n', 'upper')).toBe(' HI, 世界!\n')
    expect(convertTextCase('USER_ID API2Response 中文', 'camel')).toBe('userIdApi2Response中文')
    expect(convertTextCase('', 'snake')).toBe('')
    expect(() => convertTextCase('a', 'invalid')).toThrow('格式')
  })
})

describe('文本行处理', () => {
  it('排序和反转保留空行与前后空格，不静默丢内容', () => {
    expect(processTextLines('b\n\na', 'sort')).toBe('\na\nb')
    expect(processTextLines('a\r\nb\rc\n', 'reverse')).toBe('\nc\nb\na')
    expect(processTextLines(' a\n a\na', 'unique')).toBe(' a\na')
  })
  it('只有明确清理模式修剪并移除空行', () => {
    expect(processTextLines(' a \r\n \r b\n', 'trim')).toBe('a\nb')
    expect(processTextLines('', 'unique')).toBe('')
    expect(() => processTextLines('a', 'invalid')).toThrow('操作')
  })
})

describe('Slug 生成', () => {
  it('保留中文，兼容全角和重音，去掉首尾与连续分隔符', () => {
    expect(createSlug(' -- Vue ３ 中文指南：Café -- ')).toBe('vue-3-中文指南-cafe')
    expect(createSlug('hello_world...name')).toBe('hello-world-name')
    expect(createSlug('한글 नमस्ते')).toBe('한글-नमस्ते')
    expect(createSlug('--- 😀 ---')).toBe('')
  })
  it('仅在明确启用时删除独立英文连接词', () => {
    expect(createSlug('A Guide to Vue and Node')).toBe('a-guide-to-vue-and-node')
    expect(createSlug('A Guide to Vue and Node', true)).toBe('guide-vue-node')
    expect(createSlug('theory android in-depth', true)).toBe('theory-android-depth')
  })
})

describe('摩斯电码', () => {
  it('按标准向量编码字母数字和标点，兼容多空格与换行单词边界', () => {
    expect(translateMorse('SOS 123', 'encode')).toBe('... --- ... / .---- ..--- ...--')
    expect(translateMorse('Hello,\nworld!', 'encode')).toBe('.... . .-.. .-.. --- --..-- / .-- --- .-. .-.. -.. -.-.--')
    expect(translateMorse('.... . .-.. .-.. ---/.-- --- .-. .-.. -..', 'decode')).toBe('HELLO WORLD')
    expect(translateMorse(translateMorse('A/B @ 2.0', 'encode'), 'decode')).toBe('A/B @ 2.0')
  })
  it('未知字符和未知电码明确失败，不回传伪装结果', () => {
    expect(() => translateMorse('你好', 'encode')).toThrow('不支持字符')
    expect(() => translateMorse('... ------', 'decode')).toThrow('无法识别电码')
    expect(() => translateMorse('toString', 'decode')).toThrow('无法识别电码')
    expect(() => translateMorse('/ ...', 'decode')).toThrow('分隔符')
    expect(translateMorse('', 'decode')).toBe('')
  })
})

describe('占位文本生成', () => {
  it('准确生成所需段数，随机源选择不同语料', () => {
    const first = generatePlaceholder('zh', 2, () => 0)
    const last = generatePlaceholder('zh', 2, () => 0.99)
    expect(first.split('\n\n')).toHaveLength(2)
    expect(last).not.toBe(first)
    expect(generatePlaceholder('en', 100, () => 0.5).split('\n\n')).toHaveLength(100)
  })
  it('代码占位是可解析代码，标识不重复且无数字列表前缀', () => {
    const code = generatePlaceholder('code', 3)
    expect(code.split('\n')).toHaveLength(3)
    expect(() => new Function(code)).not.toThrow()
  })
  it.each([null, '', '3', 0, -1, 1.5, 101, NaN, Infinity])('拒绝无效数量 %s', (count) => {
    expect(() => generatePlaceholder('zh', count)).toThrow('整数')
  })
  it('拒绝未知类型及越界随机源', () => {
    expect(() => generatePlaceholder('other', 2)).toThrow('类型')
    expect(() => generatePlaceholder('en', 2, () => 1)).toThrow('随机源')
  })
})
