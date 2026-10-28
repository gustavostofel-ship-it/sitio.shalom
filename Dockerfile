# Site do Sítio Shalom (Next.js). Imagem pequena: só o que roda em produção.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Script que cria o administrador (usa o mesmo código de senha do site)
COPY scripts/criar-admin.mjs ./scripts/criar-admin.mjs
COPY lib/senha.mjs ./lib/senha.mjs
USER node
EXPOSE 3000
CMD ["node", "server.js"]
