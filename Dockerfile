# ==============================================================================
# ESTÁGIO 1: Build da aplicação (Node 22 LTS Alpine)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json bun.lock* ./

# Instala dependências sem exigir o package-lock.json estrito
RUN npm install

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Mantém apenas as dependências de produção para o runner
RUN npm prune --omit=dev

# ==============================================================================
# ESTÁGIO 2: Imagem final enxuta de Produção (Runner)
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 cadence

COPY --from=builder --chown=cadence:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=cadence:nodejs /app/dist ./dist
COPY --from=builder --chown=cadence:nodejs /app/package.json ./package.json
COPY --from=builder --chown=cadence:nodejs /app/server.ts ./server.ts
COPY --from=builder --chown=cadence:nodejs /app/src ./src

USER cadence

EXPOSE 3000

CMD ["npm", "run", "dev"]
