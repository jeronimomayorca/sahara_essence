"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, Share2, Sparkles, Droplets, Flower, TreePine, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { addToCart } from "@/lib/cart"
import type { Perfume } from "@/lib/types"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const noteIcons = {
  Bergamota: Droplets,
  Limón: Droplets,
  Rosa: Flower,
  Jazmín: Flower,
  Sándalo: TreePine,
  Cedro: TreePine,
  Vainilla: Sparkles,
  Ámbar: Sparkles,
}

export default function PerfumeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [perfume, setPerfume] = useState<Perfume | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const [perfumes, setPerfumes] = useState<Perfume[]>([])

  useEffect(() => {
    async function loadPerfume() {
      const id = Number.parseInt(params.id as string)
      
      try {
        const { data, error } = await supabase
          .from('perfumes')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error loading perfume:', error)
          setPerfume(null)
        } else {
          setPerfume(data)
        }
      } catch (err) {
        console.error('Error:', err)
        setPerfume(null)
      }
    }

    loadPerfume()
  }, [params.id])

  useEffect(() => {
    if (!perfume) return

    const ctx = gsap.context(() => {
      // Hero image animation
      gsap.fromTo(
        ".perfume-image",
        { scale: 0.8, opacity: 0, rotateY: -15 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.5, ease: "power3.out", delay: 0.3 },
      )

      // Details animation
      gsap.fromTo(
        ".detail-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.6,
        },
      )

      // Notes animation
      gsap.fromTo(
        ".note-item",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 1,
        },
      )

      // Parallax effect for background
      gsap.to(".bg-gradient", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [perfume])

  if (!perfume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-inter text-muted-foreground">Cargando perfume...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Back Button */}
      <div className="fixed top-20 left-4 z-50">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm border-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center overflow-hidden">
        <div className="bg-gradient absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-amber-50 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="relative"
            >
              <div className="relative aspect-[3/4] max-w-md mx-auto overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0">
                  <Image 
                    src={perfume.image || "/placeholder.svg"} 
                    alt={perfume.name} 
                    fill 
                    className="object-contain rounded-3xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-amber-200/20 dark:from-emerald-800/20 dark:to-amber-800/20 rounded-3xl transform rotate-3 pointer-events-none" />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
              className="space-y-8"
            >
              <div className="detail-item">
                <Badge variant="outline" className="mb-4 font-inter font-medium">
                  {perfume.brand}
                </Badge>
                <h1 className="font-cormorant font-bold text-4xl md:text-6xl mb-4 bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text">
                  {perfume.name}
                </h1>
                <p className="font-inter text-xl text-muted-foreground mb-6">{perfume.description}</p>
              </div>

              <div className="detail-item flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-inter">{perfume.gender}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-inter">{perfume.family}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-inter">{perfume.size}</span>
              </div>

              <div className="detail-item">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-cormorant font-bold text-4xl text-emerald-600 dark:text-emerald-400">
                    ${perfume.price.toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsLiked(!isLiked)}
                      className={`transition-colors ${isLiked ? "text-red-500 border-red-500" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white"
                  size="lg"
                  onClick={() => {
                    addToCart(perfume, 1)
                    toast.success('Agregado al carrito', {
                      description: `${perfume.name} ha sido agregado a tu carrito`
                    })
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al Carrito
                </Button>
              </div>

              <div className="detail-item grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="font-inter font-medium text-sm text-muted-foreground mb-1">Concentración</p>
                    <p className="font-cormorant font-medium">{perfume.concentration}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="font-inter font-medium text-sm text-muted-foreground mb-1">Duración</p>
                    <p className="font-cormorant font-medium">{perfume.longevity}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-cormorant font-bold text-3xl md:text-4xl mb-4 text-emerald-600 dark:text-emerald-400">
              Pirámide Olfativa
            </h2>
            <p className="font-inter text-muted-foreground max-w-2xl mx-auto">
              Descubre las notas que componen esta fragancia única, desde las primeras impresiones hasta el rastro
              final.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Top Notes */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <CardContent className="p-6">
                <h3 className="font-cormorant font-bold text-xl mb-4 text-center">Notas de Salida</h3>
                <div className="space-y-3">
                  {perfume.notes.top.map((note, index) => {
                    const Icon = noteIcons[note as keyof typeof noteIcons] || Droplets
                    return (
                      <motion.div
                        key={note}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="note-item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-inter">{note}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Middle Notes */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <CardContent className="p-6">
                <h3 className="font-cormorant font-bold text-xl mb-4 text-center">Notas de Corazón</h3>
                <div className="space-y-3">
                  {perfume.notes.middle.map((note, index) => {
                    const Icon = noteIcons[note as keyof typeof noteIcons] || Flower
                    return (
                      <motion.div
                        key={note}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                        viewport={{ once: true }}
                        className="note-item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-inter">{note}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Base Notes */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-amber-600"></div>
              <CardContent className="p-6">
                <h3 className="font-cormorant font-bold text-xl mb-4 text-center">Notas de Fondo</h3>
                <div className="space-y-3">
                  {perfume.notes.base.map((note, index) => {
                    const Icon = noteIcons[note as keyof typeof noteIcons] || TreePine
                    return (
                      <motion.div
                        key={note}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                        viewport={{ once: true }}
                        className="note-item flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-inter">{note}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-cormorant font-bold text-3xl md:text-4xl mb-8 text-amber-600 dark:text-amber-400">
              La Historia
            </h2>
            <p className="font-inter text-lg leading-relaxed text-muted-foreground mb-8">{perfume.story}</p>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-cormorant font-bold text-xl mb-4">Estaciones Ideales</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(perfume.season) && perfume.season.length > 0 ? (
                      perfume.season.map((season) => (
                        <Badge key={season} variant="secondary" className="font-inter">
                          {season}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Todo el año</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-cormorant font-bold text-xl mb-4">Ocasiones</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(perfume.occasion) && perfume.occasion.length > 0 ? (
                      perfume.occasion.map((occasion) => (
                        <Badge key={occasion} variant="secondary" className="font-inter">
                          {occasion}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Versátil</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Characteristics */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-cormorant font-bold text-3xl md:text-4xl mb-4 text-emerald-600 dark:text-emerald-400">
              Características
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Droplets className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-cormorant font-bold text-xl mb-4">Longevidad</h3>
                  <p className="font-inter text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {perfume.longevity}
                  </p>
                  <p className="font-inter text-sm text-muted-foreground">Duración en la piel</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-cormorant font-bold text-xl mb-4">Sillage</h3>
                  <p className="font-inter text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                    {perfume.sillage}
                  </p>
                  <p className="font-inter text-sm text-muted-foreground">Proyección del aroma</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Flower className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-cormorant font-bold text-xl mb-4">Concentración</h3>
                  <p className="font-inter text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {perfume.concentration}
                  </p>
                  <p className="font-inter text-sm text-muted-foreground">Tipo de fragancia</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
