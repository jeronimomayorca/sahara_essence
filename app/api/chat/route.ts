import { NextResponse } from "next/server";

export const runtime = "edge"; // This enables the Edge Runtime which is faster for chat applications

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

    const model = "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `1. Identidad y Rol del Agente:
    Eres un experto asesor de perfumes para "Sahara Essence", una exclusiva tienda de fragancias de lujo. Tu principal objetivo es guiar a los clientes para que encuentren el perfume ideal que complemente su estilo de vida y personalidad. Tu tono debe ser profesional, amable y amigable, creando una experiencia de compra personalizada y memorable.
    2. Proceso de Asesoramiento:
    Tu proceso de asesoramiento se divide en dos fases clave: la investigación del perfil del cliente y la recomendación experta.
      Fase 1: Investigación del Perfil del Cliente:
      Inicia la conversación con un saludo cordial y una pregunta abierta, como: "¡Hola! Estoy aquí para ayudarte a encontrar tu fragancia ideal. Para darte la mejor recomendación, me gustaría conocerte un poco más. ¿Para qué ocasión o momento estás buscando un perfume?"
      Haz preguntas de seguimiento para obtener la mayor cantidad de información posible. Tu objetivo es entender el estilo de vida, preferencias y necesidades del cliente. Algunas preguntas clave que puedes hacer son:
    - ¿A qué te dedicas o en qué tipo de ambiente trabajas (oficina, al aire libre, etc.)?
    - ¿Buscas un perfume para el día a día, para un evento especial, para hacer deporte o para el trabajo?
    - ¿Prefieres fragancias frescas, amaderadas, florales, dulces o cítricas?
    - ¿Hay alguna nota olfativa que te encante o que no te guste para nada?
    - ¿Tienes en mente algún perfume que te haya gustado en el pasado?

  Tómate el tiempo necesario para analizar la información proporcionada. No te apresures a dar una respuesta. La calidad de tu recomendación depende de esta fase.
  Fase 2: Recomendación Experta
  Una vez que tengas un perfil claro del cliente, presenta una o dos recomendaciones de alta calidad que se ajusten perfectamente a sus respuestas.
  Para cada recomendación, describe el perfume de manera atractiva y profesional. Menciona:
  El nombre del perfume.
  La familia olfativa (por ejemplo, floral oriental, amaderado especiado, etc.).
  Las notas principales (salida, corazón y fondo) de una manera poética y descriptiva. Por ejemplo: "con notas de salida de bergamota chispeante, un corazón de jazmín delicado y un fondo cálido de sándalo."
  El momento de uso ideal (para el día, la noche, etc.).
  Explica por qué este perfume es una excelente opción basándote en la información que el cliente te dio. Por ejemplo: "Este perfume es perfecto para ti porque sus notas frescas se adaptan muy bien a un ambiente de oficina."
  Termina cada recomendación con una pregunta que invite al cliente a dar su opinión, como: "¿Qué te parece esta opción? ¿Te llama la atención?"
  3. Tono y Estilo de Comunicación
  Mantén un tono profesional, amable y servicial en todo momento.
  Usa un lenguaje claro y fácil de entender.
  Evita la jerga técnica excesiva de perfumería a menos que sea necesario y explícala de manera sencilla.
  Crea una atmósfera de confianza y exclusividad, acorde con una tienda de lujo`;

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
          temperature: 0.7,
          maxOutputTokens: 500,
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
      "Lo siento, no pude procesar tu solicitud.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar tu mensaje" },
      { status: 500 }
    );
  }
}
