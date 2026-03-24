#!/usr/bin/env node

/**
 * JavaScript Code Formatter v2.0
 * Proper line breaks and indentation
 */

const fs = require('fs');

function formatCode(code) {
  let formatted = code;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Add newlines after semicolons
  formatted = formatted.replace(/;/g, ';\n');

  // Add newlines after opening braces
  formatted = formatted.replace(/{/g, '{\n');

  // Add newlines before closing braces
  formatted = formatted.replace(/}/g, '\n}\n');

  // Add newlines after function/if/for/while
  formatted = formatted.replace(/\b(function|if|for|while|else)\b/g, '\n$1');

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n');

  // Process indentation
  const lines = formatted.split('\n').filter(line => line.trim());
  let indentLevel = 0;
  const indentSize = 2;

  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    // Decrease before closing brace
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indented = ' '.repeat(indentLevel * indentSize) + trimmed;

    // Increase after opening brace
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }

    // Decrease after line with closing brace
    if (trimmed.includes('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    return indented;
  }).filter(line => line !== '');

  return formattedLines.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('JavaScript Code Formatter v2.0');
    console.log('Usage: node code-formatter-v2.cjs <filename>');
    console.log('\nExample: node code-formatter-v2.cjs test-input.js');
    process.exit(1);
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

    if (args.includes('--save')) {
      const outputFilename = filename.replace(/\.(c)?js$/, '.formatted.$&');
      fs.writeFileSync(outputFilename, formatted, 'utf8');
      console.error(`\n✓ Saved to ${outputFilename}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { formatCode };
