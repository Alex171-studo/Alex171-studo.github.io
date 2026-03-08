import os
import glob
from bs4 import BeautifulSoup

writeups_dir = '/home/alexis/Bureau/Others/Alex171-studo.github.io/writeups/'
files = glob.glob(os.path.join(writeups_dir, '*.html'))

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Remove fade-in from article
    article = soup.find('article', class_='writeup-content')
    if article and 'fade-in' in article.get('class', []):
        article['class'].remove('fade-in')
        
    # Remove fade-in from breadcrumb div
    breadcrumb_divs = soup.find_all('div', class_='fade-in')
    for div in breadcrumb_divs:
        div['class'].remove('fade-in')
        
    # Also fix nested code tags from the previous script
    for pre in soup.find_all('pre'):
        # If pre has a code tag
        code = pre.find('code')
        if code:
            # If this code tag contains ANOTHER code tag directly
            inner_code = code.find('code')
            if inner_code:
                # Merge their contents or unwrap the outer one
                code.unwrap()

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Fixed {filepath}")
