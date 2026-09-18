# Backend de Tapizados Express

API en FastAPI para consultar servicios y guardar consultas comerciales en PostgreSQL.

## Instalación

Desde la carpeta `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Copiar `.env.example` como `.env` y reemplazar `CAMBIAR_CONTRASENA` por la contraseña del usuario `postgres`. No subir `.env` a GitHub.

## Ejecutar

```powershell
uvicorn main:app --reload
```

La documentación interactiva queda disponible en `http://127.0.0.1:8000/docs`.
