#!/usr/bin/env bash

set -e

echo "🚀 Iniciando backend..."

(
    cd ../src/server
    node index.js
) &

echo "🚀 Iniciando frontend..."

npm run dev

wait