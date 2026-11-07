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

trap 'printf "\n\033[1;31m✗ Ошибка в строке %s (шаг выше). Покажите этот вывод разработчику.\033[0m\n" "$LINENO"' ERR

say "1/7 Обновляю систему и ставлю нужные программы"
export DEBIAN_FRONTEND=noninteractive
# On a fresh server the OS installs updates on first boot and holds the
# package lock; wait for it instead of failing (applies to get.docker.com too).
echo 'DPkg::Lock::Timeout "1200";' > /etc/apt/apt.conf.d/99sportliner-lock-timeout
apt-get update -qq
apt-get install -y -qq git curl ca-certificates dnsutils ufw openssl cron >/dev/null

say "2/7 Файл подкачки (чтобы сборке хватило памяти)"
if ! grep -q '/swapfile' /proc/swaps; then
  [ -f /swapfile ] || fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "3/7 Docker"
# Docker from Ubuntu's own repositories: download.docker.com and Docker Hub
# limit access from Russian IPs. Images are pulled through the Timeweb mirror
# (Docker falls back to Docker Hub itself if the mirror is unreachable).
if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  apt-get install -y -qq docker.io docker-compose-v2 docker-buildx >/dev/null
fi
mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
  printf '{\n  "registry-mirrors": ["https://dockerhub.timeweb.cloud"]\n}\n' > /etc/docker/daemon.json
fi
systemctl enable docker >/dev/null 2>&1 || true
systemctl restart docker
docker compose version

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

say "Автообновление"
# Auto-update + self-heal: every 10 minutes pull the branch and rebuild when
# it changed OR when the shop is not running (e.g. a build that failed on a
# flaky network is retried automatically). Installed before the first build.
cat > /usr/local/bin/sportliner-update <<UPD
#!/bin/sh
set -e
cd $DIR
git fetch -q origin $BRANCH
NEED=0
if [ "\$(git rev-parse HEAD)" != "\$(git rev-parse origin/$BRANCH)" ]; then
  echo "Updating to \$(git rev-parse --short origin/$BRANCH)"
  git reset -q --hard origin/$BRANCH
  NEED=1
fi
if [ -z "\$(docker compose -f docker-compose.prod.yml ps -q --status running app 2>/dev/null)" ]; then
  echo "Shop is not running - (re)building"
  NEED=1
fi
if [ "\$NEED" = 1 ]; then
  docker compose -f docker-compose.prod.yml up -d --build
  docker image prune -f >/dev/null 2>&1 || true
fi
UPD
chmod +x /usr/local/bin/sportliner-update
cat > /etc/systemd/system/sportliner-update.service <<'UNIT'
[Unit]
Description=Update SPORT LINER from git
After=network-online.target docker.service
[Service]
Type=oneshot
ExecStart=/usr/local/bin/sportliner-update
UNIT
cat > /etc/systemd/system/sportliner-update.timer <<'UNIT'
[Unit]
Description=Check for SPORT LINER updates every 10 minutes
[Timer]
OnActiveSec=20min
OnUnitActiveSec=10min
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable sportliner-update.timer >/dev/null
systemctl start sportliner-update.timer

say "7/7 Сборка и запуск (10–30 минут при первом запуске)"
if ! docker compose -f docker-compose.prod.yml up -d --build; then
  printf '\n\033[1;33m!  Сборка не удалась (часто это обрыв связи при скачивании). Сервер сам\n   повторит её в течение 10 минут — проверьте сайт позже.\033[0m\n'
  exit 1
fi

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
if [ -n "$NEW_PASSWORD" ] && [ -z "${ADMIN_PASSWORD:-}" ]; then
  printf '   Пароль:   \033[1m%s\033[0m   ← сохраните его сейчас, он показывается один раз\n' "$NEW_PASSWORD"
elif [ -n "$NEW_PASSWORD" ]; then
  echo "   Пароль:   заданный при установке"
else
  echo "   Пароль:   прежний (см. ADMIN_PASSWORD в $DIR/.env)"
fi
echo
echo "   Обновления: сервер сам проверяет GitHub каждые 10 минут (журнал: journalctl -u sportliner-update)."
