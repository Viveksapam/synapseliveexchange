import os

def search_files(directory, search_terms):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'dist' in dirs:
            dirs.remove('dist')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.css'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            for term in search_terms:
                                if term.lower() in line.lower():
                                    print(f"{filepath}:{i+1}: {line.strip()}")
                except Exception:
                    pass

search_files('C:/Users/Vivek/drive/Courses/Meta/7. Python/Synapse-LE/frontend', ['Helmet', 'document.title='])
