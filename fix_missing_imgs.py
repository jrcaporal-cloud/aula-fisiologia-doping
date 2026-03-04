import urllib.request
import json
import os
import time

missing = {
    "ben_johnson.jpg": "Ben Johnson (Canadian sprinter)",
    "lance_armstrong.jpg": "Lance Armstrong",
    "marion_jones.jpg": "Marion Jones",
    "paul_pogba.jpg": "Paul Pogba"
}

headers = {'User-Agent': 'Mozilla/5.0'}

for filename, title in missing.items():
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=500"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            pages = data['query']['pages']
            page = list(pages.values())[0]
            if 'thumbnail' in page:
                img_url = page['thumbnail']['source']
                
                img_req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(img_req) as img_resp:
                    with open(os.path.join("public/athletes", filename), "wb") as f:
                        f.write(img_resp.read())
                        print(f"Downloaded {filename}")
            else:
                print(f"No thumbnail found for {title}")
        time.sleep(1)
    except Exception as e:
        print(f"Failed {filename}: {e}")
