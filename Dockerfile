# Site do Sítio Shalom (Next.js). Imagem pequena: só o que roda em produção.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Endereço público do site: entra no HTML na montagem (páginas em cache = site rápido). Em produção vem do compose.
ARG SITE_URL=
ENV SITE_URL=$SITE_URL
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Imagens da marca (logo, brasão): o Next não as inclui sozinho na imagem enxuta
COPY --from=build /app/public ./public
# O Next guarda aqui as fotos já otimizadas; o usuário "node" precisa poder gravar
RUN mkdir -p .next/cache && chown -R node:node .next/cache
# Script que cria o administrador (usa o mesmo código de senha do site)
COPY scripts/criar-admin.mjs ./scripts/criar-admin.mjs
COPY lib/senha.mjs ./lib/senha.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/saude >/dev/null || exit 1
CMD ["node", "server.js"]
