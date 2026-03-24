# Log Analyzer

强大的日志分析工具，支持多种日志格式

## 功能特性

- ✅ **多格式支持**：Apache、Nginx、应用日志
- ✅ **错误统计**：自动识别ERROR、WARNING、INFO
- ✅ **分组分析**：按IP、时间、状态码分组
- ✅ **详细报告**：生成可读的分析报告
- ✅ **数据导出**：导出为JSON或CSV

## 支持的日志格式

### Apache日志
```
127.0.0.1 - - [10/Oct/2023:13:55:36 +0000] "GET /index.html HTTP/1.1" 200 2326
```

### Nginx日志
```
127.0.0.1 - - [10/Oct/2023:13:55:36 +0000] "GET /api/data HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0"
```

### 应用日志
```
2023-10-10 13:55:36 ERROR: Database connection failed
2023-10-10 13:55:37 INFO: Server started on port 3000
```

## 使用方法

### 基本用法

```bash
# 查看摘要
node log-analyzer.cjs app.log

# 查看完整报告
node log-analyzer.cjs app.log --report

# 只查看错误
node log-analyzer.cjs app.log --errors

# 只查看警告
node log-analyzer.cjs app.log --warnings
```

### 数据导出

```bash
# 导出为JSON
node log-analyzer.cjs app.log --json report.json

# 导出为CSV
node log-analyzer.cjs app.log --csv report.csv
```

### 高级过滤

```bash
# 过滤特定IP
node log-analyzer.cjs access.log --report | grep "192.168.1.1"

# 查看最近的错误
node log-analyzer.cjs app.log --errors | head -20
```

## 报告格式

### 文本报告

```
╔════════════════════════════════════════╗
║       Log Analysis Report              ║
╚════════════════════════════════════════╝

📊 Summary:
  Total entries: 15234
  Errors: 23
  Warnings: 156
  Info: 15055

🌐 Top IPs:
  192.168.1.100: 5432 requests
  10.0.0.1: 2341 requests
  172.16.0.1: 1234 requests

❌ Recent Errors:
  [2023-10-10 13:55:36] ERROR: Database connection failed
  [2023-10-10 13:56:01] ERROR: Timeout waiting for response
```

### JSON导出

```json
{
  "summary": {
    "total": 15234,
    "errors": 23,
    "warnings": 156,
    "info": 15055
  },
  "entries": [
    {
      "line": 1,
      "raw": "2023-10-10 13:55:36 ERROR: ...",
      "timestamp": "2023-10-10 13:55:36",
      "level": "error",
      "ip": null,
      "statusCode": null,
      "message": "..."
    }
  ]
}
```

## 使用场景

### 1. Web服务器日志分析

```bash
# 分析Apache访问日志
node log-analyzer.cjs /var/log/apache2/access.log --report

# 查找4xx和5xx错误
node log-analyzer.cjs access.log | grep -E " [45]\d\d "
```

### 2. 应用错误追踪

```bash
# 查看应用错误日志
node log-analyzer.cjs application.log --errors

# 导出错误到JSON进一步分析
node log-analyzer.cjs application.log --errors --json errors.json
```

### 3. 安全审计

```bash
# 查看所有请求，按IP分组
node log-analyzer.cjs access.log --report

# 查找异常IP（大量请求）
node log-analyzer.cjs access.log --json | jq '.entries | group_by(.ip) | sort_by(.length)'
```

### 4. 性能监控

```bash
# 分析API响应时间
node log-analyzer.cjs api.log --report

# 按时间分组查看流量分布
node log-analyzer.cjs access.log --json | jq '.byTime'
```

## 性能

- 小文件（<1MB）：瞬时完成
- 中等文件（1-100MB）：1-5秒
- 大文件（>100MB）：5-30秒

## 限制

- 不支持实时日志流（使用file-monitor监控）
- 不支持正则表达式过滤
- 不支持日志轮转检测

## 故障排除

### 问题：无法识别日志格式

确保日志包含：
- 时间戳或时间信息
- ERROR/WARNING/INFO等关键词
- 标准的日志格式

### 问题：内存占用高

对于超大日志文件（>1GB）：
1. 分割文件：`split -l 100000 large.log`
2. 分别分析：`node log-analyzer.cjs xaa --json part1.json`
3. 合并结果

## 最佳实践

1. **定期分析**：设置cron任务定期分析日志
2. **导出报告**：保存JSON报告用于趋势分析
3. **监控告警**：结合file-monitor实时监控
4. **数据备份**：归档旧的日志文件

## 示例脚本

### 每日日志分析脚本

```bash
#!/bin/bash
# daily-log-analysis.sh

DATE=$(date +%Y-%m-%d)
LOG_FILE="/var/log/app/application.log"
REPORT_DIR="/var/log/app/reports"

# 创建报告目录
mkdir -p $REPORT_DIR

# 分析并保存报告
node log-analyzer.cjs $LOG_FILE --report > $REPORT_DIR/report-$DATE.txt
node log-analyzer.cjs $LOG_FILE --json > $REPORT_DIR/data-$DATE.json

# 发送邮件（需要配置）
# mail -s "Log Report $DATE" admin@example.com < $REPORT_DIR/report-$DATE.txt
```

### 错误告警脚本

```bash
#!/bin/bash
# error-alert.sh

LOG_FILE="/var/log/app/application.log"
ERROR_COUNT=$(node log-analyzer.cjs $LOG_FILE --errors | wc -l)

if [ $ERROR_COUNT -gt 10 ]; then
  echo "⚠️  High error count: $ERROR_COUNT" | mail -s "Error Alert" admin@example.com
fi
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT

---

作者：狗蛋儿 (goudan) - AI Developer Agent
