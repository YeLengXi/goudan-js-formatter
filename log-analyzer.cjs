#!/usr/bin/env node

/**
 * Log Analyzer Tool
 * Created by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - Parse multiple log formats (Apache, Nginx, application logs)
 * - Error and warning statistics
 * - Group by time, IP, status code
 * - Generate detailed reports
 */

const fs = require('fs');
const path = require('path');

// Log patterns
const LOG_PATTERNS = {
  apache: /^(\S+) \S+ \S+ \[([\w:]+)\] "(\w+) ([^"]*)" (\d+) (\d+)/,
  nginx: /^(\S+) - \S+ \[([\w:]+)\] "(\w+) ([^"]*)" (\d+) (\d+) "([^"]*)" "([^"]*)"/,
  error: /\b(ERROR|FATAL|CRITICAL|FAIL)\b/i,
  warning: /\b(WARN|WARNING|CAUTION)\b/i,
  info: /\b(INFO|NOTICE)\b/i,
  timestamp: /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/,
  ip: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
  statusCode: /\s(1\d\d|2\d\d|3\d\d|4\d\d|5\d\d)\s/
};

class LogAnalyzer {
  constructor(options = {}) {
    this.lines = [];
    this.entries = [];
    this.stats = {
      total: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      byIp: new Map(),
      byStatusCode: new Map(),
      byTime: new Map()
    };
  }

  loadFile(filename) {
    if (!fs.existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }
    const content = fs.readFileSync(filename, 'utf8');
    this.lines = content.split('\n').filter(line => line.trim());
    this.stats.total = this.lines.length;
    return this;
  }

  parse() {
    this.entries = this.lines.map((line, index) => {
      const entry = {
        line: index + 1,
        raw: line,
        timestamp: this.extractTimestamp(line),
        level: this.extractLevel(line),
        ip: this.extractIp(line),
        statusCode: this.extractStatusCode(line),
        message: line
      };

      // Update stats
      this.updateStats(entry);

      return entry;
    });

    return this;
  }

  extractTimestamp(line) {
    const match = line.match(LOG_PATTERNS.timestamp);
    return match ? match[0] : null;
  }

  extractLevel(line) {
    if (LOG_PATTERNS.error.test(line)) return 'error';
    if (LOG_PATTERNS.warning.test(line)) return 'warning';
    if (LOG_PATTERNS.info.test(line)) return 'info';
    return 'unknown';
  }

  extractIp(line) {
    const match = line.match(LOG_PATTERNS.ip);
    return match ? match[0] : null;
  }

  extractStatusCode(line) {
    const match = line.match(LOG_PATTERNS.statusCode);
    return match ? match[1] : null;
  }

  updateStats(entry) {
    // Count by level
    if (entry.level === 'error') this.stats.errors++;
    else if (entry.level === 'warning') this.stats.warnings++;
    else if (entry.level === 'info') this.stats.info++;

    // Count by IP
    if (entry.ip) {
      this.stats.byIp.set(entry.ip, (this.stats.byIp.get(entry.ip) || 0) + 1);
    }

    // Count by status code
    if (entry.statusCode) {
      this.stats.byStatusCode.set(entry.statusCode, (this.stats.byStatusCode.get(entry.statusCode) || 0) + 1);
    }

    // Count by time (hour)
    if (entry.timestamp) {
      const hour = entry.timestamp.substring(0, 13); // YYYY-MM-DD HH
      this.stats.byTime.set(hour, (this.stats.byTime.get(hour) || 0) + 1);
    }
  }

  getErrors() {
    return this.entries.filter(e => e.level === 'error');
  }

  getWarnings() {
    return this.entries.filter(e => e.level === 'warning');
  }

  getByIp(ip) {
    return this.entries.filter(e => e.ip === ip);
  }

  getByTimeRange(start, end) {
    return this.entries.filter(e => {
      if (!e.timestamp) return false;
      return e.timestamp >= start && e.timestamp <= end;
    });
  }

  generateReport() {
    const lines = [];

    lines.push('╔════════════════════════════════════════╗');
    lines.push('║       Log Analysis Report              ║');
    lines.push('╚════════════════════════════════════════╝');
    lines.push('');

    // Summary
    lines.push('📊 Summary:');
    lines.push(`  Total entries: ${this.stats.total}`);
    lines.push(`  Errors: ${this.stats.errors}`);
    lines.push(`  Warnings: ${this.stats.warnings}`);
    lines.push(`  Info: ${this.stats.info}`);
    lines.push('');

    // Top IPs
    lines.push('🌐 Top IPs:');
    const sortedIps = [...this.stats.byIp.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    sortedIps.forEach(([ip, count]) => {
      lines.push(`  ${ip}: ${count} requests`);
    });
    lines.push('');

    // Status codes
    if (this.stats.byStatusCode.size > 0) {
      lines.push('📋 Status Codes:');
      const sortedCodes = [...this.stats.byStatusCode.entries()]
        .sort((a, b) => b[1] - a[1]);
      sortedCodes.forEach(([code, count]) => {
        lines.push(`  ${code}: ${count}`);
      });
      lines.push('');
    }

    // Recent errors
    if (this.stats.errors > 0) {
      lines.push('❌ Recent Errors:');
      this.getErrors().slice(0, 5).forEach(entry => {
        lines.push(`  [${entry.timestamp || 'No time'}] ${entry.message.substring(0, 80)}...`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  exportToJson(filename) {
    const data = {
      summary: this.stats,
      entries: this.entries
    };
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  }

  exportToCsv(filename) {
    const headers = ['Line', 'Timestamp', 'Level', 'IP', 'Status Code', 'Message'];
    const rows = this.entries.map(e => [
      e.line,
      e.timestamp || '',
      e.level,
      e.ip || '',
      e.statusCode || '',
      `"${e.message.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    fs.writeFileSync(filename, csv);
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log('Log Analyzer Tool - by 狗蛋儿 (goudan)');
    console.log('\nUsage: node log-analyzer.cjs <logfile> [options]');
    console.log('\nOptions:');
    console.log('  --report, -r     Show full report');
    console.log('  --errors, -e     Show only errors');
    console.log('  --warnings, -w   Show only warnings');
    console.log('  --json <file>    Export to JSON');
    console.log('  --csv <file>     Export to CSV');
    console.log('  --ip <address>   Filter by IP address');
    console.log('\nExamples:');
    console.log('  node log-analyzer.cjs app.log');
    console.log('  node log-analyzer.cjs access.log --errors');
    console.log('  node log-analyzer.cjs app.log --json report.json');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const filename = args[0];
  const analyzer = new LogAnalyzer();

  try {
    analyzer.loadFile(filename).parse();

    // Handle options
    const showReport = args.includes('--report') || args.includes('-r');
    const showErrors = args.includes('--errors') || args.includes('-e');
    const showWarnings = args.includes('--warnings') || args.includes('-w');

    const jsonIndex = args.indexOf('--json');
    const csvIndex = args.indexOf('--csv');
    const ipIndex = args.indexOf('--ip');

    if (showErrors) {
      const errors = analyzer.getErrors();
      console.log(`Found ${errors.length} errors:\n`);
      errors.slice(0, 20).forEach(e => {
        console.log(`[${e.timestamp || '?'}] ${e.message}`);
      });
    } else if (showWarnings) {
      const warnings = analyzer.getWarnings();
      console.log(`Found ${warnings.length} warnings:\n`);
      warnings.slice(0, 20).forEach(e => {
        console.log(`[${e.timestamp || '?'}] ${e.message}`);
      });
    } else if (showReport) {
      console.log(analyzer.generateReport());
    } else {
      // Default: show summary
      console.log(`\n📊 Log Analysis: ${filename}`);
      console.log(`Total: ${analyzer.stats.total} | Errors: ${analyzer.stats.errors} | Warnings: ${analyzer.stats.warnings}\n`);
    }

    // Export
    if (jsonIndex >= 0 && args[jsonIndex + 1]) {
      analyzer.exportToJson(args[jsonIndex + 1]);
      console.log(`✓ Exported to ${args[jsonIndex + 1]}`);
    }

    if (csvIndex >= 0 && args[csvIndex + 1]) {
      analyzer.exportToCsv(args[csvIndex + 1]);
      console.log(`✓ Exported to ${args[csvIndex + 1]}`);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { LogAnalyzer };
