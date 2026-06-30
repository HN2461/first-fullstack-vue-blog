---
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
## 网页架构

了解h5规范

**1.HTML中不区分大小写,但是我们一般都使用小写**

**2.HTML中的注释不能嵌套**

**3.HTML标签必须结构完整，要么成对出现，要么自结束标签**

**4.HTML标签可以嵌套，但是不能交叉嵌套**

**5.HTML标签中的属性必须有值，且值必须加引号(双引号单引号都可以)**

什么是结构、表现、行为

  HTML 用于构建网页的结构

  CSS  用于设置网页的样式

  JavaScript  用于实现网页的行为

**1、结构,是网页的骨架,由html超文本标记语言创建,用于搭建文档的结构、定义网页的内容，例如标题、正文、图像等；**

**2、表现,是网页的样式,由css负责创建,用于设置文档的呈现效果,例如颜色、字体、背景等；**

**3、行为,是网页的行为,由javascript语言创建,可实时更新网页中的内容，例如从服务器获取数据并更新到网页中，能够让网页更加生动。**
```html

<!DOCTYPE html>

<!-- 声明是什么 html -->

<!-- 文档声明，告诉浏览器，我是按照html的规范写的 防止出现怪异模式，从而出现乱码 -->

<html><!-- 根元素/根标签  一个页面只有一个HTML 所有内容必修写在HTML -->

  <html lang="en">

    <!-- en,英语。zh-cn，中文 -->

    <head><!-- 保存一些元信息，里面内容不会再页面中展示，只是辅助浏览器编译页面 -->

      <meta charset="utf-8"><!--  <标签 属性="属性值"> -->

        <!-- meta 自结束标签，设置一些元信息，辅助浏览器编译代码 -->

        charset  字符集

        utf-8  万国码

        GB2312  中国

        GBK    中国扩展版

        编码  将字符转成二进制

        解码  将二进制转成字符

        乱码  编码和解码参考的标准不一样

        <title>  标题  </title><!-- 页面标题 ，默认情况显示在浏览器的标题栏，最重要的作用帮助推广部门做SEO/SEM优化 -->

    </head>

    <body> <!-- 页面内容，书写网页的主体内容 -->

      内容的主体内容

    </body>

    <!-- 浏览器有自动纠错功能，但我们要尽可能避免 -->

    1、影响向网站的性能

    2、它纠错后不一定是你要的

  </html>
```
## 声明用什么编码方式

 meta 设置元数据  **meta标签用来设置网页的元数据**，不会变的数据，给浏览器看的

（1）**设置网页的字符集**，避免乱码问题   charset 属性  属性值

（2）meta 元素被用于规定**页面的描述**description/name/content、关键词keyword、文档的作者、最后修改时间以及其他元数据。

		 字符集
```html
		<meta charset="UTF-8">
```
	 1.存储时，务必采用合适的字符编码，否则无法存储，数据丢失

1. 存储时采用那种方式编码，读取时就采用那种方式解码，否则乱码

	** 重定向，描述，关键字 **

	 重定向  http-equiv定义重定向，content=时间 url--链接
```html
	 <meta http-equiv="refresh" content="1;url=https://www.jd.com/" />
```
## 描述
```html
	 <meta name="description" content="淘宝网 - 亚洲较大的网上交易平台，提供各类服饰、美容、家居、数码、话费/点卡充值… 数亿优质商品，同时提供担保交易(先收货后付款)等安全交易保障服务，并由商家提供退货承诺、破损补寄等消费者保障服务，让你安心享受网上购物乐趣！">
```
## 关键字
```html
	 <meta name="keywords" content="淘宝,掏宝,网上购物,C2C,在线交易,交易市场,网上交易,交易市场,网上买,网上卖,购物网站,团购,网上贸易,安全购物,电子商务,放心买,供应,买卖信息,网店,一口价,拍卖,网上开店,网络购物,打折,免费开店,网购,频道,店铺">
```
```html

   <meta charset="utf-8">

    <!-- 声明编码方式，防止乱码 -->

     <meta http-equiv="refresh" content="555555;url=https://www.baidu.com/" />

     <!-- 重定向  http-equiv定义重定向，content=时间 url--链接-->

      <!-- 跳过该网页，在设置时间后，进入链接 -->
```
## 实体

在网页中编写的多个空格默认会自动被浏览器解析为一个空格

在HTML中，一些如< >这种特殊字符是不能直接使用，比如空格，大于小于号等

如果我们需要在网页中书写这些，我们需要使用一些特殊的符号来表示这些特殊字符，

这些特殊符号我们称为实体（转义字符串）

浏览器解析到实体时，会自动将实体转换为其对应的字符

## 实体的语法
```html
                &实体的名字;
```
                    空格  &nbsp;

                    <  &lt;

                    >  &gt;

                    版权符号 &copy;

## 常用标签：
```html
  <h1> </h1><!-- 不同字号，标题标签 h1 ~ h6,从大到小 ，加粗变大 -->

    <h2> </h2>

    <h3> </h3>

<p> </p><!--  段落标签，段落标签用于表示内容中的一个自然段，特殊的块元素  一般只用来包裹文字或图片，它里面不能放块元素 -->
```
像上面的每个标签，独占一行，称块元素
```html
像 <em> </em>，不独占一行，称行内元素
```
行内元素通常在同一行显示，不能设置宽度和高度，而块级元素则独占一行，可以设置宽度和高度
```html
<em> </em> <!-- 倾斜字体，行内元素 -->

   <strong> </strong><!-- 加粗，行内元素 -->

     <s> </s>

<del> </del><!-- 都表示一个删除的内容,字体中间加横线，表删除，例如打折页面 ，行内元素 -->

    <hgroup>

      <h1>瑕佽寖娆插垜銆?/h1>

      <h3>鍖栬鐢卞府銆?/h3>

    </hgroup><!--  用来为标题分组，可以将一组相关的标题同时放入到hgroup,页面上没区别，主要方别看代码，行内元素 -->

    <blockquote>
```
      之老到能躲薪五严得灰报力一反秦为不订疾。
```html
</blockquote><!-- 引用别人说的话 长引用 会换行 块元素,前面会空2个多点 -->

      <!-- 注释符号，注释化：ctrl加 /  解除注释化，同理 -->

<q>病的子韩死故游六身。</q><!-- 表示短引用，加引号，行内 -->

有些标签是没尾标签的，如 <meta charset="utf-8">

<br /><!-- 换行，插哪里，哪里换行，行内 -->

	<hr /><!-- 页面上显示一个分割线，独占一行，块元素 -->

	<center>
```
      承以冇看么我在司身。
```html
      <p>我下落一死落子自明。</p>
```
## `</center>`  //居中效果
```html
	<div>计划管控就好了</div><!-- 没有任何语义，只表示一个块元素，没效果，制造出一个块元素 -->

	<span>为疾为战都他，后宋。</span><!-- 没有任何语义，表示一个行内元素,一般就用来包裹文字 -->
```
元素在文档流中会区分为 块元素 行内元素 行内块元素

## 块元素

一般是用来布局

1、会**独占一行**，自上而下一行一行的排列

2、块元素的宽度默认是父元素的百分百

3、块元素的高度默认是被内容撑开

**常用块元素：div  p  h1-h6  ul  li  ol  header footer  main  nav**

## 行内元素

一般用来包裹文字

1、**不会独占一行**,自左向右排列，一行满了，就挪到下一行，再自左向右

2、行内元素宽高都是被内容撑开的，**不可以自定义宽度**

## 常用行内元素：span  a  i   em  strong  del  s

## 行内块元素

兼具块元素，行内元素的特点

**又不会独占一行，又可以设置宽高**

## 常用行内块元素：img

注意：

       1、块元素是布局元素，里面什么都能放，能方块元素，能放行内元素，行内块元素

       2、行内元素里面不能放块元素  一般就用来包裹文字

       3、特殊的块元素  p     不能放块元素

       4、特殊的行内元素  a   里面什么都能放，除了它自己

## 结构化标签

     布局标签（结构化标签）

## header  网页的头部

## main  网页的主体部分（一般就一个）

## footer 网页的底部

## nav  网页的导航

**    aside  和主体相关的内容，侧边栏**

## article  文章之类的

**    section 独立的区块，上面的标签都不合适，就用这个**
```html
    <header>头部</header>

    <main>
```
      主体
```html
      <nav></nav><!-- 导航 -->

      <aside></aside><!-- 和主体相关的内容，侧边栏 -->

      <article></article><!-- 和文章相关， 文章之类的 -->

    </main>

    <footer>
```
      底部
```html
      <section></section><!-- 独立的区块 -->

    </footer>
```
## 列表

     列表（list） 一组一组

      1:有序列表  用**ol**标签创建，**li**表示列表项

项目符号：**1(默认值)、a、A、i、I**

      2:无序列表  用**ul**标签创建，**li**表示列表项

                项目符号： ** disc，默认值，实心的圆点**

				        	**square**，**实心的方块**

				        	**circle，空心的圆**

     3:定义列表  用**dl**标签创建，使用**dt**对内容进行定义，使用**dd**对内容进行解释说明

**start 属性的值是一个整数，定义一个开始位置**

## type属性  可以更改项目符号
```html
list-style:none;去除项目符号
```
    注意：列表之间是可以互相嵌套的

属性写在开始标签里，用空格分开
```html
    <ol type="i"><!-- 创建有序表 ，type属性  更改项目符号，项目符号是i -->

      <div> </div>

      <li> </li>

      <li> </li>

    </ol>

    <ul type="circle"><!-- 创建无序表，type属性  更改项目符号，项目符号是空心的圆 -->

      <li>一已光。</li>

      <li>身烦于有。</li>

      <li>他单卡，人。</li>

    </ul>

    <dl>

<dt>html</dt><!-- 列表小标题 ，下定义 -->
```
## `<dd>`html5`</dd>`//对定义的解释
```html
      <dd>css3</dd>

      <dd>less</dd>

      <dd>sass</dd>

      <dt>js</dt>

      <dd>js基础</dd>

      <dd>DOM</dd>

      <dd>Bom</dd>

    </dl>
```
## `<a>`超链接

 2个属性，2个功能，1个补充

**属性 href（跳转地址），target（在哪里显示）**

## 功能 #（跳到顶部） #id属性值（跳到页面指定位置）

**补充 空链接，在href属性中写入一个#或者是javascript:;**，

 HTML页面使用超链接与网络上的另一个HTML页面相连。几乎可以在所有的网页中找到超链接，点击超链接会出现很多效果：

**1：可以让我们从一个页面跳转到另一个页面，**

**        2：当前页面的其他位置**

**        3:下载**

—在HTML中链接可以是一个字，一个词，也可以是一个图片，这些都是可以点击的。

—使用a标签来创建一个超链接，它是个**行内元素**，在a标签中可以嵌套除自身外的任何元素

     属性：

			   **1: href属性: 指向链接跳转的目标地址**

			        -值可以是一个外部的网站的地址    绝对路径

				    -可以是一个内部页面的地址       相对路径

（1）：绝对路径 就是指完整的描述目标文件位置的路径。

简单来说，绝对路径就是无论你当前的位置在哪，找到目标文件的路径是不变的。

（2）：相对路径 就是指由这个文件所在的路径引起的跟其它文件（或文件夹）的路径关系。

 简单来说，相对路径和你所在的位置是有关系的，你所在位置的不同会导致相对路径也会不同。

     **2: target属性：可以用来指定打开链接的位置**

		可选值：

		**_self，表示在当前窗口中打开（默认值）**

**		_blank，在新的一个新的页面中打开链接 **

		可以设置一个内联框架的name属性值，链接将会在指定的内联框架中打开

**锚点功能**（页面内的跳转）

        所谓锚点 ，就是指当点击链接文本时，跳转到当前页面的指定元素位置

         （1）若将超链接的**href属性设置为#**，点击超链接后，

**页面不会发生跳转**，而是**跳到**当前页面的**顶部**的位置

         （2）**跳转到页面的指定位置**，

            语法：将href属性设置为  **#目标元素的id属性值**

**给标签加标记——id属性**（唯一不重复的标记）

              -每一个标签都可以添加一个id属性

** -id属性就是元素的唯一标识，同一页面中不能出现重复的id属性**

**              -id区分大小写，且不能以数字开头**
```html
              <a href="" target=""></a>

              <a href="#"></a>

              <a href="#id"></a>

              <a href="javascript"></a>
```
        4:**空链接**
```html
         不想使<a>元素生效，在href属性中写入一个#或者是javascript:;，
```
     此时的**超链接没有作用**，当还没有想好超链接具体跳转位置时，可以当做**占位符**使用。

        cdn方式引入外链
```html
       <a href="https://www.baidu.com/" target="_blank">跳转链接</a>
```
        内部页面的跳转

        什么是绝对路径

        相对路径去查找，当前./,上层../继续查找
```html
       <a href="./03.列表.html" target="_blank"> 同一层文件下面的跳转</a>

       <a href="../01.网页结构/06实体.html" target="_blank">不同文件下的跳转</a>
```
        空标签
```html
       <a href="#"> 内容</a>
```
        锚链接
```html
       <a href="#bottom">去底部</a>

       <a href="#center">去中间</a>
```
   在开发中可以将#作为超链接的路径的占位符使用
```html
         <a href="#">我还想好链接到哪里，先占个位子</a>
```
** javascript:;，此时点击，没有任何反应**
```html
         <a href="javascript:;">我还想好链接到哪里，先占个位子</a>
```
## `<img>`引入图片

 使用img标签来向网页中**引入**一个外部**图片**，img标签也是一个自结束标签，img这种元素属于替换元素（基于块和行内元素之间，具有两种元素的特点）

## src   引入图片的路径 //路径

**alt 可以用来设置在图片不能加载时，对图片的描述，**图片不显示时，网页显示图片描述搜索引擎可以通过alt属性来识别不同的图片

如果不写alt属性，则搜索引擎不会对img中的图片进行收录

**width**：可以用来**修改图片的宽度**,一般使用px作为单位

**height**：可以用来修改图片的**高度**，一般使用px作为单位
```html
         <!-- 注意：一般不会同时设置宽高，以防图片变形 -->
```
           注意：

1:宽度和高度两个属性如果指设置一个，另一个也会同时等比例调整大小，如果两个值同时指定则按照你指定的值来设置。

2:一般开发中除了自适应的页面，不建议设置width和height，大图变小，会多占内存，小图变大会失真

3:pc端，需要多大的图，就裁多大的，移动端，进场会对图片进行缩放（大图缩小）

## 行内块元素 具备块元素的可设置宽高同时具备行内元素的不独占一行

 内部图片的引入
```html
<img src="./img/img/bl.gif" alt="这是一张图片">

<img src="./img/img/bl.gif" alt="这是一张图片" width="300" height="400">

<img src="./img/京东logo.png" alt="">
```
**img标签是行内块元素 ，自结束标签**

## 图片格式（jpg gif png webp base64）

和油漆是一个道理，不同的图片格式特性不一样，使用场合也有所不同。
```html
JPEG(JPG)//效果好，保存图片
```
- JPEG图片支持的颜色比较多，图片**可以压缩**，但是**不支持透明**

- 一般用来保存照片等颜色丰富的图片

## GIF//动图

- GIF支持的颜色少，只**支持简单的透明，支持动态图**

- 图片颜色单一或者是动态图时可以使用gif
```html
PNG//显示复杂的图片，为网页而生
```
- PNG支持的颜色多，并且**支持复杂的透明，不支持动图**

- 可以用来显示颜色复杂的透明的图片

专为网页而生的
```html
webp//优点全具备，但兼容性不好
```
-谷歌新推出的专门用来表示网页的一种格式

-它具有其他图片格式的所有优点，而且文件格式还很小

## -缺点：兼容性不好
```html
base64 //与网页一起出现，需要先转字符
```
-讲图片使用base64编码，这样可以将图片转换为字符，通过字符形式来引入

-一般都是需要和网页一起加载的图片才会使用base64

图片的使用原则：

效果不一致，使用效果好的

效果一致，使用小的

网页加载流程：

先加载网页结构，然后再加载外部的资源包括css文件，js文件，图片，各种插件等

## 内联框架

## 用iframe来定义一个内联框架

 **iframe:**

**src：引入外部网址，全路径/内部链接，相对路径**

**    frameborder:去除边框效果 **

## width：宽度

**    height: 高度**

## name ：链接的 target 属性

**    target: 作为链接的目标**

**    iframe 可用作链接的目标（target）。**

## 链接的 target 属性必须引用 iframe 的 name 属性：

## 链接跳转
```html
  <iframe src="https://www.w3school.com.cn/" frameborder="0" width="800" height="600"> </iframe>

   <iframe src="./02.结构标签.html" width="800" height="600"></iframe>
```
## 内嵌内部页面
```html
<!-- 定义一个内联框架，实现在网页里出现多个网页 -->
```
 引入外部网址，全路径，并装饰框架

   **链接跳转内部展示/不刷新浏览器** name="iframe_a" target="iframe_a"

## 在内部更新盒子内容
```html
  <iframe src="./02.结构标签.html" width="800" height="600" name="iframe_a"></iframe>

  <a href="https://www.w3school.com.cn/" target="iframe_a">点击更新</a>

<!-- 定义一个内联框架，用name命名框架，再用<a>链接其他网址，实现内部更新框架内容 -->
```
先做框架并起名，再用超链接的target属性指定在该框架，进行跳转

## 音视频引入

音乐：

     **audio标签** 用来向页面中**引入**一个外部的**音频**文件

              音视频文件引入时，**默认**情况下**不允许用户自己控制播放停止**

              IE9以下的浏览器是不支持的

            属性：

**controls  是否允许用户控制播放，不用给值**

**              autoplay  音频文件是否自动播放  打开页面时，音乐会自动播放，**

**                           但目前为止，大部分浏览器是不可以自动播放的**

## loop  是否循环播放

      第一种方式
```html
 <audio src="./source/BABYDOLL .mp3" controls autoplay loop></audio>
```
## source引入资源  //在audio中引入

 第二种方式
```html
     <audio controls autoplay loop >
```
## `<source src="./source/Hurt.mp3">`
```html
</audio>
```
## embed引入资源：src  type
```html
      <embed src="./source/Hurt.mp3" type="audio/mp3">
```
视频：

 **video标签**来向页面中**引入**一个**视频**，**使用方式跟音频基本上一样的**
```html
<video src="./source/蜗居.mp4" controls autoplay loop ></video>

    <video controls autoplay loop >

       <source src="./source/video.webm">

       <source src="./source/绝地逢生.mp4">

      <source src="./source/3月3日高颜值小家电.mp4">

    </video>

css
```
## css  -层叠样式表
```html
      -网页实际上是一个多层的结构，通过css可以分别为网页的每一层来设置样式，而最终我们能看到的只有最上边的一层  //类似女生化妆 ，给网页化妆
```
             -设置网页中元素的样式

如果要设置css样式，前提

1. **css书写位置**
```html
2. 如何选中对应的结构  //先找对地方，后化妆
```
你要找的事，找对追求目标，然后各种花招追求她（他）

## CSS书写位置：

**CSS样式：名值对的结构   样式名:样式值;**
```html
font-size: 30px;       设置字体大小

      color:red;          设置字体的颜色

      background:black;   设置背景颜色
```
## 第二种方式：内部样式表
```html
写在<head>里，在<style>标签里写样式
```
    在head标签里配置style标签，通过选择器选中对应html结构，

      在花括号里面设置css声明块，可以写多组样式，也是以;隔开
```html
      <!-- 在style里先选对应的元素，然后设置样式 -->

语法：选择器{css声明块}
```
## 缺点：不方便复用

**           html文件会变得很长，看起来也不好看**

总结：比较大的项目，或者重复使用率比较高的部分，不建议使用
```html
	  <!-- 主要想写一次代码，其他html也可以用 -->

<head>

    <style>

      div {

        color: pink;

        font-size: 50px;

        background-color: red;

      }

</style>

</head>
```
## 第三种方式：外部样式表

**在html文件外新建一个.css文件**，**在css文件通过选择器选中对应的结构，设置相关的样式**
```html
通过link标签，将html文件和css文件联系在一起  //用前，先引用
```
    总结：大的项目，或者复用率高的，推荐使用
```html
    <!-- 一次代码，多个文档使用 -->

    <link rel="stylesheet" href="./03peiqi.css" />
```
 link在head，但不在style

## 第一种方式：内联样式/行内样式
```html
<!-- 在<body>标签里进行，样式写在开始标签里 -->
```
**在开始标签内，配置style属性，在style属性值里写css样式 **
```html
	   <!-- 样式分为   样式名：样式值;   名值对的结构 -->
```
       可以写多组css样式，样式与样式之间**用;隔开**

       缺点：
```html
          1、结构和样式耦合   //显得不好看

          2、不容易修改       //代码太多，修改麻烦
```
       总结：不建议使用

## CSS的语法

html和css是两种不同的语言，所以有不同的书写位置，也有不同的语法

## CSS的语法：

## 选择器  声明块

## 选择器：如何选中对应的html标签

## 声明块：就是对应的css样式    名值对结构
```html
			标签{名值对}   //地方{妆容}

  <!-- CSS的注释必须写在style里，或者是CSS文件中 -->
```
**CSS常用选择器（元素、id、class、*）**
```html
    <style>

      /* 需求一：标题变红色 */
```
1. **元素（标签）选择器**

## 作用：通过标签名选中对应的内容
```html
      语法：标签名{}
```
      注意：html常用标签大概20多个，如果用元素选择器选中设置css样式

       一定要注意，是否会波及到其他的内容，如果波及到了，就不要用元素选择器
```html
      h1 {

        color: red;

      }

      /* 需求二：将第一句诗变绿色 */
```
1. **id选择器**

**作用：通过id属性值，选中对应的结构**
```html
      语法：#id属性值{}
```
**注意：id属性值不能重复使用，不能以数字开头，不能是汉字**

**id值唯一，不能复用**
```html
      #p1 {

        color: green;

      }

      /* 需求三：将第二句诗也变绿色 */
```
1. **class选择器**

**作用：通过指定class属性值，选中对应的结构**
```html
      语法：.class属性值{}
```
      注意：（1）、这也是最常用的选择器

（2）、 **可以起多个class属性值，中间以空格隔开 **

**与id相比，class可以复用**
```html
     .pp {

        color: green;

      }

      .p2{

        background-color: pink;

      }

	  .pp.p2{

		  font-size: 40px;

	  }

      /* 需求四：给所有的标签字体变为24px */
```
1. **通配选择器 **

## 作用：选中页面中所有的标签
```html
      语法：*{}
```
      选所有的
```html
     * {

        font-size: 24px;

		color: red;

      }

    </style>

  </head>

  <body>

    <div>

      <h1>登高</h1>

      <h3>杜甫</h3>

      <p id="p1">风急天高猿啸哀，渚清沙白鸟飞回。</p>

      <p class="pp p2">无边落木萧萧下，不尽长江滚滚来。</p>

      <p class="pp">万里悲秋常作客，百年多病独登台。</p>

      <p class="p2">艰难苦恨繁霜鬓，潦倒新停浊酒杯。</p>

    </div>

  </body>

</html>
```
## CSS复合选择器（交集、并集）

复合选择器：

## 交集选择器

## 作用：选中满足多个条件的元素
```html
              语法：选择器1选择器2选择器3····{}
```
              注意：如果选择器中有元素选择器，**元素选择器必须放在第一**位

## 并集选择器

## 作用：同时选中多个选择器对应的内容
```html
              语法：选择1,选择器2，选择器3···{}
```
总结：

**交集，从多个条件中找到符合的元素。并集，选择多个选择器的元素化妆，简化了代码**
```html
  /* 需求一：将class为red的诗句变为红色，同时将class为red的div字体变为24px */

      .red{

        color: red;

      }

       p.red{

        font-size: 24px;

      }

      /* 需求二：将h1,h3字体颜色变为黄色*/

      h1,h3{

        color: yellow;

      }

    </style>

  </head>

  <body>

    <h1>满江红·写怀</h1>

    <h3>岳飞·宋</h3>

    <p class="red">怒发冲冠，凭栏处、潇潇雨歇。</p>

    <div class="red">抬望眼，仰天长啸，壮怀激烈。</div>

    <div>三十功名尘与土，八千里路云和月。</div>

    <p>莫等闲，白了少年头，空悲切！</p>

    <p>靖康耻，犹未雪。臣子恨，何时灭！</p>

    <p>驾长车，踏破贺兰山缺。</p>

    <p>壮志饥餐胡虏肉，笑谈渴饮匈奴血。</p>

    <p>待从头、收拾旧山河，朝天阙。</p>

  </body>

CSS关系选择器（父>子{} 祖先 后代{}  兄+弟{}  兄~弟{}）

      /* 需求一：为div的子元素span设置一个字体颜色红色 */
```
**  1、子元素选择器**

## 作用：通过指定的父元素找到指定的子元素
```html
      语法：父元素>子元素{}

      #cs > span {

        color: red;

      }

      /* 需求二：div里的span元素字体都变为30px */
```
	**2、后代选择器**

## 作用：通过指定的祖先元素找到指定的后代元素
```html
      语法：祖先元素 后代元素{}
```
注意：由于子元素一定情况下也属于后代元素，在使用的时候，能用子元素选择器，不用后代选择器,否则一定程度上会影响网站性能
```html
       #cs span {

        font-size: 30px;

		color: blue;

      }

      /* 需求三:选择下一个兄弟(仅挨着我的)*/
```
**3、下一个兄弟选择器**

## 作用：通过指定兄找到紧挨着下一个兄弟
```html
      语法：兄+弟{}

     .s1+span{

        background-color: pink;

      }

      /* 四:选择下面所有的兄弟(前面的不选)*/
```
**4、选择所有兄弟选择器 **

**      作用：通过指定兄找到下面所有的兄弟，不包括前面的**
```html
      语法：兄～弟{}

      .p1~span{

        background-color: violet;

      }

    </style>

  </head>

  <body>

    <div id="cs">

      我是超市<br />

      <span>我是零食区</span>

      <p class="p1">
```
        我是生鲜区
```html
        <span
```
          >肉类
```html
          <em>羊肉</em>

          <em>牛肉</em>

        </span>

        <span>蔬菜</span>

      </p>

      <span class="s1">我是鞋包区</span>

	 <div></div>

      <span>我是洗护区</span>

	  <span>我是洗护区</span>

	  <span>我是洗护区</span>

    </div>

    <br />

    <span>我是超市外的小卖部</span>

   /*
```
## 元素之间的关系

## 父子关系

## 直接包含和被包含的关系

## 祖先后代关系

## 直接或间接包含和被包含的关系

## 兄弟关系

## 拥有共同父元素的元素
```html
  */

 	<div>

		<div>

			<div></div>

			<div></div>

		</div>

	</div>

  </body>

</html>
```
## CSS属性选择器
```html
      /* 需求一：有title属性的p标签，颜色变为红色 */
```
**1:属性选择器  通过指定的属性名或属性值来选中对应的内容**
```html
           语法：[属性名]{} 选择含有指定属性的元素

[属性名=属性值]{} 选择含有指定属性和属性值的元素

                 [属性名^=属性值]{} 选择属性值以指定值开头的元素  //开头 ^

                 [属性名$=属性值]{} 选择属性值以指定值结尾的元素  //结尾 $

                 [属性名*=属性值]{} 选择属性值含有某值的元素      //含有 *

 /*   [class]{

      color: red;

    } */

/*    [title=ab]{

      background-color: pink;

    } */

  /* [title^=ab]{

      font-size: 30px;

    } */

/*    [title$=ab]{

      color: orange;

    } */

    [title*=abc]{

      color: green;

    }

    </style>

  </head>

  <body>

    <h1 title="a" id="abcd">满江红·写怀</h1>  <!-- title属性，鼠标点哪，会显示属性值 -->

    <h3 title="ab" class="ab">岳飞·宋</h3>

    <p>····</p>

    <p title="babcb" class="abc">靖康耻，犹未雪。臣子恨，何时灭！</p>

    <p title="babcdab">驾长车，踏破贺兰山缺。</p>

    <p>壮志饥餐胡虏肉，笑谈渴饮匈奴血。</p>

    <p>待从头、收拾旧山河，朝天阙。</p>

  </body>

</html>
```
## 伪类选择器

**一 、伪类（不存在的类，特殊的类）**
```html
          -伪类不特指某一个元素，指的是一个元素的特殊状态 // 元素的特殊状态
```
           -比如：第一个元素，被点击的元素，鼠标移入的元素···

          -特点：一般请情况下，**使用：开头**

**1、 :first-child  第一个子元素**

**			 先选位置，再判断元素**

**             2、 :last-child   最后一个子元素**

**             3、 :nth-child()  选中第n个子元素**

## 特殊值： n    所有的

**                          2n或even  选中偶数**

**                          2n+1或odd  选中奇数**
```html
         <!-- 以上这些伪类都是根据所有的子元素进行排序 -->
```
**1、:first-of-type  选中第一个子元素**

**			 先找元素，再判断位置**

**             2、:last-of-type    选中最后一个子元素**

**             3、:nth-of-type()   选中第n个子元素**

**                  功能跟上面相似，**

**              不同的是，这是在同类型的子元素中去选择**

    需求： ul里面的第一句诗永远是红色
```html
       li:first-of-type{

        color: red;

      }
```
## 二、:not() 否定伪类

## -将符合条件的元素从选择器中去除

       需求2:将所有li字体变绿色，除了class为l1
```html
 li:not(.l1) {

        color: green;

      }

	    ul  li:nth-child(2n+1){

		  color: red;

	  }

	 ul p:first-of-type{

		  color: red;

	  }
```
## a元素的伪类

## a元素的伪类  访问过、未访问过、鼠标移入/点击的状态等
```html
      /* 需求一：给未访问过的超链接加红色字体 */
```
**1、:link  用来表示未访问过的链接（正常链接）**
```html
      a:link {

        color: red;

      }

      /* 需求二：给访问过的超链接加绿色字体 */
```
**2、:visited 用来表示访问过的链接**

               由于隐私的原因，所以visited只能改颜色
```html
      a:visited{

        color: orange;

        font-size: 50px;

      }

<!-- 注意：:link :visited 这两个伪类是超链接独有 -->

      /* 需求三：鼠标移入，链接字体变大到30px */
```
**3、:hover 用来表示鼠标移入的状态**
```html
      a:hover{

        font-size: 30px;

        color: red;

      }

      /* 需求四：鼠标点击后，增加背景色pink */
```
**4、:active  鼠标点击后的状态**
```html
      a:active{

        background-color: pink;

      }

<!-- 注意：:hover、:active 是所有标签共有的伪类 -->

      love hate //都出现的话，有顺序
```
## L-V-H-A

a，LVHA 伪类-超连接：你先捡到了个LV包，然后你HA哈大笑。

l（link）ov（visited）e h（hover）a（active）te
```html
      strong:hover{

        color: palegreen;

      }

      strong:active{

        background-color: pink;

      }

    </style>

  </head>

  <body>

    <strong>百度</strong>

    <a href="https://www.baidu.com/">百度</a>

    <a href="https://www.jd.com/">京东</a>

    <a href="https://www.taobao.com/">淘宝</a>

    <a href="#">空链接</a>

  </body>

</html>
```
## 伪元素选择器
```html
    <style>

      /* 需求一：让文章的首字母一直为字体为24px */

      /* 需求二：让文章的第一行添加背景色黄色 */

      /* 需求三：让选中的内容，字体为红色 */

      /* 需求四：在元素开始的位置前+'abc' */
```
**伪元素，表示页面中一些特殊的并不真实存在的元素（元素的位置）**

## ::first-letter  表示第一个字母

## ::first-line  表示第一行

## ::selection  选中的内容

## ::before  元素的开始位置

## ::after   元素的结束位置
```html
before和after必须要结合content使用 //在元素的开始或结束位置加内容

               <!-- 加的内容是行内元素 -->
```
**行内，after，before**
```html
    p::first-letter{

      /* color: red; */

      font-size: 40px;

    }

    p::first-line{

        color: rgb(143, 34, 34);

    }

    div::selection{

      background-color: pink;

	  color: red;

    }

    div::before{

      content:'你好' ;

    }

    div::after{

      content: 'hello';

    }

	p::before{

		content:'';

		display: inline-block;

		width: 16px;

		height: 16px;

		background-color: red;

	}

   </style>

  </head>

  <body>

    <div>Lorem ipsum dolor sit amet.</div>

    <p>
```
      结核杆菌dolor sit amet consectetur adipisicing elit. Dicta, dignissimos?

      的三九由，导不竟德。
```html
    </p>

  </body>

</html>
```
## 样式的继承（继承祖先的资产）

定义：**为一个元素设置的样式，同时也会应用到它的后代元素上**

优势：**方便**我们**开发**，讲一些通用的样式统一设置到共同的祖先元素上，子元素的样式都可以获取到样式

**注意：并不是所有的样式都会被继承，比如：背景相关的，布局相关等不会被继承**

## 选择器的权重

**样式冲突通过不同的选择器选中同一个元素，进行一样的样式设定**

**发生样式冲突时，应用哪一个样式由选择器的权重（优先级）决定**
```html
    <style>

      /* 需求：给span设置背景色 */

      span{

        background-color: pink !important;

      }

      /* span,.s1 {

        background-color: royalblue;

      }

      .s1 {

        background-color: red;

      } */

      /* #ss{

        background-color: green;

      } */

      /* div>span{

        background-color: orange;

      } */

      /* [class] {

        background-color: orchid;

      } */

      /*  div{

        background-color: paleturquoise;

      } */

      /*  *{

        background-color: peru;

      } */
```
      面试题：

      选择器权重              权重（模拟）

## !important            最高的优先级

## 内联样式              1000

## id选择器               100

## class选择器             10

## 类和伪类选择器          10

## 属性选择器              10

## 元素选择器               1

## 通配选择器               0

## 继承样式               没有权重

## ·····

注意：

1、对比选择器权重的时候，如果是**交集选择器**的话，需要将所有选择器**权重相加**，最终谁高用谁

2、对比选择器权重的时候，如果是**并集选择器**的话,**单独计算选择器权重**，谁高听谁的

3、对比选择器权重的时候，如果**选择器权重是相同**的，谁**靠下**，用谁的
```html
4、对比选择器权重的时候，累加的选择器权重，最高不会超过上一级 //例如：类选择器再高也不会超过id选择器
```
5、**!important   最高的优先级**  慎用   ！important写在样式里

如果样式没有生效，可用来检测是否是选择器权重

再者一般用来修改插件的样式
```html
      /* .s1.s2.s3.s11{

        background-color: salmon;

      }

      #ss{

        background-color: seagreen;

      } */

    </style>

  </head>

  <body>

    <div>
```
      我是div元素
```html
      <span class="s1 s2 s3 s4 s11" id="ss" style="background-color: purple;">我是div中的span元素</span>

    </div>

  </body>

</html>
```
## 长度单位

**1:像素 px**

     			- 像素是我们在网页中使用的最多的一个单位，

     				一个像素就相当于我们屏幕中的一个小点，

     				我们的屏幕实际上就是由这些像素点构成的

      				但是这些像素点，是不能直接看见。

     			- 不同显示器一个像素的大小也不相同，

				**显示效果越好越清晰，像素就越小，反之像素越大**。

		**2:百分比 %**

     			- 也可以将单位设置为一个百分比的形式，

     				这样浏览器将会**根据其父元素的样式来计算**该值

     			- 使用百分比的好处是，当父元素的属性值发生变化时，

     				子元素也会按照比例发生改变

     			- 在我们创建一个自适应的页面时，经常使用百分比作为单位

## em

     			- em和百分比类似，它是**相对于当前元素的字体大小来计算的**

     			- **1em = 1font-size**

## 浏览器默认字体大小是16px

     			- 使用em时，当字体大小发生改变时，em也会随之改变

     			- **当设置字体相关的样式时，经常会使用em**

## rem

             -rem是**相对于根元素(html)的字体大小来计算的**

             比如根标签的字体大小是25px,那么设置rem根据25px来计算，**10rem=10*25px**
```html
      html {

        /* 注意：根标签html的字体大小  1rem=1font-size */

        font-size:25px;

      }

      .box {

        width: 400px;

        height: 300px;

        background-color: red;

      }

      .box1 {

        /* em根据当前的字体大小去计算，1em=1font-size(font-size:20px;) //1em=20px*/

        font-size:20px;

        /* width: 10em;

        height: 15em; */

        /* width:200,height:300 */

        /* rem计算盒子大小 */

        width:8rem;

        height: 12rem;

        /* width: 50%;

        height: 100%; */

        /* width: 200px;

        height: 200px; */
```
## 颜色单位：

	**1:**在CSS可以**直接**使**用**颜色的**单词**来表示不同的颜色

	 	红色：red  蓝色：blue  绿色：green

		    黄色：yellow

		 注意： 这种用的比较少  不好描述，难记

**2:**使用**RGB值**来表示不同的颜色

			- 所谓的RGB值指的是通过**Red Green Blue三元色**，

				通过这三种颜色的**不同的浓度**，来**表示**出不同的颜色

			- 例子：rgb(红色的浓度,绿色的浓度,蓝色的浓度);

				- **颜色的浓度**需要一个**0-255之间的值**，255表示最大，0表示没有

				- 浓度也**可以**采用一个**百分数**来设置，

				    需要一个**0% - 100%**之间的数字

					使用百分数最终也会转换为0-255之间的数

					0%表示0

				100%表示255

            -**语法：RGB(红色，绿色，蓝色)**

			-注意：比较常用，计算机可以很好的识别

**	3:RGBA**

		    **-语法：RGBA(红色，绿色，蓝色，透明度)**

			**a:透明度（0-1） 1不透明，0透明**

	**4:**使用**十六进制的rgb值**来表示颜色，原理和上边RGB原理一样，

		   十六进制：

				0 1 2 3 4 5 6 7 8 9 a b c d e f

			00 - ff

	 		00表示没有，相当于rgb中的0

			ff表示最大，相当于rgb中255

 		只不过使用十六进制数来代替，使用三组两位的十六进制数组来表示一个颜色

	 		每组表示一个颜色

	                    第一组表示**红色**的浓度，范围**00-ff**

	 					第二组表示**绿色**的浓度，范围是00-ff

	 					第三组表示**蓝色**的浓度，范围00-ff

	 		**语法：#红色绿色蓝色;**

	 		红色：
```html
				#ff0000
```
			像这种**两位两位重复的颜色，可以简写**

				比如：#ff0000 可以写成 #f00
```html
				#abc  #aabbcc
```
	          常用的十六进制颜色：**#f00 红色  #f60 橘色  #ccc 灰色  **
```html
			                   #0f0 绿色  #000黑色  #fff 白色
```
	      **5:HSL值  HSLA值**

		     H 色相 （0-360）hue  [hju:]

			 S 饱和度 saturation [,sætʃə'reiʃən]  颜色浓度0%-100%

			 L 亮度  lightness [ˈlaɪtnəs]  颜色亮度0%-100%

			 A 透明度  alpha  ['ælfə]
```html
			.box1{

				width:300px;

				height: 300px;

				/* 透明度 */

				/* opacity:0.5; */

				background-color:rgba(255, 0, 0,.5);

			}

			.box2{

				width:300px;

				height: 300px;

				/* background-color: rgb(233,23,23); */

				/* background-color: rgba(255, 0, 0, .5); */

				/* background-color:rgb(255,127,127); */

				background-color: hsla(0, 0%, 0%,.5);

			}
```
## 字体样式
```html
1:color设置字体颜色,也可以设置其他颜色*/

				color: red;
```
**2:font-size**

注意：

(1)、设置的并不是文字本身的大小，在页面中，每个文字都是处在一个看不见的框中的，我们设置的**font-size实际上是设置格的高度**，并不是字体的大小，一般情况下文字都要比这个格要小一些，也有时会比格大，根据字体的不同，显示效果也不同

(2)、**设置文字的大小**,浏览器中一般**默认**的文字**大小都是16px,**默认的**最小**的字体是**12px**

(3)、**常用的单位  px，rem，em**

**3:font-family可以指定文字的字体**

				 * 	当采用某种字体时，如果浏览器支持则使用该字体，

				 * 		如果字体不支持，则使用默认字体

				 *      该样式可以同时指定多个字体，多个字体之间使用,分开

				 * 	    当采用多个字体时，浏览器会优先使用前边的字体，

				 * 		如果前边没有在尝试下一个
```html
				/*
```
				 * 浏览器使用的字体默认就是计算机中的字体，

				 * 	如果计算机中有，则使用，如果没有就不用

				 * 在开发中，如果字体太奇怪，用的太少了，尽量不要使用，

				 * 	有可能用户的电脑没有，就不能达到想要的效果。
```html
				 */

				/* font-family: '华文彩云' , arial , '微软雅黑'; */

			span{

				font-family: 'sans-serif';

			}
```
1. **@font-face  可以自定义使用非电脑自带字体**
```html
<!-- 可以将服务器中的字体直接提供给用户去使用 -->
```
	            属性： 给字体起的名字

      使用步骤

**         （1）、先自定，设置好字体**

## （2）、去使用即可
```html
@font-face {

        /* 你给字体起的名字 */

        font-family: "xiyangyang";

        /* 自定义字体的路径 */

        src: url(./字体/MeowScript-Regular.ttf);

      }

        font-family: "xiyangyang";
```
## 字体分类
```html
  <body>
```
			在网页中将字体分成**5大类**：

## serif  ['serif]（衬线字体）//笔锋
```html
          sans-serif（非衬线字体）//无笔锋，默认
```
## monospace （等宽字体）

## cursive ['kə:siv]（草书字体）

## fantasy  ['fæntəsi]（虚幻字体）

			可以将字体设置为这些大的分类,当设置为大的分类以后，

				浏览器会自动选择指定的字体并应用样式

			一般会将**字体的大分类，指定为font-family中的最后一个字体,用来兜底**

## 字体其他样式

 * **1:font-style**可以用来设置**文字的斜体**

	* 可选值：

	* 	**normal，默认值，文字正常显示**

	* 	**italic  [i'tælik] 文字会以斜体显示**

	* 	oblique   [ə'bli:k]文字会以倾斜的效果显示

	* 	- 大部分浏览器都不会对倾斜和斜体做区分，

	* 	也就是说我们设置**italic和oblique它们的效果往往是一样的**

	*  一般我们只会使用italic
```html
				font-style: italic;
```
* **2:font-weight可以用来设置文本的加粗效果：**

    * 可选值：

* 	**normal，默认值，文字正常显示**

	* 	**bold，文字加粗显示**

	* 	该样式也可以指定**100-900之间的9个值**，

	* 	但是由于用户的计算机往往没有这么多级别的字体，所以达到我们想要的效果

也就是200有可能比100粗，300有可能比200粗，但是也可能是一样的
```html
				 font-weight:bold;

				font-weight:bolder;
```
*** 3:font-variant ['vεəriənt] 可以用来设置小型大写字母**

* 	可选值：

* 	**normal，默认值，文字正常显示**

*** 	small-caps 文本以小型大写字母显示**

* 小型大写字母：

* 将所有的字母都以大写形式显示，但是小写字母的大写，要**比大写字母的大小小一些**。
```html
				 font-variant: small-caps;

			.p2{

				color: red;

				/*设置一个文字大小*/

				/* font-size: 18px; */

				/*设置一个字体*/

				/* font-family:'三极魏碑简体'; */

				/*设置文字斜体*/

				/* font-style: italic; */

				/*设置文字的加粗*/

				/* font-weight: bolder; */

				/*设置一个小型大写字母*/

				/* font-variant: small-caps; */
```
				font: small-caps italic bolder 18px "三极魏碑简体"
```html
			}
```
* 在CSS中还为我们提供了一个样式叫font，

* 	使用该样式可以同时设置字体相关的所有样式,

* 	可以将字体的样式的值，统一写在font样式中，**不同的值之间使用空格隔开**

* 使用**font设置字体样式**时，**斜体 加粗 小大字母，没有顺序要求，甚至可写可不写，如果不写则使用默认值，但是要求文字的大小和字体必须写，而且字体必须是最后一个样式，大小必须是倒数第二个样式**

* 实际上使用**简写**属性也会有一个比较好的性能
```html
				/* font: small-caps bold italic 60px "微软雅黑"; */

				/* font: 60px "微软雅黑"; */

				/* font: 60px "微软雅黑"; */

				font-family:  "华文彩云";
```
## 行间距

## 行高（line height）--文字占有的实际高度

* 使用line-height来设置行高

* 行高类似于我们上学单线本，单线本是一行一行，**线与线之间的距离就是行高**，控制文字行与行之间的距离

* 网页中的文字实际上也是写在一个看不见的线中的，而文字会默认在行高中垂直居中显示

——	可**接收的值**：

				 1.直接就写一个大小，**eg：22px**

				 2.可以指定一个**百分数**，则会**相对于字体**去计算行高，**eg：30%**

				 3.可以直接传一个**数值**，则行高会**设置字体大小相应的倍数**，**eg：2**

—— 行高经常还用来设置文字的行间距

## 行高=上间距+文字高度+下间距

				  行间距 = 行高 - 字体大小

	字体框

			字体框是字体纯在的格子，设置**font-size**实际上就是在**设置字体框的高度**

			总结：

## 行高会在字体框的上下平均分配
```html
      .p1 {

        font-size: 20px;

        height: 100px;

        border: 1px solid red;

        line-height:5;

        /* 默认行高 */

        /* line-height: 1.333; */

      }

      .box {

        width: 200px;

        height: 100px;

        background-color: #bfa;
```
* 对于**单行文本**来说，可以将**行高设置为和父元素的高度一致**，这样可以是单行文本在父元素中**垂直居中**
```html
      .p2 {

        /*
```
在font中也可以指定行高，在**字体大小后**可以添加**/行高**，**来指定行高**，该值是可选的，如果**不指定则会使用默认值**
```html
				 */

        /* font: 30px/100px "微软雅黑"; */

        border: 1px solid  red;

        /* line-height: 50px; */

      }
```
## 文本样式

** 1: text-transform** 可以用来**设置文本的大小写**

        transform [træns'fɔ:m] 是变形的意思，使变化的意思

			可选值：

			**none 默认值**，该怎么显示就怎么显示，**不做任何处理**

			**capitalize **[ˈkæpɪtəlaɪz] 单词的**首字母大写**，通过空格来识别单词

## uppercase  [ˈʌpəˌkeɪs] 所有的字母都大写

## lowercase  ['ləuə,keis] 所有的字母都小写
```html
         text-transform: lowercase;

      }
```
**2: text-decoration**  [dɛkə'reɪʃ(ə)n] 可以用来**设置文本的修饰**

	可选值：

		**none：默认值**，不添加任何修饰，**正常显示**

		**underline **为文本添加**下划线**

		**overline** 为文本添加**上划线**

		**line-through** 为文本添加**删除线**
```html
         /* text-decoration: overline; */

         text-decoration: line-through;

      a {

        /*超链接会默认添加下划线，也就是超链接的text-decoration的默认值是underline
```
				 	如果需要**去除超链接的下划线**则需要将该样式设置为none
```html
				  */

          text-decoration: none;

      }
```
**3: letter-spacing可以指定字符间距**
```html
        letter-spacing: 10px;
```
**4: word-spacing**可以**设置单词之间的距离**
```html
				  	 <!-- 实际上就是设置词与词之间空格的大小,对汉字无效 -->

       /* word-spacing: 100px; */
```
**5: text-align**用于**设置文本的对齐方式**

		可选值：

		**left 默认值，文本靠左对齐**

**		right ， 文本靠右对齐**

**		center ， 文本居中对齐**

**		justify ， 两端对齐**

				  	- 通过调整文本之间的空格的大小，来达到一个两端对齐的目的

## 也可以让图片水平居中
```html
        text-align: center;
```
** 6: text-indent 设置首行缩进**

			指定一个**正值**时，会自动**向右**侧缩进指定的像素

			指定一个**负值**，则会**向左**移动指定的像素,

			通过这种方式**可以将**一些不想显示的**文字隐藏**起来

			这个值一般都会使用em作为单位
```html
         text-indent:-2em;

7: white-space: ; 设置网页如何处理空白
```
                可选值：

## x` 正常

## nowrap 不换行

## per 保留空白

**8: text-overflow 文本溢出包含元素时发生的事情**。

             可选值：

               **  clip	修剪文本。**

**                ellipsis**	  [i'lipsis] **显示省略符号来代表被修剪的文本。**
```html
       white-space: nowrap;

       overflow: hidden;

       text-overflow: clip;

 单行文本省略号，white-space:nowrap; 设置网页不换行，隐藏溢出的，显示省略号

/* vertical-align:middle; */
```
**9:vertical-align  设置元素垂直对齐的方式**

              可选值：

## baseline 默认值 基线对齐

## top 顶部对齐

## bottom 底部对齐

## middle 居中对齐

应用：**1:图文垂直对齐方式**

**      2:图片三像素的问题  **

        父元素如果不设置高，由图片撑开，此时图片的底部就会有三像素的空白

                  解决方式**一：vertical-align属性值不为默认值**

                  解决方式**二：给图片转成块元素**

                  解决方式**三：给父元素设置font-size为0**

                  解决方式**四：使元素脱离文档流，如浮动，绝对定位，弹性盒子等**

注意 **vertical-align** 只对行内元素、行内块元素和表格单元格元素生效：**不能用它垂直对齐块级元素。         **
```html
      /* 图文的对齐方式 */

      .img2{

        /* display: block; */

       vertical-align:middle;

      }

      .box{

        border: 1px solid red;

        width: 300px;

        /* font-size: 0; */

      }

      .box>img{

        /* vertical-align:bottom; */

        /* display: block; */

      }
```
图片三像素问题是指在网页布局中，当**图片作为行内元素或行内块元素与文本处于同一行时，图片底部会出现三像素的空白间隙**。**这是由于浏览器默认的垂直对齐方式为基线对齐，而文本的基线与图片底部有一定的间距。**

解决方式主要有以下几种：

1. 设置vertical-align属性：将图片的vertical-align属性值设置为非默认值，如top、middle、bottom等，可以改变图片的垂直对齐方式，从而消除三像素空白。

2. 将图片转换为块元素：通过设置display:block，使图片变为块级元素，它将独占一行，不再与文本基线对齐，从而解决三像素问题。

3. 设置父元素的font-size为0：这会使父元素内的文本基线位置上移，进而消除图片底部的空白，但需要注意的是，这种方式可能会影响到父元素内其他文本的显示，需要对文本重新设置合适的字体大小。

4. 使元素脱离文档流：如使用浮动（float）、绝对定位（position:absolute）或弹性盒子（display:flex）等布局方式，让图片脱离文档流的影响，也可以解决三像素问题。
```html
10: text-shadow: h-shadow v-shadow blur color;
```
                **参数1:必需。水平阴影**的位置。允许负值。

                **参数2:必需。垂直阴影**的位置。允许负值。

                参数3**:可选**。模糊的距离。

                参数4**:可选**。阴影的颜色 一般用**rgba **
```html
        text-shadow:-2px -3px 1px rgba(255, 0, 0, .1);
```
## 多行文本省略号

**多行文本省略号**，对于webkit，

display: -webkit - box和 -webkit - box - orient: vertical这两个属性一起使用，**将元素设置**为一个垂直排列的**弹性盒子**。

-webkit - line - clamp: 3是关键属性，它**指定**了**显示的行数**为 3 行。当文本内容超过 3 行时，**超出的部分会被隐藏**。

overflow: hidden用于**隐藏溢出的文本**部分。这种方法在非 WebKit 浏览器中可能不被支持，需要添加浏览器前缀来确保兼容性。
```html
        overflow: hidden;

        display: -webkit-box;

        -webkit-line-clamp: 2;

        -webkit-box-orient:vertical;
```
        缺一不可

适用范围：

      因使用了WebKit的CSS扩展属性，该方法适用于WebKit浏览器及移动端；

注：

-**webkit-line-clamp**用来**限制在一个块元素显示的文本的行数**。

为了实现该效果，它需要组合其他的WebKit属性。常见结合属性：
```html
display: -webkit-box; 必须结合的属性 ，将对象作为弹性伸缩盒子模型显示 。
```
-**webkit-box-orient** 必须结合的属性 ，**设置或检索伸缩盒对象的子元素的排列方式 。**

## vertical 从上到下垂直排列子元素

## 文档流

文档流（normal flow）

		-网页是一个多层的结构，一层叠着一层，通过css可以分别为每一层来设置样式

		-作为用户来讲，只能看到最顶上一层

		-文档流处在网页的最底层，文档流是网页的基础，

        它表示的是一个页面中的位置，

		我们所创建的元素默认都处在文档流中，在其上排列

		-元素主要有两个状态，在文档流中，不在文档流中（脱离文档流）

元素在文档流中的特点

## 块元素

			1.块元素在文档流中会**独占一行**，块元素会**自上向下排列**。

			2.块元素在文档流中**默认宽度是父元素的100%**

			3.块元素在文档流中的**高度默认被内容(子元素)撑开**

		内联元素（**行内元素**）

			1.内联元素在文档流中**只占自身的大小**，会默认**从左向右排列**，如果一行中不足以容纳所有的内联元素，则换到下一行，继续自左向右。

			2.在文档流中，内联元素的**宽度和高度默认都被内容撑开**

## 盒子模型

把元素布局到页面，就像想买个桌子，放到家里，要知道桌子的大小，形状，然后才能放到家里，所以我们把所有的元素都想成盒子，矩形

盒模型、盒子模型、框模型（box model）

## css将页面中所有元素都设置为一个矩形的盒子

	-将元素设置为矩形的盒子后，对页面的布局就变成了不同的盒子摆放到不同的位置

	-每一个盒子，都有以下几个部分组成

## 内容区(content)

## 内边距(padding)

## 边框(border)

## 外边距(margin) 决定位置

			-**盒子可见框的大小由内容区，内边距和边框共同决定**

**1:内容区(content) 元素中所有的子元素和文本内容都在内容区中排列**

			* 使用**width**来设置盒子内容区的**宽度**

			* 使用**height**来设置盒子内容区的**高度 **

			* width和height只是设置的盒子内容区的大小，而不是盒子的整个大小，
```html
        width: 300px;

        height: 300px;

        background-color: #bfa; /*设置背景颜色*/
```
**2:边框（border）元素设置边框**

			边框属于盒子边缘，边框里面属于盒子内部，出了边框都是盒子的外部

## 设置边框必须指定三个样式

		* 		**border-width:边框的宽度  **

**		* 		border-color:边框颜色  **

**		* 		border-style:边框的样式**

		边框的大小会影响整个盒子的大小
```html
		border-width: 10px;

		border-color: #ff0;

		border-style: dashed;

		padding: 10px;

		margin: 10px;
```
## 盒子边框
```html
			.box{

				width: 300px;

				height: 200px;

				background-color: rgb(222, 255, 170);}
```
## 设置边框

	大部分的浏览器中，边框的宽度和颜色都是有默认值，而**边框的样式默认值都是none**

		设置上2px,下4px,左边6px, 右边1px
```html
				 border-width: 2px 1px 4px 6px;
```
		设置 上下4px 左右6px
```html
				 border-width: 4px 6px;
```
		设置 上4px 左右6px 下2px
```html
				border-width:4px 6px 2px;

				/* border-color: #f00; */

				/* border-style: dotted; */
```
**1:border-width  默认值一般是3px**

		使用**border-width可以分别指定四个边框的宽度**

		如果在border-width指定了四个值，则四个值会分别设置给 上 右 下 左，按照顺时针的方向设置的

		如果指定三个值，则三个值会分别设置给	上  左右 下

		如果指定两个值，则两个值会分别设置给 上下 左右

		如果指定一个值，则四边全都是该值

除了border-width，CSS中还提供了四个**border-xxx-width**，xxx的值可能是**top right bottom left**

## 专门用来设置指定边的宽度
```html
				 border-bottom-width:1px;

				 border-bottom-style: dashed;

				 border-bottom-color:#ccc;
```
四个值设置边框大小顺序上右下左

三个值设置边框的大小顺序上 左右 下

两个值设置边框的大小 上下 左右

**2:border-color**

## 设置边框的颜色  默认值是黑色

			和宽度一样，**color也提供四个方向**的样式，可以分别指定颜色

## border-xxx-color

**3:border-style**

## 设置边框的样式

				 可选值：

				** * 	none，默认值，没有边框**

**				 * 		solid 实线**

## double 双线

## dashed [dæʃt] 虚线

**				 * 		dotted ['dɔtid] 点状边框**

				 * style也可以分别指定四个边的边框样式，规则和width一致，

				 * 	同时它也提供**border-xxx-style**四个样式，来分别设置四个边
```html
				 	/* 统一设置 */

					border: 1px dotted #f00;

					/* 单独设置 */

					/* border-top:1px solid #ff0;

					border-left:1px solid #fc0;

					border-right:1px solid #f00;

					border-bottom:1px solid #cf0; */

* border
```
	 * 	- 边框的**简写样式**，通过它可以同时设置四个边框的样式，宽度，颜色

		* 	- 而且**没有**任何的**顺序要求**

		* 	- border一指定就是同时指定四个边不能分别指定

		* border-top border-right border-bottom border-left

		* **可以单独设置四个边的样式**，规则和border一样，只不过它只对一个边生效
```html
			.box2{

				width: 400px;

				padding: 10px 0;

				border-bottom: 1px solid #ccc;

			}
```
## 内边距（padding）：

内容区和边框之间的距离，它会影响到盒子的大小

（1）、分别给**每边设置内边距**
```html
        padding-top: ;

        padding-right: ;

        padding-bottom: ;

        padding-left: ;
```
（2）**padding简写**

        padding后可以写多个值

          4个值

          3个值

          2个值

          1个值

## 规则跟之前讲的border-width是一样
```html
      .box1 {

        width: 100px;

        height: 100px;

        background-color: #bfa;

        border: 10px solid orange;

        /* 设置内边距 */

        /* padding-top:40px ;

        padding-right: 40px;

        padding-bottom: 40px;

        padding-left: 40px; */

       padding:40px;

	 /*   margin-bottom: 20px; */    }
```
* 需求：创建一个子元素box2占满box1，box2把内容区撑满了
```html
       .box2{

         width: 100%;

         height: 100%;

         background-color: red; }
```
## 外边距

		* **外边距指的是当前盒子与其他盒子之间的距离**，

				 * 	**他不会影响可见框的大小，而是会影响到盒子的位置。**

		* 盒子有四个方向的外边距：

				 * 	**margin-top**

				         **上外边距**，设置一个正值，元素会向下移动

				 * 	**margin-right**

				         **默认情况下**设置margin-right**不会产生任何效果**

				 * 	**margin-bottom**

				         **下外边距**，设置一个正值，其下边的元素会向下移动，**挤别人**

				 * 	**margin-left**

				         **左外边距**，设置一个正值，元素会向右移动

				 * 由于页面中的元素都是靠左靠上摆放的，

				 * 	所以当我们设置**上和左**外边距时，会导致盒子**自身的位置发生改变**，

				 * 	而如果是设置**右和下**外边距会**改变其他盒子的位置（挤别人）**

	外边距也可以指定为一个**负值**，如果外边距设置的是负值，则元素会向**反方向移动**

	外边距同样可以使用**简写**属性 margin，可以同时设置四个方向的外边距,**规则和padding一样**

## 元素的水平方向的布局

    元素的水平方向的布局

           元素在其父元素中**水平方向的位置**由以下几个属性共同**决定**

**margin-left border-left padding-left width  padding-right  border-right margin-right**

    **一个元素在其父元素中**，水平布局必须要满足以下的等式

    margin-left + border-left + padding-left + width + padding-right + border-right + margin-right

        =父元素内容区的宽度（**必须满足**）

    举例：子元素 inner七个元素的值如下

       0 +0 + 0+ 200 + 0 + 0 + 0 =600  ？？不成立

    以上等式必须满足，如果相加结果等式不成立，则称为过度约束，则浏览器会让等式自动调整

       -调整的情况

          1:如果七个值中**没有auto**情况，则**浏览器会调整margin-right值**以使等式满足

              0 +0 + 0+ 200 + 0 + 0 + 400 =600

          2:这7个值中**width，margin-left，margin-right，这三个值可以设置auto**

            如果**有设置auto**，则**浏览器会自动调整auto的值**，以使等式成立

            0 +0 + 0+ auto + 0 + 0 + 0 =600   auto=600

            0 +0 + 0+ auto + 0 + 0 + 200 =600   auto=400

          3:如果将一个宽度和一个外边距设置为auto，则宽度会调整到最大

          4:如果三个值都是auto，也只会调整宽度

          5:如果将两个外边距设为auto，宽度固定，则两侧外边距会设置为相同的值

              会使元素自动在父元素中居中，所以我们经常将左右外边距设置为auto
```html
     /* 有宽先调宽，宽固定，再调两边 */

      .inner {

        width: 200px;

        margin:0  auto;

        height: 200px;

        background-color: sandybrown;

      }

<style>

      .outer {

        background-color: sandybrown;

        /* height: 400px; */

      }

      .inner {

        width: 100px;

        height: 100px;

        background-color: yellowgreen;

        margin-bottom: 100px;

      }

      /* 默认情况下，父元素的高度是被子元素撑开的，

              若父元素设置了，就是设置多少就是多少 */

      .box1 {

        width: 700px;

        /* white-space: nowrap; */

        height: 100px;

        background-color: #bfa;

        overflow:auto;

      }
```
子元素是在父元素的内容区中排列的，如果子元素的大小超过了父元素，则子元素会从父元素中溢出

        使用**overflow**属性**设置父元素如何处理溢出的子元素**

            可选值：

              ** visible  默认值**  子元素会从父元素中溢出，**在父元素外部的位置显示**

              ** hidden溢出**的内容将会被裁剪**不会显示**

               **scroll生成两个滚动条**，通过滚动条来查看完整的内容

## auto 根据需要生成滚动条

         额外两个属性，了解一下

## overflow-x    生横轴时注意换行

## overflow-y
```html
    </style>

  </head>

  <body>

     <div class="outer">

        <div class="inner"></div>

        <div class="inner"></div>

    </div>

    <div class="box1">

    </div>

  </body>
```
## 外边距的重叠
```html
    <style type="text/css">

      .box1 {

        width: 100px;

        height: 100px;

        background-color: red;
```
				 * 为上边的元素设置一个下外边距
```html
         margin-bottom:10px;

      }

      .box2 {

        width: 100px;

        height: 100px;

        background-color: green;
```
				 * 为下边的元素设置一个上外边距
```html
         margin-top: -10px;

      }
```
* **垂直外边距的重叠**

*   - 在网页中相邻的垂直方向的外边距，会发生外边距的重叠

    -**兄弟元素**

* 		兄弟元素之间的**相邻外边距会取最大值**而不是取和，**谁大听谁的**

        特殊情况：如果相邻的外边距**一正一负**，则**取两者的和**

		         如果相邻的外边距**都是负值**，则**取绝对值较大**的

		兄弟元素的外边距重叠，对开发有利，不用处理

需求：将子元素移动到父元素的左下角

## -父子元素

 		**如果父子元素的垂直外边距相邻了，则子元素的外边距会传递给父元素**

## 暂时解决方案：

         **1:不用外边距  **

**         2:使不相邻**

## transparent透明

当父元素没有内边距（padding）、边框（border）或者内容将其与子元素分隔开时，子元素的外边距会与父元素的外边距发生塌陷。
```html
 .outer {

        width: 200px;

        /* height: 200px; */

        height: 200px;

        background-color: yellow;

        /* overflow: hidden; */

        /*改变padding的时候同时改变盒子的高度 */

        /* padding-top:100px; */

        /* border: 1px solid transparent; */

        /* 开启元素的隐含属性 overflow，BFC */

        /* BFC（Block Formatting Context，块格式化上下文） 是Web页面的可视化CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。 */

        /* BFC简单理解子元素不会影响到其他元素 */

        /* overflow: hidden; */

        /* margin-top: 100px; */
```
**方案1:用padding ，改父元素高度**
```html
        /* padding-top: 100px;

        height: 100px; */
```
**方案2:为outer设置一个上边框会改变盒子的大小，有个1px的边框 transparent**
```html
        /* border: 1px solid transparent; */
```
## 添加边框（border）

+ 原理：通过给父元素添加边框，可以将父元素和子元素在视觉上和布局逻辑上分隔开，阻止外边距的塌陷。

+ **给父元素添加了一个透明的边框**（border: 1px solid transparent），这样就防止了子元素的上外边距使父元素一起向下移动。边框的宽度和样式可以根据实际设计需求进行调整。

## 添加内边距（padding）

+ 原理：内边距在父元素内部创造了一个空间，使得子元素的外边距不会直接与父元素的外边距相互影响，从而避免塌陷。

+ **这里给父元素添加了 1px 的上内边距**（padding - top: 1px），这就有效地分隔了父元素和子元素的外边距，解决了塌陷问题。内边距的大小可以根据具体情况进行调整，不过要注意它会影响元素内部的空间布局。

## 触发块格式化上下文（BFC）

+ 原理：**BFC **是 CSS 中的一个概念，它是一个**独立的布局环境**，其中的**元素布局不会影响到外面的元素，也不会被外面的元素所影响**。通过触发父元素的 BFC，可以避免外边距塌陷。

+ **给父元素设置了overflow: auto，**这就触发了父元素的 BFC，使得子元素的外边距不会与父元素的外边距塌陷。除了auto，**overflow:hidden**等其他非visible的值**也可以**触发 BFC。

## 行内元素的盒模型

	从这几点分析：内容区、内边距 、边框 、外边距

## 行内元素的盒模型

		**1: 不能设置width和height，被内容撑开**

		2: 可以设置padding，但**垂直方向padding不会影响页面的布局**，不会挤别人

		3: 可以设置边框，但是**垂直的边框不会影响到页面的布局**，不会挤别人

		4: 可以设置水平方向的外边距，**水平方向的相邻外边距不会重叠，而是求和**，但**不支持垂直外边距**
```html
			/* 需求：给超链接设置一个大小100px的大小宽高 */

			a{

				width: 100px;

				height: 100px;

				display: block;

				background-color: #f60;

			}

			/* 鼠标放上去我的超链接盒子消失 */

			.a1:hover{

				/* display:none 不占空间 */

				/* display: none; */

				/*占空间  */

				visibility: hidden;

			}
```
**display **用来**设置元素显示的类型**

			可选值：

			**inline**  将元素设置为**行内**元素

			**block **  将元素设置为**块**元素

			**inline-block行内块**元素（即**可以设置宽高，又不会独占一行**）

			**table**   将元素设置为一个**表格**

			**none**    元素**不在页面中显示**（**隐藏**一个元素）

 **visibility **用来**设置元素的显示状态**

			可选值：

			**visible 默认值**  元素在页面中**正常显示**

			**hidden ** 元素不在页面中显示（**隐藏**一个元素），**位置依然保留**

## 重置样式表

 重置样式表，专门用来对浏览器的样式进行重置

## 默认样式：

	浏览器为了在页面中没有样式时，也可以有一个比较好的显示效果，

**原因**：浏览器为很多元素设置了默认的margin和padding，在编写样式时通常不需要这些默认样式，所以需要进行重置。

方式一：

  ** 1:清除浏览器的默认样式**
```html
*{

        margin:0;

        padding: 0;

        list-style: none;

       }
```
方式二：
```html
	2:引入重置样式表 */
```
## 盒子大小

默认情况下：盒子可见宽的大小由内容区，内边距，边框共同决定

**box-sizing**  用来**设置盒子尺寸的计算方式 width/height 指的是谁**

可选值：

## content-box 内容区 默认值

**border-box 宽度和高度用来设置整个盒子可见框的大小，包括边框，padding，内容区**
```html
<!-- 内减，可见框大小不变 -->
```
## 阴影和圆角

   知识点1:

## box-shadow

             用来**设置元素的阴影效果**，**不会影响到页面布局**

                第一个值：**水平**偏移量  正->左  负->右

                第二个值：**垂直**偏移量  正->下  负->上

                第三个值：**模糊半径**

                第四个值：**颜色**
```html
       box-shadow: -4px 6px 30px rgba(0, 0, 0, .5);
```
**  知识点**2:

             **border-radius 用来设置圆角**  以10px为半径画圆

## borde-top-right-radius

## border-top-left-radius

## border-bottom-left-radius

## border-bottom-right-radius
```html
             border-radius: 50%;    //画圆，再大也是圆

/* border-radius: 10px; */

        /* border-top-left-radius:30px;

        border-top-right-radius:30px;

        border-bottom-left-radius:40px;

        border-bottom-right-radius:40px; */

        /* 圆 */

        border-radius:50%;
```
## 浮动

块元素在文档流中默认垂直排列，所以这个三个div自上至下依次排开，如果希望块元素在页面中水平排列，可以使块元素脱离文档流

使用**float**来**使元素浮动**，使一个元素向其父元素的左侧或右侧移动，从而**脱离文档流**

	 	可选值：

	 		**none，默认值，元素默认在文档流中排列**

**	 		left，，向页面的左侧浮动**

**	 		right，向页面的右侧浮动**

浮动的特点

**1**:浮动元素会脱离文档流，元素**脱离文档流**以后，不会再占用文档流的位置，它**下边的元素会立即向上移动**

**2**:元素浮动以后，元素会尽量向页面的左上或页面右上漂浮

**3**:**浮动元素默认不会从父元素中移出**

**4**:浮动的元素**不会超过他上边的兄弟元素，最多最多一边齐**

**5**:如果浮动元素的**上边是一个没有浮动的块元素，则浮动元素无法上移**

总结：

浮动目前来讲它的主要作用就是让页面中的元素可以水平排列

## 通过浮动可以制作一些水平方向的布局

## 浮动特点

特点1:

	浮动的元素不会盖住文字，**文字会自动环绕在浮动元素的周围**，所以我们可以通过浮动来**设置文字环绕图片**的效果

特点2:

当元素设置浮动以后，会**完全脱离文档流**，**元素**的**一些特点**也会发生**改变**

## 脱离文档流的特点

## 块元素：

				1:块元素**不**再**独占**页面的**一行**

				2:块元素的**宽高被内容撑开**

## 行内元素：

1:浮动过后的行内元素**更像行内块元素**,因为**一行可以显示多个**，并且**默认宽度为内容的宽度**

		 总结：当元素设置浮动以后,**脱离文档流，就不需要再区分块和行内**

## 导航条
```html
    <title>w3导航条</title>

    <style>

       *{  margin:0;  padding: 0; list-style: none; }

       a{

        /* 去除下划线 */

        text-decoration: none;

        color: #777;

        /* 把a标签变成行内块元素 */

        display: inline-block;

        padding:20px;

       }

       .nav{  width: 1000px;  }

       .nav li{  float: left;  background-color: #e8e7e3;  }

       .nav li a:hover{  background-color:#3f3f3f;  Color: #fff;  }

    </style>

  </head>

  <body>

    <ul class="nav">

      <li>

        <a href="#">HTML/CSS</a>

      </li>

      <li>

        <a href="#">Browser Side</a>

      </li>

    </ul>
```
## 高度塌陷

在文档流中，父元素的高度默认是被子元素撑开的，

    也就是子元素多高，父元素就多高。

    但是当为子元素设置浮动以后，子元素会完全脱离文档流，

    此时将会导致子元素无法撑起父元素的高度，导致父元素的高度塌陷。

    由于父元素的高度塌陷了，则父元素下的所有元素都会向上移动，这样将会导致页面布局混乱。

   

## 高度塌陷解决方案一

    所以在开发中一定要避免出现高度塌陷的问题,

    我们可以**将父元素的高度写死**，以避免塌陷的问题出现，

    但是一旦高度写死，父元素的高度将不能自动适应子元素的高度，所以这种方案是**不推荐**使用的。

## 高度塌陷解决方案二：

   页面元素中的隐含属性：Block Formatting Context 即**块格式化上下文**，简称**BFC**

   

当开启元素的BFC以后，元素会变成一个**独立的布局区域**，**不会在布局上影响到外面的元素**

        BFC 理解为一个封闭的大箱子，箱子内部的元素不会影响到外部。

      开启BFC后，元素将会具有如下的特性：

      **1.父元素的垂直外边距不会和子元素重叠 **

      **2.开启BFC的元素不会被浮动元素所覆盖**

      **3.开启BFC的元素可以包含浮动的子元素（可解决高度塌陷）**

     

      如何开启元素的BFC

      1.设置元素浮动（不推荐）

        - 使用这种方式开启，虽然可以撑开父元素，但是会导致父元素的宽度丢失

          而且使用这种方式也会导致下边的元素上移，不能解决问题

      2.设置元素为inline-block（不推荐）

        - 可以解决问题，但是会导致宽度丢失，不推荐使用这种方式

     ** 3.将元素的overflow设置为一个非visible的值 **

      4.设置元素绝对定位(暂时没学习)

         元素也会脱离文档流，虽然可以撑开父元素，但是会导致父元素的宽度丢失

          而且使用这种方式也会导致下边的元素上移，不能解决问题

               

      推荐方式：**将overflow设置为hidden是副作用最小的开启BFC的方式。**

由于受到box1浮动的影响，box2整体向上移动了100px

           

我们有时希望**清除掉其他元素浮动对当前元素产生的影响**，这时可以**使用clear来完成功能**

## clear可以用来清除其他浮动元素对当前元素的影响

            可选值：

                **none，默认值，不清除浮动**

**                left，清除左侧浮动元素对当前元素的影响**

**                right，清除右侧浮动元素对当前元素的影响**

**                both，清除两侧浮动元素对当前元素的影响**

## 清除对他影响最大的那个元素的浮动

原理：

    **设置了 clear 的元素，通过调整自身来使自己不要和浮动元素排列在一起。**

## 类似于给自己加个margin-top

## 解决高度塌陷方案三：

       

可以直接在高度塌陷的**父元素**的**最后**，添**加一个空白的div**，由于这个div并没有浮动，所以他是可以撑开父元素的高度的，然后在对其进行清除浮动，这样可以通过这个空白的div来撑开父元素的高度，基本没有副作用

             

       

使用这种方式虽然可以解决问题，但是会在页面中添加多余的结构。

           

**通过after伪类，选中box1的后边**

 

可以通过after伪类向元素的最后添加一个空白的块元素，然后对其清除浮动，这样做和添加一个div的原理一样，可以达到一个相同的效果，且不会在页面中添加多余的div，这是我们最推荐使用的方式，几乎没有副作用

       

             

## 解决高度塌陷方案三：
```html
             .box1::after{

                /* 空内容 */

                content: "";

                /* 块元素 */

                display: block;

                /* 清除浮动 */

                clear: both;

             }
```
## 表格

  表格在日常生活中使用的非常的多，比如excel就是专门用来创建表格的工具，表格就是用来表示一些格式化的数据的，比如：课程表、银行对账单

   

在网页中也可以来创建出不同的表格。  

## html表格的书写
```html
        <table border="1" width="50%" align="center">
```
             **tr表示行，td表示列，有几个tr就有几列**
```html
            <tr>
```
                ** colspan 合并列**合并同一行中的多个列
```html
                <td colspan="2">1</td>

                 <td>2</td>

                <td>3</td>

            </tr>

            <tr>

                <td>1</td>

                <td>2</td>
```
                ** rowspan合并行**合并同一列中的多个行
```html
                <td rowspan="2">3</td>

            </tr>

            <tr>

                <td>1</td>

                <td>2</td>

                 <td>3</td>

            </tr>

        </table>

    </body>

</html>
```
## 表格样式

   
```html
        <style type="text/css">    

              /*设置表格的宽度 */  

            table{

                width: 300px;

                /*居中*/

                margin:0 auto;

                /*边框*/

                border: 1px solid #000;

                /*
```
## table和td边框之间默认有一个距离

## 通过border-spacing属性可以设置这个距离
```html
                 */
```
**设置表格的边框**，**要单线边框**

## 方法一
```html
border-spacing:0;
```
## 方法二

## border-collapse [kə'læps] 可以用来设置表格的边框合并

     **如果设置了边框合并，则border-spacing自动失效**
```html
                 */

                 border-collapse: collapse;

    /*需求二：设置背景色样式*/

            background-color: skyblue;

               

            }

           

            /*
```
             * 设置边框
```html
             */

             th,td{

                border: 1px solid #000;

             }

       

           

 需求三： 设置隔行变色*/

    tr:nth-child(even){

        background-color: yellowgreen;

    }
```
   **需求四：鼠标移入到tr以后，改变颜色**
```html
        */

    tr:hover{

        background-color: palegreen;

    }

       

    
```
需求五：**调整td文字在表格中的位置**

        **vertical-align:可选值：top,bottom,middle **

**      text-align；可选值：left，center，right**

 
```html
        td{

            height: 50px;

            text-align:center;

            vertical-align: middle;

         }

        </style>

    </head>

    <body>
```
## table是一个块元素

            学号 姓名 性别 住址

            1   孙悟空 男  花果山

            2   猪八戒 男  高老庄

            3   沙和尚 男  流沙河

            4   唐僧   男  女儿国

   **可以使用th标签来表示表头中的内容，它的用法和td一样，不同的是它会有一些默认效果，如加粗**

               
```html
        <table>

            <tr>

                <th>学号</th>

                <th>姓名</th>

                <th>性别</th>

                <th>住址</th>

            </tr>

                   ......

        </table>

       

    </body>

</html>
```
## 长表格
```html
        <table>
```
   有一些情况下表格是非常的长的，这时就需要将**表格分为三个部分**，**表头，表格的主体，表格底部**

                在HTML中为我们提供了三个标签：

## thead 表头

## tbody 表格主体

## tfoot 表格底部

                   

   这三个标签的作用，就来区分表格的不同的部分，他们**都是table的子标签**，

都需要直接写到table中，tr需要写在这些标签当中

                   

          **thead中的内容，永远会显示在表格的头部**

**        tfoot中的内容，永远都会显示表格的底部**

**        tbody中的内容，永远都会显示表格的中间**

               

 如果表格中没有写tbody，浏览器会自动在表格中添加tbody，并且将所有的tr都放到tbody中，所以注意**tr并不是table的子元素，而是tbody的子元素**

               

## 通过table > tr 无法选中行 需要通过tbody > tr

   

    需求：表头：日期 收入 支出 合计

                   12.2 200  10  180

                   12.2 200  10  180

                   ....

                   总计：180

   

## `<thead>`
```html
                <tr>

                    <td>日期</td>

                    <td>收入</td>

                    <td>支出</td>

                    <td>合计</td>

                </tr>
```
## `</thead>`

## `<tfoot>`
```html
                <tr>

                    <td></td>

                    <td></td>

                    <td>合计：</td>

                    <td>70000</td>

                </tr>
```
## `</tfoot>`

## `<tbody>`
```html
                <tr>

                    <td>12.3</td>

                    <td>10000</td>

                    <td>500</td>

                    <td>9500</td>

                </tr>

               ......
```
## `</tbody>`

           
```html
        </table>

       

    </body>

</html>
```
## 父子外边距重叠
```html
            .box1{

                width: 300px;

                height: 300px;

                background-color: #bfa;
```
## 父子外边距重叠解决一
```html
                /* overflow: hidden; */

            }

            .box2{

                width: 200px;

                height: 200px;

                background-color: yellow;

                margin-top: 100px;

            }          
```
    子元素和父元素相邻的**垂直外边距会发生重叠**，**子元素的外边距会传递给父元素**

使用**空的table标签**可以隔离父子元素的外边距，**阻止外边距的重叠**

           

         

## 解决父子元素的外边距重叠方法二

         添加伪类box1 before

          **display:table可以将一个元素设置为表格显示**

       
```html
            .box1::before{

                content: " ";

                display:table;

            }

           

/* 演示高度塌陷 */

            .box3{

                border: 10px red solid;

            }

           

            .box4{

                width: 100px;

                height: 100px;

                background-color: yellowgreen;

                float: left;

            }
```
 **解决父元素高度塌陷(转化成块元素，清除浮动)**

**    **
```html
            .clearfix::after{

                content: " ";

                display: block;

                clear: both;

            }
```
经过修改后的**clearfix**是一个多功能的，**既可以解决高度塌陷，又可以确保父元素和子元素的垂直外边距不会重叠（之前之后的）**

             
```html
             .clearfix::before,

             .clearfix::after{

                content: " ";

                display: table;

                clear: both;

             }

        </style>

    </head>

    <body>

       

            <div class="box3 clearfix">

                <div class="box4"></div>

            </div>

       

         <div class="box1">

            <div class="box2"></div>

        </div>

       

    </body>

</html>
```
## 表单
```html
<body>
```
## 表单：

## 将用户信息等本地的数据信息提交给服务器的

       比如：百度的搜索框 注册 登录这些操作都需要填写表单

 

 

       **1:创建表单  form标签**

## 属性：action属性（必须要写）

指向的是一个服务器的地址，当我们提交表单时将会提交到action属性对应的地址
```html
<!-- 表单提交给服务器的位置 -->
```
## `<form action="./target.html">`

     

     

**2:添加表单项 input**

使用form创建的仅仅是一个空白的表单，我们还需要向form中添加不同的表单项

           

               

**（1）input来创建一个文本框，**

## type属性是text

## name属性：提交内容的名字

**如果**希望表单项中的**数据会提交到服务器**中，**必须指定一个name属性 **   

## value属性值：作为文本框的默认值显示

       

    用户名
```html
    <input type="text" name="username" id="user" value="">

                <br>

                <br>
```
## （2）input创建一个密码框

## type属性值是password

## name属性：提交密码的名字

             

        密码
```html
            <input type="password" name="password" id="">

                <br>

                <br>
```
## （3）input创建一个单选按钮

## - type属性：radio

**- name属性进行分组**，**属性相同是一组按钮，如果不设置，则都可以选择**

**- value属性必须设置，这样被选中的表单项的value属性值将会最终提交给服务器      **

## -checked="checked"属性  默认选中

     

性别  
```html
    <input type="radio" name="gender" value="man">男

    <input type="radio" name="gender" value="woman" checked="checked">女

            <br>

            <br>
```
## （4）input创建一个多选框

## -type属性:checkbox

## -checked="checked"属性  默认选中

       

 爱好
```html
  <input type="checkbox" name="hobby" value="1">篮球

  <input type="checkbox" name="hobby" value="2" checked="checked">跳舞

  <input type="checkbox" name="hobby" value="3"  checked="checked">唱歌

  <input type="checkbox" name="hobby" value="4">游戏

               

            <br /><br />
```
## (5)select来创建一个下拉列表

 **-name属性设置给select，**

## -value属性设置给option

**-selected="selected"，将选项设置为默认选中**

你喜欢的明星
```html
          <select name="star" id="">

          <option value="1">鹿晗</option>

          <option value="2" selected="selected">黄子韬</option>

          <option value="3">丁真</option>

           </select>

               

           

            <br /><br />
```
## （6）textarea创建一个文本域

       

        自我介绍
```html
           <input type="textarea" value="" id="" name="mark">

           

            <br /><br />
```
**（7）input创建一个提交按钮，点击后表单就会提交**

## -type属性值：submit

## -value属性：指定按钮上的文字

           
```html
            <input type="submit" value="注册">

             <input type="submit">
```
**（8）创建一个重置按钮，type="reset" **

## 点击重置按钮以后表单中内容将会恢复为默认值

     
```html
            <input type="reset" >

           

    
```
**（9）创建一个单纯的按钮，button**

           ** 这个按钮没有任何功能，只能被点击**

         
```html
            <input type="button" value="点击">
```
## （10）button标签来创建按钮

   **方式和使用input类似，它是成对出现的标签，使用起来更加的灵活 **

         
```html
            <br /><br />
```
## `<button type="submit">`提交`</button>`
```html
            <button type="reset">重置</button>

            <button type="button">点击</button>

        </form>

    </body>

</html>
```
## input属性补充

       **1: autocomplete="off"  关闭自动补全**

**      2: readonly 设置为只读，不能修改**

**      3: disabled 设置为禁用**

**      4: autofocus  自动获取焦点**

**      5: placeholder 提示内容**

 
```html
      <input type="text" autocomplete="off" autofocus    name="username" placeholder="请输入姓名" value="" />
```
+ 在 HTML **表单中，value属性**非常重要。对于不同的表单元素，它有不同的用途。
```html
+ 文本框（input type="text"）和密码框（input type="password"）：value属性用于设置文本框或密码框的初始值。例如，<input type="text" value="初始文本">，在页面加载时，文本框中就会显示 “初始文本”。用户可以对这个值进行修改，当表单提交时，提交的是用户修改后的值。

+ 单选按钮（input type="radio"）和复选框（input type="checkbox"）：value属性用于定义当该选项被选中并提交表单时所传递的值。比如对于单选按钮<input type="radio" name="gender" value="male">男</input>和<input type="radio" name="gender" value="female">女</input>，当用户选择 “男” 这个选项并提交表单时，传递给服务器的值就是 “male”。

+ 下拉菜单（select）：在<select>标签内部的<option>标签中有value属性。例如<select><option value="option1">选项1</option><option value="option2">选项2</option></select>，当用户选择 “选项 1” 并提交表单时，传递的值是 “option1”。
```
## Name

+ **表单元素方面**：
```html
    - 文本框（input type="text"）、密码框（input type="password"）等：“name” 属性用于给这些输入框命名，以便在表单提交时，服务器能够通过这个名称准确识别接收到的是哪个输入框的值。例如：<input type="text" name="username">，这里的 “username” 就是给文本框设定的名称，当用户在该文本框输入内容并提交表单后，服务器端就可以根据 “username” 这个名称获取到用户输入的具体值。

    - 单选按钮（input type="radio"）和复选框（input type="checkbox"）：对于单选按钮组和复选框组，相同组内的元素需要设置相同的 “name” 属性值，以确保它们在逻辑上是相互关联的一组选项。比如对于单选按钮选择性别：<input type="radio" name="gender" value="male">男</input>

<input type="radio" name="gender" value="female">女</input>这里 “gender” 就是这两个单选按钮共同的名称，保证了用户只能从 “男”“女” 中选择其一，并且在表单提交时，服务器能通过 “gender” 这个名称知道用户选择的性别对应的 “value” 值。

    - 下拉菜单（select）：在下拉菜单中，“name” 属性同样用于给整个下拉菜单元素命名，以便在表单提交时能正确识别其选择的值。例如：<select name="country">

<option value="china">中国</option>

<option value="usa">美国</option>

</select>这里 “country” 就是下拉菜单的名称，当用户选择一个国家并提交表单后，服务器可依据 “country” 获取到对应的国家值（即所选选项的 “value” 值）。
```
    - **Name相当于坐标，提交表单时，服务器可以精确找到，在通过value确定最终要上传哪个值。**

## 定位：

        更加高级的布局手段

    - 定位指的就是将指定的元素摆放到页面的任意位置

        通过定位可以任意的摆放元素

      - 通过**position**属性来设置元素的定位

        -可选值：

          **static： ['stætik] 默认值，元素没有开启定位**

## relative： ['relətiv] 开启元素的相对定位

## absolute： ['æbsəlju:t] 开启元素的绝对定位

## fixed：开启元素的固定定位（也是绝对定位的一种）

## sticky： ['stiki] 开启元素的粘滞定位

## 相对定位：

      当元素的position属性设置为relative时，则开启了元素的相对定位 ==》自恋型

      1.当开启了元素的相对定位以后，而**不设置偏移量时，元素不会发生任何变化**
```html
      2.相对定位是相对于元素在文档流中原来的位置进行定位（top:0;left:0;）
```
      3.相对定位的元素**不会脱离文档流**

      4.相对定位会使元素**提升一个层级**

      5.相对定位**不会改变元素的性质，块还是块，内联还是内联**

## 偏移量

    当开启了元素的定位（position属性值是一个非static的值）时，

      可以通过left right top bottom四个属性来设置元素的偏移量，越大越向反方向移动

      **left：元素相对于其定位位置的左侧偏移量，**

## right：元素相对于其定位位置的右侧偏移量

## top：元素相对于其定位位置的上边的偏移量

## bottom：元素相对于其定位位置下边的偏移量

   

    通常偏移量只需要使用两个就可以对一个元素进行定位，

      一般选择水平方向的一个偏移量和垂直方向的偏移量来为一个元素进行定位

 

## 绝对定位

当position属性值设置为**absolute**时，则开启了元素的绝对定位

## 绝对定位：

1.开启绝对定位，会使**元素脱离文档流**

2.开启绝对定位以后，如果**不设置偏移量，则元素的位置不会发生变化**

3.绝对定位是**相对于离他最近的包含块定位的**

  （一般情况，开启了子元素的绝对定位都会同时开启父元素的相对定位** '父相子绝'**）

4.绝对定位**会使元素提升一个层级**

5.绝对定位**会改变元素的性质，开启BFC属性**

**  内联元素变成行内块元素，**

## 块元素的宽度和高度默认都被内容撑开

## 包含块：containing block

## -正常情况下：

## 离当前元素最近的祖先块元素

## -定位情况下：

## 离他最近的开启了定位的祖先元素

**    如果所有的祖先元素都没有开启定位，则会相对于浏览器窗口进行定位**

**    html （根元素，初始包含块） **

## 固定定位

当元素的position属性设置**fixed**时，则开启了元素的固定定位

  （1）用于固定在浏览器页面上，**不随浏览器的滚动而改变位置；**

  （2）**以浏览器为参照物**，和父元素没有任何关系；

（3）固定定位**不占有原来的位置，即脱离标准流 **

    (4)应用场景

        - 固定导航

        - 固定侧边栏

        - 广告  

 

粘滞定位 （一般用于页面导航的吸顶效果)

    -当元素的position属性设置为**sticky**时，则开启了元素的粘滞定位

## （1）以浏览器为参照物（体现固定定位特点）；

## （2）占有原来位置（体现相对定位特点）；

**　（3）粘滞定位可以在元素到达某个位置时，将其固定 **

**     (4)没有达到top值之前正常显示，达到top值之后类似于固定定位，不会跟随滚动条滚动而滚动 **

 

 水平布局

    left+margin-left+border-left+padding-left+width+padding-right+border-right+margin-right+right

  -当**开启决定定位**后，**水平方向的布局等式就会加上left，right两个值**

      此时规则和之前一样，只是多添加了两个值

        -当发生过度约束时

            1:如果9个值中没有auto，则自动调整right值以使等式满足

            2:如果有auto，则自动调整auto的值以使等式满足

        -可设置auto的值

          margin  width  left  right

          四个值中，三个值固定，某一个值设为auto，则会调整这个auto值,

            若width  left  right都为0，margin会均分四个方向值

      —两个auto的情况

          margin 和width为auto，  调整width

          margin 和left，right其中一个值为auto，调整left或right

          width 和left，right其中一个值，调整right

          left，right都为auto  调整right

      —三个auto的情况

        margin  width  left ===> width，left，调整left

        margin  width  right ===>  width，right，调整right

        width  left  right  ===>  width，right，left，调整right

      —四个值auto的情况

          width，right，left ，调整right

垂直布局

    等式也必须满足

  top+margin-top+····+botoom

 

## Right>left>width

   2:**父元素的层级再高，也不会盖住子元素**

     

     
```html
        /* 透明度 0透明 1不透明 中间值0-1 */

        opacity: 0.5;
```
层级

1:如果定位元素的层级是一样，则下边的元素会盖住上边的

  通过**z-index属性可以用来设置元素的层级**

  可以为z-index指定一个正整数作为值，该值将会作为当前元素的层级

    **层级越高，越优先显示**

## 对于没有开启定位的元素不能使用z-index

## 透明背景 opacity

2、设置元素的透明背景

** opacity [əu'pæsiti] 可以用来设置元素背景的透明，**

   它需要一个0-1之间的值

    ** 0 表示完全透明**

**     1 表示完全不透明**

**     0.5 表示半透明 **

1、opacity用来**设置元素的不透明级别**，从 0.0 （完全透明）到 1.0（完全不透明）。

2**、transparent是颜色的一种**，这种颜色叫**透明色**。

3、rgba(r,g,b,a)稍复杂一点，r：红色值；g：绿色值；b：蓝色值；a：alpha透明度。

        alpha表示像素不透明性的值。像素越不透明，则隐藏越多呈现图像的背景。

        取值0~1之间。0表示完全透明的像素，1表示完全不透明的像素。

 

1、opacity是作为一个完整属性出现的。transparent和rgba都是作为属性值出现的。

2、**opacity是对于整个元素起作用的**。打个比方，就像拿一块玻璃糊在了这个元素上，

    盖上的地方都会受到影响。

    而transparent和alpha是对元素的某个属性起作用的。

    任何需要设置颜色的地方都可以根据情况使用transparent或rgba。

    比如背景、边框、字体等等。哪个属性的颜色设置了transparent，哪个属性就是透明的，完全透明。

    哪个属性用rgba()设置了透明，就对哪个属性起作用，透明程度可设置。

3、由于opacity和alpha设置的透明程度可调，就引出一个继承的问题。

  **如果一个元素未设置opacity属性，**

**    那么它会从它的父元素继承opacity属性的值。而alpha不存在继承**。

       

   

**:target选择器称为目标选择器**，

      用来匹配文档(页面)的url的某个标志符的目标元素。
```html
    <style>

      /*这里的:target就是指id="brand"的div对象*/

      #brand:target {

     

   <h2><a href="#brand">页签1</a></h2>

   <div id="brand">非居不锐君要命作使落出不败而性善，若云了脱鲜程商哥性我选路国活，后弟得放哉在与，丰世下。</div>

+ :target选择器在 CSS 中是一个非常有用的选择器。它用于选择当前活动的目标元素，通常是在 URL 中有一个片段标识符（以#开头的部分）指向的元素。例如，当页面的 URL 是[https://example.com/page.html#section](https://example.com/page.html#section) - 1时，#section - 1对应的元素就会被:target选择器选中。
```
**① 每个a标签的href属性须与其兄弟节点.content元素的id值一致**

**② .content元素与a标签的顺序不能更改 **
```html
    <ul>

      <li>

        <div class="content" id="content1">选项一内容</div>

        <a href="#content1">选项一</a>

      </li>

      <li>

        <div class="content" id="content2">选项二内容</div>

        <a href="#content2">选项二</a>

      </li>

      <li>

        <div class="content" id="content3">选项三内容</div>

        <a href="#content3">选项三</a>

      </li>

    </ul>
```
## label
```html
<label>标签的作用是为鼠标用户改进了可用性，

        当用户点击<label>标签中的文本时，浏览器就会自动将焦点转到和该标签相关联的控件上；//增大控件作用范围

        <label for="username">用户名：</label>

        <input type="text" name="" id="username">
```
## lable实现tab栏切换

       原理： **当用户点击label元素时，该label所绑定的input单选框就会被选中**，

      同时通过使用CSS选择器让被选中的input元素之后的label和.content元素都加上相应的样式。
```html
      /* 找到我的盒子做显示 checked----》input*/

      input:checked~.content{

        opacity: 1;

      }

      /* 找到lable做出选中的效果 */

      input:checked +label{

        background-color: #666;

        color: #fff;

      }

      ul li:first-child .content{

        background-color: #f60;

      }

      ul li:nth-child(2) .content{

        background-color: green;

      }

      ul li:last-child .content{

        background-color: yellow;

      }

      /*
```
      ① input需要隐藏，因为我们并不需要显示它，但它却是实现Tab切换的核心力量

      ② “input:checked+label” 表示被选中的单选框后的 label 元素需要做标记

      ③ .content 元素需要先全部隐藏

      ③ “input:checked~.content” 表示被选中的单选框后的 .content 元素需要显示

 

    ① label需要绑定input，方法就是label的for属性值与input的id一致，

      这样当点击label元素时input单选框就会被选中

        ② input、label和div三者是有顺序的，不能随意调换顺序
```html
   <ul>

      <li>

        <input id="tab1" type="radio" name="tab" checked />

        <label for="tab1">选项一</label>

        <div class="content">选项一内容</div>

      </li>

      <li>

        <input id="tab2" type="radio" name="tab" />

        <label for="tab2">选项二</label>

        <div class="content">选项二内容</div>

      </li>

      <li>

        <input id="tab3" type="radio" name="tab" />

        <label for="tab3">选项三</label>

        <div class="content">选项三内容</div>

      </li>

    </ul>
```
swiper插件  轮播图（会引用，会修改即可） 
```html
1. 首先加载插件，需要用到的文件有[swiper.min.js](https://3.swiper.com.cn/download/index.html" \l "file7" \t "https://3.swiper.com.cn/usage/_blank)和[swiper.min.css](https://3.swiper.com.cn/download/index.html" \l "file5" \t "https://3.swiper.com.cn/usage/_blank)文件。

 <link rel="stylesheet" href="path/to/swiper.min.css">

 <script src="path/to/swiper.min.js"></script>
```
1. HTML内容。
```html
<div class="swiper-container">

    <div class="swiper-wrapper">

        <div class="swiper-slide">Slide 1</div>

        <div class="swiper-slide">Slide 2</div>

        <div class="swiper-slide">Slide 3</div>

    </div>
```
     如果需要分页器
```html
    <div class="swiper-pagination"></div>
```
     如果需要导航按钮
```html
    <div class="swiper-button-prev"></div>

    <div class="swiper-button-next"></div>
```
     如果需要滚动条
```html
    <div class="swiper-scrollbar"></div>

</div>导航等组件可以放在container之外
```
1. 你可能想要给Swiper定义一个大小，当然不要也行。
```html
.swiper-container {

    width: 600px;

    height: 300px;

}

4.初始化Swiper：最好是挨着</body>标签

<script>

  var mySwiper = new Swiper ('.swiper-container', {

    direction: 'vertical',

    loop: true,

    <!-- 如果需要分页器 -->

    pagination: '.swiper-pagination',

    <!-- 如果需要前进后退按钮 -->

    nextButton: '.swiper-button-next',

    prevButton: '.swiper-button-prev',

    <!-- 如果需要滚动条 -->

    scrollbar: '.swiper-scrollbar',

  })

  </script>

</body>

5.完成。恭喜你，现在你的Swiper应该已经能正常切换了。现在开始添加各种[选项和参数](https://3.swiper.com.cn/api/index.html" \t "https://3.swiper.com.cn/usage/_blank)丰富你的Swiper，开启华丽移动前端创作之旅。
```
## 图标字体（iconfont）

           -在网页中经常需要使用一些图标，可以通过图片来引入图标

           但图片本身比较大，也不灵活

           -所以使用图标时，我们还可以**将图标直接设置为字体，**

                然后通过font-face的形式来对字体进行引入

           -这样我们就可以通过使用字体的形式来使用图标
```html
<link rel="stylesheet" href="./font_4771251_qzjb1gs6u3i/iconfont.css">

<script src="./font_4771251_qzjb1gs6u3i/iconfont.js"></script>
```
## 第一种方式  转义字符形式
```html
     <span class="iconfont">&#xe611;</span>

    <span class="iconfont">&#xe60e;</span>

    <span class="iconfont">&#xe600;</span>
```
## 第二种方式  类名形式 （常用）
```html
     <i class="iconfont icon-jishuzhuanyi s1">1</i>

    <i class="iconfont icon-zhijiao-copy-copy3"></i>

    <i class="iconfont icon-gouwuchekong"></i>
```
## 第三种方式 （了解）
```html
    <p>一朵花</p>
```
## 第四种

## `<svg class="icon" aria-hidden="true">`
```html
      <use xlink:href="#icon-gouwuchekong"></use>

    </svg>
```
## 背景

  **1: background-color  设置背景颜色**
```html
                background-color: blueviolet;
```
**  2:background-image来设置背景图片**
```html
                    - 语法：background-image:url(相对路径);
```
                    -可以同时为一个元素指定背景颜色和背景图片，

                        这样背景颜色将会作为背景图片的底色

                    -图片在元素中的位置

                        如果背景图片大于元素，默认会显示图片的左上角

                        如果背景图片和元素一样大，则会将背景图片全部显示

                        如果背景图片小于元素大小，则会默认将背景图片平铺以充满元素    
```html
                background-image: url('./img/gaitubao_小图_png.png');
```
                需求：虽然图小，但图片我只要一张

**3:background-repeat用于设置背景图片的重复方式**

                    可选值：

                        **repeat，默认值，背景图片会双方向重复（平铺）**

**                        no-repeat ，背景图片不会重复，有多大就显示多大**

**                        repeat-x， 背景图片沿水平方向重复**

**                        repeat-y，背景图片沿垂直方向重复**
```html
                background-repeat: no-repeat;
```
**4:background-position可以调整背景图片在元素中的位置**

                       

背景图片**默认是贴着元素的左上角显示**

                  可选值：

                        该属性可以使用 **top right left bottom center**中的两个值

                            来指定一个背景图片的位置

                            top left 左上

                            bottom right 右下

                            **如果只给出一个值，则第二个值默认是center**

                 

                    也可以直接指定**两个偏移量**，

                        第一个值是**水平偏移量**

                            - 如果指定的是一个**正值**，则图片会**向右**移动指定的像素

                            - 如果指定的是一个**负值**，则图片会**向左**移动指定的像素

                        第二个是**垂直偏移量**  

                            - 如果指定的是一个**正值**，则图片会**向下**移动指定的像素

                            - 如果指定的是一个**负值**，则图片会**向上**移动指定的像素

                   

 

第一个值是水平方向，第二值垂直方向，假设只设置一个值，第二个值center
```html
                /* background-position: left bottom; */

                background-position: 0px -100px;

 5:background-clip
```
## 设置背景的范围

              可选值：

                 **border-box 默认值，背景颜色会出现在边框的下边**

**                 padding-box  背景不会出现在边框，只会出现在内容区和内边距**

## content-box  背景只出现在内容区
```html
       /* background-clip: border-box; */

        /* 设置背景颜色 */

        background-color: forestgreen;

        /*设置一个背景图片*/

        background-image: url('./img/小图.webp');

        /*设置一个图片不重复*/

        background-repeat: no-repeat;
```
**6:background-origin **

## 设置背景图片的偏移量计算的原点,配合偏移量使用的

## padding-box  从内部距处开始计算

## content-box  背景图片的偏移量从内容区处计算

## border-box   从边框开始计算偏移量

   
```html
        /* 计算开始的位置 */

        background-origin:content-box;

        /* 从指定位置开始偏移的量 */

        background-position:30px ;

 

        margin: 0;

        padding: 0;

      }

 

        /*设置一个背景颜色*/

       background-color: brown;

        /*设置一个背景图片*/

        background-image: url('./img/大图2.webp');

         /*设置一个图片不重复*/

        background-repeat: no-repeat;
```
**7:background-size**

## 设置图片的大小

            参数：

## 第一个值：宽度

## 第二个值：高度

                 如果只写一个，第二值，默认为auto

                 

              **cover  图片的比例不变，将元素铺满，**

**图片将被缩放到足够大，以完全覆盖元素的背景区域，即使图片会被裁剪**‌

**              contain 图片比例不变，将元素完整显示**

**图片将被缩放到足够小，以完整显示在元素背景中，且不会被裁剪**‌
```html
        background-size:cover;

     

 

        /*设置一个背景颜色*/

        /* background-color: brown;  */

        /*设置一个背景图片*/

        /* background-image: url('./img/小图.webp'); */

        /*设置背景不重复*/

        /* background-repeat: no-repeat; */

        /*设置背景图片的位置*/

       /* background-position: center center; */

        /* 设置图片大小 */

        /* background-size:200px  ; */

        /* 设置图片偏移的原点 */

        /* background-origin: border-box; */

        /*  设置背景的范围 */

        /* background-clip: border-box; */
```
## background

            - 通过该属性可以同时设置所有背景相关的样式

            - 没有顺序的要求，谁在前谁在后都行

              也没有数量的要求，不写的样式就使用默认值

## -background-size要写在background-position后面

   
```html
       background:brown url('./img/小图.webp')  center center/200px no-repeat;
```
## 雪碧图

        图片整合技术（CSS-Sprite）

        优点：

          1 将多个图片整合为一张图片里，浏览器只需要发送一次请求，可以同时加载多个图片，

          提高访问效率，提高了用户体验。

          2 将多个图片整合为一张图片，减小了图片的总大小，提高请求的速度，增加了用户体验    

 

       雪碧图使用步骤

        ** 1:先确定要使用的图标**

**         2:测量图标的大小**

**         3:根据测量结果创建一个元素**

**         4:将雪碧图设置为元素的背景**

**         5：设置一个偏移量以显示正确的图片**

     

         管中窥豹
```html
      .btn:link {

        /*将a转换为块元素*/

        display: block;

        /*设置宽高*/

        width: 200px;

        height: 500px;

        /*设置背景图片*/

        background-image: url("./img2/早中晚.webp");

        /*设置背景图片不重复*/

       background-repeat: no-repeat;

       background-position:-80px 0;

      }

      .btn:hover {

        /*
```
         * 当是hover状态时，希望图片可以向左移动
```html
         */

         background-position:-285px 0;

       

      }

      .btn:active {

        /*
```
         * 当是active状态时，希望图片再向左移动
```html
         */

         background-position:-490px 0;

      }

    </style>

  </head>

  <body>
```
     创建一个超链接
```html
    <a class="btn" href="#"></a>

  </body>

</html>
```
## 渐变

       渐变：通过渐变可以设置一些复杂的背景颜色，可以从实现一个颜色向其他颜色过渡的效果

           渐变是图片，通过 background-image设置

               可选值

               **  1：linear-gradient(方位,)颜色1,颜色2  **['ɡreidiənt]

                  **  线性渐变**，颜色沿着一条直线发生变化  

                        **参数1:表示方位，（可选值，不写默认是to bottom）**

**                                (1)to left，to right, to bottom, to top**

**                                (2)xxxdeg 表示角度，度数，会更灵活**

## (3)turn 表示圈  .5turn

## 参数2:颜色1

## 参数3:颜色2

                       注意：

                           可以写多个颜色，默认情况下，颜色是均分占比的

                              也可以手动的指定渐变的分布情况
```html
                            background-image:linear-gradient(red 50px,yellow) ;
```
                               颜色后直接跟占比

                ** 2:repeating-linear-gradient()**

## 可以平铺的线性渐变
```html
                    background-image: repeating-linear-gradient(yellow 0px, red 50px);
```
                      参数跟linear-gradient是一样的

                    **参数2-参数1，中间部分是渐变的颜色，拿总高度/差值，就是颜色重复出现的次数**

     

   
```html
            /* height: 400px; */

            /* ``````````````````````````````宽度``高度`水平偏移`垂直偏移 */

           background-image: radial-gradient(80px 20px at 120px 50px,yellow,blue);
```
   1:radial-gradient()   ['reidiəl] ['ɡreidiənt]

                 **经向渐变**（放射性的效果）

                    **默认情况下，圆心是根据元素的形状来计算的**

## 正方形圆形

## 长方形椭圆型

## 参数1:圆心的形状

**                          （1）circle圆形，ellipse椭圆，**

## （2）设置的大小 at 位置==>像素1 像素2 at 0px  0px
```html
            background-image: radial-gradient(100px 100px at 100px 0px,red,yellow);          
```
## 参数2:颜色1

## 参数3:颜色2

## ······

         

## 过渡transition
```html
 .box1>div{

            width: 100px;

            height: 100px;

            margin-bottom: 50px;

            margin-left: 0;

            /* all全部的一个属性 */

           transition-property: all;

           /* 过渡的持续时间 */

           transition-duration: 2s;

           

           /* 延迟时间 */

           /* transition-delay:1s; */
```
**过渡（transition）**[træn'siʒən]

            -通过过渡可以指定一个属性发生变化时的切换方式

           -通过过渡可以创建一些非常好的效果，提升用户体验

## 属性（4个）

**(1)transition-property **['prɔpəti] **指定执行过渡的属性**，多个属性，使用逗号隔开，如果所有的属性都要过渡，就使用**all**关键词，大部分属性都支持过渡效果

                   注意过渡时，必须是从一个有效数值向另一个有效数值进行过渡

                   只要值可以计算的，就可以过渡

**(2)transition-duration [**djuə'reiʃən] 指定**过渡效果的持续时间**

                           时间的单位：s和ms   1s=1000ms
```html
(3)transition-timing-function: ;过渡的时序函数
```
## 指定过渡的执行的方式

              **可选值：ease  [i:z] 默认值，慢速开始，先加速，然后再减速**

## linear 匀速运动

**                         ease-in 慢速开始，加速运动**

**                         ease-out 快速开始，减速运动**

**                         ease-in-out 先加速，后减速**

## steps()分布执行过渡效果

## 可以设置一个第二个值

## end 表示动画在每个步骤结束时变化

**                               start，表示动画在每个步骤开始时立即变化**
```html
(4)transition-delay: ;过渡效果的延迟，等待一段时间后执行过渡
```
**transition：；可以同时设置过渡相关的所有属性，**

**        只有一个要求，如果要写延迟，则两个时间中,第一个写延迟，第二个写持续时间 **   

         
```html
            /* 过渡的函数 */

           /* transition-timing-function: steps(5,end); */
```
简写
```html
             /* 2s持续的时间，1s延迟的时间 */

             transition: all 2s 1s steps(5);
```
**动画**  ** animation**

      动画和过渡类似，都是可以实现一些动态效果，不同的是过渡需要在某个属性发生变化时才能触发，动画可以自动触发动画

           

**设置动画**效果，必须**先要设置一个关键帧**，关键帧设置了动画每一个步骤
```html
             @keyframes 动画名 {}
```
## 第一步：设置关键帧
```html
      @keyframes move{

        from{

          margin-left: 0;

        }

        to{

          margin-left: 500px;

        }

      }

     

     
```
**第二步 设置box2的动画 animation** [ˌænɪˈmeɪʃ(ə)n]
```html
      .box2 {

        background-color: #bfa;

 1:animation-name
```
**           设置动画的名字，和@keyframs相对应**
```html
           animation-name:move;
```
**2:animation-duration**

**           动画执行时间 duration** [djuə'reiʃən]
```html
           animation-duration: 2s;
```
**3:animation-delay**

## 动画执行延时
```html
        animation-delay:1s;
```
**4:animation-timing-function**

## 动画执行的方式
```html
          animation-timing-function: linear;
```
**5:animation-iteration-count  [,itə'reiʃən]**

## 动画执行的次数

## 可选值：次数（数字）

## infinite   ['infinət] 无限循环
```html
         animation-iteration-count:2;
```
**6:animation-direction**

## 指定动画运行的方向

## 可选值

**                    normal  默认值： 从from向to运行，每次都是这样**

**                    reverse  从to到from运行，每次都是这样**

**                    alternate  从from向to运行，重复执行动画时反向执行**

**                    alternate-reverse  从to向from运行，重复执行动画时反向执行**
```html
          animation-direction: alternate-reverse;
```
**7:animation-play-state**

## 设置动画的执行状态

## 可选值：running 默认值  动画执行

## paused  动画暂停
```html
            animation-play-state: running;
```
**8:animation-fill-mode**

## 动画的填充模式

## 可选值：

## none默认值 动画执行完毕 元素回到原来的位置

**                  forwards 动画执行完毕，会停止在动画结束的位置**

**                  backwards 动画延时等待时，元素就会处于开始位置**

## both 结合了forwards和backwards的特点
```html
          animation-fill-mode: both;
```
简写模式
```html
        animation: move 2s 2 2s alternate-reverse both;
```
## 变形transform
```html
      .box1 {

        width: 200px;

        height: 200px;

        background-color: #bfa;

        transform: translateX(0px);
```
变形是通过css来改变元素的形状或位置

             -**变形不会影响到页面的布局(只折腾自己)**
```html
             -transform: ;用来设置元素的变形效果 ,尽量变形写在一个transform里，不然下面再写一个，就会覆盖上面          
```
**可**选值：

## -平移：translateX()沿着x轴方向平移

## translateY()沿着y轴方向平移

## translateZ()沿着z轴方向平移

**            -平移元素，可以是数字，可以是百分比，百分比是相对于自身计算的**

         

     

需求 ： 使元素居中效果
```html
      .box3 {

        background-color: red;
```
   第一种方式居中 这种方式适用于宽高确定，如果不确定，会自动调整宽高的大小
```html
        width: 100px;

        height: 100px;

        position: absolute;

        left: 0;

        right: 0;

        top: 0;

        bottom: 0;

        margin:auto;

      }

      .box4 {

        background-color: pink;

        position: absolute;

        /* 第二种居中方式动画形式 */

        left: 50%;

        top: 50%;

        transform: translateX(-50%) translateY(-50%);

       

      }
```
## 需求二：作出卡片悬浮的效果
```html
      /* 平移可以结合transition 做出浮起来的效果，还不影响其他人 */

      .box5 {

        width: 220px;

        height: 220px;

        background-color: salmon;

     

        /* 过渡效果 */

      }

      .box5:hover {

       transform: translateY(-3px);

       box-shadow:0 0 10px rgba(0, 0, 0,.5);

       transition: 0.5s ease;

      }

      .box1:hover{

        transform: translateX(50px);

        transition: 2s linear;

      }
```
## 视距 perspective

     **perspective **[pə'spektiv] **设置当前网页的视距为800px**，人眼距离网页的距离，一般不小于600px

     

z轴平移，调整元素在z轴的位置，正常情况下调整元素和人眼之间的距离，距离越大，元素离人越近

                **z轴平移**属于立体效果（近大远小），默认情况下网页不支持透视

                  如果需要**看到效果，必须要设置网页的视距**

       
```html
      body:hover .box1 {

        /*perspective(800px)  谷歌要直接设置在transform里面 */

        transform: perspective(800px) translateZ(100px);

        box-shadow: 0 0 10px rgba(0,0, 0, .5);

        transition: 2s ease;
```
## 旋转rotate
```html
        /* 设置当前网页的视距为800px，人眼距离网页的距离，一般不小于600px */

        /* html{

            perspective: 800px;

        } */

        .box1{

            width: 200px;

            height: 200px;

            background-color: #bfa;

            margin: 100px auto;

            transition: 2s;

        }

        body:hover .box1{
```
## 通过旋转可以使元素沿着x y或者z旋转指定的角度

## rotateX() 沿着x轴旋转

## rotateY() 沿着y轴旋转

## rotateZ() 沿着z轴旋转

## deg 度

## turn 圈

           
```html
            transform: rotateY(1turn);
```
## 设置是否显示元素的背面
```html
            backface-visibility: ;
```
                 **可选值：visible 默认值，显示**

## hidden  不显示
```html
                        */

            backface-visibility:hidden;

        }
```
## 缩放scale

## 对元素进行缩放的函数

## scale（）双方向缩放

## scaleX() x轴方向缩放

## scaleY()  y方向缩放

## 值是倍数

**默认效果1，小于1，缩小，大于1放大**
```html
            		transform: scale(1.2);
```
## 变形的原点  默认值center
```html
             		transform-origin: 30px 30px;

           

           

        }

        /* 需求：设置图片放大效果 */

        .img-wrapper{

            width: 200px;

            height: 200px;

            border: 1px red solid;

            overflow: hidden;

        }

1

        .img-wrapper:hover img{

            transform: scale(1.2);

        }

        img{

            transition: all 1s;

        }
```
**flex(弹性盒子，伸缩盒)**

             -是css中的又一种布局手段，它主要用来**代替浮动**来完成页面的布局

             -flex可以使元素具有弹性，让**元素可以根据页面的大小的改变而改变**

             -弹性容器

                -要使用弹性盒，必须先将一个元素设置为弹性容器

                -通过display来设置弹性容器

                    **display:flex  设置块级弹性容器**

                   ** display:inline-flex 设置为行内的弹性容器**

             -弹性元素

                -**弹性容器的直接子元素是弹性元素（弹性项）**

             注意：一个元素可以同时是弹性容器和弹性元素

         
```html
        /* 将ul设置为弹性容器 */

        display: flex;

        flex-direction:column-reverse;
```
## 一:弹性容器的属性

            **1:flex-direction    2:flex-wrap **

**            3:flex-flow   4:justify-content**

**            5:align-items    6:align-content**

                 
```html
            1:flex-direction: ; 指定容器中弹性元素的排列方式
```
## 可选值：

**                row  默认值，弹性元素在容器中水平排列（左向右）**

## 主轴-自左向右

## row-reverse  弹性元素在容器中反向水平排列（右向左）

## 主轴-自右向左

## column  弹性元素纵向排列（自上向下）

## 主轴-自上向下

## column-reverse 弹性元素纵向排列（自下向上）

## 主轴-自下向上

           

## 主轴：弹性元素的排列方向称为主轴

## 侧轴：与主轴垂直方向的称为侧轴
```html
2: flex-wrap: ;设置弹性元素是否在弹性容器中是否自动换行
```
## 可选值：

**                    nowrap 默认值，元素不会自动换行**

## wrap 元素沿着辅轴方向自动换行

## wrap-reverse 元素沿着辅轴反方向换行

   
```html
            /* flex-wrap:wrap-reverse; */
```
**3:flex-flow:wrap和direction的简写属性，且没有顺序要求**

## 默认值 row nowrap

     
```html
            /* flex-flow: row nowrap; */
```
**4:justify-content 如何分配主轴上的空白空间（主轴上的元素如何排列）**

## 可选值：

## flex-start 元素沿着主轴起边排列

## flex-end 元素沿着主轴终边排列

## center  元素居中排列

## space-around 空白分布到元素的两侧

## space-between 空白均匀分布到元素间

## space-evenly 空白分布到元素的单侧（兼容性差一些）
```html
      /*1: flex-direction: row; */

        /*2: flex-wrap:wrap-reverse ; */

        /* 3: flex-flow:row wrap;  */

        flex-flow: row wrap;

        /*4: justify-content:space-around; */
```
**5: align-items 在辅轴上如何对齐-元素间的关系**

## 可选值：

**                     stretch  默认值，将同一行元素的长度设置为相同的值**

**                     flex-start 元素不会拉伸， 沿着辅轴起边对齐**

**                     flex-end   元素不会拉伸， 沿着辅轴终边对齐**

## center  居中对齐

## baseline 基线对齐（用的不对）

                     
```html
        align-items:center;

        /*需求：在弹性盒子里，元素时间正中间居中对齐

            */

6: align-content: ;辅轴空白空间的分布
```
## 可选值：

## flex-start 元素沿着辅轴起边排列

## flex-end 元素沿着辅轴终边排列

## center  元素居中排列

## space-around 空白分布到元素的两侧

## space-between 空白均匀分布到元素间

## space-evenly 空白分布到元素的单侧（兼容性差一些）
```html
                   */

          /* align-content:flex-start; */

      }
```
## 二：弹性元素的属性

## align-self

## flex-grow  flex-shrink

**                order  **flex-basis         **
```html
                *flex   */

       

 1:用来覆盖当前弹性元素上的align-items */

        align-self:flex-start;

     

 

           

2.flex-grow: ;指定弹性元素的伸展的系数
```
**          -当父元素有多余的空间的时候，子元素如何伸展，0 默认值 是不伸展**

**                -父元素的剩余空间，会按照比例进行分配**

**            **
```html
1. flex-shrink: ; 指定弹性元素的收缩系数
```
**          -当父元素中的空间不足以容纳所有的子元素时，如果对子元素进行收缩，**

**                  默认值，按照同比例1:1的比例一起缩放，也可分别设置**

     

**4. flex-basis 元素的基础长度，指定的是元素在主轴上的基础长度，跟你设置的宽高会冲突**

**                     如果主轴是横向的，则该值指定的就是元素的宽度**

**                     如果主轴是纵向的，则该值指定的是元素的高度**

**                -默认值是auto，表示参考元素自身的高度或宽度**

**                -如果传递了一个具体的数值，则以该值为准 ***

**        **

**5.  flex：可以设置弹性元素所有的三个样式**

**                 flex: 增长 缩减 基础**

**                      initial /ɪˈnɪʃl/  'flex: 0 1 auto' 弹性元素不增，可减**

**                      auto     'flex: 1 1 auto'弹性元素可增，可减**

## none     'flex:  0 0 auto'弹性元素没有弹性
```html
                 */

       

       

1. order 决定弹性元素的排列顺序 越小越在之前 */

        order: 2;

      }

      li:nth-child(2) {

        background-color: pink;

        /* flex-grow: 3; */

        /* 按照1:1的空间压缩，数值比1大收缩 */

        /* flex-shrink:3; */

        /* flex-basis:400px; */

        order: 3;

       

     
```
## 移动端

屏幕

1、**屏幕大小**

指**屏幕的对角线长度**,单位是英寸(inch)。

2、**屏幕分辨率**

指屏幕在:**横向、纵向上所拥有的物理像素点总数**,一般表示元用n*m表示

3、**屏幕密度(ppi)**

又称屏幕像素密度,是指屏幕上**每英寸里包含的物理像素点个数,!单位是:pp**

(pixels per inch)

ppi值才是真正衡量一块屏幕是否清晰的核心指标

**PPI的计算方法是:PPI=开平方(X*X+Y*Y)/Z**

(其中X,Y指长,宽像素数,Z指屏幕大小)。

例如iphone4s分辨率为640*960,屏幕大小为3.5英寸,它的的PPI=开平方

(960*960+640*640)/3. 5=329.650

像素

**3、设备独立像素**

## 设备独立像素简称DIP或DP,又称屏幕密度无关像素

设备独立像素于物理像素关系

## 普通屏幕下1个设备独立像素对应1个物理像素

## 高清屏幕下1个设备独立像素对应N个物理像素

**4、像素比**

像素比(dpr):单一方向设备【物理像素】和【设备独立像素】的比例

5、像素之间的关系

在不考虑缩放的情况下(理想状态下):

普通屏(dpr=1):1css像素=1设备独立像素=1物理像素

2010之前

高清屏(dpr=2):1css像素=1设备独立像素=2物理像素

高清屏(dpr=3):1css像素=1设备独立像素=3物理像素

程序员写了一个width为100px的盒子,那么:

代表100个css像素;

若用户不进行缩放,则对应100个设备独立像素;

在dpr为2的设备上,这100个css像素占据了100*2=200个物理像素(横向)

(四)、视口的概念

## 视口(viewport)就是浏览器显示页面内容的屏幕区域

PC端视口:

在pc端,视口的默认宽度和浏览器窗口的宽度一致,在css标准文档中,pc

端视口也被称为:初始包含块。

移动端视口

移动端视口可以分为布局视口、视觉视口、理想视口(完美视现口)标准

1、布局视口

布局视口

默认的布局视口容器是980px,对pc页面进行压缩,压到跟手机一样大小,就

可以看了,只是元素看上去很小,只能手动去缩放,体验效果不好了

1. 视觉视口

视觉视口就是用户可见的区域,它的绝对宽度永远和设备屏幕一样宽,但这个

宽度里包含的css像素值是变化的

例如:一般手机将980个css像素放入视觉视口中。

注意:布局视口经过压缩后,横向的宽度用css像素表达,就不再是375px,而

是980px

描述一下iPhone6屏幕

1、物理像素:750px

2、设备独立像素:375px

3、css像素:980px

3、理想视口

与屏幕(设备独立像素)等宽的布局视口,称之为理想视口;认上布局视口宽度

与屏幕等宽(设备独立像素),靠meta标签实现

用户不需要缩放、滚动就能看到网站的全部内容

要为移动端设备单独设计一个移动端网站

开启理想视口的方法
```html
<meta name='viewport'content='width=device-width' />
```
(五)、meta标签设置

## 设置完美视口大小

## device-width视口宽度和设备保持一致

## initial-scale表示页面的初始缩放值,==>屏幕宽度(设备独立像素)布

## 局视口宽度

## user-scalable是否允许用户缩放

## maxinum-scale=1.0,最大允许缩放比例

## mininum-scale=1.0,最小允许缩放比例

## <meta name="viewport"

## content="

## width=device-width,

## initial-scale=1.0,

## user-scalable=no,

## maxinum-scale=1.0,

**mininum-scale=1.0 "** />

问题:图片也是有分辨率的概念的,分辨率指的是物理像素还是cSS像素呢?

图片的分辨率:指的是图片在水平垂直方向需要显示多少个物理像素(发光小

点)

例子:需求:在移动端iphone6中显示100*100px的盒子,里面装双时应的图片

iphone6物理像素宽时750px,设备独立像素时375px,

1个设备独立像素=1个css像素=2个物理像素

50*50设备独立像素=50*50css像素 =100*100物理像素

100*100设备独立像素=100*100css像素=200*200物理像素

一倍图:

使用的是100*100物理像素的图片

100*100分辨率图片=》对应屏幕中100*100的发光点(物理像素):=》对应

css中50*50px

此时强行设置100*100px css像素,很明显对比起来就较为模糊

## 二倍图

使用200*200的图片

200*200分辨率的图片=》对应屏幕200*200的发光点(物理像素)==》css中

100*100px

此时设置为100*100px,正好完美对应显示

结论

在现在移动端中,例如:在iphone6中,需要显示多少px的图片,为了不被强

行放大,需要使用宽高为2倍分辨率的图片,显示更好的效果

而这种使用的宽高为2倍分辨率大小的图片,称之为2倍图

实际开发过程中还存在2倍图、3倍图、4倍图之类的,但是具体使用哪一种看

公司具体的需要

## 响应式设计原则(面试题)

## 渐近增强

## 基本需求==>更好体验

## 优雅降级

## 完备功能==>向下兼容

移动优先的响应式布局采用的是渐进增强原则

二:移动开发的选择

由于移动端设备的屏幕尺寸大小不一,会出现:同一个元素,在两个不同的手

机上显示效果不一样(比例不同)。要想让同一个元素在不同词设备上,显示效

果一样,就需要适配,无论采用何种适配方式,中心原则永远是等比

## (二)、移动端开发几个注意点

**1、去除默认样式,可以用normalize.css(默认样式不去除,处理各浏览器对**

## 默认样式的不同解析),resize.css(直接把所有的默认样式都去掉,要用,你

## 就自己重设)

**2、盒子模型采用box-sizing的属性,border-box属性值**

**3、超链接点击高亮背景的效果需要去除**
```html
-webkit-tap-highlight-color:transparent;
```
三:移动端常见实现方式

1、响应式页面兼容移动端

百分比,flex,rem,媒体查询,

## 媒体查询(meidia Query):

## 作用:

**1.使用@media查询,可以针对不同的媒体类型定义不同的样式**

**2.@media可以针对不同的屏幕尺寸设置不同的样式**

**3.当重制浏览器大小的过程中,页面也会根据浏览器的宽度和高度重新渲染页面**

## 语法:
```html
@media媒体类型 关键字 (媒体特性){css}
```
## 媒体类型(可以同时用多个媒体类型,用逗号隔开,这样他们之间就是或的关系

## all所有设备

## print打印设备或打印预览

## screen带屏幕的设备(电脑,手机)

## speech屏幕阅读器

## 关键字and not only来连接

## 将媒体类型或多个媒体特性连接到一起作为媒体查询的条件

**and:可以将多个媒体特性连接到一起,相当于且的意思**

**not:排除某个媒体类型,相当于"非"的意思,可以省略**

**only:指定某个特定的媒体类型,可以省略**

## 媒体特性(必须要有小括号)

## width页面可见宽度

## max-width视口的最大宽度(视口小于指定宽度时就生效,小于等于xxxpx)

## min-width视口的最小宽度(视口大于指定宽度时就生效)

## max-height最大高度

## min-height最小高度

**orientation:landscape横屏**

**orientation:portrait 竖屏**

常用的断点

样式切换的分界点,我们称其为断点,也就是网页的样式

bootstarp框架
```html
[https://www.bootcss.com/](https://www.bootcss.com/)
```
2、单独制作移动端页面

百分比,flex,rem,vw

1>**流式布局**

**就是百分比布局**,也称为非固定像素布局

通过盒子的宽度设置成百分比来根据屏幕的宽度来进行伸缩,不受固定像素的限制,内

容向两侧填充,主要是设置宽度

一般配合以下属性使用,免得盒子里面的元素,被挤下来

max-width最大宽度(max-height最大高度)

min-width最小宽度(min-height最小高度)

2>、**flex弹性布局**

rem

(1)、**rem单位**

相对单位,相对于html根元素的字体大小,通过更改html文字的的大小,改变页面的

大小

(2)、rem适配方案

按照设计稿与设备宽度的比例,动态计算并设置html根标签的font-sizze大小(媒体查

询)

css中,设计稿元素的宽、高、相对位置等取值,按照同等比例换算为rem)为单位的

值

根字体=(手机横向设备独立像素值=设计稿css像素值)/10

设计稿元素设计数值转成rem:设计值/(设计稿宽度/10)

例如:iPhone6,根字体=375/10=37.5px

以rem为单位,即1rem=37.5px

如果设计稿是375px 写一个100px*100px的盒子,用rem来表示1100px/

(375px/10) =2.667rem

设计稿是固定的,根据设计稿来开发页面,用rem这个相对单立去根据设计稿设计的

大小开发好页面后,再根据不同的手机设备独立像素去更改根标签字体的大小,就

可以实现响应式的变化

手机横向设备独立像素值,可以用flexible.js计算,用里面的js去做ト理

css元素的设计值换算用css中的Cssrem:Root Font Size去实现

px to rem & rpx & vw (cssrem)

(3)、**flexible.js**

1、**手机淘宝团队出得移动端适配库,它的原理是将当前设备(设备独立像素=css像**

**素)划分为10等份,但不同设备下,比例还是一致的。**

## 只要确定当前html文字大小就可以了.

4>、混合布局(主流)

综上所有,一起使用,选取一种主要技术选型,其他技术为辅助(推荐

rem适配一移动端开发的步骤

第一步:拿到多大的设计稿,将root font size改成:设计稿的大JV10

第二步:引入flexable.js,会动态的去修改html的字体大小

第三步:正常根据设计稿的大小去开发,将所有的px值换算为rem的值

5>、vw、vh(未来的趋势)

## vw也是百分比,只不过这个百分比只参考设备视口

## vw (Viewport's width):1vw等于视口宽度的1%

## vh (Viewport's height):1vh等于视口高度的1%

vmin:vw和vh中的较小值

vmax:选取vw和vh中的最大值
```html
(1)、750的设计稿:html{font-size:13.3333vw}
```
1vw表示1%的屏幕宽度,而我们的设计稿通常是750px的,屏幕一共是100vw,对应的

就是750px,1vw=7.5px

那么1px就是0.13333vw,

同时我们知道另一个单位rem,rem是相对于html元素字体大小,放了方便计算,我们自

定义html字体大小为100px

通过上面的计算结果我们知道1px是0.13333vw,那么100px就是13.333vw了

这样后面的用rem就很好计算了。13.333vw对应的是100px,然后我们就可以很偷快的

写rem单位了,由于自定义的1rem=100px,

书写代码时,就是(设计图元素大小/100),单位是rem

如果750的设计稿设计一个盒子大小是200px,里面有字体大小50px,那么对应的就

是,盒子宽高2rem,字体大小是0.5rem
```html
(2)、1080设计稿:html{font-size:9.259vw}
```
如果设计稿时1080px,屏幕是100vw,那么对应的1px=0.09259vw,rem根标签依然自

定义取100px,那么就是1rem=100px,那么1rem=9.259vw

如果1080的设计稿设计一个盒子大小是200px,里面有字体大小50px,那么对应的就

是,盒子宽高2rem,字体大小是0.5rem

总结:

虽然还是vw布局,但还是用rem去写

1、无关屏幕的大小,反正100w,就是屏幕的100%,用屏幕的大小作为固定值换算

相对单位

2、自定义一个rem跟px之间的换算比值,为了好算一般是1rem=100px,计算出vw跟

rem,px之间的关系

例如750的设计稿:1font-size=100px=1rem=13.3333vw

3、后面750设计稿上的所有尺寸都用rem来算。例如200px*200px的盒子,就是

2rem*2rem的盒子,也就是26.666vw*26.666vw的盒子。

用vw去开发

1、看设计箱是多大,自定义1rem=100px,然后1px=xxxvw,
```html
将html{font-size:xxxvw}
```
2、去更改root font size,更改1rem=100px

3、根据设计稿的大小,将px值写成rem

总结:

## 都是一个绝对值为参考值

## flexable.js是以设备独立像素为绝对值,去算rem的值

## vw是设备的视口的宽度为绝对值,去算rem的值

## 最终都是把设计稿中的px换算成rem

## less是一门css的预处理语言

            -less是一个css的增强版，通过less可以编写更少的代码，实现更强大的样式

            -less中添加了许多的新特性，像对变量的支持，对mixin的支持。。。。

            -less的语法大体上和css语法一致，但less中添加了许多对css的拓展

      所以浏览器无法直接执行less代码，要执行必须将less转换为css，然后由浏览器执行

         **   -less即可以在客户端上运行，也可以借助Node.js在服务端运行**

    <!-**-第二种 easy less 引入我的css **
```html
     <link rel="stylesheet" href="./less语法.css">
```
## 第三种外部引入less
```html
    <link rel="stylesheet/less" type="text/less" href="./less语法.less">
```
    <!**-- 第一种方式直接在内容写，要引入less.js **
```html
     <style type="text/less">

     

    </style>
```
   第三种引入方法

  运行时编译
```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"></script>
```
   vscode 插件 Easy LESS 插件

 
```html
<!-- 定义变量1 -->

@color:yellow;

@width:300px;

@border:1px solid #000;

#wrap{

    width: @width;

    height: @height;

    background-color: @color;

    border:@border;

}

@width:300px;

@height:300px;

@color:red;

@border:10px double black;

<!-- 声明一个变量 -->

@sector:#wrap; //选择器

@w:width; //属性名

@h:height;

@{sector}{ //选择器这里必须加上花括号包裹

    @{w}:@width;

    @{h}:@height;

    border:@border;

    background-color:@color;

    margin:0 auto;

}

@url:"../img/img1.png";

<!-- .warp{ -->

background: url(../img.png) no-repeat;

 border: 1px solid @color;

<!-- } -->

.@{selector}{

    width: 100px;

    height: 100px;

    background: url(@url) no-repeat;

    border: 1px solid @color;

}

@var: 0px;

<!-- 变量是块级作用域 -->

.class {

  @var: 10px;

    .brass {

      @var: 20px;

      width: @var;  //30  读完块级作用域后，再去确定变量值

      @var: 30px;

    }

  width: @var;  //10

}

*{

    margin: 0;

    padding: 0;

}

ul{

    background-color: #333;

    overflow: hidden;

    height: 50px;

    line-height: 50px;

    width: 400px;

    margin: 50px auto;

    li{

        list-style: none;

        float: left;

        width: 25%;

        text-align: center;

        a{

            text-decoration: none;

            color: white;

        }

        <!-- &表示上一级选择器 -->

        &:hover{

            background-color:tomato;

        }

<!-- 带参数的混合 -->

<!-- 行参 -->

.base(@w,@h,@color){

    width: @w;

    height: @h;

    background-color: @color;

    margin-bottom: 10px

}

<!-- 以下传入实参 -->

#box1{

    .base(100px,100px,red);

}

#box2{

    .base(200px,200px,pink);

}

<!-- 带参数的混合 -->

<!-- 行参 -->

.base(@w:100px,@h:100px,@color:yellow){

    width: @w;

    height: @h;

    background-color: @color;

    margin-bottom: 10px

}

<!-- 以下传入实参 -->

#box1{

    .base(100px,100px,red);

}

#box2{

    .base(200px,200px,pink);

}
```
