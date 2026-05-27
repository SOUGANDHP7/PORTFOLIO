import re

with open('index.html', 'r') as f:
    content = f.read()

# Extract and replace style
style_match = re.search(r'<style>(.*?)</style>', content, flags=re.DOTALL)
if style_match:
    with open('style.css', 'w') as f:
        f.write(style_match.group(1).strip() + '\n')
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="./style.css">')

# Extract and replace script
script_match = re.search(r'<script>(.*?)</script>', content, flags=re.DOTALL)
if script_match:
    with open('script.js', 'w') as f:
        f.write(script_match.group(1).strip() + '\n')
    content = content.replace(script_match.group(0), '<script src="./script.js"></script>')

with open('index.html', 'w') as f:
    f.write(content)
