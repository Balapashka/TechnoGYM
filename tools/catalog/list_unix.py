"""Collect UNIX Fit trainer product cards (schema.org microdata) per category."""
import re, json, sys, time, html, urllib.request
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
CATS = {
    "begovye_dorozhki": "treadmills",
    "velotrenazhery": "bikes",
    "ellipticheskie_trenazhery": "ellipticals",
    "grebnye-trenazhery": "rowers",
    "kommercheskie-kardiotrenazhery": "auto",
    "domashnie-kompleksy": "strength",
    "kommercheskie-trenazhyery": "strength",
    "silovye-skami": "benches",
    "silovye-ramy": "racks",
}
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for a in range(8):
        try:
            return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "ignore")
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(4 + a * 3)
    raise SystemExit("giving up on " + url)
CARD = re.compile(r'itemtype="https://schema.org/Product">(.*?)</div>\s*</div>', re.S)
import os
items = {i["url"]: i for i in json.load(open("unix_list.json"))} if os.path.exists("unix_list.json") else {}
for cat, ours in CATS.items():
    for page in range(1, 20):
        url = f"https://unixfit.ru/catalog/{cat}/" + (f"?PAGEN_1={page}" if page > 1 else "")
        h = get(url)
        found = 0
        total_cards = len(re.findall(r'itemtype="https://schema.org/Product"', h))
        for m in re.finditer(r'itemtype="https://schema.org/Product">\s*(.*?)itemprop="availability" href="([^"]+)"', h, re.S):
            blk = m.group(1)
            name = re.search(r'itemprop="name" content="([^"]+)"', blk)
            link = re.search(r'itemprop="url" href="([^"]+)"', blk)
            sku = re.search(r'itemprop="sku" content="([^"]*)"', blk)
            price = re.search(r'itemprop="price" content="([^"]+)"', blk)
            if not (name and link): continue
            u = link.group(1)
            if u in items: continue
            items[u] = {"name": html.unescape(name.group(1)), "url": u, "sku": sku.group(1) if sku else "",
                        "price": float(price.group(1)) if price else None,
                        "availability": m.group(2).rsplit("/", 1)[-1], "src_cat": cat, "cat": ours}
            found += 1
        print(cat, page, "new:", found, file=sys.stderr)
        if total_cards == 0: break
        time.sleep(1.5)
json.dump(list(items.values()), open("unix_list.json", "w"), ensure_ascii=False, indent=1)
print(len(items))
