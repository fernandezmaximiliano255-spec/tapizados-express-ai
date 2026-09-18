# Asistente comercial para Tapizados Express

Proyecto de portfolio orientado al análisis de datos, la automatización y la integración de un asistente conversacional para consultas comerciales.

## Objetivo

Integrar un asistente local capaz de guiar consultas sobre servicios de limpieza, estimar presupuestos según servicio y tamaño, validar datos y registrar las consultas en PostgreSQL mediante SQL.

El proyecto busca mostrar cómo un analista puede transformar una necesidad de negocio en un flujo de datos funcional, medible y documentado. La interfaz React funciona como punto de interacción, pero el foco está en la lógica de negocio, la API, el modelado y la persistencia de datos.

## Enfoque de datos

- Modelado de servicios, consultas, conversaciones y mensajes.
- PostgreSQL como base de datos relacional.
- Scripts SQL para crear tablas, restricciones, índices y datos iniciales.
- API en Python con FastAPI para validar y exponer los datos.
- Registro de consultas para analizar posteriormente las necesidades de los usuarios.

## Tecnologías

- Python y FastAPI
- PostgreSQL y SQL
- React + Vite para la interfaz de demostración
- Validación de datos con Pydantic

## Funcionalidades del MVP

- Preguntas guiadas sobre servicios y tamaños.
- Presupuestos estimativos según el servicio seleccionado.
- Consultas libres con respuestas orientativas.
- Validación de nombre, localidad y teléfono.
- Registro de consultas y conversaciones en PostgreSQL.
- Modo demo público sin guardar datos reales de visitantes.

## Ejecución local

### Interfaz

```bash
npm install
npm run dev
```

### API y base de datos

1. Crear una base PostgreSQL llamada `tapizados_express`.
2. Ejecutar `database/schema.sql`.
3. Ejecutar `database/02_conversaciones.sql`.
4. Configurar las variables de conexión en `backend/.env` a partir de `backend/.env.example`.
5. Instalar las dependencias y ejecutar:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

La documentación interactiva de la API queda disponible en `http://127.0.0.1:8000/docs`.

## Demo pública

La versión publicada permite probar la experiencia del asistente, pero funciona sin enviar ni guardar datos reales. La API, el esquema SQL y la persistencia completa se pueden ejecutar localmente.
