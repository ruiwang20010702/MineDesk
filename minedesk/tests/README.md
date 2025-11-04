# MineDesk Testing Guide

## 🧪 测试框架

MineDesk 使用以下测试工具：

- **Vitest** - 快速的单元测试框架
- **@testing-library/react** - React 组件测试
- **happy-dom** - 轻量级 DOM 环境
- **@vitest/coverage-v8** - 代码覆盖率

---

## 🚀 运行测试

### 运行所有测试
```bash
pnpm test
```

### 监听模式（开发时使用）
```bash
pnpm test:watch
```

### 可视化测试界面
```bash
pnpm test:ui
```

### 生成覆盖率报告
```bash
pnpm test:coverage
```

---

## 📁 测试文件组织

```
src/
├── main/
│   └── services/
│       ├── DatabaseService.ts
│       └── __tests__/
│           └── DatabaseService.test.ts
│
└── renderer/src/
    └── hooks/
        ├── useChat.ts
        ├── useConversationHistory.ts
        └── __tests__/
            ├── useChat.test.ts
            └── useConversationHistory.test.ts
```

测试文件命名规则：`*.test.ts` 或 `*.spec.ts`

---

## 📝 测试示例

### 1. 服务层测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { DatabaseService } from '../DatabaseService'

describe('DatabaseService', () => {
  let dbService: DatabaseService

  beforeEach(() => {
    dbService = new DatabaseService()
    dbService.initialize()
  })

  it('should create a conversation', () => {
    const conv = dbService.createConversation('test-id', 'Test')
    expect(conv.id).toBe('test-id')
  })
})
```

### 2. React Hook 测试

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useConversationHistory } from '../useConversationHistory'

it('should load messages', async () => {
  const { result } = renderHook(() => 
    useConversationHistory('conv-1')
  )

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  expect(result.current.conversation).toBeDefined()
})
```

### 3. 组件测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

it('should handle click', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByText('Click me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

---

## 🎯 测试覆盖率目标

| 类型 | 目标覆盖率 | 当前状态 |
|------|-----------|---------|
| 服务层 | 80%+ | 🟢 实现中 |
| Hooks | 70%+ | 🟢 实现中 |
| 组件 | 60%+ | 🟡 待添加 |
| 工具函数 | 90%+ | 🟡 待添加 |

---

## 🔧 Mock 策略

### Electron APIs

测试中自动 mock：
```typescript
// vitest.setup.ts
global.window = {
  api: {
    database: {
      getMessages: vi.fn(),
      saveMessage: vi.fn(),
      // ... more mocks
    }
  }
}
```

### 外部服务

使用 Mock Service Worker (MSW) 模拟 API 调用：
```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('http://localhost:8000/api/chat', (req, res, ctx) => {
    return res(ctx.json({ content: 'Mocked response' }))
  })
)
```

---

## ✅ 测试最佳实践

### 1. 测试命名
- 使用清晰的描述性名称
- 使用 `should` 或 `应该` 开头
- 示例：`it('should save message to database', ...)`

### 2. AAA 模式
```typescript
it('should do something', () => {
  // Arrange - 准备测试数据
  const input = 'test'
  
  // Act - 执行操作
  const result = doSomething(input)
  
  // Assert - 验证结果
  expect(result).toBe('expected')
})
```

### 3. 隔离测试
- 每个测试独立运行
- 使用 `beforeEach` 重置状态
- 清理副作用

### 4. 测试边界情况
```typescript
it('should handle empty input', () => {
  expect(process('')).toBe('')
})

it('should handle null', () => {
  expect(process(null)).toBeNull()
})

it('should handle large data', () => {
  const largeArray = Array(10000).fill('data')
  expect(() => process(largeArray)).not.toThrow()
})
```

---

## 🐛 调试测试

### 1. 使用 `test.only`
```typescript
it.only('should debug this test', () => {
  // 只运行这个测试
})
```

### 2. 查看失败详情
```bash
pnpm test -- --reporter=verbose
```

### 3. 使用 Vitest UI
```bash
pnpm test:ui
# 在浏览器中查看测试结果
```

---

## 📊 持续集成

### GitHub Actions 配置

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

---

## 🎓 学习资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## 📈 未来改进

- [ ] 添加 E2E 测试（Playwright）
- [ ] 提高组件测试覆盖率
- [ ] 添加性能基准测试
- [ ] 集成可视化回归测试
- [ ] 添加 CI/CD 自动化测试

---

**保持测试更新，确保代码质量！** ✅

