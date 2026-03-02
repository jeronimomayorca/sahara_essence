import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configuración de Google Custom Search
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID
const customsearch = google.customsearch('v1')

// Rutas
const IMAGES_DIR = path.join(process.cwd(), 'public', 'perfume_images')
const MCP_SERVER_PATH = 'C:/users/mayor/documents/10_workspace/mcp_servers/image_processor/main.py'
const TEMP_DIR = path.join(process.cwd(), 'tmp_images')

// Helper format string into valid filename slug
const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

async function setupMcpClient() {
  const transport = new StdioClientTransport({
    command: 'uv',
    args: ['run', MCP_SERVER_PATH]
  })
  
  const mcpClient = new Client({
    name: "image-downloader-script",
    version: "1.0.0"
  }, {
    capabilities: {}
  })

  await mcpClient.connect(transport)
  return mcpClient
}

async function searchImage(query: string): Promise<string | null> {
  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error('Missing Google API Keys in environment variables')
  }

  try {
    const res = await customsearch.cse.list({
      cx: SEARCH_ENGINE_ID,
      q: query,
      auth: GOOGLE_API_KEY,
      searchType: 'image',
      num: 3, // Fetches top 3 to ensure we get a valid match
      fileType: 'png,webp,jpg,jpeg',
      imgType: 'photo'
    })

    const items = res.data.items
    if (items && items.length > 0) {
      // Devolver la primera URL que parezca válida
      for(const item of items) {
         if (item.link) return item.link;
      }
    }
  } catch (error) {
    console.error(`  [!] Error searching for "${query}":`, error)
  }
  return null
}

async function run() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true })
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })

  console.log('============== INICIANDO PROCESO ==============')
  console.log('Conectando al servidor MCP (image_processor)...')
  let mcpClient;
  try {
     mcpClient = await setupMcpClient();
     console.log('✅ Conectado al MCP Server!');
  } catch (err) {
      console.error('❌ Falló la conexión al MCP Server:', err);
      return;
  }

  console.log('Obteniendo perfumes de Supabase...')
  const { data: perfumes, error } = await supabase.from('perfumes').select('id, name, brand, image')
  
  if (error) {
    console.error('❌ Error obteniendo base de datos:', error)
    return
  }

  console.log(`✅ ${perfumes.length} perfumes encontrados.`)
  const existingFiles = new Set(fs.readdirSync(IMAGES_DIR))
  const usedImagesUrls = new Set<string>()

  for (const perfume of perfumes) {
    const slug = slugify(`${perfume.brand}-${perfume.name}`)
    const finalFilename = `${slug}.webp`
    const finalPath = path.join(IMAGES_DIR, finalFilename)
    
    // Add to used URLs either way to prevent it from being deleted
    usedImagesUrls.add(finalFilename)

    console.log(`\nProcesando [${perfume.id}] ${perfume.brand} ${perfume.name}...`)

    if (existingFiles.has(finalFilename)) {
      console.log(`  -> YA EXISTE. Omite la descarga.`)
      
      // Update DB if it was previously pointing to a .jpg or null
      if (perfume.image !== `/perfume_images/${finalFilename}`) {
         console.log(`  -> Actualizando URL de base de datos a .webp...`)
         await supabase.from('perfumes').update({ image: `/perfume_images/${finalFilename}` }).eq('id', perfume.id)
      }
      continue
    }

    const searchQuery = `${perfume.brand} ${perfume.name} perfume bottle`
    console.log(`  -> Buscando: "${searchQuery}"`)
    const imageUrl = await searchImage(searchQuery)

    if (!imageUrl) {
      console.log(`  -> ❌ No se encontraron imágenes válidas.`)
      continue
    }

    console.log(`  -> Descargando: ${imageUrl}`)
    try {
      // 1. Download
      const downloadResult = await mcpClient.callTool({
        name: 'download_img',
        arguments: { url: imageUrl, path: TEMP_DIR, file_name: slug }
      }) as any
      
      if (!downloadResult.content[0].text.includes('"success": true') && !downloadResult.content[0].text.includes("'success': True")) {
         const parsed = JSON.parse(downloadResult.content[0].text.replace(/'/g, '"').replace(/True|False/gi, match => match.toLowerCase()));
         console.log(`  -> ❌ Error al descargar:`, parsed.error)
         continue
      }
      
      // We parse the non-standard python dict string to JS
      const cleanedJson = downloadResult.content[0].text.replace(/'/g, '"').replace(/True|False/gi, match => match.toLowerCase().replace(/None/g, "null"))
      const dlData = JSON.parse(cleanedJson)
      const downloadedPath = dlData.file_path;
      console.log(`     (Guardado en ${downloadedPath})`)

      // 2. Remove Background
      console.log(`  -> Removiendo el fondo con IA...`)
      const bgResult = await mcpClient.callTool({
        name: 'remove_bg',
        arguments: { input_path: downloadedPath }
      }) as any
      const bgData = JSON.parse(bgResult.content[0].text.replace(/'/g, '"').replace(/True|False/gi, match => match.toLowerCase()))
      if (!bgData.success) throw new Error(bgData.error)

      // 3. Resize
      console.log(`  -> Redimensionando a ancho 500px...`)
      const resResult = await mcpClient.callTool({
        name: 'resize_img',
        arguments: { 
            input_path: downloadedPath, 
            width: 500, 
            height: 500, // using maintain aspect ratio we just care about bounding box
            maintain_aspect_ratio: true 
         }
      }) as any
      const resData = JSON.parse(resResult.content[0].text.replace(/'/g, '"').replace(/True|False/gi, match => match.toLowerCase()))
      if (!resData.success) throw new Error(resData.error)

      // 4. Convert to WEBP
      console.log(`  -> Convirtiendo a formato WebP optimizado...`)
      const webpTempPath = downloadedPath.replace(/\.[^/.]+$/, "") + ".webp"
      const convResult = await mcpClient.callTool({
        name: 'convert_img',
        arguments: { 
           input_path: downloadedPath, 
           target_format: 'WEBP',
           quality: 90,
           output_path: webpTempPath
        }
      }) as any
      const convData = JSON.parse(convResult.content[0].text.replace(/'/g, '"').replace(/True|False/gi, match => match.toLowerCase()))
      if (!convData.success) throw new Error(convData.error)

      // 5. Move to final location
      fs.renameSync(webpTempPath, finalPath)
      
      // Cleanup the original temp file if it's not the webp file itself
      if (fs.existsSync(downloadedPath) && downloadedPath !== webpTempPath) {
          fs.unlinkSync(downloadedPath)
      }

      console.log(`  ✅ Guardado como: ${finalPath}`)

      // 6. Update Database
      await supabase.from('perfumes').update({ image: `/perfume_images/${finalFilename}` }).eq('id', perfume.id)
      console.log(`  ✅ Base de datos actualizada con éxito`)
      
    } catch (err) {
      console.error(`  -> ❌ Excepción procesando la imagen:`, err)
    }
  }

  // Final step: Cleanup trash images
  console.log('\n============== LIMPIEZA DE BASURA ==============')
  for (const file of existingFiles) {
    if (!usedImagesUrls.has(file)) {
      const filePath = path.join(IMAGES_DIR, file)
      fs.unlinkSync(filePath)
      console.log(`🗑️ Eliminado: ${file} (No corresponde a ningún registro)`)
    }
  }

  console.log('\n✅ Proceso Finalizado Completo.')
  process.exit(0)
}

run().catch(console.error)
