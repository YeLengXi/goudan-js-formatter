#!/usr/bin/env node

/**
 * File Monitor Tool
 * Created by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - Monitor file changes in real-time
 * - Detect create, modify, delete events
 * - File filtering by extension/pattern
 * - Execute custom commands
 * - Event logging
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class FileMonitor {
  constructor(options = {}) {
    this.watchDir = options.dir || process.cwd();
    this.recursive = options.recursive !== false;
    this.extensions = options.extensions || [];
    this.pattern = options.pattern || null;
    this.onCommand = options.onCommand || null;
    this.logFile = options.logFile || null;
    this.watchedFiles = new Map();
    this.running = false;
  }

  start() {
    this.running = true;
    this.log(`File monitor started: ${this.watchDir}`);
    this.scan();
    this.watch();
  }

  stop() {
    this.running = false;
    this.log('File monitor stopped');
  }

  scan() {
    const files = this.getFiles(this.watchDir);
    files.forEach(file => {
      const stats = fs.statSync(file);
      if (!this.watchedFiles.has(file)) {
        this.handleEvent('create', file, stats);
      }
      this.watchedFiles.set(file, {
        mtime: stats.mtime.getTime(),
        size: stats.size
      });
    });
  }

  watch() {
    if (!this.running) return;

    setInterval(() => {
      if (!this.running) return;

      const files = this.getFiles(this.watchDir);

      // Check for new files
      files.forEach(file => {
        const stats = fs.statSync(file);
        const watched = this.watchedFiles.get(file);

        if (!watched) {
          this.handleEvent('create', file, stats);
          this.watchedFiles.set(file, {
            mtime: stats.mtime.getTime(),
            size: stats.size
          });
        } else {
          // Check for modifications
          if (stats.mtime.getTime() > watched.mtime || stats.size !== watched.size) {
            this.handleEvent('modify', file, stats);
            this.watchedFiles.set(file, {
              mtime: stats.mtime.getTime(),
              size: stats.size
            });
          }
        }
      });

      // Check for deleted files
      const deletedFiles = [];
      this.watchedFiles.forEach((_, file) => {
        if (!fs.existsSync(file)) {
          this.handleEvent('delete', file, null);
          deletedFiles.push(file);
        }
      });
      deletedFiles.forEach(file => this.watchedFiles.delete(file));

    }, 2000); // Check every 2 seconds
  }

  getFiles(dir) {
    let files = [];

    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && this.recursive) {
        // Skip node_modules and .git
        if (item !== 'node_modules' && item !== '.git') {
          files = files.concat(this.getFiles(fullPath));
        }
      } else if (stats.isFile()) {
        if (this.matchesFilter(fullPath)) {
          files.push(fullPath);
        }
      }
    });

    return files;
  }

  matchesFilter(file) {
    const ext = path.extname(file);

    // Extension filter
    if (this.extensions.length > 0) {
      if (!this.extensions.includes(ext)) {
        return false;
      }
    }

    // Pattern filter
    if (this.pattern) {
      const regex = new RegExp(this.pattern);
      if (!regex.test(file)) {
        return false;
      }
    }

    return true;
  }

  handleEvent(type, file, stats) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${type.toUpperCase()}: ${file}`;

    this.log(message);

    // Execute custom command
    if (this.onCommand) {
      const command = this.onCommand
        .replace('{type}', type)
        .replace('{file}', file)
        .replace('{name}', path.basename(file));

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Command error: ${error.message}`);
        }
        if (stdout) console.log(stdout);
      });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(logMessage);

    if (this.logFile) {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    }
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log('File Monitor Tool - by 狗蛋儿 (goudan)');
    console.log('\nUsage: node file-monitor.cjs <directory> [options]');
    console.log('\nOptions:');
    console.log('  --ext, -e <exts>  File extensions to monitor (comma-separated)');
    console.log('  --pattern, -p     Regex pattern to match');
    console.log('  --command, -c     Command to execute on change');
    console.log('  --log, -l <file>  Log file path');
    console.log('  --no-recursive   Don\'t watch subdirectories');
    console.log('\nPlaceholders for command:');
    console.log('  {type} - Event type (create/modify/delete)');
    console.log('  {file} - Full file path');
    console.log('  {name} - File name only');
    console.log('\nExamples:');
    console.log('  node file-monitor.cjs ./src');
    console.log('  node file-monitor.cjs ./src --ext .js,.ts');
    console.log('  node file-monitor.cjs ./src --command "echo {file}"');
    console.log('  node file-monitor.cjs . --ext .js --command "node {file}"');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const dir = args[0];
  const options = { dir };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--ext' || arg === '-e') {
      options.extensions = args[++i].split(',').map(e => e.startsWith('.') ? e : '.' + e);
    } else if (arg === '--pattern' || arg === '-p') {
      options.pattern = args[++i];
    } else if (arg === '--command' || arg === '-c') {
      options.onCommand = args[++i];
    } else if (arg === '--log' || arg === '-l') {
      options.logFile = args[++i];
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    }
  }

  if (!fs.existsSync(dir)) {
    console.error(`Error: Directory "${dir}" not found`);
    process.exit(1);
  }

  const monitor = new FileMonitor(options);
  monitor.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}

module.exports = { FileMonitor };
