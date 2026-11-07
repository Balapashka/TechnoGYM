# Обновление каталога из источников

Скрипты собирают актуальный каталог тренажёров и загружают его на сайт через
админку («Импорт / экспорт»). Нужны Python 3 и Pillow (`pip install pillow`).

| Скрипт | Что делает |
| --- | --- |
| `list_unix.py` | список тренажёров UNIX Fit с unixfit.ru (цены, наличие) |
| `detail_unix.py` | описание, характеристики и фото каждого товара UNIX Fit (только «в наличии») |
| `list_tg.py`, `detail_tg.py` | модели Technogym с русской версии technogym.com (цена по запросу) |
| `build_catalog.py` | собирает `catalog.json`, скачивает и сжимает фото в `img/` |
| `push_catalog.py` | загружает фото и каталог на сайт |

```bash
mkdir -p ~/catalog && cd ~/catalog
for f in list_unix detail_unix list_tg detail_tg build_catalog; do python3 /path/to/tools/catalog/$f.py; done
echo -n 'ПАРОЛЬ_АДМИНА' > pw.txt
python3 /path/to/tools/catalog/push_catalog.py https://sportliner.store admin@sportliner.store pw.txt          # проверка
python3 /path/to/tools/catalog/push_catalog.py https://sportliner.store admin@sportliner.store pw.txt --apply  # загрузка
```

Импорт сопоставляет товары по `slug`: существующие обновляются (цены, наличие),
новые создаются, а товары, которых нет в файле, **удаляются** — товары,
добавленные вручную в админке, нужно сначала выгрузить («Скачать каталог»)
и добавить в файл. Фото и тексты производителей используются как у дилера:
права на их использование подтверждаются договором с поставщиком.
