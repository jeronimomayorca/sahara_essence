import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtrado opcionales
    const gender = searchParams.get('gender')
    const family = searchParams.get('family')
    const occasion = searchParams.get('occasion')
    const brand = searchParams.get('brand')
    const limit = searchParams.get('limit')

    let query = supabase.from('perfumes').select('*')

    // Aplicar filtros si existen
    if (gender && gender !== 'Todos') {
      query = query.eq('gender', gender)
    }

    if (family && family !== 'Todas') {
      query = query.eq('family', family)
    }

    if (brand && brand !== 'Todas') {
      query = query.eq('brand', brand)
    }

    if (occasion) {
      query = query.contains('occasion', [occasion])
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    // Ordenar por nombre por defecto
    query = query.order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al obtener perfumes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ perfumes: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}