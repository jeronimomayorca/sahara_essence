'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

export default function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Mostrar loader al cambiar de ruta
    setIsLoading(true)
    
    // Ocultar loader después de un breve delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Mostrar loader en la carga inicial
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-amber-950"
        >
          {/* Partículas de fondo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Logo con animación */}
          <div className="relative">
            {/* Círculo de fondo con pulso */}
            <motion.div
              className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10"
            >
              <Image
                src="/logo_sahara.png"
                alt="Sahara Essence"
                width={120}
                height={120}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Anillo giratorio */}
            <motion.div
              className="absolute inset-0 -m-4"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-amber-600 border-r-amber-600" />
            </motion.div>

            {/* Puntos de carga */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-amber-600 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Texto de carga */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-20 font-cormorant text-2xl text-amber-900 dark:text-amber-100"
          >
            Sahara Essence
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
