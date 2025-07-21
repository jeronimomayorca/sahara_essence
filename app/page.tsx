"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" })

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

      // Parallax effect for hero background
      gsap.to(".hero-bg", {
        yPercent: -50,
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
  }, [])

  const addToRefs = (el: HTMLDivElement) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[120vh] flex justify-center overflow-hidden">
        <div className="hero-bg absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-background to-amber-900/20 dark:from-emerald-950/40 dark:via-background dark:to-amber-950/40" />

        <div ref={heroRef} className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className=""
          >
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="font-playfair font-bold text-6xl md:text-8xl lg:text-9xl mb-6 bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent"
          >
            SAHARA ESSENCE
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="font-inter text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Descubre la elegancia en cada gota. Perfumes de lujo que definen tu esencia única.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-inter font-medium text-lg px-10 py-5 rounded-full group"
              >
                Explora nuestra colección
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div ref={addToRefs} className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-playfair font-medium text-4xl md:text-5xl mb-8 text-emerald-600 dark:text-emerald-400">
                Nuestra Historia
              </h2>
              <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-6">
                Desde 1985, SAHARA ESSENCE ha sido sinónimo de excelencia en el mundo de la perfumería de lujo. Cada
                fragancia cuenta una historia única, creada por maestros perfumistas que combinan tradición e
                innovación.
              </p>
              <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                Nuestro compromiso con la calidad y la exclusividad nos ha convertido en la elección preferida de
                quienes buscan expresar su personalidad a través del arte olfativo más refinado.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-emerald-600/20 dark:bg-emerald-400/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión Section */}
      <section className="py-32 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div ref={addToRefs} className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900/20 dark:to-emerald-900/20 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-amber-600/20 dark:bg-amber-400/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-playfair font-medium text-4xl md:text-5xl mb-8 text-amber-600 dark:text-amber-400">
                Nuestra Misión
              </h2>
              <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-6">
                Crear experiencias olfativas extraordinarias que trascienden el tiempo y conectan con las emociones más
                profundas. Cada perfume es una obra de arte líquida, diseñada para despertar recuerdos y crear nuevos
                momentos inolvidables.
              </p>
              <p className="font-inter text-lg text-muted-foreground leading-relaxed">
                Nos dedicamos a ofrecer solo las fragancias más exclusivas y refinadas, seleccionadas cuidadosamente
                para satisfacer los gustos más exigentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visión Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div ref={addToRefs} className="text-center">
            <h2 className="font-playfair font-medium text-4xl md:text-5xl mb-12 bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Nuestra Visión
            </h2>
            <p className="font-inter text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-12">
              Ser reconocidos mundialmente como la boutique de perfumes de lujo más prestigiosa, donde cada cliente
              encuentra su fragancia perfecta y vive una experiencia sensorial única e irrepetible.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-playfair font-medium text-2xl mb-4">Exclusividad</h3>
                <p className="font-inter text-muted-foreground">Fragancias únicas y limitadas</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-playfair font-medium text-2xl mb-4">Calidad</h3>
                <p className="font-inter text-muted-foreground">Ingredientes premium seleccionados</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-playfair font-medium text-2xl mb-4">Experiencia</h3>
                <p className="font-inter text-muted-foreground">Servicio personalizado excepcional</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
