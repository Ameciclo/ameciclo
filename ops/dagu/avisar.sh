#!/bin/sh
# Avisa que um fluxo falhou, por um webhook (ALERT_WEBHOOK_URL: ntfy, Slack, um gateway de WhatsApp...).
# Sem a variável, só deixa a mensagem no log do fluxo.
msg="Dagu: $1"
# Variável não definida no container chega ao fluxo como o texto literal "${ALERT_WEBHOOK_URL}": só vale uma URL http(s).
case "$ALERT_WEBHOOK_URL" in
  http://*|https://*) ;;
  *)
    echo "ALERT_WEBHOOK_URL não definido; aviso não enviado: $msg"
    exit 0
    ;;
esac
curl -fsS -m 20 -X POST -H "content-type: application/json" -d "{\"text\":\"$msg\"}" "$ALERT_WEBHOOK_URL"
