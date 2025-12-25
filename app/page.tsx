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
import { getPerfumeImageUrl } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Desktop Image */}
        <div className="hero-image absolute inset-0 hidden md:block">
          <Image
            src="/hero_img.webp"
            alt="Sahara Essence - Perfumes de Lujo"
            fill
            priority
            quality={100}
            className="object-cover scale-110"
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
            className="object-cover scale-110"
            sizes="100vw"
          />
        </div>

        {/* Hero Overlay Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-10 md:pt-20 flex justify-center md:justify-start">
          <div className="max-w-5xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <h1 className="font-cormorant flex flex-col items-center mb-10 drop-shadow-2xl text-amber-600 dark:text-amber-400">
                <span className="text-6xl md:text-9xl font-bold leading-none">SAHARA</span>
                <div className="flex items-center gap-4 w-full mt-2 opacity-90">
                  <div className="h-[1px] flex-1 bg-amber-600/50 dark:bg-amber-400/50" />
                  <span className="text-xl md:text-3xl font-medium tracking-[0.3em] uppercase">Essence</span>
                  <div className="h-[1px] flex-1 bg-amber-600/50 dark:bg-amber-400/50" />
                </div>
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6">
                <Link href="/catalog">
                  <Button 
                    size="lg" 
                    className="magnetic-button bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6 py-5 md:px-10 md:py-8 text-lg md:text-xl font-medium border-none shadow-xl"
                  >
                    Explorar Catálogo
                    <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="/#sobre-nosotros">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="glass-luxury text-white hover:bg-white/20 rounded-full px-6 py-5 md:px-10 md:py-8 text-lg md:text-xl font-medium border-white/30 backdrop-blur-md"
                  >
                    Nuestra Historia
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator Removed as requested */}

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </section>

      {/* Best Sellers Bento Grid Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div ref={addToRefs}>
            <h2 className="font-cormorant font-medium text-4xl md:text-6xl mb-4 text-center text-amber-600 dark:text-amber-400">
              Los Perfumes Más Vendidos
            </h2>
            <p className="font-inter text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Descubre nuestras colecciones más populares, cuidadosamente seleccionadas para cada estilo
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Perfumes Árabes - Large Card */}
              <Link
                href="/catalog?family=Oriental"
                className="group lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#635a4b] via-[#958672] to-[#635a4b] p-5 md:p-8 hover:scale-[1.02] transition-transform duration-500 shadow-xl"
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="glass-luxury p-5 md:p-6 rounded-2xl inline-block max-w-[90%] md:max-w-fit">
                    <h3 className="font-cormorant font-bold text-2xl md:text-5xl text-white mb-1 md:mb-2">
                      Perfumes Árabes
                    </h3>
                    <p className="font-inter text-white/80 text-base md:text-lg">
                      Intensidad y Misterio Oriental
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter font-semibold bg-white/10 backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-full self-start group-hover:bg-white/20 transition-all text-sm md:text-base">
                    Explorar colección
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-[url('/hero_img.webp')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </Link>

              {/* Perfumes para Hombre */}
              <Link
                href="/catalog?gender=Hombre"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#958672] to-[#cab195] p-5 md:p-6 hover:scale-[1.02] transition-transform duration-500 shadow-lg"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
                  <div className="glass-luxury p-3.5 md:p-4 rounded-xl">
                    <h3 className="font-cormorant font-bold text-xl md:text-2xl text-white mb-0.5 md:mb-1">
                      Para Hombre
                    </h3>
                    <p className="font-inter text-white/70 text-xs md:text-sm">
                      Refinamiento Masculino
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter text-xs md:text-sm font-semibold mt-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full self-start hover:bg-white/20 transition-all">
                    Ver más
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 to-transparent"></div>
              </Link>

              {/* Perfumes para Mujer */}
              <Link
                href="/catalog?gender=Mujer"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#cab195] to-[#f9dfbd] p-5 md:p-6 hover:scale-[1.02] transition-transform duration-500 shadow-lg"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
                  <div className="glass-luxury p-3.5 md:p-4 rounded-xl">
                    <h3 className="font-cormorant font-bold text-xl md:text-2xl text-white mb-0.5 md:mb-1">
                      Para Mujer
                    </h3>
                    <p className="font-inter text-white/70 text-xs md:text-sm">
                      Elegancia Atemporal
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter text-xs md:text-sm font-semibold mt-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full self-start hover:bg-white/20 transition-all">
                    Ver más
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/10 to-transparent"></div>
              </Link>

              {/* Unisex */}
              <Link
                href="/catalog?gender=Unisex"
                className="group lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#958672] via-[#cab195] to-[#f9dfbd] p-5 md:p-6 hover:scale-[1.02] transition-transform duration-500 shadow-lg"
              >
                <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
                  <div className="glass-luxury p-4 md:p-5 rounded-xl max-w-[240px] md:max-w-[280px]">
                    <h3 className="font-cormorant font-bold text-2xl md:text-3xl text-white mb-1 md:mb-2">
                      Fragancias Unisex
                    </h3>
                    <p className="font-inter text-white/80 text-sm md:text-base">
                      Libertad sin límites
                    </p>
                  </div>
                  <div className="flex items-center text-white font-inter text-sm md:text-base font-semibold mt-4 bg-white/10 backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-full self-start hover:bg-white/20 transition-all">
                    Descubrir
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-600/20 to-transparent"></div>
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
                                src={getPerfumeImageUrl(perfume.image)}
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
