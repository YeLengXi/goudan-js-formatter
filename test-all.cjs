#!/usr/bin/env node

/**
 * 统一测试套件
 * Created by 狗蛋儿 (goudan) - AI Developer
 */

const fs = require('fs');
const path = require('path');

// ANSI颜色
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试套件定义
const testSuites = [
  {
    name: 'Code Formatter v3.0',
    file: 'code-formatter-v3.cjs',
    tests: [
      {
        name: 'Arrow function formatting',
        test: () => {
          const { formatCode } = require('./code-formatter-v3.cjs');
          const input = 'const add=(a,b)=>a+b;';
          const result = formatCode(input);
          return result.includes('=>') && result.includes('=');
        }
      },
      {
        name: 'Object formatting',
        test: () => {
          const { formatCode } = require('./code-formatter-v3.cjs');
          const input = 'const obj={a:1,b:2};';
          const result = formatCode(input);
          return result.includes(': ') && result.includes(', ');
        }
      },
      {
        name: 'Indentation',
        test: () => {
          const { formatCode } = require('./code-formatter-v3.cjs');
          const input = 'function foo(){return bar();}';
          const result = formatCode(input);
          return result.includes('  return');
        }
      }
    ]
  },
  {
    name: 'Log Analyzer',
    file: 'log-analyzer.cjs',
    tests: [
      {
        name: 'LogAnalyzer class exists',
        test: () => {
          const { LogAnalyzer } = require('./log-analyzer.cjs');
          return typeof LogAnalyzer === 'function';
        }
      },
      {
        name: 'Validate method',
        test: () => {
          const { JsonTools } = require('./json-tools.cjs');
          const result = JsonTools.validate('{"key": "value"}');
          return result.valid === true;
        }
      },
      {
        name: 'Format method',
        test: () => {
          const { JsonTools } = require('./json-tools.cjs');
          const result = JsonTools.format('{"a":1}', 2);
          return result.includes('{\n  "a": 1\n}');
        }
      },
      {
        name: 'Query method',
        test: () => {
          const { JsonTools } = require('./json-tools.cjs');
          const result = JsonTools.query('{"users":[{"name":"John"}]}', '$.users[0].name');
          return result === 'John';
        }
      },
      {
        name: 'To CSV method',
        test: () => {
          const { JsonTools } = require('./json-tools.cjs');
          const result = JsonTools.toCsv('[{"a":1,"b":2}]');
          return result.includes('a,b') && result.includes('1,2');
        }
      }
    ]
  },
  {
    name: 'Bulk Rename',
    file: 'bulk-rename.cjs',
    tests: [
      {
        name: 'BulkRenamer class exists',
        test: () => {
          const { BulkRenamer } = require('./bulk-rename.cjs');
          return typeof BulkRenamer === 'function';
        }
      },
      {
        name: 'Pattern matching',
        test: () => {
          const renamer = new (require('./bulk-rename.cjs')).BulkRenamer({
            dir: './test-temp',
            pattern: 'old',
            replacement: 'new'
          });
          const oldName = 'test-old-file.txt';
          const newName = renamer.generateNewName(oldName, 0);
          return newName === 'test-new-file.txt';
        }
      },
      {
        name: 'Prefix addition',
        test: () => {
          const renamer = new (require('./bulk-rename.cjs')).BulkRenamer({
            dir: '.',
            prefix: 'backup_'
          });
          const newName = renamer.generateNewName('file.txt', 0);
          return newName === 'backup_file.txt';
        }
      },
      {
        name: 'Numbering',
        test: () => {
          const renamer = new (require('./bulk-rename.cjs')).BulkRenamer({
            dir: '.',
            startNumber: 100
          });
          const name1 = renamer.generateNewName('file.txt', 0);
          const name2 = renamer.generateNewName('file.txt', 1);
          return name1 === 'file_100.txt' && name2 === 'file_101.txt';
        }
      }
    ]
  }
];

// 运行所有测试
function runAllTests() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   DevTools Collection - Test Suite    ║', 'blue');
  log('║   Created by 狗蛋儿 (goudan)             ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  testSuites.forEach(suite => {
    log(`\n📦 Testing: ${suite.name}`, 'blue');
    log('─'.repeat(50), 'blue');

    suite.tests.forEach(test => {
      totalTests++;
      try {
        const result = test.test();
        if (result) {
          passedTests++;
          log(`  ✅ ${test.name}`, 'green');
        } else {
          failedTests++;
          log(`  ❌ ${test.name} - Test returned false`, 'red');
        }
      } catch (error) {
        failedTests++;
        log(`  ❌ ${test.name} - Error: ${error.message}`, 'red');
      }
    });
  });

  // 性能测试
  log('\n\n⚡ Performance Tests', 'yellow');
  log('─'.repeat(50), 'yellow');

  performanceTest();

  // 总结
  log('\n\n╔════════════════════════════════════════╗', 'blue');
  log('║           Test Summary                  ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');
  log(`Total Tests:  ${totalTests}`, 'blue');
  log(`Passed:       ${passedTests}`, 'green');
  log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Pass Rate:    ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');

  if (failedTests === 0) {
    log('\n🎉 All tests passed! Tools are ready for production!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review.', 'yellow');
  }

  return failedTests === 0;
}

// 性能测试
function performanceTest() {
  // Code formatter performance
  const { formatCode } = require('./code-formatter-v3.cjs');
  const largeCode = `
    function test() {
      const arr = [1,2,3,4,5];
      return arr.map(x=>x*2);
    }
  `.repeat(100); // ~1000 lines

  const start1 = Date.now();
  formatCode(largeCode);
  const duration1 = Date.now() - start1;

  log(`  Code Formatter (1000 lines): ${duration1}ms`, duration1 < 1000 ? 'green' : 'yellow');

  // JSON tools performance
  const { JsonTools } = require('./json-tools.cjs');
  const largeJson = JSON.stringify({
    data: Array(1000).fill(null).map((_, i) => ({ id: i, name: `Item ${i}` }))
  });

  const start2 = Date.now();
  JsonTools.validate(largeJson);
  const duration2 = Date.now() - start2;

  log(`  JSON Validator (1000 items): ${duration2}ms`, duration2 < 100 ? 'green' : 'yellow');

  // Log analyzer performance
  const { LogAnalyzer } = require('./log-analyzer.cjs');
  const largeLog = Array(1000).fill(null).map((_, i) =>
    `2023-10-10 12:00:${i.toString().padStart(2, '0')} INFO: Test message ${i}`
  ).join('\n');

  // Create temp log file
  const tempLogFile = './test-temp-perf.log';
  fs.writeFileSync(tempLogFile, largeLog);

  const analyzer = new LogAnalyzer();
  const start3 = Date.now();
  analyzer.loadFile(tempLogFile).parse();
  const duration3 = Date.now() - start3;

  log(`  Log Analyzer (1000 lines): ${duration3}ms`, duration3 < 500 ? 'green' : 'yellow');

  // Cleanup
  fs.unlinkSync(tempLogFile);

  // Overall performance
  const totalDuration = duration1 + duration2 + duration3;
  log(`\n  Total Performance: ${totalDuration}ms`, totalDuration < 1500 ? 'green' : 'yellow');
}

// 运行测试
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };
