# 🚀 Inicio Rápido - Sahara Essence

## ⚡ Pasos para Poner en Marcha

### 1. Instalar Dependencias (si no lo has hecho)
```bash
npm install
```

### 2. Migrar Datos a Supabase
```bash
npm run migrate
```

Este comando:
- Lee los perfumes de [`public/perfumes.json`](public/perfumes.json:1)
- Los inserta en tu base de datos Supabase
- Muestra el progreso en tiempo real

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

### 4. Abrir en el Navegador
```
http://localhost:3000
```

---

## ✅ Verificación Rápida

### Checklist de Funcionalidades:

- [ ] **Catálogo carga perfumes** - Ve a `/catalog`
- [ ] **Ordenamiento funciona** - Prueba el selector "Ordenar por"
- [ ] **Filtros funcionan** - Filtra por marca, género, familia
- [ ] **Detalle de perfume** - Click en cualquier perfume
- [ ] **Agregar al carrito** - Click en "Agregar al Carrito"
- [ ] **Ver carrito** - Click en el botón flotante 🛒
- [ ] **WhatsApp funciona** - Click en "Enviar Pedido por WhatsApp"
- [ ] **Chat Aurora funciona** - Click en el botón de chat 💬
- [ ] **Aurora recomienda perfumes** - Escribe "busco algo para la oficina"

---

## 🔧 Configuración de Supabase (Si aún no lo has hecho)

### Crear la Tabla en Supabase:

1. Ve a tu proyecto: https://kwtkwtvnskytohiyixmw.supabase.co
2. SQL Editor → New Query
3. Pega este código:

```sql
-- Crear tabla de perfumes
CREATE TABLE perfumes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  gender TEXT NOT NULL,
  family TEXT NOT NULL,
  notes JSONB NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  story TEXT,
  concentration TEXT,
  longevity TEXT,
  sillage TEXT,
  season TEXT[],
  occasion TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_perfumes_brand ON perfumes(brand);
CREATE INDEX idx_perfumes_gender ON perfumes(gender);
CREATE INDEX idx_perfumes_family ON perfumes(family);
CREATE INDEX idx_perfumes_price ON perfumes(price);

-- Habilitar RLS (Row Level Security)
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Allow public read access"
ON perfumes FOR SELECT
TO public
USING (true);
```

4. Click en "Run"
5. Ejecuta `npm run migrate` para insertar los datos

---

## 📱 Configuración de WhatsApp

El número está configurado en [`.env.local`](.env.local:1):
```
NEXT_PUBLIC_WHATSAPP_NUMBER=573216974038
```

Para cambiar el número, edita esta variable (formato: código de país + número sin espacios ni +).

---

## 🤖 Configuración del Chatbot Aurora

La API key de Gemini ya está configurada en [`.env.local`](.env.local:1).

**Personalidad de Aurora:**
- Definida en [`rol_personalidad.md`](rol_personalidad.md:1)
- Implementada en [`app/api/chat/route.ts`](app/api/chat/route.ts:1)
- Recomienda perfumes reales de tu base de datos
- Extrae contexto automáticamente (oficina, noche, deporte, etc.)

---

## 🎯 Características Principales

### 1. Catálogo Inteligente
- Carga desde Supabase con fallback a JSON
- Ordenamiento por nombre, precio, marca
- Filtros múltiples
- Búsqueda en tiempo real
- Paginación

### 2. Chatbot Aurora
- Personalidad única y cálida
- Recomendaciones basadas en contexto
- Consulta perfumes reales del inventario
- Respuestas con precios y descripciones

### 3. Carrito de Compras
- Persistencia en localStorage
- Agregar/eliminar productos
- Ajustar cantidades
- Envío directo a WhatsApp
- Mensaje pre-formateado

---

## 🐛 Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "GEMINI_API_KEY no está configurado"
Verifica que [`.env.local`](.env.local:1) exista y tenga la API key.

### Los perfumes no cargan
1. Verifica que Supabase esté configurado
2. Ejecuta `npm run migrate`
3. Si falla, el sistema usará `perfumes.json` automáticamente

### El chat no responde
1. Verifica la API key de Gemini en [`.env.local`](.env.local:1)
2. Revisa la consola del navegador para errores
3. Verifica que tengas conexión a internet

---

## 📞 Soporte

Si tienes problemas:
1. Revisa [`IMPLEMENTACION.md`](IMPLEMENTACION.md:1) para detalles técnicos
2. Verifica la consola del navegador (F12)
3. Revisa los logs del servidor en la terminal

---

## 🎉 ¡Listo!

Tu sitio web Sahara Essence está completamente funcional con:
- ✅ Base de datos Supabase
- ✅ Chatbot Aurora inteligente
- ✅ Carrito con WhatsApp
- ✅ Ordenamiento consistente

**Siguiente paso:** Ejecuta `npm run migrate` y luego `npm run dev`