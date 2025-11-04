# 🎯 MineDesk 开发 - 下一步行动指南

> **当前状态**：✅ MineContext 已就绪 | 🔲 Screenpipe 待启动 | 🔲 前端待开发

---

## ⚡ 快速开始（3 步，15 分钟）

### 第 1 步：检查 Screenpipe 编译状态

```bash
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"

# 检查是否已编译
if [ -f "target/release/screenpipe" ]; then
    echo "✅ Screenpipe 已编译，可以直接启动"
else
    echo "🔨 需要编译 Screenpipe（预计 15-20 分钟）"
    echo "运行: cargo build --release"
fi
```

**如果需要编译**：
```bash
# 安装 Rust（如果没有）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 编译 Screenpipe
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"
cargo build --release
```

---

### 第 2 步：启动 Screenpipe（记忆层）

```bash
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"

# 启动（会在前台运行）
./target/release/screenpipe --data-dir ~/.screenpipe
```

**重要提示**：
1. **首次启动会请求权限**：
   - 📸 **屏幕录制权限**（必须）
   - 🎤 **麦克风权限**（可选，用于语音记录）
   - ♿ **辅助功能访问**（可选）

2. **授予权限后**：
   - 重启 Screenpipe
   - 让它运行 10 分钟
   - 在此期间正常使用电脑（浏览网页、编辑文档等）

3. **后台运行**（推荐使用 tmux 或新终端窗口）：
   ```bash
   # 使用 nohup 后台运行
   nohup ./target/release/screenpipe --data-dir ~/.screenpipe > ~/.screenpipe/screenpipe.log 2>&1 &
   
   # 查看进程
   ps aux | grep screenpipe
   
   # 查看日志
   tail -f ~/.screenpipe/screenpipe.log
   ```

---

### 第 3 步：启动同步服务（连接记忆层→理解层）

**等待 10 分钟后**（让 Screenpipe 采集一些数据），在新终端运行：

```bash
cd "/Users/ruiwang/Desktop/killer app"

# 测试同步（执行一次）
python3 screenpipe_sync.py --once
```

**如果测试成功，启动持续同步**：
```bash
# 后台运行同步服务（每小时同步一次）
nohup python3 screenpipe_sync.py > screenpipe_sync.log 2>&1 &

# 查看日志
tail -f screenpipe_sync.log
```

---

## ✅ 验证完整链路

运行 10 分钟后，测试"记忆→理解→检索"是否打通：

```bash
cd "/Users/ruiwang/Desktop/killer app"

# 测试检索桌面活动
curl -X POST http://127.0.0.1:17860/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我最近在做什么工作？使用了哪些应用？",
    "sessionId": "test-screenpipe-001"
  }'
```

**预期结果**：
- 返回您最近的桌面活动
- 包含应用名称、窗口标题
- 可能包含部分 OCR 识别的文本内容

---

## 📊 监控与调试

### 查看 Screenpipe 数据

```bash
# 进入 SQLite
sqlite3 ~/.screenpipe/db.sqlite

# 查看统计
SELECT 
    COUNT(*) as total_frames,
    MIN(timestamp) as first_frame,
    MAX(timestamp) as last_frame
FROM frames;

# 查看最近的活动
SELECT 
    timestamp,
    app_name,
    window_name
FROM frames
ORDER BY timestamp DESC
LIMIT 10;

# 查看 OCR 文本数量
SELECT COUNT(*) as total_ocr_texts FROM ocr_text;

# 退出
.quit
```

### 查看同步日志

```bash
# 实时查看
tail -f screenpipe_sync.log

# 查看最近 50 行
tail -50 screenpipe_sync.log

# 搜索错误
grep "❌" screenpipe_sync.log
```

### 查看 MineContext 数据

```bash
# 访问 API 文档
open http://127.0.0.1:17860/docs

# 查看健康状态
curl http://127.0.0.1:17860/api/health

# 搜索 screenpipe 来源的文档
curl -X POST http://127.0.0.1:17860/api/search/text \
  -H "Content-Type: application/json" \
  -d '{
    "query": "*",
    "filters": {"source": "screenpipe"},
    "top_k": 10
  }'
```

---

## 🎨 下一步：前端开发

完成上述步骤后，就可以开始前端开发了：

### 评估 MineContext 前端

```bash
cd "/Users/ruiwang/Desktop/killer app/MineContext-main/frontend"

# 查看项目结构
ls -la

# 安装依赖
pnpm install

# 启动开发模式
pnpm dev
```

**浏览器访问**：通常会在 `http://localhost:5173` 或类似地址

### 前端开发任务清单

- [ ] 修改 UI 样式和布局
- [ ] 实现全局快捷键（Cmd+Shift+Space）
- [ ] 优化智能对话界面
- [ ] 添加上下文展示面板
- [ ] 实现设置界面
- [ ] 添加会话历史管理

---

## 🤖 可选：CrewAI 周报生成

如果您想尝试多智能体协作，可以运行周报生成示例：

```bash
cd "/Users/ruiwang/Desktop/killer app"

# 安装 CrewAI
/opt/homebrew/bin/python3.11 -m pip install crewai crewai-tools

# 创建周报生成脚本（参考 MINEDESK_ROADMAP.md）
# 然后运行
python3 crewai_agents/weekly_report.py
```

---

## 🆘 常见问题

### Q1: Screenpipe 编译失败

**解决方案**：
```bash
# 更新 Rust
rustup update

# 安装必要依赖（macOS）
brew install pkg-config

# 重新编译
cargo clean
cargo build --release
```

### Q2: Screenpipe 无法捕获屏幕

**解决方案**：
1. 检查权限：系统偏好设置 → 安全性与隐私 → 屏幕录制
2. 将终端（或 iTerm）添加到允许列表
3. 重启 Screenpipe

### Q3: 同步脚本报错 "找不到数据库"

**解决方案**：
```bash
# 确保 Screenpipe 正在运行
ps aux | grep screenpipe

# 检查数据库是否存在
ls -la ~/.screenpipe/db.sqlite

# 如果不存在，启动 Screenpipe 并等待几分钟
```

### Q4: MineContext API 无法连接

**解决方案**：
```bash
# 检查 MineContext 是否运行
curl http://127.0.0.1:17860/api/health

# 如果没有响应，启动 MineContext
cd "/Users/ruiwang/Desktop/killer app"
./start_minecontext.sh

# 查看日志
tail -f /tmp/minecontext.log
```

### Q5: 前端无法连接后端

**解决方案**：
1. 确保后端运行在 `http://127.0.0.1:17860`
2. 检查前端配置文件中的 API 地址
3. 查看浏览器控制台的网络请求

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| **MINEDESK_ROADMAP.md** | 完整的开发路线图（30 周计划） |
| **README_START_HERE.md** | MineContext 快速入门 |
| **QUICK_REFERENCE.md** | 命令速查表 |
| **MineDesk PRD v1.6** | 产品需求文档 |
| **DELIVERY_SUMMARY.md** | MineContext 交付总结 |

---

## 🎯 当前优先级

### P0（最高优先级，本周必做）
- [ ] 启动 Screenpipe
- [ ] 实现同步链路
- [ ] 验证完整功能

### P1（重要，2 周内完成）
- [ ] 前端环境搭建
- [ ] 实现核心 UI 功能
- [ ] 优化用户体验

### P2（可选，1 个月内）
- [ ] CrewAI 周报生成
- [ ] MCP 平台集成
- [ ] 知识图谱构建

---

## 💡 推荐工作流

**每天开始工作时**：
```bash
# 1. 启动 MineContext
cd "/Users/ruiwang/Desktop/killer app"
./start_minecontext.sh

# 2. 启动 Screenpipe（如果没有运行）
cd screenpipe-main
nohup ./target/release/screenpipe > ~/.screenpipe/screenpipe.log 2>&1 &

# 3. 启动同步服务（如果没有运行）
cd "/Users/ruiwang/Desktop/killer app"
nohup python3 screenpipe_sync.py > screenpipe_sync.log 2>&1 &

# 4. 正常使用电脑，系统会自动采集和理解您的工作上下文
```

**每天结束工作时**：
```bash
# 查看今天的活动总结
curl -X POST http://127.0.0.1:17860/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "总结一下我今天的工作内容",
    "sessionId": "daily-summary"
  }'
```

---

## ✅ 完成标志

当您完成以下检查项，说明基础系统已经搭建完成：

- [ ] Screenpipe 持续运行，每分钟捕获 1-2 个屏幕快照
- [ ] 同步服务每小时自动同步一次
- [ ] MineContext 能够检索到桌面活动
- [ ] 智能对话能够回答关于工作上下文的问题
- [ ] CPU 占用 < 30%，内存占用 < 2GB

---

**祝开发顺利！** 🚀

有任何问题，随时查阅文档或检查日志。

