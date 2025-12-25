'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  icon: string;
  question: string;
  answer: string | string[];
}

interface FAQCategory {
  title: string;
  icon: string;
  sections: {
    title: string;
    content: string[];
  }[];
}

const faqData: FAQItem[] = [
  {
    id: 'originales',
    icon: '🏷️',
    question: '¿Los perfumes son originales?',
    answer: 'No. Nuestros perfumes son réplicas de alta calidad (1.1).'
  },
  {
    id: 'duracion',
    icon: '⏳',
    question: '¿Cuánto dura la fragancia en la piel?',
    answer: 'Dependiendo del pH y del tipo de perfume, la duración puede ser entre 6 y 12 horas.'
  },
  {
    id: 'envios',
    icon: '🚚',
    question: '¿Hacen envíos a toda Colombia?',
    answer: 'Sí, realizamos envíos a cualquier ciudad o municipio del país mediante transportadoras aliadas.'
  },
  {
    id: 'tiempo-envio',
    icon: '📅',
    question: '¿Cuánto tarda un envío?',
    answer: 'Entre 2 y 5 días hábiles, dependiendo de la ubicación.'
  },
  {
    id: 'metodos-pago',
    icon: '💳',
    question: '¿Qué métodos de pago aceptan?',
    answer: [
      'Transferencia bancaria',
      'Nequi / Daviplata',
      'Efectivo (Únicamente válido para Manizales)'
    ]
  },
  {
    id: 'garantia',
    icon: '🛡️',
    question: '¿Tienen garantía?',
    answer: 'Sí. Todos nuestros productos cuentan con garantía por defectos de fábrica.'
  }
];

const categories: FAQCategory[] = [
  {
    title: 'Política de Devoluciones y Cambios',
    icon: '🔄',
    sections: [
      {
        title: '✔ Cambios por aroma o producto:',
        content: [
          'Debes solicitarlo dentro de los 5 días hábiles siguientes a la entrega.',
          'El producto debe estar sin uso, sellado y en perfecto estado.',
          'El cliente asume el costo del envío hacia Sahara Essence; el reenvío corre por nuestra cuenta.'
        ]
      },
      {
        title: '✔ Producto defectuoso o dañado:',
        content: [
          'Si el producto llega en mal estado o con fallas, Sahara Essence cubre todos los costos de envío.',
          'Debes enviar una foto o video del daño dentro de las primeras 48 horas tras recibirlo.'
        ]
      },
      {
        title: '✔ Reembolsos:',
        content: [
          'Se realizan únicamente si el producto no puede ser reemplazado.',
          'El reembolso se procesa en un plazo de 3 a 7 días hábiles.'
        ]
      }
    ]
  },
  {
    title: 'Información de Envíos',
    icon: '🚚',
    sections: [
      {
        title: '📍 Cobertura:',
        content: ['Enviamos a toda Colombia, incluyendo zonas rurales (aplican tiempos adicionales).']
      },
      {
        title: '⏱ Tiempo de entrega:',
        content: [
          'Ciudades principales: 2–3 días hábiles',
          'Otras ciudades y municipios: 3–5 días hábiles'
        ]
      },
      {
        title: '💰 Costo:',
        content: [
          'Envío estándar: depende de la ubicación (se calcula al finalizar la compra).',
          'Envío gratis en pedidos superiores a $400.000'
        ]
      },
      {
        title: '🚚 Transportadoras aliadas:',
        content: ['Servientrega, Envía, Interrapidísimo o según disponibilidad logística.']
      }
    ]
  },
  {
    title: 'Términos de Descuentos y Promociones',
    icon: '💸',
    sections: [
      {
        title: 'Condiciones:',
        content: [
          'Los descuentos aplican solo en las fechas anunciadas oficialmente en nuestra página o redes sociales.',
          'No son acumulables con otras promociones, cupones o beneficios.',
          'Los cupones tienen una vigencia específica y aplican únicamente para compras online.',
          'Los descuentos no aplican sobre costos de envío.',
          'Sahara Essence puede modificar o suspender promociones en cualquier momento, informándolo previamente.'
        ]
      }
    ]
  },
  {
    title: 'Términos y Condiciones de Compra',
    icon: '📜',
    sections: [
      {
        title: '1. Disponibilidad',
        content: ['Todos los productos están sujetos a inventario. Si un producto se agota, te notificaremos para ofrecer una alternativa o realizar reembolso.']
      },
      {
        title: '2. Precios',
        content: ['Los precios pueden cambiar sin previo aviso. El valor final es el que aparece al confirmar la compra.']
      },
      {
        title: '3. Pagos',
        content: ['Los pagos deben realizarse a través de los medios autorizados. No nos hacemos responsables por transacciones realizadas fuera de canales oficiales.']
      },
      {
        title: '4. Información del cliente',
        content: ['El cliente es responsable de proporcionar datos correctos para el envío. Sahara Essence no asume costos por direcciones incorrectas.']
      },
      {
        title: '5. Envíos',
        content: ['Los tiempos de entrega pueden variar por causas externas como clima, retrasos de transportadoras o zonas de difícil acceso.']
      },
      {
        title: '6. Garantía',
        content: ['Cubre únicamente defectos de fabricación. No aplica para daños ocasionados por mal uso, exposición al calor o golpes.']
      },
      {
        title: '7. Propiedad intelectual',
        content: ['Todo el contenido, imágenes, textos y diseño pertenecen a Sahara Essence. No está permitida su reproducción sin autorización.']
      },
      {
        title: '8. Privacidad y datos',
        content: ['Usamos tu información exclusivamente para procesar pedidos y mejorar tu experiencia. No compartimos tus datos con terceros no autorizados.']
      }
    ]
  }
];

interface AccordionItemProps {
  id: string;
  icon: string;
  title: string;
  content: { subtitle?: string; lines: string[] }[];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

// --- Unified Component ---

function AccordionItem({ 
  id, 
  icon, 
  title, 
  content, 
  index, 
  isOpen, 
  onToggle 
}: AccordionItemProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={cn(
        "group border-2 rounded-3xl overflow-hidden transition-all duration-300 scroll-mt-24",
        "bg-card/40 backdrop-blur-sm",
        isOpen
          ? "border-amber-500/40 shadow-xl shadow-amber-500/5 bg-card/60"
          : "border-border/50 hover:border-amber-500/30 hover:shadow-lg"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-8 flex items-center justify-between text-left gap-3 md:gap-4 bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 hover:from-amber-50/50 hover:to-orange-50/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <span className="text-2xl md:text-3xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
          <h3 className="font-cormorant font-medium text-xl md:text-3xl text-amber-600 dark:text-amber-400 leading-tight">
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-amber-600 dark:text-amber-400 flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 md:w-7 md:h-7" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-8 pt-0 border-t border-border/20 mt-1 md:mt-2">
              <div className="pt-4 md:pt-6 space-y-6 md:space-y-8">
                {content.map((section: { subtitle?: string; lines: string[] }, sIdx: number) => (
                  <div key={sIdx} className="space-y-3 md:space-y-4">
                    {section.subtitle && (
                      <motion.h4 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="font-inter font-medium text-base md:text-lg text-foreground/90 border-l-2 border-amber-500/40 pl-3 md:pl-4"
                      >
                        {section.subtitle}
                      </motion.h4>
                    )}
                    <ul className={cn("space-y-2 md:space-y-3", !section.subtitle && "border-l-2 border-amber-500/40 pl-4 md:pl-6")}>
                      {section.lines.map((line: string, lIdx: number) => (
                        <motion.li 
                          key={lIdx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: sIdx * 0.1 + lIdx * 0.05 }}
                          className="text-muted-foreground text-sm md:text-base leading-relaxed flex items-start gap-2.5 md:gap-3"
                        >
                          <span className="text-amber-600/60 mt-1 md:mt-1.5">•</span>
                          <span>{line}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-4xl mx-auto">
        {/* Título Principal */}
        <motion.h2
          id="preguntas-frecuentes"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-cormorant text-3xl md:text-5xl font-medium text-center mb-3 md:mb-4 text-amber-600 dark:text-amber-400 scroll-mt-24"
        >
          Preguntas Frecuentes
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-inter text-sm md:text-base text-center text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto"
        >
          Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios
        </motion.p>

        {/* Todo el contenido de FAQ en un solo contenedor unificado */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <AccordionItem
              key={item.id}
              id={item.id}
              index={index}
              icon={item.icon}
              title={item.question}
              content={[{ lines: Array.isArray(item.answer) ? item.answer : [item.answer] }]}
              isOpen={openItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
          {categories.map((cat, index) => {
            const sectionId = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return (
              <AccordionItem
                key={sectionId}
                id={sectionId}
                index={faqData.length + index}
                icon={cat.icon}
                title={cat.title}
                content={cat.sections.map(s => ({ subtitle: s.title, lines: s.content }))}
                isOpen={openItems.has(sectionId)}
                onToggle={() => toggleItem(sectionId)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}