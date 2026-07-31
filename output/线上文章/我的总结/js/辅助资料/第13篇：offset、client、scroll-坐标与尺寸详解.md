---
title: "第13篇：offset、client、scroll 坐标与尺寸详解"
slug: "js-js-offset-client-scroll-29c45981"
summary: "JavaScript中事件对象坐标与元素属性的详细对比，涵盖client、offset、scroll三大系列API的使用方法和区别。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "DOM"
  - "坐标系统"
  - "offset"
  - "client"
  - "scroll"
status: "draft"
sortOrder: 130
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3ec"
originalSlug: "js-js-offset-client-scroll-29c45981"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第13篇：offset、client、scroll 坐标与尺寸详解
> 适合场景  
>
> + 鼠标交互（点击 / 拖拽 / 跟随）  
> + 滚动计算 / 懒加载  
> + 坐标相关面试题
>

---

## 一、所有混乱的根源：先搞清“坐标系”
在 JS / DOM 中，**所有“位置”都依赖坐标系**。

👉 所以第一步永远不是记 API，而是回答这 3 个问题：

1️⃣ **原点（0,0）在哪？**  
2️⃣ **X 轴正方向往哪？**  
3️⃣ **Y 轴正方向往哪？**

---

## 二、浏览器中的“基础坐标系”（非常重要）
### 1️⃣ 浏览器统一坐标规则（不管事件还是元素）
在浏览器中：

+ **原点 (0,0)：左上角**
+ **X 轴：向右为正**
+ **Y 轴：向下为正**

⚠️ 注意：  
这和数学坐标系不同（数学是左下角为原点，Y 向上）

(0,0)  
├──────────→ X（向右）  
│  
│  
↓  
Y（向下）

**后面所有 client / offset / scroll，方向规则全部一致，只是“参照物不同”。**

---

## 三、事件对象坐标（回答：鼠标在哪）
> 核心特征  
>
> + 来自事件对象 `e`  
> + 表示：**鼠标触发事件那一刻的位置**  
> + 一定是“点的位置”，不是元素
>

---

### 3.1 e.clientX / e.clientY（最重要）
#### ✅ 参照物是谁？
**浏览器可视窗口（viewport）的左上角**

#### ✅ 坐标轴方向
+ X：从窗口左边 → 向右增加
+ Y：从窗口顶部 → 向下增加

#### ✅ 定义
```javascript
e.clientX：鼠标距离【可视窗口左边】的水平距离
e.clientY：鼠标距离【可视窗口顶部】的垂直距离
```

#### ✅ 特点
+ ❌ **不包含页面滚动距离**
+ 滚动页面后，同一个点的 clientY 会变化

#### ✅ 示例
```javascript
document.addEventListener('click', e => {
  console.log(e.clientX, e.clientY);
});
```

#### ✅ 常见使用场景
+ 弹窗跟随鼠标
+ 拖拽起点计算
+ 判断鼠标是否进入某区域

📌 **一句话记忆**

client = 鼠标相对于【当前能看到的窗口】

---

### 3.2 e.offsetX / e.offsetY（最容易误解）
#### ✅ 参照物是谁？
**触发事件的那个元素本身的左上角**

#### ✅ 坐标轴方向
+ X：元素左边 → 向右
+ Y：元素顶部 → 向下

#### ✅ 定义
```javascript
e.offsetX：鼠标在【元素内部】的 X 坐标
e.offsetY：鼠标在【元素内部】的 Y 坐标
```

#### ✅ 示例
```javascript
box.addEventListener('click', e => {
  console.log(e.offsetX, e.offsetY);
});
```

#### ⚠️ 非常重要的坑（面试常问）
+ offsetX / offsetY **和事件冒泡有关**
+ 如果事件绑定在父元素，点击子元素：
    - offset 的参照元素可能是子元素
    - 而不是你以为的父元素

📌 **一句话记忆**

offset（事件）= 鼠标在“这个元素里面点了哪”

---

## 四、元素自身属性（回答：元素在哪 / 多大）
核心特征

+ 不依赖事件
+ 从 DOM 元素本身读取
+ 描述的是“盒子”，不是“鼠标”

---

### 4.1 offset 系列（元素在布局中的位置）
#### offsetTop / offsetLeft
##### ✅ 参照物是谁？
**最近的有定位（position ≠ static）的父元素**

##### ✅ 坐标轴方向
+ X：父元素左边 → 向右
+ Y：父元素顶部 → 向下

##### ✅ 定义
```javascript
element.offsetTop   // 元素顶部到父元素顶部的距离
element.offsetLeft  // 元素左边到父元素左边的距离
```

##### ✅ 示例
```javascript
box.offsetTop;
box.offsetLeft;
```

📌 **一句话记忆**

offset（元素）= 元素在布局里“站在哪”

---

#### offsetWidth / offsetHeight
##### ✅ 计算方式
```javascript
offsetWidth  = 内容宽度 + padding + border
offsetHeight = 内容高度 + padding + border
```

##### ❌ 不包含
+ margin

📌 **一句话记忆**

offsetWidth/Height = 元素实际“占地面积”

---

### 4.2 client 系列（元素内部可视区域）
#### clientWidth / clientHeight
##### ✅ 包含
+ 内容区
+ padding

##### ❌ 不包含
+ border
+ 滚动条
+ margin

```javascript
element.clientWidth;
element.clientHeight;
```

📌 **一句话记忆**

client（元素）= 眼睛能看到的内容区域

---

### 4.3 scroll 系列（滚动相关）
#### scrollTop / scrollLeft
##### ✅ 含义
```javascript
scrollTop = 内容被向上“卷走”的距离
```

##### 示例
```javascript
element.scrollTop;
```

#### scrollHeight / scrollWidth
```javascript
scrollHeight = 内容总高度（包括看不见的）
```

📌 **一句话记忆**

scroll = 内容在盒子里“挪走了多少 / 一共多大”

---

## 五、终极对比（重点中的重点）
### ① e.clientY vs element.getBoundingClientRect().top
| 对比点 | e.clientY | getBoundingClientRect().top |
| --- | --- | --- |
| 主体 | 鼠标 | 元素 |
| 参照物 | 可视窗口左上角 | 可视窗口左上角 |
| 含义 | 鼠标在哪 | 元素在哪 |


👉 **同一坐标系，不同对象**

---

### ② e.offsetX vs element.offsetLeft
| 对比点 | e.offsetX | offsetLeft |
| --- | --- | --- |
| 主体 | 鼠标 | 元素 |
| 描述 | 点的位置 | 盒子的位置 |
| 参照物 | 元素自身 | 父元素 |


---

### ③ 页面滚动 vs 元素滚动
| 场景 | API |
| --- | --- |
| 页面滚动 | document.documentElement.scrollTop |
| 容器滚动 | element.scrollTop |


---

## 六、终极防混口诀（一定要记）
**先问：是谁的位置？**  
鼠标 → 事件对象  
元素 → DOM 属性

**再问：相对谁？**  
窗口 → client  
元素 → offset  
滚动 → scroll

---

## 七、一句话总结（面试可用）
client / offset / scroll 的本质区别，不在 API 名字，  
而在于：**参照物是谁、描述的是点还是盒子。**
