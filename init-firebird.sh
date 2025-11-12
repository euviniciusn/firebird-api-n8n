#!/bin/bash
set -e

# ==============================================================================
# Script de Inicialização do Firebird
# ==============================================================================
# Este script é executado automaticamente quando o container Firebird inicia
# pela primeira vez. Ele cria usuários personalizados para a aplicação.
# ==============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Iniciando configuração do Firebird..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Aguardar o Firebird estar completamente inicializado
echo "⏳ Aguardando Firebird inicializar completamente..."
sleep 15

# Verificar se o Firebird está rodando
if ! pgrep -x "firebird" > /dev/null; then
    echo "❌ ERRO: Firebird não está rodando!"
    exit 1
fi

echo "✅ Firebird está rodando!"

# ==============================================================================
# Configurações de Usuários
# ==============================================================================

# Senha do SYSDBA (obrigatória para criar outros usuários)
SYSDBA_PASSWORD="${ISC_PASSWORD:-masterkey}"

# Usuário personalizado para a aplicação (admin)
CUSTOM_USER="${CUSTOM_USER:-VECTA}"
CUSTOM_PASSWORD="${CUSTOM_PASSWORD:-vecta123}"

# Usuário somente leitura (opcional)
READONLY_USER="${READONLY_USER:-READONLY}"
READONLY_PASSWORD="${READONLY_PASSWORD:-readonly123}"

# Path do gsec (Firebird Security Manager)
GSEC="/usr/local/firebird/bin/gsec"

# ==============================================================================
# Função para criar usuário
# ==============================================================================
create_user() {
    local username=$1
    local password=$2
    local is_admin=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "👤 Criando usuário: $username"
    
    # Verificar se usuário já existe
    if $GSEC -user SYSDBA -password "$SYSDBA_PASSWORD" -display "$username" 2>/dev/null | grep -q "$username"; then
        echo "⚠️  Usuário $username já existe. Pulando..."
        return 0
    fi
    
    # Criar usuário
    if [ "$is_admin" = "true" ]; then
        $GSEC -user SYSDBA -password "$SYSDBA_PASSWORD" \
            -add "$username" \
            -pw "$password" \
            -admin yes
        echo "✅ Usuário $username criado com permissões de ADMIN"
    else
        $GSEC -user SYSDBA -password "$SYSDBA_PASSWORD" \
            -add "$username" \
            -pw "$password"
        echo "✅ Usuário $username criado (usuário padrão)"
    fi
}

# ==============================================================================
# Criar Usuários
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Criando usuários personalizados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Criar usuário admin da aplicação
create_user "$CUSTOM_USER" "$CUSTOM_PASSWORD" "true"

# Criar usuário somente leitura
create_user "$READONLY_USER" "$READONLY_PASSWORD" "false"

# ==============================================================================
# Listar Usuários Criados
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Usuários disponíveis no Firebird:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$GSEC -user SYSDBA -password "$SYSDBA_PASSWORD" -display | grep -E "^\s+user name:|admin:" || true

# ==============================================================================
# Configurações Adicionais (Opcional)
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Aplicando configurações adicionais..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Aqui você pode adicionar outras configurações, como:
# - Criar tabelas iniciais
# - Aplicar permissões específicas
# - Executar scripts SQL de inicialização

# Exemplo: Criar tabelas iniciais (descomente se necessário)
# if [ -f "/docker-entrypoint-initdb.d/init.sql" ]; then
#     echo "📄 Executando script SQL inicial..."
#     /usr/local/firebird/bin/isql -user SYSDBA -password "$SYSDBA_PASSWORD" \
#         localhost:/firebird/data/${FIREBIRD_DATABASE:-pirajanet.fdb} \
#         -input /docker-entrypoint-initdb.d/init.sql
#     echo "✅ Script SQL executado com sucesso!"
# fi

echo "✅ Configurações adicionais aplicadas!"

# ==============================================================================
# Finalização
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Configuração do Firebird concluída com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumo:"
echo "  • Banco de dados: ${FIREBIRD_DATABASE:-pirajanet.fdb}"
echo "  • Usuário ADMIN: $CUSTOM_USER"
echo "  • Usuário READONLY: $READONLY_USER"
echo "  • Porta: 3050"
echo ""
echo "🔗 Para conectar:"
echo "  Host: firebird (dentro do Docker) ou localhost:3050 (externo)"
echo "  Database: /firebird/data/${FIREBIRD_DATABASE:-pirajanet.fdb}"
echo "  User: $CUSTOM_USER ou SYSDBA"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
