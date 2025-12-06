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
    icon: '⭐',
    question: '¿Los perfumes son originales?',
    answer: 'No. Nuestros perfumes son réplicas de alta calidad (1.1).'
  },
  {
    id: 'duracion',
    icon: '⭐',
    question: '¿Cuánto dura la fragancia en la piel?',
    answer: 'Dependiendo del pH y del tipo de perfume, la duración puede ser entre 6 y 12 horas.'
  },
  {
    id: 'envios',
    icon: '⭐',
    question: '¿Hacen envíos a toda Colombia?',
    answer: 'Sí, realizamos envíos a cualquier ciudad o municipio del país mediante transportadoras aliadas.'
  },
  {
    id: 'tiempo-envio',
    icon: '⭐',
    question: '¿Cuánto tarda un envío?',
    answer: 'Entre 2 y 5 días hábiles, dependiendo de la ubicación.'
  },
  {
    id: 'metodos-pago',
    icon: '⭐',
    question: '¿Qué métodos de pago aceptan?',
    answer: [
      'Transferencia bancaria',
      'Nequi / Daviplata',
      'Efectivo (Únicamente válido para Manizales)'
    ]
  },
  {
    id: 'garantia',
    icon: '⭐',
    question: '¿Tienen garantía?',
    answer: 'Sí. Todos nuestros productos cuentan con garantía por defectos de fábrica.'
  }
];

const categories: FAQCategory[] = [
  {
    title: '🔄 Política de Devoluciones y Cambios',
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
    title: '🚚 Información de Envíos',
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
    title: '💸 Términos de Descuentos y Promociones',
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
    title: '📜 Términos y Condiciones de Compra',
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

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className={cn(
        "group border-2 rounded-2xl overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "bg-card/50 backdrop-blur-sm",
        isOpen
          ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
          : "border-border hover:border-amber-500/30"
      )}
      style={{ contain: 'layout style paint', willChange: 'transform' }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-6 flex items-center justify-between text-left gap-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl md:text-2xl flex-shrink-0">{item.icon}</span>
          <h3 className="font-inter font-semibold text-base md:text-lg">
            {item.question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-amber-600 dark:text-amber-400 flex-shrink-0"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-border/50">
              {typeof item.answer === 'string' ? (
                <p className="text-muted-foreground text-sm md:text-base">{item.answer}</p>
              ) : (
                <ul className="space-y-2 list-disc list-inside">
                  {item.answer.map((line, i) => (
                    <li key={i} className="text-muted-foreground text-sm md:text-base">{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategorySection({ category, index }: { category: FAQCategory; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate ID from title
  const sectionId = category.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <motion.div
      id={sectionId}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="border-2 border-border rounded-3xl overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 scroll-mt-24"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 md:p-8 flex items-center justify-between text-left gap-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20"
      >
        <h3 className="font-cormorant font-semibold text-2xl md:text-3xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          {category.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-amber-600 dark:text-amber-400 flex-shrink-0"
        >
          <ChevronDown size={28} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 space-y-6">
              {category.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="space-y-3"
                >
                  <h4 className="font-inter font-semibold text-lg text-foreground">
                    {section.title}
                  </h4>
                  <ul className="space-y-2 pl-4">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-muted-foreground text-sm md:text-base flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
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
          className="font-cormorant text-4xl md:text-5xl font-medium text-center mb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient scroll-mt-24"
        >
          Preguntas Frecuentes
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-inter text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios
        </motion.p>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <FAQItem
                item={item}
                isOpen={openItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Categorías Adicionales */}
        <div className="space-y-6">
          {categories.map((category, index) => (
            <CategorySection key={index} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}