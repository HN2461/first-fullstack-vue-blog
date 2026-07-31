---
title: "BOM：浏览器对象模型"
slug: "js-bom-8c92d7da"
summary: ""
category: "AI版JS"
tags: []
status: "draft"
sortOrder: 260
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0ea"
originalSlug: "js-bom-8c92d7da"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第14章　BOM：浏览器对象模型

BOM（Browser Object Model，浏览器对象模型）提供了与浏览器窗口交互的接口，包括窗口控制、定时器、位置信息、历史记录、本地存储等功能。本章将深入学习BOM的各个组件及其在实际开发中的应用。

## 14.1 window对象

window对象是BOM的核心，代表浏览器窗口，也是JavaScript的全局对象。

### 全局对象特性

window对象作为全局对象的特殊性：

```javascript
/**
 * window对象特性示例
 */
const WindowObjectExamples = {
    /**
     * 全局对象特性
     */
    globalObjectFeatures() {
        console.log('=== 全局对象特性 ===');
        
        if (typeof window === 'undefined') {
            console.log('非浏览器环境');
            return;
        }
        
        // 全局变量和window属性的关系
        var globalVar = '全局变量';
        window.windowProp = 'window属性';
        
        console.log('访问全局变量:');
        console.log('globalVar:', globalVar);
        console.log('window.globalVar:', window.globalVar);
        console.log('this.globalVar (非严格模式):', this.globalVar);
        
        console.log('访问window属性:');
        console.log('windowProp:', typeof windowProp !== 'undefined' ? windowProp : 'undefined');
        console.log('window.windowProp:', window.windowProp);
        
        // let、const声明的变量不会成为window属性
        let letVar = 'let变量';
        const constVar = 'const变量';
        
        console.log('let/const变量特性:');
        console.log('window.letVar:', window.letVar); // undefined
        console.log('window.constVar:', window.constVar); // undefined
        
        // 函数声明也会成为window的方法
        function globalFunction() {
            return '全局函数';
        }
        
        console.log('全局函数:');
        console.log('globalFunction():', globalFunction());
        console.log('window.globalFunction():', window.globalFunction());
        
        // 检查变量是否存在
        console.log('变量存在性检查:');
        console.log('typeof undefinedVar:', typeof undefinedVar);
        console.log('"undefinedVar" in window:', 'undefinedVar' in window);
    },
    
    /**
     * window对象的基本属性
     */
    windowProperties() {
        console.log('=== window对象基本属性 ===');
        
        if (typeof window === 'undefined') return;
        
        // 窗口尺寸相关
        console.log('窗口尺寸信息:');
        console.log('innerWidth:', window.innerWidth);
        console.log('innerHeight:', window.innerHeight);
        console.log('outerWidth:', window.outerWidth);
        console.log('outerHeight:', window.outerHeight);
        console.log('screen.width:', window.screen.width);
        console.log('screen.height:', window.screen.height);
        console.log('screen.availWidth:', window.screen.availWidth);
        console.log('screen.availHeight:', window.screen.availHeight);
        
        // 窗口位置
        console.log('窗口位置信息:');
        console.log('screenX:', window.screenX);
        console.log('screenY:', window.screenY);
        console.log('screenLeft:', window.screenLeft);
        console.log('screenTop:', window.screenTop);
        
        // 滚动位置
        console.log('滚动位置:');
        console.log('pageXOffset:', window.pageXOffset);
        console.log('pageYOffset:', window.pageYOffset);
        console.log('scrollX:', window.scrollX);
        console.log('scrollY:', window.scrollY);
        
        // 设备信息
        console.log('设备信息:');
        console.log('devicePixelRatio:', window.devicePixelRatio);
        
        // 浏览器信息
        console.log('浏览器信息:');
        console.log('navigator.userAgent:', navigator.userAgent);
        console.log('navigator.language:', navigator.language);
        console.log('navigator.languages:', navigator.languages);
        console.log('navigator.platform:', navigator.platform);
        console.log('navigator.cookieEnabled:', navigator.cookieEnabled);
        console.log('navigator.onLine:', navigator.onLine);
    },
    
    /**
     * window对象的方法
     */
    windowMethods() {
        console.log('=== window对象方法 ===');
        
        if (typeof window === 'undefined') return;
        
        // 对话框方法
        console.log('对话框方法演示:');
        
        // alert (阻塞式)
        function showAlert() {
            alert('这是一个警告框');
        }
        
        // confirm (返回boolean)
        function showConfirm() {
            const result = confirm('确定要继续吗？');
            console.log('confirm结果:', result);
            return result;
        }
        
        // prompt (返回字符串或null)
        function showPrompt() {
            const result = prompt('请输入您的姓名:', '默认值');
            console.log('prompt结果:', result);
            return result;
        }
        
        // 窗口操作方法
        console.log('窗口操作方法:');
        
        // 打开新窗口
        function openNewWindow() {
            const newWindow = window.open(
                'about:blank',
                'newWindow',
                'width=400,height=300,left=100,top=100'
            );
            
            if (newWindow) {
                newWindow.document.write('<h1>新窗口</h1><p>这是一个新打开的窗口</p>');
                
                // 3秒后关闭
                setTimeout(() => {
                    newWindow.close();
                }, 3000);
            }
        }
        
        // 滚动方法
        function scrollMethods() {
            console.log('滚动方法演示:');
            
            // 滚动到指定位置
            window.scrollTo(0, 100);
            
            setTimeout(() => {
                // 相对滚动
                window.scrollBy(0, 50);
            }, 1000);
            
            setTimeout(() => {
                // 平滑滚动
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }, 2000);
        }
        
        // 焦点方法
        function focusMethods() {
            console.log('焦点方法:');
            
            // 获取焦点
            window.focus();
            
            // 失去焦点 (通常被浏览器阻止)
            // window.blur();
        }
        
        // 为演示创建按钮
        if (document.body) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                position: fixed; top: 10px; right: 10px; z-index: 9999;
                background: white; padding: 10px; border: 1px solid #ccc;
                border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            
            const buttons = [
                { text: '警告框', handler: showAlert },
                { text: '确认框', handler: showConfirm },
                { text: '输入框', handler: showPrompt },
                { text: '新窗口', handler: openNewWindow },
                { text: '滚动演示', handler: scrollMethods }
            ];
            
            buttons.forEach(({ text, handler }) => {
                const button = document.createElement('button');
                button.textContent = text;
                button.style.cssText = `
                    display: block; width: 100%; margin: 2px 0;
                    padding: 5px; border: 1px solid #ddd;
                    background: #f9f9f9; cursor: pointer;
                `;
                button.addEventListener('click', handler);
                buttonContainer.appendChild(button);
            });
            
            document.body.appendChild(buttonContainer);
            
            // 5秒后自动移除
            setTimeout(() => {
                if (document.body.contains(buttonContainer)) {
                    document.body.removeChild(buttonContainer);
                }
            }, 30000);
        }
        
        console.log('window方法演示按钮已添加到页面右上角');
    }
};

WindowObjectExamples.globalObjectFeatures();
WindowObjectExamples.windowProperties();
WindowObjectExamples.windowMethods();
```

### 窗口事件处理

window对象的重要事件：

```javascript
/**
 * 窗口事件处理示例
 */
const WindowEventsExamples = {
    /**
     * 生命周期事件
     */
    lifecycleEvents() {
        console.log('=== 窗口生命周期事件 ===');
        
        if (typeof window === 'undefined') return;
        
        // 页面加载事件
        window.addEventListener('load', () => {
            console.log('window load: 页面和所有资源加载完成');
        });
        
        window.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded: DOM构建完成');
        });
        
        // 页面卸载事件
        window.addEventListener('beforeunload', (event) => {
            console.log('beforeunload: 页面即将卸载');
            
            // 在某些情况下显示确认对话框
            if (Math.random() > 0.9) { // 偶尔触发，避免干扰
                event.returnValue = '确定要离开吗？';
                return '确定要离开吗？';
            }
        });
        
        window.addEventListener('unload', () => {
            console.log('unload: 页面卸载');
            // 通常用于清理工作
        });
        
        // 页面显示/隐藏事件
        window.addEventListener('pageshow', (event) => {
            console.log('pageshow: 页面显示', {
                persisted: event.persisted // 是否从缓存恢复
            });
        });
        
        window.addEventListener('pagehide', (event) => {
            console.log('pagehide: 页面隐藏', {
                persisted: event.persisted // 是否会被缓存
            });
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            console.log('visibilitychange:', {
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
            
            if (document.hidden) {
                console.log('页面变为不可见 (切换标签页、最小化等)');
            } else {
                console.log('页面变为可见');
            }
        });
    },
    
    /**
     * 尺寸和位置事件
     */
    resizeAndScrollEvents() {
        console.log('=== 尺寸和位置事件 ===');
        
        if (typeof window === 'undefined') return;
        
        // 窗口大小改变事件
        let resizeTimer;
        window.addEventListener('resize', (event) => {
            // 防抖处理，避免频繁触发
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('window resize:', {
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                    outerWidth: window.outerWidth,
                    outerHeight: window.outerHeight
                });
                
                // 响应式处理示例
                this.handleResponsive();
            }, 150);
        });
        
        // 滚动事件
        let scrollTimer;
        window.addEventListener('scroll', (event) => {
            // 节流处理
            if (!scrollTimer) {
                scrollTimer = setTimeout(() => {
                    console.log('window scroll:', {
                        scrollX: window.scrollX,
                        scrollY: window.scrollY,
                        pageXOffset: window.pageXOffset,
                        pageYOffset: window.pageYOffset
                    });
                    
                    // 滚动处理示例
                    this.handleScroll();
                    
                    scrollTimer = null;
                }, 100);
            }
        });
        
        // 屏幕方向改变事件
        if ('onorientationchange' in window) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => { // 延迟获取准确的尺寸
                    console.log('orientationchange:', {
                        orientation: window.orientation,
                        innerWidth: window.innerWidth,
                        innerHeight: window.innerHeight
                    });
                }, 100);
            });
        }
    },
    
    /**
     * 网络和焦点事件
     */
    networkAndFocusEvents() {
        console.log('=== 网络和焦点事件 ===');
        
        if (typeof window === 'undefined') return;
        
        // 网络状态事件
        window.addEventListener('online', () => {
            console.log('网络连接恢复');
            this.showNetworkStatus('在线', 'green');
        });
        
        window.addEventListener('offline', () => {
            console.log('网络连接断开');
            this.showNetworkStatus('离线', 'red');
        });
        
        // 窗口焦点事件
        window.addEventListener('focus', () => {
            console.log('窗口获得焦点');
        });
        
        window.addEventListener('blur', () => {
            console.log('窗口失去焦点');
        });
        
        // 错误事件
        window.addEventListener('error', (event) => {
            console.log('全局错误捕获:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.log('未处理的Promise拒绝:', {
                reason: event.reason,
                promise: event.promise
            });
            
            // 阻止默认的错误处理
            // event.preventDefault();
        });
        
        console.log('当前网络状态:', navigator.onLine ? '在线' : '离线');
    },
    
    /**
     * 响应式处理
     */
    handleResponsive() {
        const width = window.innerWidth;
        
        let deviceType;
        if (width < 768) {
            deviceType = 'mobile';
        } else if (width < 1024) {
            deviceType = 'tablet';
        } else {
            deviceType = 'desktop';
        }
        
        console.log('设备类型判断:', deviceType);
        
        // 可以根据设备类型调整布局
        document.documentElement.setAttribute('data-device', deviceType);
    },
    
    /**
     * 滚动处理
     */
    handleScroll() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        console.log(`滚动进度: ${Math.round(scrollPercentage)}%`);
        
        // 滚动到顶部/底部的检测
        if (scrollTop === 0) {
            console.log('滚动到顶部');
        } else if (scrollTop + windowHeight >= documentHeight - 10) {
            console.log('滚动到底部');
        }
    },
    
    /**
     * 显示网络状态
     */
    showNetworkStatus(status, color) {
        // 创建状态指示器
        let indicator = document.getElementById('network-status');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'network-status';
            indicator.style.cssText = `
                position: fixed; top: 10px; left: 10px; z-index: 10000;
                padding: 8px 15px; border-radius: 4px; color: white;
                font-size: 12px; font-weight: bold;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `网络状态: ${status}`;
        indicator.style.backgroundColor = color;
        
        // 3秒后淡出
        setTimeout(() => {
            indicator.style.opacity = '0.3';
        }, 3000);
    }
};

WindowEventsExamples.lifecycleEvents();
WindowEventsExamples.resizeAndScrollEvents();
WindowEventsExamples.networkAndFocusEvents();
```

---

## 14.2 定时器

JavaScript提供了多种定时器机制，用于延迟执行和周期性执行代码。

### 基础定时器

setTimeout和setInterval的使用：

```javascript
/**
 * 定时器示例
 */
const TimerExamples = {
    /**
     * 基础定时器使用
     */
    basicTimers() {
        console.log('=== 基础定时器 ===');
        
        // setTimeout - 延迟执行
        console.log('设置setTimeout，2秒后执行');
        const timeoutId = setTimeout(() => {
            console.log('setTimeout执行: 2秒已过');
        }, 2000);
        
        // 取消setTimeout
        const cancelTimeoutId = setTimeout(() => {
            console.log('这条消息不会显示');
        }, 5000);
        
        setTimeout(() => {
            clearTimeout(cancelTimeoutId);
            console.log('5秒timeout已取消');
        }, 1000);
        
        // setInterval - 周期性执行
        console.log('设置setInterval，每1秒执行一次');
        let count = 0;
        const intervalId = setInterval(() => {
            count++;
            console.log(`setInterval执行第${count}次`);
            
            // 5次后停止
            if (count >= 5) {
                clearInterval(intervalId);
                console.log('setInterval已停止');
            }
        }, 1000);
        
        // 带参数的定时器
        setTimeout((message, number) => {
            console.log('带参数的定时器:', message, number);
        }, 3000, 'Hello', 42);
        
        console.log('定时器设置完成');
    },
    
    /**
     * 定时器管理
     */
    timerManagement() {
        console.log('=== 定时器管理 ===');
        
        // 定时器管理类
        class TimerManager {
            constructor() {
                this.timers = new Map();
                this.nextId = 1;
            }
            
            // 添加setTimeout
            addTimeout(callback, delay, name = null) {
                const id = this.nextId++;
                const timerId = setTimeout(() => {
                    callback();
                    this.timers.delete(id);
                }, delay);
                
                this.timers.set(id, {
                    type: 'timeout',
                    timerId,
                    name: name || `timeout_${id}`,
                    delay,
                    callback,
                    createdAt: Date.now()
                });
                
                return id;
            }
            
            // 添加setInterval
            addInterval(callback, interval, name = null) {
                const id = this.nextId++;
                const timerId = setInterval(callback, interval);
                
                this.timers.set(id, {
                    type: 'interval',
                    timerId,
                    name: name || `interval_${id}`,
                    interval,
                    callback,
                    createdAt: Date.now()
                });
                
                return id;
            }
            
            // 清除特定定时器
            clear(id) {
                const timer = this.timers.get(id);
                if (timer) {
                    if (timer.type === 'timeout') {
                        clearTimeout(timer.timerId);
                    } else {
                        clearInterval(timer.timerId);
                    }
                    this.timers.delete(id);
                    return true;
                }
                return false;
            }
            
            // 清除所有定时器
            clearAll() {
                for (let [id, timer] of this.timers) {
                    if (timer.type === 'timeout') {
                        clearTimeout(timer.timerId);
                    } else {
                        clearInterval(timer.timerId);
                    }
                }
                this.timers.clear();
            }
            
            // 获取定时器信息
            getInfo() {
                const info = [];
                for (let [id, timer] of this.timers) {
                    info.push({
                        id,
                        name: timer.name,
                        type: timer.type,
                        delay: timer.delay || timer.interval,
                        age: Date.now() - timer.createdAt
                    });
                }
                return info;
            }
            
            // 按名称清除
            clearByName(name) {
                let cleared = 0;
                for (let [id, timer] of this.timers) {
                    if (timer.name === name) {
                        this.clear(id);
                        cleared++;
                    }
                }
                return cleared;
            }
        }
        
        // 使用定时器管理器
        const tm = new TimerManager();
        
        // 添加一些定时器
        const id1 = tm.addTimeout(() => {
            console.log('管理的timeout执行');
        }, 2000, 'test-timeout');
        
        const id2 = tm.addInterval(() => {
            console.log('管理的interval执行');
        }, 1000, 'test-interval');
        
        // 查看定时器信息
        setTimeout(() => {
            console.log('定时器信息:', tm.getInfo());
        }, 1500);
        
        // 5秒后清除所有定时器
        setTimeout(() => {
            tm.clearAll();
            console.log('所有定时器已清除');
        }, 5000);
        
        window.timerManager = tm; // 暴露到全局，方便调试
    },
    
    /**
     * 高精度定时器
     */
    precisionTimers() {
        console.log('=== 高精度定时器 ===');
        
        // requestAnimationFrame - 动画帧
        let frameCount = 0;
        let startTime = performance.now();
        
        function animate(currentTime) {
            frameCount++;
            
            if (frameCount % 60 === 0) { // 每60帧显示一次
                const elapsed = currentTime - startTime;
                const fps = (frameCount / elapsed) * 1000;
                console.log(`帧数: ${frameCount}, FPS: ${fps.toFixed(2)}`);
            }
            
            if (frameCount < 300) { // 运行5秒 (假设60fps)
                requestAnimationFrame(animate);
            } else {
                console.log('动画结束');
            }
        }
        
        console.log('开始requestAnimationFrame动画');
        requestAnimationFrame(animate);
        
        // performance.now() - 高精度时间戳
        const preciseStart = performance.now();
        setTimeout(() => {
            const preciseEnd = performance.now();
            console.log(`精确耗时: ${preciseEnd - preciseStart} 毫秒`);
        }, 100);
        
        // 使用Web Workers的定时器 (如果支持)
        if (typeof Worker !== 'undefined') {
            try {
                // 创建Web Worker用于精确定时
                const workerCode = `
                    let interval;
                    self.onmessage = function(e) {
                        if (e.data.action === 'start') {
                            interval = setInterval(() => {
                                self.postMessage({
                                    type: 'tick',
                                    timestamp: Date.now()
                                });
                            }, e.data.interval);
                        } else if (e.data.action === 'stop') {
                            clearInterval(interval);
                        }
                    };
                `;
                
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                
                let tickCount = 0;
                worker.onmessage = (e) => {
                    if (e.data.type === 'tick') {
                        tickCount++;
                        if (tickCount <= 5) {
                            console.log(`Worker定时器tick ${tickCount}:`, e.data.timestamp);
                        }
                        
                        if (tickCount >= 10) {
                            worker.postMessage({ action: 'stop' });
                            worker.terminate();
                        }
                    }
                };
                
                worker.postMessage({ action: 'start', interval: 500 });
                console.log('Web Worker定时器已启动');
                
            } catch (e) {
                console.log('Web Worker不可用:', e.message);
            }
        }
    }
};

TimerExamples.basicTimers();
TimerExamples.timerManagement();
TimerExamples.precisionTimers();
```

---

## 14.3 location、history

浏览器的位置信息和历史记录管理。

### location对象

URL信息的获取和操作：

```javascript
/**
 * location对象示例
 */
const LocationExamples = {
    /**
     * location属性
     */
    locationProperties() {
        console.log('=== location对象属性 ===');
        
        if (typeof location === 'undefined') return;
        
        console.log('完整URL信息:');
        console.log('href:', location.href);
        console.log('protocol:', location.protocol);
        console.log('host:', location.host);
        console.log('hostname:', location.hostname);
        console.log('port:', location.port);
        console.log('pathname:', location.pathname);
        console.log('search:', location.search);
        console.log('hash:', location.hash);
        console.log('origin:', location.origin);
        
        // URL解析示例
        const exampleUrl = 'https://example.com:8080/path/page?param=value&foo=bar#section';
        console.log('\n示例URL解析:', exampleUrl);
        
        // 使用URL构造函数解析
        try {
            const url = new URL(exampleUrl);
            console.log('URL对象解析:');
            console.log('protocol:', url.protocol);
            console.log('hostname:', url.hostname);
            console.log('port:', url.port);
            console.log('pathname:', url.pathname);
            console.log('search:', url.search);
            console.log('hash:', url.hash);
            
            // URLSearchParams处理查询参数
            const params = new URLSearchParams(url.search);
            console.log('查询参数:');
            for (let [key, value] of params) {
                console.log(`  ${key}: ${value}`);
            }
        } catch (e) {
            console.log('URL解析错误:', e.message);
        }
    },
    
    /**
     * location方法
     */
    locationMethods() {
        console.log('=== location方法 ===');
        
        if (typeof location === 'undefined') return;
        
        // 页面跳转方法
        function demonstrateNavigation() {
            console.log('页面导航方法演示:');
            
            // assign() - 加载新页面（可后退）
            function navigateAssign() {
                console.log('使用assign跳转');
                // location.assign('https://example.com');
            }
            
            // replace() - 替换当前页面（不可后退）
            function navigateReplace() {
                console.log('使用replace跳转');
                // location.replace('https://example.com');
            }
            
            // reload() - 重新加载页面
            function reloadPage() {
                console.log('重新加载页面');
                // location.reload(true); // 强制从服务器重新加载
            }
            
            // 直接设置href
            function setHref() {
                console.log('设置href');
                // location.href = 'https://example.com';
            }
            
            return { navigateAssign, navigateReplace, reloadPage, setHref };
        }
        
        const navMethods = demonstrateNavigation();
        console.log('导航方法已定义（注释防止实际跳转）');
    }
};

LocationExamples.locationProperties();
LocationExamples.locationMethods();
```

---

## 14.4 localStorage / sessionStorage / cookie

Web存储机制的完整应用。

### 本地存储机制

```javascript
/**
 * 存储管理示例
 */
const StorageExamples = {
    /**
     * localStorage操作
     */
    localStorageOperations() {
        console.log('=== localStorage操作 ===');
        
        if (typeof localStorage === 'undefined') return;
        
        // 基础操作
        localStorage.setItem('username', 'Alice');
        localStorage.setItem('preferences', JSON.stringify({
            theme: 'dark',
            language: 'zh-CN'
        }));
        
        console.log('存储数据:');
        console.log('username:', localStorage.getItem('username'));
        
        const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');
        console.log('preferences:', prefs);
        
        // 遍历localStorage
        console.log('所有localStorage数据:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`  ${key}: ${value}`);
        }
        
        // 删除操作
        localStorage.removeItem('username');
        console.log('删除username后length:', localStorage.length);
    },
    
    /**
     * 存储管理类
     */
    storageManager() {
        console.log('=== 存储管理类 ===');
        
        class StorageManager {
            constructor(storage = localStorage) {
                this.storage = storage;
            }
            
            // 设置值（自动JSON序列化）
            set(key, value, expiry = null) {
                const data = {
                    value: value,
                    timestamp: Date.now(),
                    expiry: expiry ? Date.now() + expiry : null
                };
                
                try {
                    this.storage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (e) {
                    console.error('存储失败:', e);
                    return false;
                }
            }
            
            // 获取值（自动JSON反序列化）
            get(key, defaultValue = null) {
                try {
                    const item = this.storage.getItem(key);
                    if (!item) return defaultValue;
                    
                    const data = JSON.parse(item);
                    
                    // 检查过期时间
                    if (data.expiry && Date.now() > data.expiry) {
                        this.remove(key);
                        return defaultValue;
                    }
                    
                    return data.value;
                } catch (e) {
                    console.error('读取失败:', e);
                    return defaultValue;
                }
            }
            
            // 删除键
            remove(key) {
                this.storage.removeItem(key);
            }
            
            // 清空所有数据
            clear() {
                this.storage.clear();
            }
            
            // 获取所有键
            keys() {
                const keys = [];
                for (let i = 0; i < this.storage.length; i++) {
                    keys.push(this.storage.key(i));
                }
                return keys;
            }
            
            // 获取存储大小估算
            getSize() {
                let total = 0;
                for (let key in this.storage) {
                    if (this.storage.hasOwnProperty(key)) {
                        total += this.storage[key].length + key.length;
                    }
                }
                return total;
            }
            
            // 清理过期数据
            cleanup() {
                const now = Date.now();
                const keysToRemove = [];
                
                for (let i = 0; i < this.storage.length; i++) {
                    const key = this.storage.key(i);
                    try {
                        const data = JSON.parse(this.storage.getItem(key));
                        if (data.expiry && now > data.expiry) {
                            keysToRemove.push(key);
                        }
                    } catch (e) {
                        // 忽略解析错误的数据
                    }
                }
                
                keysToRemove.forEach(key => this.remove(key));
                return keysToRemove.length;
            }
        }
        
        // 使用示例
        const storage = new StorageManager();
        
        storage.set('user', { name: 'Bob', age: 30 });
        storage.set('temp', 'temporary data', 5000); // 5秒后过期
        
        console.log('存储的用户:', storage.get('user'));
        console.log('存储大小:', storage.getSize(), 'bytes');
        
        setTimeout(() => {
            console.log('5秒后temp值:', storage.get('temp', 'expired'));
            console.log('清理过期数据:', storage.cleanup(), '个');
        }, 6000);
        
        window.storageManager = storage; // 暴露到全局
    }
};

StorageExamples.localStorageOperations();
StorageExamples.storageManager();
```

---

## 14.5 浏览器能力检测

现代浏览器特性检测和兼容性处理。

### 特性检测

```javascript
/**
 * 浏览器能力检测
 */
const BrowserCapabilities = {
    /**
     * 基础特性检测
     */
    detectFeatures() {
        console.log('=== 基础特性检测 ===');
        
        const features = {
            // 存储支持
            localStorage: typeof Storage !== 'undefined' && 'localStorage' in window,
            sessionStorage: typeof Storage !== 'undefined' && 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window,
            
            // 网络API
            fetch: typeof fetch !== 'undefined',
            websocket: typeof WebSocket !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            
            // 媒体API
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            webRTC: 'RTCPeerConnection' in window,
            
            // 图形API
            canvas: !!document.createElement('canvas').getContext,
            webgl: !!document.createElement('canvas').getContext('webgl'),
            
            // 高级API
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            webWorkers: typeof Worker !== 'undefined',
            
            // 触摸支持
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            
            // CSS特性
            flexbox: this.supportsCSSProperty('display', 'flex'),
            grid: this.supportsCSSProperty('display', 'grid'),
            customProperties: this.supportsCSSProperty('--custom', 'value')
        };
        
        console.log('浏览器特性支持:');
        Object.entries(features).forEach(([feature, supported]) => {
            console.log(`  ${feature}: ${supported ? '✅' : '❌'}`);
        });
        
        return features;
    },
    
    /**
     * CSS属性支持检测
     */
    supportsCSSProperty(property, value) {
        const element = document.createElement('div');
        element.style[property] = value;
        return element.style[property] === value;
    },
    
    /**
     * 浏览器信息检测
     */
    detectBrowser() {
        console.log('=== 浏览器信息检测 ===');
        
        const ua = navigator.userAgent;
        const info = {
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints
        };
        
        // 简单的浏览器检测
        const browsers = {
            chrome: /Chrome/.test(ua) && !/Edge/.test(ua),
            firefox: /Firefox/.test(ua),
            safari: /Safari/.test(ua) && !/Chrome/.test(ua),
            edge: /Edge/.test(ua),
            ie: /Trident/.test(ua)
        };
        
        const currentBrowser = Object.keys(browsers).find(b => browsers[b]) || 'unknown';
        
        console.log('浏览器信息:', info);
        console.log('检测到的浏览器:', currentBrowser);
        
        return { info, browser: currentBrowser };
    }
};

BrowserCapabilities.detectFeatures();
BrowserCapabilities.detectBrowser();
```

---

**本章总结**

第14章深入探讨了BOM浏览器对象模型的核心知识：

1. **window对象**：
   - 全局对象特性和作用域管理
   - 窗口属性、方法和事件处理
   - 网络状态和响应式处理

2. **定时器机制**：
   - setTimeout和setInterval的使用
   - TimerManager定时器管理类
   - 高精度定时器和动画帧

3. **位置和历史**：
   - location对象的URL操作
   - history对象的导航管理

4. **存储机制**：
   - localStorage和sessionStorage
   - StorageManager存储管理类
   - 数据过期和清理机制

5. **能力检测**：
   - 现代浏览器特性检测
   - 兼容性处理和降级方案

**关键要点**：
- BOM提供了与浏览器环境交互的完整接口
- 定时器管理对性能和资源控制至关重要
- 本地存储需要考虑容量限制和过期机制
- 特性检测比用户代理检测更可靠

**下一章预告**

第15章将学习异步编程基础，包括同步与异步的差异、回调函数、任务队列与事件循环、宏任务与微任务等现代JavaScript异步编程的核心概念。
