-- Historial de conversaciones del agente.

CREATE TABLE IF NOT EXISTS conversaciones (
    id BIGSERIAL PRIMARY KEY,
    iniciada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
    id BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('usuario', 'agente')),
    contenido TEXT NOT NULL CHECK (length(trim(contenido)) > 0),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion
    ON mensajes (conversacion_id, creado_en);
