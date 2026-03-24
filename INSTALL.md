# 📦 DevTools Collection

## 统一CLI入口 - devtools

安装后可以使用统一命令：

```bash
# 全局安装
npm install -g devtools-collection

# 使用统一命令
devtools format <file>
devtools analyze <log>
devtools monitor <dir>
devtools json <command> <file>
devtools rename <dir> [options]
```

## 安装脚本

### 方式1：使用npm link（开发）

```bash
cd E:/automaton/workspace
npm link

# 现在可以在任何地方使用
code-formatter --help
log-analyzer --help
```

### 方式2：创建安装脚本

创建 `install.sh`:

```bash
#!/bin/bash
echo "Installing DevTools Collection..."

# 创建符号链接
sudo ln -sf "$(pwd)/code-formatter-v3.cjs" /usr/local/bin/code-formatter
sudo ln -sf "$(pwd)/log-analyzer.cjs" /usr/local/bin/log-analyzer
sudo ln -sf "$(pwd)/file-monitor.cjs" /usr/local/bin/file-monitor
sudo ln -sf "$(pwd)/json-tools.cjs" /usr/local/bin/json-tools
sudo ln -sf "$(pwd)/bulk-rename.cjs" /usr/local/bin/bulk-rename

# 设置执行权限
chmod +x /usr/local/bin/code-formatter
chmod +x /usr/local/bin/log-analyzer
chmod +x /usr/local/bin/file-monitor
chmod +x /usr/local/bin/json-tools
chmod +x /usr/local/bin/bulk-rename

echo "✓ Installation complete!"
echo "Try: code-formatter --help"
```

Windows版本 `install.bat`:

```batch
@echo off
echo Installing DevTools Collection...

set BINDIR=%USERPROFILE%\bin
mkdir %BINDIR% 2>nul

copy /Y "%~dp0code-formatter-v3.cjs" %BINDIR%\code-formatter.js >nul
copy /Y "%~dp0log-analyzer.cjs" %BINDIR%\log-analyzer.js >nul
copy /Y "%~dp0file-monitor.cjs" %BINDIR%\file-monitor.js >nul
copy /Y "%~dp0json-tools.cjs" %BINDIR%\json-tools.js >nul
copy /Y "%~dp0bulk-rename.cjs" %BINDIR%\bulk-rename.js >nul

echo ✓ Installation complete!
echo Try: node %BINDIR%\code-formatter.js --help
```

## npm发布配置

### 发布到npm

```bash
# 登录npm
npm login

# 发布
npm publish
```

### 用户安装

```bash
npm install -g devtools-collection
```

## 快速开始脚本

创建 `quick-start.sh`:

```bash
#!/bin/bash

echo "🚀 DevTools Collection - Quick Start"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# 测试工具
echo "📊 Testing tools..."
echo ""

echo "1. Code Formatter:"
node code-formatter-v3.cjs --help | head -3
echo ""

echo "2. Log Analyzer:"
node log-analyzer.cjs --help | head -3
echo ""

echo "3. File Monitor:"
node file-monitor.cjs --help | head -3
echo ""

echo "4. JSON Tools:"
node json-tools.cjs --help | head -3
echo ""

echo "5. Bulk Rename:"
node bulk-rename.cjs --help | head -3
echo ""

echo "✓ All tools are ready!"
echo ""
echo "📖 Usage:"
echo "  node code-formatter-v3.cjs <file>"
echo "  node log-analyzer.cjs <log>"
echo "  node file-monitor.cjs <dir>"
echo "  node json-tools.cjs <command> <file>"
echo "  node bulk-rename.cjs <dir>"
echo ""
```

## Docker支持

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g .

ENTRYPOINT ["bash"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  devtools:
    build: .
    volumes:
      - ./workspace:/workspace
    working_dir: /workspace
```

使用：

```bash
docker-compose up -d
docker-compose exec devtools code-formatter input.js
```

## 完整的发布检查清单

- [x] 所有工具完整实现
- [x] README.md文档
- [x] 工具详细文档
- [x] package.json配置
- [x] 测试套件
- [x] Landing page
- [ ] 创建GitHub仓库
- [ ] 推送到GitHub
- [ ] 发布到npm
- [ ] 写示例博客
- [ ] 社交媒体推广

## 营销建议

### 标题建议

1. "5个JavaScript开发者工具，提升你的开发效率！"
2. "用Node.js编写的实用开发工具集合"
3. "狗蛋儿的开源工具集 - 零依赖、跨平台"

### 推广渠道

- Reddit: r/javascript, r/node, r/webdev
- Twitter: @nodejs, @javascript
- Hacker News: Show HN
- Dev.to: 技术博客
- GitHub Trending

### 定价策略

- GitHub: 免费 + Star
- Gumroad: $2-5 "Pay what you want"
- Patreon: 每月 $1-5 获得更新

---

**准备好发布了！** 🚀
