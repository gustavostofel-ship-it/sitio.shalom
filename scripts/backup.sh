#!/bin/sh
# Cópia de segurança do banco (Linux/servidor/Git Bash). Uso: sh scripts/backup.sh
#
# Variáveis opcionais:
#   COMPOSE_FILE   arquivo do compose (no servidor: docker-compose.prod.yml)
#   BACKUP_DIR     onde guardar (padrão: ~/backups-shalom, FORA da pasta do projeto e do OneDrive)
#   BACKUP_GUARDAR quantos arquivos manter (padrão: 30)
#
# O arquivo só ganha o nome final se o backup terminou certo: nunca fica um arquivo vazio
# ou pela metade com cara de backup válido. Ele contém dados de clientes e hashes de senha:
# fica com permissão só do dono (umask 077). Copie para FORA do servidor (e, de preferência, criptografado).
set -eu
umask 077

pasta="${BACKUP_DIR:-$HOME/backups-shalom}"
guardar="${BACKUP_GUARDAR:-30}"
compose="docker compose"
[ -n "${COMPOSE_FILE:-}" ] && compose="docker compose -f $COMPOSE_FILE"

mkdir -p "$pasta"
chmod 700 "$pasta" 2>/dev/null || true
final="$pasta/shalom-$(date +%F-%H%M).sql.gz"
parcial="$final.parcial"

# pipefail não existe em todo sh: o pg_dump grava num arquivo temporário e o status é conferido à parte.
tmp="$parcial.sql"
trap 'rm -f "$parcial" "$tmp"' EXIT INT TERM
if ! $compose exec -T db pg_dump -U shalom --clean --if-exists shalom > "$tmp"; then
  echo "ERRO: o backup falhou (o banco está ligado?). Nada foi salvo." >&2
  exit 1
fi
# Um dump completo termina sempre com esta frase.
if ! tail -n 5 "$tmp" | grep -q "PostgreSQL database dump complete"; then
  echo "ERRO: o backup veio incompleto. Nada foi salvo." >&2
  exit 1
fi
gzip -c "$tmp" > "$parcial"
mv "$parcial" "$final"
rm -f "$tmp"

# Mantém só os mais recentes.
ls -1t "$pasta"/shalom-*.sql.gz 2>/dev/null | tail -n +"$((guardar + 1))" | while read -r velho; do rm -f "$velho"; done

echo "Backup salvo em $final"
