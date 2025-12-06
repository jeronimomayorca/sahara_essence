'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

// Variantes de animación para el contenedor principal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

// Variantes para el título
const titleVariants = {
  hidden: {
    opacity: 0,
    y: -30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const, // Curva de easing lujosa
    },
  },
};

// Variantes para las tarjetas desde la izquierda
const cardLeftVariants = {
  hidden: {
    opacity: 0,
    x: -100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// Variantes para las tarjetas desde la derecha
const cardRightVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function AboutSection() {
  const [particles] = useState(() => generateParticles(25));

  return (
    <section
      id="sobre-nosotros"
      className="relative py-32 px-4 overflow-hidden scroll-mt-24"
    >
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-amber-950/10 dark:via-orange-950/5 dark:to-yellow-950/10 animate-gradient-shift" />

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
      <motion.div 
        className="max-w-4xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Título con visibilidad garantizada */}
        <motion.h2
          variants={titleVariants}
          className="font-cormorant font-bold text-5xl md:text-7xl mb-16 text-center relative"
        >
          <span className="relative inline-block">
            <span className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 blur-xl opacity-30 dark:opacity-40" />
            <span className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
              Sobre Nosotros
            </span>
          </span>
        </motion.h2>

        {/* Párrafos con diseño asimétrico y animaciones laterales */}
        <div className="space-y-16 md:space-y-24">
          {/* Párrafo 1 - Desde la izquierda, alineado a la izquierda */}
          <motion.div
            variants={cardLeftVariants}
            className="group md:mr-auto md:max-w-2xl"
          >
            <motion.div
              className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-2 border-amber-200/40 dark:border-amber-800/40 shadow-lg shadow-amber-500/5 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{
                y: -8,
                scale: 1.02,
                rotate: -1,
                borderColor: 'rgba(251, 191, 36, 0.6)',
                boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.15)',
                transition: {
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
              <p className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10">
                En Sahara Essence creemos que un aroma tiene el poder de despertar recuerdos, emociones y sensaciones profundas. Nacimos en Manizales, Colombia, como un proyecto que buscaba algo más que vender perfumes: queríamos crear experiencias olfativas que hicieran sentir especial a cada persona.
              </p>
            </motion.div>
          </motion.div>

          {/* Párrafo 2 - Desde la derecha, alineado a la derecha */}
          <motion.div
            variants={cardRightVariants}
            className="group md:ml-auto md:max-w-2xl"
          >
            <motion.div
              className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-2 border-orange-200/40 dark:border-orange-800/40 shadow-lg shadow-orange-500/5 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{
                y: -8,
                scale: 1.02,
                rotate: 1,
                borderColor: 'rgba(249, 115, 22, 0.6)',
                boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.15)',
                transition: {
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
              <p className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10">
                Hoy somos una tienda virtual que llega a cualquier rincón del país, ofreciendo perfumes de alta calidad, empaques especiales y una experiencia de atención cálida, cercana y memorable. Cada vez que un cliente recibe su fragancia, queremos que sienta que no adquirió solo un perfume: adquirió un momento, una sensación, un detalle.
              </p>
            </motion.div>
          </motion.div>

          {/* Párrafo 3 - Desde la izquierda, alineado a la izquierda */}
          <motion.div
            variants={cardLeftVariants}
            className="group md:mr-auto md:max-w-2xl"
          >
            <motion.div
              className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border-2 border-yellow-200/40 dark:border-yellow-800/40 shadow-lg shadow-yellow-500/5 gpu-accelerated"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{
                y: -8,
                scale: 1.02,
                rotate: -1,
                borderColor: 'rgba(234, 179, 8, 0.6)',
                boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.15)',
                transition: {
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
              <p className="font-inter text-lg md:text-xl text-foreground/90 leading-relaxed relative z-10">
                Elegimos el nombre Sahara Essence porque el Sahara representa inmensidad, misterio y fuerza. El desierto más grande del mundo es un lugar lleno de contrastes: puede ser cálido e intenso, suave y silencioso, vasto y poderoso. Así como el Sahara guarda historias en cada una de sus arenas, creemos que cada persona guarda una historia en su aroma.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}