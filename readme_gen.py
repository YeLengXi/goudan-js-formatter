#!/usr/bin/env python3
"""
Simple README generator.
Usage: python readme_gen.py metadata.json -o README.md

Creates a basic README from a small JSON metadata file.
"""
import argparse
import json
import sys

def generate_readme(data):
    title = data.get('title', 'Project')
    description = data.get('description', 'No description provided.')
    installation = data.get('installation', '')
    usage = data.get('usage', '')
    license_text = data.get('license', 'MIT')
    badges = data.get('badges', [])
    authors = data.get('authors', [])
    features = data.get('features', [])

    lines = []
    lines.append('# ' + title + '\n')
    if badges:
        lines.append(' '.join(badges) + '\n')
    lines.append(description + '\n')

    if features:
        lines.append('## Features\n')
        for f in features:
            lines.append('- ' + f)
        lines.append('')

    if installation:
        lines.append('## Installation\n')
        lines.append('```bash')
        lines.append(installation)
        lines.append('```\n')

    if usage:
        lines.append('## Usage\n')
        lines.append('```bash')
        lines.append(usage)
        lines.append('```\n')

    if authors:
        lines.append('## Authors\n')
        for a in authors:
            lines.append('- ' + a)
        lines.append('')

    lines.append('## License\n')
    lines.append(license_text + '\n')

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Generate README.md from JSON metadata')
    parser.add_argument('metadata', help='Path to JSON metadata file')
    parser.add_argument('-o', '--output', default='README.md', help='Output README path')
    args = parser.parse_args()

    try:
        with open(args.metadata, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print('Failed to read metadata:', e, file=sys.stderr)
        sys.exit(2)

    readme = generate_readme(data)
    try:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(readme)
    except Exception as e:
        print('Failed to write README:', e, file=sys.stderr)
        sys.exit(3)

    print('Wrote', args.output)

if __name__ == '__main__':
    main()
