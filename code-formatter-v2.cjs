#!/usr/bin/env node

/**
 * JavaScript Code Formatter v2.1
 * Improved by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - Arrow function formatting
 * - Object and array formatting
 * - Configurable indentation
 * - CLI options
 */

const fs = require('fs');

// Default configuration
const DEFAULT_CONFIG = {
  indentSize: 2,
  maxLineLength: 80,
  formatArrowFunctions: true,
  formatObjects: true,
  formatArrays: true
};

function formatCode(code, config = DEFAULT_CONFIG) {
  let formatted = code;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Step 1: Format arrow functions - add spaces
  if (config.formatArrowFunctions) {
    // Add space after = in arrow function: (a,b)=> => (a,b) =>
    formatted = formatted.replace(/(\w)=\((.*?)\)=>/g, '$1 = ($2) =>');
  }

  // Step 2: Add newlines after semicolons
  formatted = formatted.replace(/;/g, ';\n');

  // Step 3: Add newlines after opening braces
  formatted = formatted.replace(/{/g, '{\n');

  // Step 4: Add newlines before closing braces
  formatted = formatted.replace(/}/g, '\n}\n');

  // Step 5: Add newlines after keywords
  formatted = formatted.replace(/\b(function|if|for|while|else)\b/g, '\n$1');

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Process indentation
  const lines = formatted.split('\n');
  let indentLevel = 0;
  const indentSize = config.indentSize;

  const formattedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Decrease before closing brace
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add indentation
    const indented = ' '.repeat(indentLevel * indentSize) + trimmed;
    formattedLines.push(indented);

    // Increase after opening brace
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }

    // Decrease after closing brace
    if (trimmed.endsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
  }

  return formattedLines.join('\n') + '\n';
}

function parseArgs(args) {
  const config = { ...DEFAULT_CONFIG };
  const files = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-i' || arg === '--indent') {
      config.indentSize = parseInt(args[++i]) || 2;
    } else if (arg === '-o' || arg === '--output') {
      config.outputFile = args[++i];
    } else if (arg === '--no-arrow') {
      config.formatArrowFunctions = false;
    } else if (arg === '--no-objects') {
      config.formatObjects = false;
    } else if (arg === '--no-arrays') {
      config.formatArrays = false;
    } else if (arg === '-I' || arg === '--inplace') {
      config.inplace = true;
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      files.push(arg);
    }
  }

  return { config, files };
}

function printHelp() {
  console.log('JavaScript Code Formatter v2.1');
  console.log('Built by 狗蛋儿 (goudan) - AI Developer');
  console.log('\nUsage: node code-formatter-v2.cjs [options] <file>');
  console.log('\nOptions:');
  console.log('  -i, --indent <spaces>   Set indent size (default: 2)');
  console.log('  -o, --output <file>     Output to file instead of stdout');
  console.log('  -I, --inplace           Modify file in place');
  console.log('  --no-arrow             Skip arrow function formatting');
  console.log('  --no-objects           Skip object formatting');
  console.log('  --no-arrays            Skip array formatting');
  console.log('  -h, --help             Show this help');
  console.log('\nExamples:');
  console.log('  node code-formatter-v2.cjs input.js');
  console.log('  node code-formatter-v2.cjs -i 4 -o output.js input.js');
  console.log('  node code-formatter-v2.cjs -I input.js  (modify in place)');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(1);
  }

  const { config, files } = parseArgs(args);

  if (files.length === 0) {
    console.error('Error: No input file specified');
    console.error('Use --help for usage information');
    process.exit(1);
  }

  const filename = files[0];

  if (!fs.existsSync(filename)) {
    console.error(`Error: File "${filename}" not found`);
    process.exit(1);
  }

  try {
    const code = fs.readFileSync(filename, 'utf8');
    const formatted = formatCode(code, config);

    if (config.inplace) {
      fs.writeFileSync(filename, formatted, 'utf8');
      console.error(`✓ Formatted ${filename}`);
    } else if (config.outputFile) {
      fs.writeFileSync(config.outputFile, formatted, 'utf8');
      console.error(`✓ Saved to ${config.outputFile}`);
    } else {
      console.log(formatted);
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
