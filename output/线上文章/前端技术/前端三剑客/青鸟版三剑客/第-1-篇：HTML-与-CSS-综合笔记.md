---
title: "第 1 篇：HTML 与 CSS 综合笔记"
slug: "javascriptes6-html-css-ea679145"
summary: "青鸟版 HTML 与 CSS 综合课堂笔记，覆盖网页结构、HTML 标签、CSS 样式、布局基础和三剑客入门认知。"
category: "青鸟版三剑客"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "青鸟版三剑客"
tags: []
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0d8"
originalSlug: "javascriptes6-html-css-ea679145"
originalStatus: "published"
publishedAt: "2026-01-25T13:23:07.511Z"
updatedAt: "2026-07-31T11:16:22.673Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 1 篇：HTML 与 CSS 综合笔记

**网页架构**

了解h5规范 

**<font style="color:#FF0000;">1.HTML中不区分大小写,但是我们一般都使用小写</font>**

**<font style="color:#FF0000;">2.HTML中的注释不能嵌套</font>**

**<font style="color:#FF0000;">3.HTML标签必须结构完整，要么成对出现，要么自结束标签</font>**

**<font style="color:#FF0000;">4.HTML标签可以嵌套，但是不能交叉嵌套</font>**

**<font style="color:#FF0000;">5.HTML标签中的属性必须有值，且值必须加引号(双引号单引号都可以)</font>**



什么是结构、表现、行为

  HTML 用于构建网页的结构

  CSS  用于设置网页的样式

  JavaScript  用于实现网页的行为

**<font style="color:#FF0000;">1、结构,是网页的骨架,由html超文本标记语言创建,用于搭建文档的结构、定义网页的内容，例如标题、正文、图像等；</font>**

**<font style="color:#FF0000;">2、表现,是网页的样式,由css负责创建,用于设置文档的呈现效果,例如颜色、字体、背景等；</font>**

**<font style="color:#FF0000;">3、行为,是网页的行为,由javascript语言创建,可实时更新网页中的内容，例如从服务器获取数据并更新到网页中，能够让网页更加生动。</font>**

```html
<!DOCTYPE html>
//声明是什么 html 
//文档声明，告诉浏览器，我是按照html的规范写的 防止出现怪异模式，从而出现乱码 
<html>//根元素/根标签  一个页面只有一个HTML 所有内容必修写在HTML

  <html lang="en">
    <!-- en,英语。zh-cn，中文 -->

    <head>//保存一些元信息，里面内容不会再页面中展示，只是辅助浏览器编译页面 

      <meta charset="utf-8">// <标签 属性="属性值">
        // meta 自结束标签，设置一些元信息，辅助浏览器编译代码

        charset  字符集
        utf-8  万国码
        GB2312  中国
        GBK    中国扩展版
        编码  将字符转成二进制
        解码  将二进制转成字符
        乱码  编码和解码参考的标准不一样 

        <title>  标题  </title>//页面标题 ，默认情况显示在浏览器的标题栏，最重要的作用帮助推广部门做SEO/SEM优化 

    </head>
    <body> //页面内容，书写网页的主体内容
      内容的主体内容 
    </body>
    //浏览器有自动纠错功能，但我们要尽可能避免
    1、影响向网站的性能
    2、它纠错后不一定是你要的 
  </html>
```



**<font style="color:#FF0000;"><!-- 声明用什么编码方式 --></font>**

<!-- meta 设置元数据 --><!-- **<font style="color:#FF0000;">meta标签用来设置网页的元数据</font>**，不会变的数据，给浏览器看的



（1）**<font style="color:#FF0000;">设置网页的字符集</font>**，避免乱码问题   charset 属性  属性值	

（2）meta 元素被用于规定**<font style="color:#FF0000;">页面的描述</font>**description/name/content、关键词keyword、文档的作者、最后修改时间以及其他元数据。

		<!-- 字符集 -->

		<meta charset="UTF-8">

	<!-- 1.存储时，务必采用合适的字符编码，否则无法存储，数据丢失

1. 存储时采用那种方式编码，读取时就采用那种方式解码，否则乱码 -->



	**<font style="color:#FF0000;"><!-- 重定向，描述，关键字 --></font>**

	<!-- 重定向  http-equiv定义重定向，content=时间 url--链接-->

	 <meta http-equiv="refresh" content="1;url=https://www.jd.com/" />



	 **<font style="color:#FF0000;"><!-- 描述 --></font>**

	 <meta name="description" content="淘宝网 - 亚洲较大的网上交易平台，提供各类服饰、美容、家居、数码、话费/点卡充值… 数亿优质商品，同时提供担保交易(先收货后付款)等安全交易保障服务，并由商家提供退货承诺、破损补寄等消费者保障服务，让你安心享受网上购物乐趣！">



**<font style="color:#FF0000;"> <!-- 关键字 --></font>**

	 <meta name="keywords" content="淘宝,掏宝,网上购物,C2C,在线交易,交易市场,网上交易,交易市场,网上买,网上卖,购物网站,团购,网上贸易,安全购物,电子商务,放心买,供应,买卖信息,网店,一口价,拍卖,网上开店,网络购物,打折,免费开店,网购,频道,店铺">



```html
   <meta charset="utf-8">
    <!-- 声明编码方式，防止乱码 -->
     <meta http-equiv="refresh" content="555555;url=https://www.baidu.com/" />
     <!-- 重定向  http-equiv定义重定向，content=时间 url--链接-->
      <!-- 跳过该网页，在设置时间后，进入链接 -->
```



**实体**

在网页中编写的多个空格默认会自动被浏览器解析为一个空格

在HTML中，一些如< >这种特殊字符是不能直接使用，比如空格，大于小于号等

如果我们需要在网页中书写这些，我们需要使用一些特殊的符号来表示这些特殊字符，

这些特殊符号我们称为实体（转义字符串）

浏览器解析到实体时，会自动将实体转换为其对应的字符



           **<font style="color:#FF0000;"> 实体的语法</font>**

**<font style="color:#FF0000;">                &实体的名字;</font>**

               

                    空格  &nbsp;

                    <  &lt;

                    >  &gt; 

                    版权符号 &copy;







**常用标签： **

**<font style="color:#FF0000;">  <h1> </h1>//不同字号，标题标签 h1 ~ h6,从大到小 ，加粗变大 </font>**

    <h2> </h2>

    <h3> </h3>

**<font style="color:#FF0000;"><p> </p>// 段落标签</font>**，段落标签用于表示内容中的一个自然段，特殊的块元素  一般只用来**<font style="color:#FF0000;">包裹文字或图片</font>**，它**<font style="color:#FF0000;">里面不能放块元素</font>**

像上面的每个标签，独占一行，称块元素

像 <em> </em>，不独占一行，称行内元素

行内元素通常在同一行显示，不能设置宽度和高度，而块级元素则独占一行，可以设置宽度和高度





**<font style="color:#FF0000;"><em> </em> //倾斜字体，行内元素 </font>**

**<font style="color:#FF0000;">   </font>**

**<font style="color:#FF0000;">   <strong> </strong>//加粗，行内元素</font>**

     <s> </s>

**<font style="color:#FF0000;"><del> </del></font>**//都表示一个删除的内容,字体中间加横线，**<font style="color:#FF0000;">表删除</font>**，例如打折页面 ，行内元素 

    <hgroup>

      <h1>瑕佽寖娆插垜銆?/h1>

      <h3>鍖栬鐢卞府銆?/h3>

    </hgroup>// 用来为**<font style="color:#FF0000;">标题分组</font>**，可以将一组相关的标题同时放入到hgroup,页面上没区别，主要方别看代码，行内元素 

    <blockquote>

      之老到能躲薪五严得灰报力一反秦为不订疾。

**<font style="color:#FF0000;"></blockquote></font>**//引用别人说的话 **<font style="color:#FF0000;">长引用 会换行 块元素,前面会空2个多点</font>**

    <!--  -->//注释符号，**<font style="color:#FF0000;">注释化：ctrl加 /</font>**  解除注释化，同理 

**<font style="color:#FF0000;"><q>病的子韩死故游六身。</q>//表示短引用，加引号，行内</font>**

有些标签是没尾标签的，如 <meta charset="utf-8">



**<font style="color:#FF0000;"><br />//换行</font>**，插哪里，哪里换行，行内



	**<font style="color:#FF0000;"><hr /></font>**//页面上显示一个**<font style="color:#FF0000;">分割线</font>**，独占一行，块元素 



	<center>

      承以冇看么我在司身。

      <p>我下落一死落子自明。</p>

**<font style="color:#FF0000;">    </center>  //居中效果</font>**



	**<font style="color:#FF0000;"><div></font>**计划管控就好了</div>//没有任何语义，**<font style="color:#FF0000;">只表示一个块元素</font>**，没效果，制造出一个块元素



	**<font style="color:#FF0000;"><span></font>**为疾为战都他，后宋。</span>//没有任何语义，**<font style="color:#FF0000;">表示一个行内元素</font>**,一般就用来包裹文字 



元素在文档流中会区分为 块元素 行内元素 行内块元素







**<font style="color:#FF0000;">块元素</font>**

一般是用来布局

1、会**<font style="color:#FF0000;">独占一行</font>**，自上而下一行一行的排列 

2、块元素的宽度默认是父元素的百分百

3、块元素的高度默认是被内容撑开

**<font style="color:#FF0000;">常用块元素：div  p  h1-h6  ul  li  ol  header footer  main  nav</font>**



**<font style="color:#FF0000;">行内元素</font>**

一般用来包裹文字

1、**<font style="color:#FF0000;">不会独占一行</font>**,自左向右排列，一行满了，就挪到下一行，再自左向右

2、行内元素宽高都是被内容撑开的，**<font style="color:#FF0000;">不可以自定义宽度</font>**

**<font style="color:#FF0000;">常用行内元素：span  a  i   em  strong  del  s</font>**



**<font style="color:#FF0000;">行内块元素</font>**

兼具块元素，行内元素的特点

**<font style="color:#FF0000;">又不会独占一行，又可以设置宽高</font>**

**<font style="color:#FF0000;">常用行内块元素：img</font>**



注意：

       1、块元素是布局元素，里面什么都能放，能方块元素，能放行内元素，行内块元素

       2、行内元素里面不能放块元素  一般就用来包裹文字 

       3、特殊的块元素  p     不能放块元素

       4、特殊的行内元素  a   里面什么都能放，除了它自己	

















**结构化标签**

    <!-- 布局标签（结构化标签） 

**<font style="color:#FF0000;">header  网页的头部</font>**

**<font style="color:#FF0000;">    main  网页的主体部分（一般就一个）</font>**

**<font style="color:#FF0000;">    footer 网页的底部</font>**

**<font style="color:#FF0000;">    nav  网页的导航</font>**

**<font style="color:#FF0000;">    aside  和主体相关的内容，侧边栏</font>**

**<font style="color:#FF0000;">    article  文章之类的</font>**

**<font style="color:#FF0000;">    section 独立的区块，上面的标签都不合适，就用这个</font>**

	-->

    <header>头部</header>

    <main>

      主体

      <nav></nav>//导航 

      <aside></aside>//和主体相关的内容，侧边栏

      <article></article>//和文章相关， 文章之类的

    </main>

    <footer>

      底部

      <section></section>//独立的区块

    </footer>











**列表**

    <!-- 列表（list） 一组一组  

      1:有序列表  用**<font style="color:#FF0000;">ol</font>**标签创建，**<font style="color:#FF0000;">li</font>**表示列表项

项目符号：**<font style="color:#FF0000;">1(默认值)、a、A、i、I</font>**

      2:无序列表  用**<font style="color:#FF0000;">ul</font>**标签创建，**<font style="color:#FF0000;">li</font>**表示列表项

                项目符号： **<font style="color:#FF0000;"> disc，默认值，实心的圆点</font>**

				        	**<font style="color:#FF0000;">square</font>**，**<font style="color:#FF0000;">实心的方块</font>**

				        	**<font style="color:#FF0000;">circle，空心的圆</font>**

     3:定义列表  用**<font style="color:#FF0000;">dl</font>**标签创建，使用**<font style="color:#FF0000;">dt</font>**对内容进行定义，使用**<font style="color:#FF0000;">dd</font>**对内容进行解释说明



**<font style="color:#FF0000;">start 属性的值是一个整数，定义一个开始位置</font>**

**<font style="color:#FF0000;">type属性  可以更改项目符号</font>**

**<font style="color:#FF0000;">list-style:none;去除项目符号</font>**

    注意：列表之间是可以互相嵌套的

属性写在开始标签里，用空格分开 

    <ol type="i">//创建有序表 ，type属性  更改项目符号，项目符号是i 

      <div> </div>

      <li> </li>

      <li> </li>

    </ol>

    <ul type="circle">//创建无序表，type属性  更改项目符号，项目符号是空心的圆 

      <li>一已光。</li>

      <li>身烦于有。</li>

      <li>他单卡，人。</li>

    </ul>

    <dl>

**<font style="color:#FF0000;"><dt>html</dt>//列表小标题 ，下定义 </font>**

**<font style="color:#FF0000;">      <dd>html5</dd>//对定义的解释 </font>**

      <dd>css3</dd>

      <dd>less</dd>

      <dd>sass</dd>

      <dt>js</dt>

      <dd>js基础</dd>

      <dd>DOM</dd>

      <dd>Bom</dd>

    </dl>







**<a>超链接**

<!-- 2个属性，2个功能，1个补充 -->

**<font style="color:#FF0000;">属性 href（跳转地址），target（在哪里显示）</font>**

**<font style="color:#FF0000;">功能 #（跳到顶部） #id属性值（跳到页面指定位置）</font>**

**<font style="color:#FF0000;">补充 空链接，在href属性中写入一个#或者是javascript:;</font>**，



<!-- HTML页面使用超链接与网络上的另一个HTML页面相连。几乎可以在所有的网页中找到超链接，点击超链接会出现很多效果：

**<font style="color:#FF0000;">1：可以让我们从一个页面跳转到另一个页面，</font>**

**<font style="color:#FF0000;">        2：当前页面的其他位置</font>**

**<font style="color:#FF0000;">        3:下载</font>**



—在HTML中链接可以是一个字，一个词，也可以是一个图片，这些都是可以点击的。

—使用a标签来创建一个超链接，它是个**<font style="color:#FF0000;">行内元素</font>**，在a标签中可以嵌套除自身外的任何元素

		-->

    <!-- 属性：

			   **<font style="color:#FF0000;">1: href属性: 指向链接跳转的目标地址</font>**

			        -值可以是一个外部的网站的地址    绝对路径

				    -可以是一个内部页面的地址       相对路径

（1）：绝对路径 就是指完整的描述目标文件位置的路径。

简单来说，绝对路径就是无论你当前的位置在哪，找到目标文件的路径是不变的。

（2）：相对路径 就是指由这个文件所在的路径引起的跟其它文件（或文件夹）的路径关系。

 简单来说，相对路径和你所在的位置是有关系的，你所在位置的不同会导致相对路径也会不同。-->





    <!-- **<font style="color:#FF0000;">2: target属性：可以用来指定打开链接的位置</font>**

		可选值：

		**<font style="color:#FF0000;">_self，表示在当前窗口中打开（默认值）</font>**

**<font style="color:#FF0000;">		_blank，在新的一个新的页面中打开链接 </font>**

		可以设置一个内联框架的name属性值，链接将会在指定的内联框架中打开-->

    <!--

**<font style="color:#FF0000;">锚点功能</font>**（页面内的跳转）

        所谓锚点 ，就是指当点击链接文本时，跳转到当前页面的指定元素位置



         （1）若将超链接的**<font style="color:#FF0000;">href属性设置为#</font>**，点击超链接后，

**<font style="color:#FF0000;">页面不会发生跳转</font>**，而是**<font style="color:#FF0000;">跳到</font>**当前页面的**<font style="color:#FF0000;">顶部</font>**的位置



         （2）**<font style="color:#FF0000;">跳转到页面的指定位置</font>**，

            语法：将href属性设置为  **<font style="color:#FF0000;">#目标元素的id属性值</font>**



**<font style="color:#FF0000;">给标签加标记——id属性</font>**（唯一不重复的标记）

              -每一个标签都可以添加一个id属性

**<font style="color:#FF0000;"> -id属性就是元素的唯一标识，同一页面中不能出现重复的id属性</font>**

**<font style="color:#FF0000;">              -id区分大小写，且不能以数字开头</font>**

      -->

              <a href="" target=""></a>

              <a href="#"></a>

              <a href="#id"></a>

              <a href="javascript"></a>





      <!-- 

        4:**<font style="color:#FF0000;">空链接</font>**

         不想使<a>元素生效，**<font style="color:#FF0000;">在href属性中写入一个#或者是javascript:;</font>**，

     此时的**<font style="color:#FF0000;">超链接没有作用</font>**，当还没有想好超链接具体跳转位置时，可以当做**<font style="color:#FF0000;">占位符</font>**使用。      

       -->





       <!-- cdn方式引入外链 -->

       <a href="https://www.baidu.com/" target="_blank">跳转链接</a>

       <!-- 内部页面的跳转 -->

       <!-- 什么是绝对路径 -->

       <!-- 相对路径去查找，当前./,上层../继续查找 -->

       <a href="./03.列表.html" target="_blank"> 同一层文件下面的跳转</a>

       <a href="../01.网页结构/06实体.html" target="_blank">不同文件下的跳转</a>

       <!-- 空标签 -->

       <a href="#"> 内容</a>

       <!-- 锚链接 -->

       <a href="#bottom">去底部</a>  



       <a href="#center">去中间</a>



  <!-- 在开发中可以将#作为超链接的路径的占位符使用 -->

         <a href="#">我还想好链接到哪里，先占个位子</a>

**<font style="color:#FF0000;"><!-- javascript:;，此时点击，没有任何反应</font>** -->

         <a href="javascript:;">我还想好链接到哪里，先占个位子</a>









**<img>引入图片**



<!-- 使用img标签来向网页中**<font style="color:#FF0000;">引入</font>**一个外部**<font style="color:#FF0000;">图片</font>**，img标签也是一个自结束标签，img这种元素属于替换元素（基于块和行内元素之间，具有两种元素的特点）



**<font style="color:#FF0000;">src   引入图片的路径 //路径</font>**

**<font style="color:#FF0000;">alt 可以用来设置在图片不能加载时，对图片的描述，</font>**图片不显示时，网页显示图片描述搜索引擎可以通过alt属性来识别不同的图片

如果不写alt属性，则搜索引擎不会对img中的图片进行收录

**<font style="color:#FF0000;">width</font>**：可以用来**<font style="color:#FF0000;">修改图片的宽度</font>**,一般使用px作为单位

**<font style="color:#FF0000;">height</font>**：可以用来修改图片的**<font style="color:#FF0000;">高度</font>**，一般使用px作为单位

         //  **<font style="color:#FF0000;">注意：一般不会同时设置宽高，以防图片变形 </font>**



           注意：

1:宽度和高度两个属性如果指设置一个，另一个也会同时等比例调整大小，如果两个值同时指定则按照你指定的值来设置。

2:一般开发中除了自适应的页面，不建议设置width和height，大图变小，会多占内存，小图变大会失真

3:pc端，需要多大的图，就裁多大的，移动端，进场会对图片进行缩放（大图缩小）   	



<!-- **<font style="color:#FF0000;">行内块元素 具备块元素的可设置宽高同时具备行内元素的不独占一行</font>** -->



<!-- 内部图片的引入 -->

<img src="./img/img/bl.gif" alt="这是一张图片">

<img src="./img/img/bl.gif" alt="这是一张图片" width="300" height="400">

<img src="./img/京东logo.png" alt="">



**<font style="color:#FF0000;">img标签是行内块元素 ，自结束标签</font>**









**图片格式（jpg gif png webp base64）		**		

和油漆是一个道理，不同的图片格式特性不一样，使用场合也有所不同。



**<font style="color:#FF0000;">JPEG(JPG)//效果好，保存图片</font>**

- JPEG图片支持的颜色比较多，图片**<font style="color:#FF0000;">可以压缩</font>**，但是**<font style="color:#FF0000;">不支持透明</font>**

- 一般用来保存照片等颜色丰富的图片





**<font style="color:#FF0000;">GIF//动图 </font>**

- GIF支持的颜色少，只**<font style="color:#FF0000;">支持简单的透明，支持动态图</font>**

- 图片颜色单一或者是动态图时可以使用gif





**<font style="color:#FF0000;">PNG//显示复杂的图片，为网页而生 </font>**

- PNG支持的颜色多，并且**<font style="color:#FF0000;">支持复杂的透明，不支持动图</font>**

- 可以用来显示颜色复杂的透明的图片

专为网页而生的





**<font style="color:#FF0000;">webp//优点全具备，但兼容性不好</font>**

-谷歌新推出的专门用来表示网页的一种格式

-它具有其他图片格式的所有优点，而且文件格式还很小

**<font style="color:#FF0000;">-缺点：兼容性不好</font>**



**<font style="color:#FF0000;">base64 //与网页一起出现，需要先转字符</font>**

-讲图片使用base64编码，这样可以将图片转换为字符，通过字符形式来引入

-一般都是需要和网页一起加载的图片才会使用base64







图片的使用原则：

效果不一致，使用效果好的

效果一致，使用小的





网页加载流程：

先加载网页结构，然后再加载外部的资源包括css文件，js文件，图片，各种插件等	     







**内联框架**

<!-- **<font style="color:#FF0000;">用iframe来定义一个内联框架</font>** -->



<!-- **<font style="color:#FF0000;">iframe:</font>**

**<font style="color:#FF0000;">src：引入外部网址，全路径/内部链接，相对路径</font>**

**<font style="color:#FF0000;">    frameborder:去除边框效果 </font>**

**<font style="color:#FF0000;">    width：宽度</font>**

**<font style="color:#FF0000;">    height: 高度</font>**

**<font style="color:#FF0000;">    name ：链接的 target 属性</font>**

**<font style="color:#FF0000;">    target: 作为链接的目标</font>**

**<font style="color:#FF0000;">    iframe 可用作链接的目标（target）。</font>**

**<font style="color:#FF0000;">    链接的 target 属性必须引用 iframe 的 name 属性：</font>**

  -->





  <!-- **<font style="color:#FF0000;">链接跳转</font>** -->

  <iframe src="https://www.w3school.com.cn/" frameborder="0" width="800" height="600"> </iframe>

  <!-- <iframe src="./02.结构标签.html" width="800" height="600"></iframe> -->

  <!-- **<font style="color:#FF0000;">内嵌内部页面</font>** -->

**<font style="color:#FF0000;">// 定义一个内联框架，实现在网页里出现多个网页</font>**

<font style="color:#6A9955;"><!-- 引入外部网址，全路径，并装饰框架 --></font>





  <!-- **<font style="color:#FF0000;">链接跳转内部展示/不刷新浏览器</font>** name="iframe_a" target="iframe_a"-->

  <!-- **<font style="color:#FF0000;">在内部更新盒子内容</font>** -->

  <iframe src="./02.结构标签.html" width="800" height="600" name="iframe_a"></iframe>

  <a href="https://www.w3school.com.cn/" target="iframe_a">点击更新</a>

**<font style="color:#FF0000;">//定义一个内联框架，用name命名框架，再用<a>链接其他网址，实现内部更新框架内容</font>**

<font style="color:#6A9955;">先做框架并起名，再用超链接的target属性指定在该框架，进行跳转</font>













**音视频引入**

音乐：

    <!-- **<font style="color:#FF0000;">audio标签</font>** 用来向页面中**<font style="color:#FF0000;">引入</font>**一个外部的**<font style="color:#FF0000;">音频</font>**文件

              音视频文件引入时，**<font style="color:#FF0000;">默认</font>**情况下**<font style="color:#FF0000;">不允许用户自己控制播放停止</font>**

              IE9以下的浏览器是不支持的

            属性：

**<font style="color:#FF0000;">controls  是否允许用户控制播放，不用给值</font>**

**<font style="color:#FF0000;">              autoplay  音频文件是否自动播放  打开页面时，音乐会自动播放，</font>**

**<font style="color:#FF0000;">                           但目前为止，大部分浏览器是不可以自动播放的</font>**

**<font style="color:#FF0000;">              loop  是否循环播放</font>**

     -->

     <!-- 第一种方式 -->

<!-- <audio src="./source/BABYDOLL .mp3" controls autoplay loop></audio> -->



**<font style="color:#FF0000;">source引入资源  //在audio中引入</font>**

<!-- 第二种方式 -->

    <!-- <audio controls autoplay loop >

**<font style="color:#FF0000;"><source src="./source/Hurt.mp3"></font>**

</audio> -->



**<font style="color:#FF0000;"><!-- embed引入资源：src  type  --></font>**

     <!-- <embed src="./source/Hurt.mp3" type="audio/mp3"> -->

视频：

<!-- **<font style="color:#FF0000;">video标签</font>**来向页面中**<font style="color:#FF0000;">引入</font>**一个**<font style="color:#FF0000;">视频</font>**，**<font style="color:#FF0000;">使用方式跟音频基本上一样的</font>** -->



<video src="./source/蜗居.mp4" controls autoplay loop ></video>



    <video controls autoplay loop >

      <!-- <source src="./source/video.webm"> -->

      <!-- <source src="./source/绝地逢生.mp4"> -->

      <source src="./source/3月3日高颜值小家电.mp4">

    </video>









css

**<font style="color:#FF0000;">css  -层叠样式表 </font>**

      -网页实际上是一个多层的结构，通过css可以分别为网页的每一层来设置样式，而最终我们能看到的只有最上边的一层  **<font style="color:#FF0000;">//类似女生化妆 ，给网页化妆</font>**

             -设置网页中元素的样式

如果要设置css样式，前提  

1. **<font style="color:#FF0000;">css书写位置</font>**
2. **<font style="color:#FF0000;">如何选中对应的结构  </font>****//先找对地方，后化妆 ****<font style="color:#FF0000;"> </font>**

你要找的事，找对追求目标，然后各种花招追求她（他）





**CSS书写位置：**

**<font style="color:#FF0000;">CSS样式：名值对的结构   样式名:样式值;</font>**



**<font style="color:#FF0000;">font-size: 30px;       设置字体大小</font>**

**<font style="color:#FF0000;">      color:red;          设置字体的颜色</font>**

**<font style="color:#FF0000;">      background:black;   设置背景颜色</font>**



**<font style="color:#FF0000;">第二种方式：内部样式表</font>**

**<font style="color:#FF0000;">写在<head>里，在<style>标签里写样式 </font>**

    在head标签里配置style标签，通过选择器选中对应html结构，

      在花括号里面设置css声明块，可以写多组样式，也是以;隔开

      //在style里先选对应的元素，然后设置样式 



**<font style="color:#FF0000;">语法：选择器{css声明块}</font>**

**<font style="color:#FF0000;">      缺点：不方便复用   </font>**

**<font style="color:#FF0000;">           html文件会变得很长，看起来也不好看</font>**

总结：比较大的项目，或者重复使用率比较高的部分，不建议使用

	  //主要想写一次代码，其他html也可以用 



<head>  

    <style>

      div {

        color: pink;

        font-size: 50px;

        background-color: red;

      }

</style>

</head>





**<font style="color:#FF0000;">第三种方式：外部样式表</font>**



**<font style="color:#FF0000;">在html文件外新建一个.css文件</font>**，**<font style="color:#FF0000;">在css文件通过选择器选中对应的结构，设置相关的样式</font>**

**<font style="color:#FF0000;">通过link标签，将html文件和css文件联系在一起  //用前，先引用 </font>**



    总结：大的项目，或者复用率高的，推荐使用

    //**<font style="color:#FF0000;">一次代码，多个文档使用</font>**

    <link rel="stylesheet" href="./03peiqi.css" />

<font style="color:#6A9955;"><!-- link在head，但不在style --></font>



**<font style="color:#FF0000;">第一种方式：内联样式/行内样式</font>****<font style="color:#FF0000;">  </font>**



**<font style="color:#FF0000;">//在<body>标签里进行，样式写在开始标签里</font>**

**<font style="color:#FF0000;">在开始标签内，配置style属性，在style属性值里写css样式 </font>**

	   //样式分为   样式名：样式值;   名值对的结构 

       可以写多组css样式，样式与样式之间**<font style="color:#FF0000;">用;隔开</font>**



       缺点：

          1、结构和样式耦合   //显得不好看 

          2、不容易修改       //代码太多，修改麻烦 

       总结：不建议使用



























**CSS的语法**

html和css是两种不同的语言，所以有不同的书写位置，也有不同的语法

				**<font style="color:#FF0000;">CSS的语法：</font>**

**<font style="color:#FF0000;">					选择器  声明块</font>**



				**<font style="color:#FF0000;">选择器：如何选中对应的html标签	</font>**

**<font style="color:#FF0000;">				声明块：就是对应的css样式    名值对结构</font>**				



			**<font style="color:#FF0000;">标签{名值对}  </font>**** //地方{妆容}**

  //CSS的注释必须写在style里，或者是CSS文件中 











**CSS常用选择器（元素、id、class、*）**

    <style>

      /* 需求一：标题变红色 */

1. **<font style="color:#FF0000;">元素（标签）选择器</font>**



**<font style="color:#FF0000;">作用：通过标签名选中对应的内容</font>**

**<font style="color:#FF0000;">      语法：标签名{}</font>**



      注意：html常用标签大概20多个，如果用元素选择器选中设置css样式

       一定要注意，是否会波及到其他的内容，如果波及到了，就不要用元素选择器

      h1 {

        color: red;

      }





      /* 需求二：将第一句诗变绿色 */

1. **<font style="color:#FF0000;">id选择器</font>**



**<font style="color:#FF0000;">作用：通过id属性值，选中对应的结构</font>**

**<font style="color:#FF0000;">      语法：#id属性值{}</font>**



**<font style="color:#FF0000;">注意：id属性值不能重复使用，不能以数字开头，不能是汉字</font>**

**<font style="color:#FF0000;">id值唯一，不能复用</font>**

      #p1 {

        color: green;

      }





      /* 需求三：将第二句诗也变绿色 */



1. **<font style="color:#FF0000;">class选择器</font>**



**<font style="color:#FF0000;">作用：通过指定class属性值，选中对应的结构</font>**

**<font style="color:#FF0000;">      语法：.class属性值{}</font>**



      注意：（1）、这也是最常用的选择器  

（2）、 **<font style="color:#FF0000;">可以起多个class属性值，中间以空格隔开 </font>**



**<font style="color:#FF0000;">与id相比，class可以复用</font>**

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

1. **<font style="color:#FF0000;">通配选择器 </font>**



**<font style="color:#FF0000;">作用：选中页面中所有的标签</font>**

**<font style="color:#FF0000;">      语法：*{}</font>**

      选所有的 

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









**CSS复合选择器（交集、并集）**



复合选择器：

**<font style="color:#FF0000;">交集选择器</font>**

**<font style="color:#FF0000;">作用：选中满足多个条件的元素</font>**

**<font style="color:#FF0000;">              语法：选择器1选择器2选择器3····{}</font>**

              注意：如果选择器中有元素选择器，**<font style="color:#FF0000;">元素选择器必须放在第一</font>**位



**<font style="color:#FF0000;">并集选择器</font>**

**<font style="color:#FF0000;">              作用：同时选中多个选择器对应的内容</font>**

**<font style="color:#FF0000;">              语法：选择1,选择器2，选择器3···{}</font>**

总结：

**<font style="color:#0070C0;">交集，从多个条件中找到符合的元素。并集，选择多个选择器的元素化妆，简化了代码</font>**



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











**CSS关系选择器****<font style="color:#0070C0;">（父>子{} 祖先 后代{}  兄+弟{}  兄~弟{}）</font>**



      /* 需求一：为div的子元素span设置一个字体颜色红色 */

**<font style="color:#FF0000;">  1、子元素选择器</font>**

**<font style="color:#FF0000;"> 作用：通过指定的父元素找到指定的子元素</font>**

**<font style="color:#FF0000;">      语法：父元素>子元素{}</font>**

      #cs > span {

        color: red;

      }

      /* 需求二：div里的span元素字体都变为30px */

	**<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;">2、后代选择器</font>**

**<font style="color:#FF0000;">  作用：通过指定的祖先元素找到指定的后代元素</font>**

**<font style="color:#FF0000;">      语法：祖先元素 后代元素{}</font>**



注意：由于子元素一定情况下也属于后代元素，在使用的时候，能用子元素选择器，不用后代选择器,否则一定程度上会影响网站性能

       #cs span {

        font-size: 30px;

		color: blue;

      } 

      /* 需求三:选择下一个兄弟(仅挨着我的)*/

**<font style="color:#FF0000;">  </font>****<font style="color:#FF0000;">3、下一个兄弟选择器</font>**

**<font style="color:#FF0000;">作用：通过指定兄找到紧挨着下一个兄弟</font>**

**<font style="color:#FF0000;">      语法：兄+弟{}</font>**

     .s1+span{

        background-color: pink;

      } 





      /* 四:选择下面所有的兄弟(前面的不选)*/

**<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;">4、选择所有兄弟选择器 </font>**

**<font style="color:#FF0000;">      作用：通过指定兄找到下面所有的兄弟，不包括前面的</font>**

**<font style="color:#FF0000;">      语法：兄～弟{}</font>**

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

        我是生鲜区

        <span

          >肉类

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

**<font style="color:#FF0000;"><!-- 元素之间的关系</font>**

**<font style="color:#FF0000;">    父子关系</font>**

**<font style="color:#FF0000;">      直接包含和被包含的关系</font>**

**<font style="color:#FF0000;">    祖先后代关系</font>**

**<font style="color:#FF0000;">      直接或间接包含和被包含的关系</font>**

**<font style="color:#FF0000;">    兄弟关系</font>**

**<font style="color:#FF0000;">      拥有共同父元素的元素</font>**

-->  */

<!-- 	<div>

		<div>

			<div></div>

			<div></div>

		</div>

	</div> -->

  </body>

</html>











**CSS属性选择器**

**<font style="color:#0000FF;">    </font>**

      /* 需求一：有title属性的p标签，颜色变为红色 */

**<font style="color:#FF0000;">  </font>****<font style="color:#FF0000;">1:属性选择器</font>****<font style="color:#FF0000;">  通过指定的属性名或属性值来选中对应的内容</font>**

**<font style="color:#FF0000;">           语法：[属性名]{} 选择含有</font>****<font style="color:#0000FF;">指定属性</font>****<font style="color:#FF0000;">的元素</font>**

**<font style="color:#FF0000;">[属性名=属性值]{} 选择含有</font>****<font style="color:#0000FF;">指定属性和属性值</font>****<font style="color:#FF0000;">的元素</font>**

**<font style="color:#FF0000;">                 [属性名^=属性值]{} 选择</font>****<font style="color:#0000FF;">属性值</font>****<font style="color:#FF0000;">以指定值</font>****<font style="color:#0000FF;">开头</font>****<font style="color:#FF0000;">的元素  </font>****//开头 ^**

**<font style="color:#FF0000;">                 [属性名$=属性值]{} 选择</font>****<font style="color:#0000FF;">属性值</font>****<font style="color:#FF0000;">以指定值</font>****<font style="color:#0000FF;">结尾</font>****<font style="color:#FF0000;">的元素  </font>****//结尾 $**

**<font style="color:#FF0000;">                 [属性名*=属性值]{} 选择</font>****<font style="color:#0000FF;">属性值</font>****含有****<font style="color:#0000FF;">某值</font>****<font style="color:#FF0000;">的元素      </font>****//含有 ***

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

    <h1 title="a" id="abcd">满江红·写怀</h1>  //title属性，鼠标点哪，会显示属性值 

    <h3 title="ab" class="ab">岳飞·宋</h3>

    <p>····</p>

    <p title="babcb" class="abc">靖康耻，犹未雪。臣子恨，何时灭！</p>

    <p title="babcdab">驾长车，踏破贺兰山缺。</p>

    <p>壮志饥餐胡虏肉，笑谈渴饮匈奴血。</p>

    <p>待从头、收拾旧山河，朝天阙。</p>

  </body>

</html>







**伪类选择器  **



**<font style="color:#FF0000;">一 、伪类（不存在的类，特殊的类）</font>**

          -伪类不特指某一个元素，指的是**<font style="color:#FF0000;">一个元素的特殊状态</font>** // 元素的特殊状态

           -比如：第一个元素，被点击的元素，鼠标移入的元素···

          -特点：一般请情况下，**<font style="color:#FF0000;">使用：开头</font>**

**<font style="color:#FF0000;">1、 :first-child  第一个子元素</font>**

**<font style="color:#FF0000;">			 先选位置，再判断元素</font>**

**<font style="color:#FF0000;">             2、 :last-child   最后一个子元素</font>**

**<font style="color:#FF0000;">             3、 :nth-child()  选中第n个子元素</font>**

**<font style="color:#FF0000;">                   特殊值： n    所有的</font>**

**<font style="color:#FF0000;">                          2n或even  选中偶数</font>**

**<font style="color:#FF0000;">                          2n+1或odd  选中奇数</font>**

         // 以上这些伪类都是**<font style="color:#FF0000;">根据所有的子元素进行排序</font>**



**<font style="color:#FF0000;">1、:first-of-type  选中第一个子元素</font>**

**<font style="color:#FF0000;">			 先找元素，再判断位置</font>**

**<font style="color:#FF0000;">             2、:last-of-type    选中最后一个子元素</font>**

**<font style="color:#FF0000;">             3、:nth-of-type()   选中第n个子元素</font>**

**<font style="color:#FF0000;">                  功能跟上面相似，</font>**

**<font style="color:#FF0000;">              不同的是，这是在</font>****<font style="color:#00B0F0;">同类型的子元素中去选择</font>**

    需求： ul里面的第一句诗永远是红色 

       li:first-of-type{

        color: red;

      }               



**<font style="color:#FF0000;"> 二、:not() 否定伪类</font>**

**<font style="color:#FF0000;">-将符合条件的元素从选择器中去除</font>**



       需求2:将所有li字体变绿色，除了class为l1



**<font style="color:#00B0F0;"> li:not(.l1) {</font>**

**<font style="color:#00B0F0;">        color: green;</font>**

**<font style="color:#00B0F0;">      }</font>**

	    ul  li:nth-child(2n+1){

		  color: red;

	  } 

	 ul p:first-of-type{

		  color: red;

	  }



**a元素的伪类**

	**<font style="color:#FF0000;">a元素的伪类  访问过、未访问过、鼠标移入/点击的状态等</font>**



      /* 需求一：给未访问过的超链接加红色字体 */

**<font style="color:#FF0000;">1、:link  用来表示未访问过的链接（正常链接）</font>**

      a:link {

        color: red;

      }

      /* 需求二：给访问过的超链接加绿色字体 */

**<font style="color:#FF0000;">2、:visited 用来表示访问过的链接</font>**

               由于隐私的原因，所以visited只能改颜色 

      a:visited{

        color: orange;

        font-size: 50px;

      }

**<font style="color:#FF0000;">//注意：:link :visited 这两个伪类是超链接独有</font>**



      /* 需求三：鼠标移入，链接字体变大到30px */

**<font style="color:#FF0000;">3、:hover 用来表示鼠标移入的状态</font>**

      a:hover{

        font-size: 30px;

        color: red;

      }

      /* 需求四：鼠标点击后，增加背景色pink */

**<font style="color:#FF0000;">4、:active  鼠标点击后的状态</font>**

      a:active{

        background-color: pink;

      }

**<font style="color:#FF0000;">//注意：:hover、:active 是所有标签共有的伪类</font>**

      love hate //都出现的话，有顺序 

**<font style="color:#FF0000;">L-V-H-A </font>**

<font style="color:#FF0000;">a，LVHA 伪类-超连接：你先捡到了个LV包，然后你HA哈大笑</font>。

<font style="color:#6A9955;">l（link）ov（visited）e h（hover）a（active）te</font>



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





**伪元素选择器**

    <style>

      /* 需求一：让文章的首字母一直为字体为24px */

      /* 需求二：让文章的第一行添加背景色黄色 */

      /* 需求三：让选中的内容，字体为红色 */

      /* 需求四：在元素开始的位置前+'abc' */



**<font style="color:#FF0000;">伪元素，表示页面中一些特殊的并不真实存在的元素（元素的位置）</font>**

**<font style="color:#FF0000;">::first-letter  表示第一个字母</font>**

**<font style="color:#FF0000;">          ::first-line  表示第一行</font>**

**<font style="color:#FF0000;">          ::selection  选中的内容</font>**

**<font style="color:#FF0000;">          ::before  元素的开始位置</font>**

**<font style="color:#FF0000;">          ::after   元素的结束位置</font>**

**<font style="color:#FF0000;">               </font>**

**<font style="color:#FF0000;">before和after必须要结合content使用 //在元素的开始或结束位置加内容 </font>**

**<font style="color:#FF0000;">               //加的内容是行内元素</font>**

**<font style="color:#FF0000;">行内，after，before</font>**



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

      结核杆菌dolor sit amet consectetur adipisicing elit. Dicta, dignissimos?

      的三九由，导不竟德。

    </p>

  </body>

</html>







**样式的继承（继承祖先的资产）**

定义：**<font style="color:#FF0000;">为一个元素设置的样式，同时也会应用到它的后代元素上</font>**

优势：**<font style="color:#FF0000;">方便</font>**我们**<font style="color:#FF0000;">开发</font>**，讲一些通用的样式统一设置到共同的祖先元素上，子元素的样式都可以获取到样式



**<font style="color:#FF0000;">注意：并不是所有的样式都会被继承，比如：背景相关的，布局相关等不会被继承</font>**

















**选择器的权重**



**<font style="color:#FF0000;">样式冲突</font>**   **<font style="color:#FF0000;">通过不同的选择器选中同一个元素，进行一样的样式设定</font>**

**<font style="color:#FF0000;">发生样式冲突时，应用哪一个样式由</font>****<font style="color:#0070C0;">选择器的权重</font>****<font style="color:#FF0000;">（优先级）决定</font>**

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

      面试题：

      选择器权重              权重（模拟）

**<font style="color:#FF0000;"> !important            最高的优先级</font>**

**<font style="color:#FF0000;">        内联样式              1000</font>**

**<font style="color:#FF0000;">        id选择器               100</font>**

**<font style="color:#FF0000;">        class选择器             10</font>**

**<font style="color:#FF0000;">        类和伪类选择器          10</font>**

		**<font style="color:#FF0000;">属性选择器              10</font>**

**<font style="color:#FF0000;">        元素选择器               1           </font>**

**<font style="color:#FF0000;">        通配选择器               0</font>**

**<font style="color:#FF0000;">        继承样式               没有权重</font>**

**<font style="color:#FF0000;">        ·····</font>**



注意：

1、对比选择器权重的时候，如果是**<font style="color:#FF0000;">交集选择器</font>**的话，需要将所有选择器**<font style="color:#FF0000;">权重相加</font>**，最终谁高用谁

2、对比选择器权重的时候，如果是**<font style="color:#FF0000;">并集选择器</font>**的话,**<font style="color:#FF0000;">单独计算选择器权重</font>**，谁高听谁的

3、对比选择器权重的时候，如果**<font style="color:#FF0000;">选择器权重是相同</font>**的，谁**<font style="color:#FF0000;">靠下</font>**，用谁的

4、对比选择器权重的时候，**<font style="color:#FF0000;">累加的选择器权重，最高不会超过上一级</font>** //例如：类选择器再高也不会超过id选择器 

5、**<font style="color:#FF0000;">!important   最高的优先级</font>**  慎用   ！important写在样式里

如果样式没有生效，可用来检测是否是选择器权重

再者一般用来修改插件的样式 

      /* .s1.s2.s3.s11{

        background-color: salmon;

      }

      #ss{

        background-color: seagreen;

      } */

    </style>

  </head>

  <body>

    <!--  -->

    <div>

      我是div元素

      <span class="s1 s2 s3 s4 s11" id="ss" style="background-color: purple;">我是div中的span元素</span>

    </div>

  </body>

</html>









**长度单位**





**<font style="color:#FF0000;">1:像素 px</font>**

     			- 像素是我们在网页中使用的最多的一个单位，

     				一个像素就相当于我们屏幕中的一个小点，

     				我们的屏幕实际上就是由这些像素点构成的

      				但是这些像素点，是不能直接看见。

     			- 不同显示器一个像素的大小也不相同，

				**<font style="color:#FF0000;">显示效果越好越清晰，像素就越小，反之像素越大</font>**。

		**<font style="color:#FF0000;">2:百分比 %</font>**

     			- 也可以将单位设置为一个百分比的形式，

     				这样浏览器将会**<font style="color:#FF0000;">根据其父元素的样式来计算</font>**该值

     			- 使用百分比的好处是，当父元素的属性值发生变化时，

     				子元素也会按照比例发生改变

     			- 在我们创建一个自适应的页面时，经常使用百分比作为单位

	  **<font style="color:#FF0000;">em</font>**

     			- em和百分比类似，它是**<font style="color:#FF0000;">相对于当前元素的字体大小来计算的</font>**

     			- **<font style="color:#FF0000;">1em = 1font-size</font>**

**<font style="color:#FF0000;">浏览器默认字体大小是16px</font>**

     			- 使用em时，当字体大小发生改变时，em也会随之改变

     			- **<font style="color:#FF0000;">当设置字体相关的样式时，经常会使用em</font>**



**<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;">rem </font>****<font style="color:#FF0000;"> </font>**

             -rem是**<font style="color:#FF0000;">相对于根元素(html)的字体大小来计算的</font>**

             比如根标签的字体大小是25px,那么设置rem根据25px来计算，**<font style="color:#FF0000;">10rem=10*25px</font>**

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





**颜色单位：**

	**<font style="color:#FF0000;">1:</font>**在CSS可以**<font style="color:#FF0000;">直接</font>**使**<font style="color:#FF0000;">用</font>**颜色的**<font style="color:#FF0000;">单词</font>**来表示不同的颜色

	 	红色：red  蓝色：blue  绿色：green

		    黄色：yellow  

		 注意： 这种用的比较少  不好描述，难记



**<font style="color:#FF0000;">2:</font>**使用**<font style="color:#FF0000;">RGB值</font>**来表示不同的颜色

			- 所谓的RGB值指的是通过**<font style="color:#FF0000;">Red Green Blue三元色</font>**，

				通过这三种颜色的**<font style="color:#FF0000;">不同的浓度</font>**，来**<font style="color:#FF0000;">表示</font>**出不同的颜色

			- 例子：rgb(红色的浓度,绿色的浓度,蓝色的浓度);

				- **<font style="color:#FF0000;">颜色的浓度</font>**需要一个**<font style="color:#FF0000;">0-255之间的值</font>**，255表示最大，0表示没有

				- 浓度也**<font style="color:#FF0000;">可以</font>**采用一个**<font style="color:#FF0000;">百分数</font>**来设置，

				    需要一个**<font style="color:#FF0000;">0% - 100%</font>**之间的数字

					使用百分数最终也会转换为0-255之间的数

					0%表示0

				100%表示255

            -**<font style="color:#FF0000;">语法：RGB(红色，绿色，蓝色)</font>**

			-注意：比较常用，计算机可以很好的识别

**<font style="color:#FF0000;">	3:RGBA</font>**

		    **<font style="color:#FF0000;">-语法：RGBA(红色，绿色，蓝色，透明度)</font>**

			**<font style="color:#FF0000;">a:透明度（0-1） 1不透明，0透明</font>**



	**<font style="color:#FF0000;">4:</font>**使用**<font style="color:#FF0000;">十六进制的rgb值</font>**来表示颜色，原理和上边RGB原理一样，

		   十六进制：

				0 1 2 3 4 5 6 7 8 9 a b c d e f

			00 - ff

	 		00表示没有，相当于rgb中的0

			ff表示最大，相当于rgb中255

 		只不过使用十六进制数来代替，使用三组两位的十六进制数组来表示一个颜色

	 		每组表示一个颜色

	                    第一组表示**<font style="color:#FF0000;">红色</font>**的浓度，范围**<font style="color:#FF0000;">00-ff</font>**

	 					第二组表示**<font style="color:#FF0000;">绿色</font>**的浓度，范围是00-ff

	 					第三组表示**<font style="color:#FF0000;">蓝色</font>**的浓度，范围00-ff

	 		**<font style="color:#FF0000;">语法：#红色绿色蓝色;</font>**

	 		红色：

				#ff0000

			像这种**<font style="color:#FF0000;">两位两位重复的颜色，可以简写</font>**

				比如：#ff0000 可以写成 #f00

				#abc  #aabbcc  

	          常用的十六进制颜色：**<font style="color:#FF0000;">#f00 红色  #f60 橘色  #ccc 灰色  </font>**

**<font style="color:#FF0000;">			                   #0f0 绿色  #000黑色  #fff 白色</font>**



	      **<font style="color:#FF0000;">5:HSL值  HSLA值</font>**

		     H 色相 （0-360）hue  [hju:]

			 S 饱和度 saturation [,sætʃə'reiʃən]  颜色浓度0%-100%

			 L 亮度  lightness [ˈlaɪtnəs]  颜色亮度0%-100%

			 A 透明度  alpha  ['ælfə]	



			.box1{

				width:300px;

				height: 300px;

				**<font style="color:#FF0000;">/* 透明度 */</font>**

**<font style="color:#FF0000;">				/* opacity:0.5; */</font>**

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

**字体样式**

**<font style="color:#FF0000;">1:color</font>**   **<font style="color:#FF0000;">设置字体颜色</font>**,也可以设置其他颜色*/

				color: red;



**<font style="color:#FF0000;">2:font-size</font>**



注意：

(1)、设置的并不是文字本身的大小，在页面中，每个文字都是处在一个看不见的框中的，我们设置的**<font style="color:#FF0000;">font-size实际上是设置格的高度</font>**，并不是字体的大小，一般情况下文字都要比这个格要小一些，也有时会比格大，根据字体的不同，显示效果也不同



(2)、**<font style="color:#FF0000;">设置文字的大小</font>**,浏览器中一般**<font style="color:#FF0000;">默认</font>**的文字**<font style="color:#FF0000;">大小都是16px,</font>**默认的**<font style="color:#FF0000;">最小</font>**的字体是**<font style="color:#FF0000;">12px</font>**



(3)、**<font style="color:#FF0000;">常用的单位  px，rem，em</font>**





**<font style="color:#FF0000;">3:font-family可以指定文字的字体</font>**

				 * 	当采用某种字体时，如果浏览器支持则使用该字体，

				 * 		如果字体不支持，则使用默认字体

				 *      该样式可以同时指定多个字体，多个字体之间使用,分开

				 * 	    当采用多个字体时，浏览器会优先使用前边的字体，

				 * 		如果前边没有在尝试下一个





				/*

				 * 浏览器使用的字体默认就是计算机中的字体，

				 * 	如果计算机中有，则使用，如果没有就不用



				 * 在开发中，如果字体太奇怪，用的太少了，尽量不要使用，

				 * 	有可能用户的电脑没有，就不能达到想要的效果。

				 */



				/* font-family: '华文彩云' , arial , '微软雅黑'; */



			span{

				font-family: 'sans-serif';

			}





1. **<font style="color:#FF0000;">@font-face  可以自定义使用非电脑自带字体</font>**

//可以将服务器中的字体直接提供给用户去使用

	            属性： 给字体起的名字

      使用步骤

**<font style="color:#FF0000;">         （1）、先自定，设置好字体</font>**

**<font style="color:#FF0000;">         （2）、去使用即可</font>**

**<font style="color:#FF0000;">@font-face {</font>**

**<font style="color:#FF0000;">        /* 你给字体起的名字 */</font>**

**<font style="color:#FF0000;">        font-family: "xiyangyang";</font>**

**<font style="color:#FF0000;">        /* 自定义字体的路径 */</font>**

**<font style="color:#FF0000;">        src: url(./字体/MeowScript-Regular.ttf);</font>**

**<font style="color:#FF0000;">      }</font>**



**<font style="color:#FF0000;">        font-family: "xiyangyang";</font>**





**字体分类**

  <body>

    <!-- 

			在网页中将字体分成**<font style="color:#FF0000;">5大类</font>**：

**<font style="color:#FF0000;">serif  ['serif]（衬线字体）//笔锋</font>**

**<font style="color:#FF0000;">          sans-serif（非衬线字体）//无笔锋，默认</font>**

**<font style="color:#FF0000;">          monospace （等宽字体）</font>**

**<font style="color:#FF0000;">          cursive ['kə:siv]（草书字体）</font>**

**<font style="color:#FF0000;">          fantasy  ['fæntəsi]（虚幻字体）</font>**

			可以将字体设置为这些大的分类,当设置为大的分类以后，

				浏览器会自动选择指定的字体并应用样式

			一般会将**<font style="color:#FF0000;">字体的大分类，指定为font-family中的最后一个字体,用来兜底</font>**

		-->









**字体其他样式**			



 * **<font style="color:#FF0000;">1:font-style</font>**可以用来设置**<font style="color:#FF0000;">文字的斜体</font>**

	* 可选值：

	* 	**<font style="color:#FF0000;">normal，默认值，文字正常显示</font>**

	* 	**<font style="color:#FF0000;">italic  [i'tælik] 文字会以斜体显示</font>**

	* 	oblique   [ə'bli:k]文字会以倾斜的效果显示

	* 	- 大部分浏览器都不会对倾斜和斜体做区分，

	* 	也就是说我们设置**<font style="color:#FF0000;">italic和oblique它们的效果往往是一样的</font>**

	*  一般我们只会使用italic



				**<font style="color:#FF0000;">font-style: italic;</font>**





* **<font style="color:#FF0000;">2:font-weight可以用来设置文本的加粗效果：</font>**

    * 可选值：

* 	**<font style="color:#FF0000;">normal，默认值，文字正常显示</font>**

	* 	**<font style="color:#FF0000;">bold，文字加粗显示</font>**

	* 	该样式也可以指定**<font style="color:#FF0000;">100-900之间的9个值</font>**，

	* 	但是由于用户的计算机往往没有这么多级别的字体，所以达到我们想要的效果

也就是200有可能比100粗，300有可能比200粗，但是也可能是一样的



				**<font style="color:#FF0000;"> font-weight:bold; </font>**

**<font style="color:#FF0000;">				font-weight:bolder;</font>**





***<font style="color:#FF0000;"> 3:font-variant ['vεəriənt] 可以用来设置小型大写字母</font>**

* 	可选值：

* 	**<font style="color:#FF0000;">normal，默认值，文字正常显示</font>**

**<font style="color:#FF0000;">* 	small-caps 文本以小型大写字母显示</font>**

* 小型大写字母：

* 将所有的字母都以大写形式显示，但是小写字母的大写，要**<font style="color:#FF0000;">比大写字母的大小小一些</font>**。



				 **<font style="color:#FF0000;">font-variant: small-caps;</font>**





			.p2{

				color: red;

				**<font style="color:#FF0000;">/*设置一个文字大小*/</font>**

**<font style="color:#FF0000;">				/* font-size: 18px; */</font>**

**<font style="color:#FF0000;">				/*设置一个字体*/</font>**

**<font style="color:#FF0000;">				/* font-family:'三极魏碑简体'; */</font>**

**<font style="color:#FF0000;">				/*设置文字斜体*/</font>**

**<font style="color:#FF0000;">				/* font-style: italic; */</font>**

**<font style="color:#FF0000;">				/*设置文字的加粗*/</font>**

**<font style="color:#FF0000;">				/* font-weight: bolder; */</font>**

**<font style="color:#FF0000;">				/*设置一个小型大写字母*/</font>**

**<font style="color:#FF0000;">				/* font-variant: small-caps; */</font>**

				font: small-caps italic bolder 18px "三极魏碑简体"

			}





* 在CSS中还为我们提供了一个样式叫font，

* 	使用该样式可以同时设置字体相关的所有样式,

* 	可以将字体的样式的值，统一写在font样式中，**<font style="color:#FF0000;">不同的值之间使用空格隔开</font>**

* 使用**<font style="color:#FF0000;">font设置字体样式</font>**时，**<font style="color:#FF0000;">斜体 加粗 小大字母，没有顺序要求，甚至可写可不写，如果不写则使用默认值，但是要求</font>****<font style="color:#0070C0;">文字的大小和字体必须写</font>****<font style="color:#FF0000;">，而且</font>****<font style="color:#0070C0;">字体</font>****<font style="color:#FF0000;">必须是</font>****<font style="color:#0070C0;">最后一个</font>****<font style="color:#FF0000;">样式，</font>****<font style="color:#0070C0;">大小</font>****<font style="color:#FF0000;">必须是</font>****<font style="color:#0070C0;">倒数第二个样式</font>**



* 实际上使用**<font style="color:#FF0000;">简写</font>**属性也会有一个比较好的性能



				**<font style="color:#FF0000;">/* font: small-caps bold italic 60px "微软雅黑"; */</font>**

				/* font: 60px "微软雅黑"; */

				/* font: 60px "微软雅黑"; */

				font-family:  "华文彩云";







**行间距**

**<font style="color:#FF0000;">行高（line height）--文字占有的实际高度</font>**

* 使用line-height来设置行高 

* 行高类似于我们上学单线本，单线本是一行一行，**<font style="color:#FF0000;">线与线之间的距离就是行高</font>**，控制文字行与行之间的距离

* 网页中的文字实际上也是写在一个看不见的线中的，而文字会默认在行高中垂直居中显示

——	可**<font style="color:#FF0000;">接收的值</font>**：

				 1.直接就写一个大小，**<font style="color:#FF0000;">eg：22px</font>**

				 2.可以指定一个**<font style="color:#FF0000;">百分数</font>**，则会**<font style="color:#FF0000;">相对于字体</font>**去计算行高，**<font style="color:#FF0000;">eg：30%</font>**

				 3.可以直接传一个**<font style="color:#FF0000;">数值</font>**，则行高会**<font style="color:#FF0000;">设置字体大小相应的倍数</font>**，**<font style="color:#FF0000;">eg：2</font>**

—— 行高经常还用来设置文字的行间距  

			    **<font style="color:#FF0000;">行高=上间距+文字高度+下间距</font>**

				  行间距 = 行高 - 字体大小

 	

	字体框

			字体框是字体纯在的格子，设置**<font style="color:#FF0000;">font-size</font>**实际上就是在**<font style="color:#FF0000;">设置字体框的高度</font>**

	

			总结：

				**<font style="color:#FF0000;">行高会在字体框的上下平均分配</font>**

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

        

* 对于**<font style="color:#FF0000;">单行文本</font>**来说，可以将**<font style="color:#FF0000;">行高设置为和父元素的高度一致</font>**，这样可以是单行文本在父元素中**<font style="color:#FF0000;">垂直居中</font>**

      .p2 {

        /*

在font中也可以指定行高，在**<font style="color:#FF0000;">字体大小后</font>**可以添加**<font style="color:#FF0000;">/行高</font>**，**<font style="color:#FF0000;">来指定行高</font>**，该值是可选的，如果**<font style="color:#FF0000;">不指定则会使用默认值</font>**

				 */

        /* font: 30px/100px "微软雅黑"; */

        border: 1px solid  red;

        /* line-height: 50px; */

      }

     

**文本样式**

**<font style="color:#FF0000;"> 1: text-transform</font>** 可以用来**<font style="color:#FF0000;">设置文本的大小写</font>**

        transform [træns'fɔ:m] 是变形的意思，使变化的意思

			可选值：

			**<font style="color:#FF0000;">none 默认值</font>**，该怎么显示就怎么显示，**<font style="color:#FF0000;">不做任何处理</font>**

			**<font style="color:#FF0000;">capitalize </font>**[ˈkæpɪtəlaɪz] 单词的**<font style="color:#FF0000;">首字母大写</font>**，通过空格来识别单词

			**<font style="color:#FF0000;">uppercase  [ˈʌpəˌkeɪs] 所有的字母都大写</font>**

**<font style="color:#FF0000;">			lowercase  ['ləuə,keis] 所有的字母都小写</font>**

	

         text-transform: lowercase;

      }

**<font style="color:#FF0000;">2: text-decoration</font>**  [dɛkə'reɪʃ(ə)n] 可以用来**<font style="color:#FF0000;">设置文本的修饰</font>**

	可选值：

		**<font style="color:#FF0000;">none：默认值</font>**，不添加任何修饰，**<font style="color:#FF0000;">正常显示</font>**

		**<font style="color:#FF0000;">underline </font>**为文本添加**<font style="color:#FF0000;">下划线</font>**

		**<font style="color:#FF0000;">overline</font>** 为文本添加**<font style="color:#FF0000;">上划线</font>**

		**<font style="color:#FF0000;">line-through</font>** 为文本添加**<font style="color:#FF0000;">删除线</font>**

			

         /* text-decoration: overline; */

         text-decoration: line-through;

      a {

        /*超链接会默认添加下划线，也就是超链接的text-decoration的默认值是underline

				 	如果需要**<font style="color:#FF0000;">去除超链接的下划线</font>**则需要将该样式设置为none

				  */

          **<font style="color:#FF0000;">text-decoration: none;</font>**

      }

**<font style="color:#FF0000;">3: letter-spacing可以指定字符间距</font>**

        letter-spacing: 10px;

**<font style="color:#FF0000;">4: word-spacing</font>**可以**<font style="color:#FF0000;">设置单词之间的距离</font>**

				  	 //实际上就是设置词与词之间空格的大小,**<font style="color:#FF0000;">对汉字无效</font>**

       /* word-spacing: 100px; */

**<font style="color:#FF0000;">5: text-align</font>**用于**<font style="color:#FF0000;">设置文本的对齐方式</font>**

		可选值：

		**<font style="color:#FF0000;">left 默认值，文本靠左对齐</font>**

**<font style="color:#FF0000;">		right ， 文本靠右对齐</font>**

**<font style="color:#FF0000;">		center ， 文本居中对齐</font>**

**<font style="color:#FF0000;">		justify ， 两端对齐</font>**

				  	- 通过调整文本之间的空格的大小，来达到一个两端对齐的目的

				      **<font style="color:#FF0000;">也可以让图片水平居中</font>**

  

        text-align: center;

**<font style="color:#FF0000;"> 6: text-indent 设置首行缩进</font>**

			指定一个**<font style="color:#FF0000;">正值</font>**时，会自动**<font style="color:#FF0000;">向右</font>**侧缩进指定的像素

			指定一个**<font style="color:#FF0000;">负值</font>**，则会**<font style="color:#FF0000;">向左</font>**移动指定的像素,

			通过这种方式**<font style="color:#FF0000;">可以将</font>**一些不想显示的**<font style="color:#FF0000;">文字隐藏</font>**起来

			这个值一般都会使用em作为单位

				 

         text-indent:-2em;

      

**<font style="color:#FF0000;">7: white-space: </font>**;**<font style="color:#FF0000;"> 设置网页如何处理空白</font>**

                可选值：

                  **<font style="color:#FF0000;">x` 正常</font>**

                  **<font style="color:#FF0000;">nowrap 不换行</font>**

**<font style="color:#FF0000;">                  per 保留空白 </font>**

    

**<font style="color:#FF0000;">8: text-overflow 文本溢出包含元素时发生的事情</font>**。

             可选值：

               **<font style="color:#FF0000;">  clip	修剪文本。</font>**

**<font style="color:#FF0000;">                ellipsis</font>**	  [i'lipsis] **<font style="color:#FF0000;">显示省略符号来代表被修剪的文本。</font>**

                 

       white-space: nowrap;

       overflow: hidden;

       text-overflow: clip;

 **<font style="color:#FF0000;">单行文本省略号</font>**，white-space:nowrap; 设置网页**<font style="color:#FF0000;">不换行，隐藏溢出的，显示省略号</font>** 

/* vertical-align:middle; */

**<font style="color:#FF0000;">9:vertical-align  设置元素垂直对齐的方式</font>**

              可选值：

                  **<font style="color:#FF0000;">baseline 默认值 基线对齐</font>**

                  **<font style="color:#FF0000;">top 顶部对齐</font>**

**<font style="color:#FF0000;">                 bottom 底部对齐</font>**

**<font style="color:#FF0000;">                 middle 居中对齐</font>**

应用：**<font style="color:#FF0000;">1:图文垂直对齐方式</font>**

**<font style="color:#FF0000;">      2:图片三像素的问题  </font>**

        父元素如果不设置高，由图片撑开，此时图片的底部就会有三像素的空白

                  解决方式**<font style="color:#FF0000;">一：vertical-align属性值不为默认值</font>**

                  解决方式**<font style="color:#FF0000;">二：给图片转成块元素</font>**

                  解决方式**<font style="color:#FF0000;">三：给父元素设置font-size为0</font>**

                  解决方式**<font style="color:#FF0000;">四：使元素脱离文档流，如浮动，绝对定位，弹性盒子等</font>**

                       

注意 **<font style="color:#FF0000;">vertical-align</font>** 只对行内元素、行内块元素和表格单元格元素生效：**<font style="color:#FF0000;">不能用它垂直对齐块级元素。         </font>**

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

图片三像素问题是指在网页布局中，当**<font style="color:#FF0000;">图片作为行内元素或行内块元素与文本处于同一行时，图片底部会出现三像素的空白间隙</font>**。**<font style="color:#FF0000;">这是由于浏览器默认的垂直对齐方式为基线对齐，而文本的基线与图片底部有一定的间距。</font>**

解决方式主要有以下几种： 

1. ****<font style="color:#FF0000;">设置vertical-align属性</font>****：将图片的vertical-align属性值设置为非默认值，如top、middle、bottom等，可以改变图片的垂直对齐方式，从而消除三像素空白。 
2. ****<font style="color:#FF0000;">将图片转换为块元素</font>****：通过设置display:block，使图片变为块级元素，它将独占一行，不再与文本基线对齐，从而解决三像素问题。 
3. ****<font style="color:#FF0000;">设置父元素的font-size为0</font>****：这会使父元素内的文本基线位置上移，进而消除图片底部的空白，但需要注意的是，这种方式可能会影响到父元素内其他文本的显示，需要对文本重新设置合适的字体大小。 

4. ****<font style="color:#FF0000;">使元素脱离文档流</font>****：如使用浮动（float）、绝对定位（position:absolute）或弹性盒子（display:flex）等布局方式，让图片脱离文档流的影响，也可以解决三像素问题。

**<font style="color:#FF0000;">10: text-shadow: h-shadow v-shadow blur color;</font>**

                **<font style="color:#FF0000;">参数1:必需。水平阴影</font>**的位置。允许负值。

                **<font style="color:#FF0000;">参数2:必需。垂直阴影</font>**的位置。允许负值。

                参数3**<font style="color:#FF0000;">:可选</font>**。模糊的距离。

                参数4**<font style="color:#FF0000;">:可选</font>**。阴影的颜色 一般用**<font style="color:#FF0000;">rgba </font>**

        text-shadow:-2px -3px 1px rgba(255, 0, 0, .1);

 

**多行文本省略号**

    

**<font style="color:#FF0000;">多行文本省略号</font>**，对于webkit，

display: -webkit - box和 -webkit - box - orient: vertical这两个属性一起使用，**<font style="color:#FF0000;">将元素设置</font>**为一个垂直排列的**<font style="color:#FF0000;">弹性盒子</font>**。

-webkit - line - clamp: 3是关键属性，它**<font style="color:#FF0000;">指定</font>**了**<font style="color:#FF0000;">显示的行数</font>**为 3 行。当文本内容超过 3 行时，**<font style="color:#FF0000;">超出的部分会被隐藏</font>**。

overflow: hidden用于**<font style="color:#FF0000;">隐藏溢出的文本</font>**部分。这种方法在非 WebKit 浏览器中可能不被支持，需要添加浏览器前缀来确保兼容性。

        overflow: hidden;

        display: -webkit-box;

        -webkit-line-clamp: 2;

        -webkit-box-orient:vertical;

        缺一不可         

适用范围：

      因使用了WebKit的CSS扩展属性，该方法适用于WebKit浏览器及移动端；

注：

-**<font style="color:#FF0000;">webkit-line-clamp</font>**用来**<font style="color:#FF0000;">限制在一个块元素显示的文本的行数</font>**。 

为了实现该效果，它需要组合其他的WebKit属性。常见结合属性：

**<font style="color:#FF0000;">display: -webkit-box; </font>**必须结合的属性 ，**<font style="color:#FF0000;">将对象作为弹性伸缩盒子模型显示 </font>**。

-**<font style="color:#FF0000;">webkit-box-orient</font>** 必须结合的属性 ，**<font style="color:#FF0000;">设置或检索伸缩盒对象的子元素的排列方式 。</font>**

**<font style="color:#FF0000;">vertical 从上到下垂直排列子元素</font>**

**文档流**

文档流（normal flow）

		-网页是一个多层的结构，一层叠着一层，通过css可以分别为每一层来设置样式

		-作为用户来讲，只能看到最顶上一层

		-文档流处在网页的最底层，文档流是网页的基础，

        它表示的是一个页面中的位置，

		我们所创建的元素默认都处在文档流中，在其上排列

		-元素主要有两个状态，在文档流中，不在文档流中（脱离文档流）				 

元素在文档流中的特点

		**<font style="color:#FF0000;">块元素</font>**

			1.块元素在文档流中会**<font style="color:#FF0000;">独占一行</font>**，块元素会**<font style="color:#FF0000;">自上向下排列</font>**。

			2.块元素在文档流中**<font style="color:#FF0000;">默认宽度是父元素的100%</font>**

			3.块元素在文档流中的**<font style="color:#FF0000;">高度默认被内容(子元素)撑开</font>**

		内联元素（**<font style="color:#FF0000;">行内元素</font>**）

			1.内联元素在文档流中**<font style="color:#FF0000;">只占自身的大小</font>**，会默认**<font style="color:#FF0000;">从左向右排列</font>**，如果一行中不足以容纳所有的内联元素，则换到下一行，继续自左向右。

			2.在文档流中，内联元素的**<font style="color:#FF0000;">宽度和高度默认都被内容撑开</font>**	

**盒子模型**

把元素布局到页面，就像想买个桌子，放到家里，要知道桌子的大小，形状，然后才能放到家里，所以我们把所有的元素都想成盒子，矩形

盒模型、盒子模型、框模型（box model）

**<font style="color:#FF0000;">css将页面中所有元素都设置为一个矩形的盒子</font>**

	-将元素设置为矩形的盒子后，对页面的布局就变成了不同的盒子摆放到不同的位置

	-每一个盒子，都有以下几个部分组成  

				**<font style="color:#FF0000;">内容区(content) </font>**

**<font style="color:#FF0000;">				内边距(padding)</font>**

**<font style="color:#FF0000;">				边框(border)  </font>**

**<font style="color:#FF0000;">				外边距(margin) </font>** **<font style="color:#FF0000;">决定位置</font>**

			-**<font style="color:#FF0000;">盒子可见框的大小由内容区，内边距和边框共同决定</font>**

		  

**<font style="color:#FF0000;">1:内容区(content) </font>** **<font style="color:#FF0000;">元素中所有的子元素和文本内容都在内容区中排列</font>**

			* 使用**<font style="color:#FF0000;">width</font>**来设置盒子内容区的**<font style="color:#FF0000;">宽度</font>**

			* 使用**<font style="color:#FF0000;">height</font>**来设置盒子内容区的**<font style="color:#FF0000;">高度 </font>**

			* width和height只是设置的盒子内容区的大小，而不是盒子的整个大小，

			

        width: 300px;

        height: 300px;

        background-color: #bfa; /*设置背景颜色*/

**<font style="color:#FF0000;">2:边框（border）元素设置边框</font>**

			边框属于盒子边缘，边框里面属于盒子内部，出了边框都是盒子的外部

		

**<font style="color:#FF0000;">设置边框必须指定三个样式</font>**

		**<font style="color:#FF0000;">*</font>** 		**<font style="color:#FF0000;">border-width:边框的宽度  </font>**

**<font style="color:#FF0000;">		* 		border-color:边框颜色  </font>**

**<font style="color:#FF0000;">		* 		border-style:边框的样式</font>**  

		边框的大小会影响整个盒子的大小

		

		border-width: 10px;

		border-color: #ff0;

		border-style: dashed;

		padding: 10px;

		margin: 10px;

**盒子边框**			

			.box{

				width: 300px;

				height: 200px;

				background-color: rgb(222, 255, 170);}

				

**<font style="color:#FF0000;">设置边框</font>**

	大部分的浏览器中，边框的宽度和颜色都是有默认值，而**<font style="color:#FF0000;">边框的样式默认值都是none</font>**

				

		设置上2px,下4px,左边6px, 右边1px 

				 border-width: 2px 1px 4px 6px;

 

		设置 上下4px 左右6px 

				 border-width: 4px 6px; 

		设置 上4px 左右6px 下2px 

				border-width:4px 6px 2px; 

				/* border-color: #f00; */

				/* border-style: dotted; */

				

**<font style="color:#FF0000;">1:border-width  默认值一般是3px</font>**

		使用**<font style="color:#FF0000;">border-width可以分别指定四个边框的宽度</font>**

		如果在border-width指定了四个值，则四个值会分别设置给 上 右 下 左，按照顺时针的方向设置的

		如果指定三个值，则三个值会分别设置给	上  左右 下

		如果指定两个值，则两个值会分别设置给 上下 左右	

		如果指定一个值，则四边全都是该值	

				 	

除了border-width，CSS中还提供了四个**<font style="color:#FF0000;">border-xxx-width</font>**，xxx的值可能是**<font style="color:#FF0000;">top right bottom left</font>**

**<font style="color:#FF0000;">专门用来设置指定边的宽度</font>**	

				 border-bottom-width:1px;

				 border-bottom-style: dashed;

				 border-bottom-color:#ccc;

				

四个值设置边框大小顺序上右下左				

三个值设置边框的大小顺序上 左右 下 

两个值设置边框的大小 上下 左右

				

**<font style="color:#FF0000;">2:border-color</font>**

			**<font style="color:#FF0000;">设置边框的颜色  默认值是黑色</font>**

			和宽度一样，**<font style="color:#FF0000;">color也提供四个方向</font>**的样式，可以分别指定颜色

			 **<font style="color:#FF0000;">border-xxx-color</font>**

				

				

**<font style="color:#FF0000;">3:border-style</font>**

			**<font style="color:#FF0000;">设置边框的样式</font>**

				 可选值：

				**<font style="color:#FF0000;"> * 	</font>**	**<font style="color:#FF0000;">none，默认值，没有边框</font>**

**<font style="color:#FF0000;">				 * 		solid 实线</font>**

**<font style="color:#FF0000;">				        double 双线</font>**

**<font style="color:#FF0000;">						dashed [dæʃt] 虚线</font>**

**<font style="color:#FF0000;">				 * 		dotted ['dɔtid] 点状边框</font>**

				 * style也可以分别指定四个边的边框样式，规则和width一致，

				 * 	同时它也提供**<font style="color:#FF0000;">border-xxx-style</font>**四个样式，来分别设置四个边

				 	/* **<font style="color:#FF0000;">统一设置 </font>***/

					**<font style="color:#FF0000;">border: 1px dotted #f00;</font>**

					/* 单独设置 */

					/* border-top:1px solid #ff0;

					border-left:1px solid #fc0;

					border-right:1px solid #f00;

					border-bottom:1px solid #cf0; */

* border

	 * 	- 边框的**<font style="color:#FF0000;">简写样式</font>**，通过它可以同时设置四个边框的样式，宽度，颜色

		* 	- 而且**<font style="color:#FF0000;">没有</font>**任何的**<font style="color:#FF0000;">顺序要求</font>**

		* 	- border一指定就是同时指定四个边不能分别指定

		* border-top border-right border-bottom border-left

		* **<font style="color:#FF0000;">可以单独设置四个边的样式</font>**，规则和border一样，只不过它只对一个边生效

				 

			.box2{

				width: 400px;

				padding: 10px 0;

				border-bottom: 1px solid #ccc;

			}

			

**内边距（padding）：**

内容区和边框之间的距离，它会影响到盒子的大小

    

（1）、分别给**<font style="color:#FF0000;">每边设置内边距</font>**

        **<font style="color:#FF0000;">padding-top: ;</font>**

**<font style="color:#FF0000;">        padding-right: ;</font>**

**<font style="color:#FF0000;">        padding-bottom: ;</font>**

**<font style="color:#FF0000;">        padding-left: ;</font>**



（2）**<font style="color:#FF0000;">padding简写</font>**

        padding后可以写多个值

          4个值

          3个值

          2个值

          1个值

          **<font style="color:#FF0000;">规则跟之前讲的border-width是一样</font>**

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



* 需求：创建一个子元素box2占满box1，box2把内容区撑满了

			

       .box2{

         width: 100%;

         height: 100%;

         background-color: red; }

	  

**外边距**

		* **<font style="color:#FF0000;">外边距指的是当前盒子与其他盒子之间的距离</font>**，

				 * 	**<font style="color:#FF0000;">他不会影响可见框的大小，而是会影响到盒子的位置。</font>**

				 

		* 盒子有四个方向的外边距：

				 * 	**<font style="color:#FF0000;">margin-top</font>**

				         **<font style="color:#FF0000;">上外边距</font>**，设置一个正值，元素会向下移动

				 * 	**<font style="color:#FF0000;">margin-right</font>**

				         **<font style="color:#FF0000;">默认情况下</font>**设置margin-right**<font style="color:#FF0000;">不会产生任何效果</font>**

				 * 	**<font style="color:#FF0000;">margin-bottom</font>**

				         **<font style="color:#FF0000;">下外边距</font>**，设置一个正值，其下边的元素会向下移动，**<font style="color:#FF0000;">挤别人</font>**

				 * 	**<font style="color:#FF0000;">margin-left</font>**

				         **<font style="color:#FF0000;">左外边距</font>**，设置一个正值，元素会向右移动

				 

				 * 由于页面中的元素都是靠左靠上摆放的，

				 * 	所以当我们设置**<font style="color:#FF0000;">上和左</font>**外边距时，会导致盒子**<font style="color:#FF0000;">自身的位置发生改变</font>**，

				 * 	而如果是设置**<font style="color:#FF0000;">右和下</font>**外边距会**<font style="color:#FF0000;">改变其他盒子的位置（挤别人）</font>**





	外边距也可以指定为一个**<font style="color:#FF0000;">负值</font>**，如果外边距设置的是负值，则元素会向**<font style="color:#FF0000;">反方向移动</font>**

			 

	外边距同样可以使用**<font style="color:#FF0000;">简写</font>**属性 margin，可以同时设置四个方向的外边距,**<font style="color:#FF0000;">规则和padding一样</font>**













**元素的水平方向的布局**

    元素的水平方向的布局

           元素在其父元素中**<font style="color:#FF0000;">水平方向的位置</font>**由以下几个属性共同**<font style="color:#FF0000;">决定</font>** 

**<font style="color:#FF0000;">margin-left border-left padding-left width  padding-right  border-right margin-right</font>**



    **<font style="color:#FF0000;">一个元素在其父元素中</font>**，水平布局必须要满足以下的等式

    margin-left + border-left + padding-left + width + padding-right + border-right + margin-right

        =父元素内容区的宽度（**<font style="color:#FF0000;">必须满足</font>**）



    举例：子元素 inner七个元素的值如下 

       0 +0 + 0+ 200 + 0 + 0 + 0 =600  ？？不成立



    以上等式必须满足，如果相加结果等式不成立，则称为过度约束，则浏览器会让等式自动调整

       -调整的情况

          1:如果七个值中**<font style="color:#FF0000;">没有auto</font>**情况，则**<font style="color:#FF0000;">浏览器会调整margin-right值</font>**以使等式满足

              0 +0 + 0+ 200 + 0 + 0 + 400 =600

          2:这7个值中**<font style="color:#FF0000;">width，margin-left，margin-right，这三个值可以设置auto</font>**

            如果**<font style="color:#FF0000;">有设置auto</font>**，则**<font style="color:#FF0000;">浏览器会自动调整auto的值</font>**，以使等式成立

            0 +0 + 0+ auto + 0 + 0 + 0 =600   auto=600

            0 +0 + 0+ auto + 0 + 0 + 200 =600   auto=400 

          3:如果将一个宽度和一个外边距设置为auto，则宽度会调整到最大

          4:如果三个值都是auto，也只会调整宽度

          5:如果将两个外边距设为auto，宽度固定，则两侧外边距会设置为相同的值

              会使元素自动在父元素中居中，所以我们经常将左右外边距设置为auto     



     /* **<font style="color:#FF0000;">有宽先调宽，宽固定，再调两边</font>** */

      .inner {

        width: 200px;

        **<font style="color:#0000FF;">margin:0  auto; </font>**

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

      /* **<font style="color:#FF0000;">默认情况下，父元素的高度是被子元素撑开的，</font>**

**<font style="color:#FF0000;">              若父元素设置了，就是设置多少就是多少</font>** */





      .box1 {

        width: 700px;

        /* white-space: nowrap; */

        height: 100px;

        background-color: #bfa;

        overflow:auto;

      }

   

子元素是在父元素的内容区中排列的，如果子元素的大小超过了父元素，则子元素会从父元素中溢出

        使用**<font style="color:#FF0000;">overflow</font>**属性**<font style="color:#FF0000;">设置父元素如何处理溢出的子元素</font>**

            可选值：

              **<font style="color:#FF0000;"> visible  默认值</font>**  子元素会从父元素中溢出，**<font style="color:#FF0000;">在父元素外部的位置显示</font>**

              **<font style="color:#FF0000;"> hidden</font>**   **<font style="color:#FF0000;">溢出</font>**的内容将会被裁剪**<font style="color:#FF0000;">不会显示</font>**

               **<font style="color:#FF0000;">scroll</font>**   **<font style="color:#FF0000;">生成两个滚动条</font>**，通过滚动条来查看完整的内容

               **<font style="color:#FF0000;">auto </font>**    **<font style="color:#FF0000;">根据需要生成滚动条</font>**

               

         额外两个属性，了解一下   

         **<font style="color:#FF0000;">overflow-x    生横轴时注意换行</font>**

**<font style="color:#FF0000;">         overflow-y</font>**

       

    </style>

  </head>

  <body>

    <!-- <div class="outer">

        <div class="inner"></div>

        <div class="inner"></div>

    </div> -->

    <div class="box1">

    </div>

  </body>











**外边距的重叠**

    <style type="text/css">

      .box1 {

        width: 100px;

        height: 100px;

        background-color: red;

				 * 为上边的元素设置一个下外边距

         **<font style="color:#FF0000;">margin-bottom:10px;</font>**

      }

      .box2 {

        width: 100px;

        height: 100px;

        background-color: green;

				 * 为下边的元素设置一个上外边距

         **<font style="color:#FF0000;">margin-top: -10px;</font>**

      }



* **<font style="color:#FF0000;">垂直外边距的重叠</font>**

*   - 在网页中相邻的垂直方向的外边距，会发生外边距的重叠

    -**<font style="color:#FF0000;">兄弟元素</font>**

* 		兄弟元素之间的**<font style="color:#FF0000;">相邻外边距会取最大值</font>**而不是取和，**<font style="color:#FF0000;">谁大听谁的</font>**

        特殊情况：如果相邻的外边距**<font style="color:#FF0000;">一正一负</font>**，则**<font style="color:#FF0000;">取两者的和</font>**

		         如果相邻的外边距**<font style="color:#FF0000;">都是负值</font>**，则**<font style="color:#FF0000;">取绝对值较大</font>**的

		兄弟元素的外边距重叠，对开发有利，不用处理



需求：将子元素移动到父元素的左下角



    **<font style="color:#FF0000;">-父子元素</font>**

 		**<font style="color:#FF0000;">如果父子元素的垂直外边距相邻了，则子元素的外边距会传递给父元素</font>**

**<font style="color:#FF0000;">     </font>**

**<font style="color:#FF0000;">暂时解决方案：</font>**

         **<font style="color:#FF0000;">1:不用外边距  </font>**

**<font style="color:#FF0000;">         2:使不相邻</font>**

**<font style="color:#FF0000;">         transparent透明</font>**



当父元素没有内边距（padding）、边框（border）或者内容将其与子元素分隔开时，子元素的外边距会与父元素的外边距发生塌陷。



 .outer {

        width: 200px;

        /* height: 200px; */

        height: 200px;

        background-color: yellow;

        /* **<font style="color:#FF0000;">overflow: hidden;</font>** */

        /***<font style="color:#FF0000;">改变padding的时候同时改变盒子的高度 </font>***/

        /***<font style="color:#FF0000;"> padding-top:100px; </font>***/

        /***<font style="color:#FF0000;"> border: 1px solid transparent; </font>***/





        

        /* **<font style="color:#FF0000;">开启元素的隐含属性 overflow，BFC </font>***/

        /* BFC（Block Formatting Context，块格式化上下文） 是Web页面的可视化CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。 */

        /* **<font style="color:#FF0000;">BFC简单理解子元素不会影响到其他元素</font>** */

        /* overflow: hidden; */

        /* margin-top: 100px; */



**<font style="color:#FF0000;">方案1:用padding ，改父元素高度</font>**

        /* padding-top: 100px;

        height: 100px; */



**<font style="color:#FF0000;">方案2:为outer设置一个上边框</font>**   **<font style="color:#FF0000;">会改变盒子的大小，有个1px的边框 transparent</font>**

        /* border: 1px solid transparent; */ 

      

**添加边框（border）**

+ 原理：通过给父元素添加边框，可以将父元素和子元素在视觉上和布局逻辑上分隔开，阻止外边距的塌陷。
+ **<font style="color:#FF0000;">给父元素添加了一个透明的边框</font>**（border: 1px solid transparent），这样就防止了子元素的上外边距使父元素一起向下移动。边框的宽度和样式可以根据实际设计需求进行调整。

**添加内边距（padding）**

+ 原理：内边距在父元素内部创造了一个空间，使得子元素的外边距不会直接与父元素的外边距相互影响，从而避免塌陷。
+ **<font style="color:#FF0000;">这里给父元素添加了 1px 的上内边距</font>**<font style="color:#222222;">（</font><font style="color:#222222;">padding - top: 1px</font><font style="color:#222222;">），这就有效地分隔了父元素和子元素的外边距，解决了塌陷问题。内边距的大小可以根据具体情况进行调整，不过要注意它会影响元素内部的空间布局。</font>

**触发块格式化上下文（BFC）**

+ 原理：**<font style="color:#FF0000;">BFC </font>**是 CSS 中的一个概念，它是一个**<font style="color:#FF0000;">独立的布局环境</font>**，其中的**<font style="color:#FF0000;">元素布局不会影响到外面的元素，也不会被外面的元素所影响</font>**。通过触发父元素的 BFC，可以避免外边距塌陷。
+ **<font style="color:#FF0000;">给父元素设置了overflow: auto，</font>**这就触发了父元素的 BFC，使得子元素的外边距不会与父元素的外边距塌陷。除了auto，**<font style="color:#FF0000;">overflow:hidden</font>**等其他非visible的值**<font style="color:#FF0000;">也可以</font>**<font style="color:#FF0000;">触发 BFC。</font>



**行内元素的盒模型**

	从这几点分析：内容区、内边距 、边框 、外边距

		**<font style="color:#FF0000;">行内元素的盒模型</font>**

		**<font style="color:#FF0000;">1: 不能设置width和height，被内容撑开</font>**

		2: 可以设置padding，但**<font style="color:#FF0000;">垂直方向padding不会影响页面的布局</font>**，不会挤别人

		3: 可以设置边框，但是**<font style="color:#FF0000;">垂直的边框不会影响到页面的布局</font>**，不会挤别人

		4: 可以设置水平方向的外边距，**<font style="color:#FF0000;">水平方向的相邻外边距不会重叠，而是求和</font>**，但**<font style="color:#FF0000;">不支持垂直外边距</font>**

			



			/* 需求：给超链接设置一个大小100px的大小宽高 */

			a{

				width: 100px;

				height: 100px;

				**<font style="color:#FF0000;">display: block;</font>**

				background-color: #f60;

			}

			/* 鼠标放上去我的超链接盒子消失 */

			.a1:hover{

				/***<font style="color:#FF0000;"> display:none 不占空间</font>** */

				/* display: none; */

				/***<font style="color:#FF0000;">占空间 </font>** */

				**<font style="color:#FF0000;">visibility: hidden;</font>**

			}



**<font style="color:#FF0000;">display </font>**用来**<font style="color:#FF0000;">设置元素显示的类型</font>**

			可选值：

			**<font style="color:#FF0000;">inline</font>**  将元素设置为**<font style="color:#FF0000;">行内</font>**元素

			**<font style="color:#FF0000;">block </font>**  将元素设置为**<font style="color:#FF0000;">块</font>**元素

			**<font style="color:#FF0000;">inline-block</font>**  **<font style="color:#FF0000;">行内块</font>**元素（即**<font style="color:#FF0000;">可以设置宽高，又不会独占一行</font>**）

			**<font style="color:#FF0000;">table</font>**   将元素设置为一个**<font style="color:#FF0000;">表格</font>**

			**<font style="color:#FF0000;">none</font>**    元素**<font style="color:#FF0000;">不在页面中显示</font>**（**<font style="color:#FF0000;">隐藏</font>**一个元素）

		  

 **<font style="color:#FF0000;">visibility </font>**用来**<font style="color:#FF0000;">设置元素的显示状态</font>**

			可选值：

			**<font style="color:#FF0000;">visible 默认值</font>**  元素在页面中**<font style="color:#FF0000;">正常显示</font>**

			**<font style="color:#FF0000;">hidden </font>** 元素不在页面中显示（**<font style="color:#FF0000;">隐藏</font>**一个元素），**<font style="color:#FF0000;">位置依然保留</font>**

		

		

	







**重置样式表**

<!-- 重置样式表，专门用来对浏览器的样式进行重置 -->

 

**<font style="color:#FF0000;">默认样式：</font>**

	浏览器为了在页面中没有样式时，也可以有一个比较好的显示效果，

**<font style="color:#222222;">原因</font>**<font style="color:#222222;">：</font>浏览器为很多元素设置了默认的margin和padding，在编写样式时通常不需要这些默认样式，所以需要进行重置。

		  	

方式一：

  **<font style="color:#FF0000;"> 1:清除浏览器的默认样式</font>**

**<font style="color:#FF0000;">*{</font>**

**<font style="color:#FF0000;">        margin:0;</font>**

**<font style="color:#FF0000;">        padding: 0;</font>**

**<font style="color:#FF0000;">        list-style: none;</font>**

**<font style="color:#FF0000;">       } </font>**



方式二：

	**<font style="color:#FF0000;">2:引入重置样式表 */</font>**

       

   

 





**盒子大小**

 

默认情况下：盒子可见宽的大小由内容区，内边距，边框共同决定

            

**<font style="color:#FF0000;">box-sizing</font>**  用来**<font style="color:#FF0000;">设置盒子尺寸的计算方式 width/height 指的是谁</font>**

  

可选值：

**<font style="color:#FF0000;">content-box 内容区 默认值</font>**

**<font style="color:#FF0000;">border-box 宽度和高度用来设置整个盒子可见框的大小，包括边框，padding，内容区</font>**

//内减，可见框大小不变









**阴影和圆角**

   知识点1:

          **<font style="color:#FF0000;">box-shadow</font>** 

             用来**<font style="color:#FF0000;">设置元素的阴影效果</font>**，**<font style="color:#FF0000;">不会影响到页面布局</font>** 

                第一个值：**<font style="color:#FF0000;">水平</font>**偏移量  正->左  负->右

                第二个值：**<font style="color:#FF0000;">垂直</font>**偏移量  正->下  负->上

                第三个值：**<font style="color:#FF0000;">模糊半径</font>**

                第四个值：**<font style="color:#FF0000;">颜色</font>**

       <font style="color:#9CDCFE;">box-shadow</font><font style="color:#D4D4D4;">: </font><font style="color:#B5CEA8;">-4px</font><font style="color:#D4D4D4;"> </font><font style="color:#B5CEA8;">6px</font><font style="color:#D4D4D4;"> </font><font style="color:#B5CEA8;">30px</font><font style="color:#D4D4D4;"> </font><font style="color:#DCDCAA;">rgba</font><font style="color:#D4D4D4;">(</font><font style="color:#B5CEA8;">0</font><font style="color:#D4D4D4;">, </font><font style="color:#B5CEA8;">0</font><font style="color:#D4D4D4;">, </font><font style="color:#B5CEA8;">0</font><font style="color:#D4D4D4;">, </font><font style="color:#B5CEA8;">.5</font><font style="color:#D4D4D4;">);</font>



       

       

**<font style="color:#FF0000;">  知识点</font>**2:

             **<font style="color:#FF0000;">border-radius 用来设置圆角</font>**  以10px为半径画圆

             **<font style="color:#FF0000;">borde-top-right-radius</font>**

**<font style="color:#FF0000;">             border-top-left-radius</font>**

**<font style="color:#FF0000;">             border-bottom-left-radius</font>**

**<font style="color:#FF0000;">             border-bottom-right-radius</font>**

**<font style="color:#FF0000;">             border-radius: 50%;    //画圆，再大也是圆</font>**

         

 

/* border-radius: 10px; */

        /* border-top-left-radius:30px;

        border-top-right-radius:30px;

        border-bottom-left-radius:40px;

        border-bottom-right-radius:40px; */

        /* 圆 */

        border-radius:50%;



**浮动**

  

块元素在文档流中默认垂直排列，所以这个三个div自上至下依次排开，如果希望块元素在页面中水平排列，可以使块元素脱离文档流



使用**<font style="color:#FF0000;">float</font>**来**<font style="color:#FF0000;">使元素浮动</font>**，使一个元素向其父元素的左侧或右侧移动，从而**<font style="color:#FF0000;">脱离文档流</font>**

	 	可选值：

	 		**<font style="color:#FF0000;">none，默认值，元素默认在文档流中排列</font>**

**<font style="color:#FF0000;">	 		left，，向页面的左侧浮动</font>**

**<font style="color:#FF0000;">	 		right，向页面的右侧浮动</font>**

	 

浮动的特点

**1**:浮动元素会脱离文档流，元素**<font style="color:#FF0000;">脱离文档流</font>**以后，不会再占用文档流的位置，它**<font style="color:#FF0000;">下边的元素会立即向上移动</font>**

**2**:元素浮动以后，元素会尽量向页面的左上或页面右上漂浮

**3**:**<font style="color:#FF0000;">浮动元素默认不会从父元素中移出</font>**

**4**:浮动的元素**<font style="color:#FF0000;">不会超过他上边的兄弟元素，最多最多一边齐</font>**

**5**:如果浮动元素的**<font style="color:#FF0000;">上边是一个没有浮动的块元素，则浮动元素无法上移</font>**



总结：

浮动目前来讲它的主要作用就是让页面中的元素可以水平排列

**<font style="color:#FF0000;">通过浮动可以制作一些水平方向的布局</font>**









**浮动特点**

特点1:

	浮动的元素不会盖住文字，**<font style="color:#FF0000;">文字会自动环绕在浮动元素的周围</font>**，所以我们可以通过浮动来**<font style="color:#FF0000;">设置文字环绕图片</font>**的效果



特点2:

当元素设置浮动以后，会**<font style="color:#FF0000;">完全脱离文档流</font>**，**<font style="color:#FF0000;">元素</font>**的**<font style="color:#FF0000;">一些特点</font>**也会发生**<font style="color:#FF0000;">改变</font>**





**<font style="color:#FF0000;">脱离文档流的特点</font>**

			**<font style="color:#FF0000;">块元素：</font>**

				1:块元素**<font style="color:#FF0000;">不</font>**再**<font style="color:#FF0000;">独占</font>**页面的**<font style="color:#FF0000;">一行</font>**

				2:块元素的**<font style="color:#FF0000;">宽高被内容撑开</font>**

			



**<font style="color:#FF0000;">行内元素：</font>**

1:浮动过后的行内元素**<font style="color:#FF0000;">更像行内块元素</font>**,因为**<font style="color:#FF0000;">一行可以显示多个</font>**，并且**<font style="color:#FF0000;">默认宽度为内容的宽度</font>**

			

		 总结：当元素设置浮动以后,**<font style="color:#FF0000;">脱离文档流，就不需要再区分块和行内</font>**

     









**导航条**

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

 



**高度塌陷**

在文档流中，父元素的高度默认是被子元素撑开的，

    也就是子元素多高，父元素就多高。

    但是当为子元素设置浮动以后，子元素会完全脱离文档流，

    此时将会导致子元素无法撑起父元素的高度，导致父元素的高度塌陷。

    由于父元素的高度塌陷了，则父元素下的所有元素都会向上移动，这样将会导致页面布局混乱。

    

**<font style="color:#FF0000;">高度塌陷解决方案一</font>**

    所以在开发中一定要避免出现高度塌陷的问题,

    我们可以**<font style="color:#FF0000;">将父元素的高度写死</font>**，以避免塌陷的问题出现，

    但是一旦高度写死，父元素的高度将不能自动适应子元素的高度，所以这种方案是**<font style="color:#FF0000;">不推荐</font>**使用的。



**<font style="color:#FF0000;">高度塌陷解决方案二：</font>**



   页面元素中的隐含属性：Block Formatting Context 即**<font style="color:#FF0000;">块格式化上下文</font>**，简称**<font style="color:#FF0000;">BFC</font>**

   

当开启元素的BFC以后，元素会变成一个**<font style="color:#FF0000;">独立的布局区域</font>**，**<font style="color:#FF0000;">不会在布局上影响到外面的元素</font>**

        BFC 理解为一个封闭的大箱子，箱子内部的元素不会影响到外部。



      开启BFC后，元素将会具有如下的特性：

      **<font style="color:#FF0000;">1.父元素的垂直外边距不会和子元素重叠 </font>**

      **<font style="color:#FF0000;">2.开启BFC的元素不会被浮动元素所覆盖</font>**

      **<font style="color:#FF0000;">3.开启BFC的元素可以包含浮动的子元素（可解决高度塌陷）</font>**

      

      如何开启元素的BFC

      1.设置元素浮动（不推荐）

        - 使用这种方式开启，虽然可以撑开父元素，但是会导致父元素的宽度丢失

          而且使用这种方式也会导致下边的元素上移，不能解决问题

      2.设置元素为inline-block（不推荐）

        - 可以解决问题，但是会导致宽度丢失，不推荐使用这种方式

     **<font style="color:#FF0000;"> 3.将元素的overflow设置为一个非visible的值 </font>**

      4.设置元素绝对定位(暂时没学习)

         元素也会脱离文档流，虽然可以撑开父元素，但是会导致父元素的宽度丢失

          而且使用这种方式也会导致下边的元素上移，不能解决问题

                

      推荐方式：**<font style="color:#FF0000;">将overflow设置为hidden是副作用最小的开启BFC的方式。</font>** 

由于受到box1浮动的影响，box2整体向上移动了100px

            





我们有时希望**<font style="color:#FF0000;">清除掉其他元素浮动对当前元素产生的影响</font>**，这时可以**<font style="color:#FF0000;">使用clear来完成功能</font>**

            **<font style="color:#FF0000;">clear可以用来清除其他浮动元素对当前元素的影响</font>**

            可选值：

                **<font style="color:#FF0000;">none，默认值，不清除浮动</font>**

**<font style="color:#FF0000;">                left，清除左侧浮动元素对当前元素的影响</font>**

**<font style="color:#FF0000;">                right，清除右侧浮动元素对当前元素的影响</font>**

**<font style="color:#FF0000;">                both，清除两侧浮动元素对当前元素的影响</font>**

**<font style="color:#FF0000;">                        清除对他影响最大的那个元素的浮动</font>**



原理：

    **<font style="color:#FF0000;">设置了 clear 的元素，通过调整自身来使自己不要和浮动元素排列在一起。</font>**

               **<font style="color:#FF0000;">类似于给自己加个margin-top</font>**





**<font style="color:#FF0000;">解决高度塌陷方案三：</font>**

        

可以直接在高度塌陷的**<font style="color:#FF0000;">父元素</font>**的**<font style="color:#FF0000;">最后</font>**，添**<font style="color:#FF0000;">加一个空白的div</font>**，由于这个div并没有浮动，所以他是可以撑开父元素的高度的，然后在对其进行清除浮动，这样可以通过这个空白的div来撑开父元素的高度，基本没有副作用

              

        

使用这种方式虽然可以解决问题，但是会在页面中添加多余的结构。

            

**<font style="color:#FF0000;">通过after伪类，选中box1的后边</font>**

 

可以通过after伪类向元素的最后添加一个空白的块元素，然后对其清除浮动，这样做和添加一个div的原理一样，可以达到一个相同的效果，且不会在页面中添加多余的div，这是我们最推荐使用的方式，几乎没有副作用

        

             

**<font style="color:#FF0000;">解决高度塌陷方案三：</font>**

             **<font style="color:#FF0000;">.box1::after{</font>**

**<font style="color:#FF0000;">                /* 空内容 */</font>**

**<font style="color:#FF0000;">                content: "";</font>**

**<font style="color:#FF0000;">                /* 块元素 */</font>**

**<font style="color:#FF0000;">                display: block;</font>**

**<font style="color:#FF0000;">                /* 清除浮动 */</font>**

**<font style="color:#FF0000;">                clear: both;</font>**

**<font style="color:#FF0000;">             }</font>**

**表格**   

  表格在日常生活中使用的非常的多，比如excel就是专门用来创建表格的工具，表格就是用来表示一些格式化的数据的，比如：课程表、银行对账单

    

在网页中也可以来创建出不同的表格。   

        <!-- **<font style="color:#FF0000;">html表格的书写</font>** -->

        <table border="1" width="50%" align="center">

            <!-- **<font style="color:#FF0000;">tr表示行，td表示列，有几个tr就有几列</font>** -->

            <tr>

                **<font style="color:#FF0000;"><!-- colspan 合并列--></font>**合并同一行中的多个列

                <td colspan="2">1</td>

                <!-- <td>2</td> -->

                <td>3</td>

            </tr>

            <tr>

                <td>1</td>

                <td>2</td>

                **<font style="color:#FF0000;"><!-- rowspan合并行--></font>**合并同一列中的多个行

                <td rowspan="2">3</td>

            </tr>

            <tr>

                <td>1</td>

                <td>2</td>

                <!-- <td>3</td> -->

            </tr>

        </table>

    </body>

</html>





**表格样式**

   

        <style type="text/css">     

              /*设置表格的宽度 */  

            table{

                width: 300px;

                /*居中*/

                margin:0 auto;

                /*边框*/

                border: 1px solid #000;

                /*

       **<font style="color:#FF0000;">table和td边框之间默认有一个距离</font>**

              **<font style="color:#FF0000;">通过border-spacing属性可以设置这个距离</font>**

                 */



**<font style="color:#FF0000;">设置表格的边框</font>**，**<font style="color:#FF0000;">要</font>****<font style="color:#4874CB;">单线边框</font>**

**<font style="color:#FF0000;">方法一 </font>**

**<font style="color:#FF0000;">border-spacing:0;</font>** 

               

**<font style="color:#FF0000;">方法二</font>**

**<font style="color:#FF0000;">border-collapse [kə'læps] 可以用来设置表格的边框合并</font>**

     **<font style="color:#FF0000;">如果设置了边框合并，则border-spacing自动失效</font>**

                 */

                 border-collapse: collapse;







    **<font style="color:#FF0000;">/*需求二：设置背景色样式*/</font>**

            background-color: skyblue;

                

            }

            

            /*

             * 设置边框

             */

             th,td{

                border: 1px solid #000;

             }

        

          **<font style="color:#FF0000;">  </font>**

**<font style="color:#FF0000;"> 需求三： 设置隔行变色*/</font>**

    **<font style="color:#FF0000;">tr:nth-child(even){</font>**

**<font style="color:#FF0000;">        background-color: yellowgreen;</font>**

**<font style="color:#FF0000;">    }</font>**

            

  

   **<font style="color:#FF0000;">需求四：鼠标移入到tr以后，改变颜色</font>**

        */

    tr:hover{

        background-color: palegreen;

    }

      **<font style="color:#FF0000;"> </font>**



**<font style="color:#FF0000;">     </font>**

需求五：**<font style="color:#FF0000;">调整td文字在表格中的位置</font>**

        **<font style="color:#FF0000;">vertical-align:可选值：top,bottom,middle </font>**

**<font style="color:#FF0000;">      text-align；可选值：left，center，right</font>**

 

        td{

            height: 50px;

            text-align:center;

            vertical-align: middle;

         }

        </style>

    </head>

    <body>

        <!--

            **<font style="color:#FF0000;">table是一个块元素</font>**

            学号 姓名 性别 住址

            1   孙悟空 男  花果山

            2   猪八戒 男  高老庄

            3   沙和尚 男  流沙河

            4   唐僧   男  女儿国

   **<font style="color:#FF0000;">可以使用th标签来表示表头中的内容，它的用法和td一样，不同的是它会有一些默认效果，如加粗</font>**

               

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







**长表格**

        <table>

   有一些情况下表格是非常的长的，这时就需要将**<font style="color:#FF0000;">表格分为三个部分</font>**，**<font style="color:#FF0000;">表头，表格的主体，表格底部</font>**

                在HTML中为我们提供了三个标签：

                   **<font style="color:#FF0000;"> thead 表头</font>**

**<font style="color:#FF0000;">                tbody 表格主体</font>**

**<font style="color:#FF0000;">                tfoot 表格底部</font>**

                    

   这三个标签的作用，就来区分表格的不同的部分，他们**<font style="color:#FF0000;">都是table的子标签</font>**，

都需要直接写到table中，tr需要写在这些标签当中

                    

          **<font style="color:#FF0000;">thead中的内容，永远会显示在表格的头部</font>**

**<font style="color:#FF0000;">        tfoot中的内容，永远都会显示表格的底部</font>**

**<font style="color:#FF0000;">        tbody中的内容，永远都会显示表格的中间</font>**

                

 如果表格中没有写tbody，浏览器会自动在表格中添加tbody，并且将所有的tr都放到tbody中，所以注意**<font style="color:#FF0000;">tr并不是table的子元素，而是tbody的子元素</font>**

                

**<font style="color:#FF0000;">通过table > tr 无法选中行 需要通过tbody > tr</font>**

   

   <!-- 需求：表头：日期 收入 支出 合计

                   12.2 200  10  180

                   12.2 200  10  180

                   ....

                   总计：180

   

            **<font style="color:#FF0000;"><thead></font>**

                <tr>

                    <td>日期</td>

                    <td>收入</td>

                    <td>支出</td>

                    <td>合计</td>

                </tr>

           **<font style="color:#FF0000;"> </thead></font>**

            **<font style="color:#FF0000;"><tfoot></font>**

                <tr>

                    <td></td>

                    <td></td>

                    <td>合计：</td>

                    <td>70000</td>

                </tr>

            **<font style="color:#FF0000;"></tfoot></font>**

           **<font style="color:#FF0000;"> <tbody></font>**

                <tr>

                    <td>12.3</td>

                    <td>10000</td>

                    <td>500</td>

                    <td>9500</td>

                </tr>

               ......

           **<font style="color:#FF0000;"> </tbody></font>**

            

        </table>

        

    </body>

</html>





**父子外边距重叠**

            .box1{

                width: 300px;

                height: 300px;

                background-color: #bfa;

**<font style="color:#FF0000;">父子外边距重叠解决一</font>**

                /* **<font style="color:#FF0000;">overflow: hidden;</font>** */

            }

            .box2{

                width: 200px;

                height: 200px;

                background-color: yellow;

                margin-top: 100px;

            }           

        

    子元素和父元素相邻的**<font style="color:#FF0000;">垂直外边距会发生重叠</font>**，**<font style="color:#FF0000;">子元素的外边距会传递给父元素</font>**

使用**<font style="color:#FF0000;">空的table标签</font>**可以隔离父子元素的外边距，**<font style="color:#FF0000;">阻止外边距的重叠</font>**

           

         

**<font style="color:#FF0000;"> 解决父子元素的外边距重叠方法二</font>**

         添加伪类box1 before

          **<font style="color:#FF0000;">display:table可以将一个元素设置为表格显示</font>**

        

            **<font style="color:#FF0000;">.box1::before{</font>**

**<font style="color:#FF0000;">                content: " ";</font>**

**<font style="color:#FF0000;">                display:table;</font>**

**<font style="color:#FF0000;">            }</font>**

            

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

            

            

 **<font style="color:#FF0000;">解决父元素高度塌陷(转化成块元素，清除浮动)</font>**

**<font style="color:#FF0000;">    </font>**

**<font style="color:#FF0000;">            .clearfix::after{</font>**

**<font style="color:#FF0000;">                content: " ";</font>**

**<font style="color:#FF0000;">                display: block;</font>**

**<font style="color:#FF0000;">                clear: both;</font>**

**<font style="color:#FF0000;">            }</font>**

            

      

经过修改后的**<font style="color:#FF0000;">clearfix</font>**是一个多功能的，**<font style="color:#FF0000;">既可以解决高度塌陷，又可以确保父元素和子元素的垂直外边距不会重叠（之前之后的）</font>**

             

             **<font style="color:#FF0000;">.clearfix::before,</font>**

**<font style="color:#FF0000;">             .clearfix::after{</font>**

**<font style="color:#FF0000;">                content: " ";</font>**

**<font style="color:#FF0000;">                display: table;</font>**

**<font style="color:#FF0000;">                clear: both;</font>**

**<font style="color:#FF0000;">             }</font>**

        </style>

    </head>

    <body>

        

            <div class="box3 clearfix">

                <div class="box4"></div>

            </div>

        

        <!-- <div class="box1">

            <div class="box2"></div>

        </div> -->

        

    </body>

</html>





**表单**

<body>



      **<font style="color:#FF0000;">表单：</font>**

**<font style="color:#FF0000;">      将用户信息等本地的数据信息提交给服务器的</font>**

       比如：百度的搜索框 注册 登录这些操作都需要填写表单

  

  

       **<font style="color:#FF0000;">1:创建表单  form标签</font>**

           **<font style="color:#FF0000;">属性：action属性（必须要写）</font>**

指向的是一个服务器的地址，当我们提交表单时将会提交到action属性对应的地址

**<font style="color:#FF0000;">//表单提交给服务器的位置 </font>**

   

        **<font style="color:#FF0000;"><form action="./target.html"></font>**

      

      



**<font style="color:#FF0000;">2:添加表单项 </font>****input**



使用form创建的仅仅是一个空白的表单，我们还需要向form中添加不同的表单项

            

                

**<font style="color:#FF0000;">（1）input来创建一个文本框，</font>**

            **<font style="color:#FF0000;">type属性是text</font>**

            **<font style="color:#FF0000;">name属性：提交内容的名字</font>**

**<font style="color:#FF0000;">如果</font>**希望表单项中的**<font style="color:#FF0000;">数据会提交到服务器</font>**中，**<font style="color:#FF0000;">必须指定一个name属性 </font>**    

  **<font style="color:#FF0000;">value属性值：作为文本框的默认值显示 </font>**   

       

    用户名

    <input type="text" name="username" id="user" value="">

                <br>

                <br>

    

**<font style="color:#FF0000;">（2）input创建一个密码框</font>**

            **<font style="color:#FF0000;">type属性值是password</font>**

**<font style="color:#FF0000;">          name属性：提交密码的名字</font>**

             

        密码

            <input type="password" name="password" id="">

                <br>

                <br>

            









**<font style="color:#FF0000;">（3）input创建一个单选按钮</font>**

**<font style="color:#FF0000;">- type属性：radio</font>**

**<font style="color:#FF0000;">- name属性进行分组</font>**，**<font style="color:#FF0000;">属性相同是一组按钮，如果不设置，则都可以选择</font>**

**<font style="color:#FF0000;">- </font>****<font style="color:#30C0B4;">value</font>****<font style="color:#FF0000;">属性</font>****<font style="color:#30C0B4;">必须设置</font>****<font style="color:#FF0000;">，这样被选中的表单项的value属性值将</font>****<font style="color:#30C0B4;">会最终提交给服务器      </font>**

**<font style="color:#FF0000;">-checked="checked"属性  默认选中</font>**

      

性别  

    <input type="radio" name="gender" value="man">男

    <input type="radio" name="gender" value="woman" checked="checked">女

            <br>

            <br>

            

   

**<font style="color:#FF0000;">（4）input创建一个多选框</font>**

**<font style="color:#FF0000;">-type属性:checkbox</font>**

**<font style="color:#FF0000;">-checked="checked"属性  默认选中</font>**

        

 爱好 

  <input type="checkbox" name="hobby" value="1">篮球

  <input type="checkbox" name="hobby" value="2" checked="checked">跳舞

  <input type="checkbox" name="hobby" value="3"  checked="checked">唱歌

  <input type="checkbox" name="hobby" value="4">游戏

               

            <br /><br />

            

            

  

**<font style="color:#FF0000;"> (5)select来创建一个下拉列表</font>**

 **<font style="color:#FF0000;">-name属性设置给select，</font>**

**<font style="color:#FF0000;"> -value属性设置给option</font>**

**<font style="color:#FF0000;">-selected="selected"，将选项设置为默认选中</font>**



你喜欢的明星

          <select name="star" id="">

          <option value="1">鹿晗</option>

          <option value="2" selected="selected">黄子韬</option>

          <option value="3">丁真</option>

           </select> 

                

            

            <br /><br />

            

         

**<font style="color:#FF0000;">（6）textarea创建一个文本域</font>**

        

        自我介绍 

           <input **<font style="color:#FF0000;">type="textarea" </font>**value="" id="" name="mark">

            

            <br /><br />

            



**<font style="color:#FF0000;">（7）input创建一个提交按钮，点击后表单就会提交</font>**

**<font style="color:#FF0000;">-type属性值：submit</font>**

**<font style="color:#FF0000;">-value属性：指定按钮上的文字</font>**

           

            <input type="submit" value="注册">

            <!-- <input type="submit"> -->

            

     

**<font style="color:#FF0000;">（8）创建一个重置按钮，type="reset" </font>**

            **<font style="color:#FF0000;">点击重置按钮以后表单中内容将会恢复为默认值</font>**

     

            <input type="reset" >

            

**<font style="color:#FF0000;">     </font>**

**<font style="color:#FF0000;">（9）创建一个单纯的按钮，button</font>**

           **<font style="color:#FF0000;"> 这个按钮没有任何功能，只能被点击</font>**

          

            <input type="button" value="点击">

            



**<font style="color:#FF0000;">（10）button标签来创建按钮</font>**

   **<font style="color:#FF0000;">方式和使用input类似，它是成对出现的标签，使用起来更加的灵活 </font>**

          

            <br /><br />

            **<font style="color:#FF0000;"><button type="submit">提交</button></font>**

            <button type="reset">重置</button>

            <button type="button">点击</button>

        </form>

    </body>

</html>



**input属性补充**

       **<font style="color:#FF0000;">1: autocomplete="off"  关闭自动补全</font>**

**<font style="color:#FF0000;">      2: readonly 设置为只读，不能修改</font>**

**<font style="color:#FF0000;">      3: disabled 设置为禁用</font>**

**<font style="color:#FF0000;">      4: autofocus  自动获取焦点</font>**

**<font style="color:#FF0000;">      5: placeholder 提示内容</font>**

 

      <input type="text" autocomplete="off" autofocus    name="username" placeholder="请输入姓名" value="" />



+ 在 HTML **<font style="color:#FF0000;">表单中，value属性</font>**非常重要。对于不同的表单元素，它有不同的用途。
+ **文本框（input type="text"）和密码框（input type="password"）**：value属性用于**<font style="color:#FF0000;">设置文本框或密码框的初始值</font>**。例如，<input type="text" value="初始文本">，在页面加载时，文本框中就会显示 “初始文本”。用户可以对这个值进行修改，当表单提交时，提交的是用户修改后的值。
+ **单选按钮（input type="radio"）和复选框（input type="checkbox"）**：value属性用于**<font style="color:#FF0000;">定义当该选项被选中并提交表单时所传递的值</font>**。比如对于单选按钮<input type="radio" name="gender" value="male">男</input>和<input type="radio" name="gender" value="female">女</input>，当用户选择 “男” 这个选项并提交表单时，传递给服务器的值就是 “male”。
+ **下拉菜单（select）**：**<font style="color:#FF0000;">在<select>标签内部的<option>标签中有value属性</font>**。例如<select><option value="option1">选项1</option><option value="option2">选项2</option></select>，当用户选择 “选项 1” 并**<font style="color:#FF0000;">提交表单时，传递的值是 “option1”</font>**。

**Name**

+ **<font style="color:#222222;">表单元素方面</font>**<font style="color:#222222;">：</font>
    - **<font style="color:#222222;">文本框（input type="text"）、密码框（input type="password"）等</font>**<font style="color:#222222;">：“name” 属性用于</font>**<font style="color:#FF0000;">给这些输入框命名，以便在表单提交时，服务器能够通过这个名称准确识别接收到的是哪个输入框的值</font>**<font style="color:#222222;">。例如：</font><font style="color:#222222;"><input type="text" name="username"></font><font style="color:#222222;">，这里的 “username” 就是给文本框设定的名称，当用户在该文本框输入内容并提交表单后，服务器端就可以根据 “username” 这个名称获取到用户输入的具体值。</font>
    - **<font style="color:#222222;">单选按钮（input type="radio"）和复选框（input type="checkbox"）</font>**<font style="color:#222222;">：对于单选按钮组和复选框组，</font>**<font style="color:#FF0000;">相同组内的元素需要设置相同的 “name” 属性值，以确保它们在逻辑上是相互关联的一组选项。</font>**<font style="color:#222222;">比如对于单选按钮选择性别：</font><font style="color:#222222;"><input type="radio" name="gender" value="male">男</input></font><font style="color:#222222;">  
</font><font style="color:#222222;"><input type="radio" name="gender" value="female">女</input></font><font style="color:#222222;">这里 “gender” 就是这两个单选按钮共同的名称，保证了用户只能从 “男”“女” 中选择其一，并且在表单提交时，服务器能通过 “gender” 这个名称知道用户选择的性别对应的 “value” 值。</font>
    - **<font style="color:#222222;">下拉菜单（select）</font>**<font style="color:#222222;">：</font>**<font style="color:#FF0000;">在下拉菜单中，“name” 属性同样用于给整个下拉菜单元素命名，以便在表单提交时能正确识别其选择的值。</font>**<font style="color:#222222;">例如：</font><font style="color:#222222;"><select name="country"></font><font style="color:#222222;">  
</font><font style="color:#222222;"><option value="china">中国</option></font><font style="color:#222222;">  
</font><font style="color:#222222;"><option value="usa">美国</option></font><font style="color:#222222;">  
</font><font style="color:#222222;"></select></font><font style="color:#222222;">这里 “country” 就是下拉菜单的名称，当用户选择一个国家并提交表单后，服务器可依据 “country” 获取到对应的国家值（即所选选项的 “value” 值）。</font>



    - **<font style="color:#FF0000;">Name相当于坐标，提交表单时，服务器可以精确找到，在通过value确定最终要上传哪个值。</font>**

**定位： **

        更加高级的布局手段

    - 定位指的就是将指定的元素摆放到页面的任意位置

        通过定位可以任意的摆放元素

      - 通过**<font style="color:#FF0000;">position</font>**属性来设置元素的定位

        -可选值：

          **<font style="color:#FF0000;">static： ['stætik] 默认值，元素没有开启定位</font>**

**<font style="color:#FF0000;">          relative： ['relətiv] 开启元素的相对定位</font>**

**<font style="color:#FF0000;">          absolute： ['æbsəlju:t] 开启元素的绝对定位</font>**

**<font style="color:#FF0000;">          fixed：开启元素的固定定位（也是绝对定位的一种）</font>**

**<font style="color:#FF0000;">          sticky： ['stiki] 开启元素的粘滞定位</font>**

**<font style="color:#FF0000;">相对定位：</font>**

      当元素的position属性设置为relative时，则开启了元素的相对定位 ==》自恋型

      1.当开启了元素的相对定位以后，而**<font style="color:#FF0000;">不设置偏移量时，元素不会发生任何变化</font>**

      2.相对定位是**<font style="color:#FF0000;">相对于</font>**元素在文档流中**<font style="color:#FF0000;">原来的位置</font>**进行定位（top:0;left:0;）

      3.相对定位的元素**<font style="color:#FF0000;">不会脱离文档流</font>**

      4.相对定位会使元素**<font style="color:#FF0000;">提升一个层级</font>**

      5.相对定位**<font style="color:#FF0000;">不会改变元素的性质，块还是块，内联还是内联</font>**

**<font style="color:#FF0000;">偏移量</font>**

    当开启了元素的定位（position属性值是一个非static的值）时，

      可以通过left right top bottom四个属性来设置元素的偏移量，越大越向反方向移动

      **<font style="color:#FF0000;">left：元素相对于其定位位置的左侧偏移量，</font>**

**<font style="color:#FF0000;">      right：元素相对于其定位位置的右侧偏移量</font>**

**<font style="color:#FF0000;">      top：元素相对于其定位位置的上边的偏移量</font>**

**<font style="color:#FF0000;">      bottom：元素相对于其定位位置下边的偏移量</font>**

   

    通常偏移量只需要使用两个就可以对一个元素进行定位，

      一般选择水平方向的一个偏移量和垂直方向的偏移量来为一个元素进行定位

 -->

**绝对定位**

当position属性值设置为**<font style="color:#FF0000;">absolute</font>**时，则开启了元素的绝对定位

**<font style="color:#FF0000;">绝对定位：</font>**

1.开启绝对定位，会使**<font style="color:#FF0000;">元素脱离文档流</font>**

2.开启绝对定位以后，如果**<font style="color:#FF0000;">不设置偏移量，则元素的位置不会发生变化</font>**

3.绝对定位是**<font style="color:#FF0000;">相对于离他最近的包含块定位的</font>**

  （一般情况，开启了子元素的绝对定位都会同时开启父元素的相对定位**<font style="color:#FF0000;"> '父相子绝'</font>**）

4.绝对定位**<font style="color:#FF0000;">会使元素提升一个层级</font>**

5.绝对定位**<font style="color:#FF0000;">会改变元素的性质，开启BFC属性</font>**

**<font style="color:#FF0000;">  内联元素变成行内块元素，</font>**

**<font style="color:#FF0000;">  块元素的宽度和高度默认都被内容撑开</font>**

**<font style="color:#FF0000;"> 包含块：containing block </font>**

**<font style="color:#FF0000;">-正常情况下：</font>**

**<font style="color:#FF0000;">  离当前元素最近的祖先块元素</font>**

**<font style="color:#FF0000;">-定位情况下：</font>**

**<font style="color:#FF0000;">  离他最近的开启了定位的祖先元素</font>**

**<font style="color:#FF0000;">    如果所有的祖先元素都没有开启定位，则会相对于浏览器窗口进行定位</font>**

**<font style="color:#FF0000;">    html （根元素，初始包含块） </font>**

**固定定位**

当元素的position属性设置**<font style="color:#FF0000;">fixed</font>**时，则开启了元素的固定定位

  （1）用于固定在浏览器页面上，**<font style="color:#FF0000;">不随浏览器的滚动而改变位置；</font>**

  （2）**<font style="color:#FF0000;">以浏览器为参照物</font>**，和父元素没有任何关系；

（3）固定定位**<font style="color:#FF0000;">不占有原来的位置，即脱离标准流 </font>**

    (4)应用场景

        - 固定导航

        - 固定侧边栏

        - 广告  

 -->

粘滞定位 （一般用于页面导航的吸顶效果)

    -当元素的position属性设置为**<font style="color:#FF0000;">sticky</font>**时，则开启了元素的粘滞定位

    **<font style="color:#FF0000;">（1）以浏览器为参照物（体现固定定位特点）；</font>**

**<font style="color:#FF0000;">   （2）占有原来位置（体现相对定位特点）；</font>**

**<font style="color:#FF0000;">　（3）粘滞定位可以在元素到达某个位置时，将其固定 </font>**

**<font style="color:#FF0000;">     (4)没有达到top值之前正常显示，达到top值之后类似于固定定位，不会跟随滚动条滚动而滚动 </font>**

 -->

 水平布局

    left+margin-left+border-left+padding-left+width+padding-right+border-right+margin-right+right

  -当**<font style="color:#FF0000;">开启决定定位</font>**后，**<font style="color:#FF0000;">水平方向的布局等式就会加上left，right两个值</font>**

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

 -->

**<font style="color:#FF0000;">Right>left>width</font>**

   2:**<font style="color:#FF0000;">父元素的层级再高，也不会盖住子元素</font>**

     

     

        /* 透明度 0透明 1不透明 中间值0-1 */

        opacity: 0.5;

层级

1:如果定位元素的层级是一样，则下边的元素会盖住上边的

  通过**<font style="color:#FF0000;">z-index属性可以用来设置元素的层级</font>**

  可以为z-index指定一个正整数作为值，该值将会作为当前元素的层级

    **<font style="color:#FF0000;">层级越高，越优先显示</font>**

  **<font style="color:#FF0000;">对于没有开启定位的元素不能使用z-index </font>**

-->

**透明背景 opacity**

2、设置元素的透明背景

**<font style="color:#FF0000;"> opacity [əu'pæsiti] 可以用来设置元素背景的透明，</font>**

   它需要一个0-1之间的值

    **<font style="color:#FF0000;"> 0 表示完全透明</font>**

**<font style="color:#FF0000;">     1 表示完全不透明</font>**

**<font style="color:#FF0000;">     0.5 表示半透明 </font>**

-->

1、opacity用来**<font style="color:#FF0000;">设置元素的不透明级别</font>**，从 0.0 （完全透明）到 1.0（完全不透明）。

2**<font style="color:#FF0000;">、transparent是颜色的一种</font>**，这种颜色叫**<font style="color:#FF0000;">透明色</font>**。

3、rgba(r,g,b,a)稍复杂一点，r：红色值；g：绿色值；b：蓝色值；a：alpha透明度。

        alpha表示像素不透明性的值。像素越不透明，则隐藏越多呈现图像的背景。

        取值0~1之间。0表示完全透明的像素，1表示完全不透明的像素。

 -->

1、opacity是作为一个完整属性出现的。transparent和rgba都是作为属性值出现的。

2、**<font style="color:#FF0000;">opacity是对于整个元素起作用的</font>**。打个比方，就像拿一块玻璃糊在了这个元素上，

    盖上的地方都会受到影响。

    而transparent和alpha是对元素的某个属性起作用的。

    任何需要设置颜色的地方都可以根据情况使用transparent或rgba。

    比如背景、边框、字体等等。哪个属性的颜色设置了transparent，哪个属性就是透明的，完全透明。

    哪个属性用rgba()设置了透明，就对哪个属性起作用，透明程度可设置。

3、由于opacity和alpha设置的透明程度可调，就引出一个继承的问题。

  **<font style="color:#FF0000;">如果一个元素未设置opacity属性，</font>**

**<font style="color:#FF0000;">    那么它会从它的父元素继承opacity属性的值。而alpha不存在继承</font>**。

-->

       

   

**:target选择器称为目标选择器**，

      用来匹配文档(页面)的url的某个标志符的目标元素。 -->

    <style>

      /***<font style="color:#FF0000;">这里的:target就是指id="brand"的div对象</font>***/

      #brand:target {

     

   <h2><a href="#brand">页签1</a></h2>

   <div id="brand">非居不锐君要命作使落出不败而性善，若云了脱鲜程商哥性我选路国活，后弟得放哉在与，丰世下。</div>

+ **:target****选择器在 CSS 中是一个非常有用的选择器。它用于选择当前活动的目标元素，通常是在 URL 中有一个片段标识符（以****#****开头的部分）指向的元素。例如，当页面的 URL 是**[**https://example.com/page.html#section**](https://example.com/page.html#section)** - 1****时，****#section - 1****对应的元素就会被****:target****选择器选中**。

   

**<font style="color:#FF0000;">① 每个a标签的href属性须与其兄弟节点.content元素的id值一致</font>**

**<font style="color:#FF0000;">② .content元素与a标签的顺序不能更改 --></font>**

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

 

**label **

<label>标签的作用是为鼠标用户改进了可用性，

        当用户点击<label>标签中的文本时，浏览器就会自动将焦点转到和该标签相关联的控件上；//**<font style="color:#FF0000;">增大控件作用范围</font>**

        <label **<font style="color:#FF0000;">for="username"</font>**>用户名：</label>

        <input type="text" name="" **<font style="color:#FF0000;">id="username"</font>**>

 

**lable实现tab栏切换**

       原理： **<font style="color:#FF0000;">当用户点击label元素时，该label所绑定的input单选框就会被选中</font>**，

      同时通过使用CSS选择器让被选中的input元素之后的label和.content元素都加上相应的样式。

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

      ① input需要隐藏，因为我们并不需要显示它，但它却是实现Tab切换的核心力量

      ② “input:checked+label” 表示被选中的单选框后的 label 元素需要做标记

      ③ .content 元素需要先全部隐藏

      ③ “input:checked~.content” 表示被选中的单选框后的 .content 元素需要显示

 

    <!--① label需要绑定input，方法就是label的for属性值与input的id一致，

      这样当点击label元素时input单选框就会被选中

        ② input、label和div三者是有顺序的，不能随意调换顺序-->

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

     

swiper插件  轮播图（会引用，会修改即可） 

1. <font style="color:#000000;">首先加载插件，需要用到的文件有</font>[<font style="color:#4183C4;">swiper.min.js</font>](https://3.swiper.com.cn/download/index.html" \l "file7" \t "https://3.swiper.com.cn/usage/_blank)<font style="color:#000000;">和</font>[<font style="color:#4183C4;">swiper.min.css</font>](https://3.swiper.com.cn/download/index.html" \l "file5" \t "https://3.swiper.com.cn/usage/_blank)<font style="color:#000000;">文件。</font>

<font style="color:#000000;"> <link rel="stylesheet" href="path/to/</font>**<font style="color:#000000;">swiper.min.css</font>**<font style="color:#000000;">"></font>

<font style="color:#000000;"> <script src="path/to/</font>**<font style="color:#000000;">swiper.min.js</font>**<font style="color:#000000;">"></script></font>

1. <font style="color:#000000;">HTML内容。</font>

<font style="color:#000000;"><div class="swiper-container"></font>

<font style="color:#000000;">    <div class="swiper-wrapper"></font>

<font style="color:#000000;">        <div class="swiper-slide">Slide 1</div></font>

<font style="color:#000000;">        <div class="swiper-slide">Slide 2</div></font>

<font style="color:#000000;">        <div class="swiper-slide">Slide 3</div></font>

<font style="color:#000000;">    </div></font>

<font style="color:#000000;">    <!-- 如果需要分页器 --></font>

<font style="color:#000000;">    <div class="swiper-pagination"></div></font>

<font style="color:#000000;">    </font>

<font style="color:#000000;">    <!-- 如果需要导航按钮 --></font>

<font style="color:#000000;">    <div class="swiper-button-prev"></div></font>

<font style="color:#000000;">    <div class="swiper-button-next"></div></font>

<font style="color:#000000;">    </font>

<font style="color:#000000;">    <!-- 如果需要滚动条 --></font>

<font style="color:#000000;">    <div class="swiper-scrollbar"></div></font>

<font style="color:#000000;"></div></font><font style="color:#A9A9A9;">导航等组件可以放在container之外</font>

1. <font style="color:#000000;">你可能想要给Swiper定义一个大小，当然不要也行。</font>

<font style="color:#000000;">.swiper-container {</font>

<font style="color:#000000;">    width: 600px;</font>

<font style="color:#000000;">    height: 300px;</font>

<font style="color:#000000;">}  </font>

<font style="color:#000000;">4.初始化Swiper：最好是挨着</body>标签</font>

<font style="color:#000000;"><script>        </font>

<font style="color:#000000;">  var mySwiper = new Swiper ('.swiper-container', {</font>

<font style="color:#000000;">    direction: 'vertical',</font>

<font style="color:#000000;">    loop: true,</font>

<font style="color:#000000;">    </font>

<font style="color:#000000;">    // 如果需要分页器</font>

<font style="color:#000000;">    pagination: '.swiper-pagination',</font>

<font style="color:#000000;">    </font>

<font style="color:#000000;">    // 如果需要前进后退按钮</font>

<font style="color:#000000;">    nextButton: '.swiper-button-next',</font>

<font style="color:#000000;">    prevButton: '.swiper-button-prev',</font>

<font style="color:#000000;">    </font>

<font style="color:#000000;">    // 如果需要滚动条</font>

<font style="color:#000000;">    scrollbar: '.swiper-scrollbar',</font>

<font style="color:#000000;">  })        </font>

<font style="color:#000000;">  </script></font>

<font style="color:#000000;"></body></font>

<font style="color:#000000;">5.完成。恭喜你，现在你的Swiper应该已经能正常切换了。现在开始添加各种</font>[<font style="color:#4183C4;">选项和参数</font>](https://3.swiper.com.cn/api/index.html" \t "https://3.swiper.com.cn/usage/_blank)<font style="color:#000000;">丰富你的Swiper，开启华丽移动前端创作之旅。</font>

** 图标字体（iconfont）**

           -在网页中经常需要使用一些图标，可以通过图片来引入图标

           但图片本身比较大，也不灵活

           -所以使用图标时，我们还可以**<font style="color:#FF0000;">将图标直接设置为字体，</font>**

                然后通过font-face的形式来对字体进行引入

           -这样我们就可以通过使用字体的形式来使用图标

<font style="color:#000000;"><link rel="stylesheet" href="</font>./font_4771251_qzjb1gs6u3i/iconfont.css<font style="color:#000000;">"></font>

<font style="color:#000000;"><script src="</font>./font_4771251_qzjb1gs6u3i/iconfont.js<font style="color:#000000;">"></script></font>

   

 <!-- **<font style="color:#FF0000;">第一种方式  转义字符形式</font>**-->

    <!-- <span class="iconfont">**<font style="color:#FF0000;">&#xe611;</font>**</span>

    <span class="iconfont">&#xe60e;</span> -->

    <span class="iconfont">&#xe600;</span>

    <!-- **<font style="color:#FF0000;">第二种方式  类名形式 （常用）</font>**-->

    <!-- <i class="**<font style="color:#FF0000;">iconfont icon-jishuzhuanyi s1</font>**">1</i>

    <i class="iconfont icon-zhijiao-copy-copy3"></i> -->

    <i class="iconfont icon-gouwuchekong"></i>

    <!--**<font style="color:#FF0000;">第三种方式 （了解）</font>**-->

    <p>一朵花</p>

    <!-- **<font style="color:#FF0000;">第四种 </font>**-->

    **<font style="color:#FF0000;"><svg class="icon" aria-hidden="true"></font>**

      <use xlink:href="#icon-gouwuchekong"></use>

    </svg>

 



**背景**

  **<font style="color:#FF0000;">1: background-color  设置背景颜色</font>**

                background-color: blueviolet;

               

 

**<font style="color:#FF0000;">  2:background-image来设置背景图片</font>**

                    -**<font style="color:#FF0000;"> 语法：background-image:url(相对路径);</font>**

                    -可以同时为一个元素指定背景颜色和背景图片，

                        这样背景颜色将会作为背景图片的底色

                    -图片在元素中的位置

                        如果背景图片大于元素，默认会显示图片的左上角

                        如果背景图片和元素一样大，则会将背景图片全部显示

                        如果背景图片小于元素大小，则会默认将背景图片平铺以充满元素     

                background-image: url('./img/gaitubao_小图_png.png');

               

                需求：虽然图小，但图片我只要一张

**<font style="color:#FF0000;">3:background-repeat用于设置背景图片的重复方式</font>**

                    可选值：

                        **<font style="color:#FF0000;">repeat，默认值，背景图片会双方向重复（平铺）</font>**

**<font style="color:#FF0000;">                        no-repeat ，背景图片不会重复，有多大就显示多大</font>**

**<font style="color:#FF0000;">                        repeat-x， 背景图片沿水平方向重复</font>**

**<font style="color:#FF0000;">                        repeat-y，背景图片沿垂直方向重复</font>**

                background-repeat: no-repeat;

 

**<font style="color:#FF0000;">4:background-position可以调整背景图片在元素中的位置</font>**

                       

背景图片**<font style="color:#FF0000;">默认是贴着元素的左上角显示</font>**

                  可选值：

                        该属性可以使用 **<font style="color:#FF0000;">top right left bottom center</font>**中的两个值

                            来指定一个背景图片的位置

                            top left 左上

                            bottom right 右下

                            **<font style="color:#FF0000;">如果只给出一个值，则第二个值默认是center</font>**

                 

                    也可以直接指定**<font style="color:#FF0000;">两个偏移量</font>**，

                        第一个值是**<font style="color:#FF0000;">水平偏移量</font>**

                            - 如果指定的是一个**<font style="color:#FF0000;">正值</font>**，则图片会**<font style="color:#FF0000;">向右</font>**移动指定的像素

                            - 如果指定的是一个**<font style="color:#FF0000;">负值</font>**，则图片会**<font style="color:#FF0000;">向左</font>**移动指定的像素

                        第二个是**<font style="color:#FF0000;">垂直偏移量</font>**  

                            - 如果指定的是一个**<font style="color:#FF0000;">正值</font>**，则图片会**<font style="color:#FF0000;">向下</font>**移动指定的像素

                            - 如果指定的是一个**<font style="color:#FF0000;">负值</font>**，则图片会**<font style="color:#FF0000;">向上</font>**移动指定的像素

                   

 

第一个值是水平方向，第二值垂直方向，假设只设置一个值，第二个值center

                /* background-position: left bottom; */

                background-position: 0px -100px;

**<font style="color:#FF0000;"> 5:background-clip</font>**

            **<font style="color:#FF0000;">设置背景的范围</font>**

              可选值：

                 **<font style="color:#FF0000;">border-box 默认值，背景颜色会出现在边框的下边</font>**

**<font style="color:#FF0000;">                 padding-box  背景不会出现在边框，只会出现在内容区和内边距</font>**

**<font style="color:#FF0000;">                 content-box  背景只出现在内容区</font>**

       /* background-clip: border-box; */

        /* 设置背景颜色 */

        background-color: forestgreen;

        /*设置一个背景图片*/

        background-image: url('./img/小图.webp');

        /*设置一个图片不重复*/

        background-repeat: no-repeat;

**<font style="color:#FF0000;">6:background-origin </font>**

                **<font style="color:#FF0000;">设置背景图片的偏移量计算的原点,配合偏移量使用的</font>**

                 **<font style="color:#FF0000;">padding-box  从内部距处开始计算</font>**

**<font style="color:#FF0000;">                 content-box  背景图片的偏移量从内容区处计算</font>**

**<font style="color:#FF0000;">                 border-box   从边框开始计算偏移量</font>**

   

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

**<font style="color:#FF0000;">7:background-size</font>**

  **<font style="color:#FF0000;">           设置图片的大小</font>**

            参数：

              **<font style="color:#FF0000;">第一个值：宽度</font>**

**<font style="color:#FF0000;">              第二个值：高度</font>**

                 如果只写一个，第二值，默认为auto

                 

              **<font style="color:#FF0000;">cover  图片的比例不变，将元素铺满，</font>**

**<font style="color:#333333;">图片将被缩放到足够大，以完全覆盖元素的背景区域，即使图片会被裁剪</font>**<font style="color:#333333;">‌</font>

**<font style="color:#FF0000;">              contain 图片比例不变，将元素完整显示</font>**

**<font style="color:#333333;">图片将被缩放到足够小，以完整显示在元素背景中，且不会被裁剪</font>**<font style="color:#333333;">‌</font>

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

**background**

            - 通过该属性可以同时设置所有背景相关的样式

            - 没有顺序的要求，谁在前谁在后都行

              也没有数量的要求，不写的样式就使用默认值

            **<font style="color:#FF0000;">-background-size要写在background-position后面</font>**

   

       background:brown url('./img/小图.webp')  **<font style="color:#FF0000;">center center/200px</font>** no-repeat; 

**雪碧图**

        图片整合技术（CSS-Sprite）

        优点：

          1 将多个图片整合为一张图片里，浏览器只需要发送一次请求，可以同时加载多个图片，

          提高访问效率，提高了用户体验。

          2 将多个图片整合为一张图片，减小了图片的总大小，提高请求的速度，增加了用户体验    

 

       雪碧图使用步骤

        **<font style="color:#FF0000;"> 1:先确定要使用的图标</font>**

**<font style="color:#FF0000;">         2:测量图标的大小</font>**

**<font style="color:#FF0000;">         3:根据测量结果创建一个元素</font>**

**<font style="color:#FF0000;">         4:将雪碧图设置为元素的背景</font>**

**<font style="color:#FF0000;">         5：设置一个偏移量以显示正确的图片</font>**

     

         管中窥豹

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

         * 当是hover状态时，希望图片可以向左移动

         */

         background-position:-285px 0;

       

      }

      .btn:active {

        /*

         * 当是active状态时，希望图片再向左移动

         */

         background-position:-490px 0;

      }

    </style>

  </head>

  <body>

    <!-- 创建一个超链接 -->

    <a class="btn" href="#"></a>

  </body>

</html>

** 渐变**

       渐变：通过渐变可以设置一些复杂的背景颜色，可以从实现一个颜色向其他颜色过渡的效果

           渐变是图片，通过 background-image设置

               可选值

               **<font style="color:#FF0000;">  1：linear-gradient(方位,)颜色1,颜色2  </font>**['ɡreidiənt]

                  **  线性渐变**，颜色沿着一条直线发生变化  

                        **<font style="color:#FF0000;">参数1:表示方位，（可选值，不写默认是to bottom）</font>**

**<font style="color:#FF0000;">                                (1)to left，to right, to bottom, to top</font>**

**<font style="color:#FF0000;">                                (2)xxxdeg 表示角度，度数，会更灵活</font>**

**<font style="color:#FF0000;">                                (3)turn 表示圈  .5turn</font>**

**<font style="color:#FF0000;">                        参数2:颜色1</font>**

**<font style="color:#FF0000;">                        参数3:颜色2</font>**

                       注意：

                           可以写多个颜色，默认情况下，颜色是均分占比的

                              也可以手动的指定渐变的分布情况

                            background-image:linear-gradient(red 50px,yellow) ;

                               颜色后直接跟占比

                **<font style="color:#FF0000;"> 2:repeating-linear-gradient()</font>**

**<font style="color:#FF0000;">                    可以平铺的线性渐变</font>**

                    background-image: repeating-linear-gradient(yellow 0px, red 50px);

                      参数跟linear-gradient是一样的

                    **<font style="color:#FF0000;">参数2-参数1，中间部分是渐变的颜色，拿总高度/差值，就是颜色重复出现的次数</font>**

     

   

            /* height: 400px; */

            /* ``````````````````````````````宽度``高度`水平偏移`垂直偏移 */

           background-image: radial-gradient(80px 20px at 120px 50px,yellow,blue);

       

   1:radial-gradient()   ['reidiəl] ['ɡreidiənt]

                 **经向渐变**（放射性的效果）

                    **<font style="color:#FF0000;">默认情况下，圆心是根据元素的形状来计算的</font>**

**<font style="color:#FF0000;">                               正方形-->圆形</font>**

**<font style="color:#FF0000;">                               长方形-->椭圆型</font>**

**<font style="color:#FF0000;">                    参数1:圆心的形状</font>**

**<font style="color:#FF0000;">                          （1）circle圆形，ellipse椭圆，</font>**

**<font style="color:#FF0000;">                          （2）设置的大小 at 位置==>像素1 像素2 at 0px  0px</font>**

**<font style="color:#FF0000;">            background-image: radial-gradient(100px 100px at 100px 0px,red,yellow);           </font>**

**<font style="color:#FF0000;">                    参数2:颜色1</font>**

**<font style="color:#FF0000;">                    参数3:颜色2</font>**

**<font style="color:#FF0000;">                    ······</font>**

         

**过渡transition**

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

   

           

**<font style="color:#FF0000;">过渡（transition）</font>**[træn'siʒən]

            -通过过渡可以指定一个属性发生变化时的切换方式

           -通过过渡可以创建一些非常好的效果，提升用户体验

**<font style="color:#FF0000;">属性（4个）</font>**

**<font style="color:#FF0000;">(1)transition-property </font>**['prɔpəti] **<font style="color:#FF0000;">指定执行过渡的属性</font>**，多个属性，使用逗号隔开，如果所有的属性都要过渡，就使用**<font style="color:#FF0000;">all</font>**关键词，大部分属性都支持过渡效果

                   注意过渡时，必须是从一个有效数值向另一个有效数值进行过渡

                   只要值可以计算的，就可以过渡

**<font style="color:#FF0000;">(2)transition-duration [</font>**djuə'reiʃən] 指定**<font style="color:#FF0000;">过渡效果的持续时间</font>**

                           时间的单位：s和ms   1s=1000ms

**<font style="color:#FF0000;">(3)transition-timing-function: ;过渡的时序函数</font>**

**<font style="color:#FF0000;">                         指定过渡的执行的方式</font>**

              **<font style="color:#FF0000;">可选值：ease  [i:z] 默认值，慢速开始，先加速，然后再减速</font>**

**<font style="color:#FF0000;">                         linear 匀速运动</font>**

**<font style="color:#FF0000;">                         ease-in 慢速开始，加速运动</font>**

**<font style="color:#FF0000;">                         ease-out 快速开始，减速运动</font>**

**<font style="color:#FF0000;">                         ease-in-out 先加速，后减速</font>**

**<font style="color:#FF0000;">                         steps()分布执行过渡效果</font>**

**<font style="color:#FF0000;">                            可以设置一个第二个值</font>**

**<font style="color:#FF0000;">                                end 表示动画在每个步骤结束时变化</font>**

**<font style="color:#FF0000;">                               start，表示动画在每个步骤开始时立即变化</font>**

**<font style="color:#FF0000;">(4)transition-delay: ;过渡效果的延迟</font>**，等待一段时间后执行过渡

**<font style="color:#FF0000;">transition：；可以同时设置过渡相关的所有属性，</font>**

**<font style="color:#FF0000;">        只有一个要求，如果要写延迟，则两个时间中,第一个写延迟，第二个写持续时间 </font>**   

         

            /* 过渡的函数 */

           /* transition-timing-function: steps(5,end); */

简写

             /* 2s持续的时间，1s延迟的时间 */

             transition: all 2s 1s steps(5);

**动画**  ** animation**

      动画和过渡类似，都是可以实现一些动态效果，不同的是过渡需要在某个属性发生变化时才能触发，动画可以自动触发动画

           

**<font style="color:#FF0000;">设置动画</font>**效果，必须**<font style="color:#FF0000;">先要设置一个关键帧</font>**，关键帧设置了动画每一个步骤

             **<font style="color:#FF0000;">@keyframes 动画名 {}</font>**

           

**<font style="color:#FF0000;">第一步：设置关键帧</font>**

      **<font style="color:#FF0000;">@keyframes move{</font>**

       **<font style="color:#FF0000;"> from{</font>**

          margin-left: 0;

        }

        **<font style="color:#FF0000;">to{</font>**

          margin-left: 500px;

        }

     **<font style="color:#FF0000;"> }</font>**

     

    **<font style="color:#FF0000;"> </font>**

**<font style="color:#FF0000;"> </font>**

**<font style="color:#FF0000;">第二步 设置box2的动画 animation</font>** [ˌænɪˈmeɪʃ(ə)n]

      .box2 {

        background-color: #bfa;

**<font style="color:#FF0000;"> 1:animation-name</font>**

**<font style="color:#FF0000;">           设置动画的名字，和@keyframs相对应</font>**

           animation-name:move; 

       

**<font style="color:#FF0000;">2:animation-duration</font>**

**<font style="color:#FF0000;">           动画执行时间 duration</font>** [djuə'reiʃən] 

           animation-duration: 2s; 

       

**<font style="color:#FF0000;">3:animation-delay</font>**

**<font style="color:#FF0000;">           动画执行延时 </font>**

        animation-delay:1s; 

       

**<font style="color:#FF0000;">4:animation-timing-function</font>**

**<font style="color:#FF0000;">           动画执行的方式</font>**

          animation-timing-function: linear; 

       

**<font style="color:#FF0000;">5:animation-iteration-count  [,itə'reiʃən]</font>**

**<font style="color:#FF0000;">            动画执行的次数</font>**

**<font style="color:#FF0000;">                可选值：次数（数字）</font>**

**<font style="color:#FF0000;">                          infinite   ['infinət] 无限循环 </font>**

         animation-iteration-count:2; 

       

**<font style="color:#FF0000;">6:animation-direction</font>**

**<font style="color:#FF0000;">             指定动画运行的方向</font>**

                 **<font style="color:#FF0000;">可选值</font>**

**<font style="color:#FF0000;">                    normal  默认值： 从from向to运行，每次都是这样</font>**

**<font style="color:#FF0000;">                    reverse  从to到from运行，每次都是这样</font>**

**<font style="color:#FF0000;">                    alternate  从from向to运行，重复执行动画时反向执行</font>**

**<font style="color:#FF0000;">                    alternate-reverse  从to向from运行，重复执行动画时反向执行</font>**

          animation-direction: alternate-reverse; 

       

**<font style="color:#FF0000;">7:animation-play-state</font>**

**<font style="color:#FF0000;">            设置动画的执行状态</font>**

**<font style="color:#FF0000;">                 可选值：running 默认值  动画执行</font>**

**<font style="color:#FF0000;">                           paused  动画暂停  </font>**           

            animation-play-state: running;

       

**<font style="color:#FF0000;">8:animation-fill-mode</font>**

**<font style="color:#FF0000;">           动画的填充模式</font>**

**<font style="color:#FF0000;">                可选值：</font>**

**<font style="color:#FF0000;">                  none默认值 动画执行完毕 元素回到原来的位置</font>**

**<font style="color:#FF0000;">                  forwards 动画执行完毕，会停止在动画结束的位置</font>**

**<font style="color:#FF0000;">                  backwards 动画延时等待时，元素就会处于开始位置</font>**

**<font style="color:#FF0000;">                  both 结合了forwards和backwards的特点</font>**

          animation-fill-mode: both;

简写模式

        animation: move 2s 2 2s alternate-reverse both;

**变形transform**

      .box1 {

        width: 200px;

        height: 200px;

        background-color: #bfa;

        transform: translateX(0px);

       

变形是通过css来改变元素的形状或位置

             -**<font style="color:#FF0000;">变形不会影响到页面的布局(只折腾自己)</font>**

             **<font style="color:#FF0000;">-transform: ;</font>**用来设置元素的变形效果 ,尽量变形写在一个transform里，不然下面再写一个，就会覆盖上面           

**<font style="color:#FF0000;">可</font>**选值：

**<font style="color:#FF0000;">-平移：translateX()沿着x轴方向平移</font>**

**<font style="color:#FF0000;">translateY()沿着y轴方向平移</font>**

**<font style="color:#FF0000;">       translateZ()沿着z轴方向平移</font>**

**<font style="color:#FF0000;">            -平移元素，可以是数字，可以是百分比，百分比是相对于自身计算的</font>**

         

     

需求 ： 使元素居中效果

      .box3 {

        background-color: red;

   第一种方式居中 这种方式适用于宽高确定，如果不确定，会自动调整宽高的大小

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

        **<font style="color:#FF0000;">left: 50%;</font>**

**<font style="color:#FF0000;">        top: 50%;</font>**

**<font style="color:#FF0000;">        transform: translateX(-50%) translateY(-50%);</font>**

       

      }

**需求二：作出****<font style="color:#FF0000;">卡片悬浮</font>****的效果**

      /* **平移可以结合transition 做出浮起来的效果，还不影响其他人 ***/

      .box5 {

        width: 220px;

        height: 220px;

        background-color: salmon;

     

        /* 过渡效果 */

      }

      .box5:hover {

      **<font style="color:#FF0000;"> transform: translateY(-3px);</font>**

**<font style="color:#FF0000;">       box-shadow:0 0 10px rgba(0, 0, 0,.5);</font>**

**<font style="color:#FF0000;">       transition: 0.5s ease;</font>**

      }

      .box1:hover{

        transform: translateX(50px);

        transition: 2s linear;

      }

   

**视距** ** perspective**

     **<font style="color:#FF0000;">perspective </font>**[pə'spektiv] **<font style="color:#FF0000;">设置当前网页的视距为800px</font>**，人眼距离网页的距离，一般不小于600px

     

z轴平移，调整元素在z轴的位置，正常情况下调整元素和人眼之间的距离，距离越大，元素离人越近 

                **<font style="color:#FF0000;">z轴平移</font>**属于立体效果（近大远小），默认情况下网页不支持透视

                  如果需要**<font style="color:#FF0000;">看到效果，必须要设置网页的视距</font>**

       

      body:hover .box1 {

        /*perspective(800px)  谷歌要直接设置在transform里面 */

       **<font style="color:#FF0000;"> transform: perspective(800px) translateZ(100px);</font>**

        box-shadow: 0 0 10px rgba(0,0, 0, .5);

        transition: 2s ease;

   

**旋转rotate**

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

             **<font style="color:#FF0000;">通过旋转可以使元素沿着x y或者z旋转指定的角度</font>**

            **<font style="color:#FF0000;">      rotateX() 沿着x轴旋转</font>**

**<font style="color:#FF0000;">                  rotateY() 沿着y轴旋转</font>**

**<font style="color:#FF0000;">                  rotateZ() 沿着z轴旋转</font>**

**<font style="color:#FF0000;">                    deg 度</font>**

**<font style="color:#FF0000;">                    turn 圈</font>**

           

            transform: rotateY(1turn);

          **<font style="color:#FF0000;">设置是否显示元素的背面 </font>**

**<font style="color:#FF0000;">            backface-visibility: ;</font>**

                 **<font style="color:#FF0000;">可选值：visible 默认值，显示</font>**

**<font style="color:#FF0000;">                        hidden  不显示</font>**

                        */

            backface-visibility:hidden;

        }

**缩放scale**

                   **<font style="color:#FF0000;">对元素进行缩放的函数</font>**

**<font style="color:#FF0000;">                     scale（）双方向缩放</font>**

**<font style="color:#FF0000;">                     scaleX() x轴方向缩放</font>**

**<font style="color:#FF0000;">                     scaleY()  y方向缩放</font>**

**<font style="color:#FF0000;">                     值是倍数</font>**

**<font style="color:#FF0000;">默认效果1，小于1，缩小，大于1放大</font>**

            		**<font style="color:#FF0000;">transform: scale(1.2);</font>**

         

         **<font style="color:#FF0000;"> 			变形的原点  默认值center</font>**

            **<font style="color:#FF0000;"> 		transform-origin: 30px 30px</font>**; 

           

           

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

**flex(弹性盒子，伸缩盒)**

             -是css中的又一种布局手段，它主要用来**<font style="color:#FF0000;">代替浮动</font>**来完成页面的布局

             -flex可以使元素具有弹性，让**<font style="color:#FF0000;">元素可以根据页面的大小的改变而改变</font>**

             -弹性容器

                -要使用弹性盒，必须先将一个元素设置为弹性容器

                -通过display来设置弹性容器

                    **<font style="color:#FF0000;">display:flex  设置块级弹性容器</font>**

                   **<font style="color:#FF0000;"> display:inline-flex 设置为行内的弹性容器</font>**

             -弹性元素

                -**<font style="color:#FF0000;">弹性容器的直接子元素是弹性元素（弹性项）</font>**

             注意：一个元素可以同时是弹性容器和弹性元素

         

        /* 将ul设置为弹性容器 */

        display: flex;

        flex-direction:column-reverse;

      ** ****一:弹性容器的属性**

            **<font style="color:#FF0000;">1:flex-direction    2:flex-wrap </font>**

**<font style="color:#FF0000;">            3:flex-flow   4:justify-content</font>**

**<font style="color:#FF0000;">            5:align-items    6:align-content</font>**

                 

            **<font style="color:#FF0000;">1:flex-direction: ; 指定容器中弹性元素的排列方式</font>**

             **<font style="color:#FF0000;">可选值：</font>**

**<font style="color:#FF0000;">                row  默认值，弹性元素在容器中水平排列（左向右）</font>**

**<font style="color:#FF0000;">                    主轴-自左向右</font>**

**<font style="color:#FF0000;">                row-reverse  弹性元素在容器中反向水平排列（右向左）</font>**

**<font style="color:#FF0000;">                    主轴-自右向左</font>**

**<font style="color:#FF0000;">                column  弹性元素纵向排列（自上向下）</font>**

**<font style="color:#FF0000;">                    主轴-自上向下</font>**

**<font style="color:#FF0000;">                column-reverse 弹性元素纵向排列（自下向上）</font>**

**<font style="color:#FF0000;">                    主轴-自下向上</font>**

           

            **<font style="color:#FF0000;">主轴：弹性元素的排列方向称为主轴</font>**

**<font style="color:#FF0000;">            侧轴：与主轴垂直方向的称为侧轴</font>**

**<font style="color:#FF0000;">2: flex-wrap: ;设置弹性元素是否在弹性容器中是否自动换行</font>**

                  **<font style="color:#FF0000;">可选值： </font>**

**<font style="color:#FF0000;">                    nowrap 默认值，元素不会自动换行</font>**

**<font style="color:#FF0000;">                    wrap 元素沿着辅轴方向自动换行   </font>**

**<font style="color:#FF0000;">                    wrap-reverse 元素沿着辅轴反方向换行    </font>**        

   

            /* flex-wrap:wrap-reverse; */

**<font style="color:#FF0000;">3:flex-flow:wrap和direction的简写属性，且没有顺序要求</font>**

**<font style="color:#FF0000;">                默认值 row nowrap</font>**

     

            /* flex-flow: row nowrap; */

           

**<font style="color:#FF0000;">4:justify-content 如何分配主轴上的空白空间（主轴上的元素如何排列）</font>**

**<font style="color:#FF0000;">                可选值：</font>**

**<font style="color:#FF0000;">                    flex-start 元素沿着主轴起边排列</font>**

**<font style="color:#FF0000;">                    flex-end 元素沿着主轴终边排列</font>**

**<font style="color:#FF0000;">                    center  元素居中排列</font>**

**<font style="color:#FF0000;">                    space-around 空白分布到元素的两侧</font>**

**<font style="color:#FF0000;">                    space-between 空白均匀分布到元素间</font>**

**<font style="color:#FF0000;">                    space-evenly 空白分布到元素的单侧（兼容性差一些）  </font>**

      /*1: flex-direction: row; */

        /*2: flex-wrap:wrap-reverse ; */

        /* 3: flex-flow:row wrap;  */

        flex-flow: row wrap;

        /*4: justify-content:space-around; */

       

**<font style="color:#FF0000;">5: align-items 在辅轴上如何对齐-元素间的关系</font>**

**<font style="color:#FF0000;">                  可选值：</font>**

**<font style="color:#FF0000;">                     stretch  默认值，将同一行元素的长度设置为相同的值</font>**

**<font style="color:#FF0000;">                     flex-start 元素不会拉伸， 沿着辅轴起边对齐</font>**

**<font style="color:#FF0000;">                     flex-end   元素不会拉伸， 沿着辅轴终边对齐</font>**

**<font style="color:#FF0000;">                     center  居中对齐</font>**

**<font style="color:#FF0000;">                     baseline 基线对齐（用的不对）  </font>**      

                     

        align-items:center;

        /*需求：在弹性盒子里，元素时间正中间居中对齐 

            */

**<font style="color:#FF0000;">6: align-content: ;辅轴空白空间的分布 </font>**

**<font style="color:#FF0000;">                  可选值：</font>**

**<font style="color:#FF0000;">                      flex-start 元素沿着辅轴起边排列</font>**

**<font style="color:#FF0000;">                       flex-end 元素沿着辅轴终边排列</font>**

**<font style="color:#FF0000;">                       center  元素居中排列</font>**

**<font style="color:#FF0000;">                       space-around 空白分布到元素的两侧</font>**

**<font style="color:#FF0000;">                       space-between 空白均匀分布到元素间</font>**

**<font style="color:#FF0000;">                       space-evenly 空白分布到元素的单侧（兼容性差一些）</font>**  

                   */

          /* align-content:flex-start; */

      }

           

**二：弹性元素的属性 **

**<font style="color:#FF0000;">                align-self</font>**

**<font style="color:#FF0000;">                flex-grow  flex-shrink   </font>**

**<font style="color:#FF0000;">                order  **flex-basis         </font>**

**<font style="color:#FF0000;">                ***flex   */</font>**

       

**<font style="color:#FF0000;"> 1:用来覆盖当前弹性元素上的align-items */</font>**

**<font style="color:#FF0000;">        align-self:flex-start;</font>**

     

 

           

**<font style="color:#FF0000;">2.flex-grow: ;指定弹性元素的伸展的系数</font>**

**<font style="color:#FF0000;">          -当父元素有多余的空间的时候，子元素如何伸展，0 默认值 是不伸展</font>**

**<font style="color:#FF0000;">                -父元素的剩余空间，会按照比例进行分配</font>**

**<font style="color:#FF0000;">            </font>**

1. **<font style="color:#FF0000;">flex-shrink: ; 指定弹性元素的收缩系数</font>**

**<font style="color:#FF0000;">          -当父元素中的空间不足以容纳所有的子元素时，如果对子元素进行收缩，</font>**

**<font style="color:#FF0000;">                  默认值，按照同比例1:1的比例一起缩放，也可分别设置</font>**

     

**<font style="color:#FF0000;">4. flex-basis 元素的基础长度，指定的是元素在主轴上的基础长度，跟你设置的宽高会冲突</font>**

**<font style="color:#FF0000;">                     如果主轴是横向的，则该值指定的就是元素的宽度</font>**

**<font style="color:#FF0000;">                     如果主轴是纵向的，则该值指定的是元素的高度</font>**

**<font style="color:#FF0000;">                -默认值是auto，表示参考元素自身的高度或宽度</font>**

**<font style="color:#FF0000;">                -如果传递了一个具体的数值，则以该值为准 *</font>**

**<font style="color:#FF0000;">        </font>**

**<font style="color:#FF0000;">5.  flex：可以设置弹性元素所有的三个样式</font>**

**<font style="color:#FF0000;">                 flex: 增长 缩减 基础</font>**

**<font style="color:#FF0000;">                      initial /ɪˈnɪʃl/  'flex: 0 1 auto' 弹性元素不增，可减</font>**

**<font style="color:#FF0000;">                      auto     'flex: 1 1 auto'弹性元素可增，可减</font>**

**<font style="color:#FF0000;">                      none     'flex:  0 0 auto'弹性元素没有弹性</font>**

**<font style="color:#FF0000;">                 */</font>**

**<font style="color:#FF0000;">        </font>**

**<font style="color:#FF0000;">        </font>**

1. **<font style="color:#FF0000;">order 决定弹性元素的排列顺序 越小越在之前 */</font>**

**<font style="color:#FF0000;">        order: 2;</font>**

**<font style="color:#FF0000;">      }</font>**

**<font style="color:#FF0000;">      li:nth-child(2) {</font>**

**<font style="color:#FF0000;">        background-color: pink;</font>**

**<font style="color:#FF0000;">        /* flex-grow: 3; */</font>**

**<font style="color:#FF0000;">        /* 按照1:1的空间压缩，数值比1大收缩 */</font>**

**<font style="color:#FF0000;">        /* flex-shrink:3; */</font>**

**<font style="color:#FF0000;">        /* flex-basis:400px; */</font>**

**<font style="color:#FF0000;">        order: 3;</font>**

**<font style="color:#FF0000;">       </font>**

**<font style="color:#FF0000;">      </font>**

**移动端**

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

**设备独立像素简称DIP或DP,又称屏幕密度无关像素**

设备独立像素于物理像素关系

**普通屏幕下1个设备独立像素对应1个物理像素**

**高清屏幕下1个设备独立像素对应N个物理像素**

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

**视口(viewport)就是浏览器显示页面内容的屏幕区域**

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

<meta name='viewport'content='width=device-width' /> 

(五)、meta标签设置

<!--**<font style="color:#FF0000;">设置完美视口大小</font>**

**<font style="color:#FF0000;">device-width视口宽度和设备保持一致</font>**

**<font style="color:#FF0000;">initial-scale表示页面的初始缩放值,==>屏幕宽度(设备独立像素)布</font>**

**<font style="color:#FF0000;">局视口宽度</font>**

**<font style="color:#FF0000;">user-scalable是否允许用户缩放</font>**

**<font style="color:#FF0000;">maxinum-scale=1.0,最大允许缩放比例</font>**

**<font style="color:#FF0000;">mininum-scale=1.0,最小允许缩放比例</font>**

**<font style="color:#FF0000;"><meta name="viewport"</font>**

**<font style="color:#FF0000;">content="</font>**

**<font style="color:#FF0000;">width=device-width,</font>**

**<font style="color:#FF0000;">initial-scale=1.0,</font>**

**<font style="color:#FF0000;">user-scalable=no,</font>**

**<font style="color:#FF0000;">maxinum-scale=1.0,</font>**

**<font style="color:#FF0000;">mininum-scale=1.0 "</font>** />

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

**<font style="color:#FF0000;">二倍图</font>**

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

**<font style="color:#FF0000;">响应式设计原则(面试题)</font>**

**<font style="color:#FF0000;">渐近增强</font>**

**<font style="color:#FF0000;">基本需求==>更好体验</font>**

**<font style="color:#FF0000;">优雅降级</font>**

**<font style="color:#FF0000;">完备功能==>向下兼容</font>**

移动优先的响应式布局采用的是渐进增强原则

二:移动开发的选择

由于移动端设备的屏幕尺寸大小不一,会出现:同一个元素,在两个不同的手

机上显示效果不一样(比例不同)。要想让同一个元素在不同词设备上,显示效

果一样,就需要适配,无论采用何种适配方式,中心原则永远是等比

**<font style="color:#FF0000;">(二)、移动端开发几个注意点</font>**

**<font style="color:#FF0000;">1、去除默认样式,可以用normalize.css(默认样式不去除,处理各浏览器对</font>**

**<font style="color:#FF0000;">默认样式的不同解析),resize.css(直接把所有的默认样式都去掉,要用,你</font>**

**<font style="color:#FF0000;">就自己重设)</font>**

**<font style="color:#FF0000;">2、盒子模型采用box-sizing的属性,border-box属性值</font>**

**<font style="color:#FF0000;">3、超链接点击高亮背景的效果需要去除</font>**

**<font style="color:#FF0000;">-webkit-tap-highlight-color:transparent;</font>**

三:移动端常见实现方式

1、响应式页面兼容移动端

百分比,flex,rem,媒体查询,

**<font style="color:#FF0000;">媒体查询(meidia Query):</font>**

**<font style="color:#FF0000;">作用:</font>**

**<font style="color:#FF0000;">1.使用@media查询,可以针对不同的媒体类型定义不同的样式</font>**

**<font style="color:#FF0000;">2.@media可以针对不同的屏幕尺寸设置不同的样式</font>**

**<font style="color:#FF0000;">3.当重制浏览器大小的过程中,页面也会根据浏览器的宽度和高度重新渲染页面</font>**

**<font style="color:#FF0000;">语法:</font>**

**<font style="color:#FF0000;">@media媒体类型 关键字 (媒体特性){css}</font>**

**<font style="color:#FF0000;">媒体类型(可以同时用多个媒体类型,用逗号隔开,这样他们之间就是或的关系</font>**

**<font style="color:#FF0000;">all所有设备</font>**

**<font style="color:#FF0000;">print打印设备或打印预览</font>**

**<font style="color:#FF0000;">screen带屏幕的设备(电脑,手机)</font>**

**<font style="color:#FF0000;">speech屏幕阅读器</font>**

**<font style="color:#FF0000;">关键字and not only来连接</font>**

**<font style="color:#FF0000;">将媒体类型或多个媒体特性连接到一起作为媒体查询的条件</font>**

**<font style="color:#FF0000;">and:可以将多个媒体特性连接到一起,相当于且的意思</font>**

**<font style="color:#FF0000;">not:排除某个媒体类型,相当于"非"的意思,可以省略</font>**

**<font style="color:#FF0000;">only:指定某个特定的媒体类型,可以省略</font>**

**<font style="color:#FF0000;">媒体特性(必须要有小括号)</font>**

**<font style="color:#FF0000;">width页面可见宽度</font>**

**<font style="color:#FF0000;">max-width视口的最大宽度(视口小于指定宽度时就生效,小于等于xxxpx)</font>**

**<font style="color:#FF0000;">min-width视口的最小宽度(视口大于指定宽度时就生效)</font>**

**<font style="color:#FF0000;">max-height最大高度</font>**

**<font style="color:#FF0000;">min-height最小高度</font>**

**<font style="color:#FF0000;">orientation:landscape横屏</font>**

**<font style="color:#FF0000;">orientation:portrait 竖屏</font>**

常用的断点

样式切换的分界点,我们称其为断点,也就是网页的样式

bootstarp框架

[https://www.bootcss.com/](https://www.bootcss.com/)

2、单独制作移动端页面

百分比,flex,rem,vw

1>**<font style="color:#FF0000;">流式布局</font>**

**<font style="color:#FF0000;">就是百分比布局</font>**,也称为非固定像素布局

通过盒子的宽度设置成百分比来根据屏幕的宽度来进行伸缩,不受固定像素的限制,内

容向两侧填充,主要是设置宽度

一般配合以下属性使用,免得盒子里面的元素,被挤下来

max-width最大宽度(max-height最大高度)

min-width最小宽度(min-height最小高度)

2>、**<font style="color:#FF0000;">flex弹性布局</font>**

rem

(1)、**<font style="color:#FF0000;">rem单位</font>**

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

(3)、**<font style="color:#FF0000;">flexible.js</font>**

1、**<font style="color:#FF0000;">手机淘宝团队出得移动端适配库,它的原理是将当前设备(设备独立像素=css像</font>**

**<font style="color:#FF0000;">素)划分为10等份,但不同设备下,比例还是一致的。</font>**

**<font style="color:#FF0000;">只要确定当前html文字大小就可以了.</font>**

4>、混合布局(主流)

综上所有,一起使用,选取一种主要技术选型,其他技术为辅助(推荐

rem适配一移动端开发的步骤

第一步:拿到多大的设计稿,将root font size改成:设计稿的大JV10

第二步:引入flexable.js,会动态的去修改html的字体大小

第三步:正常根据设计稿的大小去开发,将所有的px值换算为rem的值



5>、vw、vh(未来的趋势)

**<font style="color:#FF0000;">vw也是百分比,只不过这个百分比只参考设备视口</font>**

**<font style="color:#FF0000;">vw (Viewport's width):1vw等于视口宽度的1%</font>**

**<font style="color:#FF0000;">vh (Viewport's height):1vh等于视口高度的1%</font>**

vmin:vw和vh中的较小值

vmax:选取vw和vh中的最大值

(1)、750的设计稿:html{font-size:13.3333vw}

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

(2)、1080设计稿:html{font-size:9.259vw}

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

将html{font-size:xxxvw}

2、去更改root font size,更改1rem=100px

3、根据设计稿的大小,将px值写成rem

总结:

**<font style="color:#FF0000;">都是一个绝对值为参考值</font>**

**<font style="color:#FF0000;">flexable.js是以设备独立像素为绝对值,去算rem的值</font>**

**<font style="color:#FF0000;">vw是设备的视口的宽度为绝对值,去算rem的值</font>**

**<font style="color:#FF0000;">最终都是把设计稿中的px换算成rem</font>**

**<font style="color:#FF0000;">less是一门css的预处理语言</font>**

            -less是一个css的增强版，通过less可以编写更少的代码，实现更强大的样式

            -less中添加了许多的新特性，像对变量的支持，对mixin的支持。。。。

            -less的语法大体上和css语法一致，但less中添加了许多对css的拓展

      所以浏览器无法直接执行less代码，要执行必须将less转换为css，然后由浏览器执行

         **<font style="color:#FF0000;">   -less即可以在客户端上运行，也可以借助Node.js在服务端运行</font>**

    <!-**<font style="color:#FF0000;">-第二种 easy less 引入我的css --></font>**

    <!-- <link rel="stylesheet" href="./less语法.css"> -->

    <!-- **<font style="color:#FF0000;">第三种外部引入less --></font>**

    <link rel="stylesheet/less" type="text/less" href="./less语法.less">

    <!**<font style="color:#FF0000;">-- 第一种方式直接在内容写，要引入less.js --></font>**

    <!-- <style type="text/less">

     

    </style> -->

 

  <!-- 第三种引入方法 -->

  <!--运行时编译 -->

  <script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"></script>

  <!-- vscode 插件 Easy LESS 插件 -->

 

**<font style="color:#FF0000;">// 定义变量1</font>**

**<font style="color:#FF0000;">@color:yellow;</font>**

**<font style="color:#FF0000;">@width:300px;</font>**

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

**<font style="color:#FF0000;">//声明一个变量</font>**

**<font style="color:#FF0000;">@sector:#wrap; //选择器</font>**

**<font style="color:#FF0000;">@w:width; //属性名</font>**

**<font style="color:#FF0000;">@h:height;</font>**

**<font style="color:#FF0000;">@{sector}{ //选择器这里必须加上花括号包裹</font>**

**<font style="color:#FF0000;">    @{w}:@width;</font>**

    @{h}:@height;

    border:@border;

    background-color:@color;

    margin:0 auto;

}

@url:"../img/img1.png";

// .warp{

**<font style="color:#FF0000;">background: url(../img.png) no-repeat;</font>**

 border: 1px solid @color;

// }

.@{selector}{

    width: 100px;

    height: 100px;

   **<font style="color:#FF0000;"> background: url(@url) no-repeat;</font>**

    border: 1px solid @color;

}

@var: 0px;

**<font style="color:#FF0000;">// 变量是块级作用域</font>**

.class {

  @var: 10px;

    .brass {

      @var: 20px;

      width: @var;  //30 **<font style="color:#FF0000;"> 读完块级作用域后，再去确定变量值</font>**

      @var: 30px; 

    }

 **<font style="color:#FF0000;"> width: @var;  //10</font>**

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

       **<font style="color:#FF0000;"> // &表示上一级选择器</font>**

        &:hover{

            background-color:tomato;

        }

**<font style="color:#FF0000;">//带参数的混合 </font>**

**<font style="color:#FF0000;">// 行参</font>**

**<font style="color:#FF0000;">.base(@w,@h,@color</font>**){

    width: @w;

    height: @h;

    background-color: @color;

    margin-bottom: 10px

}

// **<font style="color:#FF0000;">以下传入实参</font>**

#box1{

  **<font style="color:#FF0000;">  .base(100px,100px,red);</font>**

}

#box2{

    .base(200px,200px,pink);

}

**<font style="color:#FF0000;">//带参数的混合 </font>**

**<font style="color:#FF0000;">// 行参</font>**

**<font style="color:#FF0000;">.base(@w:100px,@h:100px,@color:yellow)</font>**{

    width: @w;

    height: @h;

    background-color: @color;

    margin-bottom: 10px

}

**<font style="color:#FF0000;">// 以下传入实参</font>**

#box1{

   **<font style="color:#FF0000;"> .base(100px,100px,red);</font>**

}

#box2{

    .base(200px,200px,pink);

}
