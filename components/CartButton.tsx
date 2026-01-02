'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getCart } from '@/lib/cart'
import { CartDrawer } from './CartDrawer'

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    // Cargar el contador inicial
    const cart = getCart()
    setItemCount(cart.itemCount)

    // Escuchar cambios en el carrito
    const handleCartUpdate = () => {
      const updatedCart = getCart()
      setItemCount(updatedCart.itemCount)
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  return (
    <>
      <div className="fixed bottom-28 md:bottom-32 right-5 z-40">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-amber-600 text-white p-4 md:p-5 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-red-500 border-2 border-white">
              {itemCount}
            </Badge>
          )}
        </motion.button>
      </div>
      
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}