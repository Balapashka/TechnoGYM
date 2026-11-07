import re, json, sys, time, html, os, urllib.request
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
def get(url):
    for a in range(8):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8","ignore")
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(4+a*3)
    return ""
def clean(t):
    t = re.sub(r'<br\s*/?>', '\n', t); t = re.sub(r'</p>|</div>|</li>', '\n', t)
    t = re.sub(r'<[^>]+>', '', t); t = html.unescape(html.unescape(t))
    t = re.sub(r'[ \t ]+', ' ', t)
    lines = [l.strip() for l in t.split('\n')]
    return '\n\n'.join(l for l in lines if l and l not in ('Персональные рекомендации',))
items = [i for i in json.load(open("unix_list.json")) if i["availability"] == "InStock"]
out = json.load(open("unix_detail.json")) if os.path.exists("unix_detail.json") else {}
for n, it in enumerate(items):
    if it["url"] in out: continue
    h = get(it["url"])
    if not h: continue
    d = dict(it); d["name"] = html.unescape(d["name"])
    m = re.search(r"'SLIDER':\[(.*?)\]", h)
    d["images"] = re.findall(r"'SRC':'([^']+)'", m.group(1))[:6] if m else []
    m = re.search(r'itemprop="description"[^>]*id="[^"]*_description">(.*?)<div class="product-item-detail-tab-content"', h, re.S)
    d["description"] = clean(m.group(1)) if m else ""
    props = re.findall(r'product-item-detail-properties-name">\s*(.*?)\s*</div>\s*<div class="product-item-detail-properties-value">\s*(.*?)\s*</div>', h, re.S)
    d["props"] = [(clean(a), clean(b)) for a, b in props]
    m = re.search(r'itemprop="category" content="([^"]+)"', h)
    d["category_path"] = html.unescape(m.group(1)) if m else ""
    m = re.search(r'itemprop="price" content="([^"]+)"', h)
    if m: d["price"] = float(m.group(1))
    out[it["url"]] = d
    print(n, d["name"], len(d["images"]), len(d["props"]), d["category_path"], file=sys.stderr)
    json.dump(out, open("unix_detail.json", "w"), ensure_ascii=False, indent=1)
    time.sleep(1.2)
print(len(out))
