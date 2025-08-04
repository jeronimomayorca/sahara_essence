import { NextResponse } from "next/server";

export const runtime = "edge"; // This enables the Edge Runtime which is faster for chat applications

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // TODO: Replace with your actual API key and endpoint
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4", // or 'gpt-3.5-turbo' for faster responses
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual de Sahara Essence, una tienda de perfumes premium. 
            Tu objetivo es ayudar a los clientes con información sobre productos, recomendaciones y asistencia general.
            Mantén un tono amable, profesional y cercano. Si no estás seguro de algo, es mejor decirlo que inventar información.
            Responde siempre en el mismo idioma en que te hablen.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error("Error al conectar con el servicio de IA");
    }

    const data = await response.json();
    const reply =
      data.choices[0]?.message?.content ||
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
