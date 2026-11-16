# 节日主题图标

本目录仅保存随前端构建内联的可信 SVG。节日名称选择规则位于 `src/utils/festival/festivalIconAssets.js`，列表、倒计时、公开页和控制台庆祝弹窗使用同一规则。

## OpenMoji

以 Unicode 码点命名的 160 个 SVG 改编自 **OpenMoji**，作者为 OpenMoji contributors / HfG Schwäbisch Gmünd。

- 项目：https://openmoji.org/
- 原图：https://openmoji.org/data/color/svg/（文件名为大写 Unicode 码点，例如 `1F328.svg`）
- 上游源码：https://github.com/hfg-gmuend/openmoji
- 图形许可：**CC BY-SA 4.0**，https://creativecommons.org/licenses/by-sa/4.0/
- 获取日期：2026-11-16

本项目修改：统一可见区域和留白、加粗过细线条、将黑色描边改为可随浅色/深色主题变化的 `currentColor`，调整云朵和雪花配色，移除未使用的 ID 和空组。适配后的图形继续按 CC BY-SA 4.0 提供。

`spring-equinox`、`grain-rain`、`summer-start`、`great-heat`、`white-dew`、`autumn-equinox`、`cold-dew`、`frost`、`great-cold`、`qingming` 使用上述图案组合自然现象；`grain-full` 是麦穗的青绿色变体，同样遵循 CC BY-SA 4.0。

## 补充节俗图案

`zongzi`（粽子）、`tangyuan`（汤圆）、`lantern`（圆灯笼）为本项目补充的节日插图，与 OpenMoji 保持相近的色板和轮廓，按 CC BY-SA 4.0 提供。它们只用于节日展示，不替代工作台中的按钮或操作图标。

历史 `public/assets/festival-icons` 中的 Twemoji 文件保留原许可和旧地址兼容；当前节日组件不再请求这些固定地址。
