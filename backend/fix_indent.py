with open('d:/Personal/leadsmith/server.py', 'r') as f:
    lines = f.readlines()

for i in range(256, len(lines)):
    if lines[i].startswith('    '):
        lines[i] = lines[i][4:]

with open('d:/Personal/leadsmith/server.py', 'w') as f:
    f.writelines(lines)
