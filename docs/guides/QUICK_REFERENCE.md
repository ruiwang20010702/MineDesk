# 🚀 MineContext 快速参考

## 🎯 一分钟快速开始

### 1. 启动服务

```bash
cd "/Users/ruiwang/Desktop/killer app"
./start_minecontext.sh
```

或手动启动：

```bash
cd MineContext-main
python3.11 -m opencontext start --host 127.0.0.1 --port 17860
```

### 2. 验证运行

```bash
curl http://127.0.0.1:17860/api/health
```

### 3. 导入文档

```bash
python3 import_prd.py
```

### 4. 测试检索

```bash
python3 demo_rag_success.py
```

---

## 📚 常用 API 命令

### 健康检查

```bash
curl http://127.0.0.1:17860/api/health
```

### 上传文档

```bash
curl -X POST http://127.0.0.1:17860/api/documents/upload \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/path/to/document.md"}'
```

### 向量检索

```bash
curl -X POST http://127.0.0.1:17860/api/vector_search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "MineDesk的核心功能",
    "top_k": 5,
    "context_types": [],
    "filters": null
  }'
```

---

## 🐍 Python 示例

### 导入文档

```python
import requests

# 上传文档
response = requests.post(
    "http://127.0.0.1:17860/api/documents/upload",
    json={"file_path": "/absolute/path/to/doc.md"}
)
print(response.json())
```

### 向量搜索

```python
import requests

# 语义检索
response = requests.post(
    "http://127.0.0.1:17860/api/vector_search",
    json={
        "query": "查询内容",
        "top_k": 5,
        "context_types": [],
        "filters": None
    }
)

result = response.json()
if result["code"] == 0:
    for item in result["data"]["results"]:
        context = item["context"]
        summary = context["extracted_data"]["summary"]
        score = item["score"]
        print(f"[{score:.3f}] {summary[:200]}...")
```

---

## 🛠️ 常见任务

### 查看日志

```bash
tail -f MineContext-main/logs/opencontext_2025-11-04.log
```

### 检查数据库

```bash
# 向量数据
ls -lh MineContext-main/persist/chromadb/

# 文档数据
sqlite3 MineContext-main/persist/sqlite/app.db "SELECT * FROM documents LIMIT 10;"
```

### 停止服务

按 `Ctrl+C` 或：

```bash
# 查找进程
ps aux | grep opencontext

# 停止进程
kill <PID>
```

---

## ⚡ 性能优化

### 快速检索（推荐）

使用 `/api/vector_search` - 响应时间 < 2 秒

```python
# ✅ 推荐：快速向量搜索
requests.post("http://127.0.0.1:17860/api/vector_search", ...)
```

### 复杂对话

使用 `/api/agent/chat` - 响应时间 45+ 秒

```python
# ⚠️ 慢速：Agent 多步推理
requests.post("http://127.0.0.1:17860/api/agent/chat", ...)
```

---

## 📊 系统状态

### 检查服务状态

```bash
# 检查端口
lsof -i :17860

# 检查进程
ps aux | grep "opencontext"

# 检查资源使用
top -p $(pgrep -f opencontext)
```

### 数据统计

```bash
# 向量数据大小
du -sh MineContext-main/persist/chromadb/

# 文档数量
sqlite3 MineContext-main/persist/sqlite/app.db \
  "SELECT COUNT(*) FROM documents;"
```

---

## 🐛 故障排查

### 问题 1: 服务启动失败

**检查**:
```bash
# 端口占用
lsof -i :17860

# 配置文件
cat MineContext-main/config/user_setting.yaml
```

**解决**:
- 停止占用端口的进程
- 检查 API Key 配置是否正确

### 问题 2: 查询超时

**原因**:
- Agent 工作流多次调用工具
- SiliconFlow API 响应慢

**解决**:
- 使用 `/api/vector_search` 代替 `/api/agent/chat`
- 增加超时时间：`timeout=60`

### 问题 3: 找不到结果

**检查**:
```bash
# 查看日志
tail -50 MineContext-main/logs/opencontext_2025-11-04.log | grep "Processing document"

# 检查数据库
sqlite3 MineContext-main/persist/sqlite/app.db \
  "SELECT id, file_path, status FROM documents;"
```

**解决**:
- 等待文档处理完成（查看日志）
- 重新上传文档
- 检查文档路径是否正确

---

## 🔗 重要链接

- **API 文档**: http://127.0.0.1:17860/docs
- **健康检查**: http://127.0.0.1:17860/api/health
- **日志位置**: `MineContext-main/logs/`
- **配置文件**: `MineContext-main/config/user_setting.yaml`
- **详细报告**: `MINECONTEXT_VALIDATION_REPORT.md`

---

## 💡 最佳实践

### 1. 文档管理

- ✅ 使用绝对路径上传文档
- ✅ 文档大小控制在 10MB 以内
- ✅ 优先使用 Markdown 格式
- ✅ 定期清理过期文档

### 2. 查询优化

- ✅ 简单检索使用向量搜索
- ✅ 复杂对话使用 Agent
- ✅ 使用合适的 top_k 值（推荐 3-5）
- ✅ 添加上下文类型过滤

### 3. 系统维护

- ✅ 定期查看日志
- ✅ 监控磁盘空间
- ✅ 备份重要数据
- ✅ 更新 API Key

---

## 📞 获取帮助

### 查看完整文档

```bash
cat MINECONTEXT_VALIDATION_REPORT.md
```

### 运行验证脚本

```bash
python3 demo_rag_success.py
```

### 检查配置

```bash
cat MineContext-main/config/user_setting.yaml
```

---

**最后更新**: 2025-11-04  
**版本**: MineContext v0.1.0

