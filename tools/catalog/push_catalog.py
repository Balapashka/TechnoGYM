"""Upload photos and import catalog.json into a running SPORT LINER site.

usage: push_catalog.py <base_url> <admin_email> <password_file> [--apply]
Without --apply only a dry run (counts) is performed after the photo upload.
"""
import json, sys, os, io, csv, uuid, urllib.request, http.cookiejar, mimetypes
base, email, pwfile = sys.argv[1].rstrip("/"), sys.argv[2], sys.argv[3]
apply = "--apply" in sys.argv
password = open(pwfile).read().strip()
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

def req(path, data=None, headers=None, method=None):
    r = urllib.request.Request(base + path, data=data, headers=headers or {}, method=method)
    try:
        with opener.open(r, timeout=300) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

st, body = req("/api/auth/login", json.dumps({"email": email, "password": password}).encode(), {"Content-Type": "application/json"})
assert st == 200, (st, body[:200])

def multipart(fields, files):
    b = uuid.uuid4().hex; out = io.BytesIO()
    for k, v in fields.items():
        out.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for k, (name, data, ctype) in files:
        out.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: {ctype}\r\n\r\n'.encode())
        out.write(data); out.write(b"\r\n")
    out.write(f"--{b}--\r\n".encode())
    return out.getvalue(), f"multipart/form-data; boundary={b}"

rows = json.load(open("catalog.json"))
mapfile = "uploaded-" + base.replace("://", "_").replace("/", "_").replace(":", "_") + ".json"
uploaded = json.load(open(mapfile)) if os.path.exists(mapfile) else {}
pending = [p for r in rows for p in r["images"] if p not in uploaded]
print("photos to upload:", len(pending))
for i in range(0, len(pending), 10):
    batch = pending[i:i + 10]
    data, ctype = multipart({}, [("files", (os.path.basename(p), open(p, "rb").read(), "image/jpeg")) for p in batch])
    st, body = req("/api/admin/uploads", data, {"Content-Type": ctype})
    assert st == 201, (st, body[:300])
    for p, u in zip(batch, json.loads(body)["urls"]): uploaded[p] = u
    json.dump(uploaded, open(mapfile, "w"))
    print(f"  {min(i + 10, len(pending))}/{len(pending)}", flush=True)

clean = lambda s: str(s).replace("|", "/").replace("\r", "")
out = io.StringIO()
w = csv.writer(out, delimiter=";", lineterminator="\r\n")
w.writerow(["slug","name","category","brand","origin_country","price_rub","price_on_request","in_stock","badge","description","features","images"])
for r in rows:
    w.writerow([r["slug"], r["name"], r["category"], r["brand"], r["origin_country"],
        "" if r["price_on_request"] else r["price_cents"] / 100, "да" if r["price_on_request"] else "нет",
        "да" if r["in_stock"] else "нет", "", r["description"],
        " | ".join(clean(f) for f in r["features"]), " | ".join(uploaded[p] for p in r["images"])])
csv_bytes = ("﻿" + out.getvalue()).encode("utf-8")
open("catalog-import.csv", "wb").write(csv_bytes)
fields = {"deleteMissing": "1"}
if not apply: fields["dryRun"] = "1"
data, ctype = multipart(fields, [("file", ("catalog.csv", csv_bytes, "text/csv"))])
st, body = req("/api/admin/catalog/import", data, {"Content-Type": ctype})
print(st, body.decode()[:2000])
