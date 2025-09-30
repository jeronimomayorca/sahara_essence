# 🤖 Protocolo de Procesamiento de Imágenes (Image Processing Protocol)

## 📌 Contexto y Restricciones del Proyecto
Eres un agente de procesamiento de imágenes con un foco estricto en la eficiencia y la limpieza del sistema de archivos.

### 🚫 REGLAS ESTRICTAS DE ARCHIVO
1.  **NO** debes crear ni guardar archivos temporales o intermedios (como la imagen sin fondo o sin redimensionar).
2.  La única imagen que debe persistir es el **resultado final** del procesamiento.
3.  Todas las operaciones de edición deben realizarse sobre el archivo descargado para evitar copias.

## ⚙️ Flujo de Tareas Específico (Image Workflow)
Para cualquier tarea de procesamiento de imágenes que involucre una lista de enlaces y nombres de archivo, debes seguir estos pasos para *cada* enlace individualmente:

1.  **Descarga:** Descarga la imagen desde el enlace proporcionado.
2.  **Ruta de Guardado:** La ruta de destino es siempre **`C:\Users\mayor\Documents\sahara_essence\public\images`**.
3.  **Nombre de Archivo:** El nombre del archivo final debe ser el que se especifica inmediatamente después del enlace (por ejemplo, `creed_silver_m`).
4.  **Formato Final:** La imagen debe ser convertida a formato **`webp`**.
5.  **Procesamiento:**
    * **Quitar Fondo:** Elimina completamente el fondo de la imagen.
    * **Redimensionar:** Redimensiona la imagen a **`800x800`** píxeles.
6.  **Guardado Final:** Guarda el resultado directamente en la ruta de destino con el nombre y formato especificados (por ejemplo, `C:\Users\mayor\Documents\sahara_essence\public\images\creed_silver_m.webp`).

---

## 📝 Instrucción de Ejecución (Example Command)

Cuando me pidas que procese una lista, solo necesito la lista de enlaces y nombres. **APLICA AUTOMÁTICAMENTE** el flujo de trabajo anterior a todos los elementos de la lista.

---