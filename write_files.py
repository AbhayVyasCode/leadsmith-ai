import os
import json

dir_path = r'D:/Personal/leadsmith/web/components/app'
os.makedirs(dir_path, exist_ok=True)

# Read content from JSON files
with open(r'D:/Personal/leadsmith/sidebar.json', r'r', encoding=r'utf-8') as sf:
    sidebar_content = json.load(sf)[r'content']
with open(r'D:/Personal/leadsmith/header.json', r'r', encoding=r'utf-8') as hf:
    header_content = json.load(hf)[r'content']

with open(os.path.join(dir_path, r'app-sidebar.tsx'), r'w', encoding=r'utf-8') as f:
    f.write(sidebar_content)
    print(r'Written app-sidebar.tsx')
with open(os.path.join(dir_path, r'app-header.tsx'), r'w', encoding=r'utf-8') as f:
    f.write(header_content)
    print(r'Written app-header.tsx')
print(r'Done.')
