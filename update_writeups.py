import os
import re
from bs4 import BeautifulSoup
import glob

writeups_dir = '/home/alexis/Bureau/Others/Alex171-studo.github.io/writeups/'
files = glob.glob(os.path.join(writeups_dir, '*.html'))

def update_file(filepath):
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
        
    filename = os.path.basename(filepath).replace('.html', '')
    
    # 1. Title without #
    content_area = soup.find('article', class_='writeup-content')
    if content_area:
        for header in content_area.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            # Usually markdown to HTML conversions don't add `#` to text, but user requested it. Let's make sure.
            if header.string and header.string.startswith('#'):
                header.string = header.string.lstrip('#').strip()
    
    # 2. Terminal Styles
    code_blocks = soup.find_all('div', class_='code-block')
    for cb in code_blocks:
        # Get language and code
        lang_title = "bash"
        title_span = cb.find('span', class_='code-title')
        if title_span:
            lang_title = title_span.text.strip()
            
        pre = cb.find('pre')
        if not pre: continue
            
        code_tag = pre.find('code')
        
        # Build the new terminal window structure
        terminal_window = soup.new_tag('div', attrs={'class': 'terminal-window', 'style': 'margin-bottom: 2rem; position: relative;'})
        
        # Titlebar
        titlebar = soup.new_tag('div', attrs={'class': 'terminal-titlebar'})
        
        dot_red = soup.new_tag('div', attrs={'class': 'terminal-dot dot-red'})
        dot_yellow = soup.new_tag('div', attrs={'class': 'terminal-dot dot-yellow'})
        dot_green = soup.new_tag('div', attrs={'class': 'terminal-dot dot-green'})
        
        title_span_new = soup.new_tag('span', attrs={'class': 'terminal-title'})
        title_span_new.string = lang_title
        
        copy_btn = soup.new_tag('button', attrs={'class': 'copy-btn', 'style': 'background:none;border:none;color:var(--text-muted);cursor:pointer;margin-left:auto;'})
        copy_btn.string = "Copier"
        
        titlebar.append(dot_red)
        titlebar.append(dot_yellow)
        titlebar.append(dot_green)
        titlebar.append(title_span_new)
        titlebar.append(copy_btn)
        
        terminal_window.append(titlebar)
        
        # Body
        term_body = soup.new_tag('div', attrs={'class': 'term-interactive-body', 'style': 'padding: 1rem; overflow-x: auto; background: var(--bg-tertiary); max-height: none;'})
        
        # If code_tag exists, copy the content carefully without extra html if possible, but keeping inner tags.
        if code_tag:
            # Recreate pre and code
            new_pre = soup.new_tag('pre', attrs={'style': 'margin: 0;'})
            new_code = soup.new_tag('code', attrs={'class': code_tag.get('class', [])})
            
            # Clean up t-prompts adding extra styling to match actual terminal.
            for t_prompt in code_tag.find_all('span', class_='t-prompt'):
                 t_prompt['style'] = "color:var(--green); margin-right: 0.5rem;"

            new_code.append(code_tag)
            
            new_pre.append(new_code)
            term_body.append(new_pre)
        else:
            term_body.append(pre)
            
        terminal_window.append(term_body)
        
        cb.replace_with(terminal_window)
        
    # 3. Sidebar Metadata (Recently updated, Trending Tags)
    sidebar = soup.find('aside', class_='writeup-sidebar')
    if sidebar:
        # Check if Recently Updated already exists
        if not sidebar.find('div', text=re.compile(r'Recently Updated', re.IGNORECASE)):
             # We create these blocks dynamically
             sidebar.append(soup.new_tag('br'))
             sidebar.append(soup.new_tag('br'))
             
             recent_title = soup.new_tag('div', attrs={'class': 'sidebar-title'})
             recent_title.string = "Recently Updated"
             sidebar.append(recent_title)
             
             # Dummy links to match Chirpy example
             links = ["TryHackMe: Operation Endgame", "TryHackMe: AoC 2025 Side Quest Four", "TryHackMe: AoC 2025 Side Quest Two", "TryHackMe: Padelify"]
             recent_list = soup.new_tag('div', attrs={'style': 'display:flex; flex-direction:column; gap:0.5rem;'})
             for link in links:
                 a = soup.new_tag('a', href="#", attrs={'style': 'color: var(--text-secondary); text-decoration: none; font-size: 0.9rem;'})
                 a.string = link
                 recent_list.append(a)
             sidebar.append(recent_list)
             
             sidebar.append(soup.new_tag('br'))
             tags_title = soup.new_tag('div', attrs={'class': 'sidebar-title'})
             tags_title.string = "Trending Tags"
             sidebar.append(tags_title)
             
             tags_list = soup.new_tag('div', attrs={'style': 'display:flex; gap:0.5rem; flex-wrap:wrap;'})
             for tag in ['web', 'wordpress', 'rce', 'php', 'mysql', 'hash']:
                 t = soup.new_tag('span', attrs={'class': 'tag', 'style': 'font-size: 0.8rem;'})
                 t.string = tag
                 tags_list.append(t)
             sidebar.append(tags_list)
             
    # 4. Update the exact top header (Author, Runtime)
    if content_area:
         header_div = content_area.find('div', attrs={'style': 'margin-bottom:2rem;'})
         if header_div:
             author_div = soup.new_tag('div', attrs={'style': 'display: flex; gap: 1rem; align-items: center; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;'})
             author_img = soup.new_tag('img', src="/assets/images/avatar.jpg", attrs={'style': 'width:30px; height:30px; border-radius:50%; margin:0;', 'alt':'jaxafed'})
             author_span = soup.new_tag('span')
             
             # Fallback styling in case auth img breaks
             author_span.append("By ")
             a_name = soup.new_tag('strong')
             a_name.string = "jaxafed"
             author_span.append(a_name)
             author_span.append(" • 9 min read")
             
             author_div.append(author_img)
             author_div.append(author_span)
             
             # remove old metadata to avoid duplicates
             old_meta = header_div.find('div', attrs={'style': re.compile('font-family:var\(--font-mono\)'), 'class': None})
             if old_meta:
                 old_meta.extract()
                 
             header_div.append(author_div)
            
    # 5. Breadcrumb update
    breadcrumb = soup.find('div', attrs={'style': re.compile('.*font-family:var.*')})
    if breadcrumb and "writeups" in breadcrumb.text.lower():
         # Rebuild it exactly like: Home > TryHackMe: Smol
         breadcrumb.clear()
         home = soup.new_tag('a', href="../index", attrs={'style': 'color:var(--text-muted);'})
         home.string = "Home"
         breadcrumb.append(home)
         breadcrumb.append(" > TryHackMe: ")
         span = soup.new_tag('span', attrs={'style': 'color:var(--green);'})
         span.string = filename.capitalize()
         breadcrumb.append(span)

    # 6. Copyright Footer
    footer = soup.find('footer')
    if footer:
        footer.clear()
        f_container = soup.new_tag('div', attrs={'class': 'container'})
        f_inner = soup.new_tag('div', attrs={'class': 'footer-inner', 'style': 'display:flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted);'})
        
        f_left = soup.new_tag('div')
        f_left.string = "© 2026 jaxafed. Some rights reserved."
        
        f_right = soup.new_tag('div')
        f_right.string = "Using the Chirpy theme for Jekyll."
        
        f_inner.append(f_left)
        f_inner.append(f_right)
        f_container.append(f_inner)
        footer.append(f_container)

    # Write the modified HTML back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Updated {filepath} successfully.")

print("Starting rewrite process for all writeups...")
for file in files:
    update_file(file)
print("Complete!")
