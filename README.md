# 🔥 Firebird API for n8n

API REST para integrar bancos de dados Firebird com n8n através do Docker.

## 🚀 Features

- ✅ Health check endpoint
- ✅ Teste de conexão com Firebird
- ✅ Execução de queries SELECT
- ✅ Execução de comandos INSERT/UPDATE/DELETE
- ✅ Logs estruturados
- ✅ Docker ready
- ✅ Portainer compatible

## 📋 Pré-requisitos

- Docker & Docker Compose
- Acesso a um servidor Firebird
- Portainer (opcional, para deploy visual)

## 🔧 Instalação

### Via Docker Compose

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/firebird-api-n8n.git
cd firebird-api-n8n
```

2. Copie o arquivo de exemplo e configure:
```bash
cp .env.example .env
nano .env
```

3. Configure as variáveis:
```env
DB_HOST=seu-servidor.com
DB_PORT=3050
DB_PATH=/caminho/para/banco.fdb
DB_USER=SYSDBA
DB_PASSWORD=sua-senha
API_PORT=3050
```

4. Inicie o container:
```bash
docker-compose up -d
```

5. Verifique os logs:
```bash
docker-compose logs -f
```

### Via Portainer

1. **Stacks** → **Add Stack**
2. **Nome:** `firebird-api`
3. **Build method:** Repository
4. **Repository URL:** `https://github.com/seu-usuario/firebird-api-n8n`
5. **Reference:** `main`
6. **Compose path:** `docker-compose.yml`
7. **Environment variables:** Configure as variáveis do `.env`
8. **Deploy the stack**

## 📡 Endpoints

### GET `/api/health`
Health check da API
```bash
curl http://localhost:3050/api/health
```

### GET `/api/info`
Informações sobre a API
```bash
curl http://localhost:3050/api/info
```

### GET `/api/test-connection`
Testa conexão com o Firebird
```bash
curl http://localhost:3050/api/test-connection
```

### POST `/api/query`
Executa queries SELECT
```bash
curl -X POST http://localhost:3050/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT FIRST 10 * FROM CLIENTES",
    "params": []
  }'
```

### POST `/api/execute`
Executa INSERT, UPDATE, DELETE
```bash
curl -X POST http://localhost:3050/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE CLIENTES SET STATUS = ? WHERE ID = ?",
    "params": ["ATIVO", 123]
  }'
```

## 🔌 Integração com n8n

No n8n, use o node **HTTP Request**:

**Para SELECT:**
- Method: POST
- URL: `http://firebird-api:3050/api/query`
- Body: JSON
```json
{
  "sql": "SELECT * FROM TABELA WHERE CAMPO = ?",
  "params": ["valor"]
}
```

**Para INSERT/UPDATE/DELETE:**
- Method: POST
- URL: `http://firebird-api:3050/api/execute`
- Body: JSON
```json
{
  "sql": "INSERT INTO TABELA (CAMPO1, CAMPO2) VALUES (?, ?)",
  "params": ["valor1", "valor2"]
}
```

## 🛡️ Segurança

- A API separa queries SELECT de comandos de escrita
- Use variáveis de ambiente para credenciais
- Considere adicionar autenticação para produção
- Configure firewall para restringir acesso

## 📊 Monitoramento

Verifique logs:
```bash
docker logs firebird-api -f
```

Verifique métricas no Portainer:
- CPU usage
- Memory usage
- Network I/O

## 🔄 Atualização
```bash
cd firebird-api-n8n
git pull
docker-compose down
docker-compose up -d --build
```

## 🐛 Troubleshooting

**Erro: "command not found"**
- Instale Node.js no passo 2

**Erro: "permission denied"**
- Use `sudo` antes dos comandos

**API não conecta ao Firebird**
- Verifique credenciais no `.env`
- Teste conectividade: `telnet host 3050`
- Verifique firewall

**Container não inicia**
- Verifique logs: `docker logs firebird-api`
- Valide variáveis de ambiente

## 📝 Licença

MIT

## 👨‍💻 Autor

**PirajaNet**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## 🤝 Contribuindo

Pull requests são bem-vindos!
