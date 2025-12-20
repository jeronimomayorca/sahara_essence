import type { Cart, CartItem, Perfume } from './types'

const CART_STORAGE_KEY = 'sahara_essence_cart'

// Obtener carrito del localStorage
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 }
  }

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    if (!cartData) {
      return { items: [], total: 0, itemCount: 0 }
    }
    return JSON.parse(cartData)
  } catch (error) {
    console.error('Error loading cart:', error)
    return { items: [], total: 0, itemCount: 0 }
  }
}

// Guardar carrito en localStorage
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart:', error)
  }
}

// Calcular totales del carrito
function calculateTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { total, itemCount }
}

// Agregar producto al carrito
export function addToCart(perfume: Perfume, quantity: number = 1): Cart {
  const cart = getCart()
  const existingItemIndex = cart.items.findIndex((item) => item.id === perfume.id)

  if (existingItemIndex > -1) {
    // Si el producto ya existe, incrementar cantidad
    cart.items[existingItemIndex].quantity += quantity
  } else {
    // Si es nuevo, agregarlo
    const newItem: CartItem = {
      id: perfume.id,
      name: perfume.name,
      brand: perfume.brand,
      price: perfume.price,
      quantity,
      image: perfume.image,
      size: perfume.size,
    }
    cart.items.push(newItem)
  }

  const totals = calculateTotals(cart.items)
  cart.total = totals.total
  cart.itemCount = totals.itemCount

  saveCart(cart)
  
  // Disparar evento para actualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
  
  return cart
}

// Eliminar producto del carrito
export function removeFromCart(productId: number): Cart {
  const cart = getCart()
  cart.items = cart.items.filter((item) => item.id !== productId)

  const totals = calculateTotals(cart.items)
  cart.total = totals.total
  cart.itemCount = totals.itemCount

  saveCart(cart)
  
  // Disparar evento para actualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
  
  return cart
}

// Actualizar cantidad de un producto
export function updateQuantity(productId: number, quantity: number): Cart {
  const cart = getCart()
  const itemIndex = cart.items.findIndex((item) => item.id === productId)

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Si la cantidad es 0 o negativa, eliminar el producto
      return removeFromCart(productId)
    }
    cart.items[itemIndex].quantity = quantity
  }

  const totals = calculateTotals(cart.items)
  cart.total = totals.total
  cart.itemCount = totals.itemCount

  saveCart(cart)
  
  // Disparar evento para actualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
  
  return cart
}

// Vaciar carrito
export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], total: 0, itemCount: 0 }
  saveCart(emptyCart)
  
  // Disparar evento para actualizar UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'))
  }
  
  return emptyCart
}

// Generar mensaje de WhatsApp
export function generateWhatsAppMessage(cart: Cart): string {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573216974038'
  
  let message = '✨ *SAHARA ESSENCE — Mi Selección* ✨\n\n'
  message += '¡Hola! 👋 Me encantaron estas fragancias y quiero llevarlas:\n\n'

  cart.items.forEach((item) => {
    message += `✦ ${item.quantity}x ${item.name} (${item.size}) — $${(item.price * item.quantity).toLocaleString()}\n`
  })

  message += `\n💎 *Inversión Total:* $${cart.total.toLocaleString()}\n\n`
  message += '¿Me confirman si las tienen listas para mí? ✨ Quedo atento/a.'

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
}