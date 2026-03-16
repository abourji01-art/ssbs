#!/bin/sh
set -e

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SSBS Backend Entrypoint
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. CHECK FOR SOURCE CODE
if [ ! -f "manage.py" ]; then
    echo " "
    echo "🛑 SSBS Backend: 'manage.py' not found in /app"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   Container started in IDLE MODE to allow scaffolding."
    echo " "
    echo "   TO INITIALIZE THE DJANGO PROJECT:"
    echo "   Run: make scaffold-project"
    echo " "
    echo "   TO CREATE A NEW APP:"
    echo "   Run: make scaffold-app NAME=myapp"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Keep container alive for 'exec' commands
    sleep infinity
fi

# 2. WAIT FOR DATABASE
echo "🔌 Waiting for Database..."
until python -c "import socket; s = socket.socket(); s.connect(('db', 5432))" 2>/dev/null; do
    echo "   ... DB not ready. Sleeping 2s."
    sleep 2
done
echo "✅ Database is up."

# 3. APPLY MIGRATIONS
echo "📦 Applying migrations..."
python manage.py migrate --noinput

# 4. ENSURE LOG DIRECTORY EXISTS (volume may be empty on first start)
mkdir -p /var/log/ssbs

# 5. START SERVER
echo "🚀 Starting Django Server..."
exec python manage.py runserver 0.0.0.0:8000
