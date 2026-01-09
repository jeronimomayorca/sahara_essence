import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("--- POST /api/chat STARTED ---");
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("FATAL: Supabase configuration missing");
      throw new Error("Misconfigured Server: Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("FATAL: GOOGLE_GENERATIVE_AI_API_KEY is missing in process.env");
      throw new Error("Misconfigured Server: Missing API Key");
    }

    // Initialize Gemini Client Per-Request to ensure Env var is fresh
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;
    console.log("User Message:", userMessage);

    // 1. Extract Preferences
    console.log("Step 1: Extracting preferences...");
    const extractionPrompt = `
      Eres un experto en perfumes. Analiza el siguiente mensaje del usuario y extrae sus preferencias en formato JSON.
      Si un campo no se menciona, usa null.
      
      Mensaje: "${userMessage}"
      
      Campos a extraer:
      - occasion (ej: oficina, fiesta, cita, diario)
      - family (ej: floral, amaderado, cítrico, oriental)
      - gender (ej: hombre, mujer, unisex)
      - concentration (ej: edt, edp, parfum)
      - season (ej: verano, invierno, primavera, otoño)
      
      Responde SOLO con el JSON válido.
    `;

    let extractionText = "";
    try {
        const extractionResult = await geminiModel.generateContent(extractionPrompt);
        extractionText = extractionResult.response.text();
        console.log("Extraction Raw Response:", extractionText);
    } catch (e: any) {
        console.error("Gemini Extraction Error Full:", e);
        throw new Error(`Gemini Extraction Failed: ${e.message}`);
    }

    let preferences: any = {};
    try {
        const jsonStr = extractionText.replace(/```json/g, "").replace(/```/g, "").trim();
        preferences = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Error parsing preferences JSON:", e);
    }
    console.log("Extracted Preferences:", preferences);

    // 2. Embedding
    console.log("Step 2: Generating embedding...");
    // Force a simpler query if preferences are empty
    const family = preferences.family || "general";
    const occasion = preferences.occasion || "general";
    const semanticQuery = `Perfume ${family} para ${occasion}. ${userMessage}`;
    
    let embedding = [];
    try {
        const embeddingResult = await embeddingModel.embedContent(semanticQuery);
        embedding = embeddingResult.embedding.values;
        console.log("Embedding generated. Length:", embedding.length);
    } catch (e: any) {
        console.error("Gemini Embedding Error Full:", e);
        throw new Error(`Gemini Embedding Failed: ${e.message}`);
    }

    // 4. Supabase RPC
    console.log("Step 3: Searching Supabase...");
    const { data: recommendations, error } = await supabase.rpc("match_perfumes", {
      query_embedding: embedding,
      match_count: 5,
      filter_occasion: preferences.occasion || null,
      filter_family: preferences.family || null,
      filter_gender: preferences.gender || null,
      filter_concentration: preferences.concentration || null,
      filter_season: preferences.season || null
    });

    if (error) {
      console.error("Supabase RPC Error Full:", error);
      throw new Error(`Supabase Error: ${error.message}`);
    }
    console.log("Supabase returned rows:", recommendations?.length);

    // 5. Generate Explanation
    // 5. Generate Explanation or Fallback
    if (!recommendations || recommendations.length === 0) {
        console.log("No recommendations found. Generating consultative fallback...");
        const fallbackPrompt = `
            Eres un experto en perfumes (Aurora). El usuario preguntó: "${userMessage}".
            INTENCIÓN: No encontramos perfumes exactos en el catálogo con los filtros actuales (Ocasión: ${preferences.occasion}, Familia: ${preferences.family}, etc.).
            
            TU TAREA:
            Genera una respuesta amable y sofisticada (máximo 40 palabras) que:
            1. Reconozca sutilmente que necesitamos afinar la búsqueda (sin decir "error" ni "no encontrado").
            2. Le haga 1-2 preguntas clave al usuario para entender mejor lo que busca (ej: ¿Prefieres notas más frescas o dulces? ¿Es para una ocasión especial?).
            3. Mantén la personalidad de Aurora: elegante, cálida, experta.
        `;

        const fallbackRes = await geminiModel.generateContent(fallbackPrompt);
        const fallbackMessage = fallbackRes.response.text();

        return NextResponse.json({ 
            role: "assistant", 
            content: fallbackMessage,
            data: []
        });
    }

    const products = recommendations.slice(0, 3);
    
    console.log("Step 4: Generating explanations...");
    const explainedProducts = await Promise.all(products.map(async (p: any) => {
        try {
            const prompt = `
                Explica en MÁXIMO 10 PALABRAS, de forma persuasiva y elegante por qué el perfume "${p.name}" (${p.brand}) es una elección exquisita para: "${userMessage}".
                Usa la descripción: "${p.description}".
                Sé directo impactante.
            `;
            const res = await geminiModel.generateContent(prompt);
            return {
                ...p,
                reason: res.response.text(),
            };
        } catch (e) {
            console.error(`Error explaining product ${p.name}:`, e);
            return { ...p, reason: "Recomendado para ti." };
        }
    }));

    // Generate final response text
    console.log("Step 5: Final summary...");
    const finalPrompt = `
        El usuario preguntó: "${userMessage}".
        Le hemos encontrado estos perfumes excepcionales:
        ${explainedProducts.map((p: any) => `- ${p.name} de ${p.brand}: ${p.reason}`).join("\n")}
        
        Actúa como un *connoisseur* de perfumes amigo del usuario.
        
        INSTRUCCIONES DE RESPUESTA:
        1. **SÉ EXTREMADAMENTE BREVE**: Tu respuesta completa NO debe superar las 40 palabras.
        2. **SÉ CÁLIDA Y SOFISTICADA**: Usa un tono cercano pero elevado, con un toque de misterio. Eres Aurora, una experta en alta perfumería con una personalidad cálida, extremadamente elegante y sutilmente sensual.
        3. **Estilo Lujoso y Sensorial**: Usa palabras evocadoras como "sublime", "esencia", "aura", "encanto", "piel". Evita lo genérico.
        4. **Visual**: Usa emojis de lujo (✨, 💎, 🌹) con moderación y elegancia.

        Ejemplo de respuesta ideal:
        "✨ *Il Sexuel* es una joya olfativa; su calidez envolverá tu piel con un aura irresistible. 🌹 Una elección exquisita para quien sabe lo que quiere."
    `;
    
    const finalRes = await geminiModel.generateContent(finalPrompt);
    const finalMessage = finalRes.response.text();

    console.log("--- SUCCESS ---");
    return NextResponse.json({
        role: "assistant",
        content: finalMessage,
        data: explainedProducts
    });

  } catch (error: any) {
    console.error("--- API FATAL ERROR ---", error);
    // Return the specific error message to the client for the user to see in Network tab
    return NextResponse.json({ 
        role: "assistant",
        content: "Lo siento, tuve un pequeño mareo olfativo. ¿Podrías repetirme tu pregunta? A veces las esencias son caprichosas.", 
        error: error.message || "Internal Server Error" 
    }, { status: 200 }); // Returning 200 so the UI doesn't break, but logging the error.
  }
}
