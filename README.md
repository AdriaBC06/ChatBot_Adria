# Chatbot Adrià ☝️🤓

Chatbot local sencillo hecho con **Flask (Python)** y **HTML/JS**.  
Guarda conversaciones en JSON, soporta varios chats, funciona en red local y usa Markdown con resaltado de código.

## ¿Qué hace?
- Backend con Flask (`server.py`)
- Frontend estático (`index.html`, `scripts.js`, `styles.css`)
- Chats persistentes en `chats/*.json`
- Funciona desde cualquier dispositivo en la red Wi-Fi local
- Markdown + highlight.js para formatear respuestas del bot

## Requisitos
- Python 3.10+
- Dependencias de `requirements.txt`

## Instalación
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuración
- En la raíz del proyecto crea tu archivo `.env`:
```env
API_KEY=tu_api_key
```
- Si no existe, crea la carpeta de chats en la raíz del proyecto:
Linux:
```bash
mkdir -p chats
```

## Ejecutar el proyecto
Linux:
```bash
chmod +x start.sh
./start.sh
```
Esto abrirá el puerto `5000` para el backend Flask y el puerto `5500` para el frontend HTML.
Desde cualquier dispositivo de la red local abre: `http://<ip-del-sevidor>:5500
