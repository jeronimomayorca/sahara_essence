import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function generateEmbeddings() {
  console.log("Fetching perfumes...");
  const { data: perfumes, error } = await supabase
    .from("perfumes")
    .select("*")
    .is("embedding", null); // Only process those without embeddings

  if (error) {
    console.error("Error fetching perfumes:", error);
    return;
  }

  console.log(`Found ${perfumes.length} perfumes to process.`);

  for (const perfume of perfumes) {
    const textForEmbedding = `
${perfume.name}.
Marca: ${perfume.brand || "Desconocida"}.
Familia olfativa: ${perfume.family || "N/A"}.
Notas: ${JSON.stringify(perfume.notes || {})}.
Descripción: ${perfume.description || ""}.
Historia: ${perfume.story || ""}.
Ocasión: ${perfume.occasion || ""}.
Temporada: ${perfume.season || ""}.
`.trim();

    try {
      const result = await model.embedContent(textForEmbedding);
      const embedding = result.embedding.values;

      const { error: updateError } = await supabase
        .from("perfumes")
        .update({ embedding })
        .eq("id", perfume.id);

      if (updateError) {
        console.error(`Error updating perfume ${perfume.name}:`, updateError);
      } else {
        console.log(`Updated embedding for: ${perfume.name}`);
      }
      
      // Rate limit protection (simple pause)
      await new Promise((resolve) => setTimeout(resolve, 500));

    } catch (e) {
      console.error(`Error generating embedding for ${perfume.name}:`, e);
    }
  }

  console.log("Done!");
}

generateEmbeddings();
