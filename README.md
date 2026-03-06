# 🏜️ Sahara Essence

> **Sahara Essence** es una plataforma moderna y dinámica de comercio electrónico especializada en la curaduría y recomendación de perfumes de alta gama. Combina una interfaz premium y altamente interactiva con inteligencia artificial avanzada para ofrecer experiencias de compra precisas y personalizadas.

## 🚀 Características Principales

* **Catálogo Dinámico e Interactivo:** Carga eficiente de datos del inventario y filtros versátiles (por marca, género, familia olfativa, precio, etc.).
* **Chatbot Inteligente con RAG:** Asistente conversacional impulsado por IA que utiliza Supabase y `pgvector` para entender preferencias semánticas (ocasión, familia, temporada) y recomendar perfumes precisos evitando alucinaciones (RAG estructurado).
* **Pipeline de Imágenes Automatizado (MCP):** Herramienta integrada para descarga, sanitización de nombres (según género y reglas estrictas) y estandarización visual (archivos en alta calidad `.webp` sin fondos).
* **Interfaz Premium:** Animaciones fluidas construidas con **Framer Motion** y **GSAP**, junto con componentes accesibles basados en **Radix UI** y estilos limpios mediante **Tailwind CSS**.
* **Gestión de Stock Distribuida:** Scripts dedicados integrados para sincronizar precios y stock (ej. desde Google Sheets o fuentes externas) de forma periódica (`sync-prices`).

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnologías |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18 |
| **Estilos & UI** | Tailwind CSS, Radix UI, Lucide React, `next-themes` |
| **Animaciones** | Framer Motion, GSAP |
| **Base de Datos & Backend** | Supabase (PostgreSQL), `pgvector` |
| **Inteligencia Artificial** | OpenAI (Embeddings, `text-embedding-3-small`), MCP SDK |
| **Lenguaje** | TypeScript |

---

## 🏗️ Arquitectura del Sistema RAG (Chatbot)

El asistente de sugerencias está desarrollado bajo un modelo *Retrieval-Augmented Generation* ideado para escalar bien con bases de datos como el catálogo de Sahara Essence (~400+ productos):

1. **Estado Conversacional:** Extrae progresivamente preferencias del usuario y actualiza un estado virtual continuo (`occasion`, `gender`, `family`).
2. **Filtro Estructurado Previo:** La consulta a Supabase se acota primero bajo los filtros exactos elegidos, optimizando el rendimiento de la búsqueda.
3. **Similaridad Semántica (Vectorial):** El contexto abstracto o textual de la consulta se convierte en un *Embedding* que se evalúa contra la capa `pgvector` en la base de datos para recuperar similitudes.
4. **Respuesta Racional:** Se recomiendan entre 2 y 3 perfumes finales, cada uno con una micro-explicación directa de porqué la opción es adecuada, guiando la mente del consumidor a la compra sin desorientar con muchas opciones.

---

## 📦 Pipeline de Curaduría Visual (Imágenes)

Sahara Essence cuenta con un flujo estricto regido por IA para importar recursos visuales correctos:
* Búsqueda automatizada que descarta estuches de regalo y fondos ruidosos.
* Mapeo estricto para almacenar con uniformidad de nomenclatura: `nombre_del_perfume_genero.webp`.
  * *Ejemplo: `la_vie_est_belle_w.webp` (femenino), `club_de_nuit_intense_m.webp` (masculino).*
* Integrado modularmente al directorio `public/perfume_images`.

---

## ⚙️ Instalación y Entorno Local

Sigue estos pasos para arrancar el entorno de desarrollo:

1. **Clona y entra al repositorio:**
   ```bash
   cd sahara_essence
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Copia el archivo de plantillas de configuración y completa tus credenciales (`SUPABASE_URL`, APIs de OpenAI, etc.):
   ```bash
   cp .env.local.example .env.local
   # Completa con tus llaves reales
   ```

4. **Ejecuta el servidor local:**
   ```bash
   npm run dev
   ```
   *La app estará escuchando en [http://localhost:3000](http://localhost:3000).*

---

## 💻 Scripts Disponibles

El proyecto incluye *NPM scripts* de utilidad dentro de `package.json`:

* `npm run dev`: Ejecuta el entorno de Next.js en servidor de desarrollo.
* `npm run build`: Genera el empaquetado optimizado para producción.
* `npm run start`: Inicia el clúster de producción tras ejecutar el comando build.
* `npm run lint`: Ejecuta inspecciones de código (ESLint + TypeScript checks).
* `npm run migrate`: Ejecuta el script `tsx scripts/migrate-perfumes.ts` para manipulaciones estructurales.
* `npm run sync-prices`: Ejecuta `tsx scripts/sync-from-sheets.ts` para coordinar el inventario hacia la BD.

---

**Sahara Essence** — *Donde la programación moderna converge con la perfumería fina.*