-- Esquema inicial de datos para Tapizados Express.
-- Los servicios y precios son ficticios y sirven para el prototipo.

CREATE TABLE IF NOT EXISTS servicios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio_pequeno NUMERIC(12, 2) NOT NULL CHECK (precio_pequeno >= 0),
    precio_mediano NUMERIC(12, 2) NOT NULL CHECK (precio_mediano >= 0),
    precio_grande NUMERIC(12, 2) NOT NULL CHECK (precio_grande >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL CHECK (nombre ~ '^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$'),
    localidad VARCHAR(120) NOT NULL CHECK (localidad ~ '^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$'),
    telefono VARCHAR(10) NOT NULL CHECK (telefono ~ '^[0-9]{8,10}$'),
    servicio_id BIGINT NOT NULL REFERENCES servicios(id),
    tamano VARCHAR(10) NOT NULL CHECK (tamano IN ('Pequeño', 'Mediano', 'Grande')),
    presupuesto_estimado NUMERIC(12, 2) NOT NULL CHECK (presupuesto_estimado >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Contactado', 'Confirmado', 'Cerrado')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultas_estado ON consultas (estado);
CREATE INDEX IF NOT EXISTS idx_consultas_creado_en ON consultas (creado_en);

INSERT INTO servicios (nombre, precio_pequeno, precio_mediano, precio_grande)
VALUES
    ('Sofá o sillón', 35000, 45000, 60000),
    ('Sillas', 8000, 10000, 12000),
    ('Colchón', 22000, 28000, 35000),
    ('Alfombra de auto', 18000, 25000, 32000),
    ('Alfombra de casa', 15000, 25000, 40000)
ON CONFLICT (nombre) DO NOTHING;

-- Consulta de prueba:
SELECT c.id, c.nombre, s.nombre AS servicio, c.tamano,
        c.presupuesto_estimado, c.estado, c.creado_en
FROM consultas c
JOIN servicios s ON s.id = c.servicio_id
ORDER BY c.creado_en DESC;

SELECT *
FROM servicios
ORDER BY id;

SELECT
    c.id,
    c.nombre,
    c.localidad,
    c.telefono,
    s.nombre AS servicio,
    c.tamano,
    c.presupuesto_estimado,
    c.estado,
    c.creado_en
FROM consultas c
JOIN servicios s ON s.id = c.servicio_id
ORDER BY c.creado_en DESC;

SELECT
    c.id,
    c.nombre,
    c.localidad,
    c.telefono,
    s.nombre AS servicio,
    c.tamano,
    c.presupuesto_estimado,
    c.estado,
    c.creado_en
FROM consultas c
JOIN servicios s ON s.id = c.servicio_id
ORDER BY c.creado_en DESC;
