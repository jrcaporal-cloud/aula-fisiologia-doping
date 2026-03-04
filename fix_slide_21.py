import json

file_path = "src/data/parsedPresentation.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for slide in data:
    if slide.get("id") == 21:
        slide["layout"] = "prose"
        slide["content"] = "[[COMP:RealityCheck]]"
        slide["cards"] = []

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
