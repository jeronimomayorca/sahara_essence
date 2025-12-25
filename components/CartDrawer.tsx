'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQuantity, removeFromCart, clearCart, generateWhatsAppMessage } from '@/lib/cart'
import type { Cart } from '@/lib/types'
import { getPerfumeImageUrl } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })

  const refreshCart = () => {
    const updatedCart = getCart()
    setCart(updatedCart)
    // Disparar evento para actualizar el contador
    window.dispatchEvent(new Event('cart-updated'))
  }

  useEffect(() => {
    if (isOpen) {
      refreshCart()
    }
  }, [isOpen])

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
    refreshCart()
  }

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId)
    refreshCart()
  }

  const handleClearCart = () => {
    clearCart()
    refreshCart()
  }

  const handleCheckout = () => {
    const whatsappUrl = generateWhatsAppMessage(cart)
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-cormorant font-bold text-2xl">Mi Carrito</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-inter">
                  {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'}
                </p>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-cormorant font-medium text-xl mb-2">Tu carrito está vacío</h3>
                    <p className="text-sm text-muted-foreground font-inter mb-6">
                      Agrega algunos perfumes para comenzar
                    </p>
                    <Button onClick={onClose} variant="outline">
                      Explorar Catálogo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={getPerfumeImageUrl(item.image)}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-cormorant font-medium text-lg mb-1 truncate">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground font-inter mb-2">
                                {item.brand} • {item.size}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="font-inter font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground font-inter">Subtotal:</span>
                            <span className="font-cormorant font-bold text-lg text-emerald-600 dark:text-emerald-400">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.items.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-cormorant font-bold text-xl">Total:</span>
                    <span className="font-cormorant font-bold text-3xl text-emerald-600 dark:text-emerald-400">
                      ${cart.total.toLocaleString()}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white"
                    size="lg"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Enviar Pedido por WhatsApp
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vaciar Carrito
                  </Button>

                  <div className="pt-2 text-center">
                    <Link 
                      href="/faqs" 
                      onClick={onClose}
                      className="text-xs text-muted-foreground hover:text-amber-600 transition-colors underline underline-offset-4"
                    >
                      ¿Necesitas ayuda con tu pedido? Ver FAQs
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}