# 可拖拽秒表 Chrome 扩展

一个可拖动的秒表，悬浮在页面上实时计时，单击归零并重新计时。支持视频全屏时自动重挂载。

## 功能特性

- ⏱ 数字秒表显示 `MM:SS`
- 🔄 单击归零并重新计时
- 🎯 随意拖拽到任意位置，位置自动保存（localStorage 按域名隔离）
- 🖥️ 视频全屏时秒表自动移入全屏元素，保持可见
- 🔄 自动适配单页应用（MutationObserver 监听 DOM 重建）
- 📱 支持鼠标和触摸操作

## 安装方法

1. 打开 Chrome → 进入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"，选择 `draggable_timer` 目录

## 文件结构

```
manifest.json        # 扩展配置文件（Manifest V3）
content.js           # 内容脚本：秒表逻辑、拖拽、全屏重挂载
styles.css           # 毛玻璃药丸样式
test/
├── content.test.js  # 单元测试（20 个用例，覆盖核心逻辑）
└── vitest.config.js # 测试环境配置（jsdom）
package.json         # 依赖与脚本（npm test 运行测试）
.gitignore           # 排除 node_modules/ 等
```

## 使用方法

- **拖拽**：按住秒表并拖动到任意位置，松手后位置自动保存
- **计时**：单击秒表归零并开始计时，再次单击重新归零

## 测试

```bash
npm test
```

测试框架 Vitest + jsdom，20 个测试覆盖：`pad`、`formatTime`、`tick`、`resetStopwatch`、`savePosition`、`reparentStopwatch`。

## 技术细节

- Manifest V3，纯前端实现，无需后台脚本
- `position: fixed` 固定定位，`z-index: 10000` 置顶
- CSS `touch-action: none` + `backdrop-filter` 毛玻璃效果
- 拖拽逻辑带视口边界约束，支持鼠标和触摸事件
- 全屏方案：监听 `fullscreenchange` / `webkitfullscreenchange`，将秒表容器移至 `document.fullscreenElement`
- `MutationObserver` 监听 DOM 变化，防止秒表在 SPA 路由切换时丢失
- 鼠标/触摸事件提升到 `document` 级，只注册一次避免重复绑定

## 注意事项

- 部分受限制页面（如 chrome://）无法注入内容脚本
