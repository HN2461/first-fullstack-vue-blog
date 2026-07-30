---
title: "Canvas标签"
slug: "canvas-7535da83-revision-20260730"
summary: ""
category: "工具速查"
tags: []
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac300"
originalSlug: "canvas-7535da83"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# HTML5 Canvas 超详细入门笔记（通俗易懂版）

## 一、把 Canvas 想象成「数字画板」

**你可以把 **`<span class="ne-text"><canvas></span>` 标签理解成一块**电子画板****：  **

* **它本身只是一块“空白画布”（在HTML里是个矩形区域），不能直接画画；  **
* **必须用 ****JavaScript“画笔”** 才能在上面绘图；
* **能画的东西很多：直线、方块、圆圈、文字、图片，甚至能做动画和交互（比如用鼠标在上面“涂鸦”）。**

## 二、准备工作：让“画板”和“画笔”就位

### 1. 先摆好“画板”（写 Canvas 标签）

```html
<canvas id="myCanvas" width="400" height="200">
  你的浏览器不支持Canvas（这句是给老浏览器看的）
</canvas>
```

* `<span class="ne-text">id</span>`：给画板起个名字，方便后续用JS找到它；
* `<span class="ne-text">width</span>` 和 `<span class="ne-text">height</span>`：**必须写在标签里****（别用CSS！），决定画板的实际大小（比如400px宽，200px高）；  **
* **不写大小的话，默认是300×150px的小画板。**

### 2. 拿起“画笔”（获取绘图上下文）

**有了画板，还得有“画笔”——JS里叫「绘图上下文」（可以理解成“握着画笔的手”）。  **

```javascript
// 找到我们的画板
const canvas = document.getElementById('myCanvas');

// 检查浏览器是否支持Canvas（老浏览器可能不支持）
if (canvas.getContext) {
  // 拿到“2D画笔”（目前主要用2D，3D需要WebGL）
  const ctx = canvas.getContext('2d');
  // 接下来所有“画画”的操作，都靠这个ctx！
}
```

### 3. 画布的“坐标系”：别画跑偏了

**Canvas的坐标系和数学里不太一样，新手容易搞混：  **

* **原点(0,0)** 在画布的**左上角****（不是左下角！）；  **
* **向右移动，x坐标变大；  **
* **向下移动，y坐标变大；  **
* **比如 **`<span class="ne-text">(50, 30)</span>` 表示：从左上角向右移50px，向下移30px的位置。

## 三、基础绘图：从“画方块”到“画圆圈”

### 1. 画矩形：最简单的图形（像盖房子的砖块）

```javascript
// 1. 画“实心方块”（填充颜色）
ctx.fillStyle = 'blue'; // 选个颜色（支持英文、#3B82F6、rgb(59,130,246)）
ctx.fillRect(50, 50, 100, 80); // 位置(x=50,y=50)，大小(宽100,高80)

// 2. 画“空心方块”（只描边）
ctx.strokeStyle = 'red'; // 描边颜色
ctx.lineWidth = 3; // 线条粗细（3px）
ctx.strokeRect(200, 50, 100, 80); // 位置和大小
```

**效果：左边一个蓝色实心方块，右边一个红色边框的空心方块。  **

### 2. 画路径：自由画线条（像用铅笔勾轮廓）

**路径是Canvas的核心，复杂图形（三角形、多边形）都靠它画。**
步骤：**起笔 → 移动/画线 → 闭合 → 上色**

```javascript
// 画一个三角形
ctx.beginPath(); // 第一步：起笔（告诉画笔“准备开始画新图形了”）
ctx.moveTo(50, 200); // 第二步：移动笔尖到起点(50,200)（不画线，只是“悬空挪位置”）
ctx.lineTo(200, 250); // 第三步：从起点画直线到(200,250)（“落笔连线”）
ctx.lineTo(100, 300); // 再从(200,250)画到(100,300)
ctx.closePath(); // 第四步：闭合路径（自动把最后一点和起点连起来，形成三角形）

// 上色：可以选填充或描边
ctx.fillStyle = 'yellow'; 
ctx.fill(); // 填充内部
ctx.strokeStyle = 'black';
ctx.stroke(); // 描边边缘
```

**效果：一个黄色填充、黑色描边的三角形。  **

### 3. 画圆形：用“圆规”画圆（比路径简单）

```javascript
ctx.beginPath(); // 起笔（画任何图形前最好都用这个）
// 画圆参数：圆心(x=300,y=100)，半径40，从0度画到360度（完整圆）
ctx.arc(300, 100, 40, 0, Math.PI * 2); 
ctx.fillStyle = 'green';
ctx.fill(); // 填充成绿色实心圆
```

* **角度用“弧度”计算：**`<span class="ne-text">Math.PI</span>` 是180度，`<span class="ne-text">Math.PI*2</span>` 是360度；
* **想画半圆？把最后一个参数改成 **`<span class="ne-text">Math.PI</span>`（180度）就行。

## 四、美化图形：给画加点“样式”

### 1. 颜色：换支“彩笔”

* `<span class="ne-text">fillStyle</span>`：填充颜色（图形内部）；
* `<span class="ne-text">strokeStyle</span>`：描边颜色（图形边缘）；
* **支持：颜色名（**`<span class="ne-text">red</span>`）、十六进制（`<span class="ne-text">#F59E0B</span>`）、RGB（`<span class="ne-text">rgb(245,158,11)</span>`）、RGBA（带透明度，`<span class="ne-text">rgba(245,158,11,0.5)</span>`）。

### 2. 线条：调整“画笔粗细”和“笔尖形状”

```javascript
ctx.strokeStyle = 'purple';
ctx.lineWidth = 5; // 线条粗5px
ctx.lineCap = 'round'; // 线条端点是圆形（默认是平的）
ctx.lineJoin = 'round'; // 线条拐角是圆形（默认是直角）

// 画一条线看看效果
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(200, 50);
ctx.stroke();
```

**效果：一条紫色、5px粗、两端圆钝、拐角圆润的直线。  **

### 3. 渐变：让颜色“慢慢过渡”（像彩虹）

* **线性渐变****：从一个点到另一个点的颜色过渡（比如从左到右变红）；  **
* **径向渐变****：从中心向外的颜色过渡（比如太阳从黄到橙）。**

```javascript
// 1. 线性渐变（从左上角到右下角）
const linearGrad = ctx.createLinearGradient(50, 50, 200, 150); // 起点(50,50)到终点(200,150)
linearGrad.addColorStop(0, 'blue'); // 起点颜色（0表示开始）
linearGrad.addColorStop(1, 'green'); // 终点颜色（1表示结束）
ctx.fillStyle = linearGrad; // 把渐变设为填充色
ctx.fillRect(50, 50, 150, 100); // 画方块，会显示蓝到绿的渐变

// 2. 径向渐变（从中心小圈到外围大圈）
const radialGrad = ctx.createRadialGradient(300, 200, 10, 300, 200, 80); 
// 小圈：中心(300,200)，半径10；大圈：中心(300,200)，半径80
radialGrad.addColorStop(0, 'yellow'); // 中心颜色
radialGrad.addColorStop(1, 'red'); // 外围颜色
ctx.beginPath();
ctx.arc(300, 200, 80, 0, Math.PI*2); // 画一个和大圈一样大的圆
ctx.fillStyle = radialGrad;
ctx.fill(); // 填充后像个“太阳”
```

## 五、画文字：在画布上“写字”

### 1. 两种文字：实心字和空心字

```javascript
// 1. 实心字（填充文字）
ctx.font = '24px Arial'; // 字体大小和样式（必须先设置！）
ctx.fillStyle = 'blue';
ctx.fillText('你好，Canvas', 50, 80); // 文字内容，位置(x=50,y=80)

// 2. 空心字（描边文字）
ctx.font = 'bold 30px 宋体'; // bold是粗体
ctx.strokeStyle = 'orange';
ctx.strokeText('我是空心字', 50, 150);
```

### 2. 文字对齐：让文字“站整齐”

```javascript
ctx.font = '20px Arial';
ctx.fillStyle = 'green';
ctx.textAlign = 'center'; // 文字居中对齐（以x坐标为中心）
ctx.fillText('我居中啦', 200, 200); // x=200是中心点
```

* `<span class="ne-text">textAlign</span>` 可选：`<span class="ne-text">left</span>`（左对齐）、`<span class="ne-text">center</span>`（居中）、`<span class="ne-text">right</span>`（右对齐）。

## 六、放图片：把图片“贴”到画布上

```javascript
// 1. 先加载一张图片
const img = new Image();
img.src = 'https://picsum.photos/id/237/200/200'; // 图片地址

// 2. 等图片加载完成后再画（重要！不然会画不出来）
img.onload = function() {
  // 画完整图片：位置(x=50,y=50)
  ctx.drawImage(img, 50, 50);
  
  // 画缩放后的图片：位置(250,50)，大小缩成100×100
  ctx.drawImage(img, 250, 50, 100, 100);
  
  // 画图片的一部分：从原图(50,50)位置剪100×100的区域，贴到画布(50,200)，大小100×100
  ctx.drawImage(img, 50, 50, 100, 100, 50, 200, 100, 100);
};
```

**效果：画布上会有3张图——原图、缩小图、裁剪后的局部图。  **

## 七、高级操作：让画“动起来”“能互动”

### 1. 变换：移动、旋转、缩放图形（像玩橡皮泥）

**想象你在操作画板本身：  **

* **平移****：把画板挪个位置；  **
* **旋转****：把画板转个角度；  **
* **缩放****：用放大镜看画板。**

```javascript
// 画一个蓝色方块（正常状态）
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 80, 80);

// 保存当前状态（相当于“存档”，避免影响后面的画）
ctx.save();

// 平移：把画板向右移200px，向下移0（后续绘图都基于新位置）
ctx.translate(200, 0);
// 旋转：把画板顺时针转45度（用弧度：Math.PI/4 = 45度）
ctx.rotate(Math.PI / 4);
// 画一个红色方块（会跟着画板平移+旋转）
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 80, 80);

// 恢复到之前的状态（“读档”，后面的画不受平移旋转影响）
ctx.restore();

// 缩放：x和y方向都放大1.5倍
ctx.save();
ctx.scale(1.5, 1.5); // 放大1.5倍
ctx.fillStyle = 'yellow';
ctx.fillRect(100, 200, 60, 60); // 实际大小是60×1.5=90px
ctx.restore();
```

* **一定要用 **`<span class="ne-text">save()</span>` 和 `<span class="ne-text">restore()</span>` 包裹变换！否则变换会影响所有后续绘图。

### 2. 动画：让图形“动起来”（像翻动画片）

**原理：快速切换画面（每帧更新图形位置），人眼会觉得是连续的动画。  **

```javascript
// 画一个会反弹的小球
let x = 50; // 小球x坐标
let y = 50; // 小球y坐标
let dx = 3; // x方向速度（每帧移动3px）
let dy = 2; // y方向速度
const radius = 20; // 小球半径

function animate() {
  // 1. 清空画布（擦掉上一帧的画）
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. 画小球
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI*2);
  ctx.fillStyle = 'green';
  ctx.fill();
  
  // 3. 边界检测：撞到边缘就反弹
  if (x + dx > canvas.width - radius || x + dx < radius) {
    dx = -dx; // x方向反向（左右反弹）
  }
  if (y + dy > canvas.height - radius || y + dy < radius) {
    dy = -dy; // y方向反向（上下反弹）
  }
  
  // 4. 更新位置（下一帧的位置）
  x += dx;
  y += dy;
  
  // 5. 循环调用自己（继续画下一帧）
  requestAnimationFrame(animate);
}

// 启动动画
animate();
```

**效果：一个绿色小球在画布内来回反弹，像弹球一样。  **

### 3. 交互：用鼠标“画画”（像在画板上涂鸦）

**原理：监听鼠标事件，跟着鼠标轨迹画线。  **

```javascript
let isDrawing = false; // 是否正在画画

// 鼠标按下：开始画画
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  // 获取鼠标在画布上的位置（不是屏幕位置！）
  const pos = getMousePos(e);
  ctx.beginPath(); // 起笔
  ctx.moveTo(pos.x, pos.y); // 移动到鼠标位置
});

// 鼠标移动：如果正在画画，就跟着画线
canvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y); // 从当前位置画到鼠标新位置
    ctx.stroke(); // 描边（显示线条）
  }
});

// 鼠标松开/离开：停止画画
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// 工具函数：计算鼠标在画布上的坐标
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect(); // 画布在页面中的位置
  return {
    x: e.clientX - rect.left, // 鼠标x - 画布左边距离 = 画布内x坐标
    y: e.clientY - rect.top   // 鼠标y - 画布顶部距离 = 画布内y坐标
  };
}
```

**效果：按住鼠标在画布上拖动，会画出连续的线条，像手写板一样。  **

## 八、实际能做什么？（学了有用！）

1. **数据可视化****：画图表（柱状图、折线图），比如疫情数据统计；  **
2. **小游戏****：贪吃蛇、俄罗斯方块、五子棋（用Canvas画棋子，检测输赢）；  **
3. **电子签名****：让用户用鼠标签字，保存成图片（合同、表单常用）；  **
4. **图片编辑器****：简单的裁剪、滤镜（比如把图片变成黑白）；  **
5. **动态背景****：网页上的粒子动画、流动的渐变效果。**

## 总结：Canvas 学习路径

1. **先掌握基础：画矩形、圆形、路径，设置颜色和样式；  **
2. **再学进阶：文字、图片、渐变；  **
3. **最后挑战：变换、动画、交互；  **
4. **关键：多动手！哪怕是画个会动的方块，也能帮你理解原理。**

**Canvas 就像一块万能的电子画板，只要你能想到的2D图形效果，几乎都能实现——动手试试吧！**以下是一个基于Canvas的签名板实现，支持鼠标/触摸签名并保存为图片，包含完整代码和详细注释：

# 签名板实现代码（HTML+CSS+JavaScript）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas签名板</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    .signature-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 10px;
      background-color: #fff;
    }
    #signatureCanvas {
      border: 1px solid #666;
      background-color: #fff;
      cursor: crosshair;
    }
    .controls {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    #clearBtn {
      background-color: #f44336;
      color: white;
    }
    #saveBtn {
      background-color: #4CAF50;
      color: white;
    }
    button:hover {
      opacity: 0.9;
    }
    .instructions {
      margin-bottom: 15px;
      color: #666;
    }
  </style>
</head>
<body>
  <h2>电子签名板</h2>
  <p class="instructions">请在下方区域使用鼠标或触摸屏幕签名</p>
  
  <div class="signature-container">
    <!-- 签名画布（宽600px，高300px） -->
    <canvas id="signatureCanvas" width="600" height="300"></canvas>
  </div>
  
  <div class="controls">
    <button id="clearBtn">清除签名</button>
    <button id="saveBtn">保存签名</button>
  </div>
  <script>
    // 获取Canvas元素和上下文
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
  
    // 签名状态变量
    let isDrawing = false; // 是否正在绘制
    let lastX = 0; // 上一个点的X坐标
    let lastY = 0; // 上一个点的Y坐标
  
    // 初始化Canvas样式（签名笔的样式）
    function initCanvas() {
      // 设置线条颜色（黑色签名）
      ctx.strokeStyle = '#000000';
      // 设置线条宽度（笔尖粗细）
      ctx.lineWidth = 2;
      // 设置线条端点样式（圆润的笔尖）
      ctx.lineCap = 'round';
      // 设置线条拐角样式（圆润的拐角）
      ctx.lineJoin = 'round';
      // 清空画布（白色背景）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // 开始绘制（鼠标按下或触摸开始）
    function startDrawing(e) {
      isDrawing = true;
      // 获取当前点在Canvas中的坐标
      const { offsetX, offsetY } = getCoordinates(e);
      lastX = offsetX;
      lastY = offsetY;
    }
  
    // 绘制过程（鼠标移动或触摸移动）
    function draw(e) {
      if (!isDrawing) return; // 如果不在绘制状态，直接返回
    
      // 获取当前点坐标
      const { offsetX, offsetY } = getCoordinates(e);
    
      // 开始绘制路径
      ctx.beginPath();
      // 移动到上一个点
      ctx.moveTo(lastX, lastY);
      // 绘制到当前点
      ctx.lineTo(offsetX, offsetY);
      // 描边（显示线条）
      ctx.stroke();
    
      // 更新上一个点的坐标（为下一次绘制做准备）
      lastX = offsetX;
      lastY = offsetY;
    }
  
    // 停止绘制（鼠标松开或触摸结束）
    function stopDrawing() {
      isDrawing = false;
    }
  
    // 处理坐标（兼容鼠标和触摸事件）
    function getCoordinates(e) {
      // 触摸事件处理（移动端）
      if (e.type.includes('touch')) {
        // 阻止触摸事件的默认行为（避免页面滚动）
        e.preventDefault();
        // 获取触摸点在页面中的位置
        const touch = e.touches[0];
        // 获取Canvas在页面中的位置信息
        const rect = canvas.getBoundingClientRect();
        // 计算触摸点在Canvas中的相对坐标
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top
        };
      } 
      // 鼠标事件处理（PC端）
      else {
        return {
          offsetX: e.offsetX,
          offsetY: e.offsetY
        };
      }
    }
  
    // 清除签名
    function clearSignature() {
      // 填充白色矩形覆盖整个画布（清空效果）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  
    // 保存签名为图片
    function saveSignature() {
      // 将Canvas内容转换为图片URL（PNG格式）
      const dataURL = canvas.toDataURL('image/png');
    
      // 创建一个隐藏的a标签用于下载
      const link = document.createElement('a');
      link.href = dataURL;
      // 设置下载的文件名（带时间戳避免重名）
      link.download = `signature_${new Date().getTime()}.png`;
    
      // 触发点击事件下载图片
      link.click();
    }
  
    // 绑定事件监听
    function bindEvents() {
      // 鼠标事件（PC端）
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing); // 鼠标移出画布时停止
    
      // 触摸事件（移动端）
      canvas.addEventListener('touchstart', startDrawing);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('touchend', stopDrawing);
    
      // 按钮事件
      document.getElementById('clearBtn').addEventListener('click', clearSignature);
      document.getElementById('saveBtn').addEventListener('click', saveSignature);
    }
  
    // 初始化
    function init() {
      initCanvas();
      bindEvents();
    }
  
    // 页面加载完成后初始化
    window.addEventListener('load', init);
  </script>
</body>
</html>
```

### 功能说明与核心原理

#### 1. 签名功能实现

* **画布初始化****：通过**`<span class="ne-text">getContext('2d')</span>`获取绘图上下文，设置线条样式（颜色、粗细、端点形状），确保签名流畅自然。
* **绘制逻辑****：**

  * **鼠标/触摸按下时（**`<span class="ne-text">mousedown</span>`/`<span class="ne-text">touchstart</span>`）：记录起点，开始绘制状态
  * **移动时（**`<span class="ne-text">mousemove</span>`/`<span class="ne-text">touchmove</span>`）：从上次记录的点绘制到当前点，形成连续线条
  * **松开时（**`<span class="ne-text">mouseup</span>`/`<span class="ne-text">touchend</span>`）：结束绘制状态
* **坐标处理****：兼容PC端（鼠标坐标）和移动端（触摸坐标），通过**`<span class="ne-text">getBoundingClientRect()</span>`计算触摸点在Canvas中的相对位置。

#### 2. 保存图片功能

* **Canvas转图片****：使用**`<span class="ne-text">canvas.toDataURL('image/png')</span>`将画布内容转换为Base64格式的图片URL，支持PNG/JPG等格式。
* **下载实现****：动态创建**`<span class="ne-text"><a></span>`标签，将图片URL赋值给`<span class="ne-text">href</span>`，设置`<span class="ne-text">download</span>`属性指定文件名，触发点击事件完成下载。

#### 3. 其他功能

* **清除签名****：通过**`<span class="ne-text">fillRect()</span>`绘制白色矩形覆盖整个画布，实现清空效果。
* **跨设备兼容****：同时支持鼠标（PC）和触摸（手机/平板）操作，满足不同场景需求。**

### 使用方法

1. **在画布区域用鼠标拖动或触摸屏幕进行签名**
2. **点击「清除签名」可重新签名**
3. **点击「保存签名」会将签名以PNG格式下载到本地**

**这个实现轻量高效，无需依赖外部库，可直接嵌入到网页或应用中，适合电子合同、表单签署等场景。**
