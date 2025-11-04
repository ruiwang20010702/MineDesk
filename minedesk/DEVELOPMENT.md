# MineDesk 开发指南

## 快速开始

### 启动开发环境

```bash
# 方式 1: 使用启动脚本（推荐）
./start-dev.sh

# 方式 2: 直接使用 pnpm
pnpm dev
```

### 开发服务器信息

- **主进程**: 自动编译到 `out/main/`
- **预加载脚本**: 自动编译到 `out/preload/`
- **渲染进程**: 开发服务器运行在 `http://localhost:5173`
- **热重载**: 渲染进程支持 HMR，主进程修改需要重启

## 项目结构

```
minedesk/
├── src/
│   ├── main/           # Electron 主进程
│   │   └── index.ts
│   ├── preload/        # 预加载脚本
│   │   └── index.ts
│   └── renderer/       # React 渲染进程
│       ├── App.tsx
│       └── main.tsx
├── out/                # 构建输出（自动生成）
├── dist/               # 打包输出（自动生成）
└── electron-builder.yml # 打包配置
```

## 开发工作流

### 1. 修改渲染进程（前端）

修改 `src/renderer/` 下的文件，浏览器会自动热重载。

### 2. 修改主进程

修改 `src/main/` 下的文件后，需要重启 Electron（开发服务器会自动重启）。

### 3. 调试

- **渲染进程**: 使用 Chrome DevTools（Electron 窗口中按 F12）
- **主进程**: 在 VSCode 中使用调试配置

## 可用命令

```bash
# 开发
pnpm dev              # 启动开发环境

# 构建
pnpm build            # 构建生产版本
pnpm build:win        # 构建 Windows 版本
pnpm build:mac        # 构建 macOS 版本
pnpm build:linux      # 构建 Linux 版本

# 测试
pnpm test             # 运行测试
pnpm test:ui          # 运行测试 UI
pnpm test:coverage    # 生成测试覆盖率报告

# 代码质量
pnpm lint             # 运行 ESLint
pnpm format           # 格式化代码
pnpm typecheck        # TypeScript 类型检查
```

## 环境配置

### Electron 镜像配置

如果 Electron 下载缓慢，项目已配置使用国内镜像（`.npmrc`）：

```
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 常见问题

#### 1. Electron 安装失败

```bash
# 清理并重新安装
rm -rf node_modules
pnpm install
```

#### 2. 端口 5173 被占用

```bash
# 查找占用进程
lsof -ti:5173

# 终止进程
kill -9 $(lsof -ti:5173)
```

#### 3. 原生模块编译失败

```bash
# 重新编译原生模块
pnpm rebuild
```

## 技术栈

- **Electron**: v39.0.0
- **React**: v19.0.0
- **TypeScript**: v5.7.3
- **Vite**: v7.1.12
- **构建工具**: electron-vite v4.0.1
- **测试框架**: Vitest v3.1.5
- **UI 组件**: Ant Design v5.23.1

## 架构设计

MineDesk 采用 Electron 的多进程架构：

1. **主进程 (Main Process)**
   - 负责窗口管理、系统交互
   - 位于 `src/main/`

2. **渲染进程 (Renderer Process)**
   - 运行 React 应用
   - 位于 `src/renderer/`

3. **预加载脚本 (Preload Script)**
   - 安全地暴露 API 给渲染进程
   - 位于 `src/preload/`

## 下一步

- 完善测试覆盖率
- 添加 E2E 测试
- 优化打包体积
- 添加自动更新功能
