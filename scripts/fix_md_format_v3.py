# -*- coding: utf-8 -*-
"""
优化 html+css笔记.md 的格式（V3 - 最终版本）

从原始数据库内容重新处理，修复所有已知问题：
1. 移除 <font> 标签
2. 清理空加粗标记（不跨行匹配）
3. 移除 HTML 注释标记（围栏外部）
4. 自动检测并围栏代码
5. 转换 // 注释为 <!-- -->（包括已有围栏内）
6. 清理代码块内的 ** 标记
7. 标题转换（长度限制）
8. 压缩空行（最多 1 个连续空行）
"""
import re

original_path = r'c:\Users\Administrator\Desktop\全栈\output\html+css笔记_original.md'
output_path = r'c:\Users\Administrator\Desktop\全栈\output\html+css笔记.md'

with open(original_path, 'r', encoding='utf-8') as f:
    content = f.read()

front_matter = """---
title: "html+css笔记"
slug: "javascriptes6-html-css-ea679145-revision-20260630"
summary: ""
category: "青鸟版三剑客"
tags: []
status: "draft"
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0d8"
originalSlug: "javascriptes6-html-css-ea679145"
exportedAt: "2026-06-30T07:50:16.696Z"
---
"""

# ============================================================
# Step 1: 移除 <font> 标签
# ============================================================
content = re.sub(r'<font\s+style="color:[^"]*;">', '', content)
content = re.sub(r'</font>', '', content)

# ============================================================
# Step 2: 清理空加粗标记（仅匹配同行空格，不跨行）
# ============================================================
content = re.sub(r'\*\*[ \t]*\*\*', '', content)

# ============================================================
# Step 3: 逐行处理
# ============================================================
lines = content.split('\n')
output = []
in_fenced = False
code_buffer = []
in_code = False
non_code_streak = 0

html_tag_re = re.compile(r'</?[a-zA-Z][a-zA-Z0-9]*')


def looks_like_code(line):
    # 先移除 ** 标记再检查
    check = re.sub(r'\*\*', '', line).strip()
    if not check:
        return False
    # 包含 HTML 标签
    if html_tag_re.search(check):
        return True
    # CSS 大括号
    if '{' in check or check == '}':
        return True
    # CSS 属性（带分号）
    if re.search(r'[a-z-]+\s*:\s*[^;]+;', check):
        return True
    # // 注释
    if '//' in check:
        return True
    # CSS 注释
    if '/*' in check or '*/' in check:
        return True
    # @ 规则 / Less 变量
    if check.startswith('@'):
        return True
    # CSS 选择器
    if re.match(r'^[.#&][\w-]+', check):
        return True
    return False


def is_pure_text(line):
    stripped = line.strip()
    if not stripped:
        return False
    if looks_like_code(line):
        return False
    if re.search(r'[\u4e00-\u9fff]', stripped):
        return True
    return False


def is_heading(line):
    stripped = line.strip()
    if not re.match(r'^\*\*[^*]+\*\*$', stripped):
        return False
    inner = stripped[2:-2].strip()
    if not inner:
        return False
    if inner[0].isdigit():
        return False
    if '。' in inner:
        return False
    if '，' in inner:
        return False
    if len(inner) > 40:
        return False
    # 排除代码行
    if inner.startswith('//'):
        return False
    if inner.startswith('@'):
        return False
    if inner.startswith('.') or inner.startswith('#'):
        return False
    if ';' in inner:
        return False
    if '{' in inner or '}' in inner:
        return False
    # 排除 CSS 属性模式 word: value
    if re.match(r'^[a-z-]+\s*:', inner):
        return False
    return True


def is_text_signal(line):
    stripped = line.strip()
    if not stripped:
        return False
    if is_heading(line):
        return True
    if re.match(r'^\*\*\d', stripped):
        return True
    if re.match(r'^\d+[、.）)]\s', stripped):
        return True
    if is_pure_text(line) and len(stripped) > 15:
        return True
    if len(stripped) > 80 and not looks_like_code(line):
        return True
    return False


def clean_code_line(line):
    """清理代码行：移除 ** 标记"""
    return re.sub(r'\*\*', '', line)


def convert_slash_comments(line):
    """将 // 注释转换为 <!-- --> 注释"""
    # 不处理包含 URL 的行
    if 'https://' in line or 'http://' in line:
        # 只处理行首的 //（不处理 URL 中的 //）
        m = re.match(r'^(\s*)//(.*)$', line)
        if m:
            return f'{m.group(1)}<!-- {m.group(2).strip()} -->'
        return line

    # 行首 // 注释
    m = re.match(r'^(\s*)//(.*)$', line)
    if m:
        return f'{m.group(1)}<!-- {m.group(2).strip()} -->'

    # > 后面的 // 注释（HTML 标签后的注释）
    line = re.sub(r'>(\s*)//(.+?)(\s*$)', r'>\1<!-- \2 -->\3', line)

    return line


def process_fenced_line(line):
    """处理已有围栏代码块内的行"""
    line = clean_code_line(line)
    line = convert_slash_comments(line)
    return line


def flush_code(buf, out):
    """将缓冲区中的代码行用围栏包裹后输出"""
    while buf and not buf[-1].strip():
        buf.pop()
    while buf and not buf[0].strip():
        buf.pop(0)
    if not buf:
        return
    cleaned = []
    for line in buf:
        line = clean_code_line(line)
        line = convert_slash_comments(line)
        cleaned.append(line)
    out.append('```html')
    out.extend(cleaned)
    out.append('```')
    buf.clear()


# 逐行处理
for line in lines:
    stripped = line.strip()

    # ---- 处理已围栏代码块 ----
    if stripped.startswith('```'):
        if in_code:
            flush_code(code_buffer, output)
            in_code = False
        in_fenced = not in_fenced
        output.append(line)
        continue

    if in_fenced:
        # 处理已有围栏内的行：清理 ** 和转换 //
        output.append(process_fenced_line(line))
        continue

    # ---- 移除 HTML 注释标记（仅限围栏外部）----
    if '<!--' in line:
        line = line.replace('<!--', '')
    if '-->' in line:
        line = line.replace('-->', '')
    stripped = line.strip()

    if not stripped:
        if in_code:
            code_buffer.append(line)
        else:
            output.append(line)
        continue

    # ---- 处理标题 ----
    if is_heading(line):
        if in_code:
            flush_code(code_buffer, output)
            in_code = False
        inner = stripped[2:-2].strip()
        if '<' in inner:
            inner = re.sub(
                r'</?[a-zA-Z][a-zA-Z0-9]*[^>]*>',
                lambda m: f'`{m.group()}`',
                inner
            )
        output.append(f'## {inner}')
        continue

    # ---- 代码检测 ----
    if looks_like_code(line):
        non_code_streak = 0
        if not in_code:
            in_code = True
        code_buffer.append(line)
    elif is_text_signal(line):
        if in_code:
            flush_code(code_buffer, output)
            in_code = False
        output.append(line)
    else:
        if in_code:
            if len(stripped) < 40 and not is_pure_text(line):
                non_code_streak += 1
                if non_code_streak > 3:
                    flush_code(code_buffer, output)
                    in_code = False
                    output.append(line)
                else:
                    code_buffer.append(line)
            else:
                flush_code(code_buffer, output)
                in_code = False
                output.append(line)
        else:
            output.append(line)

if in_code:
    flush_code(code_buffer, output)

content = '\n'.join(output)

# ============================================================
# Step 4: 压缩连续空行（最多 1 个空行）
# ============================================================
content = re.sub(r'\n{3,}', '\n\n', content)

# ============================================================
# Step 5: 清理行尾空格
# ============================================================
content = re.sub(r'[ \t]+\n', '\n', content)

# ============================================================
# Step 6: 清理代码块开头和结尾的空行
# ============================================================
content = re.sub(r'```\n\n+', '```\n', content)
content = re.sub(r'\n\n+```', '\n```', content)

# ============================================================
# Step 7: 添加 front matter
# ============================================================
content = front_matter + content
content = content.rstrip() + '\n'

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Done! Output: {len(content)} chars, {content.count(chr(10))} lines')
