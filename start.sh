#!/bin/bash

# ir al directorio del proyecto
cd "$(dirname "$0")"

# activar entorno virtual
source venv/bin/activate

# arrancar servidor en background
echo "🚀 Arrancando servidor Python..."
python server.py &

# guardar PID por si quieres matarlo luego
SERVER_PID=$!

# esperar un momento para que arranque
sleep 1

# arrancar un mini-servidor web para servir index.html
echo "📄 Servidor web para el frontend..."
python -m http.server 5500

# al cerrar el server web, matar el backend también
kill $SERVER_PID
echo "🛑 Servidor detenido."
