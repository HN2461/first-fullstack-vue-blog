---
title: "ess"
slug: "javascriptes6-ess-08fde5e4"
summary: ""
category: "青鸟版三剑客"
tags: []
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0d6"
originalSlug: "javascriptes6-ess-08fde5e4"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
## 1、let 
<font style="color:#000000;">let 关键字用来声明变量，使用let 声明的变量有几个特点：</font>

<font style="color:#000000;">1) 不允许重复声明</font>

<font style="color:#000000;">2) 块儿级作用域</font>

<font style="color:#000000;">3) 不存在变量提升</font>

<font style="color:#000000;">4) 不影响作用域链</font>

<font style="color:#000000;">5) 暂时性死区</font>

<font style="color:#000000;">6）不与顶级对象挂钩</font>

在代码块内，使用let命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”。该变量在声明之前使用都属于“暂时性死区“。

<font style="color:#FF0000;">应用场景：以后声明变量使用let 就对了</font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      //声明变量格式</font>

<font style="color:#595959;">      let a;</font>

<font style="color:#595959;">      let b, c, d;</font>

<font style="color:#595959;">      let e = 100;</font>

<font style="color:#595959;">      let f = 521,</font>

<font style="color:#595959;">        g = "iloveyou",</font>

<font style="color:#595959;">        h = [];</font>





<font style="color:#595959;">      //1. 变量不能重复声明，防止变量被污染</font>

<font style="color:#595959;">      // let star = '王老师';</font>

<font style="color:#595959;">      // let star = '余老师';  //会报错</font>





<font style="color:#595959;">      //2. 块儿级作用域  避免暴露成全程作用域，影响别人</font>

<font style="color:#595959;">     {</font>

<font style="color:#595959;">          let girl = '王老师';</font>

<font style="color:#595959;">          var boy='张老师'</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(girl);//报错</font>

<font style="color:#595959;">      console.log(boy);//张老师</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      // if  else  while  for  这些语句里，都是有块级作用域的</font>

<font style="color:#595959;">       //for 循环的计算器，就很合适let命令</font>

<font style="color:#595959;">      for(let i=0;i<3;i++){</font>

<font style="color:#595959;">        console.log(i);//0,1,2</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(i);//报错</font>





<font style="color:#595959;">      //3. 不影响作用域链</font>

<font style="color:#595959;">      //作用域链：内层作用域 ——> 外层作用域 ——> 全局作用域</font>

<font style="color:#595959;">      {</font>

<font style="color:#595959;">        let school = "bdqn";</font>

<font style="color:#595959;">        function fn() {</font>

<font style="color:#595959;">          console.log(school);//在fn作用域没有，还是会向上寻找</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        fn();</font>

<font style="color:#595959;">      }</font>





<font style="color:#595959;">      //4. 不存在变量提升</font>

<font style="color:#595959;">      // console.log(song);</font>

<font style="color:#595959;">      // let song = '恋爱达人';</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">        // 5、let暂时性死区</font>

<font style="color:#595959;">      var a = 1;</font>

<font style="color:#595959;">      if (true) {</font>

<font style="color:#595959;">        a = 2; // 报错，初始化前不能访问a,也就是在同一个作用域中，不可以访问，再定义</font>

<font style="color:#595959;">        let a = 1;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">       // 6、 不与顶层对象挂钩</font>

<font style="color:#595959;">      var myname='zhangsan'</font>

<font style="color:#595959;">      let myage=18</font>

<font style="color:#595959;">      console.log(window.myname);//zhangsan</font>

<font style="color:#595959;">      console.log(window.myage);//undefined</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">    </script></font>

## 2、const
<font style="color:#000000;">const 关键字用来声明常量，const 声明有以下特点</font>

<font style="color:#000000;">1) 声明必须赋初始值</font>

<font style="color:#000000;">2) 标识符一般为大写（建议）</font>

<font style="color:#000000;">3) 不允许重复声明</font>

<font style="color:#000000;">4) 值不允许修改</font>

const实际上保存的，并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。

但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，const只能保证这个指针是固定的（即总是指向另一个固定的地址），至于它指向的数据结构是不是可变的，就完全不能控制了。

<font style="color:#FF0000;">注意: 对象属性修改和数组元素变化不会出发const 错误, 对象地址不可改变。</font>

<font style="color:#000000;">5) 块儿级作用域</font>

6)、 不与顶层对象挂钩

<font style="color:#FF0000;">应用场景：声明对象类型使用const，非对象类型声明选择let</font>

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        //声明常量</font>

<font style="color:#595959;">        const SCHOOL = 'bdqn';</font>

<font style="color:#595959;">        //注意事项</font>

<font style="color:#595959;">        //1. 一定要赋初始值</font>

<font style="color:#595959;">        // const A;</font>

<font style="color:#595959;">        //2. 一般常量使用大写(潜规则)</font>

<font style="color:#595959;">        // const a = 100;</font>

<font style="color:#595959;">        //3. 常量的值不能修改</font>

<font style="color:#595959;">        // SCHOOL = 'bdqn';</font>

<font style="color:#595959;">        //4. 块儿级作用域</font>

<font style="color:#595959;">        // {</font>

<font style="color:#595959;">        //     const PLAYER = 'UZI';</font>

<font style="color:#595959;">        // }</font>

<font style="color:#595959;">        // console.log(PLAYER);</font>

<font style="color:#595959;">        //5. 对于数组和对象的元素修改, 不算做对常量的修改, 不会报错</font>

<font style="color:#595959;">        const TEAM = ['UZI','MXLG','Ming','Letme'];</font>

<font style="color:#595959;">        // TEAM.push('Meiko');</font>

<font style="color:#595959;">          // 6、 不与顶层对象挂钩</font>

<font style="color:#595959;">      var myname = "zhangsan";</font>

<font style="color:#595959;">      const myage = 18;</font>

<font style="color:#595959;">      console.log(window.myname); //zhangsan</font>

<font style="color:#595959;">      console.log(window.myage); //undefined</font>

<font style="color:#595959;">    </script></font>

<font style="color:#F33232;">面试题1．let和const的区别（/var，let，const的区别？）</font>

let声明的变量可以改变，值和类型都可以改变（let：声明的是变量）；

const声明的常量不可以改变，这意味着，const一旦声明，就必须立即初始化，不能以后再赋值，当然数组和对象等复合类型的变量，变量名不指向数据，而是指向数据所在的地址。

const只保证变量名指向的地址不变，并不保证该地址的数据不变。

<font style="color:#FF0001;">let和const总结</font>

let 声明的变量会产生块作用域，var 不会产生块作用域

const 声明的常量也会产生块作用域

不同代码块之间的变量无法互相访问

注意: 对象属性修改和数组元素变化不会出发 const 错误 （数组和对象存的是引用地址）

应用场景：声明对象类型使用 const，非对象类型声明选择 let

cosnt声明必须赋初始值，标识符一般为大写，值不允许修改。

## 3、变量的解构赋值
<font style="color:#000000;">ES6 允许按照一定模式，从数组和对象中快速的提取成员，对变量进行赋值，这被称为</font><font style="color:#F33232;">解构赋值。</font>

本质上，只要等号两边的模式相同，左边的变量就会被赋予对应的值。

### 1>解构分类
#### （1）、数组的解构
ES6中允许从数组中提取值，按照对应位置，对变量赋值

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        //数组的解构</font>

<font style="color:#595959;">        const F4 = ['小沈阳','刘能','赵四','宋小宝'];</font>

<font style="color:#595959;">        let [xiao, liu, zhao, song] = F4;</font>

<font style="color:#595959;">        console.log(xiao);</font>

<font style="color:#595959;">        console.log(liu);</font>

<font style="color:#595959;">        console.log(zhao);</font>

<font style="color:#595959;">        console.log(song); </font>

<font style="color:#595959;">        // 省略变量</font>

<font style="color:#595959;">        let [a, , c] = [1, 2, 3]; </font>

<font style="color:#595959;">      console.log(a, c);//1，3</font>

<font style="color:#595959;"></script></font>

#### （2）、对象的解构
对象的解构与数组有一个重要的不同。数组的元素是按顺序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，才能取到正确的值，否则解构失败就是undefined。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        //对象的解构</font>

<font style="color:#595959;">     const zhao = {</font>

<font style="color:#595959;">        name: "赵本山",</font>

<font style="color:#595959;">        age: "不详",</font>

<font style="color:#595959;">        xiaopin: function () {</font>

<font style="color:#595959;">          console.log("我可以演小品");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          list: ["贾玲", "沈腾", "···"],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      let {</font>

<font style="color:#595959;">        name:n,//起别名</font>

<font style="color:#595959;">        age=18,//可以定义默认值</font>

<font style="color:#595959;">        xiaopin,</font>

<font style="color:#595959;">        data: { list },//可以解构下一级数据</font>

<font style="color:#595959;">      } = zhao;</font>

<font style="color:#595959;">      console.log(n);//赵本山</font>

<font style="color:#595959;">      console.log(age);</font>

<font style="color:#595959;">      console.log(xiaopin);</font>

<font style="color:#595959;">      console.log(list);</font>

<font style="color:#595959;">      xiaopin();</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        let {xiaopin} = zhao;</font>

<font style="color:#595959;">        xiaopin();</font>

<font style="color:#595959;">    </script></font>

#### （3）、字符串解构
<font style="color:#595959;">let [a, b, c] = "hello";</font>

<font style="color:#595959;">      console.log(a); //h</font>

<font style="color:#595959;">      console.log(b); //e</font>

<font style="color:#595959;">      console.log(c); //l</font>

<font style="color:#595959;"> let { length } = "hello";</font>

<font style="color:#595959;">      console.log(length);//5</font>

### 2、解构应用
#### （1）、变量值交换
<font style="color:#595959;">let a = 1;</font>

<font style="color:#595959;">let b = 2;</font>

<font style="color:#595959;">[a, b] = [b, a];</font>

<font style="color:#595959;">console.log(a);</font>

#### （2）、函数返回多个值
<font style="color:#595959;"> function myfun() {</font>

<font style="color:#595959;">          return [2, 3, 4];</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        let [a, b, c] = myfun();</font>

<font style="color:#595959;">        console.log([a, b, c]);//[2, 3, 4]</font>

<font style="color:#595959;">        console.log(a);//2</font>

<font style="color:#595959;">        console.log(b);//3</font>

<font style="color:#595959;">        console.log(c);//4</font>

#### （3）、函数参数传参数
<font style="color:#595959;"> function myfun([a, b, c]) {</font>

<font style="color:#595959;">        console.log(a);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      myfun([4, 5, 6]);</font>

## 4、模板字符串
ES6 引入新的声明字符串的方式 『``』 '' ""

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">        //1. 声明</font>

<font style="color:#595959;">        // let str = `我是一个字符串哦!`;</font>

<font style="color:#595959;">        // console.log(str, typeof str);</font>



<font style="color:#595959;">        //2. 内容中可以直接出现换行符</font>

<font style="color:#595959;">        let str = `<ul></font>

<font style="color:#595959;">                    <li>孙悟空</li></font>

<font style="color:#595959;">                    <li>猪八戒</li></font>

<font style="color:#595959;">                    <li>沙悟净</li></font>

<font style="color:#595959;">                    <li>白骨精</li></font>

<font style="color:#595959;">                    </ul>`;</font>

<font style="color:#595959;">        //3. 变量拼接 ${lovest}</font>

<font style="color:#595959;">        let lovest = '沈腾';</font>

<font style="color:#595959;">        let out = `${lovest}是我心目中最搞笑的演员!!`;</font>

<font style="color:#595959;">        console.log(out);</font>

<font style="color:#595959;">    </script></font>

## 5、字符串扩展
### （1）、 includes函数
<font style="color:#333333;">判断字符串中是否存在指定字符，返回布尔值，</font> 语法：string.includes("xxx")

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      let myname = "hello";</font>

<font style="color:#595959;">      console.log(myname.includes("e")); //true</font>

<font style="color:#595959;">      console.log(myname.startsWith("o")); //false</font>

<font style="color:#595959;">      console.log(myname.endsWith("k")); //false</font>

<font style="color:#595959;">    </script>	</font>

### （2）、repeat函数
<font style="color:#333333;">repeat()方法返回一个新字符串,表示将原字符串重复n次。</font>str.repeat(数值)

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      let res = "hello";</font>

<font style="color:#595959;">      console.log(res.repeat(1)); //hello</font>

<font style="color:#595959;">      console.log(res.repeat(0)); //""</font>

<font style="color:#595959;">      console.log(res.repeat(2.5)); //hellohello</font>

<font style="color:#595959;">      console.log(res.repeat("2"); //hellohello</font>

<font style="color:#595959;">    </script></font>

## 6、数值扩展
### （1）、Number.EPSILON 
JavaScript 表示的最小精度，一般用在浮点数运算上，

EPSILON 属性的值接近于 2.2204460492503130808472633361816E-16

<font style="color:#595959;">console.log(0.1 + 0.2 === 0.3);//false</font>

<font style="color:#595959;">  </font>

<font style="color:#595959;">      function equal(a, b) {</font>

<font style="color:#595959;">        if (Math.abs(a - b) < Number.EPSILON) {</font>

<font style="color:#595959;">          return true;</font>

<font style="color:#595959;">        } else {</font>

<font style="color:#595959;">          return false;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(equal(0.1 + 0.2, 0.3));//true</font>

### <font style="color:#000000;">（2）</font>二进制和八进制
<font style="color:#595959;">   let b = 0b1010;// 0b开头 二进制</font>

<font style="color:#595959;">      let o = 0o77;// 0o开头 八进制</font>

<font style="color:#595959;">      let d = 100; //十进制</font>

<font style="color:#595959;">      let x = 0xff;//0x开头 十六进制</font>

### （3）、 Number.isFinite
<font style="color:#4D4D4D;">如果传递的值是有限数字，则返回true。 布尔值，字符串，对象，数组等所有其他内容均返回false：</font>

<font style="color:#595959;">console.log(Number.isFinite(100));//true</font>

<font style="color:#595959;">console.log(Number.isFinite(100/0));//false</font>

<font style="color:#595959;">console.log(Number.isFinite(Infinity));//false</font>

<font style="color:#595959;">console.log(Number.isFinite(NaN));  //false</font>

### （4）、 Number.isNaN 
检测一个数值是否为 NaN,<font style="color:#333333;">只有对于NaN才返回true，非NaN一律返回false。</font>

<font style="color:#595959;">console.log(Number.isNaN(123));//false</font>

### （5）、Number.parseInt Number.parseFloat
字符串转整数,必须以数字开头

<font style="color:#595959;">console.log(Number.parseInt('5211314love'));</font>

<font style="color:#595959;"> console.log(Number.parseFloat('3.1415926神奇'));</font>

### （6）、 Number.isInteger 
判断一个数是否为整数

<font style="color:#595959;"> console.log(Number.isInteger(5));//true</font>

<font style="color:#595959;"> console.log(Number.isInteger(2.5));//false</font>

### （7）、Math.trunc 
将数字的小数部分抹掉

<font style="color:#595959;">console.log(Math.trunc(3.5));//3</font>

### （8）、Math.sign 
判断一个数到底为正数负数还是零,<font style="color:#333333;">对于非数值，会先将其转换为数值。</font>

<font style="color:#595959;">console.log(Math.sign(100));//1</font>

<font style="color:#595959;">console.log(Math.sign(0));//0</font>

<font style="color:#595959;">console.log(Math.sign(-20000));//-1	</font>

## 7、数组扩展
### （1）、Array.from()方法
将伪数组或可遍历对象转换为真正的数组。

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      //   举例1：</font>

<font style="color:#595959;">      Array.from("12345"); // [1,2,3,4,5]</font>

<font style="color:#595959;">      //   举例2：</font>

<font style="color:#595959;">      let arr1 = {</font>

<font style="color:#595959;">        1: "a",</font>

<font style="color:#595959;">        2: "b",</font>

<font style="color:#595959;">        length: 3,</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      console.log(Array.from(arr1)); // [undefined, 'a', 'b']</font>

<font style="color:#595959;">      //举例3</font>

<font style="color:#595959;">      function test() {</font>

<font style="color:#595959;">        console.log(Array.from(arguments));// [1, 2, 3]</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      test(1, 2, 3);</font>



<font style="color:#595959;">       //举例4:选择器</font>

<font style="color:#595959;">      let divs = document.querySelectorAll("div");</font>

<font style="color:#595959;">      console.log(Array.from(divs));//[div, div, div]</font>

<font style="color:#595959;">    </script></font>

### （2）、array.find() 方法
该方法主要应用于查找第一个符合条件的数组元素 

它的参数是一个回调函数。

在回调函数中可以写你要查找元素的条件,当条件成立为true时,返回该元素。

如果没有符合条件的元素,返回值为undefined

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //   举例1：</font>

<font style="color:#595959;">      let arr1 = [1, 2, 3, 2];</font>

<font style="color:#595959;">      let res = arr1.find((item) => {</font>

<font style="color:#595959;">        //   console.log(item,'item');</font>

<font style="color:#595959;">        //return item>2</font>

<font style="color:#595959;">        return  item == 2</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      console.log(res); //2, 如果未找到，返回undefined</font>



<font style="color:#595959;">      //   举例2：</font>

<font style="color:#595959;">      let person = [</font>

<font style="color:#595959;">        { name: "张三", age: 16 },</font>

<font style="color:#595959;">        { name: "李四", age: 17 },</font>

<font style="color:#595959;">        { name: "王五", age: 18 },</font>

<font style="color:#595959;">      ];</font>



<font style="color:#595959;">      let target = person.find((item, index) => {</font>

<font style="color:#595959;">        return  item.name == "张三";</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      console.log(target.name);//张三</font>

<font style="color:#595959;">    </script></font>

### （3）、array.findindex()方法
定义：用于找出第一个符合条件的数组成员的位置，如果没有找到返回-1。

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      let ary = [1,5, 10, 15];</font>

<font style="color:#595959;">      let index = ary.findIndex((item, index) => {</font>

<font style="color:#595959;">        return item > 9;</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      console.log(index); // 2   第一个比9大的数字在索引值为2的部位</font>

<font style="color:#595959;">    </script></font>

### （4）、array.includes()方法
定义：判断某个数组是否包含给定的值，返回布尔值。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      let ary = [1, 5, 10, 15];</font>

<font style="color:#595959;">      console.log(ary.includes(5)); //true</font>

<font style="color:#595959;">    </script></font>

### （5）、Array.of()方法
将一组值转化为数组,即新建数组

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      let arr1 = new Array(3);</font>

<font style="color:#595959;">      console.log(arr1); // [,,]</font>

<font style="color:#595959;">      let arr2 = Array.of(3);</font>

<font style="color:#595959;">      console.log(arr2); // [3]</font>

<font style="color:#595959;">    </script></font>

### （6）、fill方法
使用自己想要的参数替换原数组内容,但是会改变原来的数组

可以传多个参数

1个参数：默认从数组第一位开始替换

2个参数：（替换的值，替换索引位置）

3个参数：（替换的值，替换索引开始位置，替换索引结束位置【不包括】）

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      let arr1 = new Array(3).fill("hello");</font>

<font style="color:#595959;">      let arr2 = ["猪八戒", "孙悟空", "唐僧"].fill("kerwin", 1, 2);</font>

<font style="color:#595959;">      console.log(arr1); // ['hello', 'hello', 'hello']</font>

<font style="color:#595959;">      console.log(arr2); //  ['猪八戒', 'kerwin', '唐僧']</font>

<font style="color:#595959;">    </script></font>

### （7）、最新数组方法
[https://blog.csdn.net/m0_64346035/article/details/124368893](https://blog.csdn.net/m0_64346035/article/details/124368893" \t "_blank)

### <font style="color:#000000;">（8）、spread 扩展运算符</font>
<font style="color:#000000;">扩展运算符（spread）也是三个点（...）。它好比rest 参数的逆运算，将一个数组转为用逗号分隔的参数序列，对数组进行解包。</font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">        // 『...』 扩展运算符能将『数组』转换为逗号分隔的『参数序列』</font>

<font style="color:#595959;">        //声明一个数组 ...</font>

<font style="color:#595959;">        const tfboys = ['易烊千玺','王源','王俊凯'];</font>

<font style="color:#595959;">        // => '易烊千玺','王源','王俊凯'</font>





<font style="color:#595959;">        // 声明一个函数</font>

<font style="color:#595959;">        function chunwan(){</font>

<font style="color:#595959;">            console.log(arguments);</font>

<font style="color:#595959;">        }</font>





<font style="color:#595959;">        chunwan(...tfboys);// chunwan('易烊千玺','王源','王俊凯')</font>

<font style="color:#595959;">    </script></font>

扩展运算符的应用

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <div></div></font>

<font style="color:#595959;">    <div></div></font>

<font style="color:#595959;">    <div></div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">        //1. 数组的合并 </font>

<font style="color:#595959;">        const kuaizi = ['王太利','肖央'];</font>

<font style="color:#595959;">        const fenghuang = ['曾毅','玲花'];</font>

<font style="color:#595959;">        // 数组的合并 第一种方式</font>

<font style="color:#595959;">        // const zuixuanxiaopingguo = kuaizi.concat(fenghuang);</font>

<font style="color:#595959;">        // 数组的合并 第二种方式</font>

<font style="color:#595959;">        const zuixuanxiaopingguo = [...kuaizi, ...fenghuang];</font>

<font style="color:#595959;">        console.log(zuixuanxiaopingguo);</font>





<font style="color:#595959;">        //2. 数组的克隆（深拷贝）</font>

<font style="color:#595959;">        const sanzhihua = ['E','G','M'];</font>

<font style="color:#595959;">        const sanyecao = [...sanzhihua];//  ['E','G','M']</font>

<font style="color:#595959;">        console.log(sanyecao);</font>





<font style="color:#595959;">        //3. 将伪数组转为真正的数组</font>

<font style="color:#595959;">        const divs = document.querySelectorAll('div');</font>

<font style="color:#595959;">        const divArr = [...divs];</font>

<font style="color:#595959;">        console.log(divArr);// arguments    </font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;"></body></font>

## 8、对象拓展
ES6 新增了一些 Object 对象的方法

### （1)、简写对象
<font style="color:#000000;">ES6 允许在大括号里面，直接写入变量和函数，作为对象的属性和方法。这样的书写更加简洁。</font>

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        //ES6 允许在大括号里面，直接写入变量和函数，作为对象的属性和方法。</font>

<font style="color:#595959;">        //这样的书写更加简洁</font>

<font style="color:#595959;">        let name = 'bdqn';</font>

<font style="color:#595959;">        let change = function(){</font>

<font style="color:#595959;">            console.log('我们可以改变你!!');</font>

<font style="color:#595959;">        }</font>



<font style="color:#595959;">       const school = {</font>

<font style="color:#595959;">        // name:name,//属性名和变量值一样，可以简写一个</font>

<font style="color:#595959;">        name,</font>

<font style="color:#595959;">        change, //外部定义的函数</font>

<font style="color:#595959;">        fun: function () {</font>

<font style="color:#595959;">          console.log("我是复杂写法");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        improve() {</font>

<font style="color:#595959;">          //直接在对象里定义函数</font>

<font style="color:#595959;">          console.log("我是简写");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">        console.log(school);</font>

<font style="color:#595959;">    </script></font>

<font style="color:#FF0000;">注意：对象简写形式简化了代码，所以以后用简写就对了</font>

### （2)、 Object.is 
比较两个值是否严格相等，与『===』行为基本一致 （+0 与 NaN）

<font style="color:#595959;">console.log(Object.is(120, 120));// === </font>

<font style="color:#595959;">console.log(Object.is(NaN, NaN));// true</font>

<font style="color:#595959;">console.log(NaN === NaN);// false</font>

### （3) 、Object.assign 
对象的合并，将原对象的所有可枚举属性，复制到目标对象，后面的对象会覆盖前面的对象一样的属性

Object.assign(target, object1，object2)的第一个参数是目标对象，后面可以跟一个或多个源对象作为参数。

target：参数合并后存放的对象

object1：参数1

object2：参数2

<font style="color:#595959;">const obj1 = {</font>

<font style="color:#595959;">        name: "tom",</font>

<font style="color:#595959;">        age: 18,</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      const obj2 = {</font>

<font style="color:#595959;">        name: "bob",</font>

<font style="color:#595959;">        age: 28,</font>

<font style="color:#595959;">        sex: "男",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      console.log(Object.assign(obj1, obj2));</font>

<font style="color:#595959;">      //{name: 'bob', age: 28, sex: '男'}</font>

### （4) 、setPrototypeOf、 getPrototypeOf 
可以直接设置对象的原型，不建议使用

setPrototypeOf(school, cities)

参数1:给谁设置原型对象 school

参数2:设置哪个原型对象 cities

<font style="color:#595959;">const school = {</font>

<font style="color:#595959;">        name: "bdqn",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      const cities = {</font>

<font style="color:#595959;">        xiaoqu: ["北京", "上海", "深圳"],</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 设置原型</font>

<font style="color:#595959;">      Object.setPrototypeOf(school, cities);</font>

<font style="color:#595959;">      // 获取原型</font>

<font style="color:#595959;">      Object.getPrototypeOf(school);</font>

<font style="color:#595959;">      console.log(school);</font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697920500-374f5961-643f-414c-9e3d-b9b14f77d405.png)

## 9、函数扩展
### 1>、箭头函数
<font style="color:#000000;">ES6 允许使用「箭头」（=>）定义函数。</font>

<font style="color:#333333;">箭头函数只能简写函数表达式，不能简写声明式函数</font>

<font style="color:#595959;"> function fn() {} // 不能简写</font>

<font style="color:#595959;"> const fun = function () {}; // 可以简写</font>

<font style="color:#595959;">const obj = {</font>

<font style="color:#595959;">fn: function () {}, // 可以简写</font>

<font style="color:#595959;">};</font>

#### （1）、 语法：() =>{} 
():函数的形参 

=>:必须的语法，指向代码块

{}:代码块

<font style="color:#595959;">   <script> </font>

<font style="color:#595959;">       // ES6 允许使用「箭头」（=>）定义函数。</font>

<font style="color:#595959;">      //声明一个函数</font>

<font style="color:#595959;">      /* let fn = function(){</font>

<font style="color:#595959;">         } */</font>

<font style="color:#595959;">         </font>

<font style="color:#595959;">     /*  let fn = (a,b) => {</font>

<font style="color:#595959;">          return a + b;</font>

<font style="color:#595959;">      } */</font>

<font style="color:#595959;">      //调用函数</font>

<font style="color:#595959;">      // let result = fn(1, 2);</font>

<font style="color:#595959;">      // console.log(result);</font>

<font style="color:#595959;">       </script> </font>

#### （2）、箭头函数的特性
this 是静态的. this 始终指向函数声明时所在作用域下的 this 的值，没有自己的this

不能作为构造实例化对象 会报错

不能使用 arguments 变量

箭头函数的简写

1) 省略小括号, 当形参有且只有一个的时候

2) 函数体如果只有一条语句，则花括号可以省略，函数的返回值为该条语句的

执行结果

<font style="color:#595959;"> <script>    </font>

<font style="color:#595959;">      //箭头函数的特性</font>

<font style="color:#595959;">      //1. this 是静态的. this 始终指向函数声明时所在作用域下的 this 的值，没有自己的this</font>

<font style="color:#595959;">      function getName() {</font>

<font style="color:#595959;">        console.log(this.name);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      let getName2 = () => {</font>

<font style="color:#595959;">        console.log(this.name);</font>

<font style="color:#595959;">      };</font>





<font style="color:#595959;">      //设置 window 对象的 name 属性</font>

<font style="color:#595959;">      window.name = "北大青鸟";</font>

<font style="color:#595959;">      const school = {</font>

<font style="color:#595959;">        name: "bdqn",</font>

<font style="color:#595959;">      };</font>





<font style="color:#595959;">      //直接调用，this指向window</font>

<font style="color:#595959;">      // getName();</font>

<font style="color:#595959;">      // getName2();</font>





<font style="color:#595959;">      //call 方法调用</font>

<font style="color:#595959;">      // getName.call(school);  //指向school</font>

<font style="color:#595959;">      // getName2.call(school);  //指向window</font>





<font style="color:#595959;">      //2. 不能作为构造实例化对象  会报错</font>

<font style="color:#595959;">   /*    let Person = (name, age) => {</font>

<font style="color:#595959;">          this.name = name;</font>

<font style="color:#595959;">          this.age = age;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      let me = new Person('xiao',30);</font>

<font style="color:#595959;">      console.log(me); */</font>





<font style="color:#595959;">      //3. 不能使用 arguments 变量</font>

<font style="color:#595959;">   /*    let fn = () => {</font>

<font style="color:#595959;">          console.log(arguments);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      fn(1,2,3); */</font>





<font style="color:#595959;">      //4. 箭头函数的简写</font>

<font style="color:#595959;">      //1) 省略小括号, 当形参有且只有一个的时候</font>

<font style="color:#595959;">    /*   let add = n => {</font>

<font style="color:#595959;">          return n + n;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      console.log(add(9)); */</font>

<font style="color:#595959;">      //2) 省略花括号, 当代码体只有一条语句的时候, 此时 return 必须省略</font>

<font style="color:#595959;">      // 而且语句的执行结果就是函数的返回值</font>

<font style="color:#595959;">     /*  let pow = (n) => n * n;</font>

<font style="color:#595959;">      console.log(pow(8)); */</font>

<font style="color:#595959;">    </script></font>

<font style="color:#FF0000;">注意：箭头函数不会更改this 指向，用来指定回调函数会非常合适</font>

<font style="color:#F33232;">补充this指向问题汇总</font>

##### 1、作为普通函数被调用时--<font style="color:#4D4D4D;">this指向全局对象window</font>
<font style="color:#595959;">window.age = 18;</font>

<font style="color:#595959;">    function fn() {</font>

<font style="color:#595959;">        console.log(this.age);//18</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    fn()</font>

##### <font style="color:#4D4D4D;">2、</font>对象方法里的this
当函数作为对象方法被调用时this指向该对象

<font style="color:#595959;"> var obj = {</font>

<font style="color:#595959;">        age: 18,</font>

<font style="color:#595959;">        fn: function () {</font>

<font style="color:#595959;">            console.log(this === obj);//true</font>

<font style="color:#595959;">            console.log(this.age);//18</font>

<font style="color:#595959;">        }</font>



<font style="color:#595959;">    }</font>

<font style="color:#595959;">    console.log(obj.fn());</font>

##### <font style="color:#4D4D4D;">3、</font>构造函数里面的this
构造函数里的this指向 new创建的实例化对象(没有return的情况下)

如果构造函数内出现了return并且是一个object对象那么最终的运算结果返回这个对象

只要构造函数不返回数据或者返回基本数据类型 this仍然指向实例

<font style="color:#595959;">  function Fn() {</font>

<font style="color:#595959;">        this.age = 18;</font>

<font style="color:#595959;">        //此时a.age是return的结果20</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">          age: 20,</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      let a = new Fn();</font>

<font style="color:#595959;">      console.log(a.age); //20</font>

##### <font style="color:#4D4D4D;">4、</font>call&& apply&&bind
在function的原型上有三个方法 call apply bind,所有函数都是Function的实例,所以所有的函数都可以调用这三个方法,而这三个方法都是用来改变this指向的

定义：call(thisObj，Object) 调用一个对象的一个方法，以另一个对象替换当前对象。

说明：call 方法可以用来代替另一个对象调用一个方法。call 方法可将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象。如果没有提供 thisObj 参数，那么 Global 对象被用作 thisObj。

<font style="color:#595959;">function fn(x, y) {</font>

<font style="color:#595959;">    console.log('加油');</font>

<font style="color:#595959;">    console.log(this);//this指向window</font>

<font style="color:#595959;">    console.log(x + y);</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">var o = {</font>

<font style="color:#595959;">    name: 'andy'</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;">fn.call()//call 呼叫 可以调用函数</font>

<font style="color:#595959;">fn.call(o, 1, 2)//第一个值是this指向, 后边实参</font>

<font style="color:#595959;">fn.apply(o, [10, 20])//apply传递数组</font>

<font style="color:#595959;">fn.call(10, 20)//this-->new Numbe(10) x-->20 y-->undefined </font>

##### <font style="color:#4D4D4D;">5、</font>箭头函数中this
箭头函数里面没有自己的this 他只会从自己的作用域链上一层继承this

<font style="color:#595959;"> this.age = 20;</font>

<font style="color:#595959;">    var obj = {</font>

<font style="color:#595959;">        age: 18,</font>

<font style="color:#595959;">        fn: () => {</font>

<font style="color:#595959;">            console.log(this.age);//20</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    obj.fn()</font>

### 2> <font style="color:#000000;">参数默认值</font>
### （1）、 形参初始值 具有默认值的参数, 一般位置要靠后(潜规则)
<font style="color:#595959;">  function add(a, b, c = 10) {</font>

<font style="color:#595959;">        return a + b + c;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //let res1 = add(1, 2, 3);//6</font>

<font style="color:#595959;">      let res2 = add(1,1);//12</font>

<font style="color:#595959;">      cons</font>

<font style="color:#595959;">ole.log(res2);</font>

### （2）、 与解构赋值结合
<font style="color:#595959;">  function connect({ name, age, sex, price = "3000" }) {</font>

<font style="color:#595959;">        console.log(name);</font>

<font style="color:#595959;">        console.log(age);</font>

<font style="color:#595959;">        console.log(sex);</font>

<font style="color:#595959;">        console.log(price);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      connect({</font>

<font style="color:#595959;">        name: "章三",</font>

<font style="color:#595959;">        age: 20,</font>

<font style="color:#595959;">        sex: "男",</font>

<font style="color:#595959;">        // price: 4000,</font>

<font style="color:#595959;">      });</font>

### （3）、这个默认值的方式箭头函数也可以使用
<font style="color:#595959;">const fn = (a = 10) => {</font>

<font style="color:#595959;">        console.log(a);</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      fn(); // 不传递参数的时候，函数内部的 a 就是 10</font>

<font style="color:#595959;">      fn(20); // 传递了参数 20 的时候，函数内部的 a 就是 20</font>

注意： 箭头函数如果你需要使用默认值的话，那么一个参数的时候也需要写（）

## <font style="color:#000000;">10、rest 参数</font>
<font style="color:#000000;">ES6 引入rest 参数，用于获取函数的实参，用来代替arguments</font>

<font style="color:#595959;">   <script></font>

<font style="color:#595959;">      // ES5 获取实参的方式</font>

<font style="color:#595959;">    /*   function date(){</font>

<font style="color:#595959;">          console.log(arguments);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      date('大白','二黑','三孩'); */</font>





<font style="color:#595959;">      // rest 参数</font>

<font style="color:#595959;">     /*  function date(...args) {</font>

<font style="color:#595959;">        console.log(args); // filter some every map</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      date("大白", "二黑", "三孩"); */</font>





<font style="color:#595959;">      // rest 参数必须要放到参数最后</font>

<font style="color:#595959;">    /*   function fn(a,b,...args){</font>

<font style="color:#595959;">          console.log(a);</font>

<font style="color:#595959;">          console.log(b);</font>

<font style="color:#595959;">          console.log(args);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      fn(1,2,3,4,5,6); */</font>

<font style="color:#595959;">    </script></font>

<font style="color:#FF0000;">注意：rest 参数非常适合不定个数参数函数的场景</font>

## 11、Symbol
### <font style="color:#000000;">（1）、Symbol 基本使用</font>
<font style="color:#000000;">ES6 引入了一种新的原始数据类型Symbol，表示独一无二的值。它是JavaScript 语言的第七种数据类型，是一种类似于字符串的数据类型。</font>

undefined string symbol object null number boolean 

<font style="color:#000000;">Symbol 特点</font>

<font style="color:#000000;">1) Symbol 的值是唯一的，用来解决命名冲突的问题</font>

<font style="color:#000000;">2) Symbol 值不能与其他数据进行运算</font>

<font style="color:#000000;">3) Symbol 定义的对象属性不能使用for…in 循环遍历，但是可以使用Reflect.ownKeys 来获取对象的所有键名</font>

<font style="color:#FF0000;">注: 遇到唯一性的场景时要想到Symbol</font>

<font style="color:#595959;">script></font>

<font style="color:#595959;">        //创建方式</font>

<font style="color:#595959;">        //创建Symbol方式1</font>

<font style="color:#595959;">        let s = Symbol();</font>

<font style="color:#595959;">        // console.log(s, typeof s);</font>

<font style="color:#595959;">        //创建方式2</font>

<font style="color:#595959;">      //  Symbol()函数可以接受一个字符串作为参数，</font>

<font style="color:#595959;">      //  表示对 Symbol 实例的描述。这主要是为了在控制台显示，比较容易区分。</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">        let s2 = Symbol('bdqn');//'bdqn'这个内容只是个标识</font>

<font style="color:#595959;">        let s3 = Symbol('bdqn');</font>

<font style="color:#595959;">        console.log('s2===s3',s2===s3);//false</font>

<font style="color:#595959;">        // 创建方式3  Symbol.for  </font>

<font style="color:#595959;">        // Symbol.for并不是每次都会创建一个新的symbol，它会先检索symbol表中是否有，没有再创建新的，有就返回上次存储的</font>

<font style="color:#595959;">        let s4 = Symbol.for('bdqn');</font>

<font style="color:#595959;">        let s5 = Symbol.for('bdqn');</font>

<font style="color:#595959;">        console.log('s4===s5',s4===s5);//true</font>

<font style="color:#595959;">        //注意事项</font>

<font style="color:#595959;">        //1:不能与其他数据进行运算</font>

<font style="color:#595959;">        //    let result = s + 100;</font>

<font style="color:#595959;">        //    let result = s > 100;</font>

<font style="color:#595959;">        //    let result = s + s;</font>

<font style="color:#595959;">    </script></font>

### （2）、Symbol创建对象属性
<font style="color:#000000;">可以给对象添加属性和方法</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //向对象中添加方法 up down</font>

<font style="color:#595959;">      let game = {</font>

<font style="color:#595959;">        name: "俄罗斯方块",</font>

<font style="color:#595959;">        up: function () {},</font>

<font style="color:#595959;">        down: function () {},</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      //声明一个对象</font>

<font style="color:#595959;">      /* let methods = {</font>

<font style="color:#595959;">        up: Symbol(),</font>

<font style="color:#595959;">        down: Symbol(),</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      game[methods.up] = function () {</font>

<font style="color:#595959;">        console.log("我可以改变形状");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      game[methods.down] = function () {</font>

<font style="color:#595959;">        console.log("我可以快速下降!!");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      console.log(game); */</font>



<font style="color:#595959;">        let youxi = {</font>

<font style="color:#595959;">            name:"狼人杀",</font>

<font style="color:#595959;">            [Symbol('say')]: function(){</font>

<font style="color:#595959;">                console.log("我可以发言")</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">            [Symbol('zibao')]: function(){</font>

<font style="color:#595959;">                console.log('我可以自爆');</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      console.log(youxi);</font>

<font style="color:#595959;">    </script></font>

### （3）、Symbol的内置对象
<font style="color:#000000;">除了定义自己使用的Symbol 值以外，ES6 还提供了11 个内置的Symbol 值，指向语言内部使用的方法。可以称这些方法为魔术方法，因为它们会在特定的场景下自动执行。</font>

| Symbol.hasInstance | 当其他对象使用instanceof运算符，判断是否为该对象的实例时，会调用这个方法 |
| --- | --- |
| Symbol.isConcatSpreadable | 对象的Symbol.isConcatSpreadable属性等于的是一个布尔值，表示该对象用于Array.prototype.concat()时，是否可以展开。 |
| Symbol.species | 创建衍生对象时，会使用该属性 |
| Symbol.match | 当执行str.match(myObject)时，如果该属性存在，会调用它，返回该方法的返回值。 |
| Symbol.replace | 当该对象被str.replace(myObject)方法调用时，会返回该方法的返回值。 |
| Symbol.search | 当该对象被str.search(myObject)方法调用时，会返回该方法的返回值。 |
| Symbol.split | 当该对象被str.split(myObject)方法调用时，会返回该方法的返回值。 |
| Symbol.iterator | 对象进行for...of循环时，会调用Symbol.iterator方法，返回该对象的默认遍历器 |
| Symbol.toPrimitive | 该对象被转为原始类型的值时，会调用这个方法，返回该对象对应的原始类型值。 |
| Symbol.toStringTag | 在该对象上面调用toString方法时，返回该方法的返回值 |
| Symbol.unscopables | 该对象指定了使用with关键字时，哪些属性会被with环境排除。 |


## 12、迭代器
<font style="color:#000000;">遍历器（Iterator）就是一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署Iterator 接口，就可以完成遍历操作。（Iterator 接口就是对象里面的一个属性）</font>

<font style="color:#000000;">Iterator 接口就是对象的一个属性</font>

Iterator 的作用有三个：

一是为各种数据结构，提供一个统一的、简便的访问接口；

二是使得数据结构的成员能够按某种次序排列；

三是 ES6 创造了一种新的遍历命令for...of循环，Iterator 接口主要供for...of循环

<font style="color:#000000;">1) ES6 创造了一种新的遍历命令for...of 循环，Iterator 接口主要供for...of 消费</font>

<font style="color:#000000;">2) 原生具备iterator 接口的数据(可用for of 遍历) </font>

<font style="color:#000000;">a) Array </font>

<font style="color:#000000;">b) Arguments </font>

<font style="color:#000000;">c) Set </font>

<font style="color:#000000;">d) Map </font>

<font style="color:#000000;">e) String </font>

<font style="color:#000000;">f) TypedArray </font>

<font style="color:#000000;">g) NodeList</font>

<font style="color:#000000;">3) 工作原理</font>（1）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。

（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。

（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。

（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。

<font style="color:#000000;">（5） 每调用next 方法返回一个包含value 和done 属性的对象</font>

<font style="color:#000000;">done：是否循环完毕</font>

<font style="color:#F33232;">注: 迭代器就是按照一定的顺序对元素进行遍历的过程</font>

<font style="color:#595959;">   <script></font>

<font style="color:#595959;">      //声明一个数组</font>

<font style="color:#595959;">      const xiyou = ["唐僧", "孙悟空", "猪八戒", "沙僧"];</font>





<font style="color:#595959;">      //使用 for...of 遍历数组   </font>

<font style="color:#595959;">      for (let v of xiyou) {</font>

<font style="color:#595959;">        console.log(v);</font>

<font style="color:#595959;">      }</font>





<font style="color:#595959;">      let iterator = xiyou[Symbol.iterator]();</font>

<font style="color:#595959;">      console.log(iterator);</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      //调用对象的next方法</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">    </script></font>

## 13、生成器
Generator 函数是 ES6 提供的一种异步编程解决方案，<font style="color:#000000;">语法行为与传统函数完全不同</font>

Generator 函数是一个状态机，封装了多个内部状态。

执行 Generator 函数会返回一个遍历器对象，也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

### （1）、生成器基本语法
<font style="color:#4D4D4D;">通过function关键字后的星号(</font><font style="color:#F33232;">*</font><font style="color:#4D4D4D;">)来表示，函数中会用到新的关键字</font><font style="color:#F33232;">yield</font><font style="color:#4D4D4D;">。星号（*）可以紧挨着function关键字，也可以在中间添加一个空格</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //生成器其实就是一个特殊的函数</font>

<font style="color:#595959;">      //异步编程  纯回调函数  node fs  ajax mongodb</font>



<font style="color:#595959;">      //yield 函数代码的分隔符,分割代码</font>

<font style="color:#595959;">      function* cook() {</font>

<font style="color:#595959;">        let i = 1;</font>

<font style="color:#595959;">        console.log(`我被执行了${i}次`);</font>

<font style="color:#595959;">        yield "盛米";</font>

<font style="color:#595959;">        i++;</font>

<font style="color:#595959;">        console.log(`我被执行了${i}次`);</font>

<font style="color:#595959;">        yield "淘米";</font>

<font style="color:#595959;">        i++;</font>

<font style="color:#595959;">        console.log(`我被执行了${i}次`);</font>

<font style="color:#595959;">        yield "煮米";</font>

<font style="color:#595959;">        i++;</font>

<font style="color:#595959;">        console.log(`我被执行了${i}次`);</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      let iterator = cook(); //返回一个迭代器对象，里面有个next()方法</font>

<font style="color:#595959;">      //函数不会一下子执行完毕，会以yield为分割线，调一次next，执行一次</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>

<font style="color:#595959;">      console.log(iterator.next());</font>



<font style="color:#595959;">      //遍历</font>

<font style="color:#595959;">      // for(let v of cook()){</font>

<font style="color:#595959;">      //     console.log(v);</font>

<font style="color:#595959;">      // }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#000000;">代码说明：</font>

<font style="color:#000000;">1) cook</font><font style="color:#4D4D4D;">()前的星号 * 表明它是一个生成器</font>

<font style="color:#000000;">2) 生成器函数返回的结果是迭代器对象，调用迭代器对象的next 方法可以得到yield 语句后的值</font>

<font style="color:#000000;">3) yield 相当于函数的暂停标记，</font><font style="color:#4D4D4D;">每当执行完一条yield语句后函数就会自动停止执行</font><font style="color:#000000;">，也可以认为是函数的分隔符，每调用一次next方法，执行一段代码</font>

<font style="color:#000000;">4) next 方法可以传递实参，作为yield 语句的返回值</font>

<font style="color:#000000;">5）y</font><font style="color:#4D4D4D;">ield关键字只可在生成器内部使用，在其他地方使用会导致程序抛出错误</font>

### （2）、生成器函数参数
概念：next('BBB')传入的参数作为上一个next方法的返回值。

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      function * gen(arg) {</font>

<font style="color:#595959;">        console.log(arg);//AAA</font>

<font style="color:#595959;">        let one = yield "aaa";</font>

<font style="color:#595959;">        console.log(one);//BBB</font>

<font style="color:#595959;">        let two = yield "bbb";</font>

<font style="color:#595959;">        console.log(two);//CCC</font>

<font style="color:#595959;">        let three = yield "ccc";</font>

<font style="color:#595959;">        console.log(three);//DDD</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      //执行获取迭代器对象</font>

<font style="color:#595959;">      let iterator = gen("AAA ");</font>

<font style="color:#595959;">      console.log(iterator.next()); //{value: 'aaa', done: false}</font>

<font style="color:#595959;">      //next方法可以传入的实参，作为yield语句整体返回的结果</font>

<font style="color:#595959;">      console.log(iterator.next("BBB"));</font>

<font style="color:#595959;">      console.log(iterator.next("CCC"));</font>

<font style="color:#595959;">      console.log(iterator.next("DDD"));</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">（3）、生成器函数实例</font>

### （3）、生成器函数实例
<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      // 异步编程   文件操作 网络操作(ajax, request) 数据库操作</font>

<font style="color:#595959;">      // 需求：1s 后控制台输出 111  2s后输出 222  3s后输出 333</font>

<font style="color:#595959;">      // 回调地狱（一层套一层，不停回调）</font>

<font style="color:#595959;">      /* setTimeout(() => {</font>

<font style="color:#595959;">            console.log(111);</font>

<font style="color:#595959;">            setTimeout(() => {</font>

<font style="color:#595959;">                console.log(222);</font>

<font style="color:#595959;">                setTimeout(() => {</font>

<font style="color:#595959;">                    console.log(333);</font>

<font style="color:#595959;">                }, 3000);</font>

<font style="color:#595959;">            }, 2000);</font>

<font style="color:#595959;">        }, 1000); */</font>



<font style="color:#595959;">      // 生成器函数解决回调地域</font>

<font style="color:#595959;">      //生成3个异步函数</font>

<font style="color:#595959;">      function one() {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">          console.log(111);</font>

<font style="color:#595959;">          iterator.next(); //函数one执行完毕后，调用next(),执行下一个异步函数</font>

<font style="color:#595959;">        }, 1000);</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      function two() {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">          console.log(222);</font>

<font style="color:#595959;">          iterator.next(); //函数two执行完毕后，调用next(),执行下一个异步函数</font>

<font style="color:#595959;">        }, 2000);</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      function three() {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">          console.log(333);</font>

<font style="color:#595959;">          iterator.next(); //函数three执行完毕后，调用next(),执行下一个异步函数</font>

<font style="color:#595959;">        }, 3000);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //用生成器函数将三个异步函数放在yield语句中</font>

<font style="color:#595959;">      function* gen() {</font>

<font style="color:#595959;">        yield one();</font>

<font style="color:#595959;">        yield two();</font>

<font style="color:#595959;">        yield three();</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      //调用生成器函数</font>

<font style="color:#595959;">      let iterator = gen();</font>

<font style="color:#595959;">      iterator.next(); //调用一次next执行一个yield语句，这个只会执行one()回调</font>

<font style="color:#595959;">    </script></font>







## 14<font style="color:#000000;">、</font>Promise
### （0）、回调地狱
回调地狱：就是回调函数<font style="color:#FF0000;">嵌套过多</font>导致的

当一个回调函数嵌套一个回调函数的时候

就会出现一个嵌套结构

当嵌套的多了就会出现回调地狱的情况

比如我们发送三个 ajax 请求

第一个正常发送

第二个请求需要第一个请求的结果中的某一个值作为参数

第三个请求需要第二个请求的结果中的某一个值作为参数

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      function fn() {</font>

<font style="color:#595959;">        setTimeout(function () {</font>

<font style="color:#595959;">          console.log("111");</font>

<font style="color:#595959;">          setTimeout(function () {</font>

<font style="color:#595959;">            console.log("222");</font>

<font style="color:#595959;">            setTimeout(function () {</font>

<font style="color:#595959;">              console.log("333");</font>

<font style="color:#595959;">            }, 1000);</font>

<font style="color:#595959;">          }, 2000);</font>

<font style="color:#595959;">        }, 3000);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      fn();</font>

<font style="color:#595959;">    </script></font>

### （1）、什么是promise
<font style="color:#0D0016;">Promise是</font><font style="color:#FE2C24;">ES6</font><font style="color:#0D0016;">异步编程的一种</font><font style="color:#FE2C24;">解决方案</font><font style="color:#0D0016;">(目前最先进的解决方案是async和await的搭配（</font><font style="color:#FE2C24;">ES8</font><font style="color:#0D0016;">），但是它们是</font><font style="color:#FE2C24;">基于promise</font><font style="color:#0D0016;">的)</font>

<font style="color:#0D0016;">从语法上讲，Promise是一个</font><font style="color:#FE2C24;">对象</font><font style="color:#0D0016;">或者说是</font><font style="color:#FE2C24;">构造函数</font><font style="color:#0D0016;">，用来封装</font><font style="color:#FE2C24;">异步操作</font><font style="color:#0D0016;">并可以获取其</font><font style="color:#FE2C24;">成功</font><font style="color:#0D0016;">或</font><font style="color:#FE2C24;">失败</font><font style="color:#0D0016;">的结果。</font>

### （2）、Promise对象的状态:
a、对象的状态不受外界影响。

<font style="color:#333333;">Promise 对象通过自身的状态，来控制异步操作。Promise 实例具有三种状态。</font>

pending: 等待中，或者进行中，表示还没有得到结果

resolved(Fulfilled): 已经完成，表示得到了我们想要的结果，可以继续往下执行

rejected: 也表示得到结果，但是由于结果并非我们所愿，因此拒绝执行

b、Promise对象<font style="color:#4D4D4D;">三种状态不受外界影响，</font><font style="color:#333333;">三种的状态的变化途径只有两种。</font>

从“未完成”到“成功”

从“未完成”到“失败”

<font style="color:#333333;">一旦状态发生变化，就凝固了，不会再有新的状态变化。这也是 Promise 这个名字的由来，它的英语意思是“承诺”，一旦承诺成效，就不得再改变了。这也意味着，Promise 实例的状态变化只可能发生一次。</font>

<font style="color:#333333;">c、Promise 的最终结果只有两种。</font>

异步操作成功，Promise 实例传回一个值（value），状态变为fulfilled。

异步操作失败，Promise 实例抛出一个错误（error），状态变为rejected。

### （3）、Promise语法格式
<font style="color:#595959;">//写法一</font>

<font style="color:#595959;">new Promise(function (resolve, reject) {</font>

<font style="color:#595959;">  // resolve 表示成功的回调</font>

<font style="color:#595959;">  // reject 表示失败的回调</font>

<font style="color:#595959;">}).then(function (res) {</font>

<font style="color:#595959;">  // 成功的函数</font>

<font style="color:#595959;">}).catch(function (err) {</font>

<font style="color:#595959;">  // 失败的函数</font>

<font style="color:#595959;">})</font>

<font style="color:#595959;">//写法二</font>

<font style="color:#595959;">new Promise(function (resolve, reject) {</font>

<font style="color:#595959;">  // resolve 表示成功的回调</font>

<font style="color:#595959;">  // reject 表示失败的回调</font>

<font style="color:#595959;">}).then(function (res) {</font>

<font style="color:#595959;">  // 成功的函数</font>

<font style="color:#595959;">},function(res){</font>

<font style="color:#595959;">    // 失败的函数</font>

<font style="color:#595959;">})</font>

出现了new关键字，就明白了<font style="color:#F33232;">Promise对象其实就是一个构造函数</font>，是用来生成Promise实例的。能看出来构造函数接收了一个函数作为参数，该函数就是Promise构造函数的回调函数，该函数中有<font style="color:#F33232;">两个参数resolve和reject</font>，这两个参数也分别是两个函数！

简单的去理解的话

resolve函数的目的是将Promise对象状态变成成功状态，在异步操作成功时调用，将异步操作的结果，作为参数传递出去。

reject函数的目的是将Promise对象的状态变成失败状态，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。

<font style="color:#FE2C24;">注意：then方法可以接受两个函数</font><font style="color:#4D4D4D;">，第一个函数为</font><font style="color:#FE2C24;">promise状态为成功的回调函数</font><font style="color:#4D4D4D;">，第二个函数为</font><font style="color:#FE2C24;">promise状态为失败的回调函数</font><font style="color:#4D4D4D;">（</font><font style="color:#FE2C24;">可以不写，一般用catch方法捕获promise状态为失败的异常信息）</font>

### （4）、代码示例
<font style="color:#595959;">  const promise = new Promise((resolve,reject)=>{</font>

<font style="color:#595959;">            //异步代码</font>

<font style="color:#595959;">            setTimeout(()=>{</font>

<font style="color:#595959;">                // resolve(['111','222','333'])</font>

<font style="color:#595959;">                reject('error')</font>

<font style="color:#595959;">            },2000)</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        //写法一</font>

<font style="color:#595959;">        promise.then((res)=>{</font>

<font style="color:#595959;">            //兑现承诺，这个函数被执行</font>

<font style="color:#595959;">            console.log('success',res);</font>

<font style="color:#595959;">        }).catch((err)=>{</font>

<font style="color:#595959;">            //拒绝承诺，这个函数就会被执行</font>

<font style="color:#595959;">            console.log('fail',err);</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        //写法二</font>

<font style="color:#595959;">        promise.then(</font>

<font style="color:#595959;">          function (value) {</font>

<font style="color:#595959;">            console.log(value);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          function (reason) {</font>

<font style="color:#595959;">            console.error(reason);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        );</font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697920868-15da3b25-32c9-4803-9901-594b8d584550.png)

### （5）、Promise封装Ajax
<font style="color:#595959;"><script></font>

<font style="color:#595959;">      // 接口地址: </font>[<font style="color:#595959;">https://api.apiopen.top/getJoke</font>](https://api.apiopen.top/getJoke)

<font style="color:#595959;">      const p = new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        //1. 创建对象</font>

<font style="color:#595959;">        const xhr = new XMLHttpRequest();</font>



<font style="color:#595959;">        //2. 初始化</font>

<font style="color:#595959;">        xhr.open("GET", "https://api.apiopen.top/getJoke");</font>



<font style="color:#595959;">        //3. 发送</font>

<font style="color:#595959;">        xhr.send();</font>



<font style="color:#595959;">        //4. 绑定事件, 处理响应结果</font>

<font style="color:#595959;">        xhr.onreadystatechange = function () {</font>

<font style="color:#595959;">          //判断</font>

<font style="color:#595959;">          if (xhr.readyState === 4) {</font>

<font style="color:#595959;">            //判断响应状态码 200-299</font>

<font style="color:#595959;">            if (xhr.status >= 200 && xhr.status < 300) {</font>

<font style="color:#595959;">              //表示成功</font>

<font style="color:#595959;">              resolve(xhr.response);</font>

<font style="color:#595959;">            } else {</font>

<font style="color:#595959;">              //如果失败</font>

<font style="color:#595959;">              reject(xhr.status);</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      //指定回调</font>

<font style="color:#595959;">      p.then(</font>

<font style="color:#595959;">        function (value) {</font>

<font style="color:#595959;">          console.log(value);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        function (reason) {</font>

<font style="color:#595959;">          console.error(reason);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      );</font>

<font style="color:#595959;">    </script></font>

### （6）、promise的对象方法
p1,p2,p3为promise的实例对象

Promise.then()<font style="color:#4D4D4D;">方法</font>

then方法的返回结果是 Promise 对象, 返回对象状态由回调函数的执行结果决定，结果有以下：

a. 如果回调函数中返回的结果是 非 promise 类型的属性, 状态为成功, 返回值为对象的成功的值

b. 是 promise 对象,内部返回的状态，就是它的状态

c. 抛出错误 返回失败的promise状态

链式调用 可以改变回调地狱的情况

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      //创建 promise 对象</font>

<font style="color:#595959;">      const p = new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">          resolve("用户数据");</font>

<font style="color:#595959;">          // reject('出错啦');</font>

<font style="color:#595959;">        }, 1000);</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      const result = p.then(</font>

<font style="color:#595959;">        (value) => {</font>

<font style="color:#595959;">          console.log(value);</font>

<font style="color:#595959;">          //1. 非 promise 类型的属性</font>

<font style="color:#595959;">          // return 'iloveyou';</font>

<font style="color:#595959;">          //2. 是 promise 对象</font>

<font style="color:#595959;">          // return new Promise((resolve, reject)=>{</font>

<font style="color:#595959;">          //     // resolve('ok');</font>

<font style="color:#595959;">          //     reject('error');</font>

<font style="color:#595959;">          // });</font>

<font style="color:#595959;">          //3. 抛出错误</font>

<font style="color:#595959;">          // throw new Error('出错啦!');</font>

<font style="color:#595959;">          throw "出错啦!";</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        (reason) => {</font>

<font style="color:#595959;">          console.warn(reason);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      );</font>



<font style="color:#595959;">      //链式调用</font>

<font style="color:#595959;">    p.then(value=>{}).then(value=>{}); </font>

<font style="color:#595959;">    </script></font>

Promise.catch() 

<font style="color:#FE2C24;">一般用catch方法捕获promise状态为失败的异常信息</font>

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        const p = new Promise((resolve, reject)=>{</font>

<font style="color:#595959;">            setTimeout(()=>{</font>

<font style="color:#595959;">                //设置 p 对象的状态为失败, 并设置失败的值</font>

<font style="color:#595959;">                reject("出错啦!");</font>

<font style="color:#595959;">            }, 1000)</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // p.then(function(value){}, function(reason){</font>

<font style="color:#595959;">        //     console.error(reason);</font>

<font style="color:#595959;">        // });</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        p.catch(function(reason){</font>

<font style="color:#595959;">            console.warn(reason);</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#4D4D4D;">Promise.all()</font>

<font style="color:#FE2C24;">并发处理多个异步任务</font><font style="color:#4D4D4D;">，</font><font style="color:#FE2C24;">所有任务都执行完成</font><font style="color:#4D4D4D;">才能得到结果</font>

<font style="color:#595959;">Promise.all( [p1,p2,p3] ) .then ( (result) => {consoleog (result)</font>

<font style="color:#595959;">})</font>

<font style="color:#4D4D4D;">Promise.race()</font>

只返回异步任务数组中第一个执行完的结果，其他任务仍在执行，不过结果会被抛弃

应用场景：

几个接口返回一样的数据，哪个快用哪个

<font style="color:#595959;">Promise.race ( [p1,p2] ).then ( (result)=>{</font>

<font style="color:#595959;">console. log (result)</font>

<font style="color:#595959;">})</font>

## 15、set
### （1）、set基本知识
<font style="color:#000000;">ES6 提供了新的</font><font style="color:#F33232;">数据结构</font><font style="color:#000000;"> Set（集合）。它类似于数组，但成员的值都是唯一的，集合实现了iterator 接口，所以可以使用『扩展运算符』和『for…of…』进行遍历</font>

实例的属性和方法

size：返回Set实例的成员总数。

Set.prototype.add(value)：添加某个value。

Set.prototype.delete(value)：删除某个value，返回一个布尔值，表示删除是否成功。

Set.prototype.has(value)：返回一个布尔值，表示该值是否为Set的成员。

Set.prototype.clear()：清除所有成员，没有返回值。

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        //声明一个 set</font>

<font style="color:#595959;">        let s = new Set();</font>

<font style="color:#595959;">        let s2 = new Set(['张三','李四','王五','赵六']);</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        //元素个数</font>

<font style="color:#595959;">        // console.log(s2.size);</font>

<font style="color:#595959;">        //添加新的元素</font>

<font style="color:#595959;">        // s2.add('jack');</font>

<font style="color:#595959;">        //删除元素</font>

<font style="color:#595959;">        // s2.delete('李四');</font>

<font style="color:#595959;">        //检测</font>

<font style="color:#595959;">        // console.log(s2.has('王五'));</font>

<font style="color:#595959;">        //清空</font>

<font style="color:#595959;">        // s2.clear();</font>

<font style="color:#595959;">        // console.log(s2);</font>

<font style="color:#595959;">        //遍历元素</font>

<font style="color:#595959;">        for(let v of s2){</font>

<font style="color:#595959;">            console.log(v);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">    </script></font>

set遍历

Set.prototype.keys()：返回键名的遍历器

Set.prototype.values()：返回键值的遍历器

Set.prototype.entries()：返回键值对的遍历器

Set.prototype.forEach()：遍历每个成员

<font style="color:#595959;">let arr = new Set(["red", "green", "blue"]);</font>

<font style="color:#595959;">      // 返回键名</font>

<font style="color:#595959;">      for (let item of arr.keys()) {</font>

<font style="color:#595959;">        // console.log(item);//red green blue</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      // 返回键值</font>

<font style="color:#595959;">      for (let item of arr.values()) {</font>

<font style="color:#595959;">        // console.log(item);//red green blue</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // set 键名=键值</font>

<font style="color:#595959;">      // 返回键值对</font>

<font style="color:#595959;">      for (let item of arr.entries()) {</font>

<font style="color:#595959;">        // console.log(item);// ['red', 'red']   ['green', 'green'] ['blue', 'blue']</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // set也有forEach()方法</font>

<font style="color:#595959;">      arr.forEach((value, key) => console.log(key + " : " + value));</font>

### <font style="color:#000000;">（2）、set实践</font>
<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      let arr = [1, 2, 3, 4, 5, 4, 3, 2, 1];</font>

<font style="color:#595959;">      //1. 数组去重</font>

<font style="color:#595959;">      //   let result = new Set(arr);</font>

<font style="color:#595959;">      //   result = [...result];</font>

<font style="color:#595959;">      //   console.log(result);</font>

<font style="color:#595959;">      //2. 交集</font>

<font style="color:#595959;">      let arr2 = [4, 5, 6, 5, 6];</font>

<font style="color:#595959;">      /* 可以先去重，避免做无用对比 */</font>

<font style="color:#595959;">      //   let result = [...new Set(arr)].filter(item => {</font>

<font style="color:#595959;">      //       let s2 = new Set(arr2);//数组2去重后的结果  4 5 6</font>

<font style="color:#595959;">      //       if(s2.has(item)){</font>

<font style="color:#595959;">      //           return true;</font>

<font style="color:#595959;">      //       }else{</font>

<font style="color:#595959;">      //           return false;</font>

<font style="color:#595959;">      //       }</font>

<font style="color:#595959;">      //   });</font>

<font style="color:#595959;">      //简化版本</font>

<font style="color:#595959;">      // let result = [...new Set(arr)].filter((item) => new Set(arr2).has(item));</font>

<font style="color:#595959;">      //console.log(result);</font>





<font style="color:#595959;">      //3. 并集</font>

<font style="color:#595959;">      // let union = [...new Set([...arr, ...arr2])];</font>

<font style="color:#595959;">      // console.log(union);</font>





<font style="color:#595959;">      //4. 差集</font>

<font style="color:#595959;">      // let diff = [...new Set(arr)].filter(item => !(new Set(arr2).has(item)));</font>

<font style="color:#595959;">      // console.log(diff);</font>

<font style="color:#595959;">    </script></font>

## <font style="color:#000000;">16、Map</font>
<font style="color:#000000;">ES6 提供了Map</font><font style="color:#F33232;"> 数据结构</font><font style="color:#000000;">。它类似于对象，也是键值对的集合。但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。Map 也实现了iterator 接口，所以可以使用『扩展运算符』和『for…of…』进行遍历。</font>

<font style="color:#000000;">Map 的属性和方法：</font>

<font style="color:#000000;">1) size 返回Map 的元素个数</font>

<font style="color:#000000;">2) set 增加一个新元素，返回当前Map </font>

<font style="color:#000000;">3) get 返回键名对象的键值</font>

<font style="color:#000000;">4) has 检测Map 中是否包含某个元素，返回boolean 值</font>

<font style="color:#000000;">5) clear 清空集合，返回undefined</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        /* map升级后的对象，键名可以是对象 */</font>

<font style="color:#595959;">        //声明 Map</font>

<font style="color:#595959;">        let m = new Map();</font>





<font style="color:#595959;">        //添加元素 set()</font>

<font style="color:#595959;">        m.set('name','bdqn');//键名：字符串</font>

<font style="color:#595959;">        m.set('change', function(){//键名：字符串</font>

<font style="color:#595959;">            console.log("我们可以改变你!!");</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        let key = {</font>

<font style="color:#595959;">            school : '北京大学'</font>

<font style="color:#595959;">        };</font>





<font style="color:#595959;">        m.set(key, ['北京','上海','深圳']);//键名：对象</font>





<font style="color:#595959;">        //size</font>

<font style="color:#595959;">        // console.log(m.size);</font>





<font style="color:#595959;">        //删除</font>

<font style="color:#595959;">        // m.delete('name');</font>





<font style="color:#595959;">        //获取  get()</font>

<font style="color:#595959;">        // console.log(m.get('change'));</font>

<font style="color:#595959;">        // console.log(m.get(key));</font>





<font style="color:#595959;">        //清空  clear()</font>

<font style="color:#595959;">        // m.clear();</font>





<font style="color:#595959;">        //遍历</font>

<font style="color:#595959;">        // for(let v of m){</font>

<font style="color:#595959;">        //     console.log(v);</font>

<font style="color:#595959;">        // }</font>





<font style="color:#595959;">        console.log(m);</font>





<font style="color:#595959;">    </script></font>

## 17、class类
JavaScript 语言中，生成实例对象的传统方法是通过构造函数，ES6 提供了更接近传统语言的写法，引入了 Class（类）这个概念，作为对象的模板。通过class关键字，可以定义类。

### 1> class初体验
<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      // //es5通过构造函数实现</font>

<font style="color:#595959;">      // function PersonO(username, password) {</font>

<font style="color:#595959;">      //   this.username = username;</font>

<font style="color:#595959;">      //   this.password = password;</font>

<font style="color:#595959;">      // }</font>

<font style="color:#595959;">      // // 添加方法</font>

<font style="color:#595959;">      // PersonO.prototype.getstr = function () {</font>

<font style="color:#595959;">      //   console.log("用户名：" + this.username + ",密码：" + this.password);</font>

<font style="color:#595959;">      // };</font>

<font style="color:#595959;">      // // 实例化对象</font>

<font style="color:#595959;">      // const po1 = new PersonO("章三", "abc123");</font>

<font style="color:#595959;">      // console.log(po1);</font>

<font style="color:#595959;">      // po1.getstr();</font>



<font style="color:#595959;">      // es6实现  class方法实现</font>

<font style="color:#595959;">      class PersonN {</font>

<font style="color:#595959;">        //构造方法  constructor名字不能修改</font>

<font style="color:#595959;">        // 当我们new实例对象的时候，这个方法自动执行</font>

<font style="color:#595959;">        constructor(username, password) {</font>

<font style="color:#595959;">          this.username = username;</font>

<font style="color:#595959;">          this.password = password;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        //方法必须使用该语法, 不能使用 ES5 的对象完整形式</font>

<font style="color:#595959;">        getstr() {</font>

<font style="color:#595959;">          console.log("用户名：" + this.username + "，密码：" + this.password);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        //ES5 的对象完整形式  报错</font>

<font style="color:#595959;">        // getstr:function () {}</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      const pn1 = new PersonN("123456", "789012");</font>

<font style="color:#595959;">      pn1.getstr();</font>

<font style="color:#595959;">    </script></font>

说明：使用class关键词 声明类，constructor为构造方法，一个类必须有constructor()方法，如果没有显式定义，一个空的constructor()方法会被默认添加，

this关键字则代表实例对象，

getstr()为普通方法，不要用es5完整写法，getstr()存在 prototype上。

pn1.constructor === pn1.prototype.constructor // true

### 2> 类的静态成员
es5可以直接给构造函数添加属性，方法，这些属性方法不在这个构造函数实例的对象身上

对应的es6中，类相当于实例的原型，所有在类中定义的方法，都会被实例继承。如果在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      // es5</font>

<font style="color:#595959;">      function Phone() {}</font>

<font style="color:#595959;">      // 给Phone添加静态属性</font>

<font style="color:#595959;">      Phone.name = "手机";</font>

<font style="color:#595959;">      Phone.call = function () {</font>

<font style="color:#595959;">        console.log("我可以打电话");</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      //实例化对象</font>

<font style="color:#595959;">      let apple = new Phone();</font>

<font style="color:#595959;">      // console.log(apple.name); //undefined</font>

<font style="color:#595959;">      //apple.change(); //报错  实例身上是没有构造函数身上的属性和方法</font>



<font style="color:#595959;">      // Phone.call(); //我可以打电话</font>



<font style="color:#595959;">    class PhoneN{</font>

<font style="color:#595959;">        static  name='手机'</font>

<font style="color:#595959;">        static  game(){</font>

<font style="color:#595959;">          console.log('我可以打游戏');</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      let  p1=new PhoneN()</font>

<font style="color:#595959;">      console.log(p1.name);//undefined</font>

<font style="color:#595959;">      console.log(PhoneN.name);//手机</font>

<font style="color:#595959;">    </script></font>

### 3> 类的继承
#### （1）、es5的继承
<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //手机   父级构造函数</font>

<font style="color:#595959;">      function Phone(brand, price) {</font>

<font style="color:#595959;">        this.brand = brand;</font>

<font style="color:#595959;">        this.price = price;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      Phone.prototype.call = function () {</font>

<font style="color:#595959;">        console.log("我可以打电话");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //智能手机   子级构造函数</font>

<font style="color:#595959;">      function SmartPhone(brand, price, color, size) {</font>

<font style="color:#595959;">        //通过call方法改变this指向，指向SmartPhone的实例对象</font>

<font style="color:#595959;">        Phone.call(this, brand, price);</font>

<font style="color:#595959;">        //子类独有的属性</font>

<font style="color:#595959;">        this.color = color;</font>

<font style="color:#595959;">        this.size = size;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //设置子级构造函数的原型   让SmartPhone的实例对象有父类的属性方法</font>

<font style="color:#595959;">      SmartPhone.prototype = new Phone();</font>

<font style="color:#595959;">      SmartPhone.prototype.constructor = SmartPhone;</font>

<font style="color:#595959;">      //声明子类的方法</font>

<font style="color:#595959;">      SmartPhone.prototype.photo = function () {</font>

<font style="color:#595959;">        console.log("我可以拍照");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      SmartPhone.prototype.playGame = function () {</font>

<font style="color:#595959;">        console.log("我可以玩游戏");</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //实例化对象</font>

<font style="color:#595959;">      const chuizi = new SmartPhone("锤子", 2499, "黑色", "5.5inch");</font>

<font style="color:#595959;">      console.log(chuizi);</font>

<font style="color:#595959;">    </script></font>

#### （2）、es6的继承
<font style="color:#595959;"> <script></font>

<font style="color:#595959;"> // 定义父类</font>

<font style="color:#595959;">      class Student {</font>

<font style="color:#595959;">        //构造方法</font>

<font style="color:#595959;">        constructor(realname, age) {</font>

<font style="color:#595959;">          this.realname = realname;</font>

<font style="color:#595959;">          this.age = age;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        //父类的成员属性</font>

<font style="color:#595959;">        play(str) {</font>

<font style="color:#595959;">          console.log("我会玩" + str);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //定义子类</font>

<font style="color:#595959;">      class ItStudent extends Student {</font>

<font style="color:#595959;">        //构造方法</font>

<font style="color:#595959;">        constructor(realname, age, major) {</font>

<font style="color:#595959;">          //调用父类的方法，相当于Student.call(this,realname, age)</font>

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">super(realname, age);</font>**

<font style="color:#595959;">          this.major = major;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        //子类的成员属性</font>

<font style="color:#595959;">        program(type) {</font>

<font style="color:#595959;">          console.log("我会编程的语言是：" + type);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        // 子类对父类方法的重写</font>

<font style="color:#595959;">        play(str) {</font>

<font style="color:#595959;">          console.log("我只学习，不玩" + str);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //实例化对象</font>

<font style="color:#595959;">      const It1 = new ItStudent("张三", 20, "大数据");</font>

<font style="color:#595959;">      console.log(It1.realname);</font>

<font style="color:#595959;">      It1.play("游戏"); //我只学习，不玩游戏</font>

<font style="color:#595959;">    </script></font>

说明：Class 可以通过extends关键字实现继承，让子类继承父类的属性和方法。ES6 规定，子类必须在constructor()方法中调用super()，否则就会报错。

### 4> getter和setter设置
<font style="color:#595959;"><script></font>

<font style="color:#595959;">      // get 和 set</font>

<font style="color:#595959;">      class Phone {</font>

<font style="color:#595959;">        // get 监测动态属性的变化</font>

<font style="color:#595959;">        get price() {</font>

<font style="color:#595959;">          console.log("价格属性被读取了");</font>

<font style="color:#595959;">          return "iloveyou";</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        // set 对更改设置的值做判断，合法怎么办，不合法怎么办</font>

<font style="color:#595959;">        set price(newVal) {</font>

<font style="color:#595959;">          console.log("价格属性被修改了");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //实例化对象</font>

<font style="color:#595959;">      let s = new Phone();</font>

<font style="color:#595959;">      console.log(s.price);//输出price属性，只要读取，就会执行get后面对应的函数代码，函数的返回值就是属性的返回值</font>

<font style="color:#595959;">      s.price = "9.9";//更改price属性，只要更改，就会执行set后面对应的函数代码</font>

<font style="color:#595959;">    </script></font>







### 18、模块化（module）
<font style="color:#000000;">模块化是指将一个大的程序文件，拆分成许多小的文件，然后将小文件组合起来。</font>

#### 1、模块化的优势
<font style="color:#000000;">1) 防止命名冲突</font>

<font style="color:#000000;">2) 代码复用</font>

<font style="color:#000000;">3) 高维护性，可以对某些模块化升级</font>

#### 2、ES6 模块化语法
<font style="color:#000000;">模块功能主要由两个命令构成：</font>**<font style="color:#FF0000;">export </font>**<font style="color:#000000;">和</font>**<font style="color:#FF0000;">import</font>**<font style="color:#000000;">。</font>

**<font style="color:#FF0000;">export </font>**<font style="color:#000000;">命令用于规定模块的对外接口，</font>**<font style="color:#FF0000;">对外暴露</font>**

**<font style="color:#FF0000;">import </font>**<font style="color:#000000;">命令用于输入其他模块提供的功能 ，</font>**<font style="color:#FF0000;">引入暴露的文件</font>**

##### 1> 暴露语法汇总
<font style="color:#000000;">（1）、</font>**<font style="color:#FF0000;">分别暴露</font>**

<font style="color:#595959;">//m1.js  分别暴露</font>

<font style="color:#595959;">export let school = 'bdqn';</font>

<font style="color:#595959;">export function teach() {</font>

<font style="color:#595959;">    console.log("我们可以教给你开发技能");</font>

<font style="color:#595959;">}</font>

##### （2）、**<font style="color:#FF0000;">统一暴露</font>**
<font style="color:#595959;">// m2.js  统一暴露</font>

<font style="color:#595959;">let school = 'bdqn';</font>

<font style="color:#595959;">function findJob(){</font>

<font style="color:#595959;">    console.log("我们可以帮助你找工作!!");</font>

<font style="color:#595959;">}</font>

**<font style="color:#FF0000;">export {school, findJob};  //用花括号包裹</font>**

##### （3）、**<font style="color:#FF0000;">默认暴露</font>**
<font style="color:#595959;">//m3.js 默认暴露</font>

**<font style="color:#FF0000;">export default </font>**<font style="color:#595959;">{</font>

<font style="color:#595959;">    school: 'bdqn',</font>

<font style="color:#595959;">    change: function(){</font>

<font style="color:#595959;">        console.log("我们可以改变你!!");</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

export和export default的区别(面试题)

1、两者均可用于导出常量、函数、文件、模块；

2、在一个文件中**<font style="color:#FF0000;">可以多次</font>**使用**<font style="color:#FF0000;">export</font>**，但是**<font style="color:#FF0000;">export default只能用一次</font>**；

3、**<font style="color:#FF0000;">通过export输出的，在import导入时需要使用{}，export default不需要；</font>**

4、**<font style="color:#FF0000;">export与export default不可同时使用；</font>**

#### 2> 引入暴露文件语法
##### （1）、通用方式
<font style="color:#595959;"> //1. 通用的导入方式</font>

<font style="color:#595959;">      //引入 m1.js 模块内容</font>

<font style="color:#595959;">      import * as m1 from './js/m1.js'</font>

<font style="color:#595959;">      //引入 m2.js 模块内容</font>

<font style="color:#595959;">      import * as m2 from "./js/m2.js";</font>

<font style="color:#595959;">      //引入 m3.js</font>

<font style="color:#595959;">      import * as m3 from "./js/m3.js";</font>

<font style="color:#595959;">      console.log(m1);</font>

##### （2）、解构附值
<font style="color:#595959;">//2. 解构赋值形式的导入方式</font>

<font style="color:#595959;">      import { school, teach } from "./js/m1.js";</font>

<font style="color:#595959;">      //</font>**<font style="color:#FF0000;">用别名</font>**

<font style="color:#595959;">      import </font>**<font style="color:#FF0000;">{school as yyzx, findJob} </font>**<font style="color:#595959;">from "./js/m2.js";</font>

<font style="color:#595959;">     </font>

<font style="color:#595959;">      import {default as m3} from "./js/m3.js";</font>

##### （3）、简易形式
<font style="color:#595959;">    //3. 简便形式的导入方式   针对默认暴露</font>

<font style="color:#595959;">      import m3 from "./js/m3.js";</font>

#### 3> 建立入口文件形式
<font style="color:#595959;">// app.js  入口文件</font>

<font style="color:#595959;">//模块引入</font>

<font style="color:#595959;">import * as m1 from "./m1.js";</font>

<font style="color:#595959;">import * as m2 from "./m2.js";</font>

<font style="color:#595959;">import * as m3 from "./m3.js";</font>





<font style="color:#595959;">console.log(m1);</font>

<font style="color:#595959;">console.log(m2);</font>

<font style="color:#595959;">console.log(m3);</font>

<font style="color:#595959;"><!--index.html  引入 入口文件 --></font>

<font style="color:#595959;">    <script src="./js/app.js" type="module"></script></font>



# **三、ES7**
1.Array.includes   
Includes 方法用来检测数组中是否包含某个元素，返回布尔类型值

JavaScript<font style="color:#585A5A;">运行代码复制代码</font>

<font style="color:#6C6C6C;">1</font>

<font style="color:#6C6C6C;">2</font>

<font style="color:#6C6C6C;">3</font>

<font style="color:#6C6C6C;">4</font>

<font style="color:#6C6C6C;">5</font>

<font style="color:#6C6C6C;">6</font>

<font style="color:#6C6C6C;">7</font>

<font style="color:#6C6C6C;">8</font>

<font style="color:#6C6C6C;">9</font>

<font style="color:#6C6C6C;">10</font>

<font style="color:#6C6C6C;">11</font>

<<font style="color:#232930;">script</font><font style="color:#E10023;">></font>

<font style="color:#6A737D;">// includes </font>

<font style="color:#D73A49;">const</font> <font style="color:#A13000;">mingzhu</font> <font style="color:#E10023;">=</font> [<font style="color:#669900;">'王二'</font>,<font style="color:#669900;">'张三'</font>,<font style="color:#669900;">'李四'</font>,<font style="color:#669900;">'王五'</font>];

<font style="color:#6A737D;">//判断</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#232930;">mingzhu</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">includes</font>(<font style="color:#669900;">'张三'</font>));<font style="color:#6A737D;">//true</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#232930;">mingzhu</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">includes</font>(<font style="color:#669900;">'周六'</font>));<font style="color:#6A737D;">//false</font>

<font style="color:#6A737D;">//indexOf 是否存在数组中 返回的是数字</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#232930;">mingzhu</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">indexOf</font>(<font style="color:#669900;">'张三'</font>));<font style="color:#6A737D;">//1</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#232930;">mingzhu</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">indexOf</font>(<font style="color:#669900;">'周六'</font>));<font style="color:#6A737D;">//-1</font>

<<font style="color:#669900;">/script></font>

2、** 指数操作符  
在ES7 中引入指数运算符「**」，用来实现幂运算，功能与Math.pow 结果相同

JavaScript<font style="color:#585A5A;">运行代码复制代码</font>

<font style="color:#6C6C6C;">1</font>

<font style="color:#6C6C6C;">2</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#005CC5;">2</font> <font style="color:#E10023;">**</font> <font style="color:#005CC5;">10</font>); <font style="color:#6A737D;">//1024</font>

<font style="color:#232930;">console</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">log</font>(<font style="color:#232930;">Math</font><font style="color:#E10023;">.</font><font style="color:#005CC5;">pow</font>(<font style="color:#005CC5;">2</font>, <font style="color:#005CC5;">10</font>));<font style="color:#6A737D;">//1024</font>







# **四、ES8**
## <font style="color:#DF2A3F;">1、async 和 await</font>
<font style="color:#000000;">async 和await 两种语法结合可以让异步代码像同步代码一样</font>

### （1）、async 函数
async 是一个修饰符，async 定义的函数会默认的返回一个Promise对象resolve(已定型成功或失败)的值，因此对async函数可以直接进行then操作,返回的值即为then方法的传入函数。

<font style="color:#000000;">async 函数的返回值为promise 对象，</font>

<font style="color:#000000;">promise 对象的结果由async 函数执行的返回值决定</font>

返回的结果不是一个 Promise 类型的对象, 是字符串、数字、undefined等,就是成功的结果

抛出错误, 返回的结果是一个失败的 Promise

返回的结果如果是一个 Promise 对象，根据Promise返回的结果确定状态

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      //async 函数</font>

<font style="color:#595959;">      async function fn() {</font>

<font style="color:#595959;">        /* 1: 返回的结果不是一个 Promise 类型的对象, 是字符串、数字、undefined等</font>

<font style="color:#595959;">        返回的结果就是成功 Promise 对象 */</font>

<font style="color:#595959;">        // return 'bdqn';</font>

<font style="color:#595959;">        // return;  </font>

<font style="color:#595959;">        // 2:抛出错误, 返回的结果是一个失败的 Promise</font>

<font style="color:#595959;">        throw new Error('出错啦!');</font>

<font style="color:#595959;">        // 3:返回的结果如果是一个 Promise 对象，根据Promise返回的结果确定状态</font>

<font style="color:#595959;">        // return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        //   resolve("成功的数据");</font>

<font style="color:#595959;">        //   reject("失败的错误");</font>

<font style="color:#595959;">        // });</font>

<font style="color:#595959;">      }</font>





<font style="color:#595959;">      const result = fn();</font>





<font style="color:#595959;">      //调用 then 方法</font>

<font style="color:#595959;">      result.then(</font>

<font style="color:#595959;">        (value) => {</font>

<font style="color:#595959;">          console.log(value,'成功回调');</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        (reason) => {</font>

<font style="color:#595959;">          console.warn(reason,'失败回调');</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      );</font>

<font style="color:#595959;">    </script></font>

### （2）、await 表达式
<font style="color:#000000;">await 必须写在async 函数中</font>

<font style="color:#000000;">await 右侧的表达式一般为promise 对象</font>

<font style="color:#000000;">await 返回的是promise 成功的值</font>

<font style="color:#000000;">await 的promise 失败了, 就会抛出异常, 需要通过try...catch 捕获处理</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //创建 promise 对象</font>

<font style="color:#595959;">      const p = new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        // resolve("用户数据");</font>

<font style="color:#595959;">        reject("失败啦!");</font>

<font style="color:#595959;">      });</font>





<font style="color:#595959;">      //1: await 要放在 async 函数中. await单向依赖async</font>

<font style="color:#595959;">      async function main() {</font>

<font style="color:#595959;">        try {</font>

<font style="color:#595959;">          // result 是Promise对象成功的值</font>

<font style="color:#595959;">          let result = await p;</font>

<font style="color:#595959;">          console.log(result, "async,await");</font>

<font style="color:#595959;">        } catch (e) {</font>

<font style="color:#595959;">          //e返回的 是Promise对象失败的值</font>

<font style="color:#595959;">          console.log(e, "async,await");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      //调用函数</font>

<font style="color:#595959;">      main();</font>





<font style="color:#595959;">      // Promise调用then方法</font>

<font style="color:#595959;">     /*  p.then(</font>

<font style="color:#595959;">        (v) => {</font>

<font style="color:#595959;">          console.log(v, "then方法");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        (r) => {</font>

<font style="color:#595959;">          console.log(r, "then方法");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      ); */</font>

<font style="color:#595959;">    </script></font>

### （3）、async与await封装AJAX请求
<font style="color:#595959;"><script></font>

<font style="color:#595959;">      // 发送 AJAX 请求, 返回的结果是 Promise 对象</font>

<font style="color:#595959;">      function sendAJAX(url) {</font>

<font style="color:#595959;">        return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">          //1. 创建对象</font>

<font style="color:#595959;">          const x = new XMLHttpRequest();</font>



<font style="color:#595959;">          //2. 初始化</font>

<font style="color:#595959;">          x.open("GET", url);</font>



<font style="color:#595959;">          //3. 发送</font>

<font style="color:#595959;">          x.send();</font>



<font style="color:#595959;">          //4. 事件绑定</font>

<font style="color:#595959;">          x.onreadystatechange = function () {</font>

<font style="color:#595959;">            if (x.readyState === 4) {</font>

<font style="color:#595959;">              if (x.status >= 200 && x.status < 300) {</font>

<font style="color:#595959;">                //成功啦</font>

<font style="color:#595959;">                resolve(x.response);</font>

<font style="color:#595959;">              } else {</font>

<font style="color:#595959;">                //如果失败</font>

<font style="color:#595959;">                reject(x.status);</font>

<font style="color:#595959;">              }</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      //第一种：promise then 方法测试</font>

<font style="color:#595959;">      // sendAJAX("https://api.apiopen.top/getJoke").then(value=>{</font>

<font style="color:#595959;">      //     console.log(value);</font>

<font style="color:#595959;">      // }, reason=>{})</font>



<font style="color:#595959;">      //第二种： async 与 await 测试  axios</font>

<font style="color:#595959;">      async function main() {</font>

<font style="color:#595959;">        //发送 AJAX 请求</font>

<font style="color:#595959;">        let result = await sendAJAX("https://api.apiopen.top/getJoke");</font>

<font style="color:#595959;">        console.log(result);</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      main();</font>

<font style="color:#595959;">    </script></font>

## 2、对象方法扩展
### （1）、<font style="color:#000000;">Object.values 和Object.entries</font>
<font style="color:#000000;">Object.values()方法返回一个给定对象的所有可枚举属性值的数组</font>

<font style="color:#000000;">Object.entries()方法返回一个给定对象自身可遍历属性[key,value] 的数组</font>

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      //声明对象</font>

<font style="color:#595959;">      const school = {</font>

<font style="color:#595959;">        name: "bdqn",</font>

<font style="color:#595959;">        cities: ["北京", "上海", "深圳"],</font>

<font style="color:#595959;">        xueke: ["前端", "Java", "大数据", "测试"],</font>

<font style="color:#595959;">      };</font>





<font style="color:#595959;">      //获取对象所有的键</font>

<font style="color:#595959;">      console.log(Object.keys(school),'key');//['name', 'cities', 'xueke'] 'key'</font>

<font style="color:#595959;">      //获取对象所有的值</font>

<font style="color:#595959;">      console.log(Object.values(school),'value');//['bdqn', Array(3), Array(4)] 'value'</font>

<font style="color:#595959;">      //entries  返回的是一个数组，数组里放一组组数组，里面是键，值</font>

<font style="color:#595959;">      console.log(Object.entries(school),'entries');</font>

<font style="color:#595959;">      //有了上面的entries结果，方便创建 Map</font>

<font style="color:#595959;">      // const m = new Map(Object.entries(school));</font>

<font style="color:#595959;">      // console.log(m,'map');</font>

<font style="color:#595959;">    </script></font>

### <font style="color:#000000;">（2）、Object.getOwnPropertyDescriptors</font>
<font style="color:#000000;">该方法返回指定对象所有自身属性的描述对象</font>

<font style="color:#000000;">补充</font>

Object.create( proto[,propertiesObject] )

参数

proto：创建对象的原型，表示要继承的对象

propertiesObject(可选 )：也是一个对象，用于对新创建的对象进行初始化

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      //声明对象</font>

<font style="color:#595959;">      const school = {</font>

<font style="color:#595959;">        name: "bdqn",</font>

<font style="color:#595959;">        cities: ["北京", "上海", "深圳"],</font>

<font style="color:#595959;">        xueke: ["前端", "Java", "大数据", "测试"],</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //对象属性的描述对象</font>

<font style="color:#595959;">      console.log(Object.getOwnPropertyDescriptors(school),'111');</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      //  可以对对象深层次的克隆</font>

<font style="color:#595959;">      const obj = Object.create(null, {</font>

<font style="color:#595959;">        name: {</font>

<font style="color:#595959;">          //设置值</font>

<font style="color:#595959;">          value: "bdqn",</font>

<font style="color:#595959;">          //属性特性</font>

<font style="color:#595959;">          writable: true,//是否可写</font>

<font style="color:#595959;">          configurable: true,//是否可以删除</font>

<font style="color:#595959;">          enumerable: true,//是否可以遍历</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697921157-1573db11-af21-44fd-833d-090609b6c0d3.png)

## 3、字符串填充
padStart()、padEnd()方法可以使得字符串达到固定长度，

有两个参数，字符串目标长度和填充内容。

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      let str = "hello";</font>

<font style="color:#595959;">      console.log(str.padStart(10, "m")); //mmmmmhello</font>

<font style="color:#595959;">      console.log(str.padEnd(10, "m")); //hellommmmm</font>

<font style="color:#595959;">      console.log(str.padStart(5, "m")); //hello，如果长度够，就不添加</font>

<font style="color:#595959;">      console.log(str.padEnd(5, "m")); //hello</font>

<font style="color:#595959;">    </script></font>





**五、ES9**

## 1、对象拓展
<font style="color:#000000;">Rest 参数与spread 扩展运算符在ES6 中已经引入，不过ES6 中只针对于数组，在ES9 中为对象提供了像数组一样的rest 参数和扩展运算符</font>

### （1）、<font style="color:#000000;">Rest 参数</font>
<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      //rest 参数</font>

<font style="color:#595959;">      function connect({ name, sex, ...other }) {</font>

<font style="color:#595959;">        console.log(name); //孙悟空</font>

<font style="color:#595959;">        console.log(sex); //男</font>

<font style="color:#595959;">        console.log(other); //{age: 20, address: '花果山'}</font>

<font style="color:#595959;">      }</font>





<font style="color:#595959;">      connect({</font>

<font style="color:#595959;">        name: "孙悟空",</font>

<font style="color:#595959;">        sex: "男",</font>

<font style="color:#595959;">        age: 20,</font>

<font style="color:#595959;">        address: "花果山",</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

注意：

1：rest 参数之后不能再有其他参数（即只能是最后一个参数），否则会报错。

function f(a, ...b, c) { ... } // 报错

2：函数的length属性，不包括 rest 参数。

(function(a) {}).length // 1

(function(...a) {}).length // 0

(function(a, ...b) {}).length // 1

### （2）、<font style="color:#000000;"> spread 扩展运算符</font>
<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      // spread 扩展运算符    对象合并</font>

<font style="color:#595959;">      const nameOne = {</font>

<font style="color:#595959;">        q: "孙悟空",</font>

<font style="color:#595959;">        h:18</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      const nameTwo = {</font>

<font style="color:#595959;">        w: "猪八戒",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      const nameThree = {</font>

<font style="color:#595959;">        e: "沙悟净",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      const nameFour = {</font>

<font style="color:#595959;">        r: "白骨精",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //对象的合并</font>

<font style="color:#595959;">      const name = { ...nameOne, ...nameTwo, ...nameThree, ...nameFour };</font>

<font style="color:#595959;">      console.log(name);</font>

<font style="color:#595959;">      //{q: '孙悟空', h:18，w: '猪八戒', e: '沙悟净', r: '白骨精'}</font>

<font style="color:#595959;">    </script></font>

## 2、正则拓展
### （1）、正则命名分组
JS正则表达式可以返回一个匹配的对象, 一个包含匹配字符串的类数组

ES9允许使用命名捕获 ? , 在打开捕获括号后立即命名

语法： ?<变量名>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        //声明一个字符串</font>

<font style="color:#595959;">        // let str = '<a href="https://www.baidu.com/">百度</a>';</font>

<font style="color:#595959;">        //需求：提取 url 与 『标签文本』</font>

<font style="color:#595959;">        //第一种写法</font>

<font style="color:#595959;">        // const reg = /<a href="(.*)">(.*)<\/a>/;</font>

<font style="color:#595959;">        // //执行</font>

<font style="color:#595959;">        // const result = reg.exec(str);</font>

<font style="color:#595959;">        // console.log(result);</font>

<font style="color:#595959;">        // // console.log(result[1]);//url</font>

<font style="color:#595959;">        // // console.log(result[2]);//文本</font>





<font style="color:#595959;">        //第二种方式  ?<变量名></font>

<font style="color:#595959;">      let str = '<a href="https://www.baidu.com/">百度</a>';</font>

<font style="color:#595959;">        //分组命名</font>

<font style="color:#595959;">        const reg = /<a href="(?<url>.*)">(?<text>.*)<\/a>/;</font>

<font style="color:#595959;">        const result = reg.exec(str);</font>

<font style="color:#595959;">        console.log(result.groups.url);</font>

<font style="color:#595959;">        console.log(result.groups.text);</font>

<font style="color:#595959;">    </script></font>

### （2）、反向断言
语法：(?<=y)x如果想匹配x，x的前面必须是y

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        //声明字符串</font>

<font style="color:#595959;">        let str = 'LP5211314你知道么666啦啦啦';</font>

<font style="color:#595959;">        //正向断言  根据匹配结果666后面的内容‘啦啦’，判断匹配结果是否合法</font>

<font style="color:#595959;">        const reg = /\d+(?=啦)/;//如果想匹配数字，数字后面必须时啦</font>

<font style="color:#595959;">        const result = reg.exec(str);</font>





<font style="color:#595959;">        //反向断言  (?<=么)  根据匹配结果666前面的内容'么'，判断匹配结果是否合法</font>

<font style="color:#595959;">        const reg = /(?<=么)\d+/;//如果想匹配数字，数字前面必须时么</font>

<font style="color:#595959;">        const result = reg.exec(str);</font>

<font style="color:#595959;">        console.log(result);</font>

<font style="color:#595959;">    </script></font>

## 3、<font style="color:#DF2A3F;">promise.finally()</font>
无论是成功还是失败, 都运行同样的代码, 比如隐藏对话框, 关闭数据连接

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      function fun() {</font>

<font style="color:#595959;">        return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">          // resolve("成功");</font>

<font style="color:#595959;">          reject(1111);</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      fun()</font>

<font style="color:#595959;">        .then((res) => {</font>

<font style="color:#595959;">            console.log('成功');</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        .catch((err) => {</font>

<font style="color:#595959;">            console.log('失败');//失败</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        .finally(() => {</font>

<font style="color:#595959;">          console.log("关闭数据连接");//"关闭数据连接"</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">    </script></font>





1. **ES10**

## 1、Object.fromEntries 
将二维数组，转为对象，一般常用来将map对象，转为对象

<font style="color:#595959;"> const res = Object.fromEntries([</font>

<font style="color:#595959;">        ["name", "bdqn"],</font>

<font style="color:#595959;">        ["xueke", "Java,大数据,前端,云计算"],</font>

<font style="color:#595959;">      ]);</font>

<font style="color:#595959;">      console.log(res, "result");</font>

<font style="color:#595959;">      //{name: 'bdqn', xueke: 'Java,大数据,前端,云计算'}</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">//Map  是一种数据结构，也是一个对象;</font>

<font style="color:#595959;">      const m = new Map();</font>

<font style="color:#595959;">      m.set("name", "bdqn");</font>

<font style="color:#595959;">      console.log(m); //Map(1) {'name' => 'bdqn'}</font>

<font style="color:#595959;">      const result = Object.fromEntries(m);</font>

<font style="color:#595959;">      console.log(result); //{name: 'bdqn'}</font>

ES8 中学习的Object.entries 将对象转为二维数组，与Object.fromEntries互为逆运算

<font style="color:#595959;"> const arr = Object.entries({</font>

<font style="color:#595959;">        name: "bdqn",</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      console.log(arr);</font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697921416-85537f99-e96f-4000-aa45-ac076b37e160.png)

## <font style="color:#000000;">2、trimStart 和trimEnd</font>
trimStart 与 trimEnd 指定清楚左侧还是右侧空白字符

<font style="color:#595959;"> <script>  </font>

<font style="color:#595959;">    /* trimStart 与 trimEnd 指定清楚左侧还是右侧空白字符 */   </font>

<font style="color:#595959;">        let str = '   爱老虎油   ';</font>

<font style="color:#595959;">        console.log(str.trim());//清除两侧空白</font>

<font style="color:#595959;">        console.log(str.trimStart());//清除左侧空白</font>

<font style="color:#595959;">        console.log(str.trimEnd());//清除右侧空白</font>

<font style="color:#595959;">    </script></font>

## <font style="color:#000000;">3、Array.flat 与flatMap</font>
<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      //flat 平</font>

<font style="color:#595959;">      //将多维数组转化为低位数组</font>

<font style="color:#595959;">      const arr = [1, 2, [5, 6]];</font>

<font style="color:#595959;">      console.log(arr.flat(1), "arr"); //[1, 2, 5, 6]</font>



<font style="color:#595959;">      const arr2 = [1, 2, [5, 6, [7, 8, 9]]];</font>

<font style="color:#595959;">      //参数为深度 是一个数字,默认值是1</font>

<font style="color:#595959;">      console.log(arr2.flat(2), "arr2"); //[1, 2, 5, 6, 7, 8, 9]</font>



<font style="color:#595959;">      //flatMap  </font>

<font style="color:#595959;">      /* flatMap()方法对原数组的每个成员执行一个函数</font>

<font style="color:#595959;">      （相当于执行Array.map()），</font>

<font style="color:#595959;">      然后对返回值组成的数组执行flat()方法。</font>

<font style="color:#595959;">      该方法返回一个新数组，不改变原数组。 */</font>

<font style="color:#595959;">      const arr3 = [1, 2, 3, 4];</font>

<font style="color:#595959;">      const res1 = arr3.flatMap((item) => item*10);</font>

<font style="color:#595959;">      const res2 = arr3.flatMap((item) => [item*10]);</font>



<font style="color:#595959;">      console.log(res1, "res1"); //[10, 20, 30, 40] 'res1'</font>

<font style="color:#595959;">      console.log(res2, "res2"); //[10, 20, 30, 40] 'res2'</font>



<font style="color:#595959;">    </script></font>

## <font style="color:#000000;">4、Symbol.description </font>
<font style="color:#000000;">获取Symbol的描述字符串</font>

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        //创建 Symbol</font>

<font style="color:#595959;">        let s = Symbol('bdqn');</font>

<font style="color:#595959;">        console.log(s.description);//bdqn</font>

<font style="color:#595959;">    </script></font>



**七、ES11**



## <font style="color:#000000;">1、Promise.allSettled </font>
调用 allsettled 方法，返回的结果始终是成功的，返回的是promise结果值

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      //声明两个promise对象</font>

<font style="color:#595959;">      const p1 = new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">          resolve("商品数据 - 1");</font>

<font style="color:#595959;">        }, 1000);</font>

<font style="color:#595959;">      });</font>





<font style="color:#595959;">      const p2 = new Promise((resolve, reject) => {</font>

<font style="color:#595959;">        setTimeout(() => {</font>

<font style="color:#595959;">        //   resolve("商品数据 - 2");</font>

<font style="color:#595959;">          reject('出错啦!');</font>

<font style="color:#595959;">        }, 1000);</font>

<font style="color:#595959;">      });</font>





<font style="color:#595959;">      //调用 allsettled 方法，返回的结果始终是成功的，返回的是promise结果值</font>

<font style="color:#595959;">        const res = Promise.allSettled([p1, p2]);</font>

<font style="color:#595959;">        console.log(res,'res');</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      //调用all方法，返回的结果要根据Promise状态来决定，必须要全部成功，才能成功</font>

<font style="color:#595959;">        const res1 = Promise.all([p1, p2]);</font>

<font style="color:#595959;">        console.log(res1,'res1');</font>

<font style="color:#595959;">    </script></font>

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741697921770-6a14bde3-321e-4d19-abf9-e5fd55f69636.png)

## <font style="color:#000000;">2、</font>动态 import 导入
标准用法的 import 导入的模块是静态的，会使所有被导入的模块，在加载时就被编译（无法做到按需编译，降低首页加载速度）。有些场景中，你可能希望根据条件导入模块或者按需导入模块，这时你可以使用动态导入代替静态导入。

<font style="color:#000000;">即：动态导入是我需要的时候，再导入进来，然后调用，不需要的时候，我不导入</font>

<font style="color:#000000;">html文件</font>

<font style="color:#595959;">   <body></font>

<font style="color:#595959;">    <button id="btn">登录</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 用户输入用户名,密码</font>

<font style="color:#595959;">      function login() {</font>

<font style="color:#595959;">        return "普通用户";</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      let btn = document.querySelector("#btn");</font>



<font style="color:#595959;">      btn.onclick = function () {</font>

<font style="color:#595959;">        // 拿到用户名密码</font>

<font style="color:#595959;">        let role = login();</font>

<font style="color:#595959;">        // 将拿到的用户密码放到处理函数里</font>

<font style="color:#595959;">        render(role); //处理函数</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      async function render(role) {</font>

<font style="color:#595959;">        if (role == "管理员") {</font>

<font style="color:#595959;">          //  第一种写法</font>

<font style="color:#595959;">          // let res1 = import("./js/1.js"); //返回一个Promise对象</font>

<font style="color:#595959;">          // res1.then((res) => {</font>

<font style="color:#595959;">          //   console.log(res);</font>

<font style="color:#595959;">          // });</font>

<font style="color:#595959;">          // 第二种写法</font>

<font style="color:#595959;">          let res1 = await import("./js/1.js");</font>

<font style="color:#595959;">          console.log(res1);</font>

<font style="color:#595959;">        } else {</font>

<font style="color:#595959;">          // let res2 = import("./js/2.js"); //返回一个Promise对象</font>

<font style="color:#595959;">          // res2.then((res) => {</font>

<font style="color:#595959;">          //   console.log(res);</font>

<font style="color:#595959;">          // });</font>

<font style="color:#595959;">          // 第二种写法</font>

<font style="color:#595959;">          let res2 = await import("./js/2.js");</font>

<font style="color:#595959;">          console.log(res2);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#000000;">1.js 需要动态导入的js逻辑文件</font>

<font style="color:#595959;">console.log('hello.js');</font>

<font style="color:#595959;">export default{</font>

<font style="color:#595959;">    name:'管理员'</font>

<font style="color:#595959;">}}</font>

<font style="color:#000000;">2.js 需要动态导入的js逻辑文件</font>

<font style="color:#595959;">console.log("2.js");</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: "普通用户",</font>

<font style="color:#595959;">};</font>

## <font style="color:#000000;">3、BigInt</font>
### （1）、概念
<font style="color:#4D4D4D;">BigInt数据类型提供了一种方法来表示大于2^53-1的整数。BigInt可以表示任意大的整数</font>

<font style="color:#4D4D4D;">适用场景：更加准确的使用时间戳和数值比较大的ID</font>

### <font style="color:#4D4D4D;">（2）、BigInt()构造函数</font>
<font style="color:#4D4D4D;">传递给BigInt()的参数将自动转换为BigInt</font>

<font style="color:#4D4D4D;">无法转换的数据类型和值会引发异常</font>

除了不能使用一元加号运算符外，其他的运算符都可以使用

<font style="color:#4D4D4D;">BigInt和Number之间不能进行混合操作</font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      //大整形（用来做更大的数值运算）</font>

<font style="color:#595959;">      //语法：数字+n</font>

<font style="color:#595959;">      // let n = 521n;</font>

<font style="color:#595959;">      // console.log(n, typeof(n));//521n  'bigint'</font>



<font style="color:#595959;">      //（1）传递给BigInt()的参数将自动转换为BigInt</font>

<font style="color:#595959;">      // let n = 123;</font>

<font style="color:#595959;">      // console.log(BigInt(n));//123n</font>

<font style="color:#595959;">      //（2）无法转换的数据类型和值会引发异常</font>

<font style="color:#595959;">      // console.log(BigInt(1.2));// 不能有浮点数子，会报错</font>

<font style="color:#595959;">      //BigInt(null); //报错</font>

<font style="color:#595959;">      //BigInt("a"); // 报错</font>



<font style="color:#595959;">      //（3）BigInt除了不能使用一元加号运算符外，其他的运算符都可以使用</font>

<font style="color:#595959;">      //   console.log(BigInt(+1n));//报错</font>

<font style="color:#595959;">      let max = Number.MAX_SAFE_INTEGER; //最大安全整数</font>

<font style="color:#595959;">      console.log(max, "max"); //9007199254740991</font>

<font style="color:#595959;">      console.log(max + 1); //9007199254740992</font>

<font style="color:#595959;">      console.log(max + 2); ////9007199254740992  不可以运算正确的结果了</font>

<font style="color:#595959;">      console.log(BigInt(max)); //9007199254740991n</font>

<font style="color:#595959;">      console.log(BigInt(max) + BigInt(1)); //9007199254740992n</font>

<font style="color:#595959;">      console.log(BigInt(max) + BigInt(2)); //9007199254740993n</font>

<font style="color:#595959;">      //   （4）BigInt和Number之间不能进行混合操作</font>

<font style="color:#595959;">      console.log(1n + 5); //报错</font>

<font style="color:#595959;">    </script></font>

## <font style="color:#000000;">4、globalThis 对象</font>
globalThis 提供了一个标准的方式来获取不同环境下的全局 this 对象（也就是全局对象自身）。不像 window 或者 self这些属性，它确保可以在有无窗口的各种环境下正常工作。所以，你可以安心的使用 globalThis，不必担心它的运行环境。为便于记忆，你只需要记住，全局作用域中的 this 就是 globalThis。

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">        console.log(globalThis);//Window</font>

<font style="color:#595959;">    </script></font>

## 5、String.matchAll
matchAll() 方法返回一个包含所有匹配正则表达式的结果的迭代器。可以使用 for...of 遍历，或者使用 展开运算符(...) 或者 Array.from 转换为数组.



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 需求，提取li中的内容</font>

<font style="color:#595959;">      let str = `<ul></font>

<font style="color:#595959;">            <li>1111</li></font>

<font style="color:#595959;">            <li>2222</li></font>

<font style="color:#595959;">        </ul>`;</font>



<font style="color:#595959;">      //声明正则</font>

<font style="color:#595959;">      const reg = /<li>(.*)<\/li>/g;</font>



<font style="color:#595959;">      //调用方法</font>

<font style="color:#595959;">      const result = str.matchAll(reg);</font>

<font style="color:#595959;">      console.log(result, "result");//result里有next()方法，可遍历</font>

<font style="color:#595959;">      for (let v of result) {</font>

<font style="color:#595959;">        //返回一个数组，[0]符合条件的每一项，[1]每一项里面的值</font>

<font style="color:#595959;">        // console.log(v, "v");</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

## 6、可选链操作符
语法：?. 

判断前面的值有没有传入，如果传了继续读取后面的属性，如果没有传，那就返回undefined，也不会报错，免去了做层层判断

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      function main(obj) {</font>

<font style="color:#595959;">        const person = obj?.one?.name;</font>

<font style="color:#595959;">        // const person = obj?.one?.name?.age;//undefined</font>

<font style="color:#595959;">        console.log(person);//张三</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      main({</font>

<font style="color:#595959;">        one: {</font>

<font style="color:#595959;">          name: "张三",</font>

<font style="color:#595959;">          sex: "男",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        two: {</font>

<font style="color:#595959;">          name: "李四",</font>

<font style="color:#595959;">          sex: "男",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

7、空值合并运算符

空值合并运算符（??）是一个逻辑运算符。

当左侧操作数为 null 或 undefined 时，其返回右侧的操作数。否则返回左侧的操作数。

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      let obj = {</font>

<font style="color:#595959;">        name: "张三",</font>

<font style="color:#595959;">        age: 18,</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // ||或运算符  像亲情，找true   &&与运算符 像爱情，找false</font>

<font style="color:#595959;">      // console.log(obj.age || "年龄不详"); //18</font>

<font style="color:#595959;">      // console.log(obj.age && "年龄不详"); //'年龄不详'</font>



<font style="color:#595959;">      // ??</font>

<font style="color:#595959;">      // console.log(obj.age ?? "19"); // 18</font>

<font style="color:#595959;">      // console.log(obj.age1 ?? "19"); //19</font>



<font style="color:#595959;">      //  || 或运算符无法区分false、0、空字符串和null/undefined</font>

<font style="color:#595959;">      //  ??无法识别null/undefined</font>



<font style="color:#595959;">      // console.log(false ||'你好');//你好</font>

<font style="color:#595959;">      // console.log(false ??'你好');//false</font>



<font style="color:#595959;">      //   console.log(''||'hello');//hello</font>

<font style="color:#595959;">      //   console.log(''??'hello');//返回空</font>



<font style="color:#595959;">      // console.log(0 || "你好"); //你好</font>

<font style="color:#595959;">      // console.log(0 ?? "hello"); //0</font>



<font style="color:#595959;">      // console.log(null || "你好1"); //你好</font>

<font style="color:#595959;">      // console.log(null ?? "hello1"); //hello</font>



<font style="color:#595959;">      // console.log(undefined || "你好2"); //你好</font>

<font style="color:#595959;">      // console.log(undefined ?? "hello2"); //hello</font>

<font style="color:#595959;">    </script></font>

??和 || 的区别是什么呢?

他们两个最大的区别就是’ '和 0，??的左侧 为 ’ '或者为 0 的时候，依然会返回左侧的值；

|| 会对左侧的数据进行boolean类型转换，所以’ '和 0 会被转换成false,返回右侧的值

**八、ES12**



## 1、逻辑赋值操作符 
逻辑赋值操作符 ??=、&&=、 ||=

<font style="color:#595959;"><script></font>

<font style="color:#595959;"> </font>

<font style="color:#595959;">      let a = true;</font>

<font style="color:#595959;">      let b = false;</font>

<font style="color:#595959;">      //console.log(a || b);//true</font>

<font style="color:#595959;">      //console.log(a && b);//false</font>

<font style="color:#595959;">      a ||= b; //a=a||b</font>

<font style="color:#595959;">      //console.log(a); //true</font>

<font style="color:#595959;">      a &&= b; //a=a&&b</font>

<font style="color:#595959;">      //console.log(a); //false</font>



<font style="color:#595959;">      let obj = {</font>

<font style="color:#595959;">        name: "章三",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      //   obj.name ??= "李四";</font>

<font style="color:#595959;">      //   console.log(obj.name);</font>

<font style="color:#595959;">      obj.age ??= 18;</font>

<font style="color:#595959;">      console.log(obj.age);</font>

<font style="color:#595959;">    </script></font>

## 2、数字分隔符
这个新特性是为了方便程序员看代码而出现的，如果数字比较大，那么看起来就不是那么一目了然

<font style="color:#333333;">分隔符不仅可以分割十进制，也可以分割二进值或者十六进值的数据，非常好用</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">        let num=123456789</font>

<font style="color:#595959;">        let num1=123_456_789</font>

<font style="color:#595959;">        console.log(num===num1);//true</font>

<font style="color:#595959;">    </script></font>

## 3、 replaceAll
所有匹配都会被替代项替换。模式可以是字符串或正则表达式，而替换项可以是字符串或针对每次匹配执行的函数。并返回一个全新的字符串

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      let str = "Lorem,Lorem ipsum dolor sit Lorem.";</font>

<font style="color:#595959;">      let newStr = str.replaceAll("Lorem",'*');</font>

<font style="color:#595959;">      console.log(newStr);//*,* ipsum dolor sit *.</font>

<font style="color:#595959;">    </script></font>

## 4、Promise.any
只要参数实例有一个变成fulfilled状态，包装实例就会变成fulfilled状态；如果所有参数实例都变成rejected状态，包装实例就会变成rejected状态。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      let ajax1 = function () {</font>

<font style="color:#595959;">        return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">          reject("失败1");</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      let ajax2 = function () {</font>

<font style="color:#595959;">        return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">          reject("失败2");</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      let ajax3 = function () {</font>

<font style="color:#595959;">        return new Promise((resolve, reject) => {</font>

<font style="color:#595959;">          reject("失败3");</font>

<font style="color:#595959;">        // resolve('成功')</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      Promise.any([ajax1(), ajax2(), ajax3()])</font>

<font style="color:#595959;">        .then((res) => {</font>

<font style="color:#595959;">          console.log(res);</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        .catch((err) => {</font>

<font style="color:#595959;">          console.log("err", err);</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">    </script></font>

1. **ES13**

类的私有属性

私有属性 语法： #属性名;

<font style="color:#595959;"><script></font>

<font style="color:#595959;">      class Person {</font>

<font style="color:#595959;">        //公有属性</font>

<font style="color:#595959;">        name;</font>

<font style="color:#595959;">        //私有属性  #属性名;</font>

<font style="color:#595959;">        #age;</font>

<font style="color:#595959;">        #weight;</font>

<font style="color:#595959;">        //构造方法</font>

<font style="color:#595959;">       constructor constructor(name, age, weight) {</font>

<font style="color:#595959;">          this.name = name;</font>

<font style="color:#595959;">          this.#age = age;</font>

<font style="color:#595959;">          this.#weight = weight;</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        // 内部创建一个方法，外部执行，可以进行访问</font>

<font style="color:#595959;">        intro() {</font>

<font style="color:#595959;">          console.log(this.name);</font>

<font style="color:#595959;">          console.log(this.#age);</font>

<font style="color:#595959;">          console.log(this.#weight);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      //实例化</font>

<font style="color:#595959;">      const girl = new Person("晓红", 18, "45kg");</font>

<font style="color:#595959;">      //console.log(girl,'girl');</font>

<font style="color:#595959;">      //Person {name: '晓红', #age: 18, #weight: '45kg'}</font>



<font style="color:#595959;">      //直接在外部访问，私有属性访问不了</font>

<font style="color:#595959;">    //   console.log(girl.name);//晓红</font>

<font style="color:#595959;">      //   console.log(girl.#age);//报错</font>

<font style="color:#595959;">      //   console.log(girl.#weight);//报错</font>



<font style="color:#595959;">      //通过内部访问，可以的</font>

<font style="color:#595959;">        girl.intro();</font>

<font style="color:#595959;">    </script></font>

**十ES14**



## 1、Array扩展
### 1.1、findLast 数组支持倒序查找
<font style="color:#4D4D4D;">在JS中，我们可以使用数组的find()函数来在数组中找到第一个满足某个条件的元素。同样地，我们还可以通过findIndex()函数来返回这个元素的位置。可是，无论是find()还是findIndex()，它们都是从数组的头部开始查找元素的，可是在某些情况下，我们可能有从数组后面开始查找某个元素的需要。</font>

<font style="color:#4D4D4D;">ES13出来后，我们终于有办法处理这种情况了，那就是使用新的findLast()和findLastIndex()函数。这两个函数都会从数组的末端开始寻找某个满足条件的元素</font>

<font style="color:#595959;">const letters = [</font>

<font style="color:#595959;">  { value: 'z' },</font>

<font style="color:#595959;">  { value: 'y' },</font>

<font style="color:#595959;">  { value: 'x' },</font>

<font style="color:#595959;">  { value: 'y' },</font>

<font style="color:#595959;">  { value: 'z' },</font>

<font style="color:#595959;">];</font>



<font style="color:#595959;">// 倒序查找</font>

<font style="color:#595959;">const found = letters.findLast((item) => item.value === 'y');</font>

<font style="color:#595959;">const foundIndex = letters.findLastIndex((item) => item.value === 'y');</font>



<font style="color:#595959;">console.log(found); // { value: 'y' }</font>

<font style="color:#595959;">console.log(foundIndex); // 3</font>

### 1.2、toSorted 
<font style="color:#4D4D4D;">sort方法的复制版本，区别就是sort是修改原数组，而toSorted是返回新数组。</font>

<font style="color:#4D4D4D;">我们先来看看sort</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.sort();</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

<font style="color:#4D4D4D;">我们再来看看toSorted</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.toSorted();</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

<font style="color:#4D4D4D;">看出区别来了吧，新老数组不一样</font>

### 1.3、toReversed 
reverse方法的复制版本反转，toReversed不修改原数组，返回新数组

<font style="color:#4D4D4D;">我们先来看看reverse</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.reverse();</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

<font style="color:#4D4D4D;">我们再来看看toReversed</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.toReversed();</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

<font style="color:#4D4D4D;">看出区别来了吧，新老数组不一样</font>

### 1.4、toSpliced 
<font style="color:#4D4D4D;">toSpliced与splice区别就很大了。splice是截取原数组的数据，并返回截取出来的数据。toSpliced是对原数组的副本进行操作，然后返回被截取完后的新数组，并不会修改原数组。</font>

<font style="color:#4D4D4D;">我们先来看看splice</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.splice(1, 2);</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

<font style="color:#4D4D4D;">看出区别了吧，toSpliced并不会影响原数组。返回的是截取后的数组。</font>

### 1.5、with 、
通<font style="color:#4D4D4D;">with有点类似我们通过[index]来修改数组，区别就是with不是修改原数组，而是返回整个新数组。</font>

<font style="color:#4D4D4D;">我们先来看看通过下标来修改数组的</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">arr[1] = 10;</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">const arr = [1, 3, 5, 2, 8];</font>



<font style="color:#595959;">const newArr = arr.with(1, 10);</font>

<font style="color:#595959;">console.log("原数组:", arr);</font>

<font style="color:#595959;">console.log("新数组:", newArr);</font>

## 2、WeakMap扩展
<font style="color:#4F4F4F;">支持 Symbol 作用键</font>

<font style="color:#4D4D4D;">之前WeakMap是只支持对象作为键，现在还支持 Symbol 作为键</font>

<font style="color:#595959;">const weak = new WeakMap();</font>

<font style="color:#595959;">const key = Symbol("ref");</font>

<font style="color:#595959;">weak.set(key, "randy");</font>



<font style="color:#595959;">console.log(weak.get(key)); // randy</font>
