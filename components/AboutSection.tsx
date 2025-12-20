import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Título animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards staggered animation
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <section
      id="sobre-nosotros"
      ref={containerRef}
      className="relative py-24 px-4 overflow-hidden scroll-mt-24 bg-background"
    >
      {/* Fondo con gradiente estático más suave para rendimiento */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.02),transparent_70%)]" />

      {/* Contenido */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Título */}
        <h2
          ref={titleRef}
          className="font-cormorant font-medium text-4xl md:text-6xl mb-16 text-center text-amber-600 dark:text-amber-400"
        >
          Sobre Nosotros
        </h2>

        {/* Párrafos */}
        <div className="space-y-12 md:space-y-16">
          {/* Párrafo 1 */}
          <div
            ref={addToCardsRef}
            className="group md:mr-auto md:max-w-2xl"
          >
            <div className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-sm border border-amber-200/40 dark:border-amber-800/20 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-300/50">
              <p className="font-inter text-lg text-foreground/90 leading-relaxed">
                En Sahara Essence creemos que un aroma tiene el poder de despertar recuerdos, emociones y sensaciones profundas. Nacimos en Manizales, Colombia, como un proyecto que buscaba algo más que vender perfumes: queríamos crear experiencias olfativas que hicieran sentir especial a cada persona.
              </p>
            </div>
          </div>

          {/* Párrafo 2 */}
          <div
            ref={addToCardsRef}
            className="group md:ml-auto md:max-w-2xl"
          >
            <div className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-sm border border-orange-200/40 dark:border-orange-800/20 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-300/50">
              <p className="font-inter text-lg text-foreground/90 leading-relaxed">
                Hoy somos una tienda virtual que llega a cualquier rincón del país, ofreciendo perfumes de alta calidad, empaques especiales y una experiencia de atención cálida, cercana y memorable. Cada vez que un cliente recibe su fragancia, queremos que sienta que no adquirió solo un perfume: adquirió un momento, una sensación, un detalle.
              </p>
            </div>
          </div>

          {/* Párrafo 3 */}
          <div
            ref={addToCardsRef}
            className="group md:mr-auto md:max-w-2xl"
          >
            <div className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-sm border border-amber-200/40 dark:border-amber-800/20 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-300/50">
              <p className="font-inter text-lg text-foreground/90 leading-relaxed">
                Elegimos el nombre Sahara Essence porque el Sahara representa inmensidad, misterio y fuerza. El desierto más grande del mundo es un lugar lleno de contrastes: puede ser cálido e intenso, suave y silencioso, vasto y poderoso. Así como el Sahara guarda historias en cada una de sus arenas, creemos que cada persona guarda una historia en su aroma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
