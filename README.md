# 🔥 Firebird API for n8n

API REST para integrar bancos de dados Firebird com n8n através do Docker.

## 🚀 Opções de Deploy

Este repositório oferece duas configurações:

### Opção 1: API + Firebird (Stack Completa) 🎯 RECOMENDADO

**Use quando:** Você ainda não tem Firebird instalado

**Arquivo:** `docker-compose.full.yml`

**O que inclui:**
- ✅ Servidor Firebird 3.0
- ✅ API REST
- ✅ Banco de dados criado automaticamente
- ✅ Usuários personalizados (opcional)

**Deploy no Portainer:**
1. Stacks → Add Stack
2. Nome: `firebird-completo`
3. Build method: Repository
4. Repository URL: `https://github.com/seu-usuario/firebird-api-n8n`
5. Compose path: `docker-compose.full.yml`
6. Environment variables:
```
   FIREBIRD_PASSWORD=SuaSenhaSegura123
   FIREBIRD_DATABASE=pirajanet.fdb
   CUSTOM_USER=PIRAJANET
   CUSTOM_PASSWORD=senhaForte456
   API_USER=PIRAJANET
   API_PASSWORD=senhaForte456
```
7. Deploy!

**Portas expostas:**
- `3050` - Firebird Server
- `3051` - API REST

---

### Opção 2: Apenas API (Firebird Externo)

**Use quando:** Você já tem Firebird rodando em outro servidor

**Arquivo:** `docker-compose.yml`

**O que inclui:**
- ✅ API REST apenas

**Deploy no Portainer:**
1. Stacks → Add Stack
2. Nome: `firebird-api`
3. Build method: Repository
4. Repository URL: `https://github.com/seu-usuario/firebird-api-n8n`
5. Compose path: `docker-compose.yml`
6. Environment variables:
```
   DB_HOST=192.168.1.100
   DB_PORT=3050
   DB_PATH=/caminho/para/banco.fdb
   DB_USER=SYSDBA
   DB_PASSWORD=senha-do-firebird
   API_PORT=3050
```
7. Deploy!

**Porta exposta:**
- `3050` - API REST

---

## 🔧 Configuração de Usuários Personalizados

O arquivo `init-firebird.sh` cria automaticamente usuários personalizados ao iniciar o Firebird.

**Usuários criados:**
- `SYSDBA` - Administrador master (obrigatório)
- `PIRAJANET` - Usuário admin da aplicação
- `READONLY` - Usuário somente leitura

Para personalizar, edite as variáveis de ambiente:
```env
CUSTOM_USER=SEU_USUARIO
CUSTOM_PASSWORD=sua_senha
```

---

## 📡 Endpoints da API

### GET `/api/health`
Health check da API

### GET `/api/info`
Informações sobre a API e endpoints disponíveis

### GET `/api/test-connection`
Testa conexão com o Firebird

### POST `/api/query`
Executa queries SELECT
```json
{
  "sql": "SELECT * FROM TABELA",
  "params": []
}
```

### POST `/api/execute`
Executa INSERT, UPDATE, DELETE
```json
{
  "sql": "INSERT INTO TABELA (CAMPO) VALUES (?)",
  "params": ["valor"]
}
```

---

## 🧪 Testando a Instalação

### Teste 1: API está rodando?
```bash
curl http://localhost:3051/api/health
```

### Teste 2: Conexão com Firebird?
```bash
curl http://localhost:3051/api/test-connection
```

### Teste 3: Query de teste
```bash
curl -X POST http://localhost:3051/api/query \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM RDB$DATABASE"}'
```

---

## 🔌 Acessando o Firebird Diretamente

Com a stack completa, você pode acessar o banco diretamente:
```bash
# Via docker exec
docker exec -it firebird-server /usr/local/firebird/bin/isql \
  -user SYSDBA \
  -password SuaSenhaSegura123 \
  localhost:/firebird/data/pirajanet.fdb

# Ou via cliente externo (FlameRobin, DBeaver, etc)
Host: localhost
Port: 3050
Database: /firebird/data/pirajanet.fdb
User: SYSDBA
Password: SuaSenhaSegura123
```

---

## 🗂️ Estrutura de Arquivos
```
firebird-api-n8n/
├── .gitignore
├── .env.example
├── README.md
├── Dockerfile
├── package.json
├── server.js
├── docker-compose.yml          # API sozinha
├── docker-compose.full.yml     # Firebird + API
└── init-firebird.sh            # Init script
```

---

## 🔐 Segurança

- ✅ Use senhas fortes em produção
- ✅ Não commite o arquivo `.env` (já está no .gitignore)
- ✅ Considere adicionar autenticação na API
- ✅ Configure firewall para restringir acesso
- ✅ Use usuários específicos ao invés de SYSDBA em produção

---

## 🐛 Troubleshooting

**Container Firebird não inicia:**
```bash
docker logs firebird-server
```

**API não conecta no Firebird:**
1. Verifique se Firebird está rodando: `docker ps | grep firebird`
2. Teste conectividade: `docker exec firebird-server ps aux | grep firebird`
3. Verifique logs da API: `docker logs firebird-api`

**Porta já em uso:**
- Altere a porta no docker-compose: `"3052:3050"`

---

## 📊 Monitoramento

Via Portainer:
- Visualize logs em tempo real
- Monitore uso de CPU/RAM
- Restart com 1 clique
- Acesse console dos containers

---

## 🤝 Contribuindo

Pull requests são bem-vindos!

## 📝 Licença

MIT

## 👨‍💻 Autor

**PirajaNet**
