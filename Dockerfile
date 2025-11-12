FROM node:18-alpine

# Metadados
LABEL maintainer="PirajaNet"
LABEL description="API REST Firebird para n8n"

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    wget \
    curl

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências do Node
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código da aplicação
COPY server.js .

# Criar diretório de logs
RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app

# Usar usuário não-root
USER node

# Expor porta
EXPOSE 3050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3050/api/health || exit 1

# Comando para iniciar
CMD ["node", "server.js"]
