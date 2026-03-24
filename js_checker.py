#!/usr/bin/env python3
"""
Simple JavaScript code checker
Scans a directory for .js files and reports:
 - trailing whitespace
 - lines over max length
 - missing semicolons (naive heuristic)
 - TODO comments
Outputs JSON report to stdout and to js_checker_report.json
"""
import os
import sys
import json
import argparse
from pathlib import Path


def analyze_file(path, max_line_length=120):
    issues = []
    todos = []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i, raw in enumerate(f, start=1):
            line = raw.rstrip('\n')
            stripped = line.strip()
            # trailing whitespace
            if len(line) != len(line.rstrip()):
                issues.append({'line': i, 'type': 'trailing_whitespace', 'text': line})
            # long lines
            if len(line) > max_line_length:
                issues.append({'line': i, 'type': 'long_line', 'length': len(line), 'text': line})
            # TODOs
            if 'TODO' in line or 'todo' in line:
                todos.append({'line': i, 'text': line.strip()})
            # naive missing semicolon check: non-empty, not a block start/end, not a comment, not ending with ;,{,},),:, or ,
            if stripped and not stripped.startswith('//') and not stripped.startswith('/*') and not stripped.endswith((';', '{', '}', ',', ')', ':')):
                # ignore lines that look like control structures or declarations
                lower = stripped.lower()
                if not (lower.startswith('if ') or lower.startswith('for ') or lower.startswith('while ') or lower.startswith('function') or lower.startswith('class') or lower.startswith('switch') or lower.startswith('return') or lower.endswith(')') and ('function' in lower or '=>' in lower)):
                    # also ignore lines that end with operators
                    if not stripped.endswith(('++', '--', '+', '-', '*', '/', '%', '&&', '||', '?')):
                        issues.append({'line': i, 'type': 'possible_missing_semicolon', 'text': line})
    return {'path': str(path), 'issues': issues, 'todos': todos}


def scan_path(target, max_line_length=120):
    target = Path(target)
    report = {'summary': {'files_scanned': 0, 'total_issues': 0, 'total_todos': 0}, 'files': []}
    for p in target.rglob('*.js'):
        report['summary']['files_scanned'] += 1
        file_report = analyze_file(p, max_line_length=max_line_length)
        report['files'].append(file_report)
        report['summary']['total_issues'] += len(file_report['issues'])
        report['summary']['total_todos'] += len(file_report['todos'])
    return report


def main():
    parser = argparse.ArgumentParser(description='Simple JavaScript code checker')
    parser.add_argument('--path', '-p', default='.', help='Target directory to scan')
    parser.add_argument('--max-line-length', '-m', type=int, default=120, help='Max allowed line length')
    parser.add_argument('--output', '-o', default='js_checker_report.json', help='Output JSON filename')
    args = parser.parse_args()

    report = scan_path(args.path, max_line_length=args.max_line_length)
    out = json.dumps(report, indent=2)
    print(out)
    with open(os.path.join(args.path, args.output), 'w', encoding='utf-8') as f:
        f.write(out)
    print('\nReport written to', os.path.join(args.path, args.output))

if __name__ == '__main__':
    main()
