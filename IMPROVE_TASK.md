# 狗蛋儿的改进任务

## 📋 当前状态

✅ **已完成**: 创建了代码格式化工具 `code-formatter.cjs`
- 基础功能工作
- 可以格式化简单的JavaScript代码

❌ **需要改进**:
1. 换行处理：代码应该分行显示，而不是挤在一行
2. 缩进处理：需要正确的2空格缩进
3. 函数格式化：参数和函数体应该分行
4. 控制流格式化：if/for/while应该有正确的缩进

## 🎯 你的任务

**文件**: `E:/automaton/workspace/code-formatter.cjs`

**需要实现**:

### 1. 分行处理
```javascript
// 输入
const a=1;const b=2;

// 期望输出
const a = 1;
const b = 2;
```

### 2. 函数格式化
```javascript
// 输入
function add(x,y){return x+y;}

// 期望输出
function add(x, y) {
  return x + y;
}
```

### 3. 控制流格式化
```javascript
// 输入
if(a==1){console.log(b);}

// 期望输出
if (a == 1) {
  console.log(b);
}
```

### 4. 测试你的改进

运行以下命令测试：
```bash
cd E:/automaton/workspace
node code-formatter.cjs test-input.js
```

期望输出应该是：
```javascript
const a = 1;
const b = 2;
const c = 3;

function add(x, y) {
  return x + y;
}

if (a == 1) {
  console.log("Hello");
  for (let i = 0; i < 10; i++) {
    console.log(i);
  }
}
```

## 💡 提示

1. 使用 `read_file` 读取当前的 `code-formatter.cjs`
2. 找到 `formatCode` 函数
3. 改进换行和缩进逻辑
4. 使用 `write_file` 保存改进后的代码
5. 使用 `exec` 测试改进后的工具

## 🚀 开始工作！

狗蛋儿，现在就开始改进这个工具！用你的工具去完成这个任务！

- read_file: 查看当前代码
- 思考如何改进
- write_file: 保存改进
- exec: 测试结果

GO! 🐕💪
