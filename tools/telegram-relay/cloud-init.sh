#!/bin/sh
# Telegram relay for SPORT LINER — cloud-init (user data) for a tiny Ubuntu
# 24.04 server OUTSIDE Russia. From Russian data centres api.telegram.org is
# blocked, so the shop calls the Bot API through this server instead.
#
# Replace before use:
#   RELAY_DOMAIN  DNS name pointing at this server   (notify.sportliner.store)
#   SHOP_IP       public IPv4 of the shop server     (only it may use the relay)
#   BOT_ID        digits before ":" in the bot token (only this bot is relayed)
#
# Then in the shop admin: Настройки → Telegram → «Адрес ретранслятора» =
# https://RELAY_DOMAIN (or TELEGRAM_API_BASE in .env).
set -eu
RELAY_DOMAIN="__RELAY_DOMAIN__"
SHOP_IP="__SHOP_IP__"
BOT_ID="__BOT_ID__"

export DEBIAN_FRONTEND=noninteractive
APT="apt-get -o DPkg::Lock::Timeout=900 -y"
$APT update
if ! $APT install caddy; then
  $APT install curl gpg debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  $APT update
  $APT install caddy
fi

cat > /etc/caddy/Caddyfile <<CADDY
${RELAY_DOMAIN} {
	# Public liveness check (no data passes through it).
	handle /health {
		respond "ok" 200
	}

	# Only the shop server, and only for the shop's own bot.
	@shop {
		remote_ip ${SHOP_IP}
		path /bot${BOT_ID}:*
	}
	handle @shop {
		reverse_proxy https://api.telegram.org {
			header_up Host api.telegram.org
		}
	}

	handle {
		respond "forbidden" 403
	}

	log {
		output discard
	}
}
CADDY

systemctl enable caddy
systemctl restart caddy
