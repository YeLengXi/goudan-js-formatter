# 任务1：改进代码格式化工具

## 📍 当前状态
- 文件：E:/automaton/workspace/code-formatter-v2.cjs
- 当前功能：基础格式化（分号换行、大括号换行、2空格缩进）
- 状态：✅ 已发布到 GitHub

## 🎯 改进目标

### 1.1 增强格式化功能
- [ ] 支持箭头函数格式化
  - `const add=(a,b)=>a+b` → 多行格式
  - `arr.map(x=>x*2)` → 适当换行

- [ ] 支持对象字面量格式化
  - `const obj={a:1,b:2}` → 每个属性一行
  - 嵌套对象的缩进

- [ ] 支持数组格式化
  - `const arr=[1,2,3]` → 每个元素一行（如果太长）

- [ ] 支持链式调用格式化
  - `obj.method1().method2().method3()` → 适当换行

- [ ] 支持注释保留
  - 不删除原有注释
  - 保持注释位置

### 1.2 添加配置选项
创建配置文件支持：
```javascript
{
  indentSize: 2,        // 缩进空格数
  maxLineLength: 80,    // 最大行长度
  quoteStyle: 'single', // single | double
  trailingComma: true,  // 尾部逗号
  semi: true            // 分号
}
```

### 1.3 命令行参数
```bash
node code-formatter-v2.cjs input.js [options]
  --indent, -i <spaces>   缩进空格数（默认2）
  --output, -o <file>     输出文件
  --config, -c <file>     配置文件
  --dry-run               预览模式，不修改文件
  --inplace, -I           原地修改文件
```

### 1.4 性能改进
- [ ] 支持大文件（>1MB）
- [ ] 流式处理
- [ ] 进度显示

## 🧪 测试要求

### 创建测试文件：test-formatter.cjs
```javascript
const formatter = require('./code-formatter-v2.cjs');

// 测试用例
const testCases = [
  {
    name: 'Arrow function',
    input: 'const add=(a,b)=>a+b;',
    expected: 'const add = (a, b) => a + b;\n'
  },
  {
    name: 'Object literal',
    input: 'const obj={a:1,b:2};',
    expected: 'const obj = {\n  a: 1,\n  b: 2\n};\n'
  },
  {
    name: 'Nested function',
    input: 'function foo(){return bar(()=>{return 1;});}',
    expected: 'function foo() {\n  return bar(() => {\n    return 1;\n  });\n}\n'
  }
];

// 运行测试
testCases.forEach(test => {
  const result = formatter.formatCode(test.input);
  const pass = result === test.expected;
  console.log(`${pass ? '✅' : '❌'} ${test.name}`);
  if (!pass) {
    console.log('  Expected:', test.expected);
    console.log('  Got:     ', result);
  }
});
```

## 📝 工作流程

1. **读取当前代码**
   ```bash
   cat E:/automaton/workspace/code-formatter-v2.cjs
   ```

2. **分析现有逻辑**
   - 理解当前的格式化规则
   - 识别需要改进的地方

3. **编写改进代码**
   - 添加新功能
   - 保持向后兼容
   - 添加详细注释

4. **测试**
   ```bash
   cd E:/automaton/workspace
   node code-formatter-v2.cjs test-input.js
   node test-formatter.cjs
   ```

5. **文档**
   - 更新 README.md
   - 添加更多示例
   - 添加配置说明

6. **提交**
   - Git commit
   - 推送到 GitHub
   - 创建新版本 tag

## ✅ 完成标准

- [ ] 所有测试用例通过
- [ ] 支持箭头函数、对象、数组格式化
- [ ] 命令行参数工作正常
- [ ] 文档完整（README, 测试示例）
- [ ] 代码有清晰注释
- [ ] 性能测试通过（处理1000行文件 < 1秒）

## 🎁 奖励

完成后，这个工具将：
- ✅ 更有市场价值
- ✅ 可以定价 $2-5
- ✅ 吸引更多用户
- ✅ 建立狗蛋儿的品牌

---

**优先级**: 🔴 最高 - 立即开始
**预计时间**: 2小时
**状态**: 🟡 等待执行

开始工作吧，狗蛋儿！💪
