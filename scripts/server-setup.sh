#!/usr/bin/env bash
# One-shot installer for a fresh Ubuntu server (Timeweb, Selectel, …).
#
#   curl -fsSL https://raw.githubusercontent.com/Balapashka/TechnoGYM/<branch>/scripts/server-setup.sh | sudo bash -s -- shop.example.ru owner@mail.ru <branch>
#
# Arguments: <domain> <admin email> [git branch]. Optional env ADMIN_PASSWORD
# presets the admin password (otherwise a random one is printed). Safe to run again: it updates
# the code and restarts the shop, keeping the database, photos and .env.
set -euo pipefail

DOMAIN="${1:-}"
ADMIN_EMAIL="${2:-}"
BRANCH="${3:-main}"
REPO="https://github.com/Balapashka/TechnoGYM.git"
DIR="/opt/sportliner"

say() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✗ %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || die "Запустите от root (sudo)."
[ -n "$DOMAIN" ] || die "Укажите домен: … | bash -s -- sportliner.store you@mail.ru"
[ -n "$ADMIN_EMAIL" ] || die "Укажите email администратора вторым аргументом."

say "1/7 Обновляю систему и ставлю нужные программы"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates dnsutils ufw openssl cron >/dev/null

say "2/7 Файл подкачки (чтобы сборке хватило памяти)"
if ! grep -q '/swapfile' /proc/swaps; then
  [ -f /swapfile ] || fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "3/7 Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh >/dev/null
fi
systemctl enable --now docker >/dev/null

say "4/7 Брандмауэр: открыты только SSH, HTTP и HTTPS"
ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

say "5/7 Код магазина (ветка $BRANCH)"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch -q origin "$BRANCH" && git -C "$DIR" checkout -q "$BRANCH" && git -C "$DIR" reset -q --hard "origin/$BRANCH"
else
  git clone -q --branch "$BRANCH" "$REPO" "$DIR" || die "Не удалось скачать код. Если репозиторий приватный — сделайте его публичным или пришлите разработчику."
fi
cd "$DIR"

say "6/7 Настройки (.env)"
NEW_PASSWORD=""
if [ ! -f .env ]; then
  # A preset password (ADMIN_PASSWORD env, e.g. from cloud-init) or a random one.
  NEW_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | cut -c1-16)}"
  cp .env.example .env
  set_env() { sed -i "s|^$1=.*|$1=$2|" .env; }
  set_env DOMAIN "\"$DOMAIN\""
  set_env SITE_URL "\"https://$DOMAIN\""
  set_env ADMIN_EMAIL "\"$ADMIN_EMAIL\""
  set_env ADMIN_PASSWORD "\"$NEW_PASSWORD\""
  set_env SESSION_COOKIE_SECURE true
  set_env SITE_INDEXABLE false
  set_env DEMO_ACCOUNTS false
  set_env DEMO_EXPOSE_RESET_TOKEN false
  chmod 600 .env
else
  echo "   .env уже есть — оставляю как есть."
fi

SERVER_IP="$(curl -fsS4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
DNS_IP="$(dig +short A "$DOMAIN" | tail -n1 || true)"
if [ "$DNS_IP" != "$SERVER_IP" ]; then
  printf '\n\033[1;31m!  Домен %s пока указывает на "%s", а сервер — %s.\033[0m\n' "$DOMAIN" "${DNS_IP:-ничего}" "$SERVER_IP"
  echo "   Сайт запустится, но HTTPS-сертификат появится, только когда DNS обновится"
  echo "   (A-записи @ и www → $SERVER_IP). Caddy будет пробовать сам."
fi

say "7/7 Сборка и запуск (5–10 минут при первом запуске)"
docker compose -f docker-compose.prod.yml up -d --build

# Daily database backup at 03:30.
CRON="30 3 * * * cd $DIR && docker compose -f docker-compose.prod.yml exec -T app node scripts/backup-db.mjs >/dev/null 2>&1"
{ crontab -l 2>/dev/null | grep -v 'backup-db.mjs' || true; echo "$CRON"; } | crontab -

printf '   Жду запуска магазина'
for _ in $(seq 1 60); do
  if docker compose -f docker-compose.prod.yml exec -T app node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    OK=1; break
  fi
  printf '.'; sleep 5
done
echo

if [ "${OK:-0}" = 1 ]; then
  printf '\n\033[1;32m✓ Магазин запущен.\033[0m\n'
else
  printf '\n\033[1;31m✗ Магазин не ответил за 5 минут. Покажите разработчику вывод:\033[0m\n'
  echo "   cd $DIR && docker compose -f docker-compose.prod.yml logs --tail=80 app"
fi
echo
echo "   Сайт:     https://$DOMAIN"
echo "   Админка:  https://$DOMAIN/admin"
echo "   Логин:    $ADMIN_EMAIL"
if [ -n "$NEW_PASSWORD" ]; then
  printf '   Пароль:   \033[1m%s\033[0m   ← сохраните его сейчас, он показывается один раз\n' "$NEW_PASSWORD"
else
  echo "   Пароль:   прежний (см. ADMIN_PASSWORD в $DIR/.env)"
fi
echo
echo "   Обновить сайт позже: запустите эту же команду ещё раз."
