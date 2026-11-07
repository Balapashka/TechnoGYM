import re, json, sys, time, urllib.request
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
def get(url):
    for a in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read().decode("utf-8","ignore")
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(3+a*3)
    return ""
cats = ["begovye-dorozhki","treadmills","velotrenazhery","exercise-bikes","ellipticheskie-trenazhery","ellipticals-and-cross-trainers",
        "silovaya-skamya","benches","silovaya-stoyki","mnogofunktsionalnye-trenazhery","multigyms","multistantsii","selection","pure-strength",
        "personal","artis","excite","skill","biostrength","vse-produktsiya","trenazhery-lestnitsa"]
links = {}
for c in cats:
    h = get(f"https://www.technogym.com/ru-INT/category/{c}/")
    found = set(re.findall(r'href="(/ru-INT/product/[^"]+\.html)"', h))
    for l in found: links.setdefault(l, c)
    print(c, len(found), file=sys.stderr); time.sleep(1)
json.dump(links, open("tg_links.json","w"), ensure_ascii=False, indent=1)
print(len(links))
