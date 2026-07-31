---
title: "js高级"
slug: "javascriptes6-js-dd445881"
summary: ""
category: "青鸟版三剑客"
tags: []
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0dc"
originalSlug: "javascriptes6-js-dd445881"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
**《（一）js高级01-基础深入》**

1、基础深入js数据类型有哪些数据类型分为两种：基本数据类型与引用数据类型。

基本数据类型有：number、string、boolean、null、undefined。

引用数据类型有：array、function等（除了基本数据类型都是引用数据类型）

基本数据类型的主要特点是赋值方式是传值，并且值存在栈中。

引用数据类型的主要特点是赋值方式是传址，并且值存在堆中。

js数据类型判断JavaScript 中常用的数据类型判断方法有以下 5 种：

1.typeof 操作符：可以返回一个**<font style="color:#FF0000;">字符串</font>**，用于表明所操作数的类型。

2.instanceof 操作符：可以判断一个对象是否属于某个类（或其子类）。

3.Object.prototype.toString.call() 方法：可以返回一个表示调用它的对象所属类的字符串。

4.constructor 属性：可以返回对创建该对象的数组函数的引用。

5.Array.isArray() 方法：可以判断一个值是否为数组。

6.===也可以做全等的类型判断

这些方法的区别如下：

1.typeof **<font style="color:#FF0000;">只能</font>**区分**<font style="color:#FF0000;">基本数据类型</font>**，**<font style="color:#FF0000;">不</font>**能**<font style="color:#FF0000;">区分具体</font>**的**<font style="color:#FF0000;">对象</font>**类型。

2.instanceof **<font style="color:#FF0000;">只能</font>**用于**<font style="color:#FF0000;">判断对象类型</font>**，**<font style="color:#FF0000;">无法判断基本</font>**数据类型

3.Object.prototype.toString() 方法可以返回对象类型的具体字符串

4.constructor 属性可以返回对象所属类的构造函数

5.Array.isArray() 可以判断一个值是否为数组

<font style="color:#595959;">let obj = {</font>

<font style="color:#595959;">        name: 'dawn',</font>

<font style="color:#595959;">        age: 21</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    let fn = function () {</font>

<font style="color:#595959;">        console.log('我是 function 类型');</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">    console.log(</font>**<font style="color:#FF0000;">Object.prototype.toString.call(1)</font>**<font style="color:#595959;">);        // </font>**<font style="color:#FF0000;">[object Number]</font>**

<font style="color:#595959;">    console.log(Object.prototype.toString.call('Hello tomorrow')); // [object String ]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(true));     // [object Boolean]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(undefined));  // [object Undefined]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(fn));   // [object Function]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(new Date));  // [object Date]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(null));   // [object Null]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call([1, 2, 3]));  // [object Array]</font>

<font style="color:#595959;">    console.log(Object.prototype.toString.call(obj));       // [object Object]</font>

### 如何判断是否是一个数组
instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

<font style="color:#595959;">var arr = [1,2,3];</font>

**<font style="color:#FF0000;">arr instanceof Array   // true</font>**

<font style="color:#595959;">var obj = {};</font>

<font style="color:#595959;">obj instanceof Array   // false</font>

<font style="color:#595959;">Array.isArray()</font>

<font style="color:#595959;">Array.isArray([1,2,3]);</font>

constructor 在其对应对象的原型下面，是自动生成的。

<font style="color:#595959;">var arr = [1,2,3];</font>

**<font style="color:#FF0000;">arr.constructor === Array</font>**

<font style="color:#595959;">Object.prototype.toString.call([ ])</font>

  
在任何值上调用Object原生的toString()方法，都会**<font style="color:#FF0000;">返回</font>**一个**<font style="color:#FF0000;">[Object NativeConstructorName]</font>**格式的字符串。每个类在内部都一个[[class]]属性，这个属性中指定了上述 字符串中的构造函数名。

<font style="color:#595959;">var value = [1,2,3];</font>

**<font style="color:#FF0000;">alert(Object.prototype.toString.call(value));  // "[object Array]"</font>**

Object.prototype.toString.call([1, 2, 3])

**<font style="color:#FF0000;">Array.isArray(). 返回值：true，false</font>**

### js的运行机制是什么
js运行机制，即事件循环机制。js是单线程执行的，这意味着同一时间内只能做一件事，但这并不是说单线程就会阻塞，而要实现单线程且非阻塞的方法就是事件循环机制。

在js中，会把任务分为同步和异步，这两者的执行环境不同，同步任务会进入主线程，异步任务会进入事件队列(EventQueue)，当主线程代码**<font style="color:#FF0000;">执行完毕</font>**后，会去事件队列中读取对应的异步任务，并推到主线程中执行，不断重复过程，称为事件循环机制(EventLoop) 。

### undefined和null有什么区别
null表示为空，代表此处不应该有值的存在，⼀个对象可以是null，代表是个空对象，⽽**<font style="color:#FF0000;">null</font>**本身也**<font style="color:#FF0000;">是对象</font>**。

undefined表示『不存在』，JavaScript是⼀⻔动态类型语⾔，成员除了表示存在的空值外，还有可能根本就不存在(因为存不存在只在运⾏期才知道)，这就是undefined的意义所在。

### ==和===有什么区别
双等仅仅是看值是否相等，值相等即可无需比较类型。三等是值类型与数据类型进行双层比较。

### js中布尔值为false的六种情况
undefined（未定义找不到值时出现）、

null(代表空值)

NaN(无法计算时候出现表示非数值，typeof(NaN)是number类型)

false(布尔值的false,注意：‘false’的布尔值为true(''这是字符串))

0（数字）

空串 ''、""、``（单双引号，注意中间有空格是true）

### null typeof为什么是一个object
因为在javaScript中，不同的对象都是使用二进制存储的，如果二进制前三位都是0的话，系统会判断为是Object类型，而null的二进制全是0，自然也就判断为Object

### js中的this指向有哪些
函数直接调用，this是window

函数是作为对象的方法调用，this是调用方法的对象

new构造函数时，this是实例对象

call (),apply(),bind()可以改变this的指向

事件函数中，this指向事件源

定时器(setTimeout setInterval)环境this指向window

箭头函数中没有自己的this，它指向其外层作用域的this

### 改变this指向的方法有哪些，区别是什么
共同点：

call、apply、bind都是用来改变函数的this对象的指向的，第一个参数都是this要指向的对象，都可以参加后续参数传参

不同点：

bind是返回对应函数，**<font style="color:#FF0000;">不会执行</font>**，需要手动去调用；

apply、call则是**<font style="color:#FF0000;">立即调用</font>**调用

apply和call功能一样，只是传入的参数列表形式不同，call 需要把参数**<font style="color:#FF0000;">按</font>**顺**<font style="color:#FF0000;">序传递</font>**进去，而 apply 则是把参数放在**<font style="color:#FF0000;">数组</font>**里。

### 构造函数中的new做了什么
1、创建了一个新的空对象；

2、将构造函数的原型对象赋值到实例对象的原型链上；

3、改变了构造函数的this指向，指向新的实例对象；

4、依次执行代码，赋值

5、将实例对象返回（return）；

**<font style="color:#FF0000;">创对象，加原型，改this，执行代码并返回对象</font>**

### arguments的特点
JavaScript中，arguments对象是比较特别的一个对象，实际上是当前**<font style="color:#FF0000;">函数</font>**的一个内置属性，（与this一样，都是内置属性）。也就是说所有函数都内置了一个arguments对象，arguments对象中**<font style="color:#FF0000;">存储</font>**了传递的所有**<font style="color:#FF0000;">实参</font>**。arguments是一个**<font style="color:#FF0000;">伪数组</font>**，因此可以进行遍历，并且有length属性。

arguments只是伪数组，并不是真正的数组，因此不能调用数组的方法。

### contiune/break/return区别
return关键词，用于结束循环语句,函数执行过程遇到return,则直接结束函数执行(即剩下部分不再执行)，将return后的值作为函数调用的返回值

continue结束当次循环,继续执行下次循环

break表示跳出本轮循环,注意只能结束离break最近一层循环

### 数组有哪些方法
push()、unshift、shift()、pop()、splice()、join()、reverse()

map()、filter()、some()、every()、findindex()、reduce()等

### map()对比forEach()
map**<font style="color:#FF0000;">有返回值</font>**，可以**<font style="color:#FF0000;">开辟新空间</font>**，return出来一个length和原数组一致的数组，即便数组元素是undefined或者是null。

forEach默认**<font style="color:#FF0000;">无返回值</font>**，返回结果为undefined，可以通过在函数体内部使用索引修改数组元素。

map的处理速度比forEach快，而且返回一个新的数组，方便链式调用其他数组新方法

### 数组转字符串字符串转数组
join() 方法可以把数组转换为字符串

split() 方法可以把字符串转换为数组

### 阻止事件冒泡和默认事件的方法
e.stopPropagation()来阻止事件冒泡。作用当然是阻止我们触发它上级的事件

e.preventDefault()阻止默认行为事件的方法，例如：超链接不跳转

**<font style="color:#FF0000;">return false </font>**；这个方法比较暴力，他会**<font style="color:#FF0000;">同时阻止</font>**事件**<font style="color:#FF0000;">冒泡</font>**也会阻止**<font style="color:#FF0000;">默认事件</font>**，针对：on事件绑定的情况

### innerHTML innerText区别
innerHTML用来获取标签元素或设置标签元素，包含文本和Html标签。在读取元素的时候，会将文本和Html标签一起读取出来；在设置元素的时候，会覆盖掉原来的元素中文本和标签，如果新的内容包含标签，会**<font style="color:#FF0000;">解析</font>**Html**<font style="color:#FF0000;">标签</font>**，只显示文本，而不将标签显示出来。

innerText用来设置或获取标签内文本内容, 但它去除Html标签。在读取元素的时候，**<font style="color:#FF0000;">只会读取文本</font>**；在设置元素的时候，会覆盖掉原来的元素中文本和标签，如果新的内容包含标签，不会解析Html标签，也就是说，里面的标签并不是html中的标签，而只是一个文本。

### js事件代理（事件委托）
把事件处理任务添加到上一级的元素中，这样就避免了把事件添加到多个子集元素上，底层原理是利用了事件冒泡机制（事件冒泡是从最具体的元素（触发事件的目标元素）开始，逐级向上传播到祖先元素）

优点：

减少注册时间，节约内存

简化dom节点更新，相应事件的更新

对于新增的节点，可以不用再次绑定事件

缺点：

对于不冒泡的事件不给予支持

层级太多肯能会被中间的某层阻止掉

理论上会导致浏览器会频繁的调用处理函数，虽然可能不需要处理

### 本地存储的方法及特点
sessionStorage，localStorage，cookie

sessionStorage仅在当前会话下有效，关闭页面或浏览器后被清除，单页面内共享数据

localStorage 用于长久保存整个网站的数据，保存的数据没有过期时间，直到手动去删除；内存较大；多页面可以共享数据

### 数组去重有哪些方法
1.利用**<font style="color:#FF0000;">新旧数组遍历对比法</font>**

<font style="color:#595959;">arr=[1,5,1,3,5,4,3,9,8]</font>

<font style="color:#595959;">let newArr = [];</font>

<font style="color:#595959;">/*   </font>

<font style="color:#595959;">indexOf用于查找数组元素第一次出现的位置，没找到则返回值为-1，</font>

<font style="color:#595959;">参数有两个，第一个为元素项目，参数二（可选）需要查找的位置，负数从-1往前面加 </font>

<font style="color:#595959;">*/</font>

<font style="color:#595959;">for (let i=0;i<arr.length;i++) {</font>

<font style="color:#595959;">  if (newArr.indexOf(arr[i]) === -1) {</font>

<font style="color:#595959;">    newArr.push(arr[i]);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">console.log(newArr);//[1, 5, 3, 4, 9, 8]</font>

2.利用新语法 **<font style="color:#FF0000;">new Set()</font>**

<font style="color:#595959;">arr=[1,5,1,3,5,4,3,9,8]</font>

<font style="color:#595959;">let mySet = new Set(arr); // 非重复的类数组</font>

<font style="color:#595959;">console.log(mySet,'mySet');//{{1, 5, 3, 4, 9,8}</font>

<font style="color:#595959;">// let newArr = Array.from(mySet); // set转数组</font>

<font style="color:#595959;">let newArr = [...mySet]; // 或者是这种解构方法</font>

<font style="color:#595959;">console.log(newArr);//[1, 5, 3, 4, 9, 8]</font>

3.filter与indexOf结合

<font style="color:#595959;">/* 这个过滤就很巧妙，利用索引与每一项出现的首次位置（indexOf作用）进行对比，</font>

<font style="color:#595959;">当符合条件的时候返回出去</font>

<font style="color:#595959;">*/ </font>

<font style="color:#595959;">arr=[1,5,1,3,5,4,3,9,8]</font>

<font style="color:#595959;">var newArr = arr.filter((item, index) => {</font>

<font style="color:#595959;">  return arr.indexOf(item) === index;</font>

<font style="color:#595959;">})</font>

<font style="color:#595959;">console.log(newArr);//[1, 5, 3, 4, 9, 8]</font>

4.includes()的妙用

<font style="color:#595959;">arr=[1,5,1,3,5,4,3,9,8]</font>

<font style="color:#595959;">let newArr = [];</font>

<font style="color:#595959;">for (let i=0;i<arr.length;i++) {</font>

<font style="color:#595959;">  if (!newArr.includes(arr[i])) {</font>

<font style="color:#595959;">    newArr.push(arr[i]);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">console.log(newArr);//[1, 5, 3, 4, 9, 8]</font>

5.利用对象属性来进行判断

<font style="color:#595959;">arr=[1,5,1,3,5,4,3,9,8]</font>

<font style="color:#595959;">let obj = {}; // 对象的key值是唯一的</font>

<font style="color:#595959;">let newArr = [];</font>

<font style="color:#595959;">for (let i=0;i<arr.length;i++) {</font>

<font style="color:#595959;">  if (!obj[arr[i]]) {//找到对象中没有的</font>

<font style="color:#595959;">    obj[arr[i]] = arr[i];//添加到对象中</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">console.log(obj)//{1: 1, 3: 3, 4: 4, 5: 5, 8: 8, 9: 9}</font>

### 事件三要素
事件是有三部分组成事件源事件类型事件处理程序这就是所谓的事件三要素。

事件源：事件被触发的对象例如一个按钮

事件类型: 如何触发 什么事件 比如鼠标点击(onclick) 还是鼠标经过 还是键盘按下

事件处理程序: 通过一个函数赋值的方式 完成

### dom事件流
定义：

事件流指的是从页面中接受事件的顺序，事件发生时会在元素节点之间按照特定的顺序传播，这个传播过程即为DOM事件流。

阶段：

1.捕获阶段：事件从Document节点自上而下向目标节点传播的阶段

2.当前目标阶段：真正的目标节点正在处理事件的阶段

3.冒泡阶段：事件从目标节点自下而上向Document节点传播的阶段

### 作用域预解析
作用域是变量起作用和效果的范围，目的是提高程序的可靠性，为了减少命名冲突。JavaScript中有两种作用域(ES6之前没有块级作用域)：全局作用域和局部作用域。

JavaScript 解析器在运行 JavaScript 代码的时候分为两步：预解析和代码执行。

预解析：JS 代码执行之前，浏览器会默认把var 和 function 声明的变量在内存中进行提升到当前作用域的最前面进行声明。

代码执行：从上到下执行JS语句。





## （一）、原型与原型链
### 1、prototype属性
#### （1）. 函数的prototype属性 
* 每个函数都有一个prototype属性, 它默认指向一个Object空对象(即称为: 原型对象或者显示原型) 

* 原型对象prototype中有一个属性constructor, 它指向函数对象

<font style="color:#595959;">// 每个函数都有一个prototype属性, </font>

<font style="color:#595959;">//它默认指向一个对象(即称为: 原型对象)</font>

<font style="color:#595959;">console.log(Date.prototype, typeof Date.prototype);</font>

<font style="color:#595959;">function fn() {}</font>

<font style="color:#595959;">console.log(fn.prototype, typeof fn.prototype);</font>



<font style="color:#595959;">// 原型对象中有一个属性constructor, 它指向函数对象</font>

<font style="color:#595959;">console.log(Date.prototype.constructor === Date);</font>

<font style="color:#595959;">console.log(fn.prototype.constructor === fn);</font>

#### （2）. 给原型对象添加属性(一般都是方法) 
* 作用: 函数的所有实例对象自动拥有原型中的属性(方法)

<font style="color:#595959;">function F() {}</font>

<font style="color:#595959;">F.prototype.age = 12; //添加属性</font>

<font style="color:#595959;">F.prototype.setAge = function (age) {</font>

<font style="color:#595959;">  // 添加方法</font>

<font style="color:#595959;">  this.age = age;</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">// 创建函数的实例对象</font>

<font style="color:#595959;">var f = new F();</font>

<font style="color:#595959;">console.log(f.age);//12</font>

<font style="color:#595959;">f.setAge(23);</font>

<font style="color:#595959;">console.log(f.age);//23</font>

### 2、显式原型与隐式原型
（1）. <font style="color:#F33232;">每个函数</font>function都有一个prototype，即显式原型,是给程序员使用的

（2）. <font style="color:#F33232;">每个实例</font>对象都有一个__proto__，可称为隐式原型，是js本身用的，一般情况，程序员不去使用

（3）. 对象的隐式原型的值为其对应构造函数的显式原型的值

（4）. 内存结构(图)

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697861645-ce2b03fa-4190-4944-ab71-142587bcdc51.png)

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697861891-a09a865b-f120-4091-b3b0-25ddb255341b.png)

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  function Fn() {</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">var fn = new Fn()</font>



<font style="color:#595959;">console.log(Fn.prototype, fn.__proto__)</font>

<font style="color:#595959;">console.log(Fn.prototype===fn.__proto__)//true</font>



<font style="color:#595959;">Fn.prototype.test = function () {</font>

<font style="color:#595959;">  console.log('test()')</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn.test()</font>



<font style="color:#595959;">  </script></font>

（5）. 总结: 

函数的prototype属性: 在定义函数时自动添加的, 默认值是一个空Object对象

对象的__proto__属性: 创建对象时自动添加的, 默认值为构造函数的prototype属性值

__proto__<font style="color:#333333;">和</font>constructor<font style="color:#333333;">属性是</font><font style="color:#FF0000;">对象</font><font style="color:#333333;">所独有的；</font>

prototype<font style="color:#333333;">属性是</font><font style="color:#FF0000;">函数</font><font style="color:#333333;">所独有的，因为函数也是一种对象，所以函数也拥有</font>__proto__<font style="color:#333333;">和</font>constructor<font style="color:#333333;">属性。</font>

prototype属性的<font style="color:#FF0000;">作用</font>就是让该函数所实例化的对象们都可以找到公用的属性和方法，即f1.__proto__ ===Foo.prototype。

constructor属性的含义就是<font style="color:#FF0000;">指向该对象的构造函数</font>，所有函数（此时看成对象了）最终的构造函数都指向<font style="color:#FF0000;">Function</font>。

程序员能直接操作显式原型, 但不能直接操作隐式原型(ES6之前)

### 3、原型链
#### （1）. 原型链，别名: 隐式原型链(图解) 
__proto__属性的作用就是当访问一个对象的属性时，如果该对象内部不存在这个属性，那么就会去它的__proto__属性所指向的那个对象（父对象）里找，一直找，直到__proto__属性的终点null，再往上找就相当于在null上取值，会报错。通过__proto__属性将对象连接起来的这条链路即我们所谓的原型链。

* 作用: 查找对象的属性(方法)

<font style="color:#595959;">function Fn() {</font>

<font style="color:#595959;">  this.test1 = function () {</font>

<font style="color:#595959;">    console.log('test1()')</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">Fn.prototype.test2 = function () {</font>

<font style="color:#595959;">  console.log('test2()')</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">var fn = new Fn()</font>



<font style="color:#595959;">fn.test1()</font>

<font style="color:#595959;">fn.test2()</font>

<font style="color:#595959;">console.log(fn.toString())</font>

<font style="color:#595959;">fn.test3()//报错</font>

#### (2）. 构造函数/原型/实体对象的关系(图解)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697862182-8c36e2af-291f-48be-a579-0f366b88f1b5.png)

### 4、属性问题
（1）. 读取对象的属性值时: 会自动到原型链中查找

（2）. 设置对象的属性值时: 不会查找原型链, 如果当前对象中没有此属性, 直接添加此属性并设置其值

（3）. 方法一般定义在原型中, 属性一般通过构造函数定义在对象本身上

<font style="color:#595959;">function Person(name, age) {</font>

<font style="color:#595959;">  this.name = name;</font>

<font style="color:#595959;">  this.age = age;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">Person.prototype.setName = function (name) {</font>

<font style="color:#595959;">  this.name = name;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">Person.prototype.sex = '男';</font>



<font style="color:#595959;">var p1 = new Person('Tom', 12)</font>

<font style="color:#595959;">p1.setName('Jack')</font>

<font style="color:#595959;">console.log(p1.name, p1.age, p1.sex,111)</font>



<font style="color:#595959;">p1.sex = '女'</font>

<font style="color:#595959;">console.log(p1.name, p1.age, p1.sex,222)</font>

### 5、探索instanceof
#### 1. instanceof是如何判断的? 
* 表达式: A instanceof B 

* <font style="color:#FF0000;">如果B函数的显式原型对象在A对象的原型链上, 返回true, 否则返回false</font> 

#### 2. Function是通过new自己产生的实例
<font style="color:#595959;">//案例1</font>

<font style="color:#595959;">function Foo() {  }</font>

<font style="color:#595959;">var f1 = new Foo();</font>

<font style="color:#595959;">console.log(f1 instanceof Foo);//true</font>

<font style="color:#595959;">console.log(f1 instanceof Object);//true</font>



<font style="color:#595959;">//案例2</font>

<font style="color:#595959;">console.log(Object instanceof Function)//true</font>

<font style="color:#595959;">console.log(Object instanceof Object)//true</font>

<font style="color:#595959;">console.log(Function instanceof Object)//true</font>

<font style="color:#595959;">console.log(Function instanceof Function)//true</font>

<font style="color:#595959;">function Foo() {}</font>

<font style="color:#595959;">console.log(Object instanceof  Foo);//false</font>

<font style="color:#595959;">console.log(Foo instanceof Object);//true</font>

### 6、面试题
<font style="color:#595959;">var A = function () {};</font>



<font style="color:#595959;">A.prototype.n = 1;</font>

<font style="color:#595959;">var b = new A(); //b.n=1</font>

<font style="color:#595959;">A.prototype = {</font>

<font style="color:#595959;">  n: 2,</font>

<font style="color:#595959;">  m: 3,</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">var c = new A();</font>

<font style="color:#595959;">// console.log(b.__proto__,c.__proto__);//{n:1},{n:2,m:3}</font>

<font style="color:#595959;">console.log(A.prototype); //{n:2,m:3}</font>

<font style="color:#595959;">console.log(b.n, b.m, c.n, c.m);</font>

<font style="color:#595959;">// 1/undefined/2/3</font>

## （二）、执行上下文与执行上下文栈
### 1、变量提升与函数提升
#### （1）. 变量声明提升 
* 通过var定义(声明)的变量, 在定义语句之前就可以访问到

* 值: undefined

#### （2）. 函数声明提升 
* 通过function声明的函数, 在之前就可以直接调用

* 值: 函数定义(对象)

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  /*</font>

<font style="color:#595959;">   面试题: 输出什么?</font>

<font style="color:#595959;">   */</font>

<font style="color:#595959;">  var a = 4;</font>

<font style="color:#595959;">function fn() {</font>

<font style="color:#595959;">  console.log(a);</font>

<font style="color:#595959;">  var a = 5;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn(); // undefined</font>



<font style="color:#595959;">/*变量提升*/</font>

<font style="color:#595959;">console.log(a1); //可以访问, 但值是undefined</font>

<font style="color:#595959;">/*函数提升*/</font>

<font style="color:#595959;">a2(); // 可以直接调用</font>



<font style="color:#595959;">var a1 = 3;</font>

<font style="color:#595959;">function a2() {</font>

<font style="color:#595959;">  console.log("a2()");</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

#### （3）. 问题: 变量提升和函数提升是如何产生的?
理解下面的执行上下文

### 2、执行上下文
#### （1）. 代码分类(位置) 
* 全局代码

* 函数代码

#### （2）. 全局执行上下文 
* 在执行全局代码前将window确定为全局执行上下文

* 对全局数据进行预处理

* var定义的全局变量==>undefined, 添加为window的属性

* function声明的全局函数==>赋值(fun), 添加为window的方法

* this==>赋值(window) 

* 开始执行全局代码



<font style="color:#595959;"> console.log(a1);//undefined</font>

<font style="color:#595959;"> console.log(a2);//undefined</font>

<font style="color:#595959;">console.log(a3);//函数</font>

<font style="color:#595959;">// console.log(a4)</font>

<font style="color:#595959;">console.log(this);//window</font>



<font style="color:#595959;">var a1 = 3;</font>

<font style="color:#595959;">var a2 = function () {</font>

<font style="color:#595959;">  console.log("a2()");</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">function a3() {</font>

<font style="color:#595959;">  console.log("a3()");</font>

<font style="color:#595959;">}</font>

#### （3）. 函数执行上下文 
* 在调用函数, 准备执行函数体之前, 创建对应的函数执行上下文对象

* 对局部数据进行预处理

* 形参变量==>赋值(实参)==>添加为执行上下文的属性

* arguments==>赋值(实参列表), 添加为执行上下文的属性

* var定义的局部变量==>undefined, 添加为执行上下文的属性

* function声明的函数 ==>赋值(fun), 添加为执行上下文的方法

* this==>赋值(调用函数的对象) 

* 开始执行函数体代码

<font style="color:#595959;">function fn(x, y) {</font>

<font style="color:#595959;">  console.log(x, y); //undefined</font>

<font style="color:#595959;">  console.log(b1); //undefined</font>

<font style="color:#595959;">  console.log(b2); //函数</font>

<font style="color:#595959;">  console.log(arguments); //内容</font>

<font style="color:#595959;">  console.log(this); //window</font>

<font style="color:#595959;">  // console.log(b3)//报错</font>

<font style="color:#595959;">  var b1 = 5;</font>

<font style="color:#595959;">  function b2() {}</font>

<font style="color:#595959;">  b3 = 6;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn();</font>

### 3、执行上下文栈
1. 在全局代码执行前, JS引擎就会创建一个栈来存储管理所有的执行上下文对象

2. 在全局执行上下文(window)确定后, 将其添加到栈中(压栈) 

3. 在函数执行上下文创建后, 将其添加到栈中(压栈) 

4. 在当前函数执行完后,将栈顶的对象移除(出栈) 

5. 当所有的代码执行完后, 栈中只剩下window

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  //1. 进入全局执行上下文</font>

<font style="color:#595959;">  var a = 10;</font>

<font style="color:#595959;">var bar = function (x) {</font>

<font style="color:#595959;">  var b = 5;</font>

<font style="color:#595959;">  foo(x + b); //3. 进入foo执行上下文</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">var foo = function (y) {</font>

<font style="color:#595959;">  var c = 5;</font>

<font style="color:#595959;">  console.log(a + c + y);</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">bar(10); //2. 进入bar函数执行上下文</font>

<font style="color:#595959;"></script></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697862476-fd3090cd-d983-47dd-8c47-26dfc09202f0.png)

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!--</font>

<font style="color:#595959;">    1. 依次输出什么?  123 321 1</font>

<font style="color:#595959;">    2. 整个过程中产生了几个执行上下文?  5</font>

<font style="color:#595959;">    --></font>

<font style="color:#595959;">    <script type="text/javascript"></font>

<font style="color:#595959;">      console.log("global begin: " + i); //undefined</font>

<font style="color:#595959;">      var i = 1;</font>

<font style="color:#595959;">      foo(1);</font>

<font style="color:#595959;">      function foo(i) {</font>

<font style="color:#595959;">        if (i == 4) {</font>

<font style="color:#595959;">          return;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        console.log("foo() begin:" + i); //1，2，3</font>

<font style="color:#595959;">        foo(i + 1);</font>

<font style="color:#595959;">        console.log("foo() end:" + i); //3，2，1</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log("global end: " + i); //1</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 4、面试题
<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  /*</font>

<font style="color:#595959;">    测试题1: 先预处理变量, 后预处理函数</font>

<font style="color:#595959;">    */</font>

<font style="color:#595959;">  function a() {}</font>

<font style="color:#595959;">var a;</font>

<font style="color:#595959;">console.log(typeof a); //function</font>



<font style="color:#595959;">/*</font>

<font style="color:#595959;">    测试题2: 变量预处理, in操作符</font>

<font style="color:#595959;">    if语句中的var b 进行变量提升，所以b在window内，</font>

<font style="color:#595959;">    所以if判断中为false，不执行赋值语句，所以b为undefined</font>

<font style="color:#595959;">     */</font>

<font style="color:#595959;">if (!(b in window)) {</font>

<font style="color:#595959;">  var b = 1;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">console.log(b); //undefined</font>



<font style="color:#595959;">/*</font>

<font style="color:#595959;">    测试题3: 预处理, 顺序执行</font>

<font style="color:#595959;">     */</font>

<font style="color:#595959;">var c = 1;</font>

<font style="color:#595959;">function c(c) {</font>

<font style="color:#595959;">  console.log(c);</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">c(2); //报错</font>

<font style="color:#595959;">// 实际上的执行顺序如下</font>

<font style="color:#595959;">// var c;</font>

<font style="color:#595959;">// function c(c) {</font>

<font style="color:#595959;">//   console.log(c);</font>

<font style="color:#595959;">//   var c = 3;</font>

<font style="color:#595959;">// }</font>

<font style="color:#595959;">// c = 1;</font>

<font style="color:#595959;">// c(2); //报错</font>

<font style="color:#595959;"></script></font>

## （三）、作用域与作用域链
### 1、作用域
#### （1）. 理解
就是一块"地盘", 一个代码段所在的区域

它是静态的(相对于上下文对象), 在编写代码时就确定了

#### （2）. 分类
全局作用域

局部作用域

没有块作用域，其实就是大括号作用域(ES6有了) 

#### （3）. 作用
隔离变量，不同作用域下同名变量不会有冲突

<font style="color:#595959;">var a = 10,</font>

<font style="color:#595959;">  b = 20</font>

<font style="color:#595959;">function fn(x) {</font>

<font style="color:#595959;">  var a = 100,</font>

<font style="color:#595959;">    c = 300;</font>

<font style="color:#595959;">  console.log('fn()', a, b, c, x)//100，20，300，10</font>

<font style="color:#595959;">  function bar(x) {</font>

<font style="color:#595959;">    var a = 1000,</font>

<font style="color:#595959;">      d = 400</font>

<font style="color:#595959;">    console.log('bar()', a, b, c, d, x)</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  bar(100); //1000，20，300，400，100</font>

<font style="color:#595959;">  bar(200);//1000，20，300，400，200</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn(10)</font>

### 2、作用域与执行上下文
#### （1）. 区别1 
全局作用域之外，每个函数都会创建自己的作用域，作用域在函数定义时就已经确定了。而不是在函数调用时

全局执行上下文环境是在全局作用域确定之后, js代码马上执行之前创建

函数执行上下文环境是在调用函数时, 函数体代码执行之前创建

#### （2）. 区别2 
作用域是静态的, 只要函数定义好了就一直存在, 且不会再变化

上下文环境是动态的, 调用函数时创建, 函数调用结束时上下文环境就会被自动释放

#### （3）. 联系 
* 上下文环境(对象)是从属于所在的作用域

* 全局上下文环境==>全局作用域

* 函数上下文环境==>对应的函数使用域

### 3、作用域链
（1）. 理解 

多个上下级关系的作用域形成的链, 它的方向是<font style="color:#DF2A3F;">从下向上的(从内到外) </font>

查找变量时就是沿着作用域链来查找的

（2）. 查找一个变量的查找规则 

在当前作用域下的执行上下文中查找对应的属性, 如果有直接返回, 否则进入2 

在上一级作用域的执行上下文中查找对应的属性, 如果有直接返回, 否则进入3 

再次执行2的相同操作, 直到全局作用域, 如果还找不到就抛出找不到的异常

<font style="color:#595959;">var a = 2;</font>

<font style="color:#595959;">function fn1() {</font>

<font style="color:#595959;">  var b = 3;</font>

<font style="color:#595959;">  function fn2() {</font>

<font style="color:#595959;">    var c = 4;</font>

<font style="color:#595959;">    console.log(c);//4</font>

<font style="color:#595959;">    console.log(b);//3</font>

<font style="color:#595959;">    console.log(a);//2</font>

<font style="color:#595959;">    console.log(d);//报错</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  fn2();</font>

<font style="color:#595959;">}</font>

### 4、面试题
<font style="color:#595959;">//第一题</font>

<font style="color:#595959;">var x = 10;</font>

<font style="color:#595959;">function fn() {</font>

<font style="color:#595959;">  console.log(x);//10</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">function show(f) {</font>

<font style="color:#595959;">  var x = 20;</font>

<font style="color:#595959;">  f();</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">show(fn);</font>



<font style="color:#595959;">//第二题</font>

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  /*说说它们的输出情况*/</font>

<font style="color:#595959;">  var fn = function () {</font>

<font style="color:#595959;">  console.log(fn);</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">fn(); //函数</font>



<font style="color:#595959;">var obj = {</font>

<font style="color:#595959;">  fn2: function () {</font>

<font style="color:#595959;">    // 在自己身上找，找不到fn2,然后去全局找，也找不到所以报错</font>

<font style="color:#595959;">    console.log(fn2); //报错</font>

<font style="color:#595959;">    // 通过this在自己身上找，找到了fn2</font>

<font style="color:#595959;">    // console.log(this.fn2)//输出函数本身</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">obj.fn2();</font>

<font style="color:#595959;"></script></font>

## （四）、闭包
### 0、闭包引入
<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <button>测试1</button></font>

<font style="color:#595959;">  <button>测试2</button></font>

<font style="color:#595959;">  <button>测试3</button></font>

<font style="color:#595959;">  <!--需求: 点击某个按钮, 提示"点击的是第n个按钮"--></font>

<font style="color:#595959;">  <script type="text/javascript"></font>

<font style="color:#595959;">  var btns = document.getElementsByTagName("button");</font>

<font style="color:#595959;">//有问题</font>

<font style="color:#595959;">// for (var i = 0, length = btns.length; i < length; i++) {</font>

<font style="color:#595959;">//   btns[i].onclick = function () {</font>

<font style="color:#595959;">//     alert("第" + (i + 1) + "个");</font>

<font style="color:#595959;">//   };</font>

<font style="color:#595959;">// }</font>



<font style="color:#595959;">//解决一: 保存下标</font>

<font style="color:#595959;">/*for(var i=0,length=btns.length;i<length;i++) {</font>

<font style="color:#595959;">    var btn = btns[i]</font>

<font style="color:#595959;">    btn.index = i</font>

<font style="color:#595959;">    btn.onclick = function () {</font>

<font style="color:#595959;">      alert('第'+(this.index+1)+'个')</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }*/</font>



<font style="color:#595959;">//解决办法: 利用闭包</font>

<font style="color:#595959;">for (var i = 0, length = btns.length; i < length; i++) {</font>

<font style="color:#595959;">  (function (i) {</font>

<font style="color:#595959;">    //行参i</font>

<font style="color:#595959;">    var btn = btns[i];</font>

<font style="color:#595959;">    btn.onclick = function () {</font>

<font style="color:#595959;">      alert("第" + (i + 1) + "个");</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  })(i); //实参i</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;">  </body></font>

### 1、理解闭包
#### （1）. 如何产生闭包? 
* 当一个嵌套的内部(子)函数引用了嵌套的外部(父)函数的变量(函数)时, 外部函数调用 就产生了闭包

#### （2）. 闭包到底是什么? 
* 使用chrome调试查看

* 理解一: 闭包是嵌套的内部函数(绝大部分人) 

* 理解二: 包含被引用变量(函数)的对象(极少数人) 

* 注意: 闭包存在于嵌套的内部函数中

<font style="color:#595959;">function fn1 () {</font>

<font style="color:#595959;">  var a = 3</font>

<font style="color:#595959;">  function fn2 () {</font>

<font style="color:#595959;">    console.log(a)</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">  fn2()</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn1()</font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697862844-330fc901-6d2b-44be-9d53-28355688a41e.png)

#### （3）. 产生闭包的条件? 
函数嵌套

内部函数引用了外部函数的数据(变量/函数) 

调用了外部的函数

### 2、常见的闭包
#### （1）. 将函数作为另一个函数的返回值
<font style="color:#595959;">function fn1() {</font>

<font style="color:#595959;">  var a = 2</font>



<font style="color:#595959;">  function fn2() {</font>

<font style="color:#595959;">    a++</font>

<font style="color:#595959;">    console.log(a)</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  return fn2</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">var f = fn1()</font>

<font style="color:#595959;">f() // 3   </font>

<font style="color:#595959;">f() // 4</font>

当f()第二次执行的时候，a加1了，也就说明了：闭包里的数据没有消失，而是保存在了内存中。

如果没有闭包，代码执行完倒数第三行后，变量a就消失了。

上面的代码中，虽然调用了内部函数两次，但是，闭包对象只创建了一个。

也就是说，要看闭包对象创建了一个，就看：外部函数执行了几次（与内部函数执行几次无关）。

#### （2）. 将函数作为实参传递给另一个函数调用
<font style="color:#595959;">function showMsgDelay(msg, time) {</font>

<font style="color:#595959;">  setTimeout(function () {</font>

<font style="color:#595959;">    console.log(msg)</font>

<font style="color:#595959;">  }, time)</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">showMsgDelay('hello', 1000)</font>

<font style="color:#595959;">//上面的代码中，闭包是里面的function，因为它是嵌套的子函数，而且引用了外部函数的变量msg。</font>

### 3、闭包的作用
（1）. 使用函数内部的变量在函数执行完后, 仍然存活在内存中<font style="color:#FF0000;">(延长了局部变量的生命周期)</font> 

（2）. 让函数<font style="color:#FF0000;">外部</font>可以操作(<font style="color:#FF0000;">读写</font>)到函数<font style="color:#FF0000;">内部</font>的<font style="color:#FF0000;">数据</font>(变量/函数) 

问题: 

1. 函数执行完后, 函数内部声明的局部变量是否还存在? 

一般是不存在的，存在闭包中的变量才可能存在

2. 在函数外部能直接访问函数内部的局部变量吗? 

不能，但我们可以通过闭包让外部操作它

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  function fun1() {</font>

<font style="color:#595959;">    var a = 3;</font>



<font style="color:#595959;">    function fun2() {</font>

<font style="color:#595959;">      a++; //引用外部函数的变量--->产生闭包</font>

<font style="color:#595959;">      console.log(a);</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">    return fun2;</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">var f = fun1(); //由于f引用着内部的函数-->内部函数以及闭包都没有成为垃圾对象</font>



<font style="color:#595959;">f(); //间接操作了函数内部的局部变量</font>

<font style="color:#595959;">f();</font>

<font style="color:#595959;"></script></font>

### 4、闭包的生命周期
1. 产生: 在嵌套内部函数定义执行完时就产生了(不是在调用) 

2. 死亡: 在嵌套的内部函数成为垃圾对象时

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  function fun1() {</font>

<font style="color:#595959;">    //此处闭包已经产生</font>

<font style="color:#595959;">    var a = 3;</font>



<font style="color:#595959;">    function fun2() {</font>

<font style="color:#595959;">      a++;</font>

<font style="color:#595959;">      console.log(a);</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">    return fun2;</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">var f = fun1();</font>



<font style="color:#595959;">f();</font>

<font style="color:#595959;">f();</font>

<font style="color:#595959;">f = null; //此时闭包对象死亡</font>

<font style="color:#595959;"></script></font>

### 5、闭包的应用-自动移js模块 
* 创建具有特定功能的js文件

* 将所有的数据和功能都封装在一个函数内部(私有的) 

* 只向外暴露一个包信n个方法的对象或函数

* 模块的使用者, 只需要通过模块暴露的对象调用方法来实现对应的功能

<font style="color:#595959;">/**</font>

<font style="color:#595959;">    * 自定义模块1</font>

<font style="color:#595959;">    */</font>

<font style="color:#595959;">function coolModule() {</font>

<font style="color:#595959;">  //私有的数据</font>

<font style="color:#595959;">  var msg = 'bdqn'</font>

<font style="color:#595959;">  var names = ['I', 'Love', 'you']</font>



<font style="color:#595959;">  //私有的操作数据的函数</font>

<font style="color:#595959;">  function doSomething() {</font>

<font style="color:#595959;">    console.log(msg.toUpperCase())</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">  function doOtherthing() {</font>

<font style="color:#595959;">    console.log(names.join(' '))</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  //向外暴露包含多个方法的对象</font>

<font style="color:#595959;">  return {</font>

<font style="color:#595959;">    doSomething: doSomething,</font>

<font style="color:#595959;">    doOtherthing: doOtherthing</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"><script type="text/javascript" src="05_coolModule.js"></script></font>

<font style="color:#595959;">  <script type="text/javascript"></font>

<font style="color:#595959;">  var module = coolModule()</font>

<font style="color:#595959;">module.doSomething()</font>

<font style="color:#595959;">module.doOtherthing()</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;">  /**</font>

<font style="color:#595959;">    * 自定义模块2</font>

<font style="color:#595959;">    */</font>

<font style="color:#595959;">  (function (window) {</font>

<font style="color:#595959;">    //私有的数据</font>

<font style="color:#595959;">    var msg = 'bdqn'</font>

<font style="color:#595959;">    var names = ['I', 'Love', 'you']</font>

<font style="color:#595959;">    //操作数据的函数</font>

<font style="color:#595959;">    function a() {</font>

<font style="color:#595959;">      console.log(msg.toUpperCase())</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    function b() {</font>

<font style="color:#595959;">      console.log(names.join(' '))</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">    window.coolModule2 =  {</font>

<font style="color:#595959;">      doSomething: a,</font>

<font style="color:#595959;">      doOtherthing: b</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  })(window)</font>

<font style="color:#595959;">  <script type="text/javascript" src="05_coolModule2.js"></script></font>

<font style="color:#595959;">  <script type="text/javascript"></font>

<font style="color:#595959;">  coolModule2.doSomething()</font>

<font style="color:#595959;">coolModule2.doOtherthing()</font>

<font style="color:#595959;">  </script></font>

### 6、闭包的缺点
（1）. 缺点

* 函数执行完后, 函数内的局部变量没有释放<font style="color:#FF0000;">, 占用内存时间会变长</font>

* <font style="color:#FF0000;">容易</font>造成<font style="color:#FF0000;">内存泄露</font>

（2）. 解决

* 能不用闭包就不用

* 及时释放

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  function fn1() {</font>

<font style="color:#595959;">    var a = 2;</font>



<font style="color:#595959;">    function fn2() {</font>

<font style="color:#595959;">      a++;</font>

<font style="color:#595959;">      console.log(a);</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">    return fn2;</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">var f = fn1();</font>



<font style="color:#595959;">f(); // 3</font>

<font style="color:#595959;">f(); // 4</font>



<font style="color:#595959;">f = null // 释放</font>

<font style="color:#595959;">  </script></font>

### 7、闭包面试题
<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">      /*</font>

<font style="color:#595959;">   说说它们的输出情况</font>

<font style="color:#595959;">   */</font>



<font style="color:#595959;">      //代码片段一</font>

<font style="color:#595959;">      var name = "The Window";</font>

<font style="color:#595959;">      var object = {</font>

<font style="color:#595959;">        name: "My Object",</font>

<font style="color:#595959;">        getNameFunc: function () {</font>

<font style="color:#595959;">          return function () {</font>

<font style="color:#595959;">            return this.name;</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      console.log(object.getNameFunc()()); //The Window</font>



<font style="color:#595959;">      //代码片段二</font>

<font style="color:#595959;">      var name2 = "The Window";</font>

<font style="color:#595959;">      var object2 = {</font>

<font style="color:#595959;">        name2: "My Object",</font>

<font style="color:#595959;">        getNameFunc: function () {</font>

<font style="color:#595959;">          var that = this;</font>

<font style="color:#595959;">          return function () {</font>

<font style="color:#595959;">            return that.name2;</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      console.log(object2.getNameFunc()()); //My Object</font>

<font style="color:#595959;">    </script></font>

面试题：什么是闭包，有哪些缺点

一个函数(子函数)访问另一个函数(父函数)中的变量，外部函数调用，此时就有闭包产生，那么这个变

量所在的函酸我们就称之为闭包函数

优缺点: 优点：闭包的主要作用是延伸了变量的生命周期，可以让外部操作函数内部的变量

缺点：变量生命周期，可能会产生内存泄漏

如何解决:用完之后手动释放，尽量少用

### 8、内存溢出与内存泄露
#### 1. 内存溢出 
* 一种程序运行出现的错误

* 当程序运行需要的内存超过了剩余的内存时, 就出抛出内存溢出的错误

#### 2. 内存泄露 
* 占用的内存没有及时释放

* 内存泄露积累多了就容易导致内存溢出

* 常见的内存泄露: 

* 意外的全局变量

* 没有及时清理的计时器或回调函数

* 闭包

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  // 1. 内存溢出</font>

<font style="color:#595959;">  /*var obj = {}</font>

<font style="color:#595959;">    for (var i = 0; i < 100000; i++) {</font>

<font style="color:#595959;">      obj[i] = new Array(10000000)</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    console.log('------')*/</font>



<font style="color:#595959;">  // 2. 内存泄露</font>

<font style="color:#595959;">  // 意外的全局变量，变成了全局变量</font>

<font style="color:#595959;">  function fn() {</font>

<font style="color:#595959;">    a = []; //不小心没有var定义</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">fn();</font>

<font style="color:#595959;">// 没有及时清理的计时器</font>

<font style="color:#595959;">var iId = setInterval(function () {</font>

<font style="color:#595959;">  console.log("----");</font>

<font style="color:#595959;">}, 1000);</font>

<font style="color:#595959;">clearInterval(iId);</font>

<font style="color:#595959;"></script></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697863124-46221ad1-4f95-4f1a-bcc2-ff295bcdf820.png)

## （五）、递归
### 1、什么是递归函数?
递归是函数的高级用法，本质上是函数自已调用自已，它的行为非常类似循环

### 2、递归函数的特性
（1）. 重复执行

（2）.调用自身

（3）. 【必须】要有条件控制，避免死循环，如果递归函数没有条件控制,那么他就是死循环

递归本身是一种循环操作，简单情况下可以替换循环语句的使用

注意：递归慎用，能用循环解决的事情，尽量别用递归

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      // 递归函数 :在函数内部调用自己,通过条件控制避免死循环</font>

<font style="color:#595959;">      // 一直造成foo函数重复调用-- 死循环</font>

<font style="color:#595959;">      var i = 0;</font>

<font style="color:#595959;">      function foo() {</font>

<font style="color:#595959;">        if (i >= 3) return;//限制条件</font>

<font style="color:#595959;">        i++;</font>

<font style="color:#595959;">        console.log("递归函数");</font>

<font style="color:#595959;">        foo(); // 2.内部调用自己</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      foo(); // 1.外部调用</font>



<font style="color:#595959;">      // 递归三特性-- 重复执行 / 调用自身 / 条件控制避免死循环!</font>

<font style="color:#595959;">    </script></font>

### 3、递归函数常用案例
### （1）、利用递归函数求1-100的和
<font style="color:#595959;"><script></font>

<font style="color:#595959;">  // 利用递归函数求1-100的和</font>

<font style="color:#595959;">  let i = 0</font>

<font style="color:#595959;">let sum = 0</font>

<font style="color:#595959;">function getSum() {</font>

<font style="color:#595959;">  if (i >= 100) { return sum } // 后边只有一句话,可以省略大括号</font>

<font style="color:#595959;">  i++</font>

<font style="color:#595959;">  sum += i</font>

<font style="color:#595959;">  getSum()</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">getSum()</font>

<font style="color:#595959;">console.log(sum);</font>

<font style="color:#595959;"></script></font>

### (2)、斐波拉契数列
<font style="color:#595959;"><!-- 经典案例2：斐波拉契数列</font>

<font style="color:#595959;">        1，1，2，3，5，8，13，21，34，55，89...求第n项 --></font>

<font style="color:#595959;">        <script></font>

<font style="color:#595959;">          //递归方法</font>

<font style="color:#595959;">          function fib(n) {</font>

<font style="color:#595959;">            if (n === 1 || n === 2) return n;</font>

<font style="color:#595959;">            return fib(n - 1) + fib(n - 2);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">          console.log(fib(10)); //34</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">          //非递归方法</font>

<font style="color:#595959;">          function fib(n) {</font>

<font style="color:#595959;">            var a = 0;</font>

<font style="color:#595959;">            var b = 1;</font>

<font style="color:#595959;">            var c = a + b;</font>

<font style="color:#595959;">            for (var i = 3; i < n; i++) {</font>

<font style="color:#595959;">              a = b;</font>

<font style="color:#595959;">              b = c;</font>

<font style="color:#595959;">              c = a + b;</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">            return c;</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">          console.log(fib(10)); //34</font>

<font style="color:#595959;">        </script></font>

### （3）、爬楼梯
<font style="color:#595959;"><!-- 经典案例3：爬楼梯</font>

<font style="color:#595959;">JS递归假如楼梯有 n 个台阶，每次可以走 1 个或 2 个台阶，</font>

<font style="color:#595959;">请问走完这 n 个台阶有几种走法 --></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  function fun(n) {</font>

<font style="color:#595959;">    if (n == 1) return 1;</font>

<font style="color:#595959;">    if (n == 2) return 2;</font>

<font style="color:#595959;">    return fun(n - 1) + fun(n - 2);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">  </script></font>









## （一）、对象创建模式
#### 方式一: Object构造函数模式 
* 套路: 先创建空Object对象, 再动态添加属性/方法

* 适用场景: 起始时不确定对象内部数据

* 问题: 语句太多

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  /*</font>

<font style="color:#595959;">        一个人: name:"Tom", age: 12</font>

<font style="color:#595959;">         */</font>

<font style="color:#595959;">  var p = new Object()</font>

<font style="color:#595959;">p.name = 'Tom'</font>

<font style="color:#595959;">p.age = 12</font>

<font style="color:#595959;">p.setName = function (name) {</font>

<font style="color:#595959;">  this.name = name</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">p.setaAge = function (age) {</font>

<font style="color:#595959;">  this.age = age</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">console.log(p)</font>



<font style="color:#595959;">  </script></font>

#### 方式二: 对象字面量模式 
* 套路: 使用{}创建对象, 同时指定属性/方法

* 适用场景: 起始时对象内部数据是确定的

* 问题: 如果创建多个对象, 有重复代码

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  var p = {</font>

<font style="color:#595959;">  name: 'Tom',</font>

<font style="color:#595959;">  age: 23,</font>

<font style="color:#595959;">  setName: function (name) {</font>

<font style="color:#595959;">    this.name = name</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">console.log(p.name）</font>

<font style="color:#595959;">console.log(p.name, p.age)</font>



<font style="color:#595959;">var p2 = {</font>

<font style="color:#595959;">  name: 'BOB',</font>

<font style="color:#595959;">  age: 24,</font>

<font style="color:#595959;">  setName: function (name) {</font>

<font style="color:#595959;">    this.name = name</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">  </script></font>

#### 方式三: 工厂模式 
* 套路: 通过工厂函数动态创建对象并返回

* 适用场景: 需要创建多个对象

* 问题: 对象没有一个具体的类型, 都是Object类型

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  // 工厂函数: 返回一个需要的数据的函数</font>

<font style="color:#595959;">  function createPerson(name, age) {</font>

<font style="color:#595959;">    var p = {</font>

<font style="color:#595959;">      name: name,</font>

<font style="color:#595959;">      age: age,</font>

<font style="color:#595959;">      setName: function (name) {</font>

<font style="color:#595959;">        this.name = name</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    return p</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">var p1 = createPerson('Tom', 12)</font>

<font style="color:#595959;">var p2 = createPerson('JAck', 13)</font>

<font style="color:#595959;">console.log(p1)</font>

<font style="color:#595959;">console.log(p2)</font>

<font style="color:#595959;">  </script></font>

#### 方式四: 自定义构造函数模式 
* 套路: 自定义构造函数, 通过new创建对象

* 适用场景: 需要创建多个类型确定的对象

* 问题: 每个对象都有相同的数据, 浪费内存

<font style="color:#595959;"><script type="text/javascript"></font>



<font style="color:#595959;">  function Person(name, age) {</font>

<font style="color:#595959;">    this.name = name</font>

<font style="color:#595959;">    this.age = age</font>

<font style="color:#595959;">    this.setName = function (name) {</font>

<font style="color:#595959;">      this.name = name</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">var p1 = new Person('Tom', 12)</font>

<font style="color:#595959;">var p2 = new Person('Tom2', 13)</font>

<font style="color:#595959;">console.log(p1, p1 instanceof Person)</font>

<font style="color:#595959;">  </script></font>

#### 方式五: 构造函数+原型的组合模式 
* 套路: 自定义构造函数, 属性在函数中初始化, 方法添加到原型上

* 适用场景: 需要创建多个类型确定的对象

<font style="color:#595959;">function Person (name, age) {</font>

<font style="color:#595959;">  this.name = name</font>

<font style="color:#595959;">  this.age = age</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">Person.prototype.setName = function (name) {</font>

<font style="color:#595959;">  this.name = name</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">var p1 = new Person('Tom', 12)</font>

<font style="color:#595959;">var p2 = new Person('JAck', 23)</font>

<font style="color:#595959;">p1.setName('TOM3')</font>

<font style="color:#595959;">console.log(p1)</font>

#### 方式六：class创建
## （二）、继承模式
### 方式1: 原型链继承 
1. 套路

1. 定义父类型构造函数

2. 给父类型的原型添加方法

3. 定义子类型的构造函数

4. 创建父类型的实例对象赋值给子类型的原型

5. 将子类型原型的构造属性设置为子类型

6. 给子类型原型添加方法

7. 创建子类型的对象: 可以调用父类型的方法

2. 关键

1. 子类型的原型为父类型的一个实例对象

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  //1、定义父类型构造函数</font>

<font style="color:#595959;">  function Father() {</font>

<font style="color:#595959;">    this.superProp = "The super prop";</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">//2、给父类型的原型添加方法</font>

<font style="color:#595959;">Father.prototype.showFatherProp = function () {</font>

<font style="color:#595959;">  console.log(this.superProp);</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">// 3、定义子类型的构造函数</font>

<font style="color:#595959;">function Son() {</font>

<font style="color:#595959;">  this.SonProp = "The Son prop";</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">//4、 子类的原型为父类的实例***</font>

<font style="color:#595959;">Son.prototype = new Father();</font>





<font style="color:#595959;">//5、 修正Son.prototype.constructor为Son本身**</font>

<font style="color:#595959;">Son.prototype.constructor = Son;</font>

<font style="color:#595959;">//console.log(Son.prototype.constructor);</font>



<font style="color:#595959;">//6、在子类原型上可以添加自己的方法</font>

<font style="color:#595959;">Son.prototype.showSonProp = function () {</font>

<font style="color:#595959;">  console.log(this.SonProp);</font>

<font style="color:#595959;">};</font>



<font style="color:#595959;">//7、 创建子类型的实例</font>

<font style="color:#595959;">var s = new Son();</font>

<font style="color:#595959;">// 调用父类型的方法</font>

<font style="color:#595959;">s.showSonProp();</font>

<font style="color:#595959;">// 调用子类型的方法</font>

<font style="color:#595959;">s.showFatherProp();</font>

<font style="color:#595959;"></script></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697863408-a5179c62-0edb-470c-a600-e010b5f1dbdc.png)

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697863710-89f5748a-ef00-48a2-9f0f-7b10d0a86ea7.png)

### 方式2: 借用构造函数继承(假的)
1. 套路: 

1. 定义父类型构造函数

2. 定义子类型构造函数

3. 在子类型构造函数中调用父类型构造

2. 关键: 

1. 在子类型构造函数中通用call()调用父类型构造函数

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  // 1、定义父类构造函数</font>

<font style="color:#595959;">  function Person(name, age) {</font>

<font style="color:#595959;">    this.name = name;</font>

<font style="color:#595959;">    this.age = age;</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">// 2、定义子类构造函数</font>

<font style="color:#595959;">function Student(name, age, price) {</font>

<font style="color:#595959;">  //3、在子类型构造函数的内部调用父类型构造函数。</font>

<font style="color:#595959;">  Person.call(this, name, age);</font>

<font style="color:#595959;">  // this是Student的实例对象</font>

<font style="color:#595959;">  // console.log(this, "this");</font>



<font style="color:#595959;">  // 添加Student自己的属性</font>

<font style="color:#595959;">  this.price = price;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">// 4、可以使用父类的属性</font>

<font style="color:#595959;">var s = new Student("Tom", 20, 12000);</font>

<font style="color:#595959;">// console.log(s.name, s.age, s.price);</font>

<font style="color:#595959;"></script></font>

### 方式3: 原型链+借用构造函数的组合继承 
1. 利用原型链实现对父类型对象的方法继承

2. 利用call()借用父类型构建函数初始化相同属性

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">      // 1、定义父类构造函数</font>

<font style="color:#595959;">      function Person(name, age) {</font>

<font style="color:#595959;">        this.name = name;</font>

<font style="color:#595959;">        this.age = age;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      Person.prototype.setName = function (name) {</font>

<font style="color:#595959;">        this.name = name;</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //2、 定义子类构造函数</font>

<font style="color:#595959;">      function Student(name, age, price) {</font>

<font style="color:#595959;">        //3、得到父类型的属性</font>

<font style="color:#595959;">        Person.call(this, name, age);</font>

<font style="color:#595959;">        //3.1 添加子类自己的属性</font>

<font style="color:#595959;">        this.price = price;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 4、得到父类型的方法</font>

<font style="color:#595959;">      Student.prototype = new Person();</font>

<font style="color:#595959;">      // 5、修正constructor</font>

<font style="color:#595959;">      Student.prototype.constructor = Student;</font>

<font style="color:#595959;">      // 5.1 子类原型上自己的方法</font>

<font style="color:#595959;">      Student.prototype.setPrice = function (price) {</font>

<font style="color:#595959;">        this.price = price;</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 可以使用父类的属性和方法</font>

<font style="color:#595959;">      var s = new Student("Tom", 12, 10000);</font>

<font style="color:#595959;">      s.setPrice(11000);</font>

<font style="color:#595959;">      s.setName("Bob");</font>

<font style="color:#595959;">      console.log(s);</font>

<font style="color:#595959;">      console.log(s.constructor);</font>

<font style="color:#595959;">    </script></font>





## （一）、进程与线程
### 1. 进程（process）：
程序的一次执行, 它占有一片独有的内存空间，可以通过windows任务管理器查看进程

### 2. 线程（thread）：
是进程内的一个独立的执行单元， CPU的基本调度单位, 是程序执行的一个完整流程

### 3. 进程与线程
* 一个进程中一般<font style="color:#FF0000;">至少</font>有一个运行的线程: 主线程，进程启动后自动创建

* 一个进程中也可以同时运行多个线程, 我们会说程序是多线程运行的

* 一个进程内的数据可以供其中的多个线程直接共享

* 多个进程之间的数据是不能直接共享的

线程池：保存多个线程对象的容器，实现线程对象的反复利用

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697864038-82409755-23f6-430b-99bb-cc16296b80bd.png)

多进程运行：一应用程序可以同时启动多个实例运行

多线程：在一个进程内，同时有多个线程运行

### 4.比较单线程与多线程 
多线程

优点：能有效<font style="color:#FF0000;">提升CPU</font>的<font style="color:#FF0000;">利用率</font>

缺点：创建多线程开销/线程间切换开销/死锁与状态同步问题

单线程

优点：顺序变成<font style="color:#FF0000;">简单易懂</font>

缺点：效率低

### 5、js是单线程运行
但在H5中的web workers可以是多线程运行

### 6、浏览器运行是单进程还是多进程? 
* 有的是单进程

* firefox 

* 老版IE 

* 有的是多进程

* chrome 

* 新版IE

浏览器运行都是多线程运行的

## （二）、浏览器内核
### 1. 什么是浏览器内核? 
* 支持浏览器运行的最核心的程序

### 2. 不同的浏览器可能不太一样 
* Chrome, Safari: webkit 

* firefox: Gecko 

* IE: Trident 

* 360,搜狗等国内浏览器: Trident + webkit 

### 3. 内核由很多模块组成 
* html,css文档解析模块 : 负责页面文本的解析

* dom/css模块 : 负责dom/css在内存中的相关处理

* 布局和渲染模块 : 负责页面的布局和效果的绘制

* js引擎模块：负责js程序的编译与运行

* 定时器模块 : 负责定时器的管理

* 网络请求模块 : 负责服务器请求(常规/Ajax) 

* 事件响应模块 : 负责事件的管理

····

## （三）、js单线程执行
### 1、为什么js要用单线程模式, 而不用多线程模式? 
* JavaScript的单线程，<font style="color:#FF0000;">与它的用途有关</font>。

* 作为浏览器脚本语言，JavaScript的主要用途是与用户互动，以及操作DOM。

* 这决定了它只能是单线程，<font style="color:#FF0000;">否则会带来很复杂的同步问题</font>

### 2、代码的分类: 
* 初始化代码

* 回调代码

### 3、 js引擎执行代码的基本流程 
* 先执行初始化代码: 包含一些特别的代码

* 设置定时器

* 绑定监听

* 发送ajax请求

* 后面在某个时刻才会执行回调代码

### 4. 如何证明js执行是单线程的? 
* setTimeout()的回调函数是在主线程执行的

* 定时器回调函数只有在运行栈中的代码全部执行完后才有可能执行

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  setTimeout(function () {</font>

<font style="color:#595959;">    console.log('timeout 3')</font>

<font style="color:#595959;">  }, 3000)</font>



<font style="color:#595959;">setTimeout(function () {</font>

<font style="color:#595959;">  console.log('timeout 2')</font>

<font style="color:#595959;">  alert('2222')</font>

<font style="color:#595959;">}, 2000)</font>



<font style="color:#595959;">alert('提示...')//暂停当前住线程的执行，同时暂停计时，恢复程序后，继续计时</font>

<font style="color:#595959;">console.log('alert之后')</font>

<font style="color:#595959;">  </script></font>

## （四）、定时器
### 1. 定时器真是定时执行的吗? 
* 定时器并不能保证真正定时执行

* 一般会延迟一丁点(可以接受), 也有可能延迟很长时间(不能接受)

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  document.getElementById('btn').onclick = function () {</font>

<font style="color:#595959;">    var start = Date.now() </font>

<font style="color:#595959;">    console.log('启动定时器前')</font>

<font style="color:#595959;">    setTimeout(function () {</font>

<font style="color:#595959;">      console.log('定时器执行了: ', Date.now()-start)</font>

<font style="color:#595959;">    }, 100)</font>



<font style="color:#595959;">    //定时器启动之后做一个长时间的工作</font>

<font style="color:#595959;">    for (var i = 0; i < 1000000000; i++) {</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    console.log('完成长时间工作', Date.now()-start)</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;">  </body></font>

### 2. 定时器回调函数是在分线程执行的吗? 
* 在主线程执行的, js是单线程的

### 3. 定时器是如何实现的? 
* 事件循环模型

## （五）、事件循环模型
### 1. 所有代码分类 
* 初始化执行代码(<font style="color:#FF0000;">同步代码</font>):包含绑定dom事件监听, 设置定时器, 发送ajax请求的代码

* 回调执行代码(<font style="color:#FF0000;">异步代码</font>): 处理回调逻辑 dom事件，定时器，延时器 ajax,promise

### 2. js引擎执行代码的基本流程: 
* 初始化代码===>回调代码

<font style="color:#595959;"><script type="text/javascript"></font>

<font style="color:#595959;">  function fn1() {</font>

<font style="color:#595959;">    console.log('fn1()')</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">fn1()</font>



<font style="color:#595959;">document.getElementById('btn').onclick = function () {</font>

<font style="color:#595959;">  console.log('处理点击事件')</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">setTimeout(function () {</font>

<font style="color:#595959;">  console.log('到点了')</font>

<font style="color:#595959;">}, 2000)</font>



<font style="color:#595959;">function fn2() {</font>

<font style="color:#595959;">  console.log('fn2()')</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn2()</font>



<font style="color:#595959;">  </script></font>

### 3. 模型的2个重要组成部分: 
* 事件管理模块

* 回调队列

### 4. 模型的运转流程 
* 执行初始化代码, 将事件回调函数交给对应模块管理

* 当事件发生时, 管理模块会将回调函数及其数据添加到回调列队中

* 只有当初始化代码执行完后(可能要一定时间), 才会遍历读取回调队列中的回调函数执行

* 重要概念：

执行栈：execution stack 所有的代码都在此空间中执行

浏览器内核：browser core js引擎模块（在主线程处理）其他模块（在主/分线程处理）

任务队列（task queue）/消息队列（message queue）/事件队列（event loop） 同一个callback queue

事件轮询 (event loop）从任务队列中循环取出毁掉函数放入执行栈中处理（一个接一个）

事件驱动模型 ：下面的整张图的流程

请求响应模型 ：浏览器请求数据，服务器接受请求，处理请求，返回数据，浏览器展示数据

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697864424-47e99ada-a074-47fb-b465-42b2362115cd.png)

## （六）、H5 Web Workers 多线程
### 1、介绍
Web Workers是H5提供的一个js多线程解决方案

我们可以将一些大计算量的代码交给web worker运行而不冻结用户界面，但子线程完全受主线程控制，且不得操作DOM，所以，这个新标准并没有改变JS单线程的本质

### 2、使用
创建在分线程执行的js文件

在主线程中的js中发消息并设置回调

### 3、图解
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697864757-d3728dee-2c85-4c89-b957-cb6f03a53d42.png)

### 4、不足
不能跨域加载js

worker内代码不能访问DOM

不是每个浏览器都支持这个新特性

不会堵塞主线程，传给分线程额外运算，效率会慢一些





## 1、数据类型
数据分为基本数据类型(String, Number, Boolean, Null, Undefined，Symbol)和对象数据类型。

<font style="color:#F33232;">基本数据</font>类型的特点：直接存储在**<font style="color:#FF0000;">栈</font>**(stack)中的数据

<font style="color:#F33232;">引用数据</font>类型的特点：**<font style="color:#FF0000;">存</font>**储的是**<font style="color:#FF0000;">该对象</font>**在**<font style="color:#FF0000;">栈</font>**中**<font style="color:#FF0000;">引用</font>**，**<font style="color:#FF0000;">真实</font>**的**<font style="color:#FF0000;">数据存</font>**放在**<font style="color:#FF0000;">堆</font>**内存里

引用数据类型在栈中存储了指针，该指针指向堆中该实体的起始地址。当解释器寻找引用值时，会首先检索其在栈中的地址，取得地址后从堆中获得实体。

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697865036-8c91e67e-1954-4298-ae5a-dc9daf586675.png)

## 2、深浅拷贝的区别
深浅拷贝主要区别在复杂数据类型，对于基本数据类型，没有区别，改变拷贝的数据，都不会改变原数据

### 浅拷贝（shallow copy）：
浅拷贝只拷贝引用（地址值），当拷贝的新对象发生改变时，原对象也会发生相同的改变，也就是说，**<font style="color:#FF0000;">浅拷贝会影响原来的元素</font>**

### 深拷贝（deep copy）：
每一级的数据都会拷贝，拷贝后，**<font style="color:#FF0000;">两个对象拥有不同的地址</font>**，当拷贝出来的对象发生改变时，原对象内容不会改变，**<font style="color:#FF0000;">两者互不影响</font>**

## 3、实现浅拷贝
### （1）、直接赋值法：
<font style="color:#595959;">var arr = [1,2,3]</font>

<font style="color:#595959;">var newarr = arr;</font>

<font style="color:#595959;">newarr[1] = 5;</font>

<font style="color:#595959;">console.log(arr,newarr);//[1, 5, 3]，[1, 5, 3]</font>

### (2)、Object.assign()
Object.assign() 方法可以把任意多个的源对象自身的可枚举属性拷贝给目标对象，然后返回目标对象。但是 Object.assign()进行的是**<font style="color:#FF0000;">浅拷贝</font>**，**<font style="color:#FF0000;">拷贝</font>**的是**<font style="color:#FF0000;">对象</font>**的属性的**<font style="color:#FF0000;">引用</font>**，而不是对象本身。

Object.assign(target, ...sources)

+ target：目标对象，即接收源对象属性的对象。该对象会被修改并返回。
+ ...sources：一个或多个源对象，包含了要复制到目标对象的属性。可以传入多个源对象，用逗号分隔。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">  // 1.Object.assign()</font>

<font style="color:#595959;">  var obj = {</font>

<font style="color:#595959;">  name: "jack",</font>

<font style="color:#595959;">  age: 18,</font>

<font style="color:#595959;">  person: {</font>

<font style="color:#595959;">    name: "tim",</font>

<font style="color:#595959;">    age: 28,</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">//将{}和obj合并，返回一个新的obj对象</font>

**<font style="color:#FF0000;">var objNew = Object.assign({}, obj);</font>**

<font style="color:#595959;">objNew.name = "tom";//当object只有一层的时候，是深拷贝</font>

<font style="color:#595959;">objNew.person.name = "Diana";//当object只有一层的时候，是浅拷贝</font>

<font style="color:#595959;">console.log(obj, "obj");</font>

<font style="color:#595959;">console.log(objNew, "objNew");</font>

<font style="color:#595959;"></script></font>

### （3）、<font style="color:#4D4D4D;">Array.prototype.concat()</font>
<font style="color:#000000;">数组的concat方法 用途: 合并2个或多个数组，返回一个</font>**<font style="color:#FF0000;">浅拷贝对象</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">  //3、Array.prototype.concat()</font>

<font style="color:#595959;">  var arr2 = [1, "hello", { usename: "tom" }];</font>

<font style="color:#595959;">var arr3 = arr2.concat();</font>

<font style="color:#595959;">arr2[2].usename = "tim";</font>

<font style="color:#595959;">console.log(arr2[2].usename, "arr2"); //tim</font>

<font style="color:#595959;">console.log(arr3[2].usename, "arr3"); //tim</font>

<font style="color:#595959;"></script></font>

### <font style="color:#555666;">(4)</font>Array.prototype.slice()
slice(start, end); start为起始元素位置，end为截止元素位置，

<font style="color:#595959;">var arr4 = [1, "hello", { usename: "tom" }];</font>

<font style="color:#595959;">var arr5 = arr4.slice();</font>

<font style="color:#595959;">arr4[2].usename = "diana";</font>

<font style="color:#595959;">//console.log(arr4[2].usename, "arr4"); //diana</font>

<font style="color:#595959;">//console.log(arr5[2].usename, "arr5"); //diana</font>

**<font style="color:#FF0000;">深拷贝和浅拷贝是只针对Object和Array这样的引用数据类型的</font>**<font style="color:#F33232;">。</font>

对于字符串、数字及布尔值来说（不是 String、Number 或者 Boolean 对象），slice 会拷贝这些值到新的数组里。在别的数组里修改这些字符串或数字或是布尔值，将不会影响另一个数组。

## 4、实现深拷贝
### （1）、Object.assign()
<font style="color:#4D4D4D;">当对象中只有一级属性，没有二级属性的时候，此方法为深拷贝，但是对象中有对象的时候，此方法，在二级属性以后就是浅拷贝。</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">  //1、Object.assign();</font>

<font style="color:#595959;">  var obj = {</font>

<font style="color:#595959;">  //当object只有一层的时候，是深拷贝</font>

<font style="color:#595959;">  name: "jack",</font>

<font style="color:#595959;">  age: 18,</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">var objNew = Object.assign({}, obj);</font>

<font style="color:#595959;">objNew.name = "tom";</font>

<font style="color:#595959;">console.log(obj.name, "obj"); //jack</font>

<font style="color:#595959;">console.log(objNew.name, "objNew"); //tom</font>

<font style="color:#595959;"></script></font>

### （2）、<font style="color:#4D4D4D;">JSON.parse(JSON.stringify())</font>
原理：用JSON.stringify将对象转成JSON字符串，再用JSON.parse()把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝

**<font style="color:#FF0000;">注意：这种方法虽然可以实现数组或对象深拷贝,但不能处理函数</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">  var arr1 = [</font>

<font style="color:#595959;">  1,</font>

<font style="color:#595959;">  "hello",</font>

<font style="color:#595959;">  { usename: "tom" },</font>

<font style="color:#595959;">  function () {</font>

<font style="color:#595959;">    console.log(111);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">];</font>

<font style="color:#595959;">var arr2 = JSON.parse(JSON.stringify(arr1));</font>

<font style="color:#595959;">arr1[2].usename = "diana";</font>

<font style="color:#595959;">console.log(arr1[2].usename); //diana</font>

<font style="color:#595959;">console.log(arr2[2].usename); //tom</font>

<font style="color:#595959;">console.log(arr2[3]);//null</font>

<font style="color:#595959;"></script></font>

### （3）、<font style="color:#4D4D4D;">手写递归方法</font>
**<font style="color:#FF0000;">原理：遍历对象、数组直到里边都是基本数据类型，然后再去复制，就是深度拷贝</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">  function deepClone(oldData) {</font>

<font style="color:#595959;">    // 1、判断oldData的数据类型</font>

<font style="color:#595959;">    if (typeof oldData == "object" && oldData !== null) {</font>

<font style="color:#595959;">      // 3、再判断类型是否是数组，根据类型返回[],{}，开辟新的空间，放深拷贝数据</font>

<font style="color:#595959;">      var res = Array.isArray(oldData) ? [] : {};</font>

<font style="color:#595959;">      // 4、遍历数据，拿到属性，将属性值赋值给拷贝的数据</font>

<font style="color:#595959;">      for (var k in oldData) {</font>

<font style="color:#595959;">        // 5、判断这个k属性是否是oldData上自有的属性，原型链上的就不算了</font>

<font style="color:#595959;">        if (oldData.hasOwnProperty(k)) {</font>

<font style="color:#595959;">          // 6、对象有可能是嵌套对象，所以，需要递归再进行判断，一层层，直到拷贝了所有的数据</font>

<font style="color:#595959;">          res[k] = deepClone(oldData[k]);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      return res;</font>

<font style="color:#595959;">    } else {</font>

<font style="color:#595959;">      // 2、如果不是对象或数组，则返回原数据</font>

<font style="color:#595959;">      return oldData;</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">//  测试：</font>

<font style="color:#595959;">let obj = {</font>

<font style="color:#595959;">  name: "jack",</font>

<font style="color:#595959;">  age: 18,</font>

<font style="color:#595959;">  hobby: ["song", "run"],</font>

<font style="color:#595959;">  sayHi(msg) {</font>

<font style="color:#595959;">    console.log(msg);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">let newObj = deepClone(obj);</font>

<font style="color:#595959;">// obj.sayHi("hi");</font>

<font style="color:#595959;">// newObj.sayHi("hello");</font>

<font style="color:#595959;">newObj.name = "tom";</font>

<font style="color:#595959;">newObj.hobby = ["唱歌", "跑步"];</font>

<font style="color:#595959;">console.log(obj, "obj");</font>

<font style="color:#595959;">console.log(newObj, "newObj");</font>

<font style="color:#595959;"></script></font>

### （4）、通过jQuery的extend方法实现深拷贝
<font style="color:#595959;">var array = [1,2,3,4];</font>

<font style="color:#595959;">        var newArray = $.extend(true,[],array);</font>

### （5）、lodash函数库实现深拷贝
lodash很热门的函数库，提供了 lodash.cloneDeep()实现深拷贝





## 1、节流和防抖的目的：
都是为了<font style="color:#FF0000;">限制函数的执行频次</font>，以优化函数触发频率过高导致的响应速度跟不上触发频率，防止在短时间内频繁触发同一事件而出现延迟，假死或卡顿的现象

## 2、节流和防抖的区别：
防抖：如果不断在delay之前重新触发，那么定时器会不断重新计时，最终会在<font style="color:#FF0000;">最后一次完后才执行</font>

节流：目前有一事件A设置了定时器，那么在delay之前触发，都<font style="color:#FF0000;">只会触发一次</font>

## 3、节流和防抖的详解
### <font style="color:#FF0001;">（1）、防抖 debounce</font>（设置1分钟只会执行一次，如果1分钟内又多次触发，会从再次触发开始重新计算1分钟时间，然后再执行）
触发高频事件后n秒内函数只会执行一次，如果n秒内高频事件再次被触发，则重新计算时间

本质：将多次执行变为最后一次执行<font style="color:#FF0001;">(重新执行)</font>

举例：<font style="color:#000000;">比如我们平时在使用搜索框时，我们一输入内容就会发送对应的网络请求，如果我们后面一直有在输入内容，那么就会一直发送网络请求。正确的做法应该是在我们输入期间不发送网络请求，当我们输入完成后在发送网络请求。</font>

### <font style="color:#FF0001;">（2）、节流 throttle（</font>设置1分钟只会执行一次，一分钟内，多次触发无效，必须等1分钟后才能触发函数）
高频事件触发，但在n秒内只会执行一次，所以节流会稀释函数的执行频率

本质：将多次执行变成每隔一段时间执行<font style="color:#FF0001;">（不能打断我）</font>

举例：比如我们在玩LOL游戏时，当需要回城时，我们触发回城按钮，进入到回城状态进会有一个等待的时间，如果在这个等待时间内有重复去执行回城按钮，这时回城状态并不会做出其他响应，而是等时间到了后才会完成回城。这也说明了，在我们回城的过程中，一直触发回城按钮都是不会响应的，他会按照自己的一个回城时间才做出响应。

## 4、代码实现简单防抖与节流
### 4.1、防抖
#### （1）、简单版（掌握）
<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <!-- 防抖函数 debounce --></font>

<font style="color:#595959;">  <input type="text" name="" id="" /></font>



<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  var int = document.querySelector("input");</font>

<font style="color:#595959;">function inputChange() {</font>

<font style="color:#595959;">  console.log(this.value);</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">// 不加防抖函数，不断的输出</font>

<font style="color:#595959;">//int.addEventListener("keyup", inputChange);</font>



<font style="color:#595959;">//加入防抖函数，1秒钟输出一次</font>

<font style="color:#595959;">var intVal = debounce(inputChange, 1000);</font>

<font style="color:#595959;">int.addEventListener("keyup", intVal);</font>



<font style="color:#595959;">//防抖函数</font>

<font style="color:#595959;">function debounce(fn, delay) {</font>

<font style="color:#595959;">  // 1、定义一个定时器，保存上一次的定时器</font>

<font style="color:#595959;">  var timer = null;</font>

<font style="color:#595959;">  // 2、真正执行的函数</font>

<font style="color:#595959;">  var _debounce = function () {</font>

<font style="color:#595959;">    //3、 取消上一次的定时器</font>

<font style="color:#595959;">    if (timer) clearTimeout(timer);</font>

<font style="color:#595959;">    //4、 保存this</font>

<font style="color:#595959;">    var _this = this;</font>

<font style="color:#595959;">    //5、 延迟执行</font>

<font style="color:#595959;">    timer = setTimeout(function () {</font>

<font style="color:#595959;">      //6、 让fn执行时，指向input</font>

<font style="color:#595959;">      fn.call(_this);</font>

<font style="color:#595959;">    }, delay);</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">  return _debounce;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;">  </body></font>

#### （2）、this和参数实现（了解）
<font style="color:#595959;"><input type="text" name="" id="" /></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">    var int = document.querySelector("input");</font>

<font style="color:#595959;">    // 需求：输出输入的内容</font>

<font style="color:#595959;">    function inputChange() {</font>

<font style="color:#595959;">      console.log(this.value);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    // 不加防抖函数，不停的搜索</font>

<font style="color:#595959;">    // int.addEventListener("keyup", inputChange);</font>

<font style="color:#595959;">    // 加入防抖函数</font>

<font style="color:#595959;">    int.addEventListener("keyup", debounce(inputChange, 1000));</font>



<font style="color:#595959;">    //  防抖函数二：this和参数实现</font>



<font style="color:#595959;">    function debounce(fn, delay) {</font>

<font style="color:#595959;">      //console.log(this, "debounce"); //这里的this指向的是window</font>

<font style="color:#595959;">      // 1、定义一个定时器，保存上一次的定时器</font>

<font style="color:#595959;">      var timer = null;</font>

<font style="color:#595959;">      // 2、真正执行的函数,传入参数</font>

<font style="color:#595959;">      return function (...ages) {</font>

<font style="color:#595959;">        //3、保存this,此时的this指向的是input</font>

<font style="color:#595959;">        var _this = this;</font>

<font style="color:#595959;">        // 4、判断定时器是否存在，清楚定时器</font>

<font style="color:#595959;">        if (timer) clearTimeout(timer);</font>

<font style="color:#595959;">        // 重新调用setTimerout</font>

<font style="color:#595959;">        timer = setTimeout(function () {</font>

<font style="color:#595959;">          //console.log(this);//定时器里的this指向widow</font>

<font style="color:#595959;">          // fn()直接执行，this指向window</font>

<font style="color:#595959;">          fn.apply(_this, ages);</font>

<font style="color:#595959;">          timer = null;</font>

<font style="color:#595959;">        }, delay);</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;"></script></font>

#### （3）、立即执行（了解）
<font style="color:#595959;"><input type="text" name="" id="" value="你好" /></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  var int = document.querySelector("input");</font>

<font style="color:#595959;">// 需求：输出输入的内容</font>

<font style="color:#595959;">function inputChange() {</font>

<font style="color:#595959;">  console.log(this.value);</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">// 不加防抖函数，不停的搜索</font>

<font style="color:#595959;">// int.addEventListener("keyup", inputChange);</font>

<font style="color:#595959;">// 加入防抖函数</font>

<font style="color:#595959;">int.addEventListener("keyup", debounce(inputChange, 1000, true));</font>

<font style="color:#595959;">//  int.addEventListener("keyup", debounce(inputChange, 1000, false));</font>



<font style="color:#595959;">//  防抖函数三：立即执行</font>



<font style="color:#595959;">//创建一个防抖函数debounce</font>

<font style="color:#595959;">function debounce(fn, delay, immediate = false) {</font>

<font style="color:#595959;">  // 1.定义一个定时器, 保存上一次的定时器</font>

<font style="color:#595959;">  let timer = null;</font>

<font style="color:#595959;">  let isInvoke = false;</font>

<font style="color:#595959;">  // 2.真正执行的函数</font>

<font style="color:#595959;">  const _debounce = function (...ages) {</font>

<font style="color:#595959;">    // 取消上一次的定时器</font>

<font style="color:#595959;">    if (timer) clearTimeout(timer);</font>



<font style="color:#595959;">    // 判断是否需要立即执行</font>

<font style="color:#595959;">    if (immediate && !isInvoke) {</font>

<font style="color:#595959;">      fn.apply(this, ages);</font>

<font style="color:#595959;">      isInvoke = true;</font>

<font style="color:#595959;">    } else {</font>

<font style="color:#595959;">      // 延迟执行</font>

<font style="color:#595959;">      timer = setTimeout(() => {</font>

<font style="color:#595959;">        // 外部传入的真正要执行的函数</font>

<font style="color:#595959;">        fn.apply(this, ages);</font>

<font style="color:#595959;">        isInvoke = false;</font>

<font style="color:#595959;">      }, delay);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  };</font>



<font style="color:#595959;">  return _debounce;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 4.2、节流
### （1）、时间戳版
<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 需求：在快速点击的过程中，降低日志打印的频率，1s中执行一次 --></font>



<font style="color:#595959;">    <button>点我试试</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      var btn = document.querySelector("button");</font>

<font style="color:#595959;">      var fn = function () {</font>

<font style="color:#595959;">        console.log("发送请求");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 问题：快速点击按钮，只要点了一次，日志就打印一次</font>

<font style="color:#595959;">      // btn.addEventListener("click", fn);</font>

<font style="color:#595959;">      // 添加节流函数，在2s内，多次点击，只执行一次</font>

<font style="color:#595959;">      btn.addEventListener("click", throttle(fn, 2000));</font>





<font style="color:#595959;">      //参数：  fn 真正执行的函数，interval 多久执行一次</font>

<font style="color:#595959;">      function throttle(fn, interval) {</font>

<font style="color:#595959;">        // 1、记录上一次的开始时间</font>

<font style="color:#595959;">        var lastTime = 0;</font>

<font style="color:#595959;">        // 2、事件触发时，真正执行的函数</font>

<font style="color:#595959;">        var _throttle = function () {</font>

<font style="color:#595959;">          // 2.1获取当前事件触发时的时间</font>

<font style="color:#595959;">          var nowTime = new Date().getTime();</font>

<font style="color:#595959;">          // 2.2使用规定好的时间间隔减去当前时间和上一次触发时间的时间间隔，得到多少时间再次触发</font>

<font style="color:#595959;">          var remainTime = interval - (nowTime - lastTime);</font>

<font style="color:#595959;">          if (remainTime <= 0) {</font>

<font style="color:#595959;">            // 2.3触发真正函数</font>

<font style="color:#595959;">            fn();</font>

<font style="color:#595959;">            // 2.4 保留上次触发的时间</font>

<font style="color:#595959;">            lastTime = nowTime;</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">        return _throttle;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

### （2）、定时器版（掌握）
<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 需求：在快速点击的过程中，降低日志打印的频率，1s中执行一次 --></font>

<font style="color:#595959;">    <button>点我试试</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      var btn = document.querySelector("button");</font>

<font style="color:#595959;">      var fn = function () {</font>

<font style="color:#595959;">        console.log("发送请求");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 问题：快速点击按钮，只要点了一次，日志就打印一次</font>

<font style="color:#595959;">      // btn.addEventListener("click", fn);</font>

<font style="color:#595959;">      // 添加节流函数，在2s内，多次点击，只执行一次</font>

<font style="color:#595959;">      btn.addEventListener("click", throttle(fn, 2000));</font>



<font style="color:#595959;">      //参数：  fn 真正执行的函数，interval 多久执行一次</font>

<font style="color:#595959;">      // 定时器方式</font>

<font style="color:#595959;">      function throttle(fn, delay) {</font>

<font style="color:#595959;">        //1、设置标志，判断函数是否执行</font>

<font style="color:#595959;">        var sign = true;</font>

<font style="color:#595959;">        return function () {</font>

<font style="color:#595959;">          //2、 在函数开头判断标志是否为 true，不为 true 则中断函数</font>

<font style="color:#595959;">          if (!sign) return;</font>

<font style="color:#595959;">          //3、  sign 设置为 false，防止执行之前再被执行</font>

<font style="color:#595959;">          sign = false;</font>

<font style="color:#595959;">          //4、 保存this</font>

<font style="color:#595959;">          var _this = this;</font>

<font style="color:#595959;">          setTimeout(function () {</font>

<font style="color:#595959;">            //5、 this是当前被点击的dom元素，button</font>

<font style="color:#595959;">            fn.apply(_this, arguments);</font>

<font style="color:#595959;">            //6、 执行完事件之后，重新将这个标志设置为 true</font>

<font style="color:#595959;">            sign = true;</font>

<font style="color:#595959;">          }, delay);</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

5、节流的应用场景

防抖

表单元素的校验，如手机号，邮箱，用户名等，部分搜索功能的模糊查询结果实现

搜索框搜素输入

文本编辑器实时保存

节流

高频事件，例如快速点击、鼠标滑动、resize事件、scroll事件

下拉加载

视频播放记录时间等







## （一）、懒加载
### 1.什么是懒加载？
懒加载也就是延迟加载。当访问一个页面的时候，先把img元素或是其他元素的背景图片路径替换成一张大小为1*1px图片的路径（这样就只需请求一次，俗称**<font style="color:#FF0000;">占位图</font>**），只有当图片出现在浏览器的**<font style="color:#FF0000;">可视区域</font>**内时，才**<font style="color:#FF0000;">设置</font>**图片**<font style="color:#FF0000;">真正</font>**的**<font style="color:#FF0000;">路径</font>**，让图片显示出来。这就是图片懒加载。

### 2.为什么要使用懒加载？
很多页面，内容很丰富，页面很长，图片较多。比如说各种商城页面。这些页面图片数量多，而且比较大，少说百来K，多则上兆。要是页面载入就一次性加载完毕。估计大家都会等到黄花变成黄花菜了。

### 3.懒加载的优点是什么？
页面加载速度快、可以减轻服务器的压力、节约了流量,用户体验好

### 4.懒加载的原理是什么？
页面中的img元素，如果没有src属性，浏览器就不会发出请求去下载图片，只有通过javascript设置了图片路径，浏览器才会发送请求。

懒加载的原理就是先在页面中把所有的图片统一使用一张占位图进行占位，把**<font style="color:#FF0000;">真正的路径存在元素的</font>**“data-url”（这个名字起个自己认识好记的就行）**<font style="color:#FF0000;">属性</font>**里，要**<font style="color:#FF0000;">用</font>**的**<font style="color:#FF0000;">时</font>**候就**<font style="color:#FF0000;">取出</font>**来，再设置；

### 5.懒加载的实现步骤？
1）首先，不要将图片地址放到src属性中，而是放到其它属性(data-original)中。

2)页面加载完成后，判断图片是否在用户的视野内，如果在，则将data-original属性中的值取出存放到src属性中。

### 6、懒加载实现方式
html结构

1、 **<font style="color:#FF0000;">obj.getAttribute("属性名")</font>**通过元素节点的属性名称**<font style="color:#FF0000;">获取属性的值</font>**。

2、使用data-前缀设置我们需要的自定义属性,来进行一些数据的存放, **<font style="color:#FF0000;">dataset </font>**获取**<font style="color:#FF0000;">自定义属性值</font>**的使用

<font style="color:#595959;"><ul></font>

<font style="color:#595959;">    <li></font>

<font style="color:#595959;">      <img data-src="./img/img1.gif" src="./img/loading.gif" alt="" /></font>

<font style="color:#595959;">    </li></font>

<font style="color:#595959;">    <li></font>

<font style="color:#595959;">      <img data-src="./img/img2.gif" src="./img/loading.gif" alt="" /></font>

<font style="color:#595959;">    </li></font>

<font style="color:#595959;">    <li></font>

<font style="color:#595959;">      <img data-src="./img/img3.gif" src="./img/loading.gif" alt="" /></font>

<font style="color:#595959;">    </li></font>

<font style="color:#595959;">    <li></font>

<font style="color:#595959;">      <img data-src="./img/img4.gif" src="./img/loading.gif" alt="" /></font>

<font style="color:#595959;">    </li></font>

<font style="color:#595959;">    <li></font>

<font style="color:#595959;">      <img data-src="./img/img5.png" src="./img/loading.gif" alt="" /></font>

<font style="color:#595959;">    </li></font>

<font style="color:#595959;">  </ul></font>

#### 第一种
**<font style="color:#FF0000;">元素距顶部的高度 - 页面被卷去的高度 <= 浏览器可视区的高度</font>**

来判断是否符合我们想要的条件.需要实时监听页面滚动时 图片的高度变化

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697865369-191e470e-b36a-4112-ad6a-a580912ba2e2.png)

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        window.onload = function () {</font>

<font style="color:#595959;">          var imgs = document.querySelectorAll("img");</font>

<font style="color:#595959;">          // 初始化执行</font>

<font style="color:#595959;">          lazyLoad(imgs);</font>

<font style="color:#595959;">          // 滚动执行</font>

<font style="color:#595959;">          window.addEventListener("scroll", function () {</font>

<font style="color:#595959;">            lazyLoad(imgs);</font>

<font style="color:#595959;">          });</font>

<font style="color:#595959;">  </font>

<font style="color:#595959;">          function lazyLoad(imgs) {</font>

<font style="color:#595959;">            for (let i = 0; i < imgs.length; i++) {</font>

<font style="color:#595959;">              var imgoffsetT = imgs[i].offsetTop; // 图片的距顶部的高度</font>

<font style="color:#595959;">              var wheight = window.innerHeight; // 浏览器可视区的高度</font>

<font style="color:#595959;">              var scrollT = document.documentElement.scrollTop; // 页面被卷去的高度</font>

<font style="color:#595959;">              if (imgoffsetT - scrollT <= wheight) {</font>

<font style="color:#595959;">                // 判断图片是否将要出现</font>

<font style="color:#595959;">                imgs[i].src = imgs[i].dataset.src; // 出现后将自定义地址转为真实地址</font>

<font style="color:#595959;">              }</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      </script></font>

#### 第二种
**<font style="color:#FF0000;">getBoundingClientRect()</font>**

——获取元素位置，这个方法没有参数

——**<font style="color:#FF0000;">用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置</font>**。

——是DOM元素到浏览器可视范围的距离（不包含文档卷起的部分）。

该函数**<font style="color:#FF0000;">返回</font>**一个Object**<font style="color:#FF0000;">对象</font>**，该对象有6个属性：top,lef,right,bottom,width,height；

<font style="color:#595959;">window.onload = function () {</font>

<font style="color:#595959;">  var imgs = document.querySelectorAll("img");</font>

<font style="color:#595959;">  // 初始调动一次</font>

<font style="color:#595959;">  lazyLoad();</font>

<font style="color:#595959;">  // 监听滚动时，再调用函数</font>

<font style="color:#595959;">  window.addEventListener("scroll", throttle(lazyLoad, 1000), false);</font>





<font style="color:#595959;">  //函数1:封装判定图片是否在可视区</font>

<font style="color:#595959;">  function isInVisibleArea(imgOne) {</font>

<font style="color:#595959;">    const info = imgOne.getBoundingClientRect();</font>

<font style="color:#595959;">    //  获取页面可视区的高度，宽度</font>

<font style="color:#595959;">    let windowH = window.innerHeight;</font>

<font style="color:#595959;">    let windowW = window.innerWidth;</font>

<font style="color:#595959;">    // 限定参数在可视区内</font>

<font style="color:#595959;">    let res = info.bottom > 0 && info.top < windowH && info.right > 0 && info.left < windowW;</font>

<font style="color:#595959;">    return res;</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  //函数2: 封装滚动时重新加载函数</font>

<font style="color:#595959;">  function lazyLoad() {</font>

<font style="color:#595959;">    for (let i = 0; i < imgs.length; i++) {</font>

<font style="color:#595959;">      const imgOne = imgs[i];</font>

<font style="color:#595959;">      // 判定是否在可视区内</font>

<font style="color:#595959;">      if (isInVisibleArea(imgOne)) {</font>

<font style="color:#595959;">        // 替换src方法一：</font>

<font style="color:#595959;">        // imgOne.src = imgOne.getAttribute("data-src");</font>

<font style="color:#595959;">        // 替换src方法二：</font>

<font style="color:#595959;">        imgOne.src = imgOne.dataset.src;</font>

<font style="color:#595959;">        // imgs.splice(i,1)</font>

<font style="color:#595959;">        // i--;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log("我滚了"); //滚动就出发，要做节流操作</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  //函数3:节流函数</font>

<font style="color:#595959;">  function throttle(fn, time = 250) {</font>

<font style="color:#595959;">    let lastTime = null;</font>

<font style="color:#595959;">    return function (...args) {</font>

<font style="color:#595959;">      const now = Date.now(); //当前时间</font>

<font style="color:#595959;">      if (now - lastTime >= time) {</font>

<font style="color:#595959;">        fn(); //帮助执行函数，改变上下文</font>

<font style="color:#595959;">        lastTime = now;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">};</font>

#### 第三种
**<font style="color:#FF0000;">IntersectionObserver(callback) </font>**

**<font style="color:#FF0000;">callback函数会触发两次，元素进入视窗（开始可见时）和元素离开视窗（开始不可见时）都会触发</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        const imgs = document.querySelectorAll("img");</font>

<font style="color:#595959;">        var callback = function (res) {</font>

<font style="color:#595959;">          //res 是观察的元素数组   info 每个被观察的图片信息</font>

<font style="color:#595959;">          res.forEach(function (info) {</font>

<font style="color:#595959;">            //  isIntersecting 目标是否被观察到，返回布尔值</font>

<font style="color:#595959;">            if (info.isIntersecting) {</font>

<font style="color:#595959;">              // img 就是当前的图片标签</font>

<font style="color:#595959;">              const img = info.target;</font>

<font style="color:#595959;">              img.src = img.getAttribute("data-src");</font>

<font style="color:#595959;">              // 真实地址替换后 取消对它的观察</font>

<font style="color:#595959;">              obs.unobserve(img);</font>

<font style="color:#595959;">             // console.log("触发");</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          });</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">  </font>

<font style="color:#595959;">        // 实例化 IntersectionObserver</font>

<font style="color:#595959;">        const obs = new IntersectionObserver(callback);</font>

<font style="color:#595959;">        // 遍历imgs所有的图片，然后给每个图片添加观察实例</font>

<font style="color:#595959;">        imgs.forEach(function (img) {</font>

<font style="color:#595959;">          //  observe : 被调用的IntersectionObserver实例。给每个图片添加观察实例</font>

<font style="color:#595959;">          obs.observe(img);</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      </script></font>

![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1741697865632-717e8a24-e575-4f7c-bb2f-ea18634ac47a.webp)

## （二）、预加载
### 1.什么是预加载
资源预加载是另一个性能优化技术，我们可以使用该技术来预先告知浏览器某些资源可能在将来会被使用到。预加载简单来说就是将所有**<font style="color:#FF0000;">所需的资源提前请求加载到本地</font>**，这样后面在需要用到时就直接从缓存取资源。

### 2.为什么要用预加载
在网页全部加载之前，对一些主要内容进行加载，以提供给用户更好的体验，减少等待的时间。否则，如果一个页面的内容过于庞大，没有使用预加载技术的页面就会长时间的展现为一片空白，直到所有内容加载完毕。

### 3、预加载实现方式
html结构

<font style="color:#595959;"><!-- 需求：实现点击图片，切换下一张图片 --></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">      <p></p></font>

<font style="color:#595959;">      <img src="./img/img1.gif" alt="" /></font>

<font style="color:#595959;">    </div></font>

js实现

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      const imgs = ["./img/img2.gif", "./img/img3.gif", "./img/img4.gif", "./img/img5.png"];</font>

<font style="color:#595959;">      const img = document.querySelector("img");</font>

<font style="color:#595959;">      const test = document.querySelector("p");</font>

<font style="color:#595959;">      //实现点击切换下一张图片</font>

<font style="color:#595959;">      let index = 0;</font>

<font style="color:#595959;">      test.innerHTML = "我是第" + (index + 1) + "张图片";</font>

<font style="color:#595959;">      img.addEventListener("click", function () {</font>

<font style="color:#595959;">        if (index < imgs.length) {</font>

<font style="color:#595959;">          img.src = imgs[index];</font>

<font style="color:#595959;">          index++;</font>

<font style="color:#595959;">          test.innerHTML = "我是第" + (index + 1) + "张图片";</font>

<font style="color:#595959;">        }else{</font>

<font style="color:#595959;">          alert('没有了')</font>

<font style="color:#595959;">        }</font>



<font style="color:#595959;">        // 切换图片后，同时让浏览器提前加载下载一张图片</font>

<font style="color:#595959;">        if (index < imgs.length) {</font>

<font style="color:#595959;">          preLoad(imgs[index]);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // 调用加载函数，页面一开始就加载数组第一个元素</font>

<font style="color:#595959;">      preLoad(imgs[0]);</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      // 封装函数，新建一个img标签，然后增加src属性，让浏览器加载下一张图片</font>

<font style="color:#595959;">      function preLoad(src) {</font>

<font style="color:#595959;">        img.addEventListener("load", () => {</font>

<font style="color:#595959;">          // 创建一个新的img标签</font>

<font style="color:#595959;">          const img = document.createElement("img");</font>

<font style="color:#595959;">          // 给img添加src属性，为我们传进来的src</font>

<font style="color:#595959;">          img.src = src;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>







## （一）、ajax简介及相关知识
### 1、原生ajax
#### 1.1、AJAX 简介
AJAX 全称为 Asynchronous JavaScript And XML，就是异步的 JS 和 XML。 通过 AJAX 可以在浏览器中向服务器发送异步请求，最大的优势：<font style="color:#FF0001;">无刷新获取数据。按需请求，可以提高网站的性能</font>

AJAX 不是新的编程语言，而是一种将现有的标准组合在一起使用的新方式。

使用场景：

注册账号，核对输入是否符合设置要求，发送ajax请求，返回相关信息

京东、淘宝下拉加载更多的数据显示

鼠标移入，显示新的页面数据

鼠标点击，显示不同的页面切换数据

··············

#### 1.2 XML 简介 
XML 可扩展标记语言。 XML 被设计用来传输和存储数据。 XML 和 HTML 类似，不同的是 HTML 中都是预定义标签，而 XML 中没有预定义标签， 全都是自定义标签，用来表示一些数据。

<font style="color:#000000;">比如说我有一个学生数据：</font>

<font style="color:#000000;">name = "孙悟空" ; age = 18 ; gender = "男" ; </font>

<font style="color:#000000;">用 XML 表示： </font>

<font style="color:#000000;"><student> </font>

<font style="color:#000000;"><name>孙悟空</name> </font>

<font style="color:#000000;"><age>18</age> </font>

<font style="color:#000000;"><gender>男</gender> </font>

<font style="color:#000000;"></student> </font>

<font style="color:#FF0001;">现在已经被 JSON 取代了。 </font>

<font style="color:#000000;">用 JSON 表示： </font>

<font style="color:#000000;">{"name":"孙悟空","age":18,"gender":"男"} </font>

#### <font style="color:#000000;">1.3 AJAX 的特点 </font>
##### <font style="color:#000000;">1.3.1 AJAX 的优点 </font>
<font style="color:#000000;">1) 可以</font><font style="color:#FF0001;">无需刷新页面</font><font style="color:#000000;">而</font><font style="color:#FF0001;">与服务器</font><font style="color:#000000;">端进行</font><font style="color:#FF0001;">通信</font><font style="color:#000000;">。 速度很快</font>

<font style="color:#000000;">2) 允许你</font><font style="color:#FF0001;">根据</font><font style="color:#000000;">用户</font><font style="color:#FF0001;">事件</font><font style="color:#000000;">来</font><font style="color:#FF0001;">更新部分页面</font><font style="color:#000000;">内容。 按需更新，鼠标移入请求数据，鼠标点击请求数据</font>

##### <font style="color:#000000;">1.3.2 AJAX 的缺点 </font>
<font style="color:#000000;">1) 没有浏览历史，不能回退 </font>

<font style="color:#000000;">2) 存在跨域问题(同源) </font>

<font style="color:#000000;">3) SEO 不友好</font>

### <font style="color:#000000;">2、HTTP</font>
HTTP（hypertext transport protocol）协议『超文本传输协议』，协议详细规定了浏览器和万维网服务器之间<font style="color:#FF0001;">互相通信的规则</font>。（<font style="color:#FF0001;">约定</font>, 规则）

#### 2.1、请求报文 （重点关注格式与参数）
请求行 ：请求类型 url路径部分 请求版本)

POST /s?ie=utf-8 HTTP/1.1

名字: 值

请求头 Host: bdqn.com

Cookie: name=bdqn

Content-type: application/x-www-form-urlencoded /请求类型

User-Agent: chrome 83

请求空行 

请求体 <font style="color:#FF0001;">get请求，请求体为空， post请求体可以不为空</font>

username=admin&password=admin

```

#### 2.2、响应报文 response
响应行 协议版本 响应状态码

HTTP/1.1 200 OK

响应头 

Content-Type: text/html;charset=utf-8 //响应类型描述

Content-length: 2048 //响应长度

Content-encoding: gzip //压缩方式

响应空行 

响应体 <font style="color:#FF0001;">返回的结果</font>

<html>

<head>

</head>

<body>

<h1>hello world</h1>

</body>

</html>

#### <font style="color:#000000;">2.3、常用状态码</font>
```

* 404 找不到

* 403 被禁止

* 401 未授权

* 500 错误

* 200 正确ok

#### 2.4、网站查看
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697865952-a5ee9e37-118b-4843-b823-831fbb3e50ad.png)

### 3、node.js安装
[https://nodejs.org/en](https://nodejs.org/en" \t "_blank) 安装网址

检测是否安装

在开始的位置点开，输入cmd，点击命令提示符，在窗体里，输入node -v，出现版本信息

### 4、express框架
ajax发送请求，需要一个服务端，所以简单学习express

打开终端：

npm init --yes 初始化

npm i express 安装express

npm list express 查看版本

创建express.js文件，完成基本配置

<font style="color:#595959;">//1. 引入express</font>

<font style="color:#595959;">const express = require('express');</font>



<font style="color:#595959;">//2. 创建应用对象</font>

<font style="color:#595959;">const app = express();</font>



<font style="color:#595959;">//3. 创建路由规则</font>

<font style="color:#595959;">// request 是对请求报文的封装</font>

<font style="color:#595959;">// response 是对响应报文的封装</font>

<font style="color:#595959;">app.get('/', (request, response)=>{</font>

<font style="color:#595959;">  //设置响应</font>

<font style="color:#595959;">  response.send('HELLO EXPRESS');</font>

<font style="color:#595959;">});</font>



<font style="color:#595959;">//4. 监听端口启动服务</font>

<font style="color:#595959;">app.listen(8000, ()=>{</font>

<font style="color:#595959;">  console.log("服务已经启动, 8000 端口监听中....");</font>

<font style="color:#595959;">});</font>

启动express

在终端输入： node 文件名 如：node express基本使用.js

在浏览器地址栏：[http://127.0.0.1:8000/](http://127.0.0.1:8000/" \t "_blank)，可以显示响应文本

释放8000窗口，ctrl+C

#### （4）、nodemon安装
可以帮助自动重启express后台服务器

[https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon" \t "_blank)

npm install -g nodemon

安装完毕，重启severs.js

启动命令

nodemon severs.js

## （二）、原生ajax实现
### 1、页面及服务器准备
#### （1）、页面准备
需求：点击按钮，发送请求，将响应体结果返回在div中

<font style="color:#595959;"><button>点击发送请求</button></font>

<font style="color:#595959;">  <div id="result"></div></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697866261-526e3bf0-1e4d-4e84-9579-5bddeb425bb6.png)

#### （2）、服务器准备
新建server.js文件

<font style="color:#595959;">//1. 引入express</font>

<font style="color:#595959;">const express = require("express");</font>



<font style="color:#595959;">//2. 创建应用对象</font>

<font style="color:#595959;">const app = express();</font>



<font style="color:#595959;">//3. 创建路由规则</font>

<font style="color:#595959;">// server 请求行的url有/server，就回执行对应函数</font>

<font style="color:#595959;">app.get("/server", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头  设置允许跨域</font>

<font style="color:#595959;">  //Access-Control-Allow-Origin  响应头名字</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  //设置响应体</font>

<font style="color:#595959;">  response.send("你好，ajax");</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;">//4. 监听端口启动服务</font>

<font style="color:#595959;">app.listen(8000, () => {</font>

<font style="color:#595959;">  console.log("服务已经启动, 8000 端口监听中....");</font>

<font style="color:#595959;">});</font>



### 2、ajax基本请求
#### （1）、get请求
<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <button>点击发送请求</button></font>

<font style="color:#595959;">    <div id="result"></div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      //获取button元素</font>

<font style="color:#595959;">      const btn = document.querySelector("button");</font>

<font style="color:#595959;">      const result = document.getElementById("result");</font>

<font style="color:#595959;">      //绑定事件</font>

<font style="color:#595959;">      btn.onclick = function () {</font>

<font style="color:#595959;">        //1. 创建对象</font>

<font style="color:#595959;">        const xhr = new XMLHttpRequest();</font>

<font style="color:#595959;">        //2. 初始化 设置请求方法和 url   可以加参数</font>

<font style="color:#595959;">        xhr.open("GET", "http://127.0.0.1:8000/server?a=100&b=200&c=300");</font>

<font style="color:#595959;">        //3. 发送</font>

<font style="color:#595959;">        xhr.send();</font>

<font style="color:#595959;">        //4. 事件绑定 处理服务端返回的结果</font>

<font style="color:#595959;">        // on   当....时候</font>

<font style="color:#595959;">        // readystate 是 xhr 对象中的属性, 表示状态 0 1 2 3 4</font>

<font style="color:#595959;">        // 0 表示初始化，1表示open()发送完毕 2 表示send()发送完毕  3 服务端返回部分结果  4 服务端返回所有的结果 </font>

<font style="color:#595959;">        // change  改变</font>

<font style="color:#595959;">        xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">          //判断 (服务端返回了所有的结果)</font>

<font style="color:#595959;">          if (xhr.readyState === 4) {</font>

<font style="color:#595959;">            //判断响应状态码 200  404  403 401 500</font>

<font style="color:#595959;">            // 2xx 成功</font>

<font style="color:#595959;">            if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">              //处理结果  行 头 空行 体</font>

<font style="color:#595959;">              //响应行 </font>

<font style="color:#595959;">              // console.log(xhr.status);//状态码</font>

<font style="color:#595959;">              // console.log(xhr.statusText);//状态字符串</font>

<font style="color:#595959;">              // console.log(xhr.getAllResponseHeaders());//所有响应头</font>

<font style="color:#595959;">              // console.log(xhr.response);//响应体</font>

<font style="color:#595959;">              //设置 result 的文本</font>

<font style="color:#595959;">              result.innerHTML = xhr.response;</font>

<font style="color:#595959;">            } else {</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### （2）、post请求
<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <div id="result"></div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      //获取元素对象</font>

<font style="color:#595959;">      const result = document.getElementById("result");</font>

<font style="color:#595959;">      //绑定事件</font>

<font style="color:#595959;">      result.addEventListener("mouseover", function () {</font>

<font style="color:#595959;">        //1. 创建对象</font>

<font style="color:#595959;">        const xhr = new XMLHttpRequest();</font>

<font style="color:#595959;">        //2. 初始化 设置类型与 URL</font>

<font style="color:#595959;">        xhr.open("POST", "http://127.0.0.1:8000/server");</font>



<font style="color:#595959;">        //5、 设置请求头  xhr.setRequestHeader("头的名字", "头的值");</font>

<font style="color:#595959;">        // 用于做用户身份的校验</font>

<font style="color:#595959;">        //  Content-Type 设置请求体内容类型</font>

<font style="color:#595959;">        //  application/x-www-form-urlencoded  参数查询字符串类型，固定写法</font>

<font style="color:#595959;">        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");</font>

<font style="color:#595959;">        //6、 自定义请求头信息，这个自定义的请求头，需要在server.js中设置所有头信息，都能接受</font>

<font style="color:#595959;">        xhr.setRequestHeader("name", "bdqn");</font>



<font style="color:#595959;">        //3. 发送  可以传递参数，设置请求体</font>

<font style="color:#595959;">        xhr.send("a=100&b=200&c=300");</font>

<font style="color:#595959;">        // xhr.send('a:100&b:200&c:300');</font>

<font style="color:#595959;">        // xhr.send('1233211234567');</font>



<font style="color:#595959;">        //4. 事件绑定</font>

<font style="color:#595959;">        xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">          //判断</font>

<font style="color:#595959;">          if (xhr.readyState === 4) {</font>

<font style="color:#595959;">            if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">              //处理服务端返回的结果</font>

<font style="color:#595959;">              result.innerHTML = xhr.response;</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

server.js

<font style="color:#595959;"><script></font>

<font style="color:#595959;">    //可以接收任意类型的请求</font>

<font style="color:#595959;">    app.all("/server", (request, response) => {</font>

<font style="color:#595959;">      //设置响应头  设置允许跨域</font>

<font style="color:#595959;">      response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">      //响应头   所有类型的头信息都可以接受</font>

<font style="color:#595959;">      response.setHeader("Access-Control-Allow-Headers", "*");</font>

<font style="color:#595959;">      //设置响应体</font>

<font style="color:#595959;">      response.send("HELLO AJAX POST");</font>

<font style="color:#595959;">    });</font>

<font style="color:#595959;">  </script></font>

#### （3）、JSON返回值
<font style="color:#595959;"><div id="result"></div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const result = document.getElementById("result");</font>

<font style="color:#595959;">      //绑定键盘按下事件</font>

<font style="color:#595959;">      window.onkeydown = function () {</font>

<font style="color:#595959;">        //1、发送请求</font>

<font style="color:#595959;">        const xhr = new XMLHttpRequest();</font>

<font style="color:#595959;">        //设置响应体数据的类型  响应数据自动转成json</font>

<font style="color:#595959;">        xhr.responseType = "json";</font>

<font style="color:#595959;">        //2、初始化</font>

<font style="color:#595959;">        xhr.open("GET", "http://127.0.0.1:8000/json-server");</font>

<font style="color:#595959;">        //3、发送</font>

<font style="color:#595959;">        xhr.send();</font>

<font style="color:#595959;">        //4、事件绑定</font>

<font style="color:#595959;">        xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">          if (xhr.readyState === 4) {</font>

<font style="color:#595959;">            if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">              //这里返回的是一个字符串，需要转成对象</font>

<font style="color:#595959;">              // console.log(xhr.response);</font>

<font style="color:#595959;">              // result.innerHTML = xhr.response;</font>

<font style="color:#595959;">              // 1. 手动对数据转化</font>

<font style="color:#595959;">              // let data = JSON.parse(xhr.response);</font>

<font style="color:#595959;">              // console.log(data);</font>

<font style="color:#595959;">              // result.innerHTML = data.name;</font>

<font style="color:#595959;">              // 2. 自动转换</font>

<font style="color:#595959;">              console.log(xhr.response);</font>

<font style="color:#595959;">              result.innerHTML = xhr.response.name;</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">    </script></font>

severs.js

<font style="color:#595959;">//JSON 响应</font>

<font style="color:#595959;">app.all("/json-server", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头  设置允许跨域</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  //响应头</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Headers", "*");</font>



<font style="color:#595959;">  //响应一个数据</font>

<font style="color:#595959;">  const data = {</font>

<font style="color:#595959;">    name: "bdqn",</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">  //对对象进行字符串转换</font>

<font style="color:#595959;">  let str = JSON.stringify(data);</font>

<font style="color:#595959;">  //设置响应体</font>

<font style="color:#595959;">  response.send(str);</font>

<font style="color:#595959;">});</font>

### 3、IE缓存问题处理（一般现在不需要额外处理）
ie浏览器会对ajax请求的结果做一个缓存处理。产生的问题就是ajax的下一次请求，ie浏览器，就会走本地的缓存，而不是服务器返回的最新数据，这样对时效比较强的场景，ajax请求就会影响我们的结果。

<font style="color:#595959;"><button>点击发送请求</button></font>

<font style="color:#595959;">  <div id="result"></div></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">    const btn = document.querySelector("button");</font>

<font style="color:#595959;">    const result = document.querySelector("#result");</font>

<font style="color:#595959;">    btn.addEventListener("click", function () {</font>

<font style="color:#595959;">      const xhr = new XMLHttpRequest();</font>

<font style="color:#595959;">      // 为了解决ie浏览器缓存的问题，在发送请求时，添加参数，当前时间戳</font>

<font style="color:#595959;">      xhr.open("GET", "http://127.0.0.1:8000/ie?t=" + Date.now());</font>

<font style="color:#595959;">      xhr.send();</font>

<font style="color:#595959;">      xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">        if (xhr.readyState === 4) {</font>

<font style="color:#595959;">          if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">            result.innerHTML = xhr.response;</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">    });</font>

<font style="color:#595959;">  </script></font>

server.js

<font style="color:#595959;">//针对 IE 缓存</font>

<font style="color:#595959;">app.get("/ie", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头  设置允许跨域</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  //设置响应体</font>

<font style="color:#595959;">  response.send("HELLO IE - 6");</font>

<font style="color:#595959;">});</font>

### 4、超时与网络异常处理
<font style="color:#595959;"><button>点击发送请求</button></font>

<font style="color:#595959;">  <div id="result"></div></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  const btn = document.querySelector("button");</font>

<font style="color:#595959;">const result = document.querySelector("#result");</font>



<font style="color:#595959;">btn.addEventListener("click", function () {</font>

<font style="color:#595959;">  const xhr = new XMLHttpRequest();</font>



<font style="color:#595959;">  //超时设置 2s 设置</font>

<font style="color:#595959;">  xhr.timeout = 2000;</font>

<font style="color:#595959;">  //超时回调</font>

<font style="color:#595959;">  xhr.ontimeout = function () {</font>

<font style="color:#595959;">    alert("网络异常, 请稍后重试!!");</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">  //网络异常回调，断网的时候，会出现的提醒</font>

<font style="color:#595959;">  xhr.onerror = function () {</font>

<font style="color:#595959;">    alert("你的网络似乎出了一些问题!");</font>

<font style="color:#595959;">  };</font>



<font style="color:#595959;">  xhr.open("GET", "http://127.0.0.1:8000/delay");</font>

<font style="color:#595959;">  xhr.send();</font>

<font style="color:#595959;">  xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">    if (xhr.readyState === 4) {</font>

<font style="color:#595959;">      if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">        result.innerHTML = xhr.response;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;"></script></font>

server.js

<font style="color:#595959;">//延时响应</font>

<font style="color:#595959;">app.all("/delay", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头  设置允许跨域</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  // 允许任何头类型，自带的还有自定义的</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Headers", "*");</font>

<font style="color:#595959;">  //为了测试服务器延迟响应到前台</font>

<font style="color:#595959;">  setTimeout(() => {</font>

<font style="color:#595959;">    //设置响应体</font>

<font style="color:#595959;">    response.send("延时响应");</font>

<font style="color:#595959;">  }, 3000);</font>

<font style="color:#595959;">});</font>

### 5、ajax取消请求
abort() 取消请求

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <button>点击发送</button></font>

<font style="color:#595959;">  <button>点击取消</button></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  //获取元素对象</font>

<font style="color:#595959;">  const btns = document.querySelectorAll("button");</font>

<font style="color:#595959;">let x = null;</font>



<font style="color:#595959;">btns[0].onclick = function () {</font>

<font style="color:#595959;">  xhr = new XMLHttpRequest();</font>

<font style="color:#595959;">  xhr.open("GET", "http://127.0.0.1:8000/delay");</font>

<font style="color:#595959;">  xhr.send();</font>

<font style="color:#595959;">};</font>



<font style="color:#595959;">// abort()  取消请求</font>

<font style="color:#595959;">btns[1].onclick = function () {</font>

<font style="color:#595959;">  xhr.abort();</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;">  </body></font>

### 6、重复请求问题
如果用户疯狂点击请求后台数据，会导致服务器压力比较大。

处理办法：发送请求前，看之前有没有同样的请求，有的话，就把前面的请求去掉，发送一个新的请求

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <button>点击发送</button></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  //获取元素对象</font>

<font style="color:#595959;">  const btns = document.querySelectorAll("button");</font>

<font style="color:#595959;">let x = null;</font>

<font style="color:#595959;">//1、标识变量，是否正在发送AJAX请求</font>

<font style="color:#595959;">let isSending = false;</font>



<font style="color:#595959;">btns[0].onclick = function () {</font>

<font style="color:#595959;">  //判断标识变量</font>

<font style="color:#595959;">  if (isSending) x.abort(); // 如果正在发送, 则取消该请求, 创建一个新的请求</font>

<font style="color:#595959;">  x = new XMLHttpRequest();</font>

<font style="color:#595959;">  //2、修改标识变量的值，在发送ajax请求</font>

<font style="color:#595959;">  isSending = true;</font>

<font style="color:#595959;">  x.open("GET", "http://127.0.0.1:8000/delay");</font>

<font style="color:#595959;">  x.send();</font>

<font style="color:#595959;">  x.onreadystatechange = function () {</font>

<font style="color:#595959;">    if (x.readyState === 4) {</font>

<font style="color:#595959;">      //3、修改标识变量，请求响应回来了，标识变量为false</font>

<font style="color:#595959;">      isSending = false;</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;">  </body></font>

## （三）、JQuery中发送ajax请求
sever.js

<font style="color:#595959;">//jQuery 服务</font>

<font style="color:#595959;">app.all("/jquery-server", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头  设置允许跨域</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Headers", "*");</font>

<font style="color:#595959;">  // response.send('Hello jQuery AJAX');</font>

<font style="color:#595959;">  const data = { name: "bdqn" };</font>

<font style="color:#595959;">  response.send(JSON.stringify(data));</font>

<font style="color:#595959;">});</font>

### 1、<font style="color:#000000;">get 请求 </font>
<font style="color:#000000;">$.get(url, [data], [callback], [type]) </font>

<font style="color:#000000;">url:请求的 URL 地址。 </font>

<font style="color:#000000;">data:请求携带的参数。 </font>

<font style="color:#000000;">callback:载入成功时回调函数。 </font>

<font style="color:#000000;">type:设置返回内容格式，xml, html, script, json, text, _default。</font>

<font style="color:#595959;">$('button').eq(0).click(function(){</font>

<font style="color:#595959;">  $.get('http://127.0.0.1:8000/jquery-server',</font>

<font style="color:#595959;">        {a:100, b:200}, </font>

<font style="color:#595959;">        function(data){</font>

<font style="color:#595959;">          console.log(data);</font>

<font style="color:#595959;">        },'json');</font>

<font style="color:#595959;">});</font>

### <font style="color:#000000;">2、 post 请求 </font>
<font style="color:#000000;">$.post(url, [data], [callback], [type]) </font>

<font style="color:#000000;">url:请求的 URL 地址。 </font>

<font style="color:#000000;">data:请求携带的参数。 </font>

<font style="color:#000000;">callback:载入成功时回调函数。 </font>

<font style="color:#000000;">type:设置返回内容格式，xml, html, script, json, text, _default。 </font>

<font style="color:#595959;">$('button').eq(1).click(function(){</font>

<font style="color:#595959;">  $.post('http://127.0.0.1:8000/jquery-server', {a:100, b:200}, function(data){</font>

<font style="color:#595959;">    console.log(data);</font>

<font style="color:#595959;">  });</font>

<font style="color:#595959;">});</font>

### 3、通用方法ajax
<font style="color:#595959;">$('button').eq(2).click(function(){</font>

<font style="color:#595959;">  $.ajax({</font>

<font style="color:#595959;">    //url</font>

<font style="color:#595959;">    url: 'http://127.0.0.1:8000/jquery-server',</font>

<font style="color:#595959;">    //参数</font>

<font style="color:#595959;">    data: {a:100, b:200},</font>

<font style="color:#595959;">    //请求类型</font>

<font style="color:#595959;">    type: 'GET',</font>

<font style="color:#595959;">    //响应体结果</font>

<font style="color:#595959;">    dataType: 'json',</font>

<font style="color:#595959;">    //成功的回调</font>

<font style="color:#595959;">    success: function(data){</font>

<font style="color:#595959;">      console.log(data);</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    //超时时间</font>

<font style="color:#595959;">    timeout: 2000,</font>

<font style="color:#595959;">    //失败的回调</font>

<font style="color:#595959;">    error: function(){</font>

<font style="color:#595959;">      console.log('出错啦!!');</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    //头信息</font>

<font style="color:#595959;">    headers: {</font>

<font style="color:#595959;">      c:300,</font>

<font style="color:#595959;">      d:400</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  });</font>

<font style="color:#595959;">});</font>

## （四）、axios发送ajax请求
axios官网：[https://www.bootcdn.cn/axios/](https://www.bootcdn.cn/axios/" \t "_blank)

axios线上链接：<script src="[https://cdn.bootcdn.net/ajax/libs/axios/1.6.8/axios.js](https://cdn.bootcdn.net/ajax/libs/axios/1.6.8/axios.js" \t "_blank)"></script>

<font style="color:#595959;"><head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>axios 发送 AJAX 请求</title></font>

<font style="color:#595959;">    <link href="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" /></font>

<font style="color:#595959;">    </font>**<font style="color:#FF0000;"><script src="https://cdn.bootcdn.net/ajax/libs/axios/1.6.8/axios.js"></script></font>**

<font style="color:#595959;"></head></font>

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <div class="container"></font>

<font style="color:#595959;">      <h2 class="page-header">axios发送AJAX请求</h2></font>

<font style="color:#595959;">      <button class="btn btn-primary">GET</button></font>

<font style="color:#595959;">      <button class="btn btn-danger">POST</button></font>

<font style="color:#595959;">      <button class="btn btn-info">通用型方法ajax</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      var btns = document.querySelectorAll("button");</font>

<font style="color:#595959;">      // 设置基本路径</font>

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">axios.defaults.baseURL = "http://127.0.0.1:8000";</font>**

<font style="color:#595959;">      // get请求</font>

<font style="color:#595959;">      btns[0].addEventListener("click", function () {</font>

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">axios</font>**

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">.get("/axios-server", {</font>**

**<font style="color:#FF0000;">            //设置请求头</font>**

**<font style="color:#FF0000;">            headers: {</font>**

**<font style="color:#FF0000;">              id: "007",</font>**

**<font style="color:#FF0000;">            },</font>**

**<font style="color:#FF0000;">          })</font>**

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">.then(</font>**

**<font style="color:#FF0000;">            (response) => {</font>**

**<font style="color:#FF0000;">              console.log("服务器返回的数据：", response.data);</font>**

**<font style="color:#FF0000;">            },</font>**

**<font style="color:#FF0000;">            (error) => {</font>**

**<font style="color:#FF0000;">              console.log("错误信息", error.message);</font>**

**<font style="color:#FF0000;">            }</font>**

**<font style="color:#FF0000;">          );</font>**

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      // 新增</font>

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">// axios.get("/axios-server")</font>**

**<font style="color:#FF0000;">          // .then(function(response){</font>**

**<font style="color:#FF0000;">          //   console.log("服务器返回的数据：", response.data);</font>**

**<font style="color:#FF0000;">          // })</font>**

**<font style="color:#FF0000;">          // .catch(function (error){</font>**

**<font style="color:#FF0000;">          //   console.log("错误信息", error.message);</font>**

**<font style="color:#FF0000;">          // })</font>**

<font style="color:#595959;">          //写法2</font>

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">// axios.get("/axios-serve")</font>**

**<font style="color:#FF0000;">          // .then(</font>**

**<font style="color:#FF0000;">          //   function(response){</font>**

**<font style="color:#FF0000;">          //     console.log("服务器返回的数据：", response.data);</font>**

**<font style="color:#FF0000;">          //     console.log("错误信息", error.message);</font>**

**<font style="color:#FF0000;">          //   },</font>**

**<font style="color:#FF0000;">          //   function(error){</font>**

**<font style="color:#FF0000;">          //     console.log("错误信息", error.message);</font>**

**<font style="color:#FF0000;">          //   }</font>**

<font style="color:#595959;">          //   )</font>

<font style="color:#595959;">          // 写法三</font>

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">// try {</font>**

**<font style="color:#FF0000;">          //   let res= await axios.get("/axios-server")</font>**

**<font style="color:#FF0000;">          //  console.log(res.data);</font>**

**<font style="color:#FF0000;">          // } catch (error) {</font>**

**<font style="color:#FF0000;">          //   console.log(error);</font>**

**<font style="color:#FF0000;">          // }</font>**

<font style="color:#595959;">      // post请求</font>

<font style="color:#595959;">      btns[1].addEventListener("click", function () {</font>

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">axios</font>**

**<font style="color:#FF0000;">          .post(</font>**

**<font style="color:#FF0000;">            "/axios-server",</font>**

**<font style="color:#FF0000;">            {</font>**

**<font style="color:#FF0000;">              username: "admin",</font>**

**<font style="color:#FF0000;">              password: "123456",</font>**

**<font style="color:#FF0000;">            },</font>**

**<font style="color:#FF0000;">            {</font>**

**<font style="color:#FF0000;">              // url</font>**

**<font style="color:#FF0000;">              params: {</font>**

**<font style="color:#FF0000;">                id: "008",</font>**

**<font style="color:#FF0000;">              },</font>**

**<font style="color:#FF0000;">              // 请求头参数</font>**

**<font style="color:#FF0000;">              headers: {</font>**

**<font style="color:#FF0000;">                height: "180",</font>**

**<font style="color:#FF0000;">                weight: 180,</font>**

**<font style="color:#FF0000;">              },</font>**

**<font style="color:#FF0000;">            }</font>**

**<font style="color:#FF0000;">          )</font>**

**<font style="color:#FF0000;">          .then((res) => {</font>**

**<font style="color:#FF0000;">            console.log(res.data);</font>**

**<font style="color:#FF0000;">          })</font>**

**<font style="color:#FF0000;">          .catch((error) => {</font>**

**<font style="color:#FF0000;">            console.log(error.message);</font>**

**<font style="color:#FF0000;">          });</font>**

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      // axios通用请求</font>

<font style="color:#595959;">      btns[2].addEventListener("click", function () {</font>

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">axios({</font>**

**<font style="color:#FF0000;">          // 请求方法</font>**

**<font style="color:#FF0000;">          method: "POST",</font>**

**<font style="color:#FF0000;">          // url</font>**

**<font style="color:#FF0000;">          url: "/axios-server",</font>**

**<font style="color:#FF0000;">          // url参数</font>**

**<font style="color:#FF0000;">          params: {</font>**

**<font style="color:#FF0000;">            id: "010",</font>**

**<font style="color:#FF0000;">          },</font>**

**<font style="color:#FF0000;">          // 头信息</font>**

**<font style="color:#FF0000;">          headers: {</font>**

**<font style="color:#FF0000;">            a: 100,</font>**

**<font style="color:#FF0000;">            b: 200,</font>**

**<font style="color:#FF0000;">          },</font>**

**<font style="color:#FF0000;">          // 请求体参数</font>**

**<font style="color:#FF0000;">          data: {</font>**

**<font style="color:#FF0000;">            username: "admin",</font>**

**<font style="color:#FF0000;">            password: "12345",</font>**

**<font style="color:#FF0000;">          },</font>**

**<font style="color:#FF0000;">        })</font>**

**<font style="color:#FF0000;">          .then((res) => {</font>**

**<font style="color:#FF0000;">            console.log(res.data);</font>**

**<font style="color:#FF0000;">          })</font>**

**<font style="color:#FF0000;">          .catch((error) => {</font>**

**<font style="color:#FF0000;">            console.log(error.message);</font>**

**<font style="color:#FF0000;">          });</font>**

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

## （五）、跨域
### 1、<font style="color:#000000;">同源策略</font>
<font style="color:#000000;">同源策略(Same-Origin Policy)最早由 Netscape 公司提出，是浏览器的一种安全策略。</font>

<font style="color:#000000;">同源：协议、域名、端口号必须完全相同。</font>

<font style="color:#000000;">违背同源策略就是跨域。</font>

### <font style="color:#000000;">2、演示同源策略</font>
server.js

<font style="color:#595959;"><script></font>

<font style="color:#595959;">    const express = require("express");</font>



<font style="color:#595959;">    const app = express();</font>



<font style="color:#595959;">    app.get("/home", (request, response) => {</font>

<font style="color:#595959;">      //响应一个页面   绝对路径,当前js文件所处的目录</font>

<font style="color:#595959;">      response.sendFile(__dirname + "/index.html");</font>

<font style="color:#595959;">    });</font>



<font style="color:#595959;">    app.get("/data", (request, response) => {</font>

<font style="color:#595959;">      response.send("用户数据");</font>

<font style="color:#595959;">    });</font>



<font style="color:#595959;">    app.listen(8001, () => {</font>

<font style="color:#595959;">      console.log("服务已经启动...");</font>

<font style="color:#595959;">    });</font>

<font style="color:#595959;">  </script></font>

<font style="color:#000000;">index.html 跟serve.js同级</font>

<font style="color:#000000;">在网址栏直接输入 </font>[http://localhost:8001/home](http://localhost:8001/home" \t "_blank)<font style="color:#000000;">,不用vscode打开，否则会出现跨域问题</font>

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <h1>bdqn</h1></font>

<font style="color:#595959;">    <button>点击获取用户数据</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">        const btn = document.querySelector('button');</font>



<font style="color:#595959;">        btn.onclick = function(){</font>

<font style="color:#595959;">            const x = new XMLHttpRequest();</font>

<font style="color:#595959;">            //这里因为是满足同源策略的, 所以 url 可以简写</font>

<font style="color:#595959;">            x.open("GET",'/data');</font>

<font style="color:#595959;">            //发送</font>

<font style="color:#595959;">            x.send();</font>

<font style="color:#595959;">            //绑定事件</font>

<font style="color:#595959;">            x.onreadystatechange = function(){</font>

<font style="color:#595959;">                if(x.readyState === 4){</font>

<font style="color:#595959;">                    if(x.status >= 200 && x.status < 300){</font>

<font style="color:#595959;">                        console.log(x.response);</font>

<font style="color:#595959;">                    }</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;"></body></font>

### <font style="color:#000000;">3 、如何解决跨域</font>
#### <font style="color:#000000;">（1）、 JSONP </font>
##### <font style="color:#000000;">1) JSONP 是什么 </font>
<font style="color:#000000;">JSONP(JSON with Padding)，是一个非官方的跨域解决方案，纯粹凭借程序员的聪明才智开发出来，只支持 get 请求。 </font>

##### <font style="color:#000000;">2) JSONP 怎么工作的？ </font>
<font style="color:#000000;">在网页有一些标签天生具有跨域能力，比如：img link iframe script。 JSONP 就是利用 script 标签的跨域能力来发送请求的。 </font>

##### <font style="color:#000000;">3）jsonp的简单原理</font>
jsonp原理.html

<font style="color:#595959;"><head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      h1 {</font>

<font style="color:#595959;">        width: 300px;</font>

<font style="color:#595959;">        height: 100px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <h1 id="res"></h1></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 提前定义好，数据处理函数，用于处理script请求回来的数据</font>

<font style="color:#595959;">      function handle(data) {</font>

<font style="color:#595959;">        const res = document.getElementById("res");</font>

<font style="color:#595959;">        res.innerHTML = data.name;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>



<font style="color:#595959;">    <!--1、 script的正常使用，引入外部资源--></font>

<font style="color:#595959;">    <!-- <script src="./js/app.js"></script> --></font>

<font style="color:#595959;">    <!--2、 script跨域请求数据 --></font>

<font style="color:#595959;">    <script src="http://127.0.0.1:8000/jsonp-server"></script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#000000;">app.js 演示script的正常用法，引入外部资源</font>

<font style="color:#595959;">var data = {</font>

<font style="color:#595959;">  name: "jack",</font>

<font style="color:#595959;">};</font>



<font style="color:#595959;">//1、 自定义一个handle的函数，处理这个data数据，放入到页面中</font>

<font style="color:#595959;">// function handle(data) {</font>

<font style="color:#595959;">//   const res = document.getElementById("res");</font>

<font style="color:#595959;">//   res.innerHTML = data.name;</font>

<font style="color:#595959;">// }</font>

<font style="color:#595959;">// 2、这个自定义函数，放入到html页面中，截止到这就是简单的引入</font>

<font style="color:#595959;">// 3、去sever.js文件中变形操作</font>



<font style="color:#595959;">handle(data);</font>

<font style="color:#000000;">server.js</font>

<font style="color:#595959;">//jsonp服务</font>

<font style="color:#595959;">app.all("/jsonp-server", (request, response) => {</font>

<font style="color:#595959;">  // 返回字符串，这个字符串，要写js能识别的语法，js引擎要对返回内容进行解析</font>

<font style="color:#595959;">  // response.send('console.log("hello jsonp")');</font>

<font style="color:#595959;">  // 返回数据处理函数</font>

<font style="color:#595959;">  const data = {</font>

<font style="color:#595959;">    name: "北大青鸟",</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">  //将数据转化为字符串</font>

<font style="color:#595959;">  let str = JSON.stringify(data);</font>

<font style="color:#595959;">  //返回结果，.end()不用设置响应头，这个handle（），在页面中要提前定义</font>

<font style="color:#595959;">  response.end(`handle(${str})`);</font>

<font style="color:#595959;">});</font>

##### <font style="color:#000000;">4) JSONP 的案例使用</font>
需求：用户输入用户名，失焦时，发送ajax请求，判断用户名是否存在，存在将input变成红色框，且显示用户名已存在

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  用户名: <input type="text" id="username"></font>

<font style="color:#595959;">  <p></p></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  //获取 input 元素</font>

<font style="color:#595959;">  const input = document.querySelector('input');</font>

<font style="color:#595959;">const p = document.querySelector('p');</font>



<font style="color:#595959;">//声明 handle 函数</font>

<font style="color:#595959;">function handle(data){</font>

<font style="color:#595959;">  input.style.border = "solid 1px #f00";</font>

<font style="color:#595959;">  //修改 p 标签的提示文本</font>

<font style="color:#595959;">  p.innerHTML = data.msg;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">//绑定事件</font>

<font style="color:#595959;">input.onblur = function(){</font>

<font style="color:#595959;">  //获取用户的输入值</font>

<font style="color:#595959;">  let username = this.value;</font>

<font style="color:#595959;">  </font><font style="color:#FF0000;">//向服务器端发送请求 检测用户名是否存在</font>

<font style="color:#FF0000;">  //1. 创建 script 标签</font>

<font style="color:#FF0000;">  const script = document.createElement('script');</font>

<font style="color:#FF0000;">  //2. 设置标签的 src 属性</font>

<font style="color:#FF0000;">  script.src = 'http://127.0.0.1:8000/check-username';</font>

<font style="color:#FF0000;">  //3. 将 script 插入到文档中，否则script不执行</font>

<font style="color:#FF0000;">  document.body.appendChild(script);</font>

<font style="color:#FF0000;">}</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;">  </body></font>

sever.js

<font style="color:#595959;">//用户名检测是否存在</font>

<font style="color:#595959;">app.all("/check-username", (request, response) => {</font>

<font style="color:#595959;">  const data = {</font>

<font style="color:#595959;">    exist: 1, </font>

<font style="color:#595959;">    msg: "用户名已经存在",</font>

<font style="color:#595959;">  };</font>

<font style="color:#595959;">  //将数据转化为字符串</font>

<font style="color:#595959;">  let str = JSON.stringify(data);</font>

<font style="color:#595959;">  //返回结果，交给handle处理函数</font>

<font style="color:#595959;">  response.end(`handle(${str})`);</font>

<font style="color:#595959;">});</font>

#### （2）、cors
##### 1) CORS 是什么？ 
CORS（Cross-Origin Resource Sharing），跨域资源共享。CORS 是官方的跨域解决方 案，它的特点是不需要在客户端做任何特殊的操作，完全在服务器中进行处理，支持 get 和 post 请求。跨域资源共享标准新增了一组 HTTP 首部字段，允许服务器声明哪些 源站通过浏览器有权限访问哪些资源

##### 2) CORS 怎么工作的？
CORS 是通过设置一个响应头来告诉浏览器，该请求允许跨域，浏览器收到该响应 以后就会对响应放行。

##### 3) CORS 的使用
sever.js

<font style="color:#595959;">app.all("/cors-server", (request, response) => {</font>

<font style="color:#595959;">  //设置响应头，允许跨域</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Origin", "*");</font>

<font style="color:#595959;">  // 允许自定义响应头</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Headers", "*");</font>

<font style="color:#595959;">  //设置请求允许的方法</font>

<font style="color:#595959;">  response.setHeader("Access-Control-Allow-Method", "*");</font>

<font style="color:#595959;">  // response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");</font>

<font style="color:#595959;">  response.send("hello CORS");</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <button>发送请求</button></font>

<font style="color:#595959;">  <div id="result"></div></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">  const btn = document.querySelector('button');</font>



<font style="color:#595959;">btn.onclick = function(){</font>

<font style="color:#595959;">  //1. 创建对象</font>

<font style="color:#595959;">  const x = new XMLHttpRequest();</font>

<font style="color:#595959;">  //2. 初始化设置</font>

<font style="color:#595959;">  x.open("GET", "http://127.0.0.1:8000/cors-server");</font>

<font style="color:#595959;">  //3. 发送</font>

<font style="color:#595959;">  x.send();</font>

<font style="color:#595959;">  //4. 绑定事件</font>

<font style="color:#595959;">  x.onreadystatechange = function(){</font>

<font style="color:#595959;">    if(x.readyState === 4){</font>

<font style="color:#595959;">      if(x.status >= 200 && x.status < 300){</font>

<font style="color:#595959;">        //输出响应体</font>

<font style="color:#595959;">        console.log(x.response);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;">  </body></font>

[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS" \t "_blank)

#### vue代理服务器跨域


# 1、axios的基本使用
## 1.1、简介
说到axios我们就不得不说下Ajax。在旧浏览器页面在向服务器请求数据时，因为返回的是整个页面的数据，页面都会强制刷新一下，这对于用户来讲并不是很友好。并且我们只是需要修改页面的部分数据，但是从服务器端发送的却是整个页面的数据，十分消耗网络资源。而我们只是需要修改页面的部分数据，也希望不刷新页面，因此异步网络请求就应运而生。

Ajax(Asynchronous JavaScript and XML)：

异步网络请求。Ajax能够让页面无刷新的请求数据。

实现ajax的方式有多种，如jQuery封装的ajax，原生的XMLHttpRequest，以及axios。但各种方式都有利弊：

+ 原生的XMLHttpRequest的配置和调用方式都很繁琐，实现异步请求十分麻烦
+ jQuery的ajax相对于原生的ajax是非常好用的，但是没有必要因为要用ajax异步网络请求而引用jQuery框架
+ Axios（ajax i/o system）：

这不是一种新技术，本质上还是对原生XMLHttpRequest的封装，可用于浏览器和nodejs的HTTP客户端，只不过它是基于Promise的，符合最新的ES规范。

axios具备以下特点：

**<font style="color:#FF0000;">在浏览器中创建XMLHttpRequest请求</font>**

**<font style="color:#FF0000;">在node.js中发送http请求</font>**

**<font style="color:#FF0000;">支持Promise API</font>**

**<font style="color:#FF0000;">拦截请求和响应</font>**

**<font style="color:#FF0000;">转换请求和响应数据</font>**

**<font style="color:#FF0000;">取消要求</font>**

**<font style="color:#FF0000;">自动转换JSON数据</font>**

## 1.2、安装
### 1.2.1、<font style="color:#B4B4B4;">通过cdn引入</font>
<font style="color:#595959;"><script src="https://unpkg.com/axios/dist/axios.min.js"> </script></font>

## 1.3、基本使用
### 1.3.1、准备服务器
模拟服务器，这里使用json-server

#### （1）安装json-server
 npm install -g json-server

#### （2）创建数据源
在空文件夹下创建JSON文件作为数据源，例如 db.json

<font style="color:#595959;">{</font>

<font style="color:#595959;">  "list": [</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "1",</font>

<font style="color:#595959;">      "name": "唐僧",</font>

<font style="color:#595959;">      "age": 20,</font>

<font style="color:#595959;">      "address": "东土大唐"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "2",</font>

<font style="color:#595959;">      "name": "孙悟空",</font>

<font style="color:#595959;">      "age": 500,</font>

<font style="color:#595959;">      "address": "花果山"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "3",</font>

<font style="color:#595959;">      "name": "猪八戒",</font>

<font style="color:#595959;">      "age": 330,</font>

<font style="color:#595959;">      "address": "高老庄"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "4",</font>

<font style="color:#595959;">      "name": "沙悟净",</font>

<font style="color:#595959;">      "age": 200,</font>

<font style="color:#595959;">      "address": "流沙河"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "5",</font>

<font style="color:#595959;">      "name": "红孩儿",</font>

<font style="color:#595959;">      "age": 10,</font>

<font style="color:#595959;">      "address": "火焰山"</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  ]</font>

<font style="color:#595959;">}</font>

#### （3）启动服务器
使用以下命令启动json-server，并将JSON文件作为参数传递给服务器。这将在本地计算机的<font style="color:#C7254E;">3000端口</font>上启动服务器，并将db.json文件中的数据暴露为RESTful API。

方式一、//db.json是文件名

<font style="color:#595959;">json-server  db.json </font>

方式二、

<font style="color:#595959;">json-server --watch db.json  </font>

方式三、

跟db.json同级目录，创建package.json文件，配置别名

<font style="color:#595959;">{</font>

<font style="color:#595959;">  "scripts":{</font>

<font style="color:#595959;">    "mock":"json-server --watch db.json --port 3001"</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

启动方式：npm run mock

### 1.3.2、各种请求方式
#### <font style="color:#B4B4B4;">1.3.2.1、get请求</font>
<font style="color:#B4B4B4;">获取数据，请求指定的信息，返回实体对象</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <!-- <script src="https://unpkg.com/axios/dist/axios.min.js"></script> --></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="getInfo()">get请求</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // get请求</font>

<font style="color:#595959;">      async function getInfo() {</font>

<font style="color:#595959;">        // 请求结果处理方法一：</font>

<font style="color:#595959;">        // axios.get("http://localhost:3000/list").then(</font>

<font style="color:#595959;">        //   (res) => {</font>

<font style="color:#595959;">        //     // 将请求到的结果进行渲染</font>

<font style="color:#595959;">        //     render(res.data);</font>

<font style="color:#595959;">        //   },</font>

<font style="color:#595959;">        //   (err) => {</font>

<font style="color:#595959;">        //     console.log(err);</font>

<font style="color:#595959;">        //   }</font>

<font style="color:#595959;">        // );</font>

<font style="color:#595959;">        // 请求结果处理方法二：</font>

<font style="color:#595959;">        // axios</font>

<font style="color:#595959;">        //   .get("http://localhost:3000/list")</font>

<font style="color:#595959;">        //   .then((res) => {</font>

<font style="color:#595959;">        //     // 将请求到的结果进行渲染</font>

<font style="color:#595959;">        //     render(res.data);</font>

<font style="color:#595959;">        //   })</font>

<font style="color:#595959;">        //   .catch((err) => {</font>

<font style="color:#595959;">        //     console.log(err);</font>

<font style="color:#595959;">        //   });</font>

<font style="color:#595959;">     </font>**<font style="color:#FF0000;">   // 请求结果处理方法三：推荐使用第三种</font>**

**<font style="color:#FF0000;">        try {</font>**

**<font style="color:#FF0000;">          let res = await axios.get("http://localhost:3000/list");</font>**

**<font style="color:#FF0000;">          render(res.data);</font>**

**<font style="color:#FF0000;">        } catch (error) {</font>**

**<font style="color:#FF0000;">          console.log(err);</font>**

**<font style="color:#FF0000;">        }</font>**

**<font style="color:#FF0000;">      }</font>**

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">// 渲染函数</font>**

**<font style="color:#FF0000;">      function render(data) {</font>**

**<font style="color:#FF0000;">        let showUser = document.querySelector(".showUser");</font>**

**<font style="color:#FF0000;">        let str = "";</font>**

**<font style="color:#FF0000;">        data.forEach((item) => {</font>**

**<font style="color:#FF0000;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>**

**<font style="color:#FF0000;">        });</font>**

**<font style="color:#FF0000;">        showUser.innerHTML = str;</font>**

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">}</font>**

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

此外get请求，还可以携带参数

<font style="color:#595959;">// get请求带参数方式一</font>

<font style="color:#595959;">// try {</font>

<font style="color:#595959;">//   let res = await axios.get("http://localhost:3000/list?id=1");</font>

<font style="color:#595959;">//   render(res.data);</font>

<font style="color:#595959;">// } catch (error) {</font>

<font style="color:#595959;">//   console.log(err);</font>

<font style="color:#595959;">// }</font>

<font style="color:#595959;">// get请求带参数方式二</font>

<font style="color:#595959;">try {</font>

<font style="color:#595959;">  let res = await axios.get("http://localhost:3000/list", {</font>

<font style="color:#595959;">    params: {</font>

<font style="color:#595959;">      id: 2,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  });</font>

<font style="color:#595959;">  render(res.data);</font>

<font style="color:#595959;">} catch (error) {</font>

<font style="color:#595959;">  console.log(err);</font>

<font style="color:#595959;">}</font>

#### <font style="color:#B4B4B4;">1.3.2.2、post请求：</font>
<font style="color:#B4B4B4;">向指定资源提交数据（例如表单提交或文件上传）</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="postInfo()">post请求</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // post请求</font>

<font style="color:#595959;">      async function postInfo() {</font>

<font style="color:#595959;">        await axios.post("http://localhost:3000/list", </font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: "蜘蛛精",</font>

<font style="color:#595959;">          age: 200,</font>

<font style="color:#595959;">          address: "盘丝洞",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 重新获取数据，渲染</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">        // console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.3、put请求：</font>
<font style="color:#B4B4B4;">更新数据，从客户端向服务器传送的数据取代指定的文档的内容</font>

<font style="color:#B4B4B4;">会把更新的数据完全替代原数据，如果只修改了部分的数据，原数据其他内容都会丢失</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="putInfo()">put请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // put请求</font>

<font style="color:#595959;">      async function putInfo() {</font>

<font style="color:#595959;">        let res = await axios.put("http://localhost:3000/list/1", {</font>

<font style="color:#595959;">          name: "玉皇大帝",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData()</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.4、patch请求：</font>
<font style="color:#B4B4B4;">更新数据，是对put方法的补充，用来对已知资源进行局部更新</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="patchInfo()">patch请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // patch请求</font>

<font style="color:#595959;">      async function patchInfo() {</font>

<font style="color:#595959;">        let res = await axios.patch("http://localhost:3000/list/2", {</font>

<font style="color:#595959;">          name: "王母娘娘",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData();</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.5、delete请求：</font>
<font style="color:#B4B4B4;">请求服务器删除指定的数据</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="deleteInfo()">delet请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // delete请求</font>

<font style="color:#595959;">      async function deleteInfo() {</font>

<font style="color:#595959;">        let res = await axios.delete("http://localhost:3000/list/1");</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData();</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.3.3、axios的配置
配置的优先级为：请求配置 > 实例配置 > 全局配置

#### 1.3.3.1、全局配置
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      //配置全局的超时时长</font>

<font style="color:#595959;">      axios.defaults.timeout = 2000;</font>

<font style="color:#595959;">      //配置全局的基本URL</font>

<font style="color:#595959;">      axios.defaults.baseURL = "http://localhost:3000";</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        try {</font>

<font style="color:#595959;">          let res1 = await axios.get("/list");</font>

<font style="color:#595959;">          let res2 = await axios.get("/user");</font>

<font style="color:#595959;">          console.log(res1.data);</font>

<font style="color:#595959;">          console.log(res2.data);</font>

<font style="color:#595959;">        } catch (error) {</font>

<font style="color:#595959;">          console.log(error);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.3.2、实例配置
在一个项目中，我们会有很多不同的请求，如果都用axios去请求，很容易造成冲突，所以我们可以去创建axios的实例，通过不同的实例去请求，配置

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        // 创建实例1，创建同时配置</font>

<font style="color:#595959;">        let instance = axios.create({</font>

<font style="color:#595959;">          baseURL: "http://localhost:3000",</font>

<font style="color:#595959;">          timeout: 2000,</font>

<font style="color:#595959;">        });</font>



<font style="color:#595959;">        let res = await instance.get("/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>



<font style="color:#595959;">        // 创建实例2，现创建，再配置</font>

<font style="color:#595959;">        let instance2 = axios.create();</font>

<font style="color:#595959;">        instance2.defaults.timeout = 2;</font>

<font style="color:#595959;">        instance2.defaults.baseURL = "http://localhost:3000";</font>



<font style="color:#595959;">        let res2 = await instance.get("/user");</font>

<font style="color:#595959;">        console.log(res2.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

axios实例常用配置：

    - baseURL 请求的域名，基本地址，类型：String
    - timeout 请求超时时长，单位ms，类型：Number
    - url 请求路径，类型：String
    - method 请求方法，类型：String
    - headers 设置请求头，类型：Object
    - params 请求参数，将参数拼接在URL上，类型：Object
    - data 请求参数，将参数放到请求体中，类型：Object

#### 1.3.3.3、请求配置
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list", {</font>

<font style="color:#595959;">          timeout: 2000,</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.3.4、axios的拦截器
axios给我们提供了两大类拦截器

请求方向的拦截（成功请求，失败请求）

响应方向的拦截（成功的，失败的）

拦截器的作用，用于我们在网络请求的时候，在发起请求或者响应时对操作进行处理

例如：发送请求时，可以添加网页加载的动画，或认证token，强制用户先登录再请求数据

响应的时候，可以结束网页加载的动画，或者对响应的数据进行处理

#### 1.3.4.1、请求拦截器
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 请求拦截器</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        axios.interceptors.request.use(</font>

<font style="color:#595959;">          (config) => {</font>

<font style="color:#595959;">            // 发生请求前的一系列的处理</font>

<font style="color:#595959;">            console.log("开启加载动画");</font>

<font style="color:#595959;">            console.log("认证是否有token，如果没有，要去登录");</font>

<font style="color:#595959;">            return config; //拦截后的放行</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          (err) => {</font>

<font style="color:#595959;">            // 请求错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        );</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.4.2、响应拦截器
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 响应拦截器</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        axios.interceptors.response.use(</font>

<font style="color:#595959;">          (config) => {</font>

<font style="color:#595959;">            // 数据回来前的一系列的处理</font>

<font style="color:#595959;">            console.log("关闭加载动画");</font>

<font style="color:#595959;">            console.log("对数据进行一些数据");</font>

<font style="color:#595959;">            return config.data; //拦截后的放行</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          (err) => {</font>

<font style="color:#595959;">            // 响应错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        );</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.4.3、取消拦截
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 请求拦截器</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let instance = axios.create();</font>

<font style="color:#595959;">        instance.interceptors.request.use(</font>

<font style="color:#595959;">          (config) => {</font>

<font style="color:#595959;">            // 发生请求前的一系列的处理</font>

<font style="color:#595959;">            console.log("开启加载动画");</font>

<font style="color:#595959;">            console.log("认证是否有token，如果没有，要去登录");</font>

<font style="color:#595959;">            return config; //拦截后的放行</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          (err) => {</font>

<font style="color:#595959;">            // 请求错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        );</font>



<font style="color:#595959;">        // 取消拦截</font>

<font style="color:#595959;">        axios.interceptors.request.eject(instance);</font>



<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

# 2、Vue中axios的使用
## 2.1、基本使用
### 2.1.1<font style="color:#B4B4B4;">、npm安装</font>
终端安装：

<font style="color:#595959;"> npm install axios</font>

### 2.1.2、在Vue原型上配置$axios
在vue项目的main.js文件中引入axios

<font style="color:#595959;">// 导入axios</font>

<font style="color:#595959;">import axios from 'axios'</font>

<font style="color:#595959;">// 将axios放到Vue原型上，这样vm，vc身上就都有axios了</font>

<font style="color:#595959;">Vue.prototype.$axios=axios</font>



### 2.1.3、在组件中使用：
<font style="color:#595959;"><button @click="getDate">点击发送请求</button></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'App',</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    async getDate() {</font>

<font style="color:#595959;">      let res = await this.$axios.get('http://localhost:3000/list')</font>

<font style="color:#595959;">      console.log(res.data);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 2.2、一次封装
如果是多个组件都需要发送请求，而且每次请求前，我们都要进行一些验证处理等，可以进行简单封装

### 2.2.1、封装<font style="color:#FE2C24;">request.js</font>
<font style="color:#4D4D4D;">src/utils创建</font><font style="color:#FE2C24;">request.js</font>

<font style="color:#595959;">/* 封装axios用于发送请求 */</font>

<font style="color:#595959;">import axios from "axios";</font>



<font style="color:#595959;">/*</font>

<font style="color:#595959;">(1)request 相当于 Axios 的实例对象</font>

<font style="color:#595959;">(2)为什么要有request,而不是直接用axios</font>

<font style="color:#595959;">  * 项目开发中，有可能会有两个基地址</font>

<font style="color:#595959;">  * 不同的接口配置不同（有的要token,有的不要token）</font>

<font style="color:#595959;">*/</font>

<font style="color:#595959;">const request = axios.create({</font>

<font style="color:#595959;">  baseURL: "http://localhost:3000", // 设置基地址</font>

<font style="color:#595959;">  timeout: 2000, // 请求超时：当2s没有响应就会结束请求</font>

<font style="color:#595959;">});</font>



<font style="color:#595959;">// 添加请求拦截器，一下内容是axios的拦截器，可以不用写</font>

<font style="color:#595959;">request.interceptors.request.use(</font>

<font style="color:#595959;">  function (config) {</font>

<font style="color:#595959;">    // 发请求前做的一些处理，数据转化，配置请求头，设置token,设置loading等，根据需求去添加</font>

<font style="color:#595959;">    // 例如1</font>

<font style="color:#595959;">    config.data = JSON.stringify(config.data); // 数据转化,也可以使用qs转换</font>

<font style="color:#595959;">    // 例如2</font>

<font style="color:#595959;">    config.headers = {</font>

<font style="color:#595959;">      "Content-Type": "application/x-www-form-urlencoded", // 配置请求头</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">    // 例如3</font>

<font style="color:#595959;">    //注意使用token的时候需要引入cookie方法或者用本地localStorage等方法，推荐js-cookie</font>

<font style="color:#595959;">    const token = getCookie("名称"); // 这里取token之前，你肯定需要先拿到token,存一下</font>

<font style="color:#595959;">    if (token) {</font>

<font style="color:#595959;">      config.params = { token: token }; // 如果要求携带在参数中</font>

<font style="color:#595959;">      config.headers.token = token; // 如果要求携带在请求头中</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">     return config; //拦截后的放行</font>

<font style="color:#595959;">  }, </font>

<font style="color:#595959;">  function (error) {</font>

<font style="color:#595959;">    // 对请求错误做些什么</font>

<font style="color:#595959;">    return Promise.reject(error);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">);</font>



<font style="color:#595959;">// 添加响应拦截器</font>

<font style="color:#595959;">request.interceptors.response.use(</font>

<font style="color:#595959;">  function (response) {</font>

<font style="color:#595959;">    // 对响应数据做点什么</font>

<font style="color:#595959;">    console.log('关闭请求数据动画');</font>

<font style="color:#595959;">    console.log('对数据进行处理');</font>

<font style="color:#595959;">    return response.data; //只要响应对象中的数据</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  function (error) {</font>

<font style="color:#595959;">    // 对响应错误做点什么</font>

<font style="color:#595959;">    return Promise.reject(error);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">);</font>



<font style="color:#595959;">export default request;</font>

<font style="color:#FE2C24;">第一次封装，引入了基地址与拦截器</font>

### <font style="color:#FE2C24;">2.2.2、组件中使用</font>
<font style="color:#595959;"><script></font>

<font style="color:#595959;">  import request from '../utils/request'</font>

<font style="color:#595959;">  export default {</font>

<font style="color:#595959;">    name: 'ShowList',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">      async getList() {</font>

<font style="color:#595959;">        // 基本路径已经配置过</font>

<font style="color:#595959;">        let res = await request.get('/list')</font>

<font style="color:#595959;">        //这里的res也是响应拦截器里处理之后的结果</font>

<font style="color:#595959;">        console.log(res);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">import request from '@/utils/request';</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'ShowUser',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        async getUser() {</font>

<font style="color:#595959;">            let res = await request.get('/user')</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 2.3、二次封装
项目当中会有很多的页面，如果每个页面中都会多次请求，将我们的请求都写在对应的页面中，比较难以维护，所以可以将请求再次进行封装，类似如下效果：

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697866555-79220c07-60e2-4261-8c89-6efea200ad07.png)src/apis/showList.js

<font style="color:#595959;">// 导入一次封装的request</font>

<font style="color:#595959;">import request from "@/utils/request";</font>

<font style="color:#595959;">// 请求list数据</font>

<font style="color:#595959;">export function getListInfo1() {</font>

<font style="color:#595959;">  return request.get("/list");</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">// 请求user数据</font>

<font style="color:#595959;">export function getUserInfo1() {</font>

<font style="color:#595959;">  return request.get("/user");</font>

<font style="color:#595959;">}</font>

showList.vue

<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { getListInfo1, getUserInfo1 } from '../apis/showList'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'ShowList',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        async getList1() { </font>

<font style="color:#595959;">          //	调用请求函数</font>

<font style="color:#595959;">            let res = await getListInfo1()</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        async getUser1() {</font>

<font style="color:#595959;">            let res = await getUserInfo1()</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>
