require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Firebird = require('node-firebird');

const app = express();
const PORT = process.env.API_PORT || 3050;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Configuração do Firebird
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3050,
  database: process.env.DB_PATH,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  lowercase_keys: false,
  role: null,
  pageSize: 4096
};

// Validar configuração
if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
  console.error('❌ ERRO: Configurações do banco de dados incompletas!');
  console.error('Verifique as variáveis de ambiente: DB_HOST, DB_PATH, DB_USER, DB_PASSWORD');
  process.exit(1);
}

// ========================================
// ENDPOINTS
// ========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Firebird funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Informações da API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Firebird API for n8n',
    version: '1.0.0',
    author: 'PirajaNet',
    endpoints: {
      health: 'GET /api/health',
      info: 'GET /api/info',
      testConnection: 'GET /api/test-connection',
      query: 'POST /api/query',
      execute: 'POST /api/execute'
    }
  });
});

// Teste de conexão com Firebird
app.get('/api/test-connection', (req, res) => {
  console.log('🔍 Testando conexão com Firebird...');
  
  Firebird.attach(dbConfig, (err, db) => {
    if (err) {
      console.error('❌ Erro ao conectar:', err.message);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erro ao conectar ao Firebird',
        error: err.message
      });
    }

    db.query('SELECT CURRENT_TIMESTAMP FROM RDB$DATABASE', (err, result) => {
      if (err) {
        console.error('❌ Erro ao executar query:', err.message);
        db.detach();
        return res.status(500).json({
          status: 'ERROR',
          message: 'Erro ao executar query de teste',
          error: err.message
        });
      }

      db.detach();
      console.log('✅ Conexão com Firebird estabelecida com sucesso');
      
      res.json({
        status: 'OK',
        message: 'Conexão com Firebird estabelecida com sucesso',
        serverTime: result[0].CURRENT_TIMESTAMP,
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user
        }
      });
    });
  });
});

// Endpoint para SELECT queries
app.post('/api/query', (req, res) => {
  const { sql, params } = req.body;

  if (!sql) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'SQL query é obrigatória'
    });
  }

  // Segurança: só permite SELECT
  if (!sql.trim().toUpperCase().startsWith('SELECT')) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Apenas queries SELECT são permitidas neste endpoint. Use /api/execute para outras operações.'
    });
  }

  console.log(`📊 Executando query: ${sql.substring(0, 100)}...`);

  Firebird.attach(dbConfig, (err, db) => {
    if (err) {
      console.error('❌ Erro ao conectar:', err.message);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erro ao conectar ao Firebird',
        error: err.message
      });
    }

    db.query(sql, params || [], (err, result) => {
      db.detach();

      if (err) {
        console.error('❌ Erro ao executar query:', err.message);
        return res.status(500).json({
          status: 'ERROR',
          message: 'Erro ao executar query',
          error: err.message,
          sql: sql
        });
      }

      console.log(`✅ Query executada com sucesso. ${result.length} registros retornados.`);

      res.json({
        status: 'OK',
        data: result,
        rowCount: result.length,
        executedAt: new Date().toISOString()
      });
    });
  });
});

// Endpoint para INSERT, UPDATE, DELETE, CREATE, DROP, ALTER
app.post('/api/execute', (req, res) => {
  const { sql, params } = req.body;

  if (!sql) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'SQL query é obrigatória'
    });
  }

  const sqlUpper = sql.trim().toUpperCase();
  const allowedOperations = ['INSERT', 'UPDATE', 'DELETE', 'EXECUTE', 'CREATE', 'DROP', 'ALTER'];
  
  if (!allowedOperations.some(op => sqlUpper.startsWith(op))) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Este endpoint aceita apenas INSERT, UPDATE, DELETE, CREATE, DROP, ALTER ou EXECUTE. Use /api/query para SELECT.'
    });
  }

  console.log(`⚙️ Executando comando: ${sql.substring(0, 100)}...`);

  // Verificar se é comando DDL (não precisa commit)
  const isDDL = sqlUpper.startsWith('CREATE') || 
                sqlUpper.startsWith('DROP') || 
                sqlUpper.startsWith('ALTER');

  Firebird.attach(dbConfig, (err, db) => {
    if (err) {
      console.error('❌ Erro ao conectar:', err.message);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erro ao conectar ao Firebird',
        error: err.message
      });
    }

    db.query(sql, params || [], (err, result) => {
      if (err) {
        console.error('❌ Erro ao executar comando:', err.message);
        db.detach();
        return res.status(500).json({
          status: 'ERROR',
          message: 'Erro ao executar comando',
          error: err.message,
          sql: sql
        });
      }

      // DDL não precisa de commit (é auto-commit)
      if (isDDL) {
        db.detach();
        console.log('✅ Comando DDL executado com sucesso (auto-commit)');
        
        return res.json({
          status: 'OK',
          message: 'Comando executado com sucesso',
          executedAt: new Date().toISOString()
        });
      }

      // DML precisa de commit
      db.commit((commitErr) => {
        db.detach();
        
        if (commitErr) {
          console.error('❌ Erro ao fazer commit:', commitErr.message);
          return res.status(500).json({
            status: 'ERROR',
            message: 'Erro ao fazer commit',
            error: commitErr.message
          });
        }

        console.log('✅ Comando DML executado e commitado com sucesso');

        res.json({
          status: 'OK',
          message: 'Comando executado com sucesso',
          affectedRows: result ? (result.length || 1) : 1,
          executedAt: new Date().toISOString()
        });
      });
    });
  });
});

// Tratamento de rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/test-connection',
      'POST /api/query',
      'POST /api/execute'
    ]
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Erro interno do servidor',
    error: err.message
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 API Firebird iniciada com sucesso!');
  console.log('═══════════════════════════════════════');
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🗄️  Banco: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recebido. Encerrando gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT recebido. Encerrando gracefully...');
  process.exit(0);
});
