FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache bash wget curl

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install --production && \
    npm cache clean --force

# Copiar código
COPY server.js ./

# Criar diretório de logs
RUN mkdir -p /usr/src/app/logs

# Expor porta
EXPOSE 3050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3050/api/health || exit 1

# Comando para iniciar
CMD ["node", "server.js"]
