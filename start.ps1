# ir al directorio del proyecto
Set-Location -Path $PSScriptRoot

# activar entorno virtual
Write-Host "🔧 Activando entorno virtual..."
& "$PSScriptRoot\venv\Scripts\Activate.ps1"

# arrancar servidor backend en background
Write-Host "🚀 Arrancando servidor Python..."
$serverProcess = Start-Process "python" "server.py" -PassThru

# pequeña siesta estratégica
Start-Sleep -Seconds 1

# arrancar servidor web para el frontend
Write-Host "📄 Servidor web para el frontend (puerto 5500)..."
python -m http.server 5500

# al cerrar http.server, matar backend
Write-Host "🛑 Deteniendo backend..."
Stop-Process -Id $serverProcess.Id -Force
