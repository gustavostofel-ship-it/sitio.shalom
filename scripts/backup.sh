#!/bin/sh
# Cópia de segurança do banco. Uso: sh scripts/backup.sh
# Gera backups/shalom-AAAA-MM-DD-HHMM.sql. Guarde essa pasta fora deste computador também.
set -e
mkdir -p backups
arquivo="backups/shalom-$(date +%F-%H%M).sql"
docker compose exec -T db pg_dump -U shalom --clean --if-exists shalom > "$arquivo"
echo "Backup salvo em $arquivo"
