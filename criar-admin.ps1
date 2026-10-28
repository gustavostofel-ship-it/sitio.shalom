# Cria (ou troca a senha de) um administrador do painel. Use pelo arquivo criar-admin.bat (duplo clique).
param([string]$Email, [string]$Senha)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Parar($msg) { Write-Host ""; Write-Host $msg -ForegroundColor Red; if (-not $script:Direto) { Read-Host "Aperte Enter para fechar" | Out-Null }; exit 1 }
$script:Direto = [bool]$Senha

docker info *> $null
if ($LASTEXITCODE -ne 0) { Parar "O Docker não está ligado. Abra o Docker Desktop, espere ele ficar pronto e tente de novo." }
$rodando = docker compose ps --status running --services 2>$null
if ($rodando -notcontains 'app') { Parar "O site não está ligado. Abra um terminal nesta pasta, rode  docker compose up -d  e tente de novo." }

Write-Host "=== Criar administrador do painel ===" -ForegroundColor Green
if (-not $Email) { $Email = Read-Host "E-mail" }
if (-not $Senha) {
  $s1 = Read-Host "Senha (mínimo 10 caracteres)" -AsSecureString
  $s2 = Read-Host "Repita a senha" -AsSecureString
  $p1 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s1))
  $p2 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s2))
  if ($p1 -ne $p2) { Parar "As senhas não são iguais. Tente de novo." }
  $Senha = $p1
}
if ($Senha.Length -lt 10) { Parar "A senha precisa ter pelo menos 10 caracteres." }

# Os dados vão em base64: assim aspas, espaços e acentos na senha não quebram nada.
$json = @{ email = $Email; senha = $Senha } | ConvertTo-Json -Compress
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
docker compose exec -e "ADMIN_B64=$b64" app node scripts/criar-admin.mjs
if ($LASTEXITCODE -ne 0) { Parar "Não foi possível criar o administrador." }

Write-Host ""
Write-Host "Pronto! Abra http://localhost:3200/painel e entre com esse e-mail e senha." -ForegroundColor Green
if (-not $script:Direto) { Read-Host "Aperte Enter para fechar" | Out-Null }
