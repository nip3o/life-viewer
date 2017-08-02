# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import json
import os


def get_line_starting_with(file, start):
    for line in file:
        if line.startswith(start):
            return line.replace('\n', '')

    return None


def clean_tag(tag):
    return tag.strip().replace(',', '')


def parse_file(path):
    with open(path, 'r') as file:
        title_line = get_line_starting_with(file, '# ')
        date_line = get_line_starting_with(file, '## ')
        tags_line = get_line_starting_with(file, '\#')

        if not (title_line and len(title_line) > 2):
            raise ValueError('Could not find any title in "{}"'.format(path))

        if not date_line:
            raise ValueError('Could not find any date in "{}"'.format(path))

        date = datetime.datetime.strptime(date_line[3:13], '%Y-%m-%d')

        if tags_line and len(tags_line) > 2:
            tags = [clean_tag(tag) for tag in tags_line[1:].split('#') if tag]
        else:
            tags = []

        return {
            'date': '{:%Y-%m-%d}'.format(date),
            'title': title_line[2:],
            'path': path,
            'tags': tags,
        }


def main():
    items = []

    for root, directories, files in os.walk('items'):
        for file_name in files:
            if not file_name.endswith('.md'):
                continue

            items.append(parse_file(os.path.join(root, file_name)))

    with open('ui/life.json', 'w', encoding='utf8') as file:
        output = json.dumps(items, ensure_ascii=False)
        file.write(output)

main()
