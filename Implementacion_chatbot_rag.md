# Implementación de Chatbot RAG para E‑commerce de Perfumes

Este documento describe **paso a paso** cómo implementar un chatbot inteligente de recomendación de perfumes usando **Next.js, Supabase y RAG**, **adaptado exactamente** a la siguiente estructura real de base de datos:

```sql
CREATE TABLE public.perfumes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  brand character varying,
  gender character varying,
  family character varying,
  notes jsonb NOT NULL,
  size character varying,
  price numeric,
  image character varying,
  description text,
  story text,
  concentration character varying,
  longevity character varying,
  sillage character varying,
  season character varying,
  occasion character varying,
  CONSTRAINT perfumes_pkey PRIMARY KEY (id)
);
```

El objetivo es construir una feature **lista para producción**, sin rehacer la base de datos, sin sobre‑ingeniería y con buen rendimiento para un catálogo de ~400 perfumes.

---

## 1. Objetivo del sistema

El chatbot debe:

* Guiar al usuario con preguntas simples
* Entender preferencias (ocasión, familia, intensidad, etc.)
* Consultar Supabase de forma eficiente
* Recomendar **2 o 3 perfumes relevantes**
* Explicar brevemente por qué se recomienda cada uno

Principios clave:

* ❌ No inventar información
* ❌ No devolver demasiados productos
* ✅ Filtros estructurados primero
* ✅ Similaridad semántica después (RAG)

---

## 2. Arquitectura general

```
Next.js (Chat UI)
   ↓
API Route / Server Action (Orquestador)
   ↓
LLM
   ├─ Extracción de preferencias (JSON)
   ├─ Generación de explicación
   ↓
Supabase
   ├─ PostgreSQL (filtros estructurados)
   ├─ pgvector (similaridad semántica)
```

El LLM **no decide productos**, solo ayuda a interpretar y explicar.

---

## 3. Adaptación del esquema existente

### 3.1 Mapeo de preferencias → columnas

| Preferencia del chatbot | Columna Supabase |
| ----------------------- | ---------------- |
| Ocasión                 | `occasion`       |
| Familia olfativa        | `family`         |
| Género                  | `gender`         |
| Intensidad              | `concentration`  |
| Estación                | `season`         |
| Duración                | `longevity`      |
| Proyección              | `sillage`        |
| Precio                  | `price`          |

No es necesario convertir columnas en arrays para este volumen de datos.

---

## 4. Único cambio necesario en la base de datos

Agregar una columna para embeddings y habilitar `pgvector`.

```sql
create extension if not exists vector;

alter table perfumes
add column embedding vector(1536);
```

Este cambio:

* No rompe datos existentes
* No afecta queries actuales
* Habilita RAG

---

## 5. Generación de embeddings (proceso offline)

Los embeddings **NO se generan durante el chat**.

Se generan:

* Al crear un perfume
* Al actualizar su información textual

### 5.1 Texto recomendado para embeddings

```txt
{name}.
Marca: {brand}.
Familia olfativa: {family}.
Notas: {notes}.
Descripción: {description}.
Historia: {story}.
Ocasión: {occasion}.
Temporada: {season}.
```

Este texto combina perfil técnico + contexto emocional.

---

### 5.2 Ejemplo de generación (Node.js / Next.js)

```ts
const textForEmbedding = `
${perfume.name}.
Marca: ${perfume.brand}.
Familia olfativa: ${perfume.family}.
Notas: ${JSON.stringify(perfume.notes)}.
Descripción: ${perfume.description}.
Historia: ${perfume.story}.
Ocasión: ${perfume.occasion}.
Temporada: ${perfume.season}.
`;

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: textForEmbedding
});

await supabase
  .from("perfumes")
  .update({ embedding: embedding.data[0].embedding })
  .eq("id", perfume.id);
```

---

## 6. Función SQL para búsqueda semántica

```sql
create or replace function match_perfumes(
  query_embedding vector(1536),
  match_count int
)
returns table (
  id bigint,
  name varchar,
  brand varchar,
  description text,
  image varchar,
  similarity float
)
language sql
as $$
  select
    id,
    name,
    brand,
    description,
    image,
    1 - (embedding <=> query_embedding) as similarity
  from perfumes
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

---

## 7. Estado conversacional

El chatbot mantiene un estado acumulativo.

```json
{
  "occasion": null,
  "family": null,
  "gender": null,
  "concentration": null,
  "season": null,
  "price_max": null
}
```

Este estado se actualiza con cada mensaje del usuario.

---

## 8. Extracción de preferencias con LLM

### Prompt recomendado

```txt
Eres un sistema que extrae preferencias para recomendar perfumes.
Devuelve SOLO JSON válido.
Si un campo no está presente, usa null.

Campos:
- occasion
- family
- gender
- concentration
- season
```

Ejemplo de salida:

```json
{
  "occasion": "oficina",
  "family": "amaderado",
  "gender": null,
  "concentration": "media",
  "season": null
}
```

---

## 9. Generación de la query semántica

La query semántica debe ser **controlada**, no libre.

```txt
Perfume de familia ${family},
ideal para ${occasion},
con concentración ${concentration},
apropiado para ${season || "uso general"}.
```

Ejemplo:

> "Perfume de familia amaderada, ideal para oficina, con concentración moderada."

---

## 10. Filtro estructurado en Supabase

Antes del RAG se reduce el universo.

```ts
let query = supabase
  .from("perfumes")
  .select("*");

if (state.occasion)
  query = query.eq("occasion", state.occasion);

if (state.family)
  query = query.eq("family", state.family);

if (state.gender)
  query = query.eq("gender", state.gender);

if (state.season)
  query = query.eq("season", state.season);

if (state.concentration)
  query = query.eq("concentration", state.concentration);

query = query.limit(20);
```

---

## 11. Similaridad semántica (RAG)

### 11.1 Embedding de la query

```ts
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: semanticQuery
});
```

### 11.2 Llamada a la función SQL

```ts
const { data } = await supabase.rpc("match_perfumes", {
  query_embedding: embedding.data[0].embedding,
  match_count: 5
});
```

---

## 12. Ranking final

Con ~400 perfumes, un ranking simple es suficiente.

```ts
const ranked = data
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 3);
```

Resultado: **2 o 3 perfumes finales**.

---

## 13. Generación de explicación (anti‑alucinaciones)

### Prompt

```txt
Explica en una frase por qué este perfume es adecuado.
Usa SOLO los datos proporcionados.
No inventes notas ni sensaciones.
```

Ejemplo:

> "Fragancia de familia amaderada, adecuada para oficina por su perfil equilibrado y versátil."

---

## 14. Respuesta al frontend

```json
{
  "recommendations": [
    {
      "id": 12,
      "name": "Bleu de Chanel",
      "brand": "Chanel",
      "image": "url",
      "reason": "Fragancia amaderada fresca, ideal para oficina."
    }
  ]
}
```

---

## 15. Buenas prácticas clave

* Limitar recomendaciones a 2–3
* No inventar información
* Filtros primero, RAG después
* Embeddings pre‑generados
* Respuestas breves y claras

---

## 16. Conclusión

Este diseño:

* Aprovecha tu esquema actual
* Requiere solo una columna adicional
* Escala bien para catálogos medianos
* Ofrece una experiencia de compra clara y confiable

Está listo para implementarse en producción con Next.js + Supabase.
