# Tapizados Express

Sitio web profesional para un servicio de limpieza de tapizados a domicilio.

## Objetivo

Presentar los servicios, mostrar trabajos realizados y permitir que potenciales clientes soliciten un presupuesto desde cualquier dispositivo.

## Stack inicial

- React + Vite
- CSS responsive sin framework para controlar el diseño visual
- Lucide React para iconos
- Backend en Python con FastAPI
- PostgreSQL para servicios, consultas y conversaciones
- Deploy previsto: Vercel

## Funcionalidades del MVP

- Landing page responsive
- Sección de servicios
- Galería de trabajos antes/después
- Zonas de cobertura
- Formulario de presupuesto
- Botón de contacto directo por WhatsApp
- Asistente conversacional con presupuestos estimados
- Validación de datos y registro de consultas en entorno local
- SEO básico mediante título y descripción HTML

## Modo demo público

La versión publicada funciona en modo demostración. El asistente se puede probar, pero no envía ni guarda datos reales de los visitantes. Esto permite mostrar la experiencia sin exponer una base de datos ni recopilar información personal.

El proyecto incluye el backend, el esquema SQL y la persistencia con PostgreSQL para ejecutarlos localmente.

## Base de datos y backend

- `database/schema.sql`: servicios y consultas comerciales.
- `database/02_conversaciones.sql`: conversaciones y mensajes.
- `backend/main.py`: API FastAPI.
- `backend/README.md`: instrucciones para ejecutar la API.

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Próximos pasos

1. Conectar el formulario con Supabase.
2. Agregar almacenamiento de imágenes para la galería.
3. Crear un panel privado para consultar presupuestos.
4. Añadir validación, protección anti-spam y notificaciones por correo.
