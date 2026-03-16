#!/bin/sh
set -e

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting Vite dev server..."
exec npx vite --host 0.0.0.0 --port 5173
