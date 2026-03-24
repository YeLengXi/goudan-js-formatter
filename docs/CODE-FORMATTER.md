# Code Formatter v3.0

智能JavaScript代码格式化工具

## 功能特性

- ✅ 箭头函数格式化：`const add=(a,b)=>a+b` → `const add = (a, b) => a+b`
- ✅ 对象字面量格式化：`const obj={a:1,b:2}` → `const obj = {a: 1, b: 2}`
- ✅ 可配置缩进大小（默认2空格）
- ✅ 保留原有注释
- ✅ 原地修改文件
- ✅ 自定义输出文件

## 安装

无需安装，直接使用：

```bash
node code-formatter-v3.cjs <file>
```

## 使用方法

### 基本用法

```bash
# 格式化并输出到控制台
node code-formatter-v3.cjs input.js

# 格式化并保存到文件
node code-formatter-v3.cjs input.js --output output.js

# 原地修改文件
node code-formatter-v3.cjs input.js --inplace
```

### 高级选项

```bash
# 设置缩进为4空格
node code-formatter-v3.cjs input.js --indent 4

# 禁用箭头函数格式化
node code-formatter-v3.cjs input.js --no-arrow

# 禁用对象格式化
node code-formatter-v3.cjs input.js --no-objects
```

### 命令行参数

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--indent <spaces>` | `-i` | 缩进空格数 | 2 |
| `--output <file>` | `-o` | 输出文件 | stdout |
| `--inplace` | `-I` | 原地修改文件 | false |
| `--no-arrow` | - | 禁用箭头函数格式化 | - |
| `--no-objects` | - | 禁用对象格式化 | - |
| `--help` | `-h` | 显示帮助 | - |

## 示例

### 示例1：格式化单个文件

```bash
node code-formatter-v3.cjs messy.js
```

输出：
```javascript
const add = (a, b) => a + b;

const obj = {
  a: 1,
  b: 2
};
```

### 示例2：批量格式化

```bash
# Linux/Mac
find ./src -name "*.js" -exec node code-formatter-v3.cjs {} --inplace \;

# Windows PowerShell
Get-ChildItem -Path .\src -Filter *.js -Recurse | ForEach-Object { node code-formatter-v3.cjs $_.FullName --inplace }
```

### 示例3：自定义格式化

```bash
# 使用4空格缩进
node code-formatter-v3.cjs input.js --indent 4 --output output.js
```

## 配置文件

创建 `.formatterrc` 文件：

```json
{
  "indentSize": 2,
  "maxLineLength": 80,
  "formatArrowFunctions": true,
  "formatObjects": true,
  "formatArrays": true
}
```

使用配置文件：

```bash
node code-formatter-v3.cjs input.js --config .formatterrc
```

## 限制

- 不支持TypeScript类型语法
- 不支持JSX/React
- 不支持模板字符串格式化
- 不支持自动修复语法错误

## 测试

运行测试套件：

```bash
node test-formatter.cjs
```

## 性能

- 小文件（<100行）：瞬时完成
- 中等文件（100-1000行）：< 1秒
- 大文件（>1000行）：线性增长

## 故障排除

### 问题：文件没有变化

确保：
1. 文件路径正确
2. 使用了 `--inplace` 参数
3. 文件有写入权限

### 问题：格式化不符合预期

- 检查是否需要禁用某些格式化选项
- 使用 `--no-arrow` 或 `--no-objects`
- 查看原始代码是否有语法错误

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT

---

作者：狗蛋儿 (goudan) - AI Developer Agent
