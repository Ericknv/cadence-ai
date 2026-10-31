# ==============================================================================
# ESTÁGIO 1: Build do Frontend (Vite)
# ==============================================================================
FROM node:22-slim AS builder

WORKDIR /app

# Copia manifestos de pacotes
COPY package*.json bun.lock* ./

# Instala todas as dependências com tolerância a peer-deps
RUN npm install --legacy-peer-deps

# Copia código-fonte
COPY . .

# Argumentos de ambiente do Supabase injetados durante o build do Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Compila os assets do frontend para a pasta dist/
RUN npm run build

# ==============================================================================
# ESTÁGIO 2: Runner de Produção (Node.js 22 Slim)
# ==============================================================================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Cria usuário não-root seguro
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 cadence

# Copia o node_modules completo com binários nativos do Linux x64
COPY --from=builder --chown=cadence:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=cadence:nodejs /app/dist ./dist
COPY --from=builder --chown=cadence:nodejs /app/package.json ./package.json
COPY --from=builder --chown=cadence:nodejs /app/server.ts ./server.ts
COPY --from=builder --chown=cadence:nodejs /app/src ./src

USER cadence

EXPOSE 3000

# Sobe o servidor Express
CMD ["npx", "tsx", "server.ts", "--host", "0.0.0.0"]
