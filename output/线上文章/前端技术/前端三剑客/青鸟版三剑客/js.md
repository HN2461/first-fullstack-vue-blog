---
title: "js"
slug: "javascriptes6-js-d939e278"
summary: ""
category: "青鸟版三剑客"
tags: []
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0da"
originalSlug: "javascriptes6-js-d939e278"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
## 一、计算机基础
### 1、编程语言
编程就是计算机为了解决某个问题，而使用某种程序设计语言编写程序设计语言编写程序代码，并最终得到结果的过程

计算机程序：就是计算机所执行的一系列的指令集合，而程序全部都是用我们所掌握的语言来编写的。

注意：任何能够执行代码的设备都是计算机，可能是智能手机、ATM机、黑莓PI、服务器等

计算机语言指用于人与计算机之间通讯的语言，它是人与计算机之间传递信息的媒介

**计算机语言的种类非常多，总体来说分为三类：机器语言，汇编语言，和高级语言三大类**

<font style="color:#F33232;">机器语言</font>是计算机最终执行的语言，它由0和1组成的二进制数，二进制数是计算机语言的基础

<font style="color:#F33232;">汇编语言</font>和机器语言实质是相同的，都是对硬件操作，只不过指令采取了英文缩写的标志符，容易记忆和识别

<font style="color:#F33232;">高级语言</font>主要相对于低级语言而言的，它并不是特指某一种具体的语言，而是包括很多编程语言，常用的高级语言像C语言，java，C#，PHP，JS，go语言等

### 2、计算机基础
计算机的组成：

硬件：

输入设备（鼠标、键盘、手写板、摄像头等）

输出设备（显示器、打印机、投影仪等），

CPU（负责处理数据与运算）

硬盘和内存（负责存储数据，硬盘永久存储数据，内存暂时存储数据）

软件：系统软件（windows、linux、macOS），应用软件（浏览器、QQ、VSCode、Sublime、Word）

数据存储

计算机内部使用二进制0和1表示数据，所有的数据、所有的程序包含操作系统都是以二进制的形式放在硬盘和内存中的

数据的存储单位

bit<byte<kb<Gb<Tb<····

位（bit）：1bit可以保存一个0或1（最小的存储单位）

字节（byte）：1B=8b

千字节（kb）：1kb=1024b

兆字节（mb）：1mb=1024kb

吉字节（gb）：1gb=1024mb

太字节（tb）：1tb=1024gb

## 二、ES核心
## 第一节、初始JS
### （一）、js的简介
#### 1、JS是什么
JS历史：JS是布兰登·艾奇（Brendan Eich）花了10天的时间设计的，由最初的liveScript改名为JavaScript；

**<font style="color:#FF0000;">JS是运行在客户端的脚本语言；</font>**

**<font style="color:#FF0000;">脚本语言：不需要编译，运行过程中由js解释器（js引擎）逐行来进行解释并执行</font>**；

**<font style="color:#FF0000;">JS可以基于Node.js技术进行服务器端编程</font>**

#### 2、JS能做什么
表单动态校验（密码强度监测）、网页特效、服务端开发（Node.js）、桌面程序（Electron）、App、控制硬件-物联网、游戏开发

#### 3、浏览器执行JS
**<font style="color:#FF0000;">浏览器分成两部分：渲染引擎和JS引擎</font>**

渲染引擎：用来**<font style="color:#FF0000;">解析html和css</font>**，所称**<font style="color:#FF0000;">内核</font>**

JS引擎：也称为JS解释器。用来**<font style="color:#FF0000;">读取</font>**网页中的**<font style="color:#FF0000;">JavaScript代码</font>**，对其处理后**<font style="color:#FF0000;">运行</font>**

浏览器本身并不会执行JS代码，而是通过设置JavaScript引擎（解释器）来执行JS代码。JS引擎执行代码时逐行解释每一句源码（转成机器语言），然后由计算机去执行。所以JS语言归为脚本语言，会逐行解释执行

#### 4、JS的组成
js包含三个部分：

（1）、ECMAScript （ JavaScript的核心 是规范标准）

——描述了语言的**<font style="color:#FF0000;">基本语法</font>**(var、for、if、array等)和数据类型(数字、字符串、布尔、函数、对象(obj、[]、{}、null)、未定义)。

——只学习基础语法，做不了常用的网页交互效果，为后面的内容打基础，做铺垫

（2）、DOM （Document Object Model文档对象模型，可以去操作网页）

<font style="color:#F33232;">Document(文档)</font>

指的是XML和HTML的页面，当你创建一个页面并且加载到Web浏览器中，

DOM就在幕后悄然而生，它会把你编写的网页文档转换成一个文档对象。

<font style="color:#F33232;">Object(对象)</font>

js对象大致可以分为以下三种：

用户定义对象，例如：var obj = {}

内置对象，无需创建，可直接使用，例如：Array、Math和Data等

宿主对象，浏览器提供的对象，例如:window、document

DOM中主要关注的就是document， document对象的主要功能就是处理网页内容。

<font style="color:#F33232;">Model（模型）</font>代表着加载到浏览器窗口的当前网页，可以利用JavaScript对它进行读取

（3）、BOM 浏览器对象模型，操作浏览器

#### 5、js输入输出语句
（1）、js注释

多行注释，注释中的内容不会被执行，但可以在源代码中查看

默认的快捷键: Ctrl+shift+/

单行注释，// 只对后面的内容有效 

默认快捷键：ctrl+/

注释作用： 养成良好的编写注释的习惯，可以通过注释对代码进行一些调试

（2）、输入输出语句

为了方便信息的输入输出，JS中提供了一些输入输出语句

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      // 1、控制浏览器</font>**<font style="color:#FF0000;">弹出一个警告框</font>**

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">alert</font>**<font style="color:#595959;"> 警告  告诉浏览器弹出一个警告框</font>

<font style="color:#595959;">      // alert("这是我的第一行js代码");</font>

<font style="color:#595959;">      //2、</font>**<font style="color:#FF0000;">让计算机在页面中输出一个内容</font>**

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">document.write("")</font>**<font style="color:#595959;">;可以向body中输出一个内容</font>

<font style="color:#595959;">      // document.write("看我出不出来~~~");</font>

<font style="color:#595959;">      // 3、</font>**<font style="color:#FF0000;">向控制台输出一个内容</font>**

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">console.log("")</font>**<font style="color:#595959;">的作用是向控制台输出一个内容</font>

<font style="color:#595959;">      // console.log("你猜我在哪里出来呢");</font>

<font style="color:#595959;">      // 4、</font>**<font style="color:#FF0000;">用户输入数据</font>**

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">window.prompt("请输入数字");</font>**

<font style="color:#595959;">      //js代码是从上到下，一行行执行的，</font>**<font style="color:#FF0000;">有执行顺序</font>**

<font style="color:#595959;"> </script></font>

配置代码片段 设置---用户代码片段--JavaScript.json文件

#### 6、js书写位置（4种位置）
（1）、第一种方式： 

可以将js 代码编**<font style="color:#FF0000;">写到标签的事件属性中</font>**，例如onclick属性中，当我们点击按钮时，js代码才会执行

<font style="color:#595959;"><button onclick="alert('你点我了')">点我一下</button></font>

<font style="color:#595959;"><!-- 可以将js代码写在超链接的href属性中，这样当点击超链接时，会执行js代码 --></font>

<font style="color:#595959;"><a href="JavaScript:alert('你也点我了');">你也点我一下</a></font>

注意：

写在标签的属性中，但是他们属于结构与行为耦合，不方便维护，不推荐使用

（2）、第二种方式：

可以将js代码编**<font style="color:#FF0000;">写到body位置，script标签里</font>**

<font style="color:#595959;"><body></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">    alert("我是script标签中内部的代码");</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">    </body></font>

（3）、第三种方式：

可以将**<font style="color:#FF0000;">js代码编写到头部位置，script标签里</font>**

<font style="color:#595959;"><head></font>

<font style="color:#595959;">      <meta charset="UTF-8" /></font>

<font style="color:#595959;">      <title>JS代码书写位置</title></font>

<font style="color:#595959;">      <script></font>

<font style="color:#595959;">      alert("我是script标签中内部的代码");</font>

<font style="color:#595959;">      </script></font>

<font style="color:#595959;"></head></font>

（4）、第四种方式

可以将js编写到**<font style="color:#FF0000;">外部js文件</font>**中，然后**<font style="color:#FF0000;">通过script标签引入</font>** 

优势：可以在不同的页面中同时引用，也可以利用到浏览器的缓存机制，推荐使用方式

注意：这个script标签一旦用于引入外部文件了，就不能编写代码了，即使编写了，浏览器也不能识别

<font style="color:#595959;"><head></font>

<font style="color:#595959;">      <!-- 第四种方式--></font>

<font style="color:#595959;">      <script src="./script.js"></script></font>

<font style="color:#595959;">      </head></font>

#### 7、js基本语法
（1）、js中严格**<font style="color:#FF0000;">区分大小写</font>**

（2）、js中每一条**<font style="color:#FF0000;">语句以分号（;）结尾</font>** 

-如果不写分号，浏览器会自动添加，但会消耗一些系统资源

而且有时候，浏览器会加错分号，所以在开发中分号基本都写

（3）、js中会**<font style="color:#FF0000;">自动忽略多个空格和换行</font>**，所以我们可以利用空格和换行对代码进行格式化 

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      console.log("控制台输出");</font>

<font style="color:#595959;">      // Console.log('控制台输出');  不能执行</font>

<font style="color:#595959;"></script></font>

### （二）、js变量和字面量
#### 1、字面量：
字面量是在源代码中一个固定值的表示法，通俗来说，字面量一些不可更改的，比如：1 2 3 4 .....，字面量都是可以直接使用的，但是我们一般都不会直接使用字面量   **//见名知意的符号**

#### 2、变量：
#### （1）什么是变量
**<font style="color:#FF0000;">变量</font>**就是用来**<font style="color:#FF0000;">存放数据的容器</font>**。可以用来**<font style="color:#FF0000;">保存字面量</font>**，而且变量的值可以任意改变，变量更加方便我们使用，所以开发中，都是通过变量去保存一个字面量，并且可以通过变量对字面量进行描述

我们可以通过变量名获取数据，甚至数据可以修改

变量的**<font style="color:#FF0000;">本质</font>**是**<font style="color:#FF0000;">程序在内存中申请的一块用来存放数据的空间</font>**

#### （2）声明变量
声明变量：用**<font style="color:#FF0000;">var</font>**关键字，**<font style="color:#FF0000;">声明变量</font>**，使用该关键字后，计算机会自动给这个变量分配空间

var name； //声明一个名为name的变量，可通过变量名来访问内存中分配的空间

赋值：

name='张三'；// = 用来把右边的值赋给左边的变量空间中，代表赋值的意思

输出结果：

console.log(name);

#### （3） 声明初始化
<script>

//**<font style="color:#FF0000;">声明跟赋值同时进行</font>**

var b = 789;

</script>

#### （4）变量语法注意
##### 1>更新变量：
一个变量变重新赋值后，它原有的值就会被覆盖，**<font style="color:#FF0000;">变量值将以最后一次赋值为准</font>**

##### 2>声明多个变量 
只需要写一个var，**<font style="color:#FF0000;">多个变量</font>**名之间使**<font style="color:#FF0000;">用</font>**英文**<font style="color:#FF0000;">逗号隔开</font>** 

var age = 80,

height = 180;

console.log(age, height);//80,180

##### 3>声明特殊：
**<font style="color:#FF0000;">var c;    1、只声明不赋值，输出undefined</font>**

console.log(c);//undefined

**<font style="color:#FF0000;">2、输出未声明变量，报错</font>**

console.log(d);//报错

**<font style="color:#FF0000;">3、 未使用var声明，浏览器纠错，默认使用</font>**

e=11;console.log(e);//11

#### （5）变量的命名规范（标志符规范）
在js中所有的可以由我们自主命名的，都可以称为标识符， 例如：变量名、函数名、属性名都属于标识符

命名一个标识时需要遵守如下的

规则（必须遵守）

a: 标识符号可以含有**<font style="color:#FF0000;">字母、数字、$、_ </font>**

b: 标识符**<font style="color:#FF0000;">不能以数字开头</font>**

c: 标识符**<font style="color:#FF0000;">不能是</font>**ES中的**<font style="color:#FF0000;">关键字或者保留字</font>** eg；var if class static

规范（可做可不做）：

a: 标识符一般都采用驼峰命名法

首字母小写，每个单词的开头字母大写，其余字母小写 eg:helloWorld xxxYyyZzz

b: js底层保存标识符，包含中文，但是千万不要这么用。

c: 变量名字要见名知意









## （一）、数据类型
### 1、为什么需要数据类型
在计算机中，不同的数据所需占用的存储空间是不同的，为了便于把数据分成所需内存大小不同的数据，**<font style="color:#FF0000;">充分利用存储空间</font>**，于是定义了不同的数据类型。简单来说，数据类型就是数据的类别型号

### 2、变量的数据类型
**<font style="color:#FF0000;">JS是一种弱类型或者动态语言</font>**。这就意味着不用提前声明变量的类型，在程序运行过程中，变量的数据类型是根据等号右边的值来自动确定的。

**<font style="color:#FF0000;">JS拥有动态类型，同时也意味着相同的变量可用作不同的类型</font>**

### <font style="color:#000000;">3、数据类型的分类</font>
<font style="color:#000000;">简单（一般）数据类型（Number、String、Boolean、Udefined、Null）</font>

<font style="color:#000000;">复杂（引用）数据类型（Object）</font>

<font style="color:#000000;">后续还会再增加别的数据类型....</font>

## <font style="color:#000000;">（二）、简单数据类型</font>
| 简单数据类型 | 解释说明 | 默认值 |
| --- | --- | --- |
| Number | 数字型，包含整数值和浮点型，如12，1.2 | 0 |
| Bollean | 布尔值类型，true、false，等价于1、0 | false |
| String | 字符串类型，如'王二麻'，字符串都带引号 | '' |
| Undefined | 未定义，例如： var a；此时a=undefined | undefined |
| Null | 空值；例如：var a=null | null |


#### 1、数字型 Number
（1）、数字型进制

常见的进制有二进制、八进制、十进制、十六进制，在JS中，**<font style="color:#FF0000;">八进制前面加0，十六进制前面加0x</font>**

（2）、数字型范围（JS中数值的最大值和最小值）

**<font style="color:#FF0000;">Number.MAX_VALUE </font>**     //1.7976931348623157e+308 

如果使用Number表示的数字超过了最大值，则会返回一个**<font style="color:#FF0000;">Infinity</font>** 表示**<font style="color:#FF0000;">正无穷</font>**

使用typeof 检查infinity也会返回number

**<font style="color:#FF0000;">Number.MIN_VALUE</font>** **<font style="color:#FF0000;">大于0的最小值</font>** //5e-324

**<font style="color:#FF0000;">NaN </font>**是一个**<font style="color:#FF0000;">特殊的数字</font>**，表示Not A Number， **<font style="color:#FF0000;">非数值</font>**

使用**<font style="color:#FF0000;">typeof 检查NaN也会返回number</font>** 

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var a = 123;</font>

<font style="color:#595959;">      a = 456.789; //下面的数值会覆盖上面的</font>

<font style="color:#595959;">      var b = 123; //这是数字123</font>

<font style="color:#595959;">      console.log(typeof a); //number</font>



<font style="color:#595959;">      a = Number.MAX_VALUE; //最大值</font>

<font style="color:#595959;">      // console.log(a)</font>



<font style="color:#595959;">      a = Number.MIN_VALUE; //最小值</font>

<font style="color:#595959;">      //  console.log(a)</font>



<font style="color:#595959;">      a = "abc" * "bcd";</font>

<font style="color:#595959;">      //console.log(a); //NaN</font>

<font style="color:#595959;">    </script></font>

（3）、数字型计算

在Js中整数的运算基本可以保证精确

如果使用JS进行浮点元素，可能得到一个不精确的结果

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var c = 1 + 2; </font>

<font style="color:#595959;">      console.log(c);//3</font>



<font style="color:#595959;">      var d = 0.1 + 0.2; //</font>**<font style="color:#FF0000;">如果使用JS进行浮点元素，可能得到一个不精确的结果</font>**

<font style="color:#595959;">      console.log(d);//0.30000000000000004</font>

<font style="color:#595959;">    </script></font>

（4）、isNaN()方式

用来判断NaN，并返回一个布尔值，如果判断的是NaN，则返回true，如果判断的不是NaN，则返回false

console.log(isNaN(123));//false	**<font style="color:#FF0000;">						//数字返回true</font>**

console.log(isNaN(NaN));//true	**<font style="color:#FF0000;">						//非数字返回flase</font>**

（5）、typeof 来**<font style="color:#FF0000;">检查</font>**一个**<font style="color:#FF0000;">变量的类型,并输出</font>**

语法：**<font style="color:#FF0000;">typeof 变量</font>** 

检查字符串时，会返回string; 检查数值时，会返回number

#### 2、字符串String
（1）、基本语法

字符串型可以是**<font style="color:#FF0000;">引号中的任意文本</font>**，其语法为**<font style="color:#FF0000;">双引号“”</font>**和**<font style="color:#FF0000;">单引号‘’</font>**，一般js中建议用单引号‘’，js**<font style="color:#FF0000;">可</font>**以用单引号嵌套双引号，或者用双引号嵌**<font style="color:#FF0000;">套单引号</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">    // 单双引号嵌套</font>

<font style="color:#595959;">    var res = '古诗:"锄禾日当午"';</font>

<font style="color:#595959;">    console.log(res);</font>

<font style="color:#595959;">    </script></font>

（2）、字符串转义符

转义符都是**<font style="color:#FF0000;">\开头的</font>**，**<font style="color:#FF0000;">写在当单双引号里面</font>**的，常用的转义符及其说明如下

| 转义符 | 解释说明 |
| --- | --- |
| \n | 换行符，n表示newline的意思 |
| \\ | 斜杠\ |
| \' | '单引号 |
| \" | "双引号 |
| \t | tab缩进 |
| \b | 空格，b是blank的意思 |


<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //转义字符</font>

<font style="color:#595959;">      var str = "hello";</font>

<font style="color:#595959;">      str = " \''你好 ";</font>

<font style="color:#595959;">      console.log(str,'11');</font>

<font style="color:#595959;">    </script></font>

（3）、字符串长度

字符串是由若干字符组成的，这些字符的数量就是字符串的长度。**<font style="color:#FF0000;">length属性</font>**可以**<font style="color:#FF0000;">获取</font>**整个**<font style="color:#FF0000;">字符串的长度</font>**

（4）、字符串拼接

多个字符串之间可以使**<font style="color:#FF0000;">用+</font>**进行**<font style="color:#FF0000;">拼接</font>**，其拼接方式为**<font style="color:#FF0000;">字符串+任意类型=拼接新字符串 ；</font>**

<font style="color:#000000;">拼接前会把字符串相加的任意类型转成字符串，再拼接成一个新的字符串；</font>

<font style="color:#000000;">（5）、字符串拼接变量</font>

**<font style="color:#FF0000;">字符串和变量拼接，变量不能写在引号里面，需要用 加号 拼接变量</font>**

 eg:"你好"+age+"hlleo"

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var age = 18;</font>

<font style="color:#595959;">      var str = "我今年18岁了";</font>

<font style="color:#595959;">      str = "我今年" + age + "岁了";</font>

<font style="color:#595959;">      console.log(str);</font>

<font style="color:#595959;">    </script></font>

#### <font style="color:#000000;">3、布尔值 Boolean</font>
**<font style="color:#FF0000;">布尔值</font>**只有两个值，**<font style="color:#FF0000;">用来做逻辑判断</font>**

**<font style="color:#FF0000;">true</font>** -表示**<font style="color:#FF0000;">真</font>** **<font style="color:#FF0000;">false</font>** -表示**<font style="color:#FF0000;">假 </font>**

**<font style="color:#FF0000;">使用typeof检查一个布尔值时，会返回boolean</font>**

**<font style="color:#FF0000;">当进行数值运算的时候，true为1，false为0</font>**

#### 4、未定义 Undefined
**<font style="color:#FF0000;">Undefined类型的值只有一个，就是undefined</font>**

当声明了一个变量，但是并不给变量赋值时，它的值就是undefined

使用typeof检查一个undefined时也会返回undefined

**<font style="color:#FF0000;">当进行数值运算时，结果为NaN</font>**

#### 5、 空值Null
null这个值专门用来**<font style="color:#FF0000;">表示空的对象</font>**

**<font style="color:#FF0000;">使用typeof检查一个null值时，会返回object</font>**

**<font style="color:#FF0000;">当进行数值运算时，null为0</font>**

## （三）、数据类型转换
使用**<font style="color:#FF0000;">表单、prompt获取</font>**过来的**<font style="color:#FF0000;">数据</font>**默认**<font style="color:#FF0000;">是字符串类型</font>**的，此时就不能直接进行数值运算，需要将字符串转为数值类型

**<font style="color:#FF0000;">强制类型转换：指将一个数据类型强制转换为其他的数据类型</font>**

通常三种转换

转换为字符串类型

转换为数字型

转换为布尔型

### 1、转换为字符串类型
（1）、toString()方法 

-调用被转换数据类型的toString()方法 语法：**<font style="color:#FF0000;">变量.toString()</font>**

-该方法不会影响到原变量，它会**<font style="color:#FF0000;">将转换的结果返回</font>** 语法：**<font style="color:#FF0000;">str=变量.toString()</font>**

**<font style="color:#FF0000;">-注意：null和undefined这两个值没有toString的方法，如果调用他们会报错</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var a = 123;</font>

<font style="color:#595959;">      //调用a的toString()方法</font>

<font style="color:#595959;">      var b = a.toString(); //将a赋值转换结果赋值给b，再检查b</font>

<font style="color:#595959;">      a = a.toString(); //也可将a赋值转换结果赋值给a，再检查a</font>

<font style="color:#595959;">      console.log(typeof a);</font>

<font style="color:#595959;">      console.log(a);</font>



<font style="color:#595959;">      //    再举例</font>

<font style="color:#595959;">      var c = true;</font>

<font style="color:#595959;">      c = c.toString();</font>

<font style="color:#595959;">      console.log(typeof c);</font>

<font style="color:#595959;">      console.log(c);</font>



<font style="color:#595959;">      /* var d=</font>**<font style="color:#FF0000;">null</font>**<font style="color:#595959;">;</font>

<font style="color:#595959;">      d=d.</font>**<font style="color:#FF0000;">toString()</font>**<font style="color:#595959;">;</font>

<font style="color:#595959;">      console.log(</font>**<font style="color:#FF0000;">typeof d</font>**<font style="color:#595959;">)//</font>**<font style="color:#FF0000;">会报错</font>**



<font style="color:#595959;">      var e=</font>**<font style="color:#FF0000;">undefined;</font>**

<font style="color:#595959;">      e=e.</font>**<font style="color:#FF0000;">toString();</font>**

<font style="color:#595959;">      console.log</font>**<font style="color:#FF0000;">(typeof e)</font>**<font style="color:#595959;"> */ //</font>**<font style="color:#FF0000;">会报错</font>**

<font style="color:#595959;">    </script></font>

（2）String()

-调用**<font style="color:#FF0000;">String()函数</font>**,并将**<font style="color:#FF0000;">被转换的数据作为参数传递给函数</font>**, 语法：**<font style="color:#FF0000;">String(变量)</font>**

-使用String（）函数做强制类型转换时，对于Number和Boolean实际上就是调用的toString的方法

但对于null和undefined,就不会调用toString()方法， 它会将null直接转换为"null"， 将undefined 直接转换为"undefined"

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      a = 789;</font>

<font style="color:#595959;">      //调用String()函数，来将a转换为字符串</font>

<font style="color:#595959;">      a = String(a);</font>



<font style="color:#595959;">      a = null;</font>

<font style="color:#595959;">      a = String(a);</font>



<font style="color:#595959;">      a = undefined;</font>

<font style="color:#595959;">      a = String(a);</font>



<font style="color:#595959;">      console.log(a);</font>

<font style="color:#595959;">      console.log(typeof a);</font>

<font style="color:#595959;">    </script></font>

（3）拼接字符串（**<font style="color:#FF0000;">隐式转换</font>**）

**<font style="color:#FF0000;">和字符串拼接的结果都是新字符串</font>**,语法：**<font style="color:#FF0000;">变量+''</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">     var f=123</font>

<font style="color:#595959;">      f=f+''</font>

<font style="color:#595959;">      console.log(f,typeof f);</font>

<font style="color:#595959;">    </script></font>

### 2、转换为数字型（重点）
（1）、 使用Number()函数

字符串-->数字

1:如果是**<font style="color:#FF0000;">纯数字</font>**的字符串，则**<font style="color:#FF0000;">直接</font>**将其**<font style="color:#FF0000;">转换</font>**为数字 

2:如果字符串中**<font style="color:#FF0000;">有非法的数字</font>**的内容，**<font style="color:#FF0000;">则转换为NaN</font>** 

3:如果字符串是一个**<font style="color:#FF0000;">空串</font>**，或者全是空格的字符串，则**<font style="color:#FF0000;">转换为0</font>**

布尔值--->数字

true--1 false--0

Null --->数字 0

**<font style="color:#FF0000;">Undefined --->数字 NaN</font>**

（2）、parseInt()

可以将一个**<font style="color:#FF0000;">字符串</font>**中的**<font style="color:#FF0000;">有效的整数取出来</font>**，**<font style="color:#FF0000;">转换为Number</font>**

语法：**<font style="color:#FF0000;">parseInt(变量)</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      a='123px';</font>

<font style="color:#595959;">      a=parseInt(a)//调用parseInt()函数，将a转换为Number</font>

<font style="color:#595959;">    </script></font>

（3）、parseFloat()

把一个字符串**<font style="color:#FF0000;">转换</font>**为一个**<font style="color:#FF0000;">浮点数数值型</font>**

语法：**<font style="color:#FF0000;">parseFloat(变量)</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      a='123.345px';</font>

<font style="color:#595959;">      a=parseFloat(a);            </font>

<font style="color:#595959;">    </script></font>

**<font style="color:#FF0000;">注意：如果对非String使用parseFloat()跟parseInt(),它会先将其转换为String，然后再操作</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      a=true;</font>

<font style="color:#595959;">      a=parseInt(a);//NaN     </font>

<font style="color:#595959;">    </script></font>

（4）、js隐式转换

**<font style="color:#FF0000;">利用算术运算</font>****<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;">-</font>****<font style="color:#FF0000;">  </font>****<font style="color:#FF0000;">*  / 隐式转换为数值型</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      a = "123";</font>

<font style="color:#595959;">      a = a - 0;//123</font>

<font style="color:#595959;">      a = a / 1;//123</font>

<font style="color:#595959;">      a = a * 1;//123</font>

<font style="color:#595959;">      console.log(a, typeof a);   </font>

<font style="color:#595959;">    </script></font>

3、转换为布尔型

**<font style="color:#FF0000;">Boolean()函数</font>**，将其他类型**<font style="color:#FF0000;">转成布尔值</font>**

**<font style="color:#FF0000;">数字-->布尔除了0跟NaN是false，其他的都是true</font>**

**<font style="color:#FF0000;">字符串-->布尔除了空串是false，其余都是true</font>**

**<font style="color:#FF0000;">null和undefined都会转换为false</font>**

对象会转换为true 

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var a = 123; //true</font>

<font style="color:#595959;">      a = -123; //true</font>

<font style="color:#595959;">      a = 0; //flase</font>

<font style="color:#595959;">      a = NaN; //flase</font>

<font style="color:#595959;">      a = Boolean(a); //调用Boolean()函数来将a转换为布尔值</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      a = "false"; //true</font>

<font style="color:#595959;">      a = " "; //false</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      a = null; //false</font>

<font style="color:#595959;">      a = Boolean(a);</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      a = undefinde; //false</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      console.log(typeof a);</font>

<font style="color:#595959;">      console.log(a);</font>

<font style="color:#595959;">      </script></font>





### 算术运算中的隐式转换 

1. **加法运算** - 当一个字符串与其他类型的值进行加法运算时，其他类型的值会被隐式转换为字符串，然后进行字符串拼接。

- **<font style="color:#FF0000;">当两个数字类型的值进行加法运算时，正常进行数学加法。</font>**

- 如果一个操作数是对象，JavaScript会尝试调用对象的`valueOf()`方法或`toString()`方法来获取一个可以用于加法运算的值，然后再进行转换。 

1. **减法、乘法、除法运算** - 当进行减法、乘法、除法运算时，如果**<font style="color:#FF0000;">操作数之一不是数字类型</font>**，JavaScript会尝试**<font style="color:#FF0000;">将其隐式转换为数字类型。</font>** 



### 比较运算中的隐式转换 

1. **相等比较（**<font style="color:#FF0000;">==</font>**）** - 当使用`==`进行比较时，如果操作数的类型不同，JavaScript会进行隐式转换后再比较。
2. **不等比较（**<font style="color:#FF0000;">!=</font>**）** - 与相等比较类似，不等比较`!=`也会进行隐式转换。 

3. **大于**<font style="color:#FF0000;">（>）</font>**、小于**<font style="color:#FF0000;">（<）</font>**比较** - 在进行大小比较时，如果操作数类型不同，JavaScript会尝试将它们转换为数字类型后再比较。

 ### 逻辑运算中的隐式转换 

1. **逻辑与（**<font style="color:#FF0000;">&&</font>**）和逻辑或（**<font style="color:#FF0000;">||</font>**）运算**

 - 在逻辑与和逻辑或运算中，操作数会被隐式转换为布尔值进行逻辑判断，但最终返回的值是操作数本身（不一定是布尔值）。

1. **逻辑非（**<font style="color:#FF0000;">!</font>**）运算** - 逻辑非运算会将操作数隐式转换为布尔值，然后取反。

运算符也叫操作符，通过运算符可以对一个值或者多个值进行运算，并获取运算结果，常用于实现赋值、比较、执行算数运算符等功能的符号。

比如typeof 就是一个运算符，可以获得一个值的类型,它会将该值的类型以字符串的形式返回，typeof的返回值，用来描述类型的number string boolean undefined object

常用运算符如下：

## 1、算数运算符
（1）、注意：

1:当对非Number类型进行运算时，会将这些值转换为Number，然后再运算 ，- *，/ %

2:**<font style="color:#FF0000;">任何值和NaN做运算，都是NaN</font>**

3:如果对两个字符串进行加法运算，则会做拼串，会将两个字符串拼接为一个字符串，并返回

4:任何的值和字符串做加法运算，都会先转换为字符串，然后再和字符串做拼串的操作

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var a = 123;</font>

<font style="color:#595959;">      var result = typeof a;</font>

<font style="color:#595959;">      result = 234 + 123; //357</font>

<font style="color:#595959;">      result = 1 + true; //2</font>

<font style="color:#595959;">      result = 1 + false; //1</font>

<font style="color:#595959;">      result = 1 + null; //null转成Number是0</font>

<font style="color:#595959;">      result = 1 + NaN; //NaN</font>

<font style="color:#595959;">      result = "123abc" + "456";//123abc456</font>



<font style="color:#595959;">      var sty =</font>

<font style="color:#595959;">        "锄禾日当午，" + //双引号必须在一行，否则识别不了</font>

<font style="color:#595959;">        "汗滴禾下土，" + //可以利用加号，写长的字符串，格式化结构</font>

<font style="color:#595959;">        "谁知盘中餐，" +</font>

<font style="color:#595959;">        "粒粒皆辛苦。";</font>

<font style="color:#595959;">      result = 123 + "1"; </font>

<font style="color:#595959;">      var c = 123;</font>

<font style="color:#595959;">      c = c + "";</font>

<font style="color:#595959;">      c = null + "";</font>

<font style="color:#595959;">      c = undefined + "";</font>



<font style="color:#595959;">      // console.log("typeof c", typeof c);</font>

<font style="color:#595959;">      // console.log("c：" + c); //经常使用</font>



<font style="color:#595959;">      result = 1 + 2 + "3"; //结果：33</font>

<font style="color:#595959;">      result = "1" + 2 + 3; //结果：123,</font>

<font style="color:#595959;">      </script></font>

（2）、种类

+ 加法

- 减法，可以对我们的两个值进行减法运算，并进行返回

当对非Number类型进行运算时，会将这些值转换为Number，然后再运算

* 乘法，可以对两个值进行乘法运算

/ 除法，可以对两个值进行乘法运算

% 取模运算（取余数）

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      result = 100 - true; //结果：99</font>

<font style="color:#595959;">      result = 100 - "1"; //结果：99</font>



<font style="color:#595959;">      result = 2 * 2; //结果：4</font>

<font style="color:#595959;">      result = 2 * "8"; //结果：16</font>

<font style="color:#595959;">     </font>**<font style="color:#FF0000;"> result = 2 * undefined; //结果NaN; 任何值和NaN在一起，都是NaN</font>**

<font style="color:#595959;">      result = 2 * null; //结果:0</font>



<font style="color:#595959;">      result = 4 / 2; //结果：2</font>

<font style="color:#595959;">      result = "2" - ""; //结果：2</font>

<font style="color:#595959;">      result = "2" / 1; //结果：2</font>

<font style="color:#595959;">      result = 9 % 3; //结果：0</font>

<font style="color:#595959;">      result = 9 % 4; //结果：1</font>

<font style="color:#595959;"> </script></font>

（3）、表达式和返回值

**<font style="color:#FF0000;">表达式：是由数字、运算符、变量等组成的式子</font>**

**<font style="color:#FF0000;">表达式</font>**最终都会有一个**<font style="color:#FF0000;">结果</font>**，返回给我们，我们称之为**<font style="color:#FF0000;">返回值</font>**

## 2、一元运算符（只需要一个操作数）
**<font style="color:#FF0000;">+ 正号</font>** 

-正号不会对数字产生任何影响

- **<font style="color:#FF0000;">对一个其他的数据类型使用+，来将其转换为Number </font>**

**<font style="color:#FF0000;">- 负号</font>** 

-负号可以对数字进行负号的**<font style="color:#FF0000;">取反</font>**

-对非Number类型的值，会先转换为Number，然后再运算

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        var a = 123;</font>

<font style="color:#595959;">        a = +a; //结果：123</font>

<font style="color:#595959;">        a = -a; //结果：-123</font>

<font style="color:#595959;">        var result = 1 + "2" + 3; //结果：‘123’</font>

<font style="color:#595959;">        result = 1 + +"2" + 3; //结果：6</font>

<font style="color:#595959;">        result = 1 + +true; //结果：2</font>



<font style="color:#595959;">        console.log(typeof +true);//number</font>

<font style="color:#595959;">        console.log("result=" + result);//2</font>

<font style="color:#595959;">      </script></font>

## 3、递增和递减运算符
如果需要反复给数字变量添加或者减去1，可以使用递增（++）和递减（--）运算符来完成。

在JS中，递增（++）和递减（--）既可以放在变量前面，也可以放在变量后面，放在变量前面时，称<font style="color:#F33232;">前置递增（递减）运算符</font>；放在变量后时，我们称之为<font style="color:#F33232;">后置递增（递减）运算符</font>

**<font style="color:#FF0000;">注意：递增和递减运算符都必须和变量配合使用</font>**

开发中，大多使用后置递增/减，并且代码独占一行

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var a = 1;</font>

<font style="color:#595959;">      a++; //结果：2  使a自增1，a=a+1;</font>

<font style="color:#595959;">      a++; //结果：3  每加一个，就自增1</font>

<font style="color:#595959;">      console.log("a=" + a);</font>

<font style="color:#595959;">      </script></font>

（1）、自增 ++

-通过自增可以使变量在自身的基础上增加1

-对于一个变量自增以后，原变量的值会立即自增1

-自增分成两种：后++（a++）和前++（++a），无论是a++，还是++a

都会立即使原变量自增1，不同的是a++和++a的值不一样

**<font style="color:#FF0000;">a++的值等于原变量的值</font>**（自增前的值），**<font style="color:#FF0000;">先返回原值，后自加</font>**

**<font style="color:#FF0000;">++a的值等于新值</font>**（自增后的值），**<font style="color:#FF0000;">先加1，后返回值</font>**

（2）、自减 --

-通过自减可以使自身变量在自身的基础上减1

-自减分成两成：后--（a--）和前--（--a）

无论是a--还是--a，都会立即在原变量的值自减1

不同的是a--的值是变量的原值（自减前的值）

--a的值是变量后的新值（自减以后的值）

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        var a = 10;</font>

<font style="color:#595959;">      // a--;</font>

<font style="color:#595959;">      //  --a;</font>

<font style="color:#595959;">      console.log(a--); //结果：10</font>

<font style="color:#595959;">      console.log(--a); //结果:8</font>

<font style="color:#595959;">      console.log("a=" + a); //结果：8</font>

<font style="color:#595959;">    </script></font>

## 4、逻辑运算符
概念：逻辑运算符是用来进行**<font style="color:#FF0000;">布尔值运算的运算符</font>**，其**<font style="color:#FF0000;">返回值也是布尔值</font>**，后面开发经常用于多个条件的判断

（1）、 **<font style="color:#FF0000;">! ‘逻辑非’</font>**，简称'非'

可以用来对一个值进行非运算

-所谓的非运算就是值**<font style="color:#FF0000;">对</font>**一个**<font style="color:#FF0000;">布尔值进行取反</font>**操作 true变false false变true；

-如果对一个值进行两次取反，它不会变化；

-如果**<font style="color:#FF0000;">对非布尔值</font>**进行运算，则**<font style="color:#FF0000;">会将其转换为布尔值</font>**，然后再取反， 所以我们可以利用该特点，来将一个其他的数据<font style="color:#F33232;">类型转换</font>为布尔值

可以对一个任意数据类型取两次反，来讲其转换为布尔值，原理和boolean()函数一样

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        var a = true;</font>

<font style="color:#595959;">        a = !a; //对a进行非运算，再赋值给a</font>

<font style="color:#595959;">        //console.log("a="+a)//结果：false</font>



<font style="color:#595959;">        var b = 10;</font>

<font style="color:#595959;">        b = !b; //false</font>

<font style="color:#595959;">        b = !!b; //ture</font>

<font style="color:#595959;">        console.log(typeof b);</font>

<font style="color:#595959;">        console.log("b=" + b);</font>

<font style="color:#595959;">    </script></font>

（2）、**<font style="color:#FF0000;"> && ‘逻辑与’</font>**简称‘与’（像爱情）找**<font style="color:#FF0000;">false</font>**，

-&&可以对符号两侧的值进行运算并返回结果

-运算规则

两个值中只要有一个值为false就返回false；

只有两个值都为true时，才会返回true；

**<font style="color:#FF0000;">js中的“与”是短路的“与”，如果第一个值是false，就不用看第二个值了</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var result = true && true; //如果两个值都是true，则返回true</font>

<font style="color:#595959;">      result = true && false; //只要有一个false，就返回false</font>

<font style="color:#595959;">      result = false && true;</font>

<font style="color:#595959;">      result = false && false;</font>

<font style="color:#595959;">      console.log("result=" + result);</font>



<font style="color:#595959;">      //true&& alert("看我出不出来");//第一个值为true，会检查返回第二个值</font>

<font style="color:#595959;">      //false&& alert('看我出不出来');//第一个值为false，不会检查第二个值，肯定不运行</font>

<font style="color:#595959;"> </font>

<font style="color:#595959;">    </script></font>

（3）、**<font style="color:#FF0000;"> || 逻辑或</font>**，简称‘或’（像亲情）**<font style="color:#FF0000;">找true</font>**

-||可以对符号两侧的值进行或运算并返回结果

-运算规则

两个值中，只要有一个true就返回true；

如果两个值都为false，才会返回false；

**<font style="color:#FF0000;">js中的“或”是短路的“或”，如果第一个值是true，就不用看第二个值了 </font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      result = false || false; //两个都是false，则反回false</font>

<font style="color:#595959;">      result = true || false; //只要有一个true，就返回true</font>

<font style="color:#595959;">      result = false || true;</font>

<font style="color:#595959;">      result = true || true;</font>

<font style="color:#595959;">      console.log("result=" + result);</font>



<font style="color:#595959;">      false || alert("看我出不出来"); //第一个值为false，会检查第二个值</font>

<font style="color:#595959;">      true || alert("看我出不出来"); //第一个值为true，不会检查第二个值</font>

<font style="color:#595959;"> </font>

<font style="color:#595959;">    </script></font>

## 5、非布尔值的与或运算符（短路运算/逻辑中断）
短路运算的原理：当由多个表示式（值）时，左边的表达式值可以确定结果时，就不再继续运算右边的表达式的值了，一定程度，提高代码效率

&& || 非布尔值的情况

-对于非布尔值进行"与","或"运算时，会将其**<font style="color:#FF0000;">先转换为布尔值，然后再运算，并且返回原值</font>**

-与运算（找false）：如果第一个值为true，则必然返回第二个值；

如果第一个值为false，则直接返回第一个值；

-或预算（找true） ：如果第一个值为true，则直接返回第一个值；

如果第一个值为false，则直接返回第二个值 

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var result = 1 && 2; //true&&true,结果：2 ,与预算，如果两个值都是true，则返回后边的</font>

<font style="color:#595959;">      result = 0 && 2; //false && true，结果：0  ,与运算：如果两个值中有false，则返回靠前的false</font>



<font style="color:#595959;">      result = NaN && 0; //false && false 结果：NaN</font>



<font style="color:#595959;">      result = 1 || 2; //true||true  结果：1  如果第一个值为true，则直接返回第一个值</font>

<font style="color:#595959;">      result = 2 || NaN; // true||false 结果：2</font>

<font style="color:#595959;">      result = NaN || 1; //false||true  结果：1</font>



<font style="color:#595959;">      result = "" || "hello";</font>

<font style="color:#595959;">      result = -1 || "你好";</font>



<font style="color:#595959;">      console.log("result=" + result);</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">    </script></font>

课堂练习：

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var num = 7;</font>

<font style="color:#595959;">      var str = "我爱你~中国~";</font>



<font style="color:#595959;">      console.log(num > 5 && str.length >= num);</font>

<font style="color:#595959;">      console.log(num < 5 && str.length >= num);</font>

<font style="color:#595959;">      console.log(!(num < 10));</font>

<font style="color:#595959;">      console.log(!(num < 10 || str.length == num)); </font>



<font style="color:#595959;">      var num = 0;</font>

<font style="color:#595959;">      console.log(123 || num++);</font>

<font style="color:#595959;">      console.log(num); </font>



<font style="color:#595959;">      var num = 0;</font>

<font style="color:#595959;">      console.log(123 && num++);</font>

<font style="color:#595959;">      console.log(num); </font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">    </script></font>

## 6、赋值运算符
=可以将符号右侧的值赋值给符号左侧的变量

+= a += 5 等价于a =a + 5

-= a -= 5 等价于a =a - 5

*= a *= 5 等价于a =a * 5

/= a /= 5 等价于a =a / 5

%= a %=5 等价于a =a%5 

课堂练习：

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var num = 10;</font>

<font style="color:#595959;">      num += 5;</font>

<font style="color:#595959;">      console.log(num);</font>



<font style="color:#595959;">      var age = 2;</font>

<font style="color:#595959;">      age *= 3;</font>

<font style="color:#595959;">      console.log(age);</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">    </script></font>

## 7、关系运算符
通过关系运算符可以**<font style="color:#FF0000;">比较两个值之间的关系</font>**，如果关系成立，它会**<font style="color:#FF0000;">返回true</font>**，如果关系不成立则**<font style="color:#FF0000;">返回false</font>**

> 大于号

-判断符号左侧的值是否大于右侧的

-如果关系成立，则返回true，如果关系不成立，则发挥false

>= 大于等于

-判断符号左侧的值是否大于或等于右侧的值

< 小于号

<= 小于等于

注意：对于非数值的情况

**<font style="color:#FF0000;">-对于非数值的进行比较时，会将其转换为数字然后再比较</font>**

**<font style="color:#FF0000;">-如果符号两侧的值，都是字符串时，不会将其转换为数字比较，而会分别比较字符串的Unicode编码</font>**

## 8、相等运算符
**<font style="color:#FF0000;">== </font>**

相等运算符用来**<font style="color:#FF0000;">比较两个值是否相等</font>**，如果相等会**<font style="color:#FF0000;">返回true</font>**，否则**<font style="color:#FF0000;">返回false，</font>** 使用==来做相等运算

当使用==来比较两个值时，如果值的**<font style="color:#FF0000;">类型不同</font>**，则会**<font style="color:#FF0000;">自动进行类型转换</font>**，转换为相同的类型，然后比较

**<font style="color:#FF0000;">!= </font>**

不相等运算符用来**<font style="color:#FF0000;">比较两个值是否不相等</font>**，如果不相等会返回true，否则返回false，使用!= 来做不相等运算

不相等也会对变量进行自动的类型转换，如果转换后相等它也会返回false。

**<font style="color:#FF0000;">=== </font>**

全等 用来判断**<font style="color:#FF0000;">两个值是否全等</font>**，和相等类似，**<font style="color:#FF0000;">不同的是不会做类型转换</font>**<font style="color:#FF0001;">，</font>如果两个类型不同，直接返回false

**<font style="color:#FF0000;">!== </font>**

不全等 用来判断**<font style="color:#FF0000;">两个值是否不全等</font>**，和不等类似，不同的是它**<font style="color:#FF0000;">不做类型转换</font>**，如果两个值类型不同，直接返回true

特殊情况：

**<font style="color:#FF0000;">1: undefined衍生自null，所以这两个值做相等判断时，会返回true</font>**

**<font style="color:#FF0000;">2: NaN不和任何值相等，包括他本身</font>**

可以通过isNaN()函数来判断一个值是否是NaN

如果该值是NaN则返回true，否则是false

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      console.log(1==1);//true</font>

<font style="color:#595959;">      var a=10;</font>

<font style="color:#595959;">      console.log(a==4);//false</font>

<font style="color:#595959;">      console.log("1"==1);//true</font>

<font style="color:#595959;">      console.log(true=="1");//true  转为Number，然后比较</font>

<font style="color:#595959;">      console.log(null== 0)//false  特殊情况，null没有转成Number</font>



<font style="color:#595959;">     console.log(undefined==null);//true</font>

<font style="color:#595959;">     console.log(NaN==NaN);//false</font>

<font style="color:#595959;">     var b=NaN;</font>

<font style="color:#595959;">        console.log(isNaN(b));//true  </font>



<font style="color:#595959;">    /* console.log(10!=5);//true</font>

<font style="color:#595959;">    console.log(10!=10);//false</font>

<font style="color:#595959;">    console.log("1"!=1);//false</font>



<font style="color:#595959;">    console.log("123"==123);//true</font>

<font style="color:#595959;">    console.log("123"===123);//false</font>

<font style="color:#595959;">   </font>

<font style="color:#595959;">    console.log(1=="1");//true</font>

<font style="color:#595959;">    console.log(1!=="1");//true */</font>

<font style="color:#595959;">  </script></font>

## 9、三元运算符
条件运算符也叫三元运算符

**<font style="color:#FF0000;">-语法：条件表达式？语句1:语句2;</font>**

-执行的流程:

条件运算符在执行时，首**<font style="color:#FF0000;">先对条件表达式进行求值</font>**，

如果该值为**<font style="color:#FF0000;">true</font>**，则**<font style="color:#FF0000;">执行语句1</font>**，并返回执行结果

如果该值为**<font style="color:#FF0000;">false</font>**，则**<font style="color:#FF0000;">执行语句2</font>**，并返回执行结果 

如果条件的表达式的求值结果是一个非布尔值，会将其转换为布尔值，然后再运算

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //true?alert('语句1'):alert('语句2');//语句1</font>

<font style="color:#595959;">      var a = 60,</font>

<font style="color:#595959;">        b = 80,</font>

<font style="color:#595959;">        c = 20;</font>

<font style="color:#595959;">      //a>b?alert('a大'):alert("b大");//b大</font>



<font style="color:#595959;">      var max = a > b ? a : b; //获取a b两个中的大值</font>

<font style="color:#595959;">      max = max > c ? max : c; //获取a b c三个值中的大值</font>

<font style="color:#595959;">      console.log("max=" + max);</font>

<font style="color:#595959;">    </script></font>

## 10、运算符的优先级
| 优先级 | 运算符 | 顺序 |
| --- | --- | --- |
| 1 | 小括号 | （） |
| 2 | 一元运算符 | ++ -- ！ |
| 3 | 算数运算符 | 先* / % 后+ - |
| 4 | 关系运算符 | > >= < <= |
| 5 | 相等运算符 | == != === !== |
| 6 | 逻辑运算符 | 先&& 后 || |
| 7 | 赋值运算符 | = |
| 8 | 逗号运算符 | , |


运算符的优先级

就和数学中一样，在JS中运算符也有优先级，比如先乘除，后加减

在js中有一个运算优先级的表,

在表中，越靠上，优先级越高，优先级越高，越优先计算，

如果**<font style="color:#FF0000;">优先级一样，则从左往右计算</font>**

但是表不用记，如果遇到优先级问题，可以用()来改变优先级

**流程控制**	

在一个程序执行的过程中，各条代码的执行顺序对程序的结果是有直接影响的。很多时候我们要通过控制代码的执行顺序来实现我们要完成的功能。

**<font style="color:#F33232;">简单理解：流程控制就是来控制我们的代码按照什么结构顺序来执行</font>**

流程控制主要有三种结构，分别是**<font style="color:#F33232;">顺序结构、分支结构、循环结构</font>**，这是三中结构代表三种代码执行的顺序

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693834231-6fca7509-d61d-49ab-92cc-9a98852540e5.png)

## （一）、顺序流程控制
顺序结构是程序中最简单的、最基本的流程控制，它没有特定的语法结构，程序会按照代码的先后顺序，依次执行，程序中大多数的代码都是这样执行的.

代码块： 

我们的程序是由一条条语句构成的，语句是按照从上到下的顺序一条条执行的，在**<font style="color:#F33232;">js中</font>**，可以**<font style="color:#F33232;">使用{}来为语句进行分组，</font>** **<font style="color:#F33232;">同一个{}中的语句</font>**，我们**<font style="color:#F33232;">称为一组语句</font>**，他们要么都执行，要么都不执行一个{}中的语句，我们**<font style="color:#F33232;">也称</font>**为一个**<font style="color:#F33232;">代码块</font>**

在代码块的后边，就不用编写;号了， js中的代码块，只具有分组的作用，没有其他的用途，代码块内容的内容，在外部是完全可见的

<font style="color:#595959;"><script></font>

<font style="color:#595959;">     {</font>

<font style="color:#595959;">        alert("hello");</font>

<font style="color:#595959;">        console.log("你好");</font>

<font style="color:#595959;">        var num = 100;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(num);</font>

<font style="color:#595959;">    </script></font>

## （二）、分支流程控制
由上到下执行代码的过程中，根据不同的条件，执行不同的路径代码（执行代码多选一的过程），从而得到不同的结果

### 1、if分支语句
条件判断语句

-使用条件判断语句可以在执行某个语句之前进行判断，如果条件成立才会执行语句，条件不成立，则语句不执行

### （1）、 if语句
语法结构：

**<font style="color:#F33232;">if(条件表达式){</font>**

**<font style="color:#F33232;">执行语句....</font>**

**<font style="color:#F33232;">};</font>**

执行思路：

if语句在执行时，会先对条件表达式进行求值判断，如果条件表达式的值为true，则执行if后的语句； 如果条件表达式的值为false，则不会执行if后的语句；

注意：

**<font style="color:#F33232;">if</font>**语句**<font style="color:#F33232;">只能控制紧随其后的那个语句</font>**，如果希望if语句可以控制多条语句，可以将这些语句统一放在代码块中。

如果就一条if语句，代码块不是必须的，但在开发中尽量写清楚 

代码验证：弹出一个输入框，要求用户输入年龄，如果年龄大于等于18岁，允许进网吧

<font style="color:#595959;"><script></font>

<font style="color:#595959;">    if (true) console.log("好好学习，天天向上");</font>

<font style="color:#595959;">      //  加上条件运算符  &&  ||</font>

<font style="color:#595959;">      var a = 20;</font>

<font style="color:#595959;">      if (a > 10 && a <= 20) {</font>

<font style="color:#595959;">        console.log("a在10-20之间");</font>

<font style="color:#595959;">        console.log("4567");</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //  弹出一个输入框，要求用户输入年龄，如果年龄大于等于18岁，允许进网吧</font>

<font style="color:#595959;">      var age = prompt("请输入年龄");</font>

<font style="color:#595959;">      if (age >= 18) {</font>

<font style="color:#595959;">        alert("欢迎光临");</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

### （2）、 if....else...语句
语法结构

**<font style="color:#F33232;">if（条件表达式）{</font>**

**<font style="color:#F33232;">执行语句1....</font>**

**<font style="color:#F33232;">}else{</font>**

**<font style="color:#F33232;">执行语句2....</font>**

**<font style="color:#F33232;">}</font>**

执行思路

当该语句执行时，会先对if后的条件进行判断，如果该值为true，则执行if后的语句，如果该值为false，则执行else后的语句，两者选其一执行 

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693834640-9043f01f-2bab-42b3-a3db-d0a3ca8d408a.png)

代码验证：弹出一个输入框，要求用户输入年龄，如果年龄大于等于18岁，允许进网吧，否则，让回家好好学习

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var age = prompt("请输入年龄");</font>

<font style="color:#595959;">        if (age >= 18) {</font>

<font style="color:#595959;">          alert("你已经" + age + "岁，欢迎光临");</font>

<font style="color:#595959;">        } else {</font>

<font style="color:#595959;">          alert("你才" + age + "岁，回家学习吧");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    </script></font>

### （3）、if...else if...else语句（多分支语句）
语法结构：

**<font style="color:#F33232;">if(条件表达式){</font>**

**<font style="color:#F33232;">执行语句....</font>**

**<font style="color:#F33232;">}else if(条件表达式){</font>**

**<font style="color:#F33232;">执行语句....</font>**

**<font style="color:#F33232;">}else{</font>**

**<font style="color:#F33232;">上述都不成立，执行语句</font>**

**<font style="color:#F33232;">}</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693834913-fbba8347-4ef7-4feb-ad1a-82ee279f5898.png)

执行思路：

当该语句执行时，会从上到下依次对条件表达式进行求值，如果值为true，则执行当前语句；如果值为false，则继续向下判断； 如果所有的条件都不满意，就执行最后一个else或者不执行，该语句中，**<font style="color:#F33232;">只会有一个代码块被执行，一旦代码块执行了， 则直接结束语句 ；else if 理论上是可以有多个的 </font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var age = prompt("请输入年龄");</font>

<font style="color:#595959;">      if (age < 18) {</font>

<font style="color:#595959;">        alert("你还未成年");</font>

<font style="color:#595959;">      } else if (age >= 18 && age <= 60) {</font>

<font style="color:#595959;">        alert("你需要努力工作，养家活口");</font>

<font style="color:#595959;">      } else {</font>

<font style="color:#595959;">        alert("你可以颐养天年了");</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

课堂小练习：根据用户输入的分数，有不同的奖励

1：90分以上，奖励宝马

2:80-90分，奖励100元

3:70-80分，奖励书包

4:60-70分，奖励练习册

5:60分以下，奖励棍棒炒肉丝

### 2、三元表达式
有三元运算符组成的式子，我们成为三元表达式

语法结构：**<font style="color:#F33232;">条件表达式？表达式1:表达式2</font>**

执行思路：如果条件表达式为真，返回表达式1的值，如果条件表达式为假，返回表达式2的值

代码验证：

如果年龄达到了18岁，则显示成年了，否则返回未成年

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var age3 = prompt("请输入年龄");</font>

<font style="color:#595959;">      age3 >= 18 ? alert("欢迎光临") : alert("回家学习吧");</font>

<font style="color:#595959;">    </script></font>

课堂小练习：用户输入数字，如果数字小于10，则在前面补0，比如01，如果数字大于10，则不需要补，如20

<font style="color:#595959;"><script></font>

<font style="color:#595959;">     var num = prompt("请输入数字");</font>

<font style="color:#595959;">      // if实现</font>

<font style="color:#595959;">      // if (num > 0 && num < 10) {</font>

<font style="color:#595959;">      //   num = "0" + num;</font>

<font style="color:#595959;">      // }</font>

<font style="color:#595959;">      // 三元表达式实现</font>

<font style="color:#595959;">      num = num > 0 && num < 10 ? "0" + num : num;</font>

<font style="color:#595959;">      alert(num);</font>

<font style="color:#595959;">    </script></font>

### 3、switch分支语句（ switch...case...语句）
switch语句也是多分支语句，它用于基于不同条件来执行不同的代码，当要针对变量设置<font style="color:#FF0001;">一系列的特定值</font>的选项时，就可以用switch语句；

**<font style="color:#F33232;">switch转换，开关的意思；case 选项的意思； break退出语句</font>**

语法结构：

**<font style="color:#F33232;">switch(条件表达式){</font>**

**<font style="color:#F33232;">case 表达式:</font>**

**<font style="color:#F33232;">执行语句....；</font>**

**<font style="color:#F33232;">break;</font>**

**<font style="color:#F33232;">case 表达式:</font>**

**<font style="color:#F33232;">执行语句....</font>**

**<font style="color:#F33232;">break;</font>**

**<font style="color:#F33232;">······</font>**

**<font style="color:#F33232;">default:</font>**

**<font style="color:#F33232;">执行语句...；</font>**

**<font style="color:#F33232;">}</font>**

执行流程：

在执行时，会依次将case后的表达式的值和switch后的条件表达式的值，进行**<font style="color:#F33232;">全等比较</font>**，如果比较结果为true，则从当前case处开始执行代码，当前case后的所有代码都会执行，我们可以在case的后边跟着一个**<font style="color:#F33232;">break关键字</font>**，这样可以**<font style="color:#F33232;">确保只会执行当前case后的语句</font>**，而不会执行其他的case， 如果比较结果为false，则继续向下比较匹配，如果**<font style="color:#F33232;">所有的比较结果都为false</font>**，则**<font style="color:#F33232;">只执行default</font>**后的语句

区别：

switch语句和if语句的功能实际上有重复的，使用switch可以实现if的功能，一般情况下，两者是可以互相替换的

**<font style="color:#F33232;">switch···case语句通常处理case为比较确定值得情况下，而if···else···语句更加灵活，常用于范围判断</font>**

switch语句进行条件判断后直接执行到程序的条件语句，效率更高，而if···else语句有几种条件，有几种条件就得判断多少次

当分支比较少的时，if···else语句的执行效率比switch语句

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var num = 2;</font>

<font style="color:#595959;">      switch (num) {</font>

<font style="color:#595959;">        case 1:</font>

<font style="color:#595959;">          console.log("壹");</font>

<font style="color:#595959;">          //使用break可以退出switch语句</font>

<font style="color:#595959;">          break;</font>

<font style="color:#595959;">        case 2:</font>

<font style="color:#595959;">          console.log("贰");</font>

<font style="color:#595959;">          break;</font>

<font style="color:#595959;">        case 3:</font>

<font style="color:#595959;">          console.log("叁");</font>

<font style="color:#595959;">          break;</font>



<font style="color:#595959;">        default:</font>

<font style="color:#595959;">          console.log("非法数字～～～");</font>

<font style="color:#595959;">          break;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

课堂小练习：

用户输入水果，跟case里的值进行匹配，弹出对应的信息，如果没有对应的信息，弹出没有此水果。

## （三）、循环语句
在实际问题中，有很多具有规律性的重复操作，因此在程序中要完成这类操作就需要重复执行某些语句

### 1、for循环
在程序中，一组被**<font style="color:#F33232;">重复执行的语句</font>**被成为**<font style="color:#F33232;">循环体</font>**，**<font style="color:#F33232;">能否继续重复执行</font>**，取决于循环的**<font style="color:#F33232;">终止条件</font>**，由**<font style="color:#F33232;">循环体及循环终止条件组成</font>**的语句，我们称之为**<font style="color:#F33232;">循环语句</font>**

for循环，重复执行某些代码，通常跟计数有关系

语法结构：

在for循环中，为我们提供了专门的位置，用来放三个表达式

1:**<font style="color:#F33232;">初始化表达式</font>**：用var声明的一个普通的变量，通常用于作为计数器使用

2:**<font style="color:#F33232;">条件表达式</font>** ：用来决定每一次循环是否继续执行，就是**<font style="color:#F33232;">终止的条件</font>**

3:**<font style="color:#F33232;">更新表达式（操作表达式）</font>**：每次循环，最后执行的代码，经常用于我们计数器变量进行更新

**<font style="color:#F33232;">for(初始化表达式;条件表达式;更新表达式){</font>**

**<font style="color:#F33232;">循环体....</font>**

**<font style="color:#F33232;">}</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">     //第一种写法</font>

<font style="color:#595959;">     for(var i=0;i<10;i++){</font>

<font style="color:#595959;">          alert(i);</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">       //第二种写法  for循环中的三个部分都可以省略，也都可以写在外部</font>

<font style="color:#595959;">       var i=0;</font>

<font style="color:#595959;">       for(;i<10;){</font>

<font style="color:#595959;">           alert(i++);</font>

<font style="color:#595959;">       }</font>

<font style="color:#595959;">       </font>

<font style="color:#595959;">       //如果在for循环中，不写任何的表达式，只写两个;</font>

<font style="color:#595959;">        //此时循环是一个死循环，会一直执行下去，慎用</font>

<font style="color:#595959;">       for(;;){</font>

<font style="color:#595959;">           alert("hello");</font>

<font style="color:#595959;">       }</font>

<font style="color:#595959;">    </script></font>

for循环的执行流程:

1:初始化表达式，初始化变量（初始化表达式，只会执行一次）

2:条件表达式，判断是否执行循环体，

3:如果为true，则执行循环，如果为false，终止循环

4:执行更新表达式，更新表达式执行完毕继续重复2

断点调试：

**<font style="color:#F33232;">断点调试</font>**是指自己在程序的某一行设置一个断点，调试时，**<font style="color:#F33232;">程序运行到这一行就会停住</font>**，然后你可以一步一步往下调试，调试的过程中可以看到各个变量当前的值，出错的话，调试到出错的代码行既显示错误，停下。

扩展：

1、for循环，循环可以执行重复的代码

2、for循环，循环也可以执行不同的代码，因为由计数器变量i的存在，i每次循环值都会变化

3、for循环，因为由计数器的存在，还可以重复执行某些操作，比如做一些算数运算：例如：求1-100之间的累加和

课堂小练习：

1、求1-100之间所有数的平均值

2、求1-100之间所有偶数和奇数的和

3、求1-100之间所有能被3整除的数字的和

4、要求用户输入班级人数，之后依次输入每个学生的成绩，最后打印出该班级总的成绩以及平均成绩 

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var num = +prompt("请输入班级人数：");</font>

<font style="color:#595959;">        var sum = 0;</font>

<font style="color:#595959;">        var ave = 0;</font>

<font style="color:#595959;">        for (var i = 1; i <= num; i++) {</font>

<font style="color:#595959;">          var soce = +prompt("第" + i + "个同学的成绩是：");</font>

<font style="color:#595959;">          sum += soce;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        ave = sum / num;</font>

<font style="color:#595959;">        console.log("总分：" + sum);</font>

<font style="color:#595959;">        console.log("均分：" + ave);</font>

<font style="color:#595959;">    </script></font>

5、一行打印五个小星星 ***** 

**双重for循环：**

循环嵌套是指在一个循环语句中再定义一个循环语句的语法结构，例如再for循环语句中，可以再嵌套一个for循环，这样的for循环语句，我们称之为双重for循环。

语法结构：

**<font style="color:#FF0000;">for（外层的初始表达式；外层的条件表达式；外层的操作表达式）{</font>**

**<font style="color:#FF0000;">for(里层的初始表达式；里层的条件表达式；里层的操作表达式){</font>**

**<font style="color:#FF0000;">执行语句</font>**

**<font style="color:#FF0000;">}</font>**

**<font style="color:#FF0000;">}</font>**

执行思路：

1、可以把里面的循环看作是外层循环的语句

2、外层循环循环一次，里面的循环执行全部

课堂小练习：

| 1、第一个图形 | 2、第二个图形 | 3、第三个图形 | 4、九九乘法表 |
| --- | --- | --- | --- |
| *****<br/>*****<br/>*****<br/>*****<br/>***** | *<br/>**<br/>***<br/>****<br/>***** | *****<br/>****<br/>***<br/>**<br/>* | <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693835159-a3a02a13-6812-4cac-b6a1-b1b768233c51.png) |


<font style="color:#595959;"><script></font>

<font style="color:#595959;">       //第一种图形 写法1</font>

<font style="color:#595959;">       for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        for (var j = 0; j < 5; j++) {</font>

<font style="color:#595959;">          document.write("* &nbsp;&nbsp;&nbsp;");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        document.write("<br/>"); //循环完一次 输出一个换行</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 第一种图形 写法2 拼接字符串</font>

<font style="color:#595959;">         // *       1  <1  i=0</font>

<font style="color:#595959;">        // **      2  <2  i=1</font>

<font style="color:#595959;">        // ***     3  <3  i=2</font>

<font style="color:#595959;">        // ****    4  <4  i=3</font>

<font style="color:#595959;">        // *****   5  <5  i=4</font>

<font style="color:#595959;">      var str = "";</font>

<font style="color:#595959;">      for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        for (var j = 0; j < 5; j++) {</font>

<font style="color:#595959;">          str += "*";</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        // 一行打印完5个星星后，就要另起一行</font>

<font style="color:#595959;">        str = str + "<br/>";</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      document.write(str);</font>



<font style="color:#595959;">      //第二种图形</font>

<font style="color:#595959;">      for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        for (var j = 0; j < i + 1; j++) {</font>

<font style="color:#595959;">          document.write("* &nbsp;&nbsp;&nbsp;");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        document.write("<br/>"); //输出一个换行</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      //第三种图形</font>

<font style="color:#595959;">        // *****   1  j<5(5-0)  i=0</font>

<font style="color:#595959;">        // ****    2  j<4(5-1)  i=1</font>

<font style="color:#595959;">        // ***     3  j<3(5-2)  i=2</font>

<font style="color:#595959;">        // **      4  j<2(5-3)  i=3</font>

<font style="color:#595959;">        // *       5  j<1(5-4)  i=4</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">      for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        for (var j = 0; j < 5 - i; j++) {</font>

<font style="color:#595959;">          document.write("* &nbsp;&nbsp;&nbsp;");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        document.write("<br/>"); //输出一个换行</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 9 *9 乘法表</font>

<font style="color:#595959;">      for(i=1;i<=9;i++){//获得1-9之间的数字 ，获得打印的行数，高度</font>

<font style="color:#595959;">         for(j=1;j<=i;j++){//获得i以内的所有数字，获取每行打印的次数</font>

<font style="color:#595959;">            // 组织打印出来的数据</font>

<font style="color:#595959;">             document.write(j+"*"+i+"="+i*j+"&nbsp;&nbsp;") </font>

<font style="color:#595959;">         }</font>

<font style="color:#595959;">         document.write("<br/>")</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    </script></font>

### 2、while循环
while语句可以在条件表达式为真的前提下，循环执行指定的一段代码，直到表达式不为真时，结束循环。

while语句的语法结构

**<font style="color:#F33232;">while（条件表达式）{</font>**

**<font style="color:#F33232;">循环体代码</font>**

**<font style="color:#F33232;">}</font>**

执行思路：

（1）、先执行条件表达式，如果结果为true，则执行循环体代码；如果为false，则退出循环，执行后面的代码

（2）、执行循环体代码

（3）、循环体代码执行完毕后，程序会继续判断执行条件表达式，如条件仍为true，则会继续执行循环体，直到循环条件为false时，整个循环过程才会结束

注意：

1、while循环里面也有计数器，初始化变量

2、while循环里应该也有操作表达式，完成计数器的更新，**<font style="color:#F33232;">防止死循环</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">       var i=0;//1:创建初始化一个变量</font>

<font style="color:#595959;">       while(i<5){// 2:在循环中设置一个条件表达式</font>

<font style="color:#595959;">        alert(i);</font>

<font style="color:#595959;">        i++;  // 3:定义一个更新表达式，每次更新初始化变量</font>

<font style="color:#595959;">       }</font>

<font style="color:#595959;">    </script></font>

课堂小练习：

1、打印人的一生，从1岁到100岁

2、计算1-100之间所有整数的和

<font style="color:#595959;"><script></font>

<font style="color:#595959;">       var i = 1,</font>

<font style="color:#595959;">        sum = 0;</font>

<font style="color:#595959;">      while (i < 100) {</font>

<font style="color:#595959;">        sum += i;</font>

<font style="color:#595959;">        i++;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(sum);</font>

<font style="color:#595959;">    </script></font>

3、弹出一个提示框，你爱我吗？如果输入我爱你，则提示结束，否则，一直循环

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      var str;</font>

<font style="color:#595959;">      while (str != "我爱你") {</font>

<font style="color:#595959;">        str = prompt("我爱你");</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

### 3、do···while循环
do···while语句其实是while语句的一个变体，该循环会**<font style="color:#F33232;">先执行一次代码块</font>**，然后对条件表示式进行判断，**<font style="color:#F33232;">如果条件为真，就会重复执行循环体，否则退出循环</font>**

语法结构

**<font style="color:#F33232;">do{</font>**

**<font style="color:#F33232;">循环体</font>**

**<font style="color:#F33232;">}while（条件表达式）</font>**

执行思路：

先执行一次循环体，再判断条件，如果条件表达式结果为真，则继续执行循环体，否则退出循环；

**<font style="color:#F33232;">do...while可以保证循环体至少执行一次，而while不行 </font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">    do {</font>

<font style="color:#595959;">        str = prompt("你爱我吗？");</font>

<font style="color:#595959;">      } while (str != "我爱你");</font>

<font style="color:#595959;">    </script></font>

### 4、continue、break关键字
（1）、continue关键字

可以用来**<font style="color:#F33232;">跳过当次循环</font>**，同样continue也是**<font style="color:#F33232;">默认只会对离他最近的循环起作用</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">     for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        if (i == 2) {</font>

<font style="color:#595959;">          continue;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        console.log(i);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

（2）、 break关键字

可以用来**<font style="color:#F33232;">退出循环语句</font>**；会**<font style="color:#F33232;">立即终止离他最近的那个循环语句</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        console.log(i);</font>

<font style="color:#595959;">        //break;//用来结束for的循环语句，for只会循环一次</font>

<font style="color:#595959;">        if (i == 2) {</font>

<font style="color:#595959;">          break; //这个break是对整个for循环起作用的</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>





<font style="color:#595959;">      for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        console.log("@外层循环" + i);</font>

<font style="color:#595959;">        for (var j = 0; j < 5; j++) {</font>

<font style="color:#595959;">          break; //只会结束离他最近的内层循环</font>

<font style="color:#595959;">          console.log("内层循环" + j);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

（3）、break指定结束循环体

可以**<font style="color:#F33232;">为循环语句创建一个标签名，来标识当前的循环</font>**；

语法：

**<font style="color:#F33232;">标签名:循环语句</font>**

使用break语句时，break 标签名，可结束指定的循环，而不是最近的

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      outer: for (var i = 0; i < 5; i++) {</font>

<font style="color:#595959;">        console.log("@外层循环" + i);</font>

<font style="color:#595959;">        for (var j = 0; j < 5; j++) {</font>

<font style="color:#595959;">          break outer; //指定结束外层的for循环</font>

<font style="color:#595959;">          console.log("内层循环" + j);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>



















## 1、对象的初识
### （1）、对象的定义
现实生活中，万物皆对象，对象是一个**<font style="color:#F33232;">具体的事物</font>**，看得见摸得着的实物。例如一本书，一辆汽车，一个人可以是“对象”，一个数据库，一张网页，一个与远程服务器的连接也可以是“对象”。

例子：

明星、女朋友、班主任、苹果、手机

周星驰、小明的女朋友、这个班的班主任、这个被咬了一口的苹果、小王的手机

在JS中，对象是一组**<font style="color:#F33232;">无序</font>**的**<font style="color:#F33232;">相关属性和方法</font>**的集合，所有的实物都是对象，例如字符串、数值、数组、函数等

属性：事物的**<font style="color:#F33232;">特征</font>**，在对象中用**<font style="color:#F33232;">属性</font>**来表示（常用名词）

方法：事物的**<font style="color:#F33232;">行为</font>**，在对象中用**<font style="color:#F33232;">方法</font>**来表示（常用动词）

例子：手机对象

属性：大小、颜色、重量、屏幕尺寸、厚度等

方法：打电话、发短信、聊微信、玩游戏等

例子：桌子

属性：长宽，材质，颜色，

方法：放东西，写字，吃饭

例子：电脑

属性：cpu,显卡，固态，颜色，尺寸，

方法：写代码，看视频，开会议，聊天

### （2）、对象的意义
保存一个值时，可以使用变量

保存多个值（一组值）时，可以使用数组。但数组元素之间信息不连贯，无连接，表达不清楚

如果保存一个人完整的信息？

JS中的**<font style="color:#F33232;">对象表达结构更清晰，更强大</font>**。

### （3）、对象的分类
对象属于一种复合的数据类型，在对象中**<font style="color:#F33232;">可以保存</font>**多个**<font style="color:#F33232;">不同数据类型</font>**的属性，让信息与信息之间有联系，关系明确，操作起来也更加方便

**<font style="color:#F33232;">1.内建对象</font>**--有ES标准中定义的对象，在任何的ES的实现中都可以使用，eg:Math String Boolean function object

**<font style="color:#F33232;">2:宿主对象</font>**--由JS的运行环境提供的对象，目前来讲，主要指浏览器提供的对象，eg：BOM（浏览器对象模型） DOM(文档对象模型) 两组对象，里面各自都有很多 

**<font style="color:#F33232;">3:自定义对象</font>**--由开发人员创建的对象 

## 2、创建对象：利用new Object创建对象
### （1）、对象的基本操作
创建对象

使用**<font style="color:#F33232;">new</font>**关键字调用的函数，就是构建函数constructor， **<font style="color:#F33232;">构建函数是专门用来创建对象的函数</font>**

使用typeof检查一个对象时，则会返回object

向对象添加属性：**<font style="color:#F33232;">对象.属性名=属性值;</font>** 

```javascript
<script>
      var obj = new Object();
      obj.name = "张三";//向obj中添加一个name属性，name属性值为'张三'
      obj.gender = "男";//向obj中添加一个gender属性
      obj.age = 18;//向obj中添加一个age属性
</script>
```

注意：

我们是利用 =赋值运算符的方法，添加对象的属性和方法

每个属性和方法之间用**<font style="color:#F33232;">；分号结束</font>**

**<font style="color:#F33232;">修改</font>**对象属性：**<font style="color:#F33232;">对象.属性名=新值</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      obj.name = "孙悟空";</font>

<font style="color:#595959;">    </script></font>

**<font style="color:#F33232;">删除</font>**对象的属性：**<font style="color:#F33232;">delete 对象.属性名</font>**

```javascript
<script>
      delete obj.name;//删除name属性
      console.log(obj.name)//undefined
    </script>
```

### （2）、属性名与属性值
属性名：

-对象的属性名不强制性要求遵守标识符号的规范，什么名字都可以使用

-但是我们使用还是尽量按照标识符的规范去做

-如果要使用**<font style="color:#F33232;">特殊的属性名</font>**，例如数字，不能采用"."的方式来操作，需要**<font style="color:#F33232;">用对象名['属性名']</font>**来读取

使用[]这种形式去操作属性，更加灵活，在[]中可以直接传递一个变量，这样变量值是多少就会读哪个属性

```javascript
<script>
      var obj = new Object();
      obj.name = "tom"; //向对象中添加属性
      obj["123"] = "你好";
      var n = "123"; //把'123'属性赋值给n
      console.log(obj["123"]); //读取obj的'123'属性
      console.log(obj[n]); //读取obj的'123'属性
    </script>
```

属性值：

**<font style="color:#F33232;">JS对象</font>**的**<font style="color:#F33232;">属性值</font>**，可以是任意的数据类型,甚至**<font style="color:#F33232;">可以是对象</font>**

```javascript
<script>
      obj.test = true;
      obj.test = undefined;
      obj.test = "true";
      obj.test = 123;
      // 创建一个对象
      var obj2 = new Object();
      obj2.name = "猪八戒";
      obj.test = obj2;
</script>
in运算符：
-通过该运算符可以检查一个对象中是否含有指定的属性， 如果有则返回true，没有则返回false
-语法："属性名" in 对象
<script>
      //检查obj中是否含有test2属性
      console.log("test2" in obj);//false
      console.log("test" in obj);//true
    </script>
```

### （3）、基本和引用数据类型
基本数据类型：String Number Boolean Null Undefined

引用数据类型：Object

1、JS中的变量都是保存到栈内存里的

2、基本数据类型<font style="color:#F33232;">的</font>**<font style="color:#F33232;">值</font>**直接在**<font style="color:#F33232;">栈内</font>**存中存储，值与值之间是独立存在的，**<font style="color:#F33232;">修改</font>**一个**<font style="color:#F33232;">变量不会影响其他的变量</font>**

3、引用数据类型<font style="color:#F33232;">的</font>**<font style="color:#F33232;">值</font>**直接保存到**<font style="color:#F33232;">堆内存</font>**中的，每创建一个新的对象，就会在堆内存中开辟一个新的空间，而**<font style="color:#F33232;">变量保存</font>**的是**<font style="color:#F33232;">对象的内存地址</font>**（对象的引用），**<font style="color:#F33232;">如果两个变量保存的是同一个对象引用，当一个通过一个变量修改属性时，另一个也会受到影响</font>**

4、比较两个基本属性类型的值时，就是比较值；

比较两个引用数据类型时，它是比较对象的内存地址，如果两个对象时一模一样的，但是地址不同，他也会返回false

```javascript
<script>
  //基本类型值存储在栈内存中
       var a=123;
       var b=a;
       a++;
       console.log("a="+a);//124
       console.log("b="+b);//123 ，因为b的变化不会影响到a
  
// 引用类型值存储在堆内存中，栈内存中保存的是指向堆内存的地址
       var obj=new Object;
       obj.name='java';
       var obj2=obj
      //  修改obj的name值
      obj.name='web'
       console.log(obj.name);//web
       console.log(obj2.name);//web
                              //因为obj和obj2指向同一个对象
    </script>
```

（3）、理解栈内存堆内存

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693835494-2891a65e-9669-44ce-a553-063bcbe565aa.png)

## 1、创建对象方式二
### （1）、利用字面量创建对象
对象字面量：就是花括号**<font style="color:#FF0000;">{}</font>**里面包含了表达这个具体事物（对象）的属性和方法

```javascript
<script>
      var obj = {};//创建一个空对象
      var obj2 = {
              name: "猪八戒",
              age: 28,
              gender: "男",
              sayHi: function () {
                console.log('hi~');
              }
            };
</script>
```

注意：

对象内的属性或者方法我们采取**<font style="color:#FF0000;">健值对</font>**的形式，

键:值

**<font style="color:#FF0000;">属性名：属性值</font>**

多个属性或者方法中间用**<font style="color:#FF0000;">逗号</font>**隔开，最后一个属性或者方法逗号可以省略

**<font style="color:#FF0000;">方法</font>**冒号**<font style="color:#FF0000;">后跟</font>**的是一个**<font style="color:#FF0000;">匿名函数</font>**

读取对象

调用对象的属性	**<font style="color:#FF0000;">对象名.属性名</font>**

**<font style="color:#FF0000;">对象名['属性名']</font>**

调用对象的方法	**<font style="color:#FF0000;">对象名.方法名（）</font>**

```javascript
<script>
        //读取对象属性
        console.log(obj2.name);
        console.log(obj2['age']);
        //读取对象方法
        obj.sayHi()
</script>
```

### （2）、对象的方法
函数也可以成为对象的属性，如果一个函数作为一个对象的属性保存，那么我们称这个函数是这个对象（obj）的方法，调用函数就说调用对象（obj）的方法（method）， 但是他只是名称上的区别，跟函数没有其他的区别

```javascript
<script>
        /* 创建对象一*/
        var obj=new Object();
        //向对象中添加属性
        obj.name="孙悟空";
        obj.age=18;
        //对象的属性值可以是任何的数据类型，也可以是个函数
        obj.sayName=function(){
            console.log(obj.name);
        };
        console.log(obj.sayName);//打印函数属性
        obj.sayName();//调用obj.sayName()函数。也叫调用obj的sayName方法
        /* 创建对象二 */
         // function sayHi(){
        //   console.log('hallo')
        // }
       var obj2={
        name:'小明',
        age:18,
        sex:'男',
        job:123,			方法书写
        // 第一种写法
        // sayHi:sayHi,（之前定义好的函数）		//方法：函数名 
        // 第二种写法
        // sayHi:function(){				//方法：匿名函数
           console.log(obj2.name)
         }
        // 第三种写法es6
        sayHi(){					//去掉：function
          console.log('hallo')
        }
       };
       console.log(obj2.name)
       console.log(obj2['sex'])
       console.log(obj2.sayHi)
       obj2.sayHi()
</script>
```

### （3）、枚举（**<font style="color:#FF0000;">遍历</font>**）对象属性
使用for...in 语句

语法：

**<font style="color:#FF0000;">for(var 变量 in 对象){ }</font>**

for...in语句 对象中有几个属性，循环体就会执行几次，每次执行时，会将对象中的一个**<font style="color:#FF0000;">属性的名字</font>**赋值**<font style="color:#FF0000;">给 变量</font>**

```javascript
<script>
     var obj={
        name:"孙悟空",
        age:18,
        gender:"男",
        address:"花果山"
        };
        console.log(obj.name)
        for(var n in obj){
          console.log('属性名：'+n)//对象中每个属性的名字赋值给n
          console.log('属性值：'+obj[n]);//通过变量n读取属性值， []读取变量                 
      }
</script>
```

### （4）、区分变量和属性，函数和方法
变量和属性都是用来**<font style="color:#FF0000;">存储数据</font>**的；

变量是**<font style="color:#FF0000;">单独声明并赋值</font>**，**<font style="color:#FF0000;">使用</font>**的时候直接写**<font style="color:#FF0000;">变量名</font>**，是**<font style="color:#FF0000;">单独存在</font>**的；

属性在对象中，**<font style="color:#FF0000;">不需要使声明</font>**，**<font style="color:#FF0000;">使用</font>**时，也是**<font style="color:#FF0000;">对象.属性</font>**，**<font style="color:#FF0000;">依托对象存在</font>**的；

函数和方法都是用来**<font style="color:#FF0000;">实现某种功能</font>**的，可以做某件事，但函数是**<font style="color:#FF0000;">单独存在</font>**的，方法是**<font style="color:#FF0000;">依托对象</font>**存在的

### （5）、this的初印象
解析器在**<font style="color:#FF0000;">调用函数</font>**每次都会向函数内部**<font style="color:#FF0000;">传</font>**递一个**<font style="color:#FF0000;">隐含的参数</font>**，这个隐含的参数就是this,this是参数，浏览器传输的，直接拿来用的，this指向的是一个对象，这个对象我们称为函数执行的上下文对象。

根据函数的调用方式的不同，this会指向不同的对象:

1:当以**<font style="color:#FF0000;">函数的形式调用时，this是window</font>**

2:当以**<font style="color:#FF0000;">方法</font>**的形式**<font style="color:#FF0000;">调用</font>**时， **<font style="color:#FF0000;">谁调用方法,this就是谁</font>**

3:当以**<font style="color:#FF0000;">构建函数</font>**的形式**<font style="color:#FF0000;">调用</font>**时，**<font style="color:#FF0000;">this就是新创建的那个对象</font>**，this就是当前对象，我们找的this就是当前作用域取值范围（后面讲到构造函数时，用到的）

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>对象方法调用示例</title>
</head>
<body>
  <script>
    //需求：可以输出各自obj的名字
    //创建一个fun()函数
    function fun() {
      console.log(this.name);
    }
    //创建两个对象
    var obj = {
      name: "孙悟空",
      sayName: fun,
    };

    var obj2 = {
      name: "沙和尚",
      sayName: fun,
    };
    var name = "全局的name属性";

    fun(); //==window.fun()  以函数的形式调用，this就是window
    obj.sayName(); //孙悟空  以方法的形式调用，this是调用方法的对象
    obj2.sayName(); //沙和尚

    // 创建对象方式三：使用构造函数
    // 定义构造函数
    function Person(name) {
      this.name = name;
      this.sayName = function () {
        console.log(this.name);
      };
    }
    // 使用构造函数创建对象
    var person1 = new Person("猪八戒");
    var person2 = new Person("唐僧");
    person1.sayName(); // 输出：猪八戒
    person2.sayName(); // 输出：唐僧
  </script>
</body>
</html>
```

## 2、创建对象方式三
使用**<font style="color:#FF0000;">工厂方法</font>**创建对象，通过该方法可以大批量的创建对象

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>对象创建示例</title>
</head>
<body>
    <script>
        //需求：创建一个对象
        var obj = {
            name: "孙悟空",
            age: 18,
            gender: "男",
            sayName: function () {
                alert(this.name);
            },
        };
        /* 需求：批量的创建对象
            使用工厂方法创建对象
        */
        //函数里面加对象,靠参数生产
        function createPerson(name, age, gender) {
            //创建一个新的对象
            var obj = new Object();
            //向对象中添加属性
            obj.name = name;
            obj.age = age;
            obj.gender = gender;
            obj.sayName = function () {
                alert(this.name);
            };
            //将新的对象返回
            return obj;
        }
        var obj2 = createPerson("猪八戒", 28, "男");
        var obj3 = createPerson("沙和尚", 38, "男");
        var obj4 = createPerson("白骨精", 18, "女");

        // 调用对象的方法
        obj.sayName();
        obj2.sayName();
        obj3.sayName();
        obj4.sayName();
    </script>
</body>
</html>

```

问题：

使用工厂方法创建的对象，使用的构造函数都是Object

所以**<font style="color:#FF0000;">创建的对象都是Object这个类型</font>**

就导致我们无法区分多种不同类型的对象

## 3、创建对象方式四
### （1）、利用构造函数创建对象
**<font style="color:#FF0000;">构造函数：</font>**是一种特殊的函数，主要用来**<font style="color:#FF0000;">初始化对象，即为对象成员变量赋值初始值</font>**，它**<font style="color:#DF2A3F;">综合new运算符</font>**一起使用。我们可以把对象中一些公共属性和方法抽取出来，然后封装到这个函数里面

构造函数语法规范：

**<font style="color:#FF0000;">function 构造函数名(){</font>**

**<font style="color:#FF0000;">this.属性=值；</font>**

**<font style="color:#FF0000;">this.方法=function(){}</font>**

**<font style="color:#FF0000;">}</font>**

**<font style="color:#FF0000;">new 构造函数名();</font>**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script>
        function Person(name, age, gender) {
            // alert(this);//this就是新建的对象，然后赋值给per
            this.name = name;
            this.age = age;
            this.gender = gender;
            this.sayName = function () {
                alert(this.name)
            };
        }
        var per = new Person("孙悟空", 18, "男");
        var per2 = new Person("玉兔精", 16, "女");
        var per3 = new Person("沙和尚", 28, "男");
        console.log(per);
        console.log(per2);
        console.log(per3);
        // 以下添加根据性别筛选人员的功能
        function filterByGender(persons, gender) {
            return persons.filter(person => person.gender === gender);
        }
        var malePersons = filterByGender([per, per2, per3], "男");
        console.log(malePersons);
    </script>
</body>
</html>

```

注意： 

构造函数就是一个普通的函数，创建方式和普通函数没有区别，不同的是构造函数习惯上**<font style="color:#FF0000;">首字母大写</font>**

构造函数和普通函数的区别就是调用方式的不同，普通函数是直接调用，构造函数需要使用**<font style="color:#FF0000;">new关键字来调用</font>**

构造函数**<font style="color:#FF0000;">创建属性和方法</font>**，必须**<font style="color:#FF0000;">结合this</font>**使用，此时的this就是新创建的那个对象；

### （2）、构造函数（new关键字）的执行流程：
a:立刻创建一个新的对象

b:将新建的对象设置为函数中this，在构造函数中可以使用this来引用新建的对象

c:逐行执行函数中的代码

d:将新建的**<font style="color:#FF0000;">对象作为返回值返回</font>**

new一个对象时，会在**<font style="color:#FF0000;">堆</font>**中开辟一片区域，new Person()会在堆中开辟一块区域

### （3）、对象的实例化
使用同一个构造函数创建的对象，我们称为**<font style="color:#FF0000;">一类对象</font>**，也将一个构造函数称为一个**<font style="color:#FF0000;">类</font>**，例如明星、汽车设计图纸

我们将通过一个**<font style="color:#FF0000;">构造函数创建的对象</font>**，称为**<font style="color:#FF0000;">该类的实例</font>**，例如刘德华、某一辆宝马车，

我们利用**<font style="color:#FF0000;">构造函数创建对象的过程</font>**，我们也称为**<font style="color:#FF0000;">对象的实例化</font>**

### （4）、instanceof
作用：使用instanceof可以检查一个**<font style="color:#FF0000;">对象</font>**是否是一个**<font style="color:#FF0000;">类的实例</font>**	**<font style="color:#FF0000;">//亲子鉴定</font>**

<font style="color:#000000;">语法：</font>**<font style="color:#FF0000;">对象 instanceof 构造函数</font>**,如果是，则返回true，否则返回false

注意：**<font style="color:#FF0000;">所有</font>**的**<font style="color:#FF0000;">对象</font>**都是**<font style="color:#FF0000;">Object</font>**（对象源头）的后代，所以任何的对象和我们的instanceof 检查时,都是他的

```html
<script>
    console.log(dog instanceof Person);
</script>
```

### （5）、构造函数优化
以上demo，我们创建一个Person构造函数，在Person构造函数中， 为每一个对象都添加了一个sayName的方法

目前我们的方法是在构造函数内部创建的，也就是构造函数每执行一次就会创建一个新的sayName方法，也是所有实例的sayName都是唯一的，这样就导致了构造函数执行一次就会创建一个新的方法，执行一万次就会创建一万个新的方法，而这一万个对象都是一样的，这是没有必要的，完全可以使所有的对象共享同一个方法

```html
<script>
    function Person(name, age, gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        // 向对象中添加一个方法
        this.sayName = fun;
    }
    // 将sayName方法在全局作用域中定义
    function fun() {
        alert("hello大家好，我是" + this.name);
    }
    // 创建一个Person实例
    var per = new Person("孙悟空", 18, "男");
    var per2 = new Person("猪八戒", 28, "男");
    per.sayName();// 孙悟空
    per2.sayName();// 猪八戒
    console.log(per.sayName === per2.sayName);// true
</script>
```

注意：以上优化也有一定的问题，如**<font style="color:#FF0000;">将函数定义在全局作用域，污染了全局作用域的命名空间</font>**

而且定义在全局作用域中也很不安全

课堂小练习

1、创建一个电脑对象，该对象要有颜色、重量、品牌、型号、可以看电影，听音乐、打游戏、敲代码

```javascript
// 创建一个电脑对象
var computer = {
  color: '黑色',
  weight: '2.5kg',
  brand: '联想',
  model: 'ThinkPad T480',
  // 看电影的方法
  watchMovie: function() {
    console.log('正在播放电影...');
  },
  // 听音乐的方法
  listenMusic: function() {
    console.log('正在播放音乐...');
  },
  // 打游戏的方法
  playGame: function() {
    console.log('正在玩游戏...');
  }
};

// 使用电脑看电影
computer.watchMovie();
// 使用电脑听音乐
computer.listenMusic();
// 使用电脑打游戏
computer.playGame();
```

2、创建一个按钮对象，该对象中需要包含宽、高、背景颜色和点击行为

3、创建一个车的对象，该对象要有重量、颜色、牌子、可以载人、拉货和耕田

## 4、原型对象
### （1）、 原型对象定义
我们所创建的每一个函数，解析器都会向函数中添加一个属性prototype,这个属性对应着一个对象，这个对象就是我们所谓的原型对象(**<font style="color:#FF0000;">prototype是属性名，它的值是一个对象，这个对象叫原型对象</font>**),**<font style="color:#FF0000;">默认</font>**情况下，它是一个**<font style="color:#FF0000;">空</font>**对象

如果我们的函数作为普通函数调用，prototype没有任何作用，

当**<font style="color:#FF0000;">函数以构造函数的形式调用</font>**时，它所**<font style="color:#FF0000;">创建的对象</font>**都会**<font style="color:#FF0000;">有</font>**一个**<font style="color:#FF0000;">隐含的属性</font>**，**<font style="color:#FF0000;">指向该构造函数的原型对象，</font>**我们通过**<font style="color:#FF0000;">__proto__</font>**来**<font style="color:#FF0000;">访问该属性</font>**

### （2）、原型对象的作用 
原型对象就相当于一个**<font style="color:#FF0000;">公共</font>**的**<font style="color:#FF0000;">区域</font>**，所有同一个类的实例都可以访问到这个原型对象，我们可以将对象中共有的内容，统一设置到原型对象中，当我们访问对象的一个属性或方法时，它会先在对象自身中寻找，如果有就直接使用，如果没有就去原型对象中寻找，然后使用。

以后我们创建构造函数时，可以将这些对象共有的属性和方法，统一添加到构造函数中，这样就不用分别给每一个对象添加，也不会影响到全局作用域，就可以使每个对象，都具有这样的属性和方法了

**<font style="color:#FF0000;">//相当于家族财产，家族有相当于我有</font>**

```javascript
<script>
      //创建函数
      function MyClass() {}
      //向MyClass的原型对象中添加属性a
      MyClass.prototype.a = 123;
      //向MyClass中添加一个方法
      MyClass.prototype.sayHello = function () {
        alert("hello");
      };
      //console.log(MyClass.prototype, );

      //添加实例
      var mc = new MyClass(); //隐含属性__proto__
      var mc2 = new MyClass();

      console.log(MyClass.prototype,"MyClass.prototype");//object
      console.log(mc.__proto__,'mc.__proto__');//object
      // console.log(MyClass.prototype==mc.__proto__);//true
      //  mc.sayHello();
      /*简单理解： 
       MyClass 是mc，mc2的祖先，祖先有一个宝藏，里面放一些宝藏，
         它的后代都可以看到，如果后代本身就有这个宝藏，就不用祖先藏宝库里，没有就用
       */
    </script>
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693835836-2fc22c9b-f9f3-4a0a-8061-f6ef487b64ac.png)

### （3）、检查对象中是否含有某个属性
a:使用**<font style="color:#FF0000;">in检查对象</font>**中**<font style="color:#FF0000;">是否含有某个属性</font>**时，如果**<font style="color:#FF0000;">对象</font>**中**<font style="color:#FF0000;">没有</font>**，**<font style="color:#FF0000;">原型</font>**中**<font style="color:#FF0000;">有</font>**，也会返回**<font style="color:#FF0000;">true</font>**

b:可以使用对象的**<font style="color:#FF0000;">hasOwnproperty()</font>**来**<font style="color:#FF0000;">检查对象自身中是否含有该属性</font>**,使用该方法只有当对象自身中含有属性时，才会返回true

```javascript
<script>
      /* 创建一个构造函数 */
      function MyClass() {}
      //向MyClass的原型中添加一个name属性
      MyClass.prototype.name = "我是原型中的name";
      var mc = new MyClass();
      mc.age = 18;
      console.log(mc.name);
      console.log("name" in mc); //true
      console.log(mc.hasOwnProperty("name")); //false
</script>
```

### （4）、 原型链
<font style="color:rgba(0, 0, 0, 0.8);">原型对象也是对象，所以它也有原型</font>

<font style="color:rgba(0, 0, 0, 0.8);">当我们使用一个对象的属性或方法时，会先在自身中寻找，自身中如果有，则直接使用，如果没有，则去原型对象中寻找，如果原型对象中有，则使用，如果没有，则去原型对象的原型中寻找，直到找到</font><font style="color:#DF2A3F;">Object</font><font style="color:rgba(0, 0, 0, 0.8);">对象的原型，</font>`<font style="color:rgb(0, 0, 0);">Object.prototype</font>`<font style="color:rgba(0, 0, 0, 0.8);"> 是原型链的「终点」，它的 </font>`<font style="color:rgb(0, 0, 0);">[[Prototype]]</font>`<font style="color:rgba(0, 0, 0, 0.8);">（原型）是 </font>`<font style="color:rgb(0, 0, 0);">null</font>`<font style="color:rgba(0, 0, 0, 0.8);">，当访问对象的某个属性时，若沿原型链一直查到 </font>`<font style="color:rgb(0, 0, 0);">Object.prototype</font>`<font style="color:rgba(0, 0, 0, 0.8);"> 仍未找到，会继续查 </font>`<font style="color:rgb(0, 0, 0);">Object.prototype</font>`<font style="color:rgba(0, 0, 0, 0.8);"> 的原型（即 </font>`<font style="color:rgb(0, 0, 0);">null</font>`<font style="color:rgba(0, 0, 0, 0.8);">），此时直接返回 </font>`<font style="color:rgb(0, 0, 0);">undefined</font>`<font style="color:rgba(0, 0, 0, 0.8);">（不会再继续查找）</font>

+ **<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">构造函数（Phone）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">：</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">是一个「函数对象」，有自己的属性 / 方法（静态成员：</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">version</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">、</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">introduce()</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">），这些和原型无关，只能通过 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">Phone.xxx</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 访问；</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">有一个 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">prototype</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 属性 → </font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">专门指向原型对象（Phone.prototype）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">，这是构造函数和原型对象的 “单向通道”。</font>
+ **<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">原型对象（Phone.prototype）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">：</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">是一个「普通对象」，存所有实例共享的方法 / 属性（</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">call()</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">、</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">type</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">），节省内存；</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">天生自带 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">constructor</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 属性 → </font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">反向指向构造函数（Phone）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">，相当于 “回形针”，能通过原型找到它的构造函数；</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">有一个 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">__proto__</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 属性 → </font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">指向顶层原型（Object.prototype）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">，这是原型链的 “向上通道”。</font>
+ **<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">实例对象（huawei）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">：</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">是构造函数 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">new</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 出来的普通对象，有自己的属性（</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">brand</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">、</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">price</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">），这些是 “私有的”；</font>
+ <font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">有一个 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">__proto__</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 属性 → </font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">指向构造函数的原型对象（Phone.prototype）</font>**<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">，这是实例能访问原型方法的 “关键通道”（比如 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">huawei.call()</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 其实是通过 </font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);">__proto__</font>`<font style="color:rgb(31, 35, 41);background-color:rgba(0, 0, 0, 0);"> 找到的）。</font>

（具体在js高级的时候讲述）

```javascript
<script>
       /* toString是属于Object原型上的一个方法。
      toString返回 '[object type]' 其中type是对象的类型,type的值可以是Object，
      注意,当数组调用则正常转化*/
  // 返回当前对象的 “类型标识字符串”，格式固定为 [object 构造函数名]
      var obj = { sex: "男" };
      console.log(obj.toString());// [object Object]
      //返回来的确实是返回一个【表示对象】的【字符串】
</script>
```

## 5、垃圾回收
就像人生活时间长了，会产生垃圾一样，程序运行过程中，也会产生一些垃圾，这些垃圾积攒过多以后，会导致程序运行的速度过慢，所以我们需要一个垃圾回收的机制，来处理程序运行过程中产生的垃圾

当一个对象没有任何的变量或者属性对它进行引用，此时我们将永远无法操作该对象，此时这种对象就是一个垃圾这种对象过多，会占用我们大量的内存空间，导致我们程序运行变慢，这种垃圾我们必须清理

在JS中拥有自动的垃圾回收机制，会自动将这些垃圾对象从内存中销毁，我们不需要也不能进行垃圾回收

我们需要做的只是将**<font style="color:#FF0000;">不再使用的对象设置null</font>**即可

```javascript
<script>
        var obj=new Object();
       //对对象进行各种操作
       obj.prototype=123;
       console.log(obj.prototype)
       obj=null;
</script>
```

## 6、创建对象方式五 class
JavaScript 语言中，生成实例对象的传统方法是通过构造函数，

ES6 提供了更接近传统语言的写法，引入了 Class（类）这个概念，作为对象的模板。通过class关键字，可以定义类。

class初体验

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script>
    // 定义ES5的PersonO构造函数
    function PersonO(username, password) {
      this.username = username;
      this.password = password;
    }
    // 为PersonO的原型添加getstr方法
    PersonO.prototype.getstr = function () {
      console.log("用户名：" + this.username + ",密码：" + this.password);
    };
    // 实例化PersonO对象
    const po1 = new PersonO("章三", "abc123");
    console.log(po1);
    po1.getstr();

    // 使用ES6 class语法实现
    class PersonN {
      // 构造方法，当new实例对象时自动执行
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
      // 定义getstr方法
      getstr() {
        console.log("用户名：" + this.username + "，密码：" + this.password);
      }
    }
    const pn1 = new PersonN("123456", "789012");
    pn1.getstr();
  </script>
</body>
</html>

```

上述代码首先使用ES5的构造函数和原型方式定义了`PersonO`，实现了获取用户名和密码并打印的功能。然后使用ES6的`class`语法定义了`PersonN`类，同样实现了类似功能，最后分别实例化并调用了它们的`getstr`方法。整体代码在HTML页面中运行展示。

说明：使用class关键词 声明类，constructor为构造方法，一个类必须有constructor()方法，

如果没有显式定义，一个空的constructor()方法会被默认添加，

this关键字则代表实例对象，getstr()为普通方法，不要用es5完整写法，getstr()存在 prototype上。

pn1.constructor === pn1.prototype.constructor // true



<font style="color:#D4D4D4;">    </font>在JavaScript中，创建对象有多种方法，每种方法都有其特点和适用场景，以下是几种常见的对象创建方法：

<font style="color:#B5CEA8;">1.</font><font style="color:#D4D4D4;"> **</font><font style="color:#DCDCAA;">利用</font><font style="color:#CE9178;">`new Object`</font><font style="color:#9CDCFE;">创建对象</font><font style="color:#D4D4D4;">**</font><font style="color:#D4D4D4;"> **</font><font style="color:#DCDCAA;">利用</font><font style="color:#CE9178;">`new Object`</font><font style="color:#9CDCFE;">创建对象</font><font style="color:#D4D4D4;">**</font>1. **利用`new Object`创建对象**

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">使用</font><font style="color:#CE9178;">`new`</font><font style="color:#DCDCAA;">关键字调用</font><font style="color:#CE9178;">`Object`</font><font style="color:#9CDCFE;">函数来创建对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">可以通过</font><font style="color:#CE9178;">`对象.属性名 = 属性值`</font><font style="color:#9CDCFE;">的方式向对象添加属性</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">通过</font><font style="color:#CE9178;">`对象.属性名 = 新值`</font><font style="color:#9CDCFE;">修改属性</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">使用</font><font style="color:#CE9178;">`delete 对象.属性名`</font><font style="color:#9CDCFE;">删除属性</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">对象的属性名不强制遵守标识符规范</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">但建议遵循</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">      </font><font style="color:#9CDCFE;">对于特殊属性名</font><font style="color:#D4D4D4;">（</font><font style="color:#9CDCFE;">如数字</font><font style="color:#D4D4D4;">），</font><font style="color:#DCDCAA;">可以使用</font><font style="color:#CE9178;">`对象名['属性名']`</font><font style="color:#9CDCFE;">的方式操作</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">这种方式更灵活</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">可在方括号中直接传递变量</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">对象的属性值可以是任意数据类型</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">甚至可以是对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">可以使用</font><font style="color:#CE9178;">`in`</font><font style="color:#9CDCFE;">运算符检查对象中是否含有指定属性</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">语法为</font><font style="color:#CE9178;">`"属性名" in 对象`</font><font style="color:#D4D4D4;">。</font>

<font style="color:#B5CEA8;">2.</font><font style="color:#D4D4D4;"> **</font><font style="color:#9CDCFE;">利用字面量创建对象</font><font style="color:#D4D4D4;">**</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">使用花括号</font><font style="color:#CE9178;">`{}`</font><font style="color:#9CDCFE;">包含对象的属性和方法</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">属性和方法以</font><font style="color:#D4D4D4;"> </font><font style="color:#9CDCFE;">键值对</font><font style="color:#D4D4D4;"> </font><font style="color:#9CDCFE;">的形式表示</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">多个属性或方法之间用逗号隔开</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">最后一个逗号可省略</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">方法的值是一个匿名函数</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">读取对象属性可以使用</font><font style="color:#CE9178;">`对象名.属性名`</font><font style="color:#DCDCAA;">或</font><font style="color:#CE9178;">`对象名['属性名']`</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">调用对象方法使用</font><font style="color:#CE9178;">`对象名.方法名()`</font><font style="color:#D4D4D4;">。</font>

<font style="color:#B5CEA8;">3.</font><font style="color:#D4D4D4;"> **</font><font style="color:#9CDCFE;">使用工厂方法创建对象</font><font style="color:#D4D4D4;">**</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">定义一个函数</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">在函数内部创建一个新对象</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">向对象添加属性和方法</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">最后返回该对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">这种方法可以批量创建对象</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">但创建的对象类型都是</font><font style="color:#CE9178;">`Object`</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">无法区分不同类型的对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#B5CEA8;">4.</font><font style="color:#D4D4D4;"> **</font><font style="color:#9CDCFE;">利用构造函数创建对象</font><font style="color:#D4D4D4;">**</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">构造函数是一种特殊函数</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">习惯上首字母大写</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">用于初始化对象</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">将对象的公共属性和方法封装在其中</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">构造函数内部使用</font><font style="color:#CE9178;">`this`</font><font style="color:#9CDCFE;">关键字来引用新创建的对象</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">通过</font><font style="color:#CE9178;">`this.属性 = 值`</font><font style="color:#DCDCAA;">和</font><font style="color:#CE9178;">`this.方法 = function() {}`</font><font style="color:#9CDCFE;">为对象添加属性和方法</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">构造函数需要使用</font><font style="color:#CE9178;">`new`</font><font style="color:#9CDCFE;">关键字来调用</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">执行流程包括创建新对象</font><font style="color:#D4D4D4;">、</font><font style="color:#DCDCAA;">将新对象设置为函数中的</font><font style="color:#CE9178;">`this`</font><font style="color:#D4D4D4;">、</font><font style="color:#9CDCFE;">执行函数代码</font><font style="color:#D4D4D4;">、</font><font style="color:#9CDCFE;">返回新对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">使用同一个构造函数创建的对象称为一类对象</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">构造函数也称为类</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">创建的对象是该类的实例</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">可以使用</font><font style="color:#CE9178;">`instanceof`</font><font style="color:#9CDCFE;">运算符检查一个对象是否是一个类的实例</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">语法为</font><font style="color:#CE9178;">`对象 instanceof 构造函数`</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">构造函数优化</font><font style="color:#D4D4D4;">：</font><font style="color:#9CDCFE;">为避免在构造函数内部为每个对象创建相同的方法</font><font style="color:#D4D4D4;">（</font><font style="color:#9CDCFE;">导致方法不共享且占用过多内存</font><font style="color:#D4D4D4;">），</font>

<font style="color:#D4D4D4;">        </font><font style="color:#9CDCFE;">可以将方法定义在全局作用域并赋值给构造函数中的属性</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">但这种方式会污染全局命名空间且不安全</font><font style="color:#D4D4D4;">。</font>

<font style="color:#B5CEA8;">5.</font><font style="color:#D4D4D4;"> **</font><font style="color:#DCDCAA;">使用</font><font style="color:#CE9178;">`class`</font><font style="color:#9CDCFE;">关键字创建对象</font><font style="color:#D4D4D4;">（</font><font style="color:#4FC1FF;">ES6</font><font style="color:#D4D4D4;">）**</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">通过</font><font style="color:#CE9178;">`class`</font><font style="color:#9CDCFE;">关键字定义类</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">类中包含构造方法</font><font style="color:#CE9178;">`constructor`</font><font style="color:#9CDCFE;">和普通方法</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">构造方法在</font><font style="color:#CE9178;">`new`</font><font style="color:#9CDCFE;">实例对象时自动执行</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">用于初始化对象的属性</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#9CDCFE;">普通方法必须使用特定语法</font><font style="color:#D4D4D4;">（</font><font style="color:#9CDCFE;">不能使用ES5的对象完整形式</font><font style="color:#D4D4D4;">），</font><font style="color:#DCDCAA;">方法存在于</font><font style="color:#CE9178;">`prototype`</font><font style="color:#9CDCFE;">上</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#DCDCAA;">一个类必须有</font><font style="color:#CE9178;">`constructor()`</font><font style="color:#9CDCFE;">方法</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">如果未显式定义</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">会默认添加一个空的</font><font style="color:#CE9178;">`constructor()`</font><font style="color:#9CDCFE;">方法</font><font style="color:#D4D4D4;">。</font>

<font style="color:#D4D4D4;">    - </font><font style="color:#CE9178;">`this`</font><font style="color:#9CDCFE;">关键字在类中代表实例对象</font><font style="color:#D4D4D4;">。</font>

<font style="color:#9CDCFE;">在实际开发中</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">根据具体需求选择合适的对象创建方法</font><font style="color:#D4D4D4;">。</font><font style="color:#9CDCFE;">如果只是简单创建一个对象</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">字面量方式可能比较方便</font><font style="color:#D4D4D4;">；</font>

<font style="color:#9CDCFE;">如果需要创建多个相似对象</font><font style="color:#D4D4D4;">，</font><font style="color:#DCDCAA;">可以考虑构造函数或</font><font style="color:#CE9178;">`class`</font><font style="color:#D4D4D4;">；</font>

<font style="color:#9CDCFE;">如果需要更灵活的创建方式</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">工厂方法也可使用</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">但要注意其局限性</font><font style="color:#D4D4D4;">。</font>

<font style="color:#9CDCFE;">同时</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">理解对象的创建过程和原理对于JavaScript编程非常重要</font><font style="color:#D4D4D4;">，</font><font style="color:#9CDCFE;">有助于更好地组织和管理代码</font><font style="color:#D4D4D4;">。</font>

    - 使用`new`关键字调用`Object`函数来创建对象。

    - 可以通过`对象.属性名 = 属性值`的方式向对象添加属性，通过`对象.属性名 = 新值`修改属性，使用`delete 对象.属性名`删除属性。

    - 对象的属性名不强制遵守标识符规范，但建议遵循。

      对于特殊属性名（如数字），可以使用`对象名['属性名']`的方式操作，这种方式更灵活，可在方括号中直接传递变量。

    - 对象的属性值可以是任意数据类型，甚至可以是对象。

    - 可以使用`in`运算符检查对象中是否含有指定属性，语法为`"属性名" in 对象`。



## 1、函数的概念
在JS里面，可能会定义非常多的相同代码或者功能相似的代码，这些代码需要大量重复使用

函数：就是**<font style="color:#F33232;">封装</font>**一段**<font style="color:#F33232;">可</font>**被**<font style="color:#F33232;">重复调用</font>**执行的**<font style="color:#F33232;">代码块</font>**。通过代码块可以实现在需要的的重复使用，使用typeof检查一个函数对象时，会返回function

函数的封装是把一个或者多个功能通过**<font style="color:#F33232;">函数的方式封装起来</font>**，**<font style="color:#F33232;">对外</font>**只**<font style="color:#F33232;">提供</font>**一个简单的函数**<font style="color:#F33232;">接口</font>**，简单理解：将很多衣服打包到一个行李箱,jQuery就是一个函数封装库，对外暴露一个顶级对象$

## 2、函数的使用
函数在使用时分为两步：**<font style="color:#F33232;">声明</font>**函数和**<font style="color:#F33232;">调用</font>**函数

### （1）、声明函数（创建函数）三种方式
#### 第一种方式 创建一个构造函数对象
——我们在实际开发中很少使用构造函数来创建一个函数对象

——可以将要封装的**<font style="color:#F33232;">代码以字符串的形式传递给构造函数</font>**

—— 封装到函数中的代码不会立即执行，函数中的代码会在函数调用的时候执行

<font style="color:#333333;">构造函数是一个函数，当使用new关键字调用时，它用于创建对象并初始化对象的属性和方法</font>

```javascript
<script>
      var fun = new Function("console.log('hello 这是我的第一个函数')");
      console.log(typeof fun);//function
      fun();
</script>
```

#### 第二种方式 使用函数声明来创建一个函数（常用）
**<font style="color:#F33232;">function 函数名（[形参1,形参2,形参3,形参4....形参n]）{</font>**

**<font style="color:#F33232;">执行语句.....</font>**

**<font style="color:#F33232;">}</font>**

```javascript
<script>
     function fun2() {
        console.log("这是我的第二个函数～～～");
        alert("hahahaha");
        document.write("wuwuwuwu");
      }
</script>
```

#### 第三种方式 使用函数表达式来创建一个函数（匿名函数）
**<font style="color:#F33232;">var 变量名=function（[形参1,形参2,形参3,形参4....形参n]）{</font>**

**<font style="color:#F33232;">语句.....</font>**

**<font style="color:#F33232;">}</font>**

**<font style="color:#F33232;">注意：变量名不是函数名</font>**

```javascript
<script>
    var fun3 = function () {
    console.log("我是匿名函数中的封装的代码");
  }; //相当于赋值语句
  fun3(); //调用函数
 </script>
```

注意：

由于函数一般是为了实现某个功能才定义的，所以通常我们将函数名命名为动词，例如getsum

### （2）、调用函数
调用函数语法：**<font style="color:#F33232;">变量名/函数名()</font>**

当调用函数时，函数中封装的代码会按照顺序执行

课堂小练习：1、利用函数计算1-100之间的累加和

## 3、函数的参数
### （1）、参数
在**<font style="color:#F33232;">声明</font>**函数时，可以在函数名称后面的**<font style="color:#F33232;">小括号</font>**里添加一些**<font style="color:#F33232;">参数</font>**，这些参数是**<font style="color:#F33232;">形参</font>**，而在**<font style="color:#F33232;">调用</font>**该函数时，同样也需要**<font style="color:#F33232;">传递</font>**相应**<font style="color:#F33232;">的参数</font>**，这些参数被称谓**<font style="color:#F33232;">实参</font>**。

形参：形式上的参数，函数定义的时候，传递的参数，当前并不知道是什么，**<font style="color:#F33232;">用来接收实参的，形参类似一个变量，声明了并未赋值</font>**，多个形参之间用**<font style="color:#F33232;">逗号隔开</font>**

实参：实际上的参数，函数调用的时候传递的参数，实参是传递给形参，相当于**<font style="color:#F33232;">给形参赋值</font>**

参数的作用：在函数内部某些值不能固定的时候，我们可以通过参数在调用函数时传递不同的值进去

语法结构：

**<font style="color:#F33232;">function 函数名（形参1,形参2····形参n）{	</font>**//声明函数的小括号里的是形参（形式上的参数）

**<font style="color:#F33232;">执行语句.....</font>**

**<font style="color:#F33232;">}</font>**

**<font style="color:#F33232;">函数名（实参1，实参2····）</font>**//在函数调用的小括号里面是实参（实际参数）

课堂小练习：1、利用函数求任意两个数的和

### （2）、形参和实参匹配的问题
如果形参和实参的**<font style="color:#F33232;">个数一致</font>**，则**<font style="color:#F33232;">正常</font>**输出结果

如果**<font style="color:#F33232;">实</font>**参的个数**<font style="color:#F33232;">多</font>**于**<font style="color:#F33232;">形</font>**参的个数，会**<font style="color:#F33232;">取形</font>**参的**<font style="color:#F33232;">个数</font>**

如果**<font style="color:#F33232;">实</font>**参的个数**<font style="color:#F33232;">小</font>**于**<font style="color:#F33232;">形</font>**参的个数，**<font style="color:#F33232;">多余</font>**的形参**<font style="color:#F33232;">默认</font>**定义为**<font style="color:#F33232;">undefined</font>**

调用函数时，解析器不会检查实参的类型，所以要注意，是否有可能会接收到非法的参数，**<font style="color:#F33232;">函数的实参可以是任意的数据类型</font>**

<font style="color:#F33232;">建议</font>形参和实参个数一致

### （3）、实参可以是任何类型
——可以是一个对象,当我们的参数过多时，可以将参数封装到一个对象中，然后通过对象传递

——**<font style="color:#F33232;">实参可以是一个对象，也可以是一个函数</font>**

```javascript
<script>
      //将参数封装到对象中传递
      function sayhello(o) {
        //console.log("o="+o);//对象
        console.log("我是" + o.name + ",今年" + o.age + "岁了," + 
        "我是一个" + o.gender + "人" + ",我住在" + o.address);
      }
       //创建一个对象
      var obj = new Object();
      obj.name = "孙悟空";
      obj.age = 18;
      obj.gender = "男";
      obj.address = "花果山";
      sayhello(obj); //可以直接全部赋值

    //实参可以是一个函数
      function fun(a) {
        //console.log("a="+a);
        a(obj);
      }
      fun(sayhello);

      /* 
      sayhello()
         -调用函数
         -相当于使用的函数的返回值
         -机器作出的东西
         
      sayhello
         -函数对象
         -相当于直接使用函数对象
         -机器 
      */
 </script>
```

## 1、函数的返回值return
### （1）、返回值语法结构：
**<font style="color:#FF0000;">function 函数名（）{</font>**

**<font style="color:#FF0000;">return 需要返回的结果</font>**

**<font style="color:#FF0000;">}</font>**

**<font style="color:#FF0000;">函数名（）</font>**

<font style="color:#595959;">//需求：输入一个数，求1-这个数的和,在这个基础上进行+1，-1，*1，/1</font>

```javascript
var num = +prompt('输入一个数');
function getSum(num) {
  var sum = 0;
  for (var i = 1; i <= num; i++) {
    sum += i
  }

  console.log(sum)
  return sum;
}
var res= getSum(num)
console.log(res+1)
```

### （2）、返回值注意事项：
函数只是实现某种功能，最终的结果需要返回给函数的调用者（谁调用函数，函数实现结果功能反馈给谁），**<font style="color:#FF0000;">函数名()=return 后面的结果</font>**，通过return实现的；可以定义一个变量，让return来接受该结果

在函数中，**<font style="color:#FF0000;">return之后的语句就都不会执行，有终止函数的作用</font>**

return**<font style="color:#FF0000;">只能返回一个值</font>**，多个值，返回的是最后一个值。如果有需求返回多个值，可以将多个值放入数组或者对象里

return后可以跟任意类型的值

如果**<font style="color:#FF0000;">return后不跟任何值，就相当于返回一个undefined</font>**

如果函数中不写return，则也会返回undefined

```javascript
<script>
       // 需求：创建一个函数，用来计算三个数的和
       function sum(a, b, c) {
        var d = a + b + c;
        //console.log(d);
        //alert(d);
        return d;
      }
      //调用函数，变量result的值就是函数的执行结果
      var result = sum(4, 7, 8);
      //函数返回什么，result的值就是什么
      console.log("result=" + result);
</script>
```

### （3）、返回值类型
返回值可以是任意的数据类型，也可以是一个对象，函数

```javascript
<script>
        //1:返回值对象
        function fun2() {
            //return 10;
            var obj = { name: "沙和尚" }
            return obj;//return {name:"沙和尚"}        
        }
        var a = fun2();
        console.log("a=" + a);

        //2:返回值是函数
        function fun3() {
            //在函数内部还可以声明一个函数
            function fun4() {
                alert("我是fun4");
            }
            //将fun4函数作为返回值返回
            return fun4;
        }
         a = fun3();//将箱子里的冰淇机器赋值，也就是fun4
         a=fun3;//与上面的区别，整个fun3函数赋值
        console.log(a);
</script>
```

### （4）、break、continue、return的区别：
break、continue、return的区别：

**<font style="color:#FF0000;">break：结束当前的循环体（for、while）</font>**

**<font style="color:#FF0000;">continue：跳出本次循环，继续执行下次循环（for、while）</font>**

**<font style="color:#FF0000;">return：不仅可以退出循环，还可以返回return语句中的值，同时还可以结束当前循环体内的代码</font>**

```javascript
<script>
        function fun() {
            alert("函数要执行了～～～");
            for (var i = 0; i < 5; i++) {
                if (i == 2) {
                    break;//退出当前的循环
                    continue;//用于跳过当次循环
                    return;//使用return可以结束整个函数
                }
                console.log(i);
            }
            alert("函数执行完了～～～");
        }
        //fun();
</script>
```

课堂小练习：1、利用函数求任意两个数的最大值

## 2、arguments的使用
在调用函数时，浏览器每次都会传递两个隐含的参数：

1:函数的上下文对象 this

2:封装实参的对象 arguments

当我们不确定有多少个参数传递的时候，可以使用**<font style="color:#FF0000;">arguments</font>**来获取，在JS中，arguments实际上它是当前函数的一个<font style="color:#F33232;">内置对象</font>。所有函都内置了一个arguments对象，**<font style="color:#FF0000;">arguments对象中存储了传递的所有实参。</font>**

（1）、arguments 是一个**<font style="color:#FF0000;">伪类数组</font>**对象，它也可以通过索引来操作数据，通过arguments.length可以获取实参的长度获取长度

伪数组并不是真正意义上的数组

**<font style="color:#FF0000;">具有数组的length属性</font>**

**<font style="color:#FF0000;">按照索引的顺序进行存储的</font>**

**<font style="color:#FF0000;">它没有真正数组的一些方法</font>**

（2）、在调用函数时，我们所传递的实参都会在arguments中保存

（3）、我们即使不定义形参，也可以通过grguments来使用实参，只不过比较麻烦

arguments[0]表示第一个实参

arguments[1]表示第二个实参

（4）**<font style="color:#FF0000;">、arguments有个属性叫callee</font>**，

这个属性对应一个函数对象，就是**<font style="color:#FF0000;">当前正在指向函数的对象</font>**

```javascript
<script>
        function fun() {
        //这两种都是检查arguments是不是数组
        //console.log(arguments instanceof Array);//false
        //console.log(Array.isArray(arguments));//false
        //console.log(arguments.length);//用来获取实参的长度
        //console.log(arguments[0]);//hello
        console.log(arguments.callee);//指向当前这个对象
      }
      fun("hello", true);
    </script>
```

课堂小练习：1、利用函数求任意个数的最大值

```javascript
function getMax() {
  var max = arguments[0]
  for (var i = 0; i < arguments.length; i++) {
    if (max < arguments[i]) {
      max = arguments[i]
    }
    return max
  }
}
var num = getMax(1, 2, 3, 33, 111)
```

2、封装函数，输入一个年份，判断是否是闰年（闰年可以被4或者400整除）

面试题：

1.伪数组和真数组的区别是什么？

2.如何获取到伪数组？

## 3、函数方法call()，apply() ，bind()
-这两个方法都是**<font style="color:#FF0000;">函数对象的方法</font>**，需要通过函数对象来调用

-当对函数调用call()和apply()方法时，都会调用函数执行

-在**<font style="color:#FF0000;">调用call和apply()可以将一个对象指定为第一个参数</font>**， **<font style="color:#FF0000;">此时这个对象将会成为函数执行的this</font>**

-**<font style="color:#FF0000;">call()方法可以将实参在对象之后一次传递</font>**

**<font style="color:#FF0000;">apply()方法需要将实参封装到一个数组中统一传递</font>**

```javascript
<script>
      var name = "我是window";
        function fun(a) {
          console.log("a=", a);
          alert(this.name);
        }
        var obj = {
          name: "我是obj1",
          sayName: function () {
            alert(this.name);
          },
        };
        var obj2 = {
          name: "我是obj2",
        };
      //obj.sayName(); //obj
      //obj.sayName.call(obj2);//obj2
      //fun.call(obj, 2);//obj1，2
      //fun.apply(obj2, [2,3]);
      //fun(1);
 </script>
```

总结this的情况

**<font style="color:#FF0000;">1.以函数形式调用时，this永远是window</font>**

**<font style="color:#FF0000;">2.以方法的形式调用时，this是调用方法的对象</font>**

**<font style="color:#FF0000;">3.以构造函数的形式调用时，this是新创建的那个实例对象</font>**

**<font style="color:#FF0000;">4.使用call和apply调用时，this是指定的那个对象，如果不写第一个参数，默认是window</font>**

三者都是 JavaScript 中**改变函数执行上下文（this 指向）** 的核心方法，核心区别在于**参数传递方式**和**是否立即执行**，简要解析如下：

### **<font style="color:#FF0000;">1. call()</font>**
+ **作用****<font style="color:#FF0000;">：改变函数 this 指向，并</font>****立即执行****<font style="color:#FF0000;">函数。</font>**
+ **参数格式****<font style="color:#FF0000;">：</font>**`**<font style="color:#FF0000;">函数.call(新this, 参数1, 参数2, ...)</font>**`**<font style="color:#FF0000;">  
</font>****<font style="color:#FF0000;">第一个参数是要绑定的 this 对象（null/undefined 时默认指向全局对象，严格模式下为 undefined），后续参数逐个传入函数。</font>**
+ **示例****<font style="color:#FF0000;">：</font>**

```javascript
function add(a, b) { return this.x + a + b; }
const obj = { x: 10 };
add.call(obj, 2, 3); // this 指向 obj，结果 15（10+2+3）
```

### **<font style="color:#FF0000;">2. apply()</font>**
+ **作用****<font style="color:#FF0000;">：与 call() 完全一致（改变 this + 立即执行），仅</font>****参数传递方式不同****<font style="color:#FF0000;">。</font>**
+ **参数格式****<font style="color:#FF0000;">：</font>**`**<font style="color:#FF0000;">函数.apply(新this, [参数数组/类数组])</font>**`**<font style="color:#FF0000;">  
</font>****<font style="color:#FF0000;">第二个参数必须是数组或类数组（如 arguments），数组中的元素会作为函数的参数逐个传入。</font>**
+ **示例****<font style="color:#FF0000;">：</font>**

```javascript
add.apply(obj, [2, 3]); // 结果同样 15，参数以数组形式传递
```

### **<font style="color:#FF0000;">3. bind()</font>**
+ **作用****<font style="color:#FF0000;">：改变函数 this 指向，但</font>****不立即执行****<font style="color:#FF0000;">，而是返回一个</font>****绑定了新 this 的函数副本****<font style="color:#FF0000;">（后续可手动调用）。</font>**
+ **参数格式****<font style="color:#FF0000;">：</font>**`**<font style="color:#FF0000;">函数.bind(新this, 参数1, 参数2, ...)</font>**`**<font style="color:#FF0000;">  
</font>****<font style="color:#FF0000;">第一个参数是绑定的 this，后续参数可“预传”（调用返回的函数时可补充剩余参数）。</font>**
+ **示例****<font style="color:#FF0000;">：</font>**

```javascript
const boundAdd = add.bind(obj, 2); // 绑定 this 为 obj，预传参数 2
boundAdd(3); // 后续调用补充参数 3，结果 15（10+2+3）
```

### **<font style="color:#FF0000;">核心区别总结</font>**
| **<font style="color:#FF0000;">方法</font>** | **<font style="color:#FF0000;">执行时机</font>** | **<font style="color:#FF0000;">参数传递方式</font>** | **<font style="color:#FF0000;">核心场景</font>** |
| --- | --- | --- | --- |
| **<font style="color:#FF0000;">call()</font>** | **<font style="color:#FF0000;">立即执行</font>** | **<font style="color:#FF0000;">逐个传入参数</font>** | **<font style="color:#FF0000;">已知参数个数，需立即调用</font>** |
| **<font style="color:#FF0000;">apply()</font>** | **<font style="color:#FF0000;">立即执行</font>** | **<font style="color:#FF0000;">数组/类数组传入</font>** | **<font style="color:#FF0000;">参数个数不确定（如动态收集）</font>** |
| **<font style="color:#FF0000;">bind()</font>** | **<font style="color:#FF0000;">延迟执行</font>** | **<font style="color:#FF0000;">预传参数（可补充）</font>** | **<font style="color:#FF0000;">需重复调用同一 this 的函数</font>** |


**关键记忆点****<font style="color:#FF0000;">：call 传散参、apply 传数组、bind 返新函数（不执行）。</font>**

## 4、函数调用函数
每个函数都是独立的代码块，用于完成特殊任务，因此经常会用到函数相互调用的情况

一般情况下，一个函数只做一件事

```javascript
<script>
        function fn1(){
            console.log(111);
            fn2();
            console.log('fn1');
        }
        function fn2(){
            console.log(222);
            console.log('fn2');
        }
        fn1()
    </script>
```

课堂小练习：用户输入年份，告知当年2月份多少天

```javascript
<script>
      function getDays() {
        var year = prompt("请输入年份");
        if (isRunYear(year)) {
          alert("闰年2月有29天");
        } else {
          alert("平年2月有28天");
        }
      }
      getDays();
      
      function isRunYear(year) {
        var flag = false;
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
          flag = true;
        }
        return flag;
      }
    </script>
```

## 5、立即执行函数
语法结构：**<font style="color:#FF0000;">函数对象()</font>**

立即执行函数，函数定义完后，**<font style="color:#FF0000;">立即被调用</font>**，立即调用函数，往往**<font style="color:#FF0000;">只会执行一次</font>**

```javascript
<script>
          //第一种写法
        (function(){
                alert("我是一个匿名函数～～～");
            }) ();//外面的()是把整个函数当作函数名，后面的()是调用函数的意思
      //第二种写法
          (function () {
            alert('匿名函数执行方式二')
          }() );
      //匿名函数传参
          (function(a,b){
                console.log("a="+a);
                console.log("b="+b);
            })(123,456);//不仅可以调用，还可以传值
    </script>
```







## 1、作用域
### （1）、作用域定义
通常来说，一段程序代码中所用到的名字（变量名和函数名）并不总是有效和可用的，而**<font style="color:#FF0000;">限定这个名字的可用性的代码范围</font>**就是这个名字的**<font style="color:#FF0000;">作用域</font>**。

简单理解：就是代码名字（变量）在某个范围内起作用和效果

作用域的使用提高了程序**<font style="color:#FF0000;">逻辑</font>**的局部性，**<font style="color:#FF0000;">增强</font>**了程序的可靠性，**<font style="color:#FF0000;">减少</font>**了命名冲突

**<font style="color:#FF0000;">js作用域（es6）之前：全局作用域局（函数）部作用域，es6后有块级作用域</font>**

### （2）、全局作用域：
直接编写在script标签中或者一个单独的js文件内的Js代码

全局作用域在页面打开时创建，在页面关闭时销毁

在全局作用域中有一个**<font style="color:#FF0000;">全局对象window</font>**，它代表的是一个浏览器的窗口，它由浏览器创建，我们可以直接使用它

**<font style="color:#FF0000;">在全局作用域中：创建的变量都会作为window对象的属性保存；创建的函数都会作为window对象的方法保存</font>**

全局作用域中的变量都是全局变量；在页面的任意部分都可以访问的到

```javascript
<script>
        var a=10;
       var b=10;
      // var c="hello";
       console.log(window.c);//加window.，如果没有找到变量c，会undefined，不加的话，会报错
              
       function fun(){
           console.log("我是fun函数");
       }
       window.fun();//创建的函数都会作为window对象的方法保存
    </script>
```

### （3）、局部作用域（函数作用域）：
在**<font style="color:#FF0000;">函数内部就是局部作用域</font>**。这个变量只在函数内部起作用

调用函数时创建函数作用域，函数执行完毕以后，函数作用域销毁

每调用一次函数就会创建一个新的函数作用域，他们之间是互相独立的

在函数作用域中可以访问到全局作用域的变量，在全局作用域中无法访问到函数作用域的变量

**<font style="color:#FF0000;">在函数中如果要访问全局变量，可以使用window对象</font>** 

```javascript
<script>
       var a = 10;
      function fun() {
        var a = "我是fun函数中的变量a";
        //console.log("a="+a);
        function fun2() {
          // console.log(a);
          console.log("a=" + window.a);
        }
        fun2(); //10
      }
      fun();
</script>
```

## 2、变量作用域
在JS中，根据作用域的不同，变量可以分为两种：

### （1）、全局变量：
在全局作用域下的变量，在全局下都可以使用；

**<font style="color:#FF0000;">如果在函数内部，不使用var声明的变量，直接赋值的，也属于全局变量</font>**

### （2）、局部变量：
在函数作用域下的变量；函数中定义**<font style="color:#FF0000;">形参</font>**就**<font style="color:#FF0000;">相当于在函数作用域中声明了变量</font>**

### （3）注意点：
从执行效率来看全局变量和局部变量

全局变量只有浏览器关闭的时候才会销毁，比较占内存资源

局部变量，当我们程序执行完毕就会销毁，比较节约内存资源

## 3、作用域链
只要是代码，就至少有一个作用域

写在函数内部的局部作用域

如果函数中还有函数，那么在这个作用域中就又可以诞生一个作用域

当在函数作用域中操作一个变量时，它会先在自身作用域中寻找，如果有，就直接使用，如果没有，就去它上一级作用域去寻找，如果全局作用域中依然没找到，则会报错根据在内部函数可以访问外部函数变量的这种机制，用**<font style="color:#FF0000;">链式查找决定哪些数据能被内部函数访问，就称做是作用域链</font>**

## 4、预解析执行上下文与执行上下文栈
### 4.1、变量提升与函数提升
（1）、JS代码是由浏览器中的JS解析器来执行的，JS解析器在运行JS代码的时候分为两步：先预解析再代码执行

**<font style="color:#FF0000;">预解析：js引擎会把js里面所有的var 还有function提升到当前作用域的最前面</font>**

代码执行：按照代码书写的顺序从上往下执行

（2）、预解析分为变量预解析（变量提升）和函数预解析（函数提升）

**<font style="color:#FF0000;">变量提升</font>**就是把**<font style="color:#FF0000;">所有var</font>**的变量**<font style="color:#FF0000;">声明</font>**提升到当前的作用域**<font style="color:#FF0000;">最前面</font>**，**<font style="color:#FF0000;">不</font>**提升**<font style="color:#FF0000;">赋值</font>**操作

**<font style="color:#FF0000;">函数提升</font>**就是把所有的**<font style="color:#FF0000;">函数声明</font>**提升到当前作用域**<font style="color:#FF0000;">最前面</font>**，**<font style="color:#FF0000;">不调用</font>**函数

小练习：

```javascript
<script>
      //说出以下代码的执行结果
        //第一题
        var a=123;
        function fun(){
            console.log(a);
        }
        fun();


      //第二题：
        var a=123;
        function fun(){
            alert(a);
            var a=456;
        }
        fun();
        alert(a);


      //第三题
        var a=123;
        function fun(){
            alert(a);
            a=456;
        }
        fun();
        alert(a);


     //第四题
        var a=123;
        function fun(a){//形参相当于声明了，没赋值
            alert(a);
            a=456;
        }
        fun();
        alert(a);


        //第五题
        var a=123;
        function fun(a){
            alert(a);
            a=456;
        }
        fun(123);
        alert(a);
        //第六题
        f1()
        console.log(c)
        console.log(b)
        console.log(a)
        function f1(){
            var a=b=c=9    //var a=9;b=9;c=9
            console.log(a) 
            console.log(b)  
            console.log(c)
        }
    </script>
```

### 4.2、执行上下文
#### （1）. 代码分类(位置)
* 全局代码

* 函数代码

#### （2）. 全局执行上下文
* 在执行全局代码前将window确定为全局执行上下文

* 对全局数据进行预处理

**<font style="color:#FF0000;">* var定义的全局变量==>undefined, 添加为window的属性</font>**

**<font style="color:#FF0000;">* function声明的全局函数==>赋值(fun), 添加为window的方法</font>**

**<font style="color:#FF0000;">* this==>赋值(window)</font>**

* 开始执行全局代码

```javascript
console.log(a1);//undefined
console.log(a2);//undefined
console.log(a3);//函数
// console.log(a4)
console.log(this);//window

var a1 = 3;
var a2 = function () {
    console.log("a2()");
};
function a3() {
    console.log("a3()");
}
```

#### （3）. 函数执行上下文
+ * 在调用函数, 准备执行函数体之前, 创建对应的函数执行上下文对象
+ * 对局部数据进行预处理
    - * 形参变量==>赋值(实参)==>添加为执行上下文的属性
    - * arguments==>赋值(实参列表), 添加为执行上下文的属性
    - * var定义的局部变量==>undefined, 添加为执行上下文的属性
    - * function声明的函数 ==>赋值(fun), 添加为执行上下文的方法
    - **<font style="color:#FF0000;">* this==>赋值(调用函数的对象)</font>**
+ * 开始执行函数体代码

```javascript
 function fn(x, y) {
        console.log(x, y); //undefined
        console.log(b1); //undefined
        console.log(b2); //函数
        console.log(arguments); //内容
        console.log(this); //window
        // console.log(b3)//报错  b3全局变量，函数调用要用window对象this.b3
        var b1 = 5;
        function b2() {}
        b3 = 6;
      }
    fn();
```

### 4.3、执行上下文栈
1. 在全局代码执行前, JS引擎就会创建一个**<font style="color:#FF0000;">栈</font>**来**<font style="color:#FF0000;">存储</font>**管理所有的**<font style="color:#FF0000;">执行上下文对象</font>**

2. 在全局执行上下文(**<font style="color:#FF0000;">window</font>**)确定后, 将其添加到栈中**<font style="color:#FF0000;">(压栈)</font>**

3. 在**<font style="color:#FF0000;">函数</font>**执行上下文创建后, 将其添加到栈中(**<font style="color:#FF0000;">压栈</font>**)

4. 在当前函数**<font style="color:#FF0000;">执行完</font>**后,将栈顶的对象移除(**<font style="color:#FF0000;">出栈</font>**)

5. 当**<font style="color:#FF0000;">所有</font>**的代码**<font style="color:#FF0000;">执行完</font>**后, 栈中**<font style="color:#FF0000;">只剩</font>**下**<font style="color:#FF0000;">window</font>**

```javascript
<script type="text/javascript">
      //1. 进入全局执行上下文
      var a = 10;
      var bar = function (x) {
        var b = 5;
        foo(x + b); //3. 进入foo执行上下文
      };
      var foo = function (y) {
        var c = 5;
        console.log(a + c + y);
      };
      bar(10); //2. 进入bar函数执行上下文
    </script>

<body>
    <!--
1. 依次输出什么?  123 321 1
2. 整个过程中产生了几个执行上下文?  
-->
    <script type="text/javascript">
      console.log("global begin: " + i); //undefined
      var i = 1;
      foo(1);
      function foo(i) {
        if (i == 4) {
          return;
        }
        console.log("foo() begin:" + i); //1，2，3
        foo(i + 1);
        console.log("foo() end:" + i); //3，2，1
      }
      console.log("global end: " + i); //1
    </script>
  </body>
```

### 4.4、面试题
```javascript
<script type="text/javascript">
      /*
  测试题1: 先预处理变量, 后预处理函数
  */
      function a() {}
      var a;
      console.log(typeof a); //function

      /*
  测试题2: 变量预处理, in操作符
  if语句中的var b 进行变量提升，所以b在window内，
  所以if判断中为false，不执行赋值语句，所以b为undefined
   */
      if (!(b in window)) {
        var b = 1;
      }
      console.log(b); //undefined

      /*
  测试题3: 预处理, 顺序执行
   */
      var c = 1;
      function c(c) {
        console.log(c);
      }
      c(2); //报错
      // 实际上的执行顺序如下
      // var c;
      // function c(c) {
      //   console.log(c);
      //   var c = 3;
      // }
      // c = 1;
      // c(2); //报错，名字重复，误以为调用C=1
    </script>
```









## 前言：对象分类
1、自定义对象

2、内置对象 

内置对象是JS自带的对象。不需要声明，不需要创建，就可直接使用它，用它的属性和方法来构建我们所需的效果。例如： Array Boolean Date Math Number String RegExp Function Events

3、宿主对象

## 1、数组的概念
数组是指**<font style="color:#FF0000;">一组数据的集合</font>**，它也**<font style="color:#FF0000;">是</font>**个**<font style="color:#FF0000;">对象</font>**，其中每个数据被称为元素，在数组中可以**<font style="color:#FF0000;">存放任意类型</font>**的元素，数组是将一组数据存储在单个变量名下的优雅方式

数组也是一个对象，它和我们普通对象功能类似，也是用来存储一些值的，不同的是普通对象是使用字符串作为属性名的,而数组是使**<font style="color:#FF0000;">用数字作为索引</font>**操作元素，索引：**<font style="color:#FF0000;">从0</font>**开始的整数就是索引，数组的存储性能比普通对象要好，所以在开发中， 我们经常使用数组来存储数据

## 2、创建数组二种方式
### （1）、利用数组字面量创建数组
```javascript
<script>
        //语法：[]
        var arr1=[];//创建一个空的数组
        //使用字面量创建数组时，可以在创建时就指定数组中的元素
        var arr = [1, 2, 3, 4, 5, 10];//数据用逗号分隔
        console.log(arr); //[1, 2, 3, 4, 5, 10]
        console.log(arr[3]); //4
    </script>
```

### （2）、利用构造函数创建数组
利用构造函数创建一个空的数组

利用构造函数创建数组(直接填充数组内容,号隔开)

利用构造函数创建数组对象，设置初始长度

```javascript
<script>
       var arr = new Array();//创建一个空的数组
        arr[0] = 123;
        //可以同时添加元素，将要添加的元素作为构造函数的参数传递，元素间使用,号隔开
        var arr2 = new Array(20, 30, 40); //[20, 30, 40]
        //创建一个长度为10的数组
        arr3= new Array(10);
        console.log(arr3);
 </script>
```

## 3、数组的基本操作
### （0）、索引（下标）：
用来访问数组元素的序号（数组下表从<font style="color:#FF0001;">0</font>开始）

```javascript
<script>
        var  arr=['孙悟空','猪八戒','沙和尚','唐僧']
        //索引号：0，1，2，3
 </script>
```

### （1）、读取数组中的元素
数组可以通过<font style="color:#FF0001;">索引</font>来访问（获取得到）、设置、修改对应的数组元素，我们可以通过"<font style="color:#FF0001;">数组名[索引]</font>"的形式来获取数组中的元素。如果读取不存在的索引，他不会报错，而会返回undefined

arr[0]==>孙悟空，arr[2]==>沙和尚

课堂小练习：定一个数组，里面存放‘周一’～‘周日’，在控制台输出‘周日’。

### （2）、向数组中添加/替换元素
语法：**<font style="color:#FF0000;">数组[索引]=值</font>**

```javascript
<script>
      arr[0] = 10;
      arr[1] = 33;
      arr[2] = 22;
</script>
```

### （3）、获取数组的长度
可以使用length属性来**<font style="color:#FF0000;">获取</font>**数组的长度,**<font style="color:#FF0000;">元素的个数</font>**

语法：**<font style="color:#FF0000;">数组.length</font>**

对于连续的数组，使用length可以获取数组的长度（元素的个数），对于**<font style="color:#FF0000;">非连续的数组，使用length会获取到数组的最大索引+1</font>**

尽量不要创建非连续的数组

### （4）、 修改length
arr.length=5;

如果修改的length大于原长度，则多出部分会空出来

如果修改的**<font style="color:#FF0000;">length小于原长度</font>**，则**<font style="color:#FF0000;">多</font>**出来的**<font style="color:#FF0000;">元素</font>**会**<font style="color:#FF0000;">被删除</font>**

### （5）、 向数组的最后一个位置添加元素
语法：**<font style="color:#FF0000;">数组[数组.length]=值;</font>**

```javascript
<script>
      arr[arr.length] = 10;
      arr[arr.length] = 70;
</script>
```

### （6）、数组中的元素
数组中的元素可以是任意的数据类型，可以是字符串，数字，对象，数字，函数等都可以

```javascript
<script>
      arr = ["hello", 1, true, null, undefined];
      console.log(arr);
      //1:元素也可以是对象
      var obj = {
        name: "孙悟空",
      };
      arr[arr.length] = obj; //元素的最后添加对象
      console.log(arr);
      console.log(arr[5].name);
      arr = [{ name: "孙悟空" }, { name: "沙和尚" }, { name: "猪八戒" }];
      console.log(arr);
      //2:元素也可以是函数
      arr = [
        function () {
          alert(1);
        },
        function () {},
        function () {},
      ];
      //arr[0]();//可以调用函数
      //3:元素也可以是数组,如下的数组我们称为二维数组
      arr = [
        [1, 2],
        [2, 3],
        ["a", "b"],
      ];
      console.log(arr);
</script>
```

## 4、检测是否为数组
（1）、**<font style="color:#FF0000;">instanceof</font>**运算符它可以用来**<font style="color:#FF0000;">检测是否为数组</font>**

语法：**<font style="color:#FF0000;">arr instanceof Array</font>**

1. 、**<font style="color:#FF0000;">Array.isArray(参数)</font>** **<font style="color:#FF0000;">用于确定传递的值是否是一个 Array</font>**。<font style="color:#000000;"> H5新增的方法 ie9以上版本支持</font>

语法：**<font style="color:#FF0000;">Array.isArray(value)</font>**

## 5、数组的遍历
遍历：就是把数组中的每个元素从头到尾都访问一次（类似我们每天早上学生的点名）

第一种方式：

```javascript
<script>
      for (var i = 0; i < arr.length; i++) {
        console.log(arr[i]);
      }
</script>
```

第二种方式 优化版for循环

```javascript
<script>
      //使用临时变量，将长度缓存起来，避免重复获取数组长度，
      //当数组较大时，优化效果会比较明显
      for (var i = 0, len = arr.length; i < len; i++) {
          console.log(arr[i]);
        }
</script>
```

<font style="color:#FF0001;">以下三种作为补充：</font>

第三种方式**<font style="color:#FF0000;"> for···in···</font>**

主要针对对象比较多

```javascript
<script>
      for (var i in arr) {
      console.log(i);//索引
      console.log(arr[i]);//值
      }
</script>
```

第四种方式 **<font style="color:#FF0000;">for···of···</font>**

```javascript
<script>
      for (var i of arr) {
      console.log(i);//值
      }
</script>
```

第五种方式 **<font style="color:#FF0000;">forEach()</font>**

-这个方法需要一个函数作为参数，只支持IE8以上的浏览器，所以还是建议使用for循环来遍历

-像这种函数，**<font style="color:#FF0000;">由我们创建，但是不由我们调用的，我们称为回调函数</font>**

-数组中有几个元素函数就执行几次,每次执行时，浏览器会将遍历到的元素，

以实参的形式传递进来，我们可以来定义行参，来读取这些内容

-浏览器会在函数中中传递了三个参数;

第一个参数：就是当前正在遍历的元素

第二个参数：就是当前正在遍历的元素的索引

第三个参数：就是当前正在遍历的数组

```javascript
<script>
      arr.forEach(function (item,index,arr) {
          console.log(item); //值
          console.log(index);//索引
          console.log(arr);//当前的数组
        });
</script>
```

课堂小练习：

1、求数组[2,6,3,6,4]里面所有元素的和以及平均值

2、求数组中[2,3,5,8,1,6]中最大的值

## 6、冒泡排序
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/jpeg/50923934/1741693836148-7a15f920-5ff9-4033-9c24-a1a7b7a177df.jpeg)

冒泡排序：

是一种算法，把一系列的数据按照一定的顺序进行排列显示（**<font style="color:#FF0000;">从小到大或从大到小</font>**）。

原理：

重复地走访过要排序的数列，一次比较两个元素，如果他们的顺序错误，就把他们较缓过来。

走访数列的工作是重复地进行，直到没有再需要交换，也就是该数列已经排序完成。

这个算法的名字由来是因为最小的元素会经由交换慢慢“浮”到数列的顶端

```javascript
<script>
      var arr = [1, 3, 6, 4, 5, 2];
      var temp;
      // 遍历出每个数据
      for (var i = 0; i < arr.length-1; i++) {
        //拿每个arr[i],跟arr中的每个数据进行一轮对比，然后交换数据，小的在前
        for (var j =0; j < arr.length-1-i; j++) {
          if (arr[j] > arr[j+1]) {
             temp = arr[j];
             arr[i] = arr[j+1];
             arr[j+1] = temp;
          }
        }
      }
      console.log(arr);
</script>
```

## 7、数组的方法
### (1）、添加删除数组
| 方法名 | 说明 | 返回值 |
| --- | --- | --- |
| push() | **<font style="color:rgb(255, 0, 0);">末尾添加</font>**一个或多个元素，修改原数组 | 并返回新数组的**<font style="color:rgb(255, 0, 0);">长度</font>** |
| pop() | **<font style="color:rgb(255, 0, 0);">删除</font>**数组**<font style="color:rgb(255, 0, 0);">最后</font>**一个元素，把数组长度减1，**<font style="color:rgb(255, 0, 0);">无参数</font>**，修改数组 | 并返回**<font style="color:rgb(255, 0, 0);">删除的元素的值</font>** |
| unshift() | 向数组的**<font style="color:rgb(255, 0, 0);">开头添加</font>**一个或更多元素，修改原数组 | 并返回新数组的**<font style="color:rgb(255, 0, 0);">长度</font>** |
| shift() | **<font style="color:rgb(255, 0, 0);">删除</font>**数组的**<font style="color:rgb(255, 0, 0);">第一个</font>**元素，数组长度减1 **<font style="color:rgb(255, 0, 0);">无参数</font>**，修改原数组 | 并返回**<font style="color:rgb(255, 0, 0);">删除的元素的值</font>** |


#### (1)、push()
-该方法可以向数组的末尾中添加一个或者多个元素，并返回数组新的长度

-可以将要添加的元素作为方法的参数传递，这样这些元素将会自动添加到元素的末尾

-原数组会发生变化

```javascript
<script>
     var arr = ["孙悟空", "沙和尚", "猪八戒"];
      //arr.push("唐僧","蜘蛛精","白骨精");
      var result = arr.push("唐僧", "蜘蛛精", "白骨精");
      console.log(arr);
      console.log("result=" + result); //6
</script>
```

#### (2)、pop()
-该方法可以删除数组的最后一个元素 ,一次就删除一个元素

-<font style="color:#DF2A3F;">pop()没有参数</font>

-将被删除的元素作为返回值返回

-原数组会发生变化

```javascript
<script>
      arr.pop(); //会删除最后一个元素
      arr.pop(); //调用一次会删除一个
      console.log(arr);
</script>
```

#### （3）unshift()
-向数组开头添加一个或者多个元素，并返回新的数组长度

-向前边插入元素后，其他的元素索引会依次调整

-原数组会发生变化

```javascript
<script>
      arr.unshift("牛魔王", "二郎神");
      console.log(arr);
</script>
```

#### （4）shift()
-可以删除数组的第一个元素，一次就删除一个元素

-shift()没有参数

-被删除的元素作为返回值返回

-原数组会发生变化

```javascript
<script>
    arr.shift(); //删了牛魔王
    result = arr.shift(); //又删了二郎神
    console.log(arr);
    console.log(result); //二郎神
</script>
```

课堂小练习：

有一个包含工资的数组[1500,1800,2200,2100,1900],要求把低于2000的工资给删除，返回新数组

### 2）、数组剩余常用方法
#### （1）、slice() [slaɪs] 
-可以用来**<font style="color:#FF0000;">从数组提取指定元素</font>**

**<font style="color:#FF0000;">-不</font>**会**<font style="color:#FF0000;">改变</font>**元素**<font style="color:#FF0000;">原数组</font>**，而是将截取到的元素封装到一个新数组中返回

-参数：

**<font style="color:#FF0000;">参数1</font>**:截取开始的位置的索引,**<font style="color:#FF0000;">包含开始索引</font>**

**<font style="color:#FF0000;">参数2</font>**:截取结束的位置的索引，**<font style="color:#FF0000;">不包含结束索引</font>**

-第二个参数，可以省略不写，此时会截取从开始索引往后的所有元素

-**<font style="color:#FF0000;">索引可以传递一个负值，如果传递一个负值，则从后往前计算，-1:倒数第一个,-2:倒数第二个</font>**

```javascript
<script>
     var arr=["孙悟空","猪八戒","沙和尚","唐僧","沙和尚"];
      console.log(arr);
      var arr2=arr.slice(0,2);
      console.log(arr2);//孙悟空，猪八戒
</script>
```

#### （2）、splice() [splais]
-可以用来**<font style="color:#FF0000;">删除数组中的指定元素</font>**

-会影响到原数组，会将指定元素从原数组中删除,并将**<font style="color:#FF0000;">删除的元素作为返回值</font>**返回,<font style="color:rgba(0, 0, 0, 0.85);">返回值是一个</font>**<font style="color:rgb(0, 0, 0) !important;">包含所有被删除元素的数组</font>**<font style="color:rgba(0, 0, 0, 0.85);">（而非逐个返回）</font>

-参数：

**<font style="color:#FF0000;">第一个，表示开始位置的索引</font>**

**<font style="color:#FF0000;">第二个，表示删除的数量</font>**

**<font style="color:#FF0000;">第三个及以后...</font>**

**<font style="color:#FF0000;">可以传递一些新的元素，这些元素将会自动插入到开始位置，索引前边</font>**

```javascript
<script>
       var result=arr.splice(1,1,"牛魔王");//从索引1开始，删除1个
       console.log(result);
       console.log(arr);
</script>
```

#### （3）、indexOf 查找满足条件的数组索引号
——**<font style="color:#FF0000;">返回</font>**在数组中可以找到的一个**<font style="color:#FF0000;">给定元素</font>**的**<font style="color:#FF0000;">第一个索引</font>**，如果**<font style="color:#FF0000;">不存在</font>**，则返回**<font style="color:#FF0000;">-1</font>**

注意：它只返回第一个满足条件的索引号

——语法：**<font style="color:#FF0000;">arr.indexOf(searchElement) </font>**

#### （4）、lastIndexOf 
——**<font style="color:#FF0000;">返回指定元素</font>**在数组中的**<font style="color:#FF0000;">最后一个索引</font>**，从数组后往前查找，如果**<font style="color:#FF0000;">不存在，</font>**返回**<font style="color:#FF0000;">-1</font>**

```javascript
<script>
      var arr = ["red", "orange", "green", "yellow", "green"];
      var res = arr.indexOf("red"); //0
      res = arr.lastIndexOf("green"); //4
      console.log(res);
</script>
```

课堂小练习：去除重复的数组

```javascript
<script>
      //数组去重
      var arr = [1, 2, 3, 2, 2, 1, 3, 4, 2, 5];
      var newArr = [];
            for (var i = 0; i < arr.length; i++) {
              if (newArr.indexOf(arr[i]) == -1) {
                // 新数组的最后一位，加上没有的这个数
              // newArr[newArr.length] = arr[i];
              newArr.push(arr[i])
              }
            }
        console.log(newArr);
</script>
```

#### （5）、concat()
可以**<font style="color:#FF0000;">合并两个或多个数组</font>**，并将新的数组返回，也可以传其他数据类型，该方法不会对原数组产生影响

```javascript
<script>
    var arr = ["孙悟空", "猪八戒"];
    var arr2 = ["唐僧"];
    var arr3 = ["嫦娥"];
    var res = arr.concat(arr2, arr3, "牛魔王");
      console.log(res); //['孙悟空', '猪八戒', '唐僧', '嫦娥', '牛魔王']
</script>
```

#### （6）、join()
-该方法可以**<font style="color:#FF0000;">将数组转成一个字符串</font>**

-该方法不会对原数组产生影响，而是将**<font style="color:#FF0000;">转换后的字符串作为结果返回</font>**

**<font style="color:#FF0000;">-在join()中可以指定一个字符串作为参数，这个字符串将会成为数组中元素的连接符</font>**

如果不指定连接符，则**<font style="color:#DF2A3F;">默认使用“，”</font>**，作为连接符

```javascript
<script>
      var res2 = arr.join("hello");
      console.log(arr);// ['孙悟空', '猪八戒']
      console.log(res2);//孙悟空hello猪八戒
</script>
```

#### （7）、toString 数组转字符串
```javascript
<script>
      console.log(arr.toString(), "toString");//孙悟空,猪八戒 toString
</script>
```

#### （8）、split()
——使用**<font style="color:#FF0000;">指定</font>**的**<font style="color:#FF0000;">分隔符</font>**字符串**<font style="color:#FF0000;">将</font>**一个**<font style="color:#FF0000;">String对象分割成子字符串数组</font>**，**<font style="color:#FF0000;">以</font>**一个**<font style="color:#FF0000;">指定的分割字串来决定每个拆分的位置 </font>**

```javascript
<script>
      var str = "red,orange,yellow";
      var res4 = str.split(",");
      console.log(res4, "res4");// ['red', 'orange', 'yellow'] 'res4'
</script>
```

#### （9）、reverse()
-该方法用来**<font style="color:#FF0000;">反转数组</font>**（前边的去后边，后边的去前边）

-该方法会直接修改原数组！

#### （10）、sort()
-可以用来对数组中的元素进行**<font style="color:#FF0000;">排序</font>**

-会影响原数组，默认会按照**<font style="color:#FF0000;">Unicode编码</font>**进行排序，即使对纯数字的数组，使用sort()排序，也会按照Unicode编码进行排序， 所以对数字排序时，可能会得到错误的结果，可以**<font style="color:#FF0000;">自己来指定排序的规则</font>**

可以在sort()添加回调函数，来制定排序规则，回调函数中需要定义**<font style="color:#FF0000;">两个形参数</font>**，浏览器将会分别使用数组中的元素作为实参去调用回调函数

使用哪个元素调用不确定，但是肯定的是在数组中，a一定在b前边

如果需要升序，则返回a-b， 如果需要降序排列，则返回b-a

```javascript
<script>
       arr5 = [5, 4, 5, 2, 1, 6, 8, 3];
        arr5.sort(function (a, b) {
          return a - b;
        });
        console.log(arr5);
      arr5.sort(function (a, b) {
        return Math.random() - 0.5; //返回值的正负概率分别为50%，故升降序排列是随机的
      });
      console.log(arr5); //新数组随机排序
</script>
```



JS中的对象分为3种：自定义对象、内置对象、浏览器对象

之前两种对象是JS基础内容，属于ECMAScript；第三个浏览器对象属于我们JS独有的；

内置对象就是指JS语言自带的一些对象，这些对象供开发者使用，并提供一些常用的或是最基本而必要的功能（属性和方法 ），程序员不用管具体怎么实现，直接使用就可以了。帮助我们快速开发

JS中提供了多个内置对象：Math、Date、Array、String,Boolean,Number

参考文档：

[Page not found | MDN](https://developer.mozilla.org/zh-CN/docs/Web/Tutorials" \t "_blank)

查阅文档的方法：

查阅该方法的功能

查看里面参数的意义和类型

查看返回值的意义和类型

通过demo进行测试

## 1、Math对象
Math和其他的对象不同，它**<font style="color:#FF0000;">不是一个构造函数，它属于一个工具类，不用创建对象</font>**，它里面封装了数学运算相关的属性和方法

比如 **<font style="color:#FF0000;">Math.PI表示圆周率</font>**

**<font style="color:#FF0000;">Math.abs()</font>**可以用来计算一个数的**<font style="color:#FF0000;">绝对值</font>**

**<font style="color:#FF0000;">Math.ceil()</font>** 可以用来对一个数**<font style="color:#FF0000;">向上取整</font>**，小数位只要有值，就自动进1

**<font style="color:#FF0000;">Math.floor()</font>** 可以对一个数进行**<font style="color:#FF0000;">向下取整</font>**，小数部分会被舍掉

**<font style="color:#FF0000;">Math.round()</font>** 可以对一个数进行**<font style="color:#FF0000;">四舍五入取整</font>**,其他数字都是四舍五入，但.5特殊，它往大了取，1.5取成2，-1.5取-1

**<font style="color:#FF0000;">Math.random()</font>** 可以生成一个**<font style="color:#FF0000;">0-1之间的随机数</font>**（左闭右开，能取0，取不到1）**<font style="color:#FF0000;">[0,1)</font>**

-生成一个**<font style="color:#FF0000;">0-x</font>**之间的随机数**<font style="color:#FF0000;">Math.round(Math.random()*x)</font>**

-生成一个**<font style="color:#FF0000;">x-y</font>**之间的随机数**<font style="color:#FF0000;">Math.floor(Math.random()*（y-x+1)+x</font>**

**<font style="color:#FF0000;">Math.max()</font>** 可以获取多个数中的**<font style="color:#FF0000;">最大值</font>**

**<font style="color:#FF0000;">Math.min()</font>** 可以获取多个数中的**<font style="color:#FF0000;">最小值</font>**

**<font style="color:#FF0000;">Math.pow(x,y)</font>** **<font style="color:#FF0000;">返回x的y次幂</font>**

**<font style="color:#FF0000;">Math.sqrt()</font>** 对一个数进行**<font style="color:#FF0000;">开方运算</font>**

课堂小练习：

1、程序随机生成一个1-10之间的数字，并让用户输入一个数字

如果大于该数字，就提示，数字大了，继续猜

如果小于该数字，就提示，数字小了，继续猜

如果等于该数字，就提示猜对了，结束程序

```javascript
<script>
      var trueNum = Math.floor(Math.random() * 100 + 1);
      var num = +prompt("请输入数字");
      console.log(trueNum);
      while (true) {
        if (trueNum < num) {
          alert("大了");
          num = +prompt("请输入数字");
        } else if (trueNum > num) {
          alert("小了");
          num = +prompt("请输入数字");
        } else {
          alert("恭喜你");
          break;
        }
      }
</script>
```

## 2、Date对象
在js中使用Date它是一个**<font style="color:#FF0000;">构造函数</font>**，所以必须要**<font style="color:#FF0000;">实例化后才能使用</font>**，用来**<font style="color:#FF0000;">处理日期和时间</font>**

### (1)、创建一个Date对象
—直接使用构造函数创建一个Date对象，则**<font style="color:#FF0000;">会封装为当前代码执行的时间</font>**

```javascript
<script>
     var d = new Date();
</script>
```

### (2)、创建指定的时间对象 
-需要**<font style="color:#FF0000;">在构造函数中传递</font>**一个**<font style="color:#FF0000;">表示时间的字符串或数字</font>**作为参数

-日期的格式三种写法：如下：

```javascript
<script>
      var d2 = new Date("10/23/2023 9:00:00");//字符串型
      var d4 = new Date("2023-11-09 8:59:00");//字符串型
      var d3 = new Date(2023, 11, 09);//数字型
</script>
```

### (3):时间对象的方法
**<font style="color:#FF0000;">getFullYear()</font>**-获取**<font style="color:#FF0000;">当前</font>**日期对象的**<font style="color:#FF0000;">年份</font>**

**<font style="color:#FF0000;">getMonth() </font>**-获取**<font style="color:#FF0000;">当前</font>**时间对象的**<font style="color:#FF0000;">月份</font>**

-会返回一个**<font style="color:#FF0000;">0-11</font>**的值 **<font style="color:#FF0000;">0表示1月</font>**，1表示2月，**<font style="color:#FF0000;">11表示12月</font>**，**<font style="color:#FF0000;">要返回的月份+1</font>**

**<font style="color:#FF0000;">getDate()</font>**-获取**<font style="color:#FF0000;">当前</font>**日期对象是**<font style="color:#FF0000;">几号</font>**(0-31)

**<font style="color:#FF0000;">getDay()</font>**-获取**<font style="color:#FF0000;">当前</font>**日期对象是**<font style="color:#FF0000;">周几</font>**

-会返回一个**<font style="color:#FF0000;">0-6</font>**的值，**<font style="color:#FF0000;">0表示周日</font>** 1表示周一，6表示周六

**<font style="color:#FF0000;">getHours()</font>** 获取**<font style="color:#FF0000;">当前小时</font>**

**<font style="color:#FF0000;">getMinutes() </font>**获取**<font style="color:#FF0000;">当前分钟</font>**

**<font style="color:#FF0000;">getSeconds()</font>**获取**<font style="color:#FF0000;">当前秒钟</font>**

时间戳

**<font style="color:#FF0000;">时间戳</font>**，指的是**<font style="color:#FF0000;">从</font>**格林威治**<font style="color:#FF0000;">标准时间</font>**的1970年1月1日0时:0分:0秒**<font style="color:#FF0000;">到当前日期</font>**所花费的**<font style="color:#FF0000;">豪秒数</font>**

**<font style="color:#FF0000;">1s=1000ms</font>**，计算机底层在保存时间时，使用的都是时间戳

**<font style="color:#FF0000;">getTime() </font>**-获取**<font style="color:#FF0000;">当前</font>**日期对象的**<font style="color:#FF0000;">时间戳</font>** nowTime.getTime()

**<font style="color:#FF0000;">Date.now()</font>** 获取**<font style="color:#FF0000;">当前代码执行</font>**时的时间的**<font style="color:#FF0000;">时间戳</font>** 

**<font style="color:#FF0000;">nowTime.valueOf() </font>**获取**<font style="color:#FF0000;">当前日期</font>**对象的**<font style="color:#FF0000;">时间戳</font>**

```javascript
<script>
      var nowTime = new Date();
      //获取当前的时间戳(4种方法)
        var time = +new Date();
        var time1 = Date.now();//h5新增的
        var time2 = nowTime.valueOf();
        var time3 = nowTime.getTime();
        
      //利用时间戳来测试代码的执行的性能
      var start = Date.now();
      var end = Date.now();
       //   console.log("执行了" + (end - start));
</script>
```

课堂小练习：自制一个倒计时

现在的时间

传入的时间

```javascript
<script>
      // 封装倒计时函数
      function countDown(time) {
        var nowTime = +new Date(); //当前时间的毫秒数
        var inputTime = +new Date(time); //输入时间的毫秒数
        var times = (inputTime - nowTime) / 1000; //输入时间与当前时间的秒数
        var d = parseInt(times / 60 / 60 / 24); //天
        var h = parseInt((times / 60 / 60) % 24); //时
        h = h < 10 ? "0" + h : h;
        var m = parseInt((times / 60) % 60); //分
        m = m < 10 ? "0" + m : m;
        var s = parseInt(times % 60); //当前的秒
        s = s < 10 ? "0" + s : s;
        return "剩余时间： " + d + "天" + h + "时" + m + "分" + s + "秒";
      }
      var res = countDown("2023/9/24");
      console.log(res);
</script>
```

## 3、基本包装类
基本数据类型：String Number Boolean Null Undefined 

引用数据类型：Object

### （1）、包装类
在js中为我们提供了三个包装类，通过这三个包装类可以**<font style="color:#DF2A3F;">基本数据类型转换为对象</font>**

String()可以将基本数据类型字符串转换为String对象

Number()可以将基本数据类型数字转换为Number对象

Boolean()可以将基本数据类型布尔值转换为Boolean对象

注意：我们在实际应用中不会使用基本数据类型的对象，如果使用基本数据类型的对象，在做一些比较时，会带来一些不可预估的结果

```javascript
<script>
      //创建一个Number类型的对象
      var num=new Number(3);
      var str=new String("hello");
      var bool=new Boolean(true)

      num.hello="abc你好"
      console.log(typeof num)//object
      console.log(num.hello)//abc你好
</script>
```

:::warning
注意：方法和属性只能添加给对象，不能添加给基本数据类型,当我们对一些基本数据类型的值去调用属性和方法时，浏览器会临时使用包装类将其转换为对象，然后再调用对象的属性跟方法调用完以后，再将其转换为基本数据类型

:::

```javascript
<script>
    var s=123
    s=s.toString()
    console.log(s,typeof s);
</script>
```

### （2）、字符串方法
#### （1）、length属性
可以获取**<font style="color:#FF0000;">字符串的长度</font>**

```javascript
<script>
          var str = "hello";
          /* 在底层字符串是以字符数组的形式保存的 ["h","e","l","l","o"] */
          console.log(str.length); //5
</script>
```

#### （2）、charAt()
可以**<font style="color:#FF0000;">返回字符串中指定位置的字符</font>**，**<font style="color:#FF0000;">根据索引获取</font>**指定的字符

```javascript
<script>
    var str = "hello";
    var res = str.charAt(0); //h
    console.log(str[0]); //h
</script>
```

#### （3）、concat()
-可以用来**<font style="color:#FF0000;">连接两个或者多个字符串</font>**

-作用和+一样

```javascript
<script>
       var str = "hello";
      res = str.concat(",你好", ",再见"); //hello,你好,再见
</script>
```

#### （4）、indexof()
-该方法可以**<font style="color:#FF0000;">检索</font>**一个**<font style="color:#FF0000;">字符串中是否含有指定内容</font>**

-如果字符串中含有该内容，则会**<font style="color:#FF0000;">返回其第一次出现的索引</font>**，如果**<font style="color:#FF0000;">没有</font>**找到指定的内容，则**<font style="color:#FF0000;">返回-1</font>**

-可以指定**<font style="color:#FF0000;">第二个参数</font>**，**<font style="color:#FF0000;">指定开始查找的位置</font>**

```javascript
<script>
      var str = "hello";
      res = str.indexOf("p"); //-1
</script>
```

#### （5）、 lastIndexOf()
-该方法的用法和indexOf()一样，不同的是lastIndexOf是**<font style="color:#FF0000;">从后往前找</font>**

```javascript
<script>
      var str = "hello";
      res = str.lastIndexOf("l"); //3
</script>
```

#### （6）、 slice()
-可以**<font style="color:#FF0000;">从字符串中截取指定的内容 </font>**

-**<font style="color:#FF0000;">不</font>**会**<font style="color:#FF0000;">影响原字符串</font>**，而是**<font style="color:#FF0000;">将截取到的内容返回</font>**

-参数：

第一个，开始位置的索引（包括开始位置）

第二个，结束位置的索引（不包括结束的位置）

-如果省略第二个参数，则会截取后边所有的

-也可以传递一个**<font style="color:#FF0000;">负数</font>**作为参数，负数的话将会**<font style="color:#FF0000;">从后边计算</font>**

```javascript
<script>
      var str = "hello";
      res = str.slice(0, 2); //he
</script>
```

#### （7）、substring()
-用来截取一个字符串，跟slice()类似

-参数：

第一个，开始位置的索引（包括开始位置）

第二个，结束位置的索引（不包括结束的位置）

-如果省略第二个参数，则会截取后边所有的

-跟slice()不同的是这个方法**<font style="color:#FF0000;">不能接收负值</font>**作为参数

如果传递了一个**<font style="color:#FF0000;">负值</font>**，则**<font style="color:#FF0000;">默认使用0</font>**

而且他还会**<font style="color:#FF0000;">自动调整参数</font>**的位置，如果第二个参数小于第一个，则自动交换

#### （8）、substr()
-用来**<font style="color:#FF0000;">截取字符串</font>**

-参数：

**<font style="color:#FF0000;">1:截取开始位置的索引</font>**

**<font style="color:#FF0000;">2:截取的长度 </font>**

```javascript
<script>
  var str = "hello";
  res = str.substr(0, 3); //hel
</script>
```

#### （9）、 split()
-可以将一个**<font style="color:#FF0000;">字符串拆分为</font>**一个**<font style="color:#FF0000;">数组</font>**

-参数

**<font style="color:#FF0000;">需要一个字符串作为参数，将会根据该字符串去拆分字符串</font>**

如果传递一个空串作为参数，则会将每个字符都拆分为数组中的一个元素

```javascript
<script>
        var  str = "abc,bcd,efg,hij";
      res = str.split(",");
</script>
```

#### （10）、replace（'被替换的字符'，'替换为的字符'）
它只会**<font style="color:#FF0000;">替换第一个字符</font>**

#### （11）、 toUpperCase()
-将一个字符串**<font style="color:#FF0000;">转换为大写</font>**并返回

#### （12）、 toLowerCase()
-将一个字符串**<font style="color:#FF0000;">转换为小写</font>**并返回

```javascript
<script>
  var str = "ABCDEFG";
  res = str.toLowerCase();
  console.log(res);
</script>
```

课堂小练习：

1、查找字符串"adcdserddsfehdsd"中所有d出现的位置以及次数

2、判断一个字符串"adcdserddsfehdsd"中出现次数最多的字符，并统计其次数

3、有一个字符串"adcdserddsfehdsd"，把其中的所有的d替换成-

```javascript
<script>
      //1、查找字符串"adcdserddsfehdsd"中所有d出现的位置以及次数
            var str = "adcdserddsfehdsd";
            var index = str.indexOf("d");
            var num =1
            while (index !== -1) {
              console.log(index);
              index = str.indexOf("d", index + 1);
            }
            console.log('num'+num);
      </script>
<script>
```

```javascript
          //2、判断一个字符串"adcdserddsfehdsd"中出现次数最多的自负，并统计其次数
          // 思路：
          //   利用charAt()遍历这个字符串
          //   把每个字符都存储给对象，如果对象没有该属性，就为1，如果存在了就+1
          //   遍历对象，得到最大值和该字符
var str = "adcdserddsfehdsd";
            var obj = {};
            var max = 0;
            var ch=''
            for (var i = 0; i <script str.length; i++) {
              var chars = str.charAt(i);
              if (obj[chars]) {
                obj[chars]++;
              } else {
                obj[chars] = 1;
              }
            }
            for (var j in obj) {
              if (obj[j] > max) {
                max = obj[j];
                ch=j
              }
            }
            console.log("max:" + max, "值:"+ch);
```







## （一）、数据类型内存
### 1、简单类型与复杂类型
<font style="color:#F33232;">简单</font>类型又叫做<font style="color:#F33232;">基本数据</font>类型或者<font style="color:#F33232;">值</font>类型，<font style="color:#F33232;">复杂</font>类型又叫做<font style="color:#F33232;">引用</font>类型

值类型：简单数据类型/基本数据类型，在存储时变量中存储的时值本身，因此叫做值类型

string、number、boolean、undefined、null

注意：简单数据类型 null 返回的是一个空的对象object

如果有个变量我们以后打算存储为对象，暂时没想好放啥，就可以给null

引用类型：复杂数据类型，在存储时变量中存储的仅仅是地址（引用），因此叫做引用数据类型，通过new关键字创建的对象（系统对象、自定义对象），如Obect、Array、Date等

### 2、堆和栈
<font style="color:#404040;">简单理解栈的存取方式</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741693836350-4d5d40d5-2082-4eac-8d27-88feab4f5889.webp)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/gif/50923934/1741693836723-90ddfe59-ea7f-493c-a379-38de0d1f319d.gif)

简单理解下堆

<font style="color:#404040;">堆数据结构是一种树状结构。它的存取数据的方式，则与书架与书非常相似</font>

堆栈空间分配区别：

栈（操作系统）：<font style="color:#F33232;">简单数据类型存放在栈里面，</font><font style="color:#000000;">里面直接开辟一个空间存放的是值</font>

<font style="color:#000000;">堆（操作系统）：存储复杂类型（对象），一般由程序员分配释放，若程序员不释放，由垃圾回收机制回收。</font>

<font style="color:#FF0001;">复杂数据类型存放在堆里面，</font><font style="color:#000000;">它是先是在</font><font style="color:#FF0001;">栈里面存放地址，</font><font style="color:#000000;">十六进制表示，然后这个地址</font><font style="color:#FF0001;">指向堆里面的数据</font>

<font style="color:#FF0001;">总结：</font>

1、JS中的变量都是保存到栈内存里的

2、基本数据类型**<font style="color:#FF0000;">的值</font>**直接在**<font style="color:#FF0000;">栈内存</font>**中存储，值与值之间是**<font style="color:#FF0000;">独立</font>**存在的，修改一个变量不会影响其他的变量

3、引用数据类型**<font style="color:#FF0000;">的值</font>**直接保存到**<font style="color:#FF0000;">堆内存</font>**中的，每创建一个新的对象，就会在堆内存中开辟一个新的空间，而**<font style="color:#FF0000;">变量保存</font>**的是**<font style="color:#FF0000;">对象</font>**的**<font style="color:#FF0000;">内存地址</font>**（对象的引用），如果两个变量保存的是同一个对象引用，当一个通过一个变量修改属性时，另一个也会受到影响

4、比较两个基本属性类型的值时，就是比较值；

比较两个引用数据类型时，它是比较对象的内存地址，如果两个对象时一模一样的，但是地址不同，他也会返回false

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693837049-280b9b25-b8a1-4eba-9965-19c0cad5abde.png)

<font style="color:#000000;">课堂小练习 </font>

<font style="color:#000000;">1、画图掌握简单数据类型</font>

```javascript
<script>
    var a = 123;
    var b = a;
    a++;
</script>
```

<font style="color:#000000;">2、画图掌握复杂数据类型</font>

```javascript
<script>
      var obj = new Object();//{}
      obj.name = "java";
      var obj2 = obj;
      obj2.name = "web";
      console.log(obj.name);//web
      
      
      var obj=new Object    
      obj.name='java'
      
      var obj2=new Object  
            
      var obj2='java'
</script>
```

## 1、概念
正则表达式（规则表达式）

——用于定义一些字符串的规则，计算机可以根据正则表达式，来检查一个字符串是否符合规则，将字符串中符合规则的内容提取出来 

## 2、创建正则
### （1）、方式一：构造函数创建
**<font style="color:#FF0000;">var 变量=new RegExp("正则表达式","匹配模式");</font>**

**<font style="color:#FF0000;">参数一：规则</font>**

**<font style="color:#FF0000;">参数二：</font>**

**<font style="color:#FF0000;">i 忽略大小写</font>**

**<font style="color:#FF0000;">g 全局匹配模式</font>**

使用typeof检查正则对象，会返回object

```javascript
<script>
     var reg=new RegExp("a","i");//可以用来检查一个字符串中是否含有a，忽略大小写
     console.log(typeof reg);//object
</script>
```

### <font style="color:#000000;">（2）、</font>方式二：字面量来创建
**<font style="color:#FF0000;">语法：var 变量=/正则表达式/匹配模式</font>**

```javascript
<script>
     var reg = /a/i;
</script>
```

**<font style="color:#FF0000;">正则test()方法：</font>**

使用这个方法可以用来检查一个字符串是否符合正则表达式的规则，如果**<font style="color:#FF0000;">符合返回true</font>**，否则返回false

```javascript
<script>
      var reg = /a/i;
      var str = "abc";
      var res = reg.test(str);
      console.log(res);//true
      console.log(reg.test("cb"));//false
</script>
```

## <font style="color:#000000;">3、正则语法</font>
### （1）、使用 ｜ 表示 或者
<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //需求：创建一个正则表达式，检查一个字符串中是否有a或者b或者c</font>

<font style="color:#595959;">      var reg = /a|b|c/i;</font>

<font style="color:#595959;">      console.log(reg.test("bcd"));</font>

<font style="color:#595959;">    </script></font>

### （2）、[]里的内容也是或的关系 [ab]==a|b
**<font style="color:#FF0000;">[a-z] 任意小写字母</font>**

**<font style="color:#FF0000;">[A-Z] 任意大写字母</font>**

**<font style="color:#FF0000;">[A-z] 任意字母</font>**

**<font style="color:#FF0000;">[0-9] 任意数字</font>**

### （3）、 [^] 除了 查找任何不在方括号之间的字符
```javascript
<script>
      reg = /[^ab]/; //除了a或b,只要有ab以外的存在
      console.log(reg.test("abc")); //true
</script>
```

### <font style="color:#000000;">（4）、量词</font>
-通过量词可以设置一个内容出现的次数， 量词只对它前边的一个内容起作用

**<font style="color:#FF0000;">{n}正好出现n次</font>**

**<font style="color:#FF0000;">{m,n}出现m-n次</font>**

**<font style="color:#FF0000;">{m,}m次以上</font>**

**<font style="color:#FF0000;">+ 至少出现一次，相当于{1,}</font>**

**<font style="color:#FF0000;">* 0个或多个，相当于{0,}</font>**

**<font style="color:#FF0000;">？ 0个或1个，相当于{0,1}</font>**

```javascript
<script>
      var reg = /a{3}/; //==/aaa/
      reg = /ab{3}/; //abbb
      reg = /(ab){3}/; //ababab
      reg = /ab{1,3}c/; //b出现1-3次皆可
      reg = /ab+c/; //至少一个b
      reg = /a?bc/; //0个或1个a
      reg = /a*bc/; //有没有a都行
      //console.log(reg.test("bc"));
</script>
```

### （5）、^、$ 
**<font style="color:#FF0000;">^ 表示开头</font>**

**<font style="color:#FF0000;">$ 表示结尾</font>**

**<font style="color:#FF0000;">如果在正则表达式中，同时使用^$,则要求字符串必须完全符合正则表达式</font>**

```javascript
<script>
      reg = /^a/; //匹配开头的a
      reg = /a$/; //匹配结尾的a
      reg = /^aa$/;
      reg = /^a|a$/; //以a开头或者以a结尾
      console.log(reg.test("a"));
</script>
```

课堂小练习 

1、创建一个正则表达式，用来检查一个字符串是否是一个合法手机号

```javascript
<script>
      /* 课堂小练习：手机号的规则
        1:以1开头;
        2:第二位3-9的任意数字;
        3:三位以后任意数字9个;
           ^1 [3-9] [0-9]{9}$
      */
      var phoneStr = "183o6789012";
      var phoneReg = /^1[3-9][0-9]{9}$/;
      console.log(phoneReg.test(phoneStr));
</script>
```

### （6）、. 表示任意字符
### （7）、\ 转义字符
注意：使用构造函数时，由于它的参数是一个字符串，而\是字符串中转义字符， 如果要使用\则需要使用\\来代替

```javascript
<script>
  var reg = /\./; //  .
  reg = /\\/; //  \
  reg = new RegExp("\."); //在字符串中，要用\作为转义字符
</script>
```

### （8）、四组 \ 语法
**<font style="color:#FF0000;">\w -任意字母，数字，_ </font>**

**<font style="color:#FF0000;">\W -除了字母、数字、_</font>**

**<font style="color:#FF0000;">\d -任意数字[0-9]</font>**

**<font style="color:#FF0000;">\D -除了数字[^(0-9)]</font>**

**<font style="color:#FF0000;">\s -空格</font>**

**<font style="color:#FF0000;">\S -除了空格</font>**

**<font style="color:#FF0000;">\b -单词边界</font>**

**<font style="color:#FF0000;">\B -除了单词边界</font>**

```javascript
<script>
      /* 需求：创建一个正则表达式检查一个字符串中是否有单词child */
      reg = /\bchild\b/; //保证前后都没有，这是独立的单词
      // console.log(reg.test("hello,children"))
      /* 需求：去除字符串中的空格*/
      str = "   he  llo   ";
      //str=str.replace(/\s/g,"");//去除所有空格
      //去除开头的空格
      //str=str.replace(/^\s*/,"")//去除开头所有空格
      //str=str.replace(/\s*$/,"")//去掉结尾的空格
      //str = str.trim();//去除开头和结尾的空格
      console.log(str);
</script>
```

## <font style="color:#000000;">4、正则与字符串相关的方法</font>
### （1）、 split()
**<font style="color:#FF0000;">-可以将一个字符串拆分为一个数组 </font>**

-方法中可以传递一个正则表达式作为参数，这样方法将会根据<font style="color:#F33232;">正则表达式</font>去拆分字符串

**<font style="color:#FF0000;">-这个方法即使不指定全局匹配，也会全都拆分</font>**

```javascript
<script>
      var str = "1a2b3c4d5r6f7";
      var res = str.split("c"); //['1a2b3', '4d5r6f']
      //根据任意字母来将字符串拆分
      res = str.split(/[A-z]/); //['1', '2', '3', '4', '5', '6', '7']
</script>
```

### （2）、search()
-可**<font style="color:#FF0000;">以搜索字符串中是否含有指定内容</font>**

-如果搜索到指定内容，则会返回**<font style="color:#FF0000;">第一次</font>**出现的**<font style="color:#FF0000;">索引</font>**，如果**<font style="color:#FF0000;">没有</font>**搜索到，返回**<font style="color:#FF0000;">-1</font>**

-它可以接受一个正则表达式作为参数，然后会根据正则表达式去检索字符串

**<font style="color:#FF0000;">-search()只会查找第一个，即使设置全局匹配也没用</font>**

```javascript
<script>
      var str = "hello abc hello abc aec afc";
      res = str.search("abc"); //6
      res = str.search("abcd"); //-1
      res = str.search(/a[bef]c/); //6
</script>
```

### （3）、 match()
-可以根据正则表达式，从一个字符串中将符合条件的内容提取出来

-默认情况下，我们的**<font style="color:#FF0000;">match只会找到第一个符合要求的内容，</font>**找到以后就停止检索，我们可以**<font style="color:#FF0000;">设置</font>**正则表达式为**<font style="color:#FF0000;">全局</font>**匹配模式，从而**<font style="color:#FF0000;">匹配到所有的内容</font>**，可以为一个正则表达式设置多个匹配模式，且顺序都可以

**<font style="color:#FF0000;">-match()会讲匹配到的内容封装到一个数组中返回，即使只查询到一个结果</font>**

```javascript
<script>
      var str = "1a2b3c4d5r6f7A8B9";
      res = str.match(/[a-z]/gi); //['a', 'b', 'c', 'd', 'r', 'f', 'A', 'B']
      //console.log(Array.isArray(res));//true
      //console.log(res[0]);//a
</script>
```

<font style="color:#000000;">课堂小练习：筛选出数字</font>

```javascript
<script>
      // 需求：筛选出数字
      var str = "hhsdfx12453knls442k";
      //方式一
      var strArr = str.split("");
      let num = strArr.filter(function (a) {
        return !Number.isNaN(parseInt(a));
      });
      console.log(num.join(""));
      //方式二
      console.log(str.match(/\d/g).join(""));
</script>
```

### （4）、 replace()
**<font style="color:#FF0000;">-可以将字符串中指定内容替换为新的内容</font>**

**<font style="color:#FF0000;">-参数：</font>**

**<font style="color:#FF0000;">1:被替换的内容，可以接受正则表达式为参数</font>**

**<font style="color:#FF0000;">2:新的内容</font>**

**<font style="color:#FF0000;">-默认只会替换第一个</font>**

```javascript
<script>
      var str = "1a2a3a4d5r6f7A8B9";
      res = str.replace("a", "@");
      res = str.replace(/a/gi, "@"); //1@2@3@4d5r6f7@8B9
      res = str.replace(/[a-z]/gi, ""); //空串，就都删了
      console.log(res);
</script>
```



## （一）、DOM简介
### 1、什么是DOM
**<font style="color:#FF0000;">文档对象模型</font>**（Document Object Model ，简称DOM），它就是一些系列**<font style="color:#FF0000;">编程接口</font>**，有了这些接口，就可以**<font style="color:#FF0000;">改变页面内容，结构和样式</font>**

DOM树：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693837369-4b812c69-9ad7-4ef5-8b0f-6687650dffef.png)

文档：一个页面就是一个文档，DOM中使用document表示

元素：页面中所有的标签都是元素，DOM中使用element表示

节点：网页中所有内容都是节点（标签、属性、文本、注释等），DOM中使用node表示

**<font style="color:#FF0000;">DOM把以上内容都看作是对象</font>**

### <font style="color:#000000;">2、事件前言</font>
**<font style="color:#FF0000;">事件，就是用户和浏览器之间的交互行为</font>**，比如：点击按钮，鼠标移动，关闭窗口..... 

事件非常多，为了方便演示，先学简单的事件，后面再详细学习

**<font style="color:#000000;">第一种方式：</font>**

**<font style="color:#000000;">标签中</font>**对应的属性中**<font style="color:#000000;">设置一些js代码</font>**，这样当事件被触发时，这些代码将会被执行

这种方式：**<font style="color:#FF0000;">结构与行为耦合，不方便维护，不推荐使用</font>**

```javascript
<script>
     <button id="btn"  onclick="alert('哈喽');">我是一个按钮</button> //onclick点击事件，点击的时候触发
</script>
```

**<font style="color:#000000;">第二种方式：</font>**

可以为按钮的对应事件**<font style="color:#000000;">绑定处理函数</font>**的形式来响应事件，这样当**<font style="color:#000000;">事件被触发</font>**时，其**<font style="color:#000000;">对应的函数将会被调用</font>**

```javascript
<body>
    <button id="btn">我是一个按钮</button>
    <script>
      //第一步：获取按钮对象
      var btn=document.getElementById("btn");
      //第二步：绑定一个单击事件
      //像这种为单击事件绑定的函数，我们称为单击响应函数
      btn.onclick=function(){
          alert("你好")
      }
    </script>    
</body>
```

### 3、文档的加载
浏览器在加载一个页面时，是按照自上向下的顺序加载的，读取到一行就运行一行,如果**<font style="color:#000000;">将script标签写到页面的上边</font>**，在代码执行时，页面还没有加载，页面没有加载DOM对象也没有加载，会导致**<font style="color:#000000;">无法获取到DOM对象</font>**。

**<font style="color:#000000;">第一种加载情况：</font>**

将**<font style="color:#000000;">js</font>**代码编写到**<font style="color:#000000;">页面的下部</font>**就是为了，可以在页面加载完毕以后再执行js代码

```javascript
<button id="btn">点我一下</button>
    <script type="text/javascript">
      //获取id为btn的按钮
      var btn = document.getElementById("btn");
      //为按钮绑定一个单击响应函数
      btn.onclick = function () {
        alert("hello");
      };
</script>
```

**<font style="color:#000000;">第二种加载写法：</font>**

**<font style="color:#000000;">onload事件会在整个页面加载完成之后才触发， 为window绑定一个onload事件</font>**，该事件对应的响应函数将会**<font style="color:#000000;">在页面加载完成之后执行</font>**，这样可以确保我们的代码执行时所有的DOM对象已经加载完毕了

```javascript
<script type="text/javascript">
      window.onload = function () {
          //获取id为btn的按钮
          var btn = document.getElementById("btn");
          //为按钮绑定一个单击响应函数
          btn.onclick = function () {
            alert("hello");
          };
        };
</script>
```

## （二）、获取元素
DOM在我们实际开发中主要用来操作元素。一般有以下方法获取DOM

### 1、getElementById()
通过**<font style="color:#FF0001;">id</font>**属性获取一个元素节点对象，参数：id是大小写敏感的**<font style="color:#FF0001;">字符串</font>**，返回的是一个元素对象

补充1：innerHTML 可读写，一方面可获取到元素内部的html代码，另一方面可以操作更改元素内容，包括标签，保留空格和换行，比较常用

补充2：innerText 可读写，它和innerHTMl类似，不同的是更改元素内容的时候，它会自动将html标签，空格和换行去除

补充3：console.dir打印我们返回的元素对象，更好的查看里面的属性和方法

### 2、 getElementsByTagName()
#### （1）、根据标签名来获取**<font style="color:#FF0001;">一组</font>**元素节点对象
**<font style="color:#FF0001;">返回</font>**一个**<font style="color:#FF0001;">类数组(伪数组)</font>**对象，所有查询到的元素都会封装到对象中，即使查询到的元素只有一个，也会封装到伪数组中返回;如果页面中**<font style="color:#FF0001;">没有</font>**这个元素，则会**<font style="color:#FF0001;">返回</font>**一个**<font style="color:#FF0001;">空</font>**的**<font style="color:#FF0001;">伪数组</font>**；

```javascript
<script type="text/javascript">
      var btn02 = document.getElementById("btn02");
        btn02.onclick = function () {
          var lis = document.getElementsByTagName("li");
          //打印lis
          //alert(lis.length);
          //遍历lis
          for (var i = 0; i < lis.length; i++) {
            console.log(lis[i].innerHTML);
          }
        };
</script>
```

#### （2）获取某个元素（父元素）内部所有指定标签名的元素
element.getElementsByTagName('标签名')

注意：父元素必须**<font style="color:#FF0001;">是单个对象（必须指明是哪一个元素对象）</font>**，获取的时候**<font style="color:#FF0001;">不包括父元素自己</font>**

```javascript
<script type="text/javascript">
        //获取id为city的元素
        var city = document.getElementById("city");
      /*  1:city.getElementsByTagName(); 获取元素下的一组节点  */
      var lis = city.getElementsByTagName("li");
</script>
```

### 3、getElementsByName()
通过**<font style="color:#FF0001;">name属性</font>**获取一组元素节点对象

补充2： innerHTML用于获取元素内部的HTML内容的，对于**<font style="color:#FF0001;">自结束标签</font>**，这个属性**<font style="color:#FF0001;">没有意义</font>**

补充3：如果需要读取元素节点属性，语法：**<font style="color:#FF0001;"> 元素.属性名，</font>**

例如：元素.id ；元素.name ；元素.src ;元素.href等

表单属性：type、value、checked、selected、disabled等

注意：**<font style="color:#FF0001;">class属性不能采用这种方式，读取class属性时需要使用 元素.className</font>**

**<font style="color:#FF0001;">value值：就是输入文本框中的内容，要修改value值 element.value = "～～";</font>**

```javascript
<script type="text/javascript">
       var btn03 = document.getElementById("btn03");
        btn03.onclick = function () {
          var inputs = document.getElementsByName("gender");
          //alert(inputs.length);
          for (var i = 0; i < inputs.length; i++) {
             //alert(inputs[i].innerHTML);
            // alert(inputs[i].value);
            alert(inputs[i].className);
          }
        };
</script>
```

### 4、getElementsByClassName()
通过**<font style="color:#FF0001;">class</font>**属性获取一组元素节点对象（不支持IE8及以下浏览器）

```javascript
<script type="text/javascript">
      var btn04 = document.getElementById("btn04");
        btn04.onclick = function () {
          var classs = document.getElementsByClassName("inner");
          for (var i = 0; i < classs.length; i++) {
            alert(classs[i].className);
          }
        };
</script>
```

### 5、childNodes、children返回父元素下的所有子节点
（1）、**<font style="color:#FF0001;">childNodes</font>**属性会**<font style="color:#FF0001;">获取包括文本节点在内的所有节点</font>**，DOM标准，标签间的空白也会被当成文本节点

（2）、**<font style="color:#FF0001;">children</font>**属性可以**<font style="color:#FF0001;">获取当前元素的所有子元素</font>**，不包括空白文档了

### 6、firstChild、firstElementChild返回父元素下的第一个子节点
（1）、**<font style="color:#FF0001;">firstChild 第一个子节点(包括空白的文本节点)</font>**

（2）、**<font style="color:#FF0001;">firstElementChild 获取当前元素的第一个子元素</font>**

### 7、返回某元素的父节点
语法：**<font style="color:#FF0001;">某元素.parentNode</font>**

### 8、返回某元素的前一个兄弟节点
（1）、 **<font style="color:#FF0001;">previousSibling </font>**[ˈpriːviəs] ['sibliŋ] 返回前一个兄弟节点 也有可能**<font style="color:#FF0001;">获取到空白的文本</font>**

（2）、 **<font style="color:#FF0001;">previousElementSibling </font>**返回前一个兄弟元素，**<font style="color:#FF0001;">不包括空白文本</font>**，注意：不支持ie8及以下的浏览器 

```javascript
<script type="text/javascript">
      var div = document.querySelector(".box1 div")
      var div = document.querySelector(".box1")
      var div=document.querySelectorAll(".box1")
</script>
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693837646-95d508d2-fb5c-43eb-b580-899d6b34205a.png)

### 9、获取body标签
```javascript
<script type="text/javascript">
        //方法一
        var body=document.getElementsByTagName("body")[0];
        //方法二
        var body = document.body
</script>
```

### 10、获取html根标签
```javascript
<script type="text/javascript">
       var html = document.documentElement;
</script>
```

### 11、获取页面中所有的元素
```javascript
<script type="text/javascript">
        //第一种方式
        var all=document.all;
        //第二种方式
        var all = document.getElementsByTagName("*")
</script>
```

### 12、document.querySelector() 
-需要一个选择器的字符串作为参数，可以根据一<font style="color:#FF0001;">个</font>**<font style="color:#FF0001;">css选择器</font>**来查询 一个元素节点对象

-该方法总会**<font style="color:#FF0001;">返回唯一的元素</font>**，如果满足条件的元素是多个，那么它**<font style="color:#FF0001;">只会返回第一个</font>**

-IE8以上的都适用

### 13、document.querySelectorAll()
-该方法和**<font style="color:#FF0001;">qureySelector</font>**()用法类似，不同的是它将会将**<font style="color:#FF0001;">符合条件的所有元素封装到一个伪数组中返回</font>**

-即使符合条件的元素只有一个，它也会**<font style="color:#FF0001;">返回数组</font>**

```javascript
<script type="text/javascript">
      var div = document.querySelector(".box1 div")
      var div = document.querySelector(".box1")
      var div=document.querySelectorAll(".box1")
</script>
```

课堂小练习：

1、分时显示不同图片，显示不同问候语

根据不同时间、页面显示不同的图片、同时显示不同的问候语。上午时间打开页面，显示上午好，显示上午的图片；下午显示下午的，晚上显示晚上的

2、防小米显示密码：点击按钮将密码框切换为文本框，并可以查看密码明文

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693838014-0edded52-41bd-4a5a-bb07-dda142d22ccc.png)

```javascript
<input type="password" id="passwordInput" />
<button onclick="togglePassword()">显示密码</button>

function togglePassword() {
  var passwordInput = document.getElementById("passwordInput");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}
```



## 1、事件概述
JS使我们有能力创建动态页面，而事件是可以被JS侦测的行为

简单理解：触发----响应机制

网页中每个元素都可以产生某些可以触发JS的事件，例如点击事件

事件是由三部分组成 事件源 事件类型 事件处理程序称为事件三要素

**<font style="color:#FF0000;">事件源： 事件被触发的对象 谁被触发</font>**

**<font style="color:#FF0000;">事件类型：如何触发，什么事件例如鼠标点击，鼠标经过，键盘按下等</font>**

**<font style="color:#FF0000;">事件处理程序：通过函数赋值的方式完成</font>**

执行事件的步骤：

**<font style="color:#FF0000;">获取</font>**事件源

注册事件（**<font style="color:#FF0000;">绑定</font>**事件）

添加事件处理程序（采取**<font style="color:#FF0000;">函数赋值</font>**形式）

```javascript
<script type="text/javascript">
      //第一步：获取按钮对象
      var btn=document.getElementById("btn");
      //第二步：绑定一个单击事件
      //第三步：添加事件处理程序
      btn.onclick=function(){//像这种为单击事件绑定的函数，我们称为单击响应函数
          alert("你好")
      }
</script>
```

常见的事件

| 鼠标事件 | 触发条件 |
| --- | --- |
| <font style="color:rgb(243, 50, 50);">onclick</font> | **<font style="color:rgb(255, 0, 0);">当单击鼠标时运行脚本。</font>** |
| onmousedown | 当按下鼠标按钮时运行脚本。 |
| onmouseup | 当松开鼠标按钮时运行脚本。 |
| onmousemove | 当鼠标指针移动时运行脚本。 |
| <font style="color:rgb(223, 42, 63);">onmouseover</font> | 当鼠标指针移至元素之上时运行脚本，不可以阻止冒泡。 |
| onmouseout | 当鼠标指针移出元素时运行脚本，不可以阻止冒泡。 |
| <font style="color:rgb(243, 50, 50);">onmouseenter</font> | 当鼠标**<font style="color:rgb(255, 0, 0);">指针移至元素之上</font>**时运行脚本，可以阻止冒泡。 |
| <font style="color:rgb(243, 50, 50);">onmouseleave</font> | 当鼠标**<font style="color:rgb(255, 0, 0);">指针移出</font>**元素时运行脚本，可以阻止冒泡。 |
| onmousewheel | 当转动鼠标滚轮时运行脚本。 |
| onscroll | 当滚动元素的滚动条时运行脚本。 |
| 键盘事件 | 触发条件 |
| <font style="color:rgb(243, 50, 50);">onkeyup</font> | 某个键盘**<font style="color:rgb(255, 0, 0);">按键被松开</font>**时触发** （document，window） |
| <font style="color:rgb(243, 50, 50);">onkeydown</font> | 某个**<font style="color:rgb(255, 0, 0);">键盘按键被按下</font>**时触发，<font style="color:rgb(51, 51, 51);">通常不会触发事件冒泡，除非特别处理‌</font> |
| onkeypress | 某个键盘按键被按下时触发，<font style="color:rgb(51, 51, 51);">会触发事件冒泡</font> |
| 表单事件 | 触发条件 |
| <font style="color:rgb(243, 50, 50);">onfocus</font> | 表单**<font style="color:rgb(255, 0, 0);">获得焦点</font>**触发** |
| <font style="color:rgb(243, 50, 50);">onblur</font> | 表单**<font style="color:rgb(255, 0, 0);">失去焦点</font>**触发 |
| oninput | 表单每次输入触发** |
| <font style="color:rgb(243, 50, 50);">onchange</font> | 表单**<font style="color:rgb(255, 0, 0);">内容发生改变时</font>**触发** |
| onselect | 表单**<font style="color:rgb(255, 0, 0);">文本被选取</font>**时触发 |
| onreset | 表单重置时触发 |
| onsubmit | 表单提交时触发 |


## 2、操作元素
JS的DOM操作可以改变网页内容、结构和样式，我们可以利用DOM操作元素来改变元素里面的内容、属性等

### 2.1、改变元素内容
**<font style="color:#FF0000;">element.innerText</font>** 从起始位置到终止位置的内容，会**<font style="color:#FF0000;">去除html标签，</font>**同时**<font style="color:#FF0000;">空格和换行也会去掉</font>**

**<font style="color:#FF0000;">element.innerHTML</font>** 从起始位置到终止位置的全部内容，**<font style="color:#FF0000;">包括html标签，保留空格和换行</font>**

#### 2.1.1 基本使用
```javascript
<body>
    <!-- 需求：点击button，切换内容 -->
    <button>点我切换内容</button>
    <div>天气炎热</div>
    <script>
      // 1、获取元素
      var btn = document.querySelector("button");
      var div = document.querySelector("div");
      // 2、绑定事件
      //3、事件处理函数
      btn.onclick = function () {
          //console.log(div.innerText);
         //console.log(div.innerHTML);
        //方式一、操作元素内容--innerText
        // div.innerText = "天气凉爽";
        //方式二、操作元素内容--innerHTML
        div.innerHTML = "天气凉爽";
      };    
    </script>
</body>
```

#### 2.1.2 两者区别
写：innerText 不识别html标签，innerHTML识别html标签

读：innerText，innerHTML可以获取元素内面的内容，innerText去除空格、换行和标签，innerHTML可以获取到元素里面的标签，同时保留空格和换行

### 2.2、改变元素其他属性
src、href、id、alt、title等属性

```javascript
<body>
    <!-- 需求：点击对应的按钮，可以切换图片已经更改title值 -->
    <button id="dog">小狗</button>
    <button id="cat">小猫</button><br /><br />
    <img src="./img/pic_01.jpg" title="小狗" />

    <script>
      // 1、获取元素
      var dog = document.querySelector("#dog");
      var cat = document.querySelector("#cat");
      var img = document.querySelector("img");
      //2、绑定事件、处理函数
      dog.onclick = function () {
        img.src = "./img/pic_01.jpg";
        img.title = "小狗";
      };
      cat.onclick = function () {
        img.src = "./img/pic_02.jpg";
        img.title = "小猫";
      };
    </script>
</body>
```

### 2.3、操作表单元素属性
type、value、checked、selected、disabled等

```javascript
<body>
    <!-- 需求：1、点击按钮，更换input里的显示内容为：‘内容被修改了’ 
    需求2:点击按钮，按钮就被禁用了
    -->
    <button>按钮</button>
    <input type="text" value="请输入内容" />
    <script>
      // 1、获取元素
      var btn = document.querySelector("button");
      var int = document.querySelector("input");
      // 绑定点击事件，处理函数
      btn.onclick = function () {
        int.value = "内容被修改了";
        btn.disabled = true;
      };
    </script>
</body>
```

### 2.4、操作样式属性操作
可以通过JS修改元素的大小、颜色、位置等样式

**<font style="color:#FF0000;">element.style 行内样式操作 </font>**

（1）、JS里面的样式采取**<font style="color:#FF0000;">小驼峰命名</font>**发，比如fontSize、backgroundClolor

（2）、JS修改style样式操作，产生的是行内样式，css权重比较高

**<font style="color:#FF0000;">element.className 类名样式操作</font>**

（1）、如果样式修改较多，可以采取操作类名的方式更改元素样式

（2）、class因为是个保留字，因此使用className来操作元素类名属性

（3）、className 会直接更改元素的类名，**<font style="color:#FF0000;">会覆盖原先的类名</font>**，如果**<font style="color:#FF0000;">想保留</font>**原先的类名，再添加更改的时，需要**<font style="color:#FF0000;">把原先类名加上</font>**

```javascript
<body>
    <div class="box">box</div>
    <script>
      // 需求1：点击div，div颜色变色，用行内样式实现
      var box = document.querySelector(".box");
      box.onclick = function () {
        box.style.backgroundColor = "red";
      };
      // 需求2:鼠标移入，div的宽高发生变化，字体大小变化，字体加粗
      box.onmouseover = function () {
        // js里有个this的存在，在不同的情况下，指代不同的内容
        //在事件函数里，this指代调用者，也就是指向事件源
        this.className = "box1";
      };
    </script>
</body>
```

### 2.5、排他思想
如果有同一组元素，想要某一个元素实现某种样式，需要用到循环的排他思想算法

<font style="color:#000000;">步骤：</font>

**<font style="color:#FF0000;">清除所有元素的样式</font>**

**<font style="color:#FF0000;">给当前元素设置样式</font>**

注意顺序不能颠倒

```javascript
<body>
    <!-- 需求：给当前点击的按钮，添加背景色 -->
    <button>按钮1</button>
    <button>按钮2</button>
    <button>按钮3</button>
    <button>按钮4</button>
    <script>
      //1、获取到所有的按钮
      var btns = document.querySelectorAll("button");
      //2、通过循环，给所有的按钮绑定点击事件，处理函数
      for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function () {
          // 2.1清楚所有按钮的背景色
          for (var i = 0; i < btns.length; i++) {
            btns[i].style.backgroundColor = "";
          }
          //2.2
          this.style.backgroundColor = "red";
        };
      }
    </script>
  </body>
```

### 2.6、操作自定义属性
#### 1、获取属性值：
方式一：**<font style="color:#FF0000;">element.属性</font>** 获取属性值（获取元素**<font style="color:#FF0000;">自身自带</font>**的属性，例如id，href，src等）

方式二：**<font style="color:#FF0000;">element.getAttribute('属性')</font>** 主要**<font style="color:#FF0000;">获取自定义</font>**的属性，我们程序员自己家的属性,也可以获取元素自带属性

#### 2、设置属性值
方式一：**<font style="color:#FF0000;">element.属性='值' 设置属性值</font>**

方式二：e**<font style="color:#FF0000;">lement.setAttribute('属性','值')</font>** 设置**<font style="color:#FF0000;">自定义属性</font>**，也可以设置元素自带属性

#### 3、移除某个属性
**<font style="color:#FF0000;">element.removeAttribute("属性"); 移除某个属性</font>**

```javascript
<body>
    <!-- 需求1：获取a标签对应的href属性值以及index属性值
         需求2：设置a标签对应的href属性值为京东，以及修改index属性值为2
         需求3：移除abc属性   
    -->
    <a href="https://www.baidu.com/" index="1" abc="123">百度</a>
    <br /><br />
    <button id="btn1">获取</button>
    <button id="btn2">设置</button>
    <button id="btn3">移除</button>
    <script>
      var a = document.querySelector("a");
      var btn1 = document.querySelector("#btn1");
      var btn2 = document.querySelector("#btn2");
      var btn3 = document.querySelector("#btn3");

      btn1.onclick = function () {
        // 需求1
        console.log(a.href, "自带属性");
        console.log(a.getAttribute("index"), "自定义属性");
        console.log(a.getAttribute("href"), "自带属性");
      };
      btn2.onclick = function () {
        // 需求2
        a.href = "https://www.jd.com/";
        a.setAttribute("index", "2");
      };
      btn3.onclick = function () {
        // 需求3
        a.removeAttribute("abc");
      };
    </script>
</body>
```

#### 4、设置h5自定义属性
为了区分自定义属性，还是元素自带属性

H5给我们新增了自定义属性规范：

H5规定自定义属性**<font style="color:#FF0000;">以data-开头作为属性名并附值 </font>**

获取自定义属性

方式一：**<font style="color:#FF0000;">element.getAttribute('属性') </font>**

方式二：**<font style="color:#FF0000;">element.dataset.去除掉data-的属性名</font>**

```javascript
<body>
    <div data-index="abc" data-last-name="王"></div>
    <script>
      var div = document.querySelector("div");
      //设置自定义属性
      div.setAttribute("data-id", "hello");
      //获取自定义属性
      //方式一：element.getAttribute("自定义属性名")
      console.log(div.getAttribute("data-index"));
      //方式二：element.dataset.属性名
      console.log(div.dataset); //得到一个对象
      console.log(div.dataset.index); //读取对象
      console.log(div.dataset["id"]); //读取对象
      console.log(div.dataset.lastName); //驼峰命名法读取
    </script>
</body>
```





# 节点操作
## 1、创建节点
**<font style="color:#FF0000;">docment.createElement('节点')</font>**

**<font style="color:#FF0000;">参数：标签名字符串</font>**

这些元素原先不存在，是根据需求动态生成的，所以也成为动态创建元素节点，会将创建好的对象作为返回值返回

## 2、创建文本
**<font style="color:#FF0000;">document.createTextNode()可以用来创建一个文本节点对象</font>**

**<font style="color:#FF0000;">参数：文本内容字符串，并将新的节点返回</font>**

## 3、添加节点		(先有父母才能生孩子)	
**<font style="color:#FF0000;">father.appendChild(child) 追加元素 类似数组中的push()</font>**

将一个节点添加到指定父节点的**<font style="color:#FF0000;">子节点列表的末尾</font>**。类似css里面的after伪元素

**<font style="color:#FF0000;">father.insertBefore(child,指定元素)</font>**

将一个节点**<font style="color:#FF0000;">添加到父节点的指定子节点前面</font>**。类似css里面的before伪元素

```javascript
<body>
    <!-- 
       需求1：在段落p的后面添加一个span标签，添加span的文本内容‘我是一个span’
       需求2：在段落p的前面添加一个h1标签，添加h1的文本内容，‘我是一个h1’
     -->
    <div id="box">
      <p>段落</p>
    </div>
    <button>添加span</button>
    <button>添加h1</button>
    <script>
      var btns = document.querySelectorAll("button");
      var p = document.querySelector("p");
      var box = document.getElementById("box");
      //需求1
      btns[0].onclick = function () {
        // 1.1创建节点
        var span = document.createElement("span");
        // 1.2 创建文本内容
        var spanTest = document.createTextNode("我是一个span");
        //1.3将文本内容放入到span节点里
        span.appendChild(spanTest);
        // 1.2追加节点
        box.appendChild(span);
      };
      //需求2
      btns[1].onclick = function () {
        //   2.1 创建节点
        var h1 = document.createElement("h1");
        //2.2创建h1文本内容
        var h1Test = document.createTextNode("我是一个h1");
        //2.3 将h1Test放入到节点内
        h1.appendChild(h1Test);
        //2.4 添加节点
        box.insertBefore(h1, p);
      };
    </script>
  </body>
```

1. <font style="color:#595959;">创造节点</font>
2. <font style="color:#595959;">创造/完善节点内容</font>
3. <font style="color:#595959;">确定节点和内容的关系</font>
4. <font style="color:#595959;">确定新节点与原有内容的关系</font>

## 4、替换节点
**<font style="color:#FF0000;">replaceChild() </font>**

-可以使用指定的子节点替换已有的子节点

-语法：**<font style="color:#FF0000;">父节点.replaceChild(新节点，旧节点)			    通知父亲换新号（舍旧迎新）</font>**

## 5、删除节点
写法一、**<font style="color:#FF0000;">father.removeChild(child)						通过父亲买走孩子</font>**

写法二、**<font style="color:#FF0000;">child.parentNode.removeChild(child)              通过孩子找父亲买走他</font>**

**<font style="color:#FF0000;">可以在DOM中删除一个子节点，返回删除的节点</font>**

```javascript
<body>
    <!-- 需求一：点击按钮1，将《金瓶梅》替换为《水浒传》
           需求二：点击按钮2，删除《金瓶梅》
    -->
    <button>按钮1</button>
    <button>按钮2</button>
    <ul>
      <li>《红楼梦》</li>
      <li>《三国演义》</li>
      <li>《西游记》</li>
      <li>《金瓶梅》</li>
    </ul>
    <script>
      var btns = document.querySelectorAll("button");
      var ul = document.querySelector("ul");
      var jpm = ul.children[3];
      btns[0].onclick = function () {
        // 创建《水浒传》节点
        var newLi = document.createElement("li");
        var newLiTest = document.createTextNode("《水浒传》");
        newLi.appendChild(newLiTest);
        // 替换节点
        ul.replaceChild(newLi, jpm);
      };
      btns[1].onclick = function () {
        // 删除节点写法一
        ul.removeChild(jpm);
        // 删除节点写法二
        // jpm.parentNode.removeChild(jpm);
      };
    </script>
  </body>
```

## 6、克隆节点
**<font style="color:#FF0000;">node.cloneNode() </font>**返回调用该方法的节点的一个副本

参数：**<font style="color:#FF0000;">布尔值</font>**

**<font style="color:#FF0000;">false 只克隆节点本身，不克隆里面的子节点</font>**

**<font style="color:#FF0000;">true 拷贝节点，拷贝内容</font>**

```javascript
<body>
    <!-- 需求:点击按钮克隆div元素-->
    <div id="box">box盒子</div>
    <button>克隆</button>
    <script>
      var box = document.getElementById("box");
      document.querySelector("button").onclick = function () {
        // 克隆节点
        // var newBox = box.cloneNode();
        var newBox = box.cloneNode(true);
        //添加克隆节点
        box.parentNode.appendChild(newBox);
      };
    </script>
</body>
```

## 7、创建节点另外几种方式
#### （1）、element.innerHTML 
允许更改html元素的内容,可以设置或返回表格行的开始和结束标签之间的HTML，可以解析html标签

#### （2）、 element.innerText
获取或设置元素的文本----以纯文本的方式直接显示，不可以解析html标签

#### （3）、document.write()
直接将内容写入页面的内容流，但是文档执行完毕，则会导致页面全部重绘

```javascript
<body>
    <!-- 
    需求1：获取ul里面的li内容
    需求2:在ul里添加《水浒传》到页面中
         innerHTML、document.write()      
    -->
    <button>获取</button>
    <button>添加</button>
    <ul>
      <li>《红楼梦》</li>
    </ul>
    <script>
      var btns = document.querySelectorAll("button");
      var ul = document.querySelector("ul");
      // 需求1
      btns[0].onclick = function () {
        var test1 = ul.innerHTML;
        // console.log(test1, "test1");
        var test2 = ul.innerText;
        // console.log(test2, "test2");
      };
      //需求2
      btns[1].onclick = function () {
        //   第一种写法（创新标签并用innerHTML直接修改新标签内容）
        // var li = document.createElement("li");
        // li.innerHTML = "《水浒传》";
        // ul.appendChild(li);
        // 第二种写法（不创建新标签，直接用字符串拼接方法’+’ 修改元素自身的innerHTML内容）
        let liElement=`<li>《水浒传》</li>`
        ul.innerHTML = ul.innerHTML+liElement;
         // 第三种写法 （通过document.Write()直接输出内容 ）
        let bodyElement=document.body.innerHTML+liElement
        document.write(bodyElement);
        //第四种	利用（insertAdjacentHTML() ）
        ul.insertAdjacentHTML('beforebegin',liElement) 
      };
    </script>
</body>
```

(3 )、insertAdjacentHTML() /əˈdʒeɪsnt/

insertAdjacentHTML() 是Element的API中的一个方法，可以将**<font style="color:#FF0000;">字符串文本转化为你想要的节点</font>**（Node），并且**<font style="color:#FF0000;">插入到你想要插入的位置中</font>**。而且它并**<font style="color:#FF0000;">不会</font>**向innerHTML一样会**<font style="color:#FF0000;">替换掉已有的节点，而是会插入到指定位置。</font>**

**<font style="color:#FF0000;">语法：element.insertAdjacentHTML(position,text)</font>**

参数1: position顾名思义，就是想要插入的位置，一共有4个固定的值

**<font style="color:#FF0000;">'beforebegin'</font>**：元素element**<font style="color:#FF0000;">自己的前面</font>**。

**<font style="color:#FF0000;">'afterbegin'</font>**：**<font style="color:#FF0000;">插入</font>**到元素element里面的**<font style="color:#FF0000;">第一个子节点之前</font>**（也就是总是会插入到最前面，例如我插入5个节点，顺序是1、2、3、4、5，那么我就需要以5、4、3、2、1的顺序插入，有一种栈结构先进后出的感觉）。

**<font style="color:#FF0000;">'beforeend'</font>**：**<font style="color:#FF0000;">插入</font>**元素element里面的**<font style="color:#FF0000;">最后一个子节点之后</font>**（这个比较容易理解，就是插入到最后一个节点后，例如我插入5个节点，顺序是1、2、3、4、5，那就正常的1、2、3、4、5就好啦，但是注意是在已有节点的后面哦）。

**<font style="color:#FF0000;">'afterend'</font>**：元素element**<font style="color:#FF0000;">自己的后面</font>**。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693838301-a12f1ba4-6f23-4e2b-8e29-5886c6d9de93.png)

参数2:text文本

可以结合``字符串使用

```javascript
<body>
      <button>获取</button>
      <button>添加</button>
      <ul>
        <li>《红楼梦》</li>
      </ul>
      <script>
        var btns = document.querySelectorAll("button");
        var ul = document.querySelector("ul");
      
        btns[1].onclick = function () {
           // 第三种写法  insertAdjacentHTML()
          var li = `<li>《水浒传》</li>`;
          ul.insertAdjacentHTML('beforeend',li);
        };
      </script>
</body>
```



# 事件高级
## 1、注册事件方式
### （1）、传统注册方式：
利用on开头的事件，例如onclick

同一个元素同一个事件只能设置一个处理函数，最后注册的处理函数将会覆盖前面注册的处理函数

```javascript
<script>
      var btns = document.querySelectorAll("button");
      btns[0].onclick = function () {
        alert("1");//不执行
      };
      btns[0].onclick = function () {
        alert("2");//执行
      };
</script>
```

### （2）、addEventListener方法监听注册方式：
**<font style="color:#FF0000;">addEventListener(type,listener[,useCapture])</font>**

同一个元素同一个事件可以注册多个处理函数，按注册顺序依次执行

参数：

**<font style="color:#FF0000;">type</font>**<font style="color:#FF0001;">：</font>事件**<font style="color:#FF0000;">类型字符串</font>**，例如click、mouseover，注意这里**<font style="color:#FF0000;">不用带on</font>**

**<font style="color:#FF0000;">listener</font>**<font style="color:#FF0001;">：</font>事件**<font style="color:#FF0000;">处理函数</font>**，事件**<font style="color:#FF0000;">发生</font>**时，会**<font style="color:#FF0000;">调用</font>**该监听函数

**<font style="color:#FF0000;">useCapture</font>**<font style="color:#FF0001;">：</font>**<font style="color:#FF0000;">可选</font>**，是否在捕获阶段触发事件，需要一个布尔值**<font style="color:#FF0000;">；默认</font>**是**<font style="color:#FF0000;">false</font>**，在**<font style="color:#FF0000;">冒泡</font>**阶段处理程序；如果是**<font style="color:#FF0000;">true</font>**，就是在**<font style="color:#FF0000;">捕获</font>**阶段处理程序（后面事件流时，详细说）

注意：ie8及以下不支持

```javascript
<script>
      btns[1].addEventListener(
        "click",
        function () {
          alert(1);
        },
        false
      );
      btns[1].addEventListener(
        "click",
        function () {
          alert(2);
        },
        false
      );
</script>
```

### （3）、attachEvent 方法监听注册方式：(一般不用)
**<font style="color:#FF0000;">attachEvent(type,listener)</font>**在**<font style="color:#FF0000;">ie8</font>**中可以使用，其他浏览器不能用

参数

**<font style="color:#FF0000;">type</font>**：**<font style="color:#FF0000;">事件的字符串，要on</font>**

**<font style="color:#FF0000;">listener：回调函数</font>**

注意：这个方法也可以同时为一个事件绑定多个处理函数，不同的是它后绑定先执行

```javascript
<script>
      //在ie8中可以使用，其他浏览器不能用
      btns[2].attachEvent("onclick", function () {
        alert("attachEvent 1");
      });
      btns[2].attachEvent("onclick", function () {
        alert("attachEvent 2");
      });

</script>
```

## 2、解绑事件（删除事件）
### （1）、传统注册方式解绑
```javascript
<script>
      eventTarget.onclick=null
      btns[0].onclick = function () {
        alert("1");
        //解绑事件
        btns[0].onclick = null;
      };
</script>
```

### （2）、addEventListener方法注册解绑
```javascript
<script>
        eventTarget.removeEventListener(type,listener)
        btns[1].addEventListener("click", fun);
        function fun() {
          alert(1);
          btns[1].removeEventListener("click", fun);
        }
</script>
```

### （3）、attachEvent 方法注册解绑
```javascript
<script>
        eventTarget.detachEvent(eventName,callback)
        btns[2].attachEvent("onclick", fun1);
        function fun1() {
          alert("attachEvent 1");
          btns[2].detachEvent("onclick", fun1);
        }
</script>
```

## 3、DOM事件流
### 1>、事件流概述
**<font style="color:#FF0000;">事件流</font>**描述的是**<font style="color:#FF0000;">从页面中接收事件的顺序</font>**

事件发生时会在元素节点之间按照<font style="color:#FF0001;">特定的顺序</font>传播，这个传播的过程叫事件流

例如：给idiv绑定一个事件，时间流顺序如下

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693838576-be19e7cf-e58a-4c53-b00c-582d3ed40a33.png)

DOM事件流分为3个阶段

（1）、**<font style="color:#FF0000;">捕获</font>**阶段：<font style="color:#777777;">从触发事件的目标元素开始，事件被从目标元素的所有祖先元素依次往下传递（</font>**<font style="color:#FF0000;">从外向内</font>**<font style="color:#777777;">）</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693838905-c26f810a-8496-4075-87a8-b9de69a0a911.png)

（2）、**<font style="color:#FF0000;">当前目标阶段</font>**：<font style="color:#333333;">触发自己的事件</font>

（3）、**<font style="color:#FF0000;">冒泡</font>**阶段：<font style="color:#333333;"> </font><font style="color:#777777;">当一个元素的事件被触发时，同样的事件将会在该元素的所有祖先元素中依次被触发（从内向外）</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693839226-78512325-a02f-427c-a05c-68a1e2697e76.png)

### 2> 代码演示
**<font style="color:#FF0000;">js代码中只能执行捕获或者冒泡其中的一个阶段</font>**，其中onclick和attachEvent只能得到冒泡阶段，我们可以通过addEventListener(type,listener[,useCapture])中的第三个参数来分别演示冒泡和捕获

**<font style="color:#FF0000;">useCapture</font>**<font style="color:#FF0001;">：</font>可选，是否在捕获阶段触发事件，需要一个布尔值，默认是false，在冒泡阶段处理程序，如果是true，就是在捕获阶段处理程序

```javascript
<body>
    <!-- 给box、box1绑定点击事件，弹出对应的信息
        需求1：弹出box、box1信息
        需求2：弹出box1、box信息 -->
    
    <div class="box">
      <div class="box1"></div>
    </div>
    <script>
      var boxs = document.querySelectorAll("div");
      //   需求1
      //   boxs[0].addEventListener(
      //     "click",
      //     function () {
      //       alert("我是box");
      //     },
      //     true
      //   );
      //   boxs[1].addEventListener(
      //     "click",
      //     function () {
      //       alert("我是box1");
      //     },
      //     true
      //   );
      //需求2
      boxs[0].addEventListener(
        "click",
        function () {
          alert("我是box");
        },
        false
      );
      boxs[1].addEventListener(
        "click",
        function () {
          alert("我是box1");
        },
        false
      );
    </script>
  </body>
```

<font style="color:#FF0001;">注意：</font>

<font style="color:#000000;">实际开发中我们很少使用事件捕获，我们更关注事件冒泡</font>

<font style="color:#000000;">有些事件是没有冒泡的，比如onblur、onfoucs、onmuseenter、onmouseleave</font>

<font style="color:#000000;">事件冒泡有时我们需要，有时需要避免</font>

## 4、事件对象
### 1）、概念
简单理解：事件发生后，跟事件相关的一系列信息数据的集合都放到这个对象里面，这个对象就是事件对象，它有很多的属性和方法

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      box1.onmousemove = function (event) {};</font>

<font style="color:#595959;">   </script></font>

### 2）、注意：
**<font style="color:#FF0000;">event </font>**就是一个**<font style="color:#FF0000;">事件对象</font>**，写在我们侦听函数的小括号里面，当形参来看，这个形参，我们可以自己命名，例如event、evt、e等

事件对象是当事件**<font style="color:#FF0000;">触发</font>**了，**<font style="color:#FF0000;">系统自动</font>**给我们**<font style="color:#FF0000;">创建</font>**的，不需要我们去传入实参

事件对象在ie低版本中有兼容性问题，其**<font style="color:#FF0000;">兼容性</font>**的写法：**<font style="color:#FF0000;">event = event || window.event;</font>**，一般不用考虑

### 3）、事件对象常用的几组属性
**<font style="color:#FF0000;">e.target</font>**：**<font style="color:#FF0000;">返回触发事件的对象</font>**

**<font style="color:#FF0000;">e.type：返回事件的类型</font>**，比如：click、mouseover，**<font style="color:#FF0000;">不带on</font>**

e.cancelBubble：阻止冒泡 ie6-8使用（了解）

e.returnValue：阻止默认行为， ie6-8使用（了解）

**<font style="color:#FF0000;">e.preventDefault</font>**<font style="color:#FF0001;">()：</font>**<font style="color:#FF0000;">阻止默认行为 非 ie6-8使用</font>**

**<font style="color:#FF0000;">e.stopPropagation()：阻止冒泡 非 ie6-8使用</font>**

**<font style="color:#FF0000;">e.offsetX、e.offsetY：获取鼠标相对于当前元素的位置</font>**

e.<font style="color:#000000;">clientX、</font>e.<font style="color:#000000;">clientY：获取鼠标相对于浏览器可见窗口的坐标</font>

e.<font style="color:#000000;">pageX、</font>e.<font style="color:#000000;">pageY：获取鼠标相对于文档页面的坐标</font>

e.<font style="color:#000000;">screenX,</font>e.<font style="color:#000000;">screenY：返回鼠标相对于电脑屏幕的x坐标</font>

```javascript
<body>
    <div class="box">
      <div class="box1"></div>
      <a href="https://www.baidu.com/">百度</a>
    </div>
    <script>
      var boxs = document.querySelectorAll("div");
      var a = document.querySelector("a");
      boxs[0].addEventListener("click", function (e) {
        //e.target
        console.log(e.target, "e");
        console.log(this, "this");
        //e.type
        console.log(e.type, "e.type");
      });
      a.onclick = function (e) {
        // 阻止默认行为
        e.preventDefault();
        // 阻止默认行为
        //  return false;
        // 阻止冒泡
        e.stopPropagation();
      };
    </script>
  </body>
```

#### （1）、偏移量offset系列
```javascript
<body>
    <div id="box1"></div>
    <div id="box2"></div>
    <script type="text/javascript">
      /* 需求：当鼠标在box1中移动时，在box2中来显示鼠标的坐标 */
      //获取两个div
      var box1 = document.getElementById("box1");
      var box2 = document.getElementById("box2")；
      box1.onmousemove = function (event) {
        // event = event || window.event;
        var x = event.clientX;
        var y = event.clientY;
        //在box2中显示鼠标的坐标
        box2.innerHTML = "x=" + x + "," + "y=" + y;
      };
    </script>
  </body>
```

## 5、事件委托（代理、委派）
不给每个子节点单独设置事件监听，而是**<font style="color:#FF0000;">将事件统一绑定给元素的共同的祖先元素，然后利用冒泡原理影响设置每个子节点</font>**

通过事件委派可以减少事件绑定的次数，提高程序的性能

```javascript
<body>
      <!-- 需求：为每个超链接都绑定单击响应函数 -->
      <button id="btn01">增加链接</button>
      <ul id="u1">
        <li><a href="#" class="link">链接一</a></li>
        <li><a href="#" class="link">链接二</a></li>
        <li><a href="#" class="link">链接三</a></li>
      </ul>
      <script>
        //点击按钮，新建超链接
        var btn01 = document.getElementById("btn01");
        var u1 = document.querySelector("#u1");
        btn01.onclick = function () {
          //新建一个li
          var li = document.createElement("li");
          li.innerHTML = '<a href="#" class="link">新建超链接</a>';
          u1.appendChild(li);
        };
        //为ul绑定单击响应函数
        u1.onclick = function (event) {
          console.log(event.target);
          if (event.target.className == "link") {
            alert("hi");
          }
        };
      </script>
    </body>
```

## 6、常用的键盘事件
| 键盘事件 | 触发条件 |
| --- | --- |
| **<font style="color:rgb(255, 0, 0);">onkeyup</font>** | 某个键盘按键**<font style="color:rgb(255, 0, 0);">被松开</font>**时触发 |
| **<font style="color:rgb(255, 0, 0);">onkeydown</font>** | 某个键盘按键**<font style="color:rgb(255, 0, 0);">被按下</font>**时触发 |
| **<font style="color:rgb(255, 0, 0);">onkeypress</font>** | 某个键盘按键**<font style="color:rgb(255, 0, 0);">被按下</font>**时触发 |


**<font style="color:#FF0000;">e.keyCode返回该键的ASCII值 键盘上每个字符有对应的数字</font>**

```javascript
<body>
      <input type="text" />
      <script>
        document.onkeydown = function (e) {
          console.log(e.keyCode);
        };
        //需求： 使文本框不能输入数字
        var int = document.querySelector("input");
        int.onkeydown = function (e) {
          if (e.keyCode >= 48 && e.keyCode <= 57) {
            /* 在文本框输入内容，属于keyCode的默认行为
          return false则会取消默认行为 */
            return false;
          }
        };
      </script>
    </body>
```

## 5.1、元素的三大系列
### 5.1.1offset系列
#### 5.1.1.1、offset初相识
使用offset系列相关属性可以动态的得到该元素的位置（偏移）、大小等

+ <font style="color:#F33232;">获得元素距离带有定位祖先元素的位置</font>
+ <font style="color:#000000;">获得元素自身的大小（宽度高度）</font>
+ <font style="color:#F33232;">注意：返回的数值都不带单位</font>

offset系列常用属性

| <font style="color:rgb(0, 0, 0);">offset系列属性</font> | <font style="color:rgb(0, 0, 0);">作用</font> |
| --- | --- |
| <font style="color:rgb(0, 0, 0);">element.offsetParent</font> | <font style="color:rgb(0, 0, 0);">返回作为该元素带有定位的父级元素，如果父级没有定位，则返回body</font> |
| <font style="color:rgb(255, 0, 1);">element.offsetTop</font> | <font style="color:rgb(0, 0, 0);">返回元素相对于有定位父元素上方的偏移量</font> |
| <font style="color:rgb(255, 0, 1);">element.offsetLeft</font> | <font style="color:rgb(0, 0, 0);">返回元素相对于有定位父元素左方的偏移量</font> |
| <font style="color:rgb(0, 0, 0);">element.offsetWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding、边框、内容区的宽度、返回数值不带单位</font> |
| <font style="color:rgb(0, 0, 0);">element.offsetHeight</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding、边框、内容区的高度、返回数值不带单位</font> |


#### 5.1.1.2、offset与style区别
| <font style="color:rgb(0, 0, 0);">offset</font> | <font style="color:rgb(0, 0, 0);">style</font> |
| --- | --- |
| <font style="color:rgb(223, 42, 63);">offset可以得到任意样式表中的样式值(行内，内部)</font> | <font style="color:rgb(0, 0, 0);">style只能得到行内样式表中的样式值</font> |
| <font style="color:rgb(0, 0, 0);">offset系列获得的数值时没有单位的</font> | <font style="color:rgb(0, 0, 0);">style.width获得的是带有单位的字符串</font> |
| <font style="color:rgb(0, 0, 0);">offsetWidth包含padding+border+width</font> | <font style="color:rgb(0, 0, 0);">style.width获得不包含padding和border的值</font> |
| <font style="color:rgb(0, 0, 0);">offsetWidth等属性时只读属性，只能获取不能赋值</font> | <font style="color:rgb(0, 0, 0);">style.width是可读写属性，可以获取也可以赋值</font> |
| <font style="color:rgb(0, 0, 0);">我们想要获取元素大小为止，用offset更合适</font> | <font style="color:rgb(0, 0, 0);">要给元素更改值，则需要用style改变</font> |


```javascript
<style>
      * {
        margin: 0;
        padding: 0;
      }
      .box {
        width: 200px;
        height: 200px;
        border: 1px solid red;
        margin: 50px auto;
        position: relative;
      }
      .box1 {
        width: 100px;
        height: 100px;
        background-color: orange;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="box1"></div>
    </div>
    <div class="box2" style="width: 50px; height: 50px; background-color: red; border: 10px solid green"></div>
    <script>
      var box = document.querySelector(".box");
      var box1 = document.querySelector(".box1");
      var box2 = document.querySelector(".box2");
      // 一、 通过offset获取值
      // 1、获取该元素带有定位的父级元素，如果父级没有定位，则返回body
      // console.log(box1.offsetParent, "offsetParent");
      // 2、返回元素相对于定位父元素上方的偏移量
      // console.log(box1.offsetTop, "offsetTop");
      // 3、返回元素相对于定位父元素左方的偏移量
      // console.log(box1.offsetLeft, "offsetLeft");
      // 4、返回自身的宽度（包括内容区，边框，padding）
      // console.log(box.offsetWidth, "offsetWidth");
      // 5、返回自身的高度（包括内容区，边框，padding）
      // console.log(box.offsetHeight, "offsetHeight");
      // 二、通过style获取值
      // 1、style只能获取行内样式表中的样式值
      // 不包括padding和border
      // console.log(box2.style.width); //50px
      //2、 可读可写
      // box2.style.width = "200px";
    </script>
```

作业：

1、模态框拖拽

2、放大镜效果

### 5.1.2、client系列
#### 5.1.2.1、client初相识
使用client系列的相关属性来获取元素可视区的相关信息，可以动态的得到该元素的边框大小，元素大小等

| <font style="color:rgb(0, 0, 0);">client系列属性</font> | <font style="color:rgb(0, 0, 0);">作用</font> |
| --- | --- |
| <font style="color:rgb(0, 0, 0);">element.clientTop</font> | <font style="color:rgb(0, 0, 0);">返回元素上边框的大小</font> |
| <font style="color:rgb(0, 0, 0);">element.clientLeft</font> | <font style="color:rgb(0, 0, 0);">返回元素左边框的大小</font> |
| <font style="color:rgb(255, 0, 1);">element.clientWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding，内容区宽度，不含边框，返回数值不带单位</font> |
| <font style="color:rgb(255, 0, 1);">element.clientHeight</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding，内容区高度，不含边框，返回数值不带单位</font> |


```javascript
<head>
    <meta charset="UTF-8" />
    <title>client</title>
    <style>
      .box {
        width: 100px;
        height: 100px;
        background-color: red;
        border: 10px solid orange;
        padding: 20px;
        margin: 100px auto;
      }
    </style>
  </head>
  <body>
    <div class="box"></div>
    <script>
      var box = document.querySelector(".box");
      // 1、返回元素上边框大小
      //console.log(box.clientTop); //10
      // 2、返回元素左边框大小
      //console.log(box.clientLeft); //10
      // 3、返回自身的宽度，包括padding，内容区，不含边框
      // console.log(box.clientWidth); //140
      // 3、返回自身的高度，包括padding，内容区，不含边框
      // console.log(box.clientHeight); //140
    </script>
  </body>
```

#### 5.1.2.2、client的应用-flexible.js解析
```javascript
<script>
     // 立即执行函数   传入window，document参数
(function flexible(window, document) {
  // 获取html根标签  我们是通过更改html根标签的大小来改变页面大小的
  var docEl = document.documentElement;
  // 获取物理像素比，window.devicePixelRatio获取当前的dpr值，如果没有就是1

  var dpr = window.devicePixelRatio || 1;

  // adjust body font size
  //设置body字体大小
  function setBodyFontSize() {
    // 如果页面中有body这个元素，就设置body的字体大小
    if (document.body) {
      document.body.style.fontSize = 12 * dpr + "px";
    } else {
      // 如果页面中没有body这个元素，则等着我们页面主要dom元素加载完后，设置页面字体大小
      document.addEventListener("DOMContentLoaded", setBodyFontSize);
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  // 设置html元素的文字大小
  function setRemUnit() {
    // 将页面的大小平均划分为10等份，为整个页面的大小
    // 设置html根字体大小的变化
    var rem = docEl.clientWidth / 10;
    docEl.style.fontSize = rem + "px";
  }

  setRemUnit();

  // reset rem unit on page resize
  // 如果页面尺寸大小发生了变化，要重新设置rem大小
  window.addEventListener("resize", setRemUnit);
  // pageshow  是我们重新加载页面触发的事件
  window.addEventListener("pageshow", function (e) {
    //  如果是从缓存取过来的页面，也需要重新计算rem大小，为了兼容浏览器的
    if (e.persisted) {
      setRemUnit();
    }
  });

  // detect 0.5px supports
  // 有些移动端浏览器不支持0.5像素的写法， 通过一下代码，进行兼容
  if (dpr >= 2) {
    // 创建一个假的body元素，用于临时添加测试元素以检测某些样式效果
    var fakeBody = document.createElement("body");
    // 创建一个测试用的div元素
    var testElement = document.createElement("div");
    // 设置测试元素的边框样式，目的是检测在当前环境下边框的实际渲染高度
    testElement.style.border = ".5px solid transparent";
    // 将测试元素添加到假body中
    fakeBody.appendChild(testElement);
    // 将假body添加到文档的body元素中，以便在当前页面环境中渲染测试元素
    docEl.appendChild(fakeBody);

    // 检测测试元素的渲染高度是否为1，这可以用来判断设备的像素比或浏览器的渲染特性
    if (testElement.offsetHeight === 1) {
      // 如果测试元素的高度为1，表明可能存在高像素比屏幕或其他渲染特性
      // 在这种情况下，为docEl添加类名"hairlines"，以便通过CSS提供更合适的样式
      docEl.classList.add("hairlines");
    }

    // 清理测试元素，移除假body，以避免对页面其他部分造成潜在影响
    docEl.removeChild(fakeBody);
  }
})(window, document);

    </script>
```

### 5.1.3、scroll系列
#### 5.1.3.1、 scroll初相识  
利用scroll系列的相关属性可以动态的得到该元素的大小，滚动距离等
| <font style="color:rgb(0, 0, 0);">scroll系列属性</font> | <font style="color:rgb(0, 0, 0);">作用</font> |
| --- | --- |
| <font style="color:rgb(255, 0, 1);">element.scrollTop</font> | <font style="color:rgb(0, 0, 0);">返回被卷去的上侧距离，返回数值不带单位</font> |
| <font style="color:rgb(255, 0, 1);">element.scrollLeft</font> | <font style="color:rgb(0, 0, 0);">返回被卷去的左侧距离，返回数值不带单位</font> |
| <font style="color:rgb(0, 0, 0);">element.scrollWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身实际的宽度（</font><font style="color:rgb(243, 50, 50);">实际内容的宽度</font><font style="color:rgb(0, 0, 0);">），不含边框，返回数值不带单位</font> |
| <font style="color:rgb(0, 0, 0);">element.scrollHeight</font> | <font style="color:rgb(0, 0, 0);">返回自身实际的高度（</font><font style="color:rgb(243, 50, 50);">实际内容的宽度</font><font style="color:rgb(0, 0, 0);">），不含边框，返回数值不带单位</font> |


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741693839433-245657b6-6dfc-4b16-b14f-11cfe637d447.webp)



```javascript
<head>
    <meta charset="UTF-8" />
    <title>scroll</title>
    <style>
      .box1 {
        width: 200px;
        height: 200px;
        background-color: #bfa;
        border: 10px solid red;
        padding: 20px;
        overflow: auto;
      }
      p {
        width: 400px;
        height: 400px;
        background-color: orange;
      }
    </style>
  </head>
  <body>
    <div class="box1">
      <p>其那了，种法苟反作。</p>
    </div>
    <script>
      var box = document.querySelector(".box1");
      // 1、返回自身实际的宽度（实际内容的宽度），不含边框，返回数值不带单位
      // console.log("scrollWidth", box.scrollWidth);
      // console.log("clientWidth", box.clientWidth);
      // 2、返回自身实际的高度（实际内容的宽度），不含边框，返回数值不带单位
      // console.log("scrollHeight", box.scrollHeight);
      // console.log("clientHeight", box.clientHeight);
      // 3、返回被卷去的上侧距离，返回数值不带单位
      // console.log("scrollTop", box.scrollTop);
      // 4、返回被卷去的左侧距离，返回数值不带单位
      // console.log("scrollLeft", box.scrollLeft);
      
      // 滚动事件触发时，打印被卷去的距离
      // box.addEventListener("scroll", function () {
      //   console.log("scrollTop", box.scrollTop);
      //   console.log("scrollLeft", box.scrollLeft);
      // });
    </script>
  </body>
```

作业：

1、京东侧边导航条

#### 5.1.4、小结
| <font style="color:rgb(0, 0, 0);">三大系列大小对比</font> | <font style="color:rgb(0, 0, 0);">作用</font> |
| --- | --- |
| <font style="color:rgb(0, 0, 0);">element.offsetWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding，边框，内容区的宽度，返回数值不带单位</font> |
| <font style="color:rgb(0, 0, 0);">element.clientWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身包括padding，内容区宽度，不含边框，返回数值不带单位</font> |
| <font style="color:rgb(0, 0, 0);">element.scrollWidth</font> | <font style="color:rgb(0, 0, 0);">返回自身实际宽度，不含边框，返回数值不带单位</font> |


<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741693839581-f55a1c30-726f-4d0c-b71d-06f8c0cb6b25.webp)

offset系列进行用于获得元素位置 offsetLeft offsetTop  
client经常用于获取元素大小 clientWidth clientHeight  
sroll经常用于获取滚动距离 scrollTop   
  
事件对象的相关大小：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741693839774-307bd89e-59f6-4445-8a27-a06f0693770d.webp)









## 5.2、动画函数封装
### 5.2.1、简单动画实现
核心原理：通过定时器**<font style="color:#FF0000;">setInterval()</font>**不断移动盒子位置

实现步骤：

    - <font style="color:#000000;">获得盒子当前位置、</font>
    - <font style="color:#000000;">让盒子在当前位置上加上1个移动距离、</font>
    - <font style="color:#000000;">利用定时器不断重复这个操作、</font>
    - <font style="color:#000000;">加一个结束定时器的条件</font>
    - <font style="color:#000000;">需要给元素加定位，利用left值变化改变元素的位置</font>

<font style="color:#595959;"><!-- 需求：小盒子从左向右移动，移动到500px的地方，停下 --></font>

```javascript
        <script>
          var box = document.querySelector("div");
          var timer = setInterval(function () {
            if (box.offsetLeft === 500) {
              clearInterval(timer);
              return;
            }
            box.style.left = box.offsetLeft + 10 + "px";
          }, 30);
        </script>
```

### 5.2.2、简单动画函数封装
```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>02.封装简单动画函数</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      div {
        width: 100px;
        height: 100px;
        background-color: #bfa;
        position: relative;
        left: 0;
      }
      span {
        background-color: pink;
        position: relative;
        left: 0;
      }
    </style>
  </head>
  <body>
    <div>动画1</div>
    <span>动画2</span>
    <!-- 封装函数，传入不同的对象，目标停止值，都可以调用动画 -->
    <script>
      function animation(obj, target) {
        var timer = setInterval(function () {
          if (obj.offsetLeft === target) {
            clearInterval(timer);
            return;
          }
          obj.style.left = obj.offsetLeft + 10 + "px";
        }, 30);
      }
      var box = document.querySelector("div");
      var s1 = document.querySelector("span");

      animation(box, 500);
      animation(s1, 300);
    </script>
  </body>
</html>
```

### 5.2.3、优化动画函数
动画函数给不同的元素记录不同定时器

如果多个元素都使用这个动画函数，每次都要var 声明定时器，我们可以给不同元素使用不同的定时器（自己用自己的定时器）

核心原理：利用js是一门动态语言，可以很方便的给当前对象添加属性

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>03.优化动画函数</title>
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      div {
        width: 100px;
        height: 100px;
        background-color: #bfa;
        position: relative;
        left: 0;
      }
      span {
        background-color: pink;
        position: relative;
        left: 0;
      }
    </style>
  </head>
  <body>
    <div>动画1</div>
    <br />
    <button>点击按钮，执行动画函数</button><br />
    <span>动画2</span>
    <!-- 优化1:根据传入的不同对象，将timer作为属性添加给不同的对象，减少开辟的空间 -->
    <!-- 优化2:保证只有一个定时器在执行 -->
    <script>
      function animation(obj, target) {
        //在开启动画前，先关闭前一个定时器，保证只有一个定时器在执行
        clearInterval(obj.timer);
        obj.timer = setInterval(function () {
          if (obj.offsetLeft >= target) {
            clearInterval(obj.timer);
            //优化3:当达到目标值后，再点击也不会执行了
            return;
          }
          obj.style.left = obj.offsetLeft + 10 + "px";
        }, 30);
      }
      var box = document.querySelector("div");
      var s1 = document.querySelector("span");
      var btn = document.querySelector("button");

      btn.addEventListener("click", function () {
        animation(s1, 300);
      });
      animation(box, 500);
    </script>
  </body>
</html>
```

### 5.2.4、缓动效果原理
缓动动画就是让元素**<font style="color:#FF0000;">运动速度有所变化</font>**，最常见的是让速度慢慢停下来

思路：

让盒子每次移动的距离慢慢变小，速度就会慢慢落下来

**<font style="color:#FF0000;">核心算法：（目标值-现在的位置）/10 作为每次移动的距离步长</font>**

停止的条件是：让当前盒子位置等于目标位置就停止定时器

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>04.缓动画实现</title>
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      div {
        width: 100px;
        height: 100px;
        background-color: pink;
        position: relative;
        left: 0;
      }
    </style>
  </head>
  <body>
    <button>点击按钮，执行动画函数</button><br />
    <div>动画2</div>
    <script>
      function animation(obj, target) {
        clearInterval(obj.timer);
        obj.timer = setInterval(function () {
          // 定义step，来代表每次移动的距离值，（目标值-现在的位置）/10
          var step = (target - obj.offsetLeft) / 10;
          if (obj.offsetLeft == target) {
            clearInterval(obj.timer);
            return;
          }
          obj.style.left = obj.offsetLeft + step + "px";
        }, 30);
      }

      var s1 = document.querySelector("div");
      var btn = document.querySelector("button");
      btn.addEventListener("click", function () {
        animation(s1, 500);
      });
    </script>
  </body>
</html>
```

### 5.2.5、动画函数优化
```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>05.优化缓动动画动画函数</title>
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      div {
        width: 100px;
        height: 100px;
        background-color: pink;
        position: absolute;
        left: 0;
      }
    </style>
  </head>
  <body>
    <button id="btn01">点击按钮，执行动画函数 500</button><br />
    <button id="btn02">点击按钮，执行动画函数 800</button><br />

    <div>丹洋其</div>
    <script>
      //优化三  加回调函数，可以在执行动画后，再执行其他内容
      function animation(obj, target, callback) {
        clearInterval(obj.timer);
        obj.timer = setInterval(function () {
          // 定义step，来代表每次移动的距离值
          // 优化一：对于step会涉及到小数，将小数向上取整
          // var step = Math.ceil((target - obj.offsetLeft) / 10);
          // 优化二：动画还是会涉及到往回走，如果往回走，则step会是负值，要向小取整
          var step = (target - obj.offsetLeft) / 10;
          step = step > 0 ? Math.ceil(step) : Math.floor(step);
          if (obj.offsetLeft == target) {
            clearInterval(obj.timer);
            // 如果传入了回调，则执行回调，否则，就不执行
            if (callback) {
              callback();
            }
          } else {
            // console.log(222);
            obj.style.left = obj.offsetLeft + step + "px";
          }
        }, 15);
      }

      var s1 = document.querySelector("div");
      var btn01 = document.querySelector("#btn01");
      var btn02 = document.querySelector("#btn02");

      btn01.addEventListener("click", function () {
        animation(s1, 500);
      });
      btn02.addEventListener("click", function () {
        animation(s1, 800, function () {
          alert("111");
        });
      });
    </script>
  </body>
</html>
```

### 5.2.6、animation.js文件并使用
animation.js

```javascript
<script>
         function animation(obj, target, callback) {
          clearInterval(obj.timer);
          obj.timer = setInterval(function () {
            var step = (target - obj.offsetLeft) / 10;
            step = step > 0 ? Math.ceil(step) : Math.floor(step);
            if (obj.offsetLeft == target) {
              clearInterval(obj.timer);
              if (callback) {
                callback();
              }
            } else {
              console.log(222);
              obj.style.left = obj.offsetLeft + step + "px";
            }
          }, 15);
}
        </script>
```

简单使用

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693840038-4efca95c-3f6d-4b62-8c48-41826f7fd75b.png)

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <style>
      .nav {
        width: 30px;
        height: 30px;
        background-color: blueviolet;
        position: fixed;
        text-align: center;
        line-height: 30px;
        right: 0px;
        top: 40%;
      }
      .con {
        position: absolute;
        left: 0px;
        top: 0;
        width: 200px;
        height: 30px;
        background-color: blueviolet;
        z-index: -1;
      }
    </style>
    <script src="./animation.js"></script>
  </head>
  <body>
    <div class="nav">
      <span>⬅️</span>
      <div class="con">移入弹出</div>
    </div>
    <script>
      var s1 = document.querySelector("span");
      var nav = document.querySelector(".nav");
      var con = document.querySelector(".con");
      nav.addEventListener("mouseenter", function () {
        animation(con, -170, function () {
          s1.innerHTML = "➡️";
        });
      });
      nav.addEventListener("mouseleave", function () {
        animation(con, 0, function () {
          s1.innerHTML = "⬅️";
        });
      });
    </script>
  </body>
</html>
```

## 5.3、JSON数据
### 5.3.1、JSON
#### （1）、定义：
JSON数据格式 JavaScript Object Notation缩写 即**<font style="color:#FF0000;"> js对象表示法</font>**

由于JS中的对象只有JS自己认识，其他的语言都不认识，所以引入了JSON，**<font style="color:#FF0000;">JSON</font>**就是一个**<font style="color:#FF0000;">特殊格式</font>**的**<font style="color:#FF0000;">字符串</font>**，这个字符串可以**<font style="color:#FF0000;">被任意的语言所识别</font>**， 

并且**<font style="color:#FF0000;">可以转换为任意语言中的对象</font>**，JSON在开发中**<font style="color:#FF0000;">主要用来数据的交互</font>**，是一种轻量级的数据交换格式

#### （2）、特点：
1、易于程序员阅读和编写。

2、易于计算机解析和生成。

3、其实是javascript的子集：原生javascript支持JSON

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693840329-93b86567-637e-4b5c-aa1f-b3f046bc7001.png)

#### （3）、作用：
json是一种与语言无关的数据交换的格式，

1、使用ajax进行前后台数据交换

2、移动端与服务端的数据交换

#### （4）、JSON的语法规则：
JSON的语法规则十分简单，可称得上“优雅完美”，总结起来有：

JSON有两种结构：

1、**<font style="color:#FF0000;">对象格式：{“key1”：obj1, “key2”:obj2, “key3”:obj3…}</font>**

2、**<font style="color:#FF0000;">数组/集合格式: [obj1,obj2,obj3…]</font>**

JSON中允许的值：**<font style="color:#FF0000;">字符串，数值，布尔值，null，对象，数组</font>**，

JSON和JS对象的格式一样，只不过JSON字符串中的**<font style="color:#FF0000;">属性名必须加双引号</font>**，其他的和JS语法一致

规则如下:

1）映射用冒号（“：”）表示。名称:值

2）并列的数据之间用逗号（“，”）分隔。名称1:值1,名称2:值2

3） 映射的集合（对象）用大括号（“{}”）表示。{名称1:值1,名称2:值2}

4） 并列数据的集合（数组）用方括号(“[]”)表示。

#### （5）、JSON的方法
将JSON字符串转换为JS中的对象，在JS中，为我们提供了一个工具类，就叫JSON ，这个对象可以帮助我们将一个JSON转换为JS对象，也可以将一个JS对象转换为JSON

**<font style="color:#FF0000;">JSON.parse()</font>**

可以将以**<font style="color:#FF0000;">JSON字符串===》js对象</font>**

它需要一个**<font style="color:#FF0000;">JSON字符串作为参数，会将该字符串转换为JS对象并返回</font>**

```javascript
<script>
      var json = '{"name":"孙悟空","age":18,"gender":"男"}';
      var o = JSON.parse(json);
      console.log(o); //{name: '孙悟空', age: 18, gender: '男'}
      console.log(o.gender); //男
    </script>
```

**<font style="color:#FF0000;">JSON.stringify() </font>**

**<font style="color:#FF0000;">可以将一个JS对象===》JSON字符串</font>**

**<font style="color:#FF0000;">需要一个js对象作为参数，会返回一个JSON字符串</font>**

```javascript
<script>
      var obj3 = { name: "猪八戒", age: 28, gender: "男" };
      obj3 = JSON.stringify(obj3);
      console.log(obj3); //{"name":"猪八戒","age":28,"gender":"男"}
    </script>
```

### 5.3.2、XML
#### 5.3.2.1 什么是xml
eXtensible Markup Language，可扩展标记型语言

（1）标记型语言：html是标记型语言，都是使用标签进行操作。

xml里面的操作也是使用标签进行操作。

（2）可扩展：html里面的标签，每个标签有自己特定的含义，

比如<br/> <hr/>

在xml中标签自己定义的，比如 <aa> <猫>

（3）xml的主要的功能是存储数据（不是显示数据）

#### 5.3.2.2 xml的应用在三个地方
第一，xml用于作为系统之间传输数据的格式

第二，xml用于表示生活中有关系的数据，数据的存储。

第三，xml经常使用在系统的配置文件 

第四，android 手机应用程序开发，页面的内容展示，都是xml

### 5.3.3、JSON与XML比较
JSON常备拿来与XML做比较，因为JSON的诞生本来就或多或少要有取代XML的意思。

相比XML，JSON的优势如下：

1、没有结束标签，长度更短，读写更快。

2、能够直接被JavaScript解析器解析。

3、可以使用数组。

JSON:

{

“id” : 12,

“name” : “gao”,

“age” : 30,

“gender” : “男”,

“interests” : [“篮球”, “爬山”, “旅游”]

}

XML：

<font style="color:#595959;"><root></font>

<font style="color:#595959;">      <id>12</id></font>

<font style="color:#595959;">      <name>gao</name></font>

<font style="color:#595959;">      <age>30</age></font>

<font style="color:#595959;">      <gender>男</gender></font>

<font style="color:#595959;">      <interest>篮球</interest></font>

<font style="color:#595959;">      <interest>爬山</interest></font>

<font style="color:#595959;">      <interest>旅游</interest></font>

<font style="color:#595959;">  </root></font>

JSON可以直接使用数组，但是XML没有直接定义数组，

如果数组很长，我们的代码中就要添加大量的没有实际意义的开始和结束标签，这对于网络传输是不利的。

XML主要是用在配置文件。

## 5.4、本地存储
localstorage、Sessionstorage是Web Storage，H5的本地存储机制。是本地存储，存储在客户端，以键/值对的形式存储的，通常以字符串存储。  
是针对HTML4中 Cookie 存储机制的一个改善，由于Cookie存储机制有很多缺点，HTML5不再使用它，转而使用改良后的 Web Storage 存储机制。

### 5.4.1、Cookie
#### （1）、定义
Cookie实际上是一小段的文本信息，是服务器发送到用户浏览器并保存在本地的一小块数据。  
客户端请求服务器，如果服务器需要记录该用户状态，就使用response向客户端浏览器颁发一个Cookie。客户端会把Cookie保存起来。当浏览器下次向同一服务器再发起请求时，浏览器把请求的网址连同该Cookie一同提交给服务器。服务器检查该Cookie，以此来辨认用户状态。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741693840485-0a9b85c5-36d2-4008-8423-742fdbd5962f.webp)

#### （2）、作用
保存用户登录状态  
跟踪用户行为  
定制页面  
创建购物车：使用cookie来记录用户需要购买的商品，再结帐的时候可以统一提交。(淘宝网就是使用cookie记录了用户曾经浏览过的商品，方便随时进行比较)

### 5.4.2、window.sessionStorage
●<font style="color:#000000;">生命周期为</font><font style="color:#F33232;">关闭浏览器窗口</font>  
<font style="color:#000000;">●在同一个窗口（页面）下数据可以共享</font>  
<font style="color:#000000;">●存储空间相对较小</font>  
<font style="color:#000000;">●以键值对的形式存储使用</font>  
sessionStorage.setItem(key,value); //存储数据

sessionStorage.getItem(key);//获取数据

sessionStorage.removeItem(key);//删除数据

sessionStorage.clear();//清除数据

### 5.4.3、window.localStorage
●<font style="color:#000000;">生命周期</font><font style="color:#F33232;">永久生效</font><font style="color:#000000;">，除非手动删除，否则关闭页面也会存在</font>  
<font style="color:#000000;">●可以多窗口（页面）共享（同一个浏览器可以共享）</font>  
<font style="color:#000000;">●存储空间较大</font>  
<font style="color:#000000;">●以健值对的形式存储使用</font>  
localStorage.setItem(key,value); //存储数据

localStorage.getItem(key);//获取数据

localStorage.removeItem(key);//删除数据

localStorage.clear();//清除数据

###   
5.4.4、记住用户名案例
如果勾选记住用户名，下次用户打开浏览器，就在文本框里自动显示上次登录的用户名

```javascript
<body>
      <input type="text" id="username" />
      <input type="checkbox" id="checkbox" />记住用户名
      <script>
        var userInt = document.getElementById("username");
        var checkbox = document.getElementById("checkbox");
        // 判断本地是否存储了username，存了就取出来赋值给input，并勾选复选框
        if (localStorage.getItem("username")) {
          userInt.value = localStorage.getItem("username");
          checkbox.checked = true;
        }
  
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            localStorage.setItem("username", userInt.value);
          } else {
            localStorage.removeItem("username");
          }
        });
      </script>
    </body>
```



## 1、模态框(弹出框)
### （1）、需求：
1. <font style="color:#000000;">点击弹出层，会弹出模态框，并且显示灰色半透明的遮挡层</font>
2. <font style="color:#000000;">点击关闭按钮，可以关闭模态框，并且同时关闭半透明遮挡层</font>
3. <font style="color:#000000;">鼠标放在模态框最上面一行，可以按住鼠标拖拽模态框在页面中移动</font>
4. <font style="color:#000000;">鼠标松开，可以停止拖动模态框移动</font>

思路：

1. <font style="color:#000000;">点击弹出层，模态框和遮挡层就会显示出来 display:block</font>
2. <font style="color:#000000;">点击关闭按钮，模态框和遮罩层会隐藏起来 display:none</font>
3. <font style="color:#000000;">在页面中拖拽的原理：鼠标按下并且移动，之后松开鼠标</font>
4. <font style="color:#000000;">触发事件是鼠标按下mousedown，鼠标移动mousemove 鼠标松开 mouseup</font>
5. <font style="color:#000000;">拖拽过程，鼠标移动过程中，获得最新的值赋值给模态框的left和top值，这样模态框就可以跟着鼠标走了</font>
6. <font style="color:#000000;">鼠标按下触发的事件源是h2</font>
7. <font style="color:#000000;">鼠标的坐标减去鼠标内的坐标，才是模态框真正的位置</font>
8. <font style="color:#000000;">鼠标按下，我们要得到鼠标在盒子的坐标</font>
9. <font style="color:#000000;">鼠标移动，就让模态框的坐标设置为：鼠标坐标减去盒子坐标即可，注意移动时间写到按下</font>
10. <font style="color:#000000;">鼠标松开，就停止拖拽，可以让鼠标移动事件解除</font>

### （2）、es5
```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      h1 {
        cursor: pointer;
        margin: 50px auto;
      }
      /* 模态框 */
      .modal-box {
        display: none;
        width: 400px;
        height: 300px;
        background-color: #bfa;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 99;
      }
      button {
        position: absolute;
        right: 50px;
        top: 30px;
        width: 80px;
        line-height: 40px;
      }
      /* 遮罩层 */
      .bg {
        display: none;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: #000;
        opacity: 0.3;
      }
      .title {
        background-color: aqua;
        line-height: 60px;
      }
    </style>
  </head>
  <body>
    <h1>点击，弹出模态框</h1>
    <!-- 弹出框 -->
    <div class="modal-box">
      <button>关闭</button>
      <h2 class="title">我是一个可爱的模态框·····</h2>
    </div>
    <!-- 遮罩层 -->
    <div class="bg"></div>
    <!-- js -->
    <script>
      // 1、获取元素
      var h1 = document.querySelector("h1");
      var modalBox = document.querySelector(".modal-box");
      var btn = document.querySelector("button");
      var bg = document.querySelector(".bg");
      var title = document.querySelector(".title");
      // 2、点击显示，隐藏模态框
      h1.onclick = function () {
        modalBox.style.display = "block";
        bg.style.display = "block";
      };
      btn.onclick = function () {
        modalBox.style.display = "none";
        bg.style.display = "none";
      };
      // 3、开始拖拽模态框
      //（1）、当我们鼠标按下，就获得鼠标在盒子内的坐标
      title.addEventListener("mousedown", function (e) {
        var x = e.pageX - modalBox.offsetLeft;
        var y = e.pageY - modalBox.offsetTop;
        //  (2)、鼠标移动的时候，把鼠标在页面中的坐标，减去鼠标在盒子内的坐标
         // 就是不断的求modalBox.offsetLeft ，modalBox.offsetTop
        // 不能直接用offset
        // 直接用offset得到的是盒子本来的坐标，盒子要动起来，才能改变offset的值，
        // 当我们是想要先改变offset然后用他来改变盒子的位置，所以不能直接用offset
        // 而是用鼠标的位置来动态的输入offset
        function move(e) {
          modalBox.style.left = e.pageX - x + "px";
          modalBox.style.top = e.pageY - y + "px";
           // 这样设置，会导致，初始化移动时，就把鼠标的位置，赋值给盒子的中心，有个跳跃的过程
          // modalBox.style.left = e.pageX  + "px";
          // modalBox.style.top = e.pageY  + "px";
          // modalBox.offsetLeft 是固定的值，不会变化的，需要先动盒子才能得到新的modalBox.offsetLeft
          // modalBox.style.left = modalBox.offsetLeft + "px";
          // modalBox.style.top = modalBox.offsetTop + "px";
        }
        document.addEventListener("mousemove", move);
        // （3）、鼠标弹起，就让鼠标移动事件移除
        document.addEventListener("mouseup", function () {
          document.removeEventListener("mousemove", move);
        });
      });
    </script>
  </body>
</html>
```

### （3）、es6
```javascript
<script>
  let that;
  class Modal {
    constructor() {
      that = this;
      // 获取元素
      this.clickH1 = document.getElementById("clickH1");
      this.btn = document.getElementById("btn");
      this.modalBox = document.querySelector(".modal-box");
      this.bg = document.querySelector(".bg");
      this.title = document.querySelector(".title");
      // 调用监听函数
      this.event();
    }
    // 监听函数
    event() {
      this.clickH1.addEventListener("click", this.clickH1Fun);
      this.btn.addEventListener("click", this.btnFun);
      this.title.addEventListener("mousedown", this.titleFun);
    }
    // 点击出现遮罩层
    clickH1Fun() {
      that.bg.style.display = "block";
      that.modalBox.style.display = "block";
    }
    // 点击关闭按钮
    btnFun() {
      that.bg.style.display = "none";
      that.modalBox.style.display = "none";
    }
    //鼠标按下title
    titleFun(e) {
      // 获取鼠标在模态框中的位置方式一
      let x = e.offsetX;
      let y = e.offsetY;
      // 获取鼠标在模态框中的位置方式二
      // let x = e.pageX - that.modalBox.offsetLeft;
      // let y = e.pageY - that.modalBox.offsetTop;
      console.log(x, y);
      document.addEventListener("mousemove", moveFun);
      function moveFun(e) {
        // console.log(111);
        let left = e.pageX - x;
        let right = e.pageY - y;
        that.modalBox.style.left = left + "px";
        that.modalBox.style.top = right + "px";
        that.modalBox.style.margin = 0; //left 值变化，由于过度约束，需要重新设置margin
        // that.modalBox.style.transform='translate(0%, 0%)'//left 值变化，由于过度约束，需要重新设置偏移量
      }
      document.addEventListener("mouseup", upFun);
      function upFun() {
        document.removeEventListener("mousemove", moveFun);
      }
    }
  }
  new Modal();
</script>
```

## 2、放大镜
### （1）html/css
    1. <font style="color:#000000;">整个案例可以分为三个功能模块</font>
    2. <font style="color:#000000;">鼠标经过小图片盒子，灰色的遮罩层和大图片盒子显示，离开隐藏2个盒子功能</font>
    3. <font style="color:#000000;">灰色的遮挡层跟随鼠标移动功能</font>
    4. <font style="color:#000000;">移动灰色遮挡层，大图片跟随移动功能</font>

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>放大镜案例</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      /* 小图 */
      .camera {
        width: 300px;
        height: 300px;
        position: relative;
        border: 1px solid black;
      }

      .cameraImg img {
        width: 300px;
        height: 300px;
      }
      /* 遮罩层 */
      .zoom {
        width: 100px;
        height: 100px;
        background-color: #ccc;
        opacity: 0.8;
        position: absolute;
        top: 0px;
        left: 0px;
      }
      /* 大图 */

      .bDiv {
        width: 500px;
        height: 500px;
        background-color: bisque;
        position: absolute;
        left: 350px;
        top: 0;
        overflow: hidden;
      }
      .bImg {
        position: absolute;
        top: 0;
        left: 0;
      }
    </style>
  </head>

  <body>
    <div class="camera">
      <!-- 小图 -->
      <div class="cameraImg">
        <img src="./img0.jpg" alt="" />
      </div>
      <!-- 放大镜 -->
      <div class="zoom"></div>
      <!-- 大图 -->
      <div class="bDiv">
        <img src="./img1.jpg" alt="" class="bImg" />
      </div>
    </div>
    <!-- 引入js -->
    <script src="./放大镜.js"></script>
  </body>
</html>
```

### （2）、es5 js
```javascript
window.onload = function () {
  var camera = document.querySelector(".camera");
  var zoom = document.querySelector(".zoom");
  var bDiv = document.querySelector(".bDiv");
  var bImg = document.querySelector(".bImg");
  // 1:给camera绑定鼠标移入移除事件，让鼠标移除时，放大镜跟展示页都消失
  camera.onmouseenter = function () {
    zoom.style.display = "block";
    bDiv.style.display = "block";
  };
  camera.onmouseleave = function () {
    // zoom.style.display = "none";
    // bDiv.style.display = "none";
  };
  // 2:设置放大镜zoom能跟着鼠标移动，并设置范围活动
  camera.onmousemove = function (event) {
    //2.1 获得鼠标的页面坐标x,y
    var x = event.pageX;
    var y = event.pageY;
    // console.log(x, y);
    //2.2 获取图相对于页面的左边，上边相对距离
    var offsetX = camera.offsetLeft;
    var offsetY = camera.offsetTop;
    // console.log(offsetX, offsetY);
    // 2.3 获取遮挡层的宽度跟高度
    var zoomW = zoom.offsetWidth;
    var zoomH = zoom.offsetHeight;
    // console.log(zoomW,zoomH);

    // 2.4 计算遮挡物的xy坐标
    var left = x - offsetX - zoomW / 2;
    var top = y - offsetY - zoomH / 2;

    // 2.5 设置判断left  top的限制值
    /* 遮盖物的最大移动距离，父元素camera的宽度减去遮盖物的宽度(300-100) */
    if (left >= 200) {
      left = 200;
    }
    if (left <= 0) {
      left = 0;
    }
    if (top >= 200) {
      top = 200;
    }
    if (top <= 0) {
      top = 0;
    }
    //2.6 将宽高赋值给放大镜
    zoom.style.left = left + "px";
    zoom.style.top = top + "px";

    /* 3、根据比例移动大图  
    遮罩层的移动距离 /遮罩层最大移动距离 = 大图片移动距离/大图片最大移动距离
    根据上面的等式，可以演算出
    大图片的移动距离=（遮罩层的移动距离 /遮罩层最大移动距离）*大图片最大移动距离 */

    //3.1 计算大图在大盒子里移动的最大距离

    /* 大图的宽度，减去bDiv框子的宽度*/
    var bImgMw = bImg.offsetWidth - bDiv.offsetWidth;
    var bImgMh = bImg.offsetHeight - bDiv.offsetHeight;
    // console.log(bDiv.offsetWidth);

    // 3.2 根据比例移动大图
    var bX = (left / 200) * bImgMw;
    var bY = (top / 200) * bImgMh;

    // 3.3 将bX，bY赋值给大图的宽高
    bImg.style.left = -bX + "px";
    bImg.style.top = -bY + "px";
  };
};
```

### （3）、es6.js
```javascript
window.onload = function () {
  var that;
  class Camera {
    constructor() {
      // 保存this
      that = this;
      // 获取整个盒子
      this.camera = document.querySelector(".camera");
      this.zoom = document.querySelector(".zoom");
      this.bDiv = document.querySelector(".bDiv");
      this.bImg = document.querySelector(".bImg");
      //初始化放大镜的位置left，top
      this.left = 0;
      this.top = 0;
      //初始化监听函数
      this.addevent();
    }
    // 监听事件
    addevent() {
      //1.1、移入显示放大镜，移出隐藏放大镜
      this.camera.addEventListener("mouseenter", that.showZoom);
      this.camera.addEventListener("mouseleave", that.hiddZoom);
      //2、移入，放大镜随着鼠标移动
      this.camera.addEventListener("mousemove", that.zoomMove);
      //2、放大镜移动，大图也随着移动
      this.camera.addEventListener("mousemove", that.bDivMove);
    }
    //1.2 鼠标移入，显示放大镜及大图
    showZoom() {
      that.zoom.style.display = "block";
      that.bDiv.style.display = "block";
    }
    hiddZoom() {
      that.zoom.style.display = "none";
      that.bDiv.style.display = "none";
    }
    // 1.2 放大镜随着鼠标移动
    zoomMove(e) {
      // 如果直接赋值，会出现闪烁，由于只有鼠标动了，才会获取到offseX/Y的值，移动之前为0
      // let left = e.offsetX;
      // let top = e.offsetY;
      // （1）、鼠标在页面中的坐标
      var x = e.pageX;
      var y = e.pageY;
      //(2)、大盒子camera在在页面中的位置
      var offsetLeft = that.camera.offsetLeft;
      var offsetTop = that.camera.offsetTop;
      //（3）、计算zoom的大小
      var zoomWidth = that.zoom.offsetWidth;
      var zoomHeight = that.zoom.offsetHeight;

      //（4）、计算盒子中鼠标的位置
      that.left = x - offsetLeft - zoomWidth / 2;
      that.top = y - offsetTop - zoomHeight / 2;

      //(5)、限制放大镜的移动范围，camera-zoom
      if (that.left <= 0) {
        that.left = 0;
      }
      if (that.left >= 200) {
        that.left = 200;
      }
      if (that.top <= 0) {
        that.top = 0;
      }
      if (that.top >= 200) {
        that.top = 200;
      }

      //(6)、将计算出的鼠标位置赋值给zoom
      that.zoom.style.left = that.left + "px";
      that.zoom.style.top = that.top + "px";
    }
    // 3、放大镜移动，大图也随着移动
    // zoom移动距离/zoom最大移动距离 = 大图移动距离/大图最大移动距离

    bDivMove() {
      // 计算大图的最大移动距离  大图-大图盒子大小
      var bimgMaxWidth = that.bImg.offsetWidth - that.bDiv.offsetWidth;
      var bimgMaxHeight = that.bImg.offsetHeight - that.bDiv.offsetHeight;
      // 计算大图移动距离（zoom移动距离/zoom最大移动距离）*大图最大移动距离
      var bimgLeft = (that.left / 200) * bimgMaxWidth;
      var bimgTop = (that.top / 200) * bimgMaxHeight;

      that.bImg.style.left = -bimgLeft + "px";
      that.bImg.style.top = -bimgTop + "px";
    }
  }
  new Camera();
};
```

## 3、京东侧边导航条
需求：

    1. <font style="color:#000000;">原先侧边栏是绝对定位</font>
    2. <font style="color:#000000;">当页面滚动到一定位置，侧边栏改为固定定位</font>
    3. <font style="color:#000000;">页面继续滚动，会让返回顶部显示出来</font>

思路：

    1. <font style="color:#000000;">需要用到页面滚动事件scroll，因为是页面滚动，所以事件源是document</font>
    2. <font style="color:#000000;">滚动到某个位置，就是判断页面被卷去的上部值</font>
    3. <font style="color:#000000;">页面被卷去的头部：可以通过window.pageYOffset获得，如果是被卷去的左侧window.pageXOffset</font>
    4. <font style="color:#000000;">注意：元素被卷去的头部是element.scrollTop,如果是页面被卷去的头部则是window.pageYOffset</font>

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>侧边栏案例</title>
    <style>
      * {
        padding: 0;
        margin: 0;
      }
      header,
      footer {
        width: 1000px;
        height: 200px;
        background-color: pink;
        margin: 0 auto;
      }
      main {
        width: 1000px;
        height: 800px;
        background-color: #bfa;
        margin: 0 auto;
      }
      nav {
        width: 60px;
        height: 200px;
        background-color: blue;
        position: absolute;
        right: 0;
        top: 250px;
        line-height: 30px;
      }
      span {
        display: block;
        width: 60px;
        height: 60px;
        background-color: red;
        margin-top: 140px;
        text-align: center;
        display: none;
      }
    </style>
  </head>
  <body>
    <header>头部</header>
    <nav>
      <span
        >返回 <br />
        顶部</span
      >
    </nav>
    <main>主体</main>
    <footer>底部</footer>
    <script>
      // 1、获取元素
      var span = document.querySelector("span");
      var nav = document.querySelector("nav");
      var main = document.querySelector("main");
      // 主体以上被卷去的距离
      var mainTop = main.offsetTop;
      // 侧边导航以上被卷去的距离
      var navTop = nav.offsetTop;
      console.log(navTop);
      // 2、页面滚动事件 scroll
      document.addEventListener("scroll", function () {
        // window.pageYOffset 获取页面被滚去的距离
        // 3、判断距离，变化定位
        if (window.pageYOffset >= mainTop) {
          // 3.1将定位改成固定定位
          nav.style.position = "fixed";
          // 3.2 改成固定定位后，会有跳动，需要重新设置定位的top值,否则还是原值
          nav.style.top = navTop - mainTop + "px";
          // 3.3 出现返回顶部字样
          span.style.display = "block";
        } else {
          nav.style.position = "absolute";
          nav.style.top = "300px";
          span.style.display = "none";
        }
      });
    </script>
  </body>
</html>
```

## 4、轮播图
### （1）、搭建轮播图的结构
```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>轮播图结构</title>
    <!-- <script src="../js/tools.js"></script> -->
    <script src="../js/animation.js"></script>
    <script src="./01.轮播图.js"></script>
    <style>
      * {
        padding: 0;
        margin: 0;
        list-style: none;
        text-decoration: none;
      }
      #outer {
        width: 590px;
        height: 470px;
        border: 10px solid red;
        margin: 50px auto;
        position: relative;
        overflow: hidden;
      }
      #outer > ul {
        width: 500%;
        position: absolute;
        left: 0;
        top: 0;
      }
      #outer > ul > li {
        float: left;
      }
      .dot {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .dot > a {
        display: inline-block;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background-color: #999;
        margin: 0 5px;
      }
      .dot > .active,
      .dot > a:hover {
        background-color: orange;
      }
      .prev,
      .next {
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.4);
        text-align: center;
        position: absolute;
        font-size: 30px;
        color: #999;
        /* 隐藏左右按钮 */
        display: none;
      }
      .prev > a,
      .next > a {
        color: #fff;
      }
      .prev {
        left: 10px;
        top: 42%;
      }
      .next {
        right: 10px;
        top: 42%;
      }
    </style>
  </head>
  <body>
    <div id="outer">
      <!-- 图片部分 -->
      <ul>
        <li>
          <a href="#"><img src="./img/1.jpg" alt="" /></a>
        </li>
        <li>
          <a href="#"><img src="./img/2.jpg" alt="" /></a>
        </li>
        <li>
          <a href="#"><img src="./img/3.jpg" alt="" /></a>
        </li>
        <li>
          <a href="#"><img src="./img/4.jpg" alt="" /></a>
        </li>
        <!-- <li>
          <a href="#"><img src="./img/1.jpg" alt="" /></a>
        </li> -->
      </ul>
      <!-- 导航点  class="active"-->
      <div class="dot">
        <!-- <a href="#" ></a>
        <a href="#"></a>
        <a href="#"></a>
        <a href="#"></a> -->
      </div>
      <!-- 左右导航 -->
      <ol class="prevNext">
        <li class="prev">
          <a href="#"> &lt;</a>
        </li>
        <li class="next">
          <a href="#">&gt;</a>
        </li>
      </ol>
    </div>
  </body>
</html>
```

### （2）、es5写法
功能需求：

+ <font style="color:#000000;">鼠标经过轮播图模块，左右按钮显示，离开隐藏左右按钮</font>
+ <font style="color:#000000;">点击右侧按钮一次，图片往左播放一张，以此类推，左侧按钮同理</font>
+ <font style="color:#000000;">图片播放的同时，下面的小圆圈模块跟随一起变化</font>
+ <font style="color:#000000;">点击小圆圈，可以播放相应图片</font>
+ <font style="color:#000000;">鼠标不经过轮播图，轮播图也会自动播放图片</font>
+ <font style="color:#000000;">鼠标经过，轮播图模块，自动播放停止</font>

```javascript
window.addEventListener("load", function () {
  var prev = this.document.querySelector(".prev");
  var next = this.document.querySelector(".next");
  var outer = this.document.querySelector("#outer");
  //需求1 鼠标移入，左右按钮出现隐藏
  outer.addEventListener("mouseenter", function () {
    prev.style.display = "block";
    next.style.display = "block";
  });
  outer.addEventListener("mouseleave", function () {
    prev.style.display = "none";
    next.style.display = "none";
  });

  //需求2 动态生成pot，小圆圈
  // 2.1、获取元素
  var ulL = outer.querySelector("ul");
  var dot = outer.querySelector(".dot");
  for (var i = 0; i < ulL.children.length; i++) {
    // 2.2、动态的创建a标签
    var a = this.document.createElement("a");
    // 给a添加索引，方便下面计算点击圆圈，移动图片
    a.setAttribute("index", i);
    // 2.3 插入节点
    dot.appendChild(a);
  }
  // 2.4 给第一个小点，设置选中样式
  dot.children[0].className = "active";

  //需求3  给点击的小圆圈加上类名 active  排他思想
  var as = dot.querySelectorAll("a");
  for (var i = 0; i < as.length; i++) {
    as[i].addEventListener("click", function () {
      for (var j = 0; j < as.length; j++) {
        dot.children[j].className = "";
      }
      this.className = "active";

      //需求4   点击小圆圈，移动图片 move(obj, attr, target, speed, callback)
      //4.1  获取点击a的索引，这个索引是创建a时添加的，用来表示每个a
      var index = this.getAttribute("index");
      // 4.2 ulL的移动距离，小圆圈的索引号*图片的宽度
      animation(ulL, -index * 590);
      // move(ulL, "left", -index * 590, 10);
      // 获取到index后，需要同步赋值给下面的num跟current

      // 以便可以同步小圆点，跟点击下一张的变化
      num = index;
      current = index;
    });
  }
  // 克隆第一张图片,不在结构里加
  // 循环生成小圆点的时候，还没有克隆这个图片。所有不会自动生成的小圆圈
  var firstImg = ulL.children[0].cloneNode(true);
  ulL.appendChild(firstImg);

  //需求5  点击左右按钮，实现上下一张切换
  var num = 0;
  var current = 0; //用来标记小圆圈
  next.addEventListener("click", function () {
    //无缝滚动  如果走到了最后一张图片，此时我们的ul要快速复原left改为0
    if (num >= ulL.children.length - 1) {
      ulL.style.left = 0;
      num = 0;
    }
    num++;
    animation(ulL, -num * 590);
    // move(ulL, "left", -num * 590, 20);

    // 点击右侧按钮，小圆圈跟着跳动
    current++;
    // 如果curent的数值跟小圆圈的数量一样，走到了克隆的那张图片，要还原为0
    if (current == dot.children.length) {
      current = 0;
    }
    for (var i = 0; i < dot.children.length; i++) {
      dot.children[i].className = "";
    }
    dot.children[current].className = "active";
  });

  //需求6  左侧按钮的功能
  prev.addEventListener("click", function () {
    if (num == 0) {
      num = ulL.children.length - 1;
      ulL.style.left = -num * 590 + "px";
    }
    num--;
    animation(ulL, -num * 590);
    // move(ulL, "left", -num * 590, 20);
    // 点击右侧按钮，小圆圈跟着跳动
    current--;
    // 如果curent的数值跟小圆圈的数量一样，要还原为0
    if (current < 0) {
      current = dot.children.length - 1;
    }
    for (var i = 0; i < dot.children.length; i++) {
      dot.children[i].className = "";
    }
    dot.children[current].className = "active";
  });

  //需求7  自动播放功能
  var timer = setInterval(function () {
    // 手动调用点击事件
    next.click();
  }, 2000);

  //需求8  鼠标移入，自动播放停止
  outer.addEventListener("mouseenter", function () {
    clearInterval(timer);
    timer = null;
  });

  //需求9  鼠标移出，重新开启定时器
  outer.addEventListener("mouseleave", function () {
    timer = setInterval(function () {
      // 手动调用点击事件
      next.click();
    }, 2000);
  });
});
```

### （3）、es6写法


```javascript
  window.onload = function () {
    var that;
    class Swiper {
      constructor() {
        // 保存this
        that = this;
        // 1.1 获取对应元素
        this.prev = document.querySelector(".prev");
        this.next = document.querySelector(".next");
        this.outer = document.querySelector("#outer");
        //2.1 获取导航点父元素
        this.dot = document.querySelector(".dot");
        this.imgList = document.querySelector(".imgList");
        //   2.4 调用创建小圆点函数
        this.creatDot();
        //   3.1 获取图片导航小圆点
        this.dots = document.querySelectorAll(".dot a");
        //   4.1 用于标识当前的图片位置
        this.num = 0;
        this.current = 0; //用于标识当前小圆点的位置
        //   5、克隆轮播图第一张照片
        this.cloneFirstImg();

        // 调用监听函数
        this.addevent();
      }
      // 所有监听函数
      addevent() {
        console.log(this);
        // 1.2 监听鼠标是否移入
        this.outer.addEventListener("mouseenter", that.pervNextShow);
        this.outer.addEventListener("mouseleave", that.pervNextNode);
        //  3.3 监听是否点击了小圆点
        for (var i = 0; i < this.dots.length; i++) {
          // 保存i值，方便找对应的图片
          this.dots[i].index = i;
          // 默认第一个按钮为选中状态
          this.dots[0].className = "active";
          // 点击切换背景色
          this.dots[i].addEventListener("click", that.updatBackgroundColor);
          // 点击切换图片
          this.dots[i].addEventListener("click", that.updatImg);
        }
        //   4、点击next
        this.next.addEventListener("click", that.nextFun);
        //   5、点击prev
        this.prev.addEventListener("click", that.prevFun);
        //   8、调用自动轮播函数
        this.timer = null; //定义标识定时器
        this.autoPlay();
        // 9、移入outer，暂停自动轮播
        this.outer.addEventListener("mouseenter", that.stopAutoPlay);
        //   10、移出outer，继续自动轮播
        this.outer.addEventListener("mouseleave", that.startAutoPlay);
      }
      // 所有功能函数
      // 注意函数中的this指向
      // 1.3 上下一张出现
      pervNextShow() {
        that.prev.style.display = "block";
        that.next.style.display = "block";
      }
      pervNextNode() {
        that.prev.style.display = "none";
        that.next.style.display = "none";
      }
      // 2、根据图片创建导航点
      creatDot() {
        var imgNum = this.imgList.children.length;
        for (var i = 0; i < imgNum; i++) {
          var a = `<a href="#" ></a>`;
          this.dot.insertAdjacentHTML("afterBegin", a);
        }
      }
      // 3.4 点击小圆点，切换颜色
      updatBackgroundColor(e) {
        // （1）、先解决默认行为，超链接跳转的问题
        e.preventDefault();
        //  (2)、点击颜色切换
        for (var i = 0; i < that.dots.length; i++) {
          that.dots[i].className = "";
        }
        this.className = "active";
      }

      // 3.5 点击小圆点，切换图片
      updatImg() {
        //  (3)、根据图片导航点的索引移动图片
        animation(that.imgList, -590 * this.index);
      }

      // 4、点击下一张，切换图片
      nextFun() {
        // 根据num的值，判断num是否++
        var len = that.imgList.children.length;
        if (that.num >= len - 1) {
          that.imgList.style.left = 0;
          that.num = 0;
        }
        that.num++;

        animation(that.imgList, -that.num * 590);

        // 点击下一张照片后，更换小圆点背景色
        that.current++;
        if (that.current == that.dots.length) that.current = 0;
      //调用更换小圆点颜色函数
      that.changeBackgroundColor();
    }
    // 5、为解决轮播图最后一张快速问题，多赋值一张照片
    cloneFirstImg() {
      var firstImg = that.imgList.children[0].cloneNode(true);
      that.imgList.appendChild(firstImg);
    }
    // 6、更换小圆点颜色
    changeBackgroundColor() {
      for (var i = 0; i < that.dots.length; i++) {
        that.dots[i].className = "";
      }
      that.dots[that.current].className = "active";
    }
    // 7、点击prev，上一张照片
    prevFun() {
      // 根据num的值，判断显示图片
      if (that.num == 0) {
        that.num = that.imgList.children.length - 1;
        that.imgList.style.left = -that.num * 590 + "px";
      }
      that.num--;
      animation(that.imgList, -that.num * 590);
      //  同步图片小圆点的背景色
      if (that.current <= 0) {
        that.current = that.dots.length;
      }
      that.current--;
      //调用更换小圆点颜色函数
      that.changeBackgroundColor();
    }
    // 8、自动轮播，每隔2s，调动一次next函数
    autoPlay() {
      that.timer = setInterval(function () {
        that.nextFun();
      }, 2000);
    }
    // 9、鼠标移入轮播图，停止自动轮播
    stopAutoPlay() {
      //   console.log(that.timer);
      clearInterval(that.timer);
      that.timer = null;
    }
    // 10、鼠标移出轮播图，开始自动轮播
    startAutoPlay() {
      that.autoPlay();
    }
  }
  new Swiper();
};
```

<font style="color:#595959;">/* </font>

<font style="color:#595959;">功能需求：</font>

<font style="color:#595959;">- 鼠标经过轮播图模块，左右按钮显示，离开隐藏左右按钮</font>

<font style="color:#595959;">- 点击右侧按钮一次，图片往左播放一张，以此类推，左侧按钮同理</font>

<font style="color:#595959;">- 图片播放的同时，下面的小圆圈模块跟随一起变化</font>

<font style="color:#595959;">- 点击小圆圈，可以播放相应图片</font>

<font style="color:#595959;">- 鼠标不经过轮播图，轮播图也会自动播放图片</font>

<font style="color:#595959;">- 鼠标经过，轮播图模块，自动播放停止</font>

<font style="color:#595959;">-无缝切换</font>

<font style="color:#595959;">*/</font>



```javascript
window.addEventListener('load',function(){
  let that;
  class swiper{
    constructor(){
      that=this;
      this.imgList=document.querySelector('.imgList');
      this.dotList=document.querySelector('.dot');
      //获取图片的大小
      this.imgWidth=this.imgList.children[0].offsetWidth;
      //获取左右导航按钮
      this.leftBtn=document.querySelector('.prev');
      this.rightBtn=document.querySelector('.next');
      this.outer=document.querySelector('#outer');
      this.num=0;//图片索引
      this.currentdot=0;//当前圆点索引
      this.timer=null;
      this.autoPlay();
      this.crrateDot();
      this.cloneImg();
      this.addevent()
    }
    addevent(){
      this.dotList.addEventListener('click',this.clickDot)
      this.dotList.addEventListener('click',this.clickDotchangeImg)
      // 鼠标经过轮播图模块，左右按钮显示，离开隐藏左右按钮
      this.outer.addEventListener('mouseenter',this.showBtn)
      this.outer.addEventListener('mouseleave',this.hideBtn)
      //鼠标经过，轮播图模块，自动播放停止
      this.outer.addEventListener('mouseenter',this.outplay)
      this.outer.addEventListener('mouseleave',this.inplay)
      //点击右侧按钮一次，图片往左播放一张，以此类推，左侧按钮同理
      this.rightBtn.addEventListener('click',this.nextImg)
      this.leftBtn.addEventListener('click',this.prevImg)
    }
    //各种事件
    //创建小圆点
    crrateDot(){
      let  imgNum = this.imgList.children.length;
      console.log(imgNum);
      for(let i=0;i<imgNum;i++){
        let str="";
        str=`
          <a href="#" index="${i}"></a>
        `
        this.dotList.innerHTML+=str;
      }
     
      // 默认给第一个圆点添加active类
      this.dotList.children[0].className="active";
      console.log(this.dotList);
    }
    //点击小圆点颜色高亮并切换图片
    clickDot(e){
      // 阻止默认行为
      e.preventDefault();
      // 颜色高亮
      console.log(e.target.nodeName)
      if(e.target.nodeName=='A'){
        let dots=that.dotList.children;
        for(let i=0;i<dots.length;i++){
          dots[i].className="";

        } 
        e.target.className="active";
      }
      
     
    }
    //切换图片
    clickDotchangeImg(e){
      let index=e.target.getAttribute("index");
      console.log(index);
      animation(that.imgList,-index*that.imgWidth)
    }
    //鼠标经过轮播图模块，左右按钮显示，离开隐藏左右按钮
    //出现左右按钮
    showBtn(){
      that.leftBtn.style.display="block";
      that.rightBtn.style.display="block";
    }
    // x隐藏左右按钮
    hideBtn(){
      that.leftBtn.style.display="none";
      that.rightBtn.style.display="none";
    }
    //点击右侧按钮一次，图片往左播放一张
    nextImg(){
      if(that.num<that.imgList.children.length-1){
        that.num++;
      }else{
        that.imgList.style.left=0;
        that.num=1;
      }
     animation(that.imgList,-that.num*that.imgWidth);
     let dotsLength=that.dotList.children.length;
     if(that.currentdot<dotsLength-1){
       that.currentdot++;
       
     }else{
       that.currentdot=0;
     }   
     that.changeColor()      
    }
    //点击左侧按钮一次，图片往右播放一张
    prevImg(){
      if(that.num>0){
        that.num--;
      }else{
        that.imgList.style.left=-(that.imgList.children.length-2)*that.imgWidth+'px';
        that.num=that.imgList.children.length-2;

      }
      animation(that.imgList,-that.num*that.imgWidth)
      
      let dotsLength=that.dotList.children.length;
      if(that.currentdot>0){
        that.currentdot--;
        
      }else{
        that.currentdot=that.dotList.children.length-1;;
      }
      
      that.changeColor()
    }
    //按钮点击小圆点颜色高亮，
    changeColor(){
      let dots=that.dotList.children;
      for(let i=0;i<dots.length;i++){
        dots[i].className="";
      }
      dots[that.currentdot].className="active";
    }
    //轮播图自动播放
    autoPlay(){
      that.timer=setInterval(function(){
        that.nextImg();
      },1000)
    }
    //鼠标经过，轮播图模块，自动播放停止
    outplay(){
      clearInterval(that.timer);
    }
    //input输入框内容变化，轮播图自动播放
    inplay(){
      that.autoPlay();
    }
    //实现无缝滚动效果
    cloneImg(){
      let fistimg=that.imgList.children[0].cloneNode(true);
      console.log(fistimg);
      that.imgList.appendChild(fistimg);
      
    }
  }
  new swiper()
})
```

### （4）、节流阀优化
防止轮播图按钮连续点击造成播放过快

节流阀目的，当上一个函数动画内容执行完毕，再去执行下一个函数动画，让事件无法连续触发

```javascript
// 核心实现思路：利用回调函数，添加一个变量来控制，锁住函数和解锁函数
// 开始设置一个变量 var flag =true
// if（flag）{ flag = false,do something} 关闭水龙头
// 利用回调函数动画执行完毕， falg=true 打开水龙头
// 10、节流阀优化点击过快问题
var flag = true;
next.addEventListener("click", function () {
  if (flag) {
    flag = false; // 关闭水龙头
    //无缝滚动  如果走到了最后一张图片，此时我们的ul要快速复原left改为0
    if (num >= ulL.children.length - 1) {
      ulL.style.left = 0;
      num = 0;
    }
    num++;
    animation(ulL, -num * 590, function () {
      flag = true;
    });
    // move(ulL, "left", -num * 590, 20);

    // 点击右侧按钮，小圆圈跟着跳动
    current++;
    // 如果curent的数值跟小圆圈的数量一样，走到了克隆的那张图片，要还原为0
    if (current == dot.children.length) {
      current = 0;
    }
    for (var i = 0; i < dot.children.length; i++) {
      dot.children[i].className = "";
    }
    dot.children[current].className = "active";
  }
});

//需求6  左侧按钮的功能
prev.addEventListener("click", function () {
  if (flag) {
    flag = false;
    if (num == 0) {
      num = ulL.children.length - 1;
      ulL.style.left = -num * 590 + "px";
    }
    num--;
    animation(ulL, -num * 590, function () {
      flag = true;
    });
    // move(ulL, "left", -num * 590, 20);
    // 点击右侧按钮，小圆圈跟着跳动
    current--;
    // 如果curent的数值跟小圆圈的数量一样，要还原为0
    if (current < 0) {
      current = dot.children.length - 1;
    }
    for (var i = 0; i < dot.children.length; i++) {
      dot.children[i].className = "";
    }
    dot.children[current].className = "active";
  }
});
```



## **Bom操作（window、定时器、js执行机制、location对象、navigator、history）**
## 1、BOM概述
### （1）、BOM简介
BOM（Browser Object Model）即浏览器对象模型，它提供了独立于内容而与浏览器窗口进行交互的对象，其核心对象是window。

**<font style="color:#F33232;">BOM由一系列的对象构成</font>**，并且每个对象都提供了很多方法与属性

BOM缺乏标准，JS语法的标准化组织是ECMA，DOM的标准化组织是W3C，BOM最初是Netscape浏览器标准的一部分

### （2）、DOM与BOM的区别
| 类别 | DOM | BOM |
| --- | --- | --- |
| 1 | **<font style="color:rgb(243, 50, 50);">文档</font>**对象模型 | **<font style="color:rgb(243, 50, 50);">浏览器</font>**对象模型 |
| 2 | DOM是把**<font style="color:rgb(243, 50, 50);">文档</font>**当做一个**<font style="color:rgb(243, 50, 50);">对象</font>**来看待 | 把**<font style="color:rgb(243, 50, 50);">浏览器</font>**当做一个**<font style="color:rgb(243, 50, 50);">对象</font>**来看待 |
| 3 | 顶级对象是**<font style="color:rgb(243, 50, 50);">document</font>** | 顶级对象是**<font style="color:rgb(243, 50, 50);">window</font>** |
| 4 | 主要学习**<font style="color:rgb(243, 50, 50);">操作页面元素</font>** | 学习**<font style="color:rgb(243, 50, 50);">浏览器窗口交互</font>**的一些对象 |
| 5 | W3C标准规范 | 各浏览器厂商在各自浏览器上定义的标准，兼容性较差 |


### （3）、BOM的构成(对象)
BOM比DOM更大，它包含DOM

| window | | | | |
| --- | --- | --- | --- | --- |
| document | location | navigation | screen | history |


Window

代表的是整个浏览器的窗口，同时windonw也是网页的全局对象

window 对象是浏览器的顶级对象，它具有双重角色

它是js访问浏览器窗口的一个接口

它是一个全局对象。定义在全局作用域中的变量，函数都会变成window对象的属性和方法，在调用的时候，可以省略window，前面学习的对话框都属于window对象方法，如alert（），prompt（）等

**<font style="color:#F33232;">注意：window下的一个特殊属性window.name，所以定义变量时，尽量不用name这个变量名</font>**

**<font style="color:#F33232;">Navigator</font>**（浏览器的意思）

-代表的**<font style="color:#F33232;">当前浏览器</font>**的**<font style="color:#F33232;">信息</font>**，通过该对象可以来**<font style="color:#F33232;">识别</font>**不同的**<font style="color:#F33232;">浏览器</font>**

**<font style="color:#F33232;">Location</font>**

-代表浏览器的**<font style="color:#F33232;">地址栏</font>**信息，通过location可以**<font style="color:#F33232;">获取</font>**地址栏信息，或者**<font style="color:#F33232;">跳转</font>**页面

**<font style="color:#F33232;">History</font>**

-代表浏览器的**<font style="color:#F33232;">历史记录</font>**，可以通过该对象操作浏览器的历史记录

由于隐私的原因，该对象不能获取到具体的历史记录，只能操作浏览器向前或者向后翻页

而且该操作只在当次访问有效

**<font style="color:#F33232;">Screen</font>**

-代表用户的**<font style="color:#F33232;">屏幕</font>**的**<font style="color:#F33232;">信息</font>**，通过该对象可以**<font style="color:#F33232;">获取</font>**到用户的显示器的相关信息

注意：这些BOM对象在浏览器中都是作为window对象的属性来保存的，可以通过window对象来使用，也可以直接使用

## 2、window对象的常见事件
### （1）、onload窗口加载事件
window.onload=function(){} 传统注册事件方式（只能写一次，如果有多个，会以最后一个为准）

或

window.addEventListener("load",function(){} )

当文档内容完全加载完成会触发该事件（包括图像，脚本文件、css文件等），就调用的处理函数

### (2)、DOMContentLoaded窗口加载事件
window.addEventListener("DOMContentLoaded",function(){} )

当DOM加载完成，不包括样式表、图片、flash等等。ie9以上支持

```javascript
<body>
    <script>
      //1、 onload写法
      //   window.onload = function () {
      //     var box = document.querySelector(".box");
      //     box.addEventListener("click", function () {
      //       this.style.backgroundColor = "pink";
      //     });
      //   };
      //2、addEventListener 写法
      //   window.addEventListener("load", function () {
      //     var box = document.querySelector(".box");
      //     box.addEventListener("click", function () {
      //       this.style.backgroundColor = "pink";
      //     });
      //   });
      //3、DOMContentLoaded写法
      document.addEventListener("DOMContentLoaded", function () {
        var box = document.querySelector(".box");
        box.addEventListener("click", function () {
          this.style.backgroundColor = "pink";
        });
      });
    </script>
    <!-- 需求：点击box，box背景色变化，js交互可以放在任意位置 -->
    <div class="box">box</div>
  </body>
```

### (3)、调整窗口大小事件
window.onresize=function(){} 

或

window.addEventListener("resize",function(){} )

调整窗口大小（像素）就会触发，调用内部处理函数，可以用来完成响应式效果

<font style="color:#595959;"><!--需求：当前屏幕大小在800以内的时候，box消失，否则显示 --></font>

```javascript
  <div>box</div>
    <script>
      var box = document.querySelector("div");
      window.addEventListener("resize", function () {
        if (window.innerWidth < 800) {
          box.style.display = "none";
        } else {
          box.style.display = "block";
        }
      });
    </script>
```

## 3、定时器
### （1）、 setInterval() 定时调用
js的程序的执行速度是非常非常快的，如果希望一段程序，可以每间隔一段时间执行一次，可以使用定时调用

**<font style="color:#F33232;">setInterval(回调函数，间隔时间) </font>**定时调用，可以将一个函数，每隔一段时间执行一次

参数：

第一个：回调函数，该函数会每隔一段时间调用一次

第二个：每次调用间隔时间，单位是毫秒

返回值：

**<font style="color:#F33232;">返回</font>**一个**<font style="color:#F33232;">Number类型</font>**的**<font style="color:#F33232;">值</font>**

这个数字用来作为定时器的唯一标识

clearInterval()可以用来关闭一个定时器 

方法中需要一个定时器的标识作为参数，这样将关闭标识对应的定时器

<font style="color:#595959;"><!-- 需求：页面出现出现数字，每秒自增1 --></font>

```javascript
 <h1 id="count"></h1>
 <script>
   var count = document.getElementById("count");
   var num = 1;
   var timer = setInterval(function () {
     count.innerHTML = num++;
     if (num == 5) {
       clearInterval(timer);
     }
   }, 1000);
   console.log(timer);//1
 </script>
```

### （2）、 setTimeout() 延时调用
概念：延时调用,一个函数不马上执行，而是隔一段时间以后再执行 ，而且**<font style="color:#F33232;">只会执行一次</font>**

**<font style="color:#F33232;">window.setTimeout(回调函数，延迟毫秒数)</font>**

参数：

1、回调函数直接写函数，或者写函数名皆可

2、延迟秒数若省略，默认是0，**<font style="color:#F33232;">单位</font>**是**<font style="color:#F33232;">毫秒</font>**

返回值：数字标识，可以用clearTimeout(timer)关闭定时器

**<font style="color:#F33232;">区别：定时调用会执行多次，而延时调用只会调用一次</font>**

延时调用和定时调用可以互相代替，在开发中，可根据自己的需要去选择

```javascript
<script>
        var num = 0;
        var timer = setTimeout(function () {
          console.log(num++);
        }, 1000);
        //使用clearTimeout()来关闭一个延时调用
        clearTimeout(timer);
      </script>
```

## 4、JS执行机制
### （1）、JS是单线程
JS语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。这是JS这门脚本语言诞生的使命所致——用来处理页面中用户的交互，以及操作DOM而诞生的。

单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。这样所导致的问题是：如果JS执行的时间过长，这样会造成页面的渲染不连贯，导致页面渲染加载阻塞的感觉

### （2）、同步和异步
为了解决这个问题，利用多核CPU的计算能力，HTML5提出了Web Worker标准，允许JS脚本创建多个线程，于是，jS中出现了同步和异步

**<font style="color:#F33232;">同步</font>**：前一个任务结束后再执行后一个任务，程序的执行顺序与任务的排列顺序是一致的，同步的。比如：我们要烧水煮饭，等水开了（10分钟后），再去切菜，炒菜

**<font style="color:#F33232;">异步</font>**：你在做一件事情时，因为这件事会花费很长时间，在做这件事的同时，你还可以去处理其他事情。比如烧水的10分钟内，去切菜，炒菜

**<font style="color:#F33232;">同步任务</font>**：<font style="color:#4D4D4D;">在主线程上排队执行任务，只有前一个任务执行完毕，才能执行后一个任务</font>

**<font style="color:#F33232;">异步任务</font>**：**<font style="color:#F33232;">不进入主线程，而是进入"任务队列"的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。</font>**

一般而言，异步任务有以下三种类型

setTimeout和setInterval

DOM事件 普通事件如：click、resize，资源加载事件：onload等

ES6中的**<font style="color:#F33232;">Promise</font>**

Ajax异步请求

异步任务相关回调函数添加到任务队列中（消息队列）

### （3）、JS执行机制
先执行**<font style="color:#F33232;">执行栈中的同步任务</font>**

异步任务（回调函数）放入任务队列中

一旦执行栈中的所有**<font style="color:#F33232;">同步任务执行完毕</font>**，系统就会**<font style="color:#F33232;">按次序</font>**读取任务队列中的异步任务，于是被读取的**<font style="color:#F33232;">异步任务结束等待状态，进入执行栈</font>**，开始执行

### （4）、事件循环
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693840902-45c5e0e2-e5b9-45ae-be40-82bacd583551.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693841173-5e49f27b-b5b0-47a8-9e44-069ec951b5a8.png)

首先，执行栈开始顺序执行

判断是否为同步，异步则进入异步线程，最终事件回调给事件触发线程的任务队列等待执行，同步继续执行

执行栈为空，询问任务队列中是否有事件回调

任务队列中有事件回调则把回调加入执行栈末尾继续**<font style="color:#F33232;">从第一步开始执行</font>**

**<font style="color:#F33232;">任务队列中没有事件回调则不停发起询问</font>**

```javascript
<button>点击</button>
    <script>
      var setTimeoutCallBack = function () {
        console.log("我是定时器回调");
      };
      var btn = document.querySelector("button");
      btn.onclick = function () {
        console.log("我是点击事件");
      };
      // 同步任务
      console.log("我是同步任务1");

      // 异步定时任务
      setTimeout(setTimeoutCallBack, 1000);

      // 同步任务
      console.log("我是同步任务2");
    </script>
```

JS引擎线程 只会执行执行栈中的事件，执行栈中的代码执行完毕，就会读取事件队列中的事件并添加到执行栈中继续执行，这样反反复复就是我们所谓的**<font style="color:#F33232;">事件循环(Event Loop)</font>**

## 5、location对象
### 1）、location对象初识
window对象给我们提供了一个location属性用于**<font style="color:#F33232;">获取或设置窗体的URL</font>**，并且可以用于解析URL。因为这个对象**<font style="color:#F33232;">返回</font>**的是一个**<font style="color:#F33232;">对象</font>**，所以我们称为location对象

### 2）、URL
**<font style="color:#F33232;">统一资源定位符</font>**（Uniform Resource Locator，简称URL）是互联网上标准资源的地址。互联网上的每个文件都有一个唯一的URL，它包含的信息支出文件的位置以及浏览器应该如何处理它。<font style="color:#4D4D4D;">简单地说URL就是web地址，俗称“网址”。</font>

URL由三部分组成：**<font style="color:#F33232;">资源类型、存放资源的主机域名、资源文件名</font>**。

URL的一般语法格式为：

protocol :// hostname[:port] / path / [;parameters][?query]#fragment

**<font style="color:#F33232;">协议：//主机名或 IP 地址[:端口号]/路径/[;参数][?查询]#信息片断</font>**

[https://pro.jd.com/mall/active/2vx2zyXR2KhRouYS6LrSEdnLF1P5/index.html](https://pro.jd.com/mall/active/2vx2zyXR2KhRouYS6LrSEdnLF1P5/index.html" \t "_blank)

格式说明:

#### （1）、protocol（协议）
指定使用的传输协议，最常用的HTTP协议，它是目前WWW中应用最广的协议。

http 通过 HTTP 访问该资源。 格式 HTTP://

https 通过安全的 HTTPS 访问该资源。 格式 HTTPS://

ftp 通过 FTP访问资源。格式 FTP://

一般来说，https开头的URL要比http开头的更安全，因为这样的URL传输信息是采用了加密技术。

#### （2）、hostname（主机名）
是指存放资源的服务器的域名系统(DNS) **<font style="color:#F33232;">主机名或 IP 地址</font>**。有时，在主机名前也可以包含连接到服务器所需的用户名和密码（格式：username:password@hostname）。

#### （3）、port（端口号）
HTTP缺省工作在TCP协议80端口，用户访问网站http:// 打头的都是标准HTTP服务。

HTTPS缺省工作在TCP协议443端口。

#### （4）、path（路径）
由**<font style="color:#F33232;">零或多个“/”符号隔开的字符串</font>**，一般用来表示主机上的一个目录或文件地址。

#### （5）、parameters（参数）
这是用于指定特殊参数的可选项。parameters 一般在 HTTP 协议里使用较少，更多在特定协议场景，例如 ftp://user:password@example.com;type=d/file.txt 里，;type=d 就是参数，用于指定文件类型为目录。

#### （6）、query(查询)
可选，用于给动态网页（如使用CGI、ISAPI、PHP/JSP/ASP/ASP。NET等技术制作的网页）传递参数，可有多个参数，用“&”符号隔开，每个参数的名和值用“=”符号隔开。

#### （7）、fragment（信息片断）
信息片断，**<font style="color:#F33232;">字符串</font>**，用于指定网络资源中的片断。例如一个网页中有多个名词解释，可使用fragment直接定位到某一名词解释。

### 3）location对象的属性
| location对象属性 | 返回值 |
| --- | --- |
| **<font style="color:rgb(243, 50, 50);">location.href</font>** | **<font style="color:rgb(243, 50, 50);">返回</font>**<font style="color:rgb(77, 77, 77);">当前加载</font>**<font style="color:rgb(243, 50, 50);">页面</font>**<font style="color:rgb(77, 77, 77);">的完整</font>**<font style="color:rgb(243, 50, 50);">URL</font>**<br/><font style="color:rgb(77, 77, 77);">location.href 与 window.location.href等价</font> |
| <font style="color:rgb(77, 77, 77);">location.hash</font> | <font style="color:rgb(77, 77, 77);">返回URL中的hash（#号后 跟零或多个字符），如果不包含则返回空字符串</font> |
| <font style="color:rgb(77, 77, 77);">location.host</font> | <font style="color:rgb(77, 77, 77);">返回服务器名称和端口号</font> |
| <font style="color:rgb(77, 77, 77);">location.hostname</font> | <font style="color:rgb(77, 77, 77);">返回不带端口号的服务器名称</font> |
| <font style="color:rgb(77, 77, 77);">location.pathname</font> | <font style="color:rgb(77, 77, 77);">返回URL中的目录和（或）文件名</font> |
| <font style="color:rgb(77, 77, 77);">location.port</font> | <font style="color:rgb(77, 77, 77);">返回URL中指定的端口号，如果没有返回空字符串</font> |
| <font style="color:rgb(77, 77, 77);">location.protocol</font> | <font style="color:rgb(77, 77, 77);">返回页面使用的协议</font> |
| <font style="color:rgb(77, 77, 77);">location.search</font> | <font style="color:rgb(77, 77, 77);">返回URL的查询字符串，</font>查询以 ？ 开头的字符串 |
| location对象方法 | 功能 |
| **<font style="color:rgb(243, 50, 50);">location.assign()</font>** | 用来**<font style="color:rgb(243, 50, 50);">跳转</font>**到其他的**<font style="color:rgb(243, 50, 50);">页面</font>**，作用和直接修改location一样,有历史记录（也称重定向页面） |
| **<font style="color:rgb(243, 50, 50);">location.replace()</font>** | **<font style="color:rgb(243, 50, 50);">重新定向URL</font>**<font style="color:rgb(77, 77, 77);">，</font>**<font style="color:rgb(243, 50, 50);">不会在历史记录中生成新纪录</font>**<font style="color:rgb(77, 77, 77);">（没有后退按钮）</font> |
| **<font style="color:rgb(243, 50, 50);">location.reload()</font>** | **<font style="color:rgb(243, 50, 50);">重新加载当前</font>**<font style="color:rgb(77, 77, 77);">显示的</font>**<font style="color:rgb(243, 50, 50);">页面</font>**<font style="color:rgb(77, 77, 77);">，</font>如果在方法中传递一个**<font style="color:rgb(243, 50, 50);">true</font>**，作为参数，则会**<font style="color:rgb(243, 50, 50);">强制刷新</font>**缓存 |


## 6、navigator对象
navigator代表的**<font style="color:#F33232;">当前浏览器</font>**的**<font style="color:#F33232;">信息</font>**，通过该对象可以来**<font style="color:#F33232;">识别</font>**不同的**<font style="color:#F33232;">浏览器</font>**，由于历史原因，navigator对象中的大部分属性都已经不能帮助我们识别浏览器了，一般我们只会用userAgent 来判断浏览器的信息，userAgent是一个字符串，这个字符串中包含有用来描述浏览器信息的内容，不同的浏览器会有不同的userAgent

## 7、history对象
window对象给我们提供了一个history对象，**<font style="color:#F33232;">与浏览器历史记录进行交互</font>**，该对象包含用户（在浏览器窗口中）访问过的URL

| history对象属性 | 作用 |
| --- | --- |
| length | 可以获取当前访问的网页的链接数量 |
| history对象方法 | 作用 |
| **<font style="color:rgb(243, 50, 50);">back()</font>** | 可以用来**<font style="color:rgb(243, 50, 50);">退到上一个页面</font>**，作用和浏览器的**<font style="color:rgb(243, 50, 50);">回退</font>**按钮一样 |
| **<font style="color:rgb(243, 50, 50);">forward()</font>** | 可以**<font style="color:rgb(243, 50, 50);">跳转</font>**到**<font style="color:rgb(243, 50, 50);">下一个页面</font>**，作用和浏览器的**<font style="color:rgb(243, 50, 50);">前进</font>**按钮一样 |
| **<font style="color:rgb(243, 50, 50);">go()</font>** | 可以**<font style="color:rgb(243, 50, 50);">跳转</font>**到**<font style="color:rgb(243, 50, 50);">指定</font>**的**<font style="color:rgb(243, 50, 50);">页面</font>**，它需要**<font style="color:rgb(243, 50, 50);">一个整数作为参数</font>**<br/>**<font style="color:rgb(243, 50, 50);">正数</font>**：**<font style="color:rgb(243, 50, 50);">向前</font>**跳转n个页面<br/>**<font style="color:rgb(243, 50, 50);">负数</font>**：**<font style="color:rgb(243, 50, 50);">向后</font>**跳转n个页面 |
