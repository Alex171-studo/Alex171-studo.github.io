import os
import glob
from bs4 import BeautifulSoup
import bs4

writeups_dir = '/home/alexis/Bureau/Others/Alex171-studo.github.io/writeups/'
files = glob.glob(os.path.join(writeups_dir, '*.html'))

for filepath in files:
    modified = False
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    for term_body in soup.find_all('div', class_='term-interactive-body'):
        for pre in term_body.find_all('pre'):
            target = pre.find('code')
            if not target:
                target = pre
            
            # Keep trimming trailing whitespace strings until we hit something non-empty or non-string
            while len(target.contents) > 0:
                last_child = target.contents[-1]
                if isinstance(last_child, bs4.element.NavigableString):
                    stripped = last_child.rstrip('\n\r\t ')
                    if stripped == '':
                        target.contents.pop()
                        modified = True
                    else:
                        if stripped != last_child:
                            last_child.replace_with(stripped)
                            modified = True
                        break
                else:
                    break

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Trimmed trailing newlines in {filepath}")
    else:
        print(f"No changes for {filepath}")
