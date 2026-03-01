import json
import re

file_path = "src/data/parsedPresentation.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for slide in data:
    if slide.get("title") == "O STACK OLÍMPICO" or ('O STACK OLÍMPICO' in slide.get("content", "")):
        pass
    if "Saturação de Receptores IR" in slide.get("content", ""):
        content = slide["content"]
        
        # 1. Provide an opaque background to the hover tips for better readability
        content = content.replace(
            "background: rgba(16, 185, 129, 0.15);",
            "background: rgba(10, 15, 25, 0.95);"
        )
        content = content.replace(
            "background: rgba(245, 158, 11, 0.15);",
            "background: rgba(10, 15, 25, 0.95);"
        )
        content = content.replace(
            "background: rgba(220, 38, 38, 0.15);",
            "background: rgba(10, 15, 25, 0.95);"
        )
        
        # 2. Add insulin-tracker class to the parent of the segments, so that the CSS hovering logic works
        content = content.replace(
            '<div style="width: 100%; height: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; display: flex; border: 1px solid rgba(255,255,255,0.1); position: relative; z-index: 10;">',
            '<div class="insulin-tracker" style="width: 100%; height: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; display: flex; border: 1px solid rgba(255,255,255,0.1); position: relative; z-index: 50;">'
        )
        
        # 3. Add a class to the static texts so we can hide them on hover
        content = content.replace(
            '<div style="display: flex; justify-content: space-between; margin-top: 0.8rem; font-size: 0.75rem; color: #6B7280; font-family: var(--font-mono);">',
            '<div class="static-texts" style="display: flex; justify-content: space-between; margin-top: 0.8rem; font-size: 0.75rem; color: #6B7280; font-family: var(--font-mono); position: relative; z-index: 1; transition: opacity 0.3s ease;">'
        )
        
        # 4. Update the CSS blocks to reflect the new hiding behavior
        css_addition = """
                        /* Ocultar guia base e textos no hover geral */
                        .insulin-tracker:hover ~ .guide-text,
                        .insulin-tracker:hover ~ .static-texts {
                            opacity: 0;
                        }
        """
        content = content.replace(
            ".insulin-tracker:hover .guide-text {\n                            opacity: 0;\n                        }",
            css_addition
        )
        
        slide["content"] = content

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Fixed insulin UI.")
