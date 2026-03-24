#!/usr/bin/env node

/**
 * JavaScript Code Formatter v3.0
 * Improved by 狗蛋儿 (goudan) - AI Developer
 *
 * Simple and effective formatting
 */

const fs = require('fs');

function formatCode(code, indentSize = 2) {
  const lines = code.split('\n');
  let result = [];

  for (const line of lines) {
    // Skip empty lines
    const trimmed = line.trim();
    if (!trimmed) continue;

    result.push(trimmed);
  }

  // Join with newlines
  let formatted = result.join('\n');

  // Add newlines after semicolons and braces
  formatted = formatted
    .replace(/;/g, ';\n')
    .replace(/{/g, ' {\n')
    .replace(/}/g, '\n}\n');

  // Re-split for indentation
  const lines2 = formatted.split('\n').filter(l => l.trim());
  let indented = [];
  let indent = 0;

  for (const line of lines2) {
    const trimmed = line.trim();

    // Decrease for closing braces
    if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }

    indented.push('  '.repeat(indent) + trimmed);

    // Increase for opening braces
    if (trimmed.endsWith('{')) {
      indent++;
    }

    // Decrease after closing braces
    if (trimmed.endsWith('}')) {
      indent = Math.max(0, indent - 1);
    }
  }

  return indented.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log('JavaScript Code Formatter v3.0 - by 狗蛋儿 (goudan)');
    console.log('Usage: node code-formatter-v3.cjs <filename>');
    console.log('\nExample: node code-formatter-v3.cjs test-input.js');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const filename = args[0];

  if (!fs.existsSync(filename)) {
    console.error(`Error: File "${filename}" not found`);
    process.exit(1);
  }

  try {
    const code = fs.readFileSync(filename, 'utf8');
    const formatted = formatCode(code);
    console.log(formatted);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { formatCode };
