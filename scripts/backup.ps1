# Cópia de segurança do banco no Windows (PowerShell). Uso: powershell -File scripts\backup.ps1
# Guarda em %USERPROFILE%\backups-shalom (fora da pasta do projeto e do OneDrive).
# O arquivo só ganha o nome final se o backup terminou certo. Contém dados de clientes e hashes de senha:
# copie para um lugar seguro e não compartilhe.
param(
  [string]$ComposeFile = '',
  [string]$Pasta = (Join-Path $env:USERPROFILE 'backups-shalom'),
  [int]$Guardar = 30
)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
New-Item -ItemType Directory -Force $Pasta | Out-Null

$compose = @('compose')
if ($ComposeFile) { $compose += @('-f', $ComposeFile) }
$nome = 'shalom-' + (Get-Date -Format 'yyyy-MM-dd-HHmm') + '.sql'
$final = Join-Path $Pasta $nome
$parcial = "$final.parcial"

try {
  # O dump é gerado DENTRO do contêiner e copiado depois: o redirecionamento do PowerShell estragaria a codificação.
  & docker @compose exec -T db sh -c 'pg_dump -U shalom --clean --if-exists shalom > /tmp/backup.sql'
  if ($LASTEXITCODE -ne 0) { throw 'o pg_dump falhou (o banco está ligado?)' }
  & docker @compose cp db:/tmp/backup.sql $parcial
  if ($LASTEXITCODE -ne 0) { throw 'não consegui copiar o arquivo do banco' }
  & docker @compose exec -T db rm -f /tmp/backup.sql | Out-Null

  $fim = Get-Content $parcial -Tail 5 -Encoding UTF8 | Out-String
  if ($fim -notmatch 'PostgreSQL database dump complete') { throw 'o backup veio incompleto' }
  Move-Item $parcial $final
} catch {
  Remove-Item $parcial -ErrorAction SilentlyContinue
  Write-Host "ERRO: $($_.Exception.Message). Nada foi salvo." -ForegroundColor Red
  exit 1
}

# Mantém só os mais recentes.
Get-ChildItem $Pasta -Filter 'shalom-*.sql' | Sort-Object LastWriteTime -Descending | Select-Object -Skip $Guardar | Remove-Item -Force
Write-Host "Backup salvo em $final"
