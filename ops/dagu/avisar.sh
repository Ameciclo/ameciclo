#!/bin/sh
# Avisa que um fluxo falhou, por um webhook (ALERT_WEBHOOK_URL: ntfy, Slack, um gateway de WhatsApp...).
# Sem a variável, só deixa a mensagem no log do fluxo.
msg="Dagu: $1"
if [ -z "$ALERT_WEBHOOK_URL" ]; then
  echo "ALERT_WEBHOOK_URL não definido; aviso não enviado: $msg"
  exit 0
fi
curl -fsS -m 20 -X POST -H "content-type: application/json" -d "{\"text\":\"$msg\"}" "$ALERT_WEBHOOK_URL"
