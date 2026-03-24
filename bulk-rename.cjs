#!/usr/bin/env node

/**
 * Bulk Rename Tool
 * Created by 狗蛋儿 (goudan) - AI Developer
 *
 * Features:
 * - Bulk rename files in a directory
 * - Pattern matching and replacement
 * - Numbering and date insertion
 * - Case conversion
 * - Preview and confirmation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class BulkRenamer {
  constructor(options = {}) {
    this.dir = options.dir || process.cwd();
    this.pattern = options.pattern || null;
    this.replacement = options.replacement || '';
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';
    this.startNumber = options.startNumber || 1;
    this.caseConvert = options.caseConvert || null; // 'upper', 'lower', 'title'
    this.dryRun = options.dryRun !== false;
    this.extensions = options.extensions || [];
  }

  getFiles() {
    const files = fs.readdirSync(this.dir);
    return files.filter(file => {
      const fullPath = path.join(this.dir, file);
      const stat = fs.statSync(fullPath);

      if (!stat.isFile()) return false;
      if (this.extensions.length > 0) {
        const ext = path.extname(file);
        return this.extensions.includes(ext);
      }
      return true;
    });
  }

  generateNewName(oldName, index) {
    let newName = oldName;
    const ext = path.extname(oldName);
    const baseName = path.basename(oldName, ext);

    // Apply pattern replacement
    if (this.pattern) {
      const regex = new RegExp(this.pattern, 'g');
      newName = baseName.replace(regex, this.replacement) + ext;
    } else {
      newName = baseName + ext;
    }

    // Add prefix and suffix
    const base = path.basename(newName, ext);
    newName = this.prefix + base + this.suffix + ext;

    // Add numbering if requested
    if (this.startNumber > 0) {
      const base2 = path.basename(newName, ext);
      newName = `${base2}_${this.startNumber + index}${ext}`;
    }

    // Case conversion
    if (this.caseConvert) {
      const base3 = path.basename(newName, ext);
      switch (this.caseConvert) {
        case 'upper':
          newName = base3.toUpperCase() + ext;
          break;
        case 'lower':
          newName = base3.toLowerCase() + ext;
          break;
        case 'title':
          newName = this.toTitleCase(base3) + ext;
          break;
      }
    }

    return newName;
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  preview() {
    const files = this.getFiles();
    const changes = [];

    files.forEach((oldName, index) => {
      const newName = this.generateNewName(oldName, index);
      if (oldName !== newName) {
        changes.push({ old: oldName, new: newName });
      }
    });

    return changes;
  }

  execute() {
    const changes = this.preview();

    if (changes.length === 0) {
      console.log('No files to rename.');
      return { success: true, renamed: 0 };
    }

    console.log(`\nPreview: ${changes.length} file(s) will be renamed\n`);

    changes.forEach(({ old, new: newName }) => {
      console.log(`  ${old} → ${newName}`);
    });

    if (this.dryRun) {
      console.log('\n[Dry run - use --confirm to actually rename]');
      return { success: true, renamed: 0, dryRun: true };
    }

    // Perform renaming
    let renamed = 0;
    let errors = 0;

    changes.forEach(({ old, new: newName }) => {
      const oldPath = path.join(this.dir, old);
      const newPath = path.join(this.dir, newName);

      try {
        if (fs.existsSync(newPath)) {
          console.log(`\n⚠ Skipped: ${newName} already exists`);
          errors++;
        } else {
          fs.renameSync(oldPath, newPath);
          renamed++;
          console.log(`✓ Renamed: ${old} → ${newName}`);
        }
      } catch (error) {
        console.error(`✗ Error renaming ${old}: ${error.message}`);
        errors++;
      }
    });

    console.log(`\n✓ Renamed ${renamed} file(s)`);
    if (errors > 0) {
      console.log(`✗ ${errors} error(s)`);
    }

    return { success: true, renamed, errors };
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log('Bulk Rename Tool - by 狗蛋儿 (goudan)');
    console.log('\nUsage: node bulk-rename.cjs <directory> [options]');
    console.log('\nOptions:');
    console.log('  --pattern, -p <regex>    Pattern to match');
    console.log('  --replace, -r <text>     Replacement text');
    console.log('  --prefix <text>         Add prefix to filename');
    console.log('  --suffix <text>         Add suffix to filename');
    console.log('  --number, -n <start>     Add numbering (default: 1)');
    console.log('  --case <mode>           Case conversion: upper|lower|title');
    console.log('  --ext, -e <exts>        Filter by extensions (comma-separated)');
    console.log('  --dry-run               Preview only (default)');
    console.log('  --confirm               Actually rename files');
    console.log('\nExamples:');
    console.log('  node bulk-rename.cjs ./src --pattern "old" --replace "new"');
    console.log('  node bulk-rename.cjs ./files --prefix "backup_" --confirm');
    console.log('  node bulk-rename.cjs ./images --number 100 --ext .jpg,.png');
    console.log('  node bulk-rename.cjs ./files --pattern "_(\\d+)" --replace "_$1"');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const dir = args[0];
  const options = { dir };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--pattern' || arg === '-p') {
      options.pattern = args[++i];
    } else if (arg === '--replace' || arg === '-r') {
      options.replacement = args[++i];
    } else if (arg === '--prefix') {
      options.prefix = args[++i];
    } else if (arg === '--suffix') {
      options.suffix = args[++i];
    } else if (arg === '--number' || arg === '-n') {
      options.startNumber = parseInt(args[++i]) || 1;
    } else if (arg === '--case') {
      options.caseConvert = args[++i];
    } else if (arg === '--ext' || arg === '-e') {
      options.extensions = args[++i].split(',').map(e => e.startsWith('.') ? e : '.' + e);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--confirm') {
      options.dryRun = false;
    }
  }

  if (!fs.existsSync(dir)) {
    console.error(`Error: Directory "${dir}" not found`);
    process.exit(1);
  }

  const renamer = new BulkRenamer(options);
  const result = renamer.execute();

  if (!result.success) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { BulkRenamer };
