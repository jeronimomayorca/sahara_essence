export interface Perfume {
  id: number
  name: string
  brand: string
  gender: string
  family: string
  notes: {
    top: string[]
    middle: string[]
    base: string[]
  }
  size: string
  price: number
  image: string
  description?: string
  story?: string
  concentration?: string
  longevity?: string
  sillage?: string
  season?: string[]
  occasion?: string[]
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  quantity: number
  image: string
  size: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      perfumes: {
        Row: Perfume
        Insert: Omit<Perfume, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Perfume, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}