#!/usr/bin/env node

/**
 * JSON Tools Collection
 * Created by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - JSON validation and formatting
 * - JSONPath queries
 * - JSON merge and patch
 * - JSON to CSV/TSV conversion
 * - Command-line interface
 */

const fs = require('fs');
const path = require('path');

class JsonTools {
  static validate(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, data: parsed, error: null };
    } catch (error) {
      return { valid: false, data: null, error: error.message };
    }
  }

  static format(jsonString, indent = 2) {
    const result = this.validate(jsonString);
    if (!result.valid) {
      throw new Error(`Invalid JSON: ${result.error}`);
    }
    return JSON.stringify(result.data, null, indent);
  }

  static minify(jsonString) {
    const result = this.validate(jsonString);
    if (!result.valid) {
      throw new Error(`Invalid JSON: ${result.error}`);
    }
    return JSON.stringify(result.data);
  }

  static query(jsonString, jsonPath) {
    const result = this.validate(jsonString);
    if (!result.valid) {
      throw new Error(`Invalid JSON: ${result.error}`);
    }

    const data = result.data;

    // Simple JSONPath implementation: $.field.array[0].field
    const pathParts = jsonPath.replace('$.', '').split('.');
    let current = data;

    for (const part of pathParts) {
      if (!current) return null;

      // Handle array access: field[0]
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, field, index] = arrayMatch;
        current = current[field];
        if (Array.isArray(current)) {
          current = current[parseInt(index)];
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }

  static merge(...objects) {
    const result = {};
    objects.forEach(obj => {
      if (typeof obj === 'string') {
        const parsed = JSON.parse(obj);
        Object.assign(result, parsed);
      } else {
        Object.assign(result, obj);
      }
    });
    return result;
  }

  static patch(target, patch) {
    const targetObj = typeof target === 'string' ? JSON.parse(target) : target;
    const patchObj = typeof patch === 'string' ? JSON.parse(patch) : patch;

    return { ...targetObj, ...patchObj };
  }

  static toCsv(jsonString) {
    const result = this.validate(jsonString);
    if (!result.valid) {
      throw new Error(`Invalid JSON: ${result.error}`);
    }

    const data = result.data;
    const array = Array.isArray(data) ? data : [data];

    if (array.length === 0) return '';

    // Get all unique keys
    const keys = Array.from(new Set(
      array.flatMap(obj => Object.keys(obj))
    ));

    // Convert to CSV
    const headers = keys.join(',');
    const rows = array.map(obj => {
      return keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return String(value);
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  static fromCsv(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }
        // Try to parse as number
        if (!isNaN(value) && value !== '') {
          value = Number(value);
        }
        obj[header] = value;
      });
      result.push(obj);
    }

    return result;
  }

  static flatten(obj, prefix = '') {
    const result = {};

    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  static unflatten(obj) {
    const result = {};

    for (const key in obj) {
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = obj[key];
    }

    return result;
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log('JSON Tools - by 狗蛋儿 (goudan)');
    console.log('\nUsage: node json-tools.cjs <command> [options]');
    console.log('\nCommands:');
    console.log('  validate <file>           Validate JSON file');
    console.log('  format <file> [indent]    Format JSON file');
    console.log('  minify <file>             Minify JSON file');
    console.log('  query <file> <path>       Query JSON using JSONPath');
    console.log('  merge <file1> <file2> ...  Merge multiple JSON files');
    console.log('  to-csv <file>             Convert JSON to CSV');
    console.log('  from-csv <file>           Convert CSV to JSON');
    console.log('  flatten <file>            Flatten nested JSON');
    console.log('  unflatten <file>          Unflatten JSON');
    console.log('\nExamples:');
    console.log('  node json-tools.cjs validate data.json');
    console.log('  node json-tools.cjs format data.json 4');
    console.log('  node json-tools.cjs query data.json "$.users[0].name"');
    console.log('  node json-tools.cjs to-csv data.json > data.csv');
    console.log('  node json-tools.cjs merge data1.json data2.json');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'validate': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const result = JsonTools.validate(content);

        if (result.valid) {
          console.log('✓ Valid JSON');
          console.log(`Keys: ${Object.keys(result.data).join(', ')}`);
        } else {
          console.log(`✗ Invalid JSON: ${result.error}`);
          process.exit(1);
        }
        break;
      }

      case 'format': {
        const file = args[1];
        const indent = parseInt(args[2]) || 2;
        const content = fs.readFileSync(file, 'utf8');
        const formatted = JsonTools.format(content, indent);
        console.log(formatted);
        break;
      }

      case 'minify': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const minified = JsonTools.minify(content);
        console.log(minified);
        break;
      }

      case 'query': {
        const file = args[1];
        const jsonPath = args[2];
        const content = fs.readFileSync(file, 'utf8');
        const result = JsonTools.query(content, jsonPath);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'merge': {
        const files = args.slice(1);
        const contents = files.map(f => fs.readFileSync(f, 'utf8'));
        const merged = JsonTools.merge(...contents);
        console.log(JSON.stringify(merged, null, 2));
        break;
      }

      case 'to-csv': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const csv = JsonTools.toCsv(content);
        console.log(csv);
        break;
      }

      case 'from-csv': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const json = JsonTools.fromCsv(content);
        console.log(JSON.stringify(json, null, 2));
        break;
      }

      case 'flatten': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(content);
        const flattened = JsonTools.flatten(parsed);
        console.log(JSON.stringify(flattened, null, 2));
        break;
      }

      case 'unflatten': {
        const file = args[1];
        const content = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(content);
        const unflattened = JsonTools.unflatten(parsed);
        console.log(JSON.stringify(unflattened, null, 2));
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Use --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { JsonTools };
