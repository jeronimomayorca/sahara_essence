"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import AboutSection from "@/components/AboutSection"
import { supabase } from "@/lib/supabase"
import type { Perfume } from "@/lib/types"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement[]>([])
  const [randomPerfumes, setRandomPerfumes] = useState<Perfume[]>([])

  useEffect(() => {
    // Load random perfumes from Supabase
    const loadRandomPerfumes = async () => {
      try {
        const { data, error } = await supabase
          .from('perfumes')
          .select('id, name, brand, price, image, description')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error loading perfumes:', error)
          return
        }

        if (data) {
          const shuffled = [...data].sort(() => Math.random() - 0.5)
          setRandomPerfumes(shuffled.slice(0, 5))
        }
      } catch (err) {
        console.error('Error loading perfumes:', err)
      }
    }

    loadRandomPerfumes()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power3.out" })

      // Sections scroll animations
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          gsap.fromTo(
            section,
            { opacity: 0, y: 100 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
              },
            },
          )
        }
      })

      // Parallax effect for hero image
      gsap.to(".hero-image", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const addToRefs = (el: HTMLDivElement) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Desktop Image */}
        <div className="hero-image absolute inset-0 hidden md:block">
          <Image
            src="/hero_img.webp"
            alt="Sahara Essence - Perfumes de Lujo"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
        </div>
        
        {/* Mobile Image */}
        <div className="hero-image absolute inset-0 md:hidden">
          <Image
            src="/hero_mobile.webp"
            alt="Sahara Essence - Perfumes de Lujo"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* Best Sellers Bento Grid Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div ref={addToRefs}>
            <h2 className="font-cormorant font-medium text-4xl md:text-6xl mb-4 text-center bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Los Perfumes Más Vendidos
            </h2>
            <p className="font-inter text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Descubre nuestras colecciones más populares, cuidadosamente seleccionadas para cada estilo
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Perfumes Árabes - Large Card */}
              <Link
                href="/catalog?family=Oriental"
                className="group lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/90 to-orange-900/90 p-8 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-cormorant font-medium text-3xl md:text-4xl text-white mb-4">
                      Perfumes Árabes
                    </h3>
                    <p className="font-inter text-white/90 text-lg mb-6">
                      Fragancias orientales intensas y cautivadoras
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter font-medium">
                    Explorar colección
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-[url('/hero_img.webp')] bg-cover bg-center opacity-20"></div>
              </Link>

              {/* Perfumes para Hombre */}
              <Link
                href="/catalog?gender=Hombre"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 to-teal-900/90 p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                  <div>
                    <h3 className="font-cormorant font-medium text-2xl text-white mb-3">
                      Para Hombre
                    </h3>
                    <p className="font-inter text-white/90 text-sm">
                      Masculinidad refinada
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter text-sm font-medium mt-4">
                    Ver más
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Perfumes para Mujer */}
              <Link
                href="/catalog?gender=Mujer"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900/90 to-pink-900/90 p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                  <div>
                    <h3 className="font-cormorant font-medium text-2xl text-white mb-3">
                      Para Mujer
                    </h3>
                    <p className="font-inter text-white/90 text-sm">
                      Elegancia femenina
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter text-sm font-medium mt-4">
                    Ver más
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Unisex */}
              <Link
                href="/catalog?gender=Unisex"
                className="group lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                  <div>
                    <h3 className="font-cormorant font-medium text-2xl md:text-3xl text-white mb-3">
                      Fragancias Unisex
                    </h3>
                    <p className="font-inter text-white/90">
                      Sin límites, para todos
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter font-medium mt-4">
                    Descubrir
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Perfumes Carousel Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div ref={addToRefs}>
            <h2 className="font-cormorant font-medium text-4xl md:text-5xl mb-4 text-center text-amber-600 dark:text-amber-400">
              Fragancias Destacadas
            </h2>
            <p className="font-inter text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Descubre una selección exclusiva de nuestras fragancias más exquisitas
            </p>
            
            {randomPerfumes.length > 0 && (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {randomPerfumes.map((perfume) => (
                    <CarouselItem key={perfume.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Link href={`/catalog/${perfume.id}`}>
                        <Card className="group overflow-hidden border-2 hover:border-amber-600 dark:hover:border-amber-400 transition-all duration-300 hover:shadow-2xl">
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20">
                              <Image
                                src={perfume.image}
                                alt={perfume.name}
                                fill
                                className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <div className="p-6">
                              <p className="font-inter text-sm text-amber-600 dark:text-amber-400 mb-2">
                                {perfume.brand}
                              </p>
                              <h3 className="font-cormorant font-medium text-xl mb-3 line-clamp-2">
                                {perfume.name}
                              </h3>
                              <p className="font-inter text-sm text-muted-foreground mb-4 line-clamp-2">
                                {perfume.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="font-inter font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                                  ${perfume.price.toLocaleString()}
                                </p>
                                <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-2 transition-transform" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            )}
          </div>
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <AboutSection />
    </div>
  )
}
