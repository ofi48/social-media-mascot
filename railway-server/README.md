# Video Processing Server for Railway

Este servidor procesa videos usando FFmpeg y se despliega automáticamente en Railway.

## Características

- ✅ Procesamiento de video con FFmpeg
- ✅ Múltiples efectos: saturación, contraste, brillo, velocidad, zoom, rotación
- ✅ Soporte para archivos hasta 500MB
- ✅ Generación de múltiples variaciones
- ✅ API REST simple
- ✅ Limpieza automática de archivos temporales

## Endpoints

### POST /process-video
Procesa un video y genera variaciones con efectos aleatorios.

**Parámetros:**
- `video`: Archivo de video (multipart/form-data)
- `settings`: JSON con configuración de efectos
- `numCopies`: Número de variaciones a generar
- `requestId`: ID de la petición (opcional)

**Respuesta:**
```json
{
  "success": true,
  "results": [
    {
      "name": "variation_1_1234567890.mp4",
      "url": "/download/variation_1_1234567890.mp4",
      "processingDetails": {
        "saturation": 1.15,
        "contrast": 1.05,
        "brightness": -0.02,
        "speed": 1.02
      }
    }
  ]
}
```

### GET /download/:filename
Descarga un video procesado.

### GET /health
Verifica que el servidor esté funcionando.

## Despliegue en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente el Dockerfile
3. El servidor se desplegará automáticamente

## Variables de entorno

- `PORT`: Puerto del servidor (por defecto 3000)

## Efectos soportados

- **Calidad de video**: bitrate, framerate
- **Color**: saturación, contraste, brillo
- **Transformaciones**: velocidad, zoom, rotación, flip horizontal
- **Audio**: volumen

## Desarrollo local

```bash
cd railway-server
npm install
npm run dev
```