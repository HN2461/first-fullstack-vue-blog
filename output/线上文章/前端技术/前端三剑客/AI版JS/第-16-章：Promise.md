---
title: "第 16 章：Promise"
slug: "js-promise-30f7cae5"
summary: "整理 Promise 状态、then、catch、finally、链式调用、并发方法、异常处理和常见使用场景。"
category: "AI版JS"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "AI版JS"
tags: []
status: "published"
sortOrder: 170
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0ee"
originalSlug: "js-promise-30f7cae5"
originalStatus: "published"
publishedAt: "2026-01-25T13:23:07.488Z"
updatedAt: "2026-07-31T11:16:23.416Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 16 章：Promise

Promise是ES6引入的异步编程解决方案，它以更优雅的方式处理异步操作，解决了回调地狱问题。Promise代表一个异步操作的最终完成（或失败）及其结果值。

## 16.1 Promise状态

理解Promise的三种状态和状态转换机制。

### Promise基础概念

Promise的核心状态管理：

```javascript
/**
 * Promise状态示例
 */
const PromiseStateExamples = {
    /**
     * Promise三种状态
     */
    promiseStates() {
        console.log('=== Promise三种状态 ===');
        
        // pending（待定）- 初始状态
        const pendingPromise = new Promise((resolve, reject) => {
            console.log('Promise创建时为pending状态');
            // 不调用resolve或reject，保持pending状态
        });
        
        console.log('pending Promise:', pendingPromise);
        
        // fulfilled（已兑现）- 操作成功完成
        const fulfilledPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('操作成功完成');
            }, 1000);
        });
        
        fulfilledPromise.then(value => {
            console.log('fulfilled状态，结果:', value);
        });
        
        // rejected（已拒绝）- 操作失败
        const rejectedPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('操作失败'));
            }, 1500);
        });
        
        rejectedPromise.catch(error => {
            console.log('rejected状态，错误:', error.message);
        });
        
        // 状态特性说明
        setTimeout(() => {
            console.log('Promise状态特性:');
            console.log('1. 状态只能从pending转换为fulfilled或rejected');
            console.log('2. 状态一旦改变就不能再次改变（immutable）');
            console.log('3. fulfilled和rejected统称为settled（已敲定）');
        }, 2000);
    },
    
    /**
     * 状态检测和监听
     */
    stateDetectionAndMonitoring() {
        console.log('=== 状态检测和监听 ===');
        
        // Promise状态监听器
        class PromiseMonitor {
            constructor() {
                this.promises = new Map();
            }
            
            // 添加Promise监听
            monitor(promise, name) {
                console.log(`[${name}] 开始监听Promise`);
                
                const startTime = Date.now();
                
                // 记录Promise信息
                this.promises.set(name, {
                    promise,
                    startTime,
                    status: 'pending'
                });
                
                // 监听状态变化
                promise.then(
                    (value) => {
                        const endTime = Date.now();
                        const duration = endTime - startTime;
                        
                        console.log(`[${name}] ✅ fulfilled (${duration}ms):`, value);
                        
                        const info = this.promises.get(name);
                        info.status = 'fulfilled';
                        info.value = value;
                        info.duration = duration;
                    },
                    (reason) => {
                        const endTime = Date.now();
                        const duration = endTime - startTime;
                        
                        console.log(`[${name}] ❌ rejected (${duration}ms):`, reason);
                        
                        const info = this.promises.get(name);
                        info.status = 'rejected';
                        info.reason = reason;
                        info.duration = duration;
                    }
                );
                
                return promise;
            }
            
            // 获取监听报告
            getReport() {
                const report = {};
                for (let [name, info] of this.promises) {
                    report[name] = {
                        status: info.status,
                        duration: info.duration || Date.now() - info.startTime,
                        result: info.value || info.reason
                    };
                }
                return report;
            }
        }
        
        const monitor = new PromiseMonitor();
        
        // 创建不同的Promise进行监听
        const quickPromise = new Promise(resolve => {
            setTimeout(() => resolve('快速完成'), 300);
        });
        
        const slowPromise = new Promise(resolve => {
            setTimeout(() => resolve('慢速完成'), 800);
        });
        
        const errorPromise = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('发生错误')), 500);
        });
        
        // 开始监听
        monitor.monitor(quickPromise, 'quick');
        monitor.monitor(slowPromise, 'slow');
        monitor.monitor(errorPromise, 'error');
        
        // 定期输出监听报告
        const reportInterval = setInterval(() => {
            console.log('监听报告:', monitor.getReport());
        }, 400);
        
        // 5秒后停止报告
        setTimeout(() => {
            clearInterval(reportInterval);
            console.log('最终监听报告:', monitor.getReport());
        }, 1200);
    },
    
    /**
     * Promise构造器详解
     */
    promiseConstructorDetails() {
        console.log('=== Promise构造器详解 ===');
        
        // executor函数的执行特性
        console.log('executor函数执行特性:');
        
        const promise1 = new Promise((resolve, reject) => {
            console.log('1. executor函数立即同步执行');
            
            // resolve和reject都是函数
            console.log('2. resolve类型:', typeof resolve);
            console.log('3. reject类型:', typeof reject);
            
            // 模拟异步操作
            const random = Math.random();
            if (random > 0.5) {
                setTimeout(() => {
                    resolve({ success: true, data: random });
                }, 300);
            } else {
                setTimeout(() => {
                    reject(new Error(`失败，随机数: ${random}`));
                }, 300);
            }
        });
        
        console.log('4. Promise构造完成，返回Promise实例');
        
        promise1.then(
            result => console.log('成功处理:', result),
            error => console.log('错误处理:', error.message)
        );
        
        // executor中抛出异常的处理
        const promiseWithError = new Promise((resolve, reject) => {
            console.log('executor中抛出异常的情况:');
            
            // 同步抛出异常会自动调用reject
            if (Math.random() > 0.8) {
                throw new Error('executor中的同步错误');
            }
            
            resolve('正常执行');
        });
        
        promiseWithError.then(
            result => console.log('无异常:', result),
            error => console.log('捕获到executor异常:', error.message)
        );
        
        // 多次调用resolve/reject的行为
        const multipleCallPromise = new Promise((resolve, reject) => {
            console.log('多次调用resolve/reject测试:');
            
            resolve('第一次resolve'); // 只有这个会生效
            resolve('第二次resolve'); // 被忽略
            reject(new Error('之后的reject')); // 被忽略
            
            console.log('多次调用完成，只有第一次生效');
        });
        
        multipleCallPromise.then(
            result => console.log('最终结果:', result)
        );
    }
};

PromiseStateExamples.promiseStates();
setTimeout(() => PromiseStateExamples.stateDetectionAndMonitoring(), 3000);
setTimeout(() => PromiseStateExamples.promiseConstructorDetails(), 6000);
```

### Promise创建方式

不同的Promise创建模式：

```javascript
/**
 * Promise创建方式示例
 */
const PromiseCreationExamples = {
    /**
     * 静态方法创建Promise
     */
    staticMethods() {
        console.log('=== 静态方法创建Promise ===');
        
        // Promise.resolve() - 创建已解决的Promise
        const resolvedPromise1 = Promise.resolve('立即解决的值');
        const resolvedPromise2 = Promise.resolve({ id: 1, name: 'data' });
        
        resolvedPromise1.then(value => {
            console.log('Promise.resolve结果:', value);
        });
        
        // Promise.resolve处理thenable对象
        const thenable = {
            then(onFulfilled, onRejected) {
                setTimeout(() => {
                    onFulfilled('thenable对象的值');
                }, 500);
            }
        };
        
        const promiseFromThenable = Promise.resolve(thenable);
        promiseFromThenable.then(value => {
            console.log('从thenable创建:', value);
        });
        
        // Promise.reject() - 创建已拒绝的Promise
        const rejectedPromise = Promise.reject(new Error('立即拒绝的错误'));
        
        rejectedPromise.catch(error => {
            console.log('Promise.reject结果:', error.message);
        });
        
        // Promise.resolve处理已有Promise
        const existingPromise = new Promise(resolve => {
            setTimeout(() => resolve('原始Promise'), 300);
        });
        
        const wrappedPromise = Promise.resolve(existingPromise);
        console.log('包装Promise === 原Promise:', wrappedPromise === existingPromise);
        
        wrappedPromise.then(value => {
            console.log('包装后的Promise:', value);
        });
    },
    
    /**
     * 工厂函数模式
     */
    factoryPatterns() {
        console.log('=== 工厂函数模式 ===');
        
        // 延迟Promise工厂
        function delay(ms, value) {
            return new Promise(resolve => {
                setTimeout(() => resolve(value), ms);
            });
        }
        
        // 超时Promise工厂
        function timeout(ms, reason = '操作超时') {
            return new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error(reason)), ms);
            });
        }
        
        // 随机成功/失败Promise工厂
        function randomPromise(successRate = 0.5, delay = 1000) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() < successRate) {
                        resolve({ success: true, timestamp: Date.now() });
                    } else {
                        reject(new Error('随机失败'));
                    }
                }, delay);
            });
        }
        
        // 可重试的Promise工厂
        function retryablePromise(operation, maxRetries = 3) {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                
                function attempt() {
                    attempts++;
                    
                    operation()
                        .then(resolve)
                        .catch(error => {
                            if (attempts >= maxRetries) {
                                reject(new Error(`失败重试${maxRetries}次: ${error.message}`));
                            } else {
                                console.log(`第${attempts}次尝试失败，重试中...`);
                                setTimeout(attempt, 1000 * attempts); // 递增延迟
                            }
                        });
                }
                
                attempt();
            });
        }
        
        // 使用工厂函数
        console.log('使用delay工厂:');
        delay(500, '延迟结果').then(console.log);
        
        console.log('使用随机Promise工厂:');
        randomPromise(0.7, 300).then(
            result => console.log('随机成功:', result),
            error => console.log('随机失败:', error.message)
        );
        
        console.log('使用可重试Promise:');
        retryablePromise(() => randomPromise(0.3, 200), 2).then(
            result => console.log('重试成功:', result),
            error => console.log('重试失败:', error.message)
        );
    },
    
    /**
     * 条件Promise创建
     */
    conditionalPromiseCreation() {
        console.log('=== 条件Promise创建 ===');
        
        // 基于条件创建不同的Promise
        function createConditionalPromise(condition, successValue, errorMessage) {
            if (condition) {
                return Promise.resolve(successValue);
            } else {
                return Promise.reject(new Error(errorMessage));
            }
        }
        
        // 缓存Promise结果
        class PromiseCache {
            constructor() {
                this.cache = new Map();
            }
            
            get(key, promiseFactory) {
                if (this.cache.has(key)) {
                    console.log(`缓存命中: ${key}`);
                    return this.cache.get(key);
                }
                
                console.log(`创建新Promise: ${key}`);
                const promise = promiseFactory();
                this.cache.set(key, promise);
                
                // 清理失败的Promise
                promise.catch(() => {
                    this.cache.delete(key);
                });
                
                return promise;
            }
            
            clear() {
                this.cache.clear();
            }
        }
        
        const cache = new PromiseCache();
        
        // 模拟API调用工厂
        function fetchUserData(userId) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (userId > 0) {
                        resolve({
                            id: userId,
                            name: `User${userId}`,
                            email: `user${userId}@example.com`
                        });
                    } else {
                        reject(new Error('无效用户ID'));
                    }
                }, Math.random() * 1000);
            });
        }
        
        // 使用缓存的Promise
        console.log('第一次获取用户1:');
        cache.get('user-1', () => fetchUserData(1)).then(
            user => console.log('用户数据:', user),
            error => console.log('获取失败:', error.message)
        );
        
        setTimeout(() => {
            console.log('第二次获取用户1（应该使用缓存）:');
            cache.get('user-1', () => fetchUserData(1)).then(
                user => console.log('缓存用户数据:', user)
            );
        }, 500);
        
        // 条件Promise示例
        const userAge = 25;
        const adultPromise = createConditionalPromise(
            userAge >= 18,
            { isAdult: true, age: userAge },
            '用户未成年'
        );
        
        adultPromise.then(
            result => console.log('成年验证:', result),
            error => console.log('验证失败:', error.message)
        );
    }
};

PromiseCreationExamples.staticMethods();
setTimeout(() => PromiseCreationExamples.factoryPatterns(), 2000);
setTimeout(() => PromiseCreationExamples.conditionalPromiseCreation(), 4000);
```

---

## 16.2 then / catch / finally

Promise的核心方法和链式调用。

### then方法详解

```javascript
/**
 * then方法详解示例
 */
const ThenMethodExamples = {
    /**
     * then基础用法
     */
    thenBasics() {
        console.log('=== then基础用法 ===');
        
        const promise = new Promise(resolve => {
            setTimeout(() => resolve('原始值'), 500);
        });
        
        // then接受两个参数：onFulfilled和onRejected
        promise.then(
            value => {
                console.log('成功回调:', value);
                return value.toUpperCase();
            },
            error => {
                console.log('错误回调:', error.message);
                return 'error handled';
            }
        ).then(result => {
            console.log('链式then结果:', result);
        });
        
        // then返回新的Promise
        const newPromise = promise.then(value => value + ' processed');
        console.log('then返回新Promise:', promise !== newPromise);
        
        // 处理不同类型的返回值
        Promise.resolve('initial').then(value => {
            console.log('返回值类型测试:');
            return 'string'; // 返回普通值
        }).then(value => {
            console.log('1. 普通值:', value);
            return Promise.resolve('resolved promise'); // 返回Promise
        }).then(value => {
            console.log('2. Promise值:', value);
            return { data: 'object' }; // 返回对象
        }).then(value => {
            console.log('3. 对象值:', value);
        });
    },
    
    /**
     * catch错误处理
     */
    catchErrorHandling() {
        console.log('=== catch错误处理 ===');
        
        // catch是then(null, onRejected)的语法糖
        const errorPromise = Promise.reject(new Error('测试错误'));
        
        errorPromise.catch(error => {
            console.log('catch捕获错误:', error.message);
            return 'error recovered'; // 错误恢复
        }).then(value => {
            console.log('错误恢复后:', value);
        });
        
        // 链式错误处理
        Promise.resolve('start')
            .then(value => {
                console.log('步骤1:', value);
                throw new Error('步骤1错误');
            })
            .then(value => {
                console.log('步骤2不会执行:', value);
            })
            .catch(error => {
                console.log('捕获步骤1错误:', error.message);
                return '错误已处理';
            })
            .then(value => {
                console.log('继续执行:', value);
            });
        
        // 多层错误处理
        Promise.resolve('data')
            .then(value => {
                if (Math.random() > 0.5) {
                    throw new Error('随机错误');
                }
                return value;
            })
            .catch(error => {
                console.log('第一层错误处理:', error.message);
                throw new Error('处理中又出错');
            })
            .catch(error => {
                console.log('第二层错误处理:', error.message);
                return 'finally recovered';
            })
            .then(value => {
                console.log('最终结果:', value);
            });
    },
    
    /**
     * finally清理操作
     */
    finallyCleanup() {
        console.log('=== finally清理操作 ===');
        
        // finally不接收任何参数，不改变Promise值
        Promise.resolve('success data')
            .finally(() => {
                console.log('finally: 清理操作（成功情况）');
                return 'finally return'; // 这个返回值会被忽略
            })
            .then(value => {
                console.log('finally后的值:', value); // 仍然是'success data'
            });
        
        Promise.reject(new Error('failure'))
            .finally(() => {
                console.log('finally: 清理操作（失败情况）');
            })
            .catch(error => {
                console.log('finally后的错误:', error.message);
            });
        
        // 资源清理示例
        class ResourceManager {
            constructor(name) {
                this.name = name;
                this.isOpen = false;
            }
            
            open() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        this.isOpen = true;
                        console.log(`${this.name} 资源已打开`);
                        resolve(this);
                    }, 200);
                });
            }
            
            process() {
                if (!this.isOpen) {
                    return Promise.reject(new Error('资源未打开'));
                }
                
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() > 0.3) {
                            resolve(`${this.name} 处理完成`);
                        } else {
                            reject(new Error(`${this.name} 处理失败`));
                        }
                    }, 300);
                });
            }
            
            close() {
                if (this.isOpen) {
                    this.isOpen = false;
                    console.log(`${this.name} 资源已关闭`);
                }
            }
        }
        
        // 使用finally确保资源清理
        const resource = new ResourceManager('数据库连接');
        
        resource.open()
            .then(res => res.process())
            .then(result => {
                console.log('处理结果:', result);
            })
            .catch(error => {
                console.log('处理错误:', error.message);
            })
            .finally(() => {
                resource.close(); // 无论成功还是失败都会执行
            });
    }
};

ThenMethodExamples.thenBasics();
setTimeout(() => ThenMethodExamples.catchErrorHandling(), 1000);
setTimeout(() => ThenMethodExamples.finallyCleanup(), 2000);
```

---

## 16.3 Promise链

理解Promise链式调用的机制和最佳实践。

### 链式调用机制

```javascript
/**
 * Promise链示例
 */
const PromiseChainExamples = {
    /**
     * 基础链式调用
     */
    basicChaining() {
        console.log('=== 基础链式调用 ===');
        
        // 数据处理链
        const processData = (data) => {
            return Promise.resolve(data)
                .then(value => {
                    console.log('步骤1: 数据验证', value);
                    if (!value || value.length === 0) {
                        throw new Error('数据为空');
                    }
                    return value.trim();
                })
                .then(value => {
                    console.log('步骤2: 数据清理', value);
                    return value.toLowerCase();
                })
                .then(value => {
                    console.log('步骤3: 数据转换', value);
                    return { 
                        processed: value, 
                        timestamp: Date.now() 
                    };
                })
                .then(result => {
                    console.log('步骤4: 数据包装', result);
                    return result;
                });
        };
        
        processData('  Hello World  ').then(
            result => console.log('处理完成:', result),
            error => console.log('处理失败:', error.message)
        );
        
        // 测试错误情况
        processData('').catch(error => {
            console.log('空数据错误:', error.message);
        });
    },
    
    /**
     * 条件链式调用
     */
    conditionalChaining() {
        console.log('=== 条件链式调用 ===');
        
        function processUserData(userData) {
            return Promise.resolve(userData)
                .then(user => {
                    console.log('检查用户数据:', user);
                    
                    // 根据条件决定处理流程
                    if (user.type === 'admin') {
                        return Promise.resolve(user)
                            .then(admin => {
                                console.log('管理员权限验证');
                                admin.permissions = ['read', 'write', 'admin'];
                                return admin;
                            });
                    } else if (user.type === 'user') {
                        return Promise.resolve(user)
                            .then(regularUser => {
                                console.log('普通用户权限设置');
                                regularUser.permissions = ['read'];
                                return regularUser;
                            });
                    } else {
                        return Promise.reject(new Error('未知用户类型'));
                    }
                })
                .then(user => {
                    console.log('添加会话信息');
                    user.sessionId = Math.random().toString(36).substr(2, 9);
                    user.loginTime = new Date().toISOString();
                    return user;
                });
        }
        
        // 测试不同用户类型
        processUserData({ id: 1, name: 'Admin', type: 'admin' })
            .then(result => console.log('管理员处理结果:', result));
        
        processUserData({ id: 2, name: 'User', type: 'user' })
            .then(result => console.log('用户处理结果:', result));
        
        processUserData({ id: 3, name: 'Unknown', type: 'unknown' })
            .catch(error => console.log('未知类型错误:', error.message));
    },
    
    /**
     * 并行和串行混合
     */
    mixedParallelSerial() {
        console.log('=== 并行和串行混合 ===');
        
        // 模拟API调用
        function fetchUser(id) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ id, name: `User${id}`, email: `user${id}@example.com` });
                }, Math.random() * 500 + 200);
            });
        }
        
        function fetchUserPosts(userId) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { id: 1, title: 'Post 1', userId },
                        { id: 2, title: 'Post 2', userId }
                    ]);
                }, Math.random() * 500 + 200);
            });
        }
        
        function fetchPostComments(postId) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { id: 1, text: 'Comment 1', postId },
                        { id: 2, text: 'Comment 2', postId }
                    ]);
                }, Math.random() * 300 + 100);
            });
        }
        
        // 复杂的数据获取流程
        function getUserFullData(userId) {
            let userData;
            
            return fetchUser(userId)
                .then(user => {
                    console.log('获取用户信息:', user.name);
                    userData = user;
                    return fetchUserPosts(user.id);
                })
                .then(posts => {
                    console.log('获取用户文章:', posts.length, '篇');
                    userData.posts = posts;
                    
                    // 并行获取所有文章的评论
                    const commentPromises = posts.map(post => 
                        fetchPostComments(post.id).then(comments => {
                            post.comments = comments;
                            return post;
                        })
                    );
                    
                    return Promise.all(commentPromises);
                })
                .then(postsWithComments => {
                    console.log('获取所有评论完成');
                    userData.posts = postsWithComments;
                    
                    // 计算统计信息
                    userData.stats = {
                        totalPosts: userData.posts.length,
                        totalComments: userData.posts.reduce(
                            (sum, post) => sum + post.comments.length, 0
                        )
                    };
                    
                    return userData;
                });
        }
        
        getUserFullData(123).then(fullData => {
            console.log('完整用户数据:', {
                name: fullData.name,
                stats: fullData.stats
            });
        });
    }
};

PromiseChainExamples.basicChaining();
setTimeout(() => PromiseChainExamples.conditionalChaining(), 1000);
setTimeout(() => PromiseChainExamples.mixedParallelSerial(), 2000);
```

---

## 16.4 Promise.all / race / any

Promise并发控制的静态方法。

### 并发控制方法

```javascript
/**
 * Promise并发控制示例
 */
const PromiseConcurrencyExamples = {
    /**
     * Promise.all - 全部完成
     */
    promiseAll() {
        console.log('=== Promise.all - 全部完成 ===');
        
        const promises = [
            Promise.resolve('结果1'),
            new Promise(resolve => setTimeout(() => resolve('结果2'), 300)),
            new Promise(resolve => setTimeout(() => resolve('结果3'), 100))
        ];
        
        Promise.all(promises).then(results => {
            console.log('Promise.all结果:', results); // 保持顺序
        });
        
        // 有失败的情况
        const mixedPromises = [
            Promise.resolve('成功1'),
            Promise.reject(new Error('失败2')),
            new Promise(resolve => setTimeout(() => resolve('成功3'), 200))
        ];
        
        Promise.all(mixedPromises).catch(error => {
            console.log('Promise.all失败:', error.message); // 立即失败
        });
        
        // 实际应用：批量数据获取
        function batchFetch(urls) {
            console.log('批量获取数据...');
            
            const fetchPromises = urls.map(url => 
                new Promise(resolve => {
                    setTimeout(() => {
                        resolve({ url, data: `${url}的数据` });
                    }, Math.random() * 500 + 200);
                })
            );
            
            return Promise.all(fetchPromises);
        }
        
        batchFetch(['/api/users', '/api/posts', '/api/comments']).then(results => {
            console.log('批量获取完成:', results.map(r => r.url));
        });
    },
    
    /**
     * Promise.race - 竞速完成
     */
    promiseRace() {
        console.log('=== Promise.race - 竞速完成 ===');
        
        const racePromises = [
            new Promise(resolve => setTimeout(() => resolve('慢速'), 1000)),
            new Promise(resolve => setTimeout(() => resolve('中速'), 500)),
            new Promise(resolve => setTimeout(() => resolve('快速'), 200))
        ];
        
        Promise.race(racePromises).then(result => {
            console.log('Promise.race获胜者:', result); // '快速'
        });
        
        // 超时控制应用
        function withTimeout(promise, ms, timeoutValue = '超时') {
            const timeoutPromise = new Promise(resolve => {
                setTimeout(() => resolve(timeoutValue), ms);
            });
            
            return Promise.race([promise, timeoutPromise]);
        }
        
        const slowTask = new Promise(resolve => {
            setTimeout(() => resolve('慢任务完成'), 2000);
        });
        
        withTimeout(slowTask, 1000, '任务超时').then(result => {
            console.log('超时控制结果:', result);
        });
        
        // 多源数据竞速
        function fastestDataSource() {
            const sources = [
                fetch('/api/source1').then(() => 'source1数据').catch(() => Promise.reject('source1失败')),
                fetch('/api/source2').then(() => 'source2数据').catch(() => Promise.reject('source2失败')),
                fetch('/api/source3').then(() => 'source3数据').catch(() => Promise.reject('source3失败'))
            ];
            
            // 模拟fetch
            const mockSources = sources.map((_, index) => 
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() > 0.3) {
                            resolve(`source${index + 1}数据`);
                        } else {
                            reject(`source${index + 1}失败`);
                        }
                    }, Math.random() * 800 + 200);
                })
            );
            
            return Promise.race(mockSources);
        }
        
        fastestDataSource().then(
            result => console.log('最快数据源:', result),
            error => console.log('所有源都失败:', error)
        );
    },
    
    /**
     * Promise.any - 任一成功
     */
    promiseAny() {
        console.log('=== Promise.any - 任一成功 ===');
        
        // 检查Promise.any支持
        if (typeof Promise.any === 'undefined') {
            console.log('Promise.any不支持，模拟实现');
            
            // 简单的Promise.any polyfill
            Promise.any = function(promises) {
                return new Promise((resolve, reject) => {
                    let rejectedCount = 0;
                    const errors = [];
                    
                    promises.forEach((promise, index) => {
                        Promise.resolve(promise).then(
                            value => resolve(value),
                            error => {
                                errors[index] = error;
                                rejectedCount++;
                                
                                if (rejectedCount === promises.length) {
                                    reject(new AggregateError(errors, '所有Promise都失败'));
                                }
                            }
                        );
                    });
                });
            };
        }
        
        const anyPromises = [
            Promise.reject('错误1'),
            Promise.reject('错误2'),
            new Promise(resolve => setTimeout(() => resolve('成功3'), 300)),
            new Promise(resolve => setTimeout(() => resolve('成功4'), 100))
        ];
        
        Promise.any(anyPromises).then(result => {
            console.log('Promise.any第一个成功:', result);
        }).catch(error => {
            console.log('Promise.any全部失败:', error.message);
        });
        
        // 容错数据获取
        function resilientFetch(urls) {
            const fetchAttempts = urls.map(url => 
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() > 0.6) {
                            resolve({ url, data: `${url}数据` });
                        } else {
                            reject(new Error(`${url}请求失败`));
                        }
                    }, Math.random() * 1000);
                })
            );
            
            return Promise.any(fetchAttempts);
        }
        
        resilientFetch(['/backup1', '/backup2', '/backup3']).then(
            result => console.log('容错获取成功:', result.url),
            error => console.log('所有备份都失败')
        );
    }
};

PromiseConcurrencyExamples.promiseAll();
setTimeout(() => PromiseConcurrencyExamples.promiseRace(), 1000);
setTimeout(() => PromiseConcurrencyExamples.promiseAny(), 2000);
```

---

**本章总结**

第16章深入探讨了Promise异步编程的核心知识：

1. **Promise状态**：
   - 三种状态的转换机制
   - 状态监听和检测工具
   - 多种Promise创建方式

2. **核心方法**：
   - then链式调用和值传递
   - catch错误处理和恢复
   - finally资源清理操作

3. **Promise链**：
   - 链式调用的执行机制
   - 条件分支和复杂流程控制
   - 并行串行混合模式

4. **并发控制**：
   - Promise.all全部完成模式
   - Promise.race竞速完成模式
   - Promise.any任一成功模式

**关键要点**：
- Promise解决了回调地狱问题
- 理解状态转换对调试很重要
- 链式调用让异步代码更清晰
- 合理选择并发控制方法提升性能

**下一章预告**

第17章将学习async/await，这是基于Promise的更现代的异步语法，让异步代码看起来像同步代码，包括async函数原理、await暂停机制、错误处理和流程优化。
