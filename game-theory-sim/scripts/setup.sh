#!/usr/bin/env bash

set -e

echo "📦 Instalando dependências do frontend..."
npm install

echo "📦 Instalando dependências do backend..."
(
    cd ../src/server
    npm install
)

echo "🗄️ Configurando banco de dados..."
(
    cd ../src/server
    npx prisma db push
)

echo "✅ Projeto configurado com sucesso!"