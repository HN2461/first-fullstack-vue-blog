# MaxKB 导出包解析与半自动改包规则

> 文档状态（2026-07-09）：本文沉淀 MaxKB `.mk` 导出包解析、有限修改、重新打包和巡检规则。本文是公共工程规则，适用于后续任意 MaxKB 智能体，不记录某个具体智能体的业务链路。

> 官方边界（2026-07-19 核验）：高级智能体 `.mk` 导出包含工作流节点参数和函数内容，但所选择的知识库和模型信息不导出。导入后必须重新绑定并调试相关资源。官方依据：[智能体概述 - 导出/导入](https://maxkb.cn/docs/v2/user_manual/app/app/#48)

## 1. 核心结论

MaxKB `.mk` 导出包可以用于“从已有可运行智能体出发”的半自动开发，但不能把它当成公开稳定的 JSON 模板。

当前推荐能力边界：

```text
可以做：
1. 读取已有 .mk 导出包，梳理应用信息、节点、连线、工具、回复内容和 AI 提示词。
2. 基于一个已导入、已运行正常的包，复制出新包。
3. 有限修改应用名称、描述、开场白、指定回复文案、HTML 样式、展示型 AI 提示词。
4. 在明确结构和回滚方案时，修正少量已知分支、执行条件或孤立节点问题。
5. 生成巡检报告，确认没有误改模型参数、工具入参、变量拆分、判断条件和连线。
```

```text
谨慎做：
1. 新增节点。
2. 删除节点。
3. 改判断器条件。
4. 改工具绑定。
5. 改变量赋值。
6. 改 AI 模型参数。
7. 改多入口节点执行条件。
```

```text
不建议直接做：
1. 从零伪造完整 .mk。
2. 在没有可运行基线的情况下批量生成复杂智能体。
3. 不做巡检就把重打包文件当正式版导入。
4. 从旧试验包继续改，覆盖用户已经验证过的新包。
5. 对未知 MaxKB 版本或未知节点结构强行猜字段。
```

一句话原则：

```text
从可运行导出包出发，小步修改，完整巡检；功能链路不确定时宁愿只给搭建手册，不硬造导入包。
```

## 2. `.mk` 基本格式认知

已确认 MaxKB v2 应用导出包通常是 Python pickle 序列化结构，不是普通 JSON、zip 或 YAML。

常见顶层结构：

```text
MKInstance
  application
    name
    desc
    prologue
    work_flow
      nodes
      edges
  tool_list
  function_lib_list
  version
```

节点常见字段：

```text
node.id
node.type
node.properties.stepName
node.properties.condition
node.properties.node_data
node.properties.config
```

常见节点类型：

```text
base-node
start-node
reply-node
ai-chat-node
condition-node
intent-node
tool-lib-node
variable-assign-node
variable-splitting-node
```

边常见字段：

```text
edge.id
edge.sourceNodeId
edge.targetNodeId
edge.sourceAnchorId
edge.targetAnchorId
```

注意：

```text
1. 这些字段来自当前导出包经验，不代表 MaxKB 永久公开协议。
2. 不同 MaxKB 版本、不同节点插件、不同工具类型可能有差异。
3. 每次改包前必须先解析目标包真实结构，不要照搬旧包字段。
```

## 3. 安全边界

pickle 文件不是安全数据格式。读取 `.mk` 前必须确认来源可信。

规则：

```text
1. 只处理用户明确提供的、本机 MaxKB 导出的 .mk。
2. 不反序列化来源不明、网络下载、陌生人提供的 pickle 文件。
3. 第一次接触新包时，先用 Format-Hex 或 pickletools 做格式确认。
4. 需要 pickle.load 写回时，使用 stub 类加载 MaxKB 导出结构，避免依赖本地真实 MaxKB 后端类。
5. 只在本地受控环境运行脚本，不把密钥、真实用户票据、内网地址写进文档。
```

第一次只读确认可以先看文件头：

```powershell
Format-Hex -LiteralPath "C:\path\智能体.mk" -Count 64
```

如果看到类似：

```text
application.serializers.application
MKInstance
```

通常说明它是 MaxKB pickle 导出包。

## 4. 通用解析脚本骨架

解析时优先使用 stub module，避免本机没有 MaxKB 后端类时无法加载。

示例骨架：

```python
import pickle
import sys
import types
from pathlib import Path

SRC = Path(r'C:\path\智能体.mk')

class Stub:
    def __init__(self, *args, **kwargs):
        self._args = args
        self._kwargs = kwargs

    def __setstate__(self, state):
        if isinstance(state, dict):
            self.__dict__.update(state)
        else:
            self.__dict__['state'] = state

def make_module(name):
    module = types.ModuleType(name)
    module.__path__ = []

    def __getattr__(attr):
        if attr.startswith('__'):
            raise AttributeError(attr)
        cls = type(attr, (Stub,), {'__module__': name})
        setattr(module, attr, cls)
        return cls

    module.__getattr__ = __getattr__
    sys.modules[name] = module
    return module

for module_name in [
    'application',
    'application.serializers',
    'application.serializers.application',
    'user',
]:
    make_module(module_name)

sys.modules['application.serializers.application'].MKInstance = type(
    'MKInstance',
    (Stub,),
    {'__module__': 'application.serializers.application'},
)
sys.modules['user'].UUID = type('UUID', (Stub,), {'__module__': 'user'})

with SRC.open('rb') as file:
    pack = pickle.load(file)

app = pack.application
workflow = app['work_flow']
nodes = workflow['nodes']
edges = workflow['edges']
tools = getattr(pack, 'tool_list', []) or []

print(app.get('name'), app.get('desc'))
print(len(nodes), len(edges), len(tools))
for node in nodes:
    props = node.get('properties', {})
    print(node.get('id'), node.get('type'), props.get('stepName'))
```

输出节点清单后，再按节点类型下钻：

```python
for node in nodes:
    node_type = node.get('type')
    step_name = node.get('properties', {}).get('stepName')
    node_data = node.get('properties', {}).get('node_data', {})
    if node_type in {'reply-node', 'ai-chat-node'}:
        print(step_name, node_data.keys())
        print(node_data.get('content') or node_data.get('system'))
```

## 5. 半自动改包标准流程

改包前按这个顺序执行：

```text
1. 确认用户给的是最新可运行包。
2. 复制输出为新文件，不覆盖原包。
3. 解析应用名、节点数、连线数、工具数。
4. 生成节点清单，确认目标节点真实名称。
5. 快照 AI 参数、连线签名、非展示字段签名。
6. 只修改本次允许范围内的字段。
7. pickle.dump 写成新 .mk。
8. 重新加载新包，生成巡检报告。
9. 巡检通过后再让用户导入测试。
```

输出文件命名建议：

```text
原包：某智能体-可运行版.mk
输出：某智能体-某目标优化版.mk
报告：某智能体-某目标优化版-巡检报告.txt
```

不要覆盖：

```text
用户提供的原始可运行包
已经验证可导入的稳定包
MaxKB 当前正在使用的正式包
```

## 6. 推荐修改范围

低风险字段：

```text
application.name
application.desc
application.prologue
基本信息节点 node_data.name
基本信息节点 node_data.desc
基本信息节点 node_data.prologue
reply-node.node_data.content
ai-chat-node.node_data.system 中的展示样式规则
```

中风险字段：

```text
ai-chat-node.node_data.prompt
reply-node.node_data.reply_type
reply-node.node_data.fields
节点 properties.condition
```

高风险字段：

```text
edges
condition-node.node_data.branch
intent-node.node_data.branch
variable-assign-node.node_data
variable-splitting-node.node_data
tool-lib-node.node_data
ai-chat-node.node_data.model_id
ai-chat-node.node_data.model_params_setting
ai-chat-node.node_data.dialogue_number
```

除非用户明确要求并且已经通过导出包结构核验，否则不要动高风险字段。

## 7. 必须保留的功能保护

每次重打包都要做差异保护。

AI 参数快照：

```python
def ai_signature(pack):
    result = {}
    for node in pack.application['work_flow']['nodes']:
        if node.get('type') == 'ai-chat-node':
            data = node.get('properties', {}).get('node_data', {})
            result[node.get('properties', {}).get('stepName')] = {
                'model_id': data.get('model_id'),
                'max_tokens': data.get('max_tokens'),
                'temperature': data.get('temperature'),
                'dialogue_number': data.get('dialogue_number'),
                'model_params_setting': data.get('model_params_setting'),
            }
    return result
```

连线签名：

```python
def edge_signature(pack):
    return sorted(
        (
            edge.get('id'),
            edge.get('sourceNodeId'),
            edge.get('targetNodeId'),
            edge.get('sourceAnchorId'),
            edge.get('targetAnchorId'),
        )
        for edge in pack.application['work_flow']['edges']
    )
```

如果本次只允许改样式和说法，巡检结果必须满足：

```text
AI 参数差异：0
连线变化：false
孤立节点：0
开始节点不可达节点：0
外层大边框残留：0
无效快捷按钮：0
```

允许差异一般只包括：

```text
基本信息里的应用名称、描述、开场白
reply-node 的 content
ai-chat-node 的 system 展示规则
更新时间
```

## 8. 图巡检规则

生成包后必须检查图结构。

必须报错的问题：

```text
1. 非基本信息、非开始节点入度=0且出度=0。
2. 从 start-node 不可达的业务节点。
3. 废弃节点仍留在画布但没有接入流程。
4. 多入口互斥分支汇入后续节点，但执行条件是“所有/AND”。
5. 回复节点引用的上游变量节点不可达。
```

可以存在但要解释的问题：

```text
1. 指定回复节点出度=0。
2. 最终失败兜底回复出度=0。
3. 基本信息节点不从 start-node 可达。
```

多入口节点检查口径：

```text
1. 互斥分支汇合通常应为 OR / 任一。
2. 并行汇总才考虑 AND / 所有。
3. 不确定时保持原包设置，不为了“看起来统一”擅自修改。
```

孤立节点硬规则：

```text
正式导出包不能保留孤立节点。
MaxKB 可能出现“能保存但不能运行”的问题。
旧 AI 节点、旧工具节点、旧变量拆分节点如果不接线，要删除或不放入正式包。
```

## 9. 快捷按钮巡检规则

半自动改包时可以优化 `<quick_question>`，但必须遵守真实链路原则。

允许按钮：

```text
查看待办审批
查询已办
返回待办列表
查看当前列表
查看当前流程详情
确认
取消
确认同意
确认驳回
确认退回
选1 张三
1
2
```

谨慎按钮：

```text
返回列表
查看详情
重新查询
```

使用前必须确认当前智能体能识别这些话。

禁止按钮：

```text
上传附件
安全验证
小程序安全验证
到小程序继续办理
查看审批进度
继续修改
重新描述
```

原因：

```text
1. 附件上传、安全验证、签名、人脸、密码不能在聊天按钮里假装完成。
2. “继续修改”“重新描述”没有具体业务内容，容易触发兜底或错误链路。
3. 没有真实跳转能力时，不要用按钮假装跳转。
```

每条回复建议：

```text
普通入口：2 个高频按钮。
成功/失败：2 个回流按钮。
候选人/候选节点：按真实候选输出短按钮。
安全校验：不输出假校验按钮，可给查看待办/查询已办等回流按钮。
长详情页：不强行追加按钮，优先正文提示用户可怎么说。
```

## 10. HTML 样式巡检规则

公共样式继续使用轻量 OA 规则。

外层只保留：

```html
<div style="font-size:14px;line-height:1.65;color:#1f2937;">
```

不要在最外层加：

```html
border:1px solid #e8e8e8;background:#fff;padding:14px;
```

状态条：

```text
普通说明：background:#f8fafc;border-left:3px solid #2979ff;color:#475569;
成功状态：background:#f0fdf4;border-left:3px solid #22c55e;color:#166534;
提醒失败：background:#fff8e6;border-left:3px solid #fa8c16;color:#7a4b00;
```

标题：

```html
<div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:8px;">标题</div>
```

表单信息优先用 label/value 栅格，不用营销卡片。

不要在 HTML 里做正式业务按钮：

```text
正式提交
保存草稿
审批人选择
退回节点选择
安全验证
附件上传
```

这些应由真实节点链路或 `<quick_question>` 承接。

## 11. 工具导出与工具化规则

工具页签工具也可以按“模板优先”的方式开发，但不要凭空猜结构。

推荐顺序：

```text
1. 先在 MaxKB 工具页创建或导出一个同类型可运行工具模板。
2. 解析工具入参、工具代码、输出参数结构。
3. 保留工具页系统固定输出“结果(result)”规则。
4. 如果需要细字段，画布里后接变量拆分节点。
5. 工具节点返回内容通常关闭，最终回复由指定回复或后续渲染工具输出。
6. 工具化替代 AI 展示时，保留 AI 兜底，确认稳定后再考虑删除旧 AI。
```

导入命名规则：

```text
1. 修改已有工具代码后，如果要通过 .mk 或 .tool 导入到 MaxKB 环境，工具名称和工具 ID 建议使用新版本名，不要继续沿用旧名称。
2. 原因是部分 MaxKB 环境导入同名工具时可能不会覆盖已有工具，导致画布看似导入成功，但实际仍执行旧工具代码。
3. 推荐命名格式：原工具名-目标版本，例如“渲染申请草稿确认文案-正式统一版”“渲染任务详情回复-附件修正版”。
4. 新包中的工具节点必须同步指向新工具名称和新工具 ID；不能只改 tool_list，不改画布节点 node_data。
5. 单独导出 .tool 时，也使用同样的新名称，方便工具页识别和回滚。
6. 工具稳定后如需清理旧工具，应在 MaxKB 工具页人工确认没有其他智能体依赖，再删除旧版本。
7. 半自动把 AI 节点改成工具节点时，不能把 `uuid.UUID` 这类 Python 对象原样塞进 `node_data`；至少要把新工具节点里的 `user_id` 转成字符串，避免 MaxKB 导入或运行时出现 `Object of type UUID is not JSON serializable`。
8. 工具代码里如果需要 `json.dumps(dict/list)` 做兜底文本转换，建议统一加 `default=str`，避免上游结构里混入 UUID、datetime 等对象时渲染失败。
9. 新增或替换工具时必须写工具描述，且巡检报告要检查工具 `desc` 非空；如果导入后工具页卡片仍不显示描述，要在交付说明中给出需要人工补录的描述文本。
10. 已实测：部分 MaxKB 环境中，原始 .tool 写入了 `desc`，导入后再从工具页导出的 .tool 可能出现 `desc=""`；因此最终以工具页卡片和二次导出文件为准，必要时人工补录描述。
```

工具化适合：

```text
列表渲染
详情 HTML 固定模板
附件预览按钮拼接
候选项编号按钮拼接
标准接口返回拆分
```

工具化不适合：

```text
复杂自然语言理解
模糊意图识别
口语化字段解析
业务规则未稳定的分支判断
```

## 12. 生成包前后的交付清单

生成前：

```text
1. 读取用户指定的最新可运行包。
2. 确认用户允许的修改范围。
3. 确认是否禁止修改模型参数。
4. 确认是否允许新增/删除节点。
5. 确认是否要保留旧 AI 兜底。
```

生成中：

```text
1. 不覆盖原包。
2. 写清输出包名。
3. 修改动作尽量集中在少数字段。
4. 所有脚本只作为临时生成工具，不把临时代码散落到业务目录。
```

生成后：

```text
1. 重新加载输出包。
2. 输出节点数、连线数、工具数。
3. 输出 AI 参数差异。
4. 输出连线差异。
5. 输出孤立节点和不可达节点。
6. 输出 quick_question 按钮清单。
7. 输出外层大边框和耗时口径残留。
8. 生成巡检报告。
```

交付给用户时必须说清：

```text
1. 源包路径。
2. 输出包路径。
3. 巡检报告路径。
4. 改了什么。
5. 明确没改什么。
6. 建议导入后的最小回归话术。
```

## 13. 遇到未知结构怎么办

优先级：

```text
1. 解析当前用户提供的真实导出包。
2. 检索本项目 docs/05-工作流/MaxKB/02-公共规则。
3. 检索对应功能智能体阶段目录。
4. 查看同类已成功导出包和巡检报告。
5. 仍不确定时，搜索 MaxKB 官方文档、FIT2CLOUD 社区或版本说明，并记录来源和日期。
6. 仍不确定时，不强行改包，改为输出手工搭建步骤。
```

搜索网络资料时只能解决“公开功能和标签规则”这类问题，不能替代真实导出包核验。

未知字段处理原则：

```text
看不懂就不改。
找不到真实变量就不写。
无法确认能接住按钮就不加。
不能验证导入就不要说正式可用。
```
