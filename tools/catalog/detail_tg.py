import re, json, sys, time, html, os, urllib.request
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
def get(url):
    for a in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read().decode("utf-8","ignore")
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(3+a*3)
    return ""
links = json.load(open("tg_links.json"))
out = json.load(open("tg_detail.json")) if os.path.exists("tg_detail.json") else {}
for n, path in enumerate(links):
    if path in out: continue
    url = "https://www.technogym.com" + path
    h = get(url)
    if not h: continue
    d = {"url": url}
    for m in re.finditer(r'<script data-react-helmet="true" type="application/ld\+json">(.*?)</script>', h, re.S):
        try: j = json.loads(m.group(1))
        except Exception: continue
        if j.get("@type") == "Product":
            d["name"] = j.get("name"); d["sku"] = j.get("sku"); d["short"] = j.get("description", ""); d["feed_image"] = (j.get("image") or [None])[0]
        if j.get("@type") == "BreadcrumbList":
            d["crumbs"] = [e["name"] for e in j.get("itemListElement", [])]
    m = re.search(r'property="og:description" content="([^"]*)"', h)
    d["og"] = html.unescape(m.group(1)) if m else ""
    code = (d.get("sku") or "").strip()
    imgs = []
    for u in re.findall(r'https://webapi-prod\.technogym\.com/dw/image/v2/[^"\s\'\\)]+?\.(?:jpg|jpeg|png|webp)', h):
        if code and f"/product/{code}/" in u and u not in imgs: imgs.append(u)
    d["images"] = imgs[:6]
    # long description: first long Russian paragraph in visible text after the H1
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', h, flags=re.S)
    paras = [html.unescape(re.sub(r'<[^>]+>', '', p)).strip() for p in re.findall(r'<p[^>]*>(.*?)</p>', t, re.S)]
    paras = [re.sub(r'\s+', ' ', p) for p in paras if len(p) > 120 and re.search('[а-яА-Я]', p)]
    d["paras"] = paras[:4]
    m = re.search(r'Dimensions(.*?)(?:НОВЫЙ|Воспроизвести|$)', re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))))
    d["dims"] = m.group(1).strip()[:300] if m else ""
    out[path] = d
    print(n, d.get("name"), d.get("crumbs"), len(imgs), file=sys.stderr)
    json.dump(out, open("tg_detail.json", "w"), ensure_ascii=False, indent=1)
    time.sleep(1)
print(len(out))
