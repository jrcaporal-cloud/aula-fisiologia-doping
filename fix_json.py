import json

file_path = "src/data/parsedPresentation.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Fix Slide 2 (Triangle Node)
for slide in data:
    if slide.get("number") == "01": # Oh wait it's slide ID 2 or number something
        pass
    if 'triangle-node:hover' in slide.get("content", ""):
        content = slide["content"]
        content = content.replace(
            "transform: scale(1.1) translateY(-10px) translateZ(30px) !important;",
            "transform: scale(1.02) translateY(-5px) translateZ(30px) !important; max-height: 480px !important; overflow: hidden !important;"
        )
        content = content.replace(
            "width: 400px !important;",
            "width: 550px !important;"
        )
        slide["content"] = content

    # Fix Slide 29 (Athlete Dossier)
    if 'margin-bottom: -80px;' in slide.get("content", ""):
        content = slide["content"]
        content = content.replace("margin-bottom: -80px; /* Offset the extra height so it overflows instead of pushing down the card too much */", "")
        slide["content"] = content

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done")
