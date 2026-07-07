# 可拖拽秒表 Chrome 扩展

一个可拖动的秒表，悬浮在页面上实时计时，单击归零并重新计时。

## 功能特性

- ⏱ 数字秒表显示 `MM:SS`
- 🎯 可随意拖拽到任意位置
- 🔄 单击归零并重新计时
- 📱 支持桌面和移动设备
- 🔍 自动适配单页应用（MutationObserver）
- 💾 记忆秒表位置（localStorage 按域名隔离）

## 安装方法

1. 打开 Chrome → 进入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"，选择 `draggable_timer` 目录

## 文件结构

```
manifest.json    # 扩展配置文件（Manifest V3）
content.js       # 内容脚本，实现秒表与拖拽逻辑
styles.css       # 秒表样式（毛玻璃药丸）
README.md        # 说明文档
```

## 使用方法

- **拖拽**：按住秒表并拖动到任意位置，松手后位置自动保存
- **计时**：单击秒表归零并开始计时，再次单击重新归零

## 技术细节

- Manifest V3，纯前端实现，无需后台脚本
- `position: fixed` 固定定位，`z-index: 10000` 置顶
- CSS `touch-action: none` + `backdrop-filter` 毛玻璃效果
- 鼠标/触摸拖拽逻辑带视口边界约束
- `MutationObserver` 监听 DOM 变化，防止秒表被意外移除

## 注意事项

- 部分受限制页面（如 chrome://）无法注入内容脚本
