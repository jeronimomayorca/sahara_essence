# Plan de Implementación: Sección FAQs

## 📋 Resumen
Crear una sección completa de FAQs (Preguntas Frecuentes) con animaciones de lujo optimizadas para rendimiento máximo.

## 🎯 Objetivos

1. **Estructura Organizada**: 5 secciones principales con contenido completo
2. **Animaciones Premium**: Efectos elegantes pero ligeros
3. **Performance First**: Optimización GPU, lazy loading, y transiciones eficientes
4. **UX Excepcional**: Accordion interactivo con feedback visual

## 📝 Estructura de Contenido

### 1. Preguntas Frecuentes (6 items)
- ¿Los perfumes son originales?
- ¿Cuánto dura la fragancia en la piel?
- ¿Hacen envíos a toda Colombia?
- ¿Cuánto tarda un envío?
- ¿Qué métodos de pago aceptan?
- ¿Tienen garantía?

### 2. Política de Devoluciones y Cambios
- Cambios por aroma o producto
- Producto defectuoso o dañado
- Reembolsos

### 3. Información de Envíos
- Cobertura
- Tiempo de entrega
- Costo
- Transportadoras aliadas

### 4. Términos de Descuentos y Promociones
- Aplicabilidad
- Vigencia
- Restricciones

### 5. Términos y Condiciones de Compra
- 8 puntos principales (Disponibilidad, Precios, Pagos, etc.)

## 🎨 Diseño Visual

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║   PREGUNTAS FRECUENTES                            ║ │
│  ║   (Título con gradiente animado sutil)            ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⭐ ¿Los perfumes son originales?        [▼]    │   │
│  │ ─────────────────────────────────────────────  │   │
│  │ No. Nuestros perfumes son réplicas...          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⭐ ¿Cuánto dura la fragancia...?        [▶]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Más preguntas...]                                    │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║   🔄 POLÍTICA DE DEVOLUCIONES                     ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  [Contenido expandible...]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎭 Sistema de Animaciones (Optimizado)

### Principios de Optimización
1. **Transform & Opacity Only**: Solo propiedades GPU-accelerated
2. **Will-Change**: Aplicar estratégicamente
3. **Contain**: CSS containment para aislar repaints
4. **Passive Listeners**: Event listeners no bloqueantes
5. **RequestAnimationFrame**: Para animaciones JavaScript

### Animaciones Específicas

#### A. Entrada de Sección (Scroll Trigger)
```javascript
// Optimizado con IntersectionObserver en lugar de scroll events
{
  opacity: 0 → 1,
  transform: translateY(30px) → translateY(0),
  duration: 0.6s,
  easing: cubic-bezier(0.4, 0, 0.2, 1)
}
```

#### B. Accordion Expand/Collapse
```javascript
// Usando max-height con transform para suavidad
{
  maxHeight: 0 → auto (calculado),
  opacity: 0 → 1,
  transform: scaleY(0.95) → scaleY(1),
  duration: 0.3s,
  easing: ease-out
}
```

#### C. Icono de Flecha (Rotación)
```javascript
// Transform rotate para GPU acceleration
{
  transform: rotate(0deg) → rotate(180deg),
  duration: 0.3s,
  easing: cubic-bezier(0.4, 0, 0.2, 1)
}
```

#### D. Hover en Items
```javascript
// Sutil elevación con sombra
{
  transform: translateY(0) → translateY(-2px),
  boxShadow: subtle → enhanced,
  duration: 0.2s,
  easing: ease-out
}
```

#### E. Glow Effect en Títulos
```javascript
// Pseudo-elemento con gradiente
{
  background: linear-gradient(90deg, transparent, gold, transparent),
  animation: slide 3s infinite,
  opacity: 0.3
}
```

#### F. Stagger de Items
```javascript
// Aparición escalonada de FAQs
items.forEach((item, index) => {
  delay: index * 0.1s,
  opacity: 0 → 1,
  transform: translateX(-20px) → translateX(0)
})
```

## 🛠️ Implementación Técnica

### Componente: `FAQSection.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string | string[];
  icon?: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer para lazy animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const items = sectionRef.current?.querySelectorAll('.faq-item');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

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
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Título Principal */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-cormorant text-4xl md:text-5xl font-medium text-center mb-16 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
        >
          Preguntas Frecuentes
        </motion.h2>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="faq-item"
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
        <div className="mt-16 space-y-12">
          {categories.map((category, index) => (
            <CategorySection key={index} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente Individual de FAQ
function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div
      className={cn(
        "group border-2 rounded-2xl overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "bg-card/50 backdrop-blur-sm",
        isOpen
          ? "border-amber-500/50 shadow-amber-500/20"
          : "border-border hover:border-amber-500/30"
      )}
      style={{ contain: 'layout style paint' }} // CSS containment
    >
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{item.icon}</span>
          <h3 className="font-inter font-semibold text-lg">
            {item.question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-amber-600"
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
            <div className="px-6 pb-6 pt-2 border-t border-border/50">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {typeof item.answer === 'string' ? (
                  <p className="text-muted-foreground">{item.answer}</p>
                ) : (
                  <ul className="space-y-2">
                    {item.answer.map((line, i) => (
                      <li key={i} className="text-muted-foreground">{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### CSS Optimizado

```css
/* Gradiente animado para título */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  animation: gradient 8s ease infinite;
}

/* Glow sutil en hover */
.faq-item:hover {
  box-shadow: 0 0 20px rgba(217, 119, 6, 0.1);
}

/* Optimización de performance */
.faq-item {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
  backface-visibility: hidden;
}

/* Transiciones suaves */
.faq-item * {
  transition-property: transform, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive */
@media (max-width: 768px) {
  .faq-item {
    /* Simplificar animaciones en mobile */
    transition-duration: 0.2s;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .faq-item * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📊 Datos Estructurados

```typescript
const faqData = [
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

const categories = [
  {
    title: '🔄 Política de Devoluciones y Cambios',
    icon: '🔄',
    sections: [
      {
        title: '✔ Cambios por aroma o producto',
        content: [
          'Debes solicitarlo dentro de los 5 días hábiles siguientes a la entrega.',
          'El producto debe estar sin uso, sellado y en perfecto estado.',
          'El cliente asume el costo del envío hacia Sahara Essence; el reenvío corre por nuestra cuenta.'
        ]
      },
      // ... más secciones
    ]
  },
  // ... más categorías
];
```

## ⚡ Optimizaciones de Performance

### 1. Lazy Loading
```javascript
// Solo animar items visibles
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target); // Stop observing
      }
    });
  },
  { threshold: 0.1 }
);
```

### 2. CSS Containment
```css
.faq-item {
  contain: layout style paint;
}
```

### 3. Transform Optimization
```javascript
// Usar transform en lugar de top/left
transform: translateY(-2px) // ✅ GPU
top: -2px // ❌ CPU
```

### 4. Debounce en Scroll
```javascript
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // Handle scroll
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
```

### 5. Memoización
```javascript
const FAQItem = React.memo(({ item, isOpen, onToggle }) => {
  // Component logic
});
```

## 📱 Diseño Responsive

### Mobile (< 768px)
- Padding reducido (p-4 en lugar de p-6)
- Texto más pequeño
- Animaciones más rápidas (0.2s)
- Sin hover effects

### Tablet (768px - 1024px)
- Padding medio (p-5)
- Animaciones completas
- Hover effects sutiles

### Desktop (> 1024px)
- Padding completo (p-6)
- Todas las animaciones
- Hover effects completos

## 🎨 Temas (Light/Dark)

### Light Mode
- Background: `bg-card/50`
- Border: `border-border`
- Text: `text-foreground`
- Accent: `text-amber-600`

### Dark Mode
- Background: `dark:bg-card/30`
- Border: `dark:border-border`
- Text: `dark:text-foreground`
- Accent: `dark:text-amber-400`

## ✅ Checklist de Implementación

- [ ] Crear componente `FAQSection.tsx`
- [ ] Estructurar datos de FAQs
- [ ] Implementar accordion con AnimatePresence
- [ ] Agregar IntersectionObserver para lazy animations
- [ ] Optimizar con CSS containment
- [ ] Implementar animaciones de entrada staggered
- [ ] Agregar hover effects sutiles
- [ ] Crear secciones de categorías
- [ ] Estilizar con gradientes y sombras
- [ ] Optimizar para mobile
- [ ] Probar en dark mode
- [ ] Verificar performance (60fps)
- [ ] Probar accesibilidad (keyboard navigation)
- [ ] Agregar aria-labels apropiados

## 🚀 Métricas de Performance Esperadas

- **First Paint**: < 100ms
- **Animation FPS**: 60fps constante
- **Repaints**: Mínimos (solo en accordion)
- **Memory**: < 5MB adicional
- **Lighthouse Score**: 95+

## 📐 Estructura de Archivos

```
components/
  ├── FAQSection.tsx (Componente principal)
  └── ui/
      └── accordion.tsx (Si usamos shadcn/ui)

app/
  └── page.tsx (Integrar FAQSection)

types/
  └── faq.ts (Tipos TypeScript)
```

---

**Nota**: Este diseño prioriza performance sin sacrificar la elegancia visual. Todas las animaciones están optimizadas para GPU acceleration y respetan las preferencias de accesibilidad del usuario.