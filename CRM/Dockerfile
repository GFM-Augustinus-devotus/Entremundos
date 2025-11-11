FROM node:24-alpine

# Cria diretório de trabalho
WORKDIR /app

# Copia apenas manifests primeiro p/ cache de camadas
COPY package*.json ./

# Instala dependências (sem dev)
RUN npm ci --omit=dev || npm install --omit=dev

# Copia o código
COPY chatwoot-proxy.js ./

# Expõe porta
EXPOSE 3001

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/chatwoot/contacts || exit 1

CMD ["npm", "start"]
