import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Lee las credenciales del .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const getEnvVar = (key: string): string => {
  const match = envContent.match(new RegExp(`${key}=(.+)`))
  return match ? match[1].trim() : ''
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No se encontraron las credenciales de Supabase en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  try {
    // Leer el archivo JSON
    const perfumesPath = path.join(process.cwd(), 'public', 'perfumes.json')
    const perfumesData = JSON.parse(fs.readFileSync(perfumesPath, 'utf-8'))

    console.log(`📦 Iniciando migración de ${perfumesData.length} perfumes...`)
    console.log(`🔗 Conectando a: ${supabaseUrl}`)

    // Verificar si ya hay datos
    const { count } = await supabase
      .from('perfumes')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      console.log(`⚠️  La tabla ya tiene ${count} registros.`)
      console.log('¿Deseas continuar? Esto podría crear duplicados.')
      console.log('Considera eliminar los datos existentes primero o usar upsert.')
    }

    // Insertar datos en lotes de 50 para evitar timeouts
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < perfumesData.length; i += batchSize) {
      const batch = perfumesData.slice(i, i + batchSize)
      
      console.log(`📤 Insertando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(perfumesData.length / batchSize)}...`)

      const { data, error } = await supabase
        .from('perfumes')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount += batch.length
      } else {
        successCount += data?.length || 0
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} completado (${data?.length} registros)`)
      }
    }

    console.log('\n📊 Resumen de migración:')
    console.log(`✅ Exitosos: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📦 Total: ${perfumesData.length}`)

    if (successCount > 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!')
      console.log('🔗 Verifica los datos en: https://kwtkwtvnskytohiyixmw.supabase.co')
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

// Ejecutar migración
migrate()