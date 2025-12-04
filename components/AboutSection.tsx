'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Generar partículas flotantes
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 4,
    opacity: Math.random() * 0.4 + 0.3,
  }));
};

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraph1Ref = useRef<HTMLParagraphElement>(null);
  const paragraph2Ref = useRef<HTMLParagraphElement>(null);
  const paragraph3Ref = useRef<HTMLParagraphElement>(null);
  const [particles] = useState(() => generateParticles(25));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del título con brillo
      if (titleRef.current) {
        const titleChars = titleRef.current.textContent?.split('') || [];
        titleRef.current.innerHTML = titleChars
          .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
          .join('');

        gsap.from(titleRef.current.children, {
          opacity: 0,
          y: 50,
          rotationX: -90,
          stagger: 0.05,
          duration: 1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });

        // Efecto de brillo después de la animación
        gsap.to(titleRef.current, {
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'none',
          delay: 1.5,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          },
        });
      }

      // Animación letra por letra para párrafos
      [paragraph1Ref, paragraph2Ref, paragraph3Ref].forEach((ref, index) => {
        if (ref.current) {
          const text = ref.current.textContent || '';
          const chars = text.split('');
          ref.current.innerHTML = chars
            .map((char) => `<span class="inline-block char">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

          gsap.from(ref.current.querySelectorAll('.char'), {
            opacity: 0,
            y: 20,
            scale: 0.8,
            rotationX: -45,
            stagger: 0.02,
            duration: 0.5,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          });

          // Efecto shimmer al completar
          gsap.to(ref.current, {
            onComplete: () => {
              ref.current?.classList.add('animate-shimmer');
              setTimeout(() => {
                ref.current?.classList.remove('animate-shimmer');
              }, 2000);
            },
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 75%',
            },
          });
        }
      });

      // Transformación 3D en scroll
      gsap.to('.about-paragraph', {
        rotationY: 5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      });

      // Parallax para el fondo
      gsap.to('.about-background', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="sobre-nosotros"
      ref={sectionRef}
      className="relative py-32 px-4 overflow-hidden perspective-container scroll-mt-24"
    >
      {/* Fondo con gradiente animado */}
      <div className="about-background absolute inset-0 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-amber-950/10 dark:via-orange-950/5 dark:to-yellow-950/10 animate-gradient-shift" />

      {/* Partículas flotantes doradas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-br from-amber-400 to-orange-500"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              opacity: particle.opacity,
            }}
            animate={{
              y: [0, -30, -15, -40, 0],
              x: [0, 15, -15, 10, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Título */}
        <h2
          ref={titleRef}
          className="font-cormorant font-medium text-4xl md:text-6xl mb-16 text-center bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-title-shine"
          style={{ perspective: '1000px' }}
        >
          Sobre Nosotros
        </h2>

        {/* Párrafos con animaciones */}
        <div className="space-y-8 md:space-y-12">
          {/* Párrafo 1 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="about-paragraph group"
          >
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-amber-200/30 dark:border-amber-800/30 hover:border-amber-400/50 dark:hover:border-amber-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <p
                ref={paragraph1Ref}
                className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10"
              >
                En Sahara Essence creemos que un aroma tiene el poder de despertar recuerdos, emociones y sensaciones profundas. Nacimos en Manizales, Colombia, como un proyecto que buscaba algo más que vender perfumes: queríamos crear experiencias olfativas que hicieran sentir especial a cada persona.
              </p>
            </div>
          </motion.div>

          {/* Párrafo 2 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="about-paragraph group"
          >
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-orange-200/30 dark:border-orange-800/30 hover:border-orange-400/50 dark:hover:border-orange-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <p
                ref={paragraph2Ref}
                className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10"
              >
                Hoy somos una tienda virtual que llega a cualquier rincón del país, ofreciendo perfumes de alta calidad, empaques especiales y una experiencia de atención cálida, cercana y memorable. Cada vez que un cliente recibe su fragancia, queremos que sienta que no adquirió solo un perfume: adquirió un momento, una sensación, un detalle.
              </p>
            </div>
          </motion.div>

          {/* Párrafo 3 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="about-paragraph group"
          >
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-2 border-yellow-200/30 dark:border-yellow-800/30 hover:border-yellow-400/50 dark:hover:border-yellow-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <p
                ref={paragraph3Ref}
                className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10"
              >
                Elegimos el nombre Sahara Essence porque el Sahara representa inmensidad, misterio y fuerza. El desierto más grande del mundo es un lugar lleno de contrastes: puede ser cálido e intenso, suave y silencioso, vasto y poderoso. Así como el Sahara guarda historias en cada una de sus arenas, creemos que cada persona guarda una historia en su aroma.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}