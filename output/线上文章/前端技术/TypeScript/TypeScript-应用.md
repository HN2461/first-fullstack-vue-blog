---
title: "TypeScript 应用"
slug: "typescript-applications"
summary: "围绕 TypeScript 的环境准备、核心类型、类型守卫、模块导入、高级类型、装饰器与综合案例整理应用笔记。"
category: "TypeScript"
categoryPath:
  - "前端技术"
  - "TypeScript"
tags:
  - "TypeScript"
  - "JavaScript"
  - "前端开发"
status: "published"
sortOrder: 30
cover: ""
originalId: "6aba2ca7ed2c7796bd5f5564"
originalSlug: "typescript-applications"
originalStatus: "published"
publishedAt: "2026-09-28T09:00:23.766Z"
updatedAt: "2026-09-28T09:00:23.827Z"
exportedAt: "2026-09-29T13:16:41.461Z"
---
# 1、TS介绍
## 1.1、JavaScript应用与不足
### 1.1.1、js的语言
javascript是一门非常优秀的语言，有着广泛的应用：

 web端、移动端、小程序端、桌面端、服务器端

### 1.1.2、JS的缺点
 var关键字的作用域问题

 数据类型并不是连续的内存空间

 js没有类型检测机制

### 1.1.3、js的升级
 从底层到应用层都在慢慢变好

ES6的推出，使js更加现代，更新安全和方便

## 1.2、JavaScript类型的问题
### 1.2.1、错误出现时机
错误出现的越早越好，这是程序员的共识

编码时<编译时<运行时<测试时<上线后

### 1.2.2、JS代码的 安全问题
弱类型   变量的类型跟根据变量值对应的   装了酱油的瓶是酱油瓶

强类型   声明一个变量，就要提前确认好它的类型 酱油瓶只能装酱油

举例：

```typescript
function demo(mess){
    console.log(mess.length);
}
demo('hello')
// demo()  //报错
//demo(100) //报错
// 用node 运行   node xxx.js
```

## 1.3、关于TS
**融合了后端面向对象思想的超级版的javaScript语言。**

1.3.1、typescript是微软2012年10月开发的一个开源的编程语言

1.3.2、typescript是javascript的一个**超集**，扩展了JS，为它添加了类型支持，来源于JS，归于JS

1.3.3、TS通过TS编译器或Babel转译为JS代码

1.3.4、TS可以编译出普通、干净、完整的JS代码

1.3.5、可运行任何浏览器，任何操作系统，任何可运行JS的地方

<!-- 这是一张图片，ocr 内容为：TYPESCRIPT TYPESCRIPT JAVASCRIPT ES6 ES5 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1732850360331-1c5d098a-5678-47ec-9009-ca1e838a06e8.png)

## 1.4、TS优势
不会TS的程序员，不是好的前端，前端程序员也要有类型思维

**优势1:**编译时**<font style="color:#DF2A3F;">静态类型检测</font>**:函数或方法传参或变量赋值不匹配时会出现编译错误提示,规避了开发期间的大量低级错误,省时,省力。

```typescript
//ts文件中
let str:string='abc'
// str=3 //报错
// 报错  
// str.forEach(element => {
    
// });

//js文件
let str='abc'
str=3 //不报错
// 不报错  
str.forEach(element => {
    
});
```

**优势2:**<u>自动提示更清晰明确。</u>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742310323778-d528c305-8004-4892-a74b-cdbd9fcf926c.png)

**优势3:**引入了泛型和一系列的TS特有的类型。

**优势4:**强大的.d.ts声明文件:声明文件像一个书的目录一样,清晰新直观展示了依赖库文件的接口,type类型,类,函数,变量等声明。

**优势5:**轻松编译成JS文件:即使TS文件有错误,绝大多数情清况也能编译出JS文件

**优势6:**灵活性高:尽管TS是一门强类型检查语言,但也提供了any类型和asany断言,这提供了TS的灵活度。

# 2、环境准备
## 2.1、typeSript线上环境
[TypeScript演练场](https://www.typescriptlang.org/play/)

## 2.2、typeSript环境搭建
### 2.2.1、安装Node.js
安装文件下载地址：[https://nodejs.org/en/download/](https://nodejs.org/en/download/)，下载下来，直接双击安装即可

TypeScript源码需要进行编译以后才能运行，Node.js提供了编译的环境

```typescript
node-v   //查看nodejs版本
npm -v   //查看npm版本
```

### 2.2.2、安装typescript编译工具
（1）、安装好Node.js后，打开cmd窗口，输入以下命令

使用npm包管理工具下载typescript包并在全局环境下安装,安装成功后可以通过tsc命令编译typescript

```typescript
npm install -g typescript //安装typescript
```

（2）、可以通过tsc-v命令查看当前typescript版本

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1743000964078-e0fb44a5-3413-4558-bf15-5f774600f98d.png)

### 2.2.3、运行ts文件
#### 2.2.3.1、单文件运行
##### （1）、第一种运行方式
```typescript
 //会报错
node  one.ts  
//将ts 转成js 文件，然后再用node运行
tsc one.ts  
//终端运行js文件
node one.js
//html中引入js文件，也可以运行
```

多个文件自动编译，监视文件的变化

```typescript
tsc one.ts -w //监听one.ts文件的变化
tsc two.ts -w  //监听two.ts文件的变化
```

##### （2）、直接运行ts文件（测试，实验的环境）
```typescript
npm i -g ts -node  //安装ts的node 辅助工具，直接运行ts文件
ts-node 02.one.ts  //安装好之后，就可以直接运行ts文件了
```

##### （3）、安装插件
这种方式，会编译出乱码，暂时不能用了

vscode中插件：Code Runner

<!-- 这是一张图片，ocr 内容为：CODE RUNNER V0.12.2 30,693,350 JUN HAN (271) RUN RUN C, C++, JAVA, JS,PHP,PYTHON,PERL, RUBY,GO, LUA, 卸载 自动更新 禁用 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1733119374472-71ff659f-7e12-426c-88bb-1124793fa80c.png)

<!-- 这是一张图片，ocr 内容为：X 01.HELLO.TS TS 01.初识TS TS 01.HELLO.TS  STRING 三 "HELLOTS"; LET 1 STR1: 2 CONSOLE,LOG(STR1); 3 输出 1 问题 CODE [RUNNING] "/USERS/WANGCHUNYAN/DESKTOP/ TS-NODE (WANG) /WORK (CODE) /01.初识TS/01. TYPESCRIPT HELLO.TS" HELLOTS [DONE] EXITED WITH CODE-0 IN 0.667 SECONDS -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1733119410531-f8d10dc7-4cc0-4367-b38b-c21dbb3b9b26.png)

##### （4）、项目环境（开发环境）
webpack/vue等方式都可以,有关脚手架，自动编译，暂时先不用管

##### （5）、建立tsconfig.json文件（学习环境的搭建）
第一步：创建文件

src:用来写ts文件

dist ：用来放编译后的js文件

html文件：用来运行js文件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1743904467667-3d4641f2-2018-46b4-b53a-e408b9a5ada5.png)

第二步：初始化tsconfig.json

```typescript
//来到对应的文件夹终端下
tsc --init 
```

第三步：修改tsconfig.json

rootDir:'./src'    用来配置编译src文件夹下的ts文件

outeDir:'./dist'   用来放ts编译后的js文件

第四步：开始编译

```typescript
  //有了tsconfig.json文件后，直接
tsc   //每一个ts文件都可以转成js文件
tsc -w  //监听所有的ts 文件的变化
```

#### 2.2.3.2、工程配置
##### （1）、创建tsconfig.json
如果每次都是手动运行一遍编译命令，会很麻烦，在开发中会设置为自动编译

如果一个目录下存在一个tsconfig.json文件，那么它意味着这个目录是typescript的根目录。tsconfit.json文件中会指定了用来编译这个项目的根文件和编译选项

**自动创建**一个tsconfig.json文件，如下： 

1.  首先，在文件夹中输入命令tsc --init,会自动创建一个tsconfig.json文件
2. 打开此文件，寻找outDir字段,将这一行注释解开，设置好编译好的ts文件放在哪个文件夹中,此文件夹会在有文件编译时自动创建
3. 在当前目录下执行：tsc，tsc -w 对文件进行监视

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742313117323-14f950f1-55f6-4cdf-87e7-12d00dc66b67.png)

##### （2）、tsconfig.json配置项
```typescript
{
    "comlilerOptions":{},//用来配置编译选项
  // 以下新版不能用
    "include":[ ],//指定哪些ts文件需要被编译，   "./src/**/*"//编译src下面的所有的文件
    "exclude":[ ],//表示不包含，哪些ts文件不编译，
    "files":[ ],//可以单独设置ts需要编译哪些文件
    "extends":'',//表示继承配置文件（用的不多，了解）
}
```

##### （3）、comlilerOptions 编译器选项
| 选项字段 | 类型 | 默认值 | 说明 | 备注 |
| --- | --- | --- | --- | --- |
| **<font style="color:#DF2A3F;">target</font>** | string | es2016 | **<font style="color:#DF2A3F;">生成.js文件版本</font>** | 'es3', 'es5', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'esnext'. |
| module | string |  | 设置编译后代码使用的模块化系统 | CommonJS、UMD、AMD、System、ES2020、ESNext、None |
| **<font style="color:#DF2A3F;">outDir</font>** | string | 默认情况下，编译后的js文件会和ts文件位于相同的目录，设置outDir后可以改变编译后文件的位置 | **<font style="color:#DF2A3F;">编译生成的文件存放路径</font>** |  "outDir": "dist" |
| outFile | string | "文件名.js" | 将所有的文件编译为一个js文件 | module需要设置为system或者amd规范，很少设置 |
| **<font style="color:#DF2A3F;">rootDir</font>** | string |  | **<font style="color:#DF2A3F;">指定代码的根目录</font>**，默认情况下编译后文件的目录结构会以最长的公共目录为根目录，通过rootDir可以手动指定根目录 | "rootDir": "./src" |
| strict | boolean | 默认值为true | 启用所有的严格检查，，设置后相当于开启了所有的严格检查 |  |
| **<font style="color:#DF2A3F;">noEmitOnError</font>** | boolean | 默认值：false | **<font style="color:#DF2A3F;">- 有错误的情况下不进行编译</font>** |  |


```typescript
{
  /* 项目选项 */
  "compilerOptions": {
      "lib": ["DOM","ES5","ES6","ES7","ScriptHost"], // TS需要引用的库
      "target": "ES6", // 目标语言的版本，ts编译后编译为哪个版本
      "module": "commonjs", // 生成代码的模板标准
      "outDir": "./dist", // 通过tsc编译后输出目录
      "rootDir": "./", // 指定输出文件目录(用于输出)，编译哪些文件
      "moduleResolution": "node10",//采用node模块解析的方式查找文件。[从内层到最高目录的外层查找import 引入的文件]
      "resolveJsonModule": true, //是否允许引入json文件
      "allowJs": true, // 是否允许导入js文件
      "checkJs": true, // 允许在JS文件中检测错误，通常与allowJS一起使用
      "declaration": true,//生成以.d.ts结尾的声明文件
       "sourceMap": true, //生成.js.map结尾的文件,在浏览器运行的时候，自动匹配js文件
      "removeComments": true, // 删除注释
      "esModuleInterop": true, // 允许export=导出，由import from 导入

      /* 严格检查选项 */
      "strict": true, // 开启所有严格的类型检查，等于下面所有子项之和
      "alwaysStrict": true, // 在代码中注入'use strict'
      "noImplicitAny": true, // 不允许隐式的any类型
      "noImplicitThis": true, // 不允许this有隐式的any类型
      "strictNullChecks": true, // 不允许把null、undefined赋值给其他类型的变量
      "strictBindCallApply": true, // 严格的bind/call/apply检查
      "strictFunctionTypes": true, // 不允许函数参数双向协变
      "strictPropertyInitialization": true, // 类的实例属性必须初始化
      "noImplicitReturns": true, //函数需要返回值
       "noUnusedLocals": true,       //定义未使用报警告
       "noUnusedParameters": true, //函数上声明参数未使用报警告


      /* 额外检查 */
      "noUnusedLocals": true,//是否检查未使用的局部变量
      "noUnusedParameters": true,//是否检查未使用的参数
      "noImplicitReturns": true,//检查函数是否不含有隐式返回值
      "noImplicitOverride": true,//是否检查子类继承自基类时，其重载的函数命名与基类的函数不同步问题
      "noFallthroughCasesInSwitch": true,//检查switch中是否含有case没有使用break跳出
      "noUncheckedIndexedAccess": true,//是否通过索引签名来描述对象上有未知键但已知值的对象
      "noPropertyAccessFromIndexSignature": true,//是否通过" . “(obj.key) 语法访问字段和"索引”( obj[“key”])， 以及在类型中声明属性的方式之间的一致性

      /* 实验选项 */
      "experimentalDecorators": true,//是否启用对装饰器的实验性支持，装饰器是一种语言特性，还没有完全被 JavaScript 规范批准
      "emitDecoratorMetadata": true,//为装饰器启用对发出类型元数据的实验性支持

      /* 高级选项 */
      "forceConsistentCasingInFileNames": true,//是否区分文件系统大小写规则
      "extendedDiagnostics": false,//是否查看 TS 在编译时花费的时间
      "noEmitOnError": true,//有错误时不进行编译
      "resolveJsonModule": true,//是否解析 JSON 模块
  },
}

```

# 3、核心语法
## 3.1、TS类型声明
类型声明是TS非常重要的一个特点，通过类型声明可以指定TS中变量（参数、形参）的类型，指定类型后，当为变量赋值时，TS编译器会自动检查值是否符合类型声明，符合则赋值，否则报错，简而言之，类型声明给变量设置了类型，使得**变量只能存储某种类型的值**语法：

### 3.1.1、基本语法：
:::info
  let 变量: 类型;

  let 变量: 类型 = 值;

  function fn(参数: 类型, 参数: 类型): 类型{

      ...

  }

:::

先声明，再赋值，声明一个变量a，同时指定它的类型为number，

```typescript
let a:number
//a在以后的使用过程中，a的值只能是数字
a=10;
// a='hello' //会报错
```

声明完变量直接进行赋值

```typescript
let c:boolean=true;
```

### 3.1.2、自动类型判断
+ TS拥有自动的**类型判断机制**
+ 当对变量的声明和赋值是同时进行的，TS编译器会自动判断变量的类型
+ <u>所以如果你的变量的声明和赋值时同时进行的，可以省略掉类型声明</u>

```typescript
// 类型注解
let data:number=12
// data='12' //报错

// 类型推导
let myname='12'
// myname=12 //报错

// 区别：注解的时，就确定了类型，如果赋值不对就会报错
//推导时，赋值时任意赋值的，只有当修改时，会有提示
```

## 3.2、TS数据类型
### 概述
ts的数据类型有：

基本类型：string、number、boolean、symbol、bigint、null、undefined

引用类型：array、 Tuple(元组)、 object(包含Object和{})、function

特殊类型：any、unknow、void、nerver、Enum(枚举)

其他类型：类型推理、字面量类型、交叉类型

注：案例中有可能用到type和interface，在下面会详细讲解，有比较模糊的可以先看看

| 数据类型 | 关键字 | 描述 |
| --- | --- | --- |
| 数字类型 | number | 双精度64位浮点值，它可以用来表示整数和分数<br/>let a:number=0b1010;//二进制<br/>let b:number=0o744;//八进制<br/>let c:number=6; //十进制<br/>let d:number=0xf00d //十六进制 |
| 字符串类型 | string | 一个字符系列，使用单引号（''）或双引号（""）来表示字符串类型。<br/>反引号（``）来定义多行文本和内嵌表达式 |
| 布尔类型 | boolean | 表示逻辑值：true和false<br/>let flag:boolean=true |
| 任意类型 | any | 声明为any的变量可以赋予任意类型的值 |
| 数组类型 | array | 声明变量为数组<br/>let arr:number[]=[1,2]//在元素类型后加[]<br/>或let arr:Array=[1,2]//使用数组泛型 |
| 元组 | tuple | 元组类型用来表示<u>已知元素</u>**<u>数量</u>**<u>和</u>**<u>类型</u>**<u>的数组</u>，各元素的类型不必相同，对应的位置的类型需要相同<br/>let x:[string,number];<br/>x=['hello',1] //运行正常 |
| 枚举 | enum | 枚举类型用来定义数值集合<br/>enum Color {red,green,blue}<br/>let c:Color=Color.blue<br/>console.log(c)//输出2 |
| void | void | 用于标识方法返回值的类型，表示该方法没有返回值<br/>function hello():void{alert('hello')} |
| null | null | 表示对象值缺失 |
| undefined | undefined | 用于初始化变量为一个为定义的值 |
| never | never | never是其他类型（包括null和undefined）的子类型，代表从不会出现的值 |


### 基本类型
#### number
TypeScript里的所有数字都是[浮点数](https://so.csdn.net/so/search?q=%E6%B5%AE%E7%82%B9%E6%95%B0&spm=1001.2101.3001.7020)。

**双精度 64 位浮点值。它可以用来表示整数和分数。**

```typescript
let binaryLiteral: number = 0b1010; // 二进制
let octalLiteral: number = 0o12;    // 八进制
let decLiteral: number = 10;    // 十进制
let hexLiteral: number = 0xa;    // 十六进制

console.log(binaryLiteral,octalLiteral,decLiteral,hexLiteral)

//10,10,10,10

```

#### string 
**<font style="background-color:rgb(238, 240, 244);">一个字符系列，使用单引号（'）或双引号（"）来表示字符串类型。反引号（`）来定义多行文本和内嵌表达式。</font>**

```typescript
let name: string = "Runoob";
let str: string = "我的存款是"
let years: number = 5;
let words: string = `您好，今年是 ${ name } 发布 ${ years + 1} 周年`;

console.log(words)
//您好，今年是 Runoob 发布5周年

//字符串和数字之间能够一起拼接
console.log(str+years)
//我的存款是5

```

#### boolean
**<font style="background-color:rgb(238, 240, 244);">最基本的数字类型true/false值,在JS和TS里叫做bollean</font>**

```typescript
let isDone:boolean=false;
isDone=true;
console.log(isDone)

//true

```

#### symbol
```typescript
let sym:symbol=Symbol('12')
```

#### null&undefined
##### js中的理解
```typescript
// js中：null表示什么都没有，表示一个空对象引用
let obj = null
console.log(typeof null);//object
//js中：undefined  声明未赋值或赋值为undefined
let x;
console.log(typeof x);//undefined
```

##### ts中的使用
###### undefined
```typescript
// 知识点1
// let str:string;
// console.log('str',str);//报错，不能打印
// 知识点2
//解析1：参数可选，解析2：data:string|undefined
function fn(data?: string) {
    // 方式1：
    // let res=data?.toString  //由于参数可能未传，所以使用时，也需要加可选
    // 方式2
    // if(data)data.toString()
    // 方式3：
    // data!.toString()
    // 方式4：
    // (data as string).toString()
}
fn()
// 知识点3
// 哪些值可以赋值undefined
let data1:any=undefined
let data2:unknown=undefined
let data3:undefined=undefined
```

###### null
```typescript
// null
let data1:null=null 
let data2:any=null
let data3:unknown=null
```

### 引用数据类型
#### 根类型
Object==={}

```typescript
// 根类型 Object==={}   除了undefined/null其他都可以赋值
let obj1: Object = '123'
let obj2: Object = 123
let obj3: Object = { name: 'tom' }
let obj4: Object = [1, 2, 3]
// let obj5: object = undefined//报错
// let obj6: object = null//报错

// 两个容易犯错误的小栗子
// 例1
let obj={username:'jack',age:18}
console.log(obj.username); //jack
console.log(obj['username']);//jack

// let username='username'
// console.log(obj[username]); //报错，因为let定义的username变量值可能会改变
// username='lisi'//例如
const username='username' //这就对了，因为const定义的变量不能修改
console.log(obj[username]);

// 例2
let obj:Object={username:'jack',age:18}
console.log(obj.username);//报错，因为Object上没有username属性
```

#### Array
+ 类型名称 + []
+ Array<数据类型>

```typescript
let arr1: number[] = [1, 2, 3]
    
let arr2: Array<number> = [1, 2, 3]
    
let arr2: Array<number> = [1, 2, '3'] // error
    
 //要想是数字类型或字符串类型，需要使用 ｜
let arr3: Array<number | string> = [1, 2, '3'] //ok
```

#### 元组（tuple)&可变元组
##### 定义元组
满足以下3点的数组就是元组

**<font style="color:#DF2A3F;">(1)在定义时每个元素的类型都确定</font>**

**<font style="color:#DF2A3F;">(2)元素值的数据类型必须是当前元素定义的类型</font>**

**<font style="color:#DF2A3F;">(3)元素值的个数必须和定义时个数相同</font>**

语法：[类型，类型，类型]

```typescript
//元组类型，在定义数组的时候，类型的数据的个数一开始就已经限定了
let arr:[string,number,boolean] = ['你好',100.254,true]

//注意：
//元组类型在使用时，数据的类型的位置和数据的个数应该和定义元组的时候的数据类型及位置应该一致
console.log(arr[0].split(''))  //['你','好']
console.log(arr.toFixed(2))    //100.25
```

##### 可变元组及应用场景
:::info
any[ ]表示<font style="color:rgba(0, 0, 0, 0.95);">可以包含任意数量元素且元素类型为 “any（任意类型 ）” 的数组</font>

:::

```typescript
// 可变元组
// 数组前面两个元素是固定的，后面是不固定的
let arr:[string,number,...any[]]=['jack',123,123,true]

// 可变元素的解构
let [name, age, ...rest]: [string, number, ...any[]] = ['jack', 123, 123, true]
console.log(rest);

// 可变元素tag，后面的类型如果变多，可读性较差，可以加tag标签，一般tag标签跟变量名相近或相同
let [name, age, ...rest]: [name_:string, age_:number, ...rest_:any[]] 
  = ['jack', 123, 123, true]
```



#### function
定义函数

+ 有两种方式，一种为 `function`， 另一种为`箭头函数`
+ 在书写的时候，也可以写入返回值的类型，如果写入，则必须要有对应类型的返回值，**但通常情况下是省略**，因为`TS`的类型推断功能够正确推断出返回值类型

先了解，后面详细讲

### 特殊类型
#### never
`never`类型表示的是那些永不存在的值的类型。

```typescript
// never类型
//使用never避免出现未来拓展新的类没有对应类型的实现
//目的是写出类型绝对安全的代码
type data=string|number
function handlerData(value:data){
    if(typeof value =='string'){
        console.log(value.length);
    }else if(typeof value=='number'){
        console.log(value.toFixed(2));
    }else{
        let val=value //此时查看value就是never类型，有很多可能
    }
}
handlerData(1)
```

never 类型是任何类型的子类型，也可以赋值给任何类型。

没有类型是 never 的子类型，没有类型可以赋值给 never 类型（除了 never 本身之外）。即使 `any`也不可以赋值给 never 。

```typescript
let test1: never;
test1 = 'lin' // 报错，Type 'string' is not assignable to type 'never'

let test1: never;
let test2: any;
 
test1 = test2 // 报错，Type 'any' is not assignable to type 'never'
```

#### any&unknown
any和unknown在开发中和第三方包源码底层经常看到,弄清楚它们的区别很重要

**相同点:**any和unknown可以是任何类的父类,所以任何类型的变量都可以赋值给any类型或unknown类型的变量。

```typescript
// any可以是任何类的父类
let num:number=123
let num:string='123'
let data:any=num   //data是任意类型，num可以赋值给data
// unknown
let data:unknown=[1,2,3]  //unknown可以是任何子类的父类
```

**不同点1:**any也可以是任何类的子类,但unknown不可以,所以any类型的变量都可以赋值给其他类型的变量。

```typescript
let data:unknown=[1,2,3]  //unknown可以是任何子类的父类
let num:number=data  //报错，不能讲unknown类型的数据赋值给number类型
// any也可以是任何类的子类
let data:any=[1,2,3]
let num:number=data   //data是任意类型，可以赋值给number类型的变量
// 总结：不会对any做类型检测
```

**不同点2:**不能拿unknown类型的变量来获取任何属性和方法,但any类型的变量可以获取任意名称的属性和任意名称的方法。

```typescript
// function getData(data:any){
//     console.log(data.name);//不报错
// }
function getData(data:unknown){
    //不能去读属性或方法
    console.log(data.name);//报错
}
getData({name:'jack'})
getData([0,1])
getData(1)

```

**使用场景：**

any比较典型的应用场景:1.自定义守卫2.需要进行as any类型断言的场景

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742363447810-e8e67b79-089f-4107-9528-37c18fe1aa80.png)

unknown一般用作函数参数：用来接受任意类型的变量实参，但在函数内部只用于再次传递或输出结果，不获取属性的场景。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742363435866-363ea3b2-6e34-4b92-93f2-3aef857a1357.png)

#### void
<font style="background-color:rgb(238, 240, 244);">某种程度上来说， void 类型像是与 any 类型相反，它表示没有任何类 。 当一个函数没有返回值时,你通常会见到其返回值类型是 void</font>

```typescript
//用于标识方法返回值的类型，表示该方法没有返回值。
function hello(): void {
    alert("Hello Runoob");
}

```

#### 枚举
##### 使用枚举目的
<u>解决多次if/switch判断中值的语义化问题</u>

如下，用常量去解决问题，会造成语义不清楚

```typescript
// 目的；解决语义化的问题
// 使用常量解决
// 根据订单状态，判断执行逻辑
const Status = {
    CREATED: 0,//订单创建
    PENDINGPAY: 1,//待支付
    PAID: 2,//支付成功
    SHIPPED: 3,//已发货
    COMPLETED: 4,//已完成
    CLOSED: 5//已关闭
}
function handlerStatus(Status: number) {
    switch (Status) {
        case 0:
            console.log('订单创建');
            break;
        case 1:
            console.log('待支付');
            break;
        case 2:
            console.log('支付成功');
            break;
        case 3:
            console.log('已发货');
            break;
        case 4:
            console.log('已完成');
            break;
        case 5:
            console.log('已关闭');
            break;
        default:
            break;
    }
}
handlerStatus(1) //语义不清楚
```

##### 枚举的定义
用来存放一组固定的常量的序列

##### 枚举的分类&取值&使用
###### 数字枚举
```typescript
// 数字枚举
// 初始化的第一个值如果是一个数字，后面就默认会递增赋值
enum Status {
    CREATED = 0,//订单创建
    PENDINGPAY,//待支付
    PAID,//支付成功
    SHIPPED,//已发货
    COMPLETED,//已完成
    CLOSED//已关闭
}
// 枚举取值
console.log(Status.CREATED);//0
console.log(Status['CREATED']);//0
console.log(Status[0]);//CREATED 可以反向取值
// 使用枚举
function handlerStatus(Status: Status) {
    switch (Status) {
        case 0:
            console.log('订单创建');
            break;
        case 1:
            console.log('待支付');
            break;
        case 2:
            console.log('支付成功');
            break;
        case 3:
            console.log('已发货');
            break;
        case 4:
            console.log('已完成');
            break;
        case 5:
            console.log('已关闭');
            break;
        default:
            break;
    }
}
handlerStatus(Status.CREATED)
```

###### 字符串枚举
```typescript
// 字符串枚举
// 初始化的第一个值如果是一个字符串，后面就都必须要初始化
enum Status {
    CREATED = '创建订单',//订单创建
    PENDINGPAY='待支付',//待支付
    PAID='支付成功',//支付成功
    SHIPPED='已发货',//已发货
    COMPLETED='已完成',//已完成
    CLOSED='已关闭'//已关闭
}
// 枚举取值
console.log(Status.CREATED);//0
console.log(Status['CREATED']);//0
// console.log(Status[0]);//报错，不可以反向取值
// 使用枚举
function handlerStatus(Status: Status) {
    switch (Status) {
        case '创建订单':
            console.log('订单创建');
            break;
        case '待支付':
            console.log('待支付');
            break;
        case '支付成功':
            console.log('支付成功');
            break;
        case '已发货':
            console.log('已发货');
            break;
        case '已完成':
            console.log('已完成');
            break;
        case '已关闭':
            console.log('已关闭');
            break;
        default:
            break;
    }
}
handlerStatus(Status.CREATED)
```



##### 枚举的优点
1. 有默认值和可以自增值，节省编码时间  
2. 语义更清晰，可读性增强，  
因为枚举是一种值类型的数据类型，方法参数可以明确参数类型为枚举类型

#### type 别名 
```typescript
// 起别名
type myType = 1 | 2 | 3 | 4 | 5;
// 使用别名
let k: myType;
let m: myType;

let state = 1 | 2 | 3 | 4 | 5; //有时候会想重复使用设置的限制
type mystate = 1 | 2 | 3 | 4 | 5;
let state1: mystate;
// state1=6//会报错

type myvar = string | boolean;
let str: myvar = "str";
str = true;
//str=1//会报错
function fun10(a: myvar, b: myvar) {}

//函数限制起别名
type myfun = (a: number, b: number) => number;
let fun8: myfun = (a, b) => a * 6;
//fun8('ab',2)   //会报错

//对象限制起别名
type myobj = { name: string; age: number };
let person: myobj = { name: "tom", age: 10 };
```

#### 接口和应用场景
##### 接口作用:
另一种定义对象类型的类型

##### 接口应用场景
(1)一些第三方包或者框架底层源码中有大量的接口类型

(2)提供方法的对象类型的参数时使用，规定了这些参数你必须要传给我

```typescript
// 定义接口：不需要初始化
interface IPerson{
    name:string,
    age:number
}
// 实现类：如果类中没有实现接口，就会提示报错
let p:IPerson={
    name:'jack',
    age:18
}
function getPersonMsg(p:IPerson){
    console.log(p);
    
}
getPersonMsg(p)
```

(3)为多个同类别的类提供统一的方法和属性声明

```typescript
// 这个接口被类实现，名字是不能乱改的，便于后期维护
interface List{
    add():void,
    remove():void
}
// 类实现接口
class ListTest1 implements List{
    add(): void {
        throw new Error("Method not implemented.");
    }
    remove(): void {
        throw new Error("Method not implemented.");
    }

}
class ListTest2 implements List{
    add(): void {
        throw new Error("Method not implemented.");
    }
    remove(): void {
        throw new Error("Method not implemented.");
    }

}
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742364398047-ec29ba75-9174-45f6-8e44-6abc8ba67e65.png)

##### 如何定义接口
```typescript
// 定义接口：不需要初始化
interface Person{
    name:string,
    age:number
}
// 实现类：如果类中没有实现接口，就会提示报错
let p:Person={
    name:'jack',
    age:18
}
```

##### 继承接口
新的接口只是在原来接口继承之上增加了一些属性或方法,这时就用接口继承

```typescript
// 定义接口：不需要初始化
interface IPerson{
    name:string,
    age:number
}
// 实现类：如果类中没有实现接口，就会提示报错
let p:IPerson={
    name:'jack',
    age:18
}
// 有个学生的接口，具有上面IPerson的接口
interface IStudent extends IPerson{
    study:string
}
let S:IStudent={
    study:'学习',
    name:'tom',
    age:20
}
```



##### 可索引签名
:::info
    [x: string]: any	<font style="color:rgba(0, 0, 0, 0.95);">它表示一个对象，其中键为字符串类型，值可以是任何类型</font>

:::

```typescript
// 可索引签名
interface IPerson {
    name: string,
    age: number,
    [x: string]: any
    // []固定写法
    //x:string,x其实写成其他其实也不报错
    //x:number,x只能是number类型
    // [x: number]: any
    //any：这里的类型必须要兼容其他属性值得类型，例如如果是number类型，上面的name:string就会报错
    // [x:string]:string
}

let p: IPerson = {
    name: 'jack',
    age: 18,
    gender: '男',
    101: 'xx'
}
```

##### 索引访问类型+更多理解
```typescript
// 索引访问类型
// 接口同名不会报错，默认会合并
// interface IPerson{
//     name:string,
//     age:number
// }
// interface IPerson{
//     gender:string
// }

const symid=Symbol('id')
interface IPerson{
    name:string,
    age:number,
    [symid]:number
}

type t1=IPerson['name']  //t1类型是string
type t2=IPerson['name'|'age']  //t2类型是string|number
type t3=IPerson[typeof symid]  

// 获取接口所有的键名
// 方式1：symid读不出来
type PKeys=keyof IPerson
// 方式2：利用泛型，迭代赋值
type AllKeys<T>=T extends any?T:never
type PKeys2=AllKeys<keyof IPerson>
```

##### 接口跟type别名的区别
type 和接口类似，都用来定义类型，但 type 和 interface 区别如下:  
**区别 1: **定义类型范围不同  
interface 只能定义对象类型或接口当名字的函数类型。  
type 可以定义任何类型，包括基础类型、联合类型，交叉类型，交叉类型，元组

```typescript
type num = number
type baseType = number | string | symbol
type Car = {
    name: string,
    price: number
}
// interface 定义对象类型
interface Person {
    name: string,
    age: number
}
```

**区别2：**接口可以extends一个或者多个接口或类，也可以继承type,但type类型没有继承功能。

但一般接口继承类和type的应用场景很少见，同学们记住有这样的语法即可。

**区别3：**用type交叉类型&可让类型中的成员合并成一个新的type类型，但接口不能交叉合并

```typescript
type obj1={name:string}
type obj2={age:number}
// &交叉类型
type obj=obj1&obj2
let obj:obj={
    name:'jack',
    age:123
}
```

**区别4：**接口可合并声明

定义两个相同名称的接口会合并声明，定义两个同名的type会出现编译错误。

### 其他类型
#### 联合类型(|)，交叉类型(&)
```typescript
// 5、联合类型
let str:string|number='123'
str=123
//6、交叉类型
let obj:{username:string}={
    username:'tom'
}
let obj2:{age:number}={age:18}
// 可以交叉
let obj3:{username:string}&{age:number}={
    username:'jack',
    age:20
}
//简写
type obj1 ={username:string}
type obj2 ={age:number}
type obj3=obj1&obj2
let obj3:obj3={
    username:'jack',
    age:20
}
// 不可以交叉
// let obj4:string&number=3 //报错
```

#### 字面量数据类型
```typescript
let str:'1'|'2'='1'
type num=1|2|3|4
let num:num=5 //报错，num只能是1234
//应用
type ty=0|1
function isStartUp(increase:ty){
    if(increase){
        console.log('open');
    }else{
        console.log('close');
    }
}
isStartUp(0) //只能传递0|1
```

## 3.3、TS数据类型进阶
### 函数
#### 函数是有单独的类型的Function
 语法：（形参：类型，形参：类型）=>返回值类型

```typescript
// 函数的定义
function fun(name:string,age:number):string{
    return `hello,我的名字${name},我今年${age}岁了`
}
fun('jack',18) //调用时，必须要传递对应类型和数量的参数
// 返回值类型如果不定义，会自动推导

// 函数的定义
let fun =function(name:string,age:number):string{
    return `hello,我的名字${name},我今年${age}岁了`
}
fun('jack',18) 

// 函数的定义
let fun:(name: string, age: number)=>string = (name, age): string => {
    return `hello,我的名字${name},我今年${age}岁了`
}
fun('jack', 18) 

type Tfun = (name: string, age: number) => string
let fun: Tfun = (name, age): string => {
    return `hello,我的名字${name},我今年${age}岁了`
}
fun('jack', 18) 
```

#### 参数的默认值
```typescript
 //如果有默认值也要放在没有默认值的参数后面，否则也会报错
   const fun2=function(a:number=1,b:number=2):number {
       return a+b
   }
   console.log(fun2());//不传值，就用默认值
   console.log(fun2(11,22));//传值，就用传入的值
```

#### 函数的剩余参数
```typescript
// rest参数
function fun(name: string, age: number,...rest:any): string {
    return `hello,我的名字${name},我今年${age}岁了,乌拉乌拉${rest}`
}
fun('jack', 18,12,456,'hi')
```

#### 函数解构
```typescript
// 函数解构
type TInfo = {
    name: string,
    age: number
}
// 完整写法
function fun(obj: TInfo) {
    return `hello,我的名字${obj.name},我今年${obj.age}岁了`
}
fun({name:'jack',age:18})
// 解构写法
function fun1({name,age}: TInfo) {
    return `hello,我的名字${name},我今年${age}岁了`
}
fun1({name:'jack',age:18})
```

#### 函数的重载
##### 基本应用
函数重载是指两个函数名称相同，但是参数个数或参数类型不同，他

+ 为同一个函数提供多个函数类型定义来进行函数重载
+ 多个函数函数名相同，函数的参数类型，顺序，个数不同
+ <u>注意函数重载与返回值类型无关</u>
+ 在 TypeScript 里，函数重载能够让**<u><font style="color:#DF2A3F;">一个函数接受不同类型和数量的参数</font></u>**，并且<u>依据参数的具体情况给出不同的返回值类型。</u>

优势：不需要把相似功能的函数拆分成多个函数名称不同的函数。

```typescript
//用重载实现
//联合类型，声明参数的情况，限制去约束函数
function add(a: number | string, b: number | string): number;
function add(a: boolean, b: number): number;

//重载的实现具体的方法
//重载的实现必须要覆盖上面重载的定义
function add(a: any, b: any): any {
  return a + b;
}
console.log(add(111, "1"));
console.log(add(true, 12));
```

##### 重载小案例
**需求：**1、对数据进行ts类型限制

   2、封装函数，可以根据传入的id或者作者进行搜索，id返回的数据是单条数据，作者返回的是一个数组类型

```typescript

let list = [
    {
        "id": 1,
        "author": "jack",
        "content": "jack-content-111"
    },
    {
        "id": 2,
        "author": "jack",
        "content": "jack-content-222"
    },
    {
        "id": 3,
        "author": "jack",
        "content": "jack-content-333"
    },
    {
        "id": 4,
        "author": "tom",
        "content": "tom-content-111"
    },
    {
        "id": 5,
        "author": "tom",
        "content": "tom-content-222"
    },
    {
        "id": 6,
        "author": "tom",
        "content": "tom-content-111"
    },
    {
        "id": 7,
        "author": "lusi",
        "content": "lusi-content-111"
    },
    {
        "id": 8,
        "author": "lusi",
        "content": "lusi-content-222"
    },
    {
        "id": 9,
        "author": "lusi",
        "content": "lusi-content-333"
    }
]

export { }
```

**具体实现：**不用函数重载

```typescript
// 需求：1、对数据进行ts类型限制
// 需求：2、封装函数，可以根据传入的id或者作者进行搜索
// id返回的数据是单条数据，作者返回的是一个数组类型
type listItem = {
    id: number,
    author: author,
    content: string
}
enum author {
    "jack" = 1,
    "tom" = 2,
    "lusi" = 3
}
let list: listItem[] = [
    {
        "id": 1,
        "author": author.jack,
        "content": "jack-content-111"
    },
    {
        "id": 2,
        "author": author.jack,
        "content": "jack-content-222"
    },
    {
        "id": 3,
        "author": author.tom,
        "content": "tom-content-111"
    },
    {
        "id": 4,
        "author": author.tom,
        "content": "tom-content-222"
    },
    {
        "id": 5,
        "author": author.lusi,
        "content": "lusi-content-111"
    },
    {
        "id": 6,
        "author": author.lusi,
        "content": "lusi-content-222"
    }
]

function searchMsg(val: author | number) {
    if (typeof val === 'number') {
        return list.find(item => item.id == val)
    } else {
        return list.filter((item) => item.author == val)
    }
}
// 拿到搜索结果，此时去点id，拿不到内容,因为res的类型可能是listItem，listItem[],undefined
// let res=searchMsg(1).id //报错，可以用断言解决，但不建议，此时，可以用到函数重载

export { }
```

**具体实现：**用函数重载

```typescript
// 需求：1、对数据进行ts类型限制
// 需求：2、封装函数，可以根据传入的id或者作者进行搜索
// id返回的数据是单条数据，作者返回的是一个数组类型
type listItem = {
    id: number,
    author: author,
    content: string
}
enum author {
    "jack" = 1,
    "tom" = 2,
    "lusi" = 3
}
let list: listItem[] = [
    {
        "id": 1,
        "author": author.jack,
        "content": "jack-content-111"
    },
    {
        "id": 2,
        "author": author.jack,
        "content": "jack-content-222"
    },
    {
        "id": 3,
        "author": author.tom,
        "content": "tom-content-111"
    },
    {
        "id": 4,
        "author": author.tom,
        "content": "tom-content-222"
    },
    {
        "id": 5,
        "author": author.lusi,
        "content": "lusi-content-111"
    },
    {
        "id": 6,
        "author": author.lusi,
        "content": "lusi-content-222"
    }
]
// 重载签名
function searchMsg(val:author):listItem[]
function searchMsg(val:number):listItem
// 实现签名
function searchMsg(val: author | number) {
    if (typeof val === 'number') {
        return list.find(item => item.id == val)
    } else {
        return list.filter((item) => item.author == val)
    }
}
// 调用函数，此时会发现不报错了
searchMsg(1)
searchMsg(author.jack)

export { }
```

### 类
#### 类的简介
类就是拥有**相同属性和方法**的一系列对象的集合。

展开理解:类是一个摸具,是从这该类包含的所有具体对象中抽象出来的一个概念,类定义了它所包含的全体对象的静态特征和动态特征。

举例:

**people 类**

静态特征【属性】name,age,address,phone

动态特征【方法】doEat,doStep

desk 类

静态特征【属性】height,width,color,price,brandno,material

动态特征【方法】load

order订单类

静态特征【属性】orderid,ordertime,custname

动态特征【方法】createOrder,modifyOrder, delorder, chargeBack

#### 类的一些概念
1、类（class）:定义了一件事物的抽象概念，包含它的属性和方法

2、对象（object）：类的实例，通过new生成

3、面向对象（OOP）的三大特性：<u>封装，继承，多态</u>

4、封装（Encapsulation  [ɪnˌkæpsjuˈleɪʃn]）:将对数据的操作细节隐藏起来，只暴露对外的结构，外界调用端更不需要知道细节，就能通过对外提供的接口来访问对象，同时也保证了外界无法任意更改对象内部的数据

5、继承（Inheritance）  [ɪnˈherɪtəns]:子类继承父类，子类除了拥有父类所有的特性外，还有一些更具体的分类

6、多态（Polymorphism）  [ˌpɒlɪˈmɔːfɪz(ə)m]：由继承而产生了相关的不同的类，对同一个方法可以有不同的响应

7、存取器（getter&setter）：用以改变属性的读取和赋值行为

8、修饰符（Modifiers）：修饰符是一些关键字，用于限制成员或类型的性质，比如public表示共有属性或方法

9、抽象类（Abstract Class）：抽象类是供其他类继承的基类，抽象类不允许被实例化，抽象类中的抽象方法必须在子类中被实现

10、接口（Interfaces）：不同类之间公有的属性或方法，可以抽象成一个接口，接口可以被类实现，一个类只能继承另一个类，但可以实现多个接口

#### 类的用法
要想面向对象，操作对象，首先便要拥有对象，那么下一个问题就是如何创建对象。

创建对象，必须要先定义类，所谓的类可以理解为对象的模型，程序中可以根据类创建指定类型的对象

例如可以创建Person类来创建人的对象，通过Dog类创建狗的对象，通过Car类创建汽车的对象，不同的类可以用来创建不同的对象

##### 类的属性和方法
使用class关键字来定义类，使用constructor定义构造函数

对象中主要包含两个部分 

 1、**属性** 实例属性、静态属性（类属性）、只读属性

 2、**方法** 实例方法、静态方法（类方法）

```typescript
class Person{
    name:string='' //需要初始化，解决方案很多
    age?:number //可选的
    gender!:string //忽略undefined
    work:string //也可以在constructor中初始化
    constructor(name:string,age:number,gender:string,work:string){
        this.name=name
        this.work=work
        this.gender=gender
        this.work=work
    }
    sayHello(){
        console.log(`hello,我是${this.name}`);
        
    }
}
let p1=new Person('jack',18,'男','程序员')
console.log(p1.name);//jack
p1.sayHello()
```

##### 继承（/扩展）
###### （1）、implements
<!-- 这是一张图片，ocr 内容为：PINGABLE { INTERFACE VOID; PING(): J PINGABLE IMPLEMENTS CLASS SONAR PING() { CONSOLE.LOG("PING!"); -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1733322220489-dced86d9-36ff-4bcf-b552-8f21e733e343.png)

用implements实现，一个新的类，从父类或者接口实现所有的属性和方法，同时可以重写属性和方法，包含一些新的功能

```typescript
interface Person1 {
  name: string;
  age: number;
  say(): void;
}
interface Person2 {
  say(): void;
}
class Student implements Person1, Person2 {
  name = "tom";
  age = 18;
  say() {
    console.log("hello");
  }
}
```

###### （2）、extends
<!-- 这是一张图片，ocr 内容为：ANIMAL CLASS } CLASS ANIMAL EXTENDS DOG -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1733322232133-774e3251-f725-4d10-b427-907b92d3103f.png)

使用extends关键字实现继承，子类中使用super关键字来调用父类的构造函数和方法

父类里面声明一些公用的一些方法，需要更细致的描述，就对他进行一些扩展,声明子类去继承父类的方法等，如果有多个类有相同的属性和方法，就可以把共有的部分提取出来，形成一个父类保证代码的可重用性，可复用性

```typescript

//基类、父类
{
  class Person {
    name: string;
    age: number;
    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
    say() {
      console.log(this.name + "说话");
    }
  }
  // 子类继承父类
  class Student extends Person {
    school: string;
    constructor(name: string, age: number, school: string) {
      super(name, age);
      this.school = school;
    }
    study() {
      console.log("在学习");
    }
  }
  // 创建子类实例
  const s1 = new Student("tom", 19, "good good ,study");
  //   console.log(s1);
  // 子类继承父类
  class Teacher extends Student {
    price: number;
    
    constructor(name: string, age: number, school: string, price: number) {
       // 在类的方法中super就表示当前类的父类
       //如果在子类中写了构造函数，在子类的构造函数中，必须对父类的构造函数进行调用，否则就会报错 
      super(name, age, "bdqn");
      this.price = price;
    }
    //若在子类中添加了跟父类相同的方法，子类的方法会直接覆盖父类中的方法，这种称为方法的重写
    study() {
      super.study();//调用继承的方法
      console.log("在备课");//方法的扩展，添加自己的内容
    }
    
  }
  // 创建实例
  const t1 = new Teacher("jack", 30, "bdqn", 100);
  t1.study()
  console.log(t1);
}
```

##### 类成员的访问修饰
TS可以使用三种访问**修饰符**，分别是public、private、protected

-public修饰的属性或方法是公有的，可以在任何地方被访问到，默认所有的属性和方法都是pulic的

-private修饰的属性或方法是私有的，不能在声明它的类的外部访问

-protected修饰的属性或方法是受保护的，它和private类似，区别是它在子类中也是允许被访问的

**参数属性**

-修饰符和readonly还可以使用在构造函数参数中，等同于类中定义该属性同时给该属性赋值，使代码更简洁

| <font style="color:rgb(255,255,255);">修饰符</font> | <font style="color:rgb(255,255,255);">含义</font> | <font style="color:rgb(255,255,255);">具体规则</font> |
| --- | --- | --- |
| <font style="color:rgb(38,38,38);">public </font> | <font style="color:rgb(38,38,38);">公开的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">⼦类</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">类外部</font><font style="color:rgb(38,38,38);">访问 。 </font> |
| <font style="color:rgb(38,38,38);">protected </font> | <font style="color:rgb(38,38,38);">受保护的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">、</font><font style="color:rgb(223,42,63);">⼦类</font><font style="color:rgb(38,38,38);">访问。 </font> |
| <font style="color:rgb(38,38,38);">private </font> | <font style="color:rgb(38,38,38);">私有的 </font> | <font style="color:rgb(38,38,38);">可以被：</font><font style="color:rgb(223,42,63);">类内部</font><font style="color:rgb(38,38,38);">访问。</font> |
| <font style="color:rgb(38,38,38);">readonly </font> | <font style="color:rgb(38,38,38);">只读属性 </font> | <font style="color:rgb(38,38,38);">属性⽆法修改。</font> |


```typescript
{
    //父类
  class Person {
    //访问修饰符，默认是1、public，在类的内部，外部都可读可写
    public name: string;
    readonly age: number;//2、readonly    在类的内部，外部都是可读的，但不能改写
    private sex: string; //3、private 私有的属性，在函数内部可读可写，但在外部不可读，不可修改
    protected address: string; //4、 protected 受保护的，只能在类的内部和子类使用
    public constructor(name: string, age: number, sex: string = "male", address: string = "合肥") {
      this.sex = sex;
      this.name = name;
      this.age = age;
      this.address = address;
    }
    public say() {
      //this.age=28; //报错，因为是只读的
      this.name = "edu"; //公有属性，可修改
      this.sex = "female"; //私有函数内部可修改
      console.log(this.name + "#" + this.age + "#" + this.sex);
    }
  }
  //子类
  class Student extends Person {
    protected school: string;
    constructor(name: string, age: number, sex: string, address: string, school: string) {
      super(name, age, sex, address);
      this.school = school;
    }
    study() {
      //console.log(this.sex);//私有属性，只能在类内部读取使用
      console.log(this.address, "111"); //保护属性，在子类内部可使用
    }
  }
  //父类实例
  const p1 = new Person("eduwork", 15);
  console.log(p1.name); //eduwork，可读
  //console.log(p1.sex);//私有属性，外部读取会报错
  // console.log(p1.address);//保护属性，外部读取会报错
  p1.say();
  //子类实例
  const s1 = new Student("tom", 10, "male", "地址", "student");
  s1.study();
}
```

##### 封装
###### 方法的封装
```typescript
{
  class Person {
    name: string;
    age: number; //属性进行封装，不让随便更改
    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
    
  //1.1 类成员方法的封装，多个方法，汇总成一个方法，对外只暴露这个完整的方法
    public run() {
      //里面有很多方法，很多子类
      /*  console.log('左腿');
        console.log('右腿');
        console.log('前进一步');   */
      this.left();
      this.right();
      this.go();
    }
    
//内部的小方法是为一个大方法使用的，小方法是私有方法，不对外暴露使用
    private left() {
      console.log("左腿");
    }
    private right() {
      console.log("右腿");
    }
    private go() {
      console.log("前进一步");
    }
  }
  const p1 = new Person("tom", 20);
  p1.run();
}
```

###### 属性的封装
```typescript
{
  class Person {
    name: string;
    private _age: number; //属性进行封装，不让随便更改
    constructor(name: string, age: number) {
      this.name = name;
      this._age = age;
    }

    //原来age属性是不允许修改的，但可对age属性进行封装，
    //声明一个方法,里面加一些逻辑，有选择的让别人修改
    setAge(age: number) {
      //修改age属性的方法
      if (age > 0 && age < 120) this._age = age;
    }
    getAge(age: number) {
      //读取age属性的方法
      return this._age;
    }
  }

  const p1 = new Person("tom", 20);

  //1.2 通过封装过的方法去读取私有属性
  let res1 = p1.setAge(30);
  let res2 = p1.setAge(150);
  let res3 = p1.getAge(30);
  console.log(res1, res2, res3);
}
```

###### 存取器（getter&setter）
<!-- 这是一张图片，ocr 内容为：CLASS C { LENGTH 0; 如果存在GET,但没有SET,则该属 性自动是只读的 GET LENGTH() THIS._LENGTH; RETURN 如果没有指定SETTER参数的类型,它 将从GETTER的返回类型中推断出来 } LENGTH(VALUE) SET 访问器和设置器必须有相同的成员可 见性 THIS. LENGTH VALUE; -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1733321275722-ed451255-86dd-4b4d-bd53-db79b071c918.png)

使用getter和setter可以改变**<font style="color:#DF2A3F;">属性</font>**的<u>赋值和读取</u>行为，设置的是**<u>属性</u>**

```typescript
{
  class Person {
    name: string;
    private _age: number; //属性进行封装，不让随便更改
    constructor(name: string, age: number) {
      this.name = name;
      this._age = age;
    }

    //   2、 存储器，自带的设置方式，相当于自定义读取，修改私有属性方法
    set age(age: number) {
      //修改私有属性
      if (age > 0 && age < 120) {
        this._age = age;
      }
    }
    get age() {
      //读取私有属性
      return this._age;
    }
  }
  const p1 = new Person("tom", 20);

  //存取器访问属性，好处的是不需要自己去调用get，set方法
  p1.age = 30;
  console.log(p1.age);
}
```

##### 静态属性&静态方法
```typescript
// 定义静态属性&静态方法  
// 存在于类中，只属于Person类的，实例无法直接调用
class Person {
    name: string = '' //需要初始化，解决方案很多
    age?: number //可选的
    static count:number=0
    constructor(name: string, age: number) {
        this.name = name
        this.age = age
        Person.count++
    }
    sayHello() {
        console.log(`hello,我是${this.name}`);
    }
    static say(){
        console.log('静态方法');
        
    }
}
let p1 = new Person('jack', 18)
console.log(p1.name);//jack
Person.say()
p1.sayHello()
// p1.say()//报错
```

定义一个处理日期的公共的类，这个类里面有很多方法，可以处理各种日期问题

我们在调用时，无序实例化，直接用类.方法的形式使用就可以了

```typescript
// 处理日期类
class DateUtil{
    static formatDate(){} //基本格式化
    static diffDateByDay(){} //计算两个日期之间的天数
    static timeConversion(){}//返回格式：天 时 分 秒
}
DateUtil.timeConversion()
// 像这样，不需要实例化，直接使用就可以的，可以定义为静态方法
```

##### 单例模式的两种实现方式
一个类只允许外部获取到它的<u>唯一 一个实例对象</u>

```typescript
// 处理日期类
//实现一： 单例模式（单件模式）立即创建模式
// 这种创建方式，是一开始就会创建,哪怕是不调用，底层也会帮我创建
// class DateUtil {
//     // 定义类的静态属性
//     static dateUtil = new DateUtil()//立即创建模式
//     // constructor是私有的，不允许实例化
//     private constructor() { 
//         console.log('立即创建了');
//     }
//     formatDate() { } //基本格式化
//     diffDateByDay() { } //计算两个日期之间的天数
//     timeConversion() { }//返回格式：天 时 分 秒
// }
// const dateUtil1 = DateUtil.dateUtil
// const dateUtil2 = DateUtil.dateUtil
// console.log(dateUtil1 === dateUtil2);//true
//可以执行
// dateUtil1.formatDate()

//实现二： 单例模式（单件模式）
class DateUtil {
    // 定义类的静态属性
    static dateUtil: DateUtil;
    static getInstance() {
        if (!this.dateUtil) {//为空则创建一次
            return this.dateUtil = new DateUtil()
        } else {//不为空，始终调用一次
            return this.dateUtil
        }
    }
    // constructor是私有的，不允许实例化
    private constructor() {
        console.log('立即创建了');
    }
    formatDate() {
        console.log('格式化时间格式');
    } //基本格式化
    diffDateByDay() { } //计算两个日期之间的天数
    timeConversion() { }//返回格式：天 时 分 秒
}
const dateUtil = DateUtil.getInstance()
dateUtil.formatDate()

export { }
```

##### 抽象类
+ 以**<font style="color:#DF2A3F;">abstract开头</font>**的类是抽象类，抽象类和其他类区别不大，只是<font style="color:#DF2A3F;">不能用来创建对象，</font> 抽象类就是<u>专门用来</u><u><font style="color:#DF2A3F;">被继承</font></u>的类，就是给被人当父类的，当爸爸的。即：**抽象类是供其他类继承的基类，抽象类不允许被实例化，抽象类中的抽象方法必须在子类中被实现**
+ 抽象方法，抽象方法使用<font style="color:#DF2A3F;">abstract开头，没有方法体，</font>抽象方法只能定义在抽象类中，子类必须对抽象方法进行重写 

即：<font style="color:#DF2A3F;">强制子类必须重写抽象方法，规定了结构，</font>**<font style="color:#DF2A3F;">规定目标，让孩子实现</font>**

```typescript
{
  //2、有抽象方法的类是抽象类，也需要用 abstract修饰
  abstract class Person {
    name: string = "bdqn";
    say() {
      console.log();
    }
    abstract run(): void; //1、没有方法体的方法叫抽象方法
  }
  //const p=new Person() // 3、报错，抽象类无法实例化

  /*4、 父类自己不实例化，让子类继承，然后重写方法，让子类实现，去实例化
 抽象类的作用：约束子类必须有抽象方法的实现 */
  class demo extends Person {
    run() {
      console.log("重写父类的方法，必须要有这个方法");
    }
  }
  const d = new demo();
  d.run()
   // 5、再创建一个子类,必须有run方法
  // class Student extends Person{ }
}
```

##### 多态
什么是多态？项目开发完了，后面扩展性的工作怎么办？

如果不用多态扩展功能，就得去改变源码，此时可以用<u>多态机制预留，用接口去规范它</u>，把具体的实现交给后期接入的程序去实现，把对应的程序拷贝到对应的目录下，就可直接使用，不需要改变源码

比如：有很多银行，现在自动取卡机，是银联卡，支持跨银行取钱，目前已经有很多的取款机了，如果新开一个银行，也想加入到银联，不需要更新所有的取款机，只需要使用多态规范，要求好，具体实现，交给新开的银行

总结：程序已经写完了，留给程序后面的接口

```typescript
//提前约束/规范好方法属性，建立一个接口
interface usb {
  // 定义usb的大小，电流等等,用来规范usb接口，不在主程序里，在子程序里
  start(): void;
  run(): void;
  end(): void;
}

//具体子类去实现，例如鼠标，u盘等
class shubiao implements usb {
  start() {
    console.log("鼠标驱动开启");
  }
  run() {
    console.log("鼠标驱动运行");
  }
  end() {
    console.log("鼠标驱动结束");
  }
}
//具体子类去实现，例如鼠标，u盘等
class upan implements usb {
  start() {
    console.log("麦克风驱动开启");
  }
  run() {
    console.log("麦克风驱动运行");
  }
  end() {
    console.log("麦克风驱动结束");
  }
}

function demo(u: usb) {
  u.start();
  u.run();
  u.end();
}

demo(new shubiao()); //传鼠标表
demo(new upan()); //传u盘
```

### 泛型
#### 泛型定义
是指在<font style="color:#DF2A3F;">定义</font>函数、接口或类的时候，<font style="color:#DF2A3F;">不预先指定具体的类型</font>，而在<font style="color:#DF2A3F;">使用</font>的时候，再<font style="color:#DF2A3F;">指定类型</font>的一种特性,即根据调用的情况来

**特点一:**定义时不明确使用时必须明确成某种具体数据类型的数据类型。【泛型的宽泛】

**特点二:**编译期间进行数据类型检查的数据类型。【泛型的严谨】

泛型的优点简要来说就两点：类型安全、代码复用。

+ **类型安全：**泛型可以在编译时检查数据类型，确保数据类型的正确性，减少运行时错误。
+ **代码复用：**不需要为每种类型编写多个版本的函数或类。

#### 泛型的语法
:::color1
1.   
function 函数名<T>(参数: T):T {
2. _// ..._
3. }
4. 
5. class 类名<T> {
6. _// ..._
7. }
8. 
9. interface 接口名<T> {
10. _// ..._
11. _}_

:::

##### 泛型函数的使用
```typescript
  /* 函数如果不传参的话，它就执行一次，就结束了，
    如果传参数的话，就可以无限改变函数的执行，执行一系列的逻辑，
    由函数调用者来决定函数怎么执行
     */
  function fun(a: string) {
    console.log("执行一次", a);
  }
  fun("hello");

  // 泛型就是类型参数化  type表示任意类型 ，fun2<type>定义了type类型
  function fun2<type>(arg1: type, arg2: type): type {
    return arg1 || arg2;
  }
  fun2(true, false);	//自动推断数据为boolean
  fun2<number>(1, 1);//指定泛型为number
  fun2<string>("hello", "word");

  fun2<{ length: number }>({ length: 0 }, { length: 1 });
```

##### 泛型接口的使用
```typescript
// 可以限制多个类型
interface Iperson<T1,T2>{
      name:T1,
      age:T2
  }
  const p1:Iperson={//默认类型
      name:'jack',
      age:111 
  }
  const p2:Iperson<string,number>={
      name:'tom',
      age:10
  }
```

##### 泛型类的使用
```typescript
{
  class Phone<T1, T2> {
    name: T1;
    size: T2;
    price: T2;
    constructor(name: T1, size: T2, price: T2) {
      this.name = name;
      this.size = size;
      this.price = price;
    }
  }
  const P1 = new Phone("iphone", 6.5, 1000); //自己推荐的类型
  const P2 = new Phone<string, number>("huawei", 5.5, 1200);
  const P3: Phone<string, number> = new Phone("chuizi", 5.5, 2000);
  
    //通过泛型控制数组的类型
  const arr:string[]=['a','b','c']
  const arr2:Array<number>=[1,2,3]
}
```

#### 泛型约束
<font style="color:rgba(0, 0, 0, 0.85);">有时候你期望对泛型类型参数加以限制，</font><font style="color:#DF2A3F;">仅允许特定类型或者满足特定条件的类型传入</font>

keyof表示获取一个类或者一个对象类型或者一个接口类型的<font style="color:#DF2A3F;">所有属性名[key]</font>组成的**<font style="color:#DF2A3F;">联合类型</font>**。

索引访问类型

```typescript
class Order {
    orderid!: number
    ordername!: string
    static count: number
    printOrd() {
    }
    static getCount() { }
}
// 获取到订单id的值
//type orderid=Order['orderid']
// 获取到order的所有类的属性
// type orderAllKey=keyof Order
// 获取到所有类的所有属性,但这么直接写，会有风险，因为allKey<任意类型>
// type allKey<T> = keyof T

// 给T做约束，这样给泛型传值时，就不可以乱传了
type allKey<T extends Order> = keyof T
type orderAllKey = allKey<Order>

```

#### 泛型参数的默认类型
```typescript
 //泛型可以有默认的数据类型
  function fun<T = string>(name: T) {
    return name;
  }
  console.log(fun("adb"), fun<number>(111));
```

#### 泛型常用字母
用常用的字母来表示一些变量的代表：

+ **T**：代表**Type**，定义泛型时通常用作第一个类型变量名称
+ **K**：代表**Key**，表示对象中的**键类型**；
+ **V**：代表**Value**，表示对象中的**值类型**；
+ **E**：代表**Element**，表示的**元素类型**；

# 4、类型断言&类型守卫
## 类型断言
分为三种：`类型断言`、`非空断言`、`确定赋值断言`

当断言失效后，可能使用到：**双重断言**

在特定的环境中，我们会比TS知道这个值具体是什么类型，不需要TS去判断，简单的理解就是，**类型断言会告诉编译器，你不用给我进行检查，相信我，他就是这个类型**

### 类型断言
#### 语法一：as （推荐写法）
语法格式:	**<font style="color:#DF2A3F;">A数据类型的变量  as B数据类型</font>**。

```typescript
let b:B
let C:C=b as C;
```

理解:是绕过TS编译检查,类型断言就是对编译器说:我就是是这个类型了,无需检查

类型断言使用场景

#### 语法二：类型转换 
编译器强制一个类型转换成另外一个类型。

```typescript
function fun(n: string | number) {
    // let num=n.length  //直接写会报错，因为n有可能是number，没有length属性
    //  解决方案一:缩小类型
    let num: number;
    /* if(typeof n=='string'){
      num=n.length
      } */
    //解决方案二：断言
    //  类型转换
    // num=(<string>n).length
    //  类型断言
    num = (n as string).length;
    console.log("num," + num);
}
fun("hello");
export { }
```

注意：但需要注意的是：尖括号语法在**React**中会报错，原因是与`JSX`语法会产生冲突，所以只能使用**as语法**

### 非空断言(!)应用
在上下文中当类型检查器无法断定类型时，一个新的后缀表达式操作符 `!` 可以用于断言操作对象是**非 null 和非 undefined 类型。**

```typescript
const Info = (name: string | null| undefined)=>{
   let str:string = name;
   let str2:string = name!;
   console.log(str,str2);
   
}
Info('Domesy');
Info(null);
Info(undefined);
```

我们可以看出来 `!`可以帮助我们<u>过滤 </u>`<u>null</u>`<u>和 </u>`<u>undefined</u>`<u>类型</u>，也就是说，编译器会默认我们只会传来`string`类型的数据，所以可以赋值为`str1`

但变成`ES5`后 `!`会被移除，所以当传入 `null` 的时候，还是会打出 `null`

### 确定赋值断言
在`TS` 2.7版本中引入了确定赋值断言，即允许在<u>实例属性和变量</u>声明<font style="color:#DF2A3F;">后面</font>放置一个 `!` 号，以告诉`TS`该属性<u>会被明确赋值。</u>

```typescript
let num: number;
    let num1!: number;
 
    const setNumber = () => num = 7
    const setNumber1 = () => num1 = 7
 
    setNumber()
    setNumber1()
 
    console.log(num) // error 
    console.log(num1) // ok
```

### 双重断言
**断言失效后，可能会用到，但一般情况下不会使用**

失效的情况：基础类型不能断言为接口

```typescript
interface Info{
      name: string;
      age: number;
    }
 
    const name = '小杜杜' as Info; // error, 原因是不能把 string 类型断言为 一个接口
    const name1 = '小杜杜' as any as Info; //ok
```

### 补充 as const 应用
根据具体的值转换类型，推断**<font style="color:#DF2A3F;">类型转换为字面值类型</font>**

```typescript
const str2 = "hello";
//str2='hello1'  //报错，const定义的str2不能被修改

let str3: "hello" = "hello";
//str3='hello2' //报错，str3也是常量，不能修改

let str4 = "hello" as const;// ==const str2 = "hello";
//str4='hello4' //报错， 相当于定了一个常量，不能被再赋值
```

推断类型的数组转化为元组

```typescript

let arr4=['hello',18] as const
// arr4.push('world') //这样就报错，arr4只能放['hello',18]
let arr5=<const>['hello',18]
// arr5.push('world') //这样就报错，arr5只能放['hello',18]
console.log(arr5[0]);//可读，不可改
```

推断的对象可以转化为readonly

```typescript
let user2={
    name:'tom',
    age:18
}as const
//user2.name='jack'  //报错，只读不能改
```

在解构中使用as const

```typescript
function ew() {
  let str: string = "hello";
  let fun = (a: number, b: number): number => a + b;
  return [str, fun];
  // return [str,fun] as [string,Function]
  // return [str,fun] as [typeof str,typeof fun]
  // return [str, fun] as const;
}

/* let [aa,bb]=ew()  //解构ew()的返回值
let res=bb(10,20)  //报错，无法确定bb一定是函数 */

// 解决方案一：结构时断言
let [aa, bb] = ew() as [string, Function];
let res = bb(10, 20);
console.log(res);

//解决方案二：调用时断言
/* let [aa,bb]=ew()
let res=(bb as Function)(10,20)
console.log(res); */

//解决方案三：直接在返回值里断言  有多种写法
/*
return [str,fun] as [string,Function]
return [str,fun] as [typeof str,typeof fun]
return [str,fun] as const
*/
// let [aa, bb] = ew();
// let res = bb(10, 20);
// console.log(res);
```

## 类型守卫+应用
### 定义:
在语句的块级作用域【if语句内或条目运算符表达式内】缩小变量的一种类型推断的行为。

### 产生时机:
TS条件语句中遇到下列条件关键字时,会在语句的块级作用域内缩小变量的类型,这种类型推断的行为称作类型守卫(TypeGuard)。类型守卫可以帮助我们<u>在块级作用域中获得更为需要的精确变量类型。</u>

### 种类
#### 实例判断:instanceof
JavaScript 有一个运算符来 instanceof <u>检查一个值是否是另一个值的“实例”。</u>更具体地，在JavaScript 中 x instanceof Foo 检查 x 的原型链是否含有 Foo.prototype 。 instanceof 也是一个类型保护，TypeScript 在由 instanceof 保护的分支中实现缩小。

```typescript
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase());
  }
}

logValue(new Date());
logValue("hello ts");
```

#### 属性或者方法判断: in
JavaScript 有一个运算符，用于<u>确定</u>**<u><font style="color:#DF2A3F;">对象</font></u>****<u>是否具有某个</u>**<u>名称的</u>**<u><font style="color:#DF2A3F;">属性</font></u>**<u>： in 运算符</u>。TypeScript 考虑到了这 一点，以此来缩小潜在类型的范围。 

例如，使用代码： "value" in x 。这里的 "value" 是字符串文字， x 是联合类型。值为“true”的分支缩小，需要 x 具有可选或必需属性的类型的值；值为 “false” 的分支缩小，需要具有可选或缺失属性的类型的值。

<!-- 这是一张图片，ocr 内容为："VALUE"INX FALSE X需要具有可选或缺失属性的类型的值 TRUE X具有可选或必需属性的类型的值 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1732969350871-b68c6faf-e90a-4e2e-8ea2-9f60f14c00cb.png)

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }

  return animal.fly();
}
```

#### 类型判断:typeof
**typeof 作用**

typeof用来检测一个变量或一个对象的数据类型。

**typeof检测的范围**

typeof检测变量的类型范围包括:"string"| "number" | "bigint" | "boolean" | "symbol" | "undefirned" |"object"|"function"等数据类型。

```typescript
// typeof守卫
// function fun(n: string | number) {
//     // let num=n.length  //直接写会报错，因为n有可能是number，没有length属性
//     //  解决方案一:缩小类型
//     let num: number;
//     if (typeof n == 'string') {
//         num = n.length
//         console.log("num," + num);
//     }
// }
// fun("hello");

// 局限性：
// typeof无法检测array，object，map，set
const arr = [30, 50]
// console.log(typeof arr);
const set = new Set()
// console.log(typeof set);
const map = new Map()
// console.log(typeof map);

console.log(Object.prototype.toString.call(arr));//[object Array]
console.log(Object.prototype.toString.call(set));//[object Set]
console.log(Object.prototype.toString.call(map));//[object Map]

export { }
```

#### 字面量相等判断:==，===，/==，/===
```typescript
function example(x: string | number, y: string | boolean) {
  //  如果两个全等，也就都是string类型
  if (x === y) {
    x.toUpperCase();
    y.toLowerCase();
  } else {
    console.log(x);
    console.log(y);
  }
}

function printAll(strs: string | string[] | null) {
  // 如果strs不是null
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    } else {
      // ...
    }
  }
}

interface Container {
  value: number | null | undefined;
}

function multiplyValue(container: Container, factor: number) {
  if (container.value != null) {
    console.log(container.value);
    container.value *= factor;
  }
}

multiplyValue({ value: 5 }, 6);
multiplyValue({ value: undefined }, 6);
multiplyValue({ value: null }, 6);
// multiplyValue({ value: "5" }, 6);//报错

```

## 自定义守卫
:::color1
function	函数名(形参:参数类型【参数类型大多为any】):形参  is  A类型{

return	true or false

}

:::

```typescript
function fun(num: string | number) {
    if (isNum(num)) {
        console.log(num);
    } else {
        console.log(num.length);
    }
}

// 自定义守卫
function isNum(num: any): num is number {
    return typeof num === 'number'
}
export { }
```

# 5、模块导入
在TypeScript中编写基于模块的代码时，有三个主要方面需要考虑： 

**语法：**我想用什么语法来导入和导出东西？ 

**模块解析：**模块名称（或路径）和磁盘上的文件之间是什么关系？ 

**模块输出目标：**我编译出来的JavaScript模块应该是什么样子的？

## 5.1、ES模块语法
暴露：

```typescript
//1、 默认暴露
export default function helloWorld() {
  console.log("Hello, world!");
}

//2、 分别暴露
export var pi = 3.14;
export class Person {}

//3、 统一暴露
const phi = 1.61;
function absolute(num: number) {
  if (num < 0) return num * -1;
  console.log(num);
}
export { phi, absolute };
```

导入：

```typescript
// 1、导入，只针对默认暴露，
// 注意文件后不能加文件后缀
import hello from "./01.m1";
hello();

//2、分别引入，利用解构赋值
import { pi as T, Person } from "./02.m2";
console.log(T); //可以起别名
console.log(new Person());

// 3、统一导入
import * as data from "./03.m3";
console.log(data.phi);
data.absolute(10);
```

## 5.2、TS特定的ES模块语法
暴露:m1.ts

```typescript
// 分别暴露Cat类型
export type Cat = {
  name: string;
  age: number;
  say: () => void;
};
//分别暴露Dog接口
export interface Dog {
  name: string;
  age: number;
  say: () => void;
}
// 分别暴露一个接口
export const createCatName = () => "createCatName";
```

导入：app.ts

```typescript
// 1、解构导入类型和接口，以下两种写法都可以
// 注意不要加.ts
// import { Cat, Dog } from "./m1";
// import type { Cat, Dog } from "./m1";

//2、 同时进行方法和类型的导入
import { createCatName, type Cat, type Dog } from "./m1";

// 使用类型
let cat: Cat = {
  name: "mimi",
  age: 2,
  say() {
    console.log("mimi");
  },
};
console.log(createCatName());
```



## 5.3、** CommonJS 语法 **
CommonJS是npm上大多数模块的交付格式。即使你使用上面的ES模块语法进行编写，对CommonJS语法的工作方式有一个简单的了解也会帮助你更容易地进行调试。

暴露：m1.ts

```typescript
function fun(val: string) {
  console.log(val);
}
// 导出
module.exports = {
  name: "jack",
  age: 16,
  fun: fun,
};
// 或者也可以导出
exports.fun = fun;
```

导入：app.ts

```typescript
const data = require("./m1");
console.log(data.name);
data.fun("hello");
```



## 5.4、命名空间
```typescript
namespace one {
  //1、输出只能在内部使用
  function fun(a: string, b: string) {
    return a + b;
  }
  console.log(fun("hello", "world"));
}
namespace two {
  //2、export 导出，内部外部都可以使用
  export function fun(a: number, b: number) {
    return a + b;
  }
  console.log(fun(1, 1));
}
//3、区域导出Three，就可以在别的文件中使用
export namespace Three{
    export function fun2(a:number,b:number) {
        return a-b
    }
}

//4、可以多层命名
namespace Four{
  export  namespace Fire{
        export function fun3(a:number,b:number) {
            return a+b+100
            
        }
    }
}
console.log(Four.Fire.fun3(2,2));
```

```typescript
import {Three} from './01.命名空间'
console.log(Three.fun2(2,1),'222');
```

# 6、TS高级使用
## 常用技巧
### infer
infer的定义:infer表示在 extends条件语句中以占位符出现的等到使用时才推断出来的数据类型。

```typescript
interface Customer {
    custname: string
    buymoney: number
}
//定义函数类型
type CustFun = (params: Customer) => number
// 应用一：定义CustParaType，用在参数位置,//占位符P可以拿到Customer类型
// type CustParaType = CustFun extends (params: infer P) => number ? P : CustFun

// 应用二：定义CustParaType，用在返回值位置
//如果条件满足，就可以拿到相同位置的类型
// type CustParaType=CustFun extends (params:any)=>infer R?R:CustFun
// 结合泛型，应用
// type ParamsType<T> = T extends (params: any) => infer R ? R : never
// type CustParaType = ParamsType<CustFun>

//引用三：
type EleOfArr<T> = T extends Array<infer P> ? P : never
type EleOfArrTest1 = EleOfArr<Array<string>>
type EleOfArrTest2 = EleOfArr<Array<{name:string,age:number}>>
```

### in keyof
拿到类型中所有的属性

```typescript
interface Customer {
    name: string
    degree: number
    phone: string
}
// 具体的
// type CustKeyValsType = {
//     // 拿到Customer中的每一个属性：拿到Customer对应的属性的属性值
//     [P in keyof Customer]: Customer[P]
// }
// 通用的
type CustKyeValsModel<T> = {
    [P in keyof T]: T[P]
}
type CustKeyValsType = CustKyeValsModel<Customer>
export { }
```

keyof不能直接看到属性的问题

```typescript
interface Customer {
    name: string
    degree: number
    phone: string
}

// 不能只管看到结果的问题
// type keys=keyof Customer
type DirectKeys<T> = T extends any ? T : never
type keys = DirectKeys<keyof Customer> //name,degree,phone


export { }
```

### 条件判断
基本使用

```typescript
// 根据条件，定义test的类型
// type Test = string | number extends string | number ? string : never //Test:string
// type Test = string | number |boolean extends string | number ? string : never //Test：never
// 以上是：一次性比较
// 结合泛型
type CondType<T> = T extends string | number ? T : never
type Test1 = CondType<string | number> //Test1:string | number
type Test2 = CondType<string | number | boolean>//Test1:string | number
// 泛型是：迭代比较

// 需求：想要再Customer中后期添加任意属性
interface Customer{
    name:string
    degree:number
    phone:string
}

type AppAttrToObj<T,K extends string,V>={
    [P in keyof T |K]:P extends keyof T ?T[P]:V
}
type Test=AppAttrToObj<Customer,'weixin',string>

export {}

```

扁平化模块属性名

根据下面的素材

```typescript
type Modules = {
    menu: {
        fun1: (index: string) => string
        fun2: (index: string) => string
    }
    tabs: {
        fun1: (index: string) => string
        fun2: (index: string) => string
        fun3: (index: string) => string
    }
}
```

得到的类型结果

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742882733479-6ad9659f-d157-416d-b8a9-8e37962a3e49.png)

```typescript
type Modules = {
    menu: {
        fun1: (index: string) => string
        fun2: (index: string) => string
    }
    tabs: {
        fun1: (index: string) => string
        fun2: (index: string) => string
        fun3: (index: string) => string
    }
}
// 第一步：模板字符类型
// 语句中不能用到泛型，可以&string
type MB<T, U> = `${T & string}/${U & string}`
// type TestMB = MB<'menu', 'fun1' | 'fun2'> //"menu/fun1"|"menu/fun2"


//第二步 拿到父模块得属性名
// type GetSpliceKesy<T> = {
//     [key in keyof T]: T[key]
// }
//第三步 父子模块联合
// type GetSpliceKesy_<T> = {
//     [key in keyof T]: MB<key, keyof T[key]>
// }
// 第四步：最终版
type GetSpliceKesy_a<T> = {
    [key in keyof T]: MB<key, keyof T[key]>
}[keyof T]

type test = GetSpliceKesy_a<Modules>


export { }
```

### Extract
```typescript
// 条件类型的简写，ts底层提供的
type test1 = Extract<string, string | number>//string
type test2 = Extract<string | number | boolean, string | number>//string | number

// ts底层原理，传入两个参数，如果存在继承，就返回前面，否则就是never
// type Extract<T, U> = T extends U ? T : never;
```

### Exclude
```typescript
type test1=Exclude<string,string|number> //nerve
type test2=Exclude<string|number,string|number> //nerve
type test3=Exclude<string|number|boolean,string|number> //boolean
// 底层源码：
// type Exclude<T, U> = T extends U ? never : T;
//跟Extact正好相反，匹配成功，输出never，不成功输出对应类型


export {}
```

### Record
record类型是object类型的升级，凡是用object的地方，都可以用record类型

#### 基本使用
```typescript
// let obj:object={
//     name:'jack',
//     age:18
// }
// obj.name   //没有提示，无法点出来
// function addObj(obj:object){
//     // console.log(obj);
//     //无法确定好传人的对象必须由哪些属性或者类型，此时需要用其他方式解决，如接口或者类

// }
// addObj(obj)
function addObj(obj: Record<string, string | number>) {
    console.log(obj);
}
addObj({ name: 'jack', age: 18 })  //此时的传入，是受Record的约束的
//写法一：  Record<string, string | number>
//写法二：  Record<"name"|"age", string | number>
//写法三：  Record<symbol, string | number>
```



#### 实现深拷贝案例
```typescript
let obj = {
    name: 'jack',
    hobby: ['song', 'run'],
    sayHi() {
        console.log('hi');
    }
}
// 实现深拷贝 
// 方式一：
// function clone<T>(value: T): T {
//     /** 空 */
//     if (!value) return value;
//     /** 数组 */
//     if (Array.isArray(value)) return value.map((item) => clone(item)) as unknown as T;
//     /** 日期 */
//     if (value instanceof Date) return new Date(value) as unknown as T;
//     /** 普通对象 */
//     if (typeof value === 'object') {
//         return Object.fromEntries(
//             Object.entries(value).map(([k, v]: [string, any]) => {
//                 return [k, clone(v)];
//             })
//         ) as unknown as T;
//     }
//     /** 基本类型 */
//     return value;
// }
// 方式二
function deepMerge(...objs: any[]): any {
    const result = Object.create(null)
    objs.forEach(obj => {
        if (obj) {
            Object.keys(obj).forEach(key => {
                const val = obj[key]
                if (isPlainObject(val)) {
                    // 递归
                    if (isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val)
                    } else {
                        result[key] = deepMerge(val)
                    }
                } else {
                    result[key] = val
                }
            })
        }
    })
    return result
}

export function isPlainObject(val: any): val is Object {
    return toString.call(val) === '[object Object]'
}
export { }
```



### Pick
Pick 主要用于提取type类型，接口，类中抓取需要的属性组成一个新的对象类型

```typescript
// Pick 主要用于提取type类型，接口，类中抓取需要的属性组成一个新的对象类型
interface Customer {
    name?: string
    degree: number
    phone: string
}
// Pick<哪个接口/类，哪个属性>
type newType = Pick<Customer, 'name' | 'degree'>
// ts源码：
// type Pick<T, K extends keyof T> = {
//     [P in K]: T[P];
// };
```

跟Pick是提取某些属性，还可以排除某些属性



```typescript
// Pick 主要用于提取type类型，接口，类中抓取需要的属性组成一个新的对象类型
interface Customer {
    name?: string
    degree: number
    phone: string
}

// 排除某些属性
// 写法一：
// type Qmit<T, K extends keyof T> = {
//     // 这个as相当于双重判断
//     // P从T中迭代出来，然后再判断P中有没有K，有在返回never，没有则返回P
//     [P in keyof T as P extends K ? never : P]: T[P]
// }

// 写法二
type Qmit<T, K extends keyof T> = {
    [P in keyof T as Exclude<P, K>]: T[P]
}
type test = Qmit<Customer, 'name'>

export { }
```

### 辅助类型
加可选，去除可选，加只读，去除只读操作

```typescript
interface Customer {
    readonly name?: string
    degree?: number
    phone?: string
}
// 将可选变成必要的
type test1=Required<Customer>
// 原理写法
// type Required<T> = {
//     [k in keyof T]-?: T[k]
// }
// type test1 = Required<Customer> //可选都被去除了

// 将所有的属性变成可选
type test2=Partial<Customer>
// 添加可选原理写法
// type Partial<T> = {
//     [k in keyof T]+?: T[k] //写法一
//     // [k in keyof T]?:T[k] //写法二

// }
// type test2 = Partial<Customer> //所有属性都加可选了

// 将所有属性变成只读的
type test3=Readonly<Customer>
// 只读原理写法
// type Readonly<T> = {
//     -readonly [k in keyof T]+?: T[k]//去除只读属性
//     // readonly [k in keyof T]+?: T[k]//加只读属性

// }
// type test3 = Readonly<Customer>

let todo: test3 = { name: 'jack' }
todo.name = 'tom' //报错


export { }
```



## 装饰器
### 装饰器初相识
#### 简介
1.装饰器本质是一种特殊的函数，它可以对：类、属性、方法、参数进行扩展，同时能让代码更简洁

装饰器就是**解决在不修改原来类、方法,属性,参数的时候为其添加额外的功能**。

2.装饰器自2015年在ECMAScript-6中被提出到现在，已将近10年。

3.截止目前，装饰器依然是实验性特性，需要开发者手动调整配置，来开启装饰器支持。

4.装饰器有5种：

类装饰器、属性装饰器、方法装饰器、访问器装饰器、参数装饰器

#### 环境搭建
虽然TypeScr1pt5.g中可以直接使用类装饰器，但为了确保其他装饰器可用，现阶段使用时

仍建议使用experimentalDecorators配置来开启装饰器支持，而且不排除在来的版本中，官方会进一优化

tsconfig.json文件修改如下:

```typescript
"rootDir": "src/04.chapter",
"outDir": "./dist", 
"experimentalDecorators": true,
"emitDecoratorMetadata": true,
```

### 类装饰器
#### 基体语法
类装饰器是一个应用在**类声明**上的**函数**，可以为类添加额外的功能，或添加额外的逻辑

```typescript
// 定义装饰器
function Demo(target: Function) {
    console.log(target);
}
/*
Demo函数会在Person类定义时执行
参数说明：target参数时被装饰的类，即：Person
*/

@Demo  //相当于，在创建Person类时，调用了Demo的函数
// 定义类
class Person {
    name: string
    age: number
    constructor(name: string, age: number) {
        this.name = name
        this.age = age
    }
}
```

#### 应用举例
:::color1
需求:定义一个装饰器,实现Person实例调用 toString时返回JSON.stringify的执行结果。

:::

```typescript
// 需求:定义一个装饰器,实现Person实例调用 toString时返回JSON.stringify的执行结果。
{
    // 定义装饰器
    function Demo(target: Function) {
        target.prototype.toString = function () {
            // 这里是对实例对象进行序列化
            return JSON.stringify(this)
        }
        // 对指定对象进行封锁
        Object.seal(target.prototype)
    }
    /*
    Demo函数会在Person类定义时执行
    参数说明：target参数时被装饰的类，即：Person
    */

    @Demo
    class Person {
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
    }
    const p1 = new Person('jack', 18)
    console.log(p1.toString()); //不用装饰器，返回的时[object,object]
    // console.log(JSON.stringify(p1)); //在装饰器上使用

    // 飘红解决方案一
    interface Person {
        x: number
    }
    Person.prototype.x = 123
    //@ts-ignore  忽略这行代码不进行代码检测，飘红解决方案二
    // Person.prototype.x = 123
    console.log(p1.x); //会报错，因为你在前面封印了Person.prototype
    
}
```

#### 关于返回值
类装饰器有返回值：若类装饰器返回一个新的类，那这个新类将替换掉被装饰的类。

类装饰器无返回值：若类装饰器无返回值或返回undefined,那被装饰的类不会被替换。

```typescript
{
    // 定义装饰器
    function Demo(target: Function) {
        return class NP {
            test() {
                console.log('test');
            }
        }

    }

    @Demo
    class Person {
        test() {
            console.log('Person');
        }
    }
    console.log(Person);
}
```

#### 关于构造类型
在TypeScript中,Function类型所表示的范围十分广泛,包括:普通函数、箭头函数、方法等等。

但并非Function类型的函数都可以被 new 关键字实例化,例如箭头函数是不能被实例化的,那么

TypeScript中概如何声明一个构造类型呢?有以下两种方式代:

方式一：仅声明构造类型

```typescript
{
    // 方式一：仅声明构造类型
    // 需求：定义一个类的类型
    /*
    new 表示：该类型是可以被用new操作符调用
    ...args 表示：构造器可以接收【任意数量】的参数
    any[]   表示：构造器可以接收【任意类型】的参数
    {}  表示：返回类型是对象（非null,非undefined的对象）
    */

    type Constuctor = new (...args: any[]) => {}

    function test(fn: Constuctor) { }
    class Person { }
    test(Person)
}
```

方式二：定义构造类型，且包含一个静态属性  wife

```typescript
{
    // 方式二：定义构造类型，且包含一个静态属性  wife
    type Constuctor = {
        new(...args: any[]): {}
        wife: string   //静态属性
    }

    function test(fn: Constuctor) { }
    class Person {
        static wife = 'abc'
    }
    test(Person)
}
```

#### 替换被装饰的类
对于高级一些的装饰器，不仅仅是覆盖一个原型上的方法，还要有更多功能，例如添加新的方法和状态。

:::color1
需求：设计一个LogTime装饰器，可以给实例添加一个属性，用于记录实例对象的创建时间，再添加一个方法用于读取创建时间。

:::

```typescript
{
    type Constuctor = new (...args: any[]) => {}
    // T必须是可以被new的类
    function logTime<T extends Constuctor>(target: T) {
        return class extends target {
            createdTime: Date //添加的时间
            // ...args:any[]任意类型，任意个数
            constructor(...args: any[]) {
                super(...args)
                this.createdTime = new Date()
            }
            getTime() {
                console.log(`该对象的创建时间：${this.createdTime}`);
                return `该对象的创建时间：${this.createdTime}`
            }
        }
    }

    @logTime
    class Person {
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
        speak() {
            console.log('你好呀');

        }
    }
    const p1 = new Person('jack', 18)
    console.log(p1);
    // @ts-ignore
    p1.getTime()
}
```

### 装饰器工厂
装饰器工厂是一个返回装饰器函数的函数，可以为装饰器添加参数，可以更灵活地控制装饰器的行为。

:::color1
需求：定义一个LogInfo类装饰器工厂，实现Person实例可以调用到introduce方法，且introduce中输出内容的次数，由LogInfo接收的参数决定。

:::

```typescript
{
    // 定义一个装饰器工厂，它接收一个参数 n，返回一个类的装饰器
    function logInfo(n: number) {
        //返回装饰器
        return function (traget: Function) {
            traget.prototype.introduce = function () {
                for (let i = 0; i < n; i++) {
                    console.log(`我的名字：${this.name}，我的年龄：${this.age}`);
                }
            }
        }
    }
    @logInfo(1)
    class Person {
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
        speak() {
            console.log('你好呀');

        }
    }
    const p1 = new Person('jack', 18)
    interface Person {
        introduce(): void
    }
    p1.introduce()
}
```

### 装饰器组合
#### <font style="color:rgb(38, 38, 38);background-color:rgb(245, 245, 245);">执行顺序</font>
装饰器可以组合使用，执行顺序为：先【由上到下】的执行所有的装饰器工厂，依次获取到装饰器，然后

再【由下到上】执行所有的装饰器。

```typescript
// 装饰器
function test1(target: Function) {
    console.log('test1');

}
// 装饰器工厂
function test2() {
    console.log('test2工厂');
    return function (target: Function) {
        console.log('test2');
    }
}

// 装饰器工厂
function test3() {
    console.log('test3工厂');
    return function (target: Function) {
        console.log('test3');
    }
}

// 装饰器
function test4(target: Function) {
    console.log('test4');
}
@test1
@test2()
@test3()
@test4
class Person { }
```

结果：<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742971244142-4a186b64-d050-41ff-8c40-af4047393733.png)

#### 组合应用
```typescript
{

    type Constuctor = new (...args: any[]) => {}
    // 序列化
    function Demo(target: Function) {
        target.prototype.toString = function () {
            return JSON.stringify(this)
        }
        Object.seal(target.prototype)
    }
    // 打印时间功能
    function logTime<T extends Constuctor>(target: T) {
        return class extends target {
            createdTime: Date
            constructor(...args: any[]) {
                super(...args)
                this.createdTime = new Date()
            }
            getTime() {
                console.log(`该对象的创建时间：${this.createdTime}`);
                return `该对象的创建时间：${this.createdTime}`
            }
        }
    }
    // 打印次数
    function logInfo(n: number) {
        return function (traget: Function) {
            traget.prototype.introduce = function () {
                for (let i = 0; i < n; i++) {
                    console.log(`我的名字：${this.name}，我的年龄：${this.age}`);
                }
            }
        }
    }
    @Demo
    @logTime
    @logInfo(3)
    class Person {//虽然是个普通得类，但此时已经具有各种功能了
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
        speak() {
            console.log('你好呀');

        }
    }
    const p1 = new Person('jack', 18)
    interface Person {
        introduce(): void
        getTime(): void
    }
    p1.introduce()
    console.log(p1.toString());
    p1.getTime()
}
```

### 属性装饰器
#### 基本语法
```typescript
{
    /*
    参数说明
    target:对于静态属性来说，值是类，对于实例属性来说值是类得原型对象
    propertyKey:属性名
    
    */
    function Demo(target: object, propertyKey: string) {
        console.log(target, propertyKey);
    }

    class Person {
        @Demo name: string
        @Demo age: number
        @Demo static school: string
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
    }
    const p1 = new Person('jack', 18)
}
```

#### 关于属性遮蔽
如下代码中：当构造器中的this.age=age试图在实例上赋值时，实际上是调用了原型上age属性的set方法。

```typescript
{
    class Person {
        name: string
        age: number
        static school: string
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
    }
    // 属性遮蔽，在原型上设置了age，后面实例化，在实例对象上this.age=age，添加age属性，
    // 添加之前会先检查是否有age属性，实例上没有，但会找到原型上得age，
    // 然后将原型上得age进行了修改，遮蔽了，它原来应该在实例上得属性age
    //如果是现在实例上添加，再去原型上添加，就不存在这样得问题
    let value = 99
    // 使用defineProperty
    Object.defineProperty(Person.prototype, 'age', {
        get() {
            return value
        },
        set(val) {
            value = val
        }
    })

    const p1 = new Person('jack', 18)
}
```



#### 应用举例
:::color1
需求:定义一个state属性装饰器,来监视属性的修改。

:::

```typescript
{
    // 声明一个装饰器函数 State，用于捕获数据的修改
    function State(target: object, propertyKey: string) {
        // 存储属性的内容值
        let key = `__${propertyKey}`
        // 使用Object.defineProperty替换类的原始属性
        // 重新定义属性,使其用自定义的getter,setter
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[key]
            },
            set(newValue: string) {
                console.log(`${propertyKey}的最新值为:${newValue},我要去更新页面,完成响应式了`);
                this[key] = newValue
            }
        })

    }
    class Person {
        name: string
        // 监视age的修改
        @State age: number
        static school: string
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
    }
    const p1 = new Person('jack', 19)
    p1.age=22
    console.log(p1);
    
}
```

### 方法装饰器
#### 基本语法
```typescript
{
    /*
    target:对于静态方法来说，值是类，对于实例方法来说值是原型对象
    propertyKey：方法的名称
    descriptor：方法的描述对象，其中value属性是被装饰的方法
    */
    function Demo(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(target);
        console.log(propertyKey);
        console.log(descriptor);
    }
    class Person {
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
        // Demo装饰实例方法
        @Demo speak() {
            console.log('你好呀');
        }
        // Demo装饰静态方法
        @Demo static isAdult(age: number) {
            return age >= 18
        }
    }
    const p1 = new Person('jack', 18)
}
```

#### 应用案例
:::color1
需求：在speak方法执行前做一些事，执行后做一些事

:::

```typescript
{
    function Logger(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        //    存储原始方法
        const originnal = descriptor.value
        // 替换原始方法
        descriptor.value = function (...args: any[]) {
            console.log(`${propertyKey}开始执行····`);
            // 执行原函数
            const res = originnal.call(this, ...args)
            console.log(`${propertyKey}执行完毕····`);
            return res
        }
    }
    class Person {
        name: string
        age: number
        constructor(name: string, age: number) {
            this.name = name
            this.age = age
        }
        @Logger speak(msg: string) {
            console.log(`你好呀,${msg}`);
        }
        @Logger static isAdult(age: number) {
            return age >= 18
        }
    }
    const p1 = new Person('jack', 18)
    p1.speak('hello')
}
```

### 访问器装饰器
#### 基本语法
```typescript
{
    /*
    target：
        对于实例访问器来说，值是【所属类的原型对象】
        对于静态访问器来说，值是【所属类】
    propertyKey：访问器名字
    descriptor：描述对象
    
    */
    function Demo(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(target);
        console.log(propertyKey);
        console.log(descriptor);
    }

    class Person {
        @Demo get address() {
            return '合肥庐阳区'
        }
        @Demo static get country() {
            return '中国'
        }
    }

}
```

#### 应用案例
:::color1
需求：对Weather类的temp属性的set访问器进行限制，设置的最低温度-50，最高温度50

:::

```typescript
{
    function RangeValidate(min: number, max: number) {
        return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
            // 保存原始的setter方法，以便在后续调用中使用
            const originalSetter = descriptor.set
            // 重写setter方法，加入范围验证逻辑
            descriptor.set = function (value: number) {
                // 检测修订的值是否在支挡的最小值和最大值之间
                if (value < min || value > max) {
                    // 如果值不在范围内，抛出错误
                    throw new Error(`${propertyKey}的值超出范围`)
                }
                if (originalSetter) {
                    originalSetter.call(this, value)
                }

            }
        }
    }
    class Weather {
        private _temp: number;//私有的，通过getter，setter读取，修改
        constructor(_temp: number) {
            this._temp = _temp
        }
        // 设置温度范围在-50到50度之间
        @RangeValidate(-50, 50)
        set temp(val) {
            this._temp = val
        }
        get temp() {
            return this._temp
        }
    }
    const w1 = new Weather(-55)
    // w1.temp=100

}
```

### 参数装饰器
#### 基本语法
```typescript
{
    /*
  target：
      对于实例访问器来说，值是【所属类的原型对象】
      对于静态访问器来说，值是【所属类】
  propertyKey：访问器名字
  descriptor：描述对象
  
  */
    function Demo(target: object, propertyKey: string, parameterIndex: number) {
        console.log(target);
        console.log(propertyKey);
        console.log(parameterIndex);
    }
    class Person {
        constructor(public name: string) { }
        speak(@Demo message1: any, message2: any) {
            console.log('hello');

        }
    }
}
```

#### 应用案例
:::color1
需求：定义方法装饰器Validate,同时搭配参数装饰器NotNumber,来对speak方法的参数类型进行限制。

:::

# 7、vue3+ts案例
## 7.1、todolist案例
## 7.2、贪吃蛇案例
