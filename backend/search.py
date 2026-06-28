import os

def search_files(directory, search_terms):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'venv' in dirs:
            dirs.remove('venv')
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
        
        for file in files:
            if file.endswith('.py'):
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

search_files('C:/Users/Vivek/drive/Courses/Meta/7. Python/Synapse-LE/backend', ['latency', 'ethical'])
