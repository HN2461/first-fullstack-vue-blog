---
title: "TypeScript 快速上手"
slug: "typescript-quick-start"
summary: "从 TypeScript 的定位、静态类型检查、编译环境、常用类型、接口与泛型入门，整理一套可直接查阅的快速上手笔记。"
category: "TypeScript"
categoryPath:
  - "前端技术"
  - "TypeScript"
tags:
  - "TypeScript"
  - "JavaScript"
  - "前端开发"
status: "published"
sortOrder: 20
cover: ""
originalId: "6aba2ca7ed2c7796bd5f5562"
originalSlug: "typescript-quick-start"
originalStatus: "published"
publishedAt: "2026-09-28T09:00:23.766Z"
updatedAt: "2026-09-28T09:00:23.803Z"
exportedAt: "2026-09-28T09:01:20.378Z"
---
# <font style="color:rgb(38,38,38);">⼀、TypeScript 简介</font>
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1743689330988-878f7b29-2e19-42a6-a9a3-ed90637d7135.png)

1. TypeScript 由微软开发，是基于 JavaScript 的⼀个扩展语⾔。
2. TypeScript 包含了 JavaScript 的所有内容，即： TypeScript 是 JavaScript 的**超集**。
3. TypeScript 增加了：静态类型检查、接⼝、 泛型等很多现代开发特性，更适合⼤型项⽬的开发。
4. TypeScript 需要编译为 JavaScript ，然后交给浏览器或其他 JavaScript 运⾏环境执⾏。

# <font style="color:rgb(38,38,38);">⼆、为何需要 TypeScript</font>
## <font style="color:rgb(38,38,38);">1️⃣</font><font style="color:rgb(38,38,38);">今⾮昔⽐的 JavaScript（了解） </font>
:::tips
+ <font style="color:rgb(88,90,90);">JavaScript 当年诞⽣时的定位是浏览器</font><font style="color:rgb(223,42,63);">脚本语⾔</font><font style="color:rgb(88,90,90);">，⽤于在⽹⻚中嵌⼊</font><font style="color:rgb(223,42,63);">简单的逻辑</font><font style="color:rgb(88,90,90);">，且代码量很少。 </font>
+ <font style="color:rgb(88,90,90);">随着时间的推移，JavaScript 变得越来越流⾏，如今的 JavaScript 已经可以</font><font style="color:rgb(223,42,63);">全栈编程</font><font style="color:rgb(88,90,90);">了。 </font>
+ <font style="color:rgb(88,90,90);">现如今的 JavaScript </font><font style="color:rgb(223,42,63);">应⽤场景</font><font style="color:rgb(88,90,90);">⽐当年</font><font style="color:rgb(223,42,63);">丰富</font><font style="color:rgb(88,90,90);">的多，</font><font style="color:rgb(223,42,63);">代码量</font><font style="color:rgb(88,90,90);">也⽐当年</font><font style="color:rgb(223,42,63);">⼤</font><font style="color:rgb(88,90,90);">很多，随便⼀个 JavaScript 项⽬的代码量，可以轻松的达到⼏万⾏，甚⾄⼗⼏万⾏！ </font>
+ <font style="color:rgb(88,90,90);">然⽽ JavaScript 当年“</font><font style="color:rgb(223,42,63);">出⽣简陋</font><font style="color:rgb(88,90,90);">”，没考虑到如今的应⽤场景和代码量，逐渐就出现了</font><font style="color:rgb(223,42,63);">很多困扰</font><font style="color:rgb(88,90,90);">。 </font>

:::

## <font style="color:rgb(38,38,38);">2️⃣</font><font style="color:rgb(38,38,38);">JavaScript 中的困扰 </font>
<font style="color:rgb(38,38,38);">😞</font><font style="color:rgb(38,38,38);"> 1. 不清楚的数据类型 </font>

```typescript
let welcome = 'hello' 
welcome() // 此⾏报错：TypeError: welcome is not a function
```

<font style="color:rgb(38,38,38);">😞</font><font style="color:rgb(38,38,38);"> 2. 有漏洞的逻辑 </font>

```typescript
const str = Date.now() % 2 ? '奇数' : '偶数'
if (str !== '奇数') {
 alert('hello')
} else if (str === '偶数') {
 alert('world')		//有漏洞，因为上一行就已经对偶数做出回应，此行永远不会执行
}
```

<font style="color:rgb(38,38,38);">😞</font><font style="color:rgb(38,38,38);"> 3. </font><font style="color:rgb(0,0,0);">访问不存在的属性 </font>

```typescript
const obj = { width: 10, height: 15 };
const area = obj.width * obj.heigth;// height属性名拼写错误
```

<font style="color:rgb(38,38,38);">😞</font><font style="color:rgb(38,38,38);"> 4. 低级的拼写错误 </font>

```typescript
const message = 'hello,world'
message.toUperCase()	//字符串转大写的方法名拼写错误
```

## <font style="color:rgb(38,38,38);">3️⃣</font><font style="color:rgb(38,38,38);">『静态类型检查』 </font>
+ <font style="color:rgb(38,38,38);">在代码运⾏前进⾏检查，发现代码的错误或不合理之处，减⼩运⾏时出现异常的⼏率，此种检查叫『</font><font style="color:rgb(223,42,63);">静态类型检查</font><font style="color:rgb(38,38,38);">』，TypeScript 和核⼼就是</font>`**<font style="color:rgb(38,38,38);">『静态类型检查』</font>**`<font style="color:rgb(38,38,38);">，简⾔之就是</font><font style="color:rgb(223,42,63);">把运⾏时的错误前置</font><font style="color:rgb(38,38,38);">。 </font>
+ <font style="color:rgb(38,38,38);">同样的功能，TypeScript 的代码量要</font>**<font style="color:rgb(223,42,63);">⼤于</font>**<font style="color:rgb(223,42,63);"> </font><font style="color:rgb(38,38,38);">JavaScript，但由于 TypeScript 的代码结构更加清晰，在后期代码的维护中 TypeScript 却</font>**<font style="color:rgb(223,42,63);">胜于</font>**<font style="color:rgb(223,42,63);"> </font><font style="color:rgb(38,38,38);">JavaScript。</font>

# <font style="color:rgb(38,38,38);">三、编译 TypeScript</font>
:::info
<font style="color:rgb(38,38,38);">浏览器不能直接运⾏ TypeScript 代码，需要编译为 JavaScript 再交由浏览器解析器执⾏。</font>

:::

## 命令⾏编译
:::tips
<font style="color:rgb(38,38,38);">要把 .ts ⽂件编译为 .js ⽂件，需要配置 TypeScript 的编译环境，步骤如下：</font>

:::

+ <font style="color:rgb(38,38,38);">第⼀步：创建⼀个 demo.ts ⽂件，例如：</font>

```typescript
const person = {
 name:'李四',
 age:18
}
console.log(`我叫${person.name}，我今年${person.age}岁了`)
```

+ <font style="color:rgb(38,38,38);">第⼆步：全局安装 TypeScript</font>

```typescript
npm i typescript -g
```

+ <font style="color:rgb(38,38,38);">第三步：使⽤命令编译 .ts ⽂件</font>

```typescript
tsc demo.ts
```

## ⾃动化编译
+ <font style="color:rgb(38,38,38);">第⼀步：创建 TypeScript 编译控制⽂件</font>

```typescript
tsc --init
```

:::tips
<font style="color:rgb(38,38,38);">1. ⼯程中会⽣成⼀个 tsconfig.json 配置⽂件，其中包含着很多编译时的配置。 </font>

<font style="color:rgb(38,38,38);">2. 观察发现，默认编译的 JS 版本是 ES7 ，我们可以⼿动调整为其他版本。</font>

:::

+ <font style="color:rgb(38,38,38);">第⼆步：监视⽬录中的 .ts ⽂件变化</font>

```typescript
tsc --watch 或 tsc -w
```

+ <font style="color:rgb(38,38,38);">第三步：⼩优化，当编译出错时不⽣成 .js ⽂件</font>

```typescript
tsc --noEmitOnError --watch
```

:::tips
<font style="color:rgb(38,38,38);">备注：当然也可以修改 tsconfig.json 中的 noEmitOnError 配置</font>

:::

# <font style="color:rgb(38,38,38);">四、类型声明</font>
<font style="color:rgb(38,38,38);">使⽤</font>`**<font style="color:#DF2A3F;"> ：</font>**`**<font style="color:#DF2A3F;"> </font>**<font style="color:rgb(38,38,38);">来对变量或函数形参，进⾏类型声明:</font>

```typescript
let a: string //变量a只能存储字符串
let b: number //变量b只能存储数值
let c: boolean //变量c只能存储布尔值

a = 'hello'
a = 100 //警告：不能将类型“number”分配给类型“string”

b = 666
b = '你好'//警告：不能将类型“string”分配给类型“number”

c = true
c = 666 //警告：不能将类型“number”分配给类型“boolean”

// 参数x必须是数字，参数y也必须是数字，函数返回值也必须是数字
function demo(x:number,y:number):number{
 return x + y
}

demo(100,200)
demo(100,'200') //警告：类型“string”的参数不能赋给类型“number”的参数
demo(100,200,300) //警告：应有 2 个参数，但获得 3 个
demo(100) //警告：应有 2 个参数，但获得 1 个
```

<font style="color:rgb(38,38,38);">在 : 后也可以写字⾯量类型，不过实际开发中⽤的不多。</font>

```typescript
let a: '你好' //a的值只能为字符串“你好”
let b: 100 //b的值只能为数字100

a = '欢迎'//警告：不能将类型“"欢迎"”分配给类型“"你好"”
b = 200 //警告：不能将类型“200”分配给类型“100”
```



# <font style="color:rgb(38,38,38);">五、类型推断</font>
<font style="color:rgb(38,38,38);">TS 会根据我们的代码，进⾏类型推导，例如下⾯代码中的变量 d ，只能存储数字</font>

```typescript
let d = -99 //TypeScript会推断出变量d的类型是数字
d = false //警告：不能将类型“boolean”分配给类型“number”
```

:::tips
<font style="color:rgb(38,38,38);">但要注意，类型推断不是万能的，⾯对复杂类型时推断容易出问题，所以尽量还是明确的编写类型声明！</font>

:::

# <font style="color:rgb(38,38,38);">六、类型总览</font>
<font style="color:rgb(243,143,57);">JavaScript 中的数据类型</font>

:::warning
<font style="color:rgb(38,38,38);">① </font>**<font style="color:rgb(38,38,38);">string </font>**

<font style="color:rgb(38,38,38);">② </font>**<font style="color:rgb(38,38,38);">number </font>**

<font style="color:rgb(38,38,38);">③ </font>**<font style="color:rgb(38,38,38);">boolean </font>**

<font style="color:rgb(38,38,38);">④ </font>**<font style="color:rgb(38,38,38);">null </font>**

<font style="color:rgb(38,38,38);">⑤ </font>**<font style="color:rgb(38,38,38);">undefined </font>**

<font style="color:rgb(38,38,38);">⑥ </font>**<font style="color:rgb(38,38,38);">bigint 			</font>**<font style="color:rgba(0, 0, 0, 0.95);">JavaScript 中，Number 类型有其取值范围限制，而 bigint 类型可以表示任意大的整数。</font>

<font style="color:rgb(38,38,38);">⑦ </font>**<font style="color:rgb(38,38,38);">symbol </font>**

<font style="color:rgb(38,38,38);">⑧ </font>**<font style="color:rgb(38,38,38);">object </font>**

<font style="color:rgb(38,38,38);">备注：其中 </font>**<font style="color:rgb(38,38,38);">object </font>**<font style="color:rgb(38,38,38);">包含： </font>**<font style="color:rgb(38,38,38);">Array </font>**<font style="color:rgb(38,38,38);">、 </font>**<font style="color:rgb(38,38,38);">Function </font>**<font style="color:rgb(38,38,38);">、 </font>**<font style="color:rgb(38,38,38);">Date </font>**<font style="color:rgb(38,38,38);">、 </font>**<font style="color:rgb(38,38,38);">Error </font>**<font style="color:rgb(38,38,38);">等......</font>

:::

<font style="color:rgb(47,142,244);"></font>

<font style="color:rgb(47,142,244);">TypeScript 中的数据类型</font>

:::info
1. 上述所有 JavaScript 类型
2. 六个新类型：  
① any  
② unknown  
③ never  
④ void  
⑤ tuple  
⑥ enum
3. 两个⽤于⾃定义类型的⽅式：  
① type  
② interface

:::



**<font style="color:rgb(173,26,43);">注意点！</font>**

:::color4
<font style="color:rgb(38,38,38);">在 JavaScript 中的这些内置构造函数： Number 、 String 、 Boolean ，⽤于创建对应的</font><u><font style="color:rgb(38,38,38);">包装对象</font></u><font style="color:rgb(38,38,38);">，在⽇常开发时</font><font style="color:rgb(173,26,43);">很少使⽤</font><font style="color:rgb(38,38,38);">，在 TypeScript 中也是同理，所以在 TypeScript 中进⾏类型声明时，通常都是⽤⼩写的 number 、 string 、 boolean</font>

:::

<font style="color:rgb(38,38,38);">例如下⾯代码：</font>

```typescript
let str1: string
str1 = 'hello'
str1 = new String('hello') //报错

let str2: String
str2 = 'hello'
str2 = new String('hello')

console.log(typeof str1)
console.log(typeof str2)
```

:::tips
1. 原始类型 VS 包装对象
+ 原始类型：如 number 、 string 、 boolean ，在 JavaScript 中是简单数据类型，它们在内存中占⽤空间少，处理速度快。
+ 包装对象：如 Number 对象、 String 对象、 Boolean 对象，是复杂类型，在内存中占⽤更多空间，在⽇常开发时很少由开发⼈员⾃⼰创建包装对象。
2. ⾃动装箱：JavaScript 在必要时会**<u>⾃动</u>**<u>将原始类型包装成对象，以便调⽤⽅法或访问属性</u>

:::

```typescript
// 原始类型字符串
let str = 'hello';

// 当访问str.length时，JavaScript引擎做了以下⼯作：
let size = (function() {
 // 1. ⾃动装箱：创建⼀个临时的String对象包装原始字符串
 let tempStringObject = new String(str);
  
 // 2. 访问String对象的length属性
 let lengthValue = tempStringObject.length;
  
 // 3. 销毁临时对象，返回⻓度值
 // （JavaScript引擎⾃动处理对象销毁，开发者⽆感知）
 return lengthValue;
})();

console.log(size); // 输出: 5
```



# <font style="color:rgb(38,38,38);">七、常⽤类型与语法</font>
## any
:::info
<font style="color:rgb(38,38,38);">any 的含义是：任意类型，⼀旦将变量类型限制为 any ，那就意味着</font><font style="color:rgb(223,42,63);">放弃了</font><font style="color:rgb(38,38,38);">对该变量的类型检查。</font>

:::

```typescript
// 明确的表示a的类型是 any —— 【显式的any】
let a: any
// 以下对a的赋值，均⽆警告
a = 100
a = '你好'
a = false

// 没有明确的表示b的类型是any，但TS主动推断出来b是any —— 隐式的any
let b
//以下对b的赋值，均⽆警告
b = 100
b = '你好'
b = false
```

<font style="color:rgb(38,38,38);">注意点： any 类型的变量，可以赋值给任意类型的变量</font>

```typescript
/* 注意点：any类型的变量，可以赋值给任意类型的变量 */
let c:any
c = 9

let x: string
x = c // ⽆警告
```

## unknown
:::info
<font style="color:rgb(38,38,38);">unknown 的含义是：</font><font style="color:rgb(223,42,63);">未知类型</font><font style="color:rgb(38,38,38);">，适⽤于：起初不确定数据的具体类型，要后期才能确定</font>

:::

1. unknown 可以理解为⼀个类型安全的 any 。

```typescript
// 设置a的类型为unknown
let a: unknown

// unKnown类型的变量可以接受任意类型的赋值
//以下对a的赋值，均符合规范
a = 100
a = false
a = '你好'

// 不能将unKnown类型的变量赋值给类型确定的变量
// 设置x的数据类型为string
let x: string
x = a //警告：不能将类型“unknown”分配给类型“string”
```

2. unknown 会强制开发者在使⽤之前进⾏类型检查，从⽽提供更强的类型安全性。

```typescript
// 设置a的类型为unknown
let a: unknown
a = 'hello'

// 想要将unKnown类型变量赋值给类型确定的变量，
// 需要先对unknown类型变量进行类型检查，确保赋值时类型确定

//第⼀种⽅式：加类型判断
if(typeof a === 'string'){
 x = a
 console.log(x)
}

//第⼆种⽅式：加断⾔	as方法
x = a as string

//第三种⽅式：加断⾔	类型标签方法
x = <string>a
```

3. 读取 any 类型数据的任何属性都不会报错，⽽ unknown 正好与之相反。

```typescript
let str1: string
str1 = 'hello'
str1.toUpperCase() //⽆警告

let str2: any
str2 = 'hello'
str2.toUpperCase() //⽆警告

let str3: unknown
str3 = 'hello';
// 系统读取unknown类型变量会报错
str3.toUpperCase() //警告：“str3”的类型为“未知”
  
// 使⽤断⾔强制指定str3的类型为string
(str3 as string).toUpperCase() //⽆警告
```

## never
:::info
<font style="color:rgb(38,38,38);">never 的含义是：任何值都不是，即: </font>**<font style="color:#DF2A3F;">不能有值</font>**<font style="color:rgb(38,38,38);">，例如 undefined 、 null 、 ' ' 、 0 都不⾏！</font>

:::

1. ⼏乎不⽤ never 去直接限制变量，因为没有意义，例如：

```typescript
/* 指定a的类型为never，那就意味着a以后不能存任何的数据了 */
let a: never

// 以下对a的所有赋值都会有警告
a = 1
a = true
a = undefined
a = null
```

2. never ⼀般是 TypeScript 主动推断出来的，例如：

```typescript
// 指定a的类型为string
let a: string
// 给a设置⼀个值
a = 'hello'

if (typeof a === 'string') {
   console.log(a.toUpperCase())
} else {
   console.log(a) // TypeScript会推断出此处的a是never，因为没有任何⼀个值符合此处的逻辑
}
```

3. never 也可⽤于限制函数的返回值

```typescript
// 限制throwError函数不需要有任何返回值，任何值都不⾏，像undeifned、null都不⾏
function throwError(str: string): never {
     throw new Error('程序异常退出:' + str)
}
```

## void
:::info
<font style="color:rgb(38,38,38);">void 的含义是空，即：函数</font><font style="color:#DF2A3F;">不返回任何值</font><font style="color:rgb(38,38,38);">，调⽤者也不应依赖其返回值进⾏</font><font style="color:rgb(223,42,63);">任何操作</font><font style="color:rgb(38,38,38);">！</font>

:::

1. void 通常⽤于函数返回值声明

```typescript
function logMessage(msg:string):void{
     console.log(msg)
}
logMessage('你好')
```

:::color4
<font style="color:rgb(38,38,38);">注意：编码者没有编写 return 指定函数返回值，所以 logMessage 函数是没有</font><font style="color:rgb(223,42,63);">显式返回值</font><font style="color:rgb(38,38,38);">的，但会有⼀个</font><font style="color:rgb(223,42,63);">隐式返回值 </font><font style="color:rgb(38,38,38);">，是 undefined ，虽然函数返回类型为 void ，但也是可以接受 undefined 的，简单记：</font><u><font style="color:rgb(38,38,38);"> </font></u>**<u><font style="color:rgb(38,38,38);">undefined </font></u>**<u><font style="color:rgb(38,38,38);">是 </font></u>**<u><font style="color:rgb(38,38,38);">void </font></u>**<u><font style="color:rgb(38,38,38);">可以接受的⼀种“空”。</font></u>

:::

2. 以下写法均符合规范

```typescript
// ⽆警告
function logMessage(msg:string):void{
     console.log(msg)
}

// ⽆警告
function logMessage(msg:string):void{
     console.log(msg)
     return;
}

// ⽆警告
function logMessage(msg:string):void{
     console.log(msg)
     return undefined
}
```

3. 那限制函数返回值时，是不是 undefined 和 void 就没区别呢？—— 有区别。因为还有这句话 ：【返回值类型为 void 的函数，调⽤者不应依赖其返回值进⾏任何操作！】对⽐下⾯两段代码：

```typescript
function logMessage(msg:string):void{
   console.log(msg)
}

let result = logMessage('你好')

// void类型的返回值不能被操作
if(result){ // 此⾏报错：⽆法测试 "void" 类型的表达式的真实性
   console.log('logMessage有返回值')
}
```

```typescript
function logMessage(msg:string):undefined{
   console.log(msg)
}

let result = logMessage('你好')

// undefind类型的返回值可以被操作
if(result){ // 此⾏⽆警告
   console.log('logMessage有返回值')
}
```

:::tips
<font style="color:rgb(38,38,38);">理解 void 与 undefined </font>

+ <font style="color:rgb(88,90,90);">void 是⼀个⼴泛的概念，⽤来表达“空”，⽽ undefined 则是这种“空”的具体实现。 </font>
+ <font style="color:rgb(88,90,90);">因此可以说 undefined 是 void 能接受的⼀种“空”的状态。 </font>
+ <font style="color:rgb(88,90,90);">也可以理解为： void 包含 undefined ，但 void 所表达的语义超越了undefined ， void 是⼀种意图上的约定，⽽不仅仅是特定值的限制。</font>

:::

<font style="color:rgb(38,38,38);">总结：</font>

:::info
如果⼀个函数返回类型为 void ，那么：

1. <font style="color:rgb(38,38,38);">从语法上讲：函数是可以返回 undefined 的，⾄于显式返回，还是隐式返回，这⽆所谓！</font>
2. <font style="color:rgb(38,38,38);">从语义上讲：函数调⽤者不应关⼼函数返回的值，</font><u><font style="color:rgb(38,38,38);">也不应依赖返回值进⾏任何操作！</font></u><font style="color:rgb(38,38,38);">  
</font><font style="color:rgb(38,38,38);">即使我们知道它返回了 undefined 。</font>

:::



## object
:::info
<font style="color:rgb(38,38,38);">关于 </font>**<font style="color:rgb(17,124,238);">object </font>**<font style="color:rgb(38,38,38);">与 </font>**<font style="color:rgb(223,42,63);">Object </font>**<font style="color:rgb(38,38,38);">，直接说结论：实际开发中⽤的相对较少，因为范围太⼤了。</font>

:::

### <font style="color:rgb(17,124,238);">object（⼩写） </font>
**<font style="color:rgb(47,142,244);">object </font>**<font style="color:rgb(38,38,38);">（⼩写）的含义是：所有</font>**<font style="color:rgb(47,142,244);">非原始类型</font>**<font style="color:rgb(38,38,38);">，可存储：</font><u><font style="color:rgb(38,38,38);">对象、函数、数组</font></u><font style="color:rgb(38,38,38);">等，由于限制的范围</font><font style="color:rgb(47,142,244);">⽐较宽泛</font><font style="color:rgb(38,38,38);">，在实际开发中使⽤的</font><font style="color:rgb(17,124,238);">相对较少</font><font style="color:rgb(38,38,38);">。</font>

```typescript
let a:object //a的值可以是任何【⾮原始类型】，包括：对象、函数、数组等

// 以下代码，是将【⾮原始类型】赋给a，所以均符合要求
a = {}
a = {name:'张三'}
a = [1,3,5,7,9]
a = function(){}
a = new String('123')
class Person {}
a = new Person()

// 以下代码，是将【原始类型】赋给a，有警告
a = 1 // 警告：不能将类型“number”分配给类型“object”
a = true // 警告：不能将类型“boolean”分配给类型“object”
a = '你好' // 警告：不能将类型“string”分配给类型“object” 
a = null // 警告：不能将类型“null”分配给类型“object”
a = undefined // 警告：不能将类型“undefined”分配给类型“object”
```

### <font style="color:rgb(223,42,63);">Object（⼤写）</font>
+ <font style="color:rgb(38,38,38);">官⽅描述：所有可以调⽤ </font>**<font style="color:rgb(223,42,63);">Object </font>**<font style="color:rgb(38,38,38);">⽅法的类型。 </font>
+ <font style="color:rgb(38,38,38);">简单记忆：</font><u><font style="color:rgb(38,38,38);">除了 undefined 和 null 的任何值。 </font></u>
+ <font style="color:rgb(38,38,38);">由于限制的范围实在</font><font style="color:rgb(223,42,63);">太⼤了</font><font style="color:rgb(38,38,38);">！所以实际开发中使⽤</font><font style="color:rgb(223,42,63);">频率极低</font><font style="color:rgb(38,38,38);">。 </font>

```typescript
let b:Object //b的值必须是Object的实例对象（除去undefined和null的任何值）

// 以下代码，均⽆警告，因为给a赋的值，都是Object的实例对象
b = {}
b = {name:'张三'}
b = [1,3,5,7,9]
b = function(){}
b = new String('123')
class Person {}
b = new Person()
b = 1 // 1不是Object的实例对象，但其包装对象是Object的实例
b = true // truue不是Object的实例对象，但其包装对象是Object的实例
b = '你好' // “你好”不是Object的实例对象，但其包装对象是Object的实例

// 以下代码均有警告
b = null // 警告：不能将类型“null”分配给类型“Object”
b = undefined // 警告：不能将类型“undefined”分配给类型“Object”
```

### <font style="color:rgb(38,38,38);">声明对象类型</font>
1. 实际开发中，<u>限制⼀般对象</u>，通常使⽤以下形式

```typescript
// 给你的才能要，没给你的不能用
// 限制person1对象必须有name属性，变量后面加 ? 表示age为可选属性
let person1: { name: string, age?: number }

// 含义同上，也能⽤分号做分隔
let person2: { name: string; age?: number }

// 含义同上，也能⽤换⾏做分隔
let person3: {
   name: string
   age?: number
}

// 如下赋值均可以
person1 = {name:'李四',age:18}
person2 = {name:'张三'}
person3 = {name:'王五'}

// 如下赋值不合法，因为person3的类型限制中，没有对gender属性的说明
person3 = {name:'王五',gender:'男'}
```

2. 索引签名： 允许定义对象可以`**<u>具有任意数量的属性</u>**`，这些属性的键和类型是可变的，  
常⽤于：描述类型不确定的属性，（具有动态属性的对象）。

```typescript
// 限制person对象必须有name属性，可选age属性但值必须是数字，
// 同时可以有任意数量、任意类型的其他属性
let person: {
 name: string
 age?: number
 [key: string]: any // 索引签名，完全可以不⽤key这个单词，换成其他的也可以
}

// 赋值合法
person = {
   name:'张三',
   age:18,
   gender:'男'
}
```

### <font style="color:rgb(38,38,38);">声明函数类型</font>
```typescript
let count: (a: number, b: number) => number		//此箭头并非表示箭头函数

count = function (x, y) {
     return x + y
}
```

:::tips
<font style="color:rgb(38,38,38);">备注： </font>

+ <font style="color:rgb(38,38,38);">TypeScript 中的 => 在函数类型声明时</font><u><font style="color:rgb(38,38,38);">表示函数类型，描述其参数类型和返回类型</font></u><font style="color:rgb(38,38,38);">。 </font>
+ <font style="color:rgb(38,38,38);">JavaScript 中的 => 是⼀种定义函数的语法，是具体的函数实现。 </font>
+ <font style="color:rgb(38,38,38);">函数类型声明还可以使⽤：接⼝、⾃定义类型等⽅式，下⽂中会详细讲解。</font>

:::

### <font style="color:rgb(38,38,38);">声明数组类型</font>
```typescript
//类型为数组，其元素类型为字符串
let arr1: string[]				//字面量写法
let arr2: Array<string>		//类型名写法

arr1 = ['a','b','c']
arr2 = ['hello','world']
```

:::tips
<font style="color:rgb(38,38,38);">备注：上述代码中的 Array<string> 属于泛型，下⽂会详细讲解</font>

:::



## tuple
:::info
<font style="color:rgb(38,38,38);">元组 (Tuple) 是⼀种</font><u><font style="color:rgb(38,38,38);">特殊的数组类型</font></u><font style="color:rgb(38,38,38);">，可以</font><u><font style="color:rgb(38,38,38);">存储固定数量的元素</font></u><font style="color:rgb(38,38,38);">，并且每个元素的类型是已知的且可以不同。元组⽤于</font><font style="color:#DF2A3F;">精确描述⼀组值的类型</font><font style="color:rgb(38,38,38);">， ? 表示可选元素。</font>

:::

```typescript
// 第⼀个元素必须是 string 类型，第⼆个元素必须是 number 类型。
let arr1: [string,number]
// 第⼀个元素必须是 number 类型，第⼆个元素是可选的，如果存在，必须是 boolean 类型。
let arr2: [number,boolean?]
// 第⼀个元素必须是 number 类型，后⾯的元素可以是任意数量的 string 类型
let arr3: [number,...string[]]

// 可以赋值
arr1 = ['hello',123]
arr2 = [100,false]
arr2 = [200]
arr3 = [100,'hello','world']
arr3 = [100]

// 不可以赋值，arr1声明时是两个元素，赋值的是三个
arr1 = ['hello',123,false]
```



## enum
:::info
<font style="color:rgb(38,38,38);">枚举（ enum ）可以定义</font><font style="color:rgb(223,42,63);">⼀组命名常量</font><font style="color:rgb(38,38,38);">，它能增强代码的可读性，也让代码更好维护。</font>

:::

<font style="color:rgb(38,38,38);">如下代码的功能是：根据调⽤ walk 时传⼊的不同参数，执⾏不同的逻辑，存在的问题是调⽤ walk 时传参时没有任何提示，编码者很容易写错字符串内容；并且⽤于判断逻辑的 up、down、left、right 是</font>**<font style="color:rgb(223,42,63);">连续且相关的⼀组值</font>**<font style="color:rgb(38,38,38);">，那此时就特别适合使⽤</font>**<font style="color:rgb(38,38,38);"> </font>****<font style="color:rgb(223,42,63);">枚举</font>**<font style="color:rgb(223,42,63);">（ </font>**<font style="color:rgb(223,42,63);">enum </font>**<font style="color:rgb(223,42,63);">）</font><font style="color:rgb(38,38,38);">。</font>

```typescript
function walk(str:string) {
   if (str === 'up') {
       console.log("向【上】⾛");
   } else if (str === 'down') {
       console.log("向【下】⾛");
   } else if (str === 'left') {
       console.log("向【左】⾛");
   } else if (str === 'right') {
       console.log("向【右】⾛");
   } else {
       console.log("未知⽅向");
   }
}

walk('up')
walk('down')
walk('left')
walk('right')
```

### 数字枚举
<font style="color:rgb(38,38,38);">数字枚举⼀种最常⻅的枚举类型，其成员的值会</font>**<font style="color:rgb(223,42,63);">⾃动递增</font>**<font style="color:rgb(38,38,38);">，且数字枚举还具备</font>**<font style="color:rgb(223,42,63);">反向映射</font>**<font style="color:rgb(38,38,38);">的特点，在下⾯代码的打印中，不难发现：可以通过</font><font style="color:rgb(223,42,63);">值</font><font style="color:rgb(38,38,38);">来获取对应的枚举</font><font style="color:rgb(223,42,63);">成员名称 </font><font style="color:rgb(38,38,38);">。</font>

```typescript
// 定义⼀个描述【上下左右】⽅向的枚举Direction
enum Direction {
   Up,
   Down,
   Left,
   Right
}

console.log(Direction) // 打印Direction会看到如下内容
/* 
 {
 0:'Up', 
 1:'Down', 
 2:'Left', 
 3:'Right', 
 Up:0, 
 Down:1, 
 Left:2,
 Right:3
 } 
*/

// 反向映射
console.log(Direction.Up)
console.log(Direction[0])

// 此⾏代码报错，枚举中的属性是只读的
Direction.Up = 'shang'
```

<font style="color:rgb(38,38,38);">也可以</font><u><font style="color:rgb(38,38,38);">指定枚举成员的初始值</font></u><font style="color:rgb(38,38,38);">，其后的成员值会⾃动递增。</font>

```typescript
enum Direction {
   Up = 6,
   Down,
   Left,
   Right
}

console.log(Direction.Up); // 输出: 6
console.log(Direction.Down); // 输出: 7
```

<font style="color:rgb(38,38,38);">使⽤数字枚举完成刚才 walk 函数中的逻辑，此时我们发现： </font>**<font style="color:rgb(38,38,38);">代码更加直观易读，⽽且类型安全，同时也更易于维护。</font>**

```typescript
enum Direction {
   Up,
   Down,
   Left,
   Right,
}

function walk(n: Direction) {
   if (n === Direction.Up) {
       console.log("向【上】⾛");
   } else if (n === Direction.Down) {
       console.log("向【下】⾛");
   } else if (n === Direction.Left) {
       console.log("向【左】⾛");
   } else if (n === Direction.Right) {
       console.log("向【右】⾛");
   } else {
       console.log("未知⽅向");
   }
}

walk(Direction.Up)
walk(Direction.Down)
```

### 字符串枚举
<font style="color:rgb(38,38,38);">枚举</font><u><font style="color:rgb(38,38,38);">成员的值是字符串</font></u>

```typescript
enum Direction {
   Up = "up",
   Down = "down",
   Left = "left",
   Right = "right"
}

let dir: Direction = Direction.Up;
console.log(dir); // 输出: "up"
```

### 常量枚举
:::info
<font style="color:rgb(38,38,38);">官⽅描述：常量枚举是⼀种特殊枚举类型，它使⽤</font>`<font style="color:rgb(38,38,38);"> const </font>`<font style="color:rgb(38,38,38);">关键字定义，在编译时会被</font><font style="color:rgb(223,42,63);">内联</font><font style="color:rgb(38,38,38);">，</font><font style="color:rgb(223,42,63);">避免</font><font style="color:rgb(38,38,38);">⽣成⼀些</font><font style="color:rgb(223,42,63);">额外</font><font style="color:rgb(38,38,38);">的代码。</font>

:::

:::tips
<font style="color:rgb(38,38,38);">何为</font><font style="color:rgb(223,42,63);">编译时内联</font><font style="color:rgb(38,38,38);">？ </font>

<font style="color:rgb(38,38,38);">所谓“内联”其实就是 TypeScript 在编译时，会</font>**<font style="color:rgb(38,38,38);">将枚举成员引⽤替换为它们的实际值</font>**<font style="color:rgb(38,38,38);">，⽽不是⽣成额外的枚举对象。这可以</font><u><font style="color:rgb(38,38,38);">减少⽣成的 JavaScript 代码量，并提⾼运⾏时性能。</font></u>

:::

<font style="color:rgb(38,38,38);">使⽤普通枚举的 TypeScript 代码如下：</font>

```typescript
enum Directions {
   Up,
   Down,
   Left,
   Right
}

let x = Directions.Up;
```

<font style="color:rgb(38,38,38);">编译后⽣成的 JavaScript 代码量较⼤ ：</font>

```typescript
"use strict";
var Directions;
(function (Directions) {
 Directions[Directions["Up"] = 0] = "Up";
 Directions[Directions["Down"] = 1] = "Down";
 Directions[Directions["Left"] = 2] = "Left";
 Directions[Directions["Right"] = 3] = "Right";
})(Directions || (Directions = {}));

let x = Directions.Up;
```

<font style="color:rgb(38,38,38);">使⽤常量枚举的 TypeScript 代码如下：</font>

```typescript
const enum Directions {
   Up,
   Down,
   Left,
   Right
}

let x = Directions.Up;
```

<font style="color:rgb(38,38,38);">编译后⽣成的 JavaScript 代码量较⼩：</font>

```typescript
"use strict";
let x = 0 	/* Directions.Up */;
```

## type
<font style="color:rgb(38,38,38);">type 可以为任意类型</font><u><font style="color:rgb(38,38,38);">创建别名</font></u><font style="color:rgb(38,38,38);">，让代码更简洁、可读性更强，同时能更</font><u><font style="color:rgb(38,38,38);">⽅便地进⾏类型复⽤和扩展</font></u><font style="color:rgb(38,38,38);">。</font>

### <font style="color:rgb(38,38,38);">基本⽤法</font>
:::info
<font style="color:rgb(38,38,38);">类型别名使⽤ type 关键字定义， type 后跟类型名称，例如下⾯代码中 num 是类型别名。</font>

:::

```typescript
type num = number;

let price: num
price = 100
```

### 联合类型（或	| ）
:::info
<font style="color:rgb(38,38,38);">联合类型是⼀种⾼级类型，它表示⼀个值可以是⼏种不同类型之⼀。</font>`<font style="color:rgb(38,38,38);"> | </font>`<font style="color:rgb(38,38,38);">管道符</font>

:::

```typescript
type Status = number | string
type Gender = '男' | '⼥'

function printStatus(status: Status) {
   console.log(status);
}

function logGender(str:Gender){
   console.log(str)
}

printStatus(404);
printStatus('200');
printStatus('501');

logGender('男')
logGender('⼥')
```

### <font style="color:rgb(38,38,38);">交叉类型（并  $）</font>
:::info
<font style="color:rgb(38,38,38);">交叉类型（Intersection Types）允许将</font><u><font style="color:rgb(38,38,38);">多个类型合并为⼀个类型</font></u><font style="color:rgb(38,38,38);">。合并后的类型将拥有所有被合并类型的成员。交叉类型通常⽤于对象类型。 </font>`<font style="color:rgb(38,38,38);">$</font>`

:::

```typescript
//⾯积
type Area = {
   height: number; //⾼
   width: number; //宽
};

//地址
type Address = {
   num: number; //楼号
   cell: number; //单元号
   room: string; //房间号
};

// 定义类型House，且House是Area和Address组成的交叉类型
type House = Area & Address;

const house: House = {
 height: 180,
 width: 75,
 num: 6,
 cell: 3,
 room: '702'
};
```

## ⼀个特殊情况
<font style="color:rgb(38,38,38);">先来观察如下两段代码：</font>

### <font style="color:rgb(38,38,38);">代码段1（正常）</font>
<font style="color:rgb(38,38,38);">在函数定义时，限制函数返回值为 void ，那么函数的返回值就必须是空。</font>

```typescript
function demo():void{
   // 返回undefined合法
   return undefined
    
   // 以下返回均不合法
   return 100
   return false
   return null
   return []
}
demo()
```

### <font style="color:rgb(38,38,38);">代码段2（特殊）</font>
<font style="color:rgb(38,38,38);">使⽤</font>**类型声明**<font style="color:rgb(38,38,38);">限制函数返回值为 void 时， </font>**<font style="color:rgb(223,42,63);">TypeScript </font>**<font style="color:rgb(223,42,63);">并不会严格要求函数返回空。</font>

```typescript
type LogFunc = () => void

const f1: LogFunc = () => {
 return 100; // 允许返回⾮空值
};

const f2: LogFunc = () => 200; // 允许返回⾮空值

const f3: LogFunc = function () {
 return 300; // 允许返回⾮空值
};
```

### <font style="color:rgb(38,38,38);">为什么会这样？</font>
<font style="color:rgb(38,38,38);">是为了确保如下代码成⽴，我们知道 Array.prototype.push 的返回值是⼀个数字，⽽Array.prototype.forEach ⽅法期望其回调的返回类型是 void 。即为诸如此类箭头回调做出的妥协</font>

```typescript
const src = [1, 2, 3];
const dst = [0];

src.forEach((el) => dst.push(el));
```

> <font style="color:rgb(38,38,38);">官⽅⽂档的说明：</font><font style="color:rgb(17,124,238);">Assignability of Functions</font>
>

## 复习类相关知识
> <font style="color:rgb(38,38,38);">本⼩节是复习类相关知识，如果有相关基础可以跳过。</font>
>

```typescript
class Person {
    // ts中需要先声明变量，然后使用
   // 属性声明
   name: string
   age: number
  
   // 构造器
   constructor(name: string, age: number) {
       this.name = name
       this.age = age
 }
  
   // ⽅法
   speak() {
     console.log(`我叫：${this.name}，今年${this.age}岁`)
   }
}

// Person实例
const p1 = new Person('周杰伦', 38)
```

```typescript
class Student extends Person {
   grade: string
   // 构造器
   constructor(name: string, age: number, grade: string) {
       super(name, age)
       this.grade = grade
   }
   // 备注本例中若Student类不需要额外的属性，Student的构造器可以省略
  
   // 重写从⽗类继承的⽅法，通过override
   override speak() {
       console.log(`我是学⽣，我叫：${this.name}，今年${this.age}岁，在读${this.grade}年级`,)
   }
   // ⼦类⾃⼰的⽅法
   study() {
     console.log(`${this.name}正在努⼒学习中......`)
   }
}
```

## 属性修饰符
| <font style="color:rgb(255,255,255);">修饰符</font> | <font style="color:rgb(255,255,255);">含义</font> | <font style="color:rgb(255,255,255);">具体规则</font> |
| --- | --- | --- |
| <font style="color:rgb(38,38,38);">public </font> | <font style="color:rgb(38,38,38);">公开的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">⼦类</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">类外部</font><font style="color:rgb(38,38,38);">访问 。 </font> |
| <font style="color:rgb(38,38,38);">protected </font> | <font style="color:rgb(38,38,38);">受保护的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">⼦类</font><font style="color:rgb(38,38,38);">访问。 </font> |
| <font style="color:rgb(38,38,38);">private </font> | <font style="color:rgb(38,38,38);">私有的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">访问。</font> |
| <font style="color:rgb(38,38,38);">readonly </font> | <font style="color:rgb(38,38,38);">只读属性 </font> | <font style="color:rgb(38,38,38);">属性⽆法修改。</font> |


### <font style="color:rgb(38,38,38);">public 修饰符</font>
```typescript
class Person {
   // name写了public修饰符，age没写修饰符，默认最终都是public修饰符
   public name: string
   age: number
   constructor(name: string, age: number) {
   this.name = name
   this.age = age
 }
  
 speak() {
     // 类的【内部】可以访问public修饰的name和age
     console.log(`我叫：${this.name}，今年${this.age}岁`)
   }
}

const p1 = new Person('张三', 18)
// 类的【外部】可以访问public修饰的属性
console.log(p1.name)
```

```typescript
class Student extends Person {
   constructor(name: string, age: number) {
       super(name, age)
   }
  
 study() {
     // 【⼦类中】可以访问⽗类中public修饰的：name属性、age属性
     console.log(`${this.age}岁的${this.name}正在努⼒学习`)
   }
}
```

### <font style="color:rgb(38,38,38);"> 属性的简写形式</font>
```typescript
class Person {
   public name: string;
   public age: number;
    
   constructor(name: string, age: number) {
       this.name = name;
       this.age = age;
   }
}
```

```typescript
class Person {
  // 直接在构造器传参时定义并使用
   constructor(
       public name: string,
       public age: number
   ) { }
}
```

### <font style="color:rgb(38,38,38);">protected 修饰符</font>
```typescript
class Person {
   // name和age是受保护属性，不能在类外部访问，但可以在【类】与【⼦类】中访问
   constructor(
       protected name: string,
       protected age: number
   ) {}
   // getDetails是受保护⽅法，不能在类外部访问，但可以在【类】与【⼦类】中访问
   protected getDetails(): string {
       // 类中能访问受保护的name和age属性
       return `我叫：${this.name}，年龄是：${this.age}`
   }
   // introduce是公开⽅法，类、⼦类、类外部都能使⽤
   introduce() {
       // 类中能访问受保护的getDetails⽅法
       console.log(this.getDetails());
   }
}

const p1 = new Person('杨超越',18)
// 可以在类外部访问introduce
p1.introduce()

// 以下代码均报错，不能在类外部访问受保护属性和方法
// p1.getDetails()
// p1.name
// p1.age
```

```typescript
class Student extends Person {
     constructor(name:string,age:number){
         super(name,age)
     }
     study(){
         // ⼦类中可以访问introduce
         this.introduce()
         // ⼦类中可以访问name
         console.log(`${this.name}正在努⼒学习`)
     }
}

const s1 = new Student('tom',17)
s1.introduce()
```

### <font style="color:rgb(38,38,38);">private 修饰符</font>
```typescript
class Person {
     constructor(
         public name: string,
         public age: number,
         // IDCard属性为私有的(private)属性，只能在【类内部】使⽤
         private IDCard: string
     ) { }
     private getPrivateInfo(){
         // 类内部可以访问私有的(private)属性 —— IDCard
         return `身份证号码为：${this.IDCard}`
     }
     getInfo() {
         // 类内部可以访问受保护的(protected)属性 —— name和age
         return `我叫: ${this.name}, 今年刚满${this.age}岁`;
     }
     getFullInfo(){
         // 类内部可以访问公开的getInfo⽅法，也可以访问私有的getPrivateInfo⽅法
         return this.getInfo() + '，' + this.getPrivateInfo()
     }
}

const p1 = new Person('张三',18,'110114198702034432')
console.log(p1.getFullInfo())
console.log(p1.getInfo())

// 以下代码均报错
// p1.name
// p1.age
// p1.IDCard
// p1.getPrivateInfo()
```

### <font style="color:rgb(38,38,38);">readonly 修饰符</font>
```typescript
class Car {
     constructor(
         public readonly vin: string, //⻋辆识别码，为只读属性
         public readonly year: number,//出⼚年份，为只读属性
         public color: string,
         public sound: string
     ) { }
  
   // 打印⻋辆信息
   displayInfo() {
       console.log(`
           识别码：${this.vin},
           出⼚年份：${this.year},
           颜⾊：${this.color},
           ⾳响：${this.sound}
        `);
    }
}

const car = new Car('1HGCM82633A123456', 2018, '⿊⾊', 'Bose⾳响');
car.displayInfo()

// 以下代码均错误：不能修改 readonly 属性
// car.vin = '897WYE87HA8SGDD8SDGHF'; 
// car.year = 2020;
```

## 抽象类
:::info
+ <font style="color:rgb(38,38,38);">概述：抽象类是⼀种</font><font style="color:rgb(223,42,63);">⽆法被实例化</font><font style="color:rgb(38,38,38);">的类，专⻔⽤来定义类的</font><font style="color:rgb(223,42,63);">结构和⾏为</font><font style="color:rgb(38,38,38);">，类中可以写</font><font style="color:rgb(223,42,63);">抽象⽅法</font><font style="color:rgb(38,38,38);">，也可以写</font><font style="color:rgb(223,42,63);">具体实现</font><font style="color:rgb(38,38,38);">。抽象类主要⽤来为其派⽣类提供⼀个</font><font style="color:rgb(223,42,63);">基础结构</font><font style="color:rgb(38,38,38);">，要求其</font><u><font style="color:rgb(38,38,38);">派⽣类</font></u><u><font style="color:rgb(223,42,63);">必须实现</font></u><u><font style="color:rgb(38,38,38);">其中的抽象⽅法。 </font></u>
+ <font style="color:rgb(38,38,38);">简记：</font><u><font style="color:rgb(38,38,38);">抽象类</font></u><u><font style="color:rgb(223,42,63);">不能实例化</font></u><u><font style="color:rgb(38,38,38);">，其意义是</font></u><u><font style="color:rgb(223,42,63);">可以被继承</font></u><u><font style="color:rgb(38,38,38);">，抽象类⾥可以有</font></u><u><font style="color:rgb(223,42,63);">普通⽅法</font></u><u><font style="color:rgb(38,38,38);">、也可以有</font></u><u><font style="color:rgb(223,42,63);">抽象⽅法</font></u><u><font style="color:rgb(38,38,38);">。</font></u>

:::

`abstract  class 类名{ 类的结构与行为	<font style="background-color:#FBDE28;">abstract 抽象方法</font> }`

<font style="color:rgb(38,38,38);">通过以下场景，理解抽象类：</font>

> <font style="color:rgb(38,38,38);">我们定义⼀个抽象类 Package ，表示所有包裹的基本结构，任何包裹都有重量属性 weight ，包裹都需要计算运费。但不同类型的包裹（如：标准速度、特快专递）都有不同的运费计算⽅式，因此⽤于计算运费的 calculate ⽅法是⼀个抽象⽅法，必须由具体的⼦类来实现。</font>
>

```typescript
abstract class Package {
   constructor(public weight: number) { }
   // 抽象⽅法：⽤来计算运费，不同类型包裹有不同的计算⽅式
   abstract calculate(): number
   // 通⽤⽅法：打印包裹详情
   printPackage() {
       console.log(`包裹重量为: ${this.weight}kg，运费为: ${this.calculate()}元`);
   }
}
```

<font style="color:rgb(38,38,38);">StandardPackage 类继承了 Package ，实现了 calculate ⽅法：</font>

```typescript
// 标准包裹
class StandardPackage extends Package {
     constructor(
         weight: number,
         public unitPrice: number // 每公⽄的固定费率
     ) { super(weight) }
  
     // 实现抽象⽅法：计算运费
     calculate(): number {
         return this.weight * this.unitPrice;
     }
}

// 创建标准包裹实例
const s1 = new StandardPackage(10,5)
s1.printPackage()
```

<font style="color:rgb(38,38,38);">ExpressPackage 类继承了 Package ，实现了 calculate ⽅法：</font>

```typescript
class ExpressPackage extends Package {
     constructor(
         weight: number,
         private unitPrice: number, // 每公⽄的固定费率（快速包裹更⾼）
         private additional: number // 超出10kg以后的附加费
     ) { super(weight) }
  
     // 实现抽象⽅法：计算运费
     calculate(): number {
         if(this.weight > 10){
             // 超出10kg的部分，每公⽄多收additional对应的价格
             return 10 * this.unitPrice + (this.weight - 10) * this.additional
         }else {
             return this.weight * this.unitPrice;
         }
     }
}

// 创建特快包裹实例
const e1 = new ExpressPackage(13,8,2)
e1.printPackage()
```

:::color5
总结：何时使⽤抽象类？

1. 定义**通用接口** ：为⼀组相关的类定义通⽤的⾏为（⽅法或属性）时。
2. 提供**基础实现** ：在抽象类中提供某些⽅法或为其提供基础实现，这样派⽣类就可以继承这些实现。
3. 确保**关键实现**：强制派⽣类实现⼀些关键⾏为。
4. **共享**代码和逻辑：当多个类需要共享部分代码时，抽象类可以避免代码重复。

:::

## interface（接⼝）动口不动手
:::info
<font style="color:rgb(38,38,38);">interface 是⼀种</font>**<font style="color:rgb(223,42,63);">定义结构</font>**<font style="color:rgb(38,38,38);">的⽅式，主要作⽤是为：类、对象、函数等规定</font>**<font style="color:rgb(223,42,63);">⼀种契约</font>**<font style="color:rgb(38,38,38);">，这样可以确保代码的⼀致性和类型安全，但要注意 interface</font><u><font style="color:rgb(38,38,38);"> </font></u>**<u><font style="color:rgb(223,42,63);">只能</font></u>****<u><font style="color:rgb(38,38,38);">定义</font></u>****<u><font style="color:rgb(223,42,63);">格式</font></u>****<u><font style="color:rgb(38,38,38);">，</font></u>****<u><font style="color:rgb(223,42,63);">不能</font></u>****<u><font style="color:rgb(38,38,38);">包含</font></u>****<u><font style="color:rgb(223,42,63);">任何实现 </font></u>**<u><font style="color:rgb(38,38,38);">！</font></u>

:::

`interface  接口名  {	定义各种结构	}`

### <font style="color:rgb(38,38,38);">定义</font><font style="color:rgb(223,42,63);">类</font><font style="color:rgb(38,38,38);">结构</font>
:::color1
interface 定义接口，当定义类结构时需要通过implements实现接口

:::

```typescript
// PersonInterface接⼝，⽤与限制Person类的格式
interface PersonInterface {
     name: string
     age: number
     speak(n: number): void
}

// 定义⼀个类 Person，通过 implements 实现 PersonInterface 接⼝
class Person implements PersonInterface {
   constructor(
       public name: string,
       public age: number
   ) { }
   // 实现接⼝中的 speak ⽅法
   speak(n: number): void {
       for (let i = 0; i < n; i++) {
           // 打印出包含名字和年龄的问候语句
           console.log(`你好，我叫${this.name}，我的年龄是${this.age}`);
       }
   }
}

// 创建⼀个 Person 类的实例 p1，传⼊名字 'tom' 和年龄 18
const p1 = new Person('tom', 18);
p1.speak(3)
```

### <font style="color:rgb(38,38,38);">定义</font><font style="color:rgb(223,42,63);">对象</font><font style="color:rgb(38,38,38);">结构</font>
当<font style="color:rgb(38,38,38);">定义</font><font style="color:rgb(223,42,63);">对象</font><font style="color:rgb(38,38,38);">结构</font>时，正常` ：`类型声明就可以实现接口

```typescript
interface UserInterface {
     name: string
     readonly gender: string // 只读属性
     age?: number // 可选属性
     run: (n: number) => void
}

const user: UserInterface = {
     name: "张三",
     gender: '男',
     age: 18,
     run(n) {
       console.log(`奔跑了${n}⽶`)
     }
};
```

### <font style="color:rgb(38,38,38);">定义</font><font style="color:rgb(223,42,63);">函数</font><font style="color:rgb(38,38,38);">结构</font>
当<font style="color:rgb(38,38,38);">定义</font><font style="color:rgb(223,42,63);">函数</font><font style="color:rgb(38,38,38);">结构</font>时，正常` ：`类型声明就可以实现接口

```typescript
interface CountInterface {
     (a: number, b: number): number;
}

const count: CountInterface = (x, y) => {
     return x + y
}
```

### <font style="color:rgb(38,38,38);">接⼝之间的继承</font>
<font style="color:rgb(38,38,38);">⼀个 interface 继承另⼀个 interface ，通过</font>`<font style="color:rgb(38,38,38);">extends</font>`<font style="color:rgb(38,38,38);">实现继承，</font>正常` ：`类型声明就可以实现接口，<font style="color:rgb(38,38,38);">从⽽实现代码的复⽤</font>

```typescript
interface PersonInterface {
   name: string // 姓名
   age: number // 年龄
}

interface StudentInterface extends PersonInterface {
   grade: string // 年级
}

const stu: StudentInterface = {
   name: "张三",
   age: 25,
   grade: '⾼三',
}
```

### <font style="color:rgb(0,0,0);">接⼝⾃动合并（可重复定义）</font>
接口名可以重复，系统会自动合并在一起，<u>用于后期给接口添加新内容</u>

```typescript
// PersonInterface接⼝
interface PersonInterface {
   // 属性声明
   name: string
   age: number
}

// 给PersonInterface接⼝添加新属性
interface PersonInterface {
   // ⽅法声明
   speak(): void
}

// Person类实现PersonInterface
class Person implements PersonInterface {
   name: string
   age: number
   // 构造器
   constructor(name: string, age: number) {
       this.name = name
       this.age = age
   }
   // ⽅法
   speak() {
       console.log('你好！我是⽼师:', this.name)
   }
}
```

:::color5
总结：何时使⽤接⼝？

1. 定义对象的格式： 描述数据模型、API 响应格式、配置对象........等等，是开发中⽤的最多的场景。
2. 类的契约：规定⼀个类需要实现哪些属性和⽅法。
3. 扩展已有接⼝：⼀般⽤于扩展第三⽅库的类型， 这种特性在⼤型项⽬中可能会⽤到。

:::

## ⼀些相似概念的区别
### <font style="color:rgb(38,38,38);">interface 与 type 的区别</font>
:::info
+ <font style="color:rgb(38,38,38);">相同点： interface 和 type </font><u><font style="color:rgb(38,38,38);">都可以⽤于定义</font></u><u><font style="color:rgb(223,42,63);">对象结构</font></u><font style="color:rgb(38,38,38);">，在定义对象结构时两者可以互换。 </font>
+ <font style="color:rgb(38,38,38);">不同点： </font>

<font style="color:rgb(38,38,38);">1️⃣</font><font style="color:rgb(38,38,38);"> interface ：更专注于定义</font><font style="color:rgb(223,42,63);">对象</font><font style="color:rgb(38,38,38);">和</font><font style="color:rgb(223,42,63);">类</font><font style="color:rgb(38,38,38);">的结构，⽀持</font><font style="color:rgb(223,42,63);">继承</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">合并</font><font style="color:rgb(38,38,38);">。 </font>

<font style="color:rgb(38,38,38);">2️⃣</font><font style="color:rgb(38,38,38);"> type ：可以定义</font><font style="color:rgb(223,42,63);">类型别名、联合类型</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">交叉类型</font><font style="color:rgb(38,38,38);">，但不⽀持继承和⾃动合并。</font>

<font style="color:rgb(38,38,38);">一个直接接口名{ } ，一个是别名 = ***</font>

:::

```typescript
// 使⽤ interface 定义 Person 对象
interface PersonInterface {
   name: string;
   age: number;
   speak(): void;
}

// 使⽤ type 定义 Person 对象
type PersonType = {
   name: string;
   age: number;	
   speak(): void;
};

// 使⽤PersonInterface
/* let person: PersonInterface = {
     name:'张三',
     age:18,
     speak(){
       console.log(`我叫：${this.name}，年龄：${this.age}`)
     }
} */

// 使⽤PersonType
let person: PersonType = {
     name:'张三',
     age:18,
     speak(){
         console.log(`我叫：${this.name}，年龄：${this.age}`)
     }
}
```

```typescript
interface PersonInterface {
   name: string // 姓名
   age: number // 年龄
}

interface PersonInterface {
   speak: () => void
}

interface StudentInterface extends PersonInterface {
   grade: string // 年级
}

const student: StudentInterface = {
   name: '李四',
   age: 18,
   grade: '⾼⼆',
   speak() {
       console.log(this.name,this.age,this.grade)
   }
}
```

```typescript
// 使⽤ type 定义 Person 类型，并通过交叉类型实现属性的合并
type PersonType = {
     name: string; // 姓名
     age: number; // 年龄
  } & {
     speak: () => void;
  };

// 使⽤ type 定义 Student 类型，并通过交叉类型继承 PersonType
type StudentType = PersonType & {
   grade: string; // 年级
};

const student: StudentType = {
   name: '李四',
   age: 18,
   grade: '⾼⼆',
   speak() {
       console.log(this.name, this.age, this.grade);
   }
};
```

### <font style="color:rgb(38,38,38);">interface 与 抽象类的区别</font>
:::info
+ <font style="color:rgb(38,38,38);">相同点：都能定义⼀个</font><font style="color:rgb(223,42,63);">类的格式</font><font style="color:rgb(38,38,38);">（定义类应遵循的契约） </font>
+ <font style="color:rgb(38,38,38);">不相同： </font>

<font style="color:rgb(38,38,38);">1️⃣</font><font style="color:rgb(38,38,38);"> 接⼝：</font><font style="color:rgb(223,42,63);">只能</font><font style="color:rgb(38,38,38);">描述</font><font style="color:rgb(223,42,63);">结构</font><font style="color:rgb(38,38,38);">，</font><font style="color:rgb(223,42,63);">不能</font><font style="color:rgb(38,38,38);">有任何</font><font style="color:rgb(223,42,63);">实现代码</font><font style="color:rgb(38,38,38);">，⼀个类可以实现</font>**<font style="color:rgb(223,42,63);">多个</font>**<font style="color:rgb(38,38,38);">接⼝。 </font>

<font style="color:rgb(38,38,38);">2️⃣</font><font style="color:rgb(38,38,38);"> 抽象类：既可以包含</font><font style="color:rgb(223,42,63);">抽象⽅法</font><font style="color:rgb(38,38,38);">，也可以包含</font><font style="color:rgb(223,42,63);">具体⽅法</font><font style="color:rgb(38,38,38);">， ⼀个类只能继承</font>**<font style="color:rgb(223,42,63);">⼀个</font>**<font style="color:rgb(38,38,38);">抽象类。</font>

:::

```typescript
// FlyInterface 接⼝
interface FlyInterface {
   fly(): void;
}

// 定义 SwimInterface 接⼝
interface SwimInterface {
   swim(): void;
}

// Duck 类实现了 FlyInterface 和 SwimInterface 两个接⼝
class Duck implements FlyInterface, SwimInterface {
   fly(): void {
   console.log('鸭⼦可以⻜');
 }
  
 swim(): void {
 console.log('鸭⼦可以游泳');
 }
}

// 创建⼀个 Duck 实例
const duck = new Duck();
duck.fly(); // 输出: 鸭⼦可以⻜
duck.swim(); // 输出: 鸭⼦可以游泳
```

# <font style="color:rgb(38,38,38);">⼋、泛型	<T></font>
:::info
<font style="color:rgb(38,38,38);">泛型允许我们在定义函数、类或接⼝时，使⽤</font>**<font style="color:rgb(38,38,38);">类型参数</font>**<font style="color:rgb(38,38,38);">来表示</font>**<font style="color:rgb(223,42,63);">未指定的类型</font>**<font style="color:rgb(38,38,38);">，这些参数在具体</font>**<font style="color:rgb(223,42,63);">使⽤时</font>**<font style="color:rgb(38,38,38);">，</font><u><font style="color:rgb(38,38,38);">才被指定</font></u><u><font style="color:rgb(223,42,63);">具体的类型</font></u><font style="color:rgb(38,38,38);">，泛型能让同⼀段代码适⽤于多种类型，同时仍然保持类型的安全性。</font>

:::

<font style="color:rgb(38,38,38);">举例：如下代码中 </font>**<font style="color:rgb(38,38,38);"><T> </font>**<font style="color:rgb(38,38,38);">就是泛型，（不⼀定⾮叫 T ），设置泛型后即可在函数中使⽤ T 来表示该类型：</font>

```typescript
function logData<T>(data: T): T {
     console.log(data)
     return data
}

logData<number>(100)		//使⽤时，要指定具体的类型
logData<string>('hello')
```

```typescript
class Person<T> {
   constructor(
       public name: string,
       public age: number,
       public extraInfo: T
   ) { }
   speak() {
       console.log(`我叫${this.name}今年${this.age}岁了`)
       console.log(this.extraInfo)
   }
}

// 测试代码1
const p1 = new Person<number>("tom", 30, 250);

// 测试代码2
type JobInfo = {
   title: string;
   company: string;
}
const p2 = new Person<JobInfo>("tom", 30, { title: '研发总监', company: '发发发科技公司' });
```

```typescript
function logData<T, U>(data1: T, data2: U): T | U {
   console.log(data1,data2)
   return Date.now() % 2 ? data1 : data2
}

logData<number, string>(100, 'hello')
logData<string, boolean>('ok', false)
```

```typescript
interface PersonInterface<T> {
   name: string,
   age: number,
   extraInfo: T
}

let p1: PersonInterface<string>
let p2: PersonInterface<number>

p1 = { name: '张三', age: 18, extraInfo: '⼀个好⼈' }
p2 = { name: '李四', age: 18, extraInfo: 250 }
```

:::info
使用泛型约束的关键在于：

+ 定义一个接口来描述约束条件。
+ 在泛型函数或类中使用`extends`关键字来应用约束。
+ 确保在调用泛型函数或创建泛型类实例时，传入的类型满足约束条件。

:::

```typescript
// 1、定义一个接口来描述约束条件
interface LengthInterface {
   length: number
}

// 2、在泛型函数或类中使用extends关键字来应用约束。
// 约束规则是：传⼊的类型T必须具有 length 属性
function logPerson<T extends LengthInterface>(data: T): void {
   console.log(data.length)
}

logPerson<string>('hello')
// 报错：因为number不具备length属性
// logPerson<number>(100)
```

# <font style="color:rgb(38,38,38);">九、类型声明⽂件    declare</font>
:::info
<font style="color:rgb(38,38,38);">类型声明⽂件是 TypeScript 中的⼀种特殊⽂件，通常以</font>`<font style="color:rgb(38,38,38);"> .d.ts </font>`<font style="color:rgb(38,38,38);">作为扩展名。它的主要作⽤是为现有的 </font><font style="color:rgb(223,42,63);">JavaScript 代码</font><font style="color:rgb(38,38,38);">提供</font><font style="color:rgb(223,42,63);">类型信息</font><font style="color:rgb(38,38,38);">，使得 TypeScript 能够在</font><u><font style="color:rgb(38,38,38);">使⽤这些 JavaScript 库或模块时进⾏</font></u><u><font style="color:rgb(223,42,63);">类型检查和提示</font></u><u><font style="color:rgb(38,38,38);">。</font></u>

:::

> + `**.d.ts**` 是 “纯类型说明书”，用于告诉 TypeScript 如何理解 JS 代码的类型；
> + `**.ts**` 是 “带类型的可执行代码”，既定义类型，也包含实际运行的逻辑。
>

```typescript
export function add(a, b) {
   return a + b;
}

export function mul(a, b) {
   return a * b;
}
```

```typescript
declare function add(a: number, b: number): number;
declare function mul(a: number, b: number): number;

export { add, mul };
```

```typescript
// example.ts
import { add, mul } from "./demo.js";

const x = add(2, 3); // x 类型为 number
const y = mul(4, 5); // y 类型为 number

console.log(x,y)
```

