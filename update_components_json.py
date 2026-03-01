import json

file_path = "src/data/parsedPresentation.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for slide in data:
    if slide.get("id") == 2:
        slide["layout"] = "prose"
        slide["cards"] = []
        slide["content"] = "[[COMP:TriangleInfographic]]"
    elif slide.get("id") == 21:
        slide["layout"] = "prose"
        slide["cards"] = []
        slide["content"] = "[[COMP:RealityCheck]]"

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("JSON updated successfully for custom components.")
