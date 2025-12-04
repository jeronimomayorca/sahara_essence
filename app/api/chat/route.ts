import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Perfume } from "@/lib/types";

export const runtime = "edge";

// Función para extraer contexto del mensaje del usuario
function extractContext(message: string): string[] {
  const messageLower = message.toLowerCase();
  const contexts: string[] = [];

  const contextMap: Record<string, string[]> = {
    oficina: ['oficina', 'trabajo', 'profesional', 'formal', 'negocios'],
    noche: ['noche', 'fiesta', 'cita', 'salir', 'evento', 'gala'],
    deporte: ['deporte', 'gym', 'ejercicio', 'activo', 'entrenamiento'],
    casual: ['día', 'casual', 'diario', 'cotidiano'],
    especial: ['especial', 'boda', 'celebración', 'importante'],
  };

  for (const [context, keywords] of Object.entries(contextMap)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      contexts.push(context);
    }
  }

  return contexts.length > 0 ? contexts : ['casual'];
}

// Función para obtener recomendaciones de Supabase
async function getRecommendations(contexts: string[], limit: number = 3): Promise<Perfume[]> {
  try {
    let query = supabase.from('perfumes').select('*');

    // Si hay contextos específicos, filtrar por ocasión
    if (contexts.length > 0) {
      const occasionFilters = contexts.map(c => `occasion.cs.{${c}}`).join(',');
      query = query.or(occasionFilters);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return [];
  }
}

// Función para formatear perfumes para el prompt
function formatPerfumesForPrompt(perfumes: Perfume[]): string {
  if (perfumes.length === 0) {
    return "No hay perfumes disponibles en este momento.";
  }

  return perfumes.map((p, index) => `
${index + 1}. **${p.name}** by ${p.brand}
   - Precio: $${p.price.toLocaleString()}
   - Familia: ${p.family}
   - Género: ${p.gender}
   - Concentración: ${p.concentration || 'N/A'}
   - Ocasiones: ${p.occasion?.join(', ') || 'Versátil'}
   - Descripción: ${p.description || 'Fragancia exclusiva'}
   - Notas de salida: ${p.notes.top.join(', ')}
   - Notas de corazón: ${p.notes.middle.join(', ')}
   - Notas de fondo: ${p.notes.base.join(', ')}
`).join('\n');
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurado");
    }

    // Extraer contexto y obtener recomendaciones
    const contexts = extractContext(message);
    const recommendations = await getRecommendations(contexts, 3);

    const model = "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Personalidad de Aurora desde rol_personalidad.md
    const auroraPersonality = `**ROL Y PERSONALIDAD: Aurora, Asesora de Lujo de Sahara Essence**

Eres **Aurora**, la asesora de perfumes de alta gama en **Sahara Essence**. Tu rol es guiar al cliente en una experiencia de compra **exclusiva** y **personalizada**, elevando la selección de una fragancia a un arte.

**ESTILO DE COMUNICACIÓN:**
1. **Tono:** Sofisticado, elegante, **cálido, cercano, y cómplice**. Dirígete al cliente con una familiaridad experta, como si fuera un amigo con un gusto exquisito.
2. **Referencia de Servicio:** Actúa como un asesor privado de **alta costura** que atiende a su círculo más íntimo. El trato es personal, el servicio es impecable y de lujo, pero el enfoque es de confianza.
3. **Audiencia:** Personas de 18 a 50 años.
4. **Extensión y Asertividad:** **Sé concisa, elegante y asertiva.** Tus respuestas deben ser directas. Evita párrafos largos que saturen al cliente. La precisión es un lujo.
5. **Emojis:** Incorpora emojis sutiles y de lujo (ej. 💎, ✨, 🌙, 🥂, 🌹) para añadir un toque visual.

**OBJETIVO PRINCIPAL:**
Iniciar una conversación para descubrir la fragancia ideal, preguntando sobre el **contexto de uso** de la fragancia.

**TIPO DE PREGUNTAS CLAVE:**
* ¿Para qué ocasión busca esta nueva "firma olfativa"?
* ¿Busca algo para la **oficina** (profesionalismo), una **noche de gala** (distinción), una sesión de **entrenamiento** (energía), o momentos de **serenidad** (relajación)?

**PRIMERA INTERACCIÓN (Saludo de Bienvenida ÚNICO y CERCANO):**
Cada vez que inicies la interacción, debes generar un saludo de bienvenida *completamente único* que evite repetir frases exactas. El tono debe ser de una bienvenida íntima y cómplice, como a un amigo de confianza que viene a buscar un consejo de lujo, y luego proceder inmediatamente a la pregunta clave sobre el contexto de uso.`;

    const catalogInfo = recommendations.length > 0
      ? `\n\n**PERFUMES DISPONIBLES EN NUESTRO CATÁLOGO:**\n${formatPerfumesForPrompt(recommendations)}\n\n**IMPORTANTE:** Solo recomienda perfumes de la lista anterior. Menciona el nombre exacto, marca, precio y explica por qué es perfecto para el cliente basándote en su contexto.`
      : '';

    const systemPrompt = `${auroraPersonality}${catalogInfo}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUsuario: ${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      let errorData: unknown = null;
      try {
        errorData = await response.json();
      } catch {
        // ignore parse error
      }
      console.error("Gemini API Error:", errorData || response.statusText);
      throw new Error("Error al conectar con el servicio de IA");
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude procesar tu solicitud. ¿Podrías reformular tu pregunta? ✨";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar tu mensaje" },
      { status: 500 }
    );
  }
}
