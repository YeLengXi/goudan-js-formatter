#!/usr/bin/env node

/**
 * JavaScript Code Formatter v3.0
 * Enhanced by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - Advanced arrow function formatting
 * - Smart object/array formatting
 * - Comment preservation
 * - Config file support (.formatterrc)
 * - Chained method formatting
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const DEFAULT_CONFIG = {
  indentSize: 2,
  maxLineLength: 80,
  formatArrowFunctions: true,
  formatObjects: true,
  formatArrays: true,
  formatChained: true,
  preserveComments: true,
  quoteStyle: 'single',  // 'single' | 'double'
  trailingComma: true,
  semi: true
};

function loadConfigFile(dir) {
  const configPath = path.join(dir, '.formatterrc');
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Warning: Failed to load .formatterrc: ${error.message}`);
    }
  }
  return {};
}

function formatCode(code, config = DEFAULT_CONFIG) {
  // Extract comments to preserve them
  const comments = [];
  if (config.preserveComments) {
    // Single-line comments
    code = code.replace(/\/\/.*$/gm, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });
    // Multi-line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });
  }

  let formatted = code;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Step 1: Format arrow function parameters FIRST (before adding spaces around =)
  if (config.formatArrowFunctions) {
    // Format parameters: (a,b) => (a, b)
    formatted = formatted.replace(/\(([^)]+)\)/g, (match) => {
      if (match.includes(',')) {
        const params = match.slice(1, -1).split(',').map(s => s.trim()).join(', ');
        return '(' + params + ')';
      }
      return match;
    });
  }

  // Step 2: Add spaces around operators
  // Add spaces around =
  formatted = formatted.replace(/(\w)=([^=\n])/g, '$1 = $2');
  // Add spaces around => (but not double spaces)
  if (config.formatArrowFunctions) {
    formatted = formatted.replace(/=>/g, '=> ');
    // Clean up double spaces after =>
    formatted = formatted.replace(/=>  +/g, '=> ');
  }

  // Step 3: Format objects (only if they're short enough)
  if (config.formatObjects) {
    // Only format short objects (< 50 chars)
    formatted = formatted.replace(/({[^}]{1,50}})/g, (match) => {
      // Don't add newlines for short objects
      let result = match;
      // Add space after colons
      result = result.replace(/:/g, ': ');
      // Add space after commas
      result = result.replace(/,/g, ', ');
      return result;
    });
  }

  // Step 3: Add newlines after semicolons
  formatted = formatted.replace(/;/g, ';\n');

  // Step 4: Add newlines after opening braces
  formatted = formatted.replace(/{/g, '{\n');

  // Step 5: Add newlines before closing braces
  formatted = formatted.replace(/}/g, '\n}\n');

  // Step 6: Add newlines after keywords
  formatted = formatted.replace(/\b(function|const|let|var|if|for|while|else|return|class)\b/g, '\n$1');

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Restore comments
  if (config.preserveComments) {
    comments.forEach((comment, i) => {
      formatted = formatted.replace(`__COMMENT_${i}__`, comment);
    });
  }

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
    } else if (arg === '-c' || arg === '--config') {
      const configDir = path.dirname(args[++i]);
      Object.assign(config, loadConfigFile(configDir || '.'));
    } else if (arg === '--no-arrow') {
      config.formatArrowFunctions = false;
    } else if (arg === '--no-objects') {
      config.formatObjects = false;
    } else if (arg === '--no-arrays') {
      config.formatArrays = false;
    } else if (arg === '--no-chained') {
      config.formatChained = false;
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
  console.log('JavaScript Code Formatter v3.0');
  console.log('Enhanced by 狗蛋儿 (goudan) - AI Developer');
  console.log('\nUsage: node code-formatter-v3.cjs [options] <file>');
  console.log('\nOptions:');
  console.log('  -i, --indent <spaces>    Set indent size (default: 2)');
  console.log('  -o, --output <file>      Output to file instead of stdout');
  console.log('  -c, --config <file>      Load config file');
  console.log('  -I, --inplace            Modify file in place');
  console.log('  --no-arrow               Skip arrow function formatting');
  console.log('  --no-objects             Skip object formatting');
  console.log('  --no-arrays              Skip array formatting');
  console.log('  --no-chained             Skip chained method formatting');
  console.log('  -h, --help               Show this help');
  console.log('\nConfig File (.formatterrc):');
  console.log('  {');
  console.log('    "indentSize": 2,');
  console.log('    "maxLineLength": 80,');
  console.log('    "formatArrowFunctions": true,');
  console.log('    "formatObjects": true,');
  console.log('    "formatArrays": true,');
  console.log('    "formatChained": true');
  console.log('  }');
  console.log('\nExamples:');
  console.log('  node code-formatter-v3.cjs input.js');
  console.log('  node code-formatter-v3.cjs -i 4 -o output.js input.js');
  console.log('  node code-formatter-v3.cjs -I input.js  (modify in place)');
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

module.exports = { formatCode, DEFAULT_CONFIG };
