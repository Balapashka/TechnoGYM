"""Turn scraped UNIX Fit + Technogym data into catalog rows with local photos."""
import json, re, os, sys, io, time, html, urllib.request, concurrent.futures as cf
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
IMG = "img"; os.makedirs(IMG, exist_ok=True)
TR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
  ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"]))
def slugify(s):
    s = "".join(TR.get(c, c) for c in s.lower())
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s)).strip("-")[:80].strip("-")

def classify_name(name):
    n = name.lower()
    if "беговая" in n: return "treadmills"
    if "велотренаж" in n or "спин" in n or "велоэрг" in n: return "bikes"
    if "эллипт" in n: return "ellipticals"
    if "гребн" in n: return "rowers"
    if "скамья" in n or "гиперэкст" in n: return "benches"
    return None

UNIX_PATH = {"Беговые дорожки": "treadmills", "Велотренажеры": "bikes", "Эллиптические тренажеры": "ellipticals",
  "Гребные тренажеры": "rowers", "Скамьи и гиперэкстензии": "benches", "Стойки для инвентаря": "racks",
  "Коммерческие силовые тренажёры": "strength", "Домашние силовые комплексы": "strength"}
SKIP_PROPS = {"Категории", "Бренд", "Гарантия", "Страна", "Страна производства"}

NOT_TRAINER = re.compile(r"стойка для (гантел|хромир|гриф)|пояс|датчик|пульсометр|чехол|коврик|ремень")
rows = []
for d in json.load(open("unix_detail.json")).values():
    if NOT_TRAINER.search(d["name"].lower()): continue
    cat = classify_name(d["name"]) or UNIX_PATH.get(d["category_path"].split("/")[0])
    if not cat or not d.get("price"): continue
    slug = d["url"].rstrip("/").rsplit("/", 1)[-1]
    slug = slugify(slug)
    if any(r["slug"] == slug for r in rows): continue
    feats = [f"{k}: {v}" for k, v in d["props"] if k not in SKIP_PROPS and v and len(v) < 120]
    desc = d["description"].strip() or d["name"]
    rows.append({"slug": slug, "name": html.unescape(d["name"]), "category": cat, "brand": "UNIX Fit",
      "origin_country": "Китай", "price_cents": int(round(d["price"] * 100)), "price_on_request": False,
      "in_stock": True, "description": desc[:9000], "features": feats[:30],
      "remote_images": ["https://unixfit.ru" + p for p in d["images"][:6]]})

TG_CRUMB = {"Selection line": "strength", "Pure Strength": "strength", "Селекторные тренажеры": "strength",
  "Троссовые тренажеры": "strength", "Многофункциональные и Кабельные тренажеры": "strength",
  "Тренажеры нагружаемые дисками": "strength", "Тренажеры для верхней части тела": "strength",
  "Силовая скамья": "benches", "Велотренажеры": "bikes", "Беговые дорожки": "treadmills",
  "Гребные тренажеры": "rowers", "Эллиптические тренажеры": "ellipticals"}
TYPE = {"treadmills": "Беговая дорожка", "bikes": "Велотренажёр", "ellipticals": "Эллиптический тренажёр",
  "rowers": "Гребной тренажёр", "benches": "Скамья", "strength": "Силовой тренажёр"}
DIMS = [("Length", "Длина", "см"), ("Width", "Ширина", "см"), ("Height", "Высота", "см"),
  ("Max user weight", "Макс. вес пользователя", "кг"), ("Product weight", "Вес тренажёра", "кг"),
  ("Weight stack", "Весовой стек", "кг")]
def tg_cat(d):
    crumb = (d.get("crumbs") or ["?"])[-1]
    if crumb in TG_CRUMB: return TG_CRUMB[crumb]
    n = (d.get("name") or "").lower()
    if crumb == "Вся продукция":
        if "synchro" in n or "vario" in n: return "ellipticals"
        if n.startswith("biostrength") or "crossover" in n: return "strength"
    return None
seen = set()
for d in json.load(open("tg_detail.json")).values():
    cat = tg_cat(d)
    if not cat or not d.get("images"): continue
    base = d["name"].strip()
    name = f"{TYPE[cat]} {base}" if base.lower().startswith("technogym") else f"{TYPE[cat]} Technogym {base}"
    slug = slugify(name)
    if slug in seen: continue
    seen.add(slug)
    paras = []
    for p in d.get("paras", []):
        p = html.unescape(p).strip()
        if p not in paras: paras.append(p)
    short = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", d.get("short") or ""))).strip()
    desc = "\n\n".join(([short] if short and short not in " ".join(paras) else []) + paras) or d.get("og") or name
    feats = []
    for key, ru, unit in DIMS:
        m = re.search(re.escape(key) + r"\s+([\d.,]+)\s*(cm|kg)", d.get("dims", ""))
        if m: feats.append(f"{ru}: {m.group(1)} {unit}")
    feats.append("Поставка: под заказ из Италии")
    rows.append({"slug": slug, "name": name, "category": cat, "brand": "Technogym", "origin_country": "Италия",
      "price_cents": 0, "price_on_request": True, "in_stock": False, "description": desc[:9000],
      "features": feats, "remote_images": [u + ("&" if "?" in u else "?") + "sw=1400" for u in d["images"][:5]]})

def fetch(job):
    url, path = job
    if os.path.exists(path): return path
    for a in range(5):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
            im = Image.open(io.BytesIO(data))
            if im.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", im.size, "white"); im = im.convert("RGBA"); bg.paste(im, mask=im.split()[-1]); im = bg
            else:
                im = im.convert("RGB")
            im.thumbnail((1400, 1400))
            im.save(path, "JPEG", quality=82, optimize=True, progressive=True)
            return path
        except Exception as e:
            time.sleep(2 + a * 2)
    print("FAILED", url, file=sys.stderr); return None
jobs = []
for r in rows:
    r["images"] = []
    for i, u in enumerate(r["remote_images"]):
        p = f"{IMG}/{r['slug']}-{i}.jpg"; jobs.append((u, p)); r["images"].append(p)
with cf.ThreadPoolExecutor(6) as ex:
    done = dict(zip([j[1] for j in jobs], ex.map(fetch, jobs)))
def is_cutout(path):
    """Clean product shot: light background and nothing (logo, captions) in
    the top-left and top-right corners where infographics put their text."""
    im = Image.open(path).convert("L"); w, h = im.size
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3), (w // 2, 2), (w // 2, h - 3)]
    if not all(im.getpixel(p) > 225 for p in pts): return False
    small = im.resize((100, 100))
    def ink(x0, y0, x1, y1):
        px = [small.getpixel((x, y)) for x in range(x0, x1) for y in range(y0, y1)]
        return sum(1 for v in px if v < 200) / len(px)
    return ink(0, 0, 35, 22) < 0.01 and ink(65, 0, 100, 22) < 0.01
for r in rows:
    r["images"] = [p for p in r["images"] if done.get(p)]
    # Lead with a product shot: cards and category tiles look calm and uniform.
    cut = [p for p in r["images"] if is_cutout(p)]
    if cut:
        r["images"] = [cut[0]] + [p for p in r["images"] if p != cut[0]]
rows = [r for r in rows if r["images"]]
json.dump(rows, open("catalog.json", "w"), ensure_ascii=False, indent=1)
import collections
print(len(rows), collections.Counter((r["brand"], r["category"]) for r in rows))
