import os
from contextlib import closing
from decimal import Decimal
from typing import Literal

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field


load_dotenv()
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:CAMBIAR_CONTRASENA@localhost:5432/tapizados_express',
)

app = FastAPI(title='API de Tapizados Express', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)


class ConsultaCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=120, pattern=r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$')
    localidad: str = Field(min_length=2, max_length=120, pattern=r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$')
    telefono: str = Field(pattern=r'^\d{8,10}$')
    servicio_id: int = Field(gt=0)
    tamano: Literal['Pequeño', 'Mediano', 'Grande']
    presupuesto_estimado: Decimal = Field(ge=0)


class MensajeCreate(BaseModel):
    rol: Literal['usuario', 'agente']
    contenido: str = Field(min_length=1, max_length=5000)


@app.get('/health')
def health_check():
    return {'status': 'ok', 'servicio': 'Tapizados Express'}


@app.get('/servicios')
def list_services():
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT id, nombre, precio_pequeno, precio_mediano, precio_grande
                    FROM servicios
                    WHERE activo = TRUE
                    ORDER BY id;
                    '''
                )
                columns = [description.name for description in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudo consultar la base de datos.') from error


@app.post('/consultas', status_code=201)
def create_inquiry(consulta: ConsultaCreate):
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO consultas
                        (nombre, localidad, telefono, servicio_id, tamano, presupuesto_estimado)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, creado_en;
                    ''',
                    (
                        consulta.nombre.strip(),
                        consulta.localidad.strip(),
                        consulta.telefono,
                        consulta.servicio_id,
                        consulta.tamano,
                        consulta.presupuesto_estimado,
                    ),
                )
                result = cursor.fetchone()
                connection.commit()
                return {'mensaje': 'Consulta guardada correctamente.', 'id': result[0], 'creado_en': result[1]}
    except psycopg.errors.ForeignKeyViolation as error:
        raise HTTPException(status_code=400, detail='El servicio seleccionado no existe.') from error
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudo guardar la consulta.') from error


@app.get('/consultas')
def list_inquiries():
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT c.id, c.nombre, c.localidad, c.telefono,
                           s.nombre AS servicio, c.tamano,
                           c.presupuesto_estimado, c.estado, c.creado_en
                    FROM consultas c
                    JOIN servicios s ON s.id = c.servicio_id
                    ORDER BY c.creado_en DESC;
                    '''
                )
                columns = [description.name for description in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudieron consultar las consultas guardadas.') from error


@app.post('/conversaciones', status_code=201)
def create_conversation():
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO conversaciones DEFAULT VALUES RETURNING id, iniciada_en;'
                )
                result = cursor.fetchone()
                connection.commit()
                return {'id': result[0], 'iniciada_en': result[1]}
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudo crear la conversación.') from error


@app.post('/conversaciones/{conversation_id}/mensajes', status_code=201)
def create_message(conversation_id: int, mensaje: MensajeCreate):
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1 FROM conversaciones WHERE id = %s;', (conversation_id,))
                if cursor.fetchone() is None:
                    raise HTTPException(status_code=404, detail='La conversación no existe.')
                cursor.execute(
                    '''
                    INSERT INTO mensajes (conversacion_id, rol, contenido)
                    VALUES (%s, %s, %s)
                    RETURNING id, creado_en;
                    ''',
                    (conversation_id, mensaje.rol, mensaje.contenido.strip()),
                )
                result = cursor.fetchone()
                cursor.execute(
                    'UPDATE conversaciones SET ultima_actividad = CURRENT_TIMESTAMP WHERE id = %s;',
                    (conversation_id,),
                )
                connection.commit()
                return {'id': result[0], 'conversacion_id': conversation_id, 'creado_en': result[1]}
    except HTTPException:
        raise
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudo guardar el mensaje.') from error


@app.get('/conversaciones/{conversation_id}/mensajes')
def list_messages(conversation_id: int):
    try:
        with closing(psycopg.connect(DATABASE_URL)) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT id, conversacion_id, rol, contenido, creado_en
                    FROM mensajes
                    WHERE conversacion_id = %s
                    ORDER BY creado_en, id;
                    ''',
                    (conversation_id,),
                )
                columns = [description.name for description in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except psycopg.Error as error:
        raise HTTPException(status_code=500, detail='No se pudieron consultar los mensajes.') from error
