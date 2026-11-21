import { describe, expect, it } from 'vitest'
import { convertColor } from './colorConversion'
import { convertInteger } from './numberBase'
import { parseDelimitedText, tableToMarkdown, tableToObjects } from './delimitedText'
import { generateQuery, parseQuery } from './queryString'
import { convertHtmlEntities } from './htmlEntities'

describe('颜色转换', () => {
  it.each([
    ['#1677ff', '#1677ff'], ['1677ff', '#1677ff'], ['#abc', '#aabbcc'], ['#abc8', '#aabbcc88'],
    ['#11223344', '#11223344'], ['rgb(22, 119, 255)', '#1677ff'], ['rgb(100% 0% 0% / 50%)', '#ff000080'],
    ['rgba(255, 0, 0, .5)', '#ff000080'], ['hsl(120, 100%, 50%)', '#00ff00'],
    ['hsla(240, 100%, 50%, 0)', '#0000ff00'], ['hsl(-120deg 100% 50%)', '#0000ff'],
    ['hsl(.5turn 100% 50%)', '#00ffff'], ['hsl(200grad 100% 50%)', '#00ffff'],
    ['hsl(3.141592653589793rad 100% 50%)', '#00ffff'], ['rgb(0,0,0)', '#000000'], ['hsl(0 0% 100%)', '#ffffff']
  ])('将 %s 转为 %s', (input, expected) => {
    expect(convertColor(input).hex).toBe(expected)
  })

  it('将 RGB 真正转换为 HSL，并保持透明度', () => {
    expect(convertColor('rgba(255, 0, 0, 0.5)')).toEqual({ hex: '#ff000080', rgb: 'rgba(255, 0, 0, 0.5)', hsl: 'hsla(0, 100%, 50%, 0.5)' })
    const original = convertColor('#1677ff80')
    expect(convertColor(original.hsl).hex).toBe(original.hex)
    expect(convertColor(original.rgb).hex).toBe(original.hex)
  })

  it('多个色相、明度与透明度的 HEX 经 HSL 转换后可还原', () => {
    for (let index = 0; index < 256; index += 1) {
      const hex = `#${[index, 255 - index, (index * 37) % 256, index].map((value) => value.toString(16).padStart(2, '0')).join('')}`
      expect(convertColor(convertColor(hex).hsl).hex).toBe(convertColor(hex).hex)
    }
  })

  it.each(['', '#12', '#abcdefg', 'rgb(1,2,3', 'rgb(1,2,3)garbage', 'rgb(256,0,0)', 'rgb(-1 0 0)', 'rgba(0,0,0,1.1)', 'rgb(1 2 3 .5)', 'rgb(10%,20,30%)', 'hsl(0,50,50)', 'hsl(0,101%,50%)', 'hsl(NaN 0% 0%)', 'hsl(1e308turn 50% 50%)'])('拒绝无效颜色 %s', (input) => {
    expect(() => convertColor(input)).toThrow()
  })
})

describe('无精度损失的整数进制', () => {
  it('完整转换超过安全 Number 范围的大整数', () => {
    expect(convertInteger('9007199254740993', 10)).toEqual({ binary: '100000000000000000000000000000000000000000000000000001', octal: '400000000000000001', decimal: '9007199254740993', hex: '20000000000001' })
  })

  it.each([['-0xFF', 16, '-255'], ['+0b101', 2, '5'], ['0o377', 8, '255'], ['-0', 10, '0'], ['00025', 10, '25']])('接受整串 %s', (input, base, expected) => {
    expect(convertInteger(input, base).decimal).toBe(expected)
  })

  it.each([['102', 2], ['78', 8], ['12abc', 10], ['FFjunk', 16], ['1.2', 10], ['1e3', 10], ['0xFF', 10], ['1 0', 2], ['+', 10], ['', 10]])('拒绝截断式输入 %s', (input, base) => {
    expect(() => convertInteger(input, base)).toThrow()
  })
})

describe('CSV/TSV 结构和数据保真', () => {
  it('读取 RFC4180 逗号、CRLF、字段换行和双引号转义', () => {
    const input = 'name,note\r\n"小明","逗号,双引号""与\r\n换行"\r\n'
    expect(tableToObjects(input)).toEqual([{ name: '小明', note: '逗号,双引号"与\r\n换行' }])
  })

  it('识别 TSV 并保留值两端空白、空字符串及 BOM', () => {
    expect(tableToObjects('\uFEFFname\tvalue\n小明\t 保留空白 \n小红\t')).toEqual([{ name: '小明', value: ' 保留空白 ' }, { name: '小红', value: '' }])
  })

  it('默认保留前导零、大整数和普通数字字符串', () => {
    expect(tableToObjects('id,code,age\n9007199254740993,00123,18')).toEqual([{ id: '9007199254740993', code: '00123', age: '18' }])
  })

  it('显式识别也只转换安全数字', () => {
    expect(tableToObjects('id,code,age,amount,sign\n9007199254740993,00123,18,1.25,-0', true)).toEqual([{ id: '9007199254740993', code: '00123', age: 18, amount: 1.25, sign: '-0' }])
  })

  it('数字识别不会吞掉下溢小数或舍去高精度小数尾数', () => {
    expect(tableToObjects('tiny,decimal,negativeZero,scientific\n1e-9999,1.0000000000000001,-0.0,12345678901234567e-1', true)).toEqual([{ tiny: '1e-9999', decimal: '1.0000000000000001', negativeZero: '-0.0', scientific: '12345678901234567e-1' }])
  })

  it.each(['name,name\nx,y', ' name ,name\nx,y', 'name,\nx,y', ' ,age\nx,1', 'name,age\nx', 'name\nx,y', 'name\n"unterminated', 'name\nfoo"bar', 'name\n"foo"bar', ''])('拒绝有丢失风险的表格 %s', (input) => {
    expect(() => tableToObjects(input)).toThrow()
  })

  it('允许只有表头和单列表格，跳过真正空行', () => {
    expect(tableToObjects('name')).toEqual([])
    expect(parseDelimitedText('name\n\n""\nvalue\n')).toEqual([['name'], [''], ['value']])
  })

  it('字段名 __proto__ 作为普通数据保留', () => {
    const [row] = tableToObjects('__proto__,constructor\nsafe,value')
    expect(Object.hasOwn(row, '__proto__')).toBe(true)
    expect(row.__proto__).toBe('safe')
    expect(Object.getPrototypeOf(row)).toBe(Object.prototype)
  })

  it('先拒绝超过字符预算的 CSV 和 Markdown 输入', () => {
    const oversized = 'x'.repeat(1024 * 1024 + 1)
    expect(() => tableToObjects(oversized)).toThrow('1 Mi')
    expect(() => tableToMarkdown(oversized)).toThrow('1 Mi')
  })

  it('允许最多 10000 条数据，超过后明确报错', () => {
    expect(tableToObjects(`name\n${'x\n'.repeat(10000)}`)).toHaveLength(10000)
    expect(() => tableToObjects(`name\n${'x\n'.repeat(10001)}`)).toThrow('10000')
  })

  it('允许最多 1000 列，CSV 和 Markdown 都拒绝超限列数', () => {
    const headers = Array.from({ length: 1000 }, (_, index) => `column${index}`).join(',')
    expect(tableToObjects(`${headers}\n${Array(1000).fill('x').join(',')}`)[0]).toHaveProperty('column999', 'x')
    expect(() => tableToObjects(`${headers},extra`)).toThrow('1000 列')
    expect(() => tableToMarkdown(`${headers},extra`)).toThrow('1000 列')
  })
})

describe('Markdown 表格', () => {
  it('转义竖线、反斜杠与 HTML，并保留引号内换行', () => {
    const markdown = tableToMarkdown('name,note\nA,"a|b\\c\n<script>"')
    expect(markdown).toBe('| name | note |\n| --- | --- |\n| A | a\\|b\\\\c<br>&lt;script&gt; |')
  })

  it('保留尾部空单元格，不截断多余列', () => {
    expect(tableToMarkdown('A\tB\nx\t')).toBe('| A | B |\n| --- | --- |\n| x |  |')
    expect(() => tableToMarkdown('A,B\nx,y,z')).toThrow('列')
  })
})

describe('查询参数', () => {
  it('从完整 URL 提取重复参数、空值、加号和片段前内容', () => {
    expect(parseQuery('https://example.com/path?a=1&a=2&empty=&q=hello+world#ignored?x=1')).toEqual([{ key: 'a', value: '1' }, { key: 'a', value: '2' }, { key: 'empty', value: '' }, { key: 'q', value: 'hello world' }])
  })

  it.each(['https://example.com/path#fragment?fake=1', '/path#fragment?fake=1', '?', '#fragment'])('没有查询部分的 %s 不误认参数', (input) => {
    expect(parseQuery(input)).toEqual([])
  })

  it('保留值里的问号、等号、井号、加号和换行', () => {
    expect(parseQuery('?x=a?b=c&hash=%23&plus=%2B&line=a%0Ab')).toEqual([{ key: 'x', value: 'a?b=c' }, { key: 'hash', value: '#' }, { key: 'plus', value: '+' }, { key: 'line', value: 'a\nb' }])
    expect(parseQuery('x=a?b=c#fragment')).toEqual([{ key: 'x', value: 'a?b=c' }])
  })

  it('原始参数键里的冒号不误判为 URL 协议', () => {
    expect(parseQuery('filter:name=Vue')).toEqual([{ key: 'filter:name', value: 'Vue' }])
  })

  it('原始查询串保留参数名和值首尾的空格', () => {
    expect(parseQuery('a= x ')).toEqual([{ key: 'a', value: ' x ' }])
    expect(parseQuery(' a = x ')).toEqual([{ key: ' a ', value: ' x ' }])
    expect(parseQuery('?a= x ')).toEqual([{ key: 'a', value: ' x ' }])
  })

  it('生成时保留重复参数、等号与两端空格', () => {
    const query = generateQuery('a=1\na=2\nempty=\nq= x=y \n=value')
    expect(parseQuery(query)).toEqual([{ key: 'a', value: '1' }, { key: 'a', value: '2' }, { key: 'empty', value: '' }, { key: 'q', value: ' x=y ' }, { key: '', value: 'value' }])
  })

  it.each(['', 'https://', '?a=%ZZ', '?a=%E4%B8'])('拒绝错误编码或地址 %s', (input) => {
    expect(() => parseQuery(input)).toThrow()
  })

  it('生成时明确报告缺少等号的行', () => {
    expect(() => generateQuery('a=1\nbroken')).toThrow('第 2 行')
    expect(() => generateQuery('a=\uD800')).toThrow('Unicode')
  })

  it('解析与生成都在处理前拒绝超长文本', () => {
    const oversized = 'x'.repeat(1024 * 1024 + 1)
    expect(() => parseQuery(oversized)).toThrow('1 Mi')
    expect(() => generateQuery(oversized)).toThrow('1 Mi')
  })

  it('最多处理 10000 个参数，超过时不分配全部结果', () => {
    const query = Array(10000).fill('a=1').join('&')
    expect(parseQuery(query)).toHaveLength(10000)
    expect(() => parseQuery(`${query}&a=1`)).toThrow('10000')
    expect(() => generateQuery(Array(10001).fill('a=1').join('\n'))).toThrow('10000')
  })
})

describe('安全 HTML 实体', () => {
  it('转义全部特殊字符但保留可读中文', () => {
    expect(convertHtmlEntities('<p>中文 "a" & \'b\'</p>', 'encode')).toBe('&lt;p&gt;中文 &quot;a&quot; &amp; &apos;b&apos;&lt;/p&gt;')
  })

  it('完整解码命名实体、数字实体、emoji，未知实体保留', () => {
    expect(convertHtmlEntities('&NotEqualTilde;&#x1F600;&#20013;&unknown;', 'decode')).toBe('≂̸😀中&unknown;')
  })

  it('只返回文本，不创建 DOM 或执行解码后的 HTML', () => {
    const source = '<img src=x onerror="globalThis.executed=true"><script>globalThis.executed=true</script>'
    expect(convertHtmlEntities(convertHtmlEntities(source, 'encode'), 'decode')).toBe(source)
    expect(globalThis.executed).toBeUndefined()
  })

  it('空内容正常返回，非法模式被拒绝', () => {
    expect(convertHtmlEntities('', 'decode')).toBe('')
    expect(() => convertHtmlEntities('x', 'other')).toThrow()
  })

  it('编码和解码都拒绝超过 1 Mi 字符的输入', () => {
    const oversized = 'x'.repeat(1024 * 1024 + 1)
    expect(() => convertHtmlEntities(oversized, 'encode')).toThrow('1 Mi')
    expect(() => convertHtmlEntities(oversized, 'decode')).toThrow('1 Mi')
  })
})
