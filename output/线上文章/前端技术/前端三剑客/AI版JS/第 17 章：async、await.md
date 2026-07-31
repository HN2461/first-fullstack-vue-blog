---
title: "第 17 章：async、await"
slug: "js-async-await-b580531b"
summary: "讲解 async 函数、await 暂停机制、异步错误捕获、并发优化和 async/await 写法实践。"
category: "AI版JS"
tags: ["JavaScript","async await","异步编程","错误处理"]
status: "published"
sortOrder: 180
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0f0"
originalSlug: "js-async-await-b580531b"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 17 章：async、await

async/await是ES2017引入的异步编程语法糖，基于Promise构建，让异步代码看起来像同步代码，极大提升了异步编程的可读性和可维护性。

## 17.1 async函数原理

理解async函数的本质和工作机制。

### async函数基础

async函数本质上是Generator函数的语法糖：

```javascript
/**
 * async函数原理示例
 */
const AsyncFunctionExamples = {
    /**
     * async函数基本特性
     */
    basicAsyncFeatures() {
        console.log('=== async函数基本特性 ===');
        
        // async函数总是返回Promise
        async function simpleAsync() {
            return 'hello world';
        }
        
        console.log('async函数返回值:', simpleAsync()); // Promise对象
        
        simpleAsync().then(result => {
            console.log('async函数结果:', result); // 'hello world'
        });
        
        // 等价的Promise写法
        function promiseVersion() {
            return Promise.resolve('hello world');
        }
        
        console.log('Promise版本一致性:', 
            simpleAsync().constructor === promiseVersion().constructor
        );
        
        // async函数中抛出异常
        async function asyncWithError() {
            if (Math.random() > 0.5) {
                throw new Error('随机错误');
            }
            return '成功结果';
        }
        
        asyncWithError().then(
            result => console.log('成功:', result),
            error => console.log('错误:', error.message)
        );
        
        // 返回Promise的async函数
        async function asyncReturnsPromise() {
            return Promise.resolve('嵌套Promise');
        }
        
        asyncReturnsPromise().then(result => {
            console.log('嵌套Promise结果:', result); // 自动展开
        });
    },
    
    /**
     * async函数的执行机制
     */
    asyncExecutionMechanism() {
        console.log('=== async函数执行机制 ===');
        
        // 执行顺序分析
        async function executionOrder() {
            console.log('1. async函数开始');
            
            // 同步代码立即执行
            console.log('2. 同步代码执行');
            
            // 遇到await会暂停
            const result = await Promise.resolve('异步结果');
            
            // await后的代码进入微任务队列
            console.log('3. await后的代码:', result);
            
            return 'async完成';
        }
        
        console.log('调用前');
        
        const promise = executionOrder();
        console.log('调用后，async函数返回:', promise);
        
        promise.then(result => {
            console.log('4. 最终结果:', result);
        });
        
        console.log('调用async函数后的同步代码');
        
        // 模拟async函数的Generator实现
        function* asyncGenerator() {
            console.log('Generator开始');
            const result = yield Promise.resolve('生成器异步结果');
            console.log('Generator继续:', result);
            return 'Generator完成';
        }
        
        function runGenerator(gen) {
            const iterator = gen();
            
            function handle(result) {
                if (!result.done) {
                    return Promise.resolve(result.value)
                        .then(res => handle(iterator.next(res)))
                        .catch(err => handle(iterator.throw(err)));
                }
                return result.value;
            }
            
            return handle(iterator.next());
        }
        
        setTimeout(() => {
            console.log('=== Generator模拟async ===');
            runGenerator(asyncGenerator).then(result => {
                console.log('Generator模拟结果:', result);
            });
        }, 1000);
    },
    
    /**
     * async函数的变体形式
     */
    asyncVariants() {
        console.log('=== async函数变体 ===');
        
        // 箭头函数版本
        const asyncArrow = async () => {
            return 'arrow async';
        };
        
        // 对象方法
        const obj = {
            async asyncMethod() {
                return 'method async';
            },
            
            // 简写形式
            async shorthand() {
                return 'shorthand async';
            }
        };
        
        // 类方法
        class AsyncClass {
            async asyncMethod() {
                return 'class async method';
            }
            
            static async staticAsyncMethod() {
                return 'static async method';
            }
        }
        
        // 立即执行async函数
        (async () => {
            console.log('立即执行async函数');
            
            try {
                const results = await Promise.all([
                    asyncArrow(),
                    obj.asyncMethod(),
                    obj.shorthand(),
                    new AsyncClass().asyncMethod(),
                    AsyncClass.staticAsyncMethod()
                ]);
                
                console.log('所有async变体结果:', results);
            } catch (error) {
                console.log('执行错误:', error.message);
            }
        })();
        
        // async函数作为参数
        function executeAsync(asyncFn) {
            console.log('执行传入的async函数');
            return asyncFn().then(result => {
                console.log('async参数结果:', result);
                return result;
            });
        }
        
        executeAsync(async () => {
            return '参数async函数';
        });
    }
};

AsyncFunctionExamples.basicAsyncFeatures();
setTimeout(() => AsyncFunctionExamples.asyncExecutionMechanism(), 500);
setTimeout(() => AsyncFunctionExamples.asyncVariants(), 1500);
```

### async函数与Promise对比

```javascript
/**
 * async与Promise对比示例
 */
const AsyncPromiseComparison = {
    /**
     * 代码风格对比
     */
    codeStyleComparison() {
        console.log('=== 代码风格对比 ===');
        
        // Promise链式写法
        function promiseChain() {
            return fetch('/api/user/123')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('网络错误');
                    }
                    return response.json();
                })
                .then(user => {
                    console.log('获取用户:', user.name);
                    return fetch(`/api/posts/${user.id}`);
                })
                .then(response => response.json())
                .then(posts => {
                    console.log('获取文章:', posts.length, '篇');
                    return posts;
                })
                .catch(error => {
                    console.log('Promise链错误:', error.message);
                    throw error;
                });
        }
        
        // async/await写法
        async function asyncAwaitStyle() {
            try {
                const response = await fetch('/api/user/123');
                
                if (!response.ok) {
                    throw new Error('网络错误');
                }
                
                const user = await response.json();
                console.log('获取用户:', user.name);
                
                const postsResponse = await fetch(`/api/posts/${user.id}`);
                const posts = await postsResponse.json();
                
                console.log('获取文章:', posts.length, '篇');
                return posts;
                
            } catch (error) {
                console.log('async/await错误:', error.message);
                throw error;
            }
        }
        
        // 模拟API调用进行测试
        global.fetch = (url) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (url.includes('user')) {
                        resolve({
                            ok: true,
                            json: () => Promise.resolve({ id: 123, name: 'John' })
                        });
                    } else if (url.includes('posts')) {
                        resolve({
                            ok: true,
                            json: () => Promise.resolve([
                                { id: 1, title: 'Post 1' },
                                { id: 2, title: 'Post 2' }
                            ])
                        });
                    } else {
                        reject(new Error('未知API'));
                    }
                }, 200);
            });
        };
        
        console.log('执行Promise链式调用:');
        promiseChain().then(
            result => console.log('Promise结果:', result?.length),
            error => console.log('Promise失败')
        );
        
        setTimeout(() => {
            console.log('执行async/await调用:');
            asyncAwaitStyle().then(
                result => console.log('async结果:', result?.length),
                error => console.log('async失败')
            );
        }, 1000);
    },
    
    /**
     * 错误处理对比
     */
    errorHandlingComparison() {
        console.log('=== 错误处理对比 ===');
        
        // Promise错误处理
        function promiseErrorHandling() {
            return Promise.resolve('start')
                .then(value => {
                    console.log('Promise步骤1:', value);
                    if (Math.random() > 0.7) {
                        throw new Error('步骤1失败');
                    }
                    return 'step1-success';
                })
                .then(value => {
                    console.log('Promise步骤2:', value);
                    if (Math.random() > 0.7) {
                        throw new Error('步骤2失败');
                    }
                    return 'step2-success';
                })
                .catch(error => {
                    console.log('Promise捕获错误:', error.message);
                    return 'error-recovered';
                })
                .then(value => {
                    console.log('Promise最终结果:', value);
                    return value;
                });
        }
        
        // async/await错误处理
        async function asyncErrorHandling() {
            try {
                let value = 'start';
                
                console.log('async步骤1:', value);
                if (Math.random() > 0.7) {
                    throw new Error('步骤1失败');
                }
                value = 'step1-success';
                
                console.log('async步骤2:', value);
                if (Math.random() > 0.7) {
                    throw new Error('步骤2失败');
                }
                value = 'step2-success';
                
                console.log('async最终结果:', value);
                return value;
                
            } catch (error) {
                console.log('async捕获错误:', error.message);
                return 'error-recovered';
            }
        }
        
        // 执行对比测试
        promiseErrorHandling().then(result => {
            console.log('Promise处理完成:', result);
        });
        
        asyncErrorHandling().then(result => {
            console.log('async处理完成:', result);
        });
    },
    
    /**
     * 性能和调试对比
     */
    performanceAndDebugging() {
        console.log('=== 性能和调试对比 ===');
        
        // 调用栈信息对比
        function promiseStackTrace() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Promise深层错误'));
                }, 100);
            }).then(result => {
                return result.toUpperCase();
            }).catch(error => {
                console.log('Promise错误堆栈:');
                console.log(error.stack.split('\n').slice(0, 3).join('\n'));
                throw error;
            });
        }
        
        async function asyncStackTrace() {
            try {
                const result = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error('async深层错误'));
                    }, 100);
                });
                
                return result.toUpperCase();
                
            } catch (error) {
                console.log('async错误堆栈:');
                console.log(error.stack.split('\n').slice(0, 3).join('\n'));
                throw error;
            }
        }
        
        // 测试堆栈信息
        promiseStackTrace().catch(() => {
            console.log('Promise错误已处理');
        });
        
        setTimeout(() => {
            asyncStackTrace().catch(() => {
                console.log('async错误已处理');
            });
        }, 200);
        
        // 内存使用对比（概念性演示）
        function memoryUsageDemo() {
            console.log('内存使用特点:');
            console.log('Promise: 创建多个Promise对象，链式调用');
            console.log('async/await: 单个Promise，更少的中间对象');
            
            const promiseMemory = Array.from({ length: 5 }, (_, i) => 
                Promise.resolve(i).then(x => x * 2)
            );
            
            const asyncMemory = async () => {
                const results = [];
                for (let i = 0; i < 5; i++) {
                    results.push(await Promise.resolve(i * 2));
                }
                return results;
            };
            
            Promise.all(promiseMemory).then(results => {
                console.log('Promise内存使用结果:', results);
            });
            
            asyncMemory().then(results => {
                console.log('async内存使用结果:', results);
            });
        }
        
        setTimeout(memoryUsageDemo, 500);
    }
};

AsyncPromiseComparison.codeStyleComparison();
setTimeout(() => AsyncPromiseComparison.errorHandlingComparison(), 1000);
setTimeout(() => AsyncPromiseComparison.performanceAndDebugging(), 2000);
```

---

## 17.2 await的暂停机制

深入理解await关键字的工作原理。

### await执行机制

```javascript
/**
 * await暂停机制示例
 */
const AwaitMechanismExamples = {
    /**
     * await基础执行流程
     */
    basicAwaitFlow() {
        console.log('=== await基础执行流程 ===');
        
        async function demonstrateAwait() {
            console.log('1. 函数开始执行');
            
            console.log('2. 准备await');
            const result = await new Promise(resolve => {
                console.log('3. Promise执行器运行');
                setTimeout(() => {
                    console.log('4. Promise异步任务完成');
                    resolve('异步结果');
                }, 500);
            });
            
            console.log('5. await后继续执行:', result);
            return '函数完成';
        }
        
        console.log('调用前');
        demonstrateAwait().then(result => {
            console.log('6. 最终结果:', result);
        });
        console.log('调用后（async函数已暂停）');
    },
    
    /**
     * 多个await的执行顺序
     */
    multipleAwaitOrder() {
        console.log('=== 多个await执行顺序 ===');
        
        async function multipleAwaits() {
            console.log('开始多重await');
            
            const task1 = await new Promise(resolve => {
                setTimeout(() => {
                    console.log('任务1完成');
                    resolve('结果1');
                }, 300);
            });
            
            const task2 = await new Promise(resolve => {
                setTimeout(() => {
                    console.log('任务2完成');
                    resolve('结果2');
                }, 200);
            });
            
            const task3 = await new Promise(resolve => {
                setTimeout(() => {
                    console.log('任务3完成');
                    resolve('结果3');
                }, 100);
            });
            
            console.log('所有任务完成:', { task1, task2, task3 });
            return [task1, task2, task3];
        }
        
        const startTime = Date.now();
        multipleAwaits().then(results => {
            const duration = Date.now() - startTime;
            console.log('总耗时:', duration, 'ms (约600ms)');
            console.log('串行执行结果:', results);
        });
    }
};

AwaitMechanismExamples.basicAwaitFlow();
setTimeout(() => AwaitMechanismExamples.multipleAwaitOrder(), 1000);
```

---

## 17.3 try/catch异步错误处理

理解async/await中的错误处理机制。

### 异步错误捕获

```javascript
/**
 * try/catch异步错误处理示例
 */
const AsyncErrorHandling = {
    /**
     * 基础错误捕获
     */
    basicErrorCatching() {
        console.log('=== 基础错误捕获 ===');
        
        async function basicTryCatch() {
            try {
                const result = await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() > 0.5) {
                            resolve('成功结果');
                        } else {
                            reject(new Error('随机失败'));
                        }
                    }, 300);
                });
                
                console.log('操作成功:', result);
                return result;
                
            } catch (error) {
                console.log('捕获错误:', error.message);
                return '错误已处理';
            }
        }
        
        // 测试多次以观察不同结果
        Promise.all([
            basicTryCatch(),
            basicTryCatch(),
            basicTryCatch()
        ]).then(results => {
            console.log('批量处理结果:', results);
        });
    },
    
    /**
     * 复杂错误处理场景
     */
    complexErrorScenarios() {
        console.log('=== 复杂错误处理场景 ===');
        
        // 多层try/catch
        async function nestedTryCatch() {
            try {
                console.log('外层try开始');
                
                try {
                    console.log('内层try开始');
                    
                    await new Promise((resolve, reject) => {
                        setTimeout(() => reject(new Error('内层错误')), 200);
                    });
                    
                } catch (innerError) {
                    console.log('内层catch:', innerError.message);
                    
                    // 重新抛出或处理
                    if (innerError.message.includes('内层')) {
                        throw new Error('重新抛出: ' + innerError.message);
                    }
                }
                
            } catch (outerError) {
                console.log('外层catch:', outerError.message);
            }
        }
        
        nestedTryCatch();
        
        // 选择性错误处理
        async function selectiveErrorHandling() {
            const errors = [];
            
            for (let i = 0; i < 3; i++) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (Math.random() > 0.6) {
                                resolve(`任务${i + 1}成功`);
                            } else {
                                reject(new Error(`任务${i + 1}失败`));
                            }
                        }, 100 * (i + 1));
                    });
                    
                    console.log('任务成功:', result);
                    
                } catch (error) {
                    console.log('任务失败:', error.message);
                    errors.push(error);
                    
                    // 决定是否继续
                    if (errors.length >= 2) {
                        console.log('错误过多，停止执行');
                        throw new Error('批量任务失败');
                    }
                }
            }
            
            console.log('所有任务完成，错误数量:', errors.length);
        }
        
        setTimeout(() => {
            selectiveErrorHandling().catch(error => {
                console.log('批量任务最终错误:', error.message);
            });
        }, 800);
    }
};

AsyncErrorHandling.basicErrorCatching();
setTimeout(() => AsyncErrorHandling.complexErrorScenarios(), 600);
```

---

## 17.4 异步流程写法优化

掌握async/await的性能优化和高级用法。

### 并发执行优化

```javascript
/**
 * 异步流程优化示例
 */
const AsyncOptimization = {
    /**
     * 并行vs串行执行
     */
    parallelVsSerial() {
        console.log('=== 并行vs串行执行 ===');
        
        // 串行执行（低效）
        async function serialExecution() {
            const startTime = Date.now();
            
            const task1 = await new Promise(resolve => {
                setTimeout(() => resolve('任务1'), 300);
            });
            
            const task2 = await new Promise(resolve => {
                setTimeout(() => resolve('任务2'), 200);
            });
            
            const task3 = await new Promise(resolve => {
                setTimeout(() => resolve('任务3'), 100);
            });
            
            const duration = Date.now() - startTime;
            console.log('串行执行:', { task1, task2, task3 }, `耗时: ${duration}ms`);
            
            return [task1, task2, task3];
        }
        
        // 并行执行（高效）
        async function parallelExecution() {
            const startTime = Date.now();
            
            // 同时启动所有Promise
            const promises = [
                new Promise(resolve => setTimeout(() => resolve('任务1'), 300)),
                new Promise(resolve => setTimeout(() => resolve('任务2'), 200)),
                new Promise(resolve => setTimeout(() => resolve('任务3'), 100))
            ];
            
            // 等待所有Promise完成
            const [task1, task2, task3] = await Promise.all(promises);
            
            const duration = Date.now() - startTime;
            console.log('并行执行:', { task1, task2, task3 }, `耗时: ${duration}ms`);
            
            return [task1, task2, task3];
        }
        
        // 混合模式：部分依赖的并行执行
        async function hybridExecution() {
            const startTime = Date.now();
            
            // 第一批：独立任务并行
            const [user, config] = await Promise.all([
                new Promise(resolve => 
                    setTimeout(() => resolve({ id: 1, name: 'User' }), 200)
                ),
                new Promise(resolve => 
                    setTimeout(() => resolve({ theme: 'dark' }), 150)
                )
            ]);
            
            // 第二批：依赖第一批结果的任务
            const [posts, preferences] = await Promise.all([
                new Promise(resolve => 
                    setTimeout(() => resolve(['post1', 'post2']), 100)
                ),
                new Promise(resolve => 
                    setTimeout(() => resolve({ notifications: true }), 100)
                )
            ]);
            
            const duration = Date.now() - startTime;
            console.log('混合执行:', { user, config, posts, preferences }, `耗时: ${duration}ms`);
        }
        
        // 执行对比测试
        serialExecution().then(() => {
            return parallelExecution();
        }).then(() => {
            return hybridExecution();
        });
    },
    
    /**
     * 循环中的异步处理
     */
    asyncInLoops() {
        console.log('=== 循环中的异步处理 ===');
        
        const urls = ['/api/data1', '/api/data2', '/api/data3', '/api/data4'];
        
        // 错误：forEach中使用async（不会等待）
        async function incorrectForEach() {
            console.log('错误的forEach用法:');
            const results = [];
            
            urls.forEach(async (url, index) => {
                const result = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(`数据${index + 1}`);
                    }, Math.random() * 200 + 100);
                });
                results.push(result);
                console.log('forEach完成:', result);
            });
            
            console.log('forEach立即返回:', results); // 空数组
            return results;
        }
        
        // 正确：for...of串行处理
        async function correctForOf() {
            console.log('\n正确的for...of用法:');
            const results = [];
            
            for (const [index, url] of urls.entries()) {
                const result = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(`数据${index + 1}`);
                    }, Math.random() * 200 + 100);
                });
                results.push(result);
                console.log('for...of完成:', result);
            }
            
            console.log('for...of最终结果:', results);
            return results;
        }
        
        // 并行：Promise.all + map
        async function parallelMap() {
            console.log('\n并行map处理:');
            
            const promises = urls.map(async (url, index) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const result = `数据${index + 1}`;
                        console.log('map并行完成:', result);
                        resolve(result);
                    }, Math.random() * 200 + 100);
                });
            });
            
            const results = await Promise.all(promises);
            console.log('map最终结果:', results);
            return results;
        }
        
        // 控制并发数量
        async function controlledConcurrency(concurrency = 2) {
            console.log('\n控制并发数量:', concurrency);
            const results = [];
            
            for (let i = 0; i < urls.length; i += concurrency) {
                const batch = urls.slice(i, i + concurrency);
                
                const batchPromises = batch.map(async (url, batchIndex) => {
                    const globalIndex = i + batchIndex;
                    return new Promise(resolve => {
                        setTimeout(() => {
                            const result = `数据${globalIndex + 1}`;
                            console.log('批量完成:', result);
                            resolve(result);
                        }, Math.random() * 200 + 100);
                    });
                });
                
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }
            
            console.log('控制并发最终结果:', results);
            return results;
        }
        
        // 依次执行测试
        incorrectForEach().then(() => {
            setTimeout(() => correctForOf(), 1000);
            setTimeout(() => parallelMap(), 2000);
            setTimeout(() => controlledConcurrency(2), 3000);
        });
    }
};

AsyncOptimization.parallelVsSerial();
setTimeout(() => AsyncOptimization.asyncInLoops(), 2000);
```

---

**本章总结**

第17章深入探讨了async/await异步编程语法：

1. **async函数原理**：
   - async函数本质是Generator的语法糖
   - 执行机制和Promise的区别
   - 各种async函数变体形式

2. **await暂停机制**：
   - await的暂停和恢复过程
   - 多个await的串行执行特性
   - 执行顺序的深度理解

3. **异步错误处理**：
   - try/catch在异步中的应用
   - 多层错误处理策略
   - 选择性错误处理模式

4. **流程优化**：
   - 并行vs串行执行的性能对比
   - 循环中的异步处理最佳实践
   - 并发数量控制技巧

**关键要点**：
- async/await让异步代码更像同步代码
- 理解暂停机制对性能优化很重要
- 合理选择并行和串行执行模式
- 循环中的异步处理需要特别注意

**下一章预告**

第18章将学习网络请求与跨域，包括HTTP基础、Fetch API、Axios库使用、CORS原理和常用跨域解决方案，这是现代Web应用的核心技术。
