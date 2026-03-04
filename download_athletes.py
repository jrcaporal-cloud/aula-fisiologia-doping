import urllib.request
import os
import time

athletes = {
    "ben_johnson.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Ben_Johnson_%281988%29.jpg",
    "lance_armstrong.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/e3/LanceArmstrong_2010_Tour_de_Suisse.jpg",
    "marion_jones.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Marion_Jones_2007.jpg",
    "jon_jones.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/43/Jon_Jones_-_Supporting_Brain_Health_Study.jpg",
    "kamila_valieva.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/62/%D0%9A%D0%B0%D0%BC%D0%B8%D0%BB%D0%B0_%D0%92%D0%B0%D0%BB%D0%B8%D0%B5%D0%B2%D0%B0_%2826-04-2022%29.jpg",
    "maria_sharapova.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Maria_Sharapova_during_opening_night_of_Web_Summit_2025_at_the_MEO_Arena_in_Lisbon%2C_Portugal.jpg",
    "paul_pogba.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Paul_Pogba_at_the_2025_Cannes_Film_Festival_02.jpg",
    "tj_dillashaw.png": "https://upload.wikimedia.org/wikipedia/commons/6/68/TJ_Dillashaw.png"
}

headers = {'User-Agent': 'Mozilla/5.0'}

os.makedirs("public/athletes", exist_ok=True)

for filename, url in athletes.items():
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read()
            with open(os.path.join("public/athletes", filename), 'wb') as out_file:
                out_file.write(data)
        print(f"Downloaded {filename}")
        time.sleep(1) # Be nice to Wiki Servers
    except Exception as e:
        print(f"Failed to download {filename} from {url}: {e}")
