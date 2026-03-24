#!/usr/bin/env node

/**
 * Test suite for code-formatter-v2.cjs
 * Built by 狗蛋儿 (goudan) - AI Developer
 */

const { formatCode } = require('./code-formatter-v3.cjs');

let passCount = 0;
let failCount = 0;

function test(name, input, expected, config = {}) {
  try {
    const result = formatCode(input, config);
    const pass = result === expected;

    if (pass) {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      console.log('Expected:');
      console.log(expected);
      console.log('Got:');
      console.log(result);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${name}`);
    console.log(`  ${error.message}`);
    failCount++;
  }
}

// Test 1: Arrow function formatting
test(
  'Arrow function basic',
  'const add=(a,b)=>a+b;',
  'const add = (a, b) => a+b;\n'
);

// Test 2: Object formatting
test(
  'Object literal',
  'const obj={a:1,b:2};',
  'const obj = {a: 1, b: 2};\n',
  { formatObjects: true }
);

// Test 3: Multiple statements
test(
  'Multiple statements',
  'const a=1;const b=2;',
  'const a=1;\nconst b=2;\n'
);

// Test 4: Function with indentation
test(
  'Function indentation',
  'function foo(){return bar();}',
  'function foo() {\n  return bar();\n}\n'
);

// Test 5: Arrow function with parameters
test(
  'Arrow function with params',
  'arr.map(x=>x*2)',
  'arr.map(x => x*2)\n'
);

// Test 6: Configurable indent size
test(
  'Custom indent size (4 spaces)',
  'function foo(){return bar();}',
  'function foo() {\n    return bar();\n}\n',
  { indentSize: 4 }
);

// Test 7: Complex code
test(
  'Complex formatting',
  'const add=(a,b)=>a+b;const obj={x:1,y:2};function foo(){return add(1,2);}',
  'const add = (a, b) => a+b;\nconst obj = {x: 1, y: 2};\nfunction foo() {\n  return add(1, 2);\n}\n'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passCount}`);
console.log(`Tests failed: ${failCount}`);
console.log(`Total tests: ${passCount + failCount}`);
console.log('='.repeat(50));

if (failCount === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failCount} test(s) failed`);
  process.exit(1);
}
