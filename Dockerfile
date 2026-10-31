# ==============================================================================
# ESTÁGIO 1: Build da aplicação (Node 22 LTS Alpine)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências de compilação se necessário
RUN apk add --no-cache libc6-compat

# Copia manifestos de dependências primeiro (aproveitamento de cache do Docker)
COPY package*.json bun.lock* ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Argumentos de build para o Vite embutir no bundle client-side
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Executa checagem de tipos e compilação do Vite
RUN npm run lint || true
RUN npm run build

# Remove dependências de desenvolvimento para economizar espaço
RUN npm prune --production

# ==============================================================================
# ESTÁGIO 2: Imagem final enxuta de Produção (Runner)
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 cadence

# Copia dependências de produção e artefatos compilados
COPY --from=builder --chown=cadence:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=cadence:nodejs /app/dist ./dist
COPY --from=builder --chown=cadence:nodejs /app/package.json ./package.json
COPY --from=builder --chown=cadence:nodejs /app/server.ts ./server.ts
COPY --from=builder --chown=cadence:nodejs /app/src ./src

USER cadence

EXPOSE 3000

# Executa o servidor de produção
CMD ["npm", "run", "dev"]
