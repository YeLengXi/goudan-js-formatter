#!/usr/bin/env node

/**
 * JavaScript Code Formatter
 * A simple code formatter that formats JavaScript files with consistent indentation
 */

const fs = require('fs');
const path = require('path');

// Format options
const OPTIONS = {
  indentSize: 2,
  indentChar: ' ',
  insertFinalNewline: true,
};

/**
 * Format JavaScript code
 */
function formatCode(code) {
  let formatted = code;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Remove extra blank lines (more than 2 consecutive)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Add spaces around operators
  formatted = formatted.replace(/([^=!<>])=([^=])/g, '$1 = $2');
  formatted = formatted.replace(/([^=!<>])==([^=])/g, '$1 == $2');
  formatted = formatted.replace(/([^=!<>])!=([^=])/g, '$1 != $2');
  formatted = formatted.replace(/([^=!<>])\+([^=])/g, '$1 + $2');
  formatted = formatted.replace(/([^=!<>])-([^=])/g, '$1 - $2');
  formatted = formatted.replace(/([^=!<>])\*([^=])/g, '$1 * $2');
  formatted = formatted.replace(/([^=!<>])\/([^=])/g, '$1 / $2');

  // Add space after keywords
  formatted = formatted.replace(/\b(if|for|while|switch|catch|function)\(/g, '$1 (');
  formatted = formatted.replace(/\b(else)\{/g, '$1 {');
  formatted = formatted.replace(/\b(var|let|const)\(/g, '$1 (');
  formatted = formatted.replace(/\b(try)\{/g, '$1 {');

  // Fix spacing around braces
  formatted = formatted.replace(/\s{\s/g, ' {');
  formatted = formatted.replace(/\s}\s/g, ' }');
  formatted = formatted.replace(/{\s+/g, '{ ');
  formatted = formatted.replace(/}\s+/g, '} ');

  // Fix spacing around parentheses
  formatted = formatted.replace(/\(\s+/g, '(');
  formatted = formatted.replace(/\s+\)/g, ')');

  // Add semicolons if missing (simple cases)
  formatted = formatted.replace(/^(\s*)([^{}\n]+?)(\s*)$/gm, (match, indent, content, trailing) => {
    if (content.trim() && !content.trim().endsWith(';') && !content.trim().endsWith('{') && !content.trim().endsWith('}')) {
      return indent + content.trim() + ';' + trailing;
    }
    return match;
  });

  // Fix indentation (simple approach)
  const lines = formatted.split('\n');
  let indentLevel = 0;
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();

    // Decrease indent after closing brace
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indented = OPTIONS.indentChar.repeat(indentLevel * OPTIONS.indentSize) + trimmed;

    // Increase indent after opening brace
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }

    return indented;
  });

  formatted = formattedLines.join('\n');

  // Add final newline if configured
  if (OPTIONS.insertFinalNewline && !formatted.endsWith('\n')) {
    formatted += '\n';
  }

  return formatted;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('JavaScript Code Formatter');
    console.log('Usage: node code-formatter.js <filename>');
    console.log('');
    console.log('Example:');
    console.log('  node code-formatter.js input.js');
    console.log('');
    console.log('Options:');
    console.log(`  --indent=${OPTIONS.indentSize}  Set indentation size (default: ${OPTIONS.indentSize})`);
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

    console.log('// Formatted code:');
    console.log(formatted);

    // Optionally save to file
    if (args.includes('--save') || args.includes('-o')) {
      const outputFilename = filename.replace(/\.(js|jsx|ts|tsx)$/, '.formatted$&');
      fs.writeFileSync(outputFilename, formatted, 'utf8');
      console.log(`\n✓ Saved to ${outputFilename}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { formatCode };
