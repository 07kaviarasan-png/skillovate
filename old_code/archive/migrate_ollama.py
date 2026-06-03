import os
import re

files_to_update = [
    r"d:\Skillovate\js\hr.js",
    r"d:\Skillovate\js\learner.js",
    r"d:\Skillovate\js\institutional-student.js",
    r"d:\Skillovate\js\institutional-core.js",
    r"d:\Skillovate\js\institutional-admin.js"
]

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace constants in hr.js (if present)
    content = re.sub(
        r"const GEMINI_API_KEY = '[^']+';",
        r"const OLLAMA_API_URL = 'http://localhost:11434/api/generate';",
        content
    )
    content = re.sub(
        r"const GEMINI_API_URL = '[^']+';\n?",
        r"",
        content
    )

    # 2. Replace fetch endpoints
    content = content.replace("GEMINI_API_URL+'?key='+GEMINI_API_KEY", "OLLAMA_API_URL")
    content = content.replace("GEMINI_API_URL + '?key=' + GEMINI_API_KEY", "OLLAMA_API_URL")

    # 3. Replace body payloads
    # Matches: body:JSON.stringify({contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7,maxOutputTokens:150}})
    content = re.sub(
        r"body\s*:\s*JSON\.stringify\(\{[\s\r\n]*contents[\s\r\n]*:[\s\r\n]*\[\{[\s\r\n]*parts[\s\r\n]*:[\s\r\n]*\[\{[\s\r\n]*text[\s\r\n]*:[\s\r\n]*([a-zA-Z0-9_]+)[\s\r\n]*\}\][\s\r\n]*\}\][\s\r\n]*,[\s\r\n]*generationConfig[^}]+\}\)",
        r"body: JSON.stringify({ model: 'phi3', prompt: \1, stream: false })",
        content
    )

    # Alternate body match if it's formatted differently
    content = re.sub(
        r"body\s*:\s*JSON\.stringify\(\{\s*contents\s*:\s*\[\{\s*parts\s*:\s*\[\{\s*text\s*:\s*([a-zA-Z0-9_]+)\s*\}\]\s*\}\]\s*,\s*generationConfig\s*:\s*\{\s*temperature\s*:\s*[0-9.]+\s*,\s*maxOutputTokens\s*:\s*[0-9]+\s*\}\s*\}\)",
        r"body: JSON.stringify({ model: 'phi3', prompt: \1, stream: false })",
        content
    )

    # 4. Replace response parsing
    content = content.replace("data.candidates?.[0]?.content?.parts?.[0]?.text", "data.response")
    
    # 5. Replace 'Gemini' text to 'Ollama Phi3'
    # Use re.sub to match 'Gemini' but only in strings, simple replace is okay given the context
    content = content.replace("Gemini is generating", "Ollama Phi3 is generating")
    content = content.replace("via Gemini", "via Ollama Phi3")
    content = content.replace("Google Gemini", "Local Ollama Phi3")
    content = content.replace("Gemini Engine", "Ollama Phi3 Engine")
    content = content.replace(">Gemini<", ">Ollama Phi3<")
    content = content.replace("'Gemini'", "'Ollama Phi3'")
    content = content.replace('"Gemini"', '"Ollama Phi3"')

    # 6. Rename variable caches if needed
    content = content.replace("geminiQCache", "ollamaQCache")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {filepath}")

for path in files_to_update:
    replace_in_file(path)

