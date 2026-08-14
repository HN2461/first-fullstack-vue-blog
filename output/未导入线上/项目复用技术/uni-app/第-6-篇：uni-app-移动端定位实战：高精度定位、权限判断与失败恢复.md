---
title: "第 6 篇：uni-app 移动端定位实战：高精度定位、权限判断与失败恢复"
slug: "uni-app-high-accuracy-location-permission-recovery"
summary: "以考勤打卡为场景，重点拆解 uni-app 高精度定位、超时保护、按需重试、并发复用、坐标统一、权限分层、设置页恢复和范围三态，代码带中文注释，便于快速复习和迁移。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "微信小程序"
  - "移动开发"
  - "坐标系统"
  - "权限控制"
status: "draft"
sortOrder: 60
cover: ""
---

# 第 6 篇：uni-app 移动端定位实战：高精度定位、权限判断与失败恢复

本文以考勤打卡为场景，但学习重点不是某个项目的接口字段，而是以下可以迁移到其他业务的定位能力：

1. 如何调用一次带超时保护的高精度定位。
2. 为什么第一次精度不足时最多再定位一次。
3. 如何避免页面生命周期和用户点击重复发起定位。
4. 如何统一 GCJ-02、WGS-84 等坐标协议。
5. 如何区分手机定位服务、应用系统权限和小程序权限。
6. 用户拒绝权限后，如何引导进入正确设置页并在返回后复查。
7. 如何结合定位误差，把范围结果分为范围内、不确定和范围外。

文中的业务数据和接口只承担“接入示例”作用。换成签到、巡检、外勤、门店到访或地图选点时，定位服务层和权限恢复层仍然可以复用。

## 快速复习路线

时间有限时，可以按下面顺序阅读：

1. 基础概念：第三节，先回忆经纬度、坐标系、精度和权限函数。
2. 核心定位：第四到第八节，掌握超时、坐标降级、按需重试和 Promise 复用。
3. 权限恢复：第十到第十二节，掌握三层权限判断、设置页跳转和返回后复查。
4. 范围判断：第十三节，掌握距离计算、`uncertain` 状态和两种安全策略。
5. 项目迁移：第十四节，只在最后一层适配业务规则和接口字段。
6. 临时回忆：直接看第十八节的七句口诀。

全文代码块都按“用途注释 -> 实现代码 -> 快速回忆 -> 换项目要改哪里”的方式组织，复习时可以先读注释和代码后的总结。

## 一、先记住定位链路的主干

一条稳定的移动端定位链路可以拆成五层：

```text
定位环境检查
  手机定位服务、应用系统权限、小程序权限
        ↓
设备定位
  高精度参数、业务超时、坐标类型、失败分类
        ↓
结果标准化
  经度、纬度、精度、坐标系、获取时间
        ↓
业务判断
  缓存是否可用、距离、误差、范围状态
        ↓
业务接入
  考勤、签到、巡检、外勤或其他接口
```

页面不应该直接把所有逻辑写进“点击打卡”方法。更清晰的职责划分是：

- 定位服务只负责拿到可信度可解释的位置。
- 权限服务只负责判断缺少哪一层能力以及如何恢复。
- 范围服务只负责计算距离和状态。
- 业务页面只负责决定何时定位、何时提交、如何展示。

## 二、定位结果必须保存完整上下文

只保存经纬度不够。推荐统一为以下结构：

```js
{
  longitude: 120.456,
  latitude: 30.123,
  accuracy: 28,
  coordinateType: 'gcj02',
  sourceCoordinateType: 'gcj02',
  timestamp: Date.now()
}
```

字段说明：

- `longitude`、`latitude`：标准化后的业务坐标。
- `accuracy`：平台返回的水平精度估计，通常以米为单位，越小通常越可靠。
- `coordinateType`：业务最终使用的坐标系。
- `sourceCoordinateType`：设备最初返回的坐标系，便于排障。
- `timestamp`：定位成功时间，用于判断位置是否过期。

`accuracy` 不是“真实误差一定小于这个值”的绝对承诺。不同平台、系统和定位提供方的口径可能不同，所以它适合参与风险判断，不能被当成完全可信的证明。

## 三、定位基础知识速查

### 1. 经度和纬度分别是什么

- 经度 `longitude`：表示东西方向，范围通常是 `-180` 到 `180`。
- 纬度 `latitude`：表示南北方向，范围通常是 `-90` 到 `90`。

国内常见位置大致是：

```text
longitude: 120.123456
latitude: 30.123456
```

最容易写错的是参数顺序：

```text
多数业务字符串：经度,纬度
很多距离函数参数：纬度,经度
```

因此不要只看两个数字都像坐标就直接传递。接口协议应明确字段名，历史字符串也应在适配层集中解析。

```js
/**
 * 将历史的“经度,纬度”字符串转换为明确字段。
 */
const parseCoordinateText = (coordinateText) => {
  const [longitude, latitude] = String(coordinateText || '')
    .split(',')
    .map(Number)

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null
  }

  return {
    longitude,
    latitude
  }
}
```

### 2. WGS-84、GCJ-02、BD-09 是什么

| 坐标系 | 常见用途 | 需要记住的特点 |
| --- | --- | --- |
| WGS-84 | GPS 原始坐标、国际地图和部分定位接口 | 全球通用的地理坐标基准 |
| GCJ-02 | 中国大陆常见地图服务、微信和高德相关场景 | 在 WGS-84 基础上经过偏移处理 |
| BD-09 | 百度地图 | 在 GCJ-02 基础上又做了一层转换 |

可以先这样理解：

```text
GPS 原始位置常见为 WGS-84
        ↓
中国大陆常见互联网地图多使用 GCJ-02
        ↓
百度地图使用 BD-09
```

坐标系不同并不代表坐标无效，而是同一个真实地点会对应不同数值。设备位置是 WGS-84，后台打卡点是 GCJ-02 时，直接计算距离可能出现明显偏差。

实际项目要统一以下环节：

1. `uni.getLocation` 请求的坐标类型。
2. 后台保存的考勤点或门店点坐标类型。
3. 地图组件显示的坐标类型。
4. 逆地理编码接口要求的坐标类型。
5. 服务端重新计算距离时使用的坐标类型。

坐标转换优先使用经过验证的地图服务、SDK 或公共工具模块。不要在每个页面复制一份转换公式，也不要让地址展示使用的近似转换结果参与高风险范围判断。

### 3. `accuracy` 和 `horizontalAccuracy` 是什么

定位 API 可能返回：

```js
{
  latitude: 30.123,
  longitude: 120.456,
  accuracy: 35,
  horizontalAccuracy: 28
}
```

可以把 `accuracy` 理解为平台对水平位置误差的估计，单位通常是米：

```text
数值越小，通常越可靠
10m 通常优于 80m
null 表示平台没有提供可用精度
```

但它不是绝对保证。例如 `accuracy = 30` 不等于真实位置必然落在 30 米圆内，只能作为缓存复用、范围边界和重新定位策略的参考。

如果平台同时返回 `horizontalAccuracy` 和 `accuracy`，可以优先使用更明确的水平精度字段。

### 4. uni-app 常用定位与权限函数

| 函数 | 主要用途 | 常见使用位置 |
| --- | --- | --- |
| `uni.getLocation` | 获取设备位置 | 定位服务核心 |
| `uni.authorize` | 主动申请某个小程序 scope 权限 | 首次授权或动作前预申请 |
| `uni.getSetting` | 读取当前小程序 scope 授权结果 | 判断 `scope.userLocation` 是否被拒绝 |
| `uni.getSystemSetting` | 读取手机系统能力开关 | 判断定位服务是否开启 |
| `uni.getAppAuthorizeSetting` | 读取微信或当前 App 的系统授权状态 | 判断应用级位置权限 |
| `uni.openSetting` | 打开小程序设置页 | 恢复小程序 scope 权限 |
| `uni.openAppAuthorizeSetting` | 打开微信或当前 App 的系统权限页 | 恢复应用级权限 |
| `uni.getSystemInfoSync` | 读取当前平台和设备信息 | 区分 Android、iOS 等提示路径 |

这些函数不是所有平台都具备完全相同的能力。调用前应检查函数是否存在，并通过条件编译限制平台专属代码。

### 5. `uni.getLocation` 的常用参数

```js
uni.getLocation({
  // 业务期望的坐标类型，常见值为 gcj02 或 wgs84。
  type: 'gcj02',

  // 请求平台尽量返回高精度位置。
  isHighAccuracy: true,

  // 高精度定位允许等待的时间，具体支持情况以目标平台为准。
  highAccuracyExpireTime: 6000,

  success: (result) => {
    console.log('定位成功', result)
  },
  fail: (error) => {
    console.error('定位失败', error)
  }
})
```

快速回忆：

- `type` 决定期望坐标系。
- `isHighAccuracy` 表示希望提高定位精度，不代表一定成功或一定达到某个误差值。
- `highAccuracyExpireTime` 是平台高精度等待参数，不等于完整业务超时。
- 正式项目仍需要在 Promise 外增加自己的超时保护。

### 6. `uni.authorize`、`uni.getSetting` 和 `uni.openSetting` 的区别

可以把三者理解为：

```text
uni.authorize
  主动发起授权请求

uni.getSetting
  只读取当前小程序授权状态

uni.openSetting
  用户拒绝后，打开小程序设置页让用户手动修改
```

示例：

```js
/**
 * 主动申请微信小程序位置权限。
 * App 和其他小程序平台应按各自能力单独适配。
 */
const authorizeMiniProgramLocation = () => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    uni.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
    return
    // #endif

    resolve(false)
  })
}
```

注意：

- 首次调用 `uni.getLocation` 时，平台也可能自动触发位置授权流程。
- 用户明确拒绝后，重复调用 `uni.authorize` 往往不能再次弹出授权框，需要使用 `uni.openSetting`。
- 微信小程序还需要按平台要求配置位置用途说明和隐私相关声明。
- H5 定位通常要求 HTTPS 安全上下文，并受浏览器权限策略影响。

### 7. `uni.getSystemSetting` 和 `uni.getAppAuthorizeSetting` 的区别

```text
uni.getSystemSetting
  看手机系统能力是否开启，例如定位服务总开关

uni.getAppAuthorizeSetting
  看系统是否允许微信或当前 App 使用位置
```

例如：手机定位服务已经开启，但用户在系统设置中禁止微信访问位置。此时小程序自己的 `scope.userLocation` 即使允许，定位仍可能失败。

这也是为什么权限恢复必须从底层到上层判断：

```text
手机定位服务
  -> 微信或 App 系统权限
  -> 当前小程序权限
```

## 四、先写两个基础工具：错误文本和精度提取

不同平台的异常结构不完全一致，精度字段也可能不同。先统一入口，后面的逻辑会简单很多。

```js
/**
 * 将不同平台的定位异常整理成可检索文本。
 * 目的不是直接展示给用户，而是方便日志记录和错误分类。
 */
const getLocationErrorText = (error, fallbackText = '未知错误') => {
  if (!error) return fallbackText

  // 某些兼容流程会同时保存主请求和降级请求异常。
  if (error.primaryError || error.fallbackError) {
    const primaryText = getLocationErrorText(error.primaryError, '主定位失败')
    const fallbackTextValue = getLocationErrorText(error.fallbackError, '降级定位失败')

    return `primary: ${primaryText}; fallback: ${fallbackTextValue}`
  }

  // 优先读取平台常见的错误字段。
  if (error.errMsg) return String(error.errMsg)
  if (error.message) return String(error.message)

  // 最后尝试序列化，避免丢失平台附加信息。
  try {
    const text = JSON.stringify(error)
    return text && text !== '{}' ? text : fallbackText
  } catch (serializeError) {
    return fallbackText
  }
}

/**
 * 提取水平定位精度。
 * 部分平台返回 horizontalAccuracy，部分平台只返回 accuracy。
 */
const getLocationAccuracy = (location) => {
  const horizontalAccuracy = Number(location?.horizontalAccuracy)
  if (Number.isFinite(horizontalAccuracy) && horizontalAccuracy > 0) {
    return horizontalAccuracy
  }

  const accuracy = Number(location?.accuracy)
  return Number.isFinite(accuracy) && accuracy > 0 ? accuracy : null
}
```

快速回忆：

- 原始错误用于日志和分类，不要原样展示给普通用户。
- 优先读取 `horizontalAccuracy`，再兼容 `accuracy`。
- 精度缺失时返回 `null`，不要擅自补成 `0`。`0` 会被误解为绝对准确。

## 五、写一个真正可靠的单次定位函数

`uni.getLocation` 在少数设备上可能长时间不回调。业务层需要自己的超时，并防止“成功、失败、超时”重复结束同一个 Promise。

```js
const LOCATION_REQUEST_TIMEOUT = 7000
const HIGH_ACCURACY_EXPIRE_TIME = 6000

/**
 * 请求一次设备定位。
 * @param {'gcj02'|'wgs84'} type 期望返回的坐标类型
 * @returns {Promise<Object>} 原始定位结果
 */
const requestLocationByType = (type) => {
  return new Promise((resolve, reject) => {
    // settled 用于保证 Promise 只结束一次。
    // 某些设备可能先触发业务超时，稍后又返回 success 或 fail。
    let settled = false

    const finish = (callback, payload) => {
      if (settled) return

      settled = true
      clearTimeout(timer)
      callback(payload)
    }

    // 业务超时负责兜底，避免页面一直显示“定位中”。
    const timer = setTimeout(() => {
      finish(reject, {
        errMsg: `getLocation:fail ${type} timeout`
      })
    }, LOCATION_REQUEST_TIMEOUT)

    uni.getLocation({
      type,
      // 请求平台尽量使用高精度定位。
      isHighAccuracy: true,
      // 给系统高精度定位预留等待时间。
      highAccuracyExpireTime: HIGH_ACCURACY_EXPIRE_TIME,
      success: (result) => {
        finish(resolve, {
          ...result,
          sourceCoordinateType: type
        })
      },
      fail: (error) => finish(reject, error)
    })
  })
}
```

这段代码负责什么：

- 只完成“一次定位”，不负责重试、缓存和权限弹窗。
- 高精度参数是否生效取决于目标平台，不能假设所有端完全一致。
- `settled` 和 `clearTimeout` 是稳定性的关键，避免重复回调和残留定时器。

换项目时通常只需要调整：

- 业务超时时间。
- 高精度等待时间。
- 目标平台不支持的参数和条件编译。

## 六、坐标降级只能处理“不支持”，不能处理权限失败

如果业务统一使用 GCJ-02，可以先请求 GCJ-02。只有平台明确表示“不支持 GCJ-02”时，才请求 WGS-84 并转换。

权限拒绝、GPS 关闭、定位超时都不能通过切换坐标系解决。

```js
/**
 * 只识别“平台不支持 GCJ-02”这一类错误。
 * 不要把所有定位失败都误判为坐标类型不支持。
 */
const isGcj02UnsupportedError = (error) => {
  const message = getLocationErrorText(error, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')

  return message.includes('not support gcj02') ||
    message.includes('gcj02 is not supported') ||
    message.includes('unsupported gcj02') ||
    message.includes('不支持 gcj02') ||
    message.includes('不支持gcj02')
}

/**
 * 获取一次已经统一为 GCJ-02 的定位结果。
 */
const requestSingleLocation = async () => {
  try {
    const location = await requestLocationByType('gcj02')
    const latitude = Number(location.latitude)
    const longitude = Number(location.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('定位坐标无效')
    }

    return {
      longitude,
      latitude,
      accuracy: getLocationAccuracy(location),
      coordinateType: 'gcj02',
      sourceCoordinateType: 'gcj02',
      timestamp: Date.now()
    }
  } catch (primaryError) {
    // 只有明确不支持 GCJ-02 时才允许走 WGS-84 降级。
    if (!isGcj02UnsupportedError(primaryError)) throw primaryError

    try {
      const location = await requestLocationByType('wgs84')
      const latitude = Number(location.latitude)
      const longitude = Number(location.longitude)

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('定位坐标无效')
      }

      // convertWgs84ToGcj02 应由经过验证的地图服务、SDK 或公共模块提供。
      const converted = convertWgs84ToGcj02(latitude, longitude)

      return {
        longitude: converted.longitude,
        latitude: converted.latitude,
        accuracy: getLocationAccuracy(location),
        coordinateType: 'gcj02',
        sourceCoordinateType: 'wgs84',
        timestamp: Date.now()
      }
    } catch (fallbackError) {
      // 同时保留两次异常，方便排查到底失败在哪一步。
      throw {
        primaryError,
        fallbackError
      }
    }
  }
}
```

快速回忆：

- 坐标协议必须由前端、地图、后台打卡点和服务端统一约定。
- WGS-84 转 GCJ-02 的数学实现不应散落在业务页面，优先复用经过验证的模块或地图服务。
- 坐标降级是平台兼容策略，不是通用错误重试策略。

## 七、第一次精度不足时最多再定位一次

高精度定位不代表第一次结果一定足够好。一个实用策略是：

```text
第一次定位
  ↓
精度达到业务阈值？
  ├─ 是：立即采用
  └─ 否：最多补一次定位，再选择更优结果
```

```js
const GOOD_LOCATION_ACCURACY = 50

/**
 * 从两个有效结果中选择水平精度更好的一个。
 */
const pickBetterLocation = (firstLocation, secondLocation) => {
  if (!firstLocation) return secondLocation
  if (!secondLocation) return firstLocation

  const firstAccuracy = Number(firstLocation.accuracy)
  const secondAccuracy = Number(secondLocation.accuracy)

  if (!Number.isFinite(firstAccuracy)) return secondLocation
  if (!Number.isFinite(secondAccuracy)) return firstLocation

  return secondAccuracy < firstAccuracy
    ? secondLocation
    : firstLocation
}

/**
 * 获取当前这一轮的最佳定位。
 * 第一次合格就停止，避免无条件重复等待。
 */
const requestBestLocation = async () => {
  const firstLocation = await requestSingleLocation()

  if (
    Number.isFinite(firstLocation.accuracy) &&
    firstLocation.accuracy <= GOOD_LOCATION_ACCURACY
  ) {
    return firstLocation
  }

  let secondLocation = null

  try {
    secondLocation = await requestSingleLocation()
  } catch (error) {
    // 第二次失败时保留第一次有效结果，不让补充定位反而破坏可用结果。
    console.warn('第二次高精度定位失败，保留首次结果', error)
  }

  return pickBetterLocation(firstLocation, secondLocation)
}
```

为什么不是无限重试：

- GPS 精度不一定随着次数持续改善。
- 无限重试会增加等待和耗电。
- 室内、地下或弱信号环境可能始终无法达到理想阈值。
- 精度长期不合格时，页面应该给出“到开阔处重试”等可执行提示。

`50 米` 只是示例阈值，不是行业固定答案。半径只有 30 米的严格考勤和半径 500 米的外勤签到，不应使用同一套标准。

## 八、并发定位要复用同一个 Promise

页面 `onShow`、校区切换、下拉刷新和用户点击可能同时触发定位。应让同一时刻的调用等待同一个任务，而不是各自调用系统 API。

```js
import { ref } from 'vue'

const locationLoading = ref(false)
const locationPhase = ref('idle')
const locationErrorText = ref('')

let currentLocationResult = null
let locationRequestPromise = null

/**
 * 获取高精度位置，并复用当前正在进行的定位任务。
 */
const getLocation = ({ force = false } = {}) => {
  // 普通展示场景可以复用短时间缓存。
  if (!force && isLocationFresh()) {
    return Promise.resolve(currentLocationResult)
  }

  // 已有定位正在进行时，后续调用直接等待同一个 Promise。
  if (locationRequestPromise) return locationRequestPromise

  locationRequestPromise = (async () => {
    locationLoading.value = true
    locationPhase.value = 'locating'
    locationErrorText.value = ''

    try {
      const bestLocation = await requestBestLocation()

      // 成功后一次性保存完整结果，避免响应式字段更新到一半被读取。
      currentLocationResult = bestLocation
      locationPhase.value = 'ready'

      return bestLocation
    } catch (error) {
      // 失败后再判断具体缺少哪一层权限或环境能力。
      const environment = await inspectLocationEnvironment(error)

      locationPhase.value = 'error'
      locationErrorText.value = environment.userMessage

      throw error
    } finally {
      // 无论成功还是失败，都必须关闭 loading 并释放 Promise。
      locationLoading.value = false
      locationRequestPromise = null
    }
  })()

  return locationRequestPromise
}
```

快速回忆：

- 缓存复用解决“刚定位完又定位”的串行重复。
- Promise 复用解决“多个入口同时定位”的并发重复。
- `finally` 必须释放任务，否则一次失败后可能永远无法再次定位。
- 如果不同调用要求不同坐标系或精度，应按请求参数生成 key，不能盲目共用。

## 九、缓存不能只看时间

普通页面展示和正式业务动作应使用不同标准。

```js
const LOCATION_CACHE_TIME = 15000
const ACTION_LOCATION_CACHE_TIME = 10000

/**
 * 判断当前是否存在一条成功且未过期的位置。
 */
const isLocationFresh = (maxAge = LOCATION_CACHE_TIME) => {
  return locationPhase.value === 'ready' &&
    Boolean(currentLocationResult) &&
    Date.now() - currentLocationResult.timestamp <= maxAge
}

/**
 * 正式提交前采用更严格的复用条件。
 * rangeStatus 应使用当前位置和当前规则重新计算。
 */
const canReuseLocationForAction = (rangeStatus) => {
  return isLocationFresh(ACTION_LOCATION_CACHE_TIME) &&
    Number.isFinite(currentLocationResult?.accuracy) &&
    currentLocationResult.accuracy <= GOOD_LOCATION_ACCURACY &&
    rangeStatus === 'inside'
}
```

正式业务通常需要同时检查：

1. 定位是否成功。
2. 位置是否足够新。
3. 精度是否达到业务要求。
4. 当前坐标是否仍满足当前规则。

不要只保存一个长期有效的 `inRange = true`。校区、规则或坐标变化后，旧结果可能已经失效。

## 十、权限判断要拆成三层

以微信小程序为例，成功定位通常依赖：

```text
手机定位服务已开启
        ↓
系统允许微信使用位置
        ↓
当前小程序允许使用位置
```

App 场景没有“小程序权限”这一层，但仍要区分手机定位服务和当前 App 的系统权限。

### 1. 先识别常见错误类型

```js
/**
 * 原始错误没有统一错误码时，只能兼容常见关键词。
 * 关键词判断只能作为平台 API 状态的补充证据。
 */
const isLocationPermissionError = (error) => {
  const message = getLocationErrorText(error, '').toLowerCase()

  return message.includes('auth deny') ||
    message.includes('authorize no response') ||
    message.includes('permission') ||
    message.includes('权限')
}

/**
 * 判断是否更像手机定位总开关关闭。
 */
const isLocationServiceDisabledError = (error) => {
  const message = getLocationErrorText(error, '').toLowerCase()

  return message.includes('location service is disabled') ||
    message.includes('gps is not enabled') ||
    message.includes('gps closed') ||
    message.includes('定位服务未开启') ||
    message.includes('位置服务未开启') ||
    message.includes('系统定位未开启')
}
```

### 2. 读取小程序自身的授权状态

```js
/**
 * 获取微信小程序自身的 userLocation 授权状态。
 * 其他平台返回 unknown，避免把平台差异伪装成确定结果。
 */
const getMiniProgramLocationScopeStatus = () => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    if (typeof uni.getSetting === 'function') {
      uni.getSetting({
        success: (settingResult) => {
          const locationScope = settingResult?.authSetting?.['scope.userLocation']

          if (locationScope === true) {
            resolve('authorized')
            return
          }

          if (locationScope === false) {
            resolve('denied')
            return
          }

          resolve('not-determined')
        },
        fail: () => resolve('unknown')
      })

      return
    }
    // #endif

    resolve('unknown')
  })
}
```

### 3. 合并系统、应用和小程序状态

```js
/**
 * 检查当前定位环境，并决定应该恢复哪一层。
 */
const inspectLocationEnvironment = async (error) => {
  let systemSetting = {}
  let appAuthorizeSetting = {}

  try {
    // locationEnabled 可用于判断系统定位服务是否开启。
    if (typeof uni.getSystemSetting === 'function') {
      systemSetting = uni.getSystemSetting() || {}
    }
  } catch (settingError) {
    console.warn('读取系统定位状态失败', settingError)
  }

  try {
    // locationAuthorized 可用于判断微信或当前 App 的系统权限。
    if (typeof uni.getAppAuthorizeSetting === 'function') {
      appAuthorizeSetting = uni.getAppAuthorizeSetting() || {}
    }
  } catch (authorizeError) {
    console.warn('读取应用定位权限失败', authorizeError)
  }

  const scopeStatus = await getMiniProgramLocationScopeStatus()
  const appPermissionDenied = appAuthorizeSetting.locationAuthorized === 'denied'

  // 系统总开关优先级最高。它关闭时，其他授权即使开启也无法定位。
  const serviceDisabled = (
    systemSetting.locationEnabled === false ||
    (
      systemSetting.locationEnabled !== true &&
      isLocationServiceDisabledError(error)
    )
  )

  let permissionTarget = ''

  if (!serviceDisabled) {
    // 两层都拒绝时，优先恢复宿主应用的系统权限。
    if (appPermissionDenied) {
      permissionTarget = 'app'
    } else if (scopeStatus === 'denied') {
      permissionTarget = 'scope'
    } else if (isLocationPermissionError(error)) {
      // 无法精确判断时，根据编译平台选择最可能的恢复入口。
      permissionTarget = 'app'

      // #ifdef MP-WEIXIN
      permissionTarget = 'scope'
      // #endif
    }
  }

  const userMessage = serviceDisabled
    ? '手机定位服务还没有开启'
    : permissionTarget === 'app'
      ? '微信或当前应用还没有系统定位权限'
      : permissionTarget === 'scope'
        ? '当前小程序还没有位置权限'
        : '暂时没能获取你的位置，请到开阔处后重试'

  return {
    serviceDisabled,
    permissionTarget,
    scopeStatus,
    appAuthorization: appAuthorizeSetting.locationAuthorized || 'unknown',
    userMessage
  }
}
```

这段代码最重要的不是 API 名称，而是判断顺序：

1. 先判断手机定位服务。
2. 再判断微信或当前 App 的系统权限。
3. 最后判断当前小程序权限。

平台能力并不完全一致。有些端无法精确读取某一层状态，只能结合失败信息推断。因此页面要保留“未知错误，可重新定位”的兜底状态。

## 十一、权限恢复不是弹一句“请授权”

用户拒绝权限后，需要把“缺少哪一层”和“应该进入哪里设置”对应起来。

### 1. 打开小程序或应用权限设置

```js
let locationSettingPending = false

/**
 * 打开正确的定位权限设置入口。
 * scope：当前小程序权限；app：微信或当前 App 的系统权限。
 */
const openLocationPermissionSetting = (permissionTarget) => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    if (permissionTarget === 'scope') {
      uni.openSetting({
        success: (settingResult) => {
          // 小程序设置页返回后，可以直接读取 scope.userLocation。
          resolve({
            opened: true,
            authorized: Boolean(
              settingResult?.authSetting?.['scope.userLocation']
            ),
            waitForReturn: false
          })
        },
        fail: () => resolve({
          opened: false,
          authorized: false,
          waitForReturn: false
        })
      })

      return
    }
    // #endif

    // 系统应用权限页无法立即确认用户最终选择，需要等待页面再次 onShow。
    if (permissionTarget === 'app' && typeof uni.openAppAuthorizeSetting === 'function') {
      locationSettingPending = true

      uni.openAppAuthorizeSetting({
        success: () => resolve({
          opened: true,
          authorized: false,
          waitForReturn: true
        }),
        fail: () => {
          locationSettingPending = false
          resolve({
            opened: false,
            authorized: false,
            waitForReturn: false
          })
        }
      })

      return
    }

    resolve({
      opened: false,
      authorized: false,
      waitForReturn: false
    })
  })
}
```

快速回忆：

- `uni.openSetting` 主要处理小程序 scope 权限。
- `uni.openAppAuthorizeSetting` 处理微信或 App 的系统应用权限。
- 打开系统设置页不等于已经授权，必须等用户返回后重新检查。

### 2. 从系统设置返回后重新定位

```js
import { onShow } from '@dcloudio/uni-app'

onShow(async () => {
  // 没有进入过系统设置时，不需要每次 onShow 都强制定位。
  if (!locationSettingPending) return

  locationSettingPending = false

  try {
    // force: true 表示忽略旧缓存，真正调用一次设备定位。
    await getLocation({ force: true })
  } catch (error) {
    // 重新失败后，getLocation 内部会再次检查权限环境。
    // 页面只需要保持可重试状态，不要假装用户已经授权成功。
  }
})
```

### 3. 手机定位总开关关闭时怎么办

不同平台能打开的系统页面不同：

- Android App 可以通过原生能力打开系统定位设置页。
- 微信小程序通常不能直接控制手机定位总开关。
- iOS 通常需要给出清晰的系统设置路径。

```js
/**
 * 尝试打开手机定位服务设置。
 * 无法直达时返回 false，由页面展示分步指引。
 */
const openSystemLocationSetting = async () => {
  // #ifdef APP-PLUS
  const platform = String(uni.getSystemInfoSync()?.platform || '').toLowerCase()

  if (platform === 'android') {
    try {
      locationSettingPending = true

      const mainActivity = plus.android.runtimeMainActivity()
      const Intent = plus.android.importClass('android.content.Intent')
      const Settings = plus.android.importClass('android.provider.Settings')
      const intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)

      mainActivity.startActivity(intent)
      return true
    } catch (error) {
      locationSettingPending = false
      console.error('打开系统定位设置失败', error)
    }
  }
  // #endif

  return false
}
```

无法直达时，提示要具体，例如：

```text
Android：下拉控制中心，打开“位置信息/GPS”；找不到时进入“设置 -> 位置信息”。
iOS：进入“设置 -> 隐私与安全性 -> 定位服务”，打开定位服务。
```

不要只显示“请打开权限”。用户需要知道应该打开手机总开关、微信权限，还是小程序权限。

## 十二、把权限恢复和业务提交分开

定位恢复入口只处理三件事：

1. 手机定位服务关闭时，打开设置或展示路径。
2. 应用或小程序权限拒绝时，进入对应权限页。
3. 环境正常时，强制重新定位。

```js
/**
 * 定位恢复入口，不直接执行考勤或其他业务提交。
 */
const handleLocationRecovery = async () => {
  if (locationLoading.value) return

  const environment = await inspectLocationEnvironment()

  if (environment.serviceDisabled) {
    const opened = await openSystemLocationSetting()

    if (!opened) {
      showLocationServiceGuide()
    }

    return
  }

  if (environment.permissionTarget) {
    // 先告诉用户进入设置页后要点什么，再真正跳转。
    const confirmed = await showPermissionGuide(environment.permissionTarget)
    if (!confirmed) return

    const settingResult = await openLocationPermissionSetting(
      environment.permissionTarget
    )

    if (settingResult.waitForReturn) return

    if (!settingResult.authorized) {
      uni.showToast({
        title: '定位权限仍未开启，请按提示重新设置',
        icon: 'none'
      })
      return
    }
  }

  // 用户主动点“重新定位”时不使用缓存。
  await getLocation({ force: true })
}
```

这段代码的核心是“恢复定位环境”，而不是“顺便提交业务”。职责分开后，定位按钮、页面自动刷新和正式提交都可以复用同一套服务。

## 十三、距离计算和范围三态

拿到位置后，业务通常需要判断是否进入某个圆形范围。

### 1. Haversine 距离

```js
const toRadians = (degrees) => degrees * Math.PI / 180

/**
 * 计算两个经纬度点之间的球面距离，返回米。
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const values = [lat1, lon1, lat2, lon2].map(Number)
  if (values.some((value) => !Number.isFinite(value))) {
    return Number.NaN
  }

  const [startLat, startLon, endLat, endLon] = values
  const earthRadius = 6371000
  const deltaLat = toRadians(endLat - startLat)
  const deltaLon = toRadians(endLon - startLon)
  const startLatRad = toRadians(startLat)
  const endLatRad = toRadians(endLat)

  const haversine = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLatRad) * Math.cos(endLatRad) *
    Math.sin(deltaLon / 2) ** 2

  // 浮点误差可能让值略小于 0 或略大于 1，先夹紧再开方。
  const safeValue = Math.min(1, Math.max(0, haversine))

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(safeValue),
    Math.sqrt(1 - safeValue)
  )
}
```

多个打卡点或巡检点应分别计算距离，取最近的有效点。

### 2. 为什么不能只写 `distance <= radius`

定位结果存在误差。设：

- `D`：测得距离。
- `R`：允许半径。
- `A`：定位精度估计。

当 `D = 110m`、`R = 100m`、`A = 30m` 时，测得点虽然超出 10 米，但误差估计有 30 米，不能直接断言用户确实在范围外。

推荐保留三态：

```text
inside     范围内
uncertain  精度不足或位于误差边界
outside    明确范围外
```

### 3. 平衡体验的范围策略

以下策略适合“测得点落入半径时优先允许，超出时再结合误差判断”的业务：

```js
const POOR_LOCATION_ACCURACY = 80

/**
 * 根据距离、半径和精度返回范围三态。
 */
const evaluateRange = ({ distance, radius, accuracy }) => {
  const safeDistance = Number(distance)
  const safeRadius = Number(radius)
  const safeAccuracy = Number(accuracy)

  if (!Number.isFinite(safeDistance) ||
      !Number.isFinite(safeRadius) ||
      safeRadius <= 0) {
    return 'uncertain'
  }

  // 当前测得点已经落入半径，按偏体验的业务规则判定为范围内。
  if (safeDistance <= safeRadius) return 'inside'

  const excessDistance = safeDistance - safeRadius

  // 精度未知、精度太差，或超出部分仍小于误差时，无法可靠下结论。
  if (!Number.isFinite(safeAccuracy) ||
      safeAccuracy > POOR_LOCATION_ACCURACY ||
      excessDistance <= safeAccuracy) {
    return 'uncertain'
  }

  // 超出部分明显大于定位误差时，才判定为范围外。
  return 'outside'
}
```

快速回忆：

- `uncertain` 不是 `outside`，它表示“信息不足，请重新定位”。
- 先判断范围内属于业务取舍，可以减少弱信号环境下的拦截。
- 精度差但测得点落入范围时仍放行，安全性会比严格策略低。

### 4. 更严格的误差区间策略

高风险业务可以把可能距离粗略理解为：

```text
[max(0, D - A), D + A]
```

```js
const evaluateStrictRange = ({ distance, radius, accuracy }) => {
  const safeDistance = Number(distance)
  const safeRadius = Number(radius)
  const safeAccuracy = Number(accuracy)

  if (!Number.isFinite(safeDistance) ||
      !Number.isFinite(safeRadius) ||
      !Number.isFinite(safeAccuracy) ||
      safeRadius <= 0 ||
      safeAccuracy <= 0) {
    return 'uncertain'
  }

  const minimumPossibleDistance = Math.max(0, safeDistance - safeAccuracy)
  const maximumPossibleDistance = safeDistance + safeAccuracy

  // 整个误差区间都在半径内，才确认范围内。
  if (maximumPossibleDistance <= safeRadius) return 'inside'

  // 整个误差区间都在半径外，才确认范围外。
  if (minimumPossibleDistance > safeRadius) return 'outside'

  return 'uncertain'
}
```

到底使用哪种策略，应由产品规则、场地环境和风险要求决定，不应由前端开发者自行猜测。

### 5. 将项目规则转换成统一范围结果

不同项目的点位字段可能是数组，也可能是历史字符串。建议先在适配层转换，再交给距离和三态函数。

```js
/**
 * 计算当前位置到多个目标点的最近距离。
 * rule.points 是本文约定的通用结构，真实项目可以先做字段转换。
 */
const buildRangeResult = (location, rule) => {
  if (!location) {
    return {
      status: 'uncertain',
      distance: null,
      nearestPoint: null
    }
  }

  const points = Array.isArray(rule?.points) ? rule.points : []
  let nearestPoint = null
  let minimumDistance = Infinity

  points.forEach((point) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      point.latitude,
      point.longitude
    )

    // 无效坐标返回 NaN，直接跳过，不让一条坏数据破坏全部判断。
    if (!Number.isFinite(distance)) return

    if (distance < minimumDistance) {
      minimumDistance = distance
      nearestPoint = point
    }
  })

  if (!Number.isFinite(minimumDistance)) {
    return {
      status: 'uncertain',
      distance: null,
      nearestPoint: null
    }
  }

  return {
    // 这里采用偏体验的平衡策略；高风险业务可替换为 evaluateStrictRange。
    status: evaluateRange({
      distance: minimumDistance,
      radius: rule.radius,
      accuracy: location.accuracy
    }),
    distance: minimumDistance,
    nearestPoint
  }
}
```

如果历史接口返回：

```text
locationGPS: "120.1,30.1;120.2,30.2"
distance: 100
```

可以先转换：

```js
/**
 * 将历史考勤规则适配为定位模块认识的通用结构。
 */
const adaptLegacyRule = (sourceRule) => {
  const points = String(sourceRule.locationGPS || '')
    .split(';')
    .map(parseCoordinateText)
    .filter(Boolean)

  return {
    id: sourceRule.checkID,
    points,
    radius: Number(sourceRule.distance)
  }
}
```

快速回忆：定位模块只认识 `points + radius`，原接口字段在适配层处理。这样换项目时，不需要修改距离公式、精度策略和权限逻辑。

## 十四、业务接口只放在最后一层适配

不同项目的规则字段、接口参数和返回结构都可能不同，所以定位模块不应依赖 `checkID`、`code === 200` 或某个固定地址字段。

可以先返回统一的业务前置结果：

```js
/**
 * 为任意位置业务准备一条可提交的位置。
 * rule 只需要能提供打卡点和半径，接口字段由调用方自己映射。
 */
const prepareLocationForAction = async (rule) => {
  let location = currentLocationResult

  // 先用当前缓存重新计算范围，避免依赖页面里的旧布尔值。
  let rangeResult = buildRangeResult(location, rule)

  if (!canReuseLocationForAction(rangeResult.status)) {
    location = await getLocation({ force: true })
    rangeResult = buildRangeResult(location, rule)
  }

  if (rangeResult.status === 'uncertain') {
    throw new Error('LOCATION_UNCERTAIN')
  }

  if (rangeResult.status === 'outside') {
    throw new Error('OUTSIDE_ALLOWED_RANGE')
  }

  return {
    longitude: location.longitude,
    latitude: location.latitude,
    accuracy: location.accuracy,
    coordinateType: location.coordinateType,
    locatedAt: new Date(location.timestamp).toISOString(),
    distance: rangeResult.distance
  }
}
```

业务页面再负责映射自己的接口：

```js
const handleClockIn = async (rule) => {
  const location = await prepareLocationForAction(rule)

  // 这里只展示适配思路，不规定所有项目必须使用这些字段。
  await submitClockInApi({
    ruleId: rule.id,
    longitude: location.longitude,
    latitude: location.latitude,
    accuracy: location.accuracy,
    coordinateType: location.coordinateType
  })
}
```

换成其他项目时，通常只改两处：

- `buildRangeResult` 如何读取项目自己的打卡点和半径字段。
- 最后提交接口如何映射参数和处理业务结果。

定位、权限和范围逻辑不需要跟着接口字段重写。

## 十五、页面状态要帮助用户恢复

定位页面至少需要区分：

```text
idle         尚未定位
locating     正在定位
retrying     首次精度不足，正在补充定位
ready        已获得位置
error        定位失败
```

错误状态还应保留：

```text
serviceDisabled   手机定位服务关闭
permissionTarget  app 或 scope
errorText         给用户看的简短说明
```

页面动作可以按状态映射：

| 状态 | 主提示 | 可执行动作 |
| --- | --- | --- |
| 定位中 | 正在获取高精度位置 | 禁止重复点击 |
| 手机定位关闭 | 手机定位服务未开启 | 查看开启步骤 |
| 应用权限拒绝 | 微信或应用定位权限未开启 | 去系统设置 |
| 小程序权限拒绝 | 小程序位置权限未开启 | 去小程序设置 |
| 精度不足 | 当前位置不够准确 | 重新定位 |
| 明确范围外 | 当前不在允许范围 | 查看距离或移动到目标区域 |

错误提示不要只说“定位失败”。用户真正需要知道的是：失败在哪一层、下一步应该做什么。

## 十六、常见错误写法

### 1. 每次点击都强制定位

问题：用户刚定位完成，点击业务按钮又等待一次。

改进：短时间、精度合格、当前规则仍在范围内时复用位置，否则才刷新。

### 2. 所有失败都调用 `uni.openSetting`

问题：`uni.openSetting` 不能解决手机 GPS 关闭，也不一定能恢复微信或 App 的系统权限。

改进：先判断 `service`、`app`、`scope` 三层，再进入对应入口。

### 3. 打开设置页后立即提示“授权成功”

问题：打开系统设置只代表跳转成功，不代表用户真的修改了权限。

改进：设置 `locationSettingPending`，等页面再次 `onShow` 后强制重新定位验证。

### 4. 定位失败就切换坐标系

问题：权限拒绝和系统定位关闭与坐标类型无关，切换坐标系只会制造第二次无效请求。

改进：只有明确“不支持 GCJ-02”时才降级到 WGS-84。

### 5. 只用 `distance > radius` 判断范围外

问题：边界附近的定位误差会造成误判。

改进：保留 `uncertain` 状态，结合业务风险选择平衡策略或严格区间策略。

### 6. 定位逻辑直接依赖业务接口字段

问题：换一个项目或接口，整套定位代码都要重写。

改进：定位模块输出标准位置，业务适配层负责字段映射。

## 十七、上线前测试清单

### 定位请求

- [ ] 第一次精度合格时不请求第二次。
- [ ] 第一次精度不足时最多补一次，并选择更优结果。
- [ ] 第二次失败时保留第一次有效结果。
- [ ] 定位 API 不回调时，业务超时正常结束 loading。
- [ ] `onShow` 和用户点击同时触发时复用同一 Promise。
- [ ] 用户主动重新定位时忽略普通缓存。

### 坐标和范围

- [ ] 设备、地图、后台点位和服务端使用同一坐标系。
- [ ] 经度、纬度顺序在前后端一致。
- [ ] 只有明确不支持 GCJ-02 时才走 WGS-84 降级。
- [ ] 多个目标点时取最近有效点。
- [ ] 边界位置返回 `uncertain`，不直接误报范围外。
- [ ] 精度缺失、半径无效和坐标错误时不静默放行。

### 权限恢复

- [ ] 手机定位总开关关闭。
- [ ] 微信或 App 的系统定位权限拒绝。
- [ ] 当前小程序位置权限拒绝。
- [ ] 多层权限同时关闭时优先恢复底层依赖。
- [ ] 无法直达设置页时仍有清晰步骤。
- [ ] 打开设置但没有修改权限，返回后仍显示真实状态。
- [ ] 完成授权后，返回页面自动重新定位验证。

### 页面稳定性

- [ ] 快速连续点击不会重复定位。
- [ ] 页面卸载后没有残留定时器和过期回写。
- [ ] 旧地址解析结果不会覆盖新坐标。
- [ ] 小屏下状态文字和操作按钮不溢出。
- [ ] 原始平台错误只进入日志，不直接展示给普通用户。

## 十八、快速复习口诀

以后再写 uni-app 定位功能，先回忆这七句话：

1. 定位结果要带坐标系、精度和时间。
2. 单次定位必须有业务超时和重复回调保护。
3. 第一次合格就停，不合格最多补一次。
4. 串行重复靠缓存，并发重复靠 Promise 复用。
5. GPS、应用权限、小程序权限必须分层判断。
6. 打开设置不等于授权成功，返回后要重新定位验证。
7. 定位模块输出标准结果，业务接口只在最后一层适配。

掌握这七点后，即使项目接口、规则字段和页面结构完全不同，也能快速搭建一条稳定、可恢复、便于排查的移动端定位链路。
